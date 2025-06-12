import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Filter,
  Search,
  Download,
  Eye,
  Phone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

// Configuração do Upstash
const UPSTASH_URL = 'https://coherent-escargot-23835.upstash.io';
const UPSTASH_TOKEN = 'Bearer AV0bAAIjcDEyODVlMzY0YTk2ODk0M2JkOTRlNmVmMmUzZTQwMDNkMnAxMA';

const PaymentsManagement = () => {
  const { user, hasPermission } = useAuth();
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Carregar pagamentos do Upstash
  const loadPayments = async () => {
    try {
      setLoading(true);
      
      const keysResponse = await fetch(UPSTASH_URL, {
        method: 'POST',
        headers: {
          Authorization: UPSTASH_TOKEN,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(['KEYS', 'pagamento:*']),
      });
      
      if (keysResponse.ok) {
        const keysData = await keysResponse.json();
        const allPayments = [];
        
        if (keysData.result && keysData.result.length > 0) {
          for (const key of keysData.result) {
            try {
              const getResponse = await fetch(UPSTASH_URL, {
                method: 'POST',
                headers: {
                  Authorization: UPSTASH_TOKEN,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(['GET', key]),
              });
              
              if (getResponse.ok) {
                const getData = await getResponse.json();
                if (getData.result) {
                  const payment = JSON.parse(getData.result);
                  allPayments.push(payment);
                }
              }
            } catch (error) {
              console.error('Erro ao buscar pagamento:', error);
            }
          }
        }
        
        // Ordenar por data mais recente
        allPayments.sort((a, b) => new Date(b.dataPagamento || b.createdAt) - new Date(a.dataPagamento || a.createdAt));
        
        setPayments(allPayments);
        setFilteredPayments(allPayments);
      }
      
    } catch (error) {
      console.error('Erro ao carregar pagamentos:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar pagamentos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtros
  useEffect(() => {
    let filtered = payments;

    // Filtro por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(payment =>
        payment.cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.cliente.telefone.includes(searchTerm) ||
        payment.id.toString().includes(searchTerm)
      );
    }

    // Filtro por status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => payment.status === statusFilter);
    }

    // Filtro por método de pagamento
    if (methodFilter !== 'all') {
      filtered = filtered.filter(payment => payment.metodoPagamento === methodFilter);
    }

    setFilteredPayments(filtered);
  }, [payments, searchTerm, statusFilter, methodFilter]);

  // Marcar como pago em dinheiro
  const markAsPaidCash = async (paymentId) => {
    if (!hasPermission('manage_payments')) {
      toast({
        title: "Sem permissão",
        description: "Você não tem permissão para alterar pagamentos",
        variant: "destructive"
      });
      return;
    }

    try {
      const payment = payments.find(p => p.id === paymentId);
      if (!payment) return;

      const updatedPayment = {
        ...payment,
        status: 'pago',
        dataPagamento: new Date().toISOString(),
        confirmedBy: user.username
      };

      const response = await fetch(UPSTASH_URL, {
        method: 'POST',
        headers: {
          Authorization: UPSTASH_TOKEN,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(['SET', `pagamento:${paymentId}`, JSON.stringify(updatedPayment)]),
      });

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Pagamento confirmado como pago"
        });
        loadPayments();
      } else {
        throw new Error('Erro ao atualizar pagamento');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast({
        title: "Erro",
        description: "Erro ao confirmar pagamento",
        variant: "destructive"
      });
    }
  };

  // Cancelar pagamento
  const cancelPayment = async (paymentId) => {
    if (!hasPermission('manage_payments')) {
      toast({
        title: "Sem permissão",
        description: "Você não tem permissão para cancelar pagamentos",
        variant: "destructive"
      });
      return;
    }

    if (!confirm('Tem certeza que deseja cancelar este pagamento?')) return;

    try {
      const payment = payments.find(p => p.id === paymentId);
      if (!payment) return;

      const updatedPayment = {
        ...payment,
        status: 'cancelado',
        canceledAt: new Date().toISOString(),
        canceledBy: user.username
      };

      const response = await fetch(UPSTASH_URL, {
        method: 'POST',
        headers: {
          Authorization: UPSTASH_TOKEN,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(['SET', `pagamento:${paymentId}`, JSON.stringify(updatedPayment)]),
      });

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Pagamento cancelado"
        });
        loadPayments();
      } else {
        throw new Error('Erro ao cancelar pagamento');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast({
        title: "Erro",
        description: "Erro ao cancelar pagamento",
        variant: "destructive"
      });
    }
  };

  // Entrar em contato via WhatsApp
  const contactClient = (payment) => {
    const message = `Olá ${payment.cliente.nome}! Estamos entrando em contato sobre seu pagamento de R$ ${payment.valor.toFixed(2).replace('.', ',')}. Como podemos ajudar?`;
    const phone = payment.cliente.telefone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Exportar relatório
  const exportReport = () => {
    const csvContent = [
      ['ID', 'Cliente', 'Telefone', 'Valor', 'Método', 'Status', 'Data'].join(','),
      ...filteredPayments.map(payment => [
        payment.id,
        payment.cliente.nome,
        payment.cliente.telefone,
        payment.valor,
        payment.metodoPagamento,
        payment.status,
        payment.dataPagamento ? new Date(payment.dataPagamento).toLocaleDateString('pt-BR') : 'Pendente'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pagamentos_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Mostrar detalhes do pagamento
  const showPaymentDetails = (payment) => {
    setSelectedPayment(payment);
    setShowDetails(true);
  };

  // Carregar dados ao montar componente
  useEffect(() => {
    loadPayments();
  }, []);

  // Estatísticas
  const stats = {
    total: payments.length,
    pending: payments.filter(p => p.status === 'pendente').length,
    paid: payments.filter(p => p.status === 'pago').length,
    canceled: payments.filter(p => p.status === 'cancelado').length,
    totalValue: payments.filter(p => p.status === 'pago').reduce((sum, p) => sum + p.valor, 0)
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pago':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pendente':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'cancelado':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pago':
        return 'bg-green-100 text-green-800';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMethodIcon = (method) => {
    switch (method) {
      case 'dinheiro':
        return '💵';
      case 'pix':
        return '📱';
      case 'cartao':
        return '💳';
      case 'mercadopago':
        return '🛒';
      default:
        return '💰';
    }
  };

  if (loading) {
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
          <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Pagamentos</h1>
          <p className="text-gray-600">Acompanhe e gerencie todos os pagamentos</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportReport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={loadPayments}>
            Atualizar
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-purple-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total de Pagamentos</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-yellow-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Pendentes</p>
              <p className="text-2xl font-bold">{stats.pending}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Pagos</p>
              <p className="text-2xl font-bold">{stats.paid}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <XCircle className="w-8 h-8 text-red-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Cancelados</p>
              <p className="text-2xl font-bold">{stats.canceled}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <CreditCard className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Valor Total</p>
              <p className="text-2xl font-bold">R$ {stats.totalValue.toFixed(2).replace('.', ',')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Nome, telefone ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">Todos</option>
              <option value="pendente">Pendentes</option>
              <option value="pago">Pagos</option>
              <option value="cancelado">Cancelados</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Método</label>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">Todos</option>
              <option value="dinheiro">Dinheiro</option>
              <option value="pix">PIX</option>
              <option value="cartao">Cartão</option>
              <option value="mercadopago">Mercado Pago</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setMethodFilter('all');
              }}
              className="w-full"
            >
              <Filter className="w-4 h-4 mr-2" />
              Limpar Filtros
            </Button>
          </div>
        </div>
      </div>

      {/* Lista de Pagamentos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Método
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {payment.cliente.nome}
                      </div>
                      <div className="text-sm text-gray-500">
                        {payment.cliente.telefone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      R$ {payment.valor.toFixed(2).replace('.', ',')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="mr-2">{getMethodIcon(payment.metodoPagamento)}</span>
                      <span className="text-sm text-gray-900 capitalize">
                        {payment.metodoPagamento}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={getStatusColor(payment.status)}>
                      <div className="flex items-center">
                        {getStatusIcon(payment.status)}
                        <span className="ml-1 capitalize">{payment.status}</span>
                      </div>
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {payment.dataPagamento 
                      ? new Date(payment.dataPagamento).toLocaleDateString('pt-BR')
                      : 'Pendente'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => showPaymentDetails(payment)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => contactClient(payment)}
                      >
                        <Phone className="w-4 h-4" />
                      </Button>
                      
                      {payment.status === 'pendente' && hasPermission('manage_payments') && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => markAsPaidCash(payment.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Confirmar Pago
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => cancelPayment(payment.id)}
                          >
                            Cancelar
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredPayments.length === 0 && (
          <div className="text-center py-8">
            <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Nenhum pagamento encontrado</p>
          </div>
        )}
      </div>

      {/* Modal de Detalhes */}
      {showDetails && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl m-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Detalhes do Pagamento</h2>
              <Button variant="ghost" onClick={() => setShowDetails(false)}>
                ✕
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Informações do Cliente</h3>
                <p><strong>Nome:</strong> {selectedPayment.cliente.nome}</p>
                <p><strong>Telefone:</strong> {selectedPayment.cliente.telefone}</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Detalhes do Pagamento</h3>
                <p><strong>ID:</strong> {selectedPayment.id}</p>
                <p><strong>Valor:</strong> R$ {selectedPayment.valor.toFixed(2).replace('.', ',')}</p>
                <p><strong>Método:</strong> {getMethodIcon(selectedPayment.metodoPagamento)} {selectedPayment.metodoPagamento}</p>
                <p><strong>Status:</strong> 
                  <Badge className={`ml-2 ${getStatusColor(selectedPayment.status)}`}>
                    {selectedPayment.status}
                  </Badge>
                </p>
              </div>
            </div>
            
            {selectedPayment.servicos && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Serviços</h3>
                <div className="space-y-2">
                  {selectedPayment.servicos.map((servico, index) => (
                    <div key={index} className="flex justify-between bg-gray-50 p-2 rounded">
                      <span>{servico.descricao}</span>
                      <span>R$ {servico.valor.toFixed(2).replace('.', ',')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {selectedPayment.agendamento && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Agendamento</h3>
                <p><strong>Data:</strong> {new Date(selectedPayment.agendamento.data).toLocaleDateString('pt-BR')}</p>
                <p><strong>Horário:</strong> {selectedPayment.agendamento.horario}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default PaymentsManagement;