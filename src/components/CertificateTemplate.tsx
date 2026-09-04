import React from 'react';
import { create as createQRCode } from 'qrcode';
import { ShieldCheck, Calendar, FileText, User, Building, Cpu, Globe, Check, Lock } from 'lucide-react';
import { CertificateData, CertificateTemplateType } from '../types';

interface CertificateTemplateProps {
  data: CertificateData;
  scale?: boolean;
}

export const CertificateTemplate: React.FC<CertificateTemplateProps> = ({ data, scale = false }) => {
  const { id, holderName, holderDoc, certificateType, issuerName, issueDate, expiryDate, serialNumber, status } = data;

  const getTypeName = (type: CertificateTemplateType) => {
    switch (type) {
      case 'ecpf_a1': return 'e-CPF A1 (Digital em Tela/Arquivo)';
      case 'ecpf_a3': return 'e-CPF A3 (Físico em Cartão/Token)';
      case 'ecnpj_a1': return 'e-CNPJ A1 (Digital em Tela/Arquivo)';
      case 'ecnpj_a3': return 'e-CNPJ A3 (Físico em Cartão/Token)';
      default: return 'Certificado Digital';
    }
  };

  const getThemeClass = (type: CertificateTemplateType) => {
    switch (type) {
      case 'ecpf_a1':
        return {
          bg: 'bg-gradient-to-br from-slate-900 via-slate-950 to-[#0c1e36]',
          border: 'border-cyan-500/40',
          textAccent: 'text-cyan-400',
          badgeClass: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
          gradientText: 'from-cyan-400 to-blue-500',
          mesh: 'radial-gradient(circle at 10% 20%, rgba(6, 182, 212, 0.1) 0%, transparent 40%)'
        };
      case 'ecpf_a3':
        return {
          bg: 'bg-gradient-to-br from-slate-900 via-slate-950 to-[#1e153b]',
          border: 'border-fuchsia-500/40',
          textAccent: 'text-fuchsia-400',
          badgeClass: 'bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/30',
          gradientText: 'from-fuchsia-400 to-pink-500',
          mesh: 'radial-gradient(circle at 10% 20%, rgba(217, 70, 239, 0.1) 0%, transparent 40%)'
        };
      case 'ecnpj_a1':
        return {
          bg: 'bg-gradient-to-br from-slate-900 via-slate-950 to-[#0f2c22]',
          border: 'border-emerald-500/40',
          textAccent: 'text-emerald-400',
          badgeClass: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
          gradientText: 'from-emerald-400 to-teal-500',
          mesh: 'radial-gradient(circle at 10% 20%, rgba(16, 185, 129, 0.1) 0%, transparent 40%)'
        };
      case 'ecnpj_a3':
        return {
          bg: 'bg-gradient-to-br from-slate-900 via-slate-950 to-[#271d0d]',
          border: 'border-[#c5a85c]/50',
          textAccent: 'text-[#dfc584]',
          badgeClass: 'bg-[#c5a85c]/10 text-[#dfc584] border-[#c5a85c]/30',
          gradientText: 'from-[#dfc584] to-[#a8893d]',
          mesh: 'radial-gradient(circle at 10% 20%, rgba(197, 168, 92, 0.1) 0%, transparent 40%)'
        };
    }
  };

  const currentTheme = getThemeClass(certificateType);

  // Real QR code encoding the public validation URL for this certificate
  const validationUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?validar=${encodeURIComponent(id)}`
    : `https://certificadocwb.com.br/?validar=${encodeURIComponent(id)}`;

  const qrModules = createQRCode(validationUrl, { errorCorrectionLevel: 'M' }).modules;
  const qrSize = qrModules.size;

  const CertificateQR = () => (
    <div className="w-16 h-16 bg-white p-1 rounded-lg flex items-center justify-center shrink-0 border border-slate-700/50">
      <svg viewBox={`0 0 ${qrSize} ${qrSize}`} className="w-full h-full text-slate-950" shapeRendering="crispEdges" role="img" aria-label={`QR Code de validação do certificado ${id}`}>
        <rect x="0" y="0" width={qrSize} height={qrSize} fill="white" />
        {Array.from({ length: qrSize }).map((_, row) =>
          Array.from({ length: qrSize }).map((_, col) =>
            qrModules.get(row, col) ? (
              <rect key={`${row}-${col}`} x={col} y={row} width={1} height={1} fill="currentColor" />
            ) : null
          )
        )}
      </svg>
    </div>
  );

  return (
    <div 
      id={`certificate-visual-${id}`}
      className={`relative aspect-[1.58/1] w-full ${currentTheme.bg} rounded-3xl p-6 sm:p-8 border-2 ${currentTheme.border} text-slate-200 overflow-hidden shadow-2xl transition-all duration-300 font-sans`}
      style={{ backgroundImage: currentTheme.mesh }}
    >
      {/* Dynamic tech grid design dots overlay */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 0)', backgroundSize: '16px 16px' }} />
      
      {/* Top Header line of the smartcard/diploma */}
      <div className="flex justify-between items-start border-b border-slate-800/65 pb-4 mb-4 select-none">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center">
            {certificateType.startsWith('ecnpj') ? (
              <Building className="w-5 h-5 text-[#dfc584]" />
            ) : (
              <User className="w-5 h-5 text-cyan-400" />
            )}
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">AUTORIDADE EMISSORA</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <h3 className="text-xs font-bold text-white uppercase tracking-tight">{issuerName}</h3>
          </div>
        </div>

        {/* Status badges */}
        <div className="flex items-center space-x-2">
          <div className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded border ${currentTheme.badgeClass}`}>
            ICP-BRASIL HOMOLOGADO
          </div>
          <div className="text-[9px] font-mono font-black uppercase px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded flex items-center space-x-1">
            <span className="w-1 h-1 rounded-full bg-emerald-400" />
            <span>ATIVO</span>
          </div>
        </div>
      </div>

      {/* Main card body with hologram */}
      <div className="grid grid-cols-12 gap-4 items-center">
        {/* Hologram card chip emulation and holder name (starts in col-9) */}
        <div className="col-span-8 space-y-3">
          <div className="flex items-center space-x-3 select-none">
            {/* Embedded Smartcard Chip emulator graphic */}
            <div className="w-9 h-7 rounded bg-gradient-to-br from-[#dfc584] to-[#a8893d] p-0.5 border border-amber-300/20 relative overflow-hidden flex flex-col justify-between shrink-0">
              <div className="h-full w-full border-[0.5px] border-amber-900/10 rounded flex grid grid-cols-3 gap-[1px] p-[1px]">
                <div className="border-[0.5px] border-amber-900/20" />
                <div className="border-[0.5px] border-amber-900/20" />
                <div className="border-[0.5px] border-amber-900/20" />
                <div className="border-[0.5px] border-amber-900/20" />
                <div className="border-[0.5px] border-amber-900/20" />
                <div className="border-[0.5px] border-amber-900/20" />
              </div>
            </div>
            <span className={`text-[11px] font-mono uppercase tracking-[0.25em] font-black bg-clip-text text-transparent bg-gradient-to-r ${currentTheme.gradientText}`}>
              {getTypeName(certificateType).split(' ')[0]}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block select-none">TITULAR DO CERTIFICADO</span>
            <span className="text-base sm:text-lg font-bold text-white block truncate select-all capitalize hover:text-indigo-200 transition-colors">
              {holderName || 'NOME DO TITULAR'}
            </span>
            <span className="text-xs font-mono text-slate-400 block select-all">
              {certificateType.startsWith('ecnpj') ? 'CNPJ: ' : 'CPF: '} {holderDoc || '000.000.000-00'}
            </span>
          </div>
        </div>

        {/* QR Code and Certificate Code verification */}
        <div className="col-span-4 flex flex-col items-end justify-center text-right space-y-2 select-none">
          <CertificateQR />
          <div className="space-y-0.5">
            <span className="text-[8px] text-slate-500 font-bold block">VERIFICAÇÃO DIGITAL</span>
            <span className="text-[10px] font-mono text-indigo-400 font-extrabold bg-slate-900/50 px-1.5 py-0.5 rounded border border-slate-800 tracking-wider inline-block select-all">
              {id}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom info section */}
      <div className="absolute bottom-4 left-6 right-6 flex justify-between items-end border-t border-slate-900 pt-3 select-none text-[9px] text-slate-500 font-sans">
        <div className="flex space-x-4">
          <div>
            <span className="block text-slate-600 font-bold uppercase tracking-[0.05em] text-[8px]">EMISSÃO</span>
            <span className="font-mono text-slate-400">{issueDate ? new Date(issueDate).toLocaleDateString('pt-BR') : 'Data'}</span>
          </div>
          <div>
            <span className="block text-slate-600 font-bold uppercase tracking-[0.05em] text-[8px]">EXPIRAÇÃO</span>
            <span className="font-mono text-slate-400">{expiryDate ? new Date(expiryDate).toLocaleDateString('pt-BR') : 'Data'}</span>
          </div>
        </div>

        <div className="text-right">
          <span className="block text-slate-600 font-bold uppercase tracking-[0.05em] text-[8px]">Crypto Serial Hash</span>
          <span className="font-mono text-slate-400 lowercase select-all truncate max-w-[120px] block">{serialNumber}</span>
        </div>
      </div>
    </div>
  );
};
