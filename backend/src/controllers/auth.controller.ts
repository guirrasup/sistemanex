// C:\emissornfe\backend\src\controllers\auth.controller.ts

import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * 🔥 LOGIN DO USUÁRIO
   * POST /api/auth/login
   */
  async login(req: Request, res: Response) {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        return res.status(400).json({
          sucesso: false,
          erro: 'E-mail e senha são obrigatórios'
        });
      }

      const resultado = await this.authService.login(email, senha);

      return res.json({
        sucesso: true,
        dados: resultado
      });

    } catch (error: any) {
      console.error('Erro no login:', error);
      return res.status(401).json({
        sucesso: false,
        erro: error.message || 'Credenciais inválidas'
      });
    }
  }

  /**
   * 🔥 REGISTRO DE NOVO USUÁRIO
   * POST /api/auth/register
   */
  async register(req: Request, res: Response) {
    try {
      const { nome, email, senha, cargo, perfil, empresaId } = req.body;

      if (!nome || !email || !senha || !empresaId) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Nome, e-mail, senha e empresa são obrigatórios'
        });
      }

      const usuario = await this.authService.criarUsuario({
        nome,
        email,
        senha,
        cargo,
        perfil: perfil || 'OPERADOR',
        empresaId
      });

      return res.status(201).json({
        sucesso: true,
        dados: usuario
      });

    } catch (error: any) {
      console.error('Erro no registro:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error.message || 'Erro ao criar usuário'
      });
    }
  }

  /**
   * 🔥 LOGOUT
   * POST /api/auth/logout
   */
  async logout(req: Request, res: Response) {
    try {
      // O logout é gerenciado pelo frontend (remover token)
      return res.json({
        sucesso: true,
        mensagem: 'Logout realizado com sucesso'
      });
    } catch (error: any) {
      return res.status(500).json({
        sucesso: false,
        erro: error.message || 'Erro ao fazer logout'
      });
    }
  }

  /**
   * 🔥 DADOS DO USUÁRIO LOGADO
   * GET /api/auth/me
   */
  async me(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          sucesso: false,
          erro: 'Usuário não autenticado'
        });
      }

      const usuario = await this.authService.buscarUsuarioPorId(userId);

      if (!usuario) {
        return res.status(404).json({
          sucesso: false,
          erro: 'Usuário não encontrado'
        });
      }

      return res.json({
        sucesso: true,
        dados: usuario
      });

    } catch (error: any) {
      return res.status(500).json({
        sucesso: false,
        erro: error.message || 'Erro ao buscar usuário'
      });
    }
  }

  /**
   * 🔥 ALTERAR SENHA
   * PUT /api/auth/alterar-senha
   */
  async alterarSenha(req: Request, res: Response) {
    try {
      const { senhaAtual, novaSenha } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          sucesso: false,
          erro: 'Usuário não autenticado'
        });
      }

      if (!senhaAtual || !novaSenha) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Senha atual e nova senha são obrigatórias'
        });
      }

      if (novaSenha.length < 6) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Nova senha deve ter pelo menos 6 caracteres'
        });
      }

      await this.authService.alterarSenha(userId, senhaAtual, novaSenha);

      return res.json({
        sucesso: true,
        mensagem: 'Senha alterada com sucesso'
      });

    } catch (error: any) {
      return res.status(400).json({
        sucesso: false,
        erro: error.message || 'Erro ao alterar senha'
      });
    }
  }

  /**
   * 🔥 RECUPERAR SENHA (enviar e-mail)
   * POST /api/auth/recuperar-senha
   */
  async recuperarSenha(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          sucesso: false,
          erro: 'E-mail é obrigatório'
        });
      }

      await this.authService.solicitarRecuperacaoSenha(email);

      return res.json({
        sucesso: true,
        mensagem: 'E-mail de recuperação enviado com sucesso'
      });

    } catch (error: any) {
      return res.status(400).json({
        sucesso: false,
        erro: error.message || 'Erro ao recuperar senha'
      });
    }
  }

  /**
   * 🔥 REDEFINIR SENHA (com token)
   * POST /api/auth/redefinir-senha
   */
  async redefinirSenha(req: Request, res: Response) {
    try {
      const { token, novaSenha } = req.body;

      if (!token || !novaSenha) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Token e nova senha são obrigatórios'
        });
      }

      if (novaSenha.length < 6) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Nova senha deve ter pelo menos 6 caracteres'
        });
      }

      await this.authService.redefinirSenha(token, novaSenha);

      return res.json({
        sucesso: true,
        mensagem: 'Senha redefinida com sucesso'
      });

    } catch (error: any) {
      return res.status(400).json({
        sucesso: false,
        erro: error.message || 'Erro ao redefinir senha'
      });
    }
  }
}