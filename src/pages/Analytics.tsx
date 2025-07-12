import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  TrendingUp, 
  Users, 
  FileText, 
  Package, 
  Clock, 
  Target, 
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  RefreshCw,
  Download,
  Filter,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  Mail,
  Settings,
  Eye,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Cell,
  Area,
  AreaChart,
  FunnelChart,
  Funnel,
  LabelList,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

// Cores da paleta JT
const JT_COLORS = {
  primary: '#1E40AF',      // Azul Royal
  secondary: '#059669',    // Verde JT
  white: '#FFFFFF',        // Branco
  gray: '#6B7280',         // Cinza Chumbo
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6'
};

const CHART_COLORS = [JT_COLORS.primary, JT_COLORS.secondary, JT_COLORS.warning, JT_COLORS.danger, JT_COLORS.info, JT_COLORS.gray];

interface KPIData {
  leads_gerados: {
    hoje: number;
    semana: number;
    mes: number;
    variacao_percentual: number;
  };
  propostas_enviadas: {
    hoje: number;
    semana: number;
    mes: number;
    variacao_percentual: number;
  };
  leads_fechados: {
    hoje: number;
    semana: number;
    mes: number;
    variacao_percentual: number;
  };
  taxa_conversao_total: {
    valor: number;
    variacao_percentual: number;
  };
  produto_mais_vendido: {
    nome: string;
    vendas: number;
    percentual: number;
  };
  contrato_mais_recorrente: {
    produto: string;
    renovacoes: number;
    taxa_renovacao: number;
  };
  origem_melhor_desempenho: {
    canal: string;
    conversao: number;
    leads: number;
  };
}

interface DashboardData {
  funil_vendas: {
    etapas: Array<{
      nome: string;
      quantidade: number;
      percentual_conversao: number;
      tempo_medio_dias: number;
      cor: string;
    }>;
  };
  origem_leads: Array<{
    canal: string;
    quantidade: number;
    percentual: number;
    conversao: number;
  }>;
}

interface LeadsData {
  total_leads: number;
  leads_por_origem: Array<{
    origem: string;
    total: number;
    qualificados: number;
    convertidos: number;
    taxa_conversao: number;
    tempo_resposta_medio: number;
  }>;
  performance_responsaveis: Array<{
    nome: string;
    leads_atribuidos: number;
    conversoes: number;
    taxa_conversao: number;
    tempo_resposta_medio: number;
    score_performance: number;
  }>;
  dispersao_tempo_resposta: Array<{
    responsavel: string;
    tempo_min: number;
    tempo_max: number;
    media: number;
  }>;
  etapas_funil: Array<{
    etapa: string;
    quantidade: number;
    tempo_medio: number;
  }>;
}

interface ContratosData {
  total_contratos_ativos: number;
  total_contratos_cancelados: number;
  duracao_media_meses: number;
  contratos_por_categoria: Array<{
    categoria: string;
    quantidade: number;
    percentual: number;
  }>;
  ltv_estimado_por_produto: Array<{
    produto: string;
    ltv_score: number;
    contratos: number;
  }>;
  contratos_por_produto: Array<{
    produto: string;
    ativos: number;
    cancelados: number;
  }>;
  renovacoes_proximas: Array<{
    cliente: string;
    produto: string;
    dias_para_renovacao: number;
    probabilidade_renovacao: number;
    alerta: string;
  }>;
  contratos_por_canal: Array<{
    canal: string;
    contratos: number;
    percentual: number;
  }>;
}

interface ProdutosData {
  produtos_mais_vendidos: Array<{
    produto: string;
    vendas: number;
    percentual_participacao: number;
    crescimento_periodo: number;
    posicao_ranking: number;
  }>;
  comparativo_periodos: {
    periodo_atual: number;
    periodo_anterior: number;
    crescimento_percentual: number;
  };
  taxa_upsell: {
    clientes_com_1_produto: number;
    clientes_com_2_produtos: number;
    clientes_com_3_ou_mais: number;
    taxa_upsell_percentual: number;
  };
  produtos_por_origem: Array<{
    origem: string;
    produtos: Array<{
      produto: string;
      vendas: number;
    }>;
  }>;
}

interface CrescimentoData {
  crescimento_semanal: {
    leads_gerados: Array<{ semana: string; valor: number }>;
    propostas_enviadas: Array<{ semana: string; valor: number }>;
    contratos_fechados: Array<{ semana: string; valor: number }>;
  };
  crescimento_mensal: {
    leads_gerados: Array<{ mes: string; valor: number }>;
    propostas_enviadas: Array<{ mes: string; valor: number }>;
    contratos_fechados: Array<{ mes: string; valor: number }>;
  };
  crescimento_trimestral: {
    [key: string]: {
      leads: number;
      propostas: number;
      contratos: number;
    };
  };
  comparativo_periodos: {
    mes_atual_vs_anterior: {
      leads: number;
      propostas: number;
      contratos: number;
    };
    trimestre_atual_vs_anterior: {
      leads: number;
      propostas: number;
      contratos: number;
    };
  };
  sazonalidade: {
    melhor_mes_leads: string;
    melhor_mes_conversao: string;
    pior_mes_leads: string;
    tendencia_geral: string;
  };
}

interface InteligenciaData {
  ranking_responsaveis: Array<{
    nome: string;
    taxa_conversao: number;
    leads_convertidos: number;
    tempo_medio_conversao: number;
    score_performance: number;
    posicao: number;
  }>;
  gargalos_identificados: Array<{
    etapa: string;
    leads_parados: number;
    tempo_medio_parado: number;
    impacto: string;
    sugestao: string;
  }>;
  alertas_performance: Array<{
    tipo: string;
    etapa?: string;
    responsavel?: string;
    valor_atual: number;
    valor_esperado: number;
    severidade: string;
    acao_recomendada: string;
  }>;
  oportunidades_melhoria: Array<{
    area: string;
    impacto_potencial: string;
    esforco_implementacao: string;
    roi_estimado: number;
  }>;
}

const Analytics: React.FC = () => {
  const [kpis, setKpis] = useState<KPIData | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [leadsData, setLeadsData] = useState<LeadsData | null>(null);
  const [contratosData, setContratosData] = useState<ContratosData | null>(null);
  const [produtosData, setProdutosData] = useState<ProdutosData | null>(null);
  const [crescimentoData, setCrescimentoData] = useState<CrescimentoData | null>(null);
  const [inteligenciaData, setInteligenciaData] = useState<InteligenciaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [filters, setFilters] = useState({
    periodo: '30',
    origem: 'all',
    responsavel: 'all',
    produto: 'all'
  });

  useEffect(() => {
    loadAnalyticsData();
  }, [filters]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Carregar KPIs
      const kpisResponse = await fetch(`/api/analytics/kpis?periodo=${filters.periodo}`);
      const kpisData = await kpisResponse.json();
      setKpis(kpisData.kpis);

      // Carregar Dashboard
      const dashboardResponse = await fetch('/api/analytics/dashboard');
      const dashboardResult = await dashboardResponse.json();
      setDashboardData(dashboardResult);

      // Carregar dados de Leads
      const leadsResponse = await fetch(`/api/analytics/leads?periodo=${filters.periodo}&origem=${filters.origem}&responsavel=${filters.responsavel}`);
      const leadsResult = await leadsResponse.json();
      setLeadsData(leadsResult);

      // Carregar dados de Contratos
      const contratosResponse = await fetch('/api/analytics/contratos');
      const contratosResult = await contratosResponse.json();
      setContratosData(contratosResult);

      // Carregar dados de Produtos
      const produtosResponse = await fetch(`/api/analytics/produtos?periodo=${filters.periodo}`);
      const produtosResult = await produtosResponse.json();
      setProdutosData(produtosResult);

      // Carregar dados de Crescimento
      const crescimentoResponse = await fetch('/api/analytics/crescimento');
      const crescimentoResult = await crescimentoResponse.json();
      setCrescimentoData(crescimentoResult);

      // Carregar Inteligência de Performance
      const inteligenciaResponse = await fetch('/api/analytics/inteligencia');
      const inteligenciaResult = await inteligenciaResponse.json();
      setInteligenciaData(inteligenciaResult);

    } catch (error) {
      console.error('Erro ao carregar dados do Analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (tipo: string, modulo: string) => {
    try {
      const response = await fetch('/api/analytics/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tipo,
          modulo,
          periodo: filters.periodo
        })
      });
      const result = await response.json();
      
      if (result.url_download) {
        window.open(result.url_download, '_blank');
      }
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
    }
  };

  const getVariationIcon = (variation: number) => {
    if (variation > 0) return <ArrowUp className="h-4 w-4 text-green-500" />;
    if (variation < 0) return <ArrowDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getVariationColor = (variation: number) => {
    if (variation > 0) return 'text-green-500';
    if (variation < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'alta': return 'bg-red-100 text-red-800';
      case 'média': return 'bg-yellow-100 text-yellow-800';
      case 'baixa': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-lg">Carregando Analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">JT VOX Analytics</h1>
          <p className="text-gray-600">Plataforma de Performance Comercial</p>
        </div>
        <div className="flex space-x-2">
          <Select value={filters.periodo} onValueChange={(value) => setFilters({...filters, periodo: value})}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hoje">Hoje</SelectItem>
              <SelectItem value="7">7 dias</SelectItem>
              <SelectItem value="30">30 dias</SelectItem>
              <SelectItem value="90">Trimestre</SelectItem>
              <SelectItem value="365">Ano</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.origem} onValueChange={(value) => setFilters({...filters, origem: value})}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Todos os canais" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os canais</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="site">Site</SelectItem>
              <SelectItem value="indicacao">Indicação</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => loadAnalyticsData()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={() => handleExport('pdf', activeTab)} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* ⚙️ Painel de KPIs (Topo do Módulo) */}
      {kpis && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          <Card className="bg-white border-l-4 border-l-blue-600">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Leads Gerados</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-2xl font-bold text-gray-900">
                      {filters.periodo === 'hoje' ? kpis.leads_gerados.hoje : 
                       filters.periodo === '7' ? kpis.leads_gerados.semana : 
                       kpis.leads_gerados.mes}
                    </p>
                    {getVariationIcon(kpis.leads_gerados.variacao_percentual)}
                  </div>
                  <p className={`text-xs ${getVariationColor(kpis.leads_gerados.variacao_percentual)}`}>
                    {kpis.leads_gerados.variacao_percentual > 0 ? '+' : ''}{kpis.leads_gerados.variacao_percentual}% vs. período anterior
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-l-4 border-l-green-600">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Propostas Enviadas</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-2xl font-bold text-gray-900">
                      {filters.periodo === 'hoje' ? kpis.propostas_enviadas.hoje : 
                       filters.periodo === '7' ? kpis.propostas_enviadas.semana : 
                       kpis.propostas_enviadas.mes}
                    </p>
                    {getVariationIcon(kpis.propostas_enviadas.variacao_percentual)}
                  </div>
                  <p className={`text-xs ${getVariationColor(kpis.propostas_enviadas.variacao_percentual)}`}>
                    {kpis.propostas_enviadas.variacao_percentual > 0 ? '+' : ''}{kpis.propostas_enviadas.variacao_percentual}% vs. período anterior
                  </p>
                </div>
                <FileText className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-l-4 border-l-purple-600">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Leads Fechados</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-2xl font-bold text-gray-900">
                      {filters.periodo === 'hoje' ? kpis.leads_fechados.hoje : 
                       filters.periodo === '7' ? kpis.leads_fechados.semana : 
                       kpis.leads_fechados.mes}
                    </p>
                    {getVariationIcon(kpis.leads_fechados.variacao_percentual)}
                  </div>
                  <p className={`text-xs ${getVariationColor(kpis.leads_fechados.variacao_percentual)}`}>
                    {kpis.leads_fechados.variacao_percentual > 0 ? '+' : ''}{kpis.leads_fechados.variacao_percentual}% vs. período anterior
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-l-4 border-l-orange-600">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Taxa de Conversão</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-2xl font-bold text-gray-900">{kpis.taxa_conversao_total.valor}%</p>
                    {getVariationIcon(kpis.taxa_conversao_total.variacao_percentual)}
                  </div>
                  <p className={`text-xs ${getVariationColor(kpis.taxa_conversao_total.variacao_percentual)}`}>
                    {kpis.taxa_conversao_total.variacao_percentual > 0 ? '+' : ''}{kpis.taxa_conversao_total.variacao_percentual}% vs. período anterior
                  </p>
                </div>
                <Target className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-l-4 border-l-indigo-600">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Produto Mais Vendido</p>
                  <p className="text-lg font-bold text-gray-900">{kpis.produto_mais_vendido.nome}</p>
                  <p className="text-xs text-gray-500">
                    {kpis.produto_mais_vendido.vendas} vendas ({kpis.produto_mais_vendido.percentual}%)
                  </p>
                </div>
                <Package className="h-8 w-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-l-4 border-l-teal-600">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Contrato Mais Recorrente</p>
                  <p className="text-lg font-bold text-gray-900">{kpis.contrato_mais_recorrente.produto}</p>
                  <p className="text-xs text-gray-500">
                    {kpis.contrato_mais_recorrente.renovacoes} renovações ({kpis.contrato_mais_recorrente.taxa_renovacao}%)
                  </p>
                </div>
                <Activity className="h-8 w-8 text-teal-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-l-4 border-l-pink-600">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Origem com Melhor Desempenho</p>
                  <p className="text-lg font-bold text-gray-900">{kpis.origem_melhor_desempenho.canal}</p>
                  <p className="text-xs text-gray-500">
                    {kpis.origem_melhor_desempenho.conversao}% conversão ({kpis.origem_melhor_desempenho.leads} leads)
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-pink-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6 bg-white">
          <TabsTrigger value="dashboard" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <BarChart3 className="h-4 w-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="leads" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Users className="h-4 w-4 mr-2" />
            Leads
          </TabsTrigger>
          <TabsTrigger value="contratos" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <FileText className="h-4 w-4 mr-2" />
            Contratos
          </TabsTrigger>
          <TabsTrigger value="produtos" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Package className="h-4 w-4 mr-2" />
            Produtos
          </TabsTrigger>
          <TabsTrigger value="crescimento" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <LineChart className="h-4 w-4 mr-2" />
            Crescimento
          </TabsTrigger>
          <TabsTrigger value="inteligencia" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Activity className="h-4 w-4 mr-2" />
            Inteligência
          </TabsTrigger>
        </TabsList>

        {/* 📌 1. Dashboard Geral (Visão de Funil de Vendas) */}
        <TabsContent value="dashboard" className="space-y-6">
          {dashboardData && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Funil de Vendas */}
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center text-blue-900">
                      <Target className="h-5 w-5 mr-2" />
                      Funil de Vendas Interativo
                    </CardTitle>
                    <CardDescription>
                      Visualização completa do pipeline comercial com conversões por etapa
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {dashboardData.funil_vendas.etapas.map((etapa, index) => (
                        <div key={index} className="relative">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">{etapa.nome}</span>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" style={{ backgroundColor: etapa.cor, color: 'white' }}>
                                {etapa.quantidade}
                              </Badge>
                              <span className="text-sm text-gray-600">{etapa.percentual_conversao.toFixed(1)}%</span>
                            </div>
                          </div>
                          <Progress 
                            value={etapa.percentual_conversao} 
                            className="h-3"
                            style={{ backgroundColor: etapa.cor + '20' }}
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Tempo médio: {etapa.tempo_medio_dias} dias</span>
                            <span>{etapa.percentual_conversao.toFixed(1)}% conversão</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Origem dos Leads */}
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center text-blue-900">
                      <PieChart className="h-5 w-5 mr-2" />
                      Origem dos Leads
                    </CardTitle>
                    <CardDescription>
                      Distribuição e performance por canal de aquisição
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Pie
                          data={dashboardData.origem_leads}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="quantidade"
                          label={({ canal, percentual }) => `${canal}: ${percentual}%`}
                        >
                          {dashboardData.origem_leads.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                    <div className="mt-4 space-y-2">
                      {dashboardData.origem_leads.map((origem, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                            />
                            <span className="text-sm font-medium">{origem.canal}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold">{origem.quantidade} leads</div>
                            <div className="text-xs text-gray-500">{origem.conversao}% conversão</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* 👥 2. Leads (Indicadores e Performance) */}
        <TabsContent value="leads" className="space-y-6">
          {leadsData && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Performance por Origem */}
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center text-blue-900">
                      <Users className="h-5 w-5 mr-2" />
                      Performance por Origem
                    </CardTitle>
                    <CardDescription>
                      Análise detalhada de conversão por canal
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={leadsData.leads_por_origem}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="origem" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="total" fill={JT_COLORS.primary} name="Total" />
                        <Bar dataKey="convertidos" fill={JT_COLORS.secondary} name="Convertidos" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Ranking de Responsáveis */}
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center text-blue-900">
                      <Activity className="h-5 w-5 mr-2" />
                      Ranking de Responsáveis
                    </CardTitle>
                    <CardDescription>
                      Performance individual por taxa de conversão
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {leadsData.performance_responsaveis.map((responsavel, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{responsavel.nome}</div>
                              <div className="text-sm text-gray-500">
                                {responsavel.conversoes}/{responsavel.leads_atribuidos} leads
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-green-600">{responsavel.taxa_conversao}%</div>
                            <div className="text-xs text-gray-500">Score: {responsavel.score_performance}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Dispersão Tempo de Resposta */}
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center text-blue-900">
                    <Clock className="h-5 w-5 mr-2" />
                    Dispersão de Tempo de Resposta
                  </CardTitle>
                  <CardDescription>
                    Análise do tempo de primeiro contato por responsável
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={leadsData.dispersao_tempo_resposta}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="responsavel" />
                      <YAxis label={{ value: 'Minutos', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Bar dataKey="tempo_min" fill={JT_COLORS.secondary} name="Tempo Mínimo" />
                      <Bar dataKey="media" fill={JT_COLORS.primary} name="Tempo Médio" />
                      <Bar dataKey="tempo_max" fill={JT_COLORS.warning} name="Tempo Máximo" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* 📄 3. Contratos (Indicadores Comerciais) */}
        <TabsContent value="contratos" className="space-y-6">
          {contratosData && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white border-l-4 border-l-green-600">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Contratos Ativos</p>
                        <p className="text-3xl font-bold text-gray-900">{contratosData.total_contratos_ativos}</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border-l-4 border-l-red-600">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Contratos Cancelados</p>
                        <p className="text-3xl font-bold text-gray-900">{contratosData.total_contratos_cancelados}</p>
                      </div>
                      <XCircle className="h-8 w-8 text-red-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border-l-4 border-l-blue-600">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Duração Média</p>
                        <p className="text-3xl font-bold text-gray-900">{contratosData.duracao_media_meses}</p>
                        <p className="text-sm text-gray-500">meses</p>
                      </div>
                      <Clock className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* LTV por Produto */}
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center text-blue-900">
                      <Package className="h-5 w-5 mr-2" />
                      LTV Estimado por Produto
                    </CardTitle>
                    <CardDescription>
                      Score de valor de vida útil por produto (sem valores financeiros)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {contratosData.ltv_estimado_por_produto.map((produto, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-8 bg-blue-600 rounded"></div>
                            <div>
                              <div className="font-medium text-gray-900">{produto.produto}</div>
                              <div className="text-sm text-gray-500">{produto.contratos} contratos</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-blue-600">Score: {produto.ltv_score}</div>
                            <Progress value={produto.ltv_score * 10} className="w-20 h-2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Renovações Próximas */}
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center text-blue-900">
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      Renovações Próximas
                    </CardTitle>
                    <CardDescription>
                      Contratos que precisam de atenção para renovação
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {contratosData.renovacoes_proximas.map((renovacao, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium text-gray-900">{renovacao.cliente}</div>
                            <div className="text-sm text-gray-500">{renovacao.produto}</div>
                          </div>
                          <div className="text-right">
                            <Badge 
                              variant={renovacao.alerta === 'high' ? 'destructive' : 'secondary'}
                              className="mb-1"
                            >
                              {renovacao.dias_para_renovacao} dias
                            </Badge>
                            <div className="text-xs text-gray-500">
                              {renovacao.probabilidade_renovacao}% prob.
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Contratos por Canal */}
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center text-blue-900">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Contratos Originados por Canal
                  </CardTitle>
                  <CardDescription>
                    Análise de qual canal gera mais contratos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={contratosData.contratos_por_canal}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="canal" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="contratos" fill={JT_COLORS.primary} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* 📦 4. Produtos (Análise de Venda por Produto) */}
        <TabsContent value="produtos" className="space-y-6">
          {produtosData && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Ranking de Produtos */}
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center text-blue-900">
                      <Package className="h-5 w-5 mr-2" />
                      Produtos Mais Vendidos
                    </CardTitle>
                    <CardDescription>
                      Ranking por volume de vendas e participação
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {produtosData.produtos_mais_vendidos.map((produto, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                              {produto.posicao_ranking}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{produto.produto}</div>
                              <div className="text-sm text-gray-500">{produto.vendas} vendas</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-blue-600">{produto.percentual_participacao}%</div>
                            <div className={`text-xs ${produto.crescimento_periodo > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {produto.crescimento_periodo > 0 ? '+' : ''}{produto.crescimento_periodo}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Taxa de Upsell */}
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center text-blue-900">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      Taxa de Upsell
                    </CardTitle>
                    <CardDescription>
                      Análise de clientes que compraram múltiplos produtos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600">
                          {produtosData.taxa_upsell.taxa_upsell_percentual}%
                        </div>
                        <div className="text-sm text-gray-500">Taxa de Upsell Geral</div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">1 Produto</span>
                          <div className="flex items-center space-x-2">
                            <Progress value={60} className="w-20 h-2" />
                            <span className="text-sm font-medium">{produtosData.taxa_upsell.clientes_com_1_produto}</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">2 Produtos</span>
                          <div className="flex items-center space-x-2">
                            <Progress value={30} className="w-20 h-2" />
                            <span className="text-sm font-medium">{produtosData.taxa_upsell.clientes_com_2_produtos}</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">3+ Produtos</span>
                          <div className="flex items-center space-x-2">
                            <Progress value={15} className="w-20 h-2" />
                            <span className="text-sm font-medium">{produtosData.taxa_upsell.clientes_com_3_ou_mais}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Comparativo de Períodos */}
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center text-blue-900">
                    <LineChart className="h-5 w-5 mr-2" />
                    Comparativo por Período
                  </CardTitle>
                  <CardDescription>
                    Evolução das vendas de produtos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {produtosData.comparativo_periodos.periodo_atual}
                      </div>
                      <div className="text-sm text-gray-500">Período Atual</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-600">
                        {produtosData.comparativo_periodos.periodo_anterior}
                      </div>
                      <div className="text-sm text-gray-500">Período Anterior</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        +{produtosData.comparativo_periodos.crescimento_percentual}%
                      </div>
                      <div className="text-sm text-gray-500">Crescimento</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* 📈 5. Crescimento e Tendência Comercial */}
        <TabsContent value="crescimento" className="space-y-6">
          {crescimentoData && (
            <>
              {/* Crescimento Semanal */}
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center text-blue-900">
                    <LineChart className="h-5 w-5 mr-2" />
                    Crescimento Semanal
                  </CardTitle>
                  <CardDescription>
                    Evolução das métricas principais por semana
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <RechartsLineChart>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="semana" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="valor" 
                        data={crescimentoData.crescimento_semanal.leads_gerados}
                        stroke={JT_COLORS.primary} 
                        strokeWidth={2}
                        name="Leads Gerados"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="valor" 
                        data={crescimentoData.crescimento_semanal.propostas_enviadas}
                        stroke={JT_COLORS.secondary} 
                        strokeWidth={2}
                        name="Propostas Enviadas"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="valor" 
                        data={crescimentoData.crescimento_semanal.contratos_fechados}
                        stroke={JT_COLORS.warning} 
                        strokeWidth={2}
                        name="Contratos Fechados"
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Crescimento Mensal */}
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center text-blue-900">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Crescimento Mensal
                  </CardTitle>
                  <CardDescription>
                    Comparativo mensal das principais métricas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={crescimentoData.crescimento_mensal.leads_gerados}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mes" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="valor" fill={JT_COLORS.primary} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Sazonalidade */}
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center text-blue-900">
                    <Calendar className="h-5 w-5 mr-2" />
                    Análise de Sazonalidade
                  </CardTitle>
                  <CardDescription>
                    Identificação de padrões sazonais
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="font-bold text-blue-900">Melhor Mês (Leads)</div>
                      <div className="text-lg text-blue-600">{crescimentoData.sazonalidade.melhor_mes_leads}</div>
                    </div>
                    
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="font-bold text-green-900">Melhor Conversão</div>
                      <div className="text-lg text-green-600">{crescimentoData.sazonalidade.melhor_mes_conversao}</div>
                    </div>
                    
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="font-bold text-red-900">Pior Mês (Leads)</div>
                      <div className="text-lg text-red-600">{crescimentoData.sazonalidade.pior_mes_leads}</div>
                    </div>
                    
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="font-bold text-purple-900">Tendência Geral</div>
                      <div className="text-lg text-purple-600">{crescimentoData.sazonalidade.tendencia_geral}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* 🧠 7. Inteligência de Performance */}
        <TabsContent value="inteligencia" className="space-y-6">
          {inteligenciaData && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Ranking de Responsáveis */}
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center text-blue-900">
                      <Activity className="h-5 w-5 mr-2" />
                      Ranking de Performance
                    </CardTitle>
                    <CardDescription>
                      Melhores responsáveis por taxa de conversão
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {inteligenciaData.ranking_responsaveis.map((responsavel, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                              index === 0 ? 'bg-yellow-500' : 
                              index === 1 ? 'bg-gray-400' : 
                              index === 2 ? 'bg-orange-600' : 'bg-blue-600'
                            }`}>
                              {responsavel.posicao}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{responsavel.nome}</div>
                              <div className="text-sm text-gray-500">
                                {responsavel.leads_convertidos} conversões
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-green-600">{responsavel.taxa_conversao}%</div>
                            <div className="text-xs text-gray-500">
                              Score: {responsavel.score_performance}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Gargalos Identificados */}
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center text-blue-900">
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      Gargalos Identificados
                    </CardTitle>
                    <CardDescription>
                      Etapas com leads parados e sugestões de melhoria
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {inteligenciaData.gargalos_identificados.map((gargalo, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium text-gray-900">{gargalo.etapa}</div>
                            <Badge className={getSeverityColor(gargalo.impacto)}>
                              {gargalo.impacto}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            {gargalo.leads_parados} leads parados há {gargalo.tempo_medio_parado} dias em média
                          </div>
                          <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                            💡 {gargalo.sugestao}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Alertas de Performance */}
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center text-blue-900">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Alertas de Performance
                  </CardTitle>
                  <CardDescription>
                    Indicadores que precisam de atenção imediata
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {inteligenciaData.alertas_performance.map((alerta, index) => (
                      <div key={index} className="p-4 border-l-4 border-l-red-500 bg-red-50 rounded">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-red-900">{alerta.tipo}</div>
                          <Badge variant="destructive">{alerta.severidade}</Badge>
                        </div>
                        <div className="text-sm text-red-700 mb-2">
                          {alerta.etapa && `Etapa: ${alerta.etapa} - `}
                          {alerta.responsavel && `Responsável: ${alerta.responsavel} - `}
                          Atual: {alerta.valor_atual} | Esperado: {alerta.valor_esperado}
                        </div>
                        <div className="text-sm text-red-600 bg-red-100 p-2 rounded">
                          🎯 {alerta.acao_recomendada}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Oportunidades de Melhoria */}
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center text-blue-900">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Oportunidades de Melhoria
                  </CardTitle>
                  <CardDescription>
                    Áreas com maior potencial de ROI
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {inteligenciaData.oportunidades_melhoria.map((oportunidade, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-gray-900">{oportunidade.area}</div>
                          <div className="text-right">
                            <div className="font-bold text-green-600">ROI: {oportunidade.roi_estimado}x</div>
                          </div>
                        </div>
                        <div className="flex space-x-4 text-sm">
                          <div className="flex items-center space-x-1">
                            <span className="text-gray-500">Impacto:</span>
                            <Badge variant={oportunidade.impacto_potencial === 'Alto' ? 'default' : 'secondary'}>
                              {oportunidade.impacto_potencial}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className="text-gray-500">Esforço:</span>
                            <Badge variant={oportunidade.esforco_implementacao === 'Baixo' ? 'default' : 'secondary'}>
                              {oportunidade.esforco_implementacao}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* 📥 8. Exportação e Relatórios */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-900">
            <Download className="h-5 w-5 mr-2" />
            Exportação e Relatórios
          </CardTitle>
          <CardDescription>
            Exporte dados ou configure relatórios automáticos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button onClick={() => handleExport('csv', activeTab)} variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
            <Button onClick={() => handleExport('xlsx', activeTab)} variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Exportar Excel
            </Button>
            <Button onClick={() => handleExport('png', activeTab)} variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Exportar PNG
            </Button>
            <Button onClick={() => handleExport('pdf', activeTab)} variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Mail className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-900">Relatórios Automáticos</span>
            </div>
            <p className="text-sm text-blue-700 mb-3">
              Configure o envio automático de relatórios semanais por e-mail
            </p>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Configurar Agendamento
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;

