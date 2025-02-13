import { Agent, AgentCreate, AgentPublic, User, zAgentPublic } from '../lib/dto';
import { AgentCollection, IAgentCollection, IUserCollection, UserCollection } from '../database/schema';
import { decryptAes256gcm, encryptAes256gcm } from '../lib/aes256gcm';
import { env } from '../lib/env';
import { InternalServerError, NotFoundError } from '../lib/httpErrors';
import Ajv from 'ajv';
import { WithId } from 'mongodb';
import { getUser } from './users';

export async function getAgent(agentId: string, includePrivateFields: false): Promise<AgentPublic>;
export async function getAgent(agentId: string, includePrivateFields: true): Promise<Agent>;
export async function getAgent(agentId: string, includePrivateFields?: boolean): Promise<AgentPublic | Agent>
export async function getAgent(agentId: string, includePrivateFields?: boolean): Promise<AgentPublic | Agent> {
    const agentResult = await AgentCollection.findOne({ id: agentId });
    if (!agentResult) throw new NotFoundError('Agent not found');
    
    const creatorResult = await UserCollection.findOne({ id: agentResult.creator });
    if (!creatorResult) throw new NotFoundError('Creator not found');
    
    // If caller is not the creator, hide private fields
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

export async function getAgents(props: GetAgentsProps): Promise<AgentPublic[]> {
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
        return zAgentPublic.parse(formatAgentForResponse(agent, creator));
    });
}

export async function getAgentCreator(agentId: string): Promise<User> {
    const agentResult = await AgentCollection.findOne({ id: agentId });
    if (!agentResult) throw new NotFoundError('Agent not found');
    
    return await getUser(agentResult.creator);
}

export async function createAgent(agent: AgentCreate & { creator: string }): Promise<Agent> {
    const res = await AgentCollection.insertOne({
        ...formatAgentForInsert(agent),
        pricePerTokenUsd: 0, // todo add base pricing logic
        totalChats: 0,
        totalMessages: 0
    });
    return await getAgent(res.insertedId.toString(), true);
}

export async function updateAgent(agentId: string, agent: AgentCreate  & { creator: string }): Promise<Agent> {
    await AgentCollection.updateOne({ id: agentId }, { $set: formatAgentForInsert(agent) });
    return await getAgent(agentId, true);
}

function validateArgumentsSchema(schema: object) {
    const ajv = new Ajv();
    return ajv.validateSchema(schema);
}

export function formatAgentForResponse(agent: WithId<IAgentCollection>, creator: WithId<IUserCollection>): Agent {
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

function formatAgentForInsert(agent: AgentCreate & { creator: string }) {
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

