import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTenantSecurity } from '../hooks/useTenantSecurity';
import { UserType } from '../types';

interface SecurityMiddlewareProps {
  children: React.ReactNode;
}

const SecurityMiddleware: React.FC<SecurityMiddlewareProps> = ({ children }) => {
  const { user, validateTenantIsolation, logSecurityEvent } = useAuth();
  const { logSecurityViolation } = useTenantSecurity();

  useEffect(() => {
    // Validações de segurança na inicialização
    if (user) {
      performSecurityChecks();
    }
  }, [user]);

  const performSecurityChecks = () => {
    if (!user) return;

    // 1. Validar isolamento de tenant
    const isolationValid = validateTenantIsolation();
    if (!isolationValid) {
      logSecurityViolation('TENANT_ISOLATION_VIOLATION', {
        userId: user.id,
        userLevel: user.user_level,
        tenantId: user.tenant_id
      });
    }

    // 2. Validar estrutura do usuário Master
    if (user.user_level === UserType.MASTER) {
      validateMasterUserStructure();
    }

    // 3. Validar estrutura de usuário de tenant
    if (user.user_level === UserType.ADMIN || user.user_level === UserType.USER) {
      validateTenantUserStructure();
    }

    // 4. Verificar tentativas de acesso cross-tenant
    monitorCrossTenantAccess();

    // 5. Validar integridade da sessão
    validateSessionIntegrity();
  };

  const validateMasterUserStructure = () => {
    if (!user || user.user_level !== UserType.MASTER) return;

    // Master não deve ter tenant_id
    if (user.tenant_id) {
      logSecurityViolation('MASTER_WITH_TENANT_ID', {
        masterId: user.id,
        invalidTenantId: user.tenant_id
      });
      
      // Forçar logout por violação de segurança
      setTimeout(() => {
        alert('Violação de segurança detectada. Fazendo logout...');
        window.location.href = '/login';
      }, 1000);
    }

    // Master não deve ter tenant_name
    if (user.tenant_name) {
      logSecurityViolation('MASTER_WITH_TENANT_NAME', {
        masterId: user.id,
        invalidTenantName: user.tenant_name
      });
    }
  };

  const validateTenantUserStructure = () => {
    if (!user || user.user_level === UserType.MASTER) return;

    // Admin/User deve ter tenant_id
    if (!user.tenant_id) {
      logSecurityViolation('USER_WITHOUT_TENANT_ID', {
        userId: user.id,
        userLevel: user.user_level
      });
      
      // Forçar logout por violação de segurança
      setTimeout(() => {
        alert('Configuração de usuário inválida. Fazendo logout...');
        window.location.href = '/login';
      }, 1000);
    }

    // Validar formato do tenant_id
    if (user.tenant_id && typeof user.tenant_id !== 'string') {
      logSecurityViolation('INVALID_TENANT_ID_FORMAT', {
        userId: user.id,
        tenantId: user.tenant_id,
        tenantIdType: typeof user.tenant_id
      });
    }
  };

  const monitorCrossTenantAccess = () => {
    // Interceptar tentativas de acesso a dados de outros tenants
    const originalFetch = window.fetch;
    
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();
      
      // Verificar se é uma requisição para API
      if (url.includes('/api/') && user) {
        // Extrair tenant_id da URL se presente
        const tenantIdMatch = url.match(/tenant[_-]?id[=\/]([^&\/]+)/i);
        if (tenantIdMatch) {
          const requestedTenantId = tenantIdMatch[1];
          
          // Validar acesso
          if (user.user_level !== UserType.MASTER && user.tenant_id !== requestedTenantId) {
            logSecurityViolation('API_CROSS_TENANT_ACCESS', {
              userId: user.id,
              userTenant: user.tenant_id,
              requestedTenant: requestedTenantId,
              url: url
            });
            
            // Bloquear requisição
            throw new Error('Cross-tenant access denied');
          }
        }
      }
      
      return originalFetch(input, init);
    };
  };

  const validateSessionIntegrity = () => {
    if (!user) return;

    // Verificar se dados do localStorage são consistentes
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        
        // Verificar se IDs coincidem
        if (parsedUser.id !== user.id) {
          logSecurityViolation('SESSION_USER_ID_MISMATCH', {
            contextUserId: user.id,
            storedUserId: parsedUser.id
          });
        }
        
        // Verificar se tenant_id coincide
        if (parsedUser.tenant_id !== user.tenant_id) {
          logSecurityViolation('SESSION_TENANT_ID_MISMATCH', {
            contextTenantId: user.tenant_id,
            storedTenantId: parsedUser.tenant_id
          });
        }
        
        // Verificar se user_level coincide
        if (parsedUser.user_level !== user.user_level) {
          logSecurityViolation('SESSION_USER_LEVEL_MISMATCH', {
            contextUserLevel: user.user_level,
            storedUserLevel: parsedUser.user_level
          });
        }
      } catch (error) {
        logSecurityViolation('SESSION_PARSE_ERROR', {
          error: error.message,
          storedData: storedUser
        });
      }
    }

    // Verificar token de autenticação
    const token = localStorage.getItem('token');
    if (!token) {
      logSecurityViolation('MISSING_AUTH_TOKEN', {
        userId: user.id
      });
    }
  };

  // Interceptar tentativas de manipulação do localStorage
  useEffect(() => {
    const originalSetItem = localStorage.setItem;
    const originalRemoveItem = localStorage.removeItem;
    
    localStorage.setItem = function(key: string, value: string) {
      if (key === 'user' || key === 'token') {
        logSecurityEvent('LOCALSTORAGE_MODIFICATION', {
          key,
          userId: user?.id,
          action: 'setItem'
        });
      }
      return originalSetItem.call(this, key, value);
    };
    
    localStorage.removeItem = function(key: string) {
      if (key === 'user' || key === 'token') {
        logSecurityEvent('LOCALSTORAGE_MODIFICATION', {
          key,
          userId: user?.id,
          action: 'removeItem'
        });
      }
      return originalRemoveItem.call(this, key);
    };
    
    return () => {
      localStorage.setItem = originalSetItem;
      localStorage.removeItem = originalRemoveItem;
    };
  }, [user]);

  // Monitorar mudanças na URL para detectar tentativas de acesso não autorizado
  useEffect(() => {
    const handleLocationChange = () => {
      const currentPath = window.location.pathname;
      
      // Verificar se usuário Master está tentando acessar áreas de tenant
      if (user?.user_level === UserType.MASTER) {
        const tenantPaths = ['/leads', '/clients', '/proposals', '/dashboard'];
        if (tenantPaths.some(path => currentPath.startsWith(path))) {
          logSecurityViolation('MASTER_TENANT_AREA_ACCESS', {
            masterId: user.id,
            attemptedPath: currentPath
          });
          
          // Redirecionar para painel Master
          window.location.href = '/master';
        }
      }
      
      // Verificar se usuário de tenant está tentando acessar área Master
      if (user?.user_level !== UserType.MASTER && currentPath.startsWith('/master')) {
        logSecurityViolation('NON_MASTER_AREA_ACCESS', {
          userId: user?.id,
          userLevel: user?.user_level,
          attemptedPath: currentPath
        });
        
        // Redirecionar para dashboard
        window.location.href = '/dashboard';
      }
    };

    // Verificar na inicialização
    handleLocationChange();
    
    // Monitorar mudanças
    window.addEventListener('popstate', handleLocationChange);
    
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, [user]);

  return <>{children}</>;
};

export default SecurityMiddleware;

