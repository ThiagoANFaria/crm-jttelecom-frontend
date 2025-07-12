import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Save, 
  Plus,
  Edit,
  Trash2,
  Copy,
  Eye,
  FileText,
  Star,
  StarOff,
  Tag,
  Code,
  Type,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Image,
  Link,
  Palette,
  Download,
  Upload,
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  AlertCircle,
  Calendar,
  Clock,
  RefreshCw,
  FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useTenant } from '@/contexts/TenantContext';

interface ContractTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  content: string;
  contractType: string;
  autoRenewal: boolean;
  renewalPeriod: number;
  cancellationNotice: number;
  isDefault: boolean;
  isActive: boolean;
  status: 'draft' | 'active' | 'archived';
  tenantId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastUsed?: string;
  usageCount: number;
  variables: string[];
  tags: string[];
}

interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  icon?: string;
}

interface TemplateVariable {
  id: string;
  key: string;
  name: string;
  description: string;
  dataType: 'text' | 'number' | 'date' | 'boolean';
  isRequired: boolean;
  defaultValue?: string;
  category: string;
}

const ContractTemplatesManager: React.FC = () => {
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [variables, setVariables] = useState<TemplateVariable[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showVariables, setShowVariables] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { currentTenant } = useTenant();

  // Variáveis específicas para contratos
  const contractVariables = [
    { key: '{client_name}', description: 'Nome do cliente/empresa' },
    { key: '{client_email}', description: 'E-mail do cliente' },
    { key: '{client_phone}', description: 'Telefone do cliente' },
    { key: '{client_address}', description: 'Endereço do cliente' },
    { key: '{client_cnpj}', description: 'CNPJ da empresa' },
    { key: '{client_cpf}', description: 'CPF do cliente' },
    { key: '{contract_number}', description: 'Número do contrato' },
    { key: '{contract_date}', description: 'Data de assinatura do contrato' },
    { key: '{contract_start_date}', description: 'Data de início do contrato' },
    { key: '{contract_end_date}', description: 'Data de término do contrato' },
    { key: '{contract_value}', description: 'Valor do contrato' },
    { key: '{monthly_value}', description: 'Valor mensal' },
    { key: '{service_description}', description: 'Descrição dos serviços' },
    { key: '{payment_terms}', description: 'Condições de pagamento' },
    { key: '{renewal_period}', description: 'Período de renovação' },
    { key: '{cancellation_notice}', description: 'Prazo para cancelamento' },
    { key: '{company_name}', description: 'Nome da empresa (JT Tecnologia)' },
    { key: '{company_cnpj}', description: 'CNPJ da empresa' },
    { key: '{company_address}', description: 'Endereço da empresa' },
    { key: '{company_phone}', description: 'Telefone da empresa' },
    { key: '{company_email}', description: 'E-mail da empresa' },
    { key: '{responsible_name}', description: 'Nome do responsável' },
    { key: '{current_date}', description: 'Data atual' },
    { key: '{current_year}', description: 'Ano atual' }
  ];

  const contractTypes = [
    { value: 'mensal', label: 'Mensal' },
    { value: 'trimestral', label: 'Trimestral' },
    { value: 'semestral', label: 'Semestral' },
    { value: 'anual', label: 'Anual' },
    { value: 'projeto', label: 'Por Projeto' },
    { value: 'indeterminado', label: 'Prazo Indeterminado' }
  ];

  const defaultCategories = [
    { id: 'servicos', name: 'Serviços', color: '#3B82F6', icon: 'FileText' },
    { id: 'produtos', name: 'Produtos', color: '#10B981', icon: 'Package' },
    { id: 'consultoria', name: 'Consultoria', color: '#8B5CF6', icon: 'Users' },
    { id: 'manutencao', name: 'Manutenção', color: '#F59E0B', icon: 'Settings' },
    { id: 'licenciamento', name: 'Licenciamento', color: '#EF4444', icon: 'Key' }
  ];

  // Carregar dados iniciais
  useEffect(() => {
    loadTemplates();
    loadCategories();
    loadVariables();
  }, [currentTenant]);

  const loadTemplates = async () => {
    try {
      // Simular carregamento de templates
      const mockTemplates: ContractTemplate[] = [
        {
          id: '1',
          name: 'Contrato de Serviços Mensais',
          description: 'Template padrão para contratos de serviços com cobrança mensal',
          category: 'servicos',
          content: `<h2>CONTRATO DE PRESTAÇÃO DE SERVIÇOS</h2>
          
<p><strong>CONTRATANTE:</strong> {client_name}<br>
<strong>CNPJ/CPF:</strong> {client_cnpj}<br>
<strong>ENDEREÇO:</strong> {client_address}</p>

<p><strong>CONTRATADA:</strong> {company_name}<br>
<strong>CNPJ:</strong> {company_cnpj}<br>
<strong>ENDEREÇO:</strong> {company_address}</p>

<h3>CLÁUSULA 1ª - DO OBJETO</h3>
<p>O presente contrato tem por objeto a prestação de serviços de {service_description}.</p>

<h3>CLÁUSULA 2ª - DO VALOR E FORMA DE PAGAMENTO</h3>
<p>O valor mensal dos serviços é de {monthly_value}, com vencimento todo dia 10 de cada mês.</p>

<h3>CLÁUSULA 3ª - DA VIGÊNCIA</h3>
<p>Este contrato terá vigência de {contract_start_date} até {contract_end_date}.</p>

<h3>CLÁUSULA 4ª - DA RENOVAÇÃO</h3>
<p>O contrato será renovado automaticamente por períodos de {renewal_period} meses, salvo manifestação em contrário com antecedência mínima de {cancellation_notice} dias.</p>

<p>Local e Data: ________________, {current_date}</p>

<p>_________________________<br>
{company_name}</p>

<p>_________________________<br>
{client_name}</p>`,
          contractType: 'mensal',
          autoRenewal: true,
          renewalPeriod: 12,
          cancellationNotice: 30,
          isDefault: true,
          isActive: true,
          status: 'active',
          tenantId: currentTenant?.id || '',
          createdBy: user?.id || '',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z',
          lastUsed: '2024-07-08T14:30:00Z',
          usageCount: 15,
          variables: ['{client_name}', '{service_description}', '{monthly_value}'],
          tags: ['padrão', 'mensal', 'serviços']
        },
        {
          id: '2',
          name: 'Contrato de Projeto',
          description: 'Template para contratos de projetos com prazo determinado',
          category: 'projetos',
          content: `<h2>CONTRATO DE DESENVOLVIMENTO DE PROJETO</h2>
          
<p>Contrato específico para desenvolvimento de projeto com escopo definido.</p>

<h3>ESCOPO DO PROJETO</h3>
<p>{service_description}</p>

<h3>PRAZO DE ENTREGA</h3>
<p>O projeto deverá ser entregue até {contract_end_date}.</p>

<h3>VALOR TOTAL</h3>
<p>O valor total do projeto é de {contract_value}.</p>`,
          contractType: 'projeto',
          autoRenewal: false,
          renewalPeriod: 0,
          cancellationNotice: 15,
          isDefault: false,
          isActive: true,
          status: 'active',
          tenantId: currentTenant?.id || '',
          createdBy: user?.id || '',
          createdAt: '2024-02-01T09:00:00Z',
          updatedAt: '2024-02-01T09:00:00Z',
          lastUsed: '2024-07-05T16:20:00Z',
          usageCount: 8,
          variables: ['{service_description}', '{contract_value}', '{contract_end_date}'],
          tags: ['projeto', 'prazo determinado']
        }
      ];
      
      setTemplates(mockTemplates);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar templates de contratos",
        variant: "destructive",
      });
    }
  };

  const loadCategories = async () => {
    try {
      setCategories(defaultCategories);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar categorias",
        variant: "destructive",
      });
    }
  };

  const loadVariables = async () => {
    try {
      const mockVariables: TemplateVariable[] = contractVariables.map((v, index) => ({
        id: `var_${index}`,
        key: v.key,
        name: v.key.replace(/[{}]/g, '').replace(/_/g, ' '),
        description: v.description,
        dataType: 'text' as const,
        isRequired: false,
        category: 'geral'
      }));
      
      setVariables(mockVariables);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar variáveis",
        variant: "destructive",
      });
    }
  };

  const handleSaveTemplate = async (templateData: Partial<ContractTemplate>) => {
    try {
      if (isEditing && selectedTemplate) {
        // Atualizar template existente
        const updatedTemplate = { ...selectedTemplate, ...templateData, updatedAt: new Date().toISOString() };
        setTemplates(templates.map(t => t.id === selectedTemplate.id ? updatedTemplate : t));
        setSelectedTemplate(updatedTemplate);
        
        toast({
          title: "Sucesso",
          description: "Template atualizado com sucesso",
        });
      } else {
        // Criar novo template
        const newTemplate: ContractTemplate = {
          id: Date.now().toString(),
          tenantId: currentTenant?.id || '',
          createdBy: user?.id || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          usageCount: 0,
          isDefault: false,
          isActive: true,
          status: 'active',
          autoRenewal: false,
          renewalPeriod: 12,
          cancellationNotice: 30,
          variables: [],
          tags: [],
          ...templateData
        } as ContractTemplate;
        
        setTemplates([...templates, newTemplate]);
        
        toast({
          title: "Sucesso",
          description: "Template criado com sucesso",
        });
      }
      
      setIsEditing(false);
      setIsCreating(false);
      setSelectedTemplate(null);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar template",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      setTemplates(templates.filter(t => t.id !== templateId));
      
      toast({
        title: "Sucesso",
        description: "Template removido com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao remover template",
        variant: "destructive",
      });
    }
  };

  const handleDuplicateTemplate = async (template: ContractTemplate) => {
    try {
      const duplicatedTemplate: ContractTemplate = {
        ...template,
        id: Date.now().toString(),
        name: `${template.name} (Cópia)`,
        isDefault: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usageCount: 0,
        lastUsed: undefined
      };
      
      setTemplates([...templates, duplicatedTemplate]);
      
      toast({
        title: "Sucesso",
        description: "Template duplicado com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao duplicar template",
        variant: "destructive",
      });
    }
  };

  const insertVariable = (variable: string) => {
    if (editorRef.current) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(variable));
      }
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || template.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'draft': return <Edit className="w-4 h-4" />;
      case 'archived': return <AlertCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Templates de Contratos</h2>
          <p className="text-gray-600">Gerencie templates personalizáveis para contratos</p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Template
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="archived">Arquivado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Templates */}
      <div className="grid gap-4">
        {filteredTemplates.map(template => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                    {template.isDefault && (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        <Star className="w-3 h-3 mr-1" />
                        Padrão
                      </Badge>
                    )}
                    <Badge className={getStatusColor(template.status)}>
                      {getStatusIcon(template.status)}
                      <span className="ml-1 capitalize">{template.status}</span>
                    </Badge>
                    <Badge variant="outline">
                      {contractTypes.find(t => t.value === template.contractType)?.label || template.contractType}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{template.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Criado em {new Date(template.createdAt).toLocaleDateString()}
                    </span>
                    {template.lastUsed && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Usado em {new Date(template.lastUsed).toLocaleDateString()}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {template.usageCount} usos
                    </span>
                    {template.autoRenewal && (
                      <span className="flex items-center gap-1">
                        <RefreshCw className="w-4 h-4" />
                        Renovação automática
                      </span>
                    )}
                  </div>
                  
                  {template.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {template.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedTemplate(template);
                      setShowPreview(true);
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDuplicateTemplate(template)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedTemplate(template);
                      setIsEditing(true);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum template encontrado</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all'
                  ? 'Tente ajustar os filtros de busca'
                  : 'Comece criando seu primeiro template de contrato'
                }
              </p>
              {!searchTerm && selectedCategory === 'all' && selectedStatus === 'all' && (
                <Button onClick={() => setIsCreating(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeiro Template
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog para criar/editar template */}
      <Dialog open={isCreating || isEditing} onOpenChange={(open) => {
        if (!open) {
          setIsCreating(false);
          setIsEditing(false);
          setSelectedTemplate(null);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Editar Template' : 'Novo Template de Contrato'}
            </DialogTitle>
            <DialogDescription>
              {isEditing ? 'Modifique as informações do template' : 'Crie um novo template de contrato personalizável'}
            </DialogDescription>
          </DialogHeader>
          
          <TemplateForm
            template={selectedTemplate}
            categories={categories}
            variables={contractVariables}
            contractTypes={contractTypes}
            onSave={handleSaveTemplate}
            onCancel={() => {
              setIsCreating(false);
              setIsEditing(false);
              setSelectedTemplate(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog para preview */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview do Template</DialogTitle>
            <DialogDescription>
              Visualização do template: {selectedTemplate?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedTemplate && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Categoria:</strong> {selectedTemplate.category}
                  </div>
                  <div>
                    <strong>Tipo:</strong> {contractTypes.find(t => t.value === selectedTemplate.contractType)?.label}
                  </div>
                  <div>
                    <strong>Renovação Automática:</strong> {selectedTemplate.autoRenewal ? 'Sim' : 'Não'}
                  </div>
                  <div>
                    <strong>Período de Renovação:</strong> {selectedTemplate.renewalPeriod} meses
                  </div>
                  <div>
                    <strong>Aviso de Cancelamento:</strong> {selectedTemplate.cancellationNotice} dias
                  </div>
                  <div>
                    <strong>Usos:</strong> {selectedTemplate.usageCount}
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg p-4 bg-white">
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedTemplate.content }}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Componente do formulário (simplificado para economizar espaço)
const TemplateForm: React.FC<{
  template: ContractTemplate | null;
  categories: TemplateCategory[];
  variables: any[];
  contractTypes: any[];
  onSave: (data: Partial<ContractTemplate>) => void;
  onCancel: () => void;
}> = ({ template, categories, variables, contractTypes, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    description: template?.description || '',
    category: template?.category || 'servicos',
    content: template?.content || '',
    contractType: template?.contractType || 'mensal',
    autoRenewal: template?.autoRenewal || false,
    renewalPeriod: template?.renewalPeriod || 12,
    cancellationNotice: template?.cancellationNotice || 30,
    isDefault: template?.isDefault || false,
    isActive: template?.isActive !== false,
    tags: template?.tags || []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nome do Template</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="category">Categoria</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={2}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="contractType">Tipo de Contrato</Label>
          <Select value={formData.contractType} onValueChange={(value) => setFormData({ ...formData, contractType: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {contractTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="renewalPeriod">Período de Renovação (meses)</Label>
          <Input
            id="renewalPeriod"
            type="number"
            value={formData.renewalPeriod}
            onChange={(e) => setFormData({ ...formData, renewalPeriod: parseInt(e.target.value) })}
          />
        </div>
        <div>
          <Label htmlFor="cancellationNotice">Aviso de Cancelamento (dias)</Label>
          <Input
            id="cancellationNotice"
            type="number"
            value={formData.cancellationNotice}
            onChange={(e) => setFormData({ ...formData, cancellationNotice: parseInt(e.target.value) })}
          />
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <Switch
            id="autoRenewal"
            checked={formData.autoRenewal}
            onCheckedChange={(checked) => setFormData({ ...formData, autoRenewal: checked })}
          />
          <Label htmlFor="autoRenewal">Renovação Automática</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="isDefault"
            checked={formData.isDefault}
            onCheckedChange={(checked) => setFormData({ ...formData, isDefault: checked })}
          />
          <Label htmlFor="isDefault">Template Padrão</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="isActive"
            checked={formData.isActive}
            onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
          />
          <Label htmlFor="isActive">Ativo</Label>
        </div>
      </div>

      <div>
        <Label htmlFor="content">Conteúdo do Template</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          rows={15}
          className="font-mono text-sm"
          placeholder="Digite o conteúdo do template aqui. Use variáveis como {client_name}, {contract_value}, etc."
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
          <Save className="w-4 h-4 mr-2" />
          Salvar Template
        </Button>
      </DialogFooter>
    </form>
  );
};

export default ContractTemplatesManager;

