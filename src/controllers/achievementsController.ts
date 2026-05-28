import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { achievementService } from '../services/achievementService';

export const achievementsController = {
  async getUserAchievements(req: AuthRequest, res: Response) {
    const achievements = await achievementService.getUserAchievements(req.params.userId as string);
    res.json(achievements);
  },
};
