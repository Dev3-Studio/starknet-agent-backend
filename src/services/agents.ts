import { Agent, AgentCreate } from '../lib/dto';
import { AgentCollection, IAgentCollection, IUserCollection, UserCollection } from '../database/schema';
import { decryptAes256gcm, encryptAes256gcm } from '../lib/aes256gcm';
import { env } from '../lib/env';
import { ForbiddenError, InternalServerError, NotFoundError } from '../lib/httpErrors';
import Ajv from 'ajv';
import { WithId } from 'mongodb';

export async function getAgent(agentId: string, callerWalletAddress?: string): Promise<Agent> {
    const agentResult = await AgentCollection.findOne({ id: agentId });
    if (!agentResult) throw new NotFoundError('Agent not found');
    
    const creatorResult = await UserCollection.findOne({ id: agentResult.creator });
    if (!creatorResult) throw new NotFoundError('Creator not found');
    
    // If caller is not the creator, hide private fields
    const includePrivateFields = (callerWalletAddress ?? '').toLowerCase() === creatorResult.walletAddress.toLowerCase();
    
    const formattedAgent = formatAgentForResponse(agentResult, creatorResult);
    
    return {
        ...formattedAgent,
        directive: includePrivateFields ? formattedAgent.directive : undefined,
        rules: includePrivateFields ? formattedAgent.rules : undefined,
        tools: includePrivateFields ? formattedAgent.tools : undefined,
    };
}

interface GetAgentsProps {
    tags?: string[];
    limit?: number;
    creator?: string;
    sort?: 'chats' | 'messages' | 'date';
    order?: string;
}

export async function getAgents(props: GetAgentsProps): Promise<Agent[]> {
    const { tags, limit, creator, sort, order } = props;
    const query: Record<string, unknown> = {};
    if (tags) query.tags = { $all: tags };
    if (creator) query.creator = creator;
    const sortQuery: Record<string, 1 | -1> = {};
    if (sort == 'date') sortQuery['_id'] = order === 'asc' ? 1 : -1;
    else if (sort) sortQuery[sort] = order === 'asc' ? 1 : -1;
    const agents = await AgentCollection.find(query).sort(sortQuery).limit(limit ?? 100).toArray();
    const creators = await UserCollection.find({ id: { $in: agents.map(a => a.creator) } }).toArray();
    return agents.map(agent => {
        const creator = creators.find(c => c._id.toString() === agent.creator);
        if (!creator) throw new InternalServerError('Creator not found');
        return formatAgentForResponse(agent, creator);
    });
}

export async function createAgent(agent: AgentCreate): Promise<Agent> {
    const res = await AgentCollection.insertOne({ ...formatAgentForInsert(agent), totalChats: 0, totalMessages: 0 });
    return await getAgent(res.insertedId.toString());
}

export async function updateAgent(agentId: string, agent: AgentCreate, callerWalletAddress?: string): Promise<Agent> {
    const existingAgent = await getAgent(agentId);
    if (existingAgent.creator.walletAddress.toLowerCase() !== callerWalletAddress?.toLowerCase()) {
        throw new ForbiddenError('You are not the creator of this agent');
    }
    
    await AgentCollection.updateOne({ id: agentId }, { $set: formatAgentForInsert(agent) });
    return await getAgent(agentId);
}

function validateArgumentsSchema(schema: object) {
    const ajv = new Ajv();
    return ajv.validateSchema(schema);
}

function formatAgentForResponse(agent: WithId<IAgentCollection>, creator: WithId<IUserCollection>): Agent {
    return {
        ...agent,
        id: agent._id.toString(),
        creator: {
            ...creator,
            id: creator._id.toString(),
        },
        tools: agent.tools.map(t => {
            const argumentsSchema = JSON.parse(t.argumentsSchema);
            if (!validateArgumentsSchema(argumentsSchema)) {
                throw new InternalServerError('Invalid arguments schema');
            }
            const environment = JSON.parse(decryptAes256gcm(t.environment, env('AES_KEY')));
            const bodyTemplate = JSON.parse(t.bodyTemplate);
            const headersTemplate = JSON.parse(t.headersTemplate);
            const queryTemplate = JSON.parse(t.queryTemplate);
            return {
                ...t,
                argumentsSchema,
                environment,
                bodyTemplate,
                headersTemplate,
                queryTemplate,
            };
        }),
    };
}

function formatAgentForInsert(agent: AgentCreate) {
    return {
        ...agent,
        tools: agent.tools.map(t => {
            if (!t.argumentsSchema || typeof t.argumentsSchema !== 'object') {
                throw new InternalServerError('Invalid arguments schema');
            }
            if (!validateArgumentsSchema(t.argumentsSchema)) {
                throw new InternalServerError('Invalid arguments schema');
            }
            return {
                ...t,
                argumentsSchema: JSON.stringify(t.argumentsSchema),
                environment: encryptAes256gcm(JSON.stringify(t.environment), env('AES_KEY')),
                bodyTemplate: JSON.stringify(t.bodyTemplate),
                headersTemplate: JSON.stringify(t.headersTemplate),
                queryTemplate: JSON.stringify(t.queryTemplate),
            };
        }),
    };
}

