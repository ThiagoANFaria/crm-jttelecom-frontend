// AppSidebarFinal - SOLUÇÃO DEFINITIVA - TODOS OS 14 MÓDULOS FORÇADOS
// Criado em: 08/07/2025 22:56 - VERSÃO FINAL
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  FileText, 
  FileSignature, 
  CheckSquare, 
  GitBranch, 
  MessageSquare, 
  Phone, 
  Zap,
  BarChart3,
  FileBarChart,
  Settings,
  Shield
} from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  path: string;
  masterOnly?: boolean;
}

const AppSidebarFinal: React.FC = () => {
  const { user } = useAuth();

  // TODOS OS 14 MÓDULOS - FORÇADOS SEM CONDICIONAIS
  const allModules: SidebarItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'leads', label: 'Leads', icon: Users, path: '/leads' },
    { id: 'clients', label: 'Clientes', icon: UserCheck, path: '/clients' },
    { id: 'proposals', label: 'Propostas', icon: FileText, path: '/proposals' },
    { id: 'contracts', label: 'Contratos', icon: FileSignature, path: '/contracts' },
    { id: 'tasks', label: 'Tarefas', icon: CheckSquare, path: '/tasks' },
    { id: 'pipelines', label: 'Pipelines', icon: GitBranch, path: '/pipelines' },
    { id: 'chatbot', label: 'Chatbot', icon: MessageSquare, path: '/chatbot' },
    { id: 'telephony', label: 'Telefonia', icon: Phone, path: '/telephony' },
    { id: 'automation', label: 'Automação', icon: Zap, path: '/automation' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/analytics' },
    { id: 'reports', label: 'Relatórios', icon: FileBarChart, path: '/reports' },
    { id: 'settings', label: 'Configurações', icon: Settings, path: '/settings' },
    { id: 'master-panel', label: 'Master Panel', icon: Shield, path: '/master-panel', masterOnly: true }
  ];

  // DEBUG: Log para verificar se o componente está sendo executado
  console.log('🔥 AppSidebarFinal CARREGADO - TODOS OS 14 MÓDULOS FORÇADOS!');
  console.log('👤 Usuário atual:', user);
  console.log('📊 Total de módulos:', allModules.length);
  console.log('🎯 Módulos que serão exibidos:', allModules.map(m => m.label));

  return (
    <div className="w-64 bg-gray-900 text-white h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">JT</span>
          </div>
          <div>
            <h1 className="text-lg font-bold">VOX</h1>
            <p className="text-xs text-gray-400">by JT Telecom</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {allModules.map((item, index) => {
          const Icon = item.icon;
          
          // Para Master Panel, só mostra se for usuário Master
          if (item.masterOnly && user?.role !== 'Master') {
            return null;
          }

          return (
            <a
              key={item.id}
              href={item.path}
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors group"
            >
              <Icon className="w-5 h-5 text-gray-400 group-hover:text-white" />
              <span className="text-sm font-medium group-hover:text-white">
                {item.label}
              </span>
              <span className="ml-auto text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                {index + 1}
              </span>
            </a>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <div className="text-xs text-gray-400 text-center">
          AppSidebarFinal v1.0.0<br/>
          {allModules.length} módulos carregados
        </div>
      </div>
    </div>
  );
};

export default AppSidebarFinal;

