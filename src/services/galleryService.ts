import { GalleryLike } from '../models/mongodb/GalleryLike';
import { AppDataSource } from '../config/database';
import { Drawing } from '../models/postgresql/Drawing';
import { ForumPost } from '../models/postgresql/ForumPost';
import { ForumComment } from '../models/postgresql/ForumComment';
import { achievementService } from './achievementService';
import { logger } from '../utils/logger';

const drawingRepo = () => AppDataSource.getRepository(Drawing);
const forumPostRepo = () => AppDataSource.getRepository(ForumPost);
const forumCommentRepo = () => AppDataSource.getRepository(ForumComment);

export const galleryService = {
  async getFeed(page = 1, limit = 20, date?: string) {
    const where: Record<string, unknown> = {};
    if (date) where['blot.date'] = date;

    const [drawings, total] = await drawingRepo().findAndCount({
      relations: ['user', 'blot'],
      where: date ? { blot: { date } } as any : undefined,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const drawingsWithLikes = await Promise.all(
      drawings.map(async (d) => {
        const [likesCount, commentsCount] = await Promise.all([
          GalleryLike.countDocuments({ drawingId: d.id }),
          (async () => {
            const post = await forumPostRepo().findOne({ where: { drawingId: d.id } });
            if (!post) return 0;
            return forumCommentRepo().count({ where: { postId: post.id } });
          })(),
        ]);
        return { ...d, likesCount, commentsCount };
      })
    );

    return { drawings: drawingsWithLikes, total, page, totalPages: Math.ceil(total / limit) };
  },

  async likeDrawing(userId: string, drawingId: string) {
    const drawing = await drawingRepo().findOne({ where: { id: drawingId } });
    if (!drawing) {
      logger.warn({ userId, drawingId, reason: 'not_found', action: 'like_drawing' }, 'Intento de like a dibujo inexistente');
      throw new Error('Dibujo no encontrado');
    }

    const existing = await GalleryLike.findOne({ userId, drawingId });
    if (existing) {
      logger.warn({ userId, drawingId, reason: 'already_liked', action: 'like_drawing' }, 'Intento de like duplicado');
      throw new Error('Ya le diste like a este dibujo');
    }

    await new GalleryLike({ userId, drawingId }).save();

    logger.info({ userId, drawingId, action: 'like_drawing' }, 'Like agregado a dibujo');

    const newAchievements = await achievementService.checkAndAwardAll(userId);
    return { liked: true, newAchievements };
  },

  async unlikeDrawing(userId: string, drawingId: string) {
    const result = await GalleryLike.deleteOne({ userId, drawingId });
    if (result.deletedCount === 0) {
      logger.warn({ userId, drawingId, reason: 'not_liked', action: 'unlike_drawing' }, 'Intento de unlike sin like previo');
      throw new Error('No habías dado like');
    }
    logger.info({ userId, drawingId, action: 'unlike_drawing' }, 'Like removido de dibujo');
    return { liked: false, newAchievements: [] };
  },

  async getLikesCount(drawingId: string) {
    return GalleryLike.countDocuments({ drawingId });
  },

  async getComments(drawingId: string, page = 1, limit = 50) {
    const post = await forumPostRepo().findOne({ where: { drawingId } });
    if (!post) return { comments: [], total: 0, page, totalPages: 0 };
    const [comments, total] = await forumCommentRepo().findAndCount({
      where: { postId: post.id },
      relations: ['user'],
      order: { createdAt: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { comments, total, page, totalPages: Math.ceil(total / limit) };
  },

  async createComment(userId: string, drawingId: string, content: string) {
    let post = await forumPostRepo().findOne({ where: { drawingId } });
    if (!post) {
      const drawing = await drawingRepo().findOne({ where: { id: drawingId }, relations: ['user'] });
      if (!drawing) {
        logger.warn({ userId, drawingId, reason: 'not_found', action: 'create_comment' }, 'Intento de comentar en dibujo inexistente');
        throw new Error('Dibujo no encontrado');
      }
      post = forumPostRepo().create({
        userId: drawing.userId,
        drawingId,
        title: `Dibujo de ${drawing.user.name}`,
        content: '',
      });
      await forumPostRepo().save(post);
    }
    const comment = forumCommentRepo().create({ userId, postId: post.id, content });
    await forumCommentRepo().save(comment);
    const saved = await forumCommentRepo().findOne({
      where: { id: comment.id },
      relations: ['user'],
    });

    logger.info({ userId, drawingId, commentId: comment.id, contentLength: content.length, action: 'create_comment' }, 'Comentario creado en galería');

    const newAchievements = await achievementService.checkAndAwardAll(userId);
    return { comment: saved, newAchievements };
  },

  async deleteComment(commentId: string, userId: string) {
    const comment = await forumCommentRepo().findOne({ where: { id: commentId } });
    if (!comment) {
      logger.warn({ userId, commentId, reason: 'not_found', action: 'delete_comment' }, 'Intento de eliminar comentario inexistente');
      throw new Error('Comentario no encontrado');
    }
    if (comment.userId !== userId) {
      logger.warn({ userId, commentId, ownerId: comment.userId, reason: 'not_owner', action: 'delete_comment' }, 'Intento de eliminar comentario ajeno');
      throw new Error('No puedes borrar este comentario');
    }
    await forumCommentRepo().remove(comment);
    logger.info({ userId, commentId, action: 'delete_comment' }, 'Comentario eliminado');
    return { deleted: true };
  },
};
