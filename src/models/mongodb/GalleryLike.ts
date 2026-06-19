import mongoose, { Schema, Document } from 'mongoose';

export interface IGalleryLike extends Document {
  userId: string;
  drawingId: string;
  createdAt: Date;
}

const GalleryLikeSchema = new Schema<IGalleryLike>({
  userId: { type: String, required: true },
  drawingId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

GalleryLikeSchema.index({ userId: 1, drawingId: 1 }, { unique: true });

export const GalleryLike = mongoose.model<IGalleryLike>('GalleryLike', GalleryLikeSchema);
