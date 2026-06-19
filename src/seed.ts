import 'reflect-metadata';
import { AppDataSource } from './config/database';
import { connectMongo } from './config/mongo';
import { User } from './models/postgresql/User';
import { DailyBlot } from './models/postgresql/DailyBlot';
import { AvatarConfig } from './models/postgresql/AvatarConfig';
import { Stat } from './models/postgresql/Stat';
import bcrypt from 'bcryptjs';

async function seed() {
  await AppDataSource.initialize();
  await connectMongo();
  console.log('Bases de datos conectadas');

  const userRepo = AppDataSource.getRepository(User);
  const blotRepo = AppDataSource.getRepository(DailyBlot);
  const avatarRepo = AppDataSource.getRepository(AvatarConfig);
  const statRepo = AppDataSource.getRepository(Stat);

  const adminExists = await userRepo.findOne({ where: { email: 'admin@plop.app' } });
  if (!adminExists) {
    const hash = await bcrypt.hash('plop123', 10);
    const admin = userRepo.create({
      name: 'admin',
      email: 'admin@plop.app',
      passwordHash: hash,
      bio: 'Creador de PLOP',
    });
    await userRepo.save(admin);

    const avatar = avatarRepo.create({ userId: admin.id });
    await avatarRepo.save(avatar);
    console.log('Admin creado: admin@plop.app / plop123');
  }

  const blotCount = await blotRepo.count();
  if (blotCount === 0) {
    const blots = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const seed = i + 1;

      const mainBlot = generateBlotPoints(seed);
      const satellites = generateSatellites(seed);

      blots.push(blotRepo.create({ date: dateStr, mainBlot, satellites }));
    }
    await blotRepo.save(blots);
    console.log(`${blots.length} manchas diarias creadas`);
  }

  const statCount = await statRepo.count();
  if (statCount === 0) {
    const stat = statRepo.create({
      date: new Date().toISOString().split('T')[0],
      totalDrawings: 0,
      todayDrawings: 0,
      totalUsers: 1,
    });
    await statRepo.save(stat);
    console.log('Estadística inicial creada');
  }

  console.log('Seed completado');
  process.exit(0);
}

function generateBlotPoints(seed: number): number[] {
  const rng = mulberry32(seed);
  const points: number[] = [];
  const numPoints = 64;
  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * Math.PI * 2;
    const radius = 100 + (rng() - 0.5) * 80;
    points.push(Math.cos(angle) * radius);
    points.push(Math.sin(angle) * radius);
  }
  return points;
}

function generateSatellites(seed: number): { x: number; y: number; r: number }[] {
  const rng = mulberry32(seed + 100);
  const satellites = [];
  const count = 5 + Math.floor(rng() * 5);
  for (let i = 0; i < count; i++) {
    satellites.push({
      x: (rng() - 0.5) * 300,
      y: (rng() - 0.5) * 300,
      r: 5 + rng() * 25,
    });
  }
  return satellites;
}

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
