import { z } from 'zod';
import { JsonTemplate } from './agent';

/* Export Data Transfer Objects (DTOs) and corresponding types for the all entities in the application
 Naming convention: DTOs are named as z<EntityName><Action>, types are named as <EntityName><Action>
 Examples for User entity: DTO = zUser, type = User; DTO = zUserCreate, types = UserCreate */
export const zEthereumAddress = z.string().refine((value) => {
    return /^0x[a-fA-F0-9]{40}$/.test(value);
});
export type EthereumAddress = z.infer<typeof zEthereumAddress>;

export const zUser = z.object({
    id: z.string().uuid(),
    walletAddress: zEthereumAddress,
    name: z.string().optional(),
    profileImage: z.string().url().optional(),
    credits: z.number().int().min(0),
});
export type User = z.infer<typeof zUser>;

export const zUserCreate = zUser.omit({ id: true, credits: true });
export type UserCreate = z.infer<typeof zUserCreate>;

const zLiteral = z.union([z.string(), z.number(), z.boolean(), z.null()]);
type Literal = z.infer<typeof zLiteral>;
type Json = Literal | { [key: string]: Json } | Json[];
const zJson: z.ZodType<Json> = z.lazy(() =>
    z.union([zLiteral, z.array(zJson), z.record(zJson)]),
);
const zJsonTemplate: z.ZodType<JsonTemplate> = z.record(
    z.string(),
    z.string().or(z.string().array()).or(z.lazy(() => zJsonTemplate)),
);

export const zAgentTool = z.object({
    name: z.string(),
    description: z.string(),
    argumentsSchema: zJson,
    environment: z.record(z.string(), z.string()),
    method: z.enum(['GET', 'POST']),
    urlTemplate: z.string(),
    headersTemplate: z.record(z.string(), z.string()),
    queryTemplate: zJsonTemplate,
    bodyTemplate: zJsonTemplate,
});
export type AgentTool = z.infer<typeof zAgentTool>;

export const zAgent = z.object({
    id: z.string().uuid(),
    name: z.string(),
    description: z.string(),
    creator: zUser,
    pricePerTokenUsd: z.number().int().min(0),
    royaltyPerTokenUsd: z.number().int().min(0),
    tags: z.string().array(),
    image: z.string().url(),
    biography: z.string(),
    directive: z.string(),
    rules: z.string().array(),
    tools: zAgentTool.array(),
    totalChats: z.number().int().min(0),
    totalMessages: z.number().int().min(0),
});
export type Agent = z.infer<typeof zAgent>;

export const zAgentCreate = zAgent.omit({ id: true, creator: true, }).merge(z.object({ creator: z.string().uuid() }));
export type AgentCreate = z.infer<typeof zAgentCreate>;

export const zMessage = z.object({
    type: z.string(),
    data: z.object({
        id: z.string().optional(),
        content: z.string(),
        role: z.string().optional(),
        name: z.string().optional(),
        tool_call_id: z.string().optional(),
        additional_kwargs: z.record(z.string(), z.any()).optional(),
        response_metadata: z.record(z.string(), z.any()).optional(),
    }),
});
export type Message = z.infer<typeof zMessage>;

export const zChat = z.object({
    id: z.string().uuid(),
    user: zUser,
    agent: zAgent,
    title: z.string().optional(),
    messages: z.array(zMessage),
});
export type Chat = z.infer<typeof zChat>;

export const zChatCreate = zChat
    .pick({
        title: true,
        messages: true,
    })
    .merge(z.object({
        user: z.string().uuid(),
        agent: z.string().uuid(),
    }));
export type ChatCreate = z.infer<typeof zChatCreate>;