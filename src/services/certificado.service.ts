// src/services/certificado.service.ts
import api from './api';
import { CertificadoDigitalInfo, ConfiguracaoEmpresa } from '../types/erp';

export interface UploadCertificadoResultado {
  sucesso: boolean;
  mensagem: string;
  certificado?: CertificadoDigitalInfo;
  empresa?: Partial<ConfiguracaoEmpresa>;
}

function arquivoParaBase64(arquivo: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const resultado = reader.result as string;
      // FileReader.readAsDataURL devolve "data:<mime>;base64,<conteudo>" — o
      // backend espera só o conteúdo base64 puro.
      const base64 = resultado.split(',')[1] || '';
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Falha ao ler o arquivo do certificado.'));
    reader.readAsDataURL(arquivo);
  });
}

export const certificadoService = {
  /**
   * Envia o certificado A1 (.pfx/.p12) e a senha para o backend, que o
   * criptografa (AES-256-GCM) e armazena vinculado à empresa autenticada.
   * É esse certificado — e não o processamento local no navegador — que é
   * usado para assinar e transmitir documentos fiscais de verdade à SEFAZ.
   */
  async upload(arquivo: File, senha: string): Promise<UploadCertificadoResultado> {
    const arquivoBase64 = await arquivoParaBase64(arquivo);
    const response = await api.post('/certificado/upload', { arquivoBase64, senha });
    return response.data;
  },

  async renovar(arquivo: File, senha: string): Promise<UploadCertificadoResultado> {
    const arquivoBase64 = await arquivoParaBase64(arquivo);
    const response = await api.post('/certificado/renovar', { arquivoBase64, senha });
    return response.data;
  },

  /** Busca o status do certificado já armazenado no servidor (sem os segredos). */
  async status(): Promise<CertificadoDigitalInfo | null> {
    try {
      const response = await api.get('/certificado/status');
      return response.data?.dados ?? null;
    } catch (error: any) {
      if (error?.response?.status === 404) return null;
      throw error;
    }
  },
};
