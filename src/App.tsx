import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, 
  ShieldCheck, 
  CheckCircle, 
  Search, 
  ChevronRight, 
  Sparkles, 
  Info, 
  HelpCircle, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  UserCheck, 
  Cpu, 
  ExternalLink,
  ChevronDown,
  Building,
  User,
  Hash,
  Share2,
  Calendar,
  Lock,
  ArrowRight,
  ThumbsUp,
  BookOpen,
  Printer,
  Video
} from 'lucide-react';
import { CertificateData, CertificateTemplateType, LeadData, BlogPost, SubmittedLead } from './types';
import { CertificateTemplate } from './components/CertificateTemplate';
import { CertificateForm } from './components/CertificateForm';
import { ValidateTab } from './components/ValidateTab';
import { HistoryTab } from './components/HistoryTab';

// Authentic mock blog articles
const BLOG_ARTICLES: BlogPost[] = [
  {
    slug: 'diferenca-a1-a3',
    title: 'Certificado Digital A1 vs A3: Qual a melhor opção para você ou sua empresa?',
    excerpt: 'Entenda de forma prática e descomplicada a diferença entre os formatos em arquivo digital (A1) e mídias físicas como tokens e cartões (A3).',
    content: 'O mercado de certificação digital oferece duas categorias principais: o Certificado A1 e o Certificado A3. Cada um atende a diferentes necessidades corporativas e pessoais.\n\n### O que é o Certificado A1?\nO certificado A1 é gerado e instalado diretamente no computador ou dispositivo. Ele consiste em um arquivo digital (geralmente formato .pfx) protegido por senha.\n- **Validade:** 12 meses (1 ano).\n- **Vantagens:** Pode ser instalado em vários computadores simultaneamente, pode ser integrado a servidores de faturamento automático de notas fiscais nas nuvens e não corre o risco de perda ou fadiga de hardware.\n\n### O que é o Certificado A3?\nO certificado A3 é armazenado em uma mídia criptográfica física externa - um cartão inteligente com leitora ou um token USB.\n- **Validade:** Até 36 meses (3 anos).\n- **Vantagens:** Oferece inviolabilidade de hardware absoluta, pois as chaves privadas nunca saem do chip físico. Ideal para assinaturas pessoais de advogados (PJe), médicos e representantes que demandam mobilidade de hardware físico e longa durabilidade.',
    coverImage: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
    publishDate: '2026-06-12',
    readingTime: '4 min de leitura',
    category: 'Segurança'
  },
  {
    slug: 'videoconferencia-passos',
    title: 'Como funciona a emissão de certificado digital por videoconferência?',
    excerpt: 'Não precisa mais se deslocar! Descubra como emitir seu e-CPF ou e-CNPJ na comodidade da sua casa ou escritório em Curitiba em poucos minutos.',
    content: 'Com as novas resoluções do ITI (Instituto Nacional de Tecnologia da Informação), é possível autenticar e emitir certificados digitais 100% online por videoconferência.\n\n### Quem pode emitir por videoconferência?\nQualquer cidadão brasileiro que possua Carteira Nacional de Habilitação (CNH) ou dados biométricos já cadastrados na Justiça Eleitoral / ICP-Brasil.\n\n### O passo a passo simples:\n1. **Agendamento:** Você escolhe o seu certificado e agenda um horário de sua conveniência.\n2. **Envio de Documentos:** Envia de forma digitalizada fotos de seus documentos pessoais (RG/CNH e contrato social no caso de empresas).\n3. **A Chamada:** Um agente oficial da Certificado CWB fará uma rápida chamada de vídeo de 5 minutos para validar sua face e conferir os dados.\n4. **Pronto para download:** Imediatamente após a chamada, o link para instalação do seu certificado A1 é enviado diretamente para o seu WhatsApp!',
    coverImage: 'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?auto=format&fit=crop&w=800&q=80',
    publishDate: '2026-06-15',
    readingTime: '3 min de leitura',
    category: 'Tecnologia'
  },
  {
    slug: 'e-social-obrigacoes',
    title: 'e-Social e obrigações fiscais: Evite multas usando seu certificado Digital',
    excerpt: 'Conselhos indispensáveis sobre contabilidade digital, emissão de folhas de pagamento e envio de dados tributários com segurança total.',
    content: 'O e-Social unificou o envio de informações trabalhistas, previdenciárias e fiscais das empresas em todo o território nacional. Para garantir a propriedade jurídica dessas informações e evitar multas severas, o certificado digital e-CNPJ ou e-CPF do representante legal é essencial.\n\n### Principais utilizações do certificado digital no e-Social:\n- Envio de declarações de admissão e demissão de funcionários.\n- Consulta integrada de tributos e FGTS.\n- Assinatura digital da folha de pagamentos mensal.\n\nContar com um certificado e-CNPJ A1 facilita muito a operação de contabilidades parceiras, pois é possível outorgar procurações eletrônicas diretas no portal da Receita Federal (e-CAC).',
    coverImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
    publishDate: '2026-05-28',
    readingTime: '5 min de leitura',
    category: 'Contabilidade'
  }
];

// Curitiba local trust-based pre-populated certificates
const INITIAL_DEMO_DATA: CertificateData[] = [
  {
    id: 'CWB-2526-X9A72',
    holderName: 'Mercado Municipal de Curitiba Secos LTDA',
    holderDoc: '12.345.678/0001-90',
    certificateType: 'ecnpj_a1',
    issuerName: 'Certificado CWB AC',
    issueDate: '2026-05-10',
    expiryDate: '2027-05-10',
    serialNumber: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    status: 'active',
  },
  {
    id: 'CWB-2526-Z3B45',
    holderName: 'Gabriel Requião de Souza Silva',
    holderDoc: '098.765.432-11',
    certificateType: 'ecpf_a3',
    issuerName: 'Certificado CWB AC',
    issueDate: '2026-06-01',
    expiryDate: '2029-06-01',
    serialNumber: '2f3a4b5c-6d7e-8f9a-0b1c-2d3e4f5a6b7c',
    status: 'active',
  },
  {
    id: 'CWB-2526-P8N11',
    holderName: 'Paraná Inovações Tecnológicas S.A.',
    holderDoc: '45.981.112/0001-20',
    certificateType: 'ecnpj_a3',
    issuerName: 'Certificado CWB AC',
    issueDate: '2026-06-12',
    expiryDate: '2029-06-12',
    serialNumber: 'feedbabe-cafe-dead-beef-1234567890ab',
    status: 'active',
  }
];

export default function App() {
  const [certificates, setCertificates] = useState<CertificateData[]>(() => {
    const stored = localStorage.getItem('certificadocwb_records');
    return stored ? JSON.parse(stored) : INITIAL_DEMO_DATA;
  });

  const [submittedLeads, setSubmittedLeads] = useState<SubmittedLead[]>(() => {
    const stored = localStorage.getItem('certificadocwb_leads');
    return stored ? JSON.parse(stored) : [];
  });

  const [activeTab, setActiveTab] = useState<'home' | 'validate' | 'blog' | 'history'>('home');
  const [activeTemplate, setActiveTemplate] = useState<CertificateTemplateType>('ecpf_a1');
  const [justGenerated, setJustGenerated] = useState<CertificateData | null>(null);
  const [selectedForPreview, setSelectedForPreview] = useState<CertificateData | null>(null);

  // Lead feedback variables
  const [leadForm, setLeadForm] = useState<LeadData>({
    name: '',
    email: '',
    phone: '',
    city: 'Curitiba',
    interestType: 'general',
    message: ''
  });
  const [leadSuccess, setLeadSuccess] = useState(false);
  const [activeArticle, setActiveArticle] = useState<BlogPost | null>(null);
  const [pricingFilter, setPricingFilter] = useState<'all' | 'ecpf' | 'ecnpj'>('all');

  // FAQ Expand tracker
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);

  // Sync state to localstorage
  useEffect(() => {
    localStorage.setItem('certificadocwb_records', JSON.stringify(certificates));
  }, [certificates]);

  useEffect(() => {
    localStorage.setItem('certificadocwb_leads', JSON.stringify(submittedLeads));
  }, [submittedLeads]);

  // Generate unique certificate key
  const generateUniqueId = () => {
    const year = new Date().getFullYear();
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `CWB-${year}-${code}`;
  };

  const handleGenerateCertificate = (formData: Omit<CertificateData, 'id'>) => {
    const id = generateUniqueId();
    const newCert: CertificateData = {
      ...formData,
      id
    };

    setCertificates(prev => [newCert, ...prev]);
    setJustGenerated(newCert);
    setSelectedForPreview(newCert);
    setActiveTab('validate'); // Bring them to visual validator to appreciate the card!
  };

  const handleDeleteCertificate = (id: string) => {
    setCertificates(prev => prev.filter(c => c.id !== id));
    if (selectedForPreview?.id === id) {
      setSelectedForPreview(null);
    }
    if (justGenerated?.id === id) {
      setJustGenerated(null);
    }
  };

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const leadId = `CWB-LEAD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newLead: SubmittedLead = {
      ...leadForm,
      id: leadId,
      date: new Date().toISOString(),
      status: 'pending'
    };
    setSubmittedLeads(prev => [newLead, ...prev]);
    setLeadSuccess(true);
  };

  const handleUpdateLeadStatus = (id: string, status: 'pending' | 'contacted' | 'completed') => {
    setSubmittedLeads(prev => prev.map(lead => lead.id === id ? { ...lead, status } : lead));
  };

  const handleDeleteLead = (id: string) => {
    setSubmittedLeads(prev => prev.filter(lead => lead.id !== id));
  };

  // Pricing constants mapping
  const PRICING_PLANS = [
    {
      id: 'ecpf_a1' as CertificateTemplateType,
      title: 'e-CPF A1 Digital',
      price: '119',
      duration: '1 Ano / 12 Meses',
      badge: 'Mais Recomendado',
      desc: 'Ideal para declaração de IRPF, acesso ao portal e-CAC, assinatura de contratos e prefeituras em Curitiba.',
      features: [
        'Instalação no computador ou navegador',
        'Emissão 100% online por videoconferência',
        'Suporte técnico especializado em Curitiba',
        'Compatível com Windows, MacOS e Linux',
        'Pode ser feito cópia de segurança'
      ],
      whatsappLink: 'https://wa.me/5541992447846?text=Olá!%20Tenho%20interesse%20em%20emitir%20o%20certificado%20e-CPF%20A1%20Digital%20pelo%20site%20certificadocwb.com.br.%20Gostaria%20de%20receber%20orientações%20sobre%20a%20documentação%20necessária%20e%20o%20processo%20de%20emissão.%20Aguardo%20seu%20retorno.%20Obrigado!'
    },
    {
      id: 'ecpf_a3' as CertificateTemplateType,
      title: 'e-CPF A3 Físico',
      price: '229',
      duration: '3 Anos / 36 Meses',
      badge: 'Máxima Segurança',
      desc: 'Perfeito para advogados credenciados no Projudi, médicos credenciados e profissionais liberais.',
      features: [
        'Armazenamento físico em mídia criptográfica',
        'Válido por 3 anos inteiros',
        'Opção de Token USB ou Cartão inteligente',
        'Videoconferência rápida inclusa',
        'Inviolabilidade absoluta das chaves privadas'
      ],
      whatsappLink: 'https://wa.me/5541992447846?text=Olá!%20Tenho%20interesse%20em%20emitir%20o%20certificado%20e-CPF%20A3%20Físico%20pelo%20site%20certificadocwb.com.br.%20Gostaria%20de%20receber%20orientações%20sobre%20a%20documentação%20necessária,%20opções%20de%20mídia%20e%20o%20processo%20de%20emissão.%20Aguardo%20seu%20retorno.%20Obrigado!'
    },
    {
      id: 'ecnpj_a1' as CertificateTemplateType,
      title: 'e-CNPJ A1 Digital',
      price: '179',
      duration: '1 Ano / 12 Meses',
      badge: 'Essencial PME',
      desc: 'Desenvolvido para emissão automatizada de NF-e, NFS-e e conexão de servidores de contabilidade na nuvem.',
      features: [
        'Integração com ERPs e emissores na nuvem',
        'Outorga fácil para o seu contador de confiança',
        'Acesso irrestrito ao Conectividade Social',
        'Emissão rápida por videochamada do celular',
        'Atendimento prioritário humanizado'
      ],
      whatsappLink: 'https://wa.me/5541992447846?text=Olá!%20Tenho%20interesse%20em%20emitir%20o%20certificado%20e-CNPJ%20A1%20Digital%20da%20minha%20empresa%20pelo%20site%20certificadocwb.com.br.%20Gostaria%20de%20receber%20orientações%20sobre%20os%20documentos%20exigidos%20e%20as%20etapas%20de%20emissão.%20Aguardo%20seu%20retorno.%20Obrigado!'
    },
    {
      id: 'ecnpj_a3' as CertificateTemplateType,
      title: 'e-CNPJ A3 Físico',
      price: '329',
      duration: '3 Anos / 36 Meses',
      badge: 'Alta Estabilidade',
      desc: 'Perfeito para empresas de médio/grande porte que exigem alto tempo de expiração e mídia rígida de proteção.',
      features: [
        'Válido por 36 meses consecutivos',
        'Segurança criptográfica inviolável',
        'Cartão rígido ou chaveiro Token USB robusto',
        'Ideal para assinatura de grandes contratos',
        'Suporte prioritário na instalação em rede'
      ],
      whatsappLink: 'https://wa.me/5541992447846?text=Olá!%20Tenho%20interesse%20em%20emitir%20o%20certificado%20e-CNPJ%20A3%20Físico%20da%20minha%20empresa%20pelo%20site%20certificadocwb.com.br.%20Gostaria%20de%20receber%20orientações%20sobre%20a%20documentação%20necessária,%20opções%20de%20mídia%20(Token/Cartão)%20e%20o%20processo%20de%20emissão.%20Aguardo%20seu%20retorno.%20Obrigado!'
    }
  ];

  const FAQS = [
    {
      q: 'O que é um Certificado Digital e-CPF e e-CNPJ?',
      a: 'O Certificado Digital funciona como a sua carteira de identidade jurídica e eletrônica no ambiente web. Ele garante autenticidade jurídica absoluta e segurança de criptografia criptográfica, permitindo realizar transações fiscais perante a Receita Federal, assinar contratos sem cartório civil e faturar notas fiscais com total amparo regulamentar no Brasil.'
    },
    {
      q: 'Como funciona a validação 100% online por videoconferência?',
      a: 'É um processo extremamente prático e rápido homologado pela ICP-Brasil. Após adquirir o plano conosco, agendamos uma rápida chamada de vídeo de 5 minutos utilizando seu celular ou computador. Um de nossos agentes credenciados faz as fotos de conformidade dos seus documentos pessoais. E o melhor: o certificado e-CPF ou e-CNPJ digital é gerado e baixado no mesmo instante, sem você precisar sair de casa!'
    },
    {
      q: 'Quais documentos são exigidos para a videoconferência?',
      a: 'Para Pessoa Física (e-CPF): Documento de Identificação com foto válido (como CNH, RG ou Carteira de Órgão de Classe como OAB/CRM). Para Pessoa Jurídica (e-CNPJ): Documento de constituição da empresa (como Contrato Social consolidado, CCMEI ou Requerimento de Empresário), além do documento pessoal do representante titular cadastrado perante a Receita Federal.'
    },
    {
      q: 'Qual a diferença técnica e prática entre os modelos A1 e A3?',
      a: 'O modelo A1 é um arquivo de criptografia gerado diretamente no computador com validade de 12 meses. Facilita muito a cópia de segurança e automação em servidores de notas fiscais ERP. O modelo A3 é armazenado fisicamente em dispositivo seguro externo (Token USB ou Cartão) com validade estendida de 3 anos, o que inviabiliza que as chaves sejam clonadas ou copiadas fora do objeto físico.'
    },
    {
      q: 'Posso utilizar o Certificado CWB em outras cidades fora de Curitiba?',
      a: 'Com certeza! Embora tenhamos nascido em Curitiba (por isso o nome CWB), a validação remota online por videoconferência atende clientes localizados em todo o estado do Paraná, em qualquer região do Brasil ou até mesmo residentes no exterior, bastando possuir rede de internet e documento biométrico nacional.'
    }
  ];

  const filteredPlans = PRICING_PLANS.filter(p => {
    if (pricingFilter === 'all') return true;
    return p.id.startsWith(pricingFilter);
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-16 selection:bg-indigo-600 selection:text-white">
      {/* Dynamic Screen Layout */}
      <div id="root-layout" className="space-y-0">
        
        {/* Banner Top Header bar */}
        <header className="bg-[#0f172a] text-white border-b border-slate-800 sticky top-0 z-50 backdrop-blur-md bg-opacity-95">
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Logo / Brand identity */}
            <div className="flex items-center space-x-3 cursor-pointer select-none" onClick={() => setActiveTab('home')}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-600/30">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-display font-bold tracking-tight text-white">
                  Certificado CWB
                </h1>
              </div>
            </div>

            {/* Desktop Navigation menus */}
            <nav className="flex flex-wrap items-center justify-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
              <button
                onClick={() => { setActiveTab('home'); setJustGenerated(null); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  activeTab === 'home' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                Início
              </button>
              <button
                onClick={() => { setActiveTab('validate'); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  activeTab === 'validate' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                Validar ICP
              </button>
              <button
                onClick={() => { setActiveTab('blog'); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  activeTab === 'blog' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                Blog / Ajuda
              </button>
              <button
                onClick={() => { setActiveTab('history'); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  activeTab === 'history' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                Registros ({certificates.length})
              </button>
            </nav>

            {/* Top CTA */}
            <a
              href="https://wa.me/5541992447846?text=Olá!%20Acessei%20o%20site%20certificadocwb.com.br%20e%20tenho%20interesse%20em%20emitir%20um%20certificado%20digital.%20Gostaria%20de%20receber%20orientações%20sobre%20o%20processo%20de%20emissão,%20documentação%20necessária%20e%20opções%20disponíveis.%20Aguardo%20seu%20retorno.%20Obrigado!"
              target="_blank"
              referrerPolicy="no-referrer"
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-1.5 transition-all select-none"
            >
              <Phone className="w-4 h-4" />
              <span>Emitir no WhatsApp</span>
            </a>
          </div>
        </header>

        {/* Dynamic content rendering with AnimatePresence */}
        <AnimatePresence mode="wait">
          
          {/* HOME LANDING PAGE VIEW */}
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-0"
            >
              {/* HERO SECTION */}
              <section className="relative overflow-hidden bg-slate-950 text-white py-14 sm:py-24 border-b border-slate-900">
                {/* Glowing aesthetic backdrop glow */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[550px] sm:w-[850px] h-[350px] bg-gradient-to-tr from-indigo-600/15 via-indigo-900/10 to-indigo-500/5 blur-[120px] pointer-events-none rounded-full" />
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 0)', backgroundSize: '24px 24px' }} />

                <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
                  <div className="space-y-6">
                    <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-500/10 text-indigo-300 rounded-full border border-indigo-500/20 text-xs font-semibold">
                      <span>Validação Digital com Cobertura e Validade em todo o Brasil</span>
                    </div>
                    
                    <h2 className="text-3xl sm:text-5xl font-display font-extrabold tracking-tight leading-none text-white">
                      Seu Certificado Digital em <span className="text-indigo-400 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-indigo-300 to-indigo-200">Minutos</span>
                    </h2>

                    <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
                      Emissão simplificada de e-CPF e e-CNPJ por videoconferência com segurança e validade jurídica em todo o território nacional. Tenha o seu certificado emitido e pronto de forma rápida, de onde você estiver.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
                      <button
                        onClick={() => {
                          const pricesSection = document.getElementById('pricing-anchored');
                          pricesSection?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg hover:shadow-indigo-600/25 transition-all flex items-center justify-center space-x-1.5"
                      >
                        <span>Ver Certificados e Preços</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Micro checkmarks */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-slate-900 text-slate-400 text-xs max-w-xl mx-auto">
                      <div className="flex items-center justify-center space-x-1.5">
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>Padrão ICP-Brasil</span>
                      </div>
                      <div className="flex items-center justify-center space-x-1.5">
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>Emissão de qualquer lugar do Brasil</span>
                      </div>
                      <div className="flex items-center justify-center space-x-1.5">
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>Videochamada em 5 minutos</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* STATS STRIP BANNER */}
              <section className="bg-white border-b border-slate-100 py-6 text-center shadow-xs">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <span className="block text-2xl font-bold font-display text-slate-800">15 Minutos</span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Prazo Médio de Validação</span>
                  </div>
                  <div>
                    <span className="block text-2xl font-bold font-display text-slate-800">100% Online</span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Emissão por Videoconferência</span>
                  </div>
                  <div>
                    <span className="block text-2xl font-bold font-display text-slate-800">ICP-Brasil</span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Validadores Oficiais</span>
                  </div>
                  <div>
                    <span className="block text-2xl font-bold font-display text-slate-800">R$ 119,00</span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Preço Mínimo Garantido</span>
                  </div>
                </div>
              </section>

              {/* WHY CHOOSE US SECTION */}
              <section className="max-w-7xl mx-auto px-4 py-16 space-y-10">
                <div className="text-center space-y-3">
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest block">Benefícios de Destaque</span>
                  <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-800">
                    Por que escolher a Certificado CWB?
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
                    Unimos atendimento regional especializado, suporte humanizado em Curitiba e a tecnologia mais ágil do Brasil para garantir a perfeita emissão das suas chaves criptográficas.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Item 1 */}
                  <div className="bg-white rounded-2xl p-6 border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-md transition-all space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Clock className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Atendimento Veloz</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Agendamento no mesmo dia com emissão em menos de 15 minutos via chamada de vídeo para maior otimização do seu tempo corporativo.
                    </p>
                  </div>

                  {/* Item 2 */}
                  <div className="bg-white rounded-2xl p-6 border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-md transition-all space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Suporte Curitibano Premium</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Suporte humanizado local em Curitiba pronto para tirar dúvidas de validação, senhas, PIN/PUK e guiar na correta instalação.
                    </p>
                  </div>

                  {/* Item 3 */}
                  <div className="bg-white rounded-2xl p-6 border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-md transition-all space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Lock className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Padrão Nacional de Segurança</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Nossos certificados são gerados sob rígidos padrões estabelecidos pela ICP-Brasil e possuem o mesmo valor de assinaturas de próprio punho.
                    </p>
                  </div>
                </div>
              </section>

              {/* HOW IT WORKS CHRONOLOGICAL TIMELINE */}
              <section className="bg-slate-50 border-y border-slate-200/60 py-16">
                <div className="max-w-7xl mx-auto px-4 space-y-12">
                  <div className="text-center space-y-3">
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest block font-mono">Sem Complicação</span>
                    <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 tracking-tight">
                      Entenda como funciona o processo de emissão do seu Certificado Digital
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
                      Para facilitar sua experiência, dividimos o processo de emissão em 5 etapas simples:
                    </p>
                  </div>

                  {/* 5 column cards styled to match the elegant site design */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 relative">
                    {[
                      { 
                        step: '1', 
                        title: 'Cadastro', 
                        desc: 'Preencha seus dados para que nossa equipe possa entrar em contato. Se preferir, você também pode nos chamar pelo WhatsApp logo após concluir o cadastro.' 
                      },
                      { 
                        step: '2', 
                        title: 'Pagamento', 
                        desc: 'Realize o pagamento referente ao certificado digital escolhido. Após a confirmação, daremos continuidade ao processo de emissão.' 
                      },
                      { 
                        step: '3', 
                        title: 'Envio da Documentação', 
                        desc: 'Envie seus documentos pessoais para análise. Recomendamos o envio da CNH, por ser um documento mais completo. Caso seja necessário, nossa equipe solicitará documentos complementares.' 
                      },
                      { 
                        step: '4', 
                        title: 'Validação de Identidade', 
                        desc: 'Você receberá um código de confirmação por SMS ou e-mail. Em seguida, basta acessar a sala de videoconferência no horário agendado, onde um de nossos atendentes realizará a validação dos seus dados.' 
                      },
                      { 
                        step: '5', 
                        title: 'Emissão do Certificado', 
                        desc: 'Após a aprovação da validação, seu certificado digital estará disponível para emissão. Caso tenha alguma dificuldade durante essa etapa, nossa equipe de suporte estará pronta para auxiliá-lo.' 
                      },
                    ].map((item, idx) => (
                      <div 
                        key={idx} 
                        className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-indigo-400 transition-all flex flex-col justify-between group relative overflow-hidden"
                      >
                        <div className="space-y-4">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-50 group-hover:bg-indigo-600 text-indigo-600 group-hover:text-white font-mono text-xs font-extrabold transition-all duration-300">
                              {item.step}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                              Passo {item.step}
                            </span>
                          </div>
                          <div className="space-y-2">
                            <h4 className="text-sm font-extrabold text-slate-800 group-hover:text-indigo-900 transition-colors">
                              {item.title}
                            </h4>
                            <p className="text-[11px] leading-relaxed text-slate-500 font-medium group-hover:text-slate-600 transition-colors">
                              {item.desc}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Clean footer step alignment line */}
                  <div className="text-center pt-2">
                    <p className="inline-flex items-center justify-center space-x-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-150 px-5 py-2.5 rounded-full shadow-2xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Pronto! Após a conclusão dessas etapas, seu Certificado Digital estará ativo e pronto para uso.</span>
                    </p>
                  </div>

                  {/* VIDEOCONFERENCIA CRITERIA AND PROCESS - HIGHLIGHT BANNER */}
                  <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-xs max-w-4xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    <div className="md:col-span-3 flex flex-col items-center justify-center text-center p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                      <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center mb-2 shadow-sm">
                        <Video className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-indigo-900 uppercase tracking-widest block">Videoconferência</span>
                      <span className="text-[10px] text-indigo-600 font-bold block mt-1">100% Online</span>
                    </div>

                    <div className="md:col-span-9 space-y-4">
                      <h4 className="text-base font-bold text-slate-800 flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block" />
                        <span>Requisitos e Passo a Passo da Vídeo</span>
                      </h4>
                      
                      <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                        <p className="bg-indigo-50/30 border-l-4 border-indigo-600 p-3 rounded-r-xl text-slate-700 font-medium">
                          <strong>Critérios de Aptidão:</strong> Para emitir seu certificado por videoconferência você deve atender a um desses 2 critérios: <strong>Ter CNH</strong> ou <strong>já ter feito certificado</strong>. Seguindo algum desses critérios você está apto.
                        </p>
                        
                        <div className="space-y-2 pt-1 border-t border-slate-100">
                          <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wide">Como é o processo da video? É bem simples:</h5>
                          <ol className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-1 text-[11px] text-slate-500">
                            <li className="flex items-start space-x-2">
                              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                              <span>Após o cadastro, enviamos um link para você acessar a sala da videoconferência.</span>
                            </li>
                            <li className="flex items-start space-x-2">
                              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                              <span>Após seu acesso à sala, tiramos sua foto e iniciamos a gravação.</span>
                            </li>
                            <li className="flex items-start space-x-2">
                              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
                              <span>Na video, nosso atendente faz algumas simples perguntas obrigatórias.</span>
                            </li>
                            <li className="flex items-start space-x-2">
                              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">4</span>
                              <span>Após as respostas, encerramos a gravação. Pronto, seu processo de emissão foi concluído!</span>
                            </li>
                          </ol>
                        </div>
                        
                        <p className="text-[11px] font-semibold text-indigo-600 flex items-center space-x-1.5 pt-2">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Mais praticidade para você com a mesma segurança!</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* PRODUCT PRICING MATRIX GRAPHICS */}
              <section id="pricing-anchored" className="max-w-7xl mx-auto px-4 py-16 space-y-10">
                <div className="text-center space-y-4">
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest block">Preços Transparentes</span>
                  <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-800">
                    Escolha a melhor opção para você ou sua empresa
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                    Sem letras miúdas. Sem surpresas ou taxas recorrentes ocultas. Apenas o melhor valor mercadológico de Curitiba.
                  </p>

                  {/* Filter switches */}
                  <div className="inline-flex bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                    <button
                      onClick={() => setPricingFilter('all')}
                      className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition ${
                        pricingFilter === 'all' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Ver Todos
                    </button>
                    <button
                      onClick={() => setPricingFilter('ecpf')}
                      className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition ${
                        pricingFilter === 'ecpf' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Pessoa Física (e-CPF)
                    </button>
                    <button
                      onClick={() => setPricingFilter('ecnpj')}
                      className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition ${
                        pricingFilter === 'ecnpj' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Pessoa Jurídica (e-CNPJ)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredPlans.map((plan) => (
                    <div 
                      key={plan.id}
                      className="bg-white rounded-3xl border border-slate-150 p-6 flex flex-col justify-between hover:shadow-lg hover:border-slate-300 transition-all relative overflow-hidden group"
                    >
                      {/* Top ribbon if recommended */}
                      {plan.badge && (
                        <div className="absolute top-3 right-3">
                          <span className="text-[9px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 border border-indigo-200/40 px-2 py-0.5 rounded-full">
                            {plan.badge}
                          </span>
                        </div>
                      )}

                      <div className="space-y-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase text-slate-400 font-mono tracking-wider">{plan.duration}</span>
                          <h4 className="text-lg font-bold text-slate-800">{plan.title}</h4>
                        </div>
                        
                        <p className="text-xs text-slate-400 leading-normal min-h-[64px]">{plan.desc}</p>
                        
                        <div className="py-2.5 border-y border-slate-100 flex items-baseline space-x-1.5">
                          <span className="text-xs font-bold text-slate-400 uppercase select-none">R$</span>
                          <span className="text-3xl font-display font-extrabold text-slate-800">{plan.price}</span>
                          <span className="text-xs text-slate-500 font-medium">/ emissão</span>
                        </div>

                        <ul className="space-y-2 text-slate-600 font-sans text-xs min-h-[140px] pt-2" role="list">
                          {plan.features.map((feat, i) => (
                            <li key={i} className="flex items-start space-x-1.5">
                              <span className="p-0.5 rounded-full bg-emerald-50 text-emerald-600 shrink-0 mt-0.5">
                                <CheckCircle className="w-3.5 h-3.5" />
                              </span>
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-6">
                        <a
                          href={`${plan.whatsappLink}`}
                          target="_blank"
                          referrerPolicy="no-referrer"
                          className="w-full bg-slate-900 group-hover:bg-indigo-600 text-white text-center font-bold text-xs py-2.5 px-3 rounded-xl shadow-md hover:shadow-indigo-600/10 block leading-tight transition"
                        >
                          Emitir por WhatsApp
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* CURITIBA LOCALITY / MAP OVERVIEW */}
              <section className="bg-slate-100/60 border-y border-slate-250/50 py-16">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
                  <div className="md:col-span-7 space-y-5">
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest block font-mono">Liderança em Curitiba (CWB)</span>
                    <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-850 tracking-tight text-slate-800">
                      Emitimos Chaves Digitais Oficiais em Curitiba, Paraná e no Conforto do Seu Lar
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xl">
                      Nascemos em Curitiba com o intuito de apoiar o ecossistema local de pequenas e médias empresas, comerciantes, contadores parceiros, cartórios de registro civil, imobiliárias e profissionais jurídicos.
                    </p>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xl">
                      Nossas emissões via videochamada são auditadas, seguras e possuem o aval regulamentar do ICP-Brasil, sendo aceitas em qualquer órgão federal, estadual ou prefeitura do país.
                    </p>

                    <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-700 pt-3">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-indigo-600" />
                        <span>Curitiba e Região Metropolitana</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Cpu className="w-4 h-4 text-indigo-600" />
                        <span>Servidores Criptográficos Rápidos</span>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-5 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                    <h4 className="font-bold text-sm text-slate-800">Cotação Instantânea / Retorno Rápido</h4>
                    <p className="text-[11px] text-slate-400">Preencha seus contatos e fale com o suporte humanizado em menos de 3 minutos!</p>

                    {leadSuccess ? (
                      <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl border border-emerald-200 text-center space-y-2 animate-fade-in">
                        <CheckCircle className="w-8 h-8 mx-auto text-emerald-600" />
                        <h5 className="font-bold text-xs">Cotação Enviada!</h5>
                        <p className="text-[10px] text-emerald-700">Um consultor experiente entrará em contato via WhatsApp/E-mail.</p>
                        <a
                          href={`https://wa.me/5541992447846?text=Olá!%20Enviei%20minha%20solicitação%20no%20site%20certificadocwb.com.br%20como%20${encodeURIComponent(leadForm.name)}.%20Gostaria%20de%20receber%20atendimento%20prioritário%20para%20as%20etapas%20de%20emissão%20do%20meu%20certificado%20digital.`}
                          target="_blank"
                          referrerPolicy="no-referrer"
                          className="inline-flex items-center space-x-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-750 text-white rounded-lg text-[10px] font-bold pt-1.5"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Falar Agora no WhatsApp</span>
                        </a>
                      </div>
                    ) : (
                      <form onSubmit={handleLeadSubmit} className="space-y-3.5">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 block uppercase" htmlFor="lead-name">Seu Nome / Empresa</label>
                          <input
                            id="lead-name"
                            type="text"
                            required
                            placeholder="Ex. Mercado Novo"
                            value={leadForm.name}
                            onChange={e => setLeadForm({...leadForm, name: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-indigo-600 rounded-lg p-2 text-xs"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 block uppercase" htmlFor="lead-phone">WhatsApp</label>
                            <input
                              id="lead-phone"
                              type="tel"
                              required
                              placeholder="(41) 99244-7846"
                              value={leadForm.phone}
                              onChange={e => setLeadForm({...leadForm, phone: e.target.value})}
                              className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-indigo-600 rounded-lg p-2 text-xs font-mono"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 block uppercase" htmlFor="lead-interest">Interesse</label>
                            <select
                              id="lead-interest"
                              value={leadForm.interestType}
                              onChange={e => setLeadForm({...leadForm, interestType: e.target.value as any})}
                              className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-indigo-600 rounded-lg p-2 text-xs text-slate-700"
                            >
                              <option value="general">Assuntos Gerais</option>
                              <option value="ecpf_a1">e-CPF A1 Digital</option>
                              <option value="ecpf_a3">e-CPF A3 Físico</option>
                              <option value="ecnpj_a1">e-CNPJ A1 Digital</option>
                              <option value="ecnpj_a3">e-CNPJ A3 Físico</option>
                            </select>
                          </div>
                        </div>

                        <button
                          id="btn-lead-submit"
                          type="submit"
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-3 rounded-lg shadow-sm transition"
                        >
                          Solicitar Atendimento
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </section>

              {/* TESTIMONIALS */}
              <section className="max-w-7xl mx-auto px-4 py-16 space-y-10">
                <div className="text-center space-y-3">
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest block font-mono">Comunidade Local</span>
                  <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-800">
                    O que dizem os contadores e empresários em Curitiba
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                    Centenas de clientes utilizam a nossa plataforma de validador local de certificados digitais.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { text: 'A videoconferência com o agente da Certificado CWB durou menos de 5 minutos e no mesmo instante recebi o arquivo para instalação do e-CPF A1 do meu cliente. Como contadora, indico de olhos fechados!', name: 'Alessandra de Souza', role: 'Sócia-Contadora', company: 'CWB Contabilidade & Fisco' },
                    { text: 'Precisava de um e-CNPJ com urgência para emitir notas fiscais em lote no sábado de manhã. Fui atendido de imediato pelas chaves digitais online e meu faturamento não parou de rodar. Show de bola.', name: 'Roberto Castilho', role: 'Fundador / Dev', company: 'Sul Sistemas e-Commerce' },
                    { text: 'Sempre utilizo o validador ICP-Brasil deles para comprovar as assinaturas dos meus contratos imobiliários em nosso escritório de advocacia. Excelente agilidade e visual incrível das chaves.', name: 'Mariana Requião', role: 'Advogada Licenciada', company: 'Requião Advocacia Integrada' }
                  ].map((t, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 space-y-4 shadow-sm hover:translate-y-[-2px] transition-transform">
                      <div className="flex items-center space-x-1.5 text-amber-500">
                        <ThumbsUp className="w-4 h-4 text-indigo-500" />
                        <span className="text-[10px] text-slate-400 font-bold uppercase font-mono">Indicação 100%</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed italic">"{t.text}"</p>
                      <div className="border-t border-slate-50 pt-3">
                        <strong className="block text-xs text-slate-800">{t.name}</strong>
                        <span className="text-[10px] text-slate-400 block">{t.role} — {t.company}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* FAQ CONTAINER ACCORDIONS */}
              <section className="bg-slate-900 border-t border-slate-800 text-white py-16">
                <div className="max-w-4xl mx-auto px-4 space-y-10">
                  <div className="text-center space-y-3">
                    <HelpCircle className="w-8 h-8 mx-auto text-indigo-400" />
                    <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
                      Perguntas Frequentes
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400">
                      Entenda rapidamente as regras e facilidades da assinatura eletrônica nacional.
                    </p>
                  </div>

                  <div className="space-y-4" role="tablist">
                    {FAQS.map((faq, i) => (
                      <div key={i} className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setExpandedFaqIndex(expandedFaqIndex === i ? null : i)}
                          className="w-full flex justify-between items-center p-5 text-left text-xs sm:text-sm font-bold antialiased select-none"
                        >
                          <span>{faq.q}</span>
                          <ChevronDown className={`w-4 h-4 text-indigo-400 transition-transform duration-300 ${expandedFaqIndex === i ? 'rotate-180' : ''}`} />
                        </button>
                        
                        <div className={`transition-all duration-300 overflow-hidden ${expandedFaqIndex === i ? 'max-h-[300px] border-t border-slate-900' : 'max-h-0'}`}>
                          <p className="p-5 text-xs text-slate-400 leading-relaxed">{faq.a}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* FAQ CTA */}
                  <div className="text-center pt-4">
                    <p className="text-xs text-slate-400 mb-2">Ainda tem alguma dúvida técnica sobre chaves de acesso?</p>
                    <a
                      href="https://wa.me/5541992447846?text=Olá!%20Acessei%20o%20site%20certificadocwb.com.br%20e%20gostaria%20de%20esclarecer%20uma%20dúvida%20técnica%20sobre%20a%20emissão%20de%20certificado%20digital.%20Podem%20me%20ajudar%3F"
                      target="_blank"
                      referrerPolicy="no-referrer"
                      className="inline-flex items-center space-x-1.5 text-indigo-400 hover:text-indigo-300 font-bold text-xs"
                    >
                      <span>Falar com nosso especialista agora</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </section>

              {/* COMPLIANCE ICP-BRASIL LOGOS */}
              <section className="pb-16 pt-10 text-center select-none opacity-60">
                <span className="text-[10px] text-slate-400 block font-bold tracking-widest uppercase mb-3">AUTORIDADES PARCEIRAS & TECNOLOGIA</span>
                <div className="flex flex-wrap items-center justify-center gap-6 text-slate-500 font-mono text-[10px]">
                  <span>● RECEITA FEDERAL BRASIL</span>
                  <span>● ITI ICP-BRASIL</span>
                  <span>● ASSINATURAS GOV.BR</span>
                  <span>● SERPRO HOMOLOGADO</span>
                </div>
              </section>
            </motion.div>
          )}

          {/* LOOKUP VALIDATOR TAB */}
          {activeTab === 'validate' && (
            <motion.div
              key="validate"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-7xl mx-auto px-4 py-8"
            >
              <ValidateTab 
                certificates={certificates}
                initialSelected={selectedForPreview}
                onClearSelection={() => setSelectedForPreview(null)}
              />
            </motion.div>
          )}

          {/* BLOG ADVISOR TAB */}
          {activeTab === 'blog' && (
            <motion.div
              key="blog"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-5xl mx-auto px-4 py-8 space-y-8"
            >
              <div className="text-center space-y-3">
                <BookOpen className="w-8 h-8 mx-auto text-indigo-500" />
                <h2 className="text-2xl font-display font-extrabold text-slate-800">
                  Central de Suporte & Blog Informativo
                </h2>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Dicas essenciais sobre conformidade digital, notas fiscais eletrônicas e novidades em legislação da ICP-Brasil.
                </p>
              </div>

              {activeArticle ? (
                /* Detail Modal view of Article */
                <article className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-5 animate-fade-in text-slate-700">
                  <button
                    onClick={() => setActiveArticle(null)}
                    className="text-xs text-indigo-600 font-bold hover:underline mb-2 block"
                  >
                    ← Voltar para listagem de artigos
                  </button>

                  <img 
                    src={activeArticle.coverImage} 
                    alt={activeArticle.title} 
                    referrerPolicy="no-referrer"
                    className="w-full h-64 object-cover rounded-2xl border"
                  />

                  <div className="flex items-center space-x-4 text-xs text-slate-400 font-mono">
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-sans">{activeArticle.category}</span>
                    <span>{activeArticle.publishDate}</span>
                    <span>{activeArticle.readingTime}</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-display font-bold text-slate-800 leading-tight">
                    {activeArticle.title}
                  </h3>

                  <div className="text-xs sm:text-sm leading-relaxed space-y-4 pt-4 border-t border-slate-50 text-slate-600 whitespace-pre-line font-sans">
                    {activeArticle.content}
                  </div>

                  <div className="pt-6 border-t border-slate-100 flex justify-between items-center text-xs">
                    <span className="text-slate-400">Gostou deste artigo? Compartilhe Curiosidades Contábeis</span>
                    <button
                      onClick={() => alert('Link copiado para área de transferência!')}
                      className="text-indigo-600 font-bold hover:underline flex items-center space-x-1"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Copiar Link</span>
                    </button>
                  </div>
                </article>
              ) : (
                /* Grid view list of Articles */
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {BLOG_ARTICLES.map((art) => (
                    <div 
                      key={art.slug} 
                      onClick={() => setActiveArticle(art)}
                      className="bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-slate-250 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                    >
                      <img 
                        src={art.coverImage} 
                        alt={art.title} 
                        referrerPolicy="no-referrer"
                        className="w-full h-44 object-cover border-b"
                      />
                      <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-sans">{art.category}</span>
                            <span>{art.publishDate}</span>
                          </div>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-800 leading-snug line-clamp-2">
                            {art.title}
                          </h4>
                          <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3">
                            {art.excerpt}
                          </p>
                        </div>

                        <div className="pt-4 border-t border-slate-50 text-right">
                          <span className="text-xs font-bold text-indigo-600 inline-flex items-center space-x-0.5 hover:underline">
                            <span>Ler Artigo Integral</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* REGISTER HISTORY TAB VIEW */}
          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-7xl mx-auto px-4 py-8"
            >
              <HistoryTab
                certificates={certificates}
                onSelect={(cert) => {
                  setSelectedForPreview(cert);
                  setActiveTab('validate');
                }}
                onDelete={handleDeleteCertificate}
                onGoToCreate={() => {
                  setActiveTab('home');
                  setTimeout(() => {
                    const priceNode = document.getElementById('pricing-anchored');
                    priceNode?.scrollIntoView({ behavior: 'smooth' });
                  }, 150);
                }}
                submittedLeads={submittedLeads}
                onUpdateLeadStatus={handleUpdateLeadStatus}
                onDeleteLead={handleDeleteLead}
              />
            </motion.div>
          )}

        </AnimatePresence>

        {/* FOOTER SECTION */}
        <footer className="bg-slate-950 text-white pt-14 pb-8 border-t border-slate-900 font-sans">
          <div className="max-w-7xl mx-auto px-4 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-slate-900">
              
              {/* Col Left Brand info */}
              <div className="md:col-span-5 space-y-4 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-white" />
                  </div>
                  <strong className="text-lg font-display font-bold">Certificado CWB</strong>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                  Proporcionamos segurança jurídica, criptografia oficial, emissão ágil por videoconferência em todo o território nacional. Localizados em Curitiba, conectados ao Brasil.
                </p>
              </div>

              {/* Col Middle Links */}
              <div className="md:col-span-4 grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-2">
                  <span className="block text-slate-500 font-bold uppercase tracking-wider text-[10px]">Portal</span>
                  <ul className="space-y-1.5 text-slate-400">
                    <li><button onClick={() => setActiveTab('home')} className="hover:text-white">Início</button></li>
                    <li><button onClick={() => setActiveTab('validate')} className="hover:text-white">Validar Chaves</button></li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <span className="block text-slate-500 font-bold uppercase tracking-wider text-[10px]">Novidades</span>
                  <ul className="space-y-1.5 text-slate-400">
                    <li><button onClick={() => setActiveTab('blog')} className="hover:text-white">Blog de Ajuda</button></li>
                    <li><button onClick={() => setActiveTab('history')} className="hover:text-white">Historial de Logs</button></li>
                    <li><a href="https://wa.me/5541992447846" target="_blank" rel="noreferrer" className="hover:text-white">Atendimento</a></li>
                  </ul>
                </div>
              </div>

              {/* Col Right Contacts info */}
              <div className="md:col-span-3 space-y-4 text-xs">
                <span className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] text-center md:text-left">Canais de Contato</span>
                <ul className="space-y-2.5 text-slate-400 font-sans">
                  <li className="flex items-center space-x-2 justify-center md:justify-start">
                    <Phone className="w-4 h-4 text-indigo-400 shrink-0" />
                    <a href="https://wa.me/5541992447846" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                      (41) 99244-7846 (WhatsApp)
                    </a>
                  </li>
                  <li className="flex items-center space-x-2 justify-center md:justify-start">
                    <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                    <a href="mailto:cwbcertificado@gmail.com" className="hover:text-white transition-colors">
                      cwbcertificado@gmail.com
                    </a>
                  </li>
                  <li className="flex items-center space-x-2 justify-center md:justify-start">
                    <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Curitiba, Paraná — Brasil</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom compliance line */}
            <div className="flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-400 gap-4">
              <div className="space-y-1 text-center sm:text-left leading-normal">
                <span>Certificado CWB © 2026. Todos os direitos reservados.</span>
                <p className="text-[9px] text-slate-500">
                  A Certificado CWB realiza suporte e encaminhamento. Todas as validações por videochamada são auditadas de acordo com as diretrizes do Instituto Nacional de Tecnologia da Informação (ITI) e ICP-Brasil.
                </p>
              </div>

              <div className="flex space-x-3 text-slate-500 shrink-0">
                <span>Políticas de Privacidade</span>
                <span>•</span>
                <span>Termos de Uso</span>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
