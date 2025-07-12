// Serviço de Automações e Cadência - 100% Multi-Tenant
// Integração com API e Mautic conforme prompt técnico

import { 
  AutomationFlow, 
  Cadence, 
  InactivityRule,
  MauticIntegration,
  EmailTemplate,
  WhatsAppTemplate,
  AutomationExecution,
  CadenceEnrollment,
  AutomationDashboard,
  AutomationFilters,
  AutomationSearchResult,
  AutomationPermissions,
  TriggerType,
  ActionType,
  CadenceType,
  ExecutionStatus
} from '@/types/automation';

class AutomationService {
  private baseUrl = 'https://www.api.app.jttecnologia.com.br';

  // Headers padrão com tenant
  private getHeaders(tenantId: string): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'X-Tenant-ID': tenantId,
      'Authorization': `Bearer ${this.getAuthToken()}`,
    };
  }

  private getAuthToken(): string {
    // TODO: Implementar recuperação do token de autenticação
    return localStorage.getItem('auth_token') || '';
  }

  // ==================== FLUXOS DE AUTOMAÇÃO ====================

  async getFlows(tenantId: string, filters?: AutomationFilters): Promise<AutomationFlow[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const response = await fetch(
      `${this.baseUrl}/automation/flows?${params.toString()}`,
      {
        method: 'GET',
        headers: this.getHeaders(tenantId),
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ao buscar fluxos: ${response.statusText}`);
    }

    return response.json();
  }

  async getFlow(tenantId: string, flowId: string): Promise<AutomationFlow> {
    const response = await fetch(
      `${this.baseUrl}/automation/flows/${flowId}`,
      {
        method: 'GET',
        headers: this.getHeaders(tenantId),
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ao buscar fluxo: ${response.statusText}`);
    }

    return response.json();
  }

  async createFlow(tenantId: string, flow: Omit<AutomationFlow, 'id' | 'tenantId' | 'createdAt' | 'updatedAt' | 'executionCount'>): Promise<AutomationFlow> {
    const response = await fetch(
      `${this.baseUrl}/automation/flows`,
      {
        method: 'POST',
        headers: this.getHeaders(tenantId),
        body: JSON.stringify({
          ...flow,
          tenantId
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ao criar fluxo: ${response.statusText}`);
    }

    return response.json();
  }

  async updateFlow(tenantId: string, flowId: string, updates: Partial<AutomationFlow>): Promise<AutomationFlow> {
    const response = await fetch(
      `${this.baseUrl}/automation/flows/${flowId}`,
      {
        method: 'PUT',
        headers: this.getHeaders(tenantId),
        body: JSON.stringify(updates),
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ao atualizar fluxo: ${response.statusText}`);
    }

    return response.json();
  }

  async deleteFlow(tenantId: string, flowId: string): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/automation/flows/${flowId}`,
      {
        method: 'DELETE',
        headers: this.getHeaders(tenantId),
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ao deletar fluxo: ${response.statusText}`);
    }
  }

  async cloneFlow(tenantId: string, flowId: string, newName: string): Promise<AutomationFlow> {
    const response = await fetch(
      `${this.baseUrl}/automation/flows/${flowId}/clone`,
      {
        method: 'POST',
        headers: this.getHeaders(tenantId),
        body: JSON.stringify({ name: newName }),
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ao clonar fluxo: ${response.statusText}`);
    }

    return response.json();
  }

  async toggleFlowStatus(tenantId: string, flowId: string, isActive: boolean): Promise<AutomationFlow> {
    const response = await fetch(
      `${this.baseUrl}/automation/flows/${flowId}/toggle`,
      {
        method: 'PATCH',
        headers: this.getHeaders(tenantId),
        body: JSON.stringify({ isActive }),
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ao alterar status do fluxo: ${response.statusText}`);
    }

    return response.json();
  }

  // ==================== CADÊNCIAS ====================

  async getCadences(tenantId: string, type?: CadenceType): Promise<Cadence[]> {
    const params = new URLSearchParams();
    if (type) params.append('type', type);

    const response = await fetch(
      `${this.baseUrl}/automation/cadences?${params.toString()}`,
      {
        method: 'GET',
        headers: this.getHeaders(tenantId),
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ao buscar cadências: ${response.statusText}`);
    }

    return response.json();
  }

  async getCadence(tenantId: string, cadenceId: string): Promise<Cadence> {
    const response = await fetch(
      `${this.baseUrl}/automation/cadences/${cadenceId}`,
      {
        method: 'GET',
        headers: this.getHeaders(tenantId),
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ao buscar cadência: ${response.statusText}`);
    }

    return response.json();
  }

  async createCadence(tenantId: string, cadence: Omit<Cadence, 'id' | 'tenantId' | 'createdAt' | 'updatedAt' | 'stats'>): Promise<Cadence> {
    const response = await fetch(
      `${this.baseUrl}/automation/cadences`,
      {
        method: 'POST',
        headers: this.getHeaders(tenantId),
        body: JSON.stringify({
          ...cadence,
          tenantId
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ao criar cadência: ${response.statusText}`);
    }

    return response.json();
  }

  async updateCadence(tenantId: string, cadenceId: string, updates: Partial<Cadence>): Promise<Cadence> {
    const response = await fetch(
      `${this.baseUrl}/automation/cadences/${cadenceId}`,
      {
        method: 'PUT',
        headers: this.getHeaders(tenantId),
        body: JSON.stringify(updates),
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ao atualizar cadência: ${response.statusText}`);
    }

    return response.json();
  }

  async deleteCadence(tenantId: string, cadenceId: string): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/automation/cadences/${cadenceId}`,
      {
        method: 'DELETE',
        headers: this.getHeaders(tenantId),
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ao deletar cadência: ${response.statusText}`);
    }
  }

  async enrollInCadence(tenantId: string, cadenceId: string, leadId?: string, clientId?: string): Promise<CadenceEnrollment> {
    const response = await fetch(
      `${this.baseUrl}/automation/cadences/${cadenceId}/enroll`,
      {
        method: 'POST',
        headers: this.getHeaders(tenantId),
        body: JSON.stringify({ leadId, clientId }),
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ao inscrever na cadência: ${response.statusText}`);
    }

    return response.json();
  }

  async getCadenceEnrollments(tenantId: string, cadenceId: string): Promise<CadenceEnrollment[]> {
    const response = await fetch(
      `${this.baseUrl}/automation/cadences/${cadenceId}/enrollments`,
      {
        method: 'GET',
        headers: this.getHeaders(tenantId),
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ao buscar inscrições da cadência: ${response.statusText}`);
    }

    return response.json();
  }

  // ==================== RÉGUA DE INATIVIDADE ====================

  async getInactivityRules(tenantId: string): Promise<InactivityRule[]> {
    const response = await fetch(
      `${this.baseUrl}/automation/inactivity-rules`,
      {
        method: 'GET',
        headers: this.getHeaders(tenantId),
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ao buscar réguas de inatividade: ${response.statusText}`);
    }

    return response.json();
  }

  async createInactivityRule(tenantId: string, rule: Omit<InactivityRule, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>): Promise<InactivityRule> {
    const response = await fetch(
      `${this.baseUrl}/automation/inactivity-rules`,
      {
        method: 'POST',
        headers: this.getHeaders(tenantId),
        body: JSON.stringify({
          ...rule,
          tenantId
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ao criar régua de inatividade: ${response.statusText}`);
    }

    return response.json();
  }

  async updateInactivityRule(tenantId: string, ruleId: string, updates: Partial<InactivityRule>): Promise<InactivityRule> {
    const response = await fetch(
      `${this.baseUrl}/automation/inactivity-rules/${ruleId}`,
      {
        method: 'PUT',
        headers: this.getHeaders(tenantId),
        body: JSON.stringify(updates),
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ao atualizar régua de inatividade: ${response.statusText}`);
    }

    return response.json();
  }

  // ==================== INTEGRAÇÃO MAUTIC ====================

  async getMauticIntegrations(tenantId: string): Promise<MauticIntegration[]> {
    const response = await fetch(
      `${this.baseUrl}/automation/mautic/integrations`,
      {
        method: 'GET',
        headers: this.getHeaders(tenantId),
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ao buscar integrações Mautic: ${response.statusText}`);
    }

    return response.json();
  }

  async createMauticIntegration(tenantId: string, integration: Omit<MauticIntegration, 'id' | 'tenantId' | 'createdAt' | 'updatedAt' | 'lastSync' | 'syncStatus'>): Promise<MauticIntegration> {
    const response = await fetch(
      `${this.baseUrl}/automation/mautic/integrations`,
      {
        method: 'POST',
        headers: this.getHeaders(tenantId),
        body: JSON.stringify({
          ...integration,
          tenantId
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ao criar integração Mautic: ${response.statusText}`);
    }

    return response.json();
  }

  async testMauticConnection(tenantId: string, integrationId: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(
      `${this.baseUrl}/automation/mautic/integrations/${integrationId}/test`,
      {
        method: 'POST',
        headers: this.getHeaders(tenantId),
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ao testar conexão Mautic: ${response.statusText}`);
    }

    return response.json();
  }

  async syncMauticContacts(tenantId: string, integrationId: string): Promise<{ success: boolean; syncedCount: number }> {
    const response = await fetch(
      `${this.baseUrl}/automation/mautic/integrations/${integrationId}/sync`,
      {
        method: 'POST',
        headers: this.getHeaders(tenantId),
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ao sincronizar contatos Mautic: ${response.statusText}`);
    }

    return response.json();
  }

  // ==================== TEMPLATES ====================

  async getEmailTemplates(tenantId: string): Promise<EmailTemplate[]> {
    const response = await fetch(
      `${this.baseUrl}/automation/templates/email`,
      {
        method: 'GET',
        headers: this.getHeaders(tenantId),
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ao buscar templates de e-mail: ${response.statusText}`);
    }

    return response.json();
  }

  async createEmailTemplate(tenantId: string, template: Omit<EmailTemplate, 'id' | 'tenantId' | 'createdAt' | 'updatedAt' | 'stats'>): Promise<EmailTemplate> {
    const response = await fetch(
      `${this.baseUrl}/automation/templates/email`,
      {
        method: 'POST',
        headers: this.getHeaders(tenantId),
        body: JSON.stringify({
          ...template,
          tenantId
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ao criar template de e-mail: ${response.statusText}`);
    }

    return response.json();
  }

  async getWhatsAppTemplates(tenantId: string): Promise<WhatsAppTemplate[]> {
    const response = await fetch(
      `${this.baseUrl}/automation/templates/whatsapp`,
      {
        method: 'GET',
        headers: this.getHeaders(tenantId),
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ao buscar templates WhatsApp: ${response.statusText}`);
    }

    return response.json();
  }

  async createWhatsAppTemplate(tenantId: string, template: Omit<WhatsAppTemplate, 'id' | 'tenantId' | 'createdAt' | 'updatedAt' | 'stats'>): Promise<WhatsAppTemplate> {
    const response = await fetch(
      `${this.baseUrl}/automation/templates/whatsapp`,
      {
        method: 'POST',
        headers: this.getHeaders(tenantId),
        body: JSON.stringify({
          ...template,
          tenantId
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ao criar template WhatsApp: ${response.statusText}`);
    }

    return response.json();
  }

  // ==================== EXECUÇÕES ====================

  async getExecutions(tenantId: string, flowId?: string, status?: ExecutionStatus): Promise<AutomationExecution[]> {
    const params = new URLSearchParams();
    if (flowId) params.append('flowId', flowId);
    if (status) params.append('status', status);

    const response = await fetch(
      `${this.baseUrl}/automation/executions?${params.toString()}`,
      {
        method: 'GET',
        headers: this.getHeaders(tenantId),
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ao buscar execuções: ${response.statusText}`);
    }

    return response.json();
  }

  async getExecution(tenantId: string, executionId: string): Promise<AutomationExecution> {
    const response = await fetch(
      `${this.baseUrl}/automation/executions/${executionId}`,
      {
        method: 'GET',
        headers: this.getHeaders(tenantId),
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ao buscar execução: ${response.statusText}`);
    }

    return response.json();
  }

  async pauseExecution(tenantId: string, executionId: string): Promise<AutomationExecution> {
    const response = await fetch(
      `${this.baseUrl}/automation/executions/${executionId}/pause`,
      {
        method: 'POST',
        headers: this.getHeaders(tenantId),
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ao pausar execução: ${response.statusText}`);
    }

    return response.json();
  }

  async resumeExecution(tenantId: string, executionId: string): Promise<AutomationExecution> {
    const response = await fetch(
      `${this.baseUrl}/automation/executions/${executionId}/resume`,
      {
        method: 'POST',
        headers: this.getHeaders(tenantId),
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ao retomar execução: ${response.statusText}`);
    }

    return response.json();
  }

  async cancelExecution(tenantId: string, executionId: string): Promise<AutomationExecution> {
    const response = await fetch(
      `${this.baseUrl}/automation/executions/${executionId}/cancel`,
      {
        method: 'POST',
        headers: this.getHeaders(tenantId),
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ao cancelar execução: ${response.statusText}`);
    }

    return response.json();
  }

  // ==================== DASHBOARD ====================

  async getDashboard(tenantId: string, startDate: Date, endDate: Date): Promise<AutomationDashboard> {
    const params = new URLSearchParams({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });

    const response = await fetch(
      `${this.baseUrl}/automation/dashboard?${params.toString()}`,
      {
        method: 'GET',
        headers: this.getHeaders(tenantId),
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ao buscar dashboard: ${response.statusText}`);
    }

    return response.json();
  }

  async getLeadsAtRisk(tenantId: string, days: number = 7): Promise<any[]> {
    const params = new URLSearchParams({
      days: days.toString(),
    });

    const response = await fetch(
      `${this.baseUrl}/automation/leads-at-risk?${params.toString()}`,
      {
        method: 'GET',
        headers: this.getHeaders(tenantId),
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ao buscar leads em risco: ${response.statusText}`);
    }

    return response.json();
  }

  // ==================== PERMISSÕES ====================

  async getUserPermissions(tenantId: string, userId: string): Promise<AutomationPermissions> {
    const response = await fetch(
      `${this.baseUrl}/automation/permissions/${userId}`,
      {
        method: 'GET',
        headers: this.getHeaders(tenantId),
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ao buscar permissões: ${response.statusText}`);
    }

    return response.json();
  }

  // ==================== BUSCA GLOBAL ====================

  async search(tenantId: string, query: string, filters?: AutomationFilters): Promise<AutomationSearchResult> {
    const params = new URLSearchParams({ query });
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const response = await fetch(
      `${this.baseUrl}/automation/search?${params.toString()}`,
      {
        method: 'GET',
        headers: this.getHeaders(tenantId),
      }
    );

    if (!response.ok) {
      throw new Error(`Erro na busca: ${response.statusText}`);
    }

    return response.json();
  }

  // ==================== UTILITÁRIOS ====================

  // Validar variáveis em templates
  validateTemplate(template: string, availableVariables: string[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const variableRegex = /\{\{([^}]+)\}\}/g;
    let match;

    while ((match = variableRegex.exec(template)) !== null) {
      const variable = match[1].trim();
      if (!availableVariables.includes(variable)) {
        errors.push(`Variável não encontrada: {{${variable}}}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Substituir variáveis em templates
  replaceVariables(template: string, variables: Record<string, any>): string {
    return template.replace(/\{\{([^}]+)\}\}/g, (match, variable) => {
      const value = variables[variable.trim()];
      return value !== undefined ? String(value) : match;
    });
  }

  // Obter variáveis disponíveis por contexto
  getAvailableVariables(context: 'lead' | 'client' | 'contract' | 'task'): string[] {
    const baseVariables = ['nome', 'email', 'telefone', 'empresa', 'data_atual', 'hora_atual'];
    
    switch (context) {
      case 'lead':
        return [...baseVariables, 'status', 'origem', 'etapa', 'pontuacao', 'responsavel'];
      case 'client':
        return [...baseVariables, 'tipo_cliente', 'data_cadastro', 'ultimo_contato'];
      case 'contract':
        return [...baseVariables, 'numero_contrato', 'valor', 'data_assinatura', 'data_vencimento'];
      case 'task':
        return [...baseVariables, 'titulo_tarefa', 'descricao', 'prazo', 'prioridade'];
      default:
        return baseVariables;
    }
  }

  // Validar configuração de gatilho
  validateTriggerConfig(type: TriggerType, config: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    switch (type) {
      case TriggerType.LEAD_INACTIVITY:
      case TriggerType.CLIENT_NO_TASK:
        if (!config.inactivityDays || config.inactivityDays < 1) {
          errors.push('Dias de inatividade deve ser maior que 0');
        }
        break;
      
      case TriggerType.LEAD_STAGE_CHANGE:
        if (!config.toStageId) {
          errors.push('Etapa de destino é obrigatória');
        }
        break;
      
      case TriggerType.TAG_APPLIED:
        if (!config.tagId) {
          errors.push('Tag é obrigatória');
        }
        break;
      
      case TriggerType.SCORE_REACHED:
        if (!config.scoreThreshold || config.scoreThreshold < 0) {
          errors.push('Pontuação deve ser maior ou igual a 0');
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Validar configuração de ação
  validateActionConfig(type: ActionType, config: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    switch (type) {
      case ActionType.CREATE_TASK:
        if (!config.taskTitle) {
          errors.push('Título da tarefa é obrigatório');
        }
        if (!config.assignedUserId) {
          errors.push('Responsável pela tarefa é obrigatório');
        }
        break;
      
      case ActionType.SEND_EMAIL:
        if (!config.emailTemplateId && !config.emailSubject) {
          errors.push('Template ou assunto do e-mail é obrigatório');
        }
        if (!config.emailTemplateId && !config.emailBody) {
          errors.push('Template ou corpo do e-mail é obrigatório');
        }
        break;
      
      case ActionType.SEND_WHATSAPP:
        if (!config.whatsappTemplateId && !config.whatsappMessage) {
          errors.push('Template ou mensagem WhatsApp é obrigatória');
        }
        break;
      
      case ActionType.APPLY_TAG:
      case ActionType.REMOVE_TAG:
        if (!config.tagId) {
          errors.push('Tag é obrigatória');
        }
        break;
      
      case ActionType.MOVE_STAGE:
        if (!config.targetStageId) {
          errors.push('Etapa de destino é obrigatória');
        }
        break;
      
      case ActionType.SEND_WEBHOOK:
        if (!config.webhookUrl) {
          errors.push('URL do webhook é obrigatória');
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const automationService = new AutomationService();

