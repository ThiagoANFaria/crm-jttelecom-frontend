
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserType, MasterUser, TenantUser } from '@/types';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<User>;
  loginMaster: (credentials: { email: string; password: string }) => Promise<MasterUser>;
  logout: () => void;
  getUserLevel: () => UserType | null;
  isMaster: () => boolean;
  isAdmin: () => boolean;
  isMasterValid: () => boolean;
  canAccessTenant: (tenantId: string) => boolean;
  validateTenantIsolation: () => boolean;
  enforceIsolation: (operation: string, tenantId?: string) => boolean;
  logSecurityEvent: (event: string, details?: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    console.log('Auth check - Token:', !!token, 'User data:', !!userData);
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
        console.log('User authenticated from localStorage');
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    try {
      setIsLoading(true);
      console.log('Attempting login for:', credentials.email);
      
      const response = await apiService.login(credentials.email, credentials.password);
      
      console.log('Login successful:', response);
      
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
      
      toast({
        title: 'Login realizado com sucesso',
        description: `Bem-vindo, ${response.user.name}!`,
      });
      
      return response.user;
    } catch (error) {
      console.error('Login failed:', error);
      toast({
        title: 'Erro no login',
        description: 'Credenciais inválidas ou erro de conexão. Tente novamente.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getUserLevel = (): UserType | null => {
    return user?.user_level || null;
  };

  const isMaster = (): boolean => {
    return user?.user_level === UserType.MASTER;
  };

  const isAdmin = (): boolean => {
    return user?.user_level === UserType.ADMIN;
  };

  // Validar se usuário Master está configurado corretamente
  const isMasterValid = (): boolean => {
    if (!user || user.user_level !== UserType.MASTER) {
      return false;
    }
    
    // Usuário Master NÃO deve ter tenant_id
    if (user.tenant_id) {
      console.error('SECURITY VIOLATION: Master user has tenant_id:', user.tenant_id);
      logSecurityEvent('MASTER_WITH_TENANT', { userId: user.id, tenantId: user.tenant_id });
      return false;
    }
    
    return true;
  };

  // Verificar se usuário pode acessar um tenant específico
  const canAccessTenant = (tenantId: string): boolean => {
    if (!user) {
      return false;
    }

    // Usuário Master NÃO pode acessar dados internos de nenhum tenant
    if (user.user_level === UserType.MASTER) {
      console.warn('SECURITY: Master user attempting to access tenant data:', tenantId);
      logSecurityEvent('MASTER_TENANT_ACCESS_ATTEMPT', { userId: user.id, tenantId });
      return false;
    }

    // Admin/User só pode acessar seu próprio tenant
    if (user.user_level === UserType.ADMIN || user.user_level === UserType.USER) {
      const hasAccess = user.tenant_id === tenantId;
      if (!hasAccess) {
        logSecurityEvent('CROSS_TENANT_ACCESS_ATTEMPT', { 
          userId: user.id, 
          userTenant: user.tenant_id, 
          attemptedTenant: tenantId 
        });
      }
      return hasAccess;
    }

    return false;
  };

  // Validar isolamento entre tenants
  const validateTenantIsolation = (): boolean => {
    if (!user) {
      return false;
    }

    // Usuário Master: não deve ter tenant_id
    if (user.user_level === UserType.MASTER) {
      if (user.tenant_id) {
        console.error('SECURITY VIOLATION: Master user has tenant_id');
        logSecurityEvent('MASTER_ISOLATION_VIOLATION', { userId: user.id, tenantId: user.tenant_id });
        return false;
      }
      return true;
    }

    // Admin/User: deve ter tenant_id
    if (user.user_level === UserType.ADMIN || user.user_level === UserType.USER) {
      if (!user.tenant_id) {
        console.error('SECURITY VIOLATION: Admin/User without tenant_id');
        logSecurityEvent('USER_WITHOUT_TENANT', { userId: user.id, userLevel: user.user_level });
        return false;
      }
      return true;
    }

    return false;
  };

  // Função para forçar isolamento em operações
  const enforceIsolation = (operation: string, tenantId?: string): boolean => {
    if (!user) {
      logSecurityEvent('UNAUTHORIZED_OPERATION', { operation });
      return false;
    }

    // Usuário Master só pode fazer operações de gestão de tenants
    if (user.user_level === UserType.MASTER) {
      const allowedMasterOperations = [
        'list_tenants',
        'create_tenant', 
        'update_tenant',
        'delete_tenant',
        'manage_global_settings'
      ];
      
      if (!allowedMasterOperations.includes(operation)) {
        logSecurityEvent('MASTER_FORBIDDEN_OPERATION', { 
          userId: user.id, 
          operation, 
          tenantId 
        });
        return false;
      }
      
      return true;
    }

    // Admin/User: deve ter tenant e operação deve ser no seu tenant
    if (user.user_level === UserType.ADMIN || user.user_level === UserType.USER) {
      if (!user.tenant_id) {
        logSecurityEvent('USER_NO_TENANT_OPERATION', { 
          userId: user.id, 
          operation 
        });
        return false;
      }

      if (tenantId && tenantId !== user.tenant_id) {
        logSecurityEvent('CROSS_TENANT_OPERATION', { 
          userId: user.id, 
          userTenant: user.tenant_id,
          operation,
          attemptedTenant: tenantId 
        });
        return false;
      }

      return true;
    }

    return false;
  };

  // Log de eventos de segurança
  const logSecurityEvent = (event: string, details?: any): void => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      user: user ? {
        id: user.id,
        email: user.email,
        level: user.user_level,
        tenant_id: user.tenant_id
      } : null,
      details,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Log no console para desenvolvimento
    console.warn('SECURITY EVENT:', logEntry);

    // Em produção, enviar para sistema de auditoria
    // await apiService.logSecurityEvent(logEntry);
  };

  // Login específico para usuário Master
  const loginMaster = async (credentials: { email: string; password: string }): Promise<MasterUser> => {
    try {
      setIsLoading(true);
      console.log('Attempting Master login for:', credentials.email);
      
      // Endpoint específico para login Master
      const response = await apiService.loginMaster(credentials.email, credentials.password);
      
      // Validar que é realmente um usuário Master
      if (response.user.user_level !== UserType.MASTER) {
        throw new Error('Invalid Master credentials');
      }

      // Validar que não tem tenant_id
      if (response.user.tenant_id) {
        throw new Error('Master user cannot have tenant association');
      }
      
      console.log('Master login successful:', response);
      
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
      
      logSecurityEvent('MASTER_LOGIN_SUCCESS', { userId: response.user.id });
      
      toast({
        title: 'Login Master realizado com sucesso',
        description: `Bem-vindo ao painel Master, ${response.user.name}!`,
      });
      
      return response.user as MasterUser;
    } catch (error) {
      console.error('Master login failed:', error);
      logSecurityEvent('MASTER_LOGIN_FAILED', { email: credentials.email, error: error.message });
      
      toast({
        title: 'Erro no login Master',
        description: 'Credenciais Master inválidas ou erro de conexão.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log('User logging out');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    
    toast({
      title: 'Logout realizado',
      description: 'Você foi desconectado com sucesso.',
    });
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    loginMaster,
    logout,
    getUserLevel,
    isMaster,
    isAdmin,
    isMasterValid,
    canAccessTenant,
    validateTenantIsolation,
    enforceIsolation,
    logSecurityEvent,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
