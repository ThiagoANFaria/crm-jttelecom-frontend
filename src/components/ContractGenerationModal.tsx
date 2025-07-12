import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useTenant } from '@/contexts/TenantContext';
import { useAuth } from '@/context/AuthContext';
import { 
  User, 
  Building, 
  Mail, 
  Phone, 
  Calendar, 
  DollarSign, 
  FileText, 
  Send, 
  Eye, 
  Download,
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock,
  Signature,
  RefreshCw
} from 'lucide-react';

interface ContractTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  contractType: string;
  autoRenewal: boolean;
  renewalPeriod: number;
  cancellationNotice: number;
}

interface ContractGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceType: 'lead' | 'client';
  sourceData: any;
  onContractCreated?: (contract: any) => void;
}

const ContractGenerationModal: React.FC<ContractGenerationModalProps> = ({
  isOpen,
  onClose,
  sourceType,
  sourceData,
  onContractCreated
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);
  const [contractData, setContractData] = useState({
    title: '',
    template_id: '',
    value: '',
    monthly_value: '',
    start_date: '',
    end_date: '',
    payment_terms: 'Mensal',
    description: '',
    client_name: '',
    client_email: '',
    client_phone: '',
    client_cnpj: '',
    client_address: ''
  });
  const [generatedContract, setGeneratedContract] = useState<any>(null);
  const [contractContent, setContractContent] = useState('');
  
  const { toast } = useToast();
  const { currentTenant } = useTenant();
  const { user } = useAuth();

  // Mock templates - replace with API call
  const mockTemplates: ContractTemplate[] = [
    {
      id: 'template_1',
      name: 'Contrato de Serviços Mensais',
      description: 'Template padrão para contratos de serviços com cobrança mensal',
      category: 'servicos',
      contractType: 'mensal',
      autoRenewal: true,
      renewalPeriod: 12,
      cancellationNotice: 30
    },
    {
      id: 'template_2',
      name: 'Contrato de Projeto',
      description: 'Template para contratos de projetos com prazo determinado',
      category: 'projetos',
      contractType: 'projeto',
      autoRenewal: false,
      renewalPeriod: 0,
      cancellationNotice: 15
    },
    {
      id: 'template_3',
      name: 'Contrato Anual',
      description: 'Template para contratos anuais com desconto',
      category: 'servicos',
      contractType: 'anual',
      autoRenewal: true,
      renewalPeriod: 12,
      cancellationNotice: 60
    }
  ];

  const paymentTermsOptions = [
    { value: 'Mensal', label: 'Mensal' },
    { value: 'Trimestral', label: 'Trimestral' },
    { value: 'Semestral', label: 'Semestral' },
    { value: 'Anual', label: 'Anual' },
    { value: 'À vista', label: 'À vista' },
    { value: 'Parcelado', label: 'Parcelado' }
  ];

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
      populateClientData();
      setCurrentStep(1);
    }
  }, [isOpen, sourceData]);

  const loadTemplates = async () => {
    try {
      // Replace with actual API call
      setTemplates(mockTemplates);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar templates",
        variant: "destructive",
      });
    }
  };

  const populateClientData = () => {
    if (sourceData) {
      const clientName = sourceType === 'lead' 
        ? (sourceData.company || sourceData.name)
        : (sourceData.company || sourceData.name);
      
      setContractData(prev => ({
        ...prev,
        title: `Contrato - ${clientName}`,
        client_name: clientName,
        client_email: sourceData.email || '',
        client_phone: sourceData.phone || '',
        client_cnpj: sourceData.cnpj_cpf || '',
        client_address: sourceData.address ? 
          `${sourceData.address}, ${sourceData.number || ''} - ${sourceData.city || ''}/${sourceData.state || ''}` :
          ''
      }));
    }
  };

  const handleTemplateSelect = (template: ContractTemplate) => {
    setSelectedTemplate(template);
    setContractData(prev => ({
      ...prev,
      template_id: template.id,
      payment_terms: template.contractType === 'mensal' ? 'Mensal' : 
                    template.contractType === 'anual' ? 'Anual' : 'À vista'
    }));
  };

  const calculateMonthlyValue = (totalValue: string, contractType: string) => {
    const value = parseFloat(totalValue) || 0;
    switch (contractType) {
      case 'mensal': return value;
      case 'trimestral': return value / 3;
      case 'semestral': return value / 6;
      case 'anual': return value / 12;
      default: return value;
    }
  };

  const handleValueChange = (value: string) => {
    setContractData(prev => {
      const monthlyValue = selectedTemplate ? 
        calculateMonthlyValue(value, selectedTemplate.contractType) : 
        parseFloat(value) || 0;
      
      return {
        ...prev,
        value,
        monthly_value: monthlyValue.toString()
      };
    });
  };

  const validateStep1 = () => {
    return contractData.title && contractData.template_id && selectedTemplate;
  };

  const validateStep2 = () => {
    return contractData.value && contractData.start_date && contractData.end_date;
  };

  const handleCreateContract = async () => {
    try {
      setIsLoading(true);
      
      const endpoint = sourceType === 'lead' 
        ? `/api/contracts/from-lead/${sourceData.id}`
        : `/api/contracts/from-client/${sourceData.id}`;
      
      // Mock API call - replace with actual API
      const mockContract = {
        id: `contract_${Date.now()}`,
        contract_number: `CTR-2025-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        ...contractData,
        status: 'Rascunho',
        signature_status: 'Pendente',
        created_at: new Date().toISOString(),
        tenant_id: currentTenant?.id
      };
      
      setGeneratedContract(mockContract);
      setCurrentStep(3);
      
      toast({
        title: "Sucesso",
        description: "Contrato criado com sucesso",
      });
      
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar contrato",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateContent = async () => {
    if (!generatedContract) return;
    
    try {
      setIsLoading(true);
      
      // Mock content generation - replace with actual API
      const mockContent = `
        <h2>CONTRATO DE PRESTAÇÃO DE SERVIÇOS</h2>
        <p><strong>Número:</strong> ${generatedContract.contract_number}</p>
        
        <p><strong>CONTRATANTE:</strong> ${contractData.client_name}<br>
        <strong>E-MAIL:</strong> ${contractData.client_email}<br>
        <strong>TELEFONE:</strong> ${contractData.client_phone}</p>

        <p><strong>CONTRATADA:</strong> JT Tecnologia<br>
        <strong>CNPJ:</strong> 12.345.678/0001-00<br>
        <strong>E-MAIL:</strong> contato@jttelecom.com.br</p>

        <h3>CLÁUSULA 1ª - DO OBJETO</h3>
        <p>O presente contrato tem por objeto a prestação de serviços de ${contractData.description}.</p>

        <h3>CLÁUSULA 2ª - DO VALOR</h3>
        <p>O valor total dos serviços é de R$ ${parseFloat(contractData.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.</p>
        <p>Forma de pagamento: ${contractData.payment_terms}</p>

        <h3>CLÁUSULA 3ª - DA VIGÊNCIA</h3>
        <p>Este contrato terá vigência de ${contractData.start_date} até ${contractData.end_date}.</p>

        <p><br><br>São Paulo, ${new Date().toLocaleDateString('pt-BR')}</p>
      `;
      
      setContractContent(mockContent);
      
      toast({
        title: "Sucesso",
        description: "Conteúdo do contrato gerado com sucesso",
      });
      
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao gerar conteúdo do contrato",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!generatedContract) return;
    
    try {
      setIsLoading(true);
      
      // Mock email sending - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Sucesso",
        description: "Contrato enviado por email com sucesso",
      });
      
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao enviar contrato por email",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendToD4Sign = async () => {
    if (!generatedContract) return;
    
    try {
      setIsLoading(true);
      
      // Mock D4Sign sending - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Sucesso",
        description: "Contrato enviado para D4Sign com sucesso",
      });
      
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao enviar contrato para D4Sign",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setSelectedTemplate(null);
    setGeneratedContract(null);
    setContractContent('');
    setContractData({
      title: '',
      template_id: '',
      value: '',
      monthly_value: '',
      start_date: '',
      end_date: '',
      payment_terms: 'Mensal',
      description: '',
      client_name: '',
      client_email: '',
      client_phone: '',
      client_cnpj: '',
      client_address: ''
    });
    onClose();
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Selecionar Template</h3>
        <div className="grid gap-4">
          {templates.map(template => (
            <Card 
              key={template.id} 
              className={`cursor-pointer transition-all ${
                selectedTemplate?.id === template.id 
                  ? 'ring-2 ring-blue-500 bg-blue-50' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => handleTemplateSelect(template)}
            >
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{template.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">{template.contractType}</Badge>
                      {template.autoRenewal && (
                        <Badge variant="secondary">
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Renovação Automática
                        </Badge>
                      )}
                    </div>
                  </div>
                  {selectedTemplate?.id === template.id && (
                    <CheckCircle className="w-5 h-5 text-blue-500" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Informações Básicas</h3>
        
        <div>
          <Label htmlFor="title">Título do Contrato</Label>
          <Input
            id="title"
            value={contractData.title}
            onChange={(e) => setContractData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Ex: Contrato de Serviços - Empresa ABC"
          />
        </div>

        <div>
          <Label htmlFor="description">Descrição dos Serviços</Label>
          <Textarea
            id="description"
            value={contractData.description}
            onChange={(e) => setContractData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Descreva os serviços que serão prestados..."
            rows={3}
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Valores e Condições</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="value">Valor Total</Label>
          <Input
            id="value"
            type="number"
            step="0.01"
            value={contractData.value}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder="0,00"
          />
        </div>
        
        <div>
          <Label htmlFor="monthly_value">Valor Mensal</Label>
          <Input
            id="monthly_value"
            type="number"
            step="0.01"
            value={contractData.monthly_value}
            onChange={(e) => setContractData(prev => ({ ...prev, monthly_value: e.target.value }))}
            placeholder="0,00"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="payment_terms">Forma de Pagamento</Label>
        <Select 
          value={contractData.payment_terms} 
          onValueChange={(value) => setContractData(prev => ({ ...prev, payment_terms: value }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {paymentTermsOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="start_date">Data de Início</Label>
          <Input
            id="start_date"
            type="date"
            value={contractData.start_date}
            onChange={(e) => setContractData(prev => ({ ...prev, start_date: e.target.value }))}
          />
        </div>
        
        <div>
          <Label htmlFor="end_date">Data de Término</Label>
          <Input
            id="end_date"
            type="date"
            value={contractData.end_date}
            onChange={(e) => setContractData(prev => ({ ...prev, end_date: e.target.value }))}
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h4 className="font-medium">Dados do Cliente</h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="client_name">Nome/Empresa</Label>
            <Input
              id="client_name"
              value={contractData.client_name}
              onChange={(e) => setContractData(prev => ({ ...prev, client_name: e.target.value }))}
            />
          </div>
          
          <div>
            <Label htmlFor="client_email">Email</Label>
            <Input
              id="client_email"
              type="email"
              value={contractData.client_email}
              onChange={(e) => setContractData(prev => ({ ...prev, client_email: e.target.value }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="client_phone">Telefone</Label>
            <Input
              id="client_phone"
              value={contractData.client_phone}
              onChange={(e) => setContractData(prev => ({ ...prev, client_phone: e.target.value }))}
            />
          </div>
          
          <div>
            <Label htmlFor="client_cnpj">CNPJ/CPF</Label>
            <Input
              id="client_cnpj"
              value={contractData.client_cnpj}
              onChange={(e) => setContractData(prev => ({ ...prev, client_cnpj: e.target.value }))}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="client_address">Endereço Completo</Label>
          <Textarea
            id="client_address"
            value={contractData.client_address}
            onChange={(e) => setContractData(prev => ({ ...prev, client_address: e.target.value }))}
            rows={2}
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Contrato Gerado</h3>
        {generatedContract && (
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <CheckCircle className="w-3 h-3 mr-1" />
            {generatedContract.contract_number}
          </Badge>
        )}
      </div>

      {generatedContract && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{generatedContract.title}</CardTitle>
            <CardDescription>
              Valor: R$ {parseFloat(contractData.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} | 
              Vigência: {contractData.start_date} até {contractData.end_date}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {contractData.client_name}
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                {contractData.client_email}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date().toLocaleDateString('pt-BR')}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button
          variant="outline"
          onClick={handleGenerateContent}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
          Visualizar Conteúdo
        </Button>

        <Button
          variant="outline"
          onClick={handleSendEmail}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
          Enviar por Email
        </Button>

        <Button
          onClick={handleSendToD4Sign}
          disabled={isLoading}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Signature className="w-4 h-4" />}
          Enviar para D4Sign
        </Button>
      </div>

      {contractContent && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Preview do Contrato</CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="prose max-w-none text-sm border rounded p-4 bg-gray-50 max-h-96 overflow-y-auto"
              dangerouslySetInnerHTML={{ __html: contractContent }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Gerar Contrato
            {sourceType === 'lead' && <Badge variant="secondary">Lead</Badge>}
            {sourceType === 'client' && <Badge variant="secondary">Cliente</Badge>}
          </DialogTitle>
          <DialogDescription>
            Gerar contrato a partir de {sourceType === 'lead' ? 'lead' : 'cliente'}: {sourceData?.name || sourceData?.company}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-center space-x-4 py-4">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= step 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {step}
              </div>
              {step < 3 && (
                <div className={`w-12 h-0.5 mx-2 ${
                  currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        <div className="space-y-6">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {currentStep === 3 ? 'Fechar' : 'Cancelar'}
          </Button>
          
          {currentStep === 1 && (
            <Button 
              onClick={() => setCurrentStep(2)}
              disabled={!validateStep1()}
            >
              Próximo
            </Button>
          )}
          
          {currentStep === 2 && (
            <>
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                Voltar
              </Button>
              <Button 
                onClick={handleCreateContract}
                disabled={!validateStep2() || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Criando...
                  </>
                ) : (
                  'Criar Contrato'
                )}
              </Button>
            </>
          )}
          
          {currentStep === 3 && generatedContract && onContractCreated && (
            <Button 
              onClick={() => {
                onContractCreated(generatedContract);
                handleClose();
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Finalizar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ContractGenerationModal;

