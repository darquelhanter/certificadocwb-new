// Vercel Serverless Function — records one page view. Called (fire-and-forget)
// from the frontend on every page load. Public, no auth: it only ever writes
// an anonymous counter row, never reads anything back.
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { insertPageView } from './_lib/db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  const { visitorId } = req.body || {};

  try {
    await insertPageView(typeof visitorId === 'string' ? visitorId.slice(0, 64) : null);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Falha ao registrar visualização de página:', err);
    return res.status(200).json({ success: false });
  }
}
