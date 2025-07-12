import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useTenant } from "@/contexts/TenantContext";
import { pabxService } from "@/services/pabxService";
import { LeadCallHistory as LeadCallHistoryType, CallRecord, CallPermissions } from "@/types/telephony";
import RecordingPlayer from "./RecordingPlayer";
import ClickToCallButton from "./ClickToCallButton";
import { 
  Phone, 
  PhoneIncoming, 
  PhoneOutgoing,
  Clock,
  Calendar,
  TrendingUp,
  Activity,
  Loader2,
  AlertCircle,
  Volume2,
  VolumeX
} from "lucide-react";
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface LeadCallHistoryProps {
  leadId: string;
  leadName: string;
  phoneNumbers: {
    primary?: string;
    whatsapp?: string;
    landline?: string;
    other?: string[];
  };
}

const LeadCallHistory: React.FC<LeadCallHistoryProps> = ({
  leadId,
  leadName,
  phoneNumbers
}) => {
  const [callHistory, setCallHistory] = useState<LeadCallHistoryType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [permissions, setPermissions] = useState<CallPermissions>({
    canViewAllCalls: false,
    canViewOwnCalls: true,
    canMakeCalls: true,
    canAccessRecordings: true,
    canAssociateCalls: false,
    canViewStats: false
  });
  
  const { toast } = useToast();
  const { currentTenant } = useTenant();

  useEffect(() => {
    if (currentTenant && leadId) {
      loadCallHistory();
      loadPermissions();
    }
  }, [currentTenant, leadId]);

  const loadCallHistory = async () => {
    if (!currentTenant) return;

    setIsLoading(true);
    try {
      const history = await pabxService.getLeadCallHistory(currentTenant.id, leadId);
      setCallHistory(history);
    } catch (error) {
      console.error('Erro ao carregar histórico de chamadas:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar histórico de chamadas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadPermissions = async () => {
    // TODO: Implementar carregamento de permissões do usuário atual
    // Por enquanto, usar permissões padrão baseadas no perfil
    const userRole = 'user'; // TODO: pegar do contexto de auth
    
    if (userRole === 'admin') {
      setPermissions({
        canViewAllCalls: true,
        canViewOwnCalls: true,
        canMakeCalls: true,
        canAccessRecordings: true,
        canAssociateCalls: true,
        canViewStats: true
      });
    } else {
      setPermissions({
        canViewAllCalls: false,
        canViewOwnCalls: true,
        canMakeCalls: true,
        canAccessRecordings: true,
        canAssociateCalls: false,
        canViewStats: false
      });
    }
  };

  const handleCallStarted = (callId: string) => {
    // Recarregar histórico após alguns segundos
    setTimeout(() => {
      loadCallHistory();
    }, 3000);
  };

  const getCallIcon = (call: CallRecord) => {
    if (call.callDirection === 'inbound') {
      return <PhoneIncoming className="w-4 h-4 text-green-600" />;
    } else {
      return <PhoneOutgoing className="w-4 h-4 text-blue-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'answered':
        return 'text-green-600 bg-green-100';
      case 'missed':
        return 'text-red-600 bg-red-100';
      case 'busy':
        return 'text-yellow-600 bg-yellow-100';
      case 'no_answer':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDuration = (seconds: number): string => {
    return pabxService.formatDuration(seconds).formatted;
  };

  const getPreferredPhoneNumber = (): string => {
    return phoneNumbers.primary || 
           phoneNumbers.whatsapp || 
           phoneNumbers.landline || 
           phoneNumbers.other?.[0] || 
           '';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            📞 Ligações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="ml-2">Carregando histórico...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!callHistory || callHistory.calls.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            📞 Ligações
          </CardTitle>
          <CardDescription>
            Histórico de chamadas para este lead
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 space-y-4">
            <Phone className="w-12 h-12 mx-auto text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Nenhuma chamada registrada</p>
              <p className="text-sm text-muted-foreground">
                As chamadas aparecerão aqui automaticamente
              </p>
            </div>
            
            {permissions.canMakeCalls && getPreferredPhoneNumber() && (
              <div className="pt-4">
                <ClickToCallButton
                  phoneNumber={getPreferredPhoneNumber()}
                  leadId={leadId}
                  leadName={leadName}
                  variant="default"
                  onCallStarted={handleCallStarted}
                >
                  Fazer Primeira Ligação
                </ClickToCallButton>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            📞 Ligações
          </div>
          <Badge variant="outline">
            {callHistory.totalCalls} chamadas
          </Badge>
        </CardTitle>
        <CardDescription>
          Histórico de chamadas para {leadName}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Estatísticas Resumidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-lg font-bold">{callHistory.totalCalls}</p>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-muted-foreground">Atendidas</p>
            <p className="text-lg font-bold text-green-600">{callHistory.callsAnswered}</p>
          </div>
          
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <p className="text-sm text-muted-foreground">Perdidas</p>
            <p className="text-lg font-bold text-red-600">{callHistory.callsMissed}</p>
          </div>
          
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-muted-foreground">Duração Média</p>
            <p className="text-lg font-bold text-blue-600">
              {formatDuration(callHistory.averageDuration)}
            </p>
          </div>
        </div>

        <Separator />

        {/* Botão para Nova Ligação */}
        {permissions.canMakeCalls && getPreferredPhoneNumber() && (
          <div className="flex justify-center">
            <ClickToCallButton
              phoneNumber={getPreferredPhoneNumber()}
              leadId={leadId}
              leadName={leadName}
              variant="default"
              onCallStarted={handleCallStarted}
            >
              Ligar Novamente
            </ClickToCallButton>
          </div>
        )}

        <Separator />

        {/* Lista de Chamadas */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Histórico Detalhado
          </h4>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {callHistory.calls.map((call) => (
              <div key={call.id} className="border rounded-lg p-4 space-y-3">
                {/* Header da Chamada */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getCallIcon(call)}
                    <div>
                      <p className="font-medium">
                        {format(call.startTime, 'dd/MM/yyyy', { locale: ptBR })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(call.startTime, 'HH:mm:ss', { locale: ptBR })} • {' '}
                        {formatDistanceToNow(call.startTime, { 
                          addSuffix: true, 
                          locale: ptBR 
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <Badge className={getStatusColor(call.callStatus)}>
                    {pabxService.getCallStatusLabel(call.callStatus)}
                  </Badge>
                </div>

                {/* Detalhes da Chamada */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Número</p>
                    <p className="font-medium">
                      {pabxService.formatPhoneNumber(call.phoneNumber).formatted}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-muted-foreground">Duração</p>
                    <p className="font-medium">{formatDuration(call.duration)}</p>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    {/* Gravação */}
                    {call.hasRecording && permissions.canAccessRecordings ? (
                      <RecordingPlayer
                        callId={call.id}
                        tenantId={currentTenant?.id || ''}
                        leadName={leadName}
                        callDate={call.startTime}
                        trigger={
                          <Button variant="ghost" size="sm">
                            <Volume2 className="w-3 h-3 mr-1" />
                            Gravação
                          </Button>
                        }
                      />
                    ) : call.hasRecording ? (
                      <Button variant="ghost" size="sm" disabled>
                        <VolumeX className="w-3 h-3 mr-1" />
                        Sem Acesso
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Sem gravação
                      </span>
                    )}
                  </div>

                  {/* Click-to-Call */}
                  {permissions.canMakeCalls && (
                    <ClickToCallButton
                      phoneNumber={call.phoneNumber}
                      leadId={leadId}
                      leadName={leadName}
                      onCallStarted={handleCallStarted}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Última Chamada */}
        {callHistory.lastCallDate && (
          <div className="text-center text-sm text-muted-foreground pt-2">
            Última chamada: {formatDistanceToNow(callHistory.lastCallDate, { 
              addSuffix: true, 
              locale: ptBR 
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LeadCallHistory;

