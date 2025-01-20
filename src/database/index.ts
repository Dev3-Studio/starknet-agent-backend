import { drizzle } from 'drizzle-orm/node-postgres';
import fs from 'fs';
import * as schema from './schema';
import { env } from '../lib/env';

function getCertificate() {
    try {
        return env('DB_CERT');
    } catch {
        return fs.readFileSync('./ca-certificate.crt').toString();
    }
}

export const database = drizzle({
    connection: {
        connectionString: `postgresql://${env('DB_USER')}:${env('DB_PASS')}@${env('DB_HOST')}:${env('DB_PORT')}/${env('DB_NAME')}`,
        ssl: {
            ca: getCertificate(),
        },
    },
    schema: schema,
    casing: 'snake_case',
});

export type DatabaseClient = typeof database;
export type DatabaseTransaction = Parameters<Parameters<DatabaseClient['transaction']>[0]>[0];
export type DatabaseConnection = DatabaseClient | DatabaseTransaction;
