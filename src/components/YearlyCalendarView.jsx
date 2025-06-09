import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, Clock, AlertCircle, Check, X, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const YearlyCalendarView = ({ services, setShowNewAppointment }) => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [adminClicks, setAdminClicks] = useState(0);
  
  // Estado para armazenar agendamentos do Upstash
  const [appointments, setAppointments] = useState([]);

  const operatingHours = useMemo(() => {
    const hours = [];
    for (let i = 7; i <= 18; i++) {
      hours.push(`${String(i).padStart(2, '0')}:00`);
    }
    return hours;
  }, []);

  // Carregar agendamentos do Upstash ao iniciar o componente e quando mudar o mês/ano
  useEffect(() => {
    loadAppointments();
  }, [currentYear, selectedMonth]);

  // Função SIMPLIFICADA para buscar agendamentos
  const loadAppointments = async () => {
    setIsLoading(true);
    
    const baseUrl = 'https://coherent-escargot-23835.upstash.io';
    const token = 'Bearer AV0bAAIjcDEyODVlMzY0YTk2ODk0M2JkOTRlNmVmMmUzZTQwMDNkMnAxMA';
    
    try {
      let allAppointments = [];
      
      const keysResponse = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(['KEYS', 'agendamento:*']),
      });
      
      if (keysResponse.ok) {
        const keysData = await keysResponse.json();
        
        if (keysData.result && Array.isArray(keysData.result)) {
          // Buscar dados de cada chave
          for (const key of keysData.result) {
            try {
              const getResponse = await fetch(baseUrl, {
                method: 'POST',
                headers: {
                  Authorization: token,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(['GET', key]),
              });
              
              if (getResponse.ok) {
                const getData = await getResponse.json();
                if (getData.result) {
                  try {
                    const appointment = JSON.parse(getData.result);
                    allAppointments.push(appointment);
                  } catch (parseError) {
                    console.error(`Erro ao parsear ${key}:`, parseError);
                  }
                }
              }
            } catch (error) {
              console.error(`Erro ao buscar ${key}:`, error);
            }
          }
        }
      }

      setAppointments(allAppointments);
      
      if (allAppointments.length > 0) {
        toast({
          title: "Agendamentos atualizados!",
          description: `${allAppointments.length} agendamento(s) encontrado(s).`,
        });
      }

    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      setAppointments([]);
      toast({
        title: "Erro ao carregar agendamentos",
        description: "Verifique a conexão e tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay(); 

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const handlePrevYear = () => setCurrentYear(currentYear - 1);
  const handleNextYear = () => setCurrentYear(currentYear + 1);
  const handleMonthSelect = (monthIndex) => {
    setSelectedMonth(monthIndex);
    setSelectedDay(null); 
  };
  const handleDayClick = (day) => setSelectedDay(day);

  // Função para acesso administrativo
  const handleAdminAccess = () => {
    setAdminClicks(prev => prev + 1);
    
    // Reset contador após 3 segundos
    setTimeout(() => {
      setAdminClicks(0);
    }, 3000);
    
    // Se clicar 5 vezes em 3 segundos, mostrar opção admin
    if (adminClicks >= 4) {
      const isAdmin = confirm('Deseja acessar o painel administrativo?');
      if (isAdmin) {
        openAdminPanel();
      }
      setAdminClicks(0);
    }
  };

  const openAdminPanel = () => {
    // Abrir painel em nova aba/janela
    window.open('admin.html', '_blank', 'width=1200,height=800');
  };

  const getAppointmentsForSlot = (year, month, day, time) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return appointments.filter(
      (apt) => apt.date === dateStr && apt.time === time
    );
  };

  // Função para determinar o status do horário
  const getSlotStatus = (year, month, day, time) => {
    const slotAppointments = getAppointmentsForSlot(year, month, day, time);
    
    if (slotAppointments.length === 0) {
      return { status: 'disponivel', color: 'bg-green-500/30 hover:bg-green-500/40 cursor-pointer', text: 'Disponível', icon: Plus };
    }
    
    // Verificar se tem agendamentos aprovados
    const hasApproved = slotAppointments.some(apt => apt.status === 'aprovado');
    if (hasApproved) {
      return { 
        status: 'reservado', 
        color: 'bg-red-500/30', 
        text: 'Reservado', 
        icon: X,
        appointments: slotAppointments.filter(apt => apt.status === 'aprovado')
      };
    }
    
    // Verificar se tem agendamentos pendentes
    const hasPending = slotAppointments.some(apt => apt.status === 'pendente');
    if (hasPending) {
      return { 
        status: 'pendente', 
        color: 'bg-yellow-500/30', 
        text: 'Reserva Pendente', 
        icon: AlertCircle,
        appointments: slotAppointments.filter(apt => apt.status === 'pendente')
      };
    }
    
    return { status: 'disponivel', color: 'bg-green-500/30 hover:bg-green-500/40 cursor-pointer', text: 'Disponível', icon: Plus };
  };

  const renderMonthCalendar = (year, month) => {
    const numDays = daysInMonth(year, month);
    const firstDay = firstDayOfMonth(year, month);
    const calendarDays = [];

    // Cabeçalho dos dias da semana
    const dayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    
    for (let i = 0; i < firstDay; i++) {
      calendarDays.push(<div key={`empty-${i}`} className="p-1 border border-white/10"></div>);
    }

    for (let day = 1; day <= numDays; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayAppointments = appointments.filter(apt => apt.date === dateStr);
      const pendingCount = dayAppointments.filter(apt => apt.status === 'pendente').length;
      const approvedCount = dayAppointments.filter(apt => apt.status === 'aprovado').length;
      const isSelected = selectedDay === day;
      
      let bgColor = '';
      if (isSelected) {
        bgColor = 'bg-pink-500/50 border-pink-400';
      } else if (approvedCount > 0 && pendingCount > 0) {
        bgColor = 'bg-gradient-to-r from-red-500/30 to-yellow-500/30 border-orange-400/50';
      } else if (approvedCount > 0) {
        bgColor = 'bg-red-500/30 border-red-400/50';
      } else if (pendingCount > 0) {
        bgColor = 'bg-yellow-500/30 border-yellow-400/50';
      } else {
        bgColor = 'border-white/10 hover:bg-white/5';
      }
      
      calendarDays.push(
        <motion.div
          key={day}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleDayClick(day)}
          className={`p-2 border cursor-pointer transition-all duration-200 ${bgColor} min-h-[60px] flex flex-col justify-between`}
        >
          <div className={`font-semibold ${isSelected ? 'text-white' : 'text-white/80'}`}>{day}</div>
          {dayAppointments.length > 0 && (
            <div className="text-xs space-y-1">
              {approvedCount > 0 && (
                <div className="bg-red-600/20 rounded px-1 py-0.5 text-red-200">
                  {approvedCount} conf.
                </div>
              )}
              {pendingCount > 0 && (
                <div className="bg-yellow-600/20 rounded px-1 py-0.5 text-yellow-200">
                  {pendingCount} pend.
                </div>
              )}
            </div>
          )}
        </motion.div>
      );
    }
    
    return (
      <div className="space-y-2">
        {/* Cabeçalho dos dias */}
        <div className="grid grid-cols-7 gap-px bg-white/5 mb-2">
          {dayLabels.map(label => (
            <div key={label} className="p-2 text-center text-white/60 font-medium text-sm">
              {label}
            </div>
          ))}
        </div>
        {/* Calendário */}
        <div className="grid grid-cols-7 gap-px bg-white/5">{calendarDays}</div>
      </div>
    );
  };

  const renderDaySchedule = (year, month, day) => {
    if (day === null) {
      return (
        <div className="text-center text-white/70 p-8">
          <Clock className="w-12 h-12 mx-auto mb-4 text-white/50" />
          <p>Selecione um dia para ver os horários disponíveis.</p>
        </div>
      );
    }
    
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const today = new Date();
    const selectedDate = new Date(year, month, day);
    const isPastDate = selectedDate < today.setHours(0, 0, 0, 0);

    return (
      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-white">
            {day} de {monthNames[month]}
          </h4>
          <Button 
            onClick={loadAppointments}
            variant="ghost" 
            size="sm"
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
        
        {isPastDate && (
          <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-3 mb-4">
            <p className="text-orange-200 text-sm flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              Esta data já passou. Agendamentos não estão disponíveis.
            </p>
          </div>
        )}
        
        <div className="space-y-2">
          {operatingHours.map((hour) => {
            const slotInfo = getSlotStatus(year, month, day, hour);
            const Icon = slotInfo.icon;
            const isClickable = !isPastDate && slotInfo.status === 'disponivel';
            
            return (
              <motion.div
                key={hour}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: operatingHours.indexOf(hour) * 0.05 }}
                className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${slotInfo.color} ${
                  isPastDate ? 'opacity-50' : ''
                }`}
                onClick={() => {
                  if (isClickable) {
                    console.log('🎯 Abrindo formulário para:', { date: dateStr, time: hour });
                    setShowNewAppointment(true);
                  }
                }}
              >
                <div className="flex items-center">
                  <span className="text-white font-medium mr-3">{hour}</span>
                  <div className="flex items-center">
                    <Icon className="w-4 h-4 mr-2" />
                    <span className={`text-sm ${
                      slotInfo.status === 'disponivel' ? 'text-green-200' :
                      slotInfo.status === 'pendente' ? 'text-yellow-200' :
                      slotInfo.status === 'reservado' ? 'text-red-200' :
                      'text-gray-200'
                    }`}>
                      {slotInfo.text}
                    </span>
                  </div>
                </div>
                
                {slotInfo.appointments && slotInfo.appointments.length > 0 && (
                  <div className="text-xs text-white/70">
                    {slotInfo.appointments.map(apt => apt.clientName || 'Cliente').join(', ')}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <motion.div
      key="yearlyCalendar"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6"
    >
      {/* Header com navegação de ano */}
      <div className="flex justify-between items-center mb-6 p-4 glass-effect rounded-xl">
        <Button variant="ghost" onClick={handlePrevYear} className="text-white hover:bg-white/10">
          <ChevronLeft className="w-5 h-5 mr-2" /> {currentYear - 1}
        </Button>
        <h2 className="text-3xl font-bold text-white">{currentYear}</h2>
        <Button variant="ghost" onClick={handleNextYear} className="text-white hover:bg-white/10">
          {currentYear + 1} <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
      </div>

      {/* Seleção de mês */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {monthNames.map((name, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleMonthSelect(index)}
            className={`p-3 rounded-lg text-center font-medium transition-all duration-200
              ${selectedMonth === index 
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg' 
                : 'bg-white/10 text-white/80 hover:bg-white/20'}
            `}
          >
            {name}
          </motion.button>
        ))}
      </div>
      
      {/* Calendário e horários */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-effect rounded-xl p-4">
          <h3 className="text-xl font-semibold text-white mb-4 text-center">
            {monthNames[selectedMonth]} de {currentYear}
          </h3>
          {isLoading ? (
            <div className="flex justify-center items-center h-64 text-white/70">
              <RefreshCw className="w-6 h-6 animate-spin mr-2" />
              Carregando calendário...
            </div>
          ) : (
            renderMonthCalendar(currentYear, selectedMonth)
          )}
        </div>
        
        <div className="lg:col-span-1 glass-effect rounded-xl">
          {isLoading ? (
            <div className="flex justify-center items-center h-64 text-white/70">
              <RefreshCw className="w-6 h-6 animate-spin mr-2" />
              Carregando horários...
            </div>
          ) : (
            renderDaySchedule(currentYear, selectedMonth, selectedDay)
          )}
        </div>
      </div>
      
      {/* Legenda */}
      <div className="glass-effect rounded-xl p-4">
        <h3 className="text-lg font-semibold text-white mb-3">Status dos Horários</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-green-500/40 mr-2"></div>
            <span className="text-white/80 text-sm">Disponível</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-yellow-500/40 mr-2"></div>
            <span className="text-white/80 text-sm">Reserva Pendente</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-red-500/40 mr-2"></div>
            <span className="text-white/80 text-sm">Reservado</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-gray-500/40 mr-2"></div>
            <span className="text-white/80 text-sm">Indisponível</span>
          </div>
        </div>
      </div>
      
      {/* Botão de atualizar */}
      <Button 
        className="fixed bottom-6 right-6 rounded-full p-4 bg-gradient-to-r from-pink-500 to-purple-600 shadow-lg hover:shadow-xl transition-all duration-200"
        onClick={loadAppointments}
      >
        <RefreshCw className="w-5 h-5" />
      </Button>
      
      {/* Botão discreto para acesso administrativo */}
      <div 
        className="fixed bottom-4 left-4 opacity-5 hover:opacity-100 transition-opacity duration-500 cursor-pointer"
        onClick={handleAdminAccess}
        onDoubleClick={openAdminPanel}
        title="Acesso administrativo"
      >
        <div className="w-3 h-3 bg-white rounded-full"></div>
      </div>
    </motion.div>
  );
};

export default YearlyCalendarView;