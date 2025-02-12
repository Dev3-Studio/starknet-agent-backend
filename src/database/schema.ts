import { db } from './index';
import { Message } from '../lib/dto';

interface User {
    walletAddress: string;
    name?: string;
    profileImage?: string;
    credits: number;
}
export const UserCollection = db.collection<User>('users');

interface Agent {
    name: string;
    creator: string;
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
export const AgentCollection = db.collection<Agent>('agents');

interface Chat {
    user: string;
    agent: string;
    title?: string;
    messages: Message[];
}
export const ChatCollection = db.collection<Chat>('chats');

interface PendingBlockchainCharges {
    user: string;
    agent: string;
    amount: number;
}
export const PendingBlockchainChargesCollection = db.collection<PendingBlockchainCharges>('pending_blockchain_charges');