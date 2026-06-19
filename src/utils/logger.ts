import pino from 'pino';
import path from 'path';
import { env } from '../config/environment';

const targets: pino.TransportTargetOptions[] = [];

if (env.nodeEnv === 'production') {
  targets.push(
    {
      target: 'pino-roll',
      options: {
        file: path.join(__dirname, '../../logs/app.log'),
        frequency: 'daily',
        mkdir: true,
        size: '10M',
        maxFiles: env.logRetentionDays,
      },
      level: 'info',
    },
    { target: 'pino/file', options: {}, level: 'info' },
  );
} else {
  targets.push({
    target: 'pino-pretty',
    options: { colorize: true, translateTime: 'HH:MM:ss.l', ignore: 'pid,hostname' },
    level: 'debug',
  });
}

export const logger = pino(pino.transport({ targets }));
