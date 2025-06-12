// src/pages/admin/Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scissors, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isFirstAccess, setIsFirstAccess] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { login, changePassword, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, navigate]);
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const result = await login(username, password);
      if (result.success) {
        navigate('/admin/dashboard');
      } else {
        setError(result.message || 'Credenciais inválidas');
      }
    } catch (err) {
      console.error('Erro no login:', err);
      setError('Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSetNewPassword = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres');
      setLoading(false);
      return;
    }
    
    try {
      // Primeiro fazer login com as credenciais atuais
      const loginResult = await login(username, password);
      
      if (!loginResult.success) {
        setError('Credenciais atuais inválidas');
        setLoading(false);
        return;
      }

      // Depois alterar a senha
      const changeResult = await changePassword(password, newPassword);
      
      if (changeResult.success) {
        // Fazer login novamente com a nova senha
        const newLoginResult = await login(username, newPassword);
        if (newLoginResult.success) {
          navigate('/admin/dashboard');
        }
      } else {
        setError(changeResult.error || 'Erro ao definir nova senha');
      }
    } catch (err) {
      console.error('Erro ao processar primeiro acesso:', err);
      setError('Erro ao processar solicitação');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 flex items-center justify-center p-4">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-20 h-20 bg-white bg-opacity-10 rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-white bg-opacity-10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white bg-opacity-10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-32 right-1/3 w-24 h-24 bg-white bg-opacity-10 rounded-full animate-pulse"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Main container */}
        <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white border-opacity-20">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="mr-3 animate-spin" style={{ animationDuration: '20s' }}>
                <Scissors className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">
                Painel Administrativo
              </h1>
            </div>
            <h2 className="text-lg text-white text-opacity-90 font-medium">
              Fabiane Vieira Makeup Hair
            </h2>
          </div>

          {!isFirstAccess ? (
            <div>
              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-white text-sm font-medium mb-2" htmlFor="username">
                    <User className="w-4 h-4 inline mr-2" />
                    Usuário
                  </label>
                  <input
                    id="username"
                    type="text"
                    className="w-full px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 focus:border-transparent transition-all"
                    placeholder="Digite seu usuário"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-white text-sm font-medium mb-2" htmlFor="password">
                    <Lock className="w-4 h-4 inline mr-2" />
                    Senha
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      className="w-full px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 focus:border-transparent transition-all pr-12"
                      placeholder="Digite sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white text-opacity-70 hover:text-opacity-100"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                
                {error && (
                  <div className="bg-red-500 bg-opacity-20 border border-red-400 border-opacity-50 text-white p-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 border border-white border-opacity-30 hover:border-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Entrando...
                    </div>
                  ) : (
                    'Entrar no Painel'
                  )}
                </button>
                
                <div className="text-center">
                  <button
                    type="button"
                    className="text-white text-opacity-80 hover:text-opacity-100 text-sm underline transition-all"
                    onClick={() => {
                      setIsFirstAccess(true);
                      setError('');
                    }}
                  >
                    Primeiro acesso? Clique aqui
                  </button>
                </div>
                
                {/* Default credentials */}
                <div className="bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg p-4 text-center">
                  <p className="text-white text-opacity-80 text-sm mb-2 font-medium">
                    Credenciais Padrão:
                  </p>
                  <p className="text-white text-sm">
                    <strong>Usuário:</strong> admin<br />
                    <strong>Senha:</strong> fabiane2025temp
                  </p>
                  <p className="text-white text-opacity-70 text-xs mt-2">
                    Recomendamos alterar a senha no primeiro acesso
                  </p>
                </div>
              </form>
            </div>
          ) : (
            <div>
              {/* First Access Form */}
              <div className="mb-6 text-center">
                <h3 className="text-xl font-semibold text-white mb-2">
                  Primeiro Acesso
                </h3>
                <p className="text-white text-opacity-80">
                  Defina sua nova senha de acesso
                </p>
              </div>
              
              <form onSubmit={handleSetNewPassword} className="space-y-6">
                <div>
                  <label className="block text-white text-sm font-medium mb-2" htmlFor="username-first">
                    <User className="w-4 h-4 inline mr-2" />
                    Usuário
                  </label>
                  <input
                    id="username-first"
                    type="text"
                    className="w-full px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 focus:border-transparent transition-all"
                    placeholder="Digite seu usuário"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-white text-sm font-medium mb-2" htmlFor="current-password">
                    <Lock className="w-4 h-4 inline mr-2" />
                    Senha Atual
                  </label>
                  <input
                    id="current-password"
                    type="password"
                    className="w-full px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 focus:border-transparent transition-all"
                    placeholder="Digite a senha temporária"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-white text-sm font-medium mb-2" htmlFor="new-password">
                    <Lock className="w-4 h-4 inline mr-2" />
                    Nova Senha
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    className="w-full px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 focus:border-transparent transition-all"
                    placeholder="Digite sua nova senha (mín. 6 caracteres)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength="6"
                  />
                </div>
                
                <div>
                  <label className="block text-white text-sm font-medium mb-2" htmlFor="confirm-password">
                    <Lock className="w-4 h-4 inline mr-2" />
                    Confirmar Nova Senha
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    className="w-full px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 focus:border-transparent transition-all"
                    placeholder="Confirme sua nova senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength="6"
                  />
                </div>
                
                {error && (
                  <div className="bg-red-500 bg-opacity-20 border border-red-400 border-opacity-50 text-white p-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Definindo senha...
                    </div>
                  ) : (
                    'Definir Nova Senha'
                  )}
                </button>
                
                <div className="text-center">
                  <button
                    type="button"
                    className="text-white text-opacity-80 hover:text-opacity-100 text-sm underline transition-all"
                    onClick={() => {
                      setIsFirstAccess(false);
                      setError('');
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                  >
                    Voltar ao login
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-white text-opacity-60 text-sm">
            © 2025 Fabiane Vieira Makeup Hair - Sistema de Agendamento
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;