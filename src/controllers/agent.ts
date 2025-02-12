import { Request, Response } from 'express';
import * as services from '../services/agent';
import { zAgentCreate } from '../lib/dto';

export async function getAgent(req: Request, res: Response) {
    const { id } = req.params;
    const user = req.user;
    res.send(await services.getAgent(id, user?.address));
}

export async function createAgent(req: Request, res: Response) {
    const agent = zAgentCreate.parse(req.body);
    res.send(await services.createAgent(agent));
}

export async function updateAgent(req: Request, res: Response) {
    const { id } = req.params;
    const agent = zAgentCreate.parse(req.body);
    const user = req.user;
    res.send(await services.updateAgent(id, agent, user?.address));
}