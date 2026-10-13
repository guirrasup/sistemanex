// backend/src/controllers/ocorrencia.controller.ts
// Ocorrências do programa beta (botão flutuante "Reportar problema").
// Quem abriu, de qual empresa e quando vêm SEMPRE do token/servidor — o corpo
// da requisição só traz o relato, a captura de tela e o log do console.
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';

const TIPOS = ['ERRO', 'MELHORIA', 'DUVIDA'];
const GRAVIDADES = ['BAIXA', 'MEDIA', 'ALTA', 'CRITICA'];
const STATUS = ['ABERTA', 'EM_ANALISE', 'RESOLVIDA', 'DESCARTADA'];
const MAX_SCREENSHOT = 4 * 1024 * 1024; // ~4 MB de data URL (a captura já chega reduzida)
const MAX_LOG = 200;

const texto = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

function sanitizarLog(v: unknown) {
  if (!Array.isArray(v)) return undefined;
  return v.slice(-MAX_LOG).map((e) => {
    const o = (e ?? {}) as Record<string, unknown>;
    return {
      nivel: texto(o.nivel, 10),
      quando: texto(o.quando, 40),
      mensagem: texto(o.mensagem, 2000),
    };
  });
}

export class OcorrenciaController {
  criar = async (req: Request, res: Response) => {
    try {
      const b = req.body ?? {};
      const titulo = texto(b.titulo, 140);
      const descricao = texto(b.descricao, 5000);
      if (titulo.length < 3) return res.status(400).json({ sucesso: false, erro: 'Informe um título com pelo menos 3 caracteres.' });
      if (!descricao) return res.status(400).json({ sucesso: false, erro: 'Descreva o que aconteceu.' });

      let screenshot: string | undefined;
      if (typeof b.screenshot === 'string' && b.screenshot) {
        if (!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(b.screenshot)) {
          return res.status(400).json({ sucesso: false, erro: 'Captura de tela em formato inválido.' });
        }
        if (b.screenshot.length > MAX_SCREENSHOT) {
          return res.status(413).json({ sucesso: false, erro: 'Captura de tela grande demais.' });
        }
        screenshot = b.screenshot;
      }

      const usuario = await prisma.usuario.findUnique({ where: { id: req.user!.id }, select: { nome: true, email: true } });

      const ocorrencia = await prisma.ocorrenciaBeta.create({
        data: {
          empresaId: req.user!.empresaId,
          usuarioId: req.user!.id,
          usuarioNome: usuario?.nome ?? req.user!.email,
          usuarioEmail: usuario?.email ?? req.user!.email,
          tipo: TIPOS.includes(b.tipo) ? b.tipo : 'ERRO',
          gravidade: GRAVIDADES.includes(b.gravidade) ? b.gravidade : 'MEDIA',
          titulo,
          descricao,
          tela: texto(b.tela, 80) || null,
          url: texto(b.url, 500) || null,
          navegador: texto(b.navegador, 400) || null,
          resolucao: texto(b.resolucao, 40) || null,
          versaoApp: texto(b.versaoApp, 40) || null,
          screenshot,
          consoleLog: sanitizarLog(b.consoleLog),
        },
        select: { id: true, createdAt: true },
      });

      logger.info(`🐞 Ocorrência beta ${ocorrencia.id} aberta por ${req.user!.email}: ${titulo}`);
      res.status(201).json({ sucesso: true, dados: ocorrencia });
    } catch (error) {
      logger.error('Erro ao registrar ocorrência beta:', error);
      res.status(500).json({ sucesso: false, erro: 'Não foi possível registrar a ocorrência.' });
    }
  };

  // Lista sem a captura de tela (pesada) — ela vem só no detalhe.
  listar = async (req: Request, res: Response) => {
    try {
      const status = typeof req.query.status === 'string' && STATUS.includes(req.query.status) ? req.query.status : undefined;
      const dados = await prisma.ocorrenciaBeta.findMany({
        where: { empresaId: req.user!.empresaId, ...(status ? { status } : {}) },
        orderBy: { createdAt: 'desc' },
        take: 500,
        select: {
          id: true, tipo: true, gravidade: true, titulo: true, status: true, tela: true,
          usuarioNome: true, usuarioEmail: true, createdAt: true, updatedAt: true,
        },
      });
      res.json({ sucesso: true, dados });
    } catch (error) {
      logger.error('Erro ao listar ocorrências beta:', error);
      res.status(500).json({ sucesso: false, erro: 'Não foi possível listar as ocorrências.' });
    }
  };

  obter = async (req: Request, res: Response) => {
    const dados = await prisma.ocorrenciaBeta.findFirst({ where: { id: req.params.id, empresaId: req.user!.empresaId } });
    if (!dados) return res.status(404).json({ sucesso: false, erro: 'Ocorrência não encontrada.' });
    res.json({ sucesso: true, dados });
  };

  alterarStatus = async (req: Request, res: Response) => {
    const status = req.body?.status;
    if (!STATUS.includes(status)) return res.status(400).json({ sucesso: false, erro: 'Status inválido.' });
    const r = await prisma.ocorrenciaBeta.updateMany({ where: { id: req.params.id, empresaId: req.user!.empresaId }, data: { status } });
    if (!r.count) return res.status(404).json({ sucesso: false, erro: 'Ocorrência não encontrada.' });
    res.json({ sucesso: true });
  };
}
