// src/pages/admin/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  Users, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { adminApi } from '@/utils/api';

const Dashboard = () => {
  const { user, hasPermission, isAuthenticated, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    pendingCount: 0,
    approvedCount: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalClients: 0,
    recentAppointments: [],
    pendingPayments: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Carregar estatísticas do dashboard
  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await adminApi.dashboard.getStats();
      setStats(data);
      setLastUpdated(new Date());
      
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      setError(error.message || 'Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados quando auth estiver pronto
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadStats();
      
      // Atualizar automaticamente a cada 2 minutos
      const interval = setInterval(loadStats, 120000);
      return () => clearInterval(interval);
    }
  }, [authLoading, isAuthenticated]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatLastUpdated = (date) => {
    if (!date) return '';
    return `Última atualização: ${date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })}`;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pendente':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30';
      case 'aprovado':
        return 'bg-green-500/20 text-green-300 border-green-400/30';
      case 'rejeitado':
        return 'bg-red-500/20 text-red-300 border-red-400/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
    }
  };

  // Se ainda está carregando auth
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-white">Carregando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se não está autenticado
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white">Não Autenticado</h2>
          <p className="text-gray-300">Você precisa fazer login</p>
        </div>
      </div>
    );
  }

  // Verificar permissões
  if (!hasPermission('view_dashboard')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white">Sem Permissão</h2>
          <p className="text-gray-300">Você não tem permissão para visualizar o dashboard</p>
        </div>
      </div>
    );
  }

  // Dashboard principal
  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-white">Olá, {user?.name || 'Admin'}! Aqui está um resumo do seu negócio.</p>
          {lastUpdated && (
            <p className="text-xs text-gray-400 mt-1">{formatLastUpdated(lastUpdated)}</p>
          )}
          {error && (
            <p className="text-xs text-red-400 mt-1 flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" />
              {error}
            </p>
          )}
        </div>
        <Button 
          onClick={loadStats}
          disabled={loading}
          className="bg-pink-600 hover:bg-pink-700 text-white"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Atualizar Dados
        </Button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Agendamentos Pendentes */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Pendentes</h3>
              <p className="text-3xl font-bold">{stats.pendingCount}</p>
              <Link 
                to="/admin/pending"
                className="text-sm underline hover:no-underline mt-2 inline-block"
              >
                Ver todos
              </Link>
            </div>
            <AlertCircle className="w-12 h-12 opacity-80" />
          </div>
        </motion.div>

        {/* Agendamentos Aprovados */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Aprovados</h3>
              <p className="text-3xl font-bold">{stats.approvedCount}</p>
              <Link 
                to="/admin/approved"
                className="text-sm underline hover:no-underline mt-2 inline-block"
              >
                Ver agenda
              </Link>
            </div>
            <CheckCircle className="w-12 h-12 opacity-80" />
          </div>
        </motion.div>

        {/* Receita Total */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Receita Total</h3>
              <p className="text-3xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
              <Link 
                to="/admin/payments"
                className="text-sm underline hover:no-underline mt-2 inline-block"
              >
                Ver pagamentos
              </Link>
            </div>
            <DollarSign className="w-12 h-12 opacity-80" />
          </div>
        </motion.div>

        {/* Clientes Ativos */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Clientes</h3>
              <p className="text-3xl font-bold">{stats.totalClients}</p>
              <p className="text-sm opacity-80 mt-2">Clientes únicos</p>
            </div>
            <Users className="w-12 h-12 opacity-80" />
          </div>
        </motion.div>
      </div>

      {/* Receita Mensal e Pagamentos Pendentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div 
          whileHover={{ scale: 1.01 }}
          className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/20"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Receita do Último Mês</h3>
            <TrendingUp className="w-6 h-6 text-green-400" />
          </div>
          <p className="text-3xl font-bold text-green-400">{formatCurrency(stats.monthlyRevenue)}</p>
          <p className="text-sm text-gray-300 mt-2">
            Baseado nos pagamentos confirmados dos últimos 30 dias
          </p>
          {stats.monthlyGrowth && (
            <div className="flex items-center mt-2">
              <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
              <span className="text-sm text-green-400">
                {stats.monthlyGrowth > 0 ? '+' : ''}{stats.monthlyGrowth}% em relação ao mês anterior
              </span>
            </div>
          )}
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.01 }}
          className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/20"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Pagamentos Pendentes</h3>
            <Clock className="w-6 h-6 text-orange-400" />
          </div>
          <p className="text-3xl font-bold text-orange-400">{stats.pendingPayments}</p>
          <Link 
            to="/admin/payments"
            className="text-sm text-pink-400 hover:text-pink-300 underline mt-2 inline-block"
          >
            Gerenciar pagamentos
          </Link>
        </motion.div>
      </div>

      {/* Agendamentos Recentes */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 mb-6"
      >
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Agendamentos Recentes</h3>
            <Link 
              to="/admin/pending"
              className="text-sm text-pink-400 hover:text-pink-300 underline"
            >
              Ver todos
            </Link>
          </div>
        </div>
        <div className="divide-y divide-white/10">
          {stats.recentAppointments && stats.recentAppointments.length > 0 ? (
            stats.recentAppointments.map((appointment, index) => (
              <motion.div 
                key={appointment.id || index} 
                className="p-4 hover:bg-white/5 transition-colors cursor-pointer"
                whileHover={{ x: 4 }}
                onClick={() => {
                  // Navegar para detalhes do agendamento se disponível
                  if (appointment.id) {
                    // navigate(`/admin/appointments/${appointment.id}`);
                  }
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <Clock className="w-4 h-4 text-yellow-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {appointment.cliente?.nome || appointment.clientName || 'Cliente não informado'}
                        </p>
                        <p className="text-sm text-gray-300">
                          {appointment.servico || appointment.service || 'Serviço não especificado'}
                          {appointment.cliente?.telefone || appointment.clientPhone ? 
                            ` • ${appointment.cliente?.telefone || appointment.clientPhone}` : ''
                          }
                        </p>
                        {appointment.scheduledDate && (
                          <p className="text-xs text-gray-400">
                            Agendado para: {formatDate(appointment.scheduledDate)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                      {appointment.status || 'Pendente'}
                    </span>
                    <span className="text-sm text-gray-400">
                      {formatDate(appointment.createdAt)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="p-8 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-300">Nenhum agendamento recente</p>
              <p className="text-xs text-gray-500 mt-2">
                {error ? 'Erro ao carregar dados' : 'Novos agendamentos aparecerão aqui'}
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Links Rápidos */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/20"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/admin/pending"
            className="flex items-center p-3 rounded-xl border border-white/20 hover:border-pink-400/50 hover:bg-pink-500/10 transition-all duration-200 group"
          >
            <AlertCircle className="w-5 h-5 text-orange-400 mr-3 group-hover:text-orange-300" />
            <span className="text-sm font-medium text-white">Aprovar Agendamentos</span>
            {stats.pendingCount > 0 && (
              <span className="ml-auto bg-orange-500 text-white text-xs rounded-full px-2 py-1">
                {stats.pendingCount}
              </span>
            )}
          </Link>
          
          <Link
            to="/admin/quotes"
            className="flex items-center p-3 rounded-xl border border-white/20 hover:border-pink-400/50 hover:bg-pink-500/10 transition-all duration-200 group"
          >
            <DollarSign className="w-5 h-5 text-green-400 mr-3 group-hover:text-green-300" />
            <span className="text-sm font-medium text-white">Criar Orçamento</span>
          </Link>
          
          <Link
            to="/admin/payments"
            className="flex items-center p-3 rounded-xl border border-white/20 hover:border-pink-400/50 hover:bg-pink-500/10 transition-all duration-200 group"
          >
            <Eye className="w-5 h-5 text-blue-400 mr-3 group-hover:text-blue-300" />
            <span className="text-sm font-medium text-white">Ver Pagamentos</span>
            {stats.pendingPayments > 0 && (
              <span className="ml-auto bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                {stats.pendingPayments}
              </span>
            )}
          </Link>
          
          <Link
            to="/admin/staff"
            className="flex items-center p-3 rounded-xl border border-white/20 hover:border-pink-400/50 hover:bg-pink-500/10 transition-all duration-200 group"
          >
            <Users className="w-5 h-5 text-purple-400 mr-3 group-hover:text-purple-300" />
            <span className="text-sm font-medium text-white">Gerenciar Equipe</span>
          </Link>
        </div>
      </motion.div>

      {/* Loading overlay */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <div className="bg-gray-900/90 backdrop-blur-xl rounded-2xl p-6 flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
            <p className="text-white">Atualizando dados...</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;