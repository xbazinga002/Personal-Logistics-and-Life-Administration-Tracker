import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { listCategories, createCategory, deleteCategory } from '../controllers/categoriesController';

const router = Router();

router.use(requireAuth);
router.get('/', listCategories);
router.post('/', createCategory);
router.delete('/:id', deleteCategory);

export default router;
