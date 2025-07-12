import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  Activity, 
  BarChart3, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Download, 
  Filter, 
  Mail, 
  MessageSquare, 
  Phone, 
  PieChart as PieChartIcon, 
  RefreshCw, 
  Search, 
  Tag, 
  Users, 
  XCircle,
  AlertTriangle,
  ArrowUpRight,
  Zap
} from 'lucide-react';
import { automationService } from '@/services/automationService';

const AutomationDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [atRiskLeads, setAtRiskLeads] = useState<any[]>([]);
  
  // Mock tenant ID - em produção viria do contexto
  const tenantId = 'tenant_123';
  
  useEffect(() => {
    loadDashboardData();
  }, [dateRange]);
  
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Em produção, carregar do backend
      // const data = await automationService.getDashboardData(tenantId, dateRange);
      // setDashboardData(data);
      
      // Mock para demonstração
      setTimeout(() => {
        const mockData = generateMockData();
        setDashboardData(mockData);
        setAtRiskLeads(generateMockAtRiskLeads());
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      setLoading(false);
    }
  };
  
  const generateMockData = () => {
    // Dados para gráficos e métricas
    const automationExecutions = {
      total: 1247,
      success: 1089,
      failed: 158,
      byDay: [
        { date: '01/07', total: 156, success: 142, failed: 14 },
        { date: '02/07', total: 178, success: 165, failed: 13 },
        { date: '03/07', total: 187, success: 170, failed: 17 },
        { date: '04/07', total: 195, success: 172, failed: 23 },
        { date: '05/07', total: 167, success: 145, failed: 22 },
        { date: '06/07', total: 189, success: 160, failed: 29 },
        { date: '07/07', total: 175, success: 135, failed: 40 }
      ]
    };
    
    const channelMetrics = {
      email: {
        sent: 523,
        opened: 312,
        clicked: 187,
        openRate: 59.7,
        clickRate: 35.8
      },
      whatsapp: {
        sent: 412,
        delivered: 398,
        read: 356,
        replied: 203,
        deliveryRate: 96.6,
        readRate: 89.4,
        replyRate: 57.0
      },
      tasks: {
        created: 312,
        completed: 245,
        overdue: 67,
        completionRate: 78.5
      }
    };
    
    const automationTypes = [
      { name: 'Cadências', value: 523 },
      { name: 'Gatilhos', value: 412 },
      { name: 'Régua Inatividade', value: 189 },
      { name: 'Mautic', value: 123 }
    ];
    
    const leadMetrics = {
      total: 856,
      inAutomation: 423,
      completedAutomation: 312,
      stageChanges: 187,
      tagChanges: 245,
      byStage: [
        { name: 'Novo', value: 156 },
        { name: 'Qualificação', value: 178 },
        { name: 'Proposta', value: 187 },
        { name: 'Negociação', value: 195 },
        { name: 'Fechado', value: 140 }
      ]
    };
    
    const recentExecutions = [
      {
        id: '1',
        automationName: 'Cadência de Prospecção',
        entityName: 'João Silva',
        entityType: 'lead',
        eventType: 'email_sent',
        status: 'success',
        timestamp: new Date(Date.now() - 1000 * 60 * 30) // 30 minutos atrás
      },
      {
        id: '2',
        automationName: 'Régua de Inatividade',
        entityName: 'Maria Santos',
        entityType: 'lead',
        eventType: 'whatsapp_sent',
        status: 'success',
        timestamp: new Date(Date.now() - 1000 * 60 * 45) // 45 minutos atrás
      },
      {
        id: '3',
        automationName: 'Automação de Tag',
        entityName: 'Pedro Oliveira',
        entityType: 'lead',
        eventType: 'tag_added',
        status: 'success',
        timestamp: new Date(Date.now() - 1000 * 60 * 60) // 1 hora atrás
      },
      {
        id: '4',
        automationName: 'Cadência de Reativação',
        entityName: 'Ana Costa',
        entityType: 'client',
        eventType: 'email_sent',
        status: 'failed',
        timestamp: new Date(Date.now() - 1000 * 60 * 90) // 1.5 horas atrás
      },
      {
        id: '5',
        automationName: 'Automação de Etapa',
        entityName: 'Carlos Ferreira',
        entityType: 'lead',
        eventType: 'stage_changed',
        status: 'success',
        timestamp: new Date(Date.now() - 1000 * 60 * 120) // 2 horas atrás
      }
    ];
    
    return {
      automationExecutions,
      channelMetrics,
      automationTypes,
      leadMetrics,
      recentExecutions
    };
  };
  
  const generateMockAtRiskLeads = () => {
    return [
      {
        id: '1',
        name: 'João Silva',
        email: 'joao@example.com',
        phone: '(11) 99999-8888',
        stage: 'Qualificação',
        lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12), // 12 dias atrás
        riskScore: 85,
        riskReason: 'Sem interação há 12 dias'
      },
      {
        id: '2',
        name: 'Maria Santos',
        email: 'maria@example.com',
        phone: '(11) 99999-7777',
        stage: 'Proposta',
        lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8), // 8 dias atrás
        riskScore: 72,
        riskReason: 'Proposta não visualizada'
      },
      {
        id: '3',
        name: 'Pedro Oliveira',
        email: 'pedro@example.com',
        phone: '(11) 99999-6666',
        stage: 'Negociação',
        lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 dias atrás
        riskScore: 65,
        riskReason: 'Não respondeu última mensagem'
      },
      {
        id: '4',
        name: 'Ana Costa',
        email: 'ana@example.com',
        phone: '(11) 99999-5555',
        stage: 'Qualificação',
        lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), // 10 dias atrás
        riskScore: 78,
        riskReason: 'Sem interação há 10 dias'
      },
      {
        id: '5',
        name: 'Carlos Ferreira',
        email: 'carlos@example.com',
        phone: '(11) 99999-4444',
        stage: 'Proposta',
        lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 dias atrás
        riskScore: 68,
        riskReason: 'Não abriu e-mails recentes'
      }
    ];
  };
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };
  
  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case 'email_sent':
      case 'email_opened':
      case 'email_clicked':
        return <Mail className="h-4 w-4 text-green-600" />;
      case 'whatsapp_sent':
      case 'whatsapp_delivered':
      case 'whatsapp_read':
        return <MessageSquare className="h-4 w-4 text-green-600" />;
      case 'task_created':
      case 'task_completed':
        return <Calendar className="h-4 w-4 text-orange-600" />;
      case 'call_scheduled':
      case 'call_completed':
        return <Phone className="h-4 w-4 text-purple-600" />;
      case 'tag_added':
      case 'tag_removed':
        return <Tag className="h-4 w-4 text-indigo-600" />;
      case 'stage_changed':
        return <ArrowUpRight className="h-4 w-4 text-blue-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-orange-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
  
  if (loading || !dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-500">Carregando dashboard...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard de Automações</h1>
          <p className="text-gray-500">Monitoramento e métricas de automações e cadências</p>
        </div>
        
        <div className="flex gap-4">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
              <SelectItem value="year">Este ano</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={loadDashboardData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Automações Executadas</p>
                <p className="text-2xl font-bold text-blue-600">
                  {dashboardData.automationExecutions.total}
                </p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2 flex items-center text-xs">
              <div className="flex items-center text-green-600 mr-2">
                <CheckCircle className="h-3 w-3 mr-1" />
                <span>{dashboardData.automationExecutions.success} sucesso</span>
              </div>
              <div className="flex items-center text-red-600">
                <XCircle className="h-3 w-3 mr-1" />
                <span>{dashboardData.automationExecutions.failed} falha</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">E-mails Enviados</p>
                <p className="text-2xl font-bold text-green-600">
                  {dashboardData.channelMetrics.email.sent}
                </p>
              </div>
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Taxa de abertura: <span className="font-medium">{dashboardData.channelMetrics.email.openRate}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">WhatsApp Enviados</p>
                <p className="text-2xl font-bold text-green-600">
                  {dashboardData.channelMetrics.whatsapp.sent}
                </p>
              </div>
              <MessageSquare className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Taxa de leitura: <span className="font-medium">{dashboardData.channelMetrics.whatsapp.readRate}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Leads em Automação</p>
                <p className="text-2xl font-bold text-purple-600">
                  {dashboardData.leadMetrics.inAutomation}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {Math.round((dashboardData.leadMetrics.inAutomation / dashboardData.leadMetrics.total) * 100)}% do total de leads
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="channels" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Canais
          </TabsTrigger>
          <TabsTrigger value="leads" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Leads
          </TabsTrigger>
          <TabsTrigger value="executions" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Execuções
          </TabsTrigger>
        </TabsList>
        
        {/* Visão Geral */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Execuções por Dia</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={dashboardData.automationExecutions.byDay}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="success" name="Sucesso" stackId="a" fill="#4ade80" />
                      <Bar dataKey="failed" name="Falha" stackId="a" fill="#f87171" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Tipos de Automação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dashboardData.automationTypes}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {dashboardData.automationTypes.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Execuções Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Automação</TableHead>
                      <TableHead>Lead/Cliente</TableHead>
                      <TableHead>Evento</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data/Hora</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dashboardData.recentExecutions.map((execution: any) => (
                      <TableRow key={execution.id}>
                        <TableCell>{execution.automationName}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {execution.entityName}
                            <Badge variant="outline">
                              {execution.entityType === 'lead' ? 'Lead' : 'Cliente'}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getEventTypeIcon(execution.eventType)}
                            <span className="capitalize">
                              {execution.eventType.replace('_', ' ')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(execution.status)}
                            <Badge variant={execution.status === 'success' ? 'default' : 'destructive'}>
                              {execution.status === 'success' ? 'Sucesso' : 'Falha'}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>{formatDateTime(execution.timestamp)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Canais */}
        <TabsContent value="channels">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-green-600" />
                  E-mail
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-sm text-gray-500">Enviados</p>
                      <p className="text-2xl font-bold">{dashboardData.channelMetrics.email.sent}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-sm text-gray-500">Abertos</p>
                      <p className="text-2xl font-bold">{dashboardData.channelMetrics.email.opened}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-sm text-gray-500">Clicados</p>
                      <p className="text-2xl font-bold">{dashboardData.channelMetrics.email.clicked}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-sm text-gray-500">Taxa de Abertura</p>
                      <p className="text-2xl font-bold">{dashboardData.channelMetrics.email.openRate}%</p>
                    </div>
                  </div>
                  
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Abertos', value: dashboardData.channelMetrics.email.opened },
                            { name: 'Não Abertos', value: dashboardData.channelMetrics.email.sent - dashboardData.channelMetrics.email.opened }
                          ]}
                          cx="50%"
                          cy="50%"
                          outerRadius={60}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          <Cell fill="#4ade80" />
                          <Cell fill="#e5e7eb" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                  WhatsApp
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-sm text-gray-500">Enviados</p>
                      <p className="text-2xl font-bold">{dashboardData.channelMetrics.whatsapp.sent}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-sm text-gray-500">Entregues</p>
                      <p className="text-2xl font-bold">{dashboardData.channelMetrics.whatsapp.delivered}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-sm text-gray-500">Lidos</p>
                      <p className="text-2xl font-bold">{dashboardData.channelMetrics.whatsapp.read}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-sm text-gray-500">Respondidos</p>
                      <p className="text-2xl font-bold">{dashboardData.channelMetrics.whatsapp.replied}</p>
                    </div>
                  </div>
                  
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Lidos', value: dashboardData.channelMetrics.whatsapp.read },
                            { name: 'Entregues (não lidos)', value: dashboardData.channelMetrics.whatsapp.delivered - dashboardData.channelMetrics.whatsapp.read },
                            { name: 'Não entregues', value: dashboardData.channelMetrics.whatsapp.sent - dashboardData.channelMetrics.whatsapp.delivered }
                          ]}
                          cx="50%"
                          cy="50%"
                          outerRadius={60}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          <Cell fill="#4ade80" />
                          <Cell fill="#fbbf24" />
                          <Cell fill="#e5e7eb" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-orange-600" />
                  Tarefas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-sm text-gray-500">Criadas</p>
                      <p className="text-2xl font-bold">{dashboardData.channelMetrics.tasks.created}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-sm text-gray-500">Concluídas</p>
                      <p className="text-2xl font-bold">{dashboardData.channelMetrics.tasks.completed}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-sm text-gray-500">Atrasadas</p>
                      <p className="text-2xl font-bold">{dashboardData.channelMetrics.tasks.overdue}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-sm text-gray-500">Taxa de Conclusão</p>
                      <p className="text-2xl font-bold">{dashboardData.channelMetrics.tasks.completionRate}%</p>
                    </div>
                  </div>
                  
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Concluídas', value: dashboardData.channelMetrics.tasks.completed },
                            { name: 'Atrasadas', value: dashboardData.channelMetrics.tasks.overdue },
                            { name: 'Pendentes', value: dashboardData.channelMetrics.tasks.created - dashboardData.channelMetrics.tasks.completed - dashboardData.channelMetrics.tasks.overdue }
                          ]}
                          cx="50%"
                          cy="50%"
                          outerRadius={60}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          <Cell fill="#4ade80" />
                          <Cell fill="#f87171" />
                          <Cell fill="#fbbf24" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Leads */}
        <TabsContent value="leads">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Leads em Risco</CardTitle>
                <CardDescription>
                  Leads com alta probabilidade de perda que precisam de atenção
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    placeholder="Buscar leads..."
                    className="pl-10 mb-4"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lead</TableHead>
                      <TableHead>Etapa</TableHead>
                      <TableHead>Última Atividade</TableHead>
                      <TableHead>Risco</TableHead>
                      <TableHead>Motivo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {atRiskLeads
                      .filter(lead => 
                        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        lead.email.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map(lead => (
                        <TableRow key={lead.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{lead.name}</div>
                              <div className="text-sm text-gray-500">{lead.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{lead.stage}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {formatDate(lead.lastActivity)}
                              <div className="text-gray-500">
                                {Math.round((Date.now() - lead.lastActivity.getTime()) / (1000 * 60 * 60 * 24))} dias atrás
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div 
                                className={`w-2 h-2 rounded-full ${
                                  lead.riskScore >= 80 ? 'bg-red-500' : 
                                  lead.riskScore >= 60 ? 'bg-orange-500' : 'bg-yellow-500'
                                }`}
                              />
                              <span>{lead.riskScore}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-orange-500" />
                              {lead.riskReason}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Etapa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={dashboardData.leadMetrics.byStage}
                      margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Leads em Automação:</span>
                    <span className="font-medium">{dashboardData.leadMetrics.inAutomation}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Completaram Automação:</span>
                    <span className="font-medium">{dashboardData.leadMetrics.completedAutomation}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Mudanças de Etapa:</span>
                    <span className="font-medium">{dashboardData.leadMetrics.stageChanges}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Mudanças de Tag:</span>
                    <span className="font-medium">{dashboardData.leadMetrics.tagChanges}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Execuções */}
        <TabsContent value="executions">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Execuções de Automação</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtros
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">Total</p>
                          <p className="text-2xl font-bold">
                            {dashboardData.automationExecutions.total}
                          </p>
                        </div>
                        <Activity className="h-6 w-6 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">Sucesso</p>
                          <p className="text-2xl font-bold text-green-600">
                            {dashboardData.automationExecutions.success}
                          </p>
                        </div>
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">Falha</p>
                          <p className="text-2xl font-bold text-red-600">
                            {dashboardData.automationExecutions.failed}
                          </p>
                        </div>
                        <XCircle className="h-6 w-6 text-red-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={dashboardData.automationExecutions.byDay}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="total" name="Total" stroke="#6366f1" strokeWidth={2} />
                      <Line type="monotone" dataKey="success" name="Sucesso" stroke="#4ade80" strokeWidth={2} />
                      <Line type="monotone" dataKey="failed" name="Falha" stroke="#f87171" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4">Execuções por Tipo</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Sucesso</TableHead>
                        <TableHead>Falha</TableHead>
                        <TableHead>Taxa de Sucesso</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-green-600" />
                            E-mail
                          </div>
                        </TableCell>
                        <TableCell>{dashboardData.channelMetrics.email.sent}</TableCell>
                        <TableCell>{dashboardData.channelMetrics.email.sent - 25}</TableCell>
                        <TableCell>25</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-green-600 rounded-full" 
                                style={{ width: `${((dashboardData.channelMetrics.email.sent - 25) / dashboardData.channelMetrics.email.sent) * 100}%` }}
                              />
                            </div>
                            <span>{Math.round(((dashboardData.channelMetrics.email.sent - 25) / dashboardData.channelMetrics.email.sent) * 100)}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                      
                      <TableRow>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-green-600" />
                            WhatsApp
                          </div>
                        </TableCell>
                        <TableCell>{dashboardData.channelMetrics.whatsapp.sent}</TableCell>
                        <TableCell>{dashboardData.channelMetrics.whatsapp.delivered}</TableCell>
                        <TableCell>{dashboardData.channelMetrics.whatsapp.sent - dashboardData.channelMetrics.whatsapp.delivered}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-green-600 rounded-full" 
                                style={{ width: `${(dashboardData.channelMetrics.whatsapp.delivered / dashboardData.channelMetrics.whatsapp.sent) * 100}%` }}
                              />
                            </div>
                            <span>{Math.round((dashboardData.channelMetrics.whatsapp.delivered / dashboardData.channelMetrics.whatsapp.sent) * 100)}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                      
                      <TableRow>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-orange-600" />
                            Tarefas
                          </div>
                        </TableCell>
                        <TableCell>{dashboardData.channelMetrics.tasks.created}</TableCell>
                        <TableCell>{dashboardData.channelMetrics.tasks.created - 15}</TableCell>
                        <TableCell>15</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-green-600 rounded-full" 
                                style={{ width: `${((dashboardData.channelMetrics.tasks.created - 15) / dashboardData.channelMetrics.tasks.created) * 100}%` }}
                              />
                            </div>
                            <span>{Math.round(((dashboardData.channelMetrics.tasks.created - 15) / dashboardData.channelMetrics.tasks.created) * 100)}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                      
                      <TableRow>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Tag className="h-4 w-4 text-indigo-600" />
                            Tags
                          </div>
                        </TableCell>
                        <TableCell>245</TableCell>
                        <TableCell>245</TableCell>
                        <TableCell>0</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-green-600 rounded-full" 
                                style={{ width: '100%' }}
                              />
                            </div>
                            <span>100%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AutomationDashboard;

