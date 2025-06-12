// src/pages/admin/QuotesManagement.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const QuotesManagement = () => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'approved', 'rejected'
  const [searchTerm, setSearchTerm] = useState('');
  const { hasPermission } = useAuth();
  
  useEffect(() => {
    fetchQuotes();
  }, [filter]);
  
  const fetchQuotes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      if (filter !== 'all') {
        queryParams.append('status', filter);
      }
      
      const response = await fetch(`/api/quotes?${queryParams}`);
      
      if (!response.ok) {
        throw new Error('Falha ao buscar orçamentos');
      }
      
      const data = await response.json();
      setQuotes(data);
    } catch (error) {
      console.error('Erro ao buscar orçamentos:', error);
      setError('Não foi possível carregar os orçamentos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleApprove = async (id) => {
    try {
      const response = await fetch(`/api/quotes/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Falha ao aprovar orçamento');
      }
      
      // Atualizar a lista após aprovação
      fetchQuotes();
    } catch (error) {
      console.error('Erro ao aprovar orçamento:', error);
      alert('Erro ao aprovar orçamento. Tente novamente.');
    }
  };
  
  const handleReject = async (id) => {
    const reason = prompt('Motivo da rejeição (opcional):');
    
    try {
      const response = await fetch(`/api/quotes/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Falha ao rejeitar orçamento');
      }
      
      // Atualizar a lista após rejeição
      fetchQuotes();
    } catch (error) {
      console.error('Erro ao rejeitar orçamento:', error);
      alert('Erro ao rejeitar orçamento. Tente novamente.');
    }
  };
  
  const handleEdit = (id) => {
    // Redirecionar para a página de edição de orçamento
    window.location.href = `/admin/quotes/edit/${id}`;
  };
  
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Tem certeza que deseja excluir este orçamento?');
    if (!confirmDelete) return;
    
    try {
      const response = await fetch(`/api/quotes/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Falha ao excluir orçamento');
      }
      
      // Atualizar a lista após exclusão
      fetchQuotes();
    } catch (error) {
      console.error('Erro ao excluir orçamento:', error);
      alert('Erro ao excluir orçamento. Tente novamente.');
    }
  };
  
  const handleCreatePayment = (quote) => {
    // Redirecionar para a página de criação de pagamento
    window.location.href = `/admin/payments/create?quoteId=${quote.id}`;
  };
  
  // Filtrar orçamentos com base na busca
  const filteredQuotes = quotes.filter(quote => {
    return (
      quote.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.id.toString().includes(searchTerm)
    );
  });
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
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
          onClick={fetchQuotes}
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
        <h2 className="text-2xl font-bold">Gerenciamento de Orçamentos</h2>
        <div className="flex space-x-2">
          <button 
            onClick={fetchQuotes}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
          >
            Atualizar
          </button>
          {hasPermission('create_quotes') && (
            <a 
              href="/admin/quotes/create"
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm"
            >
              Novo Orçamento
            </a>
          )}
        </div>
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
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-md text-sm ${
                filter === 'pending' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              Pendentes
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-4 py-2 rounded-md text-sm ${
                filter === 'approved' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              Aprovados
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-4 py-2 rounded-md text-sm ${
                filter === 'rejected' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              Rejeitados
            </button>
          </div>
        </div>
        
        {/* Busca */}
        <div className="w-full md:w-64">
          <input
            type="text"
            placeholder="Buscar cliente, descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>
      
      {filteredQuotes.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600">
            {searchTerm 
              ? 'Nenhum orçamento encontrado para esta busca.' 
              : 'Não há orçamentos disponíveis.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descrição
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
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
              {filteredQuotes.map((quote) => (
                <tr key={quote.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    #{quote.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900">{quote.clientName}</div>
                      <div className="text-sm text-gray-500">{quote.phone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(quote.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">{quote.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatCurrency(quote.totalAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      quote.status === 'approved' 
                        ? 'bg-green-100 text-green-800' 
                        : quote.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {quote.status === 'approved' 
                        ? 'Aprovado' 
                        : quote.status === 'rejected'
                          ? 'Rejeitado'
                          : 'Pendente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    {quote.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(quote.id)}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm"
                        >
                          Aprovar
                        </button>
                        <button
                          onClick={() => handleReject(quote.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm"
                        >
                          Rejeitar
                        </button>
                      </>
                    )}
                    
                    {hasPermission('edit_quotes') && (
                      <button
                        onClick={() => handleEdit(quote.id)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm"
                      >
                        Editar
                      </button>
                    )}
                    
                    {hasPermission('delete_quotes') && (
                      <button
                        onClick={() => handleDelete(quote.id)}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-md text-sm"
                      >
                        Excluir
                      </button>
                    )}
                    
                    {quote.status === 'approved' && hasPermission('create_payments') && (
                      <button
                        onClick={() => handleCreatePayment(quote)}
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

export default QuotesManagement;