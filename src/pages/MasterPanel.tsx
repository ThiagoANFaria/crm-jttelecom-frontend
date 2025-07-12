import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  Settings, 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Crown,
  Shield,
  Database,
  Activity
} from 'lucide-react';
import { TenantManagement, TenantStatus, TenantPlan, UserType } from '../types';

const MasterPanel: React.FC = () => {
  const [tenants, setTenants] = useState<TenantManagement[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TenantStatus | 'all'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<TenantManagement | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock data para demonstração
  useEffect(() => {
    const mockTenants: TenantManagement[] = [
      {
        id: 'jt-telecom',
        name: 'JT Telecom',
        domain: 'jttelecom.crm.app',
        status: TenantStatus.ACTIVE,
        plan: TenantPlan.ENTERPRISE,
        max_users: 50,
        current_users: 12,
        admin_user: {
          id: 'admin-jt',
          name: 'Administrador JT',
          email: 'admin@jttelecom.com.br'
        },
        created_at: '2024-01-15T10:00:00Z',
        settings: {
          max_leads: 10000,
          max_clients: 5000,
          integrations_enabled: ['whatsapp', 'email', 'smartbot', 'pabx'],
          custom_branding: true
        }
      },
      {
        id: 'empresa-demo',
        name: 'Empresa Demo Ltda',
        domain: 'demo.crm.app',
        status: TenantStatus.TRIAL,
        plan: TenantPlan.PROFESSIONAL,
        max_users: 10,
        current_users: 3,
        admin_user: {
          id: 'admin-demo',
          name: 'João Silva',
          email: 'joao@empresademo.com.br'
        },
        created_at: '2024-12-01T14:30:00Z',
        expires_at: '2024-12-31T23:59:59Z',
        settings: {
          max_leads: 1000,
          max_clients: 500,
          integrations_enabled: ['whatsapp', 'email'],
          custom_branding: false
        }
      }
    ];
    
    setTimeout(() => {
      setTenants(mockTenants);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusIcon = (status: TenantStatus) => {
    switch (status) {
      case TenantStatus.ACTIVE:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case TenantStatus.INACTIVE:
        return <XCircle className="w-4 h-4 text-red-500" />;
      case TenantStatus.SUSPENDED:
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case TenantStatus.TRIAL:
        return <Clock className="w-4 h-4 text-blue-500" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: TenantStatus) => {
    switch (status) {
      case TenantStatus.ACTIVE:
        return 'bg-green-100 text-green-800';
      case TenantStatus.INACTIVE:
        return 'bg-red-100 text-red-800';
      case TenantStatus.SUSPENDED:
        return 'bg-orange-100 text-orange-800';
      case TenantStatus.TRIAL:
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanColor = (plan: TenantPlan) => {
    switch (plan) {
      case TenantPlan.BASIC:
        return 'bg-gray-100 text-gray-800';
      case TenantPlan.PROFESSIONAL:
        return 'bg-blue-100 text-blue-800';
      case TenantPlan.ENTERPRISE:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.admin_user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tenant.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalStats = {
    total: tenants.length,
    active: tenants.filter(t => t.status === TenantStatus.ACTIVE).length,
    trial: tenants.filter(t => t.status === TenantStatus.TRIAL).length,
    totalUsers: tenants.reduce((sum, t) => sum + t.current_users, 0)
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando painel Master...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Master */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Painel Master</h1>
                <p className="text-sm text-gray-500">Gestão Global de Tenants</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Shield className="w-4 h-4" />
                <span>Usuário Master</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total de Tenants</p>
                <p className="text-2xl font-semibold text-gray-900">{totalStats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Tenants Ativos</p>
                <p className="text-2xl font-semibold text-gray-900">{totalStats.active}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Em Trial</p>
                <p className="text-2xl font-semibold text-gray-900">{totalStats.trial}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total de Usuários</p>
                <p className="text-2xl font-semibold text-gray-900">{totalStats.totalUsers}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controles */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex-1 max-w-lg">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar por nome ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as TenantStatus | 'all')}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Todos os Status</option>
                    <option value={TenantStatus.ACTIVE}>Ativo</option>
                    <option value={TenantStatus.TRIAL}>Trial</option>
                    <option value={TenantStatus.INACTIVE}>Inativo</option>
                    <option value={TenantStatus.SUSPENDED}>Suspenso</option>
                  </select>
                </div>
                
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo Tenant</span>
                </button>
              </div>
            </div>
          </div>

          {/* Lista de Tenants */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tenant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plano
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuários
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Administrador
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Criado em
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-white" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{tenant.name}</div>
                          <div className="text-sm text-gray-500">{tenant.domain}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(tenant.status)}
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(tenant.status)}`}>
                          {tenant.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPlanColor(tenant.plan)}`}>
                        {tenant.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center space-x-2">
                        <span>{tenant.current_users}/{tenant.max_users}</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(tenant.current_users / tenant.max_users) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{tenant.admin_user.name}</div>
                      <div className="text-sm text-gray-500">{tenant.admin_user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(tenant.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setSelectedTenant(tenant)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="Visualizar"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {/* Implementar edição */}}
                          className="text-gray-600 hover:text-gray-900 p-1 rounded"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {/* Implementar exclusão */}}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTenants.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum tenant encontrado</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Tente ajustar os filtros de busca.'
                  : 'Comece criando um novo tenant.'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Detalhes do Tenant */}
      {selectedTenant && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Detalhes do Tenant</h3>
                <button
                  onClick={() => setSelectedTenant(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nome</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedTenant.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Domínio</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedTenant.domain}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <div className="mt-1 flex items-center space-x-2">
                      {getStatusIcon(selectedTenant.status)}
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedTenant.status)}`}>
                        {selectedTenant.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Plano</label>
                    <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPlanColor(selectedTenant.plan)}`}>
                      {selectedTenant.plan}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Configurações</label>
                  <div className="mt-2 bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Max Leads:</span> {selectedTenant.settings.max_leads}
                      </div>
                      <div>
                        <span className="font-medium">Max Clientes:</span> {selectedTenant.settings.max_clients}
                      </div>
                      <div>
                        <span className="font-medium">Usuários:</span> {selectedTenant.current_users}/{selectedTenant.max_users}
                      </div>
                      <div>
                        <span className="font-medium">Branding:</span> {selectedTenant.settings.custom_branding ? 'Sim' : 'Não'}
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className="font-medium">Integrações:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedTenant.settings.integrations_enabled.map((integration) => (
                          <span key={integration} className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                            {integration}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterPanel;

