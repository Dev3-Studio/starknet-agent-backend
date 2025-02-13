import { db } from './index';
import { Message } from '../lib/dto';

export interface IUserCollection {
    walletAddress: string;
    name?: string;
    profileImage?: string;
    credits: number;
}
export const UserCollection = db.collection<IUserCollection>('users');

export interface IAgentCollection {
    name: string;
    creator: string;
    description: string;
    tagline: string;
    pricePerTokenUsd: number;
    royaltyPerTokenUsd: number;
    tags: string[];
    image: string;
    biography: string;
    directive: string;
    rules: string[];
    tools: Array<{
        name: string;
        description: string;
        argumentsSchema: string;
        environment: string;
        method: 'GET' | 'POST';
        urlTemplate: string;
        headersTemplate: string;
        queryTemplate: string;
        bodyTemplate: string;
    }>
    totalChats: number;
    totalMessages: number;
}
export const AgentCollection = db.collection<IAgentCollection>('agents');

export interface IChatCollection {
    user: string;
    agent: string;
    title?: string;
    messages: Message[];
}
export const ChatCollection = db.collection<IChatCollection>('chats');

export interface IPendingRoyalties {
    user: string;
    creator: string;
    amount: number;
}
export const PendingRoyaltiesCollection = db.collection<IPendingRoyalties>('royalties');