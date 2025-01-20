import { NextFunction, Request, Response } from 'express';

// Define the parameters this middleware will accept
interface WithAuthParams {

}

export function withAuth(params: WithAuthParams) {
    return async (req: Request, res: Response, next: NextFunction) => {
        // Implement auth middleware
        
        next();
    };
}