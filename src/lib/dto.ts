import { z } from 'zod';

/* Export Data Transfer Objects (DTOs) and corresponding types for the all entities in the application
 Naming convention: DTOs are named as z<EntityName><Action>, types are named as <EntityName><Action>
 Examples for User entity: DTO = zUser, type = User; DTO = zUserCreate, types = UserCreate */

export type User = z.infer<typeof zUser>;

export const zUserCreate = z.object({
    name: z.string(),
});

export type UserCreate = z.infer<typeof zUserCreate>;

export const zEthereumAddress = z.string().refine((value) => {
    return /^0x[a-fA-F0-9]{40}$/.test(value);
});

export const zUser = z.object({
    name: z.string(),
    walletAddress: zEthereumAddress,
    profileImage: z.string().url(),
});

export const zAgentMetadata = z.object({
    name: z.string(),
    description: z.string(),
    image: z.string().url(),
    creator: zUser,
});



export const AgentTool = z.object({
    name: z.string(),
    description: z.string(),
    // check if unknown is right type
    argumentsSchema: z.unknown(),
    
    // todo encrypt data on db
    // name : value
    environment: z.record(z.string(), z.string()),
    // only support get and post for now
    method: z.enum(['GET', 'POST']),
    urlTemplate: z.string(),
    headersTemplate: z.record(z.string(), z.string()),
    
    // todo zod schema
    // queryTemplate: z.record(z.string(), z.string()),
    // bodyTemplate: z.record(z.string(), z.string()),
    
    argumentsValidator: z.function(),
});

// current model options
export const zModel = z.enum(['ChatGroq']);
export const zAgent = z.object({
    metadata: zAgentMetadata,
    
    model: zModel,
    // system message data
    name: z.string(),
    biography: z.string(),
    directive: z.string(),
    rules: z.string().array(),
    
    // available tools
    tools: AgentTool.array(),
});

export const zMessage = z.object({
    sender: zUser,
    content: z.string(),
    timestamp: z.number(),
});

export const zChat = z.object({
    // potential support for group chats in future
    user: z.array(zUser),
    messages: z.array(zMessage),
    agent: zAgent,
});