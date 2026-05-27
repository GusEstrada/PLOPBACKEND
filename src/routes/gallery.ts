import { Router } from 'express';
import { galleryController } from '../controllers/galleryController';
import { auth } from '../middleware/auth';

const router = Router();

router.get('/feed', galleryController.getFeed);
router.post('/:drawingId/like', auth, galleryController.like);
router.delete('/:drawingId/like', auth, galleryController.unlike);
router.get('/:drawingId/likes', galleryController.getLikes);

export default router;
