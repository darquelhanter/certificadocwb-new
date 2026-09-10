// Vercel Serverless Function — receives incoming WhatsApp messages from
// Evolution API (MESSAGES_UPSERT event) and replies using the AI FAQ bot.
// Configure this webhook on the Evolution API instance "CertificadoCWB"
// pointing at:
//   https://www.certificadocwb.com.br/api/whatsapp-webhook?secret=WHATSAPP_WEBHOOK_SECRET
// (the secret lives in the URL because not every Evolution API version
// supports custom webhook headers the way Asaas does).
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getConversationHistory, appendConversationMessage, getLastAssistantMessage, pausePhone, isPhonePaused } from './_lib/db.js';
import { askSupportBot } from './_lib/supportBot.js';
import { sendWhatsAppText } from './_lib/evolutionApi.js';

const ADMIN_NOTIFICATION_NUMBER = '5541992447846';
const HUMAN_TAKEOVER_PAUSE_HOURS = 24;

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  const expectedSecret = process.env.WHATSAPP_WEBHOOK_SECRET;
  const providedSecret = req.query.secret;
  if (!expectedSecret || providedSecret !== expectedSecret) {
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
      // Either the bot's own reply echoed back by Evolution API, or the
      // admin manually typing to this customer. Tell them apart by
      // comparing against the last thing we ourselves sent.
      const lastAssistantMessage = await getLastAssistantMessage(phone);
      if (lastAssistantMessage !== null && lastAssistantMessage.trim() === text.trim()) {
        return res.status(200).json({ ignored: true, reason: 'bot echo' });
      }

      // A human (the admin) sent this — stop the bot from also answering
      // this customer for a while so replies don't collide.
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

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Falha ao processar mensagem recebida do WhatsApp:', err);
    return res.status(200).json({ success: false });
  }
}
