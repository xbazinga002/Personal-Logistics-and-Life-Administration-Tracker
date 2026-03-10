import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { listItems, getItem, createItem, updateItem, deleteItem, completeItem } from '../controllers/itemsController';

const router = Router();

router.use(requireAuth);

router.get('/', listItems);
router.post('/', createItem);
router.get('/:id', getItem);
router.put('/:id', updateItem);
router.delete('/:id', deleteItem);
router.post('/:id/complete', completeItem);

export default router;
