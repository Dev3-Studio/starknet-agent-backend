import express from 'express';
import cors from 'cors';
import { env } from '../lib/env';
import pingRoutes from '../routes/ping';
import userRoutes from '../routes/users';
import agentRoutes from '../routes/agents';
import chatRoutes from '../routes/chats';
import { exceptionHandler } from '../middleware/exception';

const app = express();

// Resolve CORS
app.use(
    cors({
        origin: [...env('ALLOWED_ORIGINS').split(',')],
        credentials: true,
    }),
);

// Parse JSON
app.use(express.json());

// Register routes
app.use('/ping', pingRoutes);
app.use('/user', userRoutes);
app.use('/agent', agentRoutes);
app.use('/chat', chatRoutes);

// Error handling
app.use(exceptionHandler);

export { app };
