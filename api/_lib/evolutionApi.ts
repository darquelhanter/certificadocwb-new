// Shared logic for sending WhatsApp messages via Evolution API. Used by both
// the local Express dev server (server.ts) and the Vercel Serverless
// Functions (api/submit-lead.ts, api/asaas-webhook.ts) that actually run in
// production, so they never drift apart.

export interface SendResult {
  status: number;
  body: { success: true } | { error: string };
}

export async function sendWhatsAppText(number: string, text: string): Promise<SendResult> {
  const evolutionApiUrl = process.env.EVOLUTION_API_URL;
  const evolutionApiKey = process.env.EVOLUTION_API_KEY;
  const evolutionInstance = process.env.EVOLUTION_INSTANCE || 'SiteBot';

  if (!evolutionApiUrl || !evolutionApiKey) {
    console.error('EVOLUTION_API_URL/EVOLUTION_API_KEY não estão configuradas no ambiente do servidor.');
    return { status: 500, body: { error: 'Integração de WhatsApp não configurada no servidor.' } };
  }

  if (!number || !text) {
    return { status: 400, body: { error: 'Campos "number" e "text" são obrigatórios.' } };
  }

  const sendUrl = `${evolutionApiUrl.replace(/\/+$/, '')}/message/sendText/${evolutionInstance}`;

  try {
    const response = await fetch(sendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: evolutionApiKey,
      },
      body: JSON.stringify({ number, text }),
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error(`Evolution API respondeu com status ${response.status}: ${responseText}`);
      return { status: response.status, body: { error: `Evolution API respondeu com erro: ${responseText}` } };
    }

    return { status: 200, body: { success: true } };
  } catch (err) {
    console.error('Falha ao contatar a Evolution API:', err);
    return { status: 502, body: { error: 'Falha ao contatar a Evolution API.' } };
  }
}

export type SubmitLeadResult = SendResult;

export async function submitLeadToEvolutionApi(payload: any): Promise<SubmitLeadResult> {
  const { nome, telefone } = payload || {};
  if (!nome || !telefone) {
    return { status: 400, body: { error: 'Campos "nome" e "telefone" são obrigatórios.' } };
  }

  return sendWhatsAppText(
    telefone,
    `Olá ${nome}! Recebemos sua solicitação para emissão de Certificado Digital na Certificado CWB. Como podemos te ajudar agora?`
  );
}
