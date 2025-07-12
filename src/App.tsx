import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { TenantProvider } from "@/contexts/TenantContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import Login from "@/pages/LoginNew";
import Dashboard from "@/pages/DashboardSimpleFixed";
import DashboardAnalytics from "@/pages/DashboardAnalytics";
import DashboardAnalyticsAdvanced from "@/pages/DashboardAnalyticsAdvanced";
import AdvancedReportsEnhanced from "@/pages/AdvancedReportsEnhanced";
import Configuration from "@/pages/Configuration";
import ContractConfiguration from "@/pages/ContractConfiguration";
import ContractsEnhanced from "@/pages/ContractsEnhanced";
import ChatbotEnhanced from "@/pages/ChatbotEnhanced";
import TelephonyEnhanced from "@/pages/TelephonyEnhanced";
import TelephonyConfiguration from "@/pages/TelephonyConfiguration";
import Proposals from "@/pages/Proposals";
import MasterPanel from "@/pages/MasterPanelSimple";
import TenantAdminPanel from "@/pages/TenantAdminPanel";
import UserTypeSelector from "@/pages/UserTypeSelector";
import Clients from "@/pages/Clients";
import ClientDetail from "@/pages/ClientDetail";
import Leads from "@/pages/LeadsFixed";
import LeadDetail from "@/pages/LeadDetail";
import Contracts from "@/pages/Contracts";
import ContractsNew from "@/pages/ContractsNew";
import TasksSimple from "@/pages/TasksSimple";
import Pipelines from "@/pages/Pipelines";
import Telephony from "@/pages/Telephony";
import Chatbot from "@/pages/Chatbot";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TenantProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate to="/user-test" replace />} />
              
              {/* Rota de Teste de Usuários */}
              <Route path="/user-test" element={<UserTypeSelector />} />
              
              {/* Rota Master - Admin Master JT Telecom */}
              <Route path="/master" element={
                <ProtectedRoute requiredLevel="master">
                  <MasterPanel />
                </ProtectedRoute>
              } />
            
            {/* Rota Admin - Admin da Tenant */}
            <Route path="/admin" element={
              <ProtectedRoute requiredLevel="admin">
                <TenantAdminPanel />
              </ProtectedRoute>
            } />
            
            {/* Rota Admin Dashboard - Admin da Tenant com acesso ao CRM */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute requiredLevel="admin">
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Rotas do CRM - Usuários finais */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/clients" element={
              <ProtectedRoute>
                <Layout>
                  <Clients />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/clients/:id" element={
              <ProtectedRoute>
                <Layout>
                  <ClientDetail />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/leads" element={
              <ProtectedRoute>
                <Layout>
                  <Leads />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/leads/:id" element={
              <ProtectedRoute>
                <Layout>
                  <LeadDetail />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/contracts" element={
              <ProtectedRoute>
                <Layout>
                  <ContractsNew />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/proposals" element={
              <ProtectedRoute>
                <Layout>
                  <Proposals />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/tasks" element={
              <ProtectedRoute>
                <Layout>
                  <TasksSimple />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/pipelines" element={
              <ProtectedRoute>
                <Layout>
                  <Pipelines />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/telephony" element={
              <ProtectedRoute>
                <Layout>
                  <TelephonyEnhanced />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/chatbot" element={
              <ProtectedRoute>
                <Layout>
                  <ChatbotEnhanced />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute>
                <Layout>
                  <DashboardAnalyticsAdvanced />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute>
                <Layout>
                  <AdvancedReportsEnhanced />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/configuration" element={
              <ProtectedRoute requiredLevel="admin">
                <Layout>
                  <Configuration />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/contracts/configuration" element={
              <ProtectedRoute requiredLevel="admin">
                <Layout>
                  <ContractConfiguration />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/telephony/configuration" element={
              <ProtectedRoute requiredLevel="admin">
                <Layout>
                  <TelephonyConfiguration />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </TooltipProvider>
      </TenantProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

