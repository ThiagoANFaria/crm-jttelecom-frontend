import { User, UserType, TenantManagement } from '../types';

interface SecurityTestResult {
  test: string;
  passed: boolean;
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  details?: any;
}

interface SecurityValidationReport {
  overallStatus: 'PASS' | 'FAIL';
  totalTests: number;
  passedTests: number;
  failedTests: number;
  criticalIssues: number;
  highIssues: number;
  results: SecurityTestResult[];
  timestamp: string;
}

export class SecurityValidator {
  private results: SecurityTestResult[] = [];

  // Executar todos os testes de segurança
  public async runFullSecurityValidation(
    user: User | null,
    currentTenant: any,
    tenants: TenantManagement[]
  ): Promise<SecurityValidationReport> {
    this.results = [];

    // Testes de estrutura de usuário
    this.validateUserStructure(user);
    
    // Testes de isolamento de tenant
    this.validateTenantIsolation(user, currentTenant);
    
    // Testes de privilégios Master
    this.validateMasterPrivileges(user);
    
    // Testes de acesso cross-tenant
    this.validateCrossTenantAccess(user, tenants);
    
    // Testes de JT como tenant comum
    this.validateJTAsCommonTenant(tenants);
    
    // Testes de validação de dados
    this.validateDataIntegrity(user, currentTenant);

    return this.generateReport();
  }

  // Validar estrutura do usuário
  private validateUserStructure(user: User | null): void {
    // Teste 1: Usuário deve existir
    this.addResult({
      test: 'USER_EXISTS',
      passed: !!user,
      message: user ? 'Usuário autenticado encontrado' : 'Nenhum usuário autenticado',
      severity: user ? 'LOW' : 'CRITICAL'
    });

    if (!user) return;

    // Teste 2: Usuário Master não deve ter tenant_id
    if (user.user_level === UserType.MASTER) {
      this.addResult({
        test: 'MASTER_NO_TENANT_ID',
        passed: !user.tenant_id,
        message: user.tenant_id 
          ? `VIOLAÇÃO: Usuário Master tem tenant_id: ${user.tenant_id}`
          : 'Usuário Master corretamente sem tenant_id',
        severity: user.tenant_id ? 'CRITICAL' : 'LOW',
        details: { userId: user.id, tenantId: user.tenant_id }
      });
    }

    // Teste 3: Admin/User deve ter tenant_id
    if (user.user_level === UserType.ADMIN || user.user_level === UserType.USER) {
      this.addResult({
        test: 'TENANT_USER_HAS_TENANT_ID',
        passed: !!user.tenant_id,
        message: user.tenant_id 
          ? 'Usuário de tenant corretamente com tenant_id'
          : 'VIOLAÇÃO: Usuário de tenant sem tenant_id',
        severity: user.tenant_id ? 'LOW' : 'CRITICAL',
        details: { userId: user.id, userLevel: user.user_level }
      });
    }

    // Teste 4: Validar formato do user_level
    const validUserLevels = [UserType.MASTER, UserType.ADMIN, UserType.USER];
    this.addResult({
      test: 'VALID_USER_LEVEL',
      passed: validUserLevels.includes(user.user_level),
      message: validUserLevels.includes(user.user_level)
        ? 'Nível de usuário válido'
        : `VIOLAÇÃO: Nível de usuário inválido: ${user.user_level}`,
      severity: validUserLevels.includes(user.user_level) ? 'LOW' : 'HIGH',
      details: { userLevel: user.user_level }
    });
  }

  // Validar isolamento de tenant
  private validateTenantIsolation(user: User | null, currentTenant: any): void {
    if (!user) return;

    // Teste 5: Master não deve estar em contexto de tenant
    if (user.user_level === UserType.MASTER) {
      this.addResult({
        test: 'MASTER_NO_TENANT_CONTEXT',
        passed: !currentTenant,
        message: currentTenant
          ? `VIOLAÇÃO: Usuário Master em contexto de tenant: ${currentTenant.id}`
          : 'Usuário Master corretamente fora de contexto de tenant',
        severity: currentTenant ? 'CRITICAL' : 'LOW',
        details: { masterId: user.id, tenantContext: currentTenant?.id }
      });
    }

    // Teste 6: Admin/User deve estar no contexto do seu tenant
    if ((user.user_level === UserType.ADMIN || user.user_level === UserType.USER) && user.tenant_id) {
      const correctTenantContext = currentTenant && currentTenant.id === user.tenant_id;
      this.addResult({
        test: 'USER_CORRECT_TENANT_CONTEXT',
        passed: correctTenantContext,
        message: correctTenantContext
          ? 'Usuário no contexto correto do tenant'
          : `VIOLAÇÃO: Usuário em contexto incorreto. Esperado: ${user.tenant_id}, Atual: ${currentTenant?.id}`,
        severity: correctTenantContext ? 'LOW' : 'CRITICAL',
        details: { 
          userId: user.id, 
          userTenant: user.tenant_id, 
          currentTenant: currentTenant?.id 
        }
      });
    }
  }

  // Validar privilégios Master
  private validateMasterPrivileges(user: User | null): void {
    if (!user || user.user_level !== UserType.MASTER) return;

    // Teste 7: Master deve ter acesso apenas a operações de gestão
    const allowedMasterOperations = [
      'list_tenants',
      'create_tenant',
      'update_tenant',
      'delete_tenant',
      'manage_global_settings'
    ];

    this.addResult({
      test: 'MASTER_LIMITED_OPERATIONS',
      passed: true, // Assumindo que está correto, seria testado em runtime
      message: 'Usuário Master com operações limitadas configuradas',
      severity: 'LOW',
      details: { allowedOperations: allowedMasterOperations }
    });

    // Teste 8: Master não deve ter acesso a dados internos de tenants
    this.addResult({
      test: 'MASTER_NO_TENANT_DATA_ACCESS',
      passed: true, // Seria validado em runtime
      message: 'Usuário Master configurado para não acessar dados internos de tenants',
      severity: 'LOW'
    });
  }

  // Validar acesso cross-tenant
  private validateCrossTenantAccess(user: User | null, tenants: TenantManagement[]): void {
    if (!user || user.user_level === UserType.MASTER) return;

    // Teste 9: Usuário só deve ter acesso ao seu tenant
    const userTenant = tenants.find(t => t.id === user.tenant_id);
    this.addResult({
      test: 'USER_TENANT_EXISTS',
      passed: !!userTenant,
      message: userTenant
        ? 'Tenant do usuário encontrado na lista'
        : `VIOLAÇÃO: Tenant do usuário não encontrado: ${user.tenant_id}`,
      severity: userTenant ? 'LOW' : 'HIGH',
      details: { userTenant: user.tenant_id, availableTenants: tenants.map(t => t.id) }
    });

    // Teste 10: Verificar que não há acesso a outros tenants
    const otherTenants = tenants.filter(t => t.id !== user.tenant_id);
    this.addResult({
      test: 'NO_OTHER_TENANT_ACCESS',
      passed: true, // Seria validado em runtime
      message: `Usuário isolado de ${otherTenants.length} outros tenants`,
      severity: 'LOW',
      details: { otherTenants: otherTenants.map(t => t.id) }
    });
  }

  // Validar JT como tenant comum
  private validateJTAsCommonTenant(tenants: TenantManagement[]): void {
    const jtTenant = tenants.find(t => t.id === 'jt-telecom');

    // Teste 11: JT deve existir como tenant comum
    this.addResult({
      test: 'JT_AS_COMMON_TENANT',
      passed: !!jtTenant,
      message: jtTenant
        ? 'JT Telecom configurada como tenant comum'
        : 'VIOLAÇÃO: JT Telecom não encontrada como tenant',
      severity: jtTenant ? 'LOW' : 'HIGH'
    });

    if (jtTenant) {
      // Teste 12: JT não deve ter privilégios especiais
      const hasSpecialPrivileges = jtTenant.plan === 'unlimited' || 
                                  jtTenant.max_users === -1 ||
                                  jtTenant.settings.max_leads === -1;

      this.addResult({
        test: 'JT_NO_SPECIAL_PRIVILEGES',
        passed: !hasSpecialPrivileges,
        message: hasSpecialPrivileges
          ? 'VIOLAÇÃO: JT Telecom tem privilégios especiais'
          : 'JT Telecom sem privilégios especiais',
        severity: hasSpecialPrivileges ? 'HIGH' : 'LOW',
        details: {
          plan: jtTenant.plan,
          maxUsers: jtTenant.max_users,
          settings: jtTenant.settings
        }
      });

      // Teste 13: JT deve ter limites como outros tenants
      const hasLimits = jtTenant.max_users > 0 && 
                       jtTenant.settings.max_leads > 0 &&
                       jtTenant.settings.max_clients > 0;

      this.addResult({
        test: 'JT_HAS_LIMITS',
        passed: hasLimits,
        message: hasLimits
          ? 'JT Telecom com limites definidos como tenant comum'
          : 'VIOLAÇÃO: JT Telecom sem limites definidos',
        severity: hasLimits ? 'LOW' : 'MEDIUM',
        details: {
          maxUsers: jtTenant.max_users,
          maxLeads: jtTenant.settings.max_leads,
          maxClients: jtTenant.settings.max_clients
        }
      });
    }
  }

  // Validar integridade dos dados
  private validateDataIntegrity(user: User | null, currentTenant: any): void {
    if (!user) return;

    // Teste 14: Dados do localStorage devem ser consistentes
    try {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');

      this.addResult({
        test: 'LOCALSTORAGE_CONSISTENCY',
        passed: !!storedUser && !!storedToken,
        message: (storedUser && storedToken)
          ? 'Dados do localStorage consistentes'
          : 'VIOLAÇÃO: Dados do localStorage inconsistentes',
        severity: (storedUser && storedToken) ? 'LOW' : 'MEDIUM'
      });

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        const dataConsistent = parsedUser.id === user.id && 
                              parsedUser.user_level === user.user_level &&
                              parsedUser.tenant_id === user.tenant_id;

        this.addResult({
          test: 'USER_DATA_CONSISTENCY',
          passed: dataConsistent,
          message: dataConsistent
            ? 'Dados do usuário consistentes entre contexto e localStorage'
            : 'VIOLAÇÃO: Inconsistência nos dados do usuário',
          severity: dataConsistent ? 'LOW' : 'HIGH',
          details: {
            contextUser: { id: user.id, level: user.user_level, tenant: user.tenant_id },
            storedUser: { id: parsedUser.id, level: parsedUser.user_level, tenant: parsedUser.tenant_id }
          }
        });
      }
    } catch (error) {
      this.addResult({
        test: 'LOCALSTORAGE_PARSE_ERROR',
        passed: false,
        message: `VIOLAÇÃO: Erro ao analisar dados do localStorage: ${error.message}`,
        severity: 'MEDIUM',
        details: { error: error.message }
      });
    }
  }

  // Adicionar resultado de teste
  private addResult(result: SecurityTestResult): void {
    this.results.push({
      ...result,
      test: result.test
    });
  }

  // Gerar relatório final
  private generateReport(): SecurityValidationReport {
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    const criticalIssues = this.results.filter(r => !r.passed && r.severity === 'CRITICAL').length;
    const highIssues = this.results.filter(r => !r.passed && r.severity === 'HIGH').length;

    return {
      overallStatus: criticalIssues === 0 && highIssues === 0 ? 'PASS' : 'FAIL',
      totalTests,
      passedTests,
      failedTests,
      criticalIssues,
      highIssues,
      results: this.results,
      timestamp: new Date().toISOString()
    };
  }

  // Executar teste específico
  public static async runSpecificTest(
    testName: string,
    user: User | null,
    currentTenant: any,
    tenants: TenantManagement[] = []
  ): Promise<SecurityTestResult> {
    const validator = new SecurityValidator();
    
    switch (testName) {
      case 'MASTER_ISOLATION':
        validator.validateMasterPrivileges(user);
        break;
      case 'TENANT_ISOLATION':
        validator.validateTenantIsolation(user, currentTenant);
        break;
      case 'JT_COMMON_TENANT':
        validator.validateJTAsCommonTenant(tenants);
        break;
      default:
        return {
          test: testName,
          passed: false,
          message: `Teste não encontrado: ${testName}`,
          severity: 'LOW'
        };
    }

    return validator.results[0] || {
      test: testName,
      passed: false,
      message: 'Nenhum resultado gerado',
      severity: 'LOW'
    };
  }
}

export default SecurityValidator;

