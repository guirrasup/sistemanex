// backend/src/repositories/cliente.repository.ts
import { Prisma, TipoCliente } from '@prisma/client'
import { BaseRepository } from './base.repository.js'

export class ClienteRepository extends BaseRepository {
  async findById(id: string, empresaId?: string) {
    return this.prisma.cliente.findFirst({
      where: empresaId ? { id, empresaId } : { id },
      include: {
        endereco: true
      }
    })
  }

  async findByDocumento(documento: string, empresaId?: string) {
    return this.prisma.cliente.findFirst({
      where: empresaId ? { documento, empresaId } : { documento },
      include: {
        endereco: true
      }
    })
  }

  async findAll(empresaId: string, page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit
    const [data, total] = await Promise.all([
      this.prisma.cliente.findMany({
        where: { empresaId },
        include: { endereco: true },
        skip,
        take: limit,
        orderBy: { razaoSocial: 'asc' }
      }),
      this.prisma.cliente.count({ where: { empresaId } })
    ])

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async search(empresaId: string, term: string) {
    return this.prisma.cliente.findMany({
      where: {
        empresaId,
        OR: [
          { razaoSocial: { contains: term, mode: 'insensitive' } },
          { documento: { contains: term } },
          { nomeFantasia: { contains: term, mode: 'insensitive' } }
        ]
      },
      include: { endereco: true },
      take: 20
    })
  }

  async findByTipo(empresaId: string, tipo: string) {
    return this.prisma.cliente.findMany({
      where: {
        empresaId,
        tipo: tipo as TipoCliente
      },
      include: { endereco: true },
      take: 500,
      orderBy: { razaoSocial: 'asc' }
    })
  }

  async create(data: Prisma.ClienteCreateInput) {
    return this.prisma.cliente.create({
      data,
      include: { endereco: true }
    })
  }

  // 🔥 CORREÇÃO: UPDATE COM ENDERECO
  async update(id: string, data: Record<string, unknown>) {
    // 🔥 SEPARA ENDERECO DO RESTO
    const { endereco, ...clienteData } = data;

    // 🔥 PREPARA OS DADOS DO CLIENTE
    const updateData: Prisma.ClienteUpdateInput = {
      ...(clienteData as Prisma.ClienteUpdateInput),
    };

    // 🔥 SE TIVER ENDERECO, ATUALIZA OU CRIA
    if (endereco) {
      // O branch "create" do upsert (usado quando o cliente ainda não tem um
      // endereço vinculado) exige todos os campos obrigatórios do Endereco,
      // inclusive codigoUF (código IBGE de 2 dígitos da UF) — que o formulário
      // de Cliente/Fornecedor nunca coleta. Derivado dos 2 primeiros dígitos
      // de codigoMunicipio (código IBGE de 7 dígitos), mesma técnica usada no
      // criar() do controller. .trim() porque codigoMunicipio pode ter vindo
      // de uma leitura anterior de uma coluna Char() do Postgres, que
      // preenche com espaço à direita valores mais curtos que o tamanho fixo.
      const e = endereco as Record<string, unknown>;
      const enderecoCompleto = !e.codigoUF && typeof e.codigoMunicipio === 'string' && e.codigoMunicipio.trim().length >= 2
        ? { ...e, codigoUF: e.codigoMunicipio.trim().slice(0, 2) }
        : e;

      updateData.endereco = {
        upsert: {
          create: enderecoCompleto as Prisma.EnderecoCreateWithoutClienteInput,
          update: enderecoCompleto as Prisma.EnderecoUpdateWithoutClienteInput
        }
      };
    }

    return this.prisma.cliente.update({
      where: { id },
      data: updateData,
      include: { endereco: true }
    })
  }

  async delete(id: string) {
    // Verifica se o cliente tem notas vinculadas
    const hasNotas = await this.prisma.nFe.count({
      where: { destinatarioId: id }
    })

    if (hasNotas > 0) {
      throw new Error('Cliente possui notas fiscais vinculadas. Não pode ser excluído.')
    }

    return this.prisma.cliente.delete({
      where: { id }
    })
  }
}