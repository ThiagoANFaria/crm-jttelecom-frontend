// Tipos para o Módulo de Contratos - 100% Multi-Tenant
// Cada tenant possui isolamento completo de dados

export interface ContractTemplate {
  id: string;
  tenantId: string; // Isolamento multi-tenant
  name: string;
  description?: string;
  content: string; // HTML com shortcodes
  isActive: boolean;
  createdBy: string; // ID do usuário ADM
  createdAt: Date;
  updatedAt: Date;
  // Configurações específicas do template
  defaultDuration: number; // em meses
  autoRenewal: boolean;
  expirationAlert: number; // dias antes do vencimento
  requiredSignatories: ContractSignatoryType[];
}

export interface Contract {
  id: string;
  tenantId: string; // Isolamento multi-tenant
  contractNumber: string; // CONT-2025-TENANT001-0001
  templateId: string;
  
  // Dados do contrato
  title: string;
  description?: string;
  content: string; // HTML renderizado com dados preenchidos
  
  // Relacionamentos
  clientId?: string;
  leadId?: string;
  products: ContractProduct[];
  
  // Status e controle
  status: ContractStatus;
  version: number;
  parentContractId?: string; // Para aditivos
  
  // Datas
  createdAt: Date;
  updatedAt: Date;
  startDate: Date;
  endDate: Date;
  signedAt?: Date;
  
  // Valores
  totalValue: number;
  currency: string;
  
  // Assinatura e D4Sign
  d4signDocumentId?: string;
  signatories: ContractSignatory[];
  
  // Observações
  notes?: string;
  internalNotes?: string;
  
  // Criado por
  createdBy: string;
}

export interface ContractProduct {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category?: string;
}

export interface ContractSignatory {
  id: string;
  type: ContractSignatoryType;
  name: string;
  email: string;
  document: string; // CPF/CNPJ
  phone?: string;
  status: SignatoryStatus;
  signedAt?: Date;
  d4signSignatoryId?: string;
  order: number; // Ordem de assinatura
}

export enum ContractStatus {
  DRAFT = 'draft',
  PENDING_SIGNATURE = 'pending_signature',
  PARTIALLY_SIGNED = 'partially_signed',
  SIGNED = 'signed',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  RENEWED = 'renewed'
}

export enum ContractSignatoryType {
  CLIENT = 'client',
  COMPANY = 'company',
  WITNESS = 'witness',
  GUARANTOR = 'guarantor'
}

export enum SignatoryStatus {
  PENDING = 'pending',
  SENT = 'sent',
  VIEWED = 'viewed',
  SIGNED = 'signed',
  REJECTED = 'rejected'
}

// Configurações D4Sign por tenant
export interface D4SignConfig {
  id: string;
  tenantId: string; // Isolamento multi-tenant
  apiKey: string;
  apiSecret: string;
  accountName: string;
  webhookUrl: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Configurações de numeração por tenant
export interface ContractNumberingConfig {
  id: string;
  tenantId: string; // Isolamento multi-tenant
  prefix: string; // CONT
  year: number; // 2025
  tenantCode: string; // TENANT001
  lastNumber: number; // 0001
  format: string; // {prefix}-{year}-{tenantCode}-{number}
  resetYearly: boolean;
}

// Configurações gerais de contratos por tenant
export interface ContractSettings {
  id: string;
  tenantId: string; // Isolamento multi-tenant
  defaultDuration: number; // meses
  defaultAutoRenewal: boolean;
  defaultExpirationAlert: number; // dias
  defaultCurrency: string;
  requireApproval: boolean;
  approvalWorkflow: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Histórico de versões e aditivos
export interface ContractVersion {
  id: string;
  contractId: string;
  tenantId: string; // Isolamento multi-tenant
  version: number;
  changeType: ContractChangeType;
  description: string;
  content: string; // Snapshot do conteúdo
  changedBy: string;
  changedAt: Date;
  previousVersion?: number;
}

export enum ContractChangeType {
  CREATION = 'creation',
  AMENDMENT = 'amendment',
  RENEWAL = 'renewal',
  CANCELLATION = 'cancellation',
  REACTIVATION = 'reactivation'
}

// Automação de tarefas relacionadas a contratos
export interface ContractAutomation {
  id: string;
  tenantId: string; // Isolamento multi-tenant
  name: string;
  trigger: ContractTrigger;
  action: ContractAction;
  isActive: boolean;
  conditions?: ContractCondition[];
  createdAt: Date;
  updatedAt: Date;
}

export enum ContractTrigger {
  CONTRACT_SENT = 'contract_sent',
  SIGNATURE_PENDING = 'signature_pending',
  CONTRACT_SIGNED = 'contract_signed',
  CONTRACT_EXPIRING = 'contract_expiring',
  CONTRACT_EXPIRED = 'contract_expired'
}

export enum ContractAction {
  CREATE_TASK = 'create_task',
  SEND_EMAIL = 'send_email',
  SEND_NOTIFICATION = 'send_notification',
  UPDATE_PIPELINE = 'update_pipeline',
  CREATE_RENEWAL = 'create_renewal'
}

export interface ContractCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
  value: string | number | boolean;
}

// Filtros para listagem de contratos
export interface ContractFilters {
  status?: ContractStatus[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  clientId?: string;
  templateId?: string;
  createdBy?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// Estatísticas de contratos por tenant
export interface ContractStats {
  tenantId: string;
  totalContracts: number;
  activeContracts: number;
  pendingSignature: number;
  expiringSoon: number; // próximos 30 dias
  totalValue: number;
  averageValue: number;
  conversionRate: number; // % de contratos assinados
  period: {
    start: Date;
    end: Date;
  };
}

// Shortcodes disponíveis para templates
export interface TemplateShortcode {
  code: string;
  description: string;
  category: 'client' | 'company' | 'contract' | 'product' | 'date';
  example: string;
}

export const TEMPLATE_SHORTCODES: TemplateShortcode[] = [
  // Cliente
  { code: '{{cliente.nome}}', description: 'Nome do cliente', category: 'client', example: 'João Silva' },
  { code: '{{cliente.email}}', description: 'E-mail do cliente', category: 'client', example: 'joao@email.com' },
  { code: '{{cliente.documento}}', description: 'CPF/CNPJ do cliente', category: 'client', example: '123.456.789-00' },
  { code: '{{cliente.telefone}}', description: 'Telefone do cliente', category: 'client', example: '(11) 99999-9999' },
  { code: '{{cliente.endereco}}', description: 'Endereço completo', category: 'client', example: 'Rua A, 123' },
  
  // Empresa
  { code: '{{empresa.nome}}', description: 'Nome da empresa', category: 'company', example: 'JT Telecom' },
  { code: '{{empresa.cnpj}}', description: 'CNPJ da empresa', category: 'company', example: '12.345.678/0001-90' },
  { code: '{{empresa.endereco}}', description: 'Endereço da empresa', category: 'company', example: 'Av. Principal, 456' },
  
  // Contrato
  { code: '{{contrato.numero}}', description: 'Número do contrato', category: 'contract', example: 'CONT-2025-TENANT001-0001' },
  { code: '{{contrato.valor}}', description: 'Valor total', category: 'contract', example: 'R$ 1.500,00' },
  { code: '{{contrato.vigencia}}', description: 'Período de vigência', category: 'contract', example: '12 meses' },
  
  // Produtos
  { code: '{{produtos.lista}}', description: 'Lista de produtos/serviços', category: 'product', example: 'PABX em Nuvem, Chatbot' },
  { code: '{{produtos.total}}', description: 'Valor total dos produtos', category: 'product', example: 'R$ 1.500,00' },
  
  // Datas
  { code: '{{data.hoje}}', description: 'Data atual', category: 'date', example: '05/07/2025' },
  { code: '{{data.inicio}}', description: 'Data de início', category: 'date', example: '01/08/2025' },
  { code: '{{data.fim}}', description: 'Data de término', category: 'date', example: '31/07/2026' }
];

// Resposta da API D4Sign
export interface D4SignResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

// Webhook payload da D4Sign
export interface D4SignWebhook {
  event: string;
  document_id: string;
  signer_id?: string;
  status: string;
  timestamp: string;
  data: any;
}

