// src/repositories/empresa.repository.ts
import { Prisma } from '@prisma/client'
import { BaseRepository } from './base.repository'

export class EmpresaRepository extends BaseRepository {
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