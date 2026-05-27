import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { galleryService } from '../services/galleryService';

export const galleryController = {
  async getFeed(req: AuthRequest, res: Response) {
    const page = parseInt(String(req.query.page)) || 1;
    const limit = parseInt(String(req.query.limit)) || 20;
    const date = req.query.date as string | undefined;
    const result = await galleryService.getFeed(page, limit, date);
    res.json(result);
  },

  async like(req: AuthRequest, res: Response) {
    const drawingId = req.params.drawingId as string;
    const result = await galleryService.likeDrawing(req.userId!, drawingId);
    res.json(result);
  },

  async unlike(req: AuthRequest, res: Response) {
    const drawingId = req.params.drawingId as string;
    const result = await galleryService.unlikeDrawing(req.userId!, drawingId);
    res.json(result);
  },

  async getLikes(req: AuthRequest, res: Response) {
    const count = await galleryService.getLikesCount(req.params.drawingId as string);
    res.json({ count });
  },
};
