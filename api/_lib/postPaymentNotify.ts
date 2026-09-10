// Shared logic for the "payment confirmed" moment: notifies both the
// customer (ask for documents) and the admin (heads-up with the order
// details) over WhatsApp. Used by the Asaas webhook handler.
import { getConfig, asaasFetch } from './asaas.js';
import { sendWhatsAppText } from './evolutionApi.js';

interface AsaasCustomer {
  id: string;
  name: string;
  cpfCnpj: string;
  mobilePhone?: string;
  phone?: string;
  email?: string;
}

function formatBRL(value: number) {
  return value.toFixed(2).replace('.', ',');
}

// Brazilian local numbers are 10-11 digits (DDD + number); anything longer
// already includes the country code. Checking for a "55" prefix alone is
// wrong because 55 is also a real DDD (Passo Fundo/Caxias do Sul-RS).
function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, '');
  return digits.length <= 11 ? `55${digits}` : digits;
}

function customerDocumentsMessage(name: string, description: string) {
  const isPJ = /CNPJ/i.test(description);

  const docsList = isPJ
    ? '📄 Documento de constituição da empresa (Contrato Social consolidado, CCMEI ou Requerimento de Empresário)\n🪪 Documento de identificação com foto do representante legal (CNH, RG ou carteira de classe como OAB/CRM)'
    : '🪪 Documento de identificação com foto (CNH, RG ou carteira de classe como OAB/CRM)';

  return `Olá ${name}! 🎉 Recebemos a confirmação do seu pagamento na Certificado CWB — muito obrigado!\n\nPara darmos continuidade à emissão do seu certificado, envie por aqui mesmo:\n\n${docsList}\n\nAssim que recebermos, agendamos sua videoconferência de validação (rápida, só 5 minutinhos)!`;
}

function adminAlertMessage(customer: AsaasCustomer, description: string, value: number) {
  return `💰 Pagamento confirmado!\n\nCliente: ${customer.name}\nDocumento: ${customer.cpfCnpj}\nTelefone: ${customer.mobilePhone || customer.phone || 'não informado'}\nPedido: ${description}\nValor: R$ ${formatBRL(value)}\n\nEntre em contato para dar continuidade à emissão.`;
}

export async function notifyPaymentConfirmed(customerId: string, description: string, value: number, adminNumber: string): Promise<void> {
  const { apiKey, baseUrl } = getConfig();
  if (!apiKey) {
    console.error('ASAAS_API_KEY não configurada — não é possível buscar dados do cliente para notificar.');
    return;
  }

  const { response, data: customer } = await asaasFetch(baseUrl, apiKey, `/customers/${customerId}`);
  if (!response.ok) {
    console.error('Falha ao buscar cliente no Asaas para notificação pós-pagamento:', customer);
    return;
  }

  const customerPhone = customer.mobilePhone || customer.phone;

  const results = await Promise.allSettled([
    customerPhone
      ? sendWhatsAppText(normalizePhone(customerPhone), customerDocumentsMessage(customer.name, description))
      : Promise.resolve({ status: 400, body: { error: 'Cliente sem telefone cadastrado no Asaas.' } }),
    sendWhatsAppText(normalizePhone(adminNumber), adminAlertMessage(customer, description, value)),
  ]);

  results.forEach((result, i) => {
    const label = i === 0 ? 'cliente' : 'admin';
    if (result.status === 'rejected') {
      console.error(`Falha ao enviar notificação pós-pagamento (${label}):`, result.reason);
    } else if (result.value && 'body' in result.value && 'error' in result.value.body) {
      console.error(`Falha ao enviar notificação pós-pagamento (${label}):`, result.value.body.error);
    }
  });
}
