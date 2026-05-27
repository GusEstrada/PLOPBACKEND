import { AppDataSource } from '../config/database';
import { DailyBlot } from '../models/postgresql/DailyBlot';

const blotRepo = () => AppDataSource.getRepository(DailyBlot);

export const blotService = {
  async getToday() {
    const today = new Date().toISOString().split('T')[0];
    let blot = await blotRepo().findOne({ where: { date: today } });
    if (!blot) {
      blot = blotRepo().create({ date: today });
      await blotRepo().save(blot);
    }
    return blot;
  },

  async getByDate(date: string) {
    const blot = await blotRepo().findOne({ where: { date } });
    if (!blot) throw new Error('No hay mancha para esta fecha');
    return blot;
  },

  async create(date: string, imageUrl?: string, mainBlot?: number[], satellites?: { x: number; y: number; r: number }[]) {
    const existing = await blotRepo().findOne({ where: { date } });
    if (existing) throw new Error('Ya existe una mancha para esta fecha');

    const blot = blotRepo().create({ date, imageUrl, mainBlot, satellites });
    await blotRepo().save(blot);
    return blot;
  },
};
