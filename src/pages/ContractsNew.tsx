import React, { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2, FileCheck, DollarSign, Calendar, Send, Eye } from 'lucide-react';

interface Contract {
  id: string;
  title: string;
  contract_number: string;
  status: 'draft' | 'sent' | 'signed' | 'active' | 'expired' | 'cancelled';
  contract_value: number;
  currency: string;
  start_date: string;
  end_date: string;
  signature_status: 'pending' | 'completed';
  created_at: string;
}

interface ContractStats {
  total: number;
  draft: number;
  sent: number;
  signed: number;
  active: number;
  expired: number;
  total_value: number;
}

const ContractsNew: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [stats, setStats] = useState<ContractStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://ogh5izcv5lnq.manus.space';

  useEffect(() => {
    fetchContracts();
    fetchStats();
  }, []);

  const fetchContracts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/contracts/`);
      const data = await response.json();
      
      if (data.success) {
        setContracts(data.contracts || []);
      } else {
        throw new Error(data.error || 'Erro ao carregar contratos');
      }
    } catch (error) {
      console.error('Failed to fetch contracts:', error);
      toast({
        title: 'Erro ao carregar contratos',
        description: 'Não foi possível carregar a lista de contratos.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/contracts/stats`);
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleCreateContract = async () => {
    try {
      const newContract = {
        title: 'Novo Contrato',
        contract_value: 0,
        currency: 'BRL',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };

      const response = await fetch(`${API_BASE_URL}/api/contracts/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newContract),
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Contrato criado',
          description: 'Novo contrato criado com sucesso!',
        });
        fetchContracts();
        fetchStats();
      } else {
        throw new Error(data.error || 'Erro ao criar contrato');
      }
    } catch (error) {
      console.error('Failed to create contract:', error);
      toast({
        title: 'Erro ao criar contrato',
        description: 'Não foi possível criar o contrato.',
        variant: 'destructive',
      });
    }
  };

  const filteredContracts = contracts.filter(contract =>
    contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.contract_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'signed':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'Ativo';
      case 'expired': return 'Expirado';
      case 'cancelled': return 'Cancelado';
      case 'draft': return 'Rascunho';
      case 'sent': return 'Enviado';
      case 'signed': return 'Assinado';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-blue-600">Contratos</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-blue-600">Contratos</h1>
        <Button onClick={handleCreateContract} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Contrato
        </Button>
      </div>

      {/* Estatísticas */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Contratos</CardTitle>
              <FileCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contratos Ativos</CardTitle>
              <FileCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rascunhos</CardTitle>
              <FileCheck className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.draft}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {stats.total_value.toLocaleString('pt-BR')}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar contratos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredContracts.map((contract) => (
          <Card key={contract.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileCheck className="w-5 h-5" />
                    {contract.title}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {contract.contract_number}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(contract.status)}>
                  {getStatusLabel(contract.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-lg font-semibold text-blue-600">
                  <DollarSign className="w-5 h-5" />
                  <span>R$ {contract.contract_value.toLocaleString('pt-BR')}</span>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Início: {new Date(contract.start_date).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Fim: {new Date(contract.end_date).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500">Assinatura:</span>
                  <Badge variant={contract.signature_status === 'completed' ? 'default' : 'secondary'}>
                    {contract.signature_status === 'completed' ? 'Assinado' : 'Pendente'}
                  </Badge>
                </div>
                
                <div className="text-xs text-gray-500">
                  Criado em: {new Date(contract.created_at).toLocaleDateString('pt-BR')}
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="w-4 h-4 mr-1" />
                  Ver
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="w-4 h-4 mr-1" />
                  Editar
                </Button>
                <Button variant="outline" size="sm">
                  <Send className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredContracts.length === 0 && !isLoading && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-gray-500">
              {searchTerm ? 'Nenhum contrato encontrado com os filtros aplicados.' : 'Nenhum contrato criado ainda.'}
            </div>
            <Button onClick={handleCreateContract} className="mt-4 bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Contrato
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ContractsNew;

