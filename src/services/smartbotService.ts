// Serviço de Integração Smartbot - 100% Multi-Tenant
// API: https://app.smartbot.jttecnologia.com.br/messages-api

import { 
  SmartbotConfig,
  SmartbotSSOToken,
  SSOConfig,
  WhatsAppMessage,
  WhatsAppConversation,
  MessageFilters,
  ConversationFilters,
  SendMessagePayload,
  SmartbotApiResponse,
  ConversationStats,
  QuickReplyTemplate,
  SmartbotWebhook
} from '@/types/chatbot';

const API_BASE_URL = 'https://www.api.app.jttecnologia.com.br';
const SMARTBOT_API_URL = 'https://app.smartbot.jttecnologia.com.br/messages-api';

class SmartbotService {
  private getHeaders(tenantId: string): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'X-Tenant-ID': tenantId, // Isolamento multi-tenant
    };
  }

  private getSmartbotHeaders(apiToken: string): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiToken}`,
    };
  }

  // ==================== CONFIGURAÇÃO SMARTBOT ====================

  async getSmartbotConfig(tenantId: string): Promise<SmartbotConfig | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/chatbot/smartbot-config`, {
        headers: this.getHeaders(tenantId),
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error('Erro ao buscar configuração Smartbot');
      }

      return response.json();
    } catch (error) {
      console.error('Erro ao buscar configuração Smartbot:', error);
      return null;
    }
  }

  async saveSmartbotConfig(tenantId: string, config: Omit<SmartbotConfig, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>): Promise<SmartbotConfig> {
    const response = await fetch(`${API_BASE_URL}/chatbot/smartbot-config`, {
      method: 'POST',
      headers: this.getHeaders(tenantId),
      body: JSON.stringify({ ...config, tenantId }),
    });

    if (!response.ok) {
      throw new Error('Erro ao salvar configuração Smartbot');
    }

    return response.json();
  }

  async testSmartbotConnection(tenantId: string): Promise<{ success: boolean, message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/chatbot/smartbot-config/test`, {
        method: 'POST',
        headers: this.getHeaders(tenantId),
      });

      const result = await response.json();
      
      return {
        success: response.ok,
        message: result.message || (response.ok ? 'Conexão estabelecida com sucesso' : 'Erro na conexão')
      };
    } catch (error) {
      console.error('Erro ao testar conexão Smartbot:', error);
      return {
        success: false,
        message: 'Erro de rede ao conectar com Smartbot'
      };
    }
  }

  // ==================== SSO E AUTENTICAÇÃO ====================

  async getSSOConfig(tenantId: string): Promise<SSOConfig | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/chatbot/sso-config`, {
        headers: this.getHeaders(tenantId),
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error('Erro ao buscar configuração SSO');
      }

      return response.json();
    } catch (error) {
      console.error('Erro ao buscar configuração SSO:', error);
      return null;
    }
  }

  async saveSSOConfig(tenantId: string, config: Omit<SSOConfig, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>): Promise<SSOConfig> {
    const response = await fetch(`${API_BASE_URL}/chatbot/sso-config`, {
      method: 'POST',
      headers: this.getHeaders(tenantId),
      body: JSON.stringify({ ...config, tenantId }),
    });

    if (!response.ok) {
      throw new Error('Erro ao salvar configuração SSO');
    }

    return response.json();
  }

  async generateSSOToken(tenantId: string, userId: string, userName: string, userRole: string): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/chatbot/sso/generate-token`, {
      method: 'POST',
      headers: this.getHeaders(tenantId),
      body: JSON.stringify({
        userId,
        userName,
        userRole,
        tenantId
      }),
    });

    if (!response.ok) {
      throw new Error('Erro ao gerar token SSO');
    }

    const result = await response.json();
    return result.token;
  }

  async getSmartbotRedirectUrl(tenantId: string): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/chatbot/sso/redirect-url`, {
      method: 'POST',
      headers: this.getHeaders(tenantId),
    });

    if (!response.ok) {
      throw new Error('Erro ao obter URL de redirecionamento');
    }

    const result = await response.json();
    return result.redirectUrl;
  }

  // ==================== MENSAGENS WHATSAPP ====================

  async getMessagesByWhatsApp(tenantId: string, whatsappNumber: string, filters?: MessageFilters): Promise<{ messages: WhatsAppMessage[], total: number }> {
    const queryParams = new URLSearchParams();
    queryParams.append('whatsappNumber', whatsappNumber);
    
    if (filters) {
      if (filters.messageType) queryParams.append('messageType', filters.messageType.join(','));
      if (filters.direction) queryParams.append('direction', filters.direction);
      if (filters.senderType) queryParams.append('senderType', filters.senderType.join(','));
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.isRead !== undefined) queryParams.append('isRead', filters.isRead.toString());
      if (filters.page) queryParams.append('page', filters.page.toString());
      if (filters.limit) queryParams.append('limit', filters.limit.toString());
      if (filters.dateRange) {
        queryParams.append('startDate', filters.dateRange.start.toISOString());
        queryParams.append('endDate', filters.dateRange.end.toISOString());
      }
    }

    const response = await fetch(`${API_BASE_URL}/chatbot/messages?${queryParams}`, {
      headers: this.getHeaders(tenantId),
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar mensagens');
    }

    return response.json();
  }

  async sendMessage(tenantId: string, payload: SendMessagePayload): Promise<SmartbotApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/chatbot/messages/send`, {
        method: 'POST',
        headers: this.getHeaders(tenantId),
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          message: result.message || 'Erro ao enviar mensagem',
          error: result.error
        };
      }

      return {
        success: true,
        message: 'Mensagem enviada com sucesso',
        data: result.data
      };
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      return {
        success: false,
        message: 'Erro de rede ao enviar mensagem',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  async markMessageAsRead(tenantId: string, messageId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/chatbot/messages/${messageId}/read`, {
        method: 'PUT',
        headers: this.getHeaders(tenantId),
      });

      return response.ok;
    } catch (error) {
      console.error('Erro ao marcar mensagem como lida:', error);
      return false;
    }
  }

  // ==================== CONVERSAS ====================

  async getConversations(tenantId: string, filters?: ConversationFilters): Promise<{ conversations: WhatsAppConversation[], total: number }> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      if (filters.status) queryParams.append('status', filters.status.join(','));
      if (filters.assignedTo) queryParams.append('assignedTo', filters.assignedTo);
      if (filters.hasUnread !== undefined) queryParams.append('hasUnread', filters.hasUnread.toString());
      if (filters.tags) queryParams.append('tags', filters.tags.join(','));
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.page) queryParams.append('page', filters.page.toString());
      if (filters.limit) queryParams.append('limit', filters.limit.toString());
      if (filters.dateRange) {
        queryParams.append('startDate', filters.dateRange.start.toISOString());
        queryParams.append('endDate', filters.dateRange.end.toISOString());
      }
    }

    const response = await fetch(`${API_BASE_URL}/chatbot/conversations?${queryParams}`, {
      headers: this.getHeaders(tenantId),
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar conversas');
    }

    return response.json();
  }

  async getConversationByWhatsApp(tenantId: string, whatsappNumber: string): Promise<WhatsAppConversation | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/chatbot/conversations/whatsapp/${whatsappNumber}`, {
        headers: this.getHeaders(tenantId),
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error('Erro ao buscar conversa');
      }

      return response.json();
    } catch (error) {
      console.error('Erro ao buscar conversa:', error);
      return null;
    }
  }

  async assignConversation(tenantId: string, conversationId: string, userId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/chatbot/conversations/${conversationId}/assign`, {
        method: 'PUT',
        headers: this.getHeaders(tenantId),
        body: JSON.stringify({ userId }),
      });

      return response.ok;
    } catch (error) {
      console.error('Erro ao atribuir conversa:', error);
      return false;
    }
  }

  async updateConversationStatus(tenantId: string, conversationId: string, status: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/chatbot/conversations/${conversationId}/status`, {
        method: 'PUT',
        headers: this.getHeaders(tenantId),
        body: JSON.stringify({ status }),
      });

      return response.ok;
    } catch (error) {
      console.error('Erro ao atualizar status da conversa:', error);
      return false;
    }
  }

  // ==================== ESTATÍSTICAS ====================

  async getConversationStats(tenantId: string, period?: { start: Date, end: Date }): Promise<ConversationStats> {
    const queryParams = new URLSearchParams();
    
    if (period) {
      queryParams.append('startDate', period.start.toISOString());
      queryParams.append('endDate', period.end.toISOString());
    }

    const response = await fetch(`${API_BASE_URL}/chatbot/stats?${queryParams}`, {
      headers: this.getHeaders(tenantId),
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar estatísticas');
    }

    return response.json();
  }

  // ==================== TEMPLATES DE RESPOSTA RÁPIDA ====================

  async getQuickReplyTemplates(tenantId: string): Promise<QuickReplyTemplate[]> {
    const response = await fetch(`${API_BASE_URL}/chatbot/quick-replies`, {
      headers: this.getHeaders(tenantId),
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar templates de resposta rápida');
    }

    return response.json();
  }

  async createQuickReplyTemplate(tenantId: string, template: Omit<QuickReplyTemplate, 'id' | 'tenantId' | 'usageCount' | 'createdAt' | 'updatedAt'>): Promise<QuickReplyTemplate> {
    const response = await fetch(`${API_BASE_URL}/chatbot/quick-replies`, {
      method: 'POST',
      headers: this.getHeaders(tenantId),
      body: JSON.stringify({ ...template, tenantId }),
    });

    if (!response.ok) {
      throw new Error('Erro ao criar template de resposta rápida');
    }

    return response.json();
  }

  // ==================== WEBHOOKS ====================

  async processWebhook(tenantId: string, webhookData: SmartbotWebhook): Promise<SmartbotApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/chatbot/webhook`, {
        method: 'POST',
        headers: this.getHeaders(tenantId),
        body: JSON.stringify(webhookData),
      });

      const result = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          message: result.message || 'Erro ao processar webhook',
          error: result.error
        };
      }

      return {
        success: true,
        message: 'Webhook processado com sucesso',
        data: result.data
      };
    } catch (error) {
      console.error('Erro ao processar webhook:', error);
      return {
        success: false,
        message: 'Erro ao processar webhook',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  // ==================== INTEGRAÇÃO DIRETA COM SMARTBOT API ====================

  async getSmartbotMessages(apiToken: string, whatsappNumber: string): Promise<any[]> {
    try {
      const response = await fetch(`${SMARTBOT_API_URL}/messages/${whatsappNumber}`, {
        headers: this.getSmartbotHeaders(apiToken),
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar mensagens no Smartbot');
      }

      return response.json();
    } catch (error) {
      console.error('Erro ao buscar mensagens no Smartbot:', error);
      return [];
    }
  }

  async sendSmartbotMessage(apiToken: string, whatsappNumber: string, message: string): Promise<SmartbotApiResponse> {
    try {
      const response = await fetch(`${SMARTBOT_API_URL}/send`, {
        method: 'POST',
        headers: this.getSmartbotHeaders(apiToken),
        body: JSON.stringify({
          to: whatsappNumber,
          message: message,
          type: 'text'
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          message: result.message || 'Erro ao enviar mensagem via Smartbot',
          error: result.error
        };
      }

      return {
        success: true,
        message: 'Mensagem enviada via Smartbot com sucesso',
        data: result
      };
    } catch (error) {
      console.error('Erro ao enviar mensagem via Smartbot:', error);
      return {
        success: false,
        message: 'Erro de rede ao enviar mensagem via Smartbot',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  // ==================== UTILITÁRIOS ====================

  formatWhatsAppNumber(number: string): string {
    // Remove todos os caracteres não numéricos
    const cleaned = number.replace(/\D/g, '');
    
    // Adiciona código do país se não tiver
    if (cleaned.length === 11 && cleaned.startsWith('11')) {
      return `55${cleaned}`;
    } else if (cleaned.length === 10) {
      return `5511${cleaned}`;
    } else if (cleaned.length === 13 && cleaned.startsWith('55')) {
      return cleaned;
    }
    
    return cleaned;
  }

  isValidWhatsAppNumber(number: string): boolean {
    const cleaned = this.formatWhatsAppNumber(number);
    return cleaned.length >= 12 && cleaned.length <= 15;
  }

  formatMessageTimestamp(timestamp: Date): string {
    const now = new Date();
    const messageDate = new Date(timestamp);
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 168) { // 7 dias
      return messageDate.toLocaleDateString('pt-BR', { 
        weekday: 'short',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return messageDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
      });
    }
  }

  getMessageTypeIcon(messageType: string): string {
    const icons = {
      text: '💬',
      image: '🖼️',
      audio: '🎵',
      video: '🎥',
      document: '📄',
      location: '📍',
      contact: '👤',
      sticker: '😀'
    };
    
    return icons[messageType as keyof typeof icons] || '💬';
  }

  getSenderTypeColor(senderType: string): string {
    const colors = {
      client: 'bg-gray-100 text-gray-900',
      bot: 'bg-blue-100 text-blue-900',
      human: 'bg-green-100 text-green-900',
      system: 'bg-yellow-100 text-yellow-900'
    };
    
    return colors[senderType as keyof typeof colors] || 'bg-gray-100 text-gray-900';
  }
}

export const smartbotService = new SmartbotService();

