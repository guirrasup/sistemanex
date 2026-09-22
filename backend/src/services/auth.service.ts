// backend/src/services/auth.service.ts
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PerfilUsuario } from '@prisma/client';
import { UsuarioRepository } from '../repositories/usuario.repository.js';

// Segurança (P1): fail-fast — a API nunca deve subir com segredo conhecido/padrão.
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error(
    'JWT_SECRET ausente ou fraca. Defina JWT_SECRET (>= 32 caracteres) no ambiente antes de iniciar a API.'
  );
}

const JWT_SECRET = process.env.JWT_SECRET;
const RESET_TOKEN_EXPIRES = '1h'; // tempo do token de redefinição

export class AuthService {
  private usuarioRepo: UsuarioRepository;

  constructor() {
    this.usuarioRepo = new UsuarioRepository();
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
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { senhaHash, ...usuarioSemSenha } = usuario;
    return { usuario: usuarioSemSenha, token };
  }

  async verificarToken(token: string) {
    try {
      return jwt.verify(token, JWT_SECRET) as {
        id: string;
        email: string;
        empresaId: string;
        perfil?: string;
      };
    } catch {
      throw new Error('Token inválido');
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

    const { senhaHash, ...usuarioSemSenha } = usuario;
    return usuarioSemSenha;
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

    // [AutoPatch Backlog] TODO: Integrar provedor de e-mail transacional (ex.: SES, SendGrid, Postmark) para
    // enviar o link de redefinição de senha ao usuário. Requer criar um EmailService com
    // credenciais/API key via variável de ambiente e um template de e-mail.
    // Link que o frontend deve consumir:
    // `${process.env.FRONTEND_URL}/redefinir-senha?token=${resetToken}`

    // Em produção você faria algo como:
    // await emailService.enviarRecuperacaoSenha(usuario.email, resetToken);
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
    await this.usuarioRepo.updateSenha(usuario.id, novaSenhaHash);
  }
}