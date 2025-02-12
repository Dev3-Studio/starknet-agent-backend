import { NextFunction, Request, Response } from 'express';
import { UnauthorizedError } from '../lib/httpErrors';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { env } from '../lib/env';

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
            req.user = { address };
        }
        catch {
            throw new UnauthorizedError('Invalid token');
        }
        next();
    };
}

export function populateUser() {
    return (req: Request, res: Response, next: NextFunction) => {
        // Get user from jwt
        const authHeader = req.headers['authorization'];
        if (!authHeader) return next();
        const token = authHeader.split(' ')[1];
        
        try {
            const decodedToken = jwt.verify(token, env('JWT_SECRET'));
            const address = (decodedToken as JwtPayload).address as string;
            req.user = { address };
        }
        catch {
            // Do nothing
        }
        next();
    };
}