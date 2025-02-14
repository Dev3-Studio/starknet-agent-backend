import { NextFunction, Request, Response } from 'express';
import { UnauthorizedError } from '../lib/httpErrors';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { env } from '../lib/env';
import { UserCollection } from '../database/schema';

async function getUserFromToken(authHeader: string) {
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token, env('JWT_SECRET'));
    const address = (decodedToken as JwtPayload).address as string;
    const userRes = await UserCollection.findOne({ walletAddress: address });
    return { id: userRes?._id.toString() ?? undefined, address };
}

export function withAuth() {
    return async (req: Request, res: Response, next: NextFunction) => {
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            next(new UnauthorizedError('No Authorization header provided'));
            return;
        }
        
        try {
            req.user = await getUserFromToken(authHeader);
        } catch {
            next(new UnauthorizedError('Invalid token'));
            return;
        }
        next();
    };
}

export function populateUser() {
    return async (req: Request, res: Response, next: NextFunction) => {
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            next();
        }
        if (typeof authHeader !== 'string') {
            next(new UnauthorizedError('Invalid Authorization header'));
            return;
        }
        
        try {
            req.user = await getUserFromToken(authHeader);
        } catch {
            next(new UnauthorizedError('Invalid token'));
            return;
        }
        next();
    };
}