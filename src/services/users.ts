import { User, UserCreate, zUser } from '../lib/dto';
import { UserCollection } from '../database/schema';
import { ConflictError, NotFoundError } from '../lib/httpErrors';
import { ObjectId } from 'mongodb';

export async function getUser(address: string): Promise<User> {
    const res = await UserCollection.findOne({ walletAddress: address });
    if (!res) throw new NotFoundError('User not found');
    return zUser.parse({
        ...res,
        id: res._id.toString(),
    });
}

export async function getUserById(id: string): Promise<User> {
    const res = await UserCollection.findOne({ _id: new ObjectId(id) });
    if (!res) throw new NotFoundError('User not found');
    return zUser.parse({
        ...res,
        id: res._id.toString(),
    });
}

export async function createUser(user: UserCreate): Promise<User> {
    const existingUser = await getUser(user.walletAddress).catch((e) =>
        e instanceof NotFoundError ? null : Promise.reject(e),
    );
    if (existingUser) throw new ConflictError('User already exists');
    const res = await UserCollection.insertOne({ ...user, credits: 5_000 });
    return await getUserById(res.insertedId.toString());
}