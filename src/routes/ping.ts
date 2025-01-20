import { Router } from 'express';
import * as controller from '../controllers/ping';

const router = Router();

router.get('/', controller.ping);

export default router;