import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { blotService } from '../services/blotService';

export const blotController = {
  async getToday(_req: AuthRequest, res: Response) {
    const blot = await blotService.getToday();
    res.json(blot);
  },

  async getByDate(req: AuthRequest, res: Response) {
    const blot = await blotService.getByDate(req.params.date as string);
    res.json(blot);
  },

  async create(req: AuthRequest, res: Response) {
    const { date, imageUrl, mainBlot, satellites } = req.body;
    const blot = await blotService.create(date, imageUrl, mainBlot, satellites);
    res.status(201).json(blot);
  },

  async uploadImage(req: AuthRequest, res: Response) {
    if (!req.file) {
      res.status(400).json({ error: 'Archivo requerido' });
      return;
    }

    const date = req.body.date as string;
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      res.status(400).json({ error: 'Fecha requerida (YYYY-MM-DD)' });
      return;
    }

    const imageUrl = `/uploads/blots/${req.file.filename}`;
    const blot = await blotService.create(date, imageUrl);
    res.status(201).json(blot);
  },
};
