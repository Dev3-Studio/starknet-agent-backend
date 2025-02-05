import { Request, Response } from 'express';
import * as services from '../services/agent';
import { zAgent } from '../lib/dto';

// todo add functions
export async function createAgent(req: Request, res: Response) {
    const agent = zAgent.parse(req.body);
    res.send(services.createAgent(agent));
}