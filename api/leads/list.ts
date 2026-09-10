import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isAuthorized } from '../_lib/adminAuth.js';
import { listLeads } from '../_lib/db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  if (!isAuthorized(req.headers['x-admin-password'])) {
    return res.status(401).json({ error: 'Senha incorreta.' });
  }

  try {
    const leads = await listLeads();
    return res.status(200).json({ leads });
  } catch (err) {
    console.error('Falha ao listar leads:', err);
    return res.status(500).json({ error: 'Falha ao buscar leads no banco de dados.' });
  }
}
