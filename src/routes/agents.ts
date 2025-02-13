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
    controller.getAgent,
);

router.get('/',
    parseQueryMiddleware(z.object({
        tags: z.string().or(z.string().array()).optional(),
        limit: z.coerce.number().int().min(0).optional(),
        creator: z.string().optional(),
        sort: z.literal('chats').or(z.literal('messages')).or(z.literal('date')).optional(),
        order: z.literal('asc').or(z.literal('desc')).optional(),
    })),
    controller.getAgents,
);

router.post('/',
    withAuth(),
    parseBodyMiddleware(zAgentCreate),
    controller.createAgent,
);

router.patch('/:id',
    withAuth(),
    parseQueryMiddleware(z.string().uuid()),
    parseBodyMiddleware(zAgentCreate),
    controller.updateAgent,
);

export default router;