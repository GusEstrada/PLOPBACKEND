import { AppDataSource } from './config/database';
import { DailyBlot } from './models/postgresql/DailyBlot';
import fs from 'fs';
import path from 'path';

async function seedBlots() {
  await AppDataSource.initialize();
  const blotRepo = AppDataSource.getRepository(DailyBlot);

  const dir = path.resolve('uploads/blots');
  const files = fs.readdirSync(dir)
    .filter(f => /\.(png|jpg|jpeg|svg)$/i.test(f))
    .sort((a, b) => {
      const na = parseInt(a.match(/\d+/)?.[0] || '0');
      const nb = parseInt(b.match(/\d+/)?.[0] || '0');
      return na - nb;
    });

  const today = new Date();
  today.setDate(today.getDate() + 1);
  let count = 0;

  for (const file of files) {
    const date = new Date(today);
    date.setDate(date.getDate() + count);
    const dateStr = date.toISOString().split('T')[0];

    let blot = await blotRepo.findOne({ where: { date: dateStr } });
    if (blot && blot.imageUrl) {
      console.log(`Ya tiene imagen para ${dateStr}, la salto`);
      count++;
      continue;
    }

    if (blot) {
      blot.imageUrl = `/uploads/blots/${file}`;
      await blotRepo.save(blot);
    } else {
      blot = blotRepo.create({
        date: dateStr,
        imageUrl: `/uploads/blots/${file}`,
      });
      await blotRepo.save(blot);
    }
    console.log(`Creada mancha para ${dateStr} → ${file}`);
    count++;
  }

  console.log(`Listo. ${count} manchas registradas.`);
  await AppDataSource.destroy();
}

seedBlots().catch(err => {
  console.error(err);
  process.exit(1);
});
