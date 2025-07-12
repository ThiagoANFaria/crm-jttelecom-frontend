import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useTenant } from "@/contexts/TenantContext";
import { pabxService } from "@/services/pabxService";
import { PABXConfig, PABXConfigForm, PABXIntegrationStatus } from "@/types/telephony";
import { 
  Phone, 
  Settings, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  Server,
  Activity,
  Clock,
  Users,
  BarChart3
} from "lucide-react";

const TelephonyConfiguration: React.FC = () => {
  const [pabxConfig, setPabxConfig] = useState<PABXConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');
  const [integrationStatus, setIntegrationStatus] = useState<PABXIntegrationStatus | null>(null);
  const [showApiToken, setShowApiToken] = useState(false);
  
  const { toast } = useToast();
  const { currentTenant } = useTenant();

  // Estados para formulário
  const [configForm, setConfigForm] = useState<PABXConfigForm>({
    serverUrl: 'https://emnuvem.meupabxip.com.br',
    apiToken: '',
    tenantPABXId: '',
    autoRecord: true,
    recordingRetentionDays: 90,
    enableClickToCall: true,
    enableAutoAssociation: true,
    webhookUrl: ''
  });

  useEffect(() => {
    if (currentTenant) {
      loadConfiguration();
      loadIntegrationStatus();
    }
  }, [currentTenant]);

  const loadConfiguration = async () => {
    if (!currentTenant) return;

    setIsLoading(true);
    try {
      const config = await pabxService.getPABXConfig(currentTenant.id);
      if (config) {
        setPabxConfig(config);
        setConfigForm({
          serverUrl: config.serverUrl,
          apiToken: config.apiToken,
          tenantPABXId: config.tenantPABXId,
          autoRecord: true, // Valor padrão
          recordingRetentionDays: 90, // Valor padrão
          enableClickToCall: true, // Valor padrão
          enableAutoAssociation: true, // Valor padrão
          webhookUrl: `https://www.api.app.jttecnologia.com.br/telephony/webhook/${currentTenant.id}`
        });
      } else {
        // Configuração padrão para novo tenant
        setConfigForm(prev => ({
          ...prev,
          webhookUrl: `https://www.api.app.jttecnologia.com.br/telephony/webhook/${currentTenant.id}`
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar configuração do PABX",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadIntegrationStatus = async () => {
    if (!currentTenant) return;

    try {
      const status = await pabxService.getPABXStatus(currentTenant.id);
      setIntegrationStatus(status);
      setConnectionStatus(status.isConnected ? 'connected' : 'error');
    } catch (error) {
      console.error('Erro ao carregar status:', error);
    }
  };

  const testConnection = async () => {
    if (!currentTenant) return;

    setIsTesting(true);
    setConnectionStatus('unknown');
    try {
      const result = await pabxService.testPABXConnection(currentTenant.id);
      setConnectionStatus(result.success ? 'connected' : 'error');
      
      toast({
        title: result.success ? "Sucesso" : "Erro",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });

      if (result.success) {
        await loadIntegrationStatus();
      }
    } catch (error) {
      setConnectionStatus('error');
      toast({
        title: "Erro",
        description: "Erro ao testar conexão",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const saveConfiguration = async () => {
    if (!currentTenant) return;

    // Validar configuração
    const validation = pabxService.validatePABXConfig(configForm);
    if (!validation.isValid) {
      toast({
        title: "Erro de Validação",
        description: validation.errors.join(', '),
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const config = await pabxService.savePABXConfig(currentTenant.id, configForm);
      setPabxConfig(config);
      
      toast({
        title: "Sucesso",
        description: "Configuração PABX salva com sucesso",
      });

      // Testar conexão automaticamente após salvar
      await testConnection();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar configuração PABX",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado",
      description: `${label} copiado para a área de transferência`,
    });
  };

  const formatLastSync = (date: Date) => {
    return new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' }).format(
      Math.floor((date.getTime() - Date.now()) / (1000 * 60)),
      'minute'
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Carregando configurações...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configuração JT Vox PABX</h1>
          <p className="text-muted-foreground">
            Integração PABX em Nuvem - Tenant: {currentTenant?.name}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={testConnection}
            disabled={isTesting || !pabxConfig}
          >
            {isTesting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Testar Conexão
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Server className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">PABX</p>
                <p className="text-xs text-muted-foreground">
                  {pabxConfig ? 'Configurado' : 'Não configurado'}
                </p>
              </div>
              {pabxConfig && (
                <Badge variant={pabxConfig.isActive ? 'default' : 'secondary'}>
                  {pabxConfig.isActive ? 'Ativo' : 'Inativo'}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              {connectionStatus === 'connected' && <CheckCircle className="w-5 h-5 text-green-500" />}
              {connectionStatus === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
              {connectionStatus === 'unknown' && <AlertCircle className="w-5 h-5 text-gray-500" />}
              <div>
                <p className="text-sm font-medium">Conexão</p>
                <p className="text-xs text-muted-foreground">
                  {connectionStatus === 'connected' && 'Conectado'}
                  {connectionStatus === 'error' && 'Erro'}
                  {connectionStatus === 'unknown' && 'Não testado'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Chamadas Hoje</p>
                <p className="text-xs text-muted-foreground">
                  {integrationStatus?.callsToday || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Gravações</p>
                <p className="text-xs text-muted-foreground">
                  {integrationStatus?.recordingsToday || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status da Integração */}
      {integrationStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Status da Integração
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Status do Servidor</Label>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    integrationStatus.serverStatus === 'online' ? 'bg-green-500' :
                    integrationStatus.serverStatus === 'maintenance' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <span className="text-sm capitalize">{integrationStatus.serverStatus}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Última Sincronização</Label>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{formatLastSync(integrationStatus.lastSync)}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Versão da API</Label>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{integrationStatus.apiVersion}</Badge>
                </div>
              </div>
            </div>
            
            {integrationStatus.errorMessage && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{integrationStatus.errorMessage}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Configurações */}
      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList>
          <TabsTrigger value="basic">Configuração Básica</TabsTrigger>
          <TabsTrigger value="advanced">Configurações Avançadas</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        {/* Configuração Básica */}
        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configuração PABX
              </CardTitle>
              <CardDescription>
                Configure a integração com o PABX em nuvem da JT Telecom
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="serverUrl">URL do Servidor PABX</Label>
                  <Input
                    id="serverUrl"
                    placeholder="https://emnuvem.meupabxip.com.br"
                    value={configForm.serverUrl}
                    onChange={(e) => setConfigForm(prev => ({ ...prev, serverUrl: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    URL base da API do PABX em nuvem
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tenantPABXId">ID do Tenant no PABX</Label>
                  <Input
                    id="tenantPABXId"
                    placeholder="tenant_001"
                    value={configForm.tenantPABXId}
                    onChange={(e) => setConfigForm(prev => ({ ...prev, tenantPABXId: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Identificador único do tenant no sistema PABX
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiToken">Token da API</Label>
                <div className="flex gap-2">
                  <Input
                    id="apiToken"
                    type={showApiToken ? "text" : "password"}
                    placeholder="Token de autenticação da API PABX"
                    value={configForm.apiToken}
                    onChange={(e) => setConfigForm(prev => ({ ...prev, apiToken: e.target.value }))}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowApiToken(!showApiToken)}
                  >
                    {showApiToken ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Token fornecido pela JT Telecom para acesso à API
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableClickToCall"
                    checked={configForm.enableClickToCall}
                    onCheckedChange={(checked) => setConfigForm(prev => ({ ...prev, enableClickToCall: checked }))}
                  />
                  <Label htmlFor="enableClickToCall">Habilitar Click-to-Call</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="autoRecord"
                    checked={configForm.autoRecord}
                    onCheckedChange={(checked) => setConfigForm(prev => ({ ...prev, autoRecord: checked }))}
                  />
                  <Label htmlFor="autoRecord">Gravação Automática</Label>
                </div>
              </div>

              <Button 
                onClick={saveConfiguration}
                disabled={isSaving}
                className="w-full"
              >
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Salvar Configuração
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações Avançadas */}
        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Configurações Avançadas
              </CardTitle>
              <CardDescription>
                Configurações avançadas de gravação e associação automática
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recordingRetentionDays">Retenção de Gravações (dias)</Label>
                  <Input
                    id="recordingRetentionDays"
                    type="number"
                    min="1"
                    max="365"
                    value={configForm.recordingRetentionDays}
                    onChange={(e) => setConfigForm(prev => ({ ...prev, recordingRetentionDays: parseInt(e.target.value) }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Tempo de retenção das gravações (1-365 dias)
                  </p>
                </div>

                <div className="flex items-center space-x-2 mt-8">
                  <Switch
                    id="enableAutoAssociation"
                    checked={configForm.enableAutoAssociation}
                    onCheckedChange={(checked) => setConfigForm(prev => ({ ...prev, enableAutoAssociation: checked }))}
                  />
                  <Label htmlFor="enableAutoAssociation">Associação Automática de Leads</Label>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Associação Automática</h4>
                <p className="text-sm text-blue-800">
                  Quando habilitada, as chamadas serão automaticamente associadas aos leads com base no número de telefone.
                  Se não houver correspondência exata, o sistema tentará associar por similaridade ou CNPJ/CPF.
                </p>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-900 mb-2">Retenção de Gravações</h4>
                <p className="text-sm text-yellow-800">
                  As gravações são automaticamente removidas após o período configurado.
                  Recomendamos manter entre 30-90 dias para conformidade com LGPD.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Webhooks */}
        <TabsContent value="webhooks">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Configuração de Webhooks
              </CardTitle>
              <CardDescription>
                Configure webhooks para receber eventos em tempo real do PABX
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhookUrl">URL do Webhook</Label>
                <div className="flex gap-2">
                  <Input
                    id="webhookUrl"
                    value={configForm.webhookUrl}
                    onChange={(e) => setConfigForm(prev => ({ ...prev, webhookUrl: e.target.value }))}
                    readOnly
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(configForm.webhookUrl, 'URL do Webhook')}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  URL gerada automaticamente para este tenant
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Eventos Suportados</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• <strong>call.started</strong> - Chamada iniciada</li>
                  <li>• <strong>call.answered</strong> - Chamada atendida</li>
                  <li>• <strong>call.ended</strong> - Chamada finalizada</li>
                  <li>• <strong>recording.available</strong> - Gravação disponível</li>
                  <li>• <strong>call.transferred</strong> - Chamada transferida</li>
                  <li>• <strong>call.queued</strong> - Chamada na fila</li>
                </ul>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Configuração no PABX</h4>
                <p className="text-sm text-blue-800 mb-2">
                  Configure esta URL no seu PABX para receber eventos em tempo real:
                </p>
                <code className="text-xs bg-blue-100 p-2 rounded block">
                  {configForm.webhookUrl}
                </code>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Documentação */}
      <Card>
        <CardHeader>
          <CardTitle>Documentação da API</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Para mais informações sobre a integração com o PABX em nuvem, consulte a documentação oficial:
            </p>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('https://emnuvem.meupabxip.com.br/suite/api_doc.php', '_blank')}
              >
                📚 Documentação da API PABX
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <h4 className="font-medium mb-2">Recursos Disponíveis</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Histórico completo de chamadas</li>
                  <li>• Click-to-call integrado</li>
                  <li>• Gravações de chamadas</li>
                  <li>• Associação automática com leads</li>
                  <li>• Relatórios detalhados</li>
                  <li>• Webhooks em tempo real</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Segurança</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Isolamento completo por tenant</li>
                  <li>• Autenticação via token</li>
                  <li>• Criptografia de dados</li>
                  <li>• Logs de auditoria</li>
                  <li>• Conformidade com LGPD</li>
                  <li>• Backup automático</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TelephonyConfiguration;

