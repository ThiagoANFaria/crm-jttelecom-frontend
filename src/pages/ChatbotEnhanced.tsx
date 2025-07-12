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
import { smartbotService } from "@/services/smartbotService";
import { SmartbotConfig, SSOConfig } from "@/types/chatbot";
import { 
  MessageSquare, 
  ExternalLink, 
  Settings, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Copy,
  RefreshCw
} from "lucide-react";

const ChatbotEnhanced: React.FC = () => {
  const [smartbotConfig, setSmartbotConfig] = useState<SmartbotConfig | null>(null);
  const [ssoConfig, setSsoConfig] = useState<SSOConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');
  const [showApiToken, setShowApiToken] = useState(false);
  const [showJwtSecret, setShowJwtSecret] = useState(false);
  
  const { toast } = useToast();
  const { currentTenant } = useTenant();

  // Estados para formulários
  const [smartbotForm, setSmartbotForm] = useState({
    smartbotUrl: '',
    apiToken: '',
    webhookUrl: '',
    isActive: true
  });

  const [ssoForm, setSsoForm] = useState({
    jwtSecret: '',
    tokenExpirationMinutes: 60,
    smartbotRedirectUrl: '',
    openInNewTab: true
  });

  useEffect(() => {
    if (currentTenant) {
      loadConfigurations();
    }
  }, [currentTenant]);

  const loadConfigurations = async () => {
    if (!currentTenant) return;

    setIsLoading(true);
    try {
      // Carregar configuração Smartbot
      const smartbotConf = await smartbotService.getSmartbotConfig(currentTenant.id);
      if (smartbotConf) {
        setSmartbotConfig(smartbotConf);
        setSmartbotForm({
          smartbotUrl: smartbotConf.smartbotUrl,
          apiToken: smartbotConf.apiToken,
          webhookUrl: smartbotConf.webhookUrl,
          isActive: smartbotConf.isActive
        });
      }

      // Carregar configuração SSO
      const ssoConf = await smartbotService.getSSOConfig(currentTenant.id);
      if (ssoConf) {
        setSsoConfig(ssoConf);
        setSsoForm({
          jwtSecret: ssoConf.jwtSecret,
          tokenExpirationMinutes: ssoConf.tokenExpirationMinutes,
          smartbotRedirectUrl: ssoConf.smartbotRedirectUrl,
          openInNewTab: ssoConf.openInNewTab
        });
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar configurações do Chatbot",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async () => {
    if (!currentTenant) return;

    setConnectionStatus('unknown');
    try {
      const result = await smartbotService.testSmartbotConnection(currentTenant.id);
      setConnectionStatus(result.success ? 'connected' : 'error');
      
      toast({
        title: result.success ? "Sucesso" : "Erro",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
    } catch (error) {
      setConnectionStatus('error');
      toast({
        title: "Erro",
        description: "Erro ao testar conexão",
        variant: "destructive",
      });
    }
  };

  const saveSmartbotConfig = async () => {
    if (!currentTenant) return;

    setIsSaving(true);
    try {
      const config = await smartbotService.saveSmartbotConfig(currentTenant.id, smartbotForm);
      setSmartbotConfig(config);
      
      toast({
        title: "Sucesso",
        description: "Configuração Smartbot salva com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar configuração Smartbot",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const saveSSOConfig = async () => {
    if (!currentTenant) return;

    setIsSaving(true);
    try {
      const config = await smartbotService.saveSSOConfig(currentTenant.id, ssoForm);
      setSsoConfig(config);
      
      toast({
        title: "Sucesso",
        description: "Configuração SSO salva com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar configuração SSO",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const redirectToSmartbot = async () => {
    if (!currentTenant || !ssoConfig) {
      toast({
        title: "Erro",
        description: "Configure o SSO antes de acessar o Smartbot",
        variant: "destructive",
      });
      return;
    }

    setIsRedirecting(true);
    try {
      // Obter URL de redirecionamento com token SSO
      const redirectUrl = await smartbotService.getSmartbotRedirectUrl(currentTenant.id);
      
      if (ssoConfig.openInNewTab) {
        // Abrir em nova aba
        window.open(redirectUrl, '_blank', 'noopener,noreferrer');
      } else {
        // Redirecionar na mesma aba
        window.location.href = redirectUrl;
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao acessar Smartbot",
        variant: "destructive",
      });
    } finally {
      setIsRedirecting(false);
    }
  };

  const generateJwtSecret = () => {
    const secret = btoa(Math.random().toString(36).substring(2) + Date.now().toString(36));
    setSsoForm(prev => ({ ...prev, jwtSecret: secret }));
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado",
      description: `${label} copiado para a área de transferência`,
    });
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
          <h1 className="text-3xl font-bold">Chatbot</h1>
          <p className="text-muted-foreground">
            Integração com Smartbot via SSO - Tenant: {currentTenant?.name}
          </p>
        </div>
        
        {smartbotConfig && ssoConfig && (
          <Button 
            onClick={redirectToSmartbot}
            disabled={isRedirecting}
            size="lg"
            className="bg-green-600 hover:bg-green-700"
          >
            {isRedirecting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <ExternalLink className="w-4 h-4 mr-2" />
            )}
            Acessar Smartbot
          </Button>
        )}
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Smartbot</p>
                <p className="text-xs text-muted-foreground">
                  {smartbotConfig ? 'Configurado' : 'Não configurado'}
                </p>
              </div>
              {smartbotConfig && (
                <Badge variant={smartbotConfig.isActive ? 'default' : 'secondary'}>
                  {smartbotConfig.isActive ? 'Ativo' : 'Inativo'}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">SSO</p>
                <p className="text-xs text-muted-foreground">
                  {ssoConfig ? 'Configurado' : 'Não configurado'}
                </p>
              </div>
              {ssoConfig && (
                <Badge variant="default">
                  JWT
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
              <Button
                variant="ghost"
                size="sm"
                onClick={testConnection}
                disabled={!smartbotConfig}
              >
                <RefreshCw className="w-3 h-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configurações */}
      <Tabs defaultValue="smartbot" className="space-y-4">
        <TabsList>
          <TabsTrigger value="smartbot">Configuração Smartbot</TabsTrigger>
          <TabsTrigger value="sso">Configuração SSO</TabsTrigger>
        </TabsList>

        {/* Configuração Smartbot */}
        <TabsContent value="smartbot">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configuração Smartbot
              </CardTitle>
              <CardDescription>
                Configure a integração com a API do Smartbot para esta tenant
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smartbotUrl">URL do Smartbot</Label>
                  <Input
                    id="smartbotUrl"
                    placeholder="https://app.smartbot.jttecnologia.com.br"
                    value={smartbotForm.smartbotUrl}
                    onChange={(e) => setSmartbotForm(prev => ({ ...prev, smartbotUrl: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhookUrl">URL do Webhook</Label>
                  <div className="flex gap-2">
                    <Input
                      id="webhookUrl"
                      placeholder="https://www.api.app.jttecnologia.com.br/chatbot/webhook"
                      value={smartbotForm.webhookUrl}
                      onChange={(e) => setSmartbotForm(prev => ({ ...prev, webhookUrl: e.target.value }))}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(smartbotForm.webhookUrl, 'URL do Webhook')}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiToken">Token da API</Label>
                <div className="flex gap-2">
                  <Input
                    id="apiToken"
                    type={showApiToken ? "text" : "password"}
                    placeholder="Token gerado individualmente para cada canal"
                    value={smartbotForm.apiToken}
                    onChange={(e) => setSmartbotForm(prev => ({ ...prev, apiToken: e.target.value }))}
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
                  Token obtido na configuração do canal no Smartbot
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={smartbotForm.isActive}
                  onCheckedChange={(checked) => setSmartbotForm(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="isActive">Ativar integração</Label>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={saveSmartbotConfig}
                  disabled={isSaving}
                >
                  {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Salvar Configuração
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={testConnection}
                  disabled={!smartbotForm.apiToken}
                >
                  Testar Conexão
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuração SSO */}
        <TabsContent value="sso">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Configuração SSO (Single Sign-On)
              </CardTitle>
              <CardDescription>
                Configure o login automático com JWT para redirecionamento seguro
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smartbotRedirectUrl">URL de Redirecionamento</Label>
                  <Input
                    id="smartbotRedirectUrl"
                    placeholder="https://smartbot.tenant.com/sso"
                    value={ssoForm.smartbotRedirectUrl}
                    onChange={(e) => setSsoForm(prev => ({ ...prev, smartbotRedirectUrl: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tokenExpiration">Expiração do Token (minutos)</Label>
                  <Input
                    id="tokenExpiration"
                    type="number"
                    min="5"
                    max="1440"
                    value={ssoForm.tokenExpirationMinutes}
                    onChange={(e) => setSsoForm(prev => ({ ...prev, tokenExpirationMinutes: parseInt(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jwtSecret">Chave Secreta JWT</Label>
                <div className="flex gap-2">
                  <Input
                    id="jwtSecret"
                    type={showJwtSecret ? "text" : "password"}
                    placeholder="Chave secreta para assinar tokens JWT"
                    value={ssoForm.jwtSecret}
                    onChange={(e) => setSsoForm(prev => ({ ...prev, jwtSecret: e.target.value }))}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowJwtSecret(!showJwtSecret)}
                  >
                    {showJwtSecret ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateJwtSecret}
                  >
                    <RefreshCw className="w-3 h-3" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Chave usada para assinar e validar tokens JWT
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="openInNewTab"
                  checked={ssoForm.openInNewTab}
                  onCheckedChange={(checked) => setSsoForm(prev => ({ ...prev, openInNewTab: checked }))}
                />
                <Label htmlFor="openInNewTab">Abrir em nova aba</Label>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Estrutura do Token JWT:</h4>
                <pre className="text-xs text-blue-800 bg-blue-100 p-2 rounded">
{`{
  "user_id": "12345",
  "tenant_id": "${currentTenant?.id || 'tenant_001'}",
  "name": "Nome do Usuário",
  "role": "admin",
  "exp": 1739872312
}`}
                </pre>
              </div>

              <Button 
                onClick={saveSSOConfig}
                disabled={isSaving}
              >
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Salvar Configuração SSO
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Instruções */}
      <Card>
        <CardHeader>
          <CardTitle>Como Funciona</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">1. Configuração Smartbot</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Configure a URL e token da API</li>
                <li>• Defina o webhook para receber atualizações</li>
                <li>• Teste a conexão antes de ativar</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">2. Configuração SSO</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Gere uma chave secreta JWT segura</li>
                <li>• Configure a URL de redirecionamento</li>
                <li>• Defina o tempo de expiração do token</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">3. Acesso ao Smartbot</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Clique em "Acessar Smartbot"</li>
                <li>• Login automático via token JWT</li>
                <li>• Isolamento completo por tenant</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">4. Segurança</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Tokens com expiração automática</li>
                <li>• Isolamento absoluto entre tenants</li>
                <li>• Validação de assinatura JWT</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatbotEnhanced;

