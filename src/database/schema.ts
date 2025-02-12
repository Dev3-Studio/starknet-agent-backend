import { object, z } from 'zod';


export const EthereumAddress = z.string().refine((value) => {
    return /^0x[a-fA-F0-9]{40}$/.test(value);
});

export const User = z.object({
    name: z.string(),
    walletAddress: EthereumAddress,
    profileImage: z.string().url(),
});

export const AgentMetadata = z.object({
    name: z.string(),
    description: z.string(),
    image: z.string().url(),
    creator: User,
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
export const model = z.enum(['ChatGroq']);
export const Agent = z.object({
    metadata: AgentMetadata,
    
    model: model,
    // system message data
    name: z.string(),
    biography: z.string(),
    directive: z.string(),
    rules: z.string().array(),
    
    // available tools
    tools: AgentTool.array(),
});

export const Message = z.object({
    sender: User,
    content: z.string(),
    timestamp: z.number(),
});

export const Chat = z.object({
    // potential support for group chats in future
    user: z.array(User),
    messages: z.array(Message),
    agent: Agent,
});

