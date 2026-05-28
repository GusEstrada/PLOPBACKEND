import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';
import { drawingService } from '../services/drawingService';
import { DrawingSession } from '../models/mongodb/DrawingSession';

const createSchema = z.object({
  blotId: z.string().uuid(),
  lines: z.array(z.object({
    id: z.number(),
    points: z.array(z.number()),
    color: z.string(),
    size: z.number(),
  })),
});

export const drawingController = {
  async create(req: AuthRequest, res: Response) {
    const data = createSchema.parse(req.body);
    if (data.lines.length === 0) {
      res.status(400).json({ error: 'No puedes enviar un dibujo vacío' });
      return;
    }
    const drawing = await drawingService.create(req.userId!, data.blotId, data.lines);
    await DrawingSession.deleteOne({ userId: req.userId!, blotId: data.blotId });
    res.status(201).json(drawing);
  },

  async getAll(req: AuthRequest, res: Response) {
    const page = parseInt(String(req.query.page)) || 1;
    const limit = parseInt(String(req.query.limit)) || 20;
    const result = await drawingService.getAll(page, limit);
    res.json(result);
  },

  async getById(req: AuthRequest, res: Response) {
    const drawing = await drawingService.getById(req.params.id as string);
    res.json(drawing);
  },

  async getByUser(req: AuthRequest, res: Response) {
    const drawings = await drawingService.getByUser(req.params.userId as string);
    res.json(drawings);
  },

  async remove(req: AuthRequest, res: Response) {
    const id = req.params.id as string;
    await drawingService.delete(id, req.userId!);
    res.json({ deleted: true });
  },

  async saveDraft(req: AuthRequest, res: Response) {
    const { blotId, strokes } = req.body;
    await DrawingSession.findOneAndUpdate(
      { userId: req.userId!, blotId },
      { strokes, lastActive: new Date() },
      { upsert: true }
    );
    res.json({ saved: true });
  },

  async getDraft(req: AuthRequest, res: Response) {
    const blotId = req.params.blotId as string;
    const session = await DrawingSession.findOne({ userId: req.userId!, blotId });
    res.json(session || { strokes: [] });
  },
};
