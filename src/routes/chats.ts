import { Router } from 'express';
import * as controller from '../controllers/chats';
import { withAuth } from '../middleware/auth';

const router = Router();

router.get('/:id',
    withAuth(),
    controller.getChat
);

router.post('/',
    withAuth(),
    controller.createChat
);

router.post('/:id/messages',
    withAuth(),
    controller.addUserMessage
);

router.delete('/:id',
    withAuth(),
    controller.deleteChat
);

export default router;