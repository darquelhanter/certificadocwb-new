import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { submitLeadToEvolutionApi, sendWhatsAppText } from './api/_lib/evolutionApi';
import { createAsaasCharge } from './api/_lib/asaas';
import { insertLead, listLeads, updateLeadStatus, deleteLead, getConversationHistory, appendConversationMessage, getLastAssistantMessage, pausePhone, isPhonePaused, insertPageView, getPageViewStats } from './api/_lib/db';
import { isAuthorized } from './api/_lib/adminAuth';
import { notifyPaymentConfirmed } from './api/_lib/postPaymentNotify';
import { askSupportBot } from './api/_lib/supportBot';

const ADMIN_NOTIFICATION_NUMBER = '5541992447846';
const ADMIN_NOTIFICATION_EMAIL = 'cwbcertificado@gmail.com';
const HUMAN_TAKEOVER_PAUSE_HOURS = 24;

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
    console.error('Falha ao salvar lead no banco de dados:', err);
  }

  const result = await submitLeadToEvolutionApi(req.body);
  res.status(result.status).json(result.body);
});

app.get('/api/leads/list', async (req, res) => {
  if (!isAuthorized(req.headers['x-admin-password'])) {
    return res.status(401).json({ error: 'Senha incorreta.' });
  }
  try {
    const leads = await listLeads();
    res.status(200).json({ leads });
  } catch (err) {
    console.error('Falha ao listar leads:', err);
    res.status(500).json({ error: 'Falha ao buscar leads no banco de dados.' });
  }
});

app.post('/api/leads/update-status', async (req, res) => {
  if (!isAuthorized(req.headers['x-admin-password'])) {
    return res.status(401).json({ error: 'Senha incorreta.' });
  }
  const { id, status } = req.body || {};
  if (!id || !status) {
    return res.status(400).json({ error: 'Campos "id" e "status" são obrigatórios.' });
  }
  try {
    await updateLeadStatus(id, status);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Falha ao atualizar status do lead:', err);
    res.status(500).json({ error: 'Falha ao atualizar o status do lead.' });
  }
});

app.post('/api/leads/delete', async (req, res) => {
  if (!isAuthorized(req.headers['x-admin-password'])) {
    return res.status(401).json({ error: 'Senha incorreta.' });
  }
  const { id } = req.body || {};
  if (!id) {
    return res.status(400).json({ error: 'Campo "id" é obrigatório.' });
  }
  try {
    await deleteLead(id);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Falha ao remover lead:', err);
    res.status(500).json({ error: 'Falha ao remover o lead.' });
  }
});

app.post('/api/track-pageview', async (req, res) => {
  const { visitorId } = req.body || {};
  try {
    await insertPageView(typeof visitorId === 'string' ? visitorId.slice(0, 64) : null);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Falha ao registrar visualização de página:', err);
    res.status(200).json({ success: false });
  }
});

app.get('/api/stats/pageviews', async (req, res) => {
  if (!isAuthorized(req.headers['x-admin-password'])) {
    return res.status(401).json({ error: 'Senha incorreta.' });
  }
  try {
    const stats = await getPageViewStats();
    res.status(200).json(stats);
  } catch (err) {
    console.error('Falha ao buscar estatísticas de visualizações:', err);
    res.status(500).json({ error: 'Falha ao buscar estatísticas no banco de dados.' });
  }
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

app.post('/api/asaas-webhook', async (req, res) => {
  const expectedToken = process.env.ASAAS_WEBHOOK_TOKEN;
  const providedToken = req.headers['asaas-access-token'];
  if (!expectedToken || providedToken !== expectedToken) {
    return res.status(401).json({ error: 'Token de webhook inválido.' });
  }

  const { event, payment } = req.body || {};
  if (event !== 'PAYMENT_CONFIRMED' && event !== 'PAYMENT_RECEIVED') {
    return res.status(200).json({ ignored: true });
  }

  if (!payment?.customer) {
    return res.status(400).json({ error: 'Payload sem payment.customer.' });
  }

  try {
    await notifyPaymentConfirmed(payment.customer, payment.description || '', payment.value, ADMIN_NOTIFICATION_NUMBER, ADMIN_NOTIFICATION_EMAIL, payment.id);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Falha ao processar webhook de pagamento confirmado:', err);
    res.status(200).json({ success: false });
  }
});

function extractMessageText(message: any): string | null {
  if (!message) return null;
  return (
    message.conversation ||
    message.extendedTextMessage?.text ||
    message.imageMessage?.caption ||
    message.videoMessage?.caption ||
    null
  );
}

app.post('/api/whatsapp-webhook', async (req, res) => {
  const expectedSecret = process.env.WHATSAPP_WEBHOOK_SECRET;
  if (!expectedSecret || req.query.secret !== expectedSecret) {
    return res.status(401).json({ error: 'Secret inválido.' });
  }

  const body = req.body || {};
  const event = (body.event || '').toString().toLowerCase();
  if (event !== 'messages.upsert') {
    return res.status(200).json({ ignored: true });
  }

  const data = Array.isArray(body.data) ? body.data[0] : body.data;
  const remoteJid: string | undefined = data?.key?.remoteJid;
  const fromMe: boolean = Boolean(data?.key?.fromMe);

  if (!remoteJid || remoteJid.endsWith('@g.us')) {
    return res.status(200).json({ ignored: true });
  }

  const phone = remoteJid.split('@')[0];
  const text = extractMessageText(data?.message);
  if (!text) {
    return res.status(200).json({ ignored: true });
  }

  try {
    if (fromMe) {
      const lastAssistantMessage = await getLastAssistantMessage(phone);
      if (lastAssistantMessage !== null && lastAssistantMessage.trim() === text.trim()) {
        return res.status(200).json({ ignored: true, reason: 'bot echo' });
      }
      await pausePhone(phone, HUMAN_TAKEOVER_PAUSE_HOURS);
      return res.status(200).json({ ignored: true, reason: 'human takeover' });
    }

    if (await isPhonePaused(phone)) {
      return res.status(200).json({ ignored: true, reason: 'paused' });
    }

    await appendConversationMessage(phone, 'user', text);
    const history = await getConversationHistory(phone);
    const { reply, needsHuman } = await askSupportBot(history);
    await appendConversationMessage(phone, 'assistant', reply);

    await sendWhatsAppText(phone, reply);

    if (needsHuman) {
      await sendWhatsAppText(
        ADMIN_NOTIFICATION_NUMBER,
        `🙋 A IA identificou que esse cliente precisa de atendimento humano.\n\nNúmero: ${phone}\nÚltima mensagem: "${text}"`
      );
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Falha ao processar mensagem recebida do WhatsApp:', err);
    res.status(200).json({ success: false });
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
