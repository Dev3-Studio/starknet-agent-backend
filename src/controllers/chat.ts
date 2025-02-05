import { Request, Response } from 'express';
import * as services from '../services/chat';
import { zChatCreate, zMessage } from '../lib/dto';

export async function createChat(req: Request, res: Response) {
    const chat = zChatCreate.parse(req.body);
    res.send(services.createChat(chat));
}

export async function getChat(req: Request, res: Response) {
    const chatId = req.params.chatId;
    res.send(services.getChat(chatId));
}

export async function addUserMessage(req: Request, res: Response) {
    const chatId = req.params.chatId;
    const message = zMessage.parse(req.body);
    res.send(services.addUserMessage(chatId, message));
}

export async function deleteChat(req: Request, res: Response) {
    const chatId = req.params.chatId;
    res.send(services.deleteChat(chatId));
}