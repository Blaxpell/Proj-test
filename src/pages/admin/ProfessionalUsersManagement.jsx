import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  Edit, 
  Trash2, 
  Eye,
  EyeOff,
  Shield,
  Key,
  User,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

const ProfessionalUsersManagement = () => {
  const { user, hasPermission, getAllUsers, createUser, updateUser, deactivateUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProfessionals, setLoadingProfessionals] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);

  // Estados do formulário
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    professionalId: ''
  });

  // Carregar profissionais
  const loadProfessionals = async () => {
    setLoadingProfessionals(true);
    try {
      const response = await fetch('https://coherent-escargot-23835.upstash.io/', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer AV0bAAIjcDEyODVlMzY0YTk2ODk0M2JkOTRlNmVmMmUzZTQwMDNkMnAxMA',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(['KEYS', 'profissional:*']),
      });

      if (response.ok) {
        const keysData = await response.json();
        let allProfessionals = [];

        if (keysData.result && Array.isArray(keysData.result)) {
          for (const key of keysData.result) {
            try {
              const getResponse = await fetch('https://coherent-escargot-23835.upstash.io/', {
                method: 'POST',
                headers: {
                  Authorization: 'Bearer AV0bAAIjcDEyODVlMzY0YTk2ODk0M2JkOTRlNmVmMmUzZTQwMDNkMnAxMA',
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(['GET', key]),
              });

              if (getResponse.ok) {
                const getData = await getResponse.json();
                if (getData.result) {
                  const professional = JSON.parse(getData.result);
                  allProfessionals.push(professional);
                }
              }
            } catch (error) {
              console.error(`Erro ao buscar ${key}:`, error);
            }
          }
        }

        setProfessionals(allProfessionals);
      }
    } catch (error) {
      console.error('Erro ao carregar profissionais:', error);
    } finally {
      setLoadingProfessionals(false);
    }
  };

  // Carregar lista de usuários
  const loadUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await getAllUsers();
      // Filtrar apenas usuários que são profissionais
      const professionalUsers = allUsers.filter(u => u.role === 'profissional');
      setUsers(professionalUsers);
      setFilteredUsers(professionalUsers);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar lista de usuários",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Filtrar usuários
  useEffect(() => {
    const filtered = users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [users, searchTerm]);

  // Resetar formulário
  const resetForm = () => {
    setFormData({
      name: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      professionalId: ''
    });
  };

  // Abrir modal de adicionar
  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  // Abrir modal de editar
  const openEditModal = (userToEdit) => {
    setSelectedUser(userToEdit);
    setFormData({
      name: userToEdit.name,
      username: userToEdit.username,
      email: userToEdit.email,
      password: '',
      confirmPassword: '',
      professionalId: userToEdit.professionalId || ''
    });
    setShowEditModal(true);
  };

  // Fechar modais
  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedUser(null);
    resetForm();
  };

  // Salvar novo usuário
  const saveNewUser = async () => {
    // Validações
    if (!formData.name || !formData.username || !formData.email || !formData.professionalId) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive"
      });
      return;
    }

    if (formData.password && formData.password.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive"
      });
      return;
    }

    // Verificar se o profissional já tem usuário
    const existingUser = users.find(u => u.professionalId == formData.professionalId);
    if (existingUser) {
      toast({
        title: "Erro",
        description: "Este profissional já possui um usuário cadastrado",
        variant: "destructive"
      });
      return;
    }

    try {
      await createUser({
        name: formData.name,
        username: formData.username,
        email: formData.email,
        role: 'profissional',
        password: formData.password || 'senha123',
        professionalId: formData.professionalId
      });

      toast({
        title: "Sucesso",
        description: "Usuário criado com sucesso"
      });

      closeModals();
      loadUsers();
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar usuário",
        variant: "destructive"
      });
    }
  };

  // Atualizar usuário
  const updateUserData = async () => {
    if (!formData.name || !formData.email) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive"
      });
      return;
    }

    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
        professionalId: formData.professionalId
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      await updateUser(selectedUser.username, updateData);

      toast({
        title: "Sucesso",
        description: "Usuário atualizado com sucesso"
      });

      closeModals();
      loadUsers();
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar usuário",
        variant: "destructive"
      });
    }
  };

  // Desativar usuário
  const handleDeactivate = async (username) => {
    if (!confirm('Tem certeza que deseja desativar este usuário?')) return;

    try {
      await deactivateUser(username);
      toast({
        title: "Sucesso",
        description: "Usuário desativado com sucesso"
      });
      loadUsers();
    } catch (error) {
      console.error('Erro ao desativar usuário:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao desativar usuário",
        variant: "destructive"
      });
    }
  };

  // Reativar usuário
  const handleReactivate = async (username) => {
    try {
      await updateUser(username, { active: true });
      toast({
        title: "Sucesso",
        description: "Usuário reativado com sucesso"
      });
      loadUsers();
    } catch (error) {
      console.error('Erro ao reativar usuário:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao reativar usuário",
        variant: "destructive"
      });
    }
  };

  // Obter nome do profissional
  const getProfessionalName = (professionalId) => {
    const professional = professionals.find(p => p.id == professionalId);
    return professional ? professional.name : 'Profissional não encontrado';
  };

  // Obter profissionais sem usuário
  const getAvailableProfessionals = () => {
    return professionals.filter(prof => {
      const hasUser = users.some(user => user.professionalId == prof.id);
      return !hasUser;
    });
  };

  // Carregar dados ao montar componente
  useEffect(() => {
    if (hasPermission('manage_staff')) {
      loadProfessionals();
      loadUsers();
    }
  }, [hasPermission]);

  if (!hasPermission('manage_staff')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600">Acesso Restrito</h2>
          <p className="text-gray-500">Você não tem permissão para gerenciar usuários</p>
        </div>
      </div>
    );
  }

  if (loading || loadingProfessionals) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuários de Profissionais</h1>
          <p className="text-gray-600">Crie contas de acesso para seus profissionais</p>
        </div>
        <Button onClick={openAddModal} disabled={getAvailableProfessionals().length === 0}>
          <UserPlus className="w-4 h-4 mr-2" />
          Criar Usuário
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-purple-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total de Usuários</p>
              <p className="text-2xl font-bold">{users.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Ativos</p>
              <p className="text-2xl font-bold">{users.filter(u => u.active).length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <XCircle className="w-8 h-8 text-red-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Inativos</p>
              <p className="text-2xl font-bold">{users.filter(u => !u.active).length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-orange-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Sem Usuário</p>
              <p className="text-2xl font-bold">{getAvailableProfessionals().length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerta se houver profissionais sem usuário */}
      {getAvailableProfessionals().length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-orange-500 mr-3 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-orange-800">
                Profissionais sem acesso ao sistema
              </h3>
              <p className="text-sm text-orange-700 mt-1">
                {getAvailableProfessionals().length} profissional(is) ainda não possui(em) usuário para acessar o sistema.
                Clique em "Criar Usuário" para dar acesso.
              </p>
              <div className="mt-2">
                <span className="text-xs text-orange-600">
                  Profissionais: {getAvailableProfessionals().map(p => p.name).join(', ')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por nome, usuário ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <Button variant="outline" onClick={() => { loadUsers(); loadProfessionals(); }}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar Lista
          </Button>
        </div>
      </div>

      {/* Lista de Usuários */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profissional Vinculado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Último Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((userItem) => (
                <tr key={userItem.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {userItem.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        @{userItem.username} • {userItem.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {userItem.professionalId ? getProfessionalName(userItem.professionalId) : 'Não vinculado'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {userItem.active ? (
                        <>
                          <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                          <span className="text-sm text-green-600">Ativo</span>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 bg-red-400 rounded-full mr-2"></div>
                          <span className="text-sm text-red-600">Inativo</span>
                        </>
                      )}
                      {userItem.firstLogin && (
                        <Badge className="ml-2 bg-orange-100 text-orange-800">
                          Primeiro Login Pendente
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {userItem.lastLogin 
                      ? new Date(userItem.lastLogin).toLocaleDateString('pt-BR')
                      : 'Nunca'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditModal(userItem)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      
                      {userItem.active ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeactivate(userItem.username)}
                          disabled={userItem.username === user.username}
                        >
                          <EyeOff className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReactivate(userItem.username)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredUsers.length === 0 && (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Nenhum usuário encontrado</p>
          </div>
        )}
      </div>

      {/* Modal Adicionar Usuário */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md m-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Criar Usuário para Profissional</h2>
              <Button variant="ghost" onClick={closeModals}>✕</Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profissional *
                </label>
                <select
                  value={formData.professionalId}
                  onChange={(e) => {
                    const selectedProf = professionals.find(p => p.id == e.target.value);
                    setFormData({
                      ...formData, 
                      professionalId: e.target.value,
                      name: selectedProf ? selectedProf.name : '',
                      email: selectedProf ? selectedProf.email || '' : ''
                    });
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Selecione um profissional</option>
                  {getAvailableProfessionals().map(prof => (
                    <option key={prof.id} value={prof.id}>{prof.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Digite o nome completo"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome de Usuário *
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  placeholder="Digite o nome de usuário"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="Digite o email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Senha Temporária *
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="Digite uma senha temporária"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar Senha *
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  placeholder="Confirme a senha"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <Button onClick={saveNewUser} className="flex-1">
                Criar Usuário
              </Button>
              <Button variant="outline" onClick={closeModals} className="flex-1">
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Usuário */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md m-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Editar Usuário</h2>
              <Button variant="ghost" onClick={closeModals}>✕</Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profissional Vinculado
                </label>
                <input
                  type="text"
                  value={getProfessionalName(selectedUser.professionalId)}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome de Usuário
                </label>
                <input
                  type="text"
                  value={formData.username}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">O nome de usuário não pode ser alterado</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nova Senha (opcional)
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="Deixe vazio para manter a atual"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              {formData.password && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar Nova Senha
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    placeholder="Confirme a nova senha"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>
            
            <div className="flex space-x-3 mt-6">
              <Button onClick={updateUserData} className="flex-1">
                Salvar Alterações
              </Button>
              <Button variant="outline" onClick={closeModals} className="flex-1">
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ProfessionalUsersManagement;