// src/repositories/mdfe.component.repository.ts

import { BaseRepository } from './base.repository';

export class MdfeComponentRepository extends BaseRepository {

  // ============================================================
  // MUNICÍPIOS DE CARREGAMENTO
  // ============================================================

  async createMunCarrega(data: any) {
    return this.prisma.munCarregaMDFe.create({ data });
  }

  async createManyMunCarrega(data: any[]) {
    return this.prisma.munCarregaMDFe.createMany({ data });
  }

  async deleteMunCarregaByMdfeId(mdfeId: string) {
    return this.prisma.munCarregaMDFe.deleteMany({ where: { mdfeId } });
  }

  // ============================================================
  // PERCURSOS
  // ============================================================

  async createPercurso(data: any) {
    return this.prisma.percursoMDFe.create({ data });
  }

  async createManyPercurso(data: any[]) {
    return this.prisma.percursoMDFe.createMany({ data });
  }

  async deletePercursoByMdfeId(mdfeId: string) {
    return this.prisma.percursoMDFe.deleteMany({ where: { mdfeId } });
  }

  // ============================================================
  // MUNICÍPIOS DE DESCARGA
  // ============================================================

  async createMunDescarga(data: any) {
    return this.prisma.munDescargaMDFe.create({ data });
  }

  async deleteMunDescargaByMdfeId(mdfeId: string) {
    return this.prisma.munDescargaMDFe.deleteMany({ where: { mdfeId } });
  }

  // ============================================================
  // CT-e NO MDF-e
  // ============================================================

  async createCTe(data: any) {
    return this.prisma.mDFeCTe.create({ data });
  }

  async createManyCTe(data: any[]) {
    return this.prisma.mDFeCTe.createMany({ data });
  }

  async deleteCTeByMunDescargaId(munDescargaId: string) {
    return this.prisma.mDFeCTe.deleteMany({ where: { munDescargaId } });
  }

  // ============================================================
  // NF-e NO MDF-e
  // ============================================================

  async createNFe(data: any) {
    return this.prisma.mDFeNFe.create({ data });
  }

  async createManyNFe(data: any[]) {
    return this.prisma.mDFeNFe.createMany({ data });
  }

  async deleteNFeByMunDescargaId(munDescargaId: string) {
    return this.prisma.mDFeNFe.deleteMany({ where: { munDescargaId } });
  }

  // ============================================================
  // MDF-e NO MDF-e (Aquaviário)
  // ============================================================

  async createMDFeTransp(data: any) {
    return this.prisma.mDFeMDFeTransp.create({ data });
  }

  async createManyMDFeTransp(data: any[]) {
    return this.prisma.mDFeMDFeTransp.createMany({ data });
  }

  async deleteMDFeTranspByMunDescargaId(munDescargaId: string) {
    return this.prisma.mDFeMDFeTransp.deleteMany({ where: { munDescargaId } });
  }

  // ============================================================
  // UNIDADES DE TRANSPORTE
  // ============================================================

  async createUnidadeTransp(data: any) {
    return this.prisma.mDFeUnidadeTransp.create({ data });
  }

  async createManyUnidadeTransp(data: any[]) {
    return this.prisma.mDFeUnidadeTransp.createMany({ data });
  }

  async deleteUnidadeTranspByCTeId(cteId: string) {
    return this.prisma.mDFeUnidadeTransp.deleteMany({ where: { cteId } });
  }

  async deleteUnidadeTranspByNFeId(nfeId: string) {
    return this.prisma.mDFeUnidadeTransp.deleteMany({ where: { nfeId } });
  }

  async deleteUnidadeTranspByMDFeTranspId(mdfeTranspId: string) {
    return this.prisma.mDFeUnidadeTransp.deleteMany({ where: { mdfeTranspId } });
  }

  // ============================================================
  // UNIDADES DE CARGA
  // ============================================================

  async createUnidadeCarga(data: any) {
    return this.prisma.mDFeUnidadeCarga.create({ data });
  }

  async createManyUnidadeCarga(data: any[]) {
    return this.prisma.mDFeUnidadeCarga.createMany({ data });
  }

  async deleteUnidadeCargaByUnidadeTranspId(unidadeTranspId: string) {
    return this.prisma.mDFeUnidadeCarga.deleteMany({ where: { unidadeTranspId } });
  }

  // ============================================================
  // LACRES
  // ============================================================

  async createLacreUnidade(data: any) {
    return this.prisma.mDFeLacreUnidade.create({ data });
  }

  async createManyLacreUnidade(data: any[]) {
    return this.prisma.mDFeLacreUnidade.createMany({ data });
  }

  async deleteLacreUnidadeByUnidadeTranspId(unidadeTranspId: string) {
    return this.prisma.mDFeLacreUnidade.deleteMany({ where: { unidadeTranspId } });
  }

  async createLacreUnidadeCarga(data: any) {
    return this.prisma.mDFeLacreUnidadeCarga.create({ data });
  }

  async createManyLacreUnidadeCarga(data: any[]) {
    return this.prisma.mDFeLacreUnidadeCarga.createMany({ data });
  }

  async deleteLacreUnidadeCargaByUnidadeCargaId(unidadeCargaId: string) {
    return this.prisma.mDFeLacreUnidadeCarga.deleteMany({ where: { unidadeCargaId } });
  }

  // ============================================================
  // PRODUTOS PERIGOSOS
  // ============================================================

  async createPerigoso(data: any) {
    return this.prisma.mDFePerigoso.create({ data });
  }

  async createManyPerigoso(data: any[]) {
    return this.prisma.mDFePerigoso.createMany({ data });
  }

  async deletePerigosoByCTeId(cteId: string) {
    return this.prisma.mDFePerigoso.deleteMany({ where: { cteId } });
  }

  async deletePerigosoByNFeId(nfeId: string) {
    return this.prisma.mDFePerigoso.deleteMany({ where: { nfeId } });
  }

  async deletePerigosoByMDFeTranspId(mdfeTranspId: string) {
    return this.prisma.mDFePerigoso.deleteMany({ where: { mdfeTranspId } });
  }

  // ============================================================
  // NF-e PRESTAÇÃO PARCIAL
  // ============================================================

  async createNFePrestParcial(data: any) {
    return this.prisma.mDFeNFePrestParcial.create({ data });
  }

  async createManyNFePrestParcial(data: any[]) {
    return this.prisma.mDFeNFePrestParcial.createMany({ data });
  }

  async deleteNFePrestParcialByCTeId(cteId: string) {
    return this.prisma.mDFeNFePrestParcial.deleteMany({ where: { cteId } });
  }

  // ============================================================
  // SEGUROS
  // ============================================================

  async createSeguro(data: any) {
    return this.prisma.seguroMDFe.create({ data });
  }

  async createManySeguro(data: any[]) {
    return this.prisma.seguroMDFe.createMany({ data });
  }

  async deleteSeguroByMdfeId(mdfeId: string) {
    return this.prisma.seguroMDFe.deleteMany({ where: { mdfeId } });
  }

  // ============================================================
  // LACRES DO MDF-e
  // ============================================================

  async createLacre(data: any) {
    return this.prisma.lacreMDFe.create({ data });
  }

  async createManyLacre(data: any[]) {
    return this.prisma.lacreMDFe.createMany({ data });
  }

  async deleteLacreByMdfeId(mdfeId: string) {
    return this.prisma.lacreMDFe.deleteMany({ where: { mdfeId } });
  }

  // ============================================================
  // AUTORIZADOS DOWNLOAD
  // ============================================================

  async createAutXML(data: any) {
    return this.prisma.autXMLMDFe.create({ data });
  }

  async createManyAutXML(data: any[]) {
    return this.prisma.autXMLMDFe.createMany({ data });
  }

  async deleteAutXMLByMdfeId(mdfeId: string) {
    return this.prisma.autXMLMDFe.deleteMany({ where: { mdfeId } });
  }

  // ============================================================
  // HISTÓRICO DE STATUS
  // ============================================================

  async createHistoricoStatus(data: any) {
    return this.prisma.historicoStatusMDFe.create({ data });
  }

  // ============================================================
  // ENCERRAMENTO
  // ============================================================

  async createEncerramento(data: any) {
    return this.prisma.encerramentoMDFe.create({ data });
  }

  async findEncerramentoByMdfeId(mdfeId: string) {
    return this.prisma.encerramentoMDFe.findUnique({
      where: { mdfeId }
    });
  }
}