// src/pages/admin/ChangePassword.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle,
  Key,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

const ChangePassword = () => {
  const { user, changePassword } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Validação de senha forte
  const validatePassword = (password) => {
    const validations = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    const score = Object.values(validations).filter(Boolean).length;
    
    return {
      ...validations,
      score,
      isStrong: score >= 4,
      message: score < 3 ? 'Senha fraca' : score < 4 ? 'Senha média' : 'Senha forte'
    };
  };

  // Calcular força da senha
  const passwordStrength = validatePassword(formData.newPassword);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpar erro específico quando usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Validar senha atual
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Senha atual é obrigatória';
    }

    // Validar nova senha
    if (!formData.newPassword) {
      newErrors.newPassword = 'Nova senha é obrigatória';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Nova senha deve ter pelo menos 8 caracteres';
    } else if (!passwordStrength.isStrong) {
      newErrors.newPassword = 'Nova senha deve ser mais forte (use maiúsculas, números e símbolos)';
    }

    // Validar confirmação
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }

    // Verificar se nova senha é diferente da atual
    if (formData.currentPassword && formData.newPassword && 
        formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'Nova senha deve ser diferente da atual';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const result = await changePassword(
        formData.currentPassword,
        formData.newPassword
      );

      if (result.success) {
        toast({
          title: "Senha alterada com sucesso!",
          description: "Sua senha foi atualizada. Use a nova senha nos próximos logins.",
          variant: "default"
        });

        // Limpar formulário
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        toast({
          title: "Erro ao alterar senha",
          description: result.message || "Verifique sua senha atual e tente novamente.",
          variant: "destructive"
        });

        if (result.message?.includes('atual')) {
          setErrors({ currentPassword: 'Senha atual incorreta' });
        }
      }
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      toast({
        title: "Erro interno",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = (score) => {
    if (score < 3) return 'bg-red-500';
    if (score < 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthWidth = (score) => {
    return `${(score / 5) * 100}%`;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Alterar Senha</h1>
              <p className="text-gray-600">Mantenha sua conta segura com uma senha forte</p>
            </div>
          </div>

          {/* Info do usuário */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{user?.name}</p>
                <p className="text-sm text-gray-600">{user?.email}</p>
                <p className="text-xs text-gray-500">Perfil: {user?.role}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Formulário */}
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Senha Atual */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha Atual *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.currentPassword ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Digite sua senha atual"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => togglePasswordVisibility('current')}
                >
                  {showPasswords.current ? (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.currentPassword}
                </p>
              )}
            </div>

            {/* Nova Senha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nova Senha *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <Key className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.newPassword ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Digite sua nova senha"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => togglePasswordVisibility('new')}
                >
                  {showPasswords.new ? (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>

              {/* Indicador de força da senha */}
              {formData.newPassword && (
                <div className="mt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Força da senha:</span>
                    <span className={`text-sm font-medium ${
                      passwordStrength.score < 3 ? 'text-red-600' :
                      passwordStrength.score < 4 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {passwordStrength.message}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(passwordStrength.score)}`}
                      style={{ width: getStrengthWidth(passwordStrength.score) }}
                    ></div>
                  </div>
                  
                  {/* Critérios */}
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                    <div className={`flex items-center ${passwordStrength.length ? 'text-green-600' : 'text-gray-400'}`}>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      8+ caracteres
                    </div>
                    <div className={`flex items-center ${passwordStrength.uppercase ? 'text-green-600' : 'text-gray-400'}`}>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Maiúscula
                    </div>
                    <div className={`flex items-center ${passwordStrength.lowercase ? 'text-green-600' : 'text-gray-400'}`}>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Minúscula
                    </div>
                    <div className={`flex items-center ${passwordStrength.number ? 'text-green-600' : 'text-gray-400'}`}>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Número
                    </div>
                    <div className={`flex items-center ${passwordStrength.special ? 'text-green-600' : 'text-gray-400'}`}>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Símbolo
                    </div>
                  </div>
                </div>
              )}

              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.newPassword}
                </p>
              )}
            </div>

            {/* Confirmar Nova Senha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Nova Senha *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <CheckCircle className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Confirme sua nova senha"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => togglePasswordVisibility('confirm')}
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Botões */}
            <div className="flex space-x-4 pt-4">
              <Button
                type="submit"
                disabled={loading || !passwordStrength.isStrong}
                className="flex-1"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Alterando...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Shield className="w-4 h-4 mr-2" />
                    Alterar Senha
                  </div>
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFormData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                  });
                  setErrors({});
                }}
                disabled={loading}
              >
                Limpar
              </Button>
            </div>
          </form>
        </div>

        {/* Dicas de Segurança */}
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Dicas de Segurança
          </h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• Use uma senha única que você não usa em outros lugares</li>
            <li>• Combine letras maiúsculas, minúsculas, números e símbolos</li>
            <li>• Evite informações pessoais como nome, data de nascimento</li>
            <li>• Troque sua senha regularmente (a cada 3-6 meses)</li>
            <li>• Nunca compartilhe sua senha com outras pessoas</li>
            <li>• Sempre faça logout ao sair do sistema</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
};

export default ChangePassword;