import 'dotenv/config';

export function env(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Make sure you set ${name} in your .env file`);
    }
    return value;
}