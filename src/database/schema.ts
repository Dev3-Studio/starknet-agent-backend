import { db } from './index';
import { Message } from '../lib/dto';

interface User {
    wallet_address: string;
    name?: string;
    profile_image?: string;
    credits: number;
}
export const UserCollection = db.collection<User>('users');

interface Agent {
    name: string;
    description: string;
    creator: string;
    tags: string[];
    image: string;
    biography: string;
    directive: string;
    rules: string[];
    tools: Array<{
        name: string;
        description: string;
        arguments_schema: string;
        environment: string;
        method: 'GET' | 'POST';
        url_template: string;
        headers_template: string;
        query_template: string;
        body_template: string;
    }>
}
export const AgentCollection = db.collection<Agent>('agents');

interface Chat {
    user: string;
    agent: string;
    title?: string;
    messages: Message[];
}
export const ChatCollection = db.collection<Chat>('chats');