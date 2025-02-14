import { Request, Response } from 'express';
import * as services from '../services/chats';
import { ChatCreate } from '../lib/dto';
import { ForbiddenError } from '../lib/httpErrors';

export async function createChat(req: Request, res: Response) {
    const chat = req.body as ChatCreate;
    const user = req.user;
    if (!user?.id) throw new ForbiddenError('User not found');
    res.send(await services.createChat({ ...chat, user: user.id }));
}

export async function getChat(req: Request, res: Response) {
    const { id } = req.params;
    res.send(await services.getChat(id));
}

export async function getChats(req: Request, res: Response) {
    const { agentId, order, includeMessages } = req.query;
    const user = req.user;
    if (!user?.id) throw new ForbiddenError('User not found');
    res.send(await services.getChats(user?.id, {
        order: order as 'asc' | 'desc',
        agentId: agentId as string,
        includeMessages: includeMessages === 'true',
    }));
}

export async function addUserMessage(req: Request, res: Response) {
    const { id } = req.params;
    const { message } = req.body as { message: string };
    res.send(await services.addUserMessage(id, message));
}

export async function deleteChat(req: Request, res: Response) {
    const { id } = req.params;
    await services.deleteChat(id);
    res.status(204).send();
}