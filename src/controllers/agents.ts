import { Request, Response } from 'express';
import * as services from '../services/agents';
import { zAgentCreate } from '../lib/dto';
import { ForbiddenError } from '../lib/httpErrors';

export async function getAgent(req: Request, res: Response) {
    const { id } = req.params;
    const user = req.user;
    const agentCreator = await services.getAgentCreator(id);
    res.send(await services.getAgent(id, user?.id === agentCreator.id));
}

export async function getAgents(req: Request, res: Response) {
    const { tags, limit, creator, sort, order } = req.query;
    res.send(await services.getAgents({
        tags: tags as string[],
        limit: Number(limit),
        creator: creator as string,
        sort: sort as 'chats' | 'messages' | 'date' | undefined,
        order: order as string,
    }));
}

export async function createAgent(req: Request, res: Response) {
    const agent = zAgentCreate.parse(req.body);
    const user = req.user;
    if (!user?.id) throw new ForbiddenError('User not found');
    res.send(await services.createAgent({ ...agent, creator: user.id }));
}

export async function updateAgent(req: Request, res: Response) {
    const { id } = req.params;
    const user = req.user;
    const agent = zAgentCreate.parse(req.body);
    const agentCreator = await services.getAgentCreator(id);
    if (user?.id !== agentCreator.id) throw new ForbiddenError('User not allowed to update this agent');
    res.send(await services.updateAgent(id, { ...agent, creator: user.id }));
}