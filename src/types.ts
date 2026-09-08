export type CertificateTemplateType = 'ecpf_a1' | 'ecpf_a3' | 'ecnpj_a1' | 'ecnpj_a3';

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
