import React from 'react';
import { useMockAuth } from '@/context/MockAuthContext';
import { UserType } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Shield, User } from 'lucide-react';

export default function UserTypeSelector() {
  const { user, setUserAsMaster, setUserAsAdmin, setUserAsRegular, isMaster, isAdmin } = useMockAuth();

  const getUserTypeIcon = () => {
    if (isMaster()) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (isAdmin()) return <Shield className="w-5 h-5 text-blue-500" />;
    return <User className="w-5 h-5 text-gray-500" />;
  };

  const getUserTypeBadge = () => {
    if (isMaster()) return <Badge variant="destructive">MASTER</Badge>;
    if (isAdmin()) return <Badge variant="default">ADMIN</Badge>;
    return <Badge variant="secondary">USER</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Teste de Tipos de Usuário
          </h1>
          <p className="text-gray-600">
            Selecione um tipo de usuário para testar as permissões do sistema
          </p>
        </div>

        {/* Status Atual */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getUserTypeIcon()}
              Usuário Atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">Nome:</span>
                <span>{user?.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Email:</span>
                <span>{user?.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Tipo:</span>
                {getUserTypeBadge()}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Tenant ID:</span>
                <span>{user?.tenant_id || 'N/A (Master)'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seletores de Tipo */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Master User */}
          <Card className="border-yellow-200 hover:border-yellow-300 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-700">
                <Crown className="w-5 h-5" />
                Master User
              </CardTitle>
              <CardDescription>
                Usuário Master para gestão global de tenants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm text-gray-600">
                  <strong>Permissões:</strong>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Criar e gerenciar tenants</li>
                    <li>Configurar usuários admin</li>
                    <li>Sem acesso a dados internos</li>
                    <li>Gestão global do sistema</li>
                  </ul>
                </div>
                <Button 
                  onClick={setUserAsMaster}
                  className="w-full"
                  variant={isMaster() ? "default" : "outline"}
                >
                  {isMaster() ? "Ativo" : "Selecionar"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Admin User */}
          <Card className="border-blue-200 hover:border-blue-300 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Shield className="w-5 h-5" />
                Admin User
              </CardTitle>
              <CardDescription>
                Administrador de tenant com acesso completo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm text-gray-600">
                  <strong>Permissões:</strong>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Acesso total ao CRM</li>
                    <li>Configurações do tenant</li>
                    <li>Gerenciar usuários</li>
                    <li>Relatórios avançados</li>
                  </ul>
                </div>
                <Button 
                  onClick={setUserAsAdmin}
                  className="w-full"
                  variant={isAdmin() ? "default" : "outline"}
                >
                  {isAdmin() ? "Ativo" : "Selecionar"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Regular User */}
          <Card className="border-gray-200 hover:border-gray-300 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-700">
                <User className="w-5 h-5" />
                Regular User
              </CardTitle>
              <CardDescription>
                Usuário comum com acesso limitado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm text-gray-600">
                  <strong>Permissões:</strong>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Acesso básico ao CRM</li>
                    <li>Gerenciar leads e clientes</li>
                    <li>Criar propostas</li>
                    <li>Relatórios básicos</li>
                  </ul>
                </div>
                <Button 
                  onClick={setUserAsRegular}
                  className="w-full"
                  variant={!isMaster() && !isAdmin() ? "default" : "outline"}
                >
                  {!isMaster() && !isAdmin() ? "Ativo" : "Selecionar"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instruções */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">Como Testar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-blue-700 space-y-2">
              <p>1. Selecione um tipo de usuário acima</p>
              <p>2. Navegue pelos módulos no sidebar para testar as permissões</p>
              <p>3. Observe quais funcionalidades estão disponíveis para cada tipo</p>
              <p>4. Teste especialmente o acesso ao Master Panel e Configurações</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

