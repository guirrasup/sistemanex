// C:\emissornfe\src\utils\consultaCnpjApi.ts

import { limparDocumento } from './cpfCnpjValidator';
import { consultarCnpjOpen, OpenCnpjConsultaResultado } from '../services/openCnpj.service';

// 🔥 RE-EXPORTA O TIPO PARA COMPATIBILIDADE
export type { OpenCnpjConsultaResultado as ConsultaCnpjResponse };

/**
 * 🔥 CONSULTA CNPJ VIA OPENCNPJ (API PÚBLICA)
 * 
 * Vantagens da OpenCNPJ:
 * - Não requer autenticação (sem tokens)
 * - Suporte a CNPJs alfanuméricos
 * - Múltiplos datasets (Receita, RNTRC, CNO, CEIS, CNEP)
 * - Mais rápida e confiável
 * 
 * @param cnpj - CNPJ com ou sem máscara
 * @param datasets - Arrays de datasets opcionais (ex: ['receita', 'rntrc'])
 * @returns Dados da consulta
 */
export async function consultarCnpjConectaGov(
  cnpj: string, 
  datasets: string[] = ['receita']
): Promise<OpenCnpjConsultaResultado> {
  return consultarCnpjOpen(cnpj, datasets);
}

/**
 * 🔥 CONSULTA CNPJ APENAS RECEITA FEDERAL (MAIS RÁPIDO)
 */
export async function consultarCnpjReceita(cnpj: string): Promise<OpenCnpjConsultaResultado> {
  return consultarCnpjOpen(cnpj, ['receita']);
}

/**
 * 🔥 CONSULTA CNPJ COM RNTRC (PARA TRANSPORTADORAS)
 */
export async function consultarCnpjComRntrc(cnpj: string): Promise<OpenCnpjConsultaResultado> {
  return consultarCnpjOpen(cnpj, ['receita', 'rntrc']);
}

/**
 * 🔥 CONSULTA CNPJ COMPLETA (TODOS OS DATASETS DISPONÍVEIS)
 */
export async function consultarCnpjCompleto(cnpj: string): Promise<OpenCnpjConsultaResultado> {
  return consultarCnpjOpen(cnpj, ['receita', 'rntrc', 'cno', 'ceis', 'cnep']);
}

// 🔥 MANTÉM COMPATIBILIDADE COM O CÓDIGO EXISTENTE
export type { OpenCnpjConsultaResultado };