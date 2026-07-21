import { PrismaClient } from '@prisma/client';
import settings from '../settings';

export const prisma = new PrismaClient({
  datasources: {
    db: { url: settings.db.url },
  },
});