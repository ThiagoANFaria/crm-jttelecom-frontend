// Tipos para o Módulo de Telefonia - PABX JT Telecom
// Integração 100% Multi-Tenant

export interface PABXConfig {
  id: string;
  tenantId: string;
  serverUrl: string;
  apiToken: string;
  tenantPABXId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CallRecord {
  id: string;
  tenantId: string;
  leadId?: string;
  leadName?: string;
  phoneNumber: string;
  callDirection: CallDirection;
  callStatus: CallStatus;
  startTime: Date;
  endTime?: Date;
  duration: number; // em segundos
  recordingUrl?: string;
  hasRecording: boolean;
  userId?: string;
  userAgent?: string;
  metadata?: CallMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface CallMetadata {
  callerNumber?: string;
  calleeNumber?: string;
  transferredFrom?: string;
  conferenceId?: string;
  queueName?: string;
  hangupCause?: string;
  sipCode?: number;
  userAgent?: string;
  codec?: string;
  quality?: CallQuality;
}

export interface CallQuality {
  mos?: number; // Mean Opinion Score
  jitter?: number;
  packetLoss?: number;
  latency?: number;
}

export enum CallDirection {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound'
}

export enum CallStatus {
  ANSWERED = 'answered',
  MISSED = 'missed',
  BUSY = 'busy',
  NO_ANSWER = 'no_answer',
  VOICEMAIL = 'voicemail',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  IN_PROGRESS = 'in_progress'
}

export interface CallFilters {
  startDate?: Date;
  endDate?: Date;
  leadId?: string;
  phoneNumber?: string;
  callStatus?: CallStatus;
  callDirection?: CallDirection;
  hasRecording?: boolean;
  userId?: string;
  page?: number;
  limit?: number;
  sortBy?: 'startTime' | 'duration' | 'leadName';
  sortOrder?: 'asc' | 'desc';
}

export interface CallsResponse {
  calls: CallRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ClickToCallRequest {
  tenantId: string;
  phoneNumber: string;
  leadId?: string;
  userId: string;
  autoRecord?: boolean;
}

export interface ClickToCallResponse {
  success: boolean;
  callId?: string;
  message: string;
  estimatedDuration?: number;
}

export interface CallRecording {
  id: string;
  callId: string;
  tenantId: string;
  recordingUrl: string;
  duration: number;
  fileSize: number;
  format: string;
  isAvailable: boolean;
  expiresAt?: Date;
  createdAt: Date;
}

export interface PABXStats {
  tenantId: string;
  totalCalls: number;
  answeredCalls: number;
  missedCalls: number;
  averageDuration: number;
  totalDuration: number;
  recordingsCount: number;
  period: {
    startDate: Date;
    endDate: Date;
  };
}

export interface LeadCallHistory {
  leadId: string;
  leadName: string;
  phoneNumber: string;
  calls: CallRecord[];
  totalCalls: number;
  lastCallDate?: Date;
  averageDuration: number;
  callsAnswered: number;
  callsMissed: number;
}

export interface CallAssociation {
  callId: string;
  leadId: string;
  phoneNumber: string;
  associationType: AssociationType;
  confidence: number; // 0-1
  createdAt: Date;
}

export enum AssociationType {
  PHONE_EXACT = 'phone_exact',
  PHONE_SIMILAR = 'phone_similar',
  WHATSAPP = 'whatsapp',
  CNPJ_CPF = 'cnpj_cpf',
  MANUAL = 'manual'
}

export interface UnidentifiedCall {
  id: string;
  tenantId: string;
  phoneNumber: string;
  callDirection: CallDirection;
  callStatus: CallStatus;
  startTime: Date;
  duration: number;
  recordingUrl?: string;
  possibleLeads?: PossibleLead[];
  isResolved: boolean;
  createdAt: Date;
}

export interface PossibleLead {
  leadId: string;
  leadName: string;
  phoneNumber: string;
  similarity: number; // 0-1
  matchType: AssociationType;
}

export interface CallPermissions {
  canViewAllCalls: boolean;
  canViewOwnCalls: boolean;
  canMakeCalls: boolean;
  canAccessRecordings: boolean;
  canAssociateCalls: boolean;
  canViewStats: boolean;
}

export interface PABXIntegrationStatus {
  tenantId: string;
  isConnected: boolean;
  lastSync: Date;
  apiVersion: string;
  serverStatus: 'online' | 'offline' | 'maintenance';
  errorMessage?: string;
  callsToday: number;
  recordingsToday: number;
}

// Tipos para configuração da integração
export interface PABXConfigForm {
  serverUrl: string;
  apiToken: string;
  tenantPABXId: string;
  autoRecord: boolean;
  recordingRetentionDays: number;
  enableClickToCall: boolean;
  enableAutoAssociation: boolean;
  webhookUrl?: string;
}

// Tipos para relatórios
export interface CallReportRow {
  id: string;
  leadName: string;
  leadId?: string;
  phoneNumber: string;
  callDate: Date;
  duration: string; // formatado como hh:mm:ss
  status: CallStatus;
  direction: CallDirection;
  hasRecording: boolean;
  recordingUrl?: string;
  canCall: boolean;
}

export interface CallReportFilters {
  dateRange: {
    start: Date;
    end: Date;
  };
  status?: CallStatus[];
  direction?: CallDirection[];
  hasRecording?: boolean;
  leadSearch?: string;
  phoneSearch?: string;
}

// Tipos para player de gravação
export interface RecordingPlayer {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isLoading: boolean;
  error?: string;
}

// Tipos para webhooks do PABX
export interface PABXWebhook {
  event: PABXWebhookEvent;
  tenantId: string;
  data: any;
  timestamp: Date;
  signature?: string;
}

export enum PABXWebhookEvent {
  CALL_STARTED = 'call.started',
  CALL_ANSWERED = 'call.answered',
  CALL_ENDED = 'call.ended',
  RECORDING_AVAILABLE = 'recording.available',
  CALL_TRANSFERRED = 'call.transferred',
  CALL_QUEUED = 'call.queued'
}

// Tipos para estatísticas em tempo real
export interface RealTimeCallStats {
  tenantId: string;
  activeCalls: number;
  queuedCalls: number;
  availableAgents: number;
  callsToday: number;
  averageWaitTime: number;
  lastUpdated: Date;
}

// Utilitários para formatação
export interface CallDurationFormat {
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string; // "HH:MM:SS"
}

export interface PhoneNumberFormat {
  raw: string;
  formatted: string;
  country?: string;
  isValid: boolean;
  type?: 'mobile' | 'landline' | 'voip';
}

// Tipos para integração com leads
export interface LeadPhoneNumbers {
  leadId: string;
  phones: {
    primary?: string;
    whatsapp?: string;
    landline?: string;
    other?: string[];
  };
}

// Configurações de notificação
export interface CallNotificationSettings {
  tenantId: string;
  enableMissedCallNotifications: boolean;
  enableNewRecordingNotifications: boolean;
  notificationChannels: NotificationChannel[];
  quietHours?: {
    start: string; // "HH:MM"
    end: string; // "HH:MM"
  };
}

export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  WHATSAPP = 'whatsapp',
  PUSH = 'push',
  WEBHOOK = 'webhook'
}

// Tipos para análise de chamadas
export interface CallAnalytics {
  tenantId: string;
  period: {
    start: Date;
    end: Date;
  };
  metrics: {
    totalCalls: number;
    answeredCalls: number;
    missedCalls: number;
    averageDuration: number;
    longestCall: number;
    shortestCall: number;
    busyHours: HourlyStats[];
    topCallers: CallerStats[];
    callsByStatus: StatusStats[];
    callsByDay: DailyStats[];
  };
}

export interface HourlyStats {
  hour: number; // 0-23
  calls: number;
  duration: number;
}

export interface CallerStats {
  phoneNumber: string;
  leadName?: string;
  calls: number;
  totalDuration: number;
  lastCall: Date;
}

export interface StatusStats {
  status: CallStatus;
  count: number;
  percentage: number;
}

export interface DailyStats {
  date: Date;
  calls: number;
  duration: number;
  answered: number;
  missed: number;
}

// Tipos para exportação de dados
export interface CallExportRequest {
  tenantId: string;
  filters: CallFilters;
  format: ExportFormat;
  includeRecordings: boolean;
  columns: ExportColumn[];
}

export enum ExportFormat {
  CSV = 'csv',
  XLSX = 'xlsx',
  PDF = 'pdf',
  JSON = 'json'
}

export enum ExportColumn {
  LEAD_NAME = 'leadName',
  PHONE_NUMBER = 'phoneNumber',
  CALL_DATE = 'callDate',
  DURATION = 'duration',
  STATUS = 'status',
  DIRECTION = 'direction',
  RECORDING_URL = 'recordingUrl',
  USER_AGENT = 'userAgent'
}

