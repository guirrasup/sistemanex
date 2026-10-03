// backend/src/repositories/empresa.repository.ts
import { Prisma } from '@prisma/client'
import { BaseRepository } from './base.repository.js'

export type CampoNumeracao =
  | 'proximoNumeroNfe'
  | 'proximoNumeroNfce'
  | 'proximoNumeroCte'
  | 'proximoNumeroMdfe'
  | 'proximoNumeroNfse'
  | 'proximoNumeroNfae'

export class EmpresaRepository extends BaseRepository {
  // Reserva o próximo número do documento de forma atômica: o incremento é um
  // único UPDATE (a linha fica travada durante ele), então duas emissões
  // simultâneas nunca recebem o mesmo número — o antigo "ler o contador e
  // gravar +1 depois" deixava as duas lerem o mesmo valor. Se a emissão falhar
  // depois da reserva, o número fica sem uso e deve ser inutilizado.
  async reservarNumero(id: string, campo: CampoNumeracao): Promise<number> {
    const empresa = await this.prisma.empresa.update({
      where: { id },
      data: { [campo]: { increment: 1 } } as Prisma.EmpresaUpdateInput,
      select: { [campo]: true } as Prisma.EmpresaSelect,
    })
    return (empresa as unknown as Record<CampoNumeracao, number>)[campo] - 1
  }

  async findById(id: string) {
    return this.prisma.empresa.findUnique({
      where: { id },
      include: {
        endereco: true,
        certificado: true
      }
    })
  }

  async findByCnpj(cnpj: string) {
    return this.prisma.empresa.findUnique({
      where: { cnpj },
      include: {
        endereco: true,
        certificado: true
      }
    })
  }

  async updateNumeroNfe(id: string, novoNumero: number) {
    return this.prisma.empresa.update({
      where: { id },
      data: { proximoNumeroNfe: novoNumero }
    })
  }

  async updateNumeroNfse(id: string, novoNumero: number) {
    return this.prisma.empresa.update({
      where: { id },
      data: { proximoNumeroNfse: novoNumero }
    })
  }

  async update(id: string, data: Prisma.EmpresaUpdateInput) {
    return this.prisma.empresa.update({
      where: { id },
      data,
      include: {
        endereco: true,
        certificado: true
      }
    })
  }

  async getConfiguracaoCompleta(id: string) {
    return this.prisma.empresa.findUnique({
      where: { id },
      include: {
        endereco: true,
        certificado: true,
        produtos: {
          where: { ativo: true },
          take: 10
        },
        servicos: {
          where: { ativo: true },
          take: 10
        }
      }
    })
  }
}