// Serviço de Contratos - 100% Multi-Tenant
// Todas as operações respeitam o isolamento por tenant

import { 
  Contract, 
  ContractTemplate, 
  ContractFilters, 
  ContractStats,
  D4SignConfig,
  ContractNumberingConfig,
  ContractSettings,
  ContractVersion,
  ContractAutomation,
  D4SignResponse
} from '@/types/contracts';

const API_BASE_URL = 'https://www.api.app.jttecnologia.com.br';

class ContractsService {
  private getHeaders(tenantId: string): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'X-Tenant-ID': tenantId, // Isolamento multi-tenant
    };
  }

  // ==================== TEMPLATES DE CONTRATO ====================
  
  async getTemplates(tenantId: string): Promise<ContractTemplate[]> {
    const response = await fetch(`${API_BASE_URL}/contracts/templates`, {
      headers: this.getHeaders(tenantId),
    });
    
    if (!response.ok) {
      throw new Error('Erro ao buscar templates de contrato');
    }
    
    return response.json();
  }

  async createTemplate(tenantId: string, template: Omit<ContractTemplate, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>): Promise<ContractTemplate> {
    const response = await fetch(`${API_BASE_URL}/contracts/templates`, {
      method: 'POST',
      headers: this.getHeaders(tenantId),
      body: JSON.stringify({ ...template, tenantId }),
    });
    
    if (!response.ok) {
      throw new Error('Erro ao criar template de contrato');
    }
    
    return response.json();
  }

  async updateTemplate(tenantId: string, id: string, template: Partial<ContractTemplate>): Promise<ContractTemplate> {
    const response = await fetch(`${API_BASE_URL}/contracts/templates/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(tenantId),
      body: JSON.stringify(template),
    });
    
    if (!response.ok) {
      throw new Error('Erro ao atualizar template de contrato');
    }
    
    return response.json();
  }

  async deleteTemplate(tenantId: string, id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/contracts/templates/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(tenantId),
    });
    
    if (!response.ok) {
      throw new Error('Erro ao excluir template de contrato');
    }
  }

  async duplicateTemplate(tenantId: string, id: string, newName: string): Promise<ContractTemplate> {
    const response = await fetch(`${API_BASE_URL}/contracts/templates/${id}/duplicate`, {
      method: 'POST',
      headers: this.getHeaders(tenantId),
      body: JSON.stringify({ name: newName }),
    });
    
    if (!response.ok) {
      throw new Error('Erro ao duplicar template de contrato');
    }
    
    return response.json();
  }

  // ==================== CONTRATOS ====================
  
  async getContracts(tenantId: string, filters?: ContractFilters): Promise<{ contracts: Contract[], total: number }> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      if (filters.status) queryParams.append('status', filters.status.join(','));
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.clientId) queryParams.append('clientId', filters.clientId);
      if (filters.templateId) queryParams.append('templateId', filters.templateId);
      if (filters.createdBy) queryParams.append('createdBy', filters.createdBy);
      if (filters.page) queryParams.append('page', filters.page.toString());
      if (filters.limit) queryParams.append('limit', filters.limit.toString());
      if (filters.dateRange) {
        queryParams.append('startDate', filters.dateRange.start.toISOString());
        queryParams.append('endDate', filters.dateRange.end.toISOString());
      }
    }
    
    const response = await fetch(`${API_BASE_URL}/contracts?${queryParams}`, {
      headers: this.getHeaders(tenantId),
    });
    
    if (!response.ok) {
      throw new Error('Erro ao buscar contratos');
    }
    
    return response.json();
  }

  async getContract(tenantId: string, id: string): Promise<Contract> {
    const response = await fetch(`${API_BASE_URL}/contracts/${id}`, {
      headers: this.getHeaders(tenantId),
    });
    
    if (!response.ok) {
      throw new Error('Erro ao buscar contrato');
    }
    
    return response.json();
  }

  async createContract(tenantId: string, contract: Omit<Contract, 'id' | 'tenantId' | 'contractNumber' | 'createdAt' | 'updatedAt'>): Promise<Contract> {
    const response = await fetch(`${API_BASE_URL}/contracts`, {
      method: 'POST',
      headers: this.getHeaders(tenantId),
      body: JSON.stringify({ ...contract, tenantId }),
    });
    
    if (!response.ok) {
      throw new Error('Erro ao criar contrato');
    }
    
    return response.json();
  }

  async updateContract(tenantId: string, id: string, contract: Partial<Contract>): Promise<Contract> {
    const response = await fetch(`${API_BASE_URL}/contracts/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(tenantId),
      body: JSON.stringify(contract),
    });
    
    if (!response.ok) {
      throw new Error('Erro ao atualizar contrato');
    }
    
    return response.json();
  }

  async deleteContract(tenantId: string, id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/contracts/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(tenantId),
    });
    
    if (!response.ok) {
      throw new Error('Erro ao excluir contrato');
    }
  }

  // ==================== CONFIGURAÇÕES D4SIGN ====================
  
  async getD4SignConfig(tenantId: string): Promise<D4SignConfig | null> {
    const response = await fetch(`${API_BASE_URL}/contracts/d4sign-config`, {
      headers: this.getHeaders(tenantId),
    });
    
    if (response.status === 404) {
      return null;
    }
    
    if (!response.ok) {
      throw new Error('Erro ao buscar configuração D4Sign');
    }
    
    return response.json();
  }

  async saveD4SignConfig(tenantId: string, config: Omit<D4SignConfig, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>): Promise<D4SignConfig> {
    const response = await fetch(`${API_BASE_URL}/contracts/d4sign-config`, {
      method: 'POST',
      headers: this.getHeaders(tenantId),
      body: JSON.stringify({ ...config, tenantId }),
    });
    
    if (!response.ok) {
      throw new Error('Erro ao salvar configuração D4Sign');
    }
    
    return response.json();
  }

  async testD4SignConnection(tenantId: string): Promise<{ success: boolean, message: string }> {
    const response = await fetch(`${API_BASE_URL}/contracts/d4sign-config/test`, {
      method: 'POST',
      headers: this.getHeaders(tenantId),
    });
    
    if (!response.ok) {
      throw new Error('Erro ao testar conexão D4Sign');
    }
    
    return response.json();
  }

  // ==================== CONFIGURAÇÕES DE NUMERAÇÃO ====================
  
  async getNumberingConfig(tenantId: string): Promise<ContractNumberingConfig> {
    const response = await fetch(`${API_BASE_URL}/contracts/numbering-config`, {
      headers: this.getHeaders(tenantId),
    });
    
    if (!response.ok) {
      throw new Error('Erro ao buscar configuração de numeração');
    }
    
    return response.json();
  }

  async updateNumberingConfig(tenantId: string, config: Partial<ContractNumberingConfig>): Promise<ContractNumberingConfig> {
    const response = await fetch(`${API_BASE_URL}/contracts/numbering-config`, {
      method: 'PUT',
      headers: this.getHeaders(tenantId),
      body: JSON.stringify(config),
    });
    
    if (!response.ok) {
      throw new Error('Erro ao atualizar configuração de numeração');
    }
    
    return response.json();
  }

  // ==================== CONFIGURAÇÕES GERAIS ====================
  
  async getContractSettings(tenantId: string): Promise<ContractSettings> {
    const response = await fetch(`${API_BASE_URL}/contracts/settings`, {
      headers: this.getHeaders(tenantId),
    });
    
    if (!response.ok) {
      throw new Error('Erro ao buscar configurações de contrato');
    }
    
    return response.json();
  }

  async updateContractSettings(tenantId: string, settings: Partial<ContractSettings>): Promise<ContractSettings> {
    const response = await fetch(`${API_BASE_URL}/contracts/settings`, {
      method: 'PUT',
      headers: this.getHeaders(tenantId),
      body: JSON.stringify(settings),
    });
    
    if (!response.ok) {
      throw new Error('Erro ao atualizar configurações de contrato');
    }
    
    return response.json();
  }

  // ==================== INTEGRAÇÃO D4SIGN ====================
  
  async sendToD4Sign(tenantId: string, contractId: string): Promise<D4SignResponse> {
    const response = await fetch(`${API_BASE_URL}/contracts/${contractId}/send-d4sign`, {
      method: 'POST',
      headers: this.getHeaders(tenantId),
    });
    
    if (!response.ok) {
      throw new Error('Erro ao enviar contrato para D4Sign');
    }
    
    return response.json();
  }

  async getD4SignStatus(tenantId: string, contractId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/contracts/${contractId}/d4sign-status`, {
      headers: this.getHeaders(tenantId),
    });
    
    if (!response.ok) {
      throw new Error('Erro ao buscar status no D4Sign');
    }
    
    return response.json();
  }

  async resendD4Sign(tenantId: string, contractId: string, signatoryId: string): Promise<D4SignResponse> {
    const response = await fetch(`${API_BASE_URL}/contracts/${contractId}/resend-d4sign`, {
      method: 'POST',
      headers: this.getHeaders(tenantId),
      body: JSON.stringify({ signatoryId }),
    });
    
    if (!response.ok) {
      throw new Error('Erro ao reenviar contrato no D4Sign');
    }
    
    return response.json();
  }

  // ==================== VERSÕES E ADITIVOS ====================
  
  async getContractVersions(tenantId: string, contractId: string): Promise<ContractVersion[]> {
    const response = await fetch(`${API_BASE_URL}/contracts/${contractId}/versions`, {
      headers: this.getHeaders(tenantId),
    });
    
    if (!response.ok) {
      throw new Error('Erro ao buscar versões do contrato');
    }
    
    return response.json();
  }

  async createAmendment(tenantId: string, contractId: string, amendment: any): Promise<Contract> {
    const response = await fetch(`${API_BASE_URL}/contracts/${contractId}/amendment`, {
      method: 'POST',
      headers: this.getHeaders(tenantId),
      body: JSON.stringify(amendment),
    });
    
    if (!response.ok) {
      throw new Error('Erro ao criar aditivo');
    }
    
    return response.json();
  }

  async renewContract(tenantId: string, contractId: string, renewalData: any): Promise<Contract> {
    const response = await fetch(`${API_BASE_URL}/contracts/${contractId}/renew`, {
      method: 'POST',
      headers: this.getHeaders(tenantId),
      body: JSON.stringify(renewalData),
    });
    
    if (!response.ok) {
      throw new Error('Erro ao renovar contrato');
    }
    
    return response.json();
  }

  // ==================== AUTOMAÇÃO ====================
  
  async getAutomations(tenantId: string): Promise<ContractAutomation[]> {
    const response = await fetch(`${API_BASE_URL}/contracts/automations`, {
      headers: this.getHeaders(tenantId),
    });
    
    if (!response.ok) {
      throw new Error('Erro ao buscar automações');
    }
    
    return response.json();
  }

  async createAutomation(tenantId: string, automation: Omit<ContractAutomation, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>): Promise<ContractAutomation> {
    const response = await fetch(`${API_BASE_URL}/contracts/automations`, {
      method: 'POST',
      headers: this.getHeaders(tenantId),
      body: JSON.stringify({ ...automation, tenantId }),
    });
    
    if (!response.ok) {
      throw new Error('Erro ao criar automação');
    }
    
    return response.json();
  }

  // ==================== ESTATÍSTICAS ====================
  
  async getContractStats(tenantId: string, period?: { start: Date, end: Date }): Promise<ContractStats> {
    const queryParams = new URLSearchParams();
    
    if (period) {
      queryParams.append('startDate', period.start.toISOString());
      queryParams.append('endDate', period.end.toISOString());
    }
    
    const response = await fetch(`${API_BASE_URL}/contracts/stats?${queryParams}`, {
      headers: this.getHeaders(tenantId),
    });
    
    if (!response.ok) {
      throw new Error('Erro ao buscar estatísticas de contratos');
    }
    
    return response.json();
  }

  // ==================== UTILITÁRIOS ====================
  
  async generateContractPDF(tenantId: string, contractId: string): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/contracts/${contractId}/pdf`, {
      headers: this.getHeaders(tenantId),
    });
    
    if (!response.ok) {
      throw new Error('Erro ao gerar PDF do contrato');
    }
    
    return response.blob();
  }

  async previewTemplate(tenantId: string, templateId: string, sampleData: any): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/contracts/templates/${templateId}/preview`, {
      method: 'POST',
      headers: this.getHeaders(tenantId),
      body: JSON.stringify(sampleData),
    });
    
    if (!response.ok) {
      throw new Error('Erro ao gerar preview do template');
    }
    
    const result = await response.json();
    return result.html;
  }

  async validateTemplate(tenantId: string, content: string): Promise<{ valid: boolean, errors: string[] }> {
    const response = await fetch(`${API_BASE_URL}/contracts/templates/validate`, {
      method: 'POST',
      headers: this.getHeaders(tenantId),
      body: JSON.stringify({ content }),
    });
    
    if (!response.ok) {
      throw new Error('Erro ao validar template');
    }
    
    return response.json();
  }
}

export const contractsService = new ContractsService();

