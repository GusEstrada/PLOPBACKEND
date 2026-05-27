import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../models/postgresql/User';
import { DailyBlot } from '../models/postgresql/DailyBlot';
import { Drawing } from '../models/postgresql/Drawing';
import { AvatarConfig } from '../models/postgresql/AvatarConfig';
import { ForumPost } from '../models/postgresql/ForumPost';
import { ForumComment } from '../models/postgresql/ForumComment';
import { Stat } from '../models/postgresql/Stat';
import { env } from './environment';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: env.postgres.host,
  port: env.postgres.port,
  username: env.postgres.username,
  password: env.postgres.password,
  database: env.postgres.database,
  synchronize: env.nodeEnv === 'development',
  logging: env.nodeEnv === 'development',
  ssl: env.nodeEnv !== 'development',
  extra: env.nodeEnv !== 'development'
    ? { ssl: { rejectUnauthorized: false } }
    : undefined,
  entities: [
    User,
    DailyBlot,
    Drawing,
    AvatarConfig,
    ForumPost,
    ForumComment,
    Stat,
  ],
  subscribers: [],
  migrations: [],
});
