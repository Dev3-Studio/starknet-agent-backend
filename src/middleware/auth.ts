import { NextFunction, Request, Response } from 'express';
import { UnauthorizedError } from '../lib/httpErrors';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { env } from '../lib/env';
import { UserCollection } from '../database/schema';

export function withAuth() {
    return async (req: Request, res: Response, next: NextFunction) => {
        // Get jwt header
        const authHeader = req.headers['authorization'];
        if (!authHeader) throw new UnauthorizedError('No Authorization header provided');
        const token = authHeader.split(' ')[1];
        
        // Verify jwt
        try {
            const decodedToken = jwt.verify(token, env('JWT_SECRET'));
            const address = (decodedToken as JwtPayload).address as string;
            const user = await UserCollection.findOne({ address });
            req.user = {
                id: user?._id.toString() ?? undefined,
                address,
            };
        } catch {
            throw new UnauthorizedError('Invalid token');
        }
        next();
    };
}

export function populateUser() {
    return async (req: Request, res: Response, next: NextFunction) => {
        // Get user from jwt
        const authHeader = req.headers['authorization'];
        if (!authHeader) return next();
        const token = authHeader.split(' ')[1];
        
        try {
            const decodedToken = jwt.verify(token, env('JWT_SECRET'));
            const address = (decodedToken as JwtPayload).address as string;
            const user = await UserCollection.findOne({ address });
            req.user = {
                id: user?._id.toString() ?? undefined,
                address,
            };
        } catch {
            // Do nothing
        }
        next();
    };
}