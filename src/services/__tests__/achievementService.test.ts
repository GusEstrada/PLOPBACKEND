import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks (usando vi.hoisted para que estén disponibles en las factories) ─────

const mockDrawingRepo = vi.hoisted(() => ({ count: vi.fn() }));
const mockForumPostRepo = vi.hoisted(() => ({ find: vi.fn() }));
const mockForumCommentRepo = vi.hoisted(() => ({ count: vi.fn() }));
const mockGalleryLikeCountDocuments = vi.hoisted(() => vi.fn());
const mockAchFindOne = vi.hoisted(() => vi.fn());
const mockAchFind = vi.hoisted(() => vi.fn());
const mockAchSave = vi.hoisted(() => vi.fn());
const MockAchievementConstructor = vi.hoisted(() => function (this: any, data: any) {
  Object.assign(this, data);
  this.save = vi.fn().mockResolvedValue(this);
});

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

vi.mock('../../models/mongodb/GalleryLike', () => ({
  GalleryLike: {
    countDocuments: mockGalleryLikeCountDocuments,
  },
}));

vi.mock('../../models/mongodb/Achievement', () => ({
  Achievement: Object.assign(MockAchievementConstructor, {
    findOne: mockAchFindOne,
    find: mockAchFind,
  }),
}));

// ── Import después de los mocks ───────────────────────────────────────────────

import { achievementService } from '../achievementService';

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('achievementService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkAndAwardAll', () => {
    it('debe otorgar first_drawing, first_like y first_comment cuando cumple todas', async () => {
      mockDrawingRepo.count.mockResolvedValue(1);
      mockGalleryLikeCountDocuments.mockResolvedValue(1);
      mockForumPostRepo.find.mockResolvedValue([{ id: 'post-1' }]);
      mockForumCommentRepo.count.mockResolvedValue(1);
      mockAchFindOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      const result = await achievementService.checkAndAwardAll('user-1');

      expect(result).toHaveLength(3);
      expect(result[0].code).toBe('first_drawing');
      expect(result[1].code).toBe('first_like');
      expect(result[2].code).toBe('first_comment');
    });

    it('debe otorgar solo first_drawing si no hay likes ni comments', async () => {
      mockDrawingRepo.count.mockResolvedValue(1);
      mockGalleryLikeCountDocuments.mockResolvedValue(0);
      mockAchFindOne.mockResolvedValueOnce(null);
      mockForumPostRepo.find.mockResolvedValue([]);

      const result = await achievementService.checkAndAwardAll('user-1');

      expect(result).toHaveLength(1);
      expect(result[0].code).toBe('first_drawing');
    });

    it('debe devolver arreglo vacío si no cumple ningún requisito', async () => {
      mockDrawingRepo.count.mockResolvedValue(0);

      const result = await achievementService.checkAndAwardAll('user-1');

      expect(result).toEqual([]);
    });

    it('debe omitir logros ya otorgados', async () => {
      mockDrawingRepo.count.mockResolvedValue(1);
      mockGalleryLikeCountDocuments.mockResolvedValue(1);
      mockForumPostRepo.find.mockResolvedValue([{ id: 'post-1' }]);
      mockForumCommentRepo.count.mockResolvedValue(1);
      mockAchFindOne.mockResolvedValueOnce({ code: 'first_drawing' });
      mockAchFindOne.mockResolvedValueOnce({ code: 'first_like' });
      mockAchFindOne.mockResolvedValueOnce(null);

      const result = await achievementService.checkAndAwardAll('user-1');

      expect(result).toHaveLength(1);
      expect(result[0].code).toBe('first_comment');
    });
  });

  describe('award', () => {
    it('debe crear un nuevo logro si no existe', async () => {
      mockAchFindOne.mockResolvedValue(null);

      const result = await achievementService.award('user-1', {
        code: 'first_drawing',
        title: 'Primer Trazo',
        description: 'Dibujaste por primera vez',
        iconUrl: '/uploads/achievements/first_drawing.png',
      });

      expect(result).not.toBeNull();
      expect(result!.code).toBe('first_drawing');
    });

    it('debe devolver null si el logro ya fue otorgado', async () => {
      mockAchFindOne.mockResolvedValue({ code: 'first_drawing' });

      const result = await achievementService.award('user-1', {
        code: 'first_drawing',
        title: 'Primer Trazo',
        description: 'Dibujaste por primera vez',
        iconUrl: '/uploads/achievements/first_drawing.png',
      });

      expect(result).toBeNull();
    });
  });

  describe('getUserAchievements', () => {
    it('debe devolver los logros ordenados del más reciente al más antiguo', async () => {
      const fakeAchievements = [
        { userId: 'user-1', code: 'first_drawing', iconUrl: '', unlockedAt: new Date('2026-01-02'), save: vi.fn() },
        { userId: 'user-1', code: 'first_like', iconUrl: '', unlockedAt: new Date('2026-01-01'), save: vi.fn() },
      ];
      mockAchFind.mockReturnValue({
        sort: vi.fn().mockResolvedValue(fakeAchievements),
      });

      const result = await achievementService.getUserAchievements('user-1');

      expect(result).toHaveLength(2);
      expect(mockAchFind).toHaveBeenCalledWith({ userId: 'user-1' });
    });

    it('debe rellenar iconUrl si está vacío', async () => {
      const fakeDoc = {
        userId: 'user-1',
        code: 'first_drawing',
        title: 'Primer Trazo',
        description: 'Dibujaste por primera vez',
        iconUrl: '',
        unlockedAt: new Date(),
        save: vi.fn().mockResolvedValue({}),
      };
      mockAchFind.mockReturnValue({
        sort: vi.fn().mockResolvedValue([fakeDoc]),
      });

      const result = await achievementService.getUserAchievements('user-1');

      expect(result[0].iconUrl).toBe('/uploads/achievements/first_drawing.png');
      expect(fakeDoc.save).toHaveBeenCalled();
    });
  });
});
