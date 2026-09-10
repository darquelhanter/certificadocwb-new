// Shared logic for sending transactional emails via Resend. Used by both the
// local Express dev server (server.ts) and the Vercel Serverless Function
// (api/asaas-webhook.ts) that runs in production.
import { Resend } from 'resend';

const FROM_ADDRESS = 'Certificado CWB <pagamentos@certificadocwb.com.br>';

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY não configurada — não é possível enviar e-mail.');
    return;
  }

  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject,
    html,
  });

  if (error) {
    console.error(`Falha ao enviar e-mail para ${to}:`, error);
  }
}
