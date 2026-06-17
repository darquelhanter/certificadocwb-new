import React, { useState, useEffect } from 'react';
import { Award, User, Building, Landmark, ShieldCheck, ChevronRight, Hash, Sparkles } from 'lucide-react';
import { CertificateTemplateType, CertificateData } from '../types';

interface CertificateFormProps {
  onGenerate: (data: Omit<CertificateData, 'id'>) => void;
  activeTemplate: CertificateTemplateType;
  setActiveTemplate: (type: CertificateTemplateType) => void;
}

export const CertificateForm: React.FC<CertificateFormProps> = ({
  onGenerate,
  activeTemplate,
  setActiveTemplate,
}) => {
  const [holderName, setHolderName] = useState('');
  const [holderDoc, setHolderDoc] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [serialNumber, setSerialNumber] = useState('');

  // Auto-generate a realistic crypto serial hash on load
  const generateRandomHash = () => {
    const chars = '0123456789abcdef';
    let result = '';
    for (let i = 0; i < 32; i++) {
      if (i > 0 && i % 8 === 0) result += '-';
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  useEffect(() => {
    setSerialNumber(generateRandomHash());
  }, []);

  // Format document as user types
  const handleDocChange = (val: string) => {
    // Remove non-digits
    const digits = val.replace(/\D/g, '');
    
    if (activeTemplate.startsWith('ecpf')) {
      // CPF: 000.000.000-00
      let formatted = digits;
      if (digits.length > 3) formatted = digits.slice(0, 3) + '.' + digits.slice(3);
      if (digits.length > 6) formatted = formatted.slice(0, 7) + '.' + formatted.slice(7);
      if (digits.length > 9) formatted = formatted.slice(0, 11) + '-' + formatted.slice(11, 13);
      setHolderDoc(formatted.slice(0, 14));
    } else {
      // CNPJ: 00.000.000/0001-00
      let formatted = digits;
      if (digits.length > 2) formatted = digits.slice(0, 2) + '.' + digits.slice(2);
      if (digits.length > 5) formatted = formatted.slice(0, 6) + '.' + formatted.slice(6);
      if (digits.length > 8) formatted = formatted.slice(0, 10) + '/' + formatted.slice(10);
      if (digits.length > 12) formatted = formatted.slice(0, 15) + '-' + formatted.slice(15, 17);
      setHolderDoc(formatted.slice(0, 18));
    }
  };

  // Keep format correct when changing templates
  useEffect(() => {
    setHolderDoc('');
  }, [activeTemplate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!holderName.trim() || !holderDoc.trim()) {
      return alert('Por favor, preencha todos os campos do titular!');
    }

    // Auto calculate expiry date
    const dateObj = new Date(issueDate);
    if (activeTemplate.endsWith('a1')) {
      dateObj.setFullYear(dateObj.getFullYear() + 1); // A1 lasts 1 year
    } else {
      dateObj.setFullYear(dateObj.getFullYear() + 3); // A3 lasts 3 years
    }
    const expiryDate = dateObj.toISOString().split('T')[0];

    onGenerate({
      holderName: holderName.trim(),
      holderDoc: holderDoc.trim(),
      certificateType: activeTemplate,
      issuerName: 'Certificado CWB AC',
      issueDate,
      expiryDate,
      serialNumber,
      status: 'active',
    });

    // Reset some values
    setHolderName('');
    setHolderDoc('');
    setSerialNumber(generateRandomHash());
  };

  const templates: { id: CertificateTemplateType; name: string; duracao: string; desc: string; style: string }[] = [
    { 
      id: 'ecpf_a1', 
      name: 'e-CPF A1 Digital', 
      duracao: '1 Ano / 12 Meses',
      desc: 'Instalado diretamente no computador ou navegador. Ideal para assinar do celular.',
      style: 'border-cyan-500 text-cyan-400 bg-slate-950/20'
    },
    { 
      id: 'ecpf_a3', 
      name: 'e-CPF A3 Físico', 
      duracao: '3 Anos / 36 Meses',
      desc: 'Armazenamento seguro em mídia criptográfica física (Cartão ou Token USB).',
      style: 'border-fuchsia-500 text-fuchsia-400 bg-slate-950/20'
    },
    { 
      id: 'ecnpj_a1', 
      name: 'e-CNPJ A1 Digital', 
      duracao: '1 Ano / 12 Meses',
      desc: 'Perfeito para emissão automatizada de notas fiscais (NF-e, NFS-e) no servidor.',
      style: 'border-emerald-500 text-emerald-400 bg-slate-950/20'
    },
    { 
      id: 'ecnpj_a3', 
      name: 'e-CNPJ A3 Físico', 
      duracao: '3 Anos / 36 Meses',
      desc: 'Chaves criptográficas guardadas em token com nível máximo de segurança.',
      style: 'border-amber-500 text-amber-500 bg-slate-950/20'
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-5">
      <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
        <Sparkles className="w-5 h-5 text-indigo-600" />
        <h2 className="text-lg font-bold text-slate-800">Simulador de Emissão</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Swatches selector for certificate options */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2" id="style-choices-label">
            Escolha o Tipo de Certificado
          </label>
          <div role="group" aria-labelledby="style-choices-label" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {templates.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => setActiveTemplate(tpl.id)}
                className={`flex flex-col text-left p-3 rounded-xl border transition-all relative overflow-hidden ${
                  activeTemplate === tpl.id 
                    ? 'border-indigo-600 ring-2 ring-indigo-600/10 shadow-sm bg-indigo-50/10' 
                    : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex justify-between items-center w-full">
                  <span className="font-semibold text-xs text-slate-800">{tpl.name}</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-slate-100 font-bold text-slate-500">{tpl.duracao}</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 lines-2 leading-relaxed">{tpl.desc}</p>
                {activeTemplate === tpl.id && (
                  <div className="absolute top-1 right-1">
                    <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic fields based on choice */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1" htmlFor="holder-name-field">
              {activeTemplate.startsWith('ecnpj') ? 'Razão Social ou Responsável Legal' : 'Nome Completo do Titular'} <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                {activeTemplate.startsWith('ecnpj') ? <Building className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </span>
              <input
                id="holder-name-field"
                type="text"
                placeholder={activeTemplate.startsWith('ecnpj') ? "Ex: Padaria CWB LTDA" : "Ex: Maurício de Souza Silva"}
                required
                value={holderName}
                onChange={(e) => setHolderName(e.target.value)}
                className="w-full bg-slate-50/70 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-indigo-600 focus:bg-white transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1" htmlFor="holder-doc-field">
                {activeTemplate.startsWith('ecnpj') ? 'CNPJ' : 'CPF'} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                  <Landmark className="w-4 h-4" />
                </span>
                <input
                  id="holder-doc-field"
                  type="text"
                  placeholder={activeTemplate.startsWith('ecnpj') ? "00.000.000/0001-00" : "000.000.000-00"}
                  required
                  value={holderDoc}
                  onChange={(e) => handleDocChange(e.target.value)}
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-indigo-600 focus:bg-white transition text-slate-700 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1" htmlFor="issue-date-field">
                Data de Emissão
              </label>
              <input
                id="issue-date-field"
                type="date"
                required
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full bg-slate-50/70 border border-slate-200 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-indigo-600 focus:bg-white transition text-slate-700"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider" htmlFor="serial-field">
                Serial Criptográfico Auto-Gerado
              </label>
              <button
                type="button"
                onClick={() => setSerialNumber(generateRandomHash())}
                className="text-[10px] text-indigo-600 font-medium hover:underline"
              >
                Regerar Chave
              </button>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <Hash className="w-4 h-4" />
              </span>
              <input
                id="serial-field"
                type="text"
                readOnly
                value={serialNumber}
                className="w-full bg-slate-100 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-mono text-slate-500 select-all"
              />
            </div>
          </div>
        </div>

        {/* Call to action trigger */}
        <button
          id="btn-generate-cwb-cert"
          type="submit"
          className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold py-2.5 px-4 rounded-xl shadow-md flex items-center justify-center space-x-2 group transition-all"
        >
          <span>Emitir & Guardar Registro</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </form>
    </div>
  );
};
