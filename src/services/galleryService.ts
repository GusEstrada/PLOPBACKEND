import { GalleryLike } from '../models/mongodb/GalleryLike';
import { AppDataSource } from '../config/database';
import { Drawing } from '../models/postgresql/Drawing';

const drawingRepo = () => AppDataSource.getRepository(Drawing);

export const galleryService = {
  async getFeed(page = 1, limit = 20, date?: string) {
    const where: Record<string, unknown> = {};
    if (date) where['blot.date'] = date;

    const [drawings, total] = await drawingRepo().findAndCount({
      relations: ['user'],
      where: date ? { blot: { date } } as any : undefined,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const drawingsWithLikes = await Promise.all(
      drawings.map(async (d) => {
        const likesCount = await GalleryLike.countDocuments({ drawingId: d.id });
        return { ...d, likesCount };
      })
    );

    return { drawings: drawingsWithLikes, total, page, totalPages: Math.ceil(total / limit) };
  },

  async likeDrawing(userId: string, drawingId: string) {
    const drawing = await drawingRepo().findOne({ where: { id: drawingId } });
    if (!drawing) throw new Error('Dibujo no encontrado');

    const existing = await GalleryLike.findOne({ userId, drawingId });
    if (existing) throw new Error('Ya le diste like a este dibujo');

    await new GalleryLike({ userId, drawingId }).save();
    return { liked: true };
  },

  async unlikeDrawing(userId: string, drawingId: string) {
    const result = await GalleryLike.deleteOne({ userId, drawingId });
    if (result.deletedCount === 0) throw new Error('No habías dado like');
    return { liked: false };
  },

  async getLikesCount(drawingId: string) {
    return GalleryLike.countDocuments({ drawingId });
  },
};
