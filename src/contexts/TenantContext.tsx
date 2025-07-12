import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import TenantLoading from '@/components/TenantLoading';
import { useAuth } from '@/context/AuthContext';

export interface Tenant {
  id: string;
  name: string;
  domain: string;
  subdomain: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  isActive: boolean;
  plan: 'basic' | 'professional' | 'enterprise';
  maxUsers: number;
  features: string[];
  createdAt: string;
  updatedAt: string;
  settings: {
    allowCustomProducts: boolean;
    allowCustomTemplates: boolean;
    allowIntegrations: boolean;
    maxProducts: number;
    maxTemplates: number;
  };
}

interface TenantContextType {
  currentTenant: Tenant | null;
  setCurrentTenant: (tenant: Tenant | null) => void;
  isLoading: boolean;
  tenantProducts: any[];
  tenantTemplates: any[];
  tenantConfigurations: any[];
  loadTenantData: () => Promise<void>;
  updateTenantData: (data: any) => Promise<void>;
  validateDataAccess: (dataOwnerId: string) => boolean;
  enforceIsolation: () => boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

interface TenantProviderProps {
  children: ReactNode;
}

export const TenantProvider: React.FC<TenantProviderProps> = ({ children }) => {
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tenantProducts, setTenantProducts] = useState<any[]>([]);
  const [tenantTemplates, setTenantTemplates] = useState<any[]>([]);
  const [tenantConfigurations, setTenantConfigurations] = useState<any[]>([]);
  const { user, canAccessTenant, isMaster } = useAuth();

  useEffect(() => {
    initializeTenant();
  }, []);

  const initializeTenant = async () => {
    try {
      setIsLoading(true);
      
      // Detectar tenant baseado no subdomínio ou domínio
      const hostname = window.location.hostname;
      const subdomain = hostname.split('.')[0];
      
      // Simular busca do tenant
      const tenant = await detectTenant(subdomain, hostname);
      
      if (tenant) {
        setCurrentTenant(tenant);
        await loadTenantData();
      } else {
        // Tenant padrão será detectado pela URL ou configuração
        // Não há mais tenant "padrão" com privilégios especiais
        console.warn('Nenhum tenant detectado. Redirecionando para seleção de tenant.');
        // Em produção, redirecionar para página de seleção de tenant
      }
    } catch (error) {
      console.error('Erro ao inicializar tenant:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const detectTenant = async (subdomain: string, hostname: string): Promise<Tenant | null> => {
    // Simular API call para detectar tenant
    // Em produção, isso seria uma chamada real para a API
    
    const mockTenants: Tenant[] = [
      // JT Telecom agora é um tenant comum, sem privilégios especiais
      {
        id: 'jt-telecom',
        name: 'JT Telecom',
        domain: 'jttecnologia.com.br',
        subdomain: 'jt',
        logo: '/logo-jt.png',
        primaryColor: '#2563eb',
        secondaryColor: '#1e40af',
        isActive: true,
        plan: 'enterprise', // Plano como qualquer outro tenant
        maxUsers: 100, // Limite definido como outros tenants
        features: ['crm', 'proposals', 'analytics', 'integrations', 'advanced_reports'],
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-07-05T19:30:00Z',
        settings: {
          allowCustomProducts: true,
          allowCustomTemplates: true,
          allowIntegrations: true,
          maxProducts: 50, // Limite como outros tenants
          maxTemplates: 25 // Limite como outros tenants
        }
      },
      {
        id: 'empresa-exemplo',
        name: 'Empresa Exemplo Ltda',
        domain: 'empresaexemplo.com.br',
        subdomain: 'exemplo',
        logo: '/logo-exemplo.png',
        primaryColor: '#059669',
        secondaryColor: '#047857',
        isActive: true,
        plan: 'professional',
        maxUsers: 50,
        features: ['crm', 'proposals', 'analytics'],
        createdAt: '2025-06-01T00:00:00Z',
        updatedAt: '2025-07-05T19:30:00Z',
        settings: {
          allowCustomProducts: true,
          allowCustomTemplates: true,
          allowIntegrations: false,
          maxProducts: 20,
          maxTemplates: 10
        }
      },
      {
        id: 'tech-solutions',
        name: 'Tech Solutions Inc',
        domain: 'techsolutions.com',
        subdomain: 'tech',
        logo: '/logo-tech.png',
        primaryColor: '#7c3aed',
        secondaryColor: '#6d28d9',
        isActive: true,
        plan: 'basic',
        maxUsers: 10,
        features: ['crm', 'proposals'],
        createdAt: '2025-05-15T00:00:00Z',
        updatedAt: '2025-07-05T19:30:00Z',
        settings: {
          allowCustomProducts: false,
          allowCustomTemplates: true,
          allowIntegrations: false,
          maxProducts: 5,
          maxTemplates: 5
        }
      }
    ];

    // Buscar por subdomínio ou domínio
    return mockTenants.find(t => 
      t.subdomain === subdomain || 
      t.domain === hostname ||
      hostname.includes(t.domain)
    ) || null;
  };

  const loadTenantData = async () => {
    if (!currentTenant) return;

    try {
      // Carregar produtos específicos do tenant
      const products = await loadTenantProducts(currentTenant.id);
      setTenantProducts(products);

      // Carregar templates específicos do tenant
      const templates = await loadTenantTemplates(currentTenant.id);
      setTenantTemplates(templates);

      // Carregar configurações específicas do tenant
      const configurations = await loadTenantConfigurations(currentTenant.id);
      setTenantConfigurations(configurations);

    } catch (error) {
      console.error('Erro ao carregar dados do tenant:', error);
    }
  };

  const loadTenantProducts = async (tenantId: string) => {
    // Simular carregamento de produtos específicos do tenant
    // Em produção, seria uma chamada para API com filtro por tenant
    
    // Todos os tenants, incluindo JT Telecom, têm produtos isolados
    const baseProducts = [
      { id: `${tenantId}-1`, name: 'PABX em Nuvem', tenantId, isDefault: false },
      { id: `${tenantId}-2`, name: 'URA Reversa', tenantId, isDefault: false },
      { id: `${tenantId}-3`, name: 'Discador Preditivo', tenantId, isDefault: false },
      { id: `${tenantId}-4`, name: 'Smartbot (Chatbot)', tenantId, isDefault: false },
      { id: `${tenantId}-5`, name: '0800 Virtual', tenantId, isDefault: false }
    ];

    // JT Telecom tem produtos específicos da empresa, mas isolados como qualquer tenant
    if (tenantId === 'jt-telecom') {
      return [
        ...baseProducts,
        { id: `${tenantId}-6`, name: 'CRM JT', tenantId, isDefault: false },
        { id: `${tenantId}-7`, name: 'JT VOX', tenantId, isDefault: false },
        { id: `${tenantId}-8`, name: 'JT Mobi', tenantId, isDefault: false }
      ];
    } else {
      // Outros tenants têm produtos personalizados
      return [
        ...baseProducts.slice(0, 3), // Apenas alguns produtos base
        { id: `${tenantId}-custom-1`, name: 'Produto Personalizado 1', tenantId, isDefault: false },
        { id: `${tenantId}-custom-2`, name: 'Serviço Específico', tenantId, isDefault: false }
      ];
    }
  };

  const loadTenantTemplates = async (tenantId: string) => {
    // Simular carregamento de templates específicos do tenant
    return [
      { id: `${tenantId}-template-1`, name: 'Template Padrão', tenantId },
      { id: `${tenantId}-template-2`, name: 'Template Personalizado', tenantId }
    ];
  };

  const loadTenantConfigurations = async (tenantId: string) => {
    // Simular carregamento de configurações específicas do tenant
    return [
      { id: `${tenantId}-config-1`, key: 'email_smtp', value: '', tenantId },
      { id: `${tenantId}-config-2`, key: 'whatsapp_api', value: '', tenantId }
    ];
  };

  const updateTenantData = async (data: any) => {
    // Simular atualização de dados do tenant
    console.log('Atualizando dados do tenant:', data);
    await loadTenantData();
  };

  // Validar se usuário pode acessar dados específicos
  const validateDataAccess = (dataOwnerId: string): boolean => {
    if (!user || !currentTenant) {
      console.error('SECURITY: No user or tenant context for data access validation');
      return false;
    }

    // Usuário Master NÃO pode acessar dados internos de nenhum tenant
    if (isMaster()) {
      console.error('SECURITY VIOLATION: Master user attempting to access tenant data:', dataOwnerId);
      return false;
    }

    // Verificar se o dado pertence ao tenant atual do usuário
    if (!canAccessTenant(dataOwnerId)) {
      console.error('SECURITY VIOLATION: User attempting to access data from different tenant:', {
        userTenant: user.tenant_id,
        dataOwner: dataOwnerId,
        currentTenant: currentTenant.id
      });
      return false;
    }

    return true;
  };

  // Forçar isolamento entre tenants
  const enforceIsolation = (): boolean => {
    if (!user) {
      return false;
    }

    // Usuário Master: não deve ter acesso a dados de tenant
    if (isMaster()) {
      if (currentTenant) {
        console.warn('SECURITY: Master user in tenant context, redirecting to master panel');
        // Em produção, redirecionar para painel master
        return false;
      }
      return true;
    }

    // Admin/User: deve estar no contexto do seu tenant
    if (user.tenant_id && currentTenant) {
      if (user.tenant_id !== currentTenant.id) {
        console.error('SECURITY VIOLATION: User in wrong tenant context:', {
          userTenant: user.tenant_id,
          currentTenant: currentTenant.id
        });
        return false;
      }
    }

    return true;
  };

  const value: TenantContextType = {
    currentTenant,
    setCurrentTenant,
    isLoading,
    tenantProducts,
    tenantTemplates,
    tenantConfigurations,
    loadTenantData,
    updateTenantData,
    validateDataAccess,
    enforceIsolation,
  };

  return (
    <TenantContext.Provider value={value}>
      {isLoading ? <TenantLoading /> : children}
    </TenantContext.Provider>
  );
};

export default TenantProvider;

