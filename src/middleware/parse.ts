import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { fromError } from 'zod-validation-error';

export function parseBodyMiddleware(schema: z.ZodSchema<never>) {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            req.body = schema.parse(req.body);
            next();
        } catch (err) {
            const validationError = fromError(err);
            res.status(400).send({
                error: 'Invalid body; ' + validationError.toString(),
            });
        }
    };
}

export function parseQueryMiddleware(schema: z.ZodSchema<never>) {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            req.query = schema.parse(req.query);
            next();
        } catch (err) {
            const validationError = fromError(err);
            res.status(400).send({
                error: 'Invalid query; ' + validationError.toString(),
            });
        }
    };
}

export function parseParamsMiddleware(schema: z.ZodSchema<never>) {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            req.params = schema.parse(req.params);
            next();
        } catch (err) {
            const validationError = fromError(err);
            res.status(400).send({
                error: 'Invalid params; ' + validationError.toString(),
            });
        }
    };
}