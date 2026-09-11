// Shared logic for the "payment confirmed" moment: notifies both the
// customer (ask for documents) and the admin (heads-up with the order
// details) over WhatsApp and email. Used by the Asaas webhook handler.
import { getConfig, asaasFetch } from './asaas.js';
import { sendWhatsAppText } from './evolutionApi.js';
import { sendEmail } from './email.js';
import { sendMetaPurchaseEvent } from './metaConversions.js';

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

function requiredDocsHtml(description: string) {
  const isPJ = /CNPJ/i.test(description);
  return isPJ
    ? '<li>🪪 Documento de identificação do representante legal</li><li>📄 Cartão CNPJ</li><li>📄 Contrato Social em vigor (devidamente registrado em órgão competente)</li><li>📧 E-mail do titular</li><li>📱 Telefone do titular</li>'
    : '<li>🪪 Documento de identificação com foto (CNH, RG ou carteira de classe como OAB/CRM)</li><li>📱 Telefone</li><li>📧 E-mail</li><li>🏠 Endereço</li>';
}

function requiredDocsText(description: string) {
  const isPJ = /CNPJ/i.test(description);
  return isPJ
    ? '🪪 Documento de identificação do representante legal\n📄 Cartão CNPJ\n📄 Contrato Social em vigor (devidamente registrado em órgão competente)\n📧 E-mail do titular\n📱 Telefone do titular'
    : '🪪 Documento de identificação com foto (CNH, RG ou carteira de classe como OAB/CRM)\n📱 Telefone\n📧 E-mail\n🏠 Endereço';
}

function customerWhatsAppMessage(name: string, description: string) {
  return `Olá ${name}! 🎉 Recebemos a confirmação do seu pagamento na Certificado CWB — muito obrigado!\n\nPara darmos continuidade à emissão do seu certificado, envie por aqui mesmo:\n\n${requiredDocsText(description)}\n\nAssim que recebermos, agendamos sua videoconferência de validação (rápida, só 5 minutinhos)!`;
}

function customerEmailHtml(name: string, description: string) {
  return `<p>Olá ${name}! 🎉</p><p>Recebemos a confirmação do seu pagamento na <strong>Certificado CWB</strong> — muito obrigado!</p><p>Para darmos continuidade à emissão do seu certificado, envie pelo WhatsApp:</p><ul>${requiredDocsHtml(description)}</ul><p>Assim que recebermos, agendamos sua videoconferência de validação (rápida, só 5 minutinhos)!</p>`;
}

function adminAlertText(customer: AsaasCustomer, description: string, value: number) {
  return `💰 Pagamento confirmado!\n\nCliente: ${customer.name}\nDocumento: ${customer.cpfCnpj}\nTelefone: ${customer.mobilePhone || customer.phone || 'não informado'}\nPedido: ${description}\nValor: R$ ${formatBRL(value)}\n\nEntre em contato para dar continuidade à emissão.`;
}

function adminAlertHtml(customer: AsaasCustomer, description: string, value: number) {
  return `<p>💰 <strong>Pagamento confirmado!</strong></p><p>Cliente: ${customer.name}<br>Documento: ${customer.cpfCnpj}<br>Telefone: ${customer.mobilePhone || customer.phone || 'não informado'}<br>E-mail: ${customer.email || 'não informado'}<br>Pedido: ${description}<br>Valor: R$ ${formatBRL(value)}</p><p>Entre em contato para dar continuidade à emissão.</p>`;
}

function logSettled(label: string, result: PromiseSettledResult<{ status: number; body: any } | void>) {
  if (result.status === 'rejected') {
    console.error(`Falha ao enviar notificação pós-pagamento (${label}):`, result.reason);
  } else if (result.value && typeof result.value === 'object' && 'body' in result.value && result.value.body && 'error' in result.value.body) {
    console.error(`Falha ao enviar notificação pós-pagamento (${label}):`, result.value.body.error);
  }
}

export async function notifyPaymentConfirmed(customerId: string, description: string, value: number, adminNumber: string, adminEmail: string, paymentId?: string): Promise<void> {
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
      ? sendWhatsAppText(normalizePhone(customerPhone), customerWhatsAppMessage(customer.name, description))
      : Promise.resolve({ status: 400, body: { error: 'Cliente sem telefone cadastrado no Asaas.' } }),
    sendWhatsAppText(normalizePhone(adminNumber), adminAlertText(customer, description, value)),
    customer.email
      ? sendEmail(customer.email, 'Pagamento confirmado — Certificado CWB 🎉', customerEmailHtml(customer.name, description))
      : Promise.resolve(),
    sendEmail(adminEmail, `💰 Novo pagamento confirmado — ${customer.name}`, adminAlertHtml(customer, description, value)),
    sendMetaPurchaseEvent({
      email: customer.email,
      phone: customerPhone,
      value,
      orderId: paymentId || `${customerId}-${description}`,
    }),
  ]);

  const labels = ['whatsapp cliente', 'whatsapp admin', 'email cliente', 'email admin', 'meta purchase event'];
  results.forEach((result, i) => logSettled(labels[i], result));
}
