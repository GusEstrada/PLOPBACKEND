import mongoose from 'mongoose';
import { env } from './environment';

export async function connectMongo(): Promise<void> {
  await mongoose.connect(env.mongo.uri);
}
