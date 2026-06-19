import { AppDataSource } from '../config/database';
import { Stat } from '../models/postgresql/Stat';
import { User } from '../models/postgresql/User';
import { Drawing } from '../models/postgresql/Drawing';
import { MoreThan } from 'typeorm';

export const statsService = {
  async getStats() {
    const totalUsers = await AppDataSource.getRepository(User).count();
    const totalDrawings = await AppDataSource.getRepository(Drawing).count();

    const today = new Date().toISOString().split('T')[0];
    const todayStart = new Date(`${today}T00:00:00Z`);
    const todayDrawings = await AppDataSource.getRepository(Drawing).count({
      where: { createdAt: MoreThan(todayStart) },
    });

    const firstDrawing = await AppDataSource.getRepository(Drawing).find({
      order: { createdAt: 'ASC' },
      take: 1,
    });
    const daysActive = firstDrawing.length > 0
      ? Math.max(1, Math.floor(Math.abs(Date.now() - firstDrawing[0].createdAt.getTime()) / 86400000))
      : 1;

    return {
      totalDrawings,
      todayDrawings,
      totalUsers,
      daysActive,
    };
  },
};
