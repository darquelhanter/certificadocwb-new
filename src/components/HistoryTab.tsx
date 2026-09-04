import React, { useState } from 'react';
import { Search, Copy, Eye, Check, Plus, ClipboardCheck, Trash2, Building, User, Phone, CheckCircle2, Zap, Loader2 } from 'lucide-react';
import { CertificateData, SubmittedLead } from '../types';

interface HistoryTabProps {
  certificates: CertificateData[];
  onSelect: (cert: CertificateData) => void;
  onDelete: (id: string) => void;
  onGoToCreate: () => void;
  submittedLeads: SubmittedLead[];
  onUpdateLeadStatus: (id: string, status: 'pending' | 'contacted' | 'completed') => void;
  onDeleteLead: (id: string) => void;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({
  certificates,
  onSelect,
  onDelete,
  onGoToCreate,
  submittedLeads,
  onUpdateLeadStatus,
  onDeleteLead,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'certificates' | 'leads'>('certificates');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [testingWebhook, setTestingWebhook] = useState(false);
  const [webhookTestResult, setWebhookTestResult] = useState<{ ok: boolean; message: string } | null>(null);

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
      }
    } catch (err) {
      setWebhookTestResult({ ok: false, message: 'Falha de rede ao contatar nosso servidor. Verifique se ele está rodando.' });
    } finally {
      setTestingWebhook(false);
    }
  };

  const handleCopyId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1200);
  };

  const filteredCerts = certificates.filter(
    (c) =>
      c.holderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.holderDoc.includes(searchTerm)
  );

  const filteredLeads = submittedLeads.filter(
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
          <h2 className="text-xl font-display font-bold text-slate-850 text-slate-800">Painel de Registros e Leads</h2>
          <p className="text-xs text-slate-400">Gerencie certificados emitidos localmente e contatos de cotação recebidos</p>
        </div>

        <div className="w-full md:w-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={activeSubTab === 'certificates' ? "Buscar titular, CPF/CNPJ..." : "Buscar nome, WhatsApp..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-64 pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-indigo-600 rounded-xl text-xs"
          />
        </div>
      </div>

      {/* SUB-TABS SELECTOR */}
      <div className="flex border-b border-slate-100 pb-px">
        <button
          onClick={() => { setActiveSubTab('certificates'); setSearchTerm(''); }}
          className={`pb-3 text-xs font-bold border-b-2 px-4 transition-colors ${
            activeSubTab === 'certificates'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Certificados Emitidos ({certificates.length})
        </button>
        <button
          onClick={() => { setActiveSubTab('leads'); setSearchTerm(''); }}
          className={`pb-3 text-xs font-bold border-b-2 px-4 transition-colors flex items-center space-x-1.5 ${
            activeSubTab === 'leads'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <span>💡 Leads de Contatos ({submittedLeads.length})</span>
          {submittedLeads.filter(l => l.status === 'pending').length > 0 && (
            <span className="bg-amber-500 text-white font-mono text-[9px] h-4 min-w-4 px-1 rounded-full flex items-center justify-center">
              {submittedLeads.filter(l => l.status === 'pending').length}
            </span>
          )}
        </button>
      </div>

      {/* WHATSAPP INTEGRATION TEST PANEL */}
      {activeSubTab === 'leads' && (
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
      )}

      {/* SUB-TAB CONTENTS */}
      {activeSubTab === 'certificates' ? (
        certificates.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-4 max-w-sm mx-auto">
            <div className="inline-flex p-4 rounded-full bg-indigo-50 text-indigo-500">
              <ClipboardCheck className="w-8 h-8" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Nenhum certificado emitido</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Use o simulador de emissão para emitir e salvar seu primeiro certificado digital e-CPF ou e-CNPJ na Certificado CWB.
            </p>
            <button
              onClick={onGoToCreate}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Emitir Primeiro</span>
            </button>
          </div>
        ) : filteredCerts.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            Nenhum registro de certificado encontrado para "{searchTerm}".
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-150 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="p-4">Titular / Propriedade</th>
                  <th className="p-4">Tipo de Certificado</th>
                  <th className="p-4">Vencimento</th>
                  <th className="p-4">Chave de Homologação</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredCerts.map((cert) => (
                  <tr
                    key={cert.id}
                    onClick={() => onSelect(cert)}
                    className="hover:bg-slate-50/70 cursor-pointer transition-colors group"
                  >
                    <td className="p-4">
                      <div className="flex items-center space-x-2.5">
                        <div className={`p-1.5 rounded-lg ${cert.certificateType.startsWith('ecnpj') ? 'bg-amber-50 text-amber-600' : 'bg-cyan-50 text-cyan-600'}`}>
                          {cert.certificateType.startsWith('ecnpj') ? <Building className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <span className="block font-semibold text-slate-800 text-xs capitalize">{cert.holderName}</span>
                          <span className="block text-slate-400 text-[10px] font-mono">{cert.holderDoc}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className={`text-[9px] uppercase tracking-wide font-black px-2 py-0.5 rounded border ${
                        cert.certificateType === 'ecpf_a1' ? 'bg-cyan-50 text-cyan-700 border-cyan-100' :
                        cert.certificateType === 'ecpf_a3' ? 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100' :
                        cert.certificateType === 'ecnpj_a1' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {cert.certificateType.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="p-4 font-mono text-slate-500">
                      {new Date(cert.expiryDate).toLocaleDateString('pt-BR')}
                    </td>

                    <td className="p-4 font-mono text-xs">
                      <div className="flex items-center space-x-1.5">
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-extrabold select-all">{cert.id}</span>
                        <button
                          title="Copiar Código"
                          type="button"
                          onClick={(e) => handleCopyId(cert.id, e)}
                          className="text-slate-400 hover:text-indigo-600 p-1 rounded hover:bg-slate-100 transition"
                        >
                          {copiedId === cert.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          title="Visualizar Certificado"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelect(cert);
                          }}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg opacity-0 group-hover:opacity-100 focus:opacity-100 transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          title="Excluir Registro"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Excluir o certificado de ${cert.holderName}? O registro não estará mais disponível no validador.`)) {
                              onDelete(cert.id);
                            }
                          }}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 focus:opacity-100 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        /* LEADS TAB CONTENT */
        submittedLeads.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-4 max-w-sm mx-auto animate-fade-in">
            <div className="inline-flex p-4 rounded-full bg-emerald-50 text-emerald-500">
              <Phone className="w-8 h-8" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Nenhum contato recebido</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              As solicitações enviadas de forma instantânea na página pública do site (formulário de contato) serão arquivadas e exibidas aqui em tempo real.
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
                  // Setup WhatsApp direct contact link with professional pre-filled response.
                  // Length-based check: a "55" prefix alone is ambiguous since 55 is also a real DDD.
                  const waNumber = rawPhone.length <= 11 ? `55${rawPhone}` : rawPhone;
                  const waLink = `https://wa.me/${waNumber}?text=Olá%20${encodeURIComponent(lead.name)},%20sou%20da%20Certificado%20CWB%20referente%20à%20sua%20solicitação%20no%20nosso%20site.%20Como%20posso%20ajudar%3F`;

                  return (
                    <tr
                      key={lead.id}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      {/* Name & Contact */}
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

                      {/* Interest badge */}
                      <td className="p-4">
                        <span className={`text-[9px] uppercase tracking-wide font-black px-2 py-0.5 rounded border inline-block ${
                          lead.interestType === 'ecpf_a1' ? 'bg-cyan-50 text-cyan-700 border-cyan-100' :
                          lead.interestType === 'ecpf_a3' ? 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100' :
                          lead.interestType === 'ecnpj_a1' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          lead.interestType === 'ecnpj_a3' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-slate-50 text-slate-700 border-slate-200'
                        }`}>
                          {lead.interestType === 'general' ? 'Assuntos Gerais' : lead.interestType.replace('_', ' ')}
                        </span>
                      </td>

                      {/* City */}
                      <td className="p-4 text-slate-500 font-semibold">{lead.city}</td>

                      {/* Timestamp */}
                      <td className="p-4 font-mono text-slate-450 text-[11px]">
                        {new Date(lead.date).toLocaleString('pt-BR')}
                      </td>

                      {/* Selectable Admin status state */}
                      <td className="p-4 text-center">
                        <select
                          value={lead.status}
                          onChange={(e) => onUpdateLeadStatus(lead.id, e.target.value as any)}
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

                      {/* Admin action buttons */}
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
                            onClick={() => {
                              if (confirm(`Remover definitivamente o lead de ${lead.name}?`)) {
                                onDeleteLead(lead.id);
                              }
                            }}
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
        )
      )}
    </div>
  );
};
