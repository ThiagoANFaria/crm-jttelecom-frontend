// AppSidebarUltraSimple - FORÇA BRUTA - TODOS OS 14 MÓDULOS SEM CONDICIONAIS
// Criado em: 08/07/2025 23:05 - VERSÃO ULTRA SIMPLES
import React from 'react';

const AppSidebarUltraSimple: React.FC = () => {
  console.log('🚀 AppSidebarUltraSimple CARREGADO - FORÇA BRUTA ATIVADA!');
  
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
            <p className="text-xs text-gray-400">ULTRA SIMPLE</p>
          </div>
        </div>
      </div>

      {/* Navigation - TODOS OS 14 MÓDULOS FORÇADOS */}
      <nav className="flex-1 p-4 space-y-2">
        <a href="/dashboard" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors group">
          <span className="text-sm font-medium">1. Dashboard</span>
        </a>
        <a href="/leads" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors group">
          <span className="text-sm font-medium">2. Leads</span>
        </a>
        <a href="/clients" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors group">
          <span className="text-sm font-medium">3. Clientes</span>
        </a>
        <a href="/proposals" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors group">
          <span className="text-sm font-medium">4. Propostas</span>
        </a>
        <a href="/contracts" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors group">
          <span className="text-sm font-medium">5. Contratos</span>
        </a>
        <a href="/tasks" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors group">
          <span className="text-sm font-medium">6. Tarefas</span>
        </a>
        <a href="/pipelines" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors group">
          <span className="text-sm font-medium">7. Pipelines</span>
        </a>
        <a href="/chatbot" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors group">
          <span className="text-sm font-medium">8. Chatbot</span>
        </a>
        <a href="/telephony" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors group">
          <span className="text-sm font-medium">9. Telefonia</span>
        </a>
        <a href="/automation" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors group">
          <span className="text-sm font-medium">10. Automação</span>
        </a>
        <a href="/analytics" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors group">
          <span className="text-sm font-medium">11. Analytics</span>
        </a>
        <a href="/reports" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors group">
          <span className="text-sm font-medium">12. Relatórios</span>
        </a>
        <a href="/settings" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors group">
          <span className="text-sm font-medium">13. Configurações</span>
        </a>
        <a href="/master-panel" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors group">
          <span className="text-sm font-medium">14. Master Panel</span>
        </a>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <div className="text-xs text-gray-400 text-center">
          ULTRA SIMPLE v1.0.0<br/>
          14 módulos FORÇADOS
        </div>
      </div>
    </div>
  );
};

export default AppSidebarUltraSimple;

