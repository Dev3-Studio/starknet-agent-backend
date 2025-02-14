import { Router } from 'express';
import * as controller from '../controllers/chats';
import { withAuth } from '../middleware/auth';
import { exceptionWrapper } from '../middleware/exception';
import { parseParamsMiddleware } from '../middleware/parse';
import { z } from 'zod';

const router = Router();

router.get('/',
    withAuth(),
    parseParamsMiddleware(z.object({
        order: z.literal('asc').or(z.literal('desc')).optional(),
        agentId: z.string().optional(),
        includeMessages: z.boolean().optional(),
    })),
    exceptionWrapper(controller.getChats)
)

router.get('/:id',
    withAuth(),
    exceptionWrapper(controller.getChat)
);

router.post('/',
    withAuth(),
    exceptionWrapper(controller.createChat)
);

router.post('/:id/messages',
    withAuth(),
    exceptionWrapper(controller.addUserMessage)
);

router.delete('/:id',
    withAuth(),
    exceptionWrapper(controller.deleteChat)
);

export default router;