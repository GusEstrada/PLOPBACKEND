// src/services/__tests__/drawingService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks ────────────────────────────────────────────────────────────────────

const mockDrawingRepo = {
  findOne: vi.fn(),
  findAndCount: vi.fn(),
  find: vi.fn(),
  create: vi.fn(),
  save: vi.fn(),
  remove: vi.fn(),
};

const mockUserRepo = {
  findOne: vi.fn(),
  count: vi.fn().mockResolvedValue(10),
};

const mockForumPostRepo = {
  findOne: vi.fn(),
  create: vi.fn(),
  save: vi.fn(),
  delete: vi.fn(),
};

const mockForumCommentRepo = {
  count: vi.fn(),
};

const mockStatRepo = {
  findOne: vi.fn(),
  create: vi.fn(),
  save: vi.fn(),
};

vi.mock('../../config/database', () => ({
  AppDataSource: {
    getRepository: vi.fn((entity) => {
      const name = typeof entity === 'function' ? entity.name : entity?.name;
      if (name === 'Drawing') return mockDrawingRepo;
      if (name === 'User') return mockUserRepo;
      if (name === 'ForumPost') return mockForumPostRepo;
      if (name === 'ForumComment') return mockForumCommentRepo;
      if (name === 'Stat') return mockStatRepo;
      return {};
    }),
  },
}));

vi.mock('../achievementService', () => ({
  achievementService: {
    checkAndAwardAll: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock('../../models/mongodb/GalleryLike', () => ({
  GalleryLike: {
    countDocuments: vi.fn().mockResolvedValue(0),
  },
}));

// ── Import después de los mocks ───────────────────────────────────────────────
import { drawingService } from '../drawingService';

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('drawingService', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── create ────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('debe crear un dibujo con líneas válidas', async () => {
      // Arrange
      const fakeDrawing = { id: 'drawing-1', userId: 'user-1', blotId: 'blot-1', lines: [{ points: [1, 2] }] };
      mockDrawingRepo.create.mockReturnValue(fakeDrawing);
      mockDrawingRepo.save.mockResolvedValue(fakeDrawing);
      mockUserRepo.findOne.mockResolvedValue({ id: 'user-1', name: 'Gus' });
      mockForumPostRepo.create.mockReturnValue({ id: 'post-1' });
      mockForumPostRepo.save.mockResolvedValue({});
      mockStatRepo.findOne.mockResolvedValue({ date: '2026-06-18', totalDrawings: 5, todayDrawings: 1 });
      mockStatRepo.save.mockResolvedValue({});

      // Act
      const result = await drawingService.create('user-1', 'blot-1', [{ points: [1, 2] }] as any);

      // Assert
      expect(result).toHaveProperty('drawing');
      expect(result).toHaveProperty('newAchievements');
      expect(mockDrawingRepo.save).toHaveBeenCalled();
    });

    it('debe lanzar error si se envía un dibujo vacío (sin líneas)', async () => {
      // Act & Assert
      await expect(
        drawingService.create('user-1', 'blot-1', [])
      ).rejects.toThrow('No puedes enviar un dibujo vacío');
    });
  });

  // ── delete ────────────────────────────────────────────────────────────────

  describe('delete', () => {
    it('debe eliminar un dibujo que le pertenece al usuario', async () => {
      // Arrange
      const fakeDrawing = { id: 'drawing-1', userId: 'user-1' };
      mockDrawingRepo.findOne.mockResolvedValue(fakeDrawing);
      mockForumPostRepo.delete.mockResolvedValue({});
      mockDrawingRepo.remove.mockResolvedValue({});

      // Act
      const result = await drawingService.delete('drawing-1', 'user-1');

      // Assert
      expect(result).toEqual({ deleted: true });
      expect(mockDrawingRepo.remove).toHaveBeenCalledWith(fakeDrawing);
    });

    it('debe lanzar error si el dibujo no existe', async () => {
      // Arrange
      mockDrawingRepo.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        drawingService.delete('drawing-inexistente', 'user-1')
      ).rejects.toThrow('Dibujo no encontrado');
    });

    it('debe lanzar error si el usuario no es el dueño del dibujo', async () => {
      // Arrange
      mockDrawingRepo.findOne.mockResolvedValue({ id: 'drawing-1', userId: 'otro-user' });

      // Act & Assert
      await expect(
        drawingService.delete('drawing-1', 'user-1')
      ).rejects.toThrow('No puedes borrar un dibujo que no es tuyo');
    });
  });

  // ── getAll ────────────────────────────────────────────────────────────────

  describe('getAll', () => {
    it('debe devolver dibujos paginados', async () => {
      // Arrange
      const fakeDrawings = [{ id: 'd1' }, { id: 'd2' }];
      mockDrawingRepo.findAndCount.mockResolvedValue([fakeDrawings, 2]);

      // Act
      const result = await drawingService.getAll(1, 20);

      // Assert
      expect(result.drawings).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
    });
  });

  // ── getById ───────────────────────────────────────────────────────────────

  describe('getById', () => {
    it('debe devolver un dibujo por su ID', async () => {
      // Arrange
      mockDrawingRepo.findOne.mockResolvedValue({ id: 'drawing-1', userId: 'user-1' });

      // Act
      const result = await drawingService.getById('drawing-1');

      // Assert
      expect(result.id).toBe('drawing-1');
    });

    it('debe lanzar error si el dibujo no existe', async () => {
      // Arrange
      mockDrawingRepo.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(drawingService.getById('id-fantasma')).rejects.toThrow('Dibujo no encontrado');
    });
  });
});