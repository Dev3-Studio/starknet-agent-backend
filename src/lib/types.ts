// todo evaluate what types are provided to user
export interface User {
    name: string;
    walletAddress: string;
}

// will be represented with Json-Schema-to-Zod
export interface Parameter {
    name: string;
    type: string;
    description: string;
    options?: string[];
}

export interface Tool {
    name: string;
    description: string;
    // array of inputs with their types
    schema: object[];
}

export interface AgentParams {
    systemMessage: string;
    tools: Tool[];
}

export interface Agent {
    name: string;
    description: string;
    image: string;
    creator: User;
    params: AgentParams;
}