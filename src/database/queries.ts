// Export reusable functions for database queries
// Each function should take a connection object of type DatabaseConnection.
// This makes it easier to compose transactions and queries.

import { DatabaseConnection } from './index';
import { eq } from 'drizzle-orm';
import { users } from './schema';
import { User } from '../lib/dto';
import { NotFoundError } from '../lib/httpErrors';

export async function getUserById(connection: DatabaseConnection, id: number): Promise<User> {
    const user = await connection.query.users.findFirst({ where: eq(users.id, id) });
    if (!user) throw new NotFoundError('User not found');
    return user;
}