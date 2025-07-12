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
  TriggerType, 
  TriggerConfig, 
  AutomationTrigger 
} from '@/types/automation';
import { 
  Users, 
  ArrowRight, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Tag, 
  Target,
  Mail,
  FileText,
  Calendar
} from 'lucide-react';

interface TriggerConfigFormProps {
  trigger: AutomationTrigger;
  onChange: (trigger: AutomationTrigger) => void;
  onValidate: (isValid: boolean) => void;
}

const TriggerConfigForm: React.FC<TriggerConfigFormProps> = ({
  trigger,
  onChange,
  onValidate
}) => {
  const [config, setConfig] = useState<TriggerConfig>(trigger.config || {});
  const [errors, setErrors] = useState<string[]>([]);

  // Mock data - em produção viria da API
  const leadSources = ['Site', 'Instagram', 'Facebook', 'Indicação', 'Prospecção Ativa'];
  const leadStatuses = ['Novo', 'Qualificado', 'Proposta', 'Negociação', 'Fechado'];
  const stages = [
    { id: '1', name: 'Primeiro Contato' },
    { id: '2', name: 'Qualificação' },
    { id: '3', name: 'Proposta' },
    { id: '4', name: 'Negociação' },
    { id: '5', name: 'Fechamento' }
  ];
  const tags = [
    { id: '1', name: 'VIP', color: 'gold' },
    { id: '2', name: 'Urgente', color: 'red' },
    { id: '3', name: 'Qualificado', color: 'green' }
  ];
  const contractTypes = ['Mensal', 'Anual', 'Personalizado'];

  useEffect(() => {
    validateConfig();
  }, [config, trigger.type]);

  const validateConfig = () => {
    const newErrors: string[] = [];

    switch (trigger.type) {
      case TriggerType.LEAD_INACTIVITY:
      case TriggerType.CLIENT_NO_TASK:
        if (!config.inactivityDays || config.inactivityDays < 1) {
          newErrors.push('Dias de inatividade deve ser maior que 0');
        }
        break;
      
      case TriggerType.LEAD_STAGE_CHANGE:
        if (!config.toStageId) {
          newErrors.push('Etapa de destino é obrigatória');
        }
        break;
      
      case TriggerType.TAG_APPLIED:
        if (!config.tagId) {
          newErrors.push('Tag é obrigatória');
        }
        break;
      
      case TriggerType.SCORE_REACHED:
        if (!config.scoreThreshold || config.scoreThreshold < 0) {
          newErrors.push('Pontuação deve ser maior ou igual a 0');
        }
        break;
      
      case TriggerType.CONTRACT_EXPIRING:
        if (!config.daysBeforeExpiry || config.daysBeforeExpiry < 1) {
          newErrors.push('Dias antes do vencimento deve ser maior que 0');
        }
        break;
    }

    setErrors(newErrors);
    const isValid = newErrors.length === 0;
    onValidate(isValid);
    
    if (isValid) {
      onChange({ ...trigger, config });
    }
  };

  const updateConfig = (updates: Partial<TriggerConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const getTriggerIcon = () => {
    switch (trigger.type) {
      case TriggerType.NEW_LEAD: return Users;
      case TriggerType.LEAD_STAGE_CHANGE: return ArrowRight;
      case TriggerType.LEAD_INACTIVITY: return Clock;
      case TriggerType.CLIENT_NO_TASK: return AlertCircle;
      case TriggerType.CONTRACT_SIGNED: return CheckCircle;
      case TriggerType.CONTRACT_EXPIRED: return AlertCircle;
      case TriggerType.CONTRACT_EXPIRING: return Calendar;
      case TriggerType.TAG_APPLIED: return Tag;
      case TriggerType.SCORE_REACHED: return Target;
      case TriggerType.MAUTIC_EMAIL_OPENED: return Mail;
      case TriggerType.MAUTIC_EMAIL_CLICKED: return Mail;
      case TriggerType.MAUTIC_FORM_SUBMITTED: return FileText;
      default: return Users;
    }
  };

  const getTriggerTitle = () => {
    switch (trigger.type) {
      case TriggerType.NEW_LEAD: return 'Novo Lead Criado';
      case TriggerType.LEAD_STAGE_CHANGE: return 'Lead Muda de Etapa';
      case TriggerType.LEAD_INACTIVITY: return 'Lead Sem Interação';
      case TriggerType.CLIENT_NO_TASK: return 'Cliente Sem Tarefa';
      case TriggerType.CONTRACT_SIGNED: return 'Contrato Assinado';
      case TriggerType.CONTRACT_EXPIRED: return 'Contrato Vencido';
      case TriggerType.CONTRACT_EXPIRING: return 'Contrato Vencendo';
      case TriggerType.TAG_APPLIED: return 'Tag Aplicada';
      case TriggerType.SCORE_REACHED: return 'Pontuação Atingida';
      case TriggerType.MAUTIC_EMAIL_OPENED: return 'E-mail Aberto (Mautic)';
      case TriggerType.MAUTIC_EMAIL_CLICKED: return 'E-mail Clicado (Mautic)';
      case TriggerType.MAUTIC_FORM_SUBMITTED: return 'Formulário Enviado (Mautic)';
      default: return 'Gatilho';
    }
  };

  const Icon = getTriggerIcon();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          {getTriggerTitle()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Novo Lead */}
        {trigger.type === TriggerType.NEW_LEAD && (
          <div className="space-y-4">
            <div>
              <Label>Origem do Lead (opcional)</Label>
              <Select 
                value={config.leadSource || ''} 
                onValueChange={(value) => updateConfig({ leadSource: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Qualquer origem" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Qualquer origem</SelectItem>
                  {leadSources.map(source => (
                    <SelectItem key={source} value={source}>{source}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Status inicial (opcional)</Label>
              <Select 
                value={config.leadStatus || ''} 
                onValueChange={(value) => updateConfig({ leadStatus: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Qualquer status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Qualquer status</SelectItem>
                  {leadStatuses.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Mudança de Etapa */}
        {trigger.type === TriggerType.LEAD_STAGE_CHANGE && (
          <div className="space-y-4">
            <div>
              <Label>Etapa de origem (opcional)</Label>
              <Select 
                value={config.fromStageId || ''} 
                onValueChange={(value) => updateConfig({ fromStageId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Qualquer etapa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Qualquer etapa</SelectItem>
                  {stages.map(stage => (
                    <SelectItem key={stage.id} value={stage.id}>{stage.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Etapa de destino *</Label>
              <Select 
                value={config.toStageId || ''} 
                onValueChange={(value) => updateConfig({ toStageId: value })}
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
          </div>
        )}

        {/* Inatividade */}
        {(trigger.type === TriggerType.LEAD_INACTIVITY || trigger.type === TriggerType.CLIENT_NO_TASK) && (
          <div className="space-y-4">
            <div>
              <Label>Dias de inatividade *</Label>
              <Input
                type="number"
                min="1"
                value={config.inactivityDays || ''}
                onChange={(e) => updateConfig({ inactivityDays: parseInt(e.target.value) })}
                placeholder="Ex: 3"
              />
              <p className="text-sm text-gray-500 mt-1">
                Disparar após X dias sem interação
              </p>
            </div>
          </div>
        )}

        {/* Tag Aplicada */}
        {trigger.type === TriggerType.TAG_APPLIED && (
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

        {/* Pontuação Atingida */}
        {trigger.type === TriggerType.SCORE_REACHED && (
          <div>
            <Label>Pontuação mínima *</Label>
            <Input
              type="number"
              min="0"
              value={config.scoreThreshold || ''}
              onChange={(e) => updateConfig({ scoreThreshold: parseInt(e.target.value) })}
              placeholder="Ex: 100"
            />
            <p className="text-sm text-gray-500 mt-1">
              Disparar quando lead atingir esta pontuação
            </p>
          </div>
        )}

        {/* Contrato Assinado */}
        {trigger.type === TriggerType.CONTRACT_SIGNED && (
          <div>
            <Label>Tipo de contrato (opcional)</Label>
            <Select 
              value={config.contractType || ''} 
              onValueChange={(value) => updateConfig({ contractType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Qualquer tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Qualquer tipo</SelectItem>
                {contractTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Contrato Vencendo */}
        {trigger.type === TriggerType.CONTRACT_EXPIRING && (
          <div>
            <Label>Dias antes do vencimento *</Label>
            <Input
              type="number"
              min="1"
              value={config.daysBeforeExpiry || ''}
              onChange={(e) => updateConfig({ daysBeforeExpiry: parseInt(e.target.value) })}
              placeholder="Ex: 30"
            />
            <p className="text-sm text-gray-500 mt-1">
              Disparar X dias antes do vencimento
            </p>
          </div>
        )}

        {/* Mautic - E-mail Aberto/Clicado */}
        {(trigger.type === TriggerType.MAUTIC_EMAIL_OPENED || trigger.type === TriggerType.MAUTIC_EMAIL_CLICKED) && (
          <div>
            <Label>ID da Campanha Mautic (opcional)</Label>
            <Input
              value={config.mauticCampaignId || ''}
              onChange={(e) => updateConfig({ mauticCampaignId: e.target.value })}
              placeholder="Ex: 123"
            />
            <p className="text-sm text-gray-500 mt-1">
              Deixe vazio para qualquer campanha
            </p>
          </div>
        )}

        {/* Mautic - Formulário Enviado */}
        {trigger.type === TriggerType.MAUTIC_FORM_SUBMITTED && (
          <div>
            <Label>ID do Formulário Mautic *</Label>
            <Input
              value={config.mauticFormId || ''}
              onChange={(e) => updateConfig({ mauticFormId: e.target.value })}
              placeholder="Ex: 456"
            />
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

export default TriggerConfigForm;

