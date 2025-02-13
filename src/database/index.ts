import { MongoClient } from 'mongodb';
import { env } from '../lib/env';

// Connection URL
const url = env('DB_URI');
export const client = new MongoClient(url);

export const db = client.db(env('DB_NAME'));

// Database Name
export async function connectDb() {
    // Use connect method to connect to the server
    await client.connect();
    console.log('Connected successfully to server');
}