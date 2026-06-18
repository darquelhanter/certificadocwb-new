export type CertificateTemplateType = 'ecpf_a1' | 'ecpf_a3' | 'ecnpj_a1' | 'ecnpj_a3';

export interface CertificateData {
  id: string; // CWB-XXXXX-XXXX (código de verificação)
  holderName: string; // Nome do Titular (Pessoa Física ou Representante Legal / Razão Social)
  holderDoc: string; // CPF ou CNPJ formatado
  certificateType: CertificateTemplateType; // Tipo do certificado
  issuerName: string; // Autoridade Certificadora Emissora
  issueDate: string; // Data de Emissão (AAAA-MM-DD)
  expiryDate: string; // Data de Validade/Expiração (AAAA-MM-DD)
  serialNumber: string; // Número de série criptográfico hexadecimal
  status: 'active' | 'revoked' | 'expired'; // Status de validade
}

export interface LeadData {
  name: string;
  email: string;
  phone: string;
  city: string;
  interestType: CertificateTemplateType | 'general';
  message?: string;
}

export interface SubmittedLead extends LeadData {
  id: string;
  date: string;
  status: 'pending' | 'contacted' | 'completed';
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  publishDate: string;
  readingTime: string;
  category: 'Segurança' | 'Negócios' | 'Contabilidade' | 'Tecnologia';
}
