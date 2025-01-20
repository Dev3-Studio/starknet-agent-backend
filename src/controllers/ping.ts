import { Request, Response } from 'express';
import * as services from '../services/ping';

export async function ping(_: Request, res: Response) {
    res.send(services.ping());
}