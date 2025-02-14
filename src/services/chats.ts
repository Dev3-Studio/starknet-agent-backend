import { Chat, ChatCreate, Message, zAgentPublic, zChat, zMessage } from '../lib/dto';
import { ChatCollection, IChatCollection, IPendingRoyalties, IUserCollection } from '../database/schema';
import { NotFoundError } from '../lib/httpErrors';
import { getAgent } from './agents';
import { getUserById } from './users';
import { AIMessage, HumanMessage, StoredMessage, ToolMessage } from '@langchain/core/messages';
import { Agent, AgentTool, ArgumentsSchema } from '../lib/agent';
import { z } from 'zod';
import { ChatGroq } from '@langchain/groq';
import { env } from '../lib/env';
import { client } from '../database';
import { ObjectId } from 'mongodb';
import { getChatTitle } from '../lib/getChatTitle';

export async function getChat(chatId: string): Promise<Chat & { messages: Message[] }> {
    const res = await ChatCollection.findOne({ _id: new ObjectId(chatId) });
    if (!res) throw new NotFoundError('Chat not found');
    
    const user = await getUserById(res.user);
    const agent = await getAgent(res.agent, false);
    
    return zChat.merge(z.object({ messages: zMessage.array() })).parse({
        ...res,
        id: res._id.toString(),
        user,
        agent,
    });
}

interface GetChatsOptions {
    order?: 'asc' | 'desc';
    agentId?: string;
    includeMessages?: boolean;
}

export async function getChats(userId: string, options: GetChatsOptions): Promise<Chat[]> {
    const { order } = options;
    const sortQuery: Record<string, 1 | -1> = {};
    sortQuery['_id'] = order === 'asc' ? 1 : -1;
    const chats = await ChatCollection.find({ user: userId }).sort(sortQuery).toArray();
    const user = await getUserById(userId);
    const agentCache: z.infer<typeof zAgentPublic>[] = [];
    const fetchAgent = async (agentId: string) => {
        const cachedAgent = agentCache.find(a => a.id === agentId);
        if (cachedAgent) return cachedAgent;
        const agent = await getAgent(agentId, false);
        agentCache.push(agent);
        return agent;
    };
    
    return await Promise.all(chats.map(async chat => {
        const agent = await fetchAgent(chat.agent);
        return zChat.parse({
            ...chat,
            id: chat._id.toString(),
            user,
            agent,
            messages: options.includeMessages ? chat.messages : undefined,
        });
    }));
}

export async function createChat(chat: ChatCreate & { user: string }): Promise<Chat> {
    const res = await ChatCollection.insertOne({ ...chat, messages: [] });
    return await getChat(res.insertedId.toString());
}

function convertMessageDictToMessage(messageDict: StoredMessage): Message {
    const type = messageDict.type;
    const {
        id,
        content,
        name,
        additional_kwargs: additionalKwargs,
        tool_call_id: toolCallId,
        role,
        response_metadata: responseMetadata,
    } = messageDict.data;
    
    return {
        type,
        data: {
            id,
            content,
            name,
            additionalKwargs,
            toolCallId,
            role,
            responseMetadata,
        },
    };
}

function convertMessageToLangchainMessage(message: Message): HumanMessage | AIMessage | ToolMessage {
    const { type, data } = message;
    if (type === 'human') {
        return new HumanMessage(data);
    } else if (type === 'ai') {
        return new AIMessage(data);
    } else if (type === 'tool') {
        return new ToolMessage({ ...data, tool_call_id: data.toolCallId ?? '0' });
    } else {
        throw new Error('Unknown message type');
    }
}

export async function addUserMessage(chatId: string, message: string): Promise<Chat> {
    const chat = await getChat(chatId);
    const userMessage = new HumanMessage(message);
    chat.messages.push(convertMessageDictToMessage(userMessage.toDict()));
    
    if (chat.title === undefined && chat.messages.length > 1) {
        const title = await getChatTitle(chat.messages[0].data.content)
        await ChatCollection.updateOne({ id: chatId }, { $set: { title } });
    }
    
    const agentDto = await getAgent(chat.agent.id, true);
    
    const agent = new Agent({
        name: agentDto.name,
        biography: agentDto.biography,
        directive: agentDto.directive,
        rules: agentDto.rules,
        model: new ChatGroq({
            apiKey: env('GROQ_API_KEY'),
            temperature: 0,
        }),
        tools: agentDto.tools.map(t => {
            return new AgentTool({
                ...t,
                argumentsSchema: t.argumentsSchema as unknown as ArgumentsSchema,
            });
        }),
    });
    
    const response = await agent.invoke(chat.messages.map(convertMessageToLangchainMessage));
    const creditsUsed = response.usage_metadata?.total_tokens ?? 0;
    chat.messages.push(convertMessageDictToMessage(response.toDict()));
    
    // Start transaction
    const updatedChatId = await client.withSession(async (session) =>
        session.withTransaction(async (session) => {
            const txUserCollection = client.db(env('DB_NAME')).collection<IUserCollection>('users');
            const txChatCollection = client.db(env('DB_NAME')).collection<IChatCollection>('chats');
            const txPendingRoyaltiesCollection = client.db(env('DB_NAME')).collection<IPendingRoyalties>('royalties');
            
            // Deduct credits from user
            await txUserCollection.updateOne(
                { _id: new ObjectId(chat.user.id) },
                { $inc: { credits: -creditsUsed } },
                { session }
            );
            
            // Add pending charge entry
            await txPendingRoyaltiesCollection.insertOne(
                {
                    user: chat.user.id,
                    creator: agentDto.creator.id,
                    amount: creditsUsed
                },
                { session }
            );
            
            // Update chat
            const chatUpdate = await txChatCollection.updateOne(
                { _id: new ObjectId(chat.id) },
                { $set: { messages: chat.messages } },
                { session }
            );
            
            return chatUpdate.upsertedId?.toString();
        }),
    );
    
    if (!updatedChatId) throw new NotFoundError('Chat not found');
    
    return await getChat(updatedChatId);
}

export async function deleteChat(chatId: string) {
    await ChatCollection.deleteOne({ _id: new ObjectId(chatId) });
}
