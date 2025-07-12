// Serviço de Webhooks Smartbot - 100% Multi-Tenant
// Processamento em tempo real de mensagens WhatsApp

import { 
  SmartbotWebhook,
  WhatsAppMessage,
  WhatsAppConversation,
  MessageType,
  MessageDirection,
  SenderType,
  MessageStatus,
  ConversationStatus
} from '@/types/chatbot';

const API_BASE_URL = 'https://www.api.app.jttecnologia.com.br';

interface WebhookEventHandler {
  event: string;
  handler: (data: any, tenantId: string) => Promise<void>;
}

class SmartbotWebhookService {
  private eventHandlers: Map<string, (data: any, tenantId: string) => Promise<void>> = new Map();
  private isListening = false;
  private eventSource: EventSource | null = null;

  constructor() {
    this.setupEventHandlers();
  }

  private getHeaders(tenantId: string): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'X-Tenant-ID': tenantId, // Isolamento multi-tenant
    };
  }

  // ==================== CONFIGURAÇÃO DE EVENTOS ====================

  private setupEventHandlers() {
    // Mensagem recebida
    this.eventHandlers.set('message.received', this.handleMessageReceived.bind(this));
    
    // Mensagem enviada
    this.eventHandlers.set('message.sent', this.handleMessageSent.bind(this));
    
    // Status de mensagem atualizado
    this.eventHandlers.set('message.status.updated', this.handleMessageStatusUpdated.bind(this));
    
    // Nova conversa iniciada
    this.eventHandlers.set('conversation.started', this.handleConversationStarted.bind(this));
    
    // Conversa finalizada
    this.eventHandlers.set('conversation.ended', this.handleConversationEnded.bind(this));
    
    // Usuário digitando
    this.eventHandlers.set('user.typing', this.handleUserTyping.bind(this));
    
    // Bot ativado
    this.eventHandlers.set('bot.activated', this.handleBotActivated.bind(this));
    
    // Atendimento humano solicitado
    this.eventHandlers.set('human.requested', this.handleHumanRequested.bind(this));
  }

  // ==================== PROCESSAMENTO DE WEBHOOKS ====================

  async processWebhook(webhookData: SmartbotWebhook): Promise<{ success: boolean, message: string }> {
    try {
      const { event, data, tenantId } = webhookData;
      
      // Validar tenant
      if (!tenantId) {
        return {
          success: false,
          message: 'Tenant ID é obrigatório'
        };
      }

      // Buscar handler para o evento
      const handler = this.eventHandlers.get(event);
      if (!handler) {
        console.warn(`Handler não encontrado para evento: ${event}`);
        return {
          success: true,
          message: `Evento ${event} ignorado (sem handler)`
        };
      }

      // Executar handler
      await handler(data, tenantId);

      // Registrar atividade
      await this.logWebhookActivity(tenantId, event, data);

      return {
        success: true,
        message: `Webhook ${event} processado com sucesso`
      };
    } catch (error) {
      console.error('Erro ao processar webhook:', error);
      return {
        success: false,
        message: `Erro ao processar webhook: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      };
    }
  }

  // ==================== HANDLERS DE EVENTOS ====================

  private async handleMessageReceived(data: any, tenantId: string): Promise<void> {
    try {
      const message: Partial<WhatsAppMessage> = {
        tenantId,
        whatsappNumber: data.whatsappNumber,
        messageId: data.messageId,
        content: data.content,
        messageType: this.mapMessageType(data.messageType),
        direction: MessageDirection.INBOUND,
        senderType: SenderType.CLIENT,
        senderName: data.senderName,
        timestamp: new Date(data.timestamp),
        status: MessageStatus.DELIVERED,
        isRead: false,
        metadata: data.metadata
      };

      // Salvar mensagem
      await this.saveMessage(tenantId, message);

      // Atualizar conversa
      await this.updateConversation(tenantId, data.whatsappNumber, {
        lastMessageAt: new Date(),
        unreadCount: 1 // Incrementar contador
      });

      // Notificar interface em tempo real
      this.notifyMessageReceived(tenantId, message);

      // Verificar se deve criar lead automaticamente
      await this.checkAutoCreateLead(tenantId, data);

    } catch (error) {
      console.error('Erro ao processar mensagem recebida:', error);
    }
  }

  private async handleMessageSent(data: any, tenantId: string): Promise<void> {
    try {
      const message: Partial<WhatsAppMessage> = {
        tenantId,
        whatsappNumber: data.whatsappNumber,
        messageId: data.messageId,
        content: data.content,
        messageType: this.mapMessageType(data.messageType),
        direction: MessageDirection.OUTBOUND,
        senderType: data.isBot ? SenderType.BOT : SenderType.HUMAN,
        senderName: data.senderName,
        timestamp: new Date(data.timestamp),
        status: MessageStatus.SENT,
        isRead: false,
        metadata: data.metadata
      };

      // Salvar mensagem
      await this.saveMessage(tenantId, message);

      // Atualizar conversa
      await this.updateConversation(tenantId, data.whatsappNumber, {
        lastMessageAt: new Date()
      });

      // Notificar interface em tempo real
      this.notifyMessageSent(tenantId, message);

    } catch (error) {
      console.error('Erro ao processar mensagem enviada:', error);
    }
  }

  private async handleMessageStatusUpdated(data: any, tenantId: string): Promise<void> {
    try {
      // Atualizar status da mensagem
      await this.updateMessageStatus(tenantId, data.messageId, data.status);

      // Notificar interface em tempo real
      this.notifyMessageStatusUpdated(tenantId, data.messageId, data.status);

    } catch (error) {
      console.error('Erro ao atualizar status da mensagem:', error);
    }
  }

  private async handleConversationStarted(data: any, tenantId: string): Promise<void> {
    try {
      const conversation: Partial<WhatsAppConversation> = {
        tenantId,
        whatsappNumber: data.whatsappNumber,
        contactName: data.contactName,
        status: ConversationStatus.OPEN,
        isActive: true,
        unreadCount: 0,
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Criar conversa
      await this.createConversation(tenantId, conversation);

      // Notificar interface
      this.notifyConversationStarted(tenantId, conversation);

    } catch (error) {
      console.error('Erro ao iniciar conversa:', error);
    }
  }

  private async handleConversationEnded(data: any, tenantId: string): Promise<void> {
    try {
      // Atualizar status da conversa
      await this.updateConversation(tenantId, data.whatsappNumber, {
        status: ConversationStatus.CLOSED,
        isActive: false
      });

      // Notificar interface
      this.notifyConversationEnded(tenantId, data.whatsappNumber);

    } catch (error) {
      console.error('Erro ao finalizar conversa:', error);
    }
  }

  private async handleUserTyping(data: any, tenantId: string): Promise<void> {
    try {
      // Notificar interface que usuário está digitando
      this.notifyUserTyping(tenantId, data.whatsappNumber, data.isTyping);

    } catch (error) {
      console.error('Erro ao processar evento de digitação:', error);
    }
  }

  private async handleBotActivated(data: any, tenantId: string): Promise<void> {
    try {
      // Registrar ativação do bot
      await this.logBotActivation(tenantId, data);

      // Notificar interface
      this.notifyBotActivated(tenantId, data.whatsappNumber);

    } catch (error) {
      console.error('Erro ao processar ativação do bot:', error);
    }
  }

  private async handleHumanRequested(data: any, tenantId: string): Promise<void> {
    try {
      // Atualizar conversa para atendimento humano
      await this.updateConversation(tenantId, data.whatsappNumber, {
        status: ConversationStatus.WAITING,
        assignedTo: null // Remover atribuição automática
      });

      // Criar tarefa para atendimento humano
      await this.createHumanAttendanceTask(tenantId, data);

      // Notificar interface
      this.notifyHumanRequested(tenantId, data.whatsappNumber);

    } catch (error) {
      console.error('Erro ao processar solicitação de atendimento humano:', error);
    }
  }

  // ==================== MÉTODOS AUXILIARES ====================

  private async saveMessage(tenantId: string, message: Partial<WhatsAppMessage>): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/chatbot/messages`, {
        method: 'POST',
        headers: this.getHeaders(tenantId),
        body: JSON.stringify(message),
      });
    } catch (error) {
      console.error('Erro ao salvar mensagem:', error);
    }
  }

  private async updateConversation(tenantId: string, whatsappNumber: string, updates: any): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/chatbot/conversations/whatsapp/${whatsappNumber}`, {
        method: 'PUT',
        headers: this.getHeaders(tenantId),
        body: JSON.stringify(updates),
      });
    } catch (error) {
      console.error('Erro ao atualizar conversa:', error);
    }
  }

  private async createConversation(tenantId: string, conversation: Partial<WhatsAppConversation>): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/chatbot/conversations`, {
        method: 'POST',
        headers: this.getHeaders(tenantId),
        body: JSON.stringify(conversation),
      });
    } catch (error) {
      console.error('Erro ao criar conversa:', error);
    }
  }

  private async updateMessageStatus(tenantId: string, messageId: string, status: string): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/chatbot/messages/${messageId}/status`, {
        method: 'PUT',
        headers: this.getHeaders(tenantId),
        body: JSON.stringify({ status }),
      });
    } catch (error) {
      console.error('Erro ao atualizar status da mensagem:', error);
    }
  }

  private async checkAutoCreateLead(tenantId: string, data: any): Promise<void> {
    try {
      // Verificar se deve criar lead automaticamente
      const response = await fetch(`${API_BASE_URL}/chatbot/auto-create-lead`, {
        method: 'POST',
        headers: this.getHeaders(tenantId),
        body: JSON.stringify({
          whatsappNumber: data.whatsappNumber,
          contactName: data.senderName,
          firstMessage: data.content
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.leadCreated) {
          this.notifyLeadCreated(tenantId, result.lead);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar criação automática de lead:', error);
    }
  }

  private async createHumanAttendanceTask(tenantId: string, data: any): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: this.getHeaders(tenantId),
        body: JSON.stringify({
          title: `Atendimento humano solicitado - ${data.whatsappNumber}`,
          description: `Cliente ${data.contactName || data.whatsappNumber} solicitou atendimento humano`,
          priority: 'high',
          type: 'human_attendance',
          metadata: {
            whatsappNumber: data.whatsappNumber,
            contactName: data.contactName,
            requestedAt: new Date()
          }
        }),
      });
    } catch (error) {
      console.error('Erro ao criar tarefa de atendimento humano:', error);
    }
  }

  private async logWebhookActivity(tenantId: string, event: string, data: any): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/chatbot/activity-log`, {
        method: 'POST',
        headers: this.getHeaders(tenantId),
        body: JSON.stringify({
          action: 'webhook_processed',
          description: `Webhook ${event} processado`,
          whatsappNumber: data.whatsappNumber,
          metadata: { event, data }
        }),
      });
    } catch (error) {
      console.error('Erro ao registrar atividade do webhook:', error);
    }
  }

  private async logBotActivation(tenantId: string, data: any): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/chatbot/activity-log`, {
        method: 'POST',
        headers: this.getHeaders(tenantId),
        body: JSON.stringify({
          action: 'bot_activated',
          description: `Bot ativado para ${data.whatsappNumber}`,
          whatsappNumber: data.whatsappNumber,
          metadata: data
        }),
      });
    } catch (error) {
      console.error('Erro ao registrar ativação do bot:', error);
    }
  }

  // ==================== NOTIFICAÇÕES EM TEMPO REAL ====================

  private notifyMessageReceived(tenantId: string, message: Partial<WhatsAppMessage>): void {
    window.dispatchEvent(new CustomEvent('whatsapp:message:received', {
      detail: { tenantId, message }
    }));
  }

  private notifyMessageSent(tenantId: string, message: Partial<WhatsAppMessage>): void {
    window.dispatchEvent(new CustomEvent('whatsapp:message:sent', {
      detail: { tenantId, message }
    }));
  }

  private notifyMessageStatusUpdated(tenantId: string, messageId: string, status: string): void {
    window.dispatchEvent(new CustomEvent('whatsapp:message:status', {
      detail: { tenantId, messageId, status }
    }));
  }

  private notifyConversationStarted(tenantId: string, conversation: Partial<WhatsAppConversation>): void {
    window.dispatchEvent(new CustomEvent('whatsapp:conversation:started', {
      detail: { tenantId, conversation }
    }));
  }

  private notifyConversationEnded(tenantId: string, whatsappNumber: string): void {
    window.dispatchEvent(new CustomEvent('whatsapp:conversation:ended', {
      detail: { tenantId, whatsappNumber }
    }));
  }

  private notifyUserTyping(tenantId: string, whatsappNumber: string, isTyping: boolean): void {
    window.dispatchEvent(new CustomEvent('whatsapp:user:typing', {
      detail: { tenantId, whatsappNumber, isTyping }
    }));
  }

  private notifyBotActivated(tenantId: string, whatsappNumber: string): void {
    window.dispatchEvent(new CustomEvent('whatsapp:bot:activated', {
      detail: { tenantId, whatsappNumber }
    }));
  }

  private notifyHumanRequested(tenantId: string, whatsappNumber: string): void {
    window.dispatchEvent(new CustomEvent('whatsapp:human:requested', {
      detail: { tenantId, whatsappNumber }
    }));
  }

  private notifyLeadCreated(tenantId: string, lead: any): void {
    window.dispatchEvent(new CustomEvent('whatsapp:lead:created', {
      detail: { tenantId, lead }
    }));
  }

  // ==================== SERVER-SENT EVENTS ====================

  startListening(tenantId: string): void {
    if (this.isListening) {
      this.stopListening();
    }

    try {
      const url = `${API_BASE_URL}/chatbot/events/stream?tenantId=${tenantId}`;
      this.eventSource = new EventSource(url);

      this.eventSource.onopen = () => {
        console.log('Conexão SSE estabelecida para webhooks');
        this.isListening = true;
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.processWebhook(data);
        } catch (error) {
          console.error('Erro ao processar evento SSE:', error);
        }
      };

      this.eventSource.onerror = (error) => {
        console.error('Erro na conexão SSE:', error);
        this.stopListening();
        
        // Tentar reconectar após 5 segundos
        setTimeout(() => {
          if (!this.isListening) {
            this.startListening(tenantId);
          }
        }, 5000);
      };

    } catch (error) {
      console.error('Erro ao iniciar escuta de eventos:', error);
    }
  }

  stopListening(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.isListening = false;
    console.log('Escuta de eventos SSE interrompida');
  }

  // ==================== UTILITÁRIOS ====================

  private mapMessageType(type: string): MessageType {
    const typeMap: { [key: string]: MessageType } = {
      'text': MessageType.TEXT,
      'image': MessageType.IMAGE,
      'audio': MessageType.AUDIO,
      'video': MessageType.VIDEO,
      'document': MessageType.DOCUMENT,
      'location': MessageType.LOCATION,
      'contact': MessageType.CONTACT,
      'sticker': MessageType.STICKER
    };

    return typeMap[type] || MessageType.TEXT;
  }

  isListeningToEvents(): boolean {
    return this.isListening;
  }

  getEventHandlers(): string[] {
    return Array.from(this.eventHandlers.keys());
  }

  // ==================== VALIDAÇÃO DE WEBHOOK ====================

  validateWebhookSignature(payload: string, signature: string, secret: string): boolean {
    // Implementar validação de assinatura do webhook
    // Por enquanto, retorna true (implementar validação real em produção)
    try {
      // Exemplo de validação HMAC SHA256
      // const crypto = require('crypto');
      // const expectedSignature = crypto
      //   .createHmac('sha256', secret)
      //   .update(payload)
      //   .digest('hex');
      // return signature === expectedSignature;
      
      return true; // Placeholder
    } catch (error) {
      console.error('Erro ao validar assinatura do webhook:', error);
      return false;
    }
  }
}

export const smartbotWebhookService = new SmartbotWebhookService();

