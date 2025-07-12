import React, { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, CheckSquare, Clock, AlertTriangle, Calendar } from 'lucide-react';

interface TaskStats {
  total: number;
  pending: number;
  completed: number;
}

const TasksSimple: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [stats, setStats] = useState<TaskStats>({ total: 0, pending: 0, completed: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // Função para buscar tarefas
  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      
      // Buscar tarefas
      const tasksResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/tasks/`);
      const tasksData = await tasksResponse.json();
      
      if (tasksData.success) {
        setTasks(tasksData.tasks || []);
        if (tasksData.stats) {
          setStats(tasksData.stats);
        }
      } else {
        throw new Error(tasksData.message || 'Erro ao carregar tarefas');
      }
      
      // Buscar estatísticas separadamente se não vieram junto
      if (!tasksData.stats) {
        const statsResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/tasks/stats`);
        const statsData = await statsResponse.json();
        
        if (statsData.success) {
          setStats(statsData.stats);
        }
      }
      
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as tarefas.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Função para criar nova tarefa (placeholder)
  const handleCreateTask = () => {
    toast({
      title: "Em desenvolvimento",
      description: "Funcionalidade de criar tarefa será implementada em breve.",
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tarefas</h1>
          <p className="text-gray-600 mt-1">Gerencie suas tarefas e atividades</p>
        </div>
        <Button onClick={handleCreateTask} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Nova Tarefa
        </Button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Tarefas</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Todas as tarefas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              Aguardando execução
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
            <CheckSquare className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">
              Finalizadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atrasadas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">0</div>
            <p className="text-xs text-muted-foreground">
              Vencidas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar tarefas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Tarefas */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Tarefas</CardTitle>
          <CardDescription>
            {isLoading ? 'Carregando...' : `${tasks.length} tarefa(s) encontrada(s)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8">
              <CheckSquare className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma tarefa criada ainda</h3>
              <p className="mt-1 text-sm text-gray-500">
                Comece criando sua primeira tarefa.
              </p>
              <div className="mt-6">
                <Button onClick={handleCreateTask} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeira Tarefa
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task, index) => (
                <div key={task.id || index} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{task.title || `Tarefa ${index + 1}`}</h3>
                      <p className="text-sm text-gray-600 mt-1">{task.description || 'Sem descrição'}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={task.status === 'completed' ? 'default' : 'secondary'}>
                          {task.status || 'pending'}
                        </Badge>
                        {task.priority && (
                          <Badge variant="outline">
                            {task.priority}
                          </Badge>
                        )}
                        {task.due_date && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(task.due_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TasksSimple;

