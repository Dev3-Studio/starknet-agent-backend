import { Agent } from '../lib/dto';
import { db } from '../database';
import { Collection } from 'mongodb';
const agentCollection: Collection<Agent> = db.collection('agents');

export async function createAgent(agent: Agent) {
    // check for existing agent
    const existingAgent = await agentCollection.findOne({ id: agent.id });
    if (existingAgent) {
        throw new Error('Agent already exists');
    }
    await agentCollection.insertOne(agent);
}



