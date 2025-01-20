export class CustomHttpError extends Error {
    public statusCode: number;
    constructor(name: string, message: string, statusCode: number) {
        super(message);
        this.name = name;
        this.statusCode = statusCode;
    }
}

export class BadRequestError extends CustomHttpError {
    constructor(message: string) {
        super('BadRequestError', message, 400);
    }
}

export class UnauthorizedError extends CustomHttpError {
    constructor(message: string) {
        super('UnauthorizedError', message, 401);
    }
}

export class ForbiddenError extends CustomHttpError {
    constructor(message: string) {
        super('ForbiddenError', message, 403);
    }
}

export class NotFoundError extends CustomHttpError {
    constructor(message: string) {
        super('NotFoundError', message, 404);
    }
}

export class ConflictError extends CustomHttpError {
    constructor(message: string) {
        super('ConflictError', message, 409);
    }
}

export class InternalServerError extends CustomHttpError {
    constructor(message: string) {
        super('InternalServerError', message, 500);
    }
}

export function isCustomHttpError(error: unknown): error is CustomHttpError {
    return error instanceof CustomHttpError;
}

