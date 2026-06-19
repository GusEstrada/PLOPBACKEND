import { Router } from 'express';
import { authController } from '../controllers/authController';
import { auth } from '../middleware/auth';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', auth, authController.getMe);

export default router;
