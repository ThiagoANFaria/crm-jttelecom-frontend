import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings, 
  FileText, 
  Key, 
  Hash, 
  Clock, 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Eye, 
  Save,
  TestTube,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import { useToast } from '@/hooks/use-toast';
import { 
  ContractTemplate, 
  D4SignConfig, 
  ContractNumberingConfig, 
  ContractSettings,
  TEMPLATE_SHORTCODES 
} from '@/types/contracts';
import { contractsService } from '@/services/contractsService';

const ContractConfiguration: React.FC = () => {
  const { user } = useAuth();
  const { currentTenant } = useTenant();
  const { toast } = useToast();

  // Estados para templates
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    description: '',
    content: '',
    defaultDuration: 12,
    autoRenewal: false,
    expirationAlert: 30
  });

  // Estados para D4Sign
  const [d4signConfig, setD4SignConfig] = useState<D4SignConfig | null>(null);
  const [d4signForm, setD4SignForm] = useState({
    apiKey: '',
    apiSecret: '',
    accountName: '',
    webhookUrl: '',
    isActive: true
  });
  const [isTestingD4Sign, setIsTestingD4Sign] = useState(false);

  // Estados para numeração
  const [numberingConfig, setNumberingConfig] = useState<ContractNumberingConfig | null>(null);
  const [numberingForm, setNumberingForm] = useState({
    prefix: 'CONT',
    tenantCode: '',
    resetYearly: true
  });

  // Estados para configurações gerais
  const [contractSettings, setContractSettings] = useState<ContractSettings | null>(null);
  const [settingsForm, setSettingsForm] = useState({
    defaultDuration: 12,
    defaultAutoRenewal: false,
    defaultExpirationAlert: 30,
    defaultCurrency: 'BRL',
    requireApproval: false
  });

  const [isLoading, setIsLoading] = useState(true);

  // Verificar se é admin
  const isAdmin = user?.role === 'admin' || user?.role === 'master';

  useEffect(() => {
    if (!currentTenant || !isAdmin) return;
    loadData();
  }, [currentTenant, isAdmin]);

  const loadData = async () => {
    if (!currentTenant) return;

    try {
      setIsLoading(true);
      
      // Carregar templates
      const templatesData = await contractsService.getTemplates(currentTenant.id);
      setTemplates(templatesData);

      // Carregar configuração D4Sign
      const d4signData = await contractsService.getD4SignConfig(currentTenant.id);
      if (d4signData) {
        setD4SignConfig(d4signData);
        setD4SignForm({
          apiKey: d4signData.apiKey,
          apiSecret: d4signData.apiSecret,
          accountName: d4signData.accountName,
          webhookUrl: d4signData.webhookUrl,
          isActive: d4signData.isActive
        });
      }

      // Carregar configuração de numeração
      const numberingData = await contractsService.getNumberingConfig(currentTenant.id);
      setNumberingConfig(numberingData);
      setNumberingForm({
        prefix: numberingData.prefix,
        tenantCode: numberingData.tenantCode,
        resetYearly: numberingData.resetYearly
      });

      // Carregar configurações gerais
      const settingsData = await contractsService.getContractSettings(currentTenant.id);
      setContractSettings(settingsData);
      setSettingsForm({
        defaultDuration: settingsData.defaultDuration,
        defaultAutoRenewal: settingsData.defaultAutoRenewal,
        defaultExpirationAlert: settingsData.defaultExpirationAlert,
        defaultCurrency: settingsData.defaultCurrency,
        requireApproval: settingsData.requireApproval
      });

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as configurações.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== TEMPLATES ====================

  const handleCreateTemplate = () => {
    setSelectedTemplate(null);
    setTemplateForm({
      name: '',
      description: '',
      content: '',
      defaultDuration: 12,
      autoRenewal: false,
      expirationAlert: 30
    });
    setIsEditingTemplate(true);
  };

  const handleEditTemplate = (template: ContractTemplate) => {
    setSelectedTemplate(template);
    setTemplateForm({
      name: template.name,
      description: template.description || '',
      content: template.content,
      defaultDuration: template.defaultDuration,
      autoRenewal: template.autoRenewal,
      expirationAlert: template.expirationAlert
    });
    setIsEditingTemplate(true);
  };

  const handleSaveTemplate = async () => {
    if (!currentTenant || !user) return;

    try {
      if (selectedTemplate) {
        // Atualizar template existente
        await contractsService.updateTemplate(currentTenant.id, selectedTemplate.id, templateForm);
        toast({
          title: 'Sucesso',
          description: 'Template atualizado com sucesso.',
        });
      } else {
        // Criar novo template
        await contractsService.createTemplate(currentTenant.id, {
          ...templateForm,
          isActive: true,
          createdBy: user.id,
          requiredSignatories: []
        });
        toast({
          title: 'Sucesso',
          description: 'Template criado com sucesso.',
        });
      }

      setIsEditingTemplate(false);
      loadData();
    } catch (error) {
      console.error('Erro ao salvar template:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o template.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!currentTenant) return;

    if (!confirm('Tem certeza que deseja excluir este template?')) return;

    try {
      await contractsService.deleteTemplate(currentTenant.id, templateId);
      toast({
        title: 'Sucesso',
        description: 'Template excluído com sucesso.',
      });
      loadData();
    } catch (error) {
      console.error('Erro ao excluir template:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o template.',
        variant: 'destructive',
      });
    }
  };

  const handleDuplicateTemplate = async (template: ContractTemplate) => {
    if (!currentTenant) return;

    const newName = prompt('Nome do novo template:', `${template.name} (Cópia)`);
    if (!newName) return;

    try {
      await contractsService.duplicateTemplate(currentTenant.id, template.id, newName);
      toast({
        title: 'Sucesso',
        description: 'Template duplicado com sucesso.',
      });
      loadData();
    } catch (error) {
      console.error('Erro ao duplicar template:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível duplicar o template.',
        variant: 'destructive',
      });
    }
  };

  // ==================== D4SIGN ====================

  const handleSaveD4SignConfig = async () => {
    if (!currentTenant) return;

    try {
      await contractsService.saveD4SignConfig(currentTenant.id, d4signForm);
      toast({
        title: 'Sucesso',
        description: 'Configuração D4Sign salva com sucesso.',
      });
      loadData();
    } catch (error) {
      console.error('Erro ao salvar configuração D4Sign:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar a configuração D4Sign.',
        variant: 'destructive',
      });
    }
  };

  const handleTestD4SignConnection = async () => {
    if (!currentTenant) return;

    try {
      setIsTestingD4Sign(true);
      const result = await contractsService.testD4SignConnection(currentTenant.id);
      
      toast({
        title: result.success ? 'Sucesso' : 'Erro',
        description: result.message,
        variant: result.success ? 'default' : 'destructive',
      });
    } catch (error) {
      console.error('Erro ao testar conexão D4Sign:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível testar a conexão.',
        variant: 'destructive',
      });
    } finally {
      setIsTestingD4Sign(false);
    }
  };

  // ==================== NUMERAÇÃO ====================

  const handleSaveNumberingConfig = async () => {
    if (!currentTenant) return;

    try {
      await contractsService.updateNumberingConfig(currentTenant.id, numberingForm);
      toast({
        title: 'Sucesso',
        description: 'Configuração de numeração salva com sucesso.',
      });
      loadData();
    } catch (error) {
      console.error('Erro ao salvar configuração de numeração:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar a configuração de numeração.',
        variant: 'destructive',
      });
    }
  };

  // ==================== CONFIGURAÇÕES GERAIS ====================

  const handleSaveSettings = async () => {
    if (!currentTenant) return;

    try {
      await contractsService.updateContractSettings(currentTenant.id, settingsForm);
      toast({
        title: 'Sucesso',
        description: 'Configurações salvas com sucesso.',
      });
      loadData();
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar as configurações.',
        variant: 'destructive',
      });
    }
  };

  // Verificar permissão
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Acesso negado. Apenas administradores podem acessar as configurações de contratos.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

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
      <div className="flex items-center gap-3">
        <Settings className="w-8 h-8 text-jt-blue" />
        <div>
          <h1 className="text-3xl font-bold text-jt-blue">Configuração de Contratos</h1>
          <p className="text-gray-600">Gerencie templates, integrações e configurações</p>
        </div>
      </div>

      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="d4sign">D4Sign</TabsTrigger>
          <TabsTrigger value="numbering">Numeração</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        {/* Templates */}
        <TabsContent value="templates" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Templates de Contrato</h2>
            <Button onClick={handleCreateTemplate}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Template
            </Button>
          </div>

          {isEditingTemplate ? (
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedTemplate ? 'Editar Template' : 'Novo Template'}
                </CardTitle>
                <CardDescription>
                  Configure o template com shortcodes para personalização automática
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome do Template</Label>
                    <Input
                      id="name"
                      value={templateForm.name}
                      onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                      placeholder="Ex: Contrato de Prestação de Serviços"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Input
                      id="description"
                      value={templateForm.description}
                      onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
                      placeholder="Descrição opcional"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="duration">Vigência Padrão (meses)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={templateForm.defaultDuration}
                      onChange={(e) => setTemplateForm({ ...templateForm, defaultDuration: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="alert">Alerta de Expiração (dias)</Label>
                    <Input
                      id="alert"
                      type="number"
                      value={templateForm.expirationAlert}
                      onChange={(e) => setTemplateForm({ ...templateForm, expirationAlert: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <Switch
                      id="autoRenewal"
                      checked={templateForm.autoRenewal}
                      onCheckedChange={(checked) => setTemplateForm({ ...templateForm, autoRenewal: checked })}
                    />
                    <Label htmlFor="autoRenewal">Renovação Automática</Label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="content">Conteúdo do Template</Label>
                  <Textarea
                    id="content"
                    value={templateForm.content}
                    onChange={(e) => setTemplateForm({ ...templateForm, content: e.target.value })}
                    placeholder="Digite o conteúdo do contrato usando os shortcodes disponíveis..."
                    className="min-h-[300px]"
                  />
                </div>

                {/* Shortcodes disponíveis */}
                <div>
                  <Label>Shortcodes Disponíveis</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {TEMPLATE_SHORTCODES.map((shortcode) => (
                      <Badge
                        key={shortcode.code}
                        variant="outline"
                        className="cursor-pointer hover:bg-gray-100"
                        onClick={() => {
                          const textarea = document.getElementById('content') as HTMLTextAreaElement;
                          if (textarea) {
                            const start = textarea.selectionStart;
                            const end = textarea.selectionEnd;
                            const newContent = templateForm.content.substring(0, start) + shortcode.code + templateForm.content.substring(end);
                            setTemplateForm({ ...templateForm, content: newContent });
                          }
                        }}
                      >
                        {shortcode.code}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSaveTemplate}>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Template
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditingTemplate(false)}>
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {templates.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <FileText className="w-12 h-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum template encontrado</h3>
                    <p className="text-gray-500 text-center mb-4">
                      Crie seu primeiro template de contrato para começar a usar o módulo.
                    </p>
                    <Button onClick={handleCreateTemplate}>
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Primeiro Template
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                templates.map((template) => (
                  <Card key={template.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {template.name}
                            {template.isActive ? (
                              <Badge variant="default">Ativo</Badge>
                            ) : (
                              <Badge variant="secondary">Inativo</Badge>
                            )}
                          </CardTitle>
                          <CardDescription>{template.description}</CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEditTemplate(template)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDuplicateTemplate(template)}>
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDeleteTemplate(template.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Vigência:</span> {template.defaultDuration} meses
                        </div>
                        <div>
                          <span className="font-medium">Renovação:</span> {template.autoRenewal ? 'Automática' : 'Manual'}
                        </div>
                        <div>
                          <span className="font-medium">Alerta:</span> {template.expirationAlert} dias
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </TabsContent>

        {/* D4Sign */}
        <TabsContent value="d4sign" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Configuração D4Sign
              </CardTitle>
              <CardDescription>
                Configure a integração com a D4Sign para assinatura digital de contratos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Para obter suas credenciais D4Sign, acesse: 
                  <a href="https://docapi.d4sign.com.br/docs/introdução-a-api" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                    Documentação Oficial da API D4Sign
                  </a>
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    value={d4signForm.apiKey}
                    onChange={(e) => setD4SignForm({ ...d4signForm, apiKey: e.target.value })}
                    placeholder="Sua API Key da D4Sign"
                  />
                </div>
                <div>
                  <Label htmlFor="apiSecret">API Secret</Label>
                  <Input
                    id="apiSecret"
                    type="password"
                    value={d4signForm.apiSecret}
                    onChange={(e) => setD4SignForm({ ...d4signForm, apiSecret: e.target.value })}
                    placeholder="Seu API Secret da D4Sign"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="accountName">Nome da Conta</Label>
                  <Input
                    id="accountName"
                    value={d4signForm.accountName}
                    onChange={(e) => setD4SignForm({ ...d4signForm, accountName: e.target.value })}
                    placeholder="Nome da sua conta D4Sign"
                  />
                </div>
                <div>
                  <Label htmlFor="webhookUrl">URL do Webhook</Label>
                  <Input
                    id="webhookUrl"
                    value={d4signForm.webhookUrl}
                    onChange={(e) => setD4SignForm({ ...d4signForm, webhookUrl: e.target.value })}
                    placeholder="https://www.api.app.jttecnologia.com.br/webhooks/d4sign"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={d4signForm.isActive}
                  onCheckedChange={(checked) => setD4SignForm({ ...d4signForm, isActive: checked })}
                />
                <Label htmlFor="isActive">Integração Ativa</Label>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveD4SignConfig}>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Configuração
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleTestD4SignConnection}
                  disabled={isTestingD4Sign}
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  {isTestingD4Sign ? 'Testando...' : 'Testar Conexão'}
                </Button>
              </div>

              {d4signConfig && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Configuração D4Sign salva e ativa. Última atualização: {new Date(d4signConfig.updatedAt).toLocaleString()}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Numeração */}
        <TabsContent value="numbering" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="w-5 h-5" />
                Configuração de Numeração
              </CardTitle>
              <CardDescription>
                Configure o formato de numeração automática dos contratos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="prefix">Prefixo</Label>
                  <Input
                    id="prefix"
                    value={numberingForm.prefix}
                    onChange={(e) => setNumberingForm({ ...numberingForm, prefix: e.target.value })}
                    placeholder="CONT"
                  />
                </div>
                <div>
                  <Label htmlFor="tenantCode">Código do Tenant</Label>
                  <Input
                    id="tenantCode"
                    value={numberingForm.tenantCode}
                    onChange={(e) => setNumberingForm({ ...numberingForm, tenantCode: e.target.value })}
                    placeholder="TENANT001"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="resetYearly"
                  checked={numberingForm.resetYearly}
                  onCheckedChange={(checked) => setNumberingForm({ ...numberingForm, resetYearly: checked })}
                />
                <Label htmlFor="resetYearly">Resetar numeração anualmente</Label>
              </div>

              {numberingConfig && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Formato atual: {numberingConfig.format}<br />
                    Próximo número: {numberingConfig.prefix}-{new Date().getFullYear()}-{numberingConfig.tenantCode}-{String(numberingConfig.lastNumber + 1).padStart(4, '0')}
                  </AlertDescription>
                </Alert>
              )}

              <Button onClick={handleSaveNumberingConfig}>
                <Save className="w-4 h-4 mr-2" />
                Salvar Configuração
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações Gerais */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Configurações Gerais
              </CardTitle>
              <CardDescription>
                Configure as opções padrão para novos contratos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="defaultDuration">Vigência Padrão (meses)</Label>
                  <Input
                    id="defaultDuration"
                    type="number"
                    value={settingsForm.defaultDuration}
                    onChange={(e) => setSettingsForm({ ...settingsForm, defaultDuration: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="defaultExpirationAlert">Alerta de Expiração (dias)</Label>
                  <Input
                    id="defaultExpirationAlert"
                    type="number"
                    value={settingsForm.defaultExpirationAlert}
                    onChange={(e) => setSettingsForm({ ...settingsForm, defaultExpirationAlert: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="defaultCurrency">Moeda Padrão</Label>
                  <Input
                    id="defaultCurrency"
                    value={settingsForm.defaultCurrency}
                    onChange={(e) => setSettingsForm({ ...settingsForm, defaultCurrency: e.target.value })}
                    placeholder="BRL"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="defaultAutoRenewal"
                    checked={settingsForm.defaultAutoRenewal}
                    onCheckedChange={(checked) => setSettingsForm({ ...settingsForm, defaultAutoRenewal: checked })}
                  />
                  <Label htmlFor="defaultAutoRenewal">Renovação Automática por Padrão</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="requireApproval"
                    checked={settingsForm.requireApproval}
                    onCheckedChange={(checked) => setSettingsForm({ ...settingsForm, requireApproval: checked })}
                  />
                  <Label htmlFor="requireApproval">Exigir Aprovação para Contratos</Label>
                </div>
              </div>

              <Button onClick={handleSaveSettings}>
                <Save className="w-4 h-4 mr-2" />
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContractConfiguration;

