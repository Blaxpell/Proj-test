// src/pages/admin/PendingAppointments.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const PendingAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { hasPermission } = useAuth();
  
  useEffect(() => {
    fetchPendingAppointments();
  }, []);
  
  const fetchPendingAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/appointments/pending');
      
      if (!response.ok) {
        throw new Error('Falha ao buscar agendamentos pendentes');
      }
      
      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      console.error('Erro ao buscar agendamentos pendentes:', error);
      setError('Não foi possível carregar os agendamentos pendentes. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleApprove = async (id) => {
    try {
      const response = await fetch(`/api/appointments/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Falha ao aprovar agendamento');
      }
      
      // Atualizar a lista após aprovação
      fetchPendingAppointments();
    } catch (error) {
      console.error('Erro ao aprovar agendamento:', error);
      alert('Erro ao aprovar agendamento. Tente novamente.');
    }
  };
  
  const handleReject = async (id, reason = '') => {
    // Pedir motivo da rejeição
    const rejectionReason = reason || prompt('Motivo da rejeição (opcional):');
    
    try {
      const response = await fetch(`/api/appointments/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectionReason }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Falha ao rejeitar agendamento');
      }
      
      // Atualizar a lista após rejeição
      fetchPendingAppointments();
    } catch (error) {
      console.error('Erro ao rejeitar agendamento:', error);
      alert('Erro ao rejeitar agendamento. Tente novamente.');
    }
  };
  
  const handleCreateQuote = (appointment) => {
    // Redirecionar para a página de criação de orçamento com os dados do agendamento
    // Poderia ser feito com React Router ou com estado global
    window.location.href = `/admin/quotes/create?appointmentId=${appointment.id}`;
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
        <button 
          onClick={fetchPendingAppointments}
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
        >
          Tentar novamente
        </button>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Agendamentos Pendentes</h2>
        <button 
          onClick={fetchPendingAppointments}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
        >
          Atualizar
        </button>
      </div>
      
      {appointments.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600">Não há agendamentos pendentes no momento.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Horário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Serviço
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {appointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {appointment.clientName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(appointment.date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {appointment.time}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {appointment.service}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {appointment.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <button
                      onClick={() => handleApprove(appointment.id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm"
                    >
                      Aprovar
                    </button>
                    <button
                      onClick={() => handleReject(appointment.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm"
                    >
                      Rejeitar
                    </button>
                    {hasPermission('create_quotes') && (
                      <button
                        onClick={() => handleCreateQuote(appointment)}
                        className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded-md text-sm"
                      >
                        Criar Orçamento
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PendingAppointments;