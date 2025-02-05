import { UserCreate } from '../lib/dto';
import { db } from '../database';
const userCollection = db.collection('users');

export async function createUser(user: UserCreate) {
    // check for address conflicts
    const existingUser = await userCollection.findOne({
        address: user.address
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

export async function updateUser(user: UserCreate) {
    await userCollection.updateOne({
        address: user.address
    }, {
        $set: user
    });
}