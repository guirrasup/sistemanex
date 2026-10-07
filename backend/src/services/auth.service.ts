// backend/src/services/auth.service.ts
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PerfilUsuario } from '@prisma/client';
import { UsuarioRepository } from '../repositories/usuario.repository.js';
import { EmailService } from './email.service.js';
import { calcularPermissoesEfetivas, invalidarAcesso } from './acesso.service.js';

// Segurança (P1): fail-fast — a API nunca deve subir com segredo conhecido/padrão.
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error(
    'JWT_SECRET ausente ou fraca. Defina JWT_SECRET (>= 32 caracteres) no ambiente antes de iniciar a API.'
  );
}

const JWT_SECRET = process.env.JWT_SECRET;
const RESET_TOKEN_EXPIRES = '1h'; // tempo do token de redefinição

function escaparHtml(valor: string): string {
  return valor
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export class AuthService {
  private usuarioRepo: UsuarioRepository;
  private emailService: EmailService;

  constructor() {
    this.usuarioRepo = new UsuarioRepository();
    this.emailService = new EmailService();
  }

  async login(email: string, senha: string) {
    const usuario = await this.usuarioRepo.findByEmail(email);
    if (!usuario) {
      throw new Error('Credenciais inválidas');
    }

    if (!usuario.ativo) {
      throw new Error('Usuário inativo. Contate o administrador.');
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senhaHash);
    if (!senhaValida) {
      throw new Error('Credenciais inválidas');
    }

    // Atualiza último login
    await this.usuarioRepo.updateUltimoLogin(usuario.id);

    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        empresaId: usuario.empresaId,
        perfil: usuario.perfil,
        sv: usuario.sessaoVersao,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return { usuario: this.comPermissoes(usuario), token };
  }

  async verificarToken(token: string) {
    try {
      return jwt.verify(token, JWT_SECRET) as {
        id: string;
        email: string;
        empresaId: string;
        perfil?: string;
        sv?: number;
      };
    } catch (erro) {
      // Mantém o motivo real (TokenExpiredError / "invalid signature" quando o
      // JWT_SECRET mudou) para o log do middleware.
      const motivo = erro instanceof Error ? `${erro.name}: ${erro.message}` : String(erro);
      throw new Error(`Token inválido (${motivo})`);
    }
  }

  async criarUsuario(data: {
    nome: string;
    email: string;
    senha: string;
    cargo?: string;
    perfil?: string;
    empresaId: string;
  }) {
    const emailExiste = await this.usuarioRepo.emailExists(data.email);
    if (emailExiste) {
      throw new Error('E-mail já cadastrado');
    }

    const senhaHash = await bcrypt.hash(data.senha, 12);

    return this.usuarioRepo.create({
      nome: data.nome,
      email: data.email.toLowerCase().trim(),
      senhaHash,
      cargo: data.cargo || null,
      perfil: (data.perfil as PerfilUsuario) || 'OPERADOR',
      ativo: true,
      empresa: { connect: { id: data.empresaId } },
    });
  }

  async buscarUsuarioPorId(id: string) {
    const usuario = await this.usuarioRepo.findById(id);
    if (!usuario) return null;

    return this.comPermissoes(usuario);
  }

  // Remove o hash e anexa as permissões efetivas (o frontend usa para montar
  // menus e telas; quem garante o acesso de fato é o backend).
  private comPermissoes<T extends {
    senhaHash: string;
    perfil: string;
    permissoesConcedidas: string[];
    permissoesNegadas: string[];
    perfilAcesso: { id: string; nome: string; cor: string; permissoes: string[] } | null;
  }>(usuario: T) {
    const { senhaHash, perfilAcesso, ...resto } = usuario;
    return {
      ...resto,
      perfilAcesso: perfilAcesso ? { id: perfilAcesso.id, nome: perfilAcesso.nome, cor: perfilAcesso.cor } : null,
      permissoes: calcularPermissoesEfetivas({
        perfil: usuario.perfil,
        perfilAcessoPermissoes: perfilAcesso?.permissoes ?? null,
        permissoesConcedidas: usuario.permissoesConcedidas,
        permissoesNegadas: usuario.permissoesNegadas,
      }),
    };
  }

  async alterarSenha(userId: string, senhaAtual: string, novaSenha: string) {
    const usuario = await this.usuarioRepo.findById(userId);
    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    const senhaValida = await bcrypt.compare(senhaAtual, usuario.senhaHash);
    if (!senhaValida) {
      throw new Error('Senha atual incorreta');
    }

    if (novaSenha.length < 6) {
      throw new Error('Nova senha deve ter pelo menos 6 caracteres');
    }

    if (senhaAtual === novaSenha) {
      throw new Error('A nova senha deve ser diferente da senha atual');
    }

    const novaSenhaHash = await bcrypt.hash(novaSenha, 12);
    await this.usuarioRepo.updateSenha(userId, novaSenhaHash);
  }

  envioEmailConfigurado(): boolean {
    return this.emailService.estaConfigurado();
  }

  async solicitarRecuperacaoSenha(email: string) {
    const usuario = await this.usuarioRepo.findByEmail(email.toLowerCase().trim());

    // Por segurança, não revelamos se o e-mail existe ou não
    if (!usuario) {
      return; // silencioso
    }

    if (!usuario.ativo) {
      throw new Error('Usuário inativo. Contate o administrador.');
    }

    // Token de redefinição (curta duração)
    const resetToken = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        type: 'password-reset',
      },
      JWT_SECRET,
      { expiresIn: RESET_TOKEN_EXPIRES }
    );

    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/+$/, '');
    const link = `${frontendUrl}/redefinir-senha?token=${encodeURIComponent(resetToken)}`;

    await this.emailService.enviar({
      destinatario: usuario.email,
      assunto: 'Redefinição de senha',
      corpoTexto:
        `Olá, ${usuario.nome}.\n\n` +
        `Recebemos uma solicitação para redefinir sua senha. Acesse o link abaixo (válido por 1 hora):\n\n` +
        `${link}\n\n` +
        `Se você não fez essa solicitação, ignore este e-mail.`,
      corpoHtml:
        `<p>Olá, ${escaparHtml(usuario.nome)}.</p>` +
        `<p>Recebemos uma solicitação para redefinir sua senha. Clique no link abaixo (válido por 1 hora):</p>` +
        `<p><a href="${escaparHtml(link)}">Redefinir minha senha</a></p>` +
        `<p>Se você não fez essa solicitação, ignore este e-mail.</p>`,
    });
  }

  async redefinirSenha(token: string, novaSenha: string) {
    if (novaSenha.length < 6) {
      throw new Error('Nova senha deve ter pelo menos 6 caracteres');
    }

    let payload: { id: string; email: string; type: string };
    try {
      payload = jwt.verify(token, JWT_SECRET) as { id: string; email: string; type: string };
    } catch {
      throw new Error('Token inválido ou expirado');
    }

    if (payload.type !== 'password-reset') {
      throw new Error('Token inválido para redefinição de senha');
    }

    const usuario = await this.usuarioRepo.findById(payload.id);
    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    if (!usuario.ativo) {
      throw new Error('Usuário inativo');
    }

    const novaSenhaHash = await bcrypt.hash(novaSenha, 12);
    // Redefinição por e-mail encerra as sessões abertas (ex.: conta comprometida).
    await this.usuarioRepo.updateSenha(usuario.id, novaSenhaHash, { revogarSessoes: true });
    invalidarAcesso(usuario.id);
  }
}