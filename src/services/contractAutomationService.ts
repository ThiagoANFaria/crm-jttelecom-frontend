// Serviço de Automação de Contratos - 100% Multi-Tenant
// Integração com módulo de tarefas e linha do tempo

import { 
  ContractAutomation, 
  ContractTrigger, 
  ContractAction, 
  Contract,
  ContractStatus 
} from '@/types/contracts';

const API_BASE_URL = 'https://www.api.app.jttecnologia.com.br';

interface AutomationTask {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
  contractId: string;
  type: 'follow_up' | 'onboarding' | 'renewal' | 'expiration_alert';
}

interface TimelineEvent {
  id: string;
  type: 'contract_sent' | 'contract_signed' | 'contract_expired' | 'contract_renewed';
  title: string;
  description: string;
  date: Date;
  contractId: string;
  clientId?: string;
  leadId?: string;
  metadata?: any;
}

class ContractAutomationService {
  private getHeaders(tenantId: string): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'X-Tenant-ID': tenantId, // Isolamento multi-tenant
    };
  }

  // ==================== AUTOMAÇÕES ====================

  /**
   * Executa automações baseadas em trigger de contrato
   */
  async executeTrigger(
    tenantId: string, 
    trigger: ContractTrigger, 
    contract: Contract
  ): Promise<{ success: boolean, executedActions: string[] }> {
    try {
      const response = await fetch(`${API_BASE_URL}/contracts/automation/execute`, {
        method: 'POST',
        headers: this.getHeaders(tenantId),
        body: JSON.stringify({ trigger, contractId: contract.id }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Erro ao executar automação');
      }

      return {
        success: true,
        executedActions: result.executedActions || []
      };
    } catch (error) {
      console.error('Erro ao executar automação:', error);
      return {
        success: false,
        executedActions: []
      };
    }
  }

  // ==================== TAREFAS AUTOMÁTICAS ====================

  /**
   * Cria tarefa de acompanhamento quando contrato é enviado
   */
  async createFollowUpTask(tenantId: string, contract: Contract): Promise<AutomationTask | null> {
    try {
      const task: Omit<AutomationTask, 'id'> = {
        title: `Acompanhar assinatura - ${contract.contractNumber}`,
        description: `Acompanhar o status de assinatura do contrato ${contract.title}`,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 dias
        priority: 'medium',
        contractId: contract.id,
        type: 'follow_up'
      };

      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: this.getHeaders(tenantId),
        body: JSON.stringify(task),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar tarefa de acompanhamento');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao criar tarefa de acompanhamento:', error);
      return null;
    }
  }

  /**
   * Cria tarefa de onboarding quando contrato é assinado
   */
  async createOnboardingTask(tenantId: string, contract: Contract): Promise<AutomationTask | null> {
    try {
      const task: Omit<AutomationTask, 'id'> = {
        title: `Onboarding - ${contract.contractNumber}`,
        description: `Iniciar processo de onboarding para o cliente do contrato ${contract.title}`,
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 dia
        priority: 'high',
        contractId: contract.id,
        type: 'onboarding'
      };

      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: this.getHeaders(tenantId),
        body: JSON.stringify(task),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar tarefa de onboarding');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao criar tarefa de onboarding:', error);
      return null;
    }
  }

  /**
   * Cria tarefa de renovação quando contrato está próximo do vencimento
   */
  async createRenewalTask(tenantId: string, contract: Contract): Promise<AutomationTask | null> {
    try {
      const task: Omit<AutomationTask, 'id'> = {
        title: `Renovação - ${contract.contractNumber}`,
        description: `Contrato ${contract.title} vence em breve. Iniciar processo de renovação.`,
        dueDate: new Date(contract.endDate.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 dias antes
        priority: 'high',
        contractId: contract.id,
        type: 'renewal'
      };

      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: this.getHeaders(tenantId),
        body: JSON.stringify(task),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar tarefa de renovação');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao criar tarefa de renovação:', error);
      return null;
    }
  }

  /**
   * Cria alerta de expiração
   */
  async createExpirationAlert(tenantId: string, contract: Contract): Promise<AutomationTask | null> {
    try {
      const task: Omit<AutomationTask, 'id'> = {
        title: `ALERTA: Contrato expirando - ${contract.contractNumber}`,
        description: `URGENTE: Contrato ${contract.title} expira em breve!`,
        dueDate: new Date(contract.endDate.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 dias antes
        priority: 'high',
        contractId: contract.id,
        type: 'expiration_alert'
      };

      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: this.getHeaders(tenantId),
        body: JSON.stringify(task),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar alerta de expiração');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao criar alerta de expiração:', error);
      return null;
    }
  }

  // ==================== LINHA DO TEMPO ====================

  /**
   * Adiciona evento na linha do tempo quando contrato é enviado
   */
  async addContractSentEvent(tenantId: string, contract: Contract): Promise<TimelineEvent | null> {
    try {
      const event: Omit<TimelineEvent, 'id'> = {
        type: 'contract_sent',
        title: 'Contrato Enviado para Assinatura',
        description: `Contrato ${contract.contractNumber} foi enviado para assinatura digital`,
        date: new Date(),
        contractId: contract.id,
        clientId: contract.clientId,
        leadId: contract.leadId,
        metadata: {
          contractNumber: contract.contractNumber,
          contractTitle: contract.title,
          totalValue: contract.totalValue
        }
      };

      const response = await fetch(`${API_BASE_URL}/timeline/events`, {
        method: 'POST',
        headers: this.getHeaders(tenantId),
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        throw new Error('Erro ao adicionar evento na linha do tempo');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao adicionar evento na linha do tempo:', error);
      return null;
    }
  }

  /**
   * Adiciona evento na linha do tempo quando contrato é assinado
   */
  async addContractSignedEvent(tenantId: string, contract: Contract): Promise<TimelineEvent | null> {
    try {
      const event: Omit<TimelineEvent, 'id'> = {
        type: 'contract_signed',
        title: 'Contrato Assinado',
        description: `Contrato ${contract.contractNumber} foi assinado por todas as partes`,
        date: new Date(),
        contractId: contract.id,
        clientId: contract.clientId,
        leadId: contract.leadId,
        metadata: {
          contractNumber: contract.contractNumber,
          contractTitle: contract.title,
          totalValue: contract.totalValue,
          signedAt: contract.signedAt
        }
      };

      const response = await fetch(`${API_BASE_URL}/timeline/events`, {
        method: 'POST',
        headers: this.getHeaders(tenantId),
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        throw new Error('Erro ao adicionar evento na linha do tempo');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao adicionar evento na linha do tempo:', error);
      return null;
    }
  }

  /**
   * Adiciona evento na linha do tempo quando contrato expira
   */
  async addContractExpiredEvent(tenantId: string, contract: Contract): Promise<TimelineEvent | null> {
    try {
      const event: Omit<TimelineEvent, 'id'> = {
        type: 'contract_expired',
        title: 'Contrato Expirado',
        description: `Contrato ${contract.contractNumber} expirou`,
        date: new Date(),
        contractId: contract.id,
        clientId: contract.clientId,
        leadId: contract.leadId,
        metadata: {
          contractNumber: contract.contractNumber,
          contractTitle: contract.title,
          endDate: contract.endDate
        }
      };

      const response = await fetch(`${API_BASE_URL}/timeline/events`, {
        method: 'POST',
        headers: this.getHeaders(tenantId),
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        throw new Error('Erro ao adicionar evento na linha do tempo');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao adicionar evento na linha do tempo:', error);
      return null;
    }
  }

  /**
   * Adiciona evento na linha do tempo quando contrato é renovado
   */
  async addContractRenewedEvent(tenantId: string, contract: Contract): Promise<TimelineEvent | null> {
    try {
      const event: Omit<TimelineEvent, 'id'> = {
        type: 'contract_renewed',
        title: 'Contrato Renovado',
        description: `Contrato ${contract.contractNumber} foi renovado`,
        date: new Date(),
        contractId: contract.id,
        clientId: contract.clientId,
        leadId: contract.leadId,
        metadata: {
          contractNumber: contract.contractNumber,
          contractTitle: contract.title,
          newEndDate: contract.endDate
        }
      };

      const response = await fetch(`${API_BASE_URL}/timeline/events`, {
        method: 'POST',
        headers: this.getHeaders(tenantId),
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        throw new Error('Erro ao adicionar evento na linha do tempo');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao adicionar evento na linha do tempo:', error);
      return null;
    }
  }

  // ==================== NOTIFICAÇÕES ====================

  /**
   * Envia notificação por email
   */
  async sendEmailNotification(
    tenantId: string, 
    to: string, 
    subject: string, 
    content: string,
    contractId: string
  ): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/email`, {
        method: 'POST',
        headers: this.getHeaders(tenantId),
        body: JSON.stringify({
          to,
          subject,
          content,
          metadata: { contractId, type: 'contract_automation' }
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Erro ao enviar notificação por email:', error);
      return false;
    }
  }

  /**
   * Envia notificação interna do sistema
   */
  async sendSystemNotification(
    tenantId: string,
    userId: string,
    title: string,
    message: string,
    contractId: string
  ): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/system`, {
        method: 'POST',
        headers: this.getHeaders(tenantId),
        body: JSON.stringify({
          userId,
          title,
          message,
          type: 'contract',
          metadata: { contractId }
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Erro ao enviar notificação do sistema:', error);
      return false;
    }
  }

  // ==================== FOLLOW-UP AUTOMÁTICO ====================

  /**
   * Executa follow-up automático para contratos pendentes
   */
  async executeAutomaticFollowUp(tenantId: string): Promise<{ processed: number, errors: number }> {
    try {
      const response = await fetch(`${API_BASE_URL}/contracts/automation/follow-up`, {
        method: 'POST',
        headers: this.getHeaders(tenantId),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Erro ao executar follow-up automático');
      }

      return {
        processed: result.processed || 0,
        errors: result.errors || 0
      };
    } catch (error) {
      console.error('Erro ao executar follow-up automático:', error);
      return { processed: 0, errors: 1 };
    }
  }

  /**
   * Verifica contratos que precisam de follow-up
   */
  async checkPendingFollowUps(tenantId: string): Promise<Contract[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/contracts/automation/pending-follow-ups`, {
        headers: this.getHeaders(tenantId),
      });

      if (!response.ok) {
        throw new Error('Erro ao verificar follow-ups pendentes');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao verificar follow-ups pendentes:', error);
      return [];
    }
  }

  // ==================== FLUXOS COMPLETOS ====================

  /**
   * Fluxo completo quando contrato é enviado para assinatura
   */
  async handleContractSent(tenantId: string, contract: Contract): Promise<void> {
    try {
      // 1. Criar tarefa de acompanhamento
      await this.createFollowUpTask(tenantId, contract);

      // 2. Adicionar evento na linha do tempo
      await this.addContractSentEvent(tenantId, contract);

      // 3. Enviar notificação
      await this.sendSystemNotification(
        tenantId,
        contract.createdBy,
        'Contrato Enviado',
        `O contrato ${contract.contractNumber} foi enviado para assinatura.`,
        contract.id
      );

      // 4. Executar automações configuradas
      await this.executeTrigger(tenantId, ContractTrigger.CONTRACT_SENT, contract);
    } catch (error) {
      console.error('Erro no fluxo de contrato enviado:', error);
    }
  }

  /**
   * Fluxo completo quando contrato é assinado
   */
  async handleContractSigned(tenantId: string, contract: Contract): Promise<void> {
    try {
      // 1. Criar tarefa de onboarding
      await this.createOnboardingTask(tenantId, contract);

      // 2. Adicionar evento na linha do tempo
      await this.addContractSignedEvent(tenantId, contract);

      // 3. Enviar notificação
      await this.sendSystemNotification(
        tenantId,
        contract.createdBy,
        'Contrato Assinado',
        `O contrato ${contract.contractNumber} foi assinado com sucesso!`,
        contract.id
      );

      // 4. Criar tarefa de renovação (se aplicável)
      if (contract.endDate) {
        await this.createRenewalTask(tenantId, contract);
      }

      // 5. Executar automações configuradas
      await this.executeTrigger(tenantId, ContractTrigger.CONTRACT_SIGNED, contract);
    } catch (error) {
      console.error('Erro no fluxo de contrato assinado:', error);
    }
  }

  /**
   * Fluxo completo quando contrato está expirando
   */
  async handleContractExpiring(tenantId: string, contract: Contract): Promise<void> {
    try {
      // 1. Criar alerta de expiração
      await this.createExpirationAlert(tenantId, contract);

      // 2. Enviar notificação urgente
      await this.sendSystemNotification(
        tenantId,
        contract.createdBy,
        'Contrato Expirando',
        `URGENTE: O contrato ${contract.contractNumber} expira em breve!`,
        contract.id
      );

      // 3. Executar automações configuradas
      await this.executeTrigger(tenantId, ContractTrigger.CONTRACT_EXPIRING, contract);
    } catch (error) {
      console.error('Erro no fluxo de contrato expirando:', error);
    }
  }

  /**
   * Fluxo completo quando contrato expira
   */
  async handleContractExpired(tenantId: string, contract: Contract): Promise<void> {
    try {
      // 1. Adicionar evento na linha do tempo
      await this.addContractExpiredEvent(tenantId, contract);

      // 2. Enviar notificação
      await this.sendSystemNotification(
        tenantId,
        contract.createdBy,
        'Contrato Expirado',
        `O contrato ${contract.contractNumber} expirou.`,
        contract.id
      );

      // 3. Executar automações configuradas
      await this.executeTrigger(tenantId, ContractTrigger.CONTRACT_EXPIRED, contract);
    } catch (error) {
      console.error('Erro no fluxo de contrato expirado:', error);
    }
  }
}

export const contractAutomationService = new ContractAutomationService();

