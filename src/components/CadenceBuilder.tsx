import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  Clock, 
  Mail, 
  MessageSquare,
  Phone,
  CheckCircle,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Copy,
  Play,
  Pause,
  BarChart3,
  Users,
  Target,
  TrendingUp
} from 'lucide-react';
import { 
  Cadence, 
  CadenceStep, 
  CadenceType, 
  StepType, 
  CadenceEnrollmentCriteria,
  CadenceExitCriteria,
  InactivityRule,
  InactivityAction
} from '@/types/automation';

interface CadenceBuilderProps {
  cadence?: Cadence;
  onSave: (cadence: Partial<Cadence>) => void;
  onTest?: (cadence: Cadence) => void;
}

const CadenceBuilder: React.FC<CadenceBuilderProps> = ({
  cadence,
  onSave,
  onTest
}) => {
  const [name, setName] = useState(cadence?.name || '');
  const [description, setDescription] = useState(cadence?.description || '');
  const [type, setType] = useState<CadenceType>(cadence?.type || CadenceType.PROSPECTING);
  const [steps, setSteps] = useState<CadenceStep[]>(cadence?.steps || []);
  const [enrollmentCriteria, setEnrollmentCriteria] = useState<CadenceEnrollmentCriteria>(
    cadence?.enrollmentCriteria || { autoEnroll: false }
  );
  const [exitCriteria, setExitCriteria] = useState<CadenceExitCriteria>(
    cadence?.exitCriteria || { onReply: true, onTaskComplete: false, onStageChange: true }
  );
  const [isStepDialogOpen, setIsStepDialogOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<CadenceStep | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  // Mock data
  const users = [
    { id: '1', name: 'João Silva', email: 'joao@jttelecom.com.br' },
    { id: '2', name: 'Maria Santos', email: 'maria@jttelecom.com.br' }
  ];
  
  const emailTemplates = [
    { id: '1', name: 'Primeiro Contato', subject: 'Olá {{nome}}!' },
    { id: '2', name: 'Follow-up 1', subject: 'Ainda interessado?' },
    { id: '3', name: 'Follow-up 2', subject: 'Última tentativa' }
  ];

  const whatsappTemplates = [
    { id: '1', name: 'Primeira Mensagem', message: 'Oi {{nome}}! Tudo bem?' },
    { id: '2', name: 'Follow-up WhatsApp', message: 'Oi {{nome}}, posso ajudar?' }
  ];

  useEffect(() => {
    validateCadence();
  }, [name, steps, type]);

  const validateCadence = () => {
    const newErrors: string[] = [];

    if (!name.trim()) {
      newErrors.push('Nome da cadência é obrigatório');
    }

    if (steps.length === 0) {
      newErrors.push('Pelo menos um passo é obrigatório');
    }

    // Validar cada step
    steps.forEach((step, index) => {
      if (!step.name.trim()) {
        newErrors.push(`Passo ${index + 1}: Nome é obrigatório`);
      }
      
      if (step.type === StepType.EMAIL && !step.config.emailTemplateId && !step.config.emailSubject) {
        newErrors.push(`Passo ${index + 1}: Template ou assunto do e-mail é obrigatório`);
      }
      
      if (step.type === StepType.WHATSAPP && !step.config.whatsappTemplateId && !step.config.whatsappMessage) {
        newErrors.push(`Passo ${index + 1}: Template ou mensagem WhatsApp é obrigatória`);
      }
      
      if (step.type === StepType.TASK && !step.config.taskTitle) {
        newErrors.push(`Passo ${index + 1}: Título da tarefa é obrigatório`);
      }
    });

    setErrors(newErrors);
  };

  const addStep = () => {
    setEditingStep(null);
    setIsStepDialogOpen(true);
  };

  const editStep = (step: CadenceStep) => {
    setEditingStep(step);
    setIsStepDialogOpen(true);
  };

  const saveStep = (step: CadenceStep) => {
    if (editingStep) {
      setSteps(prev => prev.map(s => s.id === editingStep.id ? step : s));
    } else {
      const newStep = {
        ...step,
        id: Date.now().toString(),
        order: steps.length
      };
      setSteps(prev => [...prev, newStep]);
    }
    setIsStepDialogOpen(false);
    setEditingStep(null);
  };

  const deleteStep = (stepId: string) => {
    setSteps(prev => prev.filter(s => s.id !== stepId));
  };

  const moveStep = (stepId: string, direction: 'up' | 'down') => {
    const stepIndex = steps.findIndex(s => s.id === stepId);
    if (stepIndex === -1) return;

    const newSteps = [...steps];
    const targetIndex = direction === 'up' ? stepIndex - 1 : stepIndex + 1;

    if (targetIndex >= 0 && targetIndex < newSteps.length) {
      [newSteps[stepIndex], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[stepIndex]];
      
      // Atualizar ordem
      newSteps.forEach((step, index) => {
        step.order = index;
      });
      
      setSteps(newSteps);
    }
  };

  const duplicateStep = (step: CadenceStep) => {
    const newStep = {
      ...step,
      id: Date.now().toString(),
      name: `${step.name} (Cópia)`,
      order: steps.length
    };
    setSteps(prev => [...prev, newStep]);
  };

  const handleSave = () => {
    if (errors.length > 0) return;

    const cadenceData: Partial<Cadence> = {
      name,
      description,
      type,
      steps,
      enrollmentCriteria,
      exitCriteria,
      isActive: true
    };

    onSave(cadenceData);
  };

  const getStepIcon = (stepType: StepType) => {
    switch (stepType) {
      case StepType.EMAIL: return Mail;
      case StepType.WHATSAPP: return MessageSquare;
      case StepType.TASK: return Calendar;
      case StepType.CALL: return Phone;
      case StepType.WAIT: return Clock;
      default: return Calendar;
    }
  };

  const getStepTypeLabel = (stepType: StepType) => {
    switch (stepType) {
      case StepType.EMAIL: return 'E-mail';
      case StepType.WHATSAPP: return 'WhatsApp';
      case StepType.TASK: return 'Tarefa';
      case StepType.CALL: return 'Ligação';
      case StepType.WAIT: return 'Aguardar';
      default: return 'Desconhecido';
    }
  };

  const getCadenceTypeLabel = (cadenceType: CadenceType) => {
    switch (cadenceType) {
      case CadenceType.PROSPECTING: return 'Prospecção';
      case CadenceType.FOLLOW_UP: return 'Follow-up';
      case CadenceType.POST_MEETING: return 'Pós-Reunião';
      case CadenceType.CUSTOMER_SUCCESS: return 'Customer Success';
      case CadenceType.REACTIVATION: return 'Reativação';
      default: return 'Personalizada';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">
            {cadence ? 'Editar Cadência' : 'Nova Cadência'}
          </h2>
          <p className="text-gray-500">
            Configure sequências automatizadas de contato
          </p>
        </div>
        
        <div className="flex gap-2">
          {cadence && onTest && (
            <Button variant="outline" onClick={() => onTest(cadence)}>
              <Play className="h-4 w-4 mr-2" />
              Testar
            </Button>
          )}
          <Button 
            onClick={handleSave}
            disabled={errors.length > 0}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Salvar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configurações Gerais */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Nome da cadência *</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Prospecção B2B"
                />
              </div>
              
              <div>
                <Label>Descrição</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva o objetivo desta cadência..."
                  rows={3}
                />
              </div>
              
              <div>
                <Label>Tipo de cadência</Label>
                <Select value={type} onValueChange={(value) => setType(value as CadenceType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(CadenceType).map(cadenceType => (
                      <SelectItem key={cadenceType} value={cadenceType}>
                        {getCadenceTypeLabel(cadenceType)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Critérios de Inscrição */}
          <Card>
            <CardHeader>
              <CardTitle>Critérios de Inscrição</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Inscrição automática</Label>
                <Switch
                  checked={enrollmentCriteria.autoEnroll}
                  onCheckedChange={(checked) => 
                    setEnrollmentCriteria(prev => ({ ...prev, autoEnroll: checked }))
                  }
                />
              </div>
              
              {enrollmentCriteria.autoEnroll && (
                <div className="space-y-2">
                  <Label>Condições (opcional)</Label>
                  <Textarea
                    value={enrollmentCriteria.conditions || ''}
                    onChange={(e) => 
                      setEnrollmentCriteria(prev => ({ ...prev, conditions: e.target.value }))
                    }
                    placeholder="Ex: origem = 'Site' AND status = 'Novo'"
                    rows={2}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Critérios de Saída */}
          <Card>
            <CardHeader>
              <CardTitle>Critérios de Saída</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Sair ao responder</Label>
                  <Switch
                    checked={exitCriteria.onReply}
                    onCheckedChange={(checked) => 
                      setExitCriteria(prev => ({ ...prev, onReply: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Sair ao completar tarefa</Label>
                  <Switch
                    checked={exitCriteria.onTaskComplete}
                    onCheckedChange={(checked) => 
                      setExitCriteria(prev => ({ ...prev, onTaskComplete: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Sair ao mudar etapa</Label>
                  <Switch
                    checked={exitCriteria.onStageChange}
                    onCheckedChange={(checked) => 
                      setExitCriteria(prev => ({ ...prev, onStageChange: checked }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sequência de Passos */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Sequência de Passos</span>
                <Button onClick={addStep} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Passo
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {steps.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum passo configurado
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Adicione passos para criar sua sequência de cadência
                  </p>
                  <Button onClick={addStep}>
                    <Plus className="h-4 w-4 mr-2" />
                    Primeiro Passo
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {steps.map((step, index) => {
                    const Icon = getStepIcon(step.type);
                    return (
                      <div key={step.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                              <span className="text-sm font-medium text-blue-600">
                                {index + 1}
                              </span>
                            </div>
                            <Icon className="h-5 w-5 text-gray-600" />
                            <div>
                              <h4 className="font-medium">{step.name}</h4>
                              <p className="text-sm text-gray-500">
                                {getStepTypeLabel(step.type)} • Dia {step.dayOffset}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => moveStep(step.id, 'up')}
                              disabled={index === 0}
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => moveStep(step.id, 'down')}
                              disabled={index === steps.length - 1}
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => duplicateStep(step)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => editStep(step)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteStep(step.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {step.description && (
                          <p className="text-sm text-gray-600 ml-11">
                            {step.description}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Erros de Validação */}
      {errors.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-800 font-medium mb-2">
              <AlertCircle className="h-4 w-4" />
              Configuração incompleta
            </div>
            <ul className="text-sm text-red-700 space-y-1">
              {errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Step Dialog */}
      <StepDialog
        isOpen={isStepDialogOpen}
        onClose={() => setIsStepDialogOpen(false)}
        step={editingStep}
        onSave={saveStep}
        users={users}
        emailTemplates={emailTemplates}
        whatsappTemplates={whatsappTemplates}
      />
    </div>
  );
};

// Componente para o diálogo de configuração de passo
interface StepDialogProps {
  isOpen: boolean;
  onClose: () => void;
  step: CadenceStep | null;
  onSave: (step: CadenceStep) => void;
  users: any[];
  emailTemplates: any[];
  whatsappTemplates: any[];
}

const StepDialog: React.FC<StepDialogProps> = ({
  isOpen,
  onClose,
  step,
  onSave,
  users,
  emailTemplates,
  whatsappTemplates
}) => {
  const [name, setName] = useState(step?.name || '');
  const [description, setDescription] = useState(step?.description || '');
  const [type, setType] = useState<StepType>(step?.type || StepType.EMAIL);
  const [dayOffset, setDayOffset] = useState(step?.dayOffset || 0);
  const [config, setConfig] = useState(step?.config || {});

  useEffect(() => {
    if (step) {
      setName(step.name);
      setDescription(step.description || '');
      setType(step.type);
      setDayOffset(step.dayOffset);
      setConfig(step.config);
    } else {
      setName('');
      setDescription('');
      setType(StepType.EMAIL);
      setDayOffset(0);
      setConfig({});
    }
  }, [step]);

  const handleSave = () => {
    const stepData: CadenceStep = {
      id: step?.id || '',
      name,
      description,
      type,
      dayOffset,
      config,
      order: step?.order || 0
    };

    onSave(stepData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {step ? 'Editar Passo' : 'Novo Passo'}
          </DialogTitle>
          <DialogDescription>
            Configure as ações que serão executadas neste passo da cadência
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Nome do passo *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Primeiro contato"
              />
            </div>
            
            <div>
              <Label>Dia da execução</Label>
              <Input
                type="number"
                min="0"
                value={dayOffset}
                onChange={(e) => setDayOffset(parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
          </div>
          
          <div>
            <Label>Descrição</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o objetivo deste passo..."
              rows={2}
            />
          </div>
          
          <div>
            <Label>Tipo de ação</Label>
            <Select value={type} onValueChange={(value) => setType(value as StepType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={StepType.EMAIL}>E-mail</SelectItem>
                <SelectItem value={StepType.WHATSAPP}>WhatsApp</SelectItem>
                <SelectItem value={StepType.TASK}>Tarefa</SelectItem>
                <SelectItem value={StepType.CALL}>Ligação</SelectItem>
                <SelectItem value={StepType.WAIT}>Aguardar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Configurações específicas por tipo */}
          {type === StepType.EMAIL && (
            <div className="space-y-4">
              <div>
                <Label>Template de e-mail</Label>
                <Select 
                  value={config.emailTemplateId || ''} 
                  onValueChange={(value) => setConfig(prev => ({ ...prev, emailTemplateId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um template" />
                  </SelectTrigger>
                  <SelectContent>
                    {emailTemplates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name} - {template.subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {type === StepType.WHATSAPP && (
            <div className="space-y-4">
              <div>
                <Label>Template WhatsApp</Label>
                <Select 
                  value={config.whatsappTemplateId || ''} 
                  onValueChange={(value) => setConfig(prev => ({ ...prev, whatsappTemplateId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um template" />
                  </SelectTrigger>
                  <SelectContent>
                    {whatsappTemplates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {type === StepType.TASK && (
            <div className="space-y-4">
              <div>
                <Label>Título da tarefa</Label>
                <Input
                  value={config.taskTitle || ''}
                  onChange={(e) => setConfig(prev => ({ ...prev, taskTitle: e.target.value }))}
                  placeholder="Ex: Ligar para {{nome}}"
                />
              </div>
              
              <div>
                <Label>Responsável</Label>
                <Select 
                  value={config.assignedUserId || ''} 
                  onValueChange={(value) => setConfig(prev => ({ ...prev, assignedUserId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o responsável" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {type === StepType.WAIT && (
            <div>
              <Label>Tempo de espera (horas)</Label>
              <Input
                type="number"
                min="1"
                value={config.waitHours || 24}
                onChange={(e) => setConfig(prev => ({ ...prev, waitHours: parseInt(e.target.value) || 24 }))}
                placeholder="24"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Salvar Passo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CadenceBuilder;

