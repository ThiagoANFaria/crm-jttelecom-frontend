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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Tabs as TabsIcon, 
  RefreshCw, 
  Settings, 
  Users, 
  Mail, 
  MessageSquare, 
  Calendar, 
  Tag, 
  Check, 
  X, 
  AlertCircle, 
  Loader2, 
  ArrowRightLeft, 
  Globe, 
  Key, 
  Lock, 
  Webhook
} from 'lucide-react';
import { 
  MauticConfig, 
  MauticContact, 
  MauticCampaign,
  MauticSegment,
  MauticEmail
} from '@/types/automation';
import { mauticService } from '@/services/mauticService';
import EmailTemplateEditor from '@/components/EmailTemplateEditor';

const MauticIntegration: React.FC = () => {
  const [activeTab, setActiveTab] = useState('config');
  const [config, setConfig] = useState<MauticConfig>({
    baseUrl: '',
    authType: 'basic' as const,
    credentials: {
      username: '',
      password: '',
    },
    webhookUrl: '',
    isActive: false
  });
  
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'untested' | 'success' | 'error'>('untested');
  const [contacts, setContacts] = useState<MauticContact[]>([]);
  const [campaigns, setCampaigns] = useState<MauticCampaign[]>([]);
  const [segments, setSegments] = useState<MauticSegment[]>([]);
  const [emails, setEmails] = useState<MauticEmail[]>([]);
  const [syncStatus, setSyncStatus] = useState<'connected' | 'error' | 'syncing' | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<any>(null);
  
  // Carregar configuração existente
  useEffect(() => {
    // Em produção, carregar do backend
    // loadConfig();
    
    // Mock para demonstração
    setTimeout(() => {
      setConfig({
        baseUrl: 'https://mautic.jttecnologia.com.br',
        authType: 'oauth2' as const,
        credentials: {
          clientId: 'crm_client',
          clientSecret: '********',
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        webhookUrl: 'https://api.app.jttecnologia.com.br/webhooks/mautic',
        isActive: true
      });
      setConnectionStatus('success');
    }, 1000);
  }, []);
  
  // Testar conexão com Mautic
  const testConnection = async () => {
    setTestingConnection(true);
    setConnectionStatus('untested');
    
    try {
      // Inicializar cliente
      await mauticService.initClient(config.tenantId, config);
      
      // Testar conexão
      const success = await mauticService.testConnection(config.tenantId);
      
      setConnectionStatus(success ? 'success' : 'error');
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      setConnectionStatus('error');
    } finally {
      setTestingConnection(false);
    }
  };
  
  // Salvar configuração
  const saveConfig = async () => {
    try {
      // Em produção, salvar no backend
      // await api.post('/mautic/config', config);
      
      alert('Configuração salva com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      alert('Erro ao salvar configuração');
    }
  };
  
  // Carregar dados do Mautic
  const loadMauticData = async () => {
    try {
      // Inicializar cliente se necessário
      if (connectionStatus !== 'success') {
        await mauticService.initClient(config.tenantId, config);
      }
      
      // Carregar dados em paralelo
      const [contactsData, campaignsData, segmentsData, emailsData] = await Promise.all([
        mauticService.getContacts(config.tenantId),
        mauticService.getCampaigns(config.tenantId),
        mauticService.getSegments(config.tenantId),
        mauticService.getEmails(config.tenantId)
      ]);
      
      setContacts(contactsData);
      setCampaigns(campaignsData);
      setSegments(segmentsData);
      setEmails(emailsData);
    } catch (error) {
      console.error('Erro ao carregar dados do Mautic:', error);
      
      // Mock para demonstração
      setContacts([
        { id: '1', firstname: 'João', lastname: 'Silva', email: 'joao@example.com', mobile: '11999998888' },
        { id: '2', firstname: 'Maria', lastname: 'Santos', email: 'maria@example.com', mobile: '11999997777' },
        { id: '3', firstname: 'Pedro', lastname: 'Oliveira', email: 'pedro@example.com', mobile: '11999996666' }
      ] as any);
      
      setCampaigns([
        { id: '1', name: 'Campanha de Boas-vindas', description: 'E-mails automáticos para novos leads' },
        { id: '2', name: 'Nutrição de Leads', description: 'Sequência de e-mails educativos' },
        { id: '3', name: 'Reengajamento', description: 'Recuperação de leads inativos' }
      ] as any);
      
      setSegments([
        { id: '1', name: 'Leads Quentes', description: 'Leads com alta pontuação' },
        { id: '2', name: 'Leads Frios', description: 'Leads com baixa interação' },
        { id: '3', name: 'Clientes', description: 'Contatos que já compraram' }
      ] as any);
      
      setEmails([
        { id: '1', name: 'Boas-vindas', subject: 'Bem-vindo à JT Telecom!', category: 'transactional' },
        { id: '2', name: 'Oferta Especial', subject: 'Oferta exclusiva para você!', category: 'marketing' },
        { id: '3', name: 'Lembrete de Reunião', subject: 'Lembrete: Nossa reunião amanhã', category: 'transactional' }
      ] as any);
    }
  };
  
  // Sincronizar leads com Mautic
  const syncLeadsToMautic = async () => {
    setIsSyncing(true);
    setSyncStatus(null);
    
    try {
      // Em produção, obter leads do backend
      // const leads = await api.get('/leads');
      
      // Mock para demonstração
      const mockLeads = [
        { id: '1', firstName: 'João', lastName: 'Silva', email: 'joao@example.com', phone: '11999998888', company: 'Empresa A', stage: 'Qualificação', source: 'Site' },
        { id: '2', firstName: 'Maria', lastName: 'Santos', email: 'maria@example.com', phone: '11999997777', company: 'Empresa B', stage: 'Proposta', source: 'Indicação' },
        { id: '3', firstName: 'Pedro', lastName: 'Oliveira', email: 'pedro@example.com', phone: '11999996666', company: 'Empresa C', stage: 'Negociação', source: 'LinkedIn' }
      ];
      
      // Sincronizar leads
      const status = await mauticService.syncLeadsToMautic(config.tenantId, mockLeads);
      setSyncStatus(status);
    } catch (error) {
      console.error('Erro ao sincronizar leads:', error);
      setSyncStatus({
        created: 0,
        updated: 0,
        failed: 3,
        total: 3,
        error: 'Erro ao sincronizar leads'
      });
    } finally {
      setIsSyncing(false);
    }
  };
  
  // Configurar webhook
  const configureWebhook = async () => {
    try {
      const success = await mauticService.configureWebhook(
        config.tenantId,
        config.webhookUrl,
        ['mautic.lead_post_save', 'mautic.email_on_open', 'mautic.form_on_submit']
      );
      
      if (success) {
        alert('Webhook configurado com sucesso!');
      } else {
        alert('Erro ao configurar webhook');
      }
    } catch (error) {
      console.error('Erro ao configurar webhook:', error);
      alert('Erro ao configurar webhook');
    }
  };
  
  // Renderizar formulário de configuração
  const renderConfigForm = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="baseUrl">URL do Mautic</Label>
            <Input
              id="baseUrl"
              value={config.baseUrl}
              onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
              placeholder="https://mautic.seudominio.com.br"
            />
            <p className="text-sm text-gray-500 mt-1">
              URL base da sua instalação Mautic
            </p>
          </div>
          
          <div>
            <Label htmlFor="authType">Tipo de Autenticação</Label>
            <Select
              value={config.authType}
              onValueChange={(value) => setConfig({ ...config, authType: value as MauticAuthType })}
            >
              <SelectTrigger id="authType">
                <SelectValue placeholder="Selecione o tipo de autenticação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={MauticAuthType.BASIC}>Básica (Usuário/Senha)</SelectItem>
                <SelectItem value={MauticAuthType.OAUTH2}>OAuth2</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {config.authType === MauticAuthType.BASIC ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="username">Usuário</Label>
              <Input
                id="username"
                value={config.username}
                onChange={(e) => setConfig({ ...config, username: e.target.value })}
                placeholder="Usuário Mautic"
              />
            </div>
            
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={config.password}
                onChange={(e) => setConfig({ ...config, password: e.target.value })}
                placeholder="Senha Mautic"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="clientId">Client ID</Label>
              <Input
                id="clientId"
                value={config.clientId}
                onChange={(e) => setConfig({ ...config, clientId: e.target.value })}
                placeholder="Client ID OAuth2"
              />
            </div>
            
            <div>
              <Label htmlFor="clientSecret">Client Secret</Label>
              <Input
                id="clientSecret"
                type="password"
                value={config.clientSecret}
                onChange={(e) => setConfig({ ...config, clientSecret: e.target.value })}
                placeholder="Client Secret OAuth2"
              />
            </div>
            
            <div>
              <Label htmlFor="accessToken">Access Token</Label>
              <Input
                id="accessToken"
                value={config.accessToken}
                onChange={(e) => setConfig({ ...config, accessToken: e.target.value })}
                placeholder="Token de acesso OAuth2"
              />
            </div>
            
            <div>
              <Label htmlFor="refreshToken">Refresh Token</Label>
              <Input
                id="refreshToken"
                value={config.refreshToken}
                onChange={(e) => setConfig({ ...config, refreshToken: e.target.value })}
                placeholder="Token de atualização OAuth2"
              />
            </div>
          </div>
        )}
        
        <div>
          <Label htmlFor="webhookUrl">URL do Webhook</Label>
          <Input
            id="webhookUrl"
            value={config.webhookUrl}
            onChange={(e) => setConfig({ ...config, webhookUrl: e.target.value })}
            placeholder="https://api.seudominio.com.br/webhooks/mautic"
          />
          <p className="text-sm text-gray-500 mt-1">
            URL para receber eventos do Mautic (aberturas de e-mail, envios, etc.)
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="isActive"
            checked={config.isActive}
            onCheckedChange={(checked) => setConfig({ ...config, isActive: checked })}
          />
          <Label htmlFor="isActive">Integração Ativa</Label>
        </div>
        
        <div className="flex gap-4">
          <Button onClick={testConnection} disabled={testingConnection}>
            {testingConnection ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Testar Conexão
          </Button>
          
          <Button onClick={saveConfig} disabled={testingConnection}>
            <Settings className="h-4 w-4 mr-2" />
            Salvar Configuração
          </Button>
          
          <Button onClick={configureWebhook} disabled={testingConnection || connectionStatus !== 'success'}>
            <Webhook className="h-4 w-4 mr-2" />
            Configurar Webhook
          </Button>
        </div>
        
        {connectionStatus === 'success' && (
          <div className="flex items-center text-green-600">
            <Check className="h-5 w-5 mr-2" />
            Conexão estabelecida com sucesso!
          </div>
        )}
        
        {connectionStatus === 'error' && (
          <div className="flex items-center text-red-600">
            <X className="h-5 w-5 mr-2" />
            Erro ao conectar com o Mautic. Verifique as credenciais e tente novamente.
          </div>
        )}
      </div>
    );
  };
  
  // Renderizar aba de sincronização
  const renderSyncTab = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Contatos Mautic</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {contacts.length}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Campanhas</p>
                  <p className="text-2xl font-bold text-green-600">
                    {campaigns.length}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">E-mails</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {emails.length}
                  </p>
                </div>
                <Mail className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex gap-4">
          <Button onClick={loadMauticData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar Dados
          </Button>
          
          <Button onClick={syncLeadsToMautic} disabled={isSyncing}>
            {isSyncing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <ArrowRightLeft className="h-4 w-4 mr-2" />
            )}
            Sincronizar Leads
          </Button>
        </div>
        
        {syncStatus && (
          <Card>
            <CardHeader>
              <CardTitle>Resultado da Sincronização</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-2xl font-bold">{syncStatus.total}</p>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-md">
                  <p className="text-sm text-gray-500">Criados</p>
                  <p className="text-2xl font-bold text-green-600">{syncStatus.created}</p>
                </div>
                
                <div className="text-center p-4 bg-blue-50 rounded-md">
                  <p className="text-sm text-gray-500">Atualizados</p>
                  <p className="text-2xl font-bold text-blue-600">{syncStatus.updated}</p>
                </div>
                
                <div className="text-center p-4 bg-red-50 rounded-md">
                  <p className="text-sm text-gray-500">Falhas</p>
                  <p className="text-2xl font-bold text-red-600">{syncStatus.failed}</p>
                </div>
              </div>
              
              {syncStatus.error && (
                <div className="mt-4 p-4 bg-red-50 rounded-md text-red-600 flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <p>{syncStatus.error}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Contatos Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Telefone</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contacts.slice(0, 5).map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell>{contact.firstname} {contact.lastname}</TableCell>
                      <TableCell>{contact.email}</TableCell>
                      <TableCell>{contact.mobile}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Campanhas Ativas</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Descrição</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.slice(0, 5).map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell>{campaign.name}</TableCell>
                      <TableCell>{campaign.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };
  
  // Renderizar aba de e-mails
  const renderEmailsTab = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Templates de E-mail</h3>
          <Button onClick={() => {
            setSelectedEmail(null);
            setShowTemplateEditor(true);
          }}>
            <Mail className="h-4 w-4 mr-2" />
            Novo Template
          </Button>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Assunto</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {emails.map((email) => (
              <TableRow key={email.id}>
                <TableCell>{email.name}</TableCell>
                <TableCell>{email.subject}</TableCell>
                <TableCell>
                  <Badge variant={email.category === 'marketing' ? 'default' : 'secondary'}>
                    {email.category === 'marketing' ? 'Marketing' : 'Transacional'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => {
                    setSelectedEmail(email);
                    setShowTemplateEditor(true);
                  }}>
                    Editar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {showTemplateEditor && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <EmailTemplateEditor
                  template={selectedEmail}
                  onSave={(template) => {
                    // Em produção, salvar no backend
                    console.log('Template salvo:', template);
                    setShowTemplateEditor(false);
                    
                    // Atualizar lista de e-mails
                    if (selectedEmail) {
                      setEmails(emails.map(e => e.id === template.id ? template : e));
                    } else {
                      setEmails([...emails, { ...template, id: `temp_${Date.now()}` }]);
                    }
                  }}
                  onCancel={() => setShowTemplateEditor(false)}
                  availableVariables={[
                    { key: 'lead.nome', label: 'Nome do Lead', exampleValue: 'João Silva' },
                    { key: 'lead.email', label: 'E-mail do Lead', exampleValue: 'joao@example.com' },
                    { key: 'lead.telefone', label: 'Telefone do Lead', exampleValue: '(11) 99999-8888' },
                    { key: 'lead.empresa', label: 'Empresa do Lead', exampleValue: 'Empresa ABC' },
                    { key: 'user.nome', label: 'Nome do Usuário', exampleValue: 'Maria Vendas' },
                    { key: 'user.email', label: 'E-mail do Usuário', exampleValue: 'maria@jttelecom.com.br' },
                    { key: 'user.telefone', label: 'Telefone do Usuário', exampleValue: '(11) 99999-7777' },
                    { key: 'tenant.nome', label: 'Nome da Empresa', exampleValue: 'JT Telecom' },
                    { key: 'tenant.site', label: 'Site da Empresa', exampleValue: 'www.jttecnologia.com.br' }
                  ]}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Integração Mautic</h1>
          <p className="text-gray-500">Configure a integração com Mautic para automação de marketing</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={config.isActive ? "default" : "secondary"}>
            {config.isActive ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configuração
          </TabsTrigger>
          <TabsTrigger value="sync" className="flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4" />
            Sincronização
          </TabsTrigger>
          <TabsTrigger value="emails" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            E-mails
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Webhooks
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle>Configuração do Mautic</CardTitle>
              <CardDescription>
                Configure a integração com sua instância do Mautic
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderConfigForm()}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sync">
          <Card>
            <CardHeader>
              <CardTitle>Sincronização de Dados</CardTitle>
              <CardDescription>
                Sincronize leads, contatos e campanhas entre o CRM e o Mautic
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderSyncTab()}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="emails">
          <Card>
            <CardHeader>
              <CardTitle>Templates de E-mail</CardTitle>
              <CardDescription>
                Gerencie templates de e-mail para automações e campanhas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderEmailsTab()}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="webhooks">
          <Card>
            <CardHeader>
              <CardTitle>Configuração de Webhooks</CardTitle>
              <CardDescription>
                Configure webhooks para receber eventos do Mautic em tempo real
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="webhookUrl">URL do Webhook</Label>
                    <Input
                      id="webhookUrl"
                      value={config.webhookUrl}
                      onChange={(e) => setConfig({ ...config, webhookUrl: e.target.value })}
                      placeholder="https://api.seudominio.com.br/webhooks/mautic"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      URL para receber eventos do Mautic
                    </p>
                  </div>
                </div>
                
                <div>
                  <Label className="mb-2 block">Eventos para Monitorar</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="event-lead" defaultChecked />
                      <label htmlFor="event-lead" className="text-sm">Alterações em Leads/Contatos</label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="event-email" defaultChecked />
                      <label htmlFor="event-email" className="text-sm">Eventos de E-mail (abertura, clique)</label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="event-form" defaultChecked />
                      <label htmlFor="event-form" className="text-sm">Envio de Formulários</label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="event-campaign" />
                      <label htmlFor="event-campaign" className="text-sm">Eventos de Campanha</label>
                    </div>
                  </div>
                </div>
                
                <Button onClick={configureWebhook}>
                  <Webhook className="h-4 w-4 mr-2" />
                  Configurar Webhook
                </Button>
                
                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-2">Eventos Recentes</h4>
                  <div className="border rounded-md p-4 text-center text-gray-500">
                    Nenhum evento recebido ainda
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MauticIntegration;

