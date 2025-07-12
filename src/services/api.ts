import { User, Lead, Client, Proposal, Contract, Task, Pipeline, DashboardSummary } from '@/types';

// Configuração da API para Vite (não Next.js)
const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api`
  : 'https://api.app.jttecnologia.com.br/api';

console.log('🔧 API Configuration (Vite):');
console.log('- VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('- Final API_BASE_URL:', API_BASE_URL);
console.log('- Environment mode:', import.meta.env.MODE);
console.log('- Development mode:', import.meta.env.DEV);

class ApiService {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log('🌐 API Request:', url, options);
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      console.log('📡 API Response status:', response.status);
      console.log('📡 API Response headers:', [...response.headers.entries()]);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ API Response data:', data);
      return data;
    } catch (error) {
      console.error('💥 API Request failed:', error);
      throw error;
    }
  }

  // Authentication - Implementação simplificada e robusta
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    console.log('🔐 Starting login process...');
    console.log('📧 Email:', email);
    console.log('🔗 API URL:', `${API_BASE_URL}/auth/login`);
    
    try {
      console.log('📡 Sending login request...');
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });
      
      console.log(`📊 Response status: ${response.status}`);
      console.log(`📋 Response headers:`, [...response.headers.entries()]);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ HTTP Error ${response.status}: ${errorText}`);
        throw new Error(`HTTP Error ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ Login successful!');
      console.log(`📦 Complete response:`, data);
      
      // Validar estrutura da resposta
      if (!data.token || !data.user) {
        console.error('❌ Invalid response structure:', data);
        throw new Error('Resposta inválida do servidor');
      }
      
      const result = {
        token: data.token,
        user: data.user as User
      };
      
      console.log(`🔑 Token received: ${result.token.substring(0, 50)}...`);
      console.log(`👤 User data:`, result.user);
      
      // Salvar no localStorage
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      console.log('💾 Token and user saved to localStorage');
      
      return result;
    } catch (error) {
      console.error('💥 Login failed:', error);
      
      // Mensagem de erro mais específica
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
      } else if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error('Erro desconhecido durante o login. Tente novamente.');
      }
    }
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  async loginMaster(email: string, password: string): Promise<{ token: string; user: User }> {
    console.log('🔐 Starting Master login process...');
    console.log('📧 Email:', email);
    console.log('🔗 API URL:', `${API_BASE_URL}/auth/login-master`);
    
    try {
      console.log('📡 Sending Master login request...');
      
      const response = await fetch(`${API_BASE_URL}/auth/login-master`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });
      
      console.log(`📊 Response status: ${response.status}`);
      console.log(`📋 Response headers:`, [...response.headers.entries()]);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ HTTP Error ${response.status}: ${errorText}`);
        throw new Error(`HTTP Error ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ Master login successful!');
      console.log(`📦 Complete response:`, data);
      
      // Validar estrutura da resposta
      if (!data.token || !data.user) {
        console.error('❌ Invalid response structure:', data);
        throw new Error('Resposta inválida do servidor');
      }
      
      const result = {
        token: data.token,
        user: data.user as User
      };
      
      console.log(`🔑 Token received: ${result.token.substring(0, 50)}...`);
      console.log(`👤 User data:`, result.user);
      
      // Salvar no localStorage
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      console.log('💾 Token and user saved to localStorage');
      
      return result;
    } catch (error) {
      console.error('💥 Master login failed:', error);
      
      // Mensagem de erro mais específica
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
      } else if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error('Erro desconhecido durante o login Master. Tente novamente.');
      }
    }
  }

  async verifyToken(): Promise<{ valid: boolean; user?: User }> {
    try {
      const response = await this.request<{ valid: boolean; user?: User }>('/auth/verify');
      return response;
    } catch (error) {
      console.error('Token verification failed:', error);
      return { valid: false };
    }
  }

  // Dashboard
  async getDashboardSummary(): Promise<DashboardSummary> {
    return this.request<DashboardSummary>('/dashboard/summary');
  }

  async getDashboardMetrics(): Promise<any> {
    return this.request<any>('/dashboard/metrics');
  }

  // Leads
  async getLeads(): Promise<Lead[]> {
    return this.request<Lead[]>('/leads');
  }

  async createLead(lead: Partial<Lead>): Promise<Lead> {
    return this.request<Lead>('/leads', {
      method: 'POST',
      body: JSON.stringify(lead),
    });
  }

  async updateLead(id: string, lead: Partial<Lead>): Promise<Lead> {
    return this.request<Lead>(`/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(lead),
    });
  }

  async deleteLead(id: string): Promise<void> {
    return this.request<void>(`/leads/${id}`, {
      method: 'DELETE',
    });
  }

  // Clients
  async getClients(): Promise<Client[]> {
    return this.request<Client[]>('/clients');
  }

  async createClient(client: Partial<Client>): Promise<Client> {
    return this.request<Client>('/clients', {
      method: 'POST',
      body: JSON.stringify(client),
    });
  }

  async updateClient(id: string, client: Partial<Client>): Promise<Client> {
    return this.request<Client>(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(client),
    });
  }

  async deleteClient(id: string): Promise<void> {
    return this.request<void>(`/clients/${id}`, {
      method: 'DELETE',
    });
  }

  // Proposals
  async getProposals(): Promise<Proposal[]> {
    return this.request<Proposal[]>('/proposals');
  }

  async createProposal(proposal: Partial<Proposal>): Promise<Proposal> {
    return this.request<Proposal>('/proposals', {
      method: 'POST',
      body: JSON.stringify(proposal),
    });
  }

  async updateProposal(id: string, proposal: Partial<Proposal>): Promise<Proposal> {
    return this.request<Proposal>(`/proposals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(proposal),
    });
  }

  async deleteProposal(id: string): Promise<void> {
    return this.request<void>(`/proposals/${id}`, {
      method: 'DELETE',
    });
  }

  // Contracts
  async getContracts(): Promise<Contract[]> {
    return this.request<Contract[]>('/contracts');
  }

  async createContract(contract: Partial<Contract>): Promise<Contract> {
    return this.request<Contract>('/contracts', {
      method: 'POST',
      body: JSON.stringify(contract),
    });
  }

  async updateContract(id: string, contract: Partial<Contract>): Promise<Contract> {
    return this.request<Contract>(`/contracts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(contract),
    });
  }

  async deleteContract(id: string): Promise<void> {
    return this.request<void>(`/contracts/${id}`, {
      method: 'DELETE',
    });
  }

  // Tasks
  async getTasks(): Promise<Task[]> {
    return this.request<Task[]>('/tasks');
  }

  async createTask(task: Partial<Task>): Promise<Task> {
    return this.request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  }

  async updateTask(id: string, task: Partial<Task>): Promise<Task> {
    return this.request<Task>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(task),
    });
  }

  async deleteTask(id: string): Promise<void> {
    return this.request<void>(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  // Pipelines
  async getPipelines(): Promise<Pipeline[]> {
    return this.request<Pipeline[]>('/pipelines');
  }

  async createPipeline(pipeline: Partial<Pipeline>): Promise<Pipeline> {
    return this.request<Pipeline>('/pipelines', {
      method: 'POST',
      body: JSON.stringify(pipeline),
    });
  }

  async updatePipeline(id: string, pipeline: Partial<Pipeline>): Promise<Pipeline> {
    return this.request<Pipeline>(`/pipelines/${id}`, {
      method: 'PUT',
      body: JSON.stringify(pipeline),
    });
  }

  async deletePipeline(id: string): Promise<void> {
    return this.request<void>(`/pipelines/${id}`, {
      method: 'DELETE',
    });
  }

  // Automation
  async triggerAutomation(trigger: string, data: any): Promise<{ status: string; message: string }> {
    console.log('🤖 Starting automation trigger...');
    console.log('🔗 Trigger:', trigger);
    console.log('📦 Data:', data);
    
    try {
      const response = await this.request<{ status: string; message: string }>('/automation/trigger', {
        method: 'POST',
        body: JSON.stringify({ trigger, data }),
      });
      
      console.log('✅ Automation triggered successfully:', response);
      return response;
    } catch (error) {
      console.error('💥 Automation trigger failed:', error);
      throw error;
    }
  }

  async getAutomationHistory(): Promise<any[]> {
    return this.request<any[]>('/automation/history');
  }
}

export const apiService = new ApiService();

