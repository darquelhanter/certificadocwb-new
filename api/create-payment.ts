// Vercel Serverless Function — creates an Asaas charge and returns the
// hosted invoice URL (Pix/Boleto/Cartão, customer picks on Asaas's page).
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createAsaasCharge } from './_lib/asaas.js';
import { notifyPaymentRequested } from './_lib/postPaymentNotify.js';

const ADMIN_NOTIFICATION_NUMBER = '5541992447846';
const ADMIN_NOTIFICATION_EMAIL = 'cwbcertificado@gmail.com';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  const { name, cpfCnpj, email, phone, value, description } = req.body || {};
  const input = { name, cpfCnpj, email, phone, value: Number(value), description };

  const result = await createAsaasCharge(input);

  if (result.status === 200 && 'invoiceUrl' in result.body) {
    try {
      await notifyPaymentRequested(input, result.body.invoiceUrl, ADMIN_NOTIFICATION_NUMBER, ADMIN_NOTIFICATION_EMAIL);
    } catch (err) {
      // Never let a notification failure block the customer's checkout.
      console.error('Falha ao notificar pedido iniciado:', err);
    }
  }

  return res.status(result.status).json(result.body);
}
