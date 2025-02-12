import { Chat, ChatCreate, Message } from '../lib/dto';
import { ChatCollection } from '../database/schema';

export async function createChat(chat: ChatCreate): Promise<Chat> {
    await ChatCollection.insertOne(chat);
}

export async function getChat(chatId: string): Promise<Chat> {
    return await ChatCollection.findOne({ id: chatId });
}

export async function addUserMessage(chatId: string, message: Message) {
    await ChatCollection.updateOne(
        { id: chatId },
        { $push: { messages: message } },
    );
}

export async function deleteChat(chatId: string) {
    await ChatCollection.deleteOne({ id: chatId });
}



