import { NextFunction, Request, Response } from 'express';
import { isCustomHttpError } from '../lib/httpErrors';

export async function exceptionHandler(err: Error, req: Request, res: Response, next: NextFunction) {
    if (isCustomHttpError(err)) {
        res.status(err.statusCode).json({ message: err.message });
    }
    else {
        console.log('Exception handler caught an unknown exception:\n', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}