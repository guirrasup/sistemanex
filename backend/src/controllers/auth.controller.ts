// backend/src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';

// ============================================================
// TIPAGEM LOCAL DO REQUEST (resolve Problema #1)
// ============================================================

interface RequestComUsuario extends Request {
  user?: {
    id: string;
    email: string;
    empresaId: string;
    perfil?: string;
  };
}

// ============================================================
// CONSTANTES
// ============================================================

const PERFIS_VALIDOS = ['ADMIN', 'FISCAL', 'OPERADOR'] as const;
type PerfilValido = (typeof PERFIS_VALIDOS)[number];

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// ============================================================
// HELPERS DE VALIDAÇÃO
// ============================================================

function isEmailValido(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

function isPerfilValido(perfil: string): perfil is PerfilValido {
  return (PERFIS_VALIDOS as readonly string[]).includes(perfil);
}

// ============================================================
// CONTROLLER
// ============================================================

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async login(req: Request, res: Response) {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        return res.status(400).json({
          sucesso: false,
          erro: 'E-mail e senha são obrigatórios',
        });
      }

      if (!isEmailValido(email)) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Formato de e-mail inválido',
        });
      }

      const resultado = await this.authService.login(email, senha);

      return res.json({
        sucesso: true,
        dados: resultado,
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : '';

      // ✅ Erros de credencial → 401 (esperado)
      if (msg === 'Credenciais inválidas' || msg === 'Usuário inativo. Contate o administrador.') {
        return res.status(401).json({
          sucesso: false,
          erro: msg,
        });
      }

      // ✅ Erros internos (banco, JWT, etc.) → 500 com log real
      console.error('❌ Erro interno no login:', error);
      return res.status(500).json({
        sucesso: false,
        erro: 'Erro interno ao processar login',
      });
    }
  }

  async register(req: RequestComUsuario, res: Response) {
    try {
      const empresaId = req.user?.empresaId;
      const perfilSolicitante = req.user?.perfil;

      if (!empresaId) {
        return res.status(401).json({
          sucesso: false,
          erro: 'Empresa não autenticada',
        });
      }

      // ✅ Dupla checagem de perfil (o middleware também valida)
      if (perfilSolicitante !== 'ADMIN') {
        return res.status(403).json({
          sucesso: false,
          erro: 'Apenas administradores podem cadastrar novos usuários',
        });
      }

      const { nome, email, senha, cargo, perfil } = req.body;

      if (!nome || !email || !senha) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Nome, e-mail e senha são obrigatórios',
        });
      }

      if (!isEmailValido(email)) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Formato de e-mail inválido',
        });
      }

      if (senha.length < 6) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Senha deve ter pelo menos 6 caracteres',
        });
      }

      // ✅ Valida perfil contra o enum (default: OPERADOR)
      const perfilFinal = perfil || 'OPERADOR';
      if (!isPerfilValido(perfilFinal)) {
        return res.status(400).json({
          sucesso: false,
          erro: `Perfil inválido. Use um de: ${PERFIS_VALIDOS.join(', ')}`,
        });
      }

      const usuario = await this.authService.criarUsuario({
        nome,
        email,
        senha,
        cargo,
        perfil: perfilFinal,
        empresaId, // ✅ vem do token, não do body
      });

      return res.status(201).json({
        sucesso: true,
        dados: usuario,
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : '';

      // ✅ Erros de negócio → 400
      if (msg === 'E-mail já cadastrado') {
        return res.status(400).json({
          sucesso: false,
          erro: msg,
        });
      }

      console.error('❌ Erro no registro:', error);
      return res.status(500).json({
        sucesso: false,
        erro: 'Erro interno ao criar usuário',
      });
    }
  }

  async logout(_req: RequestComUsuario, res: Response) {
    return res.json({
      sucesso: true,
      mensagem: 'Logout realizado com sucesso',
    });
  }

  async me(req: RequestComUsuario, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          sucesso: false,
          erro: 'Usuário não autenticado',
        });
      }

      const usuario = await this.authService.buscarUsuarioPorId(userId);

      if (!usuario) {
        return res.status(404).json({
          sucesso: false,
          erro: 'Usuário não encontrado',
        });
      }

      return res.json({
        sucesso: true,
        dados: usuario,
      });
    } catch (error: unknown) {
      console.error('❌ Erro ao buscar usuário logado:', error);
      return res.status(500).json({
        sucesso: false,
        erro: 'Erro interno ao buscar usuário',
      });
    }
  }

  async alterarSenha(req: RequestComUsuario, res: Response) {
    try {
      const { senhaAtual, novaSenha } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          sucesso: false,
          erro: 'Usuário não autenticado',
        });
      }

      if (!senhaAtual || !novaSenha) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Senha atual e nova senha são obrigatórias',
        });
      }

      // ✅ Validação de negócio fica no service (regra única).
      await this.authService.alterarSenha(userId, senhaAtual, novaSenha);

      return res.json({
        sucesso: true,
        mensagem: 'Senha alterada com sucesso',
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : '';

      if (
        msg === 'Senha atual incorreta' ||
        msg === 'Nova senha deve ter pelo menos 6 caracteres' ||
        msg === 'A nova senha deve ser diferente da senha atual' ||
        msg === 'Usuário não encontrado'
      ) {
        return res.status(400).json({
          sucesso: false,
          erro: msg,
        });
      }

      console.error('❌ Erro ao alterar senha:', error);
      return res.status(500).json({
        sucesso: false,
        erro: 'Erro interno ao alterar senha',
      });
    }
  }

  async recuperarSenha(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          sucesso: false,
          erro: 'E-mail é obrigatório',
        });
      }

      if (!isEmailValido(email)) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Formato de e-mail inválido',
        });
      }

      // ✅ Service já é silencioso para e-mail inexistente.
      // ✅ Capturamos erro de "inativo" para não vazar via 400.
      try {
        await this.authService.solicitarRecuperacaoSenha(email);
      } catch (err: unknown) {
        // Log interno, mas resposta genérica pro cliente
        console.warn('⚠️ Falha silenciosa em recuperar-senha:', err instanceof Error ? err.message : err);
      }

      return res.json({
        sucesso: true,
        mensagem:
          'Se o e-mail estiver cadastrado, enviaremos as instruções de recuperação.',
      });
    } catch (error: unknown) {
      console.error('❌ Erro inesperado em recuperar-senha:', error);
      // Mesmo em erro inesperado, resposta genérica
      return res.json({
        sucesso: true,
        mensagem:
          'Se o e-mail estiver cadastrado, enviaremos as instruções de recuperação.',
      });
    }
  }

  async redefinirSenha(req: Request, res: Response) {
    try {
      const { token, novaSenha } = req.body;

      if (!token || !novaSenha) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Token e nova senha são obrigatórios',
        });
      }

      // ✅ Validação de negócio fica no service.
      await this.authService.redefinirSenha(token, novaSenha);

      return res.json({
        sucesso: true,
        mensagem: 'Senha redefinida com sucesso',
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : '';

      if (
        msg === 'Token inválido ou expirado' ||
        msg === 'Token inválido para redefinição de senha' ||
        msg === 'Usuário não encontrado' ||
        msg === 'Usuário inativo' ||
        msg === 'Nova senha deve ter pelo menos 6 caracteres'
      ) {
        return res.status(400).json({
          sucesso: false,
          erro: msg,
        });
      }

      console.error('❌ Erro ao redefinir senha:', error);
      return res.status(500).json({
        sucesso: false,
        erro: 'Erro interno ao redefinir senha',
      });
    }
  }
}