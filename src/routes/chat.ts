import { Router } from 'express';
import * as controller from '../controllers/chat';

const router = Router();

router.get('/:chatId', controller.getChat);
router.post('/', controller.createChat);
router.post('/:chatId/message', controller.addUserMessage);
router.delete('/:chatId', controller.deleteChat);
