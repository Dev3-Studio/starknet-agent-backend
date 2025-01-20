import { app } from './app';
import { env } from './lib/env';

async function init() {
    app.listen(env('PORT'), () => {
        console.log(`Server listening at http://localhost:${env('PORT')}`);
    });
}

void init();