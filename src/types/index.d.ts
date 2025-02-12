export { };

declare global {
    namespace Express {
        export interface Request {
            user?: {
                address: string;
            }
        }
    }
}