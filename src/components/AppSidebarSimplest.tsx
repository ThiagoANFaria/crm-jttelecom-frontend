// AppSidebarSimplest - VERSÃO MAIS SIMPLES POSSÍVEL - TODOS OS 12 MÓDULOS
// Criado em: 08/07/2025 23:15 - SEM DEPENDÊNCIAS EXTERNAS
// Atualizado: 12/07/2025 03:33 - Automação movida para Configurações
import React from 'react';

const AppSidebarSimplest: React.FC = () => {
  console.log('🚀 AppSidebarSimplest CARREGADO - 12 MÓDULOS GARANTIDOS!');
  console.log('📋 Módulos que devem aparecer: Dashboard, Leads, Clientes, Propostas, Contratos, Tarefas, Pipelines, Chatbot, Telefonia, Analytics, Relatórios, Configurações');
  
  const modules = [
    { id: 1, name: 'Dashboard', path: '/dashboard' },
    { id: 2, name: 'Leads', path: '/leads' },
    { id: 3, name: 'Clientes', path: '/clients' },
    { id: 4, name: 'Propostas', path: '/proposals' },
    { id: 5, name: 'Contratos', path: '/contracts' },
    { id: 6, name: 'Tarefas', path: '/tasks' },
    { id: 7, name: 'Pipelines', path: '/pipelines' },
    { id: 8, name: 'Chatbot', path: '/chatbot' },
    { id: 9, name: 'Telefonia', path: '/telephony' },
    { id: 10, name: 'Analytics', path: '/analytics' },
    { id: 11, name: 'Relatórios', path: '/reports' },
    { id: 12, name: 'Configurações', path: '/configuration' }
  ];

  console.log(`📊 Total de módulos definidos: ${modules.length}`);
  
  return (
    <div style={{
      width: '256px',
      backgroundColor: '#1f2937',
      color: 'white',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 1000
    }}>
      {/* Header */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid #374151'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            backgroundColor: '#2563eb',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '14px' }}>JT</span>
          </div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>VOX</h1>
            <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>SIMPLEST v1.0</p>
          </div>
        </div>
      </div>

      {/* Navigation - TODOS OS 14 MÓDULOS */}
      <nav style={{
        flex: 1,
        padding: '16px',
        overflowY: 'auto'
      }}>
        {modules.map((module) => (
          <a
            key={module.id}
            href={module.path}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px',
              marginBottom: '8px',
              borderRadius: '8px',
              textDecoration: 'none',
              color: 'white',
              backgroundColor: 'transparent',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#374151';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <span style={{ fontSize: '14px', fontWeight: '500' }}>
              {module.id}. {module.name}
            </span>
          </a>
        ))}
      </nav>

      {/* Footer */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid #374151',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '12px', color: '#9ca3af' }}>
          SIMPLEST v1.0.0<br/>
          {modules.length} módulos ativos
        </div>
      </div>
    </div>
  );
};

export default AppSidebarSimplest;

