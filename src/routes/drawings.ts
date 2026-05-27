import { Router } from 'express';
import { drawingController } from '../controllers/drawingController';
import { auth } from '../middleware/auth';

const router = Router();

router.post('/', auth, drawingController.create);
router.get('/', drawingController.getAll);
router.get('/draft/:blotId', auth, drawingController.getDraft);
router.post('/draft', auth, drawingController.saveDraft);
router.get('/user/:userId', drawingController.getByUser);
router.get('/:id', drawingController.getById);

export default router;
