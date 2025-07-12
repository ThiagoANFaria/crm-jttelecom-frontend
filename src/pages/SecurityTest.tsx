import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Play, 
  RefreshCw,
  Eye,
  EyeOff,
  Download,
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTenant } from '../contexts/TenantContext';
import { SecurityValidator } from '../utils/SecurityValidator';
import { TenantManagement, TenantStatus, TenantPlan } from '../types';

interface SecurityTestPageProps {}

const SecurityTest: React.FC<SecurityTestPageProps> = () => {
  const { user } = useAuth();
  const { currentTenant } = useTenant();
  const [isRunning, setIsRunning] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [showDetails, setShowDetails] = useState<string[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Mock tenants para teste
  const mockTenants: TenantManagement[] = [
    {
      id: 'jt-telecom',
      name: 'JT Telecom',
      status: TenantStatus.ACTIVE,
      plan: TenantPlan.ENTERPRISE,
      max_users: 100,
      current_users: 12,
      admin_user: {
        id: 'admin-jt',
        name: 'Admin JT',
        email: 'admin@jttelecom.com.br'
      },
      created_at: '2025-01-01T00:00:00Z',
      settings: {
        max_leads: 10000,
        max_clients: 5000,
        integrations_enabled: ['whatsapp', 'email'],
        custom_branding: true
      }
    },
    {
      id: 'empresa-demo',
      name: 'Empresa Demo',
      status: TenantStatus.TRIAL,
      plan: TenantPlan.PROFESSIONAL,
      max_users: 10,
      current_users: 3,
      admin_user: {
        id: 'admin-demo',
        name: 'Admin Demo',
        email: 'admin@demo.com'
      },
      created_at: '2025-12-01T00:00:00Z',
      settings: {
        max_leads: 1000,
        max_clients: 500,
        integrations_enabled: ['email'],
        custom_branding: false
      }
    }
  ];

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        runSecurityTests();
      }, 30000); // 30 segundos

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const runSecurityTests = async () => {
    setIsRunning(true);
    try {
      const validator = new SecurityValidator();
      const testReport = await validator.runFullSecurityValidation(
        user,
        currentTenant,
        mockTenants
      );
      setReport(testReport);
    } catch (error) {
      console.error('Erro ao executar testes de segurança:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const toggleDetails = (testName: string) => {
    setShowDetails(prev => 
      prev.includes(testName) 
        ? prev.filter(name => name !== testName)
        : [...prev, testName]
    );
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'text-red-600 bg-red-100';
      case 'HIGH':
        return 'text-orange-600 bg-orange-100';
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-100';
      case 'LOW':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (passed: boolean) => {
    return passed 
      ? <CheckCircle className="w-5 h-5 text-green-500" />
      : <XCircle className="w-5 h-5 text-red-500" />;
  };

  const exportReport = () => {
    if (!report) return;
    
    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `security-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Testes de Segurança</h1>
                  <p className="text-gray-500">Validação da estrutura multi-tenant e isolamento</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span>Auto-refresh (30s)</span>
                </label>
                
                {report && (
                  <button
                    onClick={exportReport}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    <Download className="w-4 h-4" />
                    <span>Exportar</span>
                  </button>
                )}
                
                <button
                  onClick={runSecurityTests}
                  disabled={isRunning}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isRunning ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  <span>{isRunning ? 'Executando...' : 'Executar Testes'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Status do Sistema */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Shield className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Usuário Atual</p>
                    <p className="text-lg font-semibold text-blue-700">
                      {user ? `${user.name} (${user.user_level})` : 'Não autenticado'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-900">Tenant Atual</p>
                    <p className="text-lg font-semibold text-green-700">
                      {currentTenant ? currentTenant.name : 'Nenhum tenant'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Clock className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium text-purple-900">Último Teste</p>
                    <p className="text-lg font-semibold text-purple-700">
                      {report ? new Date(report.timestamp).toLocaleTimeString() : 'Nunca'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Relatório de Testes */}
        {report && (
          <div className="bg-white rounded-lg shadow-sm border">
            {/* Resumo */}
            <div className="p-6 border-b">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Relatório de Segurança</h2>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  report.overallStatus === 'PASS' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {report.overallStatus}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{report.totalTests}</p>
                  <p className="text-sm text-gray-500">Total de Testes</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{report.passedTests}</p>
                  <p className="text-sm text-gray-500">Aprovados</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{report.criticalIssues}</p>
                  <p className="text-sm text-gray-500">Críticos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">{report.highIssues}</p>
                  <p className="text-sm text-gray-500">Alta Prioridade</p>
                </div>
              </div>
            </div>

            {/* Resultados Detalhados */}
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Resultados Detalhados</h3>
              
              <div className="space-y-3">
                {report.results.map((result: any, index: number) => (
                  <div key={index} className="border rounded-lg">
                    <div 
                      className="p-4 cursor-pointer hover:bg-gray-50"
                      onClick={() => toggleDetails(result.test)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(result.passed)}
                          <div>
                            <p className="font-medium text-gray-900">{result.test}</p>
                            <p className="text-sm text-gray-600">{result.message}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(result.severity)}`}>
                            {result.severity}
                          </span>
                          {showDetails.includes(result.test) ? (
                            <EyeOff className="w-4 h-4 text-gray-400" />
                          ) : (
                            <Eye className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>

                    {showDetails.includes(result.test) && result.details && (
                      <div className="px-4 pb-4 border-t bg-gray-50">
                        <pre className="text-xs text-gray-600 mt-2 overflow-x-auto">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Estado Inicial */}
        {!report && !isRunning && (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum teste executado
            </h3>
            <p className="text-gray-500 mb-6">
              Execute os testes de segurança para validar a estrutura multi-tenant
            </p>
            <button
              onClick={runSecurityTests}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mx-auto"
            >
              <Play className="w-5 h-5" />
              <span>Executar Testes de Segurança</span>
            </button>
          </div>
        )}

        {/* Loading */}
        {isRunning && (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <RefreshCw className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Executando Testes de Segurança
            </h3>
            <p className="text-gray-500">
              Validando estrutura multi-tenant e isolamento de dados...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurityTest;

