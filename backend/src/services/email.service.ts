// backend/src/services/email.service.ts
// Envio de e-mail via SMTP genérico (funciona com Gmail, Resend, SendGrid,
// Mailgun, cPanel/hospedagem própria — qualquer provedor SMTP padrão),
// configurado inteiramente por variáveis de ambiente. Nenhum dado cadastral
// da empresa ou do certificado digital contém credenciais de envio — SMTP é
// sempre uma conta de e-mail real, separada do que a empresa está emitindo.
import nodemailer, { type Transporter } from 'nodemailer';

export interface AnexoEmail {
  nomeArquivo: string;
  conteudo: string | Buffer;
  tipoConteudo?: string;
}

export interface EnviarEmailInput {
  destinatario: string;
  assunto: string;
  corpoTexto: string;
  corpoHtml?: string;
  anexos?: AnexoEmail[];
}

export class EmailService {
  private transporter: Transporter | null = null;

  private getTransporter(): Transporter {
    if (this.transporter) return this.transporter;

    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
      throw new Error(
        'Envio de e-mail não configurado — defina SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS e SMTP_FROM no .env do backend.'
      );
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    return this.transporter;
  }

  estaConfigurado(): boolean {
    return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
  }

  async enviar(input: EnviarEmailInput): Promise<{ messageId: string }> {
    const transporter = this.getTransporter();
    const from = process.env.SMTP_FROM || process.env.SMTP_USER;

    const resultado = await transporter.sendMail({
      from,
      to: input.destinatario,
      subject: input.assunto,
      text: input.corpoTexto,
      html: input.corpoHtml,
      attachments: input.anexos?.map((a) => ({
        filename: a.nomeArquivo,
        content: a.conteudo,
        contentType: a.tipoConteudo || 'application/xml',
      })),
    });

    return { messageId: resultado.messageId };
  }
}
