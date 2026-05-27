import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { statsService } from '../services/statsService';

export const statsController = {
  async get(_req: AuthRequest, res: Response) {
    const stats = await statsService.getStats();
    res.json(stats);
  },
};
