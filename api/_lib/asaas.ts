// Shared logic for creating a hosted Asaas charge (Pix/Boleto/Cartão, customer
// picks on Asaas's own invoice page) and returning its payment link. Used by
// both the local Express dev server (server.ts) and the Vercel Serverless
// Function (api/create-payment.ts) that runs in production.

export interface AsaasChargeInput {
  name: string;
  cpfCnpj: string;
  email?: string;
  phone?: string;
  value: number;
  description: string;
}

export interface AsaasChargeResult {
  status: number;
  body: { invoiceUrl: string; paymentId: string } | { error: string };
}

export function getConfig() {
  const apiKey = process.env.ASAAS_API_KEY;
  const isProduction = process.env.ASAAS_ENV === 'production';
  const baseUrl = isProduction ? 'https://api.asaas.com/v3' : 'https://api-sandbox.asaas.com/v3';
  return { apiKey, baseUrl };
}

export async function asaasFetch(baseUrl: string, apiKey: string, path: string, init?: RequestInit) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      access_token: apiKey,
      ...(init?.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  return { response, data };
}

async function findOrCreateCustomer(baseUrl: string, apiKey: string, input: AsaasChargeInput): Promise<string> {
  const cleanDoc = input.cpfCnpj.replace(/\D/g, '');

  const { data: existing } = await asaasFetch(baseUrl, apiKey, `/customers?cpfCnpj=${cleanDoc}`);
  if (Array.isArray(existing?.data) && existing.data.length > 0) {
    return existing.data[0].id;
  }

  const { response, data: created } = await asaasFetch(baseUrl, apiKey, '/customers', {
    method: 'POST',
    body: JSON.stringify({
      name: input.name,
      cpfCnpj: cleanDoc,
      email: input.email || undefined,
      mobilePhone: input.phone ? input.phone.replace(/\D/g, '') : undefined,
    }),
  });

  if (!response.ok) {
    throw new Error(created?.errors?.[0]?.description || 'Falha ao cadastrar cliente no Asaas.');
  }

  return created.id;
}

export async function createAsaasCharge(input: AsaasChargeInput): Promise<AsaasChargeResult> {
  const { apiKey, baseUrl } = getConfig();

  if (!apiKey) {
    console.error('ASAAS_API_KEY não está configurada no ambiente do servidor.');
    return { status: 500, body: { error: 'Pagamento não configurado no servidor.' } };
  }

  if (!input.name || !input.cpfCnpj) {
    return { status: 400, body: { error: 'Nome e CPF/CNPJ são obrigatórios.' } };
  }

  if (!input.value || input.value <= 0) {
    return { status: 400, body: { error: 'Valor da cobrança inválido.' } };
  }

  try {
    const customerId = await findOrCreateCustomer(baseUrl, apiKey, input);

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 2);
    const dueDateStr = dueDate.toISOString().split('T')[0];

    const { response, data: payment } = await asaasFetch(baseUrl, apiKey, '/payments', {
      method: 'POST',
      body: JSON.stringify({
        customer: customerId,
        // UNDEFINED lets the customer pick Pix, Boleto or Cartão on Asaas's
        // own hosted invoice page — matches the reference checkout shared.
        billingType: 'UNDEFINED',
        value: input.value,
        dueDate: dueDateStr,
        description: input.description,
      }),
    });

    if (!response.ok || !payment?.invoiceUrl) {
      console.error('Asaas respondeu com erro ao criar cobrança:', payment);
      return {
        status: response.status || 502,
        body: { error: payment?.errors?.[0]?.description || 'Falha ao criar cobrança no Asaas.' },
      };
    }

    return { status: 200, body: { invoiceUrl: payment.invoiceUrl, paymentId: payment.id } };
  } catch (err) {
    console.error('Falha ao criar cobrança no Asaas:', err);
    const message = err instanceof Error ? err.message : 'Falha ao contatar o Asaas.';
    return { status: 502, body: { error: message } };
  }
}
