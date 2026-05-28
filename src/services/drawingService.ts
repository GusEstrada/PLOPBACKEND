import { AppDataSource } from '../config/database';
import { Drawing, LineData } from '../models/postgresql/Drawing';
import { ForumPost } from '../models/postgresql/ForumPost';
import { Stat } from '../models/postgresql/Stat';
import { User } from '../models/postgresql/User';
import { achievementService } from './achievementService';

const drawingRepo = () => AppDataSource.getRepository(Drawing);

export const drawingService = {
  async create(userId: string, blotId: string, lines: LineData[]) {
    if (lines.length === 0) throw new Error('No puedes enviar un dibujo vacío');
    const drawing = drawingRepo().create({ userId, blotId, lines });
    await drawingRepo().save(drawing);

    const user = await AppDataSource.getRepository(User).findOne({ where: { id: userId } });
    if (user) {
      const postRepo = AppDataSource.getRepository(ForumPost);
      const post = postRepo.create({
        userId,
        drawingId: drawing.id,
        title: `Dibujo de ${user.name}`,
        content: '',
      });
      await postRepo.save(post);
    }

    const today = new Date().toISOString().split('T')[0];
    const statRepo = AppDataSource.getRepository(Stat);
    const existing = await statRepo.findOne({ where: { date: today } });
    if (existing) {
      existing.totalDrawings += 1;
      existing.todayDrawings += 1;
      await statRepo.save(existing);
    } else {
      await statRepo.save(statRepo.create({
        date: today,
        totalDrawings: 1,
        todayDrawings: 1,
        totalUsers: await AppDataSource.getRepository(User).count({ where: {} }),
      }));
    }

    await achievementService.checkAndAward(userId);

    return drawing;
  },

  async delete(id: string, userId: string) {
    const drawing = await drawingRepo().findOne({ where: { id } });
    if (!drawing) throw new Error('Dibujo no encontrado');
    if (drawing.userId !== userId) throw new Error('No puedes borrar un dibujo que no es tuyo');

    await AppDataSource.getRepository(ForumPost).delete({ drawingId: id });
    await drawingRepo().remove(drawing);
    return { deleted: true };
  },

  async getAll(page = 1, limit = 20) {
    const [drawings, total] = await drawingRepo().findAndCount({
      relations: ['user', 'blot'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { drawings, total, page, totalPages: Math.ceil(total / limit) };
  },

  async getById(id: string) {
    const drawing = await drawingRepo().findOne({
      where: { id },
      relations: ['user', 'blot'],
    });
    if (!drawing) throw new Error('Dibujo no encontrado');
    return drawing;
  },

  async getByUser(userId: string) {
    return drawingRepo().find({
      where: { userId },
      relations: ['blot'],
      order: { createdAt: 'DESC' },
    });
  },
};
