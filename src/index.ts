import { app } from './app';
import { env } from './lib/env';
import { connectDb } from './database';
import { registerCronJobs } from './lib/contractEvents';

async function init() {
    await connectDb();
    registerCronJobs(env('ALCHEMY_URL'), env('AGENT_FORGE_CONTRACT_ADDRESS'));
    app.listen(env('PORT'), () => {
        console.log(`Server listening at http://localhost:${env('PORT')}`);
    });
}

void init();