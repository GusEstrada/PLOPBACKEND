import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalytics extends Document {
  event: string;
  page: string;
  userId?: string;
  metadata: Record<string, unknown>;
  timestamp: Date;
}

const AnalyticsSchema = new Schema<IAnalytics>({
  event: { type: String, required: true, index: true },
  page: { type: String, required: true },
  userId: { type: String, index: true },
  metadata: { type: Schema.Types.Mixed, default: {} },
  timestamp: { type: Date, default: Date.now, index: true },
});

export const Analytics = mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);
