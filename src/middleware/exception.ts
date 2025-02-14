import { NextFunction, Request, Response } from 'express';
import { isCustomHttpError } from '../lib/httpErrors';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function exceptionHandler(err: Error, req: Request, res: Response, next: NextFunction) {
    if (isCustomHttpError(err)) {
        console.error('Exception handler caught a custom HTTP error:\n', err);
        res.status(err.statusCode).json({ error: err.message });
    }
    else {
        console.error('Exception handler caught an unknown exception:\n', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

export function exceptionWrapper(fn: (req: Request, res: Response) => Promise<void>) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await fn(req, res);
        } catch (err) {
            next(err);
        }
    };
}