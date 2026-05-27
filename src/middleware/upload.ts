import path from 'path';
import multer from 'multer';
import { v4 as uuid } from 'uuid';
import { env } from '../config/environment';

const storage = (subdir: string) =>
  multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, path.join(env.upload.dir, subdir));
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${uuid()}${ext}`);
    },
  });

const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowed = ['.svg', '.png', '.jpg', '.jpeg'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Formato no permitido. Usa SVG, PNG o JPG.'));
  }
};

const limits = { fileSize: env.upload.maxFileSize };

export const uploadAvatar = multer({ storage: storage('avatars'), fileFilter, limits });
export const uploadBlot = multer({ storage: storage('blots'), fileFilter, limits });
