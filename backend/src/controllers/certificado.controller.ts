// backend/src/controllers/certificado.controller.ts
import { Request, Response } from 'express';
import { CertificadoService } from '../services/certificado.service.js';

interface RequestComUsuario extends Request {
  user?: {
    id: string;
    email: string;
    empresaId: string;
    perfil?: string;
  };
}

// 🔥 Limite defensivo: um .pfx real tem no máximo alguns KB/poucas centenas de KB.
const MAX_ARQUIVO_BASE64_LENGTH = 2 * 1024 * 1024; // ~1.5MB decodificado

const PERFIS_AUTORIZADOS = ['ADMIN', 'FISCAL'];

export class CertificadoController {
  private certificadoService: CertificadoService;

  constructor() {
    this.certificadoService = new CertificadoService();
  }

  private validarAcessoEEntrada(req: RequestComUsuario, res: Response): { empresaId: string; arquivoBase64: string; senha: string } | null {
    const empresaId = req.user?.empresaId;
    if (!empresaId) {
      res.status(401).json({ sucesso: false, erro: 'Empresa não autenticada' });
      return null;
    }

    if (req.user?.perfil && !PERFIS_AUTORIZADOS.includes(req.user.perfil)) {
      res.status(403).json({ sucesso: false, erro: 'Apenas ADMIN ou FISCAL podem gerenciar o certificado digital' });
      return null;
    }

    const { arquivoBase64, senha } = req.body;

    if (!arquivoBase64 || typeof arquivoBase64 !== 'string') {
      res.status(400).json({ sucesso: false, erro: 'Arquivo do certificado (arquivoBase64) é obrigatório' });
      return null;
    }

    if (arquivoBase64.length > MAX_ARQUIVO_BASE64_LENGTH) {
      res.status(400).json({ sucesso: false, erro: 'Arquivo de certificado excede o tamanho máximo permitido' });
      return null;
    }

    if (!senha || typeof senha !== 'string') {
      res.status(400).json({ sucesso: false, erro: 'Senha do certificado é obrigatória' });
      return null;
    }

    return { empresaId, arquivoBase64, senha };
  }

  async upload(req: RequestComUsuario, res: Response) {
    try {
      const entrada = this.validarAcessoEEntrada(req, res);
      if (!entrada) return;

      const resultado = await this.certificadoService.processarCertificado(
        entrada.arquivoBase64,
        entrada.senha,
        entrada.empresaId
      );

      if (!resultado.sucesso) {
        return res.status(400).json(resultado);
      }

      return res.status(201).json(resultado);
    } catch (error: unknown) {
      console.error('❌ Erro ao processar certificado:', error);
      return res.status(500).json({
        sucesso: false,
        erro: error instanceof Error ? error.message : 'Erro ao processar certificado'
      });
    }
  }

  async renovar(req: RequestComUsuario, res: Response) {
    try {
      const entrada = this.validarAcessoEEntrada(req, res);
      if (!entrada) return;

      const resultado = await this.certificadoService.renovarCertificado(
        entrada.empresaId,
        entrada.arquivoBase64,
        entrada.senha
      );

      if (!resultado.sucesso) {
        return res.status(400).json(resultado);
      }

      return res.json(resultado);
    } catch (error: unknown) {
      console.error('❌ Erro ao renovar certificado:', error);
      return res.status(500).json({
        sucesso: false,
        erro: error instanceof Error ? error.message : 'Erro ao renovar certificado'
      });
    }
  }

  async status(req: RequestComUsuario, res: Response) {
    try {
      const empresaId = req.user?.empresaId;
      if (!empresaId) {
        return res.status(401).json({ sucesso: false, erro: 'Empresa não autenticada' });
      }

      const certificado = await this.certificadoService.buscarStatus(empresaId);

      if (!certificado) {
        return res.status(404).json({ sucesso: false, erro: 'Nenhum certificado cadastrado para esta empresa' });
      }

      return res.json({ sucesso: true, dados: certificado });
    } catch (error: unknown) {
      console.error('❌ Erro ao buscar status do certificado:', error);
      return res.status(500).json({
        sucesso: false,
        erro: error instanceof Error ? error.message : 'Erro ao buscar status do certificado'
      });
    }
  }
}
