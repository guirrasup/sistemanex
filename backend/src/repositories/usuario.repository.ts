// backend/src/repositories/usuario.repository.ts
import { Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository.js';

export class UsuarioRepository extends BaseRepository {
  async findById(id: string) {
    return this.prisma.usuario.findUnique({
      where: { id },
      include: {
        empresa: {
          include: {
            endereco: true,
            certificado: true
          }
        }
      }
    });
  }

  async findByEmail(email: string) {
    return this.prisma.usuario.findUnique({
      where: { email },
      include: {
        empresa: {
          include: {
            endereco: true,
            certificado: true
          }
        }
      }
    });
  }

  async findByEmailComEmpresa(email: string) {
    return this.prisma.usuario.findUnique({
      where: { email },
      include: {
        empresa: {
          include: {
            endereco: true,
            certificado: true
          }
        }
      }
    });
  }

  async findAllByEmpresa(empresaId: string, page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.usuario.findMany({
        where: { empresaId },
        select: {
          id: true,
          nome: true,
          email: true,
          cargo: true,
          perfil: true,
          ativo: true,
          ultimoLogin: true,
          createdAt: true,
          updatedAt: true,
        },
        skip,
        take: limit,
        orderBy: { nome: 'asc' }
      }),
      this.prisma.usuario.count({ where: { empresaId } })
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findAtivosByEmpresa(empresaId: string) {
    return this.prisma.usuario.findMany({
      where: {
        empresaId,
        ativo: true
      },
      select: {
        id: true,
        nome: true,
        email: true,
        cargo: true,
        perfil: true,
      },
      take: 500,
      orderBy: { nome: 'asc' }
    });
  }

  async create(data: Prisma.UsuarioCreateInput) {
    return this.prisma.usuario.create({
      data,
      include: {
        empresa: {
          include: {
            endereco: true,
            certificado: true
          }
        }
      }
    });
  }

  async update(id: string, data: Prisma.UsuarioUpdateInput) {
    return this.prisma.usuario.update({
      where: { id },
      data,
      include: {
        empresa: {
          include: {
            endereco: true,
            certificado: true
          }
        }
      }
    });
  }

  async updateUltimoLogin(id: string) {
    return this.prisma.usuario.update({
      where: { id },
      data: { ultimoLogin: new Date() }
    });
  }

  async updateSenha(id: string, novaSenhaHash: string) {
    return this.prisma.usuario.update({
      where: { id },
      data: { senhaHash: novaSenhaHash }
    });
  }

  async toggleAtivo(id: string, ativo: boolean) {
    return this.prisma.usuario.update({
      where: { id },
      data: { ativo }
    });
  }

  async emailExists(email: string, excludeId?: string) {
    const where: Prisma.UsuarioWhereInput = { email };
    if (excludeId) {
      where.id = { not: excludeId };
    }
    const count = await this.prisma.usuario.count({ where });
    return count > 0;
  }

  async search(empresaId: string, term: string) {
    return this.prisma.usuario.findMany({
      where: {
        empresaId,
        OR: [
          { nome: { contains: term, mode: 'insensitive' } },
          { email: { contains: term, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        nome: true,
        email: true,
        cargo: true,
        perfil: true,
        ativo: true,
        ultimoLogin: true,
      },
      take: 20
    });
  }

  async delete(id: string, empresaId: string) {
    // Verifica se é o último admin da empresa
    const admins = await this.prisma.usuario.count({
      where: {
        empresaId,
        perfil: 'ADMIN',
        ativo: true
      }
    });

    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      select: { perfil: true }
    });

    if (usuario?.perfil === 'ADMIN' && admins <= 1) {
      throw new Error('Não é possível deletar o único administrador da empresa.');
    }

    return this.prisma.usuario.delete({
      where: { id }
    });
  }

  async countByPerfil(empresaId: string) {
    const result = await this.prisma.usuario.groupBy({
      by: ['perfil'],
      where: { empresaId },
      _count: true
    });

    return result.reduce((acc, item) => {
      acc[item.perfil] = item._count;
      return acc;
    }, {} as Record<string, number>);
  }
}