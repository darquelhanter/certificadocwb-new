// Vercel Serverless Function — receives Asaas's payment webhook. Configure
// this URL (https://www.certificadocwb.com.br/api/asaas-webhook) in the
// Asaas dashboard (Configurações → Integrações → Webhooks), with the
// "Authentication Token" set to the same value as ASAAS_WEBHOOK_TOKEN below
// (Asaas sends it back on every call in the asaas-access-token header).
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { notifyPaymentConfirmed } from './_lib/postPaymentNotify.js';

const ADMIN_NOTIFICATION_NUMBER = '5541992447846';
const ADMIN_NOTIFICATION_EMAIL = 'cwbcertificado@gmail.com';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  const expectedToken = process.env.ASAAS_WEBHOOK_TOKEN;
  const providedToken = req.headers['asaas-access-token'];
  if (!expectedToken || providedToken !== expectedToken) {
    return res.status(401).json({ error: 'Token de webhook inválido.' });
  }

  const { event, payment } = req.body || {};

  // Only react to a payment actually being confirmed — ignore every other
  // event type Asaas can send (created, overdue, refunded, etc).
  if (event !== 'PAYMENT_CONFIRMED' && event !== 'PAYMENT_RECEIVED') {
    return res.status(200).json({ ignored: true });
  }

  if (!payment?.customer) {
    return res.status(400).json({ error: 'Payload sem payment.customer.' });
  }

  try {
    await notifyPaymentConfirmed(payment.customer, payment.description || '', payment.value, ADMIN_NOTIFICATION_NUMBER, ADMIN_NOTIFICATION_EMAIL, payment.id);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Falha ao processar webhook de pagamento confirmado:', err);
    // Still return 200 so Asaas doesn't endlessly retry a broken payload —
    // the failure is logged for us to investigate manually.
    return res.status(200).json({ success: false });
  }
}
