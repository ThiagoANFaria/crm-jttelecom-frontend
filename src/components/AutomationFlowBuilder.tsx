import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Play, 
  Pause, 
  Save, 
  Copy, 
  Trash2, 
  Settings,
  Zap,
  GitBranch,
  Mail,
  MessageSquare,
  Tag,
  ArrowRight,
  Webhook,
  Bell,
  Calendar,
  Users,
  Target,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Search,
  Lock,
  Shield
} from 'lucide-react';
import { 
  AutomationFlow, 
  FlowNode, 
  FlowEdge, 
  TriggerType, 
  ActionType,
  ConditionType,
  FlowVisualData 
} from '@/types/automation';
import { useAuth } from '@/context/AuthContext';

interface AutomationFlowBuilderProps {
  flow?: AutomationFlow;
  onSave: (flow: Partial<AutomationFlow>) => void;
  onTest?: (flow: AutomationFlow) => void;
  isReadOnly?: boolean;
}

// Componentes da Sidebar baseados no Typebot
const TRIGGER_COMPONENTS = [
  { type: TriggerType.NEW_LEAD, icon: Users, label: 'Novo Lead', color: 'bg-green-500' },
  { type: TriggerType.LEAD_STAGE_CHANGE, icon: ArrowRight, label: 'Mudança Etapa', color: 'bg-blue-500' },
  { type: TriggerType.LEAD_INACTIVITY, icon: Clock, label: 'Inatividade Lead', color: 'bg-orange-500' },
  { type: TriggerType.CLIENT_NO_TASK, icon: AlertCircle, label: 'Cliente Sem Tarefa', color: 'bg-red-500' },
  { type: TriggerType.CONTRACT_SIGNED, icon: CheckCircle, label: 'Contrato Assinado', color: 'bg-green-600' },
  { type: TriggerType.CONTRACT_EXPIRED, icon: AlertCircle, label: 'Contrato Vencido', color: 'bg-red-600' },
  { type: TriggerType.TAG_APPLIED, icon: Tag, label: 'Tag Aplicada', color: 'bg-purple-500' },
  { type: TriggerType.SCORE_REACHED, icon: Target, label: 'Pontuação Atingida', color: 'bg-yellow-500' },
];

const CONDITION_COMPONENTS = [
  { type: ConditionType.LEAD_SOURCE, icon: Filter, label: 'Origem Lead', color: 'bg-indigo-500' },
  { type: ConditionType.LEAD_STATUS, icon: Filter, label: 'Status Lead', color: 'bg-indigo-500' },
  { type: ConditionType.LEAD_TAGS, icon: Tag, label: 'Tags Lead', color: 'bg-purple-500' },
  { type: ConditionType.LEAD_SCORE, icon: Target, label: 'Pontuação Lead', color: 'bg-yellow-500' },
  { type: ConditionType.TIME_OF_DAY, icon: Clock, label: 'Horário do Dia', color: 'bg-blue-400' },
  { type: ConditionType.DAY_OF_WEEK, icon: Calendar, label: 'Dia da Semana', color: 'bg-blue-400' },
];

const ACTION_COMPONENTS = [
  { type: ActionType.CREATE_TASK, icon: Calendar, label: 'Criar Tarefa', color: 'bg-blue-500' },
  { type: ActionType.SEND_EMAIL, icon: Mail, label: 'Enviar E-mail', color: 'bg-green-500' },
  { type: ActionType.SEND_WHATSAPP, icon: MessageSquare, label: 'Enviar WhatsApp', color: 'bg-green-600' },
  { type: ActionType.APPLY_TAG, icon: Tag, label: 'Aplicar Tag', color: 'bg-purple-500' },
  { type: ActionType.REMOVE_TAG, icon: Tag, label: 'Remover Tag', color: 'bg-purple-400' },
  { type: ActionType.MOVE_STAGE, icon: ArrowRight, label: 'Mover Etapa', color: 'bg-blue-600' },
  { type: ActionType.SEND_WEBHOOK, icon: Webhook, label: 'Enviar Webhook', color: 'bg-gray-500' },
  { type: ActionType.NOTIFY_USER, icon: Bell, label: 'Notificar Usuário', color: 'bg-orange-500' },
];

const AutomationFlowBuilder: React.FC<AutomationFlowBuilderProps> = ({
  flow,
  onSave,
  onTest,
  isReadOnly = false
}) => {
  const { user } = useAuth();
  
  // Verificar se o usuário tem permissão de administrador
  const isAdmin = user?.user_level === 'admin' || user?.user_level === 'master';

  // Se não for admin, mostrar tela de acesso negado
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="w-96">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-red-600 flex items-center justify-center gap-2">
              <Lock className="w-5 h-5" />
              Acesso Restrito
            </CardTitle>
            <CardDescription className="mt-2">
              O módulo de automações é restrito apenas para usuários <strong>Administradores</strong> e <strong>Master</strong>.
              <br /><br />
              Seu nível atual: <Badge variant="outline">{user?.user_level || 'Não definido'}</Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center justify-center gap-2 text-yellow-800 mb-2">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium">Funcionalidade Sensível</span>
              </div>
              <p className="text-sm text-yellow-700">
                Automações podem afetar dados críticos do sistema e por isso requerem privilégios administrativos.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  const [flowData, setFlowData] = useState<FlowVisualData>(
    flow?.flowData || {
      nodes: [],
      edges: [],
      viewport: { x: 0, y: 0, zoom: 1 }
    }
  );
  
  const [selectedNode, setSelectedNode] = useState<FlowNode | null>(null);
  const [flowName, setFlowName] = useState(flow?.name || '');
  const [flowDescription, setFlowDescription] = useState(flow?.description || '');
  const [isActive, setIsActive] = useState(flow?.isActive || false);
  const [searchTerm, setSearchTerm] = useState('');
  const [draggedComponent, setDraggedComponent] = useState<any>(null);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });

  // Filtrar componentes por busca
  const filterComponents = (components: any[]) => {
    if (!searchTerm) return components;
    return components.filter(comp => 
      comp.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Drag & Drop handlers
  const handleDragStart = (component: any, type: 'trigger' | 'condition' | 'action') => {
    setDraggedComponent({ ...component, nodeType: type });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedComponent || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - canvasOffset.x;
    const y = e.clientY - rect.top - canvasOffset.y;

    const newNode: FlowNode = {
      id: `node_${Date.now()}`,
      type: draggedComponent.nodeType,
      position: { x, y },
      data: {
        label: draggedComponent.label,
        config: {},
        isValid: false
      }
    };

    setFlowData(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode]
    }));

    setDraggedComponent(null);
  };

  // Node selection
  const handleNodeClick = (node: FlowNode) => {
    setSelectedNode(node);
  };

  // Save flow
  const handleSave = () => {
    const flowToSave: Partial<AutomationFlow> = {
      name: flowName,
      description: flowDescription,
      isActive,
      flowData,
      trigger: flowData.nodes.find(n => n.type === 'trigger')?.data.config || {},
      conditions: flowData.nodes.filter(n => n.type === 'condition').map(n => n.data.config) || [],
      actions: flowData.nodes.filter(n => n.type === 'action').map(n => n.data.config) || []
    };
    
    onSave(flowToSave);
  };

  // Test flow
  const handleTest = () => {
    if (onTest && flow) {
      onTest(flow);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Baseada no Typebot */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-blue-600" />
            <h2 className="font-semibold text-gray-900">Flow Builder</h2>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar componentes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Components */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            {/* Gatilhos */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Gatilhos
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {filterComponents(TRIGGER_COMPONENTS).map((component) => {
                  const Icon = component.icon;
                  return (
                    <div
                      key={component.type}
                      draggable
                      onDragStart={() => handleDragStart(component, 'trigger')}
                      className="p-3 border border-gray-200 rounded-lg cursor-move hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className={`p-2 rounded-lg ${component.color} text-white`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="text-xs text-center text-gray-700 font-medium">
                          {component.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Condições */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <GitBranch className="h-4 w-4" />
                Condições
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {filterComponents(CONDITION_COMPONENTS).map((component) => {
                  const Icon = component.icon;
                  return (
                    <div
                      key={component.type}
                      draggable
                      onDragStart={() => handleDragStart(component, 'condition')}
                      className="p-3 border border-gray-200 rounded-lg cursor-move hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className={`p-2 rounded-lg ${component.color} text-white`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="text-xs text-center text-gray-700 font-medium">
                          {component.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Ações */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Ações
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {filterComponents(ACTION_COMPONENTS).map((component) => {
                  const Icon = component.icon;
                  return (
                    <div
                      key={component.type}
                      draggable
                      onDragStart={() => handleDragStart(component, 'action')}
                      className="p-3 border border-gray-200 rounded-lg cursor-move hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className={`p-2 rounded-lg ${component.color} text-white`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="text-xs text-center text-gray-700 font-medium">
                          {component.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <Input
                  placeholder="Nome do fluxo..."
                  value={flowName}
                  onChange={(e) => setFlowName(e.target.value)}
                  className="font-medium"
                  disabled={isReadOnly}
                />
                <Input
                  placeholder="Descrição (opcional)..."
                  value={flowDescription}
                  onChange={(e) => setFlowDescription(e.target.value)}
                  className="mt-2 text-sm"
                  disabled={isReadOnly}
                />
              </div>
              
              <Badge variant={isActive ? "default" : "secondary"}>
                {isActive ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              {!isReadOnly && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsActive(!isActive)}
                  >
                    {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    {isActive ? 'Pausar' : 'Ativar'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTest}
                    disabled={!flow}
                  >
                    <Play className="h-4 w-4" />
                    Testar
                  </Button>
                  
                  <Button
                    size="sm"
                    onClick={handleSave}
                  >
                    <Save className="h-4 w-4" />
                    Salvar
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <div
            ref={canvasRef}
            className="w-full h-full bg-gray-50 relative"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            style={{
              backgroundImage: `
                radial-gradient(circle, #e5e7eb 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px'
            }}
          >
            {/* Start Node */}
            {flowData.nodes.length === 0 && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Comece seu fluxo
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Arraste um gatilho da sidebar para começar
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                    <Plus className="h-4 w-4" />
                    Arraste e solte aqui
                  </div>
                </div>
              </div>
            )}

            {/* Flow Nodes */}
            {flowData.nodes.map((node) => (
              <div
                key={node.id}
                className={`absolute bg-white border-2 rounded-lg p-4 cursor-pointer shadow-sm hover:shadow-md transition-shadow ${
                  selectedNode?.id === node.id ? 'border-blue-500' : 'border-gray-200'
                }`}
                style={{
                  left: node.position.x,
                  top: node.position.y,
                  minWidth: '150px'
                }}
                onClick={() => handleNodeClick(node)}
              >
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${
                    node.type === 'trigger' ? 'bg-green-500' :
                    node.type === 'condition' ? 'bg-indigo-500' :
                    'bg-blue-500'
                  } text-white`}>
                    {node.type === 'trigger' && <Zap className="h-4 w-4" />}
                    {node.type === 'condition' && <GitBranch className="h-4 w-4" />}
                    {node.type === 'action' && <Settings className="h-4 w-4" />}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{node.data.label}</div>
                    <div className="text-xs text-gray-500 capitalize">{node.type}</div>
                  </div>
                </div>
                
                {!node.data.isValid && (
                  <div className="mt-2 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Configuração necessária
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Properties Panel */}
      {selectedNode && (
        <div className="w-80 bg-white border-l border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Configurações</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedNode(null)}
            >
              ×
            </Button>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label>Tipo</Label>
              <div className="mt-1 p-2 bg-gray-50 rounded text-sm capitalize">
                {selectedNode.type}
              </div>
            </div>
            
            <div>
              <Label>Nome</Label>
              <Input
                value={selectedNode.data.label}
                onChange={(e) => {
                  setSelectedNode(prev => prev ? {
                    ...prev,
                    data: { ...prev.data, label: e.target.value }
                  } : null);
                }}
                disabled={isReadOnly}
              />
            </div>
            
            {/* Configurações específicas por tipo serão adicionadas aqui */}
            <div className="text-sm text-gray-500">
              Configurações específicas para {selectedNode.type} serão implementadas na próxima fase.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutomationFlowBuilder;

