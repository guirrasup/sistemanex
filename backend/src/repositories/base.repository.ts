// backend/src/repositories/base.repository.ts
import { Prisma, PrismaClient } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

export abstract class BaseRepository {
  protected prisma: PrismaClient;

  constructor() {
    // Usa a instância singleton (nunca cria novo PrismaClient)
    this.prisma = prisma;
  }

  async transaction<T>(fn: (prisma: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(fn);
  }

  // Não precisa mais de disconnect manual por repositório
}