import { Router } from 'express';
import * as controller from '../controllers/users';
import { withAuth } from '../middleware/auth';
import { parseBodyMiddleware, parseParamsMiddleware } from '../middleware/parse';
import { zStarknetAddress, zUserCreate } from '../lib/dto';
import { z } from 'zod';
import { exceptionWrapper } from '../middleware/exception';

const router = Router();

router.get('/:address',
    parseParamsMiddleware(z.object({ address: zStarknetAddress })),
    exceptionWrapper(controller.getUser)
);

router.post('/',
    parseBodyMiddleware(zUserCreate),
    exceptionWrapper(controller.createUser)
);

export default router;