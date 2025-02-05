import { app } from './app';
import { env } from './lib/env';
import { connectDb } from './database';

async function init() {
    await connectDb()
    app.listen(env('PORT'), () => {
        console.log(`Server listening at http://localhost:${env('PORT')}`);
    });
}

void init();