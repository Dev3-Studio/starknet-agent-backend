import { MongoClient } from 'mongodb';
import { env } from '../lib/env';
// or as an es module:
// import { MongoClient } from 'mongodb'

// Connection URL
const url = env('DB_URI');
const client = new MongoClient(url);

// Database Name
const dbName = 'AgentForge';

async function main() {
    // Use connect method to connect to the server
    await client.connect();
    console.log('Connected successfully to server');
    const db = client.db(dbName);
    // const collection = db.collection('documents');
    
    // the following code examples can be pasted here...
    
    return 'done.';
}

main()
    .then(console.log)
    .catch(console.error)
    .finally(() => client.close());