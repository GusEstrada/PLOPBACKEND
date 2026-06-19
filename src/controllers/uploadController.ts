import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';

export const uploadController = {
  async avatarComponent(req: AuthRequest, res: Response) {
    if (!req.file) {
      res.status(400).json({ error: 'Archivo requerido' });
      return;
    }
    const url = `/uploads/avatars/${req.file.filename}`;
    res.json({ url, filename: req.file.filename });
  },
};
