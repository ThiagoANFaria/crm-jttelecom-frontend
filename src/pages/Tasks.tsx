
import React, { useEffect, useState } from 'react';
import { Task } from '@/types';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  CheckSquare, 
  Clock, 
  AlertTriangle, 
  Calendar,
  User,
  MessageSquare,
  Timer,
  Filter,
  MoreHorizontal
} from 'lucide-react';

interface TasksStats {
  total_tasks: number;
  status_stats: Record<string, number>;
  priority_stats: Record<string, number>;
  overdue_tasks: number;
  my_tasks: number;
}

interface TaskOptions {
  statuses: string[];
  priorities: string[];
  users: Array<{ id: number; name: string }>;
  leads: Array<{ id: string; name: string }>;
  clients: Array<{ id: string; name: string }>;
}

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TasksStats | null>(null);
  const [options, setOptions] = useState<TaskOptions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [assignedFilter, setAssignedFilter] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    due_date: '',
    assigned_to: '',
    lead_id: '',
    client_id: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [searchTerm, statusFilter, priorityFilter, assignedFilter]);

  const fetchInitialData = async () => {
    try {
      const [statsData, optionsData] = await Promise.all([
        apiService.getTasksStats(),
        apiService.getTaskOptions()
      ]);
      setStats(statsData);
      setOptions(optionsData);
    } catch (error) {
      console.error('Failed to fetch initial data:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      
      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (assignedFilter) {
        if (assignedFilter === 'me') {
          params.assigned_to = 'me';
        } else {
          params.assigned_to = assignedFilter;
        }
      }

      const data = await apiService.getTasks(params);
      setTasks(data.tasks);
      
      // Atualizar stats se disponível
      if (data.stats) {
        setStats(prev => ({ ...prev, ...data.stats }));
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      toast({
        title: 'Erro ao carregar tarefas',
        description: 'Não foi possível carregar a lista de tarefas.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = async () => {
    try {
      const taskData: any = {
        title: newTask.title,
        description: newTask.description,
        status: newTask.status,
        priority: newTask.priority
      };

      if (newTask.due_date) taskData.due_date = newTask.due_date;
      if (newTask.assigned_to) taskData.assigned_to = parseInt(newTask.assigned_to);
      if (newTask.lead_id) taskData.lead_id = newTask.lead_id;
      if (newTask.client_id) taskData.client_id = newTask.client_id;

      await apiService.createTask(taskData);
      
      toast({
        title: 'Tarefa criada',
        description: 'A tarefa foi criada com sucesso.',
      });

      setIsCreateDialogOpen(false);
      setNewTask({
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        due_date: '',
        assigned_to: '',
        lead_id: '',
        client_id: ''
      });
      
      fetchTasks();
      fetchInitialData();
    } catch (error) {
      console.error('Failed to create task:', error);
      toast({
        title: 'Erro ao criar tarefa',
        description: 'Não foi possível criar a tarefa.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateTask = async () => {
    if (!selectedTask) return;

    try {
      const taskData: any = {
        title: selectedTask.title,
        description: selectedTask.description,
        status: selectedTask.status,
        priority: selectedTask.priority
      };

      if (selectedTask.due_date) taskData.due_date = selectedTask.due_date;
      if (selectedTask.assigned_to) taskData.assigned_to = selectedTask.assigned_to;

      await apiService.updateTask(selectedTask.id, taskData);
      
      toast({
        title: 'Tarefa atualizada',
        description: 'A tarefa foi atualizada com sucesso.',
      });

      setIsEditDialogOpen(false);
      setSelectedTask(null);
      
      fetchTasks();
      fetchInitialData();
    } catch (error) {
      console.error('Failed to update task:', error);
      toast({
        title: 'Erro ao atualizar tarefa',
        description: 'Não foi possível atualizar a tarefa.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Tem certeza que deseja deletar esta tarefa?')) return;

    try {
      await apiService.deleteTask(taskId);
      
      toast({
        title: 'Tarefa deletada',
        description: 'A tarefa foi deletada com sucesso.',
      });
      
      fetchTasks();
      fetchInitialData();
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast({
        title: 'Erro ao deletar tarefa',
        description: 'Não foi possível deletar a tarefa.',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent':
        return <AlertTriangle className="w-3 h-3" />;
      case 'high':
        return <AlertTriangle className="w-3 h-3" />;
      case 'medium':
        return <Clock className="w-3 h-3" />;
      case 'low':
        return <CheckSquare className="w-3 h-3" />;
      default:
        return <CheckSquare className="w-3 h-3" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'in_progress': return 'Em Andamento';
      case 'completed': return 'Concluída';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Urgente';
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return priority;
    }
  };

  const isOverdue = (task: Task) => {
    if (!task.due_date || task.status === 'completed') return false;
    return new Date(task.due_date) < new Date();
  };

  if (isLoading && tasks.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-jt-blue">Tarefas</h1>
        </div>
        
        {/* Stats Cards Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tasks Grid Skeleton */}
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-jt-blue">Tarefas</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-jt-blue hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nova Tarefa
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Criar Nova Tarefa</DialogTitle>
              <DialogDescription>
                Preencha os dados da nova tarefa.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Digite o título da tarefa"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Descreva a tarefa"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={newTask.status} onValueChange={(value) => setNewTask({ ...newTask, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {options?.statuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {getStatusLabel(status)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select value={newTask.priority} onValueChange={(value) => setNewTask({ ...newTask, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {options?.priorities.map((priority) => (
                        <SelectItem key={priority} value={priority}>
                          {getPriorityLabel(priority)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="due_date">Data de Vencimento</Label>
                  <Input
                    id="due_date"
                    type="datetime-local"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="assigned_to">Responsável</Label>
                  <Select value={newTask.assigned_to} onValueChange={(value) => setNewTask({ ...newTask, assigned_to: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar responsável" />
                    </SelectTrigger>
                    <SelectContent>
                      {options?.users.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateTask} disabled={!newTask.title}>
                Criar Tarefa
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total de Tarefas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-jt-blue">{stats.total_tasks}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Minhas Tarefas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.my_tasks}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.status_stats.pending || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Atrasadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.overdue_tasks}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar tarefas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos os Status</SelectItem>
            {options?.statuses.map((status) => (
              <SelectItem key={status} value={status}>
                {getStatusLabel(status)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Prioridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas as Prioridades</SelectItem>
            {options?.priorities.map((priority) => (
              <SelectItem key={priority} value={priority}>
                {getPriorityLabel(priority)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={assignedFilter} onValueChange={setAssignedFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Responsável" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos</SelectItem>
            <SelectItem value="me">Minhas Tarefas</SelectItem>
            {options?.users.map((user) => (
              <SelectItem key={user.id} value={user.id.toString()}>
                {user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tasks Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tasks.map((task) => (
          <Card key={task.id} className={`hover:shadow-md transition-shadow ${isOverdue(task) ? 'border-red-200 bg-red-50' : ''}`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {task.title}
                    {isOverdue(task) && <AlertTriangle className="w-4 h-4 text-red-500" />}
                  </CardTitle>
                  {task.description && (
                    <CardDescription className="text-sm mt-1 line-clamp-2">
                      {task.description}
                    </CardDescription>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Badge className={getStatusColor(task.status)}>
                    {getStatusLabel(task.status)}
                  </Badge>
                  <Badge className={getPriorityColor(task.priority)} variant="outline">
                    <span className="flex items-center gap-1">
                      {getPriorityIcon(task.priority)}
                      {getPriorityLabel(task.priority)}
                    </span>
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {task.assignee_name && (
                  <div className="text-sm text-gray-600 flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <strong>Responsável:</strong> {task.assignee_name}
                  </div>
                )}
                {task.due_date && (
                  <div className={`text-sm flex items-center gap-1 ${isOverdue(task) ? 'text-red-600' : 'text-gray-600'}`}>
                    <Calendar className="w-3 h-3" />
                    <strong>Prazo:</strong> {new Date(task.due_date).toLocaleDateString('pt-BR')}
                  </div>
                )}
                {(task.comments_count || 0) > 0 && (
                  <div className="text-sm text-gray-600 flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    {task.comments_count} comentário{(task.comments_count || 0) > 1 ? 's' : ''}
                  </div>
                )}
                {(task.time_logged || 0) > 0 && (
                  <div className="text-sm text-gray-600 flex items-center gap-1">
                    <Timer className="w-3 h-3" />
                    {task.time_logged}h registradas
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  Criada em: {new Date(task.created_at).toLocaleDateString('pt-BR')}
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => {
                    setSelectedTask(task);
                    setIsEditDialogOpen(true);
                  }}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Editar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-600 hover:text-red-700"
                  onClick={() => handleDeleteTask(task.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {tasks.length === 0 && !isLoading && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-gray-500">
              {searchTerm || statusFilter || priorityFilter || assignedFilter 
                ? 'Nenhuma tarefa encontrada com os filtros aplicados.' 
                : 'Nenhuma tarefa criada ainda.'}
            </div>
            <Button 
              className="mt-4 bg-jt-blue hover:bg-blue-700"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeira Tarefa
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Tarefa</DialogTitle>
            <DialogDescription>
              Atualize os dados da tarefa.
            </DialogDescription>
          </DialogHeader>
          {selectedTask && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Título *</Label>
                <Input
                  id="edit-title"
                  value={selectedTask.title}
                  onChange={(e) => setSelectedTask({ ...selectedTask, title: e.target.value })}
                  placeholder="Digite o título da tarefa"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Descrição</Label>
                <Textarea
                  id="edit-description"
                  value={selectedTask.description || ''}
                  onChange={(e) => setSelectedTask({ ...selectedTask, description: e.target.value })}
                  placeholder="Descreva a tarefa"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select 
                    value={selectedTask.status} 
                    onValueChange={(value) => setSelectedTask({ ...selectedTask, status: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {options?.statuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {getStatusLabel(status)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-priority">Prioridade</Label>
                  <Select 
                    value={selectedTask.priority} 
                    onValueChange={(value) => setSelectedTask({ ...selectedTask, priority: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {options?.priorities.map((priority) => (
                        <SelectItem key={priority} value={priority}>
                          {getPriorityLabel(priority)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-due_date">Data de Vencimento</Label>
                  <Input
                    id="edit-due_date"
                    type="datetime-local"
                    value={selectedTask.due_date ? new Date(selectedTask.due_date).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setSelectedTask({ ...selectedTask, due_date: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-assigned_to">Responsável</Label>
                  <Select 
                    value={selectedTask.assigned_to?.toString() || ''} 
                    onValueChange={(value) => setSelectedTask({ ...selectedTask, assigned_to: value ? parseInt(value) : undefined })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar responsável" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Nenhum responsável</SelectItem>
                      {options?.users.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateTask} disabled={!selectedTask?.title}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Tasks;
