import React from 'react';
import AppSidebarSimplest from './AppSidebarSimplest';
import { useAuth } from '@/context/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import { Button } from '@/components/ui/button';
import { LogOut, User, Building2 } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  console.log('🔧 Layout CARREGADO - Usando AppSidebarSimplest');
  
  const { user, logout } = useAuth();
  const { currentTenant } = useTenant();

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f5f5f5' }}>
      <AppSidebarSimplest />
      
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        marginLeft: '256px',
        overflow: 'hidden' 
      }}>
        {/* Header */}
        <header style={{
          height: '64px',
          backgroundColor: 'white',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* JT Vox Logo Compacto */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                backgroundColor: '#2563eb',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '8px',
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: '900',
                fontSize: '14px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}>
                JT
              </div>
              <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                {[8, 12, 10, 14, 7].map((height, index) => (
                  <div
                    key={index}
                    style={{
                      width: '2px',
                      height: `${height}px`,
                      backgroundColor: '#10b981',
                      borderRadius: '2px'
                    }}
                  />
                ))}
              </div>
              <span style={{
                color: '#2563eb',
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 'bold',
                fontSize: '18px',
                letterSpacing: '0.05em'
              }}>
                VOX
              </span>
            </div>
            
            {/* Nome da Empresa */}
            {currentTenant && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                color: '#6b7280',
                backgroundColor: '#f3f4f6',
                padding: '4px 12px',
                borderRadius: '8px'
              }}>
                <Building2 style={{ width: '16px', height: '16px' }} />
                <span style={{ fontWeight: '500' }}>{currentTenant.name}</span>
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              color: '#6b7280'
            }}>
              <User style={{ width: '16px', height: '16px' }} />
              <span>{user?.name}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                borderColor: '#2563eb',
                color: '#2563eb'
              }}
            >
              <LogOut style={{ width: '16px', height: '16px' }} />
              Sair
            </Button>
          </div>
        </header>
        
        {/* Main Content */}
        <main style={{ flex: 1, padding: '24px', overflow: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;

