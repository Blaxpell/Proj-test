import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar autenticação ao carregar
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const savedUser = localStorage.getItem('salon_user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        
        // Verificar se o usuário ainda é válido no servidor
        const isValid = await validateUser(userData.username);
        if (isValid) {
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          // Limpar dados inválidos
          localStorage.removeItem('salon_user');
        }
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      localStorage.removeItem('salon_user');
    } finally {
      setLoading(false);
    }
  };

  const validateUser = async (username) => {
    try {
      const response = await fetch('https://coherent-escargot-23835.upstash.io/', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer AV0bAAIjcDEyODVlMzY0YTk2ODk0M2JkOTRlNmVmMmUzZTQwMDNkMnAxMA',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(['GET', `user:${username}`]),
      });

      if (response.ok) {
        const data = await response.json();
        return data.result !== null;
      }
      return false;
    } catch (error) {
      console.error('Erro ao validar usuário:', error);
      return false;
    }
  };

  const login = async (username, password) => {
    try {
      // Buscar usuário no Redis
      const response = await fetch('https://coherent-escargot-23835.upstash.io/', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer AV0bAAIjcDEyODVlMzY0YTk2ODk0M2JkOTRlNmVmMmUzZTQwMDNkMnAxMA',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(['GET', `user:${username}`]),
      });

      if (!response.ok) {
        throw new Error('Erro na conexão');
      }

      const data = await response.json();
      
      if (!data.result) {
        throw new Error('Usuário não encontrado');
      }

      const userData = JSON.parse(data.result);
      
      if (!userData.active) {
        throw new Error('Usuário inativo');
      }

      // Verificar senha (aqui você pode implementar hash se necessário)
      if (userData.password !== password) {
        throw new Error('Senha incorreta');
      }

      // Se o usuário é um profissional, buscar dados do profissional
      let professionalData = null;
      if (userData.role === 'profissional' && userData.professionalId) {
        try {
          const profResponse = await fetch('https://coherent-escargot-23835.upstash.io/', {
            method: 'POST',
            headers: {
              Authorization: 'Bearer AV0bAAIjcDEyODVlMzY0YTk2ODk0M2JkOTRlNmVmMmUzZTQwMDNkMnAxMA',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(['GET', `profissional:${userData.professionalId}`]),
          });

          if (profResponse.ok) {
            const profData = await profResponse.json();
            if (profData.result) {
              professionalData = JSON.parse(profData.result);
            }
          }
        } catch (error) {
          console.error('Erro ao buscar dados do profissional:', error);
        }
      }

      // Atualizar último login
      const updatedUser = {
        ...userData,
        lastLogin: new Date().toISOString(),
        firstLogin: false
      };

      await fetch('https://coherent-escargot-23835.upstash.io/', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer AV0bAAIjcDEyODVlMzY0YTk2ODk0M2JkOTRlNmVmMmUzZTQwMDNkMnAxMA',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(['SET', `user:${username}`, JSON.stringify(updatedUser)]),
      });

      // Combinar dados do usuário com dados do profissional se houver
      const finalUserData = {
        ...updatedUser,
        ...(professionalData && { professional: professionalData })
      };

      setUser(finalUserData);
      setIsAuthenticated(true);
      localStorage.setItem('salon_user', JSON.stringify(finalUserData));

      return { success: true };
    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('salon_user');
  };

  // Função para alterar senha
  const changePassword = async (currentPassword, newPassword) => {
    try {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Buscar dados atuais do usuário no Redis
      const response = await fetch('https://coherent-escargot-23835.upstash.io/', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer AV0bAAIjcDEyODVlMzY0YTk2ODk0M2JkOTRlNmVmMmUzZTQwMDNkMnAxMA',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(['GET', `user:${user.username}`]),
      });

      if (!response.ok) {
        throw new Error('Erro na conexão');
      }

      const data = await response.json();
      
      if (!data.result) {
        throw new Error('Usuário não encontrado');
      }

      const userData = JSON.parse(data.result);
      
      // Verificar senha atual
      if (userData.password !== currentPassword) {
        return { 
          success: false, 
          message: 'Senha atual incorreta' 
        };
      }

      // Atualizar com nova senha
      const updatedUser = {
        ...userData,
        password: newPassword,
        passwordChangedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Salvar no Redis
      const updateResponse = await fetch('https://coherent-escargot-23835.upstash.io/', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer AV0bAAIjcDEyODVlMzY0YTk2ODk0M2JkOTRlNmVmMmUzZTQwMDNkMnAxMA',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(['SET', `user:${user.username}`, JSON.stringify(updatedUser)]),
      });

      if (!updateResponse.ok) {
        throw new Error('Erro ao atualizar senha');
      }

      // Atualizar dados locais do usuário
      const updatedLocalUser = { ...user, ...updatedUser };
      setUser(updatedLocalUser);
      localStorage.setItem('salon_user', JSON.stringify(updatedLocalUser));

      return { 
        success: true, 
        message: 'Senha alterada com sucesso' 
      };

    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      return { 
        success: false, 
        message: error.message || 'Erro interno do servidor' 
      };
    }
  };

  // Sistema de permissões atualizado
  const hasPermission = (permission) => {
    if (!user) return false;

    // Usuário mestre (proprietário) tem todas as permissões
    if (user.role === 'proprietario' || user.role === 'super_admin') {
      return true;
    }

    // 🎯 GERENTE - Permissões administrativas amplas
    if (user.role === 'gerente') {
      const managerPermissions = [
        'view_appointments',
        'manage_appointments', 
        'view_clients',
        'manage_clients',
        'manage_quotes',
        'view_calendar',
        'view_payments',
        'manage_staff',
        'view_reports',
        'manage_categories'
      ];
      return managerPermissions.includes(permission);
    }

    // 🎯 ATENDENTE - Permissões administrativas limitadas
    if (user.role === 'atendente') {
      const attendantPermissions = [
        'view_appointments',
        'create_appointments',
        'view_clients',
        'manage_clients',
        'create_quotes',
        'view_calendar'
      ];
      return attendantPermissions.includes(permission);
    }

    // 🎯 PROFISSIONAL - Permissões para gestão própria
    if (user.role === 'profissional') {
      const professionalPermissions = [
        // Calendário e agendamentos próprios
        'view_own_appointments',
        'view_own_calendar',
        'manage_own_appointments',
        'approve_own_appointments',
        'reject_own_appointments',
        
        // Orçamentos próprios
        'create_quotes',
        'manage_own_quotes',
        'send_quotes',
        
        // Pagamentos próprios
        'view_own_payments',
        'receive_payments',
        'confirm_own_payments',
        
        // Perfil próprio
        'update_own_profile',
        'change_own_password',
        
        // Clientes (visualização limitada)
        'view_own_clients',
        
        // Dashboard básico
        'view_own_dashboard'
      ];
      return professionalPermissions.includes(permission);
    }

    return false;
  };

  // Verificar se pode ver agendamentos de um profissional específico
  const canViewProfessionalSchedule = (professionalId) => {
    if (!user) return false;

    // Usuário mestre pode ver tudo
    if (user.role === 'proprietario' || user.role === 'super_admin') {
      return true;
    }

    // Gerente pode ver de todos os profissionais
    if (user.role === 'gerente') {
      return true;
    }

    // Profissional só pode ver o próprio
    if (user.role === 'profissional') {
      return user.professionalId == professionalId || 
             (user.professional && user.professional.id == professionalId);
    }

    return false;
  };

  // Obter ID do profissional do usuário atual
  const getCurrentProfessionalId = () => {
    if (!user) return null;
    
    if (user.role === 'profissional') {
      return user.professionalId || (user.professional && user.professional.id) || null;
    }
    
    return null; // Não é um profissional
  };

  // Verificar se é usuário mestre
  const isMasterUser = () => {
    return user && (user.role === 'proprietario' || user.role === 'super_admin');
  };

  // Verificar se é profissional
  const isProfessionalUser = () => {
    return user && user.role === 'profissional';
  };

  // NOVA FUNÇÃO: Verificar se é usuário administrativo
  const isAdministrativeUser = () => {
    return user && (user.userType === 'administrative' || ['gerente', 'atendente'].includes(user.role));
  };

  // Listar todos os usuários
  const getAllUsers = async () => {
    try {
      const response = await fetch('https://coherent-escargot-23835.upstash.io/', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer AV0bAAIjcDEyODVlMzY0YTk2ODk0M2JkOTRlNmVmMmUzZTQwMDNkMnAxMA',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(['KEYS', 'user:*']),
      });

      if (!response.ok) throw new Error('Erro ao buscar usuários');

      const keysData = await response.json();
      const users = [];

      if (keysData.result && Array.isArray(keysData.result)) {
        for (const key of keysData.result) {
          try {
            const userResponse = await fetch('https://coherent-escargot-23835.upstash.io/', {
              method: 'POST',
              headers: {
                Authorization: 'Bearer AV0bAAIjcDEyODVlMzY0YTk2ODk0M2JkOTRlNmVmMmUzZTQwMDNkMnAxMA',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(['GET', key]),
            });

            if (userResponse.ok) {
              const userData = await userResponse.json();
              if (userData.result) {
                const user = JSON.parse(userData.result);
                users.push(user);
              }
            }
          } catch (error) {
            console.error(`Erro ao buscar usuário ${key}:`, error);
          }
        }
      }

      return users;
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      throw error;
    }
  };

  // Criar novo usuário (ATUALIZADA para suportar tipos de usuário)
  const createUser = async (userData) => {
    try {
      // Verificar se username já existe
      const existingResponse = await fetch('https://coherent-escargot-23835.upstash.io/', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer AV0bAAIjcDEyODVlMzY0YTk2ODk0M2JkOTRlNmVmMmUzZTQwMDNkMnAxMA',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(['GET', `user:${userData.username}`]),
      });

      if (existingResponse.ok) {
        const existingData = await existingResponse.json();
        if (existingData.result) {
          throw new Error('Nome de usuário já existe');
        }
      }

      const newUser = {
        id: Date.now(),
        name: userData.name,
        username: userData.username,
        email: userData.email,
        role: userData.role,
        password: userData.password,
        professionalId: userData.professionalId || null,
        userType: userData.userType || 'professional', // NOVO CAMPO
        active: true,
        firstLogin: true,
        createdAt: new Date().toISOString(),
        createdBy: user.username
      };

      const response = await fetch('https://coherent-escargot-23835.upstash.io/', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer AV0bAAIjcDEyODVlMzY0YTk2ODk0M2JkOTRlNmVmMmUzZTQwMDNkMnAxMA',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(['SET', `user:${userData.username}`, JSON.stringify(newUser)]),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar usuário');
      }

      return newUser;
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }
  };

  // Atualizar usuário (MANTIDA - função original)
  const updateUser = async (username, updateData) => {
    try {
      // Buscar usuário atual
      const response = await fetch('https://coherent-escargot-23835.upstash.io/', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer AV0bAAIjcDEyODVlMzY0YTk2ODk0M2JkOTRlNmVmMmUzZTQwMDNkMnAxMA',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(['GET', `user:${username}`]),
      });

      if (!response.ok) {
        throw new Error('Usuário não encontrado');
      }

      const userData = await response.json();
      if (!userData.result) {
        throw new Error('Usuário não encontrado');
      }

      const currentUser = JSON.parse(userData.result);
      const updatedUser = {
        ...currentUser,
        ...updateData,
        updatedAt: new Date().toISOString(),
        updatedBy: user.username
      };

      const updateResponse = await fetch('https://coherent-escargot-23835.upstash.io/', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer AV0bAAIjcDEyODVlMzY0YTk2ODk0M2JkOTRlNmVmMmUzZTQwMDNkMnAxMA',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(['SET', `user:${username}`, JSON.stringify(updatedUser)]),
      });

      if (!updateResponse.ok) {
        throw new Error('Erro ao atualizar usuário');
      }

      return updatedUser;
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  };

  // Desativar usuário
  const deactivateUser = async (username) => {
    return updateUser(username, { active: false });
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    changePassword,
    hasPermission,
    // Funções de verificação de tipo/role
    canViewProfessionalSchedule,
    getCurrentProfessionalId,
    isMasterUser,
    isProfessionalUser,
    isAdministrativeUser, // NOVA FUNÇÃO
    // Funções administrativas
    getAllUsers,
    createUser,
    updateUser, // ✅ MANTIDA
    deactivateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};