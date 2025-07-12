import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Plus, 
  Play, 
  Pause, 
  Edit, 
  Copy, 
  Trash2, 
  Search,
  Filter,
  MoreHorizontal,
  Zap,
  GitBranch,
  Settings,
  Calendar,
  BarChart3,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Activity
} from 'lucide-react';
import AutomationFlowBuilder from '@/components/AutomationFlowBuilder';
import { 
  AutomationFlow, 
  Cadence, 
  InactivityRule,
  AutomationDashboard,
  CadenceType,
  ExecutionStatus 
} from '@/types/automation';
import { automationService } from '@/services/automationService';

const AutomationEnhanced: React.FC = () => {
  const [activeTab, setActiveTab] = useState('flows');
  const [flows, setFlows] = useState<AutomationFlow[]>([]);
  const [cadences, setCadences] = useState<Cadence[]>([]);
  const [inactivityRules, setInactivityRules] = useState<InactivityRule[]>([]);
  const [dashboard, setDashboard] = useState<AutomationDashboard | null>(null);
  const [selectedFlow, setSelectedFlow] = useState<AutomationFlow | null>(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Mock tenant ID - em produção viria do contexto
  const tenantId = 'tenant_123';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar dados em paralelo
      const [flowsData, cadencesData, inactivityData, dashboardData] = await Promise.all([
        automationService.getFlows(tenantId),
        automationService.getCadences(tenantId),
        automationService.getInactivityRules(tenantId),
        automationService.getDashboard(tenantId, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date())
      ]);

      setFlows(flowsData);
      setCadences(cadencesData);
      setInactivityRules(inactivityData);
      setDashboard(dashboardData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      // Em produção, usar dados mock para demonstração
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = () => {
    // Dados mock para demonstração
    const mockFlows: AutomationFlow[] = [
      {
        id: '1',
        tenantId,
        name: 'Follow-up Lead Inativo',
        description: 'Envia e-mail após 3 dias sem resposta',
        isActive: true,
        createdBy: 'user_1',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-20'),
        trigger: { type: 'lead_inactivity' as any, config: { inactivityDays: 3 } },
        conditions: [],
        actions: [],
        flowData: { nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } },
        executionCount: 45,
        lastExecuted: new Date('2024-01-25')
      },
      {
        id: '2',
        tenantId,
        name: 'Boas-vindas Novo Lead',
        description: 'Envia e-mail de boas-vindas para novos leads',
        isActive: true,
        createdBy: 'user_1',
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-18'),
        trigger: { type: 'new_lead' as any, config: {} },
        conditions: [],
        actions: [],
        flowData: { nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } },
        executionCount: 128,
        lastExecuted: new Date('2024-01-25')
      },
      {
        id: '3',
        tenantId,
        name: 'Contrato Vencendo',
        description: 'Notifica 30 dias antes do vencimento',
        isActive: false,
        createdBy: 'user_2',
        createdAt: new Date('2024-01-12'),
        updatedAt: new Date('2024-01-22'),
        trigger: { type: 'contract_expiring' as any, config: { daysBeforeExpiry: 30 } },
        conditions: [],
        actions: [],
        flowData: { nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } },
        executionCount: 12,
        lastExecuted: new Date('2024-01-23')
      }
    ];

    const mockCadences: Cadence[] = [
      {
        id: '1',
        tenantId,
        name: 'Cadência Prospecção',
        type: CadenceType.PROSPECTING,
        description: 'Sequência de 7 dias para novos leads',
        isActive: true,
        createdBy: 'user_1',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-20'),
        steps: [],
        enrollmentCriteria: { autoEnroll: true },
        exitCriteria: { onReply: true, onTaskComplete: false, onStageChange: true },
        stats: {
          totalEnrolled: 89,
          activeEnrollments: 34,
          completedEnrollments: 45,
          responseRate: 0.32,
          avgCompletionTime: 5.2
        }
      },
      {
        id: '2',
        tenantId,
        name: 'Follow-up Pós-Reunião',
        type: CadenceType.POST_MEETING,
        description: 'Acompanhamento após reunião comercial',
        isActive: true,
        createdBy: 'user_2',
        createdAt: new Date('2024-01-18'),
        updatedAt: new Date('2024-01-22'),
        steps: [],
        enrollmentCriteria: { autoEnroll: false },
        exitCriteria: { onReply: true, onTaskComplete: true, onStageChange: true },
        stats: {
          totalEnrolled: 23,
          activeEnrollments: 8,
          completedEnrollments: 15,
          responseRate: 0.65,
          avgCompletionTime: 3.1
        }
      }
    ];

    setFlows(mockFlows);
    setCadences(mockCadences);
    setInactivityRules([]);
    setDashboard({
      tenantId,
      period: {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date()
      },
      metrics: {
        totalFlows: 3,
        activeFlows: 2,
        totalExecutions: 185,
        successfulExecutions: 178,
        failedExecutions: 7,
        avgExecutionTime: 2.3
      },
      cadenceMetrics: {
        totalCadences: 2,
        activeCadences: 2,
        totalEnrollments: 112,
        activeEnrollments: 42,
        completionRate: 0.54,
        avgResponseTime: 4.2
      },
      channelMetrics: {
        email: {
          sent: 145,
          delivered: 142,
          opened: 89,
          clicked: 34,
          replied: 28,
          openRate: 0.63,
          clickRate: 0.24,
          replyRate: 0.19
        },
        whatsapp: {
          sent: 67,
          delivered: 65,
          read: 58,
          replied: 23,
          deliveryRate: 0.97,
          readRate: 0.89,
          replyRate: 0.40
        },
        tasks: {
          created: 89,
          completed: 67,
          overdue: 8,
          completionRate: 0.75
        }
      },
      riskMetrics: {
        leadsAtRisk: 12,
        clientsAtRisk: 3,
        inactiveLeads: 28,
        inactiveClients: 7,
        avgInactivityDays: 8.5
      }
    });
  };

  const handleCreateFlow = () => {
    setSelectedFlow(null);
    setIsBuilderOpen(true);
  };

  const handleEditFlow = (flow: AutomationFlow) => {
    setSelectedFlow(flow);
    setIsBuilderOpen(true);
  };

  const handleSaveFlow = async (flowData: Partial<AutomationFlow>) => {
    try {
      if (selectedFlow) {
        // Atualizar fluxo existente
        const updatedFlow = await automationService.updateFlow(tenantId, selectedFlow.id, flowData);
        setFlows(prev => prev.map(f => f.id === selectedFlow.id ? updatedFlow : f));
      } else {
        // Criar novo fluxo
        const newFlow = await automationService.createFlow(tenantId, flowData as any);
        setFlows(prev => [...prev, newFlow]);
      }
      setIsBuilderOpen(false);
      setSelectedFlow(null);
    } catch (error) {
      console.error('Erro ao salvar fluxo:', error);
    }
  };

  const handleToggleFlow = async (flow: AutomationFlow) => {
    try {
      const updatedFlow = await automationService.toggleFlowStatus(tenantId, flow.id, !flow.isActive);
      setFlows(prev => prev.map(f => f.id === flow.id ? updatedFlow : f));
    } catch (error) {
      console.error('Erro ao alterar status do fluxo:', error);
    }
  };

  const handleCloneFlow = async (flow: AutomationFlow) => {
    try {
      const clonedFlow = await automationService.cloneFlow(tenantId, flow.id, `${flow.name} (Cópia)`);
      setFlows(prev => [...prev, clonedFlow]);
    } catch (error) {
      console.error('Erro ao clonar fluxo:', error);
    }
  };

  const handleDeleteFlow = async (flow: AutomationFlow) => {
    if (confirm('Tem certeza que deseja excluir este fluxo?')) {
      try {
        await automationService.deleteFlow(tenantId, flow.id);
        setFlows(prev => prev.filter(f => f.id !== flow.id));
      } catch (error) {
        console.error('Erro ao excluir fluxo:', error);
      }
    }
  };

  const filteredFlows = flows.filter(flow =>
    flow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    flow.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCadences = cadences.filter(cadence =>
    cadence.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cadence.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-500">Carregando automações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Automações e Cadência</h1>
          <p className="text-gray-500">Crie fluxos inteligentes para potencializar suas vendas</p>
        </div>
        
        <Button onClick={handleCreateFlow} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Novo Fluxo
        </Button>
      </div>

      {/* Dashboard Cards */}
      {dashboard && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Fluxos Ativos</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {dashboard.metrics.activeFlows}
                  </p>
                </div>
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {dashboard.metrics.totalFlows} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Execuções (30d)</p>
                  <p className="text-2xl font-bold text-green-600">
                    {dashboard.metrics.totalExecutions}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {Math.round((dashboard.metrics.successfulExecutions / dashboard.metrics.totalExecutions) * 100)}% sucesso
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Taxa Resposta</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {Math.round(dashboard.channelMetrics.email.replyRate * 100)}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                E-mail + WhatsApp
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Leads em Risco</p>
                  <p className="text-2xl font-bold text-red-600">
                    {dashboard.riskMetrics.leadsAtRisk}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {dashboard.riskMetrics.avgInactivityDays} dias média
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="flows" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Fluxos
          </TabsTrigger>
          <TabsTrigger value="cadences" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Cadências
          </TabsTrigger>
          <TabsTrigger value="inactivity" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Régua Inatividade
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Search */}
        <div className="flex items-center gap-4 mt-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar fluxos e cadências..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>

        {/* Fluxos */}
        <TabsContent value="flows">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Fluxos de Automação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Execuções</TableHead>
                    <TableHead>Última Execução</TableHead>
                    <TableHead>Criado por</TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFlows.map((flow) => (
                    <TableRow key={flow.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{flow.name}</div>
                          <div className="text-sm text-gray-500">{flow.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={flow.isActive ? "default" : "secondary"}>
                          {flow.isActive ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>{flow.executionCount}</TableCell>
                      <TableCell>
                        {flow.lastExecuted ? 
                          new Date(flow.lastExecuted).toLocaleDateString('pt-BR') : 
                          'Nunca'
                        }
                      </TableCell>
                      <TableCell>{flow.createdBy}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleFlow(flow)}
                          >
                            {flow.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditFlow(flow)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCloneFlow(flow)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteFlow(flow)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cadências */}
        <TabsContent value="cadences">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Cadências Automatizadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Inscritos</TableHead>
                    <TableHead>Taxa Resposta</TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCadences.map((cadence) => (
                    <TableRow key={cadence.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{cadence.name}</div>
                          <div className="text-sm text-gray-500">{cadence.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {cadence.type.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={cadence.isActive ? "default" : "secondary"}>
                          {cadence.isActive ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{cadence.stats.activeEnrollments}</div>
                          <div className="text-sm text-gray-500">
                            {cadence.stats.totalEnrolled} total
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {Math.round(cadence.stats.responseRate * 100)}%
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Régua de Inatividade */}
        <TabsContent value="inactivity">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Régua de Inatividade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Réguas de Inatividade
                </h3>
                <p className="text-gray-500 mb-4">
                  Configure réguas automáticas para leads e clientes inativos
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Régua
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance por Canal</CardTitle>
              </CardHeader>
              <CardContent>
                {dashboard && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">E-mail</span>
                      <span className="text-sm text-gray-500">
                        {dashboard.channelMetrics.email.sent} enviados
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${dashboard.channelMetrics.email.openRate * 100}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">WhatsApp</span>
                      <span className="text-sm text-gray-500">
                        {dashboard.channelMetrics.whatsapp.sent} enviados
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${dashboard.channelMetrics.whatsapp.readRate * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Leads em Risco</CardTitle>
              </CardHeader>
              <CardContent>
                {dashboard && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Leads inativos</span>
                      <span className="text-lg font-bold text-red-600">
                        {dashboard.riskMetrics.inactiveLeads}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Clientes inativos</span>
                      <span className="text-lg font-bold text-orange-600">
                        {dashboard.riskMetrics.inactiveClients}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Média inatividade</span>
                      <span className="text-lg font-bold text-gray-600">
                        {dashboard.riskMetrics.avgInactivityDays} dias
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Flow Builder Dialog */}
      <Dialog open={isBuilderOpen} onOpenChange={setIsBuilderOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0">
          <AutomationFlowBuilder
            flow={selectedFlow || undefined}
            onSave={handleSaveFlow}
            onTest={(flow) => console.log('Testando fluxo:', flow)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AutomationEnhanced;

