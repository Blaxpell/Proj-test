// src/pages/admin/PendingAppointments.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  DollarSign, 
  Clock, 
  User, 
  Phone, 
  Calendar,
  RefreshCw,
  Filter,
  Send,
  Eye,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

const PendingAppointments = () => {
  const { 
    user, 
    hasPermission, 
    isProfessionalUser, 
    getCurrentProfessionalId,
    isMasterUser 
  } = useAuth();
  
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [filterStatus, setFilterStatus] = useState('pendente');
  const navigate = useNavigate();

  // Carregar agendamentos
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Buscar todos os agendamentos do Redis
      const response = await fetch('https://coherent-escargot-23835.upstash.io/', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer AV0bAAIjcDEyODVlMzY0YTk2ODk0M2JkOTRlNmVmMmUzZTQwMDNkMnAxMA',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(['KEYS', 'agendamento:*']),
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar agendamentos');
      }

      const keysData = await response.json();
      const allAppointments = [];

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
                const appointment = JSON.parse(getData.result);
                allAppointments.push(appointment);
              }
            }
          } catch (error) {
            console.error(`Erro ao buscar ${key}:`, error);
          }
        }
      }

      // Filtrar baseado no tipo de usuário
      let filteredAppointments = allAppointments;

      if (isProfessionalUser()) {
        const professionalId = getCurrentProfessionalId();
        filteredAppointments = allAppointments.filter(apt => 
          apt.professionalId == professionalId || apt.professionalId === professionalId
        );
      }

      // Filtrar por status
      if (filterStatus !== 'todos') {
        filteredAppointments = filteredAppointments.filter(apt => 
          apt.status === filterStatus
        );
      }

      // Ordenar por data de criação (mais recentes primeiro)
      filteredAppointments.sort((a, b) => 
        new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );

      setAppointments(filteredAppointments);
      
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      setError('Não foi possível carregar os agendamentos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasPermission('view_own_appointments') || hasPermission('manage_appointments')) {
      fetchAppointments();
    }
  }, [filterStatus]);

  // Aprovar agendamento
  const handleApprove = async (appointmentId) => {
    try {
      setActionLoading(prev => ({ ...prev, [appointmentId]: 'approve' }));
      
      // Buscar o agendamento atual
      const response = await fetch('https://coherent-escargot-23835.upstash.io/', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer AV0bAAIjcDEyODVlMzY0YTk2ODk0M2JkOTRlNmVmMmUzZTQwMDNkMnAxMA',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(['GET', `agendamento:${appointmentId}`]),
      });

      if (!response.ok) {
        throw new Error('Agendamento não encontrado');
      }

      const data = await response.json();
      if (!data.result) {
        throw new Error('Agendamento não encontrado');
      }

      const appointment = JSON.parse(data.result);
      
      // Atualizar status para aprovado
      const updatedAppointment = {
        ...appointment,
        status: 'aprovado',
        approvedAt: new Date().toISOString(),
        approvedBy: user.username
      };

      // Salvar no Redis
      const updateResponse = await fetch('https://coherent-escargot-23835.upstash.io/', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer AV0bAAIjcDEyODVlMzY0YTk2ODk0M2JkOTRlNmVmMmUzZTQwMDNkMnAxMA',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(['SET', `agendamento:${appointmentId}`, JSON.stringify(updatedAppointment)]),
      });

      if (!updateResponse.ok) {
        throw new Error('Erro ao aprovar agendamento');
      }

      toast({
        title: "Agendamento aprovado!",
        description: `O agendamento de ${appointment.clientName} foi aprovado com sucesso.`,
      });

      // Recarregar lista
      fetchAppointments();
      
    } catch (error) {
      console.error('Erro ao aprovar agendamento:', error);
      toast({
        title: "Erro ao aprovar",
        description: error.message || "Não foi possível aprovar o agendamento.",
        variant: "destructive"
      });
    } finally {
      setActionLoading(prev => ({ ...prev, [appointmentId]: null }));
    }
  };

  // Rejeitar agendamento
  const handleReject = async (appointmentId, reason = '') => {
    try {
      const rejectionReason = reason || prompt('Motivo da rejeição (opcional):');
      
      setActionLoading(prev => ({ ...prev, [appointmentId]: 'reject' }));
      
      // Buscar o agendamento atual
      const response = await fetch('https://coherent-escargot-23835.upstash.io/', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer AV0bAAIjcDEyODVlMzY0YTk2ODk0M2JkOTRlNmVmMmUzZTQwMDNkMnAxMA',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(['GET', `agendamento:${appointmentId}`]),
      });

      if (!response.ok) {
        throw new Error('Agendamento não encontrado');
      }

      const data = await response.json();
      if (!data.result) {
        throw new Error('Agendamento não encontrado');
      }

      const appointment = JSON.parse(data.result);
      
      // Atualizar status para rejeitado
      const updatedAppointment = {
        ...appointment,
        status: 'rejeitado',
        rejectedAt: new Date().toISOString(),
        rejectedBy: user.username,
        rejectionReason: rejectionReason || 'Não especificado'
      };

      // Salvar no Redis
      const updateResponse = await fetch('https://coherent-escargot-23835.upstash.io/', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer AV0bAAIjcDEyODVlMzY0YTk2ODk0M2JkOTRlNmVmMmUzZTQwMDNkMnAxMA',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(['SET', `agendamento:${appointmentId}`, JSON.stringify(updatedAppointment)]),
      });

      if (!updateResponse.ok) {
        throw new Error('Erro ao rejeitar agendamento');
      }

      toast({
        title: "Agendamento rejeitado",
        description: `O agendamento de ${appointment.clientName} foi rejeitado.`,
      });

      // Recarregar lista
      fetchAppointments();
      
    } catch (error) {
      console.error('Erro ao rejeitar agendamento:', error);
      toast({
        title: "Erro ao rejeitar",
        description: error.message || "Não foi possível rejeitar o agendamento.",
        variant: "destructive"
      });
    } finally {
      setActionLoading(prev => ({ ...prev, [appointmentId]: null }));
    }
  };

  // Criar orçamento
  const handleCreateQuote = (appointment) => {
    // Redirecionar para a página de orçamentos com os dados do agendamento
    navigate('/admin/quotes', { 
      state: { 
        appointmentData: appointment 
      }
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pendente':
        return <Clock className="w-4 h-4" />;
      case 'aprovado':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejeitado':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  // Verificar permissões
  if (!hasPermission('view_own_appointments') && !hasPermission('manage_appointments')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white">Sem Permissão</h2>
          <p className="text-gray-300">Você não tem permissão para visualizar agendamentos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center">
            <AlertCircle className="w-8 h-8 mr-3 text-orange-400" />
            {isProfessionalUser() ? 'Meus Agendamentos' : 'Gerenciar Agendamentos'}
          </h1>
          <p className="text-gray-300">
            {isProfessionalUser() 
              ? 'Gerencie suas solicitações de agendamento'
              : 'Aprove ou rejeite solicitações de agendamento'
            }
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Filtro de Status */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="pendente" className="bg-gray-800">Pendentes</option>
              <option value="aprovado" className="bg-gray-800">Aprovados</option>
              <option value="rejeitado" className="bg-gray-800">Rejeitados</option>
              <option value="todos" className="bg-gray-800">Todos</option>
            </select>
          </div>
          
          <Button 
            onClick={fetchAppointments}
            disabled={loading}
            className="bg-pink-600 hover:bg-pink-700 text-white"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Atualizar
          </Button>
        </div>
      </div>
      
      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Pendentes</p>
              <p className="text-2xl font-bold text-orange-400">
                {appointments.filter(apt => apt.status === 'pendente').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-orange-400" />
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Aprovados</p>
              <p className="text-2xl font-bold text-green-400">
                {appointments.filter(apt => apt.status === 'aprovado').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Rejeitados</p>
              <p className="text-2xl font-bold text-red-400">
                {appointments.filter(apt => apt.status === 'rejeitado').length}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
        </div>
      </div>

      {/* Lista de Agendamentos */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
            <p className="text-white">Carregando agendamentos...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-500/20 border border-red-400/30 text-red-300 px-4 py-3 rounded-xl">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-3" />
            <div>
              <p className="font-medium">{error}</p>
              <button 
                onClick={fetchAppointments}
                className="mt-2 text-sm text-red-200 hover:text-red-100 underline"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-8 text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            {filterStatus === 'pendente' ? 'Nenhum agendamento pendente' : `Nenhum agendamento ${filterStatus}`}
          </h3>
          <p className="text-gray-300">
            {filterStatus === 'pendente' 
              ? 'Novos agendamentos aparecerão aqui quando clientes fizerem solicitações.'
              : `Não há agendamentos com status "${filterStatus}" no momento.`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <motion.div
              key={appointment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden hover:border-white/30 transition-all duration-200"
            >
              <div className="p-6">
                {/* Header do Card */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {appointment.clientName || 'Cliente não informado'}
                      </h3>
                      <p className="text-gray-300 text-sm">
                        {appointment.service || 'Serviço não especificado'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(appointment.status)}`}>
                      {getStatusIcon(appointment.status)}
                      <span className="ml-2">{appointment.status || 'Pendente'}</span>
                    </span>
                  </div>
                </div>

                {/* Detalhes */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    <div>
                      <p className="text-xs text-gray-400">Data</p>
                      <p className="text-white font-medium">{formatDate(appointment.date)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-green-400" />
                    <div>
                      <p className="text-xs text-gray-400">Horário</p>
                      <p className="text-white font-medium">{appointment.time || 'Não especificado'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-purple-400" />
                    <div>
                      <p className="text-xs text-gray-400">Contato</p>
                      <p className="text-white font-medium">{appointment.clientPhone || 'Não informado'}</p>
                    </div>
                  </div>
                  
                  {appointment.servicePrice && (
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-yellow-400" />
                      <div>
                        <p className="text-xs text-gray-400">Valor</p>
                        <p className="text-white font-medium">R$ {appointment.servicePrice}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Profissional (apenas para admin) */}
                {!isProfessionalUser() && appointment.professionalName && (
                  <div className="mb-4 p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-pink-400" />
                      <span className="text-sm text-gray-300">Profissional:</span>
                      <span className="text-white font-medium">{appointment.professionalName}</span>
                    </div>
                  </div>
                )}

                {/* Observações */}
                {appointment.notes && (
                  <div className="mb-4 p-3 bg-white/5 rounded-lg">
                    <p className="text-xs text-gray-400 mb-1">Observações:</p>
                    <p className="text-white text-sm">{appointment.notes}</p>
                  </div>
                )}

                {/* Motivo da rejeição */}
                {appointment.status === 'rejeitado' && appointment.rejectionReason && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-xs text-red-300 mb-1">Motivo da rejeição:</p>
                    <p className="text-red-200 text-sm">{appointment.rejectionReason}</p>
                  </div>
                )}

                {/* Ações */}
                {appointment.status === 'pendente' && (hasPermission('manage_own_appointments') || hasPermission('approve_own_appointments')) && (
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-white/10">
                    <Button
                      onClick={() => handleApprove(appointment.id)}
                      disabled={actionLoading[appointment.id]}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {actionLoading[appointment.id] === 'approve' ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      )}
                      Aprovar
                    </Button>
                    
                    <Button
                      onClick={() => handleReject(appointment.id)}
                      disabled={actionLoading[appointment.id]}
                      variant="outline"
                      className="border-red-500/50 text-red-300 hover:bg-red-500/10"
                    >
                      {actionLoading[appointment.id] === 'reject' ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4 mr-2" />
                      )}
                      Rejeitar
                    </Button>
                    
                    {hasPermission('create_quotes') && (
                      <Button
                        onClick={() => handleCreateQuote(appointment)}
                        disabled={actionLoading[appointment.id]}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        <DollarSign className="w-4 h-4 mr-2" />
                        Criar Orçamento
                      </Button>
                    )}
                  </div>
                )}

                {/* Info de quando foi processado */}
                <div className="mt-4 pt-3 border-t border-white/10 text-xs text-gray-400">
                  <p>Criado em: {formatDateTime(appointment.createdAt)}</p>
                  {appointment.approvedAt && (
                    <p>Aprovado em: {formatDateTime(appointment.approvedAt)} por {appointment.approvedBy}</p>
                  )}
                  {appointment.rejectedAt && (
                    <p>Rejeitado em: {formatDateTime(appointment.rejectedAt)} por {appointment.rejectedBy}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingAppointments;