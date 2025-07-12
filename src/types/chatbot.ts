// Tipos para o Módulo de Chatbot - 100% Multi-Tenant
// Integração com Smartbot via SSO e conversação WhatsApp

export interface SmartbotConfig {
  id: string;
  tenantId: string; // Isolamento multi-tenant
  smartbotUrl: string; // URL específica do Smartbot para esta tenant
  apiToken: string; // Token de autenticação da API Smartbot
  webhookUrl: string; // URL para receber webhooks
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Token JWT para SSO com Smartbot
export interface SmartbotSSOToken {
  user_id: string;
  tenant_id: string;
  name: string;
  role: string;
  exp: number; // Timestamp de expiração
  iat: number; // Timestamp de criação
}

// Configuração de SSO por tenant
export interface SSOConfig {
  id: string;
  tenantId: string; // Isolamento multi-tenant
  jwtSecret: string; // Chave secreta para assinar JWT
  tokenExpirationMinutes: number; // Tempo de expiração em minutos
  smartbotRedirectUrl: string; // URL de redirecionamento para Smartbot
  openInNewTab: boolean; // Abrir em nova aba ou iframe
  createdAt: Date;
  updatedAt: Date;
}

// Mensagem WhatsApp
export interface WhatsAppMessage {
  id: string;
  tenantId: string; // Isolamento multi-tenant
  leadId?: string; // ID do lead relacionado
  clientId?: string; // ID do cliente relacionado
  whatsappNumber: string; // Número WhatsApp (chave única)
  messageId: string; // ID da mensagem no Smartbot
  content: string; // Conteúdo da mensagem
  messageType: MessageType;
  direction: MessageDirection;
  senderType: SenderType;
  senderName?: string;
  timestamp: Date;
  status: MessageStatus;
  isRead: boolean;
  metadata?: MessageMetadata;
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video',
  DOCUMENT = 'document',
  LOCATION = 'location',
  CONTACT = 'contact',
  STICKER = 'sticker'
}

export enum MessageDirection {
  INBOUND = 'inbound',   // Mensagem recebida
  OUTBOUND = 'outbound'  // Mensagem enviada
}

export enum SenderType {
  CLIENT = 'client',     // Cliente/Lead
  BOT = 'bot',          // Bot automático
  HUMAN = 'human',      // Atendente humano
  SYSTEM = 'system'     // Sistema
}

export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
  PENDING = 'pending'
}

// Metadados da mensagem
export interface MessageMetadata {
  smartbotMessageId?: string;
  mediaUrl?: string;
  mediaType?: string;
  mediaSize?: number;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  contact?: {
    name: string;
    phone: string;
    email?: string;
  };
  quotedMessage?: {
    id: string;
    content: string;
    sender: string;
  };
}

// Conversa WhatsApp (agrupamento de mensagens)
export interface WhatsAppConversation {
  id: string;
  tenantId: string; // Isolamento multi-tenant
  whatsappNumber: string; // Número WhatsApp (chave única)
  leadId?: string;
  clientId?: string;
  contactName?: string;
  lastMessage?: WhatsAppMessage;
  lastMessageAt: Date;
  unreadCount: number;
  isActive: boolean;
  tags: string[];
  assignedTo?: string; // ID do usuário responsável
  status: ConversationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum ConversationStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  WAITING = 'waiting',
  CLOSED = 'closed',
  ARCHIVED = 'archived'
}

// Webhook do Smartbot
export interface SmartbotWebhook {
  event: string;
  timestamp: string;
  data: {
    messageId: string;
    whatsappNumber: string;
    content: string;
    messageType: string;
    direction: string;
    senderType: string;
    metadata?: any;
  };
  tenantId: string; // Para identificar a tenant
}

// Configurações de permissão para conversas
export interface ConversationPermissions {
  id: string;
  tenantId: string; // Isolamento multi-tenant
  userId: string;
  canViewAll: boolean; // Pode ver todas as conversas da tenant
  canViewOwn: boolean; // Pode ver apenas suas próprias conversas
  canSendMessages: boolean; // Pode enviar mensagens
  canAssignConversations: boolean; // Pode atribuir conversas
  canExportConversations: boolean; // Pode exportar conversas
  canManageTags: boolean; // Pode gerenciar tags
  createdAt: Date;
  updatedAt: Date;
}

// Filtros para busca de mensagens
export interface MessageFilters {
  whatsappNumber?: string;
  leadId?: string;
  clientId?: string;
  messageType?: MessageType[];
  direction?: MessageDirection;
  senderType?: SenderType[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  search?: string; // Busca no conteúdo
  isRead?: boolean;
  status?: MessageStatus[];
  page?: number;
  limit?: number;
}

// Filtros para busca de conversas
export interface ConversationFilters {
  status?: ConversationStatus[];
  assignedTo?: string;
  hasUnread?: boolean;
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  search?: string; // Busca no nome do contato ou número
  page?: number;
  limit?: number;
}

// Estatísticas de conversas
export interface ConversationStats {
  tenantId: string;
  totalConversations: number;
  activeConversations: number;
  unreadMessages: number;
  averageResponseTime: number; // em minutos
  messagesPerDay: number;
  botMessages: number;
  humanMessages: number;
  conversionRate: number; // % de conversas que viraram leads
  period: {
    start: Date;
    end: Date;
  };
}

// Template de mensagem rápida
export interface QuickReplyTemplate {
  id: string;
  tenantId: string; // Isolamento multi-tenant
  name: string;
  content: string;
  category: string;
  isActive: boolean;
  usageCount: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Automação de mensagens
export interface MessageAutomation {
  id: string;
  tenantId: string; // Isolamento multi-tenant
  name: string;
  trigger: AutomationTrigger;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  isActive: boolean;
  executionCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum AutomationTrigger {
  NEW_MESSAGE = 'new_message',
  NO_RESPONSE = 'no_response',
  KEYWORD_DETECTED = 'keyword_detected',
  BUSINESS_HOURS = 'business_hours',
  LEAD_CREATED = 'lead_created'
}

export interface AutomationCondition {
  field: string;
  operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'regex';
  value: string;
}

export interface AutomationAction {
  type: 'send_message' | 'assign_to_user' | 'add_tag' | 'create_task' | 'update_lead';
  parameters: any;
}

// Resposta da API Smartbot
export interface SmartbotApiResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

// Payload para envio de mensagem
export interface SendMessagePayload {
  whatsappNumber: string;
  content: string;
  messageType: MessageType;
  metadata?: {
    mediaUrl?: string;
    fileName?: string;
    caption?: string;
  };
}

// Configuração de webhook
export interface WebhookConfig {
  id: string;
  tenantId: string; // Isolamento multi-tenant
  url: string;
  events: string[]; // Eventos que o webhook deve escutar
  secret: string; // Para validação de assinatura
  isActive: boolean;
  lastTriggered?: Date;
  failureCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Log de atividades do chatbot
export interface ChatbotActivityLog {
  id: string;
  tenantId: string; // Isolamento multi-tenant
  action: string;
  description: string;
  userId?: string;
  whatsappNumber?: string;
  messageId?: string;
  metadata?: any;
  timestamp: Date;
}

// Configurações de horário de funcionamento
export interface BusinessHours {
  id: string;
  tenantId: string; // Isolamento multi-tenant
  dayOfWeek: number; // 0 = Domingo, 1 = Segunda, etc.
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  isActive: boolean;
  timezone: string;
}

// Mensagem automática fora do horário
export interface OutOfHoursMessage {
  id: string;
  tenantId: string; // Isolamento multi-tenant
  message: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Integração com CRM
export interface CRMIntegration {
  id: string;
  tenantId: string; // Isolamento multi-tenant
  autoCreateLeads: boolean; // Criar leads automaticamente
  autoUpdateLeads: boolean; // Atualizar leads automaticamente
  leadSource: string; // Fonte padrão para leads criados
  defaultPipeline?: string; // Pipeline padrão
  defaultStage?: string; // Etapa padrão
  fieldMappings: FieldMapping[]; // Mapeamento de campos
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FieldMapping {
  whatsappField: string; // Campo do WhatsApp (ex: 'contact_name')
  crmField: string; // Campo do CRM (ex: 'name')
  isRequired: boolean;
  defaultValue?: string;
}

// Análise de sentimento (futuro)
export interface SentimentAnalysis {
  id: string;
  messageId: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number; // 0-1
  keywords: string[];
  analyzedAt: Date;
}

// Métricas de performance
export interface PerformanceMetrics {
  tenantId: string;
  period: {
    start: Date;
    end: Date;
  };
  metrics: {
    totalMessages: number;
    responseTime: {
      average: number;
      median: number;
      p95: number;
    };
    resolutionRate: number;
    customerSatisfaction?: number;
    agentProductivity: {
      messagesPerHour: number;
      conversationsHandled: number;
    };
  };
}

