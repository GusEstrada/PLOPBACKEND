import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User } from '../models/postgresql/User';
import { AvatarConfig } from '../models/postgresql/AvatarConfig';
import { env } from '../config/environment';
import { logger } from '../utils/logger';

const userRepo = () => AppDataSource.getRepository(User);
const avatarRepo = () => AppDataSource.getRepository(AvatarConfig);

export const authService = {
  async register(name: string, email: string, password: string) {
    const existing = await userRepo().findOne({ where: [{ name }, { email }] });
    if (existing) {
      logger.warn({ email, reason: 'email_or_name_exists' }, 'Registro fallido: el nombre o email ya existe');
      throw new Error('El nombre o email ya está registrado');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = userRepo().create({ name, email, passwordHash });
    await userRepo().save(user);

    const avatar = avatarRepo().create({ userId: user.id });
    await avatarRepo().save(avatar);

    const token = jwt.sign({ userId: user.id }, env.jwt.secret, {
      expiresIn: env.jwt.expiresIn as string as any,
    });

    logger.info({ userId: user.id, email, action: 'register' }, 'Usuario registrado exitosamente');

    return { token, user: { id: user.id, name: user.name, email: user.email } };
  },

  async login(email: string, password: string) {
    const user = await userRepo().findOne({ where: { email } });
    if (!user) {
      logger.warn({ email, reason: 'user_not_found' }, 'Login fallido: email no encontrado');
      throw new Error('Email o contraseña incorrectos');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      logger.warn({ userId: user.id, email, reason: 'wrong_password' }, 'Login fallido: contraseña incorrecta');
      throw new Error('Email o contraseña incorrectos');
    }

    const token = jwt.sign({ userId: user.id }, env.jwt.secret, {
      expiresIn: env.jwt.expiresIn as string as any,
    });

    logger.info({ userId: user.id, email, action: 'login' }, 'Inicio de sesión exitoso');

    return { token, user: { id: user.id, name: user.name, email: user.email } };
  },

  async getMe(userId: string) {
    const user = await userRepo().findOne({
      where: { id: userId },
      relations: ['avatarConfig'],
    });
    if (!user) throw new Error('Usuario no encontrado');
    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  },
};
