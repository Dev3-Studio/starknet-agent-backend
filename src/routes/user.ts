import { Router } from 'express';
import * as controller from '../controllers/user';

const router = Router();

router.get('/:address', controller.getUser);
router.post('/', controller.createUser);
router.patch('/', controller.updateUser);


export default router;