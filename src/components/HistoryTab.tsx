import React, { useEffect, useState } from 'react';
import { Search, Phone, Trash2, Zap, Loader2, LogOut } from 'lucide-react';
import { SubmittedLead } from '../types';

const INTEREST_LABELS: Record<string, string> = {
  general: 'Assuntos Gerais',
  ecpf_a1: 'e-CPF A1',
  ecpf_a3: 'e-CPF A3',
  ecnpj_a1: 'e-CNPJ A1',
  ecnpj_a3: 'e-CNPJ A3',
};

interface HistoryTabProps {
  adminPassword: string;
  onLogout: () => void;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({ adminPassword, onLogout }) => {
  const [leads, setLeads] = useState<SubmittedLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [testingWebhook, setTestingWebhook] = useState(false);
  const [webhookTestResult, setWebhookTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  const fetchLeads = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const response = await fetch('/api/leads/list', {
        headers: { 'x-admin-password': adminPassword },
      });
      if (response.status === 401) {
        onLogout();
        return;
      }
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `status ${response.status}`);
      }
      setLeads(data.leads);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Falha ao carregar leads.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdateLeadStatus = async (id: string, status: 'pending' | 'contacted' | 'completed') => {
    setLeads(prev => prev.map(lead => lead.id === id ? { ...lead, status } : lead));
    try {
      await fetch('/api/leads/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': adminPassword },
        body: JSON.stringify({ id, status }),
      });
    } catch (err) {
      console.error('Falha ao atualizar status:', err);
    }
  };

  const handleDeleteLead = async (id: string, name: string) => {
    if (!confirm(`Remover definitivamente o lead de ${name}?`)) return;
    setLeads(prev => prev.filter(lead => lead.id !== id));
    try {
      await fetch('/api/leads/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': adminPassword },
        body: JSON.stringify({ id }),
      });
    } catch (err) {
      console.error('Falha ao remover lead:', err);
    }
  };

  const handleTestWebhook = async () => {
    setTestingWebhook(true);
    setWebhookTestResult(null);

    const testPayload = {
      id_lead: `CWB-TEST-${Math.floor(1000 + Math.random() * 9000)}`,
      nome: 'Lead de Teste',
      telefone: '5541999998888',
      telefone_original: '(41) 99999-8888',
      email: 'teste@certificadocwb.com.br',
      cidade: 'Curitiba',
      tipo_interesse: 'general',
      mensagem: 'Disparo de teste feito pelo Painel de Leads.',
      data: new Date().toISOString(),
      origem: 'teste_painel_admin',
    };

    try {
      const response = await fetch('/api/submit-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPayload),
      });

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        setWebhookTestResult({ ok: false, message: body.error || `O servidor respondeu com status ${response.status}.` });
      } else {
        setWebhookTestResult({ ok: true, message: 'Mensagem de teste disparada com sucesso pelo WhatsApp da Evolution API!' });
        fetchLeads();
      }
    } catch (err) {
      setWebhookTestResult({ ok: false, message: 'Falha de rede ao contatar nosso servidor. Verifique se ele está rodando.' });
    } finally {
      setTestingWebhook(false);
    }
  };

  const filteredLeads = leads.filter(
    (l) =>
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.phone.replace(/\D/g, '').includes(searchTerm.replace(/\D/g, '')) ||
      (l.email && l.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      l.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center pb-2">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-850 text-slate-800">Painel de Leads</h2>
          <p className="text-xs text-slate-400">Gerencie os contatos de cotação recebidos pelo site</p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar nome, WhatsApp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-64 pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-indigo-600 rounded-xl text-xs"
            />
          </div>
          <button
            type="button"
            onClick={onLogout}
            title="Sair"
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* WHATSAPP INTEGRATION TEST PANEL */}
      <div className="bg-slate-50 rounded-xl border border-slate-150 p-4 space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-[11px] font-bold text-slate-600">Integração WhatsApp (Evolution API)</h4>
            <p className="text-[10px] text-slate-400">Dispara uma mensagem de teste através do nosso servidor, para validar a conexão a qualquer momento.</p>
          </div>
          <button
            type="button"
            onClick={handleTestWebhook}
            disabled={testingWebhook}
            className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-lg text-xs font-semibold transition whitespace-nowrap"
          >
            {testingWebhook ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
            <span>{testingWebhook ? 'Disparando...' : 'Disparar Lead de Teste'}</span>
          </button>
        </div>

        {webhookTestResult && (
          <p className={`text-[10px] p-2 rounded-lg border ${
            webhookTestResult.ok
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}>
            {webhookTestResult.message}
          </p>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400 text-xs space-x-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Carregando leads...</span>
        </div>
      ) : loadError ? (
        <div className="text-center py-10 space-y-2">
          <p className="text-xs text-rose-600">{loadError}</p>
          <button onClick={fetchLeads} className="text-xs font-bold text-indigo-600 hover:underline">Tentar novamente</button>
        </div>
      ) : leads.length === 0 ? (
        <div className="text-center py-12 px-4 space-y-4 max-w-sm mx-auto animate-fade-in">
          <div className="inline-flex p-4 rounded-full bg-emerald-50 text-emerald-500">
            <Phone className="w-8 h-8" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">Nenhum contato recebido</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            As solicitações enviadas na página pública do site (formulário de contato) serão salvas e exibidas aqui.
          </p>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="text-center py-10 text-slate-400 text-xs">
          Nenhum lead de contato encontrado para "{searchTerm}".
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-100 animate-fade-in">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-150 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-4">Cliente / Registro</th>
                <th className="p-4">Interesse Escolhido</th>
                <th className="p-4">Cidade</th>
                <th className="p-4">Data de Envio</th>
                <th className="p-4 text-center">Status Interno</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLeads.map((lead) => {
                const rawPhone = lead.phone.replace(/\D/g, '');
                // Length-based check: a "55" prefix alone is ambiguous since 55 is also a real DDD.
                const waNumber = rawPhone.length <= 11 ? `55${rawPhone}` : rawPhone;
                const waLink = `https://wa.me/${waNumber}?text=Olá%20${encodeURIComponent(lead.name)},%20sou%20da%20Certificado%20CWB%20referente%20à%20sua%20solicitação%20no%20nosso%20site.%20Como%20posso%20ajudar%3F`;

                return (
                  <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center space-x-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] text-white ${
                          lead.status === 'pending' ? 'bg-amber-500' :
                          lead.status === 'contacted' ? 'bg-indigo-500' :
                          'bg-emerald-500'
                        }`}>
                          {lead.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="block font-semibold text-slate-800 text-xs capitalize">{lead.name}</span>
                          <span className="block text-slate-400 font-mono text-[10px]">{lead.phone}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className={`text-[9px] uppercase tracking-wide font-black px-2 py-0.5 rounded border inline-block ${
                        lead.interestType === 'ecpf_a1' ? 'bg-cyan-50 text-cyan-700 border-cyan-100' :
                        lead.interestType === 'ecpf_a3' ? 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100' :
                        lead.interestType === 'ecnpj_a1' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        lead.interestType === 'ecnpj_a3' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-slate-50 text-slate-700 border-slate-200'
                      }`}>
                        {INTEREST_LABELS[lead.interestType] || lead.interestType}
                      </span>
                    </td>

                    <td className="p-4 text-slate-500 font-semibold">{lead.city}</td>

                    <td className="p-4 font-mono text-slate-450 text-[11px]">
                      {new Date(lead.date).toLocaleString('pt-BR')}
                    </td>

                    <td className="p-4 text-center">
                      <select
                        value={lead.status}
                        onChange={(e) => handleUpdateLeadStatus(lead.id, e.target.value as any)}
                        className={`text-[10px] font-bold py-1 px-2 pb-1 rounded-full border cursor-pointer focus:outline-none transition-colors ${
                          lead.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' :
                          lead.status === 'contacted' ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100' :
                          'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        <option value="pending">🟡 Pendente</option>
                        <option value="contacted">🔵 Atendido</option>
                        <option value="completed">🟢 Concluído</option>
                      </select>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <a
                          href={waLink}
                          target="_blank"
                          referrerPolicy="no-referrer"
                          title="Conversar com o Lead via WhatsApp"
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                        <button
                          title="Remover Registro de Contato"
                          onClick={() => handleDeleteLead(lead.id, lead.name)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
