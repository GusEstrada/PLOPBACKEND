import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';
import { profileService } from '../services/profileService';

const updateProfileSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  bio: z.string().max(500).optional(),
});

const updateAvatarSchema = z.object({
  headUrl: z.string().optional(),
  eyesUrl: z.string().optional(),
  mouthUrl: z.string().optional(),
  accessoryUrl: z.string().optional(),
  skinColor: z.string().optional(),
});

export const profileController = {
  async getProfile(req: AuthRequest, res: Response) {
    const userId = (req.params.userId || req.userId!) as string;
    const profile = await profileService.getProfile(userId);
    res.json(profile);
  },

  async updateProfile(req: AuthRequest, res: Response) {
    const data = updateProfileSchema.parse(req.body);
    const user = await profileService.updateProfile(req.userId!, data);
    res.json(user);
  },

  async updateAvatar(req: AuthRequest, res: Response) {
    const data = updateAvatarSchema.parse(req.body);
    const avatar = await profileService.updateAvatar(req.userId!, data);
    res.json(avatar);
  },

  async uploadPhoto(req: AuthRequest, res: Response) {
    if (!req.file) {
      res.status(400).json({ error: 'Archivo requerido' });
      return;
    }
    const url = `/uploads/avatars/${req.file.filename}`;
    const user = await profileService.uploadPhoto(req.userId!, url);
    res.json({ profilePhotoUrl: user.profilePhotoUrl });
  },
};
