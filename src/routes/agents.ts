import { Router } from 'express';
import * as controller from '../controllers/agents';
import { parseBodyMiddleware, parseQueryMiddleware } from '../middleware/parse';
import { zAgentCreate } from '../lib/dto';
import { z } from 'zod';
import { populateUser, withAuth } from '../middleware/auth';

const router = Router();

router.get('/:id',
    populateUser(),
    parseQueryMiddleware(z.string().uuid()),
    controller.getAgent
)

router.post('/',
    withAuth(),
    parseBodyMiddleware(zAgentCreate),
    controller.createAgent
);

router.patch('/:id',
    withAuth(),
    parseQueryMiddleware(z.string().uuid()),
    parseBodyMiddleware(zAgentCreate),
    controller.updateAgent
);

export default router;