import { Router } from 'express';
import { profileController } from '../controllers/profileController';
import { auth } from '../middleware/auth';
import { uploadAvatar } from '../middleware/upload';

const router = Router();

router.get('/:userId', profileController.getProfile);
router.put('/', auth, profileController.updateProfile);
router.put('/avatar', auth, profileController.updateAvatar);
router.put('/photo', auth, uploadAvatar.single('photo'), profileController.uploadPhoto);

export default router;
