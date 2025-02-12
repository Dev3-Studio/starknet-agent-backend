import { User } from '../lib/dto';
import { db } from '../database';
import { Collection } from 'mongodb';
const userCollection: Collection<User> = db.collection('users');

export async function createUser(user: User) {
    // check for address conflicts
    const existingUser = await userCollection.findOne({
        walletAddress: user.walletAddress
    });
    if (existingUser) {
        throw new Error('User already exists');
    }
    await userCollection.insertOne(user);
}

export async function getUser(address: string) {
    return await userCollection.findOne({
        address
    });
}

export async function updateUser(user: User) {
    await userCollection.updateOne({
        walletAddress: user.walletAddress
    }, {
        $set: user
    });
}