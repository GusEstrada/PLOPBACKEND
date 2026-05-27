import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';
import { forumService } from '../services/forumService';

const createPostSchema = z.object({
  title: z.string().min(3).max(200),
  content: z.string().min(1),
});

const createCommentSchema = z.object({
  content: z.string().min(1),
});

export const forumController = {
  async createPost(req: AuthRequest, res: Response) {
    const data = createPostSchema.parse(req.body);
    const post = await forumService.createPost(req.userId!, data.title, data.content);
    res.status(201).json(post);
  },

  async getPosts(req: AuthRequest, res: Response) {
    const page = parseInt(String(req.query.page)) || 1;
    const limit = parseInt(String(req.query.limit)) || 20;
    const result = await forumService.getPosts(page, limit);
    res.json(result);
  },

  async getPost(req: AuthRequest, res: Response) {
    const post = await forumService.getPost(req.params.id as string);
    res.json(post);
  },

  async createComment(req: AuthRequest, res: Response) {
    const data = createCommentSchema.parse(req.body);
    const comment = await forumService.createComment(req.userId!, req.params.id as string, data.content);
    res.status(201).json(comment);
  },
};
