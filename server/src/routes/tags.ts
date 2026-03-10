import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { listTags, createTag, deleteTag } from '../controllers/tagsController';

const router = Router();

router.use(requireAuth);
router.get('/', listTags);
router.post('/', createTag);
router.delete('/:id', deleteTag);

export default router;
