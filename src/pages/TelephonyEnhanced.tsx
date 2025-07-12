import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useTenant } from "@/contexts/TenantContext";
import { pabxService } from "@/services/pabxService";
import { 
  CallRecord, 
  CallFilters, 
  CallStatus, 
  CallDirection,
  CallReportRow,
  ClickToCallRequest,
  PABXStats
} from "@/types/telephony";
import { 
  Phone, 
  PhoneCall, 
  Play,
  Download,
  Filter,
  Search,
  Calendar,
  Clock,
  Users,
  TrendingUp,
  Activity,
  Loader2,
  ExternalLink,
  Volume2,
  VolumeX,
  MoreHorizontal,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const TelephonyEnhanced: React.FC = () => {
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isMakingCall, setIsMakingCall] = useState(false);
  const [stats, setStats] = useState<PABXStats | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCalls, setTotalCalls] = useState(0);
  
  const { toast } = useToast();
  const { currentTenant } = useTenant();

  // Estados para filtros
  const [filters, setFilters] = useState<CallFilters>({
    startDate: startOfDay(subDays(new Date(), 30)),
    endDate: endOfDay(new Date()),
    page: 1,
    limit: 20,
    sortBy: 'startTime',
    sortOrder: 'desc'
  });

  // Estados para click-to-call
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    if (currentTenant) {
      loadCalls();
      loadStats();
    }
  }, [currentTenant, filters]);

  const loadCalls = async () => {
    if (!currentTenant) return;

    setIsLoading(true);
    try {
      const response = await pabxService.getCalls(currentTenant.id, filters);
      setCalls(response.calls);
      setTotalPages(response.totalPages);
      setTotalCalls(response.total);
      setCurrentPage(response.page);
    } catch (error) {
      console.error('Erro ao carregar chamadas:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar histórico de chamadas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    if (!currentTenant || !filters.startDate || !filters.endDate) return;

    setIsLoadingStats(true);
    try {
      const statsData = await pabxService.getPABXStats(
        currentTenant.id, 
        filters.startDate, 
        filters.endDate
      );
      setStats(statsData);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const makeCall = async (phoneNumber: string, leadId?: string) => {
    if (!currentTenant) return;

    if (!pabxService.validatePhoneNumber(phoneNumber)) {
      toast({
        title: "Número Inválido",
        description: "Por favor, insira um número de telefone válido",
        variant: "destructive",
      });
      return;
    }

    setIsMakingCall(true);
    try {
      const request: ClickToCallRequest = {
        tenantId: currentTenant.id,
        phoneNumber: phoneNumber,
        leadId: leadId,
        userId: 'current_user', // TODO: pegar do contexto de auth
        autoRecord: true
      };

      const response = await pabxService.makeCall(currentTenant.id, request);
      
      if (response.success) {
        toast({
          title: "Chamada Iniciada",
          description: `Ligando para ${pabxService.formatPhoneNumber(phoneNumber).formatted}`,
        });
        
        // Recarregar chamadas após alguns segundos
        setTimeout(() => {
          loadCalls();
        }, 3000);
      } else {
        toast({
          title: "Erro na Chamada",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao realizar chamada",
        variant: "destructive",
      });
    } finally {
      setIsMakingCall(false);
    }
  };

  const handleQuickCall = () => {
    if (phoneNumber.trim()) {
      makeCall(phoneNumber);
      setPhoneNumber('');
    }
  };

  const playRecording = async (callId: string) => {
    if (!currentTenant) return;

    try {
      const recording = await pabxService.getCallRecording(currentTenant.id, callId);
      if (recording && recording.recordingUrl) {
        // Abrir player de áudio em modal ou nova aba
        window.open(recording.recordingUrl, '_blank');
      } else {
        toast({
          title: "Gravação Indisponível",
          description: "Esta chamada não possui gravação disponível",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao acessar gravação",
        variant: "destructive",
      });
    }
  };

  const formatCallDuration = (seconds: number): string => {
    return pabxService.formatDuration(seconds).formatted;
  };

  const getStatusBadge = (status: CallStatus) => {
    const label = pabxService.getCallStatusLabel(status);
    const colorClass = pabxService.getCallStatusColor(status);
    
    return (
      <Badge className={colorClass}>
        {label}
      </Badge>
    );
  };

  const handleFilterChange = (key: keyof CallFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset para primeira página ao filtrar
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleSort = (column: string) => {
    setFilters(prev => ({
      ...prev,
      sortBy: column as any,
      sortOrder: prev.sortBy === column && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  const exportCalls = async () => {
    if (!currentTenant) return;

    try {
      const blob = await pabxService.exportCalls(currentTenant.id, {
        tenantId: currentTenant.id,
        filters: filters,
        format: 'xlsx' as any,
        includeRecordings: false,
        columns: ['leadName', 'phoneNumber', 'callDate', 'duration', 'status', 'direction'] as any
      });

      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chamadas_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: "Exportação Concluída",
          description: "Relatório de chamadas exportado com sucesso",
        });
      }
    } catch (error) {
      toast({
        title: "Erro na Exportação",
        description: "Erro ao exportar relatório de chamadas",
        variant: "destructive",
      });
    }
  };

  if (isLoading && calls.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Carregando chamadas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">JT Vox PABX</h1>
          <p className="text-muted-foreground">
            Relatório de ligações e click-to-call - {currentTenant?.name}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCalls}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Phone className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total de Chamadas</p>
                <p className="text-2xl font-bold">
                  {isLoadingStats ? '...' : stats?.totalCalls || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Atendidas</p>
                <p className="text-2xl font-bold">
                  {isLoadingStats ? '...' : stats?.answeredCalls || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Duração Média</p>
                <p className="text-2xl font-bold">
                  {isLoadingStats ? '...' : formatCallDuration(stats?.averageDuration || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Volume2 className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Gravações</p>
                <p className="text-2xl font-bold">
                  {isLoadingStats ? '...' : stats?.recordingsCount || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Click-to-Call */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PhoneCall className="w-5 h-5" />
            Click-to-Call
          </CardTitle>
          <CardDescription>
            Realize chamadas diretamente pelo sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Digite o número de telefone"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleQuickCall()}
              className="flex-1"
            />
            <Button 
              onClick={handleQuickCall}
              disabled={isMakingCall || !phoneNumber.trim()}
            >
              {isMakingCall ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Phone className="w-4 h-4 mr-2" />
              )}
              Ligar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Data Inicial</Label>
              <Input
                type="date"
                value={filters.startDate ? format(filters.startDate, 'yyyy-MM-dd') : ''}
                onChange={(e) => handleFilterChange('startDate', e.target.value ? new Date(e.target.value) : undefined)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Data Final</Label>
              <Input
                type="date"
                value={filters.endDate ? format(filters.endDate, 'yyyy-MM-dd') : ''}
                onChange={(e) => handleFilterChange('endDate', e.target.value ? new Date(e.target.value) : undefined)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Status</Label>
              <Select 
                value={filters.callStatus || 'all'} 
                onValueChange={(value) => handleFilterChange('callStatus', value === 'all' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value={CallStatus.ANSWERED}>Atendida</SelectItem>
                  <SelectItem value={CallStatus.MISSED}>Perdida</SelectItem>
                  <SelectItem value={CallStatus.BUSY}>Ocupado</SelectItem>
                  <SelectItem value={CallStatus.NO_ANSWER}>Sem Resposta</SelectItem>
                  <SelectItem value={CallStatus.VOICEMAIL}>Caixa Postal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Direção</Label>
              <Select 
                value={filters.callDirection || 'all'} 
                onValueChange={(value) => handleFilterChange('callDirection', value === 'all' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas as direções" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as direções</SelectItem>
                  <SelectItem value={CallDirection.INBOUND}>Recebida</SelectItem>
                  <SelectItem value={CallDirection.OUTBOUND}>Realizada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Chamadas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Histórico de Ligações
            </div>
            <Badge variant="outline">
              {totalCalls} chamadas
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('leadName')}
                  >
                    <div className="flex items-center gap-2">
                      Lead
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('startTime')}
                  >
                    <div className="flex items-center gap-2">
                      Data da Ligação
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('duration')}
                  >
                    <div className="flex items-center gap-2">
                      Duração
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Gravação</TableHead>
                  <TableHead>Chamar Novamente</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                      <p className="mt-2 text-muted-foreground">Carregando chamadas...</p>
                    </TableCell>
                  </TableRow>
                ) : calls.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Phone className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Nenhuma chamada encontrada</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  calls.map((call) => (
                    <TableRow key={call.id}>
                      <TableCell>
                        <div className="space-y-1">
                          {call.leadName ? (
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{call.leadName}</span>
                              {call.leadId && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(`/leads/${call.leadId}`, '_blank')}
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Sem Identificação</span>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {pabxService.formatPhoneNumber(call.phoneNumber).formatted}
                          </p>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">
                            {format(call.startTime, 'dd/MM/yyyy', { locale: ptBR })}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(call.startTime, 'HH:mm:ss', { locale: ptBR })}
                          </p>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {pabxService.getCallDirectionIcon(call.callDirection)}
                          <span className="font-mono">
                            {formatCallDuration(call.duration)}
                          </span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {getStatusBadge(call.callStatus)}
                      </TableCell>
                      
                      <TableCell>
                        {call.hasRecording ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => playRecording(call.id)}
                          >
                            <Play className="w-3 h-3 mr-1" />
                            🔗 Play
                          </Button>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => makeCall(call.phoneNumber, call.leadId)}
                          disabled={isMakingCall}
                        >
                          <Phone className="w-3 h-3 mr-1" />
                          ☎️ Click-to-Call
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages} ({totalCalls} chamadas)
              </p>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Próxima
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TelephonyEnhanced;

