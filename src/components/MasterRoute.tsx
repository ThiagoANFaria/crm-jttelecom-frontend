import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserType } from '../types';
import { Shield, AlertTriangle, Crown } from 'lucide-react';

interface MasterRouteProps {
  children: React.ReactNode;
}

const MasterRoute: React.FC<MasterRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <div className="flex items-center justify-center space-x-2 text-gray-600">
            <Shield className="w-5 h-5" />
            <span>Verificando permissões Master...</span>
          </div>
        </div>
      </div>
    );
  }

  // Não logado
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Não é usuário Master
  if (user.user_level !== UserType.MASTER) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Acesso Negado
          </h1>
          
          <p className="text-gray-600 mb-6">
            Esta área é restrita apenas para usuários Master. 
            Você não possui as permissões necessárias para acessar esta funcionalidade.
          </p>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 text-yellow-800">
              <Shield className="w-5 h-5" />
              <span className="font-medium">Informações de Segurança:</span>
            </div>
            <ul className="mt-2 text-sm text-yellow-700 space-y-1">
              <li>• Usuário atual: {user.name}</li>
              <li>• Nível de acesso: {user.user_level}</li>
              <li>• Tenant: {user.tenant_name || 'N/A'}</li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => window.history.back()}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Voltar
            </button>
            
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ir para Dashboard
            </button>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Se você acredita que deveria ter acesso Master, entre em contato com o administrador do sistema.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Usuário Master válido - renderizar conteúdo protegido
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header de segurança Master */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-2 text-sm">
            <Crown className="w-4 h-4" />
            <span className="font-medium">MODO MASTER ATIVO</span>
            <span className="opacity-75">|</span>
            <span className="opacity-90">Acesso total ao sistema</span>
            <span className="opacity-75">|</span>
            <span className="opacity-90">Usuário: {user.name}</span>
          </div>
        </div>
      </div>
      
      {/* Conteúdo protegido */}
      {children}
    </div>
  );
};

export default MasterRoute;

