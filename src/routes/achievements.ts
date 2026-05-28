import { Router } from 'express';
import { achievementsController } from '../controllers/achievementsController';

const router = Router();

router.get('/:userId', achievementsController.getUserAchievements);

export default router;
