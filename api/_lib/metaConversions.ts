// Reports the "Purchase" event to Meta straight from our server (Conversions
// API) instead of relying on a client-side pixel — the customer never lands
// back on our own domain after paying, since checkout happens on Asaas's
// hosted page, so a browser-side Purchase pixel event would never fire.
import { createHash } from 'crypto';

const PIXEL_ID = '1036956412492940';
const GRAPH_API_VERSION = 'v21.0';

function sha256(value: string): string {
  return createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
}

interface PurchaseEventInput {
  email?: string | null;
  phone?: string | null;
  value: number;
  orderId: string;
}

export async function sendMetaPurchaseEvent(input: PurchaseEventInput): Promise<void> {
  const accessToken = process.env.META_CONVERSIONS_API_TOKEN;
  if (!accessToken) {
    console.error('META_CONVERSIONS_API_TOKEN não configurado — evento de Purchase não enviado ao Meta.');
    return;
  }

  const userData: Record<string, string[]> = {};
  if (input.email) userData.em = [sha256(input.email)];
  if (input.phone) userData.ph = [sha256(input.phone.replace(/\D/g, ''))];

  const payload = {
    data: [
      {
        event_name: 'Purchase',
        event_time: Math.floor(Date.now() / 1000),
        event_id: input.orderId,
        action_source: 'system_generated',
        user_data: userData,
        custom_data: {
          currency: 'BRL',
          value: input.value,
        },
      },
    ],
  };

  try {
    const response = await fetch(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${PIXEL_ID}/events?access_token=${accessToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error('Falha ao enviar evento de Purchase ao Meta:', body);
    }
  } catch (err) {
    console.error('Falha de rede ao enviar evento de Purchase ao Meta:', err);
  }
}
