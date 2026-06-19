import pino from 'pino';
import path from 'path';
import { env } from '../config/environment';

const targets: pino.TransportTargetOptions[] = [
  {
    target: 'pino/file',
    options: { destination: path.join(__dirname, '../../logs/app.log'), mkdir: true },
    level: 'info',
  },
];

if (env.nodeEnv !== 'production') {
  targets.push({
    target: 'pino-pretty',
    options: { colorize: true, translateTime: 'HH:MM:ss.l', ignore: 'pid,hostname' },
    level: 'debug',
  });
}

export const logger = pino(pino.transport({ targets }));
