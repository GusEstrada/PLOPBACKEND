import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';
import { galleryService } from '../services/galleryService';

const createCommentSchema = z.object({
  content: z.string().min(1),
});

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

  async getComments(req: AuthRequest, res: Response) {
    const page = parseInt(String(req.query.page)) || 1;
    const limit = parseInt(String(req.query.limit)) || 50;
    const result = await galleryService.getComments(req.params.drawingId as string, page, limit);
    res.json(result);
  },

  async createComment(req: AuthRequest, res: Response) {
    const data = createCommentSchema.parse(req.body);
    const result = await galleryService.createComment(req.userId!, req.params.drawingId as string, data.content);
    res.status(201).json(result);
  },

  async deleteComment(req: AuthRequest, res: Response) {
    const result = await galleryService.deleteComment(req.params.commentId as string, req.userId!);
    res.json(result);
  },
};
