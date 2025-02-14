import { Router } from 'express';
import * as controller from '../controllers/agents';
import { parseBodyMiddleware, parseQueryMiddleware } from '../middleware/parse';
import { zAgentCreate } from '../lib/dto';
import { z } from 'zod';
import { populateUser, withAuth } from '../middleware/auth';
import { exceptionWrapper } from '../middleware/exception';

const router = Router();

router.get('/:id',
    populateUser(),
    parseQueryMiddleware(z.string().uuid()),
    exceptionWrapper(controller.getAgent),
);

router.get('/',
    parseQueryMiddleware(z.object({
        searchQuery: z.string().optional(),
        tags: z.string().or(z.string().array()).optional(),
        limit: z.coerce.number().int().min(0).optional(),
        creator: z.string().optional(),
        sort: z.literal('chats').or(z.literal('messages')).or(z.literal('date')).optional(),
        order: z.literal('asc').or(z.literal('desc')).optional(),
    })),
    exceptionWrapper(controller.getAgents),
);

router.post('/',
    withAuth(),
    parseBodyMiddleware(zAgentCreate),
    exceptionWrapper(controller.createAgent),
);

router.patch('/:id',
    withAuth(),
    parseQueryMiddleware(z.string().uuid()),
    parseBodyMiddleware(zAgentCreate),
    exceptionWrapper(controller.updateAgent),
);

export default router;