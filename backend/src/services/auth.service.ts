// src/services/auth.service.ts
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UsuarioRepository } from '../repositories/usuario.repository';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
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
      perfil: (data.perfil as any) || 'OPERADOR',
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

  /**
   * Altera a senha do usuário logado
   */
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

  /**
   * Solicita recuperação de senha (gera token e "envia" e-mail)
   * Em produção: integrar com serviço real de e-mail (Resend, SendGrid, SES, etc.)
   */
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

    // TODO: Enviar e-mail real
    // Exemplo de link que o frontend deve consumir:
    // `${process.env.FRONTEND_URL}/redefinir-senha?token=${resetToken}`
    console.log('========================================');
    console.log('📧 RECUPERAÇÃO DE SENHA');
    console.log(`Para: ${usuario.email}`);
    console.log(`Token: ${resetToken}`);
    console.log(`Expira em: ${RESET_TOKEN_EXPIRES}`);
    console.log('========================================');

    // Em produção você faria algo como:
    // await emailService.enviarRecuperacaoSenha(usuario.email, resetToken);
  }

  /**
   * Redefine a senha usando o token recebido por e-mail
   */
  async redefinirSenha(token: string, novaSenha: string) {
    if (novaSenha.length < 6) {
      throw new Error('Nova senha deve ter pelo menos 6 caracteres');
    }

    let payload: any;
    try {
      payload = jwt.verify(token, JWT_SECRET);
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