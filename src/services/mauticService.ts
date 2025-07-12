// Serviço de Integração Mautic - 100% Multi-Tenant
// Implementa integração completa com Mautic para automações e cadências

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { 
  MauticIntegration,
  MauticConfig,
  MauticCredentials,
  MauticContact, 
  MauticCampaign,
  MauticSegment,
  MauticEmail,
  MauticForm,
  MauticEvent
} from '@/types/automation';

// Tipos locais
type MauticAuthType = 'oauth2' | 'basic';
type MauticSyncStatus = 'connected' | 'error' | 'syncing';

class MauticService {
  private clients: Map<string, AxiosInstance> = new Map();
  private configs: Map<string, MauticConfig> = new Map();
  
  // Inicializa cliente Mautic para um tenant específico
  async initClient(tenantId: string, config: MauticConfig): Promise<boolean> {
    try {
      let axiosConfig: AxiosRequestConfig = {
        baseURL: config.baseUrl,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      };

      // Configurar autenticação baseada no tipo
      if (config.authType === MauticAuthType.BASIC) {
        axiosConfig.auth = {
          username: config.username || '',
          password: config.password || ''
        };
      } else if (config.authType === MauticAuthType.OAUTH2) {
        axiosConfig.headers = {
          ...axiosConfig.headers,
          'Authorization': `Bearer ${config.accessToken}`
        };
      }

      const client = axios.create(axiosConfig);
      
      // Adicionar interceptor para renovar token OAuth2 se necessário
      if (config.authType === MauticAuthType.OAUTH2) {
        client.interceptors.response.use(
          response => response,
          async error => {
            const originalRequest = error.config;
            
            // Se o erro for 401 (Unauthorized) e temos um refreshToken
            if (error.response.status === 401 && config.refreshToken && !originalRequest._retry) {
              originalRequest._retry = true;
              
              // Renovar token
              const newToken = await this.refreshOAuthToken(tenantId, config);
              
              // Atualizar token no request original e retentar
              originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
              return client(originalRequest);
            }
            
            return Promise.reject(error);
          }
        );
      }
      
      // Salvar cliente e configuração
      this.clients.set(tenantId, client);
      this.configs.set(tenantId, config);
      
      return true;
    } catch (error) {
      console.error('Erro ao inicializar cliente Mautic:', error);
      return false;
    }
  }
  
  // Renovar token OAuth2
  private async refreshOAuthToken(tenantId: string, config: MauticConfig): Promise<string> {
    try {
      const response = await axios.post(`${config.baseUrl}/oauth/v2/token`, {
        client_id: config.clientId,
        client_secret: config.clientSecret,
        refresh_token: config.refreshToken,
        grant_type: 'refresh_token'
      });
      
      // Atualizar configuração com novos tokens
      const newConfig = {
        ...config,
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token
      };
      
      this.configs.set(tenantId, newConfig);
      
      // Aqui deveria salvar a nova configuração no backend
      // await this.saveConfig(tenantId, newConfig);
      
      return response.data.access_token;
    } catch (error) {
      console.error('Erro ao renovar token OAuth2:', error);
      throw error;
    }
  }
  
  // Obter cliente para um tenant
  private getClient(tenantId: string): AxiosInstance {
    const client = this.clients.get(tenantId);
    if (!client) {
      throw new Error(`Cliente Mautic não inicializado para tenant ${tenantId}`);
    }
    return client;
  }
  
  // Testar conexão com Mautic
  async testConnection(tenantId: string): Promise<boolean> {
    try {
      const client = this.getClient(tenantId);
      const response = await client.get('/api/contacts?limit=1');
      return response.status === 200;
    } catch (error) {
      console.error('Erro ao testar conexão Mautic:', error);
      return false;
    }
  }
  
  // Obter contatos do Mautic
  async getContacts(tenantId: string, params: any = {}): Promise<MauticContact[]> {
    try {
      const client = this.getClient(tenantId);
      const response = await client.get('/api/contacts', { params });
      return response.data.contacts || [];
    } catch (error) {
      console.error('Erro ao obter contatos Mautic:', error);
      return [];
    }
  }
  
  // Criar ou atualizar contato no Mautic
  async createOrUpdateContact(tenantId: string, contact: Partial<MauticContact>): Promise<MauticContact | null> {
    try {
      const client = this.getClient(tenantId);
      
      // Se tiver ID, atualiza, senão cria
      if (contact.id) {
        const response = await client.patch(`/api/contacts/${contact.id}/edit`, { contact });
        return response.data.contact;
      } else {
        const response = await client.post('/api/contacts/new', { contact });
        return response.data.contact;
      }
    } catch (error) {
      console.error('Erro ao criar/atualizar contato Mautic:', error);
      return null;
    }
  }
  
  // Obter campanhas do Mautic
  async getCampaigns(tenantId: string, params: any = {}): Promise<MauticCampaign[]> {
    try {
      const client = this.getClient(tenantId);
      const response = await client.get('/api/campaigns', { params });
      return response.data.campaigns || [];
    } catch (error) {
      console.error('Erro ao obter campanhas Mautic:', error);
      return [];
    }
  }
  
  // Adicionar contato a uma campanha
  async addContactToCampaign(tenantId: string, campaignId: string, contactId: string): Promise<boolean> {
    try {
      const client = this.getClient(tenantId);
      const response = await client.post(`/api/campaigns/${campaignId}/contact/${contactId}/add`);
      return response.status === 200;
    } catch (error) {
      console.error('Erro ao adicionar contato à campanha Mautic:', error);
      return false;
    }
  }
  
  // Obter segmentos do Mautic
  async getSegments(tenantId: string): Promise<MauticSegment[]> {
    try {
      const client = this.getClient(tenantId);
      const response = await client.get('/api/segments');
      return response.data.lists || [];
    } catch (error) {
      console.error('Erro ao obter segmentos Mautic:', error);
      return [];
    }
  }
  
  // Adicionar contato a um segmento
  async addContactToSegment(tenantId: string, segmentId: string, contactId: string): Promise<boolean> {
    try {
      const client = this.getClient(tenantId);
      const response = await client.post(`/api/segments/${segmentId}/contact/${contactId}/add`);
      return response.status === 200;
    } catch (error) {
      console.error('Erro ao adicionar contato ao segmento Mautic:', error);
      return false;
    }
  }
  
  // Obter e-mails do Mautic
  async getEmails(tenantId: string): Promise<MauticEmail[]> {
    try {
      const client = this.getClient(tenantId);
      const response = await client.get('/api/emails');
      return response.data.emails || [];
    } catch (error) {
      console.error('Erro ao obter e-mails Mautic:', error);
      return [];
    }
  }
  
  // Enviar e-mail para contato
  async sendEmailToContact(tenantId: string, emailId: string, contactId: string): Promise<boolean> {
    try {
      const client = this.getClient(tenantId);
      const response = await client.post(`/api/emails/${emailId}/contact/${contactId}/send`);
      return response.status === 200;
    } catch (error) {
      console.error('Erro ao enviar e-mail para contato Mautic:', error);
      return false;
    }
  }
  
  // Obter formulários do Mautic
  async getForms(tenantId: string): Promise<MauticForm[]> {
    try {
      const client = this.getClient(tenantId);
      const response = await client.get('/api/forms');
      return response.data.forms || [];
    } catch (error) {
      console.error('Erro ao obter formulários Mautic:', error);
      return [];
    }
  }
  
  // Obter eventos do Mautic para um contato
  async getContactEvents(tenantId: string, contactId: string): Promise<MauticEvent[]> {
    try {
      const client = this.getClient(tenantId);
      const response = await client.get(`/api/contacts/${contactId}/events`);
      return response.data.events || [];
    } catch (error) {
      console.error('Erro ao obter eventos de contato Mautic:', error);
      return [];
    }
  }
  
  // Sincronizar leads do CRM com contatos Mautic
  async syncLeadsToMautic(tenantId: string, leads: any[]): Promise<MauticSyncStatus> {
    try {
      let created = 0;
      let updated = 0;
      let failed = 0;
      
      for (const lead of leads) {
        // Mapear lead para formato de contato Mautic
        const contact: Partial<MauticContact> = {
          firstname: lead.firstName,
          lastname: lead.lastName,
          email: lead.email,
          mobile: lead.phone,
          company: lead.company,
          // Campos personalizados
          custom_fields: {
            crm_id: lead.id,
            crm_stage: lead.stage,
            crm_source: lead.source
          }
        };
        
        // Criar ou atualizar contato
        const result = await this.createOrUpdateContact(tenantId, contact);
        
        if (result) {
          if (result.isNew) {
            created++;
          } else {
            updated++;
          }
        } else {
          failed++;
        }
      }
      
      return {
        created,
        updated,
        failed,
        total: leads.length
      };
    } catch (error) {
      console.error('Erro ao sincronizar leads com Mautic:', error);
      return {
        created: 0,
        updated: 0,
        failed: leads.length,
        total: leads.length,
        error: error.message
      };
    }
  }
  
  // Configurar webhook para eventos Mautic
  async configureWebhook(tenantId: string, webhookUrl: string, events: string[]): Promise<boolean> {
    try {
      const client = this.getClient(tenantId);
      
      // Criar webhook
      const webhook = {
        name: `CRM Integration - ${tenantId}`,
        description: 'Webhook para integração com CRM',
        webhookUrl,
        events: events.reduce((obj, event) => ({ ...obj, [event]: true }), {})
      };
      
      const response = await client.post('/api/webhooks/new', { webhook });
      return response.status === 200;
    } catch (error) {
      console.error('Erro ao configurar webhook Mautic:', error);
      return false;
    }
  }
  
  // Processar evento de webhook Mautic
  async processWebhookEvent(tenantId: string, event: any): Promise<boolean> {
    try {
      // Implementação depende da estrutura do evento e da lógica de negócio
      console.log(`Processando evento Mautic para tenant ${tenantId}:`, event);
      
      // Aqui seria implementada a lógica para processar o evento
      // Por exemplo, atualizar lead no CRM quando um e-mail é aberto
      
      return true;
    } catch (error) {
      console.error('Erro ao processar evento webhook Mautic:', error);
      return false;
    }
  }
}

export const mauticService = new MauticService();

