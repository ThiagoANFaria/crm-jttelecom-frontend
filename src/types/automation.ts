// Tipos para o Módulo de Automações e Cadência - 100% Multi-Tenant
// Baseado no prompt técnico para nota 10

export interface AutomationFlow {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  trigger: AutomationTrigger;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  flowData: FlowVisualData; // Para engine drag & drop
  executionCount: number;
  lastExecuted?: Date;
}

// Gatilhos Inteligentes
export enum TriggerType {
  NEW_LEAD = 'new_lead',
  LEAD_STAGE_CHANGE = 'lead_stage_change',
  LEAD_INACTIVITY = 'lead_inactivity',
  CLIENT_NO_TASK = 'client_no_task',
  CONTRACT_SIGNED = 'contract_signed',
  CONTRACT_EXPIRED = 'contract_expired',
  CONTRACT_EXPIRING = 'contract_expiring',
  TAG_APPLIED = 'tag_applied',
  SCORE_REACHED = 'score_reached',
  MAUTIC_EMAIL_OPENED = 'mautic_email_opened',
  MAUTIC_EMAIL_CLICKED = 'mautic_email_clicked',
  MAUTIC_FORM_SUBMITTED = 'mautic_form_submitted'
}

export interface AutomationTrigger {
  type: TriggerType;
  config: TriggerConfig;
}

export interface TriggerConfig {
  // Para inatividade
  inactivityDays?: number;
  
  // Para mudança de etapa
  fromStageId?: string;
  toStageId?: string;
  
  // Para tags
  tagId?: string;
  
  // Para pontuação
  scoreThreshold?: number;
  
  // Para contratos
  contractType?: string;
  daysBeforeExpiry?: number;
  
  // Para Mautic
  mauticCampaignId?: string;
  mauticFormId?: string;
  
  // Condições adicionais
  leadSource?: string;
  leadStatus?: string;
}

// Condições (if/else)
export enum ConditionType {
  LEAD_SOURCE = 'lead_source',
  LEAD_STATUS = 'lead_status',
  LEAD_TAGS = 'lead_tags',
  LEAD_SCORE = 'lead_score',
  CLIENT_TYPE = 'client_type',
  CONTRACT_VALUE = 'contract_value',
  CUSTOM_FIELD = 'custom_field',
  TIME_OF_DAY = 'time_of_day',
  DAY_OF_WEEK = 'day_of_week'
}

export enum ConditionOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  IN = 'in',
  NOT_IN = 'not_in'
}

export interface AutomationCondition {
  id: string;
  type: ConditionType;
  operator: ConditionOperator;
  value: any;
  logicalOperator?: 'AND' | 'OR'; // Para múltiplas condições
}

// Ações Automatizadas
export enum ActionType {
  CREATE_TASK = 'create_task',
  SEND_EMAIL = 'send_email',
  SEND_WHATSAPP = 'send_whatsapp',
  APPLY_TAG = 'apply_tag',
  REMOVE_TAG = 'remove_tag',
  MOVE_STAGE = 'move_stage',
  SEND_WEBHOOK = 'send_webhook',
  NOTIFY_USER = 'notify_user',
  UPDATE_FIELD = 'update_field',
  ADD_TO_CADENCE = 'add_to_cadence',
  MAUTIC_ADD_CAMPAIGN = 'mautic_add_campaign',
  MAUTIC_UPDATE_CONTACT = 'mautic_update_contact'
}

export interface AutomationAction {
  id: string;
  type: ActionType;
  config: ActionConfig;
  delay?: number; // Delay em minutos
  order: number;
}

export interface ActionConfig {
  // Para tarefas
  taskTitle?: string;
  taskDescription?: string;
  taskDueDate?: number; // Dias a partir de hoje
  assignedUserId?: string;
  taskPriority?: 'low' | 'medium' | 'high';
  
  // Para e-mails
  emailTemplateId?: string;
  emailSubject?: string;
  emailBody?: string;
  fromEmail?: string;
  fromName?: string;
  
  // Para WhatsApp
  whatsappTemplateId?: string;
  whatsappMessage?: string;
  
  // Para tags
  tagId?: string;
  
  // Para mudança de etapa
  targetStageId?: string;
  
  // Para webhooks
  webhookUrl?: string;
  webhookMethod?: 'GET' | 'POST' | 'PUT';
  webhookHeaders?: Record<string, string>;
  webhookBody?: string;
  
  // Para notificações
  notificationMessage?: string;
  notificationUsers?: string[];
  
  // Para campos customizados
  fieldName?: string;
  fieldValue?: any;
  
  // Para Mautic
  mauticCampaignId?: string;
  mauticSegmentId?: string;
}

// Engine Visual (Drag & Drop)
export interface FlowVisualData {
  nodes: FlowNode[];
  edges: FlowEdge[];
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };
}

export interface FlowNode {
  id: string;
  type: 'trigger' | 'condition' | 'action';
  position: { x: number; y: number };
  data: {
    label: string;
    config: any;
    isValid: boolean;
  };
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  type?: 'default' | 'conditional';
  label?: string;
}

// Cadências Automatizadas
export enum CadenceType {
  PROSPECTING = 'prospecting',
  POST_MEETING = 'post_meeting',
  FOLLOW_UP = 'follow_up',
  CUSTOMER_SUCCESS = 'customer_success',
  ONBOARDING = 'onboarding',
  RETENTION = 'retention'
}

export enum StepType {
  EMAIL = 'email',
  WHATSAPP = 'whatsapp',
  TASK = 'task',
  CALL = 'call',
  TAG = 'tag',
  STAGE_CHANGE = 'stage_change',
  WEBHOOK = 'webhook',
  NOTIFICATION = 'notification',
  DELAY = 'delay',
  CONDITION = 'condition'
}

export interface Cadence {
  id: string;
  tenantId: string;
  name: string;
  type: CadenceType;
  description?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  steps: CadenceStep[];
  enrollmentCriteria: EnrollmentCriteria;
  exitCriteria: ExitCriteria;
  stats: CadenceStats;
}

export interface CadenceStep {
  id: string;
  order: number;
  dayOffset: number; // Dia 0, 1, 3, 7, etc.
  action: AutomationAction;
  isActive: boolean;
}

export interface EnrollmentCriteria {
  leadSources?: string[];
  leadStatuses?: string[];
  tags?: string[];
  customFields?: Record<string, any>;
  autoEnroll: boolean;
}

export type CadenceEnrollmentCriteria = EnrollmentCriteria;

export interface ExitCriteria {
  onReply: boolean;
  onTaskComplete: boolean;
  onStageChange: boolean;
  onTagApplied?: string[];
  maxDays?: number;
}

export type CadenceExitCriteria = ExitCriteria;

export interface CadenceStats {
  totalEnrolled: number;
  activeEnrollments: number;
  completedEnrollments: number;
  responseRate: number;
  avgCompletionTime: number;
}

// Régua de Inatividade
export interface InactivityRule {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  triggerAfterDays: number;
  inactivityCriteria: InactivityCriteria;
  steps: InactivityStep[];
  pauseConditions: PauseCondition[];
}

export interface InactivityCriteria {
  noTaskCompleted: boolean;
  noManualInteraction: boolean;
  noMessageReply: boolean;
  noEmailOpen: boolean;
  noWhatsappReply: boolean;
}

export interface InactivityStep {
  id: string;
  order: number;
  dayOffset: number;
  action: AutomationAction;
  isActive: boolean;
}

export interface PauseCondition {
  type: 'interaction' | 'task_complete' | 'reply' | 'stage_change';
  config: any;
}

// Integração Mautic
export interface MauticIntegration {
  id: string;
  tenantId: string;
  name: string;
  baseUrl: string;
  authType: 'oauth2' | 'basic';
  credentials: MauticCredentials;
  isActive: boolean;
  lastSync?: Date;
  syncStatus: 'connected' | 'error' | 'syncing';
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type MauticAuthType = 'oauth2' | 'basic';
export type MauticSyncStatus = 'connected' | 'error' | 'syncing';

export interface MauticConfig {
  baseUrl: string;
  authType: MauticAuthType;
  credentials: MauticCredentials;
  webhookUrl?: string;
  isActive: boolean;
}

export interface MauticCredentials {
  // OAuth2
  clientId?: string;
  clientSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiry?: Date;
  
  // Basic Auth
  username?: string;
  password?: string;
}

export interface MauticContact {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  phone?: string;
  tags: string[];
  segments: string[];
  customFields: Record<string, any>;
  lastActivity?: Date;
  score: number;
}

export interface MauticCampaign {
  id: string;
  name: string;
  description?: string;
  isPublished: boolean;
  createdAt: Date;
  stats: {
    totalContacts: number;
    sentEmails: number;
    openRate: number;
    clickRate: number;
  };
}

export interface MauticSegment {
  id: string;
  name: string;
  description?: string;
  isPublished: boolean;
  contactCount: number;
}

export interface MauticEmail {
  id: string;
  name: string;
  subject: string;
  isPublished: boolean;
  stats: {
    sentCount: number;
    openCount: number;
    clickCount: number;
    bounceCount: number;
  };
}

export interface MauticForm {
  id: string;
  name: string;
  description?: string;
  isPublished: boolean;
  submissionCount: number;
}

export interface MauticEvent {
  id: string;
  eventType: string;
  timestamp: Date;
  contactId: string;
  campaignId?: string;
  emailId?: string;
  formId?: string;
  data: Record<string, any>;
}

// Templates de E-mail e Mensagens
export interface EmailTemplate {
  id: string;
  tenantId: string;
  name: string;
  subject: string;
  body: string;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  variables: TemplateVariable[];
  stats: TemplateStats;
}

export interface WhatsAppTemplate {
  id: string;
  tenantId: string;
  name: string;
  message: string;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  variables: TemplateVariable[];
  stats: TemplateStats;
}

export interface TemplateVariable {
  name: string;
  description: string;
  type: 'text' | 'number' | 'date' | 'boolean';
  defaultValue?: any;
  isRequired: boolean;
}

export interface TemplateStats {
  totalSent: number;
  delivered: number;
  opened: number;
  clicked: number;
  replied: number;
  bounced: number;
  unsubscribed: number;
}

// Histórico e Execução
export interface AutomationExecution {
  id: string;
  tenantId: string;
  flowId: string;
  leadId?: string;
  clientId?: string;
  triggeredBy: string; // user_id ou 'system'
  triggeredAt: Date;
  status: ExecutionStatus;
  steps: ExecutionStep[];
  completedAt?: Date;
  errorMessage?: string;
}

export enum ExecutionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  PAUSED = 'paused',
  CANCELLED = 'cancelled'
}

export interface ExecutionStep {
  id: string;
  actionId: string;
  actionType: ActionType;
  status: ExecutionStatus;
  executedAt?: Date;
  completedAt?: Date;
  result?: any;
  errorMessage?: string;
  retryCount: number;
}

// Cadência de Lead/Cliente
export interface CadenceEnrollment {
  id: string;
  tenantId: string;
  cadenceId: string;
  leadId?: string;
  clientId?: string;
  enrolledAt: Date;
  enrolledBy: string;
  status: EnrollmentStatus;
  currentStep: number;
  nextStepAt?: Date;
  completedAt?: Date;
  exitReason?: string;
  progress: StepProgress[];
}

export enum EnrollmentStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  EXITED = 'exited',
  FAILED = 'failed'
}

export interface StepProgress {
  stepId: string;
  status: ExecutionStatus;
  scheduledAt: Date;
  executedAt?: Date;
  completedAt?: Date;
  result?: any;
  errorMessage?: string;
}

// Dashboard e Monitoramento
export interface AutomationDashboard {
  tenantId: string;
  period: {
    startDate: Date;
    endDate: Date;
  };
  metrics: AutomationMetrics;
  cadenceMetrics: CadenceMetrics;
  channelMetrics: ChannelMetrics;
  riskMetrics: RiskMetrics;
}

export interface AutomationMetrics {
  totalFlows: number;
  activeFlows: number;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  avgExecutionTime: number;
}

export interface CadenceMetrics {
  totalCadences: number;
  activeCadences: number;
  totalEnrollments: number;
  activeEnrollments: number;
  completionRate: number;
  avgResponseTime: number;
}

export interface ChannelMetrics {
  email: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    replied: number;
    openRate: number;
    clickRate: number;
    replyRate: number;
  };
  whatsapp: {
    sent: number;
    delivered: number;
    read: number;
    replied: number;
    deliveryRate: number;
    readRate: number;
    replyRate: number;
  };
  tasks: {
    created: number;
    completed: number;
    overdue: number;
    completionRate: number;
  };
}

export interface RiskMetrics {
  leadsAtRisk: number;
  clientsAtRisk: number;
  inactiveLeads: number;
  inactiveClients: number;
  avgInactivityDays: number;
}

// Permissões
export interface AutomationPermissions {
  canCreateFlows: boolean;
  canEditFlows: boolean;
  canDeleteFlows: boolean;
  canActivateFlows: boolean;
  canViewAllExecutions: boolean;
  canViewOwnExecutions: boolean;
  canCreateTemplates: boolean;
  canEditTemplates: boolean;
  canDeleteTemplates: boolean;
  canConfigureMautic: boolean;
  canViewDashboard: boolean;
  canManageCadences: boolean;
  canManageInactivityRules: boolean;
}

// Logs de Segurança
export interface AutomationAuditLog {
  id: string;
  tenantId: string;
  userId?: string;
  action: string;
  resourceType: 'flow' | 'cadence' | 'template' | 'execution';
  resourceId: string;
  oldValue?: any;
  newValue?: any;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

// Filtros e Busca
export interface AutomationFilters {
  tenantId: string;
  isActive?: boolean;
  createdBy?: string;
  triggerType?: TriggerType;
  actionType?: ActionType;
  cadenceType?: CadenceType;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AutomationSearchResult {
  flows: AutomationFlow[];
  cadences: Cadence[];
  templates: (EmailTemplate | WhatsAppTemplate)[];
  total: number;
  page: number;
  totalPages: number;
}

