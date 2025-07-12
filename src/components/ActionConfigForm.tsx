import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  ActionType, 
  ActionConfig, 
  AutomationAction 
} from '@/types/automation';
import { 
  Calendar, 
  Mail, 
  MessageSquare, 
  Tag, 
  ArrowRight, 
  Webhook, 
  Bell,
  Edit,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  FileText
} from 'lucide-react';

interface ActionConfigFormProps {
  action: AutomationAction;
  onChange: (action: AutomationAction) => void;
  onValidate: (isValid: boolean) => void;
}

const ActionConfigForm: React.FC<ActionConfigFormProps> = ({
  action,
  onChange,
  onValidate
}) => {
  const [config, setConfig] = useState<ActionConfig>(action.config || {});
  const [errors, setErrors] = useState<string[]>([]);

  // Mock data - em produção viria da API
  const users = [
    { id: '1', name: 'João Silva', email: 'joao@jttelecom.com.br' },
    { id: '2', name: 'Maria Santos', email: 'maria@jttelecom.com.br' },
    { id: '3', name: 'Pedro Costa', email: 'pedro@jttelecom.com.br' }
  ];
  
  const emailTemplates = [
    { id: '1', name: 'Boas-vindas Lead', subject: 'Bem-vindo!' },
    { id: '2', name: 'Follow-up Proposta', subject: 'Sua proposta está pronta' },
    { id: '3', name: 'Lembrete Reunião', subject: 'Reunião agendada' }
  ];
  
  const whatsappTemplates = [
    { id: '1', name: 'Primeira Mensagem', message: 'Olá {{nome}}! Obrigado pelo interesse.' },
    { id: '2', name: 'Follow-up WhatsApp', message: 'Oi {{nome}}, como posso ajudar?' }
  ];
  
  const tags = [
    { id: '1', name: 'VIP', color: 'gold' },
    { id: '2', name: 'Urgente', color: 'red' },
    { id: '3', name: 'Qualificado', color: 'green' },
    { id: '4', name: 'Follow-up', color: 'blue' }
  ];
  
  const stages = [
    { id: '1', name: 'Primeiro Contato' },
    { id: '2', name: 'Qualificação' },
    { id: '3', name: 'Proposta' },
    { id: '4', name: 'Negociação' },
    { id: '5', name: 'Fechamento' }
  ];

  const availableVariables = [
    '{{nome}}', '{{email}}', '{{telefone}}', '{{empresa}}', 
    '{{responsavel}}', '{{data_atual}}', '{{hora_atual}}',
    '{{etapa}}', '{{origem}}', '{{pontuacao}}'
  ];

  useEffect(() => {
    validateConfig();
  }, [config, action.type]);

  const validateConfig = () => {
    const newErrors: string[] = [];

    switch (action.type) {
      case ActionType.CREATE_TASK:
        if (!config.taskTitle) {
          newErrors.push('Título da tarefa é obrigatório');
        }
        if (!config.assignedUserId) {
          newErrors.push('Responsável pela tarefa é obrigatório');
        }
        break;
      
      case ActionType.SEND_EMAIL:
        if (!config.emailTemplateId && !config.emailSubject) {
          newErrors.push('Template ou assunto do e-mail é obrigatório');
        }
        if (!config.emailTemplateId && !config.emailBody) {
          newErrors.push('Template ou corpo do e-mail é obrigatório');
        }
        break;
      
      case ActionType.SEND_WHATSAPP:
        if (!config.whatsappTemplateId && !config.whatsappMessage) {
          newErrors.push('Template ou mensagem WhatsApp é obrigatória');
        }
        break;
      
      case ActionType.APPLY_TAG:
      case ActionType.REMOVE_TAG:
        if (!config.tagId) {
          newErrors.push('Tag é obrigatória');
        }
        break;
      
      case ActionType.MOVE_STAGE:
        if (!config.targetStageId) {
          newErrors.push('Etapa de destino é obrigatória');
        }
        break;
      
      case ActionType.SEND_WEBHOOK:
        if (!config.webhookUrl) {
          newErrors.push('URL do webhook é obrigatória');
        }
        break;
      
      case ActionType.NOTIFY_USER:
        if (!config.notificationMessage) {
          newErrors.push('Mensagem de notificação é obrigatória');
        }
        if (!config.notificationUsers || config.notificationUsers.length === 0) {
          newErrors.push('Pelo menos um usuário deve ser notificado');
        }
        break;
    }

    setErrors(newErrors);
    const isValid = newErrors.length === 0;
    onValidate(isValid);
    
    if (isValid) {
      onChange({ ...action, config });
    }
  };

  const updateConfig = (updates: Partial<ActionConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const getActionIcon = () => {
    switch (action.type) {
      case ActionType.CREATE_TASK: return Calendar;
      case ActionType.SEND_EMAIL: return Mail;
      case ActionType.SEND_WHATSAPP: return MessageSquare;
      case ActionType.APPLY_TAG: return Tag;
      case ActionType.REMOVE_TAG: return Tag;
      case ActionType.MOVE_STAGE: return ArrowRight;
      case ActionType.SEND_WEBHOOK: return Webhook;
      case ActionType.NOTIFY_USER: return Bell;
      case ActionType.UPDATE_FIELD: return Edit;
      default: return Calendar;
    }
  };

  const getActionTitle = () => {
    switch (action.type) {
      case ActionType.CREATE_TASK: return 'Criar Tarefa';
      case ActionType.SEND_EMAIL: return 'Enviar E-mail';
      case ActionType.SEND_WHATSAPP: return 'Enviar WhatsApp';
      case ActionType.APPLY_TAG: return 'Aplicar Tag';
      case ActionType.REMOVE_TAG: return 'Remover Tag';
      case ActionType.MOVE_STAGE: return 'Mover Etapa';
      case ActionType.SEND_WEBHOOK: return 'Enviar Webhook';
      case ActionType.NOTIFY_USER: return 'Notificar Usuário';
      case ActionType.UPDATE_FIELD: return 'Atualizar Campo';
      default: return 'Ação';
    }
  };

  const Icon = getActionIcon();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          {getActionTitle()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Delay */}
        <div>
          <Label>Delay (minutos)</Label>
          <Input
            type="number"
            min="0"
            value={action.delay || 0}
            onChange={(e) => onChange({ ...action, delay: parseInt(e.target.value) || 0 })}
            placeholder="0"
          />
          <p className="text-sm text-gray-500 mt-1">
            Aguardar antes de executar esta ação
          </p>
        </div>

        {/* Criar Tarefa */}
        {action.type === ActionType.CREATE_TASK && (
          <div className="space-y-4">
            <div>
              <Label>Título da tarefa *</Label>
              <Input
                value={config.taskTitle || ''}
                onChange={(e) => updateConfig({ taskTitle: e.target.value })}
                placeholder="Ex: Ligar para {{nome}}"
              />
            </div>
            
            <div>
              <Label>Descrição</Label>
              <Textarea
                value={config.taskDescription || ''}
                onChange={(e) => updateConfig({ taskDescription: e.target.value })}
                placeholder="Detalhes da tarefa..."
                rows={3}
              />
            </div>
            
            <div>
              <Label>Responsável *</Label>
              <Select 
                value={config.assignedUserId || ''} 
                onValueChange={(value) => updateConfig({ assignedUserId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o responsável" />
                </SelectTrigger>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Prazo (dias a partir de hoje)</Label>
              <Input
                type="number"
                min="0"
                value={config.taskDueDate || ''}
                onChange={(e) => updateConfig({ taskDueDate: parseInt(e.target.value) })}
                placeholder="Ex: 1"
              />
            </div>
            
            <div>
              <Label>Prioridade</Label>
              <Select 
                value={config.taskPriority || 'medium'} 
                onValueChange={(value) => updateConfig({ taskPriority: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Enviar E-mail */}
        {action.type === ActionType.SEND_EMAIL && (
          <div className="space-y-4">
            <div>
              <Label>Template de e-mail</Label>
              <Select 
                value={config.emailTemplateId || ''} 
                onValueChange={(value) => updateConfig({ emailTemplateId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um template ou configure manualmente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Configurar manualmente</SelectItem>
                  {emailTemplates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name} - {template.subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {!config.emailTemplateId && (
              <>
                <div>
                  <Label>Remetente</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={config.fromName || ''}
                      onChange={(e) => updateConfig({ fromName: e.target.value })}
                      placeholder="Nome do remetente"
                    />
                    <Input
                      value={config.fromEmail || ''}
                      onChange={(e) => updateConfig({ fromEmail: e.target.value })}
                      placeholder="email@jttelecom.com.br"
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Assunto *</Label>
                  <Input
                    value={config.emailSubject || ''}
                    onChange={(e) => updateConfig({ emailSubject: e.target.value })}
                    placeholder="Ex: Olá {{nome}}, temos uma proposta para você!"
                  />
                </div>
                
                <div>
                  <Label>Corpo do e-mail *</Label>
                  <Textarea
                    value={config.emailBody || ''}
                    onChange={(e) => updateConfig({ emailBody: e.target.value })}
                    placeholder="Conteúdo do e-mail..."
                    rows={6}
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* Enviar WhatsApp */}
        {action.type === ActionType.SEND_WHATSAPP && (
          <div className="space-y-4">
            <div>
              <Label>Template WhatsApp</Label>
              <Select 
                value={config.whatsappTemplateId || ''} 
                onValueChange={(value) => updateConfig({ whatsappTemplateId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um template ou configure manualmente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Configurar manualmente</SelectItem>
                  {whatsappTemplates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {!config.whatsappTemplateId && (
              <div>
                <Label>Mensagem *</Label>
                <Textarea
                  value={config.whatsappMessage || ''}
                  onChange={(e) => updateConfig({ whatsappMessage: e.target.value })}
                  placeholder="Ex: Olá {{nome}}! Como posso ajudar você hoje?"
                  rows={4}
                />
              </div>
            )}
          </div>
        )}

        {/* Aplicar/Remover Tag */}
        {(action.type === ActionType.APPLY_TAG || action.type === ActionType.REMOVE_TAG) && (
          <div>
            <Label>Tag *</Label>
            <Select 
              value={config.tagId || ''} 
              onValueChange={(value) => updateConfig({ tagId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a tag" />
              </SelectTrigger>
              <SelectContent>
                {tags.map(tag => (
                  <SelectItem key={tag.id} value={tag.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: tag.color }}
                      />
                      {tag.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Mover Etapa */}
        {action.type === ActionType.MOVE_STAGE && (
          <div>
            <Label>Etapa de destino *</Label>
            <Select 
              value={config.targetStageId || ''} 
              onValueChange={(value) => updateConfig({ targetStageId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a etapa" />
              </SelectTrigger>
              <SelectContent>
                {stages.map(stage => (
                  <SelectItem key={stage.id} value={stage.id}>{stage.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Enviar Webhook */}
        {action.type === ActionType.SEND_WEBHOOK && (
          <div className="space-y-4">
            <div>
              <Label>URL do webhook *</Label>
              <Input
                value={config.webhookUrl || ''}
                onChange={(e) => updateConfig({ webhookUrl: e.target.value })}
                placeholder="https://api.exemplo.com/webhook"
              />
            </div>
            
            <div>
              <Label>Método HTTP</Label>
              <Select 
                value={config.webhookMethod || 'POST'} 
                onValueChange={(value) => updateConfig({ webhookMethod: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Corpo da requisição (JSON)</Label>
              <Textarea
                value={config.webhookBody || ''}
                onChange={(e) => updateConfig({ webhookBody: e.target.value })}
                placeholder='{"lead_id": "{{id}}", "nome": "{{nome}}"}'
                rows={4}
              />
            </div>
          </div>
        )}

        {/* Notificar Usuário */}
        {action.type === ActionType.NOTIFY_USER && (
          <div className="space-y-4">
            <div>
              <Label>Mensagem *</Label>
              <Textarea
                value={config.notificationMessage || ''}
                onChange={(e) => updateConfig({ notificationMessage: e.target.value })}
                placeholder="Ex: Novo lead {{nome}} precisa de atenção"
                rows={3}
              />
            </div>
            
            <div>
              <Label>Usuários a notificar *</Label>
              <div className="space-y-2">
                {users.map(user => (
                  <div key={user.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`user-${user.id}`}
                      checked={config.notificationUsers?.includes(user.id) || false}
                      onChange={(e) => {
                        const currentUsers = config.notificationUsers || [];
                        if (e.target.checked) {
                          updateConfig({ 
                            notificationUsers: [...currentUsers, user.id] 
                          });
                        } else {
                          updateConfig({ 
                            notificationUsers: currentUsers.filter(id => id !== user.id) 
                          });
                        }
                      }}
                      className="rounded"
                    />
                    <label htmlFor={`user-${user.id}`} className="text-sm">
                      {user.name} ({user.email})
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Atualizar Campo */}
        {action.type === ActionType.UPDATE_FIELD && (
          <div className="space-y-4">
            <div>
              <Label>Nome do campo *</Label>
              <Input
                value={config.fieldName || ''}
                onChange={(e) => updateConfig({ fieldName: e.target.value })}
                placeholder="Ex: observacoes"
              />
            </div>
            
            <div>
              <Label>Valor *</Label>
              <Input
                value={config.fieldValue || ''}
                onChange={(e) => updateConfig({ fieldValue: e.target.value })}
                placeholder="Ex: Lead processado automaticamente"
              />
            </div>
          </div>
        )}

        {/* Variáveis Disponíveis */}
        {(action.type === ActionType.SEND_EMAIL || 
          action.type === ActionType.SEND_WHATSAPP || 
          action.type === ActionType.CREATE_TASK ||
          action.type === ActionType.NOTIFY_USER) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-blue-800 font-medium mb-2">
              <FileText className="h-4 w-4" />
              Variáveis disponíveis
            </div>
            <div className="flex flex-wrap gap-1">
              {availableVariables.map(variable => (
                <Badge key={variable} variant="outline" className="text-xs">
                  {variable}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Erros de Validação */}
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-red-800 font-medium mb-2">
              <AlertCircle className="h-4 w-4" />
              Configuração incompleta
            </div>
            <ul className="text-sm text-red-700 space-y-1">
              {errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Status de Validação */}
        {errors.length === 0 && Object.keys(config).length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-800 font-medium">
              <CheckCircle className="h-4 w-4" />
              Configuração válida
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActionConfigForm;

