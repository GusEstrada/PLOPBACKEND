import { Router } from 'express';
import { profileController } from '../controllers/profileController';
import { auth } from '../middleware/auth';

const router = Router();

router.get('/:userId', profileController.getProfile);
router.put('/', auth, profileController.updateProfile);
router.put('/avatar', auth, profileController.updateAvatar);

export default router;
