import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId: string;
  type: 'like' | 'comment' | 'forum' | 'achievement' | 'follow';
  message: string;
  read: boolean;
  relatedId?: string;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  userId: { type: String, required: true, index: true },
  type: {
    type: String,
    enum: ['like', 'comment', 'forum', 'achievement', 'follow'],
    required: true,
  },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  relatedId: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
