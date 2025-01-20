import express from 'express';
import cors from 'cors';
import { env } from '../lib/env';
import pingRoutes from '../routes/ping';
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

// Error handling
app.use(exceptionHandler);

export { app };
