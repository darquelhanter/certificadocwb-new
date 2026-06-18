import React, { useState } from 'react';
import { Search, ShieldAlert, BadgeCheck, Clock, Calendar, CheckCircle, Smartphone, Key, Info } from 'lucide-react';
import { CertificateData } from '../types';
import { CertificateTemplate } from './CertificateTemplate';

interface ValidateTabProps {
  certificates: CertificateData[];
  initialSelected?: CertificateData | null;
  onClearSelection?: () => void;
}

export const ValidateTab: React.FC<ValidateTabProps> = ({ 
  certificates, 
  initialSelected, 
  onClearSelection 
}) => {
  const [code, setCode] = useState('');
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<{
    searched: boolean;
    found: boolean;
    cert?: CertificateData;
  }>({ searched: false, found: false });

  React.useEffect(() => {
    if (initialSelected) {
      setCode(initialSelected.id);
      setResult({
        searched: true,
        found: true,
        cert: initialSelected,
      });
    }
  }, [initialSelected]);

  const handleValidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setSearching(true);
    setResult({ searched: false, found: false });

    // Instantly simulate cryptographic secure database node resolve
    setTimeout(() => {
      const query = code.trim().toUpperCase();
      const match = certificates.find(c => c.id.toUpperCase() === query);

      setSearching(false);
      setResult({
        searched: true,
        found: !!match,
        cert: match,
      });
    }, 600);
  };

  const handleUseDemoCode = (demoId: string) => {
    setCode(demoId);
  };

  return (
    <div className="space-y-6">
      {/* Search Console header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm max-w-3xl mx-auto">
        <div className="text-center space-y-3 my-2">
          <div className="inline-flex p-3 rounded-full bg-indigo-50 text-indigo-600">
            <BadgeCheck className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Verificação de Autenticidade ICP-Brasil</h2>
          <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
            Consulte o status de validade, data de expiração e chaves de homologação do seu certificado e-CPF ou e-CNPJ emitidos pela Certificado CWB.
          </p>

          {/* Quick suggestions to make the app interactive and fun! */}
          {certificates.length > 0 && (
            <div className="text-xs text-slate-400 bg-slate-50 py-1.5 px-3 rounded-lg border border-slate-100 inline-block">
              Sugestão de teste local:&nbsp;
              <button
                type="button"
                onClick={() => handleUseDemoCode(certificates[0].id)}
                className="font-mono text-indigo-600 font-bold hover:underline"
              >
                {certificates[0].id}
              </button>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleValidate} className="max-w-md mx-auto mt-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Ex. CWB-2026-X79Y3"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50/70 border border-slate-250 focus:bg-white focus:outline-none focus:border-indigo-600 font-mono text-xs tracking-wider uppercase rounded-xl"
              />
            </div>
            <button
              id="btn-validate"
              type="submit"
              disabled={searching}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-xl transition-all disabled:opacity-50"
            >
              {searching ? 'Pesquisando...' : 'Consultar'}
            </button>
          </div>
        </form>
      </div>

      {/* Loading animation */}
      {searching && (
        <div className="flex flex-col items-center justify-center py-10 space-y-2">
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-[10px] text-slate-500 font-mono">Consolidador AC Verificadora...</span>
        </div>
      )}

      {/* Verification result details */}
      {result.searched && (
        <div className="animate-fade-in duration-200">
          {result.found && result.cert ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Technical properties list column */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-sm space-y-4">
                  <div className="flex justify-between items-center bg-emerald-50 text-emerald-800 px-3 py-2 rounded-xl border border-emerald-200">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-xs">Assinatura Certificada</span>
                    </div>
                    <span className="text-[9px] font-mono font-bold bg-white text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-300">VALIDA</span>
                  </div>

                  <div className="space-y-3.5 text-slate-700 text-xs">
                    <div className="border-b border-slate-100 pb-2">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider mb-0.5">Nome do Titular</span>
                      <span className="font-bold text-slate-800 text-sm capitalize">{result.cert.holderName}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider mb-0.5">Identificador Local</span>
                        <span className="font-mono text-slate-800 font-semibold select-all">{result.cert.holderDoc}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider mb-0.5">Tipo do Certificado</span>
                        <span className="font-semibold text-slate-800 uppercase">{result.cert.certificateType.replace('_', ' ')}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider mb-0.5">Data de Emissão</span>
                        <span className="font-semibold text-slate-800 flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{new Date(result.cert.issueDate).toLocaleDateString('pt-BR')}</span>
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider mb-0.5">Vencimento em</span>
                        <span className="font-semibold text-slate-800 flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{new Date(result.cert.expiryDate).toLocaleDateString('pt-BR')}</span>
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 space-y-1">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider mb-0.5">Crypto Serial Code</span>
                      <span className="font-mono text-slate-500 text-[10px] block truncate select-all">{result.cert.serialNumber}</span>
                    </div>
                  </div>
                </div>

                {/* Additional secure trust badge box */}
                <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-3">
                  <div className="flex items-center space-x-2.5 text-indigo-400">
                    <Key className="w-5 h-5" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Segurança de Validação</h4>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Este certificado digital foi validado através de videoconferência de alta definição licenciada pela Certificado CWB e está devidamente registrado na ICP-Brasil no âmbito de todas as diretrizes da Infraestrutura de Chaves Públicas Brasileira.
                  </p>
                </div>
              </div>

              {/* Certificate layout visual view */}
              <div className="lg:col-span-7">
                <div className="bg-slate-900/5 p-4 rounded-3xl border border-slate-200/50">
                  <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-200/30">
                    <CertificateTemplate data={result.cert} />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-6 text-center max-w-md mx-auto space-y-2">
              <div className="inline-flex p-2.5 rounded-full bg-rose-100 text-rose-600">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold">Código Inválido</h3>
              <p className="text-xs text-rose-700/80 leading-normal">
                O código de verificação <strong className="font-mono text-rose-900">{code}</strong> não corresponde a nenhum certificado digital cadastrado na Certificado CWB. Por favor, verifique a digitação.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
