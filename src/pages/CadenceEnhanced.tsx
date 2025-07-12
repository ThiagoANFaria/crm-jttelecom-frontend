import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Calendar,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Activity,
  Mail,
  MessageSquare,
  Phone,
  BarChart3
} from 'lucide-react';
import CadenceBuilder from '@/components/CadenceBuilder';
import { 
  Cadence, 
  CadenceType, 
  InactivityRule,
  InactivityAction
} from '@/types/automation';
import { automationService } from '@/services/automationService';

const CadenceEnhanced: React.FC = () => {
  const [activeTab, setActiveTab] = useState('cadences');
  const [cadences, setCadences] = useState<Cadence[]>([]);
  const [inactivityRules, setInactivityRules] = useState<InactivityRule[]>([]);
  const [selectedCadence, setSelectedCadence] = useState<Cadence | null>(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedInactivityRule, setSelectedInactivityRule] = useState<InactivityRule | null>(null);
  const [isInactivityRuleDialogOpen, setIsInactivityRuleDialogOpen] = useState(false);

  // Mock tenant ID - em produção viria do contexto
  const tenantId = 'tenant_123';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar dados em paralelo
      const [cadencesData, inactivityData] = await Promise.all([
        automationService.getCadences(tenantId),
        automationService.getInactivityRules(tenantId)
      ]);

      setCadences(cadencesData);
      setInactivityRules(inactivityData);
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
        steps: [
          {
            id: '1',
            name: 'E-mail Inicial',
            type: 'email' as any,
            dayOffset: 0,
            order: 0,
            config: { emailTemplateId: '1' }
          },
          {
            id: '2',
            name: 'Tarefa de Ligação',
            type: 'task' as any,
            dayOffset: 2,
            order: 1,
            config: { taskTitle: 'Ligar para {{nome}}', assignedUserId: '1' }
          },
          {
            id: '3',
            name: 'WhatsApp Follow-up',
            type: 'whatsapp' as any,
            dayOffset: 4,
            order: 2,
            config: { whatsappTemplateId: '1' }
          },
          {
            id: '4',
            name: 'E-mail Final',
            type: 'email' as any,
            dayOffset: 7,
            order: 3,
            config: { emailTemplateId: '2' }
          }
        ],
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
        steps: [
          {
            id: '1',
            name: 'E-mail de Agradecimento',
            type: 'email' as any,
            dayOffset: 0,
            order: 0,
            config: { emailTemplateId: '3' }
          },
          {
            id: '2',
            name: 'Aguardar',
            type: 'wait' as any,
            dayOffset: 2,
            order: 1,
            config: { waitHours: 48 }
          },
          {
            id: '3',
            name: 'Ligação de Acompanhamento',
            type: 'call' as any,
            dayOffset: 4,
            order: 2,
            config: { callScript: 'Verificar feedback da reunião' }
          }
        ],
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

    const mockInactivityRules: InactivityRule[] = [
      {
        id: '1',
        tenantId,
        name: 'Leads Inativos 7 dias',
        description: 'Reengajamento de leads sem interação por 7 dias',
        isActive: true,
        createdBy: 'user_1',
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-15'),
        entityType: 'lead',
        inactivityDays: 7,
        actions: [
          {
            id: '1',
            type: 'email' as InactivityAction,
            config: { emailTemplateId: '4' }
          },
          {
            id: '2',
            type: 'task' as InactivityAction,
            config: { taskTitle: 'Verificar lead inativo', assignedUserId: '1' }
          }
        ]
      },
      {
        id: '2',
        tenantId,
        name: 'Clientes Inativos 30 dias',
        description: 'Reengajamento de clientes sem interação por 30 dias',
        isActive: true,
        createdBy: 'user_2',
        createdAt: new Date('2024-01-12'),
        updatedAt: new Date('2024-01-18'),
        entityType: 'client',
        inactivityDays: 30,
        actions: [
          {
            id: '1',
            type: 'email' as InactivityAction,
            config: { emailTemplateId: '5' }
          },
          {
            id: '2',
            type: 'whatsapp' as InactivityAction,
            config: { whatsappTemplateId: '2' }
          }
        ]
      }
    ];

    setCadences(mockCadences);
    setInactivityRules(mockInactivityRules);
  };

  const handleCreateCadence = () => {
    setSelectedCadence(null);
    setIsBuilderOpen(true);
  };

  const handleEditCadence = (cadence: Cadence) => {
    setSelectedCadence(cadence);
    setIsBuilderOpen(true);
  };

  const handleSaveCadence = async (cadenceData: Partial<Cadence>) => {
    try {
      if (selectedCadence) {
        // Atualizar cadência existente
        const updatedCadence = await automationService.updateCadence(tenantId, selectedCadence.id, cadenceData);
        setCadences(prev => prev.map(c => c.id === selectedCadence.id ? updatedCadence : c));
      } else {
        // Criar nova cadência
        const newCadence = await automationService.createCadence(tenantId, cadenceData as any);
        setCadences(prev => [...prev, newCadence]);
      }
      setIsBuilderOpen(false);
      setSelectedCadence(null);
    } catch (error) {
      console.error('Erro ao salvar cadência:', error);
    }
  };

  const handleToggleCadence = async (cadence: Cadence) => {
    try {
      const updatedCadence = await automationService.toggleCadenceStatus(tenantId, cadence.id, !cadence.isActive);
      setCadences(prev => prev.map(c => c.id === cadence.id ? updatedCadence : c));
    } catch (error) {
      console.error('Erro ao alterar status da cadência:', error);
    }
  };

  const handleCloneCadence = async (cadence: Cadence) => {
    try {
      const clonedCadence = await automationService.cloneCadence(tenantId, cadence.id, `${cadence.name} (Cópia)`);
      setCadences(prev => [...prev, clonedCadence]);
    } catch (error) {
      console.error('Erro ao clonar cadência:', error);
    }
  };

  const handleDeleteCadence = async (cadence: Cadence) => {
    if (confirm('Tem certeza que deseja excluir esta cadência?')) {
      try {
        await automationService.deleteCadence(tenantId, cadence.id);
        setCadences(prev => prev.filter(c => c.id !== cadence.id));
      } catch (error) {
        console.error('Erro ao excluir cadência:', error);
      }
    }
  };

  const handleCreateInactivityRule = () => {
    setSelectedInactivityRule(null);
    setIsInactivityRuleDialogOpen(true);
  };

  const handleEditInactivityRule = (rule: InactivityRule) => {
    setSelectedInactivityRule(rule);
    setIsInactivityRuleDialogOpen(true);
  };

  const handleSaveInactivityRule = async (ruleData: Partial<InactivityRule>) => {
    try {
      if (selectedInactivityRule) {
        // Atualizar regra existente
        const updatedRule = await automationService.updateInactivityRule(tenantId, selectedInactivityRule.id, ruleData);
        setInactivityRules(prev => prev.map(r => r.id === selectedInactivityRule.id ? updatedRule : r));
      } else {
        // Criar nova regra
        const newRule = await automationService.createInactivityRule(tenantId, ruleData as any);
        setInactivityRules(prev => [...prev, newRule]);
      }
      setIsInactivityRuleDialogOpen(false);
      setSelectedInactivityRule(null);
    } catch (error) {
      console.error('Erro ao salvar regra de inatividade:', error);
    }
  };

  const handleToggleInactivityRule = async (rule: InactivityRule) => {
    try {
      const updatedRule = await automationService.toggleInactivityRuleStatus(tenantId, rule.id, !rule.isActive);
      setInactivityRules(prev => prev.map(r => r.id === rule.id ? updatedRule : r));
    } catch (error) {
      console.error('Erro ao alterar status da regra de inatividade:', error);
    }
  };

  const handleDeleteInactivityRule = async (rule: InactivityRule) => {
    if (confirm('Tem certeza que deseja excluir esta regra de inatividade?')) {
      try {
        await automationService.deleteInactivityRule(tenantId, rule.id);
        setInactivityRules(prev => prev.filter(r => r.id !== rule.id));
      } catch (error) {
        console.error('Erro ao excluir regra de inatividade:', error);
      }
    }
  };

  const filteredCadences = cadences.filter(cadence =>
    cadence.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cadence.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredInactivityRules = inactivityRules.filter(rule =>
    rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rule.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCadenceTypeLabel = (type: CadenceType) => {
    switch (type) {
      case CadenceType.PROSPECTING: return 'Prospecção';
      case CadenceType.FOLLOW_UP: return 'Follow-up';
      case CadenceType.POST_MEETING: return 'Pós-Reunião';
      case CadenceType.CUSTOMER_SUCCESS: return 'Customer Success';
      case CadenceType.REACTIVATION: return 'Reativação';
      default: return 'Personalizada';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-500">Carregando cadências...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cadências e Régua de Inatividade</h1>
          <p className="text-gray-500">Crie sequências automatizadas de contato e reengajamento</p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={handleCreateCadence} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Nova Cadência
          </Button>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Cadências Ativas</p>
                <p className="text-2xl font-bold text-blue-600">
                  {cadences.filter(c => c.isActive).length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {cadences.length} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Leads em Cadência</p>
                <p className="text-2xl font-bold text-green-600">
                  {cadences.reduce((sum, c) => sum + (c.stats?.activeEnrollments || 0), 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {cadences.reduce((sum, c) => sum + (c.stats?.totalEnrolled || 0), 0)} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Taxa Resposta</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round(cadences.reduce((sum, c) => sum + (c.stats?.responseRate || 0), 0) / (cadences.length || 1) * 100)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Média de todas cadências
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Réguas Inatividade</p>
                <p className="text-2xl font-bold text-orange-600">
                  {inactivityRules.filter(r => r.isActive).length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {inactivityRules.length} total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
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
              placeholder="Buscar cadências e réguas..."
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
                    <TableHead>Passos</TableHead>
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
                          {getCadenceTypeLabel(cadence.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={cadence.isActive ? "default" : "secondary"}>
                          {cadence.isActive ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {cadence.steps.slice(0, 3).map((step, index) => {
                            let icon;
                            switch (step.type) {
                              case 'email': icon = <Mail className="h-4 w-4" />; break;
                              case 'whatsapp': icon = <MessageSquare className="h-4 w-4" />; break;
                              case 'task': icon = <Calendar className="h-4 w-4" />; break;
                              case 'call': icon = <Phone className="h-4 w-4" />; break;
                              case 'wait': icon = <Clock className="h-4 w-4" />; break;
                              default: icon = <Calendar className="h-4 w-4" />;
                            }
                            return (
                              <div key={step.id} className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-full">
                                {icon}
                              </div>
                            );
                          })}
                          {cadence.steps.length > 3 && (
                            <div className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-full">
                              <span className="text-xs">+{cadence.steps.length - 3}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{cadence.stats?.activeEnrollments || 0}</div>
                          <div className="text-sm text-gray-500">
                            {cadence.stats?.totalEnrolled || 0} total
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {Math.round((cadence.stats?.responseRate || 0) * 100)}%
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleCadence(cadence)}
                          >
                            {cadence.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditCadence(cadence)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCloneCadence(cadence)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCadence(cadence)}
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

        {/* Régua de Inatividade */}
        <TabsContent value="inactivity">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Régua de Inatividade
                </div>
                <Button onClick={handleCreateInactivityRule} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Régua
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {inactivityRules.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma régua de inatividade configurada
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Configure réguas automáticas para leads e clientes inativos
                  </p>
                  <Button onClick={handleCreateInactivityRule}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Régua
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Dias Inatividade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                      <TableHead className="w-[100px]">Opções</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInactivityRules.map((rule) => (
                      <TableRow key={rule.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{rule.name}</div>
                            <div className="text-sm text-gray-500">{rule.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {rule.entityType === 'lead' ? 'Lead' : 'Cliente'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{rule.inactivityDays} dias</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={rule.isActive ? "default" : "secondary"}>
                            {rule.isActive ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {rule.actions.map((action, index) => {
                              let icon;
                              switch (action.type) {
                                case 'email': icon = <Mail className="h-4 w-4" />; break;
                                case 'whatsapp': icon = <MessageSquare className="h-4 w-4" />; break;
                                case 'task': icon = <Calendar className="h-4 w-4" />; break;
                                default: icon = <Calendar className="h-4 w-4" />;
                              }
                              return (
                                <div key={action.id} className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-full">
                                  {icon}
                                </div>
                              );
                            })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleInactivityRule(rule)}
                            >
                              {rule.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditInactivityRule(rule)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteInactivityRule(rule)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance por Cadência</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cadences.slice(0, 5).map(cadence => (
                    <div key={cadence.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{cadence.name}</span>
                        <span className="text-sm text-gray-500">
                          {Math.round((cadence.stats?.responseRate || 0) * 100)}% resposta
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(cadence.stats?.responseRate || 0) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métricas de Engajamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">E-mails enviados</span>
                    <span className="text-lg font-bold text-blue-600">
                      {cadences.reduce((sum, c) => sum + (c.stats?.totalEnrolled || 0) * 2, 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">WhatsApp enviados</span>
                    <span className="text-lg font-bold text-green-600">
                      {cadences.reduce((sum, c) => sum + (c.stats?.totalEnrolled || 0), 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tarefas criadas</span>
                    <span className="text-lg font-bold text-orange-600">
                      {cadences.reduce((sum, c) => sum + (c.stats?.totalEnrolled || 0) * 0.5, 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tempo médio resposta</span>
                    <span className="text-lg font-bold text-gray-600">
                      {Math.round(cadences.reduce((sum, c) => sum + (c.stats?.avgCompletionTime || 0), 0) / (cadences.length || 1))} dias
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Cadence Builder Dialog */}
      <Dialog open={isBuilderOpen} onOpenChange={setIsBuilderOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0">
          <CadenceBuilder
            cadence={selectedCadence || undefined}
            onSave={handleSaveCadence}
          />
        </DialogContent>
      </Dialog>

      {/* Inactivity Rule Dialog */}
      <Dialog open={isInactivityRuleDialogOpen} onOpenChange={setIsInactivityRuleDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedInactivityRule ? 'Editar Régua de Inatividade' : 'Nova Régua de Inatividade'}
            </DialogTitle>
            <DialogDescription>
              Configure ações automáticas para leads e clientes inativos
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nome da régua *</Label>
                <Input
                  value={selectedInactivityRule?.name || ''}
                  onChange={(e) => setSelectedInactivityRule(prev => 
                    prev ? { ...prev, name: e.target.value } : null
                  )}
                  placeholder="Ex: Leads inativos 7 dias"
                />
              </div>
              
              <div>
                <Label>Tipo de entidade</Label>
                <Select 
                  value={selectedInactivityRule?.entityType || 'lead'} 
                  onValueChange={(value) => setSelectedInactivityRule(prev => 
                    prev ? { ...prev, entityType: value as any } : null
                  )}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lead">Lead</SelectItem>
                    <SelectItem value="client">Cliente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label>Descrição</Label>
              <Textarea
                value={selectedInactivityRule?.description || ''}
                onChange={(e) => setSelectedInactivityRule(prev => 
                  prev ? { ...prev, description: e.target.value } : null
                )}
                placeholder="Descreva o objetivo desta régua..."
                rows={2}
              />
            </div>
            
            <div>
              <Label>Dias de inatividade *</Label>
              <Input
                type="number"
                min="1"
                value={selectedInactivityRule?.inactivityDays || ''}
                onChange={(e) => setSelectedInactivityRule(prev => 
                  prev ? { ...prev, inactivityDays: parseInt(e.target.value) || 0 } : null
                )}
                placeholder="Ex: 7"
              />
              <p className="text-sm text-gray-500 mt-1">
                Disparar após X dias sem interação
              </p>
            </div>
            
            <div>
              <Label className="mb-2 block">Ações</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="action-email"
                    checked={selectedInactivityRule?.actions?.some(a => a.type === 'email') || false}
                    onChange={(e) => {
                      // Implementação simplificada
                    }}
                  />
                  <label htmlFor="action-email" className="text-sm">Enviar e-mail</label>
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="action-whatsapp"
                    checked={selectedInactivityRule?.actions?.some(a => a.type === 'whatsapp') || false}
                    onChange={(e) => {
                      // Implementação simplificada
                    }}
                  />
                  <label htmlFor="action-whatsapp" className="text-sm">Enviar WhatsApp</label>
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="action-task"
                    checked={selectedInactivityRule?.actions?.some(a => a.type === 'task') || false}
                    onChange={(e) => {
                      // Implementação simplificada
                    }}
                  />
                  <label htmlFor="action-task" className="text-sm">Criar tarefa</label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsInactivityRuleDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              // Implementação simplificada
              setIsInactivityRuleDialogOpen(false);
            }}>
              Salvar Régua
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CadenceEnhanced;

