import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { listNotifications, markRead, markAllRead } from '../controllers/notificationsController';

const router = Router();

router.use(requireAuth);
router.get('/', listNotifications);
router.put('/:id/read', markRead);
router.put('/read-all', markAllRead);

export default router;
