// src/pages/admin/QuotesManagement.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  DollarSign, 
  Plus, 
  Minus, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  Clock, 
  Calculator, 
  CreditCard, 
  Banknote,
  Send,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Copy,
  ExternalLink,
  Scissors,
  Eye,
  Trash2,
  Edit,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

const QuotesManagement = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, hasPermission, getCurrentProfessionalId } = useAuth();
  
  // Estados principais
  const [mode, setMode] = useState('list'); // 'list', 'create', 'view'
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Estados do formulário de criação
  const [appointmentData, setAppointmentData] = useState(null);
  const [quoteForm, setQuoteForm] = useState({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    appointmentDate: '',
    appointmentTime: '',
            services: [{ name: '', endTime: '', price: 0 }],
    additionalInfo: '',
    discount: 0,
    notes: ''
  });

  // Estados de filtros
  const [filter, setFilter] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');

  // Inicializar com dados do agendamento se vier de PendingAppointments
  useEffect(() => {
    const appointmentFromState = location.state?.appointmentData;
    
    if (appointmentFromState) {
      console.log('📋 Dados do agendamento recebidos:', appointmentFromState);
      setAppointmentData(appointmentFromState);
      setMode('create');
      
      // Preencher formulário com dados do agendamento
      setQuoteForm({
        clientName: appointmentFromState.clientName || '',
        clientPhone: appointmentFromState.clientPhone || '',
        clientEmail: '',
        appointmentDate: appointmentFromState.date || '',
        appointmentTime: appointmentFromState.time || '',
        services: [{
          name: appointmentFromState.service || '',
          endTime: '',
          price: appointmentFromState.servicePrice || 0
        }],
        additionalInfo: appointmentFromState.notes || '',
        discount: 0,
        notes: ''
      });
    } else {
      setMode('list');
      loadQuotes();
    }
  }, [location.state]);

  // Carregar orçamentos existentes
  const loadQuotes = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('https://coherent-escargot-23835.upstash.io/', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer AV0bAAIjcDEyODVlMzY0YTk2ODk0M2JkOTRlNmVmMmUzZTQwMDNkMnAxMA',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(['KEYS', 'orcamento:*']),
      });

      if (!response.ok) throw new Error('Erro ao buscar orçamentos');

      const keysData = await response.json();
      const allQuotes = [];

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
                const quote = JSON.parse(getData.result);
                allQuotes.push(quote);
              }
            }
          } catch (error) {
            console.error(`Erro ao buscar ${key}:`, error);
          }
        }
      }

      // Filtrar por profissional se for usuário profissional
      const professionalId = getCurrentProfessionalId();
      if (professionalId) {
        const filtered = allQuotes.filter(quote => 
          quote.professionalId == professionalId || quote.professionalId === professionalId
        );
        setQuotes(filtered);
      } else {
        setQuotes(allQuotes);
      }

    } catch (error) {
      console.error('Erro ao carregar orçamentos:', error);
      toast({
        title: "Erro ao carregar orçamentos",
        description: "Não foi possível carregar os orçamentos.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Adicionar serviço
  const addService = () => {
    setQuoteForm(prev => ({
      ...prev,
      services: [...prev.services, { name: '', endTime: '', price: 0 }]
    }));
  };

  // Remover serviço
  const removeService = (index) => {
    if (quoteForm.services.length > 1) {
      setQuoteForm(prev => ({
        ...prev,
        services: prev.services.filter((_, i) => i !== index)
      }));
    }
  };

  // Atualizar serviço
  const updateService = (index, field, value) => {
    setQuoteForm(prev => ({
      ...prev,
      services: prev.services.map((service, i) => 
        i === index ? { ...service, [field]: value } : service
      )
    }));
  };

  // Calcular duração do serviço baseado no horário inicial e final
  const calculateServiceDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return 0;
    
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    return Math.max(0, endMinutes - startMinutes);
  };

  // Gerar slots de horário para reservar no calendário
  const generateTimeSlots = (startTime, endTime) => {
    if (!startTime || !endTime) return [];
    
    const slots = [];
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    let currentHour = startHour;
    let currentMin = startMin;
    
    while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
      const timeString = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;
      slots.push(timeString);
      
      // Incrementar de hora em hora
      currentHour += 1;
    }
    
    return slots;
  };

  // Calcular total
  const calculateTotal = () => {
    const subtotal = quoteForm.services.reduce((sum, service) => sum + (parseFloat(service.price) || 0), 0);
    const discount = parseFloat(quoteForm.discount) || 0;
    return Math.max(0, subtotal - discount);
  };

  // Gerar ID único para orçamento
  const generateQuoteId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Gerar link de pagamento (simulado - você pode integrar com Mercado Pago real)
  const generatePaymentLink = (quoteId, amount) => {
    // Aqui você integraria com a API do Mercado Pago
    // Por enquanto, retornando um link simulado
    return `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${quoteId}&amount=${amount}`;
  };

  // Reservar múltiplos slots no calendário
  const reserveCalendarSlots = async (quoteData) => {
    try {
      // Criar agendamentos para cada slot de horário
      for (const timeSlot of quoteData.timeSlots) {
        const slotId = `${Date.now()}-${timeSlot.replace(':', '')}-${Math.random().toString(36).substr(2, 5)}`;
        
        const slotAppointment = {
          id: slotId,
          clientName: quoteData.clientName,
          clientPhone: quoteData.clientPhone,
          service: quoteData.services.map(s => s.name).join(', '),
          date: quoteData.appointmentDate,
          time: timeSlot,
          status: 'reservado_por_orcamento',
          professionalId: quoteData.professionalId,
          professionalName: quoteData.professionalName,
          quoteId: quoteData.id,
          servicePrice: quoteData.total,
          createdAt: new Date().toISOString(),
          notes: `Reservado por orçamento ${quoteData.id} - ${quoteData.services.map(s => s.name).join(', ')}`
        };

        // Salvar cada slot como agendamento no Redis
        await fetch('https://coherent-escargot-23835.upstash.io/', {
          method: 'POST',
          headers: {
            Authorization: 'Bearer AV0bAAIjcDEyODVlMzY0YTk2ODk0M2JkOTRlNmVmMmUzZTQwMDNkMnAxMA',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(['SET', `agendamento:${slotId}`, JSON.stringify(slotAppointment)]),
        });
      }
      
      console.log(`✅ ${quoteData.timeSlots.length} slots reservados no calendário`);
      
    } catch (error) {
      console.error('Erro ao reservar slots no calendário:', error);
    }
  };

  // Salvar orçamento
  const saveQuote = async () => {
    try {
      setSaving(true);
      
      // Validações
      if (!quoteForm.clientName.trim()) {
        toast({
          title: "Erro de validação",
          description: "Nome do cliente é obrigatório.",
          variant: "destructive"
        });
        return;
      }

      if (!quoteForm.clientPhone.trim()) {
        toast({
          title: "Erro de validação", 
          description: "Telefone do cliente é obrigatório.",
          variant: "destructive"
        });
        return;
      }

      if (quoteForm.services.some(s => !s.name.trim() || !s.endTime || !s.price)) {
        toast({
          title: "Erro de validação",
          description: "Todos os serviços devem ter nome, horário final e preço.",
          variant: "destructive"
        });
        return;
      }

      const quoteId = generateQuoteId();
      const total = calculateTotal();
      const professionalId = getCurrentProfessionalId();
      
      // Gerar slots de horário para reservar no calendário
      const timeSlots = quoteForm.services.flatMap(service => 
        generateTimeSlots(quoteForm.appointmentTime, service.endTime)
      );
      
      const quoteData = {
        id: quoteId,
        appointmentId: appointmentData?.id || null,
        professionalId: professionalId,
        professionalName: user.name || user.professional?.name,
        clientName: quoteForm.clientName,
        clientPhone: quoteForm.clientPhone,
        clientEmail: quoteForm.clientEmail,
        appointmentDate: quoteForm.appointmentDate,
        appointmentTime: quoteForm.appointmentTime,
        services: quoteForm.services,
        timeSlots: timeSlots, // ✅ NOVO: Slots para reservar no calendário
        subtotal: quoteForm.services.reduce((sum, service) => sum + (parseFloat(service.price) || 0), 0),
        discount: parseFloat(quoteForm.discount) || 0,
        total: total,
        additionalInfo: quoteForm.additionalInfo,
        notes: quoteForm.notes,
        status: 'enviado', // enviado, aceito, recusado, pago
        paymentStatus: 'pendente', // pendente, pago_online, pago_dinheiro
        paymentLink: generatePaymentLink(quoteId, total),
        createdAt: new Date().toISOString(),
        createdBy: user.username,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 dias
      };

      // Salvar no Redis
      const response = await fetch('https://coherent-escargot-23835.upstash.io/', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer AV0bAAIjcDEyODVlMzY0YTk2ODk0M2JkOTRlNmVmMmUzZTQwMDNkMnAxMA',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(['SET', `orcamento:${quoteId}`, JSON.stringify(quoteData)]),
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar orçamento');
      }

      // ✅ NOVO: Função para reservar slots no calendário quando orçamento for pago
      // Esta função será chamada quando o cliente aceitar o orçamento
      await reserveCalendarSlots(quoteData);

      // Se veio de um agendamento, atualizar o status do agendamento
      if (appointmentData?.id) {
        try {
          const appointmentResponse = await fetch('https://coherent-escargot-23835.upstash.io/', {
            method: 'POST',
            headers: {
              Authorization: 'Bearer AV0bAAIjcDEyODVlMzY0YTk2ODk0M2JkOTRlNmVmMmUzZTQwMDNkMnAxMA',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(['GET', `agendamento:${appointmentData.id}`]),
          });

          if (appointmentResponse.ok) {
            const appointmentDataResponse = await appointmentResponse.json();
            if (appointmentDataResponse.result) {
              const appointment = JSON.parse(appointmentDataResponse.result);
              const updatedAppointment = {
                ...appointment,
                status: 'orcamento_enviado',
                quoteId: quoteId,
                quoteSentAt: new Date().toISOString()
              };

              await fetch('https://coherent-escargot-23835.upstash.io/', {
                method: 'POST',
                headers: {
                  Authorization: 'Bearer AV0bAAIjcDEyODVlMzY0YTk2ODk0M2JkOTRlNmVmMmUzZTQwMDNkMnAxMA',
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(['SET', `agendamento:${appointmentData.id}`, JSON.stringify(updatedAppointment)]),
              });
            }
          }
        } catch (error) {
          console.error('Erro ao atualizar agendamento:', error);
        }
      }

      toast({
        title: "Orçamento criado!",
        description: `Orçamento de R$ ${total.toFixed(2)} criado com sucesso.`,
      });

      // Copiar link para clipboard
      navigator.clipboard.writeText(quoteData.paymentLink);
      toast({
        title: "Link copiado!",
        description: "Link de pagamento copiado para a área de transferência.",
      });

      // Voltar para lista
      setMode('list');
      loadQuotes();
      
    } catch (error) {
      console.error('Erro ao salvar orçamento:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o orçamento.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  // Copiar link de pagamento
  const copyPaymentLink = (link) => {
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copiado!",
      description: "Link de pagamento copiado para a área de transferência.",
    });
  };

  // Filtrar orçamentos
  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = quote.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.clientPhone.includes(searchTerm) ||
                         quote.id.includes(searchTerm);
    
    if (filter === 'todos') return matchesSearch;
    return matchesSearch && quote.status === filter;
  });

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'enviado':
        return 'bg-blue-500/20 text-blue-300 border-blue-400/30';
      case 'aceito':
        return 'bg-green-500/20 text-green-300 border-green-400/30';
      case 'recusado':
        return 'bg-red-500/20 text-red-300 border-red-400/30';
      case 'pago':
        return 'bg-purple-500/20 text-purple-300 border-purple-400/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
    }
  };

  // Verificar permissões
  if (!hasPermission('create_quotes') && !hasPermission('manage_own_quotes')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white">Sem Permissão</h2>
          <p className="text-gray-300">Você não tem permissão para gerenciar orçamentos</p>
        </div>
      </div>
    );
  }

  // MODO CRIAÇÃO DE ORÇAMENTO
  if (mode === 'create') {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => {
                setMode('list');
                loadQuotes();
              }}
              className="text-white hover:text-pink-400 hover:bg-pink-500/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center">
                <Calculator className="w-8 h-8 mr-3 text-pink-400" />
                Criar Orçamento
              </h1>
              <p className="text-gray-300">
                {appointmentData ? `Para agendamento de ${appointmentData.clientName}` : 'Novo orçamento personalizado'}
              </p>
            </div>
          </div>
        </div>

        {/* Formulário de Orçamento */}
        <div className="space-y-6">
          {/* Dados do Cliente */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Dados do Cliente
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">Nome *</label>
                <input
                  type="text"
                  value={quoteForm.clientName}
                  onChange={(e) => setQuoteForm(prev => ({ ...prev, clientName: e.target.value }))}
                  className="w-full p-3 rounded-lg bg-white/10 text-white placeholder-white/70 border border-white/30 focus:border-white/60 focus:bg-white/20"
                  placeholder="Nome completo do cliente"
                  required
                />
              </div>
              
              <div>
                <label className="block text-white text-sm font-medium mb-2">Telefone *</label>
                <input
                  type="tel"
                  value={quoteForm.clientPhone}
                  onChange={(e) => setQuoteForm(prev => ({ ...prev, clientPhone: e.target.value }))}
                  className="w-full p-3 rounded-lg bg-white/10 text-white placeholder-white/70 border border-white/30 focus:border-white/60 focus:bg-white/20"
                  placeholder="(11) 99999-9999"
                  required
                />
              </div>
              
              <div>
                <label className="block text-white text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={quoteForm.clientEmail}
                  onChange={(e) => setQuoteForm(prev => ({ ...prev, clientEmail: e.target.value }))}
                  className="w-full p-3 rounded-lg bg-white/10 text-white placeholder-white/70 border border-white/30 focus:border-white/60 focus:bg-white/20"
                  placeholder="email@exemplo.com"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Data</label>
                  <input
                    type="date"
                    value={quoteForm.appointmentDate}
                    onChange={(e) => setQuoteForm(prev => ({ ...prev, appointmentDate: e.target.value }))}
                    className="w-full p-3 rounded-lg bg-white/10 text-white border border-white/30 focus:border-white/60 focus:bg-white/20"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Horário</label>
                  <input
                    type="time"
                    value={quoteForm.appointmentTime}
                    onChange={(e) => setQuoteForm(prev => ({ ...prev, appointmentTime: e.target.value }))}
                    className="w-full p-3 rounded-lg bg-white/10 text-white border border-white/30 focus:border-white/60 focus:bg-white/20"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Serviços */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Scissors className="w-5 h-5 mr-2" />
                Serviços
              </h3>
              <Button
                onClick={addService}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Serviço
              </Button>
            </div>

            <div className="space-y-4">
              {quoteForm.services.map((service, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="md:col-span-2">
                      <label className="block text-white text-sm font-medium mb-2">Serviço *</label>
                      <input
                        type="text"
                        value={service.name}
                        onChange={(e) => updateService(index, 'name', e.target.value)}
                        className="w-full p-3 rounded-lg bg-white/10 text-white placeholder-white/70 border border-white/30 focus:border-white/60"
                        placeholder="Nome do serviço"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Horário Final *</label>
                      <input
                        type="time"
                        value={service.endTime}
                        onChange={(e) => updateService(index, 'endTime', e.target.value)}
                        className="w-full p-3 rounded-lg bg-white/10 text-white border border-white/30 focus:border-white/60"
                        required
                      />
                      {quoteForm.appointmentTime && service.endTime && (
                        <p className="text-xs text-green-300 mt-1">
                          Duração: {calculateServiceDuration(quoteForm.appointmentTime, service.endTime)} min
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <div className="flex-1">
                        <label className="block text-white text-sm font-medium mb-2">Preço (R$) *</label>
                        <input
                          type="number"
                          value={service.price}
                          onChange={(e) => updateService(index, 'price', parseFloat(e.target.value) || 0)}
                          className="w-full p-3 rounded-lg bg-white/10 text-white border border-white/30 focus:border-white/60"
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                      {quoteForm.services.length > 1 && (
                        <Button
                          onClick={() => removeService(index)}
                          variant="outline"
                          className="mt-7 border-red-500/50 text-red-300 hover:bg-red-500/10"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Resumo e Observações */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Observações */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Informações Adicionais
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Informações do Agendamento</label>
                  <textarea
                    value={quoteForm.additionalInfo}
                    onChange={(e) => setQuoteForm(prev => ({ ...prev, additionalInfo: e.target.value }))}
                    className="w-full p-3 rounded-lg bg-white/10 text-white placeholder-white/70 border border-white/30 focus:border-white/60 resize-none"
                    placeholder="Detalhes sobre o serviço, preferências do cliente, etc."
                    rows="3"
                  />
                </div>
                
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Observações Internas</label>
                  <textarea
                    value={quoteForm.notes}
                    onChange={(e) => setQuoteForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full p-3 rounded-lg bg-white/10 text-white placeholder-white/70 border border-white/30 focus:border-white/60 resize-none"
                    placeholder="Observações para uso interno..."
                    rows="3"
                  />
                </div>
              </div>
            </div>

            {/* Resumo */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Calculator className="w-5 h-5 mr-2" />
                Resumo do Orçamento
              </h3>
              
              <div className="space-y-4">
                {/* Lista de serviços */}
                {quoteForm.services.map((service, index) => (
                  service.name && (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-white/10">
                      <div>
                        <p className="text-white font-medium">{service.name}</p>
                        {service.endTime && quoteForm.appointmentTime && (
                          <p className="text-gray-300 text-sm">
                            {quoteForm.appointmentTime} - {service.endTime} 
                            ({calculateServiceDuration(quoteForm.appointmentTime, service.endTime)} min)
                          </p>
                        )}
                      </div>
                      <p className="text-white font-semibold">{formatCurrency(service.price)}</p>
                    </div>
                  )
                ))}
                
                {/* Subtotal */}
                <div className="flex justify-between items-center py-2 border-b border-white/20">
                  <p className="text-white font-medium">Subtotal</p>
                  <p className="text-white font-semibold">
                    {formatCurrency(quoteForm.services.reduce((sum, service) => sum + (parseFloat(service.price) || 0), 0))}
                  </p>
                </div>
                
                {/* Desconto */}
                <div className="flex justify-between items-center">
                  <label className="text-white font-medium">Desconto (R$)</label>
                  <input
                    type="number"
                    value={quoteForm.discount}
                    onChange={(e) => setQuoteForm(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                    className="w-24 p-2 rounded-lg bg-white/10 text-white border border-white/30 focus:border-white/60 text-right"
                    min="0"
                    step="0.01"
                  />
                </div>
                
                {/* Total */}
                <div className="flex justify-between items-center py-3 border-t border-white/20">
                  <p className="text-xl font-bold text-white">TOTAL</p>
                  <p className="text-2xl font-bold text-green-400">{formatCurrency(calculateTotal())}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Ações */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center space-x-4"
          >
            <Button
              onClick={() => {
                setMode('list');
                loadQuotes();
              }}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
            >
              Cancelar
            </Button>
            
            <Button
              onClick={saveQuote}
              disabled={saving}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Criar e Enviar Orçamento
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  // MODO LISTA DE ORÇAMENTOS
  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center">
            <DollarSign className="w-8 h-8 mr-3 text-green-400" />
            Gerenciar Orçamentos
          </h1>
          <p className="text-gray-300">Visualize e gerencie todos os orçamentos criados</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => setMode('create')}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Orçamento
          </Button>
          
          <Button 
            onClick={loadQuotes}
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

      {/* Filtros */}
      <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 mb-6 border border-white/20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div className="flex flex-wrap gap-2">
            {['todos', 'enviado', 'aceito', 'recusado', 'pago'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  filter === status
                    ? 'bg-pink-600 text-white'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {status === 'todos' ? 'Todos' : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
          
          <div className="w-full md:w-64">
            <input
              type="text"
              placeholder="Buscar cliente, telefone, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 rounded-lg bg-white/10 text-white placeholder-white/70 border border-white/30 focus:border-white/60"
            />
          </div>
        </div>
      </div>

      {/* Lista de Orçamentos */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
            <p className="text-white">Carregando orçamentos...</p>
          </div>
        </div>
      ) : filteredQuotes.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-8 text-center">
          <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            {searchTerm ? 'Nenhum orçamento encontrado' : 'Nenhum orçamento criado'}
          </h3>
          <p className="text-gray-300 mb-4">
            {searchTerm 
              ? 'Tente ajustar os filtros ou termo de busca.'
              : 'Crie seu primeiro orçamento para clientes.'
            }
          </p>
          {!searchTerm && (
            <Button
              onClick={() => setMode('create')}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Orçamento
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuotes.map((quote) => (
            <motion.div
              key={quote.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden hover:border-white/30 transition-all duration-200"
            >
              <div className="p-6">
                {/* Header do Card */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {quote.clientName}
                      </h3>
                      <p className="text-gray-300 text-sm">
                        Orçamento #{quote.id.slice(-8)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(quote.status)}`}>
                      {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                    </span>
                    <p className="text-2xl font-bold text-green-400">{formatCurrency(quote.total)}</p>
                  </div>
                </div>

                {/* Detalhes */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-blue-400" />
                    <div>
                      <p className="text-xs text-gray-400">Telefone</p>
                      <p className="text-white font-medium">{quote.clientPhone}</p>
                    </div>
                  </div>
                  
                  {quote.appointmentDate && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-green-400" />
                      <div>
                        <p className="text-xs text-gray-400">Agendamento</p>
                        <p className="text-white font-medium">
                          {new Date(quote.appointmentDate).toLocaleDateString('pt-BR')} às {quote.appointmentTime}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-purple-400" />
                    <div>
                      <p className="text-xs text-gray-400">Serviços</p>
                      <p className="text-white font-medium">{quote.services.length} item(s)</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-yellow-400" />
                    <div>
                      <p className="text-xs text-gray-400">Criado em</p>
                      <p className="text-white font-medium">{formatDate(quote.createdAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Serviços */}
                <div className="mb-4 p-3 bg-white/5 rounded-lg">
                  <h4 className="text-sm font-medium text-white mb-2">Serviços inclusos:</h4>
                  <div className="space-y-1">
                    {quote.services.map((service, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span className="text-gray-300">
                          {service.name} 
                          {service.endTime && quote.appointmentTime && (
                            <span className="text-xs text-gray-400 ml-1">
                              ({quote.appointmentTime} - {service.endTime})
                            </span>
                          )}
                        </span>
                        <span className="text-white font-medium">{formatCurrency(service.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Link de Pagamento */}
                {quote.paymentLink && (
                  <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-300 text-sm font-medium">Link de Pagamento</p>
                        <p className="text-green-200 text-xs">Envie este link para o cliente</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => copyPaymentLink(quote.paymentLink)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                          size="sm"
                        >
                          <Copy className="w-4 h-4 mr-1" />
                          Copiar
                        </Button>
                        <Button
                          onClick={() => window.open(quote.paymentLink, '_blank')}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          size="sm"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Observações */}
                {quote.additionalInfo && (
                  <div className="mb-4 p-3 bg-white/5 rounded-lg">
                    <p className="text-xs text-gray-400 mb-1">Informações adicionais:</p>
                    <p className="text-white text-sm">{quote.additionalInfo}</p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

/*
📋 INTEGRAÇÃO COM CALENDÁRIO - YearlyCalendarView.jsx

Para conectar os múltiplos horários ao calendário, adicione estas modificações no YearlyCalendarView.jsx:

1. MODIFICAR getSlotStatus() para detectar slots reservados por orçamento:

const getSlotStatus = (year, month, day, time) => {
  const slotAppointments = getAppointmentsForSlot(year, month, day, time);
  
  // Verificar se há slot reservado por orçamento
  const reservedByQuote = slotAppointments.some(apt => apt.status === 'reservado_por_orcamento');
  if (reservedByQuote) {
    return { 
      status: 'reservado_orcamento', 
      color: 'bg-purple-500/30 border-purple-400/50', 
      text: 'Reservado por Orçamento', 
      icon: DollarSign,
      appointments: slotAppointments.filter(apt => apt.status === 'reservado_por_orcamento')
    };
  }
  
  // ... resto do código existente
};

2. ADICIONAR na legenda:

<div className="flex items-center">
  <div className="w-4 h-4 rounded-full bg-purple-500/40 mr-2"></div>
  <span className="text-white/80 text-sm">Reservado por Orçamento</span>
</div>

3. OPCIONAL: Adicionar função para liberar slots quando orçamento for recusado:

const releaseQuoteSlots = async (quoteId) => {
  // Buscar todos agendamentos relacionados ao orçamento
  // Remover os slots com status 'reservado_por_orcamento'
};

COMO FUNCIONA:
- Profissional cria orçamento com horário final (ex: 14:00 - 16:00)
- Sistema gera slots: ['14:00', '15:00'] 
- Cada slot vira um agendamento com status 'reservado_por_orcamento'
- Calendário mostra todos os horários como ocupados
- Cliente não consegue agendar nos horários reservados
*/

export default QuotesManagement;