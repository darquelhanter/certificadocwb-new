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
import { submitLeadToEvolutionApi } from '../lib/evolutionApi';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  const result = await submitLeadToEvolutionApi(req.body);
  return res.status(result.status).json(result.body);
}
