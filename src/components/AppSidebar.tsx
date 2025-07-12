// AppSidebar - Versão 3.0.0 - SOLUÇÃO DEFINITIVA - 08/07/2025 22:50
// FORÇANDO EXIBIÇÃO DE TODOS OS 14 MÓDULOS - SEM CONDICIONAIS
// ÚLTIMA ATUALIZAÇÃO: 08/07/2025 22:50
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  FileText,
  FileCheck,
  CheckSquare,
  GitBranch,
  MessageCircle,
  Phone,
  Zap,
  BarChart3,
  FileBarChart,
  Settings,
  Shield,
} from 'lucide-react';

export function AppSidebar() {
  const location = useLocation();
  const { user } = useAuth();
  
  // HARD-CODED: Lista completa de todos os 14 módulos - SEM CONDICIONAIS
  const menuItems = [
    { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
    { title: 'Leads', url: '/leads', icon: UserPlus },
    { title: 'Clientes', url: '/clients', icon: Users },
    { title: 'Propostas', url: '/proposals', icon: FileText },
    { title: 'Contratos', url: '/contracts', icon: FileCheck },
    { title: 'Tarefas', url: '/tasks', icon: CheckSquare },
    { title: 'Pipelines', url: '/pipelines', icon: GitBranch },
    { title: 'Analytics', url: '/analytics', icon: BarChart3 },
    { title: 'Relatórios', url: '/reports', icon: FileBarChart },
    { title: 'Smartbot', url: '/chatbot', icon: MessageCircle },
    { title: 'JT Vox PABX', url: '/telephony', icon: Phone },
    { title: 'Automação', url: '/automation', icon: Zap },
    { title: 'Configurações', url: '/configuration', icon: Settings },
    { title: 'Master Panel', url: '/master', icon: Shield },
  ];
  
  // DEBUG ROBUSTO - FORÇAR LOGS NO CONSOLE
  console.log('=== AppSidebar v3.0.0 - DEBUG INICIADO ===');
  console.log('Total de módulos:', menuItems.length);
  console.log('Lista de módulos:', menuItems.map(item => item.title));
  console.log('Usuário atual:', user?.name, user?.role);
  console.log('=== FIM DEBUG AppSidebar v3.0.0 ===');
  
  // FORÇAR ALERTA NO NAVEGADOR PARA CONFIRMAR EXECUÇÃO
  if (typeof window !== 'undefined') {
    window.jt_sidebar_debug = {
      version: '3.0.0',
      totalModules: menuItems.length,
      modules: menuItems.map(item => item.title),
      timestamp: new Date().toISOString()
    };
  }

  return (
    <Sidebar className="border-r border-gray-200 bg-jt-white h-screen overflow-y-auto" collapsible="icon">
      <SidebarContent className="h-full">
        <SidebarGroup className="h-full">
          <SidebarGroupLabel className="text-jt-blue font-semibold">
            JT Vox - v3.0.0 ({menuItems.length} módulos)
          </SidebarGroupLabel>
          <SidebarGroupContent className="flex-1 overflow-y-auto">
            <SidebarMenu className="space-y-1">
              {menuItems.map((item, index) => {
                const isActive = location.pathname === item.url;
                console.log(`Renderizando módulo ${index + 1}: ${item.title}`);
                return (
                  <SidebarMenuItem key={`${item.title}-${index}`}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <NavLink
                        to={item.url}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-jt-blue text-jt-white'
                            : 'text-gray-600 hover:bg-blue-50 hover:text-jt-blue'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

