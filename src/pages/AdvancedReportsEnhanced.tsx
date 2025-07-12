import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileBarChart, 
  Download, 
  Filter, 
  Calendar,
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Eye
} from 'lucide-react';

const AdvancedReportsEnhanced: React.FC = () => {
  const [activeTab, setActiveTab] = useState('sales');
  const [dateRange, setDateRange] = useState('30d');

  const reportTabs = [
    {
      id: 'sales',
      title: 'Vendas',
      description: 'Relatórios de performance de vendas',
      icon: DollarSign
    },
    {
      id: 'leads',
      title: 'Leads',
      description: 'Análise de geração e conversão',
      icon: Users
    },
    {
      id: 'performance',
      title: 'Performance',
      description: 'Métricas de equipe e individual',
      icon: Target
    },
    {
      id: 'forecast',
      title: 'Previsões',
      description: 'Projeções e tendências',
      icon: TrendingUp
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <FileBarChart className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-blue-600">Relatórios Avançados</h1>
            <p className="text-gray-600">Análises detalhadas e insights estratégicos</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filtros
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {dateRange === '30d' ? 'Últimos 30 dias' : 'Período personalizado'}
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Métricas Resumo */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 245.890</div>
            <p className="text-xs text-muted-foreground">+12.5% em relação ao mês anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leads Convertidos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.234</div>
            <p className="text-xs text-muted-foreground">+8.2% em relação ao mês anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24.8%</div>
            <p className="text-xs text-muted-foreground">+2.1% em relação ao mês anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 1.890</div>
            <p className="text-xs text-muted-foreground">+5.4% em relação ao mês anterior</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Relatórios */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          {reportTabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
              <tab.icon className="w-4 h-4" />
              {tab.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {reportTabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <tab.icon className="w-6 h-6 text-blue-600" />
                  <div>
                    <CardTitle>{tab.title}</CardTitle>
                    <CardDescription>{tab.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-12 text-gray-500">
                    <FileBarChart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">Relatório de {tab.title}</h3>
                    <p>Dados detalhados e análises em desenvolvimento.</p>
                    <p className="text-sm mt-2">Em breve: gráficos interativos, exportação e filtros avançados.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Insights e Recomendações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-600" />
            Insights e Recomendações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-medium text-green-600">Oportunidades Identificadas</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Eye className="w-3 h-3 text-green-500" />
                  Aumento de 15% nas conversões via WhatsApp
                </li>
                <li className="flex items-center gap-2">
                  <Eye className="w-3 h-3 text-green-500" />
                  Leads de Instagram têm maior ticket médio
                </li>
                <li className="flex items-center gap-2">
                  <Eye className="w-3 h-3 text-green-500" />
                  Horário de pico: 14h às 17h
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-blue-600">Próximas Ações Sugeridas</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Eye className="w-3 h-3 text-blue-500" />
                  Intensificar campanhas no Instagram
                </li>
                <li className="flex items-center gap-2">
                  <Eye className="w-3 h-3 text-blue-500" />
                  Otimizar atendimento no horário de pico
                </li>
                <li className="flex items-center gap-2">
                  <Eye className="w-3 h-3 text-blue-500" />
                  Implementar automações via WhatsApp
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedReportsEnhanced;

