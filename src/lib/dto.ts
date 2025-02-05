import { z } from 'zod';

/* Export Data Transfer Objects (DTOs) and corresponding types for the all entities in the application
 Naming convention: DTOs are named as z<EntityName><Action>, types are named as <EntityName><Action>
 Examples for User entity: DTO = zUser, type = User; DTO = zUserCreate, types = UserCreate */
export const zEthereumAddress = z.string().refine((value) => {
    return /^0x[a-fA-F0-9]{40}$/.test(value);
});
export type EthereumAddress = z.infer<typeof zEthereumAddress>;


export const zUser = z.object({
    // primary key
    walletAddress: zEthereumAddress,
    name: z.string(),
    profileImage: z.string().url(),
});
export type User = z.infer<typeof zUser>;

export const zAgentMetadata = z.object({
    name: z.string(),
    description: z.string(),
    image: z.string().url(),
    creator: zUser,
});
export type AgentMetadata = z.infer<typeof zAgentMetadata>;

export const zAgentTool = z.object({
    name: z.string(),
    description: z.string(),
    argumentsSchema: z.unknown(),
    environment: z.record(z.string(), z.string()),
    method: z.enum(['GET', 'POST']),
    urlTemplate: z.string(),
    headersTemplate: z.record(z.string(), z.string()),
    argumentsValidator: z.function(),
});
export type AgentTool = z.infer<typeof zAgentTool>;

export const zModel = z.enum(['ChatGroq']);
export type Model = z.infer<typeof zModel>;

export const zAgent = z.object({
    id: z.string().uuid(),
    metadata: zAgentMetadata,
    model: zModel,
    name: z.string(),
    biography: z.string(),
    directive: z.string(),
    rules: z.string().array(),
    tools: zAgentTool.array(),
});
export type Agent = z.infer<typeof zAgent>;

export const zMessage = z.object({
    sender: zUser,
    content: z.string(),
    timestamp: z.date(),
});
export type Message = z.infer<typeof zMessage>;

export const zChat = z.object({
    // primary key
    id: z.string().uuid(),
    user: z.array(zUser),
    messages: z.array(zMessage),
    agent: zAgent,
});
export type Chat = z.infer<typeof zChat>;

export const zChatCreate = zChat.omit({ messages: true, id: true });
export type ChatCreate = z.infer<typeof zChatCreate>;