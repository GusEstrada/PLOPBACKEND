import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks ────────────────────────────────────────────────────────────────────

const mockDrawingRepo = vi.hoisted(() => ({
  findOne: vi.fn(),
  findAndCount: vi.fn(),
}));

const mockForumPostRepo = vi.hoisted(() => ({
  findOne: vi.fn(),
  create: vi.fn(),
  save: vi.fn(),
}));

const mockForumCommentRepo = vi.hoisted(() => ({
  findOne: vi.fn(),
  findAndCount: vi.fn(),
  create: vi.fn(),
  save: vi.fn(),
  remove: vi.fn(),
}));

vi.mock('../../config/database', () => ({
  AppDataSource: {
    getRepository: vi.fn((entity) => {
      const name = typeof entity === 'function' ? entity.name : entity?.name;
      if (name === 'Drawing') return mockDrawingRepo;
      if (name === 'ForumPost') return mockForumPostRepo;
      if (name === 'ForumComment') return mockForumCommentRepo;
      return {};
    }),
  },
}));

const mockGalleryLikeCountDocuments = vi.hoisted(() => vi.fn());
const mockGalleryLikeFindOne = vi.hoisted(() => vi.fn());
const mockGalleryLikeDeleteOne = vi.hoisted(() => vi.fn());
const mockGalleryLikeSave = vi.hoisted(() => vi.fn());

const MockGalleryLike = vi.hoisted(() => {
  const fn = vi.fn(function (this: any, data: any) {
    this.userId = data.userId;
    this.drawingId = data.drawingId;
    this.createdAt = new Date();
    this.save = mockGalleryLikeSave;
  }) as any;
  fn.countDocuments = mockGalleryLikeCountDocuments;
  fn.findOne = mockGalleryLikeFindOne;
  fn.deleteOne = mockGalleryLikeDeleteOne;
  return fn;
});

vi.mock('../../models/mongodb/GalleryLike', () => ({
  GalleryLike: MockGalleryLike,
  IGalleryLike: {},
}));

vi.mock('../achievementService', () => ({
  achievementService: {
    checkAndAwardAll: vi.fn().mockResolvedValue([]),
  },
}));

// ── Import después de los mocks ───────────────────────────────────────────────

import { galleryService } from '../galleryService';

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('galleryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getFeed', () => {
    it('debe devolver dibujos paginados con likesCount y commentsCount', async () => {
      const fakeDrawings = [
        { id: 'd1', user: { name: 'Gus' }, blot: { date: '2026-06-18' } },
        { id: 'd2', user: { name: 'Ana' }, blot: { date: '2026-06-18' } },
      ];
      mockDrawingRepo.findAndCount.mockResolvedValue([fakeDrawings, 2]);
      mockGalleryLikeCountDocuments.mockResolvedValue(5);
      mockForumPostRepo.findOne.mockResolvedValue(null);

      const result = await galleryService.getFeed(1, 20);

      expect(result.drawings).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
      expect(result.drawings[0]).toHaveProperty('likesCount', 5);
      expect(result.drawings[0]).toHaveProperty('commentsCount', 0);
    });

    it('debe filtrar por fecha si se proporciona', async () => {
      mockDrawingRepo.findAndCount.mockResolvedValue([[], 0]);

      await galleryService.getFeed(1, 20, '2026-06-18');

      expect(mockDrawingRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { blot: { date: '2026-06-18' } },
        })
      );
    });
  });

  describe('likeDrawing', () => {
    it('debe dar like a un dibujo existente', async () => {
      mockDrawingRepo.findOne.mockResolvedValue({ id: 'd1' });
      mockGalleryLikeFindOne.mockResolvedValue(null);
      mockGalleryLikeSave.mockResolvedValue({});

      const result = await galleryService.likeDrawing('user-1', 'd1');

      expect(result).toEqual({ liked: true, newAchievements: [] });
      expect(mockGalleryLikeSave).toHaveBeenCalled();
    });

    it('debe lanzar error si el dibujo no existe', async () => {
      mockDrawingRepo.findOne.mockResolvedValue(null);

      await expect(
        galleryService.likeDrawing('user-1', 'd-inexistente')
      ).rejects.toThrow('Dibujo no encontrado');
    });

    it('debe lanzar error si ya se dio like', async () => {
      mockDrawingRepo.findOne.mockResolvedValue({ id: 'd1' });
      mockGalleryLikeFindOne.mockResolvedValue({ userId: 'user-1', drawingId: 'd1' });

      await expect(
        galleryService.likeDrawing('user-1', 'd1')
      ).rejects.toThrow('Ya le diste like a este dibujo');
    });
  });

  describe('unlikeDrawing', () => {
    it('debe quitar el like correctamente', async () => {
      mockGalleryLikeDeleteOne.mockResolvedValue({ deletedCount: 1 });

      const result = await galleryService.unlikeDrawing('user-1', 'd1');

      expect(result).toEqual({ liked: false, newAchievements: [] });
      expect(mockGalleryLikeDeleteOne).toHaveBeenCalledWith({ userId: 'user-1', drawingId: 'd1' });
    });

    it('debe lanzar error si no había dado like', async () => {
      mockGalleryLikeDeleteOne.mockResolvedValue({ deletedCount: 0 });

      await expect(
        galleryService.unlikeDrawing('user-1', 'd1')
      ).rejects.toThrow('No habías dado like');
    });
  });

  describe('getLikesCount', () => {
    it('debe devolver el conteo de likes', async () => {
      mockGalleryLikeCountDocuments.mockResolvedValue(42);

      const result = await galleryService.getLikesCount('d1');

      expect(result).toBe(42);
      expect(mockGalleryLikeCountDocuments).toHaveBeenCalledWith({ drawingId: 'd1' });
    });
  });

  describe('getComments', () => {
    it('debe devolver comentarios paginados de un dibujo', async () => {
      mockForumPostRepo.findOne.mockResolvedValue({ id: 'post-1' });
      const fakeComments = [
        { id: 'c1', content: 'Buen dibujo', user: { name: 'Gus' } },
      ];
      mockForumCommentRepo.findAndCount.mockResolvedValue([fakeComments, 1]);

      const result = await galleryService.getComments('d1', 1, 50);

      expect(result.comments).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('debe devolver arreglo vacío si el dibujo no tiene post asociado', async () => {
      mockForumPostRepo.findOne.mockResolvedValue(null);

      const result = await galleryService.getComments('d1');

      expect(result.comments).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('createComment', () => {
    it('debe crear un comentario en un post existente', async () => {
      mockForumPostRepo.findOne.mockResolvedValue({ id: 'post-1' });
      mockForumCommentRepo.findOne.mockResolvedValue({ id: 'c1', userId: 'user-1', content: 'Lindoo', user: { name: 'Gus' } });
      const fakeComment = { id: 'c1', userId: 'user-1', postId: 'post-1', content: 'Lindoo' };
      mockForumCommentRepo.create.mockReturnValue(fakeComment);
      mockForumCommentRepo.save.mockResolvedValue(fakeComment);

      const result = await galleryService.createComment('user-1', 'd1', 'Lindoo');

      expect(result.comment).toHaveProperty('id', 'c1');
      expect(result.newAchievements).toEqual([]);
    });

    it('debe crear un post automáticamente si no existe', async () => {
      mockForumPostRepo.findOne.mockResolvedValue(null);
      mockDrawingRepo.findOne.mockResolvedValue({
        id: 'd1',
        userId: 'dibujante-1',
        user: { name: 'Ana' },
      });
      mockForumPostRepo.create.mockReturnValue({ id: 'post-new' });
      mockForumPostRepo.save.mockResolvedValue({});
      const fakeComment = { id: 'c1', userId: 'user-1', postId: 'post-new', content: 'Hola' };
      mockForumCommentRepo.create.mockReturnValue(fakeComment);
      mockForumCommentRepo.save.mockResolvedValue(fakeComment);
      mockForumCommentRepo.findOne.mockResolvedValue({ id: 'c1', userId: 'user-1', postId: 'post-new', content: 'Hola', user: { name: 'Gus' } });

      const result = await galleryService.createComment('user-1', 'd1', 'Hola');

      expect(result.comment).toHaveProperty('id', 'c1');
      expect(mockForumPostRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ drawingId: 'd1', userId: 'dibujante-1' })
      );
    });

    it('debe lanzar error si el dibujo no existe al intentar crear post', async () => {
      mockForumPostRepo.findOne = vi.fn().mockResolvedValue(null);
      mockDrawingRepo.findOne = vi.fn().mockResolvedValue(null);

      await expect(
        galleryService.createComment('user-1', 'd-inexistente', 'Hola')
      ).rejects.toThrow('Dibujo no encontrado');
    });
  });

  describe('deleteComment', () => {
    it('debe borrar un comentario propio', async () => {
      mockForumCommentRepo.findOne.mockResolvedValue({ id: 'c1', userId: 'user-1' });
      mockForumCommentRepo.remove.mockResolvedValue({});

      const result = await galleryService.deleteComment('c1', 'user-1');

      expect(result).toEqual({ deleted: true });
      expect(mockForumCommentRepo.remove).toHaveBeenCalled();
    });

    it('debe lanzar error si el comentario no existe', async () => {
      mockForumCommentRepo.findOne.mockResolvedValue(null);

      await expect(
        galleryService.deleteComment('c-inexistente', 'user-1')
      ).rejects.toThrow('Comentario no encontrado');
    });

    it('debe lanzar error si el usuario no es el dueño', async () => {
      mockForumCommentRepo.findOne.mockResolvedValue({ id: 'c1', userId: 'otro-user' });

      await expect(
        galleryService.deleteComment('c1', 'user-1')
      ).rejects.toThrow('No puedes borrar este comentario');
    });
  });
});
