// Serviço de Integração D4Sign - 100% Multi-Tenant
// Baseado na documentação oficial: https://docapi.d4sign.com.br/docs/introdução-a-api

import { D4SignConfig, D4SignResponse, D4SignWebhook, Contract } from '@/types/contracts';

const API_BASE_URL = 'https://www.api.app.jttecnologia.com.br';

class D4SignService {
  private getHeaders(tenantId: string): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'X-Tenant-ID': tenantId, // Isolamento multi-tenant
    };
  }

  // ==================== CONFIGURAÇÃO ====================

  /**
   * Testa a conexão com a API D4Sign usando as credenciais configuradas
   */
  async testConnection(tenantId: string): Promise<{ success: boolean, message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/d4sign/test-connection`, {
        method: 'POST',
        headers: this.getHeaders(tenantId),
      });

      const result = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          message: result.message || 'Erro ao testar conexão com D4Sign'
        };
      }

      return {
        success: true,
        message: 'Conexão com D4Sign estabelecida com sucesso'
      };
    } catch (error) {
      console.error('Erro ao testar conexão D4Sign:', error);
      return {
        success: false,
        message: 'Erro de rede ao conectar com D4Sign'
      };
    }
  }

  /**
   * Valida as credenciais D4Sign fornecidas
   */
  async validateCredentials(
    tenantId: string, 
    apiKey: string, 
    apiSecret: string
  ): Promise<{ valid: boolean, message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/d4sign/validate-credentials`, {
        method: 'POST',
        headers: this.getHeaders(tenantId),
        body: JSON.stringify({ apiKey, apiSecret }),
      });

      const result = await response.json();
      
      return {
        valid: response.ok,
        message: result.message || (response.ok ? 'Credenciais válidas' : 'Credenciais inválidas')
      };
    } catch (error) {
      console.error('Erro ao validar credenciais:', error);
      return {
        valid: false,
        message: 'Erro ao validar credenciais'
      };
    }
  }

  // ==================== DOCUMENTOS ====================

  /**
   * Cria um documento no D4Sign baseado no contrato
   */
  async createDocument(tenantId: string, contractId: string): Promise<D4SignResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/d4sign/documents`, {
        method: 'POST',
        headers: this.getHeaders(tenantId),
        body: JSON.stringify({ contractId }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          message: result.message || 'Erro ao criar documento no D4Sign',
          error: result.error
        };
      }

      return {
        success: true,
        message: 'Documento criado com sucesso no D4Sign',
        data: result.data
      };
    } catch (error) {
      console.error('Erro ao criar documento:', error);
      return {
        success: false,
        message: 'Erro de rede ao criar documento',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Adiciona signatários ao documento no D4Sign
   */
  async addSignatories(
    tenantId: string, 
    d4signDocumentId: string, 
    signatories: Array<{
      name: string;
      email: string;
      document: string;
      order: number;
      type: string;
    }>
  ): Promise<D4SignResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/d4sign/documents/${d4signDocumentId}/signatories`, {
        method: 'POST',
        headers: this.getHeaders(tenantId),
        body: JSON.stringify({ signatories }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          message: result.message || 'Erro ao adicionar signatários',
          error: result.error
        };
      }

      return {
        success: true,
        message: 'Signatários adicionados com sucesso',
        data: result.data
      };
    } catch (error) {
      console.error('Erro ao adicionar signatários:', error);
      return {
        success: false,
        message: 'Erro ao adicionar signatários',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Envia o documento para assinatura
   */
  async sendForSignature(tenantId: string, d4signDocumentId: string): Promise<D4SignResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/d4sign/documents/${d4signDocumentId}/send`, {
        method: 'POST',
        headers: this.getHeaders(tenantId),
      });

      const result = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          message: result.message || 'Erro ao enviar documento para assinatura',
          error: result.error
        };
      }

      return {
        success: true,
        message: 'Documento enviado para assinatura com sucesso',
        data: result.data
      };
    } catch (error) {
      console.error('Erro ao enviar documento:', error);
      return {
        success: false,
        message: 'Erro ao enviar documento para assinatura',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Reenvia o documento para um signatário específico
   */
  async resendToSignatory(
    tenantId: string, 
    d4signDocumentId: string, 
    signatoryId: string
  ): Promise<D4SignResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/d4sign/documents/${d4signDocumentId}/resend`, {
        method: 'POST',
        headers: this.getHeaders(tenantId),
        body: JSON.stringify({ signatoryId }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          message: result.message || 'Erro ao reenviar documento',
          error: result.error
        };
      }

      return {
        success: true,
        message: 'Documento reenviado com sucesso',
        data: result.data
      };
    } catch (error) {
      console.error('Erro ao reenviar documento:', error);
      return {
        success: false,
        message: 'Erro ao reenviar documento',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  // ==================== STATUS E CONSULTAS ====================

  /**
   * Consulta o status do documento no D4Sign
   */
  async getDocumentStatus(tenantId: string, d4signDocumentId: string): Promise<D4SignResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/d4sign/documents/${d4signDocumentId}/status`, {
        headers: this.getHeaders(tenantId),
      });

      const result = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          message: result.message || 'Erro ao consultar status do documento',
          error: result.error
        };
      }

      return {
        success: true,
        message: 'Status consultado com sucesso',
        data: result.data
      };
    } catch (error) {
      console.error('Erro ao consultar status:', error);
      return {
        success: false,
        message: 'Erro ao consultar status do documento',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Consulta o status dos signatários
   */
  async getSignatoriesStatus(tenantId: string, d4signDocumentId: string): Promise<D4SignResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/d4sign/documents/${d4signDocumentId}/signatories/status`, {
        headers: this.getHeaders(tenantId),
      });

      const result = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          message: result.message || 'Erro ao consultar status dos signatários',
          error: result.error
        };
      }

      return {
        success: true,
        message: 'Status dos signatários consultado com sucesso',
        data: result.data
      };
    } catch (error) {
      console.error('Erro ao consultar status dos signatários:', error);
      return {
        success: false,
        message: 'Erro ao consultar status dos signatários',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  // ==================== DOWNLOAD ====================

  /**
   * Baixa o documento assinado
   */
  async downloadSignedDocument(tenantId: string, d4signDocumentId: string): Promise<Blob | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/d4sign/documents/${d4signDocumentId}/download`, {
        headers: this.getHeaders(tenantId),
      });

      if (!response.ok) {
        throw new Error('Erro ao baixar documento assinado');
      }

      return await response.blob();
    } catch (error) {
      console.error('Erro ao baixar documento:', error);
      return null;
    }
  }

  // ==================== WEBHOOKS ====================

  /**
   * Processa webhook recebido do D4Sign
   */
  async processWebhook(tenantId: string, webhookData: D4SignWebhook): Promise<D4SignResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/d4sign/webhook`, {
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

  // ==================== CANCELAMENTO ====================

  /**
   * Cancela um documento no D4Sign
   */
  async cancelDocument(tenantId: string, d4signDocumentId: string, reason: string): Promise<D4SignResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/d4sign/documents/${d4signDocumentId}/cancel`, {
        method: 'POST',
        headers: this.getHeaders(tenantId),
        body: JSON.stringify({ reason }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          message: result.message || 'Erro ao cancelar documento',
          error: result.error
        };
      }

      return {
        success: true,
        message: 'Documento cancelado com sucesso',
        data: result.data
      };
    } catch (error) {
      console.error('Erro ao cancelar documento:', error);
      return {
        success: false,
        message: 'Erro ao cancelar documento',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  // ==================== FLUXO COMPLETO ====================

  /**
   * Fluxo completo: criar documento, adicionar signatários e enviar para assinatura
   */
  async sendContractToD4Sign(tenantId: string, contractId: string): Promise<D4SignResponse> {
    try {
      // 1. Criar documento
      const createResult = await this.createDocument(tenantId, contractId);
      if (!createResult.success) {
        return createResult;
      }

      const d4signDocumentId = createResult.data.documentId;

      // 2. Adicionar signatários (será feito pelo backend baseado no contrato)
      const addSignatoriesResult = await fetch(`${API_BASE_URL}/d4sign/contracts/${contractId}/setup-signatories`, {
        method: 'POST',
        headers: this.getHeaders(tenantId),
        body: JSON.stringify({ d4signDocumentId }),
      });

      if (!addSignatoriesResult.ok) {
        return {
          success: false,
          message: 'Erro ao configurar signatários',
          error: 'Falha na configuração dos signatários'
        };
      }

      // 3. Enviar para assinatura
      const sendResult = await this.sendForSignature(tenantId, d4signDocumentId);
      if (!sendResult.success) {
        return sendResult;
      }

      return {
        success: true,
        message: 'Contrato enviado para assinatura com sucesso',
        data: {
          d4signDocumentId,
          ...sendResult.data
        }
      };
    } catch (error) {
      console.error('Erro no fluxo completo:', error);
      return {
        success: false,
        message: 'Erro no processo de envio para assinatura',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  // ==================== UTILITÁRIOS ====================

  /**
   * Converte status do D4Sign para status interno do sistema
   */
  mapD4SignStatusToInternal(d4signStatus: string): string {
    const statusMap: { [key: string]: string } = {
      'waiting': 'pending_signature',
      'signed': 'signed',
      'cancelled': 'cancelled',
      'expired': 'expired',
      'completed': 'active'
    };

    return statusMap[d4signStatus] || 'pending_signature';
  }

  /**
   * Formata dados do signatário para o D4Sign
   */
  formatSignatoryForD4Sign(signatory: any) {
    return {
      name: signatory.name,
      email: signatory.email,
      document: signatory.document.replace(/\D/g, ''), // Remove formatação
      order: signatory.order,
      type: signatory.type === 'client' ? 'signer' : 'witness'
    };
  }

  /**
   * Valida se o webhook é autêntico (verificação de segurança)
   */
  validateWebhookSignature(payload: string, signature: string, secret: string): boolean {
    // Implementar validação de assinatura conforme documentação D4Sign
    // Por enquanto, retorna true (implementar validação real em produção)
    return true;
  }
}

export const d4signService = new D4SignService();

