import { GalleryLike } from '../models/mongodb/GalleryLike';
import { Achievement, IAchievement } from '../models/mongodb/Achievement';
import { AppDataSource } from '../config/database';
import { In } from 'typeorm';
import { Drawing } from '../models/postgresql/Drawing';
import { ForumPost } from '../models/postgresql/ForumPost';
import { ForumComment } from '../models/postgresql/ForumComment';

const ACHIEVEMENTS = [
  { code: 'first_drawing', title: 'Primer Trazo', description: 'Dibujaste por primera vez', iconUrl: '/uploads/achievements/first_drawing.png' },
  { code: 'first_like', title: 'Primer Like', description: 'Diste tu primer like', iconUrl: '/uploads/achievements/first_like.png' },
  { code: 'first_comment', title: 'Primer Comentario', description: 'Comentaste por primera vez', iconUrl: '/uploads/achievements/first_comment.png' },
];

export const achievementService = {
  async checkAndAwardAll(userId: string) {
    const [drawingsCount, likesCount, commentsCount] = await Promise.all([
      AppDataSource.getRepository(Drawing).count({ where: { userId } }),
      GalleryLike.countDocuments({ userId }),
      (async () => {
        const posts = await AppDataSource.getRepository(ForumPost).find({ where: { userId } });
        const postIds = posts.map(p => p.id);
        if (postIds.length === 0) return 0;
        return AppDataSource.getRepository(ForumComment).count({ where: { postId: In(postIds) } });
      })(),
    ]);

    const newAchievements: IAchievement[] = [];

    if (drawingsCount >= 1) {
      const a = await this.award(userId, ACHIEVEMENTS[0]);
      if (a) newAchievements.push(a);
    }
    if (likesCount >= 1) {
      const a = await this.award(userId, ACHIEVEMENTS[1]);
      if (a) newAchievements.push(a);
    }
    if (commentsCount >= 1) {
      const a = await this.award(userId, ACHIEVEMENTS[2]);
      if (a) newAchievements.push(a);
    }

    return newAchievements;
  },

  async award(userId: string, ach: typeof ACHIEVEMENTS[0]) {
    const existing = await Achievement.findOne({ userId, code: ach.code });
    if (existing) return null;

    const doc = await new Achievement({ userId, ...ach }).save();
    return doc;
  },

  async getUserAchievements(userId: string) {
    const docs = await Achievement.find({ userId }).sort({ unlockedAt: -1 });
    const achMap = new Map(ACHIEVEMENTS.map(a => [a.code, a]));
    for (const d of docs) {
      const ach = achMap.get(d.code);
      if (ach && !d.iconUrl) {
        d.iconUrl = ach.iconUrl;
        await d.save();
      }
    }
    return docs;
  },
};
