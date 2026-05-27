import { Achievement } from '../models/mongodb/Achievement';
import { AppDataSource } from '../config/database';
import { Drawing } from '../models/postgresql/Drawing';

const ACHIEVEMENTS = [
  { code: 'first_drawing', title: 'Primer Trazo', description: 'Dibujaste por primera vez', icon: '🎨' },
  { code: 'week_streak', title: 'Semana de Arte', description: 'Dibujaste 7 días seguidos', icon: '📅' },
  { code: 'ten_drawings', title: 'Dedicatoria', description: 'Completaste 10 dibujos', icon: '✏️' },
  { code: 'popular', title: 'Estrella', description: 'Tu dibujo recibió 10 likes', icon: '⭐' },
  { code: 'forum_regular', title: 'Charlatán', description: 'Publicaste 5 veces en el foro', icon: '💬' },
];

export const achievementService = {
  async checkAndAward(userId: string) {
    const drawingsCount = await AppDataSource.getRepository(Drawing).count({
      where: { userId },
    });

    const newAchievements: string[] = [];

    if (drawingsCount >= 1) {
      const awarded = await this.award(userId, ACHIEVEMENTS[0]);
      if (awarded) newAchievements.push(ACHIEVEMENTS[0].code);
    }
    if (drawingsCount >= 10) {
      const awarded = await this.award(userId, ACHIEVEMENTS[2]);
      if (awarded) newAchievements.push(ACHIEVEMENTS[2].code);
    }

    return newAchievements;
  },

  async award(userId: string, ach: typeof ACHIEVEMENTS[0]) {
    const existing = await Achievement.findOne({ userId, code: ach.code });
    if (existing) return false;

    await new Achievement({ userId, ...ach }).save();
    return true;
  },

  async getUserAchievements(userId: string) {
    return Achievement.find({ userId, order: { unlockedAt: 'DESC' } });
  },
};
