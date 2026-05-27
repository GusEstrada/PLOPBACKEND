import { Response } from 'express';
import fs from 'fs';
import path from 'path';
import { AuthRequest } from '../middleware/auth';
import { env } from '../config/environment';

const AVATAR_DIR = path.join(env.upload.dir, 'avatars');

type AvatarItem = {
  type: 'head' | 'eyes' | 'mouth' | 'acc';
  label: string;
  url: string;
};

export const avatarCatalogController = {
  async list(_req: AuthRequest, res: Response) {
    const dir = path.resolve(AVATAR_DIR);

    if (!fs.existsSync(dir)) {
      res.json({ items: [] });
      return;
    }

    const files = fs.readdirSync(dir).filter((f) => /\.(svg|png|jpg|jpeg)$/i.test(f));

    const items: AvatarItem[] = files.map((f) => {
      const name = path.parse(f).name.toLowerCase();
      let type: AvatarItem['type'] = 'head';
      if (name.startsWith('eyes')) type = 'eyes';
      else if (name.startsWith('mouth')) type = 'mouth';
      else if (name.startsWith('acc')) type = 'acc';

      const label = name.replace(/^(head|eyes|mouth|acc)_/, '').replace(/[-_]/g, ' ');
      return { type, label, url: `/uploads/avatars/${f}` };
    });

    res.json({ items });
  },
};
