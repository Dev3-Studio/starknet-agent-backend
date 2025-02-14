import { ChatGroq } from '@langchain/groq';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { z } from 'zod';

export async function getChatTitle(firstMessage: string): Promise<string> {
    const model = new ChatGroq({
        apiKey: process.env.GROQ_API_KEY,
        temperature: 0,
    })
    const systemMessage = new SystemMessage(`You must determine a short title of a chat based on its first message.`);
    const userMessage = new HumanMessage(firstMessage);
    const schema = z.object({
        title: z.string().describe('The short title of the chat.'),
    });
    
    const structuredModel = model.withStructuredOutput(schema);
    const { title } = await structuredModel.invoke([systemMessage, userMessage]);
    return title;
}