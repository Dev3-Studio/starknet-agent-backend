import { Chat, ChatCreate, Message } from '../lib/dto';
import { db } from '../database';
const chatCollection: Collection<Chat> = db.collection('chats');
import { v4 as uuidv4 } from 'uuid';
import { Collection } from 'mongodb';
export async function createChat(chat: ChatCreate) {
    const existingChat = await chatCollection.findOne({ user: chat.user, agent: chat.agent });
    // if chat exists, return chat
    if (existingChat) return existingChat;
    
    const newChat = {
        ...chat,
        messages: [],
        id: uuidv4(),
    }
    await chatCollection.insertOne(newChat);
}

export async function getChat(chatId: string) {
    return await chatCollection.findOne({ id: chatId });
}

export async function addUserMessage(chatId: string, message: Message) {
    await chatCollection.updateOne(
        { id: chatId },
        { $push: { messages: message } },
    );
}

export async function deleteChat(chatId: string) {
    await chatCollection.deleteMany({ id: chatId });
}



