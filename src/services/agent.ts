import { Agent, AgentCreate, zAgentTool } from '../lib/dto';
import { AgentCollection, UserCollection } from '../database/schema';
import { decryptAes256gcm, encryptAes256gcm } from '../lib/aes256gcm';
import { env } from '../lib/env';
import { ForbiddenError, InternalServerError, NotFoundError } from '../lib/httpErrors';
import Ajv from 'ajv';

export async function getAgent(agentId: string, callerWalletAddress?: string): Promise<Agent> {
    const agentResult = await AgentCollection.findOne({ id: agentId });
    if (!agentResult) throw new NotFoundError('Agent not found');
    
    const creatorResult = await UserCollection.findOne({ id: agentResult.creator });
    if (!creatorResult) throw new NotFoundError('Creator not found');
    
    // If caller is not the creator, hide private fields
    const includePrivateFields = (callerWalletAddress ?? '').toLowerCase() === creatorResult.walletAddress.toLowerCase();
    
    return {
        ...agentResult,
        id: agentResult._id.toString(),
        creator: {
            ...creatorResult,
            id: creatorResult._id.toString(),
        },
        directive: includePrivateFields ? agentResult.directive : undefined,
        rules: includePrivateFields ? agentResult.rules : undefined,
        tools: includePrivateFields ? agentResult.tools.map(t => {
            const ajv = new Ajv();
            const argumentsSchema = JSON.parse(t.argumentsSchema);
            const isValidJsonSchema = ajv.validateSchema(argumentsSchema);
            if (!isValidJsonSchema) throw new InternalServerError('Invalid JSON schema');
            
            const environment = JSON.parse(decryptAes256gcm(t.environment, env('AES_KEY')));
            const bodyTemplate = JSON.parse(t.bodyTemplate);
            const headersTemplate = JSON.parse(t.headersTemplate);
            const queryTemplate = JSON.parse(t.queryTemplate);
            
            return zAgentTool.parse({
                ...t,
                argumentsSchema,
                environment,
                bodyTemplate,
                headersTemplate,
                queryTemplate,
            });
        }) : undefined,
    };
}

function formatAgentForInsert(agent: AgentCreate) {
    return {
        ...agent,
        tools: agent.tools.map(t => {
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

