// C:\emissornfe\backend\src\repositories\usuario.repository.ts

import { Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository';

export class UsuarioRepository extends BaseRepository {
  /**
   * Busca usuário por ID
   */
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

  /**
   * Busca usuário por email
   */
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

  /**
   * Busca usuário por email com dados da empresa (para login)
   */
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

  /**
   * Lista todos os usuários de uma empresa
   */
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

  /**
   * Lista todos os usuários ativos de uma empresa
   */
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
      orderBy: { nome: 'asc' }
    });
  }

  /**
   * Cria um novo usuário
   */
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

  /**
   * Atualiza um usuário
   */
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

  /**
   * Atualiza o último login do usuário
   */
  async updateUltimoLogin(id: string) {
    return this.prisma.usuario.update({
      where: { id },
      data: { ultimoLogin: new Date() }
    });
  }

  /**
   * Atualiza a senha do usuário
   */
  async updateSenha(id: string, novaSenhaHash: string) {
    return this.prisma.usuario.update({
      where: { id },
      data: { senhaHash: novaSenhaHash }
    });
  }

  /**
   * Ativa/Desativa um usuário
   */
  async toggleAtivo(id: string, ativo: boolean) {
    return this.prisma.usuario.update({
      where: { id },
      data: { ativo }
    });
  }

  /**
   * Verifica se um email já está cadastrado (exceto o próprio usuário)
   */
  async emailExists(email: string, excludeId?: string) {
    const where: any = { email };
    if (excludeId) {
      where.id = { not: excludeId };
    }
    const count = await this.prisma.usuario.count({ where });
    return count > 0;
  }

  /**
   * Busca usuários por nome ou email (pesquisa)
   */
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

  /**
   * Deleta um usuário (apenas se não for o único admin)
   */
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

  /**
   * Conta usuários por perfil em uma empresa
   */
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