import { Router } from 'express';
import { galleryController } from '../controllers/galleryController';
import { auth } from '../middleware/auth';

const router = Router();

router.get('/feed', galleryController.getFeed);
router.post('/:drawingId/like', auth, galleryController.like);
router.delete('/:drawingId/like', auth, galleryController.unlike);
router.get('/:drawingId/likes', galleryController.getLikes);

router.get('/:drawingId/comments', galleryController.getComments);
router.post('/:drawingId/comments', auth, galleryController.createComment);
router.delete('/:drawingId/comments/:commentId', auth, galleryController.deleteComment);

export default router;
