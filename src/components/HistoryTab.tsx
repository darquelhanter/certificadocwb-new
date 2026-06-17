import React, { useState } from 'react';
import { Search, Copy, Printer, Check, Plus, ClipboardCheck, Trash2, Building, User } from 'lucide-react';
import { CertificateData } from '../types';

interface HistoryTabProps {
  certificates: CertificateData[];
  onSelect: (cert: CertificateData) => void;
  onDelete: (id: string) => void;
  onGoToCreate: () => void;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({
  certificates,
  onSelect,
  onDelete,
  onGoToCreate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Livro de Registros Locais</h2>
          <p className="text-xs text-slate-400">Total de {certificates.length} certificados ativos salvos temporariamente</p>
        </div>

        <div className="w-full sm:w-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por titular, documento ou ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-indigo-600 rounded-xl text-xs"
          />
        </div>
      </div>

      {certificates.length === 0 ? (
        <div className="text-center py-10 px-4 space-y-4 max-w-sm mx-auto">
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
          Nenhum registro encontrado para a busca "{searchTerm}".
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
            <tbody className="divide-y divide-slate-100 text-slate-705">
              {filteredCerts.map((cert) => (
                <tr
                  key={cert.id}
                  onClick={() => onSelect(cert)}
                  className="hover:bg-slate-50/70 cursor-pointer transition-colors group"
                >
                  {/* Holder info */}
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

                  {/* Certificate Type */}
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

                  {/* Expiry Date */}
                  <td className="p-4 font-mono text-slate-500">
                    {new Date(cert.expiryDate).toLocaleDateString('pt-BR')}
                  </td>

                  {/* Verification ID with copy btn */}
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

                  {/* Actions column */}
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
                        <Printer className="w-4 h-4" />
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
      )}
    </div>
  );
};
