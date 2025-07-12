import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Send, 
  Download, 
  Edit, 
  Copy, 
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Calendar,
  DollarSign,
  FileCheck,
  RefreshCw,
  Settings,
  History,
  Mail,
  Phone
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Contract, 
  ContractTemplate, 
  ContractStatus, 
  ContractFilters,
  ContractStats,
  ContractSignatory,
  ContractSignatoryType,
  SignatoryStatus
} from '@/types/contracts';
import { contractsService } from '@/services/contractsService';

const ContractsEnhanced: React.FC = () => {
  const { user } = useAuth();
  const { currentTenant } = useTenant();
  const { toast } = useToast();

  // Estados principais
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [stats, setStats] = useState<ContractStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

  // Estados para criação/edição
  const [isCreating, setIsCreating] = useState(false);
  const [contractForm, setContractForm] = useState({
    templateId: '',
    title: '',
    description: '',
    clientId: '',
    leadId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    totalValue: 0,
    notes: '',
    signatories: [] as ContractSignatory[]
  });

  // Estados para filtros
  const [filters, setFilters] = useState<ContractFilters>({
    status: [],
    search: '',
    page: 1,
    limit: 10
  });

  // Estados para paginação
  const [totalContracts, setTotalContracts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!currentTenant) return;
    loadData();
  }, [currentTenant, filters]);

  const loadData = async () => {
    if (!currentTenant) return;

    try {
      setIsLoading(true);
      
      // Carregar contratos
      const contractsData = await contractsService.getContracts(currentTenant.id, filters);
      setContracts(contractsData.contracts);
      setTotalContracts(contractsData.total);

      // Carregar templates
      const templatesData = await contractsService.getTemplates(currentTenant.id);
      setTemplates(templatesData.filter(t => t.isActive));

      // Carregar estatísticas
      const statsData = await contractsService.getContractStats(currentTenant.id);
      setStats(statsData);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os contratos.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== CRIAÇÃO DE CONTRATO ====================

  const handleCreateContract = () => {
    setContractForm({
      templateId: '',
      title: '',
      description: '',
      clientId: '',
      leadId: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      totalValue: 0,
      notes: '',
      signatories: []
    });
    setIsCreating(true);
  };

  const handleSaveContract = async () => {
    if (!currentTenant || !user) return;

    try {
      const selectedTemplate = templates.find(t => t.id === contractForm.templateId);
      if (!selectedTemplate) {
        toast({
          title: 'Erro',
          description: 'Selecione um template válido.',
          variant: 'destructive',
        });
        return;
      }

      // Calcular data de término baseada na vigência do template
      const endDate = new Date(contractForm.startDate);
      endDate.setMonth(endDate.getMonth() + selectedTemplate.defaultDuration);

      const newContract = {
        templateId: contractForm.templateId,
        title: contractForm.title,
        description: contractForm.description,
        content: selectedTemplate.content, // Será processado no backend
        clientId: contractForm.clientId || undefined,
        leadId: contractForm.leadId || undefined,
        products: [], // Será preenchido posteriormente
        status: ContractStatus.DRAFT,
        version: 1,
        startDate: new Date(contractForm.startDate),
        endDate: endDate,
        totalValue: contractForm.totalValue,
        currency: 'BRL',
        signatories: contractForm.signatories,
        notes: contractForm.notes,
        createdBy: user.id
      };

      await contractsService.createContract(currentTenant.id, newContract);
      
      toast({
        title: 'Sucesso',
        description: 'Contrato criado com sucesso.',
      });

      setIsCreating(false);
      loadData();
    } catch (error) {
      console.error('Erro ao criar contrato:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o contrato.',
        variant: 'destructive',
      });
    }
  };

  // ==================== AÇÕES DE CONTRATO ====================

  const handleSendToD4Sign = async (contractId: string) => {
    if (!currentTenant) return;

    try {
      const result = await contractsService.sendToD4Sign(currentTenant.id, contractId);
      
      if (result.success) {
        toast({
          title: 'Sucesso',
          description: 'Contrato enviado para assinatura.',
        });
        loadData();
      } else {
        toast({
          title: 'Erro',
          description: result.message || 'Erro ao enviar contrato.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Erro ao enviar contrato:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar o contrato.',
        variant: 'destructive',
      });
    }
  };

  const handleDownloadPDF = async (contractId: string) => {
    if (!currentTenant) return;

    try {
      const pdfBlob = await contractsService.generateContractPDF(currentTenant.id, contractId);
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contrato-${contractId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erro ao baixar PDF:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível gerar o PDF.',
        variant: 'destructive',
      });
    }
  };

  const handleCreateAmendment = async (contractId: string) => {
    if (!currentTenant) return;

    const description = prompt('Descrição do aditivo:');
    if (!description) return;

    try {
      await contractsService.createAmendment(currentTenant.id, contractId, { description });
      toast({
        title: 'Sucesso',
        description: 'Aditivo criado com sucesso.',
      });
      loadData();
    } catch (error) {
      console.error('Erro ao criar aditivo:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o aditivo.',
        variant: 'destructive',
      });
    }
  };

  const handleRenewContract = async (contractId: string) => {
    if (!currentTenant) return;

    if (!confirm('Deseja renovar este contrato?')) return;

    try {
      await contractsService.renewContract(currentTenant.id, contractId, {});
      toast({
        title: 'Sucesso',
        description: 'Contrato renovado com sucesso.',
      });
      loadData();
    } catch (error) {
      console.error('Erro ao renovar contrato:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível renovar o contrato.',
        variant: 'destructive',
      });
    }
  };

  // ==================== UTILITÁRIOS ====================

  const getStatusBadge = (status: ContractStatus) => {
    const statusConfig = {
      [ContractStatus.DRAFT]: { label: 'Rascunho', variant: 'secondary' as const },
      [ContractStatus.PENDING_SIGNATURE]: { label: 'Aguardando Assinatura', variant: 'default' as const },
      [ContractStatus.PARTIALLY_SIGNED]: { label: 'Parcialmente Assinado', variant: 'default' as const },
      [ContractStatus.SIGNED]: { label: 'Assinado', variant: 'default' as const },
      [ContractStatus.ACTIVE]: { label: 'Ativo', variant: 'default' as const },
      [ContractStatus.EXPIRED]: { label: 'Expirado', variant: 'destructive' as const },
      [ContractStatus.CANCELLED]: { label: 'Cancelado', variant: 'destructive' as const },
      [ContractStatus.RENEWED]: { label: 'Renovado', variant: 'default' as const }
    };

    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getSignatoryStatusIcon = (status: SignatoryStatus) => {
    switch (status) {
      case SignatoryStatus.PENDING:
        return <Clock className="w-4 h-4 text-gray-400" />;
      case SignatoryStatus.SENT:
        return <Mail className="w-4 h-4 text-blue-500" />;
      case SignatoryStatus.VIEWED:
        return <Eye className="w-4 h-4 text-yellow-500" />;
      case SignatoryStatus.SIGNED:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case SignatoryStatus.REJECTED:
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-jt-blue"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-jt-blue" />
          <div>
            <h1 className="text-3xl font-bold text-jt-blue">Contratos</h1>
            <p className="text-gray-600">Gerencie contratos e assinaturas digitais</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.href = '/configuration'}>
            <Settings className="w-4 h-4 mr-2" />
            Configurações
          </Button>
          <Button onClick={handleCreateContract}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Contrato
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Contratos</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalContracts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contratos Ativos</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeContracts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aguardando Assinatura</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingSignature}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="search">Buscar</Label>
              <Input
                id="search"
                placeholder="Buscar por número, título ou cliente..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={filters.status?.[0] || ''}
                onValueChange={(value) => setFilters({ ...filters, status: value ? [value as ContractStatus] : [] })}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os status</SelectItem>
                  <SelectItem value={ContractStatus.DRAFT}>Rascunho</SelectItem>
                  <SelectItem value={ContractStatus.PENDING_SIGNATURE}>Aguardando Assinatura</SelectItem>
                  <SelectItem value={ContractStatus.SIGNED}>Assinado</SelectItem>
                  <SelectItem value={ContractStatus.ACTIVE}>Ativo</SelectItem>
                  <SelectItem value={ContractStatus.EXPIRED}>Expirado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={loadData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Contratos */}
      <div className="space-y-4">
        {contracts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum contrato encontrado</h3>
              <p className="text-gray-500 text-center mb-4">
                {templates.length === 0 
                  ? 'Configure templates de contrato primeiro nas configurações.'
                  : 'Crie seu primeiro contrato para começar a usar o módulo.'
                }
              </p>
              {templates.length > 0 && (
                <Button onClick={handleCreateContract}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeiro Contrato
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          contracts.map((contract) => (
            <Card key={contract.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {contract.contractNumber}
                      {getStatusBadge(contract.status)}
                    </CardTitle>
                    <CardDescription>{contract.title}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleDownloadPDF(contract.id)}>
                      <Download className="w-4 h-4" />
                    </Button>
                    {contract.status === ContractStatus.DRAFT && (
                      <Button size="sm" onClick={() => handleSendToD4Sign(contract.id)}>
                        <Send className="w-4 h-4" />
                      </Button>
                    )}
                    {contract.status === ContractStatus.ACTIVE && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => handleCreateAmendment(contract.id)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleRenewContract(contract.id)}>
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div>
                    <span className="text-sm text-gray-500">Valor:</span>
                    <div className="font-medium">{formatCurrency(contract.totalValue)}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Início:</span>
                    <div className="font-medium">{formatDate(contract.startDate)}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Término:</span>
                    <div className="font-medium">{formatDate(contract.endDate)}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Versão:</span>
                    <div className="font-medium">v{contract.version}</div>
                  </div>
                </div>

                {/* Signatários */}
                {contract.signatories.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Signatários:</h4>
                    <div className="space-y-2">
                      {contract.signatories.map((signatory) => (
                        <div key={signatory.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center gap-2">
                            {getSignatoryStatusIcon(signatory.status)}
                            <span className="font-medium">{signatory.name}</span>
                            <Badge variant="outline">{signatory.type}</Badge>
                          </div>
                          <div className="text-sm text-gray-500">
                            {signatory.signedAt ? formatDate(signatory.signedAt) : signatory.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal de Criação */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Novo Contrato</DialogTitle>
            <DialogDescription>
              Crie um novo contrato baseado em um template configurado
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="template">Template</Label>
              <Select
                value={contractForm.templateId}
                onValueChange={(value) => setContractForm({ ...contractForm, templateId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Título do Contrato</Label>
                <Input
                  id="title"
                  value={contractForm.title}
                  onChange={(e) => setContractForm({ ...contractForm, title: e.target.value })}
                  placeholder="Ex: Contrato de Prestação de Serviços"
                />
              </div>
              <div>
                <Label htmlFor="totalValue">Valor Total</Label>
                <Input
                  id="totalValue"
                  type="number"
                  value={contractForm.totalValue}
                  onChange={(e) => setContractForm({ ...contractForm, totalValue: parseFloat(e.target.value) })}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={contractForm.description}
                onChange={(e) => setContractForm({ ...contractForm, description: e.target.value })}
                placeholder="Descrição opcional do contrato"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Data de Início</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={contractForm.startDate}
                  onChange={(e) => setContractForm({ ...contractForm, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="clientId">Cliente (Opcional)</Label>
                <Input
                  id="clientId"
                  value={contractForm.clientId}
                  onChange={(e) => setContractForm({ ...contractForm, clientId: e.target.value })}
                  placeholder="ID do cliente"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={contractForm.notes}
                onChange={(e) => setContractForm({ ...contractForm, notes: e.target.value })}
                placeholder="Observações internas"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveContract}>
                Criar Contrato
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContractsEnhanced;

