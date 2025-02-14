import { Request, Response } from 'express';
import * as services from '../services/users';
import { zUserCreate } from '../lib/dto';

export async function createUser(req: Request, res: Response) {
    const user = zUserCreate.parse(req.body);
    res.send(await services.createUser(user));
}

export async function getUser(req: Request, res: Response) {
    const address = req.params.address;
    res.send(await services.getUser(address));
}