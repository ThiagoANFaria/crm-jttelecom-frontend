import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserType } from '@/types';

interface MockAuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  setUserType: (type: UserType) => void;
  setUserAsMaster: () => void;
  setUserAsAdmin: () => void;
  setUserAsRegular: () => void;
  isMaster: () => boolean;
  isAdmin: () => boolean;
}

const MockAuthContext = createContext<MockAuthContextType | undefined>(undefined);

interface MockAuthProviderProps {
  children: ReactNode;
}

export const MockAuthProvider: React.FC<MockAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>({
    id: 'test-user-1',
    name: 'Usuário Teste',
    email: 'teste@jttecnologia.com.br',
    user_level: UserType.USER,
    tenant_id: 'jt-telecom-001',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  const setUserType = (type: UserType) => {
    if (user) {
      setUser({
        ...user,
        user_level: type,
        // Master não deve ter tenant_id
        tenant_id: type === UserType.MASTER ? undefined : 'jt-telecom-001',
      });
    }
  };

  const setUserAsMaster = () => {
    setUser({
      id: 'master-user-1',
      name: 'Master Admin',
      email: 'master@jttecnologia.com.br',
      user_level: UserType.MASTER,
      tenant_id: undefined, // Master não tem tenant
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  };

  const setUserAsAdmin = () => {
    setUser({
      id: 'admin-user-1',
      name: 'Admin Tenant',
      email: 'admin@jttecnologia.com.br',
      user_level: UserType.ADMIN,
      tenant_id: 'jt-telecom-001',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  };

  const setUserAsRegular = () => {
    setUser({
      id: 'regular-user-1',
      name: 'Usuário Regular',
      email: 'user@jttecnologia.com.br',
      user_level: UserType.USER,
      tenant_id: 'jt-telecom-001',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  };

  const isMaster = (): boolean => {
    return user?.user_level === UserType.MASTER;
  };

  const isAdmin = (): boolean => {
    return user?.user_level === UserType.ADMIN;
  };

  const value: MockAuthContextType = {
    user,
    isAuthenticated: !!user,
    setUserType,
    setUserAsMaster,
    setUserAsAdmin,
    setUserAsRegular,
    isMaster,
    isAdmin,
  };

  return (
    <MockAuthContext.Provider value={value}>
      {children}
    </MockAuthContext.Provider>
  );
};

export const useMockAuth = (): MockAuthContextType => {
  const context = useContext(MockAuthContext);
  if (context === undefined) {
    throw new Error('useMockAuth must be used within a MockAuthProvider');
  }
  return context;
};

