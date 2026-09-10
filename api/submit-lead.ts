// Vercel Serverless Function — this is what actually runs in production.
// Vercel auto-detects any file under /api as a function; no vercel.json
// or extra config needed for a Vite (non-framework) project.
//
// Note: this runtime is stateless/ephemeral per invocation, so it cannot
// hold an in-memory rate limiter across requests the way server.ts's
// Express instance does for local dev. If abuse becomes a real problem,
// add a shared store (Vercel KV / Upstash Redis) or Vercel's Web
// Application Firewall rate-limiting rules at the platform level.

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { submitLeadToEvolutionApi } from './_lib/evolutionApi.js';
import { insertLead } from './_lib/db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  const { id_lead, nome, telefone, telefone_original, email, cidade, tipo_interesse, mensagem } = req.body || {};

  try {
    await insertLead({
      id: id_lead,
      name: nome,
      phone: telefone_original || telefone,
      email,
      city: cidade,
      interestType: tipo_interesse,
      message: mensagem,
    });
  } catch (err) {
    // Don't let a DB hiccup block the WhatsApp notification below — the
    // business still gets the message even if the CRM record failed to save.
    console.error('Falha ao salvar lead no banco de dados:', err);
  }

  const result = await submitLeadToEvolutionApi(req.body);
  return res.status(result.status).json(result.body);
}
