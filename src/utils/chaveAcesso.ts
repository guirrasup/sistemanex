// src/utils/chaveAcesso.ts
import { limparDocumento } from './cpfCnpjValidator';

export function calcularDVMod11NFe(chave43: string): number {
  let soma = 0;
  let peso = 2;
  for (let i = chave43.length - 1; i >= 0; i--) {
    soma += parseInt(chave43.charAt(i), 10) * peso;
    peso++;
    if (peso > 9) peso = 2;
  }
  const resto = soma % 11;
  const dv = 11 - resto;
  if (dv === 0 || dv === 10 || dv === 11) return 0;
  return dv;
}

export function gerarChaveAcessoNFe(params: {
  codigoUf: string;
  anoMes: string;
  cnpjEmitente: string;
  modelo: string;
  serie: number;
  numero: number;
  tipoEmissao: number;
  codigoNumerico?: string;
}): { chaveCompleta: string; codigoNumerico: string; dv: number } {
  const cUF = params.codigoUf.padStart(2, '0');
  const aamm = params.anoMes;
  const cnpj = limparDocumento(params.cnpjEmitente).padStart(14, '0');
  const mod = params.modelo.padStart(2, '0');
  const serie = params.serie.toString().padStart(3, '0');
  const nNF = params.numero.toString().padStart(9, '0');
  const tpEmis = params.tipoEmissao.toString();
  const cNF = params.codigoNumerico || Math.floor(10000000 + Math.random() * 90000000).toString();

  const chave43 = `${cUF}${aamm}${cnpj}${mod}${serie}${nNF}${tpEmis}${cNF}`;
  const cDV = calcularDVMod11NFe(chave43);
  const chaveCompleta = `${chave43}${cDV}`;

  return { chaveCompleta, codigoNumerico: cNF, dv: cDV };
}

export function gerarChaveAcessoNFSe(params: {
  codigoMunicipioIBGE: string;
  ambienteGerador: number;
  tipoInscricao: 1 | 2;
  documentoEmitente: string;
  numeroNfse: number;
  anoMesDPS: string;
  codigoNumerico?: string;
}): { chaveCompleta: string; idNfse: string; codigoVerificacao: string } {
  const codMun = params.codigoMunicipioIBGE.padStart(7, '0');
  const ambGer = params.ambienteGerador.toString();
  const tipoInsc = params.tipoInscricao.toString();
  const doc = limparDocumento(params.documentoEmitente).padStart(14, '0');
  const nNFSe = params.numeroNfse.toString().padStart(13, '0');
  const anoMes = params.anoMesDPS;
  const codNum = params.codigoNumerico || Math.floor(100000000 + Math.random() * 900000000).toString();

  const rawString = `${codMun}${ambGer}${tipoInsc}${doc}${nNFSe}${anoMes}${codNum}`;
  let soma = 0;
  let peso = 2;
  for (let i = rawString.length - 1; i >= 0; i--) {
    const digit = parseInt(rawString.charAt(i), 10);
    if (!isNaN(digit)) {
      soma += digit * peso;
      peso++;
      if (peso > 9) peso = 2;
    }
  }
  const dv = (11 - (soma % 11)) % 10;
  const chaveCompleta = `${codMun}${ambGer}${tipoInsc}${doc}${nNFSe}${anoMes}${codNum}${dv}`;
  const idNfse = `NFS${chaveCompleta}`;

  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let codVerif = '';
  for (let i = 0; i < 8; i++) {
    if (i === 4) codVerif += '-';
    codVerif += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return { chaveCompleta, idNfse, codigoVerificacao: codVerif };
}

export function formatarChaveAcesso44(chave: string): string {
  const limpa = chave.replace(/\D/g, '');
  return limpa.replace(/(\d{4})/g, '$1 ').trim();
}