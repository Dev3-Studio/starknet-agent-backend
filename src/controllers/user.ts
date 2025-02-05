import { Request, Response } from 'express';
import * as services from '../services/user';
import { zUserCreate } from '../lib/dto';

export async function createUser(req: Request, res: Response) {
    const user = zUserCreate.parse(req.params);
    res.send(services.createUser(user));
}

export async function getUser(req: Request, res: Response) {
    const address = req.params.address;
    res.send(services.getUser(address));
}

export async function updateUser(req: Request, res: Response) {
    const user = zUserCreate.parse(req.params);
    res.send(services.updateUser(user));
}