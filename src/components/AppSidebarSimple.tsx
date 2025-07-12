import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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

// Lista completa e hard-coded de todos os 14 módulos
const ALL_MENU_ITEMS = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Leads', url: '/leads', icon: UserPlus },
  { title: 'Clientes', url: '/clients', icon: Users },
  { title: 'Propostas', url: '/proposals', icon: FileText },
  { title: 'Contratos', url: '/contracts', icon: FileCheck },
  { title: 'Tarefas', url: '/tasks', icon: CheckSquare },
  { title: 'Pipelines', url: '/pipelines', icon: GitBranch },
  { title: 'Analytics', url: '/analytics', icon: BarChart3 },
  { title: 'Relatórios', url: '/reports', icon: FileBarChart },
  { title: 'Chatbot', url: '/chatbot', icon: MessageCircle },
  { title: 'Telefonia', url: '/telephony', icon: Phone },
  { title: 'Automação', url: '/automation', icon: Zap },
  { title: 'Configurações', url: '/configuration', icon: Settings },
  { title: 'Master Panel', url: '/master', icon: Shield },
];

export function AppSidebarSimple() {
  const location = useLocation();

  return (
    <Sidebar className="border-r border-gray-200 bg-white" collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-blue-600 font-semibold">
            JT Vox - Todos os Módulos ({ALL_MENU_ITEMS.length})
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {ALL_MENU_ITEMS.map((item, index) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={`${item.title}-${index}`}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <NavLink
                        to={item.url}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.title}</span>
                        <span className="ml-auto text-xs opacity-50">#{index + 1}</span>
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

