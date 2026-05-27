import { Router } from 'express';
import { blotController } from '../controllers/blotController';
import { auth } from '../middleware/auth';
import { uploadBlot } from '../middleware/upload';

const router = Router();

router.get('/today', blotController.getToday);
router.get('/:date', blotController.getByDate);
router.post('/', auth, blotController.create);
router.post('/upload-image', auth,   uploadBlot.single('image'), blotController.uploadImage);

export default router;
