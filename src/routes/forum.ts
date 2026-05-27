import { Router } from 'express';
import { forumController } from '../controllers/forumController';
import { auth } from '../middleware/auth';

const router = Router();

router.post('/posts', auth, forumController.createPost);
router.get('/posts', forumController.getPosts);
router.get('/posts/:id', forumController.getPost);
router.post('/posts/:id/comments', auth, forumController.createComment);

export default router;
