import { Router } from 'express';
import * as controller from '../controllers/users';
import { withAuth } from '../middleware/auth';
import { parseBodyMiddleware, parseParamsMiddleware } from '../middleware/parse';
import { zEthereumAddress, zUserCreate } from '../lib/dto';
import { z } from 'zod';

const router = Router();

router.get('/:address',
    parseParamsMiddleware(z.object({ address: zEthereumAddress })),
    controller.getUser
);

router.post('/',
    withAuth(),
    parseBodyMiddleware(zUserCreate),
    controller.createUser
);

export default router;