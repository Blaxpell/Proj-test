// src/pages/admin/ApprovedAppointments.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const ApprovedAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'today', 'week', 'month'
  const [searchTerm, setSearchTerm] = useState('');
  const { hasPermission } = useAuth();
  
  useEffect(() => {
    fetchApprovedAppointments();
  }, [filter]);
  
  const fetchApprovedAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      if (filter !== 'all') {
        queryParams.append('timeframe', filter);
      }
      
      const response = await fetch(`/api/appointments/approved?${queryParams}`);
      
      if (!response.ok) {
        throw new Error('Falha ao buscar agendamentos aprovados');
      }
      
      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      console.error('Erro ao buscar agendamentos aprovados:', error);
      setError('Não foi possível carregar os agendamentos aprovados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancel = async (id) => {
    const confirmCancel = window.confirm('Tem certeza que deseja cancelar este agendamento?');
    if (!confirmCancel) return;
    
    const reason = prompt('Motivo do cancelamento:');
    
    try {
      const response = await fetch(`/api/appointments/${id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Falha ao cancelar agendamento');
      }
      
      // Atualizar a lista após cancelamento
      fetchApprovedAppointments();
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error);
      alert('Erro ao cancelar agendamento. Tente novamente.');
    }
  };
  
  const handleComplete = async (id) => {
    try {
      const response = await fetch(`/api/appointments/${id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Falha ao marcar agendamento como concluído');
      }
      
      // Atualizar a lista após conclusão
      fetchApprovedAppointments();
    } catch (error) {
      console.error('Erro ao marcar agendamento como concluído:', error);
      alert('Erro ao marcar agendamento como concluído. Tente novamente.');
    }
  };
  
  const handleCreatePayment = (appointment) => {
    // Redirecionar para a página de criação de pagamento
    window.location.href = `/admin/payments/create?appointmentId=${appointment.id}`;
  };
  
  // Filtrar agendamentos com base na busca
  const filteredAppointments = appointments.filter(appointment => {
    return (
      appointment.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.phone.includes(searchTerm)
    );
  });
  
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
          onClick={fetchApprovedAppointments}
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
        <h2 className="text-2xl font-bold">Agendamentos Aprovados</h2>
        <button 
          onClick={fetchApprovedAppointments}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
        >
          Atualizar
        </button>
      </div>
      
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        {/* Filtros */}
        <div className="flex-1">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md text-sm ${
                filter === 'all' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilter('today')}
              className={`px-4 py-2 rounded-md text-sm ${
                filter === 'today' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              Hoje
            </button>
            <button
              onClick={() => setFilter('week')}
              className={`px-4 py-2 rounded-md text-sm ${
                filter === 'week' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              Esta Semana
            </button>
            <button
              onClick={() => setFilter('month')}
              className={`px-4 py-2 rounded-md text-sm ${
                filter === 'month' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              Este Mês
            </button>
          </div>
        </div>
        
        {/* Busca */}
        <div className="w-full md:w-64">
          <input
            type="text"
            placeholder="Buscar cliente, serviço..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>
      
      {filteredAppointments.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600">
            {searchTerm 
              ? 'Nenhum agendamento encontrado para esta busca.' 
              : 'Não há agendamentos aprovados no momento.'}
          </p>
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
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAppointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900">{appointment.clientName}</div>
                      <div className="text-sm text-gray-500">{appointment.phone}</div>
                    </div>
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
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      appointment.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {appointment.status === 'completed' ? 'Concluído' : 'Agendado'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    {appointment.status !== 'completed' && (
                      <>
                        <button
                          onClick={() => handleComplete(appointment.id)}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm"
                        >
                          Concluir
                        </button>
                        <button
                          onClick={() => handleCancel(appointment.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm"
                        >
                          Cancelar
                        </button>
                      </>
                    )}
                    
                    {hasPermission('create_payments') && (
                      <button
                        onClick={() => handleCreatePayment(appointment)}
                        className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded-md text-sm"
                      >
                        Registrar Pagamento
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

export default ApprovedAppointments;