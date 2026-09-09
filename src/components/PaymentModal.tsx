import React, { useMemo, useState } from 'react';
import { X, CreditCard, Loader2, ShieldCheck } from 'lucide-react';

interface MediaAddon {
  id: string;
  name: string;
  price: number;
}

interface PaymentModalProps {
  planTitle: string;
  planPrice: string; // e.g. "139,90"
  needsMedia: boolean;
  mediaAddons: MediaAddon[];
  onClose: () => void;
}

const BUNDLE_DISCOUNT_RATE = 0.10;

// Formats as CPF (000.000.000-00) or CNPJ (00.000.000/0001-00) depending on
// how many digits have been typed so far.
const formatCpfCnpj = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 14);

  if (digits.length <= 11) {
    let formatted = digits;
    if (digits.length > 3) formatted = digits.slice(0, 3) + '.' + digits.slice(3);
    if (digits.length > 6) formatted = formatted.slice(0, 7) + '.' + formatted.slice(7);
    if (digits.length > 9) formatted = formatted.slice(0, 11) + '-' + formatted.slice(11);
    return formatted;
  }

  let formatted = digits.slice(0, 2) + '.' + digits.slice(2);
  if (digits.length > 5) formatted = formatted.slice(0, 6) + '.' + formatted.slice(6);
  if (digits.length > 8) formatted = formatted.slice(0, 10) + '/' + formatted.slice(10);
  if (digits.length > 12) formatted = formatted.slice(0, 15) + '-' + formatted.slice(15);
  return formatted;
};

const formatBRL = (value: number) => value.toFixed(2).replace('.', ',');

export const PaymentModal: React.FC<PaymentModalProps> = ({ planTitle, planPrice, needsMedia, mediaAddons, onClose }) => {
  const [name, setName] = useState('');
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [email, setEmail] = useState('');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const certPrice = parseFloat(planPrice.replace(',', '.'));

  const toggleAddon = (id: string) => {
    setSelectedAddons(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  };

  const { addonsTotal, subtotal, discount, total, chosenAddons } = useMemo(() => {
    const chosen = mediaAddons.filter(a => selectedAddons.includes(a.id));
    const addonsSum = chosen.reduce((sum, a) => sum + a.price, 0);
    const sub = certPrice + addonsSum;
    const disc = chosen.length > 0 ? sub * BUNDLE_DISCOUNT_RATE : 0;
    return { addonsTotal: addonsSum, subtotal: sub, discount: disc, total: sub - disc, chosenAddons: chosen };
  }, [selectedAddons, mediaAddons, certPrice]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanDoc = cpfCnpj.replace(/\D/g, '');
    if (cleanDoc.length !== 11 && cleanDoc.length !== 14) {
      setError('Informe um CPF (11 dígitos) ou CNPJ (14 dígitos) válido.');
      return;
    }

    setSubmitting(true);
    try {
      const itemsDesc = [planTitle, ...chosenAddons.map(a => a.name)].join(' + ');
      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          cpfCnpj: cleanDoc,
          email: email || undefined,
          value: Math.round(total * 100) / 100,
          description: `${itemsDesc}${chosenAddons.length ? ` (10% de desconto no combo)` : ''} - Certificado CWB`,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.invoiceUrl) {
        throw new Error(data.error || 'Não foi possível gerar o link de pagamento.');
      }

      window.location.href = data.invoiceUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao iniciar o pagamento. Tente novamente.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Pagar {planTitle}</h3>
              <p className="text-xs text-slate-400">Cartão, Pix ou Boleto</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 block uppercase" htmlFor="pay-name">Nome Completo / Razão Social</label>
            <input
              id="pay-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-indigo-600 rounded-lg p-2 text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 block uppercase" htmlFor="pay-doc">CPF ou CNPJ</label>
            <input
              id="pay-doc"
              type="text"
              required
              placeholder="000.000.000-00"
              value={cpfCnpj}
              onChange={(e) => setCpfCnpj(formatCpfCnpj(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-indigo-600 rounded-lg p-2 text-sm font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 block uppercase" htmlFor="pay-email">E-mail (opcional)</label>
            <input
              id="pay-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-indigo-600 rounded-lg p-2 text-sm"
            />
          </div>

          {needsMedia && (
            <div className="space-y-1.5 pt-1">
              <label className="text-[10px] font-bold text-slate-400 block uppercase">Adicionar Mídia Física (opcional, 10% de desconto no combo)</label>
              <div className="space-y-1.5">
                {mediaAddons.map(addon => (
                  <label
                    key={addon.id}
                    className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition ${
                      selectedAddons.includes(addon.id)
                        ? 'border-indigo-600 bg-indigo-50/50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedAddons.includes(addon.id)}
                        onChange={() => toggleAddon(addon.id)}
                        className="accent-indigo-600"
                      />
                      <span className="text-xs font-semibold text-slate-700">{addon.name}</span>
                    </span>
                    <span className="text-xs font-mono text-slate-500">R$ {formatBRL(addon.price)}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Price breakdown */}
          <div className="border-t border-slate-100 pt-3 space-y-1 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>{planTitle}</span>
              <span className="font-mono">R$ {formatBRL(certPrice)}</span>
            </div>
            {chosenAddons.map(addon => (
              <div key={addon.id} className="flex justify-between text-slate-500">
                <span>{addon.name}</span>
                <span className="font-mono">R$ {formatBRL(addon.price)}</span>
              </div>
            ))}
            {discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Desconto combo (10%)</span>
                <span className="font-mono">- R$ {formatBRL(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-slate-800 pt-1.5 border-t border-slate-100">
              <span>Total</span>
              <span className="font-mono">R$ {formatBRL(total)}</span>
            </div>
          </div>

          {error && (
            <p className="text-[11px] text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold text-sm py-2.5 px-4 rounded-xl shadow-sm transition flex items-center justify-center space-x-2"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            <span>{submitting ? 'Gerando cobrança...' : 'Continuar para Pagamento'}</span>
          </button>

          <p className="text-[9px] text-slate-400 text-center leading-relaxed">
            Você será redirecionado para a página segura do Asaas para concluir o pagamento via Pix, boleto ou cartão de crédito.
          </p>
        </form>
      </div>
    </div>
  );
};
