import { useAuth } from '../context/AuthContext';
import { UserType } from '../types';

interface TenantSecurityHook {
  validateTenantAccess: (tenantId: string, operation: string) => boolean;
  enforceDataIsolation: <T>(data: T[], tenantIdField: string) => T[];
  validateMasterOperation: (operation: string) => boolean;
  logSecurityViolation: (violation: string, details?: any) => void;
  isTenantDataAccessAllowed: (resourceTenantId: string) => boolean;
  sanitizeDataForTenant: <T>(data: T, allowedFields: string[]) => Partial<T>;
}

export const useTenantSecurity = (): TenantSecurityHook => {
  const { user, enforceIsolation, logSecurityEvent, canAccessTenant } = useAuth();

  // Validar acesso a tenant específico para operação
  const validateTenantAccess = (tenantId: string, operation: string): boolean => {
    if (!user) {
      logSecurityEvent('UNAUTHORIZED_TENANT_ACCESS', { tenantId, operation });
      return false;
    }

    // Usuário Master não pode acessar dados internos de tenants
    if (user.user_level === UserType.MASTER) {
      const masterOperations = ['list_tenants', 'create_tenant', 'update_tenant', 'delete_tenant'];
      if (!masterOperations.includes(operation)) {
        logSecurityEvent('MASTER_TENANT_DATA_ACCESS_DENIED', { 
          userId: user.id, 
          tenantId, 
          operation 
        });
        return false;
      }
    }

    // Validar isolamento usando AuthContext
    return enforceIsolation(operation, tenantId);
  };

  // Filtrar dados para garantir isolamento por tenant
  const enforceDataIsolation = <T>(data: T[], tenantIdField: string): T[] => {
    if (!user) {
      logSecurityEvent('DATA_ISOLATION_NO_USER', { dataCount: data.length });
      return [];
    }

    // Usuário Master não deve ver dados internos de nenhum tenant
    if (user.user_level === UserType.MASTER) {
      logSecurityEvent('MASTER_DATA_ISOLATION_BLOCK', { 
        userId: user.id, 
        dataCount: data.length 
      });
      return [];
    }

    // Admin/User só vê dados do seu tenant
    if (user.user_level === UserType.ADMIN || user.user_level === UserType.USER) {
      if (!user.tenant_id) {
        logSecurityEvent('USER_NO_TENANT_DATA_ACCESS', { 
          userId: user.id, 
          userLevel: user.user_level 
        });
        return [];
      }

      const filteredData = data.filter((item: any) => {
        const itemTenantId = item[tenantIdField];
        const hasAccess = itemTenantId === user.tenant_id;
        
        if (!hasAccess) {
          logSecurityEvent('DATA_ISOLATION_FILTER', { 
            userId: user.id,
            userTenant: user.tenant_id,
            itemTenant: itemTenantId,
            blocked: true
          });
        }
        
        return hasAccess;
      });

      return filteredData;
    }

    return [];
  };

  // Validar operações específicas do Master
  const validateMasterOperation = (operation: string): boolean => {
    if (!user || user.user_level !== UserType.MASTER) {
      logSecurityEvent('NON_MASTER_OPERATION_ATTEMPT', { 
        userId: user?.id, 
        userLevel: user?.user_level, 
        operation 
      });
      return false;
    }

    const allowedMasterOperations = [
      'list_tenants',
      'create_tenant',
      'update_tenant',
      'delete_tenant',
      'suspend_tenant',
      'activate_tenant',
      'manage_global_settings',
      'view_system_stats',
      'manage_master_users',
      'audit_security_logs'
    ];

    const isAllowed = allowedMasterOperations.includes(operation);
    
    if (!isAllowed) {
      logSecurityEvent('MASTER_FORBIDDEN_OPERATION', { 
        userId: user.id, 
        operation 
      });
    }

    return isAllowed;
  };

  // Log de violações de segurança
  const logSecurityViolation = (violation: string, details?: any): void => {
    const violationData = {
      violation,
      timestamp: new Date().toISOString(),
      user: user ? {
        id: user.id,
        email: user.email,
        level: user.user_level,
        tenant_id: user.tenant_id
      } : null,
      details,
      severity: 'HIGH',
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    // Log crítico no console
    console.error('🚨 SECURITY VIOLATION:', violationData);

    // Usar sistema de log do AuthContext
    logSecurityEvent(`VIOLATION_${violation}`, violationData);

    // Em produção, alertar sistema de monitoramento
    // await securityMonitoring.alert(violationData);
  };

  // Verificar se acesso a dados de tenant é permitido
  const isTenantDataAccessAllowed = (resourceTenantId: string): boolean => {
    if (!user) {
      return false;
    }

    // Master nunca pode acessar dados internos de tenants
    if (user.user_level === UserType.MASTER) {
      logSecurityViolation('MASTER_TENANT_DATA_ACCESS', { 
        resourceTenantId,
        masterId: user.id 
      });
      return false;
    }

    // Admin/User só pode acessar dados do próprio tenant
    if (user.user_level === UserType.ADMIN || user.user_level === UserType.USER) {
      const hasAccess = user.tenant_id === resourceTenantId;
      
      if (!hasAccess) {
        logSecurityViolation('CROSS_TENANT_DATA_ACCESS', {
          userId: user.id,
          userTenant: user.tenant_id,
          resourceTenant: resourceTenantId
        });
      }
      
      return hasAccess;
    }

    return false;
  };

  // Sanitizar dados removendo campos sensíveis baseado no tenant
  const sanitizeDataForTenant = <T>(data: T, allowedFields: string[]): Partial<T> => {
    if (!user) {
      return {};
    }

    // Master não deve ver dados internos, apenas metadados
    if (user.user_level === UserType.MASTER) {
      const masterAllowedFields = ['id', 'name', 'created_at', 'status'];
      const sanitized: Partial<T> = {};
      
      masterAllowedFields.forEach(field => {
        if (field in data && allowedFields.includes(field)) {
          (sanitized as any)[field] = (data as any)[field];
        }
      });
      
      return sanitized;
    }

    // Admin/User veem todos os campos permitidos do seu tenant
    const sanitized: Partial<T> = {};
    allowedFields.forEach(field => {
      if (field in data) {
        (sanitized as any)[field] = (data as any)[field];
      }
    });

    return sanitized;
  };

  return {
    validateTenantAccess,
    enforceDataIsolation,
    validateMasterOperation,
    logSecurityViolation,
    isTenantDataAccessAllowed,
    sanitizeDataForTenant
  };
};

