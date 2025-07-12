// Serviço de Integração PABX JT Telecom - 100% Multi-Tenant
// API: https://emnuvem.meupabxip.com.br/suite/api_doc.php

import {
  PABXConfig,
  CallRecord,
  CallFilters,
  CallsResponse,
  ClickToCallRequest,
  ClickToCallResponse,
  CallRecording,
  PABXStats,
  LeadCallHistory,
  UnidentifiedCall,
  PABXIntegrationStatus,
  PABXConfigForm,
  CallReportRow,
  CallDurationFormat,
  PhoneNumberFormat,
  CallDirection,
  CallStatus,
  AssociationType,
  PABXWebhook,
  RealTimeCallStats,
  CallAnalytics,
  CallExportRequest
} from '@/types/telephony';

const API_BASE_URL = 'https://www.api.app.jttecnologia.com.br';
const PABX_API_URL = 'https://emnuvem.meupabxip.com.br/suite/api_doc.php';

class PABXService {
  private getHeaders(tenantId: string): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'X-Tenant-ID': tenantId, // Isolamento multi-tenant
    };
  }

  // ==================== CONFIGURAÇÃO PABX ====================

  async getPABXConfig(tenantId: string): Promise<PABXConfig | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/telephony/config`, {
        method: 'GET',
        headers: this.getHeaders(tenantId),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          ...data,
          createdAt: new Date(data.createdAt),
          updatedAt: new Date(data.updatedAt)
        };
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar configuração PABX:', error);
      return null;
    }
  }

  async savePABXConfig(tenantId: string, config: PABXConfigForm): Promise<PABXConfig> {
    try {
      const response = await fetch(`${API_BASE_URL}/telephony/config`, {
        method: 'POST',
        headers: this.getHeaders(tenantId),
        body: JSON.stringify({
          ...config,
          tenantId
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar configuração PABX');
      }

      const data = await response.json();
      return {
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt)
      };
    } catch (error) {
      console.error('Erro ao salvar configuração PABX:', error);
      throw error;
    }
  }

  async testPABXConnection(tenantId: string): Promise<{ success: boolean, message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/telephony/test-connection`, {
        method: 'POST',
        headers: this.getHeaders(tenantId),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao testar conexão PABX:', error);
      return {
        success: false,
        message: 'Erro ao testar conexão com PABX'
      };
    }
  }

  async getPABXStatus(tenantId: string): Promise<PABXIntegrationStatus> {
    try {
      const response = await fetch(`${API_BASE_URL}/telephony/status`, {
        method: 'GET',
        headers: this.getHeaders(tenantId),
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar status PABX');
      }

      const data = await response.json();
      return {
        ...data,
        lastSync: new Date(data.lastSync)
      };
    } catch (error) {
      console.error('Erro ao buscar status PABX:', error);
      throw error;
    }
  }

  // ==================== HISTÓRICO DE CHAMADAS ====================

  async getCalls(tenantId: string, filters: CallFilters = {}): Promise<CallsResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      // Adicionar filtros à query
      if (filters.startDate) queryParams.append('startDate', filters.startDate.toISOString());
      if (filters.endDate) queryParams.append('endDate', filters.endDate.toISOString());
      if (filters.leadId) queryParams.append('leadId', filters.leadId);
      if (filters.phoneNumber) queryParams.append('phoneNumber', filters.phoneNumber);
      if (filters.callStatus) queryParams.append('callStatus', filters.callStatus);
      if (filters.callDirection) queryParams.append('callDirection', filters.callDirection);
      if (filters.hasRecording !== undefined) queryParams.append('hasRecording', filters.hasRecording.toString());
      if (filters.userId) queryParams.append('userId', filters.userId);
      if (filters.page) queryParams.append('page', filters.page.toString());
      if (filters.limit) queryParams.append('limit', filters.limit.toString());
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
      if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);

      const response = await fetch(`${API_BASE_URL}/telephony/calls?${queryParams}`, {
        method: 'GET',
        headers: this.getHeaders(tenantId),
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar chamadas');
      }

      const data = await response.json();
      return {
        ...data,
        calls: data.calls.map((call: any) => ({
          ...call,
          startTime: new Date(call.startTime),
          endTime: call.endTime ? new Date(call.endTime) : undefined,
          createdAt: new Date(call.createdAt),
          updatedAt: new Date(call.updatedAt)
        }))
      };
    } catch (error) {
      console.error('Erro ao buscar chamadas:', error);
      throw error;
    }
  }

  async getCallById(tenantId: string, callId: string): Promise<CallRecord | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/telephony/calls/${callId}`, {
        method: 'GET',
        headers: this.getHeaders(tenantId),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          ...data,
          startTime: new Date(data.startTime),
          endTime: data.endTime ? new Date(data.endTime) : undefined,
          createdAt: new Date(data.createdAt),
          updatedAt: new Date(data.updatedAt)
        };
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar chamada:', error);
      return null;
    }
  }

  async getLeadCallHistory(tenantId: string, leadId: string): Promise<LeadCallHistory> {
    try {
      const response = await fetch(`${API_BASE_URL}/telephony/leads/${leadId}/calls`, {
        method: 'GET',
        headers: this.getHeaders(tenantId),
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar histórico de chamadas do lead');
      }

      const data = await response.json();
      return {
        ...data,
        calls: data.calls.map((call: any) => ({
          ...call,
          startTime: new Date(call.startTime),
          endTime: call.endTime ? new Date(call.endTime) : undefined,
          createdAt: new Date(call.createdAt),
          updatedAt: new Date(call.updatedAt)
        })),
        lastCallDate: data.lastCallDate ? new Date(data.lastCallDate) : undefined
      };
    } catch (error) {
      console.error('Erro ao buscar histórico de chamadas do lead:', error);
      throw error;
    }
  }

  // ==================== CLICK-TO-CALL ====================

  async makeCall(tenantId: string, request: ClickToCallRequest): Promise<ClickToCallResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/telephony/click-to-call`, {
        method: 'POST',
        headers: this.getHeaders(tenantId),
        body: JSON.stringify({
          ...request,
          tenantId
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao realizar chamada');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao realizar chamada:', error);
      return {
        success: false,
        message: 'Erro ao realizar chamada via PABX'
      };
    }
  }

  async cancelCall(tenantId: string, callId: string): Promise<{ success: boolean, message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/telephony/calls/${callId}/cancel`, {
        method: 'POST',
        headers: this.getHeaders(tenantId),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao cancelar chamada:', error);
      return {
        success: false,
        message: 'Erro ao cancelar chamada'
      };
    }
  }

  // ==================== GRAVAÇÕES ====================

  async getCallRecording(tenantId: string, callId: string): Promise<CallRecording | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/telephony/calls/${callId}/recording`, {
        method: 'GET',
        headers: this.getHeaders(tenantId),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          ...data,
          expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
          createdAt: new Date(data.createdAt)
        };
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar gravação:', error);
      return null;
    }
  }

  async downloadRecording(tenantId: string, recordingId: string): Promise<Blob | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/telephony/recordings/${recordingId}/download`, {
        method: 'GET',
        headers: this.getHeaders(tenantId),
      });

      if (response.ok) {
        return await response.blob();
      }
      return null;
    } catch (error) {
      console.error('Erro ao baixar gravação:', error);
      return null;
    }
  }

  // ==================== ASSOCIAÇÃO DE CHAMADAS ====================

  async associateCallToLead(tenantId: string, callId: string, leadId: string): Promise<{ success: boolean, message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/telephony/calls/${callId}/associate`, {
        method: 'POST',
        headers: this.getHeaders(tenantId),
        body: JSON.stringify({
          leadId,
          associationType: AssociationType.MANUAL
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao associar chamada ao lead:', error);
      return {
        success: false,
        message: 'Erro ao associar chamada ao lead'
      };
    }
  }

  async getUnidentifiedCalls(tenantId: string): Promise<UnidentifiedCall[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/telephony/calls/unidentified`, {
        method: 'GET',
        headers: this.getHeaders(tenantId),
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar chamadas não identificadas');
      }

      const data = await response.json();
      return data.map((call: any) => ({
        ...call,
        startTime: new Date(call.startTime),
        createdAt: new Date(call.createdAt)
      }));
    } catch (error) {
      console.error('Erro ao buscar chamadas não identificadas:', error);
      return [];
    }
  }

  // ==================== ESTATÍSTICAS ====================

  async getPABXStats(tenantId: string, startDate: Date, endDate: Date): Promise<PABXStats> {
    try {
      const response = await fetch(`${API_BASE_URL}/telephony/stats?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`, {
        method: 'GET',
        headers: this.getHeaders(tenantId),
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar estatísticas PABX');
      }

      const data = await response.json();
      return {
        ...data,
        period: {
          startDate: new Date(data.period.startDate),
          endDate: new Date(data.period.endDate)
        }
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas PABX:', error);
      throw error;
    }
  }

  async getRealTimeStats(tenantId: string): Promise<RealTimeCallStats> {
    try {
      const response = await fetch(`${API_BASE_URL}/telephony/stats/realtime`, {
        method: 'GET',
        headers: this.getHeaders(tenantId),
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar estatísticas em tempo real');
      }

      const data = await response.json();
      return {
        ...data,
        lastUpdated: new Date(data.lastUpdated)
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas em tempo real:', error);
      throw error;
    }
  }

  async getCallAnalytics(tenantId: string, startDate: Date, endDate: Date): Promise<CallAnalytics> {
    try {
      const response = await fetch(`${API_BASE_URL}/telephony/analytics?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`, {
        method: 'GET',
        headers: this.getHeaders(tenantId),
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar análise de chamadas');
      }

      const data = await response.json();
      return {
        ...data,
        period: {
          start: new Date(data.period.start),
          end: new Date(data.period.end)
        },
        metrics: {
          ...data.metrics,
          topCallers: data.metrics.topCallers.map((caller: any) => ({
            ...caller,
            lastCall: new Date(caller.lastCall)
          })),
          callsByDay: data.metrics.callsByDay.map((day: any) => ({
            ...day,
            date: new Date(day.date)
          }))
        }
      };
    } catch (error) {
      console.error('Erro ao buscar análise de chamadas:', error);
      throw error;
    }
  }

  // ==================== WEBHOOKS ====================

  async processWebhook(tenantId: string, webhook: PABXWebhook): Promise<{ success: boolean, message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/telephony/webhook`, {
        method: 'POST',
        headers: this.getHeaders(tenantId),
        body: JSON.stringify(webhook),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao processar webhook:', error);
      return {
        success: false,
        message: 'Erro ao processar webhook PABX'
      };
    }
  }

  // ==================== EXPORTAÇÃO ====================

  async exportCalls(tenantId: string, request: CallExportRequest): Promise<Blob | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/telephony/export`, {
        method: 'POST',
        headers: this.getHeaders(tenantId),
        body: JSON.stringify(request),
      });

      if (response.ok) {
        return await response.blob();
      }
      return null;
    } catch (error) {
      console.error('Erro ao exportar chamadas:', error);
      return null;
    }
  }

  // ==================== UTILITÁRIOS ====================

  formatDuration(seconds: number): CallDurationFormat {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return {
      hours,
      minutes,
      seconds: secs,
      formatted: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    };
  }

  formatPhoneNumber(phoneNumber: string): PhoneNumberFormat {
    // Remover caracteres não numéricos
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Formatação brasileira
    let formatted = cleaned;
    if (cleaned.length === 11) {
      // Celular: (XX) 9XXXX-XXXX
      formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    } else if (cleaned.length === 10) {
      // Fixo: (XX) XXXX-XXXX
      formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    }

    return {
      raw: cleaned,
      formatted,
      isValid: cleaned.length >= 10 && cleaned.length <= 11,
      type: cleaned.length === 11 ? 'mobile' : 'landline'
    };
  }

  getCallStatusLabel(status: CallStatus): string {
    const labels = {
      [CallStatus.ANSWERED]: 'Atendida',
      [CallStatus.MISSED]: 'Perdida',
      [CallStatus.BUSY]: 'Ocupado',
      [CallStatus.NO_ANSWER]: 'Sem Resposta',
      [CallStatus.VOICEMAIL]: 'Caixa Postal',
      [CallStatus.FAILED]: 'Falhou',
      [CallStatus.CANCELLED]: 'Cancelada',
      [CallStatus.IN_PROGRESS]: 'Em Andamento'
    };
    return labels[status] || status;
  }

  getCallStatusColor(status: CallStatus): string {
    const colors = {
      [CallStatus.ANSWERED]: 'text-green-600 bg-green-100',
      [CallStatus.MISSED]: 'text-red-600 bg-red-100',
      [CallStatus.BUSY]: 'text-yellow-600 bg-yellow-100',
      [CallStatus.NO_ANSWER]: 'text-orange-600 bg-orange-100',
      [CallStatus.VOICEMAIL]: 'text-blue-600 bg-blue-100',
      [CallStatus.FAILED]: 'text-red-600 bg-red-100',
      [CallStatus.CANCELLED]: 'text-gray-600 bg-gray-100',
      [CallStatus.IN_PROGRESS]: 'text-purple-600 bg-purple-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  }

  getCallDirectionIcon(direction: CallDirection): string {
    return direction === CallDirection.INBOUND ? '📞' : '📱';
  }

  // ==================== VALIDAÇÕES ====================

  validatePhoneNumber(phoneNumber: string): boolean {
    const cleaned = phoneNumber.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 11;
  }

  validatePABXConfig(config: PABXConfigForm): { isValid: boolean, errors: string[] } {
    const errors: string[] = [];

    if (!config.serverUrl) {
      errors.push('URL do servidor é obrigatória');
    }

    if (!config.apiToken) {
      errors.push('Token da API é obrigatório');
    }

    if (!config.tenantPABXId) {
      errors.push('ID do tenant no PABX é obrigatório');
    }

    if (config.recordingRetentionDays < 1 || config.recordingRetentionDays > 365) {
      errors.push('Retenção de gravações deve ser entre 1 e 365 dias');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // ==================== CACHE E PERFORMANCE ====================

  private callsCache = new Map<string, { data: CallsResponse, timestamp: number }>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutos

  private getCacheKey(tenantId: string, filters: CallFilters): string {
    return `${tenantId}_${JSON.stringify(filters)}`;
  }

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.cacheTimeout;
  }

  async getCallsWithCache(tenantId: string, filters: CallFilters = {}): Promise<CallsResponse> {
    const cacheKey = this.getCacheKey(tenantId, filters);
    const cached = this.callsCache.get(cacheKey);

    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data;
    }

    const data = await this.getCalls(tenantId, filters);
    this.callsCache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  }

  clearCache(): void {
    this.callsCache.clear();
  }
}

export const pabxService = new PABXService();

