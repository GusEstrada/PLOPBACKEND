import 'reflect-metadata';
import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { AppDataSource } from './config/database';
import { connectMongo } from './config/mongo';
import { env } from './config/environment';
import { errorHandler } from './middleware/errorHandler';

import authRoutes from './routes/auth';
import blotRoutes from './routes/blot';
import drawingRoutes from './routes/drawings';
import galleryRoutes from './routes/gallery';
import profileRoutes from './routes/profile';
import statsRoutes from './routes/stats';
import forumRoutes from './routes/forum';
import uploadRoutes from './routes/upload';
import avatarCatalogRoutes from './routes/avatarCatalog';

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: env.cors.origin, credentials: true }));
app.use(express.json({ limit: '5mb' }));
app.use('/uploads', express.static(path.join(__dirname, '..', env.upload.dir)));

app.use('/api/auth', authRoutes);
app.use('/api/blot', blotRoutes);
app.use('/api/drawings', drawingRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/avatar-catalog', avatarCatalogRoutes);

app.use(errorHandler);

async function start() {
  try {
    await AppDataSource.initialize();
    console.log('PostgreSQL conectado');
    await connectMongo();
    console.log('MongoDB conectado');

    app.listen(env.port, () => {
      console.log(`Servidor corriendo en http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error('Error al iniciar:', error);
    process.exit(1);
  }
}

start();
