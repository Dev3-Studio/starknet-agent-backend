import { z } from 'zod';

/* Export Data Transfer Objects (DTOs) and corresponding types for the all entities in the application
 Naming convention: DTOs are named as z<EntityName><Action>, types are named as <EntityName><Action>
 Examples for User entity: DTO = zUser, type = User; DTO = zUserCreate, types = UserCreate */
export const zStarknetAddress = z
    .string()
    .refine((value) => {
        return /^0x(0)?[a-fA-F0-9]{64}$/.test(value);
    })
    .transform((value) => {
        value = value.toLowerCase();
        if (!value.startsWith('0x0')) return value.replace('0x', '0x0');
        return value;
    });
export type StarknetAddress = z.infer<typeof zStarknetAddress>;

export const zUser = z.object({
    id: z.string(),
    walletAddress: zStarknetAddress,
    name: z.string().optional(),
    profileImage: z.string().url().optional(),
    credits: z.number().int().min(0),
});
export type User = z.infer<typeof zUser>;

export const zUserCreate = zUser.omit({ id: true, credits: true });
export type UserCreate = z.infer<typeof zUserCreate>;

const zLiteral = z.union([z.string(), z.number(), z.boolean(), z.null()]);
export type Literal = z.infer<typeof zLiteral>;
export type Json = Literal | { [key: string]: Json } | Json[];
const zJson: z.ZodType<Json> = z.lazy(() =>
    z.union([zLiteral, z.array(zJson), z.record(zJson)]),
);

export interface JsonTemplate {
    [key: string]: string | string[] | JsonTemplate;
}

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
    id: z.string(),
    name: z.string(),
    description: z.string(),
    tagline: z.string().max(32),
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

export const zAgentPublic = zAgent.omit({
    biography: true,
    directive: true,
    rules: true,
    tools: true,
});
export type AgentPublic = z.infer<typeof zAgentPublic>;

export const zAgentCreate = zAgent
    .omit({
        id: true,
        pricePerTokenUsd: true,
        totalChats: true,
        totalMessages: true,
        creator: true,
    })
    .merge(z.object({
        biography: z.string(),
        directive: z.string(),
        rules: z.string().array(),
        tools: zAgentTool.array(),
    }));
export type AgentCreate = z.infer<typeof zAgentCreate>;

export const zMessage = z.object({
    type: z.string(),
    data: z.object({
        id: z.string().optional(),
        content: z.string(),
        role: z.string().optional(),
        name: z.string().optional(),
        toolCallId: z.string().optional(),
        additionalKwargs: z.record(z.string(), z.any()).optional(),
        responseMetadata: z.record(z.string(), z.any()).optional(),
    }),
});
export type Message = z.infer<typeof zMessage>;

export const zChat = z.object({
    id: z.string(),
    user: zUser,
    agent: zAgentPublic,
    title: z.string().optional(),
    messages: z.array(zMessage).optional(),
});
export type Chat = z.infer<typeof zChat>;

export const zChatCreate = zChat
    .pick({
        title: true,
    })
    .merge(z.object({
        agent: z.string(),
    }));
export type ChatCreate = z.infer<typeof zChatCreate>;