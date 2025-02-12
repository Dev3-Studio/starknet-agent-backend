import { Request, Response } from 'express';
import * as services from '../services/chats';
import { zChatCreate, zMessage } from '../lib/dto';

export async function createChat(req: Request, res: Response) {
    const chat = zChatCreate.parse(req.body);
    res.send(await services.createChat(chat));
}

export async function getChat(req: Request, res: Response) {
    const { id } = req.params;
    res.send(await services.getChat(id));
}

export async function addUserMessage(req: Request, res: Response) {
    const id = req.params.id;
    const message = zMessage.parse(req.body);
    res.send(await services.addUserMessage(id, message));
}

export async function deleteChat(req: Request, res: Response) {
    const chatId = req.params.chatId;
    res.send(await services.deleteChat(chatId));
}