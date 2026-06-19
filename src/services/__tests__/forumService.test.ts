// src/services/__tests__/forumService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks ────────────────────────────────────────────────────────────────────

const mockPostRepo = {
  findOne: vi.fn(),
  findAndCount: vi.fn(),
  create: vi.fn(),
  save: vi.fn(),
};

const mockCommentRepo = {
  findOne: vi.fn(),
  create: vi.fn(),
  save: vi.fn(),
};

vi.mock('../../config/database', () => ({
  AppDataSource: {
    getRepository: vi.fn((entity) => {
      const name = typeof entity === 'function' ? entity.name : entity?.name;
      if (name === 'ForumComment') return mockCommentRepo;
      return mockPostRepo; // ForumPost por default
    }),
  },
}));

// ── Import después de los mocks ───────────────────────────────────────────────
import { forumService } from '../forumService';

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('forumService', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── getPosts ──────────────────────────────────────────────────────────────

  describe('getPosts', () => {
    it('debe devolver posts paginados con metadata', async () => {
      // Arrange
      const fakePosts = [{ id: 'p1', title: 'Post 1' }, { id: 'p2', title: 'Post 2' }];
      mockPostRepo.findAndCount.mockResolvedValue([fakePosts, 2]);

      // Act
      const result = await forumService.getPosts(1, 20);

      // Assert
      expect(result.posts).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('debe calcular totalPages correctamente con muchos posts', async () => {
      // Arrange
      mockPostRepo.findAndCount.mockResolvedValue([[], 45]);

      // Act
      const result = await forumService.getPosts(1, 20);

      // Assert
      expect(result.totalPages).toBe(3); // ceil(45/20) = 3
    });
  });

  // ── getPost ───────────────────────────────────────────────────────────────

  describe('getPost', () => {
    it('debe devolver un post existente con sus comentarios', async () => {
      // Arrange
      mockPostRepo.findOne.mockResolvedValue({ id: 'p1', title: 'Post 1', comments: [] });

      // Act
      const result = await forumService.getPost('p1');

      // Assert
      expect(result.id).toBe('p1');
    });

    it('debe lanzar error si el post no existe', async () => {
      // Arrange
      mockPostRepo.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(forumService.getPost('post-fantasma')).rejects.toThrow('Post no encontrado');
    });
  });

  // ── createPost ────────────────────────────────────────────────────────────

  describe('createPost', () => {
    it('debe crear un post y devolverlo con el usuario', async () => {
      // Arrange
      const fakePost = { id: 'p-new', userId: 'user-1', title: 'Mi post', content: 'Hola' };
      mockPostRepo.create.mockReturnValue(fakePost);
      mockPostRepo.save.mockResolvedValue(fakePost);
      mockPostRepo.findOne.mockResolvedValue({ ...fakePost, user: { name: 'Gus' } });

      // Act
      const result = await forumService.createPost('user-1', 'Mi post', 'Hola');

      // Assert
      expect(result).toHaveProperty('id', 'p-new');
      expect(mockPostRepo.save).toHaveBeenCalled();
    });
  });

  // ── createComment ─────────────────────────────────────────────────────────

  describe('createComment', () => {
    it('debe agregar un comentario a un post existente', async () => {
      // Arrange
      mockPostRepo.findOne.mockResolvedValue({ id: 'p1' });
      const fakeComment = { id: 'c1', userId: 'user-1', postId: 'p1', content: 'Buen dibujo' };
      mockCommentRepo.create.mockReturnValue(fakeComment);
      mockCommentRepo.save.mockResolvedValue(fakeComment);
      mockCommentRepo.findOne.mockResolvedValue({ ...fakeComment, user: { name: 'Gus' } });

      // Act
      const result = await forumService.createComment('user-1', 'p1', 'Buen dibujo');

      // Assert
      expect(result).toHaveProperty('id', 'c1');
      expect(mockCommentRepo.save).toHaveBeenCalled();
    });

    it('debe lanzar error si el post donde se comenta no existe', async () => {
      // Arrange
      mockPostRepo.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        forumService.createComment('user-1', 'post-fantasma', 'Comentario')
      ).rejects.toThrow('Post no encontrado');
    });
  });
});