import { Router } from 'express';
import * as controller from '../controllers/chats';

const router = Router();

router.get('/:id', controller.getChat);
router.post('/', controller.createChat);
router.post('/:id/messages', controller.addUserMessage);
router.delete('/:id', controller.deleteChat);
