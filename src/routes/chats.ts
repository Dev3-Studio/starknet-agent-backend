import { Router } from 'express';
import * as controller from '../controllers/chats';
import { withAuth } from '../middleware/auth';
import { exceptionWrapper } from '../middleware/exception';

const router = Router();

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