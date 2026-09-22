// backend/src/repositories/mdfe.component.repository.ts
import { Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository.js';

export class MdfeComponentRepository extends BaseRepository {

  // ============================================================
  // MUNICÍPIOS DE CARREGAMENTO
  // ============================================================

  async createMunCarrega(data: Prisma.MunCarregaMDFeCreateInput) {
    return this.prisma.munCarregaMDFe.create({ data });
  }

  async createManyMunCarrega(data: Prisma.MunCarregaMDFeCreateManyInput[]) {
    return this.prisma.munCarregaMDFe.createMany({ data });
  }

  async deleteMunCarregaByMdfeId(mdfeId: string) {
    return this.prisma.munCarregaMDFe.deleteMany({ where: { mdfeId } });
  }

  // ============================================================
  // PERCURSOS
  // ============================================================

  async createPercurso(data: Prisma.PercursoMDFeCreateInput) {
    return this.prisma.percursoMDFe.create({ data });
  }

  async createManyPercurso(data: Prisma.PercursoMDFeCreateManyInput[]) {
    return this.prisma.percursoMDFe.createMany({ data });
  }

  async deletePercursoByMdfeId(mdfeId: string) {
    return this.prisma.percursoMDFe.deleteMany({ where: { mdfeId } });
  }

  // ============================================================
  // MUNICÍPIOS DE DESCARGA
  // ============================================================

  async createMunDescarga(data: Prisma.MunDescargaMDFeUncheckedCreateInput) {
    return this.prisma.munDescargaMDFe.create({ data });
  }

  async deleteMunDescargaByMdfeId(mdfeId: string) {
    return this.prisma.munDescargaMDFe.deleteMany({ where: { mdfeId } });
  }

  // ============================================================
  // CT-e NO MDF-e
  // ============================================================

  async createCTe(data: Prisma.MDFeCTeUncheckedCreateInput) {
    return this.prisma.mDFeCTe.create({ data });
  }

  async createManyCTe(data: Prisma.MDFeCTeCreateManyInput[]) {
    return this.prisma.mDFeCTe.createMany({ data });
  }

  async deleteCTeByMunDescargaId(munDescargaId: string) {
    return this.prisma.mDFeCTe.deleteMany({ where: { munDescargaId } });
  }

  // ============================================================
  // NF-e NO MDF-e
  // ============================================================

  async createNFe(data: Prisma.MDFeNFeUncheckedCreateInput) {
    return this.prisma.mDFeNFe.create({ data });
  }

  async createManyNFe(data: Prisma.MDFeNFeCreateManyInput[]) {
    return this.prisma.mDFeNFe.createMany({ data });
  }

  async deleteNFeByMunDescargaId(munDescargaId: string) {
    return this.prisma.mDFeNFe.deleteMany({ where: { munDescargaId } });
  }

  // ============================================================
  // MDF-e NO MDF-e (Aquaviário)
  // ============================================================

  async createMDFeTransp(data: Prisma.MDFeMDFeTranspUncheckedCreateInput) {
    return this.prisma.mDFeMDFeTransp.create({ data });
  }

  async createManyMDFeTransp(data: Prisma.MDFeMDFeTranspCreateManyInput[]) {
    return this.prisma.mDFeMDFeTransp.createMany({ data });
  }

  async deleteMDFeTranspByMunDescargaId(munDescargaId: string) {
    return this.prisma.mDFeMDFeTransp.deleteMany({ where: { munDescargaId } });
  }

  // ============================================================
  // UNIDADES DE TRANSPORTE
  // ============================================================

  async createUnidadeTransp(data: Prisma.MDFeUnidadeTranspUncheckedCreateInput) {
    return this.prisma.mDFeUnidadeTransp.create({ data });
  }

  async createManyUnidadeTransp(data: Prisma.MDFeUnidadeTranspCreateManyInput[]) {
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

  async createUnidadeCarga(data: Prisma.MDFeUnidadeCargaUncheckedCreateInput) {
    return this.prisma.mDFeUnidadeCarga.create({ data });
  }

  async createManyUnidadeCarga(data: Prisma.MDFeUnidadeCargaCreateManyInput[]) {
    return this.prisma.mDFeUnidadeCarga.createMany({ data });
  }

  async deleteUnidadeCargaByUnidadeTranspId(unidadeTranspId: string) {
    return this.prisma.mDFeUnidadeCarga.deleteMany({ where: { unidadeTranspId } });
  }

  // ============================================================
  // LACRES
  // ============================================================

  async createLacreUnidade(data: Prisma.MDFeLacreUnidadeUncheckedCreateInput) {
    return this.prisma.mDFeLacreUnidade.create({ data });
  }

  async createManyLacreUnidade(data: Prisma.MDFeLacreUnidadeCreateManyInput[]) {
    return this.prisma.mDFeLacreUnidade.createMany({ data });
  }

  async deleteLacreUnidadeByUnidadeTranspId(unidadeTranspId: string) {
    return this.prisma.mDFeLacreUnidade.deleteMany({ where: { unidadeTranspId } });
  }

  async createLacreUnidadeCarga(data: Prisma.MDFeLacreUnidadeCargaUncheckedCreateInput) {
    return this.prisma.mDFeLacreUnidadeCarga.create({ data });
  }

  async createManyLacreUnidadeCarga(data: Prisma.MDFeLacreUnidadeCargaCreateManyInput[]) {
    return this.prisma.mDFeLacreUnidadeCarga.createMany({ data });
  }

  async deleteLacreUnidadeCargaByUnidadeCargaId(unidadeCargaId: string) {
    return this.prisma.mDFeLacreUnidadeCarga.deleteMany({ where: { unidadeCargaId } });
  }

  // ============================================================
  // PRODUTOS PERIGOSOS
  // ============================================================

  async createPerigoso(data: Prisma.MDFePerigosoUncheckedCreateInput) {
    return this.prisma.mDFePerigoso.create({ data });
  }

  async createManyPerigoso(data: Prisma.MDFePerigosoCreateManyInput[]) {
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

  async createNFePrestParcial(data: Prisma.MDFeNFePrestParcialUncheckedCreateInput) {
    return this.prisma.mDFeNFePrestParcial.create({ data });
  }

  async createManyNFePrestParcial(data: Prisma.MDFeNFePrestParcialCreateManyInput[]) {
    return this.prisma.mDFeNFePrestParcial.createMany({ data });
  }

  async deleteNFePrestParcialByCTeId(cteId: string) {
    return this.prisma.mDFeNFePrestParcial.deleteMany({ where: { cteId } });
  }

  // ============================================================
  // SEGUROS
  // ============================================================

  async createSeguro(data: Prisma.SeguroMDFeUncheckedCreateInput) {
    return this.prisma.seguroMDFe.create({ data });
  }

  async createManySeguro(data: Prisma.SeguroMDFeCreateManyInput[]) {
    return this.prisma.seguroMDFe.createMany({ data });
  }

  async deleteSeguroByMdfeId(mdfeId: string) {
    return this.prisma.seguroMDFe.deleteMany({ where: { mdfeId } });
  }

  // ============================================================
  // LACRES DO MDF-e
  // ============================================================

  async createLacre(data: Prisma.LacreMDFeUncheckedCreateInput) {
    return this.prisma.lacreMDFe.create({ data });
  }

  async createManyLacre(data: Prisma.LacreMDFeCreateManyInput[]) {
    return this.prisma.lacreMDFe.createMany({ data });
  }

  async deleteLacreByMdfeId(mdfeId: string) {
    return this.prisma.lacreMDFe.deleteMany({ where: { mdfeId } });
  }

  // ============================================================
  // AUTORIZADOS DOWNLOAD
  // ============================================================

  async createAutXML(data: Prisma.AutXMLMDFeUncheckedCreateInput) {
    return this.prisma.autXMLMDFe.create({ data });
  }

  async createManyAutXML(data: Prisma.AutXMLMDFeCreateManyInput[]) {
    return this.prisma.autXMLMDFe.createMany({ data });
  }

  async deleteAutXMLByMdfeId(mdfeId: string) {
    return this.prisma.autXMLMDFe.deleteMany({ where: { mdfeId } });
  }

  // ============================================================
  // HISTÓRICO DE STATUS
  // ============================================================

  async createHistoricoStatus(data: Prisma.HistoricoStatusMDFeUncheckedCreateInput) {
    return this.prisma.historicoStatusMDFe.create({ data });
  }

  // ============================================================
  // ENCERRAMENTO
  // ============================================================

  async createEncerramento(data: Prisma.EncerramentoMDFeUncheckedCreateInput) {
    return this.prisma.encerramentoMDFe.create({ data });
  }

  async findEncerramentoByMdfeId(mdfeId: string) {
    return this.prisma.encerramentoMDFe.findUnique({
      where: { mdfeId }
    });
  }
}