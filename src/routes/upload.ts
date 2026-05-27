import { Router } from 'express';
import { uploadController } from '../controllers/uploadController';
import { auth } from '../middleware/auth';
import { uploadAvatar } from '../middleware/upload';

const router = Router();

router.post(
  '/avatar-component',
  auth,
  uploadAvatar.single('image'),
  uploadController.avatarComponent
);

export default router;
