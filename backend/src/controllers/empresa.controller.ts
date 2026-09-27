// backend/src/controllers/empresa.controller.ts
import { Request, Response } from 'express';
import { EmpresaRepository } from '../repositories/empresa.repository.js';
import { mapEmpresaParaResposta, mapAtualizacaoParaEmpresa, type AtualizarEmpresaInput } from '../utils/empresaMappers.js';

interface RequestComUsuario extends Request {
  user?: {
    id: string;
    email: string;
    empresaId: string;
    perfil?: string;
  };
}

const PERFIS_AUTORIZADOS_ATUALIZAR = ['ADMIN'];

export class EmpresaController {
  private empresaRepo: EmpresaRepository;

  constructor() {
    this.empresaRepo = new EmpresaRepository();
  }

  async me(req: RequestComUsuario, res: Response) {
    try {
      const empresaId = req.user?.empresaId;
      if (!empresaId) {
        return res.status(401).json({ sucesso: false, erro: 'Empresa não autenticada' });
      }

      const empresa = await this.empresaRepo.findById(empresaId);
      if (!empresa) {
        return res.status(404).json({ sucesso: false, erro: 'Empresa não encontrada' });
      }

      return res.json({ sucesso: true, dados: mapEmpresaParaResposta(empresa) });
    } catch (error: unknown) {
      console.error('❌ Erro ao buscar empresa:', error);
      return res.status(500).json({
        sucesso: false,
        erro: error instanceof Error ? error.message : 'Erro ao buscar empresa',
      });
    }
  }

  async atualizar(req: RequestComUsuario, res: Response) {
    try {
      const empresaId = req.user?.empresaId;
      if (!empresaId) {
        return res.status(401).json({ sucesso: false, erro: 'Empresa não autenticada' });
      }

      if (req.user?.perfil && !PERFIS_AUTORIZADOS_ATUALIZAR.includes(req.user.perfil)) {
        return res.status(403).json({ sucesso: false, erro: 'Apenas ADMIN pode atualizar os dados cadastrais da empresa' });
      }

      const entrada = req.body as AtualizarEmpresaInput;
      const dadosAtualizacao = mapAtualizacaoParaEmpresa(entrada);

      // 🔥 Os campos "Próximo Número" (NF-e/NFS-e/NFC-e/CT-e/NFA-e) são
      // contadores que o próprio backend incrementa a cada emissão — não um
      // dado cadastral estático. A tela de Configurações os carrega uma vez
      // e os mantém no state do formulário; se o usuário emitir notas em
      // outra aba/sessão enquanto essa tela ainda está aberta e depois salvar
      // qualquer outro campo (ex.: dados do contador), o valor desatualizado
      // no formulário sobrescrevia o contador real, silenciosamente
      // "voltando no tempo" pra um número já emitido — e a próxima emissão
      // colidiria com uma NF-e/NFC-e/etc já autorizada (rejeição por
      // duplicidade). Nunca aceita um valor menor que o já gravado.
      const camposNumeracao = [
        'proximoNumeroNfe',
        'proximoNumeroNfse',
        'proximoNumeroNfce',
        'proximoNumeroCte',
        'proximoNumeroNfae',
        'proximoNumeroMdfe',
      ] as const;

      const temCampoNumeracao = camposNumeracao.some((campo) => dadosAtualizacao[campo] !== undefined);
      if (temCampoNumeracao) {
        const empresaAtual = await this.empresaRepo.findById(empresaId);
        if (empresaAtual) {
          for (const campo of camposNumeracao) {
            const novoValor = dadosAtualizacao[campo];
            const valorAtual = empresaAtual[campo];
            if (typeof novoValor === 'number' && typeof valorAtual === 'number' && novoValor < valorAtual) {
              console.warn(`⚠️ Ignorado retrocesso de ${campo}: formulário enviou ${novoValor}, mantido ${valorAtual}`);
              delete dadosAtualizacao[campo];
            }
          }
        }
      }

      const empresaAtualizada = await this.empresaRepo.update(empresaId, dadosAtualizacao);

      return res.json({ sucesso: true, dados: mapEmpresaParaResposta(empresaAtualizada) });
    } catch (error: unknown) {
      console.error('❌ Erro ao atualizar empresa:', error);
      return res.status(500).json({
        sucesso: false,
        erro: error instanceof Error ? error.message : 'Erro ao atualizar empresa',
      });
    }
  }
}
