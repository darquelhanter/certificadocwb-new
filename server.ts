import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { submitLeadToEvolutionApi } from './api/_lib/evolutionApi';
import { createAsaasCharge } from './api/_lib/asaas';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
// Default to production unless explicitly told this is a dev run, so a
// missing/misconfigured NODE_ENV on the host never silently serves dev mode.
const isProduction = process.env.NODE_ENV !== 'development';

const submitLeadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas solicitações. Tente novamente em alguns minutos.' },
});

app.post('/api/submit-lead', submitLeadLimiter, async (req, res) => {
  const result = await submitLeadToEvolutionApi(req.body);
  res.status(result.status).json(result.body);
});

const createPaymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas solicitações. Tente novamente em alguns minutos.' },
});

app.post('/api/create-payment', createPaymentLimiter, async (req, res) => {
  const { name, cpfCnpj, email, phone, value, description } = req.body || {};
  const result = await createAsaasCharge({
    name,
    cpfCnpj,
    email,
    phone,
    value: Number(value),
    description,
  });
  res.status(result.status).json(result.body);
});

async function start() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = __dirname;
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Certificado CWB rodando em http://localhost:${PORT}`);
  });
}

start();
