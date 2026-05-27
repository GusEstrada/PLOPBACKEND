import mongoose, { Schema, Document } from 'mongoose';

export interface IAchievement extends Document {
  userId: string;
  code: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
}

const AchievementSchema = new Schema<IAchievement>({
  userId: { type: String, required: true, index: true },
  code: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, default: '🏆' },
  unlockedAt: { type: Date, default: Date.now },
});

AchievementSchema.index({ userId: 1, code: 1 }, { unique: true });

export const Achievement = mongoose.model<IAchievement>('Achievement', AchievementSchema);
