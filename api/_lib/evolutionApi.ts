// Shared logic for notifying a new lead via Evolution API's WhatsApp sendText
// endpoint. Used by both the local Express dev server (server.ts) and the
// Vercel Serverless Function (api/submit-lead.ts) that actually runs in
// production, so the two never drift apart.

export interface SubmitLeadResult {
  status: number;
  body: { success: true } | { error: string };
}

export async function submitLeadToEvolutionApi(payload: any): Promise<SubmitLeadResult> {
  const evolutionApiUrl = process.env.EVOLUTION_API_URL;
  const evolutionApiKey = process.env.EVOLUTION_API_KEY;
  const evolutionInstance = process.env.EVOLUTION_INSTANCE || 'SiteBot';

  if (!evolutionApiUrl || !evolutionApiKey) {
    console.error('EVOLUTION_API_URL/EVOLUTION_API_KEY não estão configuradas no ambiente do servidor.');
    return { status: 500, body: { error: 'Integração de WhatsApp não configurada no servidor.' } };
  }

  const { nome, telefone } = payload || {};
  if (!nome || !telefone) {
    return { status: 400, body: { error: 'Campos "nome" e "telefone" são obrigatórios.' } };
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
      return { status: response.status, body: { error: `Evolution API respondeu com erro: ${text}` } };
    }

    return { status: 200, body: { success: true } };
  } catch (err) {
    console.error('Falha ao encaminhar lead para a Evolution API:', err);
    return { status: 502, body: { error: 'Falha ao contatar a Evolution API.' } };
  }
}
