import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Calendar, 
  Clock, 
  Mail, 
  MessageSquare, 
  Phone, 
  Tag, 
  ArrowRight, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Eye
} from 'lucide-react';
import { 
  AutomationEvent, 
  AutomationEventType, 
  AutomationEventStatus 
} from '@/types/automation';
import { automationService } from '@/services/automationService';

interface AutomationHistoryProps {
  entityId: string;
  entityType: 'lead' | 'client';
  tenantId: string;
  limit?: number;
  showHeader?: boolean;
  className?: string;
}

const AutomationHistory: React.FC<AutomationHistoryProps> = ({
  entityId,
  entityType,
  tenantId,
  limit = 10,
  showHeader = true,
  className = ''
}) => {
  const [events, setEvents] = useState<AutomationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  
  useEffect(() => {
    loadEvents();
  }, [entityId, entityType, tenantId]);
  
  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await automationService.getEntityAutomationHistory(
        tenantId,
        entityType,
        entityId
      );
      setEvents(data);
    } catch (error) {
      console.error('Erro ao carregar histórico de automações:', error);
      
      // Mock para demonstração
      const mockEvents: AutomationEvent[] = [
        {
          id: '1',
          tenantId,
          entityId,
          entityType,
          automationId: 'auto_1',
          automationName: 'Cadência de Prospecção',
          eventType: AutomationEventType.CADENCE_ENROLLMENT,
          eventStatus: AutomationEventStatus.SUCCESS,
          details: {
            cadenceId: 'cad_1',
            cadenceName: 'Cadência de Prospecção',
            enrollmentDate: new Date().toISOString()
          },
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 dias atrás
          createdBy: 'system'
        },
        {
          id: '2',
          tenantId,
          entityId,
          entityType,
          automationId: 'auto_1',
          automationName: 'Cadência de Prospecção',
          eventType: AutomationEventType.EMAIL_SENT,
          eventStatus: AutomationEventStatus.SUCCESS,
          details: {
            emailId: 'email_1',
            emailSubject: 'Bem-vindo à JT Telecom!',
            emailTemplate: 'welcome_email',
            sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString()
          },
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 dias atrás
          createdBy: 'system'
        },
        {
          id: '3',
          tenantId,
          entityId,
          entityType,
          automationId: 'auto_1',
          automationName: 'Cadência de Prospecção',
          eventType: AutomationEventType.EMAIL_OPENED,
          eventStatus: AutomationEventStatus.SUCCESS,
          details: {
            emailId: 'email_1',
            emailSubject: 'Bem-vindo à JT Telecom!',
            openedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1.5).toISOString(),
            openCount: 2,
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X)'
          },
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1.5), // 1.5 dias atrás
          createdBy: 'system'
        },
        {
          id: '4',
          tenantId,
          entityId,
          entityType,
          automationId: 'auto_1',
          automationName: 'Cadência de Prospecção',
          eventType: AutomationEventType.TASK_CREATED,
          eventStatus: AutomationEventStatus.SUCCESS,
          details: {
            taskId: 'task_1',
            taskTitle: 'Ligar para cliente',
            assignedTo: 'user_1',
            assignedToName: 'Maria Vendas',
            dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString()
          },
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1), // 1 dia atrás
          createdBy: 'system'
        },
        {
          id: '5',
          tenantId,
          entityId,
          entityType,
          automationId: 'auto_1',
          automationName: 'Cadência de Prospecção',
          eventType: AutomationEventType.WHATSAPP_SENT,
          eventStatus: AutomationEventStatus.FAILED,
          details: {
            templateId: 'whatsapp_1',
            templateName: 'Lembrete de Reunião',
            error: 'Número de telefone inválido',
            attemptCount: 2
          },
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 horas atrás
          createdBy: 'system'
        },
        {
          id: '6',
          tenantId,
          entityId,
          entityType,
          automationId: 'auto_2',
          automationName: 'Automação de Tag',
          eventType: AutomationEventType.TAG_ADDED,
          eventStatus: AutomationEventStatus.SUCCESS,
          details: {
            tagId: 'tag_1',
            tagName: 'Lead Quente',
            tagColor: '#FF0000'
          },
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 horas atrás
          createdBy: 'user_1'
        },
        {
          id: '7',
          tenantId,
          entityId,
          entityType,
          automationId: 'auto_3',
          automationName: 'Automação de Etapa',
          eventType: AutomationEventType.STAGE_CHANGED,
          eventStatus: AutomationEventStatus.SUCCESS,
          details: {
            fromStage: 'Qualificação',
            toStage: 'Proposta',
            reason: 'Automático por pontuação'
          },
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 horas atrás
          createdBy: 'system'
        }
      ];
      
      setEvents(mockEvents);
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  const getEventIcon = (eventType: AutomationEventType) => {
    switch (eventType) {
      case AutomationEventType.CADENCE_ENROLLMENT:
        return <Calendar className="h-4 w-4 text-blue-600" />;
      case AutomationEventType.EMAIL_SENT:
      case AutomationEventType.EMAIL_OPENED:
      case AutomationEventType.EMAIL_CLICKED:
        return <Mail className="h-4 w-4 text-green-600" />;
      case AutomationEventType.WHATSAPP_SENT:
      case AutomationEventType.WHATSAPP_DELIVERED:
      case AutomationEventType.WHATSAPP_READ:
        return <MessageSquare className="h-4 w-4 text-green-600" />;
      case AutomationEventType.TASK_CREATED:
      case AutomationEventType.TASK_COMPLETED:
        return <Calendar className="h-4 w-4 text-orange-600" />;
      case AutomationEventType.CALL_SCHEDULED:
      case AutomationEventType.CALL_COMPLETED:
        return <Phone className="h-4 w-4 text-purple-600" />;
      case AutomationEventType.TAG_ADDED:
      case AutomationEventType.TAG_REMOVED:
        return <Tag className="h-4 w-4 text-indigo-600" />;
      case AutomationEventType.STAGE_CHANGED:
        return <ArrowRight className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };
  
  const getEventStatusIcon = (status: AutomationEventStatus) => {
    switch (status) {
      case AutomationEventStatus.SUCCESS:
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case AutomationEventStatus.FAILED:
        return <XCircle className="h-4 w-4 text-red-600" />;
      case AutomationEventStatus.PENDING:
        return <Clock className="h-4 w-4 text-orange-600" />;
      case AutomationEventStatus.CANCELED:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };
  
  const getEventTitle = (event: AutomationEvent) => {
    switch (event.eventType) {
      case AutomationEventType.CADENCE_ENROLLMENT:
        return `Inscrito na cadência "${event.details.cadenceName}"`;
      case AutomationEventType.EMAIL_SENT:
        return `E-mail enviado: "${event.details.emailSubject}"`;
      case AutomationEventType.EMAIL_OPENED:
        return `E-mail aberto: "${event.details.emailSubject}"`;
      case AutomationEventType.EMAIL_CLICKED:
        return `Link clicado no e-mail: "${event.details.emailSubject}"`;
      case AutomationEventType.WHATSAPP_SENT:
        return `WhatsApp enviado: "${event.details.templateName}"`;
      case AutomationEventType.WHATSAPP_DELIVERED:
        return `WhatsApp entregue: "${event.details.templateName}"`;
      case AutomationEventType.WHATSAPP_READ:
        return `WhatsApp lido: "${event.details.templateName}"`;
      case AutomationEventType.TASK_CREATED:
        return `Tarefa criada: "${event.details.taskTitle}"`;
      case AutomationEventType.TASK_COMPLETED:
        return `Tarefa concluída: "${event.details.taskTitle}"`;
      case AutomationEventType.CALL_SCHEDULED:
        return `Ligação agendada para ${formatDate(new Date(event.details.scheduledAt))}`;
      case AutomationEventType.CALL_COMPLETED:
        return `Ligação realizada (${event.details.duration}s)`;
      case AutomationEventType.TAG_ADDED:
        return `Tag adicionada: "${event.details.tagName}"`;
      case AutomationEventType.TAG_REMOVED:
        return `Tag removida: "${event.details.tagName}"`;
      case AutomationEventType.STAGE_CHANGED:
        return `Etapa alterada: "${event.details.fromStage}" → "${event.details.toStage}"`;
      default:
        return `Evento de automação: ${event.automationName}`;
    }
  };
  
  const getEventStatusBadge = (status: AutomationEventStatus) => {
    switch (status) {
      case AutomationEventStatus.SUCCESS:
        return <Badge variant="default">Sucesso</Badge>;
      case AutomationEventStatus.FAILED:
        return <Badge variant="destructive">Falha</Badge>;
      case AutomationEventStatus.PENDING:
        return <Badge variant="secondary">Pendente</Badge>;
      case AutomationEventStatus.CANCELED:
        return <Badge variant="outline">Cancelado</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };
  
  const toggleEventDetails = (eventId: string) => {
    if (expandedEvent === eventId) {
      setExpandedEvent(null);
    } else {
      setExpandedEvent(eventId);
    }
  };
  
  const renderEventDetails = (event: AutomationEvent) => {
    return (
      <div className="mt-2 p-3 bg-gray-50 rounded-md text-sm">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="font-medium">Automação:</span> {event.automationName}
          </div>
          <div>
            <span className="font-medium">Data:</span> {formatDate(new Date(event.createdAt))}
          </div>
          
          {event.eventType === AutomationEventType.EMAIL_SENT && (
            <>
              <div>
                <span className="font-medium">Template:</span> {event.details.emailTemplate}
              </div>
              <div>
                <span className="font-medium">Enviado em:</span> {formatDate(new Date(event.details.sentAt))}
              </div>
            </>
          )}
          
          {event.eventType === AutomationEventType.EMAIL_OPENED && (
            <>
              <div>
                <span className="font-medium">Aberto em:</span> {formatDate(new Date(event.details.openedAt))}
              </div>
              <div>
                <span className="font-medium">Aberturas:</span> {event.details.openCount}
              </div>
              <div className="col-span-2">
                <span className="font-medium">Dispositivo:</span> {event.details.userAgent}
              </div>
            </>
          )}
          
          {event.eventType === AutomationEventType.TASK_CREATED && (
            <>
              <div>
                <span className="font-medium">Responsável:</span> {event.details.assignedToName}
              </div>
              <div>
                <span className="font-medium">Prazo:</span> {formatDate(new Date(event.details.dueDate))}
              </div>
            </>
          )}
          
          {event.eventType === AutomationEventType.WHATSAPP_SENT && event.eventStatus === AutomationEventStatus.FAILED && (
            <>
              <div className="col-span-2">
                <span className="font-medium">Erro:</span> {event.details.error}
              </div>
              <div>
                <span className="font-medium">Tentativas:</span> {event.details.attemptCount}
              </div>
            </>
          )}
          
          {event.eventType === AutomationEventType.STAGE_CHANGED && (
            <div className="col-span-2">
              <span className="font-medium">Motivo:</span> {event.details.reason}
            </div>
          )}
          
          <div className="col-span-2 mt-2">
            <Button variant="outline" size="sm" className="w-full">
              <Eye className="h-4 w-4 mr-2" />
              Ver Detalhes Completos
            </Button>
          </div>
        </div>
      </div>
    );
  };
  
  const displayEvents = showAll ? events : events.slice(0, limit);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }
  
  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Histórico de Automações</CardTitle>
            <Button variant="outline" size="sm" onClick={loadEvents}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </CardHeader>
      )}
      
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>Nenhum evento de automação registrado</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {displayEvents.map((event) => (
                <div key={event.id} className="border rounded-md p-3">
                  <div 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleEventDetails(event.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        {getEventIcon(event.eventType)}
                      </div>
                      <div>
                        <div className="font-medium">{getEventTitle(event)}</div>
                        <div className="text-sm text-gray-500">
                          {formatDate(new Date(event.createdAt))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getEventStatusBadge(event.eventStatus)}
                      {expandedEvent === event.id ? (
                        <ChevronUp className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                  
                  {expandedEvent === event.id && renderEventDetails(event)}
                </div>
              ))}
            </div>
            
            {events.length > limit && (
              <Button
                variant="ghost"
                className="w-full mt-4"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? 'Mostrar Menos' : `Ver Mais (${events.length - limit})`}
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AutomationHistory;

