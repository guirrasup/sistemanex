// src/repositories/base.repository.ts
import { PrismaClient } from '@prisma/client';
import { prisma } from '../lib/prisma';

export abstract class BaseRepository {
  protected prisma: PrismaClient;

  constructor() {
    // Usa a instância singleton (nunca cria novo PrismaClient)
    this.prisma = prisma;
  }

  async transaction<T>(fn: (prisma: PrismaClient) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(fn);
  }

  // Não precisa mais de disconnect manual por repositório
}