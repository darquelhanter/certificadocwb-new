// Vercel Serverless Function — creates an Asaas charge and returns the
// hosted invoice URL (Pix/Boleto/Cartão, customer picks on Asaas's page).
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createAsaasCharge } from './_lib/asaas.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  const { name, cpfCnpj, email, phone, value, description } = req.body || {};

  const result = await createAsaasCharge({
    name,
    cpfCnpj,
    email,
    phone,
    value: Number(value),
    description,
  });

  return res.status(result.status).json(result.body);
}
