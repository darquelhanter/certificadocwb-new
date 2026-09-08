import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

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
  const evolutionApiUrl = process.env.EVOLUTION_API_URL;
  const evolutionApiKey = process.env.EVOLUTION_API_KEY;
  const evolutionInstance = process.env.EVOLUTION_INSTANCE || 'SiteBot';

  if (!evolutionApiUrl || !evolutionApiKey) {
    console.error('EVOLUTION_API_URL/EVOLUTION_API_KEY não estão configuradas no ambiente do servidor.');
    return res.status(500).json({ error: 'Integração de WhatsApp não configurada no servidor.' });
  }

  const { nome, telefone } = req.body || {};
  if (!nome || !telefone) {
    return res.status(400).json({ error: 'Campos "nome" e "telefone" são obrigatórios.' });
  }

  const sendUrl = `${evolutionApiUrl.replace(/\/+$/, '')}/message/sendText/${evolutionInstance}`;

  try {
    const response = await fetch(sendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: evolutionApiKey,
      },
      body: JSON.stringify({
        number: telefone,
        text: `Olá ${nome}! Recebemos sua solicitação para emissão de Certificado Digital na Certificado CWB. Como podemos te ajudar agora?`,
      }),
    });

    const text = await response.text();

    if (!response.ok) {
      console.error(`Evolution API respondeu com status ${response.status}: ${text}`);
      return res.status(response.status).json({ error: `Evolution API respondeu com erro: ${text}` });
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Falha ao encaminhar lead para a Evolution API:', err);
    res.status(502).json({ error: 'Falha ao contatar a Evolution API.' });
  }
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
