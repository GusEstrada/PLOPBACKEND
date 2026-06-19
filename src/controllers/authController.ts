import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';
import { authService } from '../services/authService';

const registerSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const authController = {
  async register(req: AuthRequest, res: Response) {
    const data = registerSchema.parse(req.body);
    const result = await authService.register(data.name, data.email, data.password);
    res.status(201).json(result);
  },

  async login(req: AuthRequest, res: Response) {
    const data = loginSchema.parse(req.body);
    const result = await authService.login(data.email, data.password);
    res.json(result);
  },

  async getMe(req: AuthRequest, res: Response) {
    const user = await authService.getMe(req.userId!);
    res.json(user);
  },
};
