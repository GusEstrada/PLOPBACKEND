import mongoose, { Schema, Document } from 'mongoose';

export interface IStroke {
  id: number;
  points: number[];
  color: string;
  size: number;
}

export interface IDrawingSession extends Document {
  userId: string;
  blotId: string;
  strokes: IStroke[];
  lastActive: Date;
  createdAt: Date;
}

const DrawingSessionSchema = new Schema<IDrawingSession>({
  userId: { type: String, required: true, index: true },
  blotId: { type: String, required: true },
  strokes: [
    {
      id: Number,
      points: [Number],
      color: String,
      size: Number,
    },
  ],
  lastActive: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

export const DrawingSession = mongoose.model<IDrawingSession>('DrawingSession', DrawingSessionSchema);
