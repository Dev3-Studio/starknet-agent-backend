import { Router } from 'express';
import * as controller from '../controllers/agent';
import { parseBodyMiddleware } from '../middleware/parse';
import { zAgent } from '../lib/dto';

const router = Router();
// todo add routes

router.post('/',
    parseBodyMiddleware(zAgent),
    controller.createAgent
);

export default router;