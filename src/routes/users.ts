import { Router } from 'express';
import * as controller from '../controllers/users';

const router = Router();

router.get('/:address', controller.getUser);
router.post('/', controller.createUser);
router.patch('/', controller.updateUser);


export default router;