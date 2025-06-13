import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  UserCog, 
  UserCheck,
  Users,
  DollarSign,
  FileText,
  Plus,
  X,
  Save,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

const UserRolesManager = ({ isOpen, onClose, targetUser, onUpdate }) => {
  const { user, updateUser, isMasterUser } = useAuth();
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [loading, setLoading] = useState(false);

  // Definição de todas as roles disponíveis
  const availableRoles = [
    {
      id: 'proprietario',
      label: 'Proprietário',
      description: 'Acesso total ao sistema',
      icon: Shield,
      color: 'bg-red-100 text-red-800',
      permissions: ['Todas as permissões do sistema'],
      restricted: true // Apenas super admin pode atribuir
    },
    {
      id: 'gerente',
      label: 'Gerente',
      description: 'Gerenciamento amplo do salão',
      icon: UserCog,
      color: 'bg-purple-100 text-purple-800',
      permissions: [
        'Gerenciar agendamentos',
        'Gerenciar clientes',
        'Gerenciar equipe',
        'Ver relatórios',
        'Gerenciar categorias'
      ]
    },
    {
      id: 'atendente',
      label: 'Atendente',
      description: 'Atendimento ao cliente',
      icon: UserCheck,
      color: 'bg-blue-100 text-blue-800',
      permissions: [
        'Ver agendamentos',
        'Criar agendamentos',
        'Gerenciar clientes',
        'Criar orçamentos'
      ]
    },
    {
      id: 'profissional',
      label: 'Profissional',
      description: 'Profissional de beleza',
      icon: Users,
      color: 'bg-green-100 text-green-800',
      permissions: [
        'Ver próprio calendário',
        'Aprovar agendamentos próprios',
        'Criar orçamentos',
        'Receber pagamentos'
      ]
    },
    {
      id: 'financeiro',
      label: 'Financeiro',
      description: 'Gestão financeira',
      icon: DollarSign,
      color: 'bg-yellow-100 text-yellow-800',
      permissions: [
        'Ver todos pagamentos',
        'Gerenciar pagamentos',
        'Ver relatórios financeiros',
        'Exportar relatórios'
      ]
    }
  ];

  // Carregar roles atuais do usuário
  useEffect(() => {
    if (targetUser) {
      // Se o usuário tiver múltiplas roles, usar; senão, converter role única em array
      const currentRoles = targetUser.roles || (targetUser.role ? [targetUser.role] : []);
      setSelectedRoles(currentRoles);
    }
  }, [targetUser]);

  // Toggle role
  const toggleRole = (roleId) => {
    // Verificar se pode adicionar role de proprietário
    if (roleId === 'proprietario' && !isMasterUser()) {
      toast({
        title: "Sem permissão",
        description: "Apenas o proprietário pode atribuir esta role",
        variant: "destructive"
      });
      return;
    }

    // Não permitir remover a última role
    if (selectedRoles.includes(roleId) && selectedRoles.length === 1) {
      toast({
        title: "Erro",
        description: "O usuário deve ter pelo menos uma role",
        variant: "destructive"
      });
      return;
    }

    setSelectedRoles(prev => 
      prev.includes(roleId) 
        ? prev.filter(r => r !== roleId)
        : [...prev, roleId]
    );
  };

  // Salvar alterações
  const saveRoles = async () => {
    if (selectedRoles.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos uma role",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await updateUser(targetUser.username, {
        roles: selectedRoles,
        role: selectedRoles[0] // Manter compatibilidade
      });

      toast({
        title: "Sucesso",
        description: "Roles atualizadas com sucesso",
      });

      if (onUpdate) onUpdate();
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar roles:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar roles do usuário",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !targetUser) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold">Gerenciar Roles</h2>
            <p className="text-gray-600 text-sm mt-1">
              Usuário: <strong>{targetUser.name}</strong> (@{targetUser.username})
            </p>
          </div>
          <Button variant="ghost" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Aviso sobre múltiplas roles */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 mb-1">
                Sistema de Múltiplas Roles
              </p>
              <p className="text-blue-700">
                Um usuário pode ter múltiplas roles. As permissões serão a combinação 
                de todas as roles selecionadas. Por exemplo, um usuário pode ser 
                "Atendente" e "Financeiro" ao mesmo tempo.
              </p>
            </div>
          </div>
        </div>

        {/* Lista de roles disponíveis */}
        <div className="space-y-4 mb-6">
          <h3 className="font-medium text-gray-800">Roles Disponíveis</h3>
          
          {availableRoles.map(role => {
            const Icon = role.icon;
            const isSelected = selectedRoles.includes(role.id);
            const canSelect = !role.restricted || isMasterUser();
            
            return (
              <div
                key={role.id}
                className={`border rounded-lg p-4 transition-all ${
                  isSelected 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-200 hover:border-gray-300'
                } ${!canSelect ? 'opacity-50' : 'cursor-pointer'}`}
                onClick={() => canSelect && toggleRole(role.id)}
              >
                <div className="flex items-start">
                  <div className="mr-3 mt-1">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      disabled={!canSelect}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <Badge className={role.color}>
                        <Icon className="w-3 h-3 mr-1" />
                        {role.label}
                      </Badge>
                      {role.restricted && (
                        <Badge className="ml-2 bg-red-100 text-red-800">
                          <Shield className="w-3 h-3 mr-1" />
                          Restrito
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {role.description}
                    </p>
                    
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">
                        Permissões:
                      </p>
                      <ul className="text-xs text-gray-500 space-y-0.5">
                        {role.permissions.slice(0, 3).map((perm, idx) => (
                          <li key={idx}>• {perm}</li>
                        ))}
                        {role.permissions.length > 3 && (
                          <li>• +{role.permissions.length - 3} outras</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Resumo das roles selecionadas */}
        {selectedRoles.length > 0 && (
          <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="text-sm font-medium text-green-800 mb-2">
              Roles Selecionadas:
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedRoles.map(roleId => {
                const role = availableRoles.find(r => r.id === roleId);
                if (!role) return null;
                const Icon = role.icon;
                
                return (
                  <Badge key={roleId} className={role.color}>
                    <Icon className="w-3 h-3 mr-1" />
                    {role.label}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Botões de ação */}
        <div className="flex space-x-3">
          <Button 
            onClick={saveRoles} 
            disabled={loading || selectedRoles.length === 0}
            className="flex-1"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar Alterações
              </>
            )}
          </Button>
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserRolesManager;
