import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isAuthorized } from '../_lib/adminAuth.js';
import { deleteLead } from '../_lib/db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  if (!isAuthorized(req.headers['x-admin-password'])) {
    return res.status(401).json({ error: 'Senha incorreta.' });
  }

  const { id } = req.body || {};
  if (!id) {
    return res.status(400).json({ error: 'Campo "id" é obrigatório.' });
  }

  try {
    await deleteLead(id);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Falha ao remover lead:', err);
    return res.status(500).json({ error: 'Falha ao remover o lead.' });
  }
}
