import { AppDataSource } from '../config/database';
import { ForumPost } from '../models/postgresql/ForumPost';
import { ForumComment } from '../models/postgresql/ForumComment';
import { logger } from '../utils/logger';

const postRepo = () => AppDataSource.getRepository(ForumPost);
const commentRepo = () => AppDataSource.getRepository(ForumComment);

export const forumService = {
  async createPost(userId: string, title: string, content: string) {
    const post = postRepo().create({ userId, title, content });
    await postRepo().save(post);
    logger.info({ userId, postId: post.id, titleLength: title.length, action: 'create_forum_post' }, 'Post del foro creado');
    return postRepo().findOne({ where: { id: post.id }, relations: ['user'] });
  },

  async getPosts(page = 1, limit = 20) {
    const [posts, total] = await postRepo().findAndCount({
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { posts, total, page, totalPages: Math.ceil(total / limit) };
  },

  async getPost(id: string) {
    const post = await postRepo().findOne({
      where: { id },
      relations: ['user', 'comments', 'comments.user'],
      order: { comments: { createdAt: 'ASC' } },
    });
    if (!post) throw new Error('Post no encontrado');
    return post;
  },

  async createComment(userId: string, postId: string, content: string) {
    const post = await postRepo().findOne({ where: { id: postId } });
    if (!post) {
      logger.warn({ userId, postId, reason: 'not_found', action: 'create_forum_comment' }, 'Intento de comentar en post inexistente');
      throw new Error('Post no encontrado');
    }

    const comment = commentRepo().create({ userId, postId, content });
    await commentRepo().save(comment);
    logger.info({ userId, postId, commentId: comment.id, contentLength: content.length, action: 'create_forum_comment' }, 'Comentario de foro creado');
    return commentRepo().findOne({
      where: { id: comment.id },
      relations: ['user'],
    });
  },
};
