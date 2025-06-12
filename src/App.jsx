import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, User, Scissors, Star, Phone, Mail, MapPin, Plus, Edit, Trash2, Check, X, Grid, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster';
import { toast } from '@/components/ui/use-toast';
import ChangePassword from '@/pages/admin/ChangePassword';

// Componentes existentes
import AppointmentForm from '@/components/AppointmentForm';
import ClientForm from '@/components/ClientForm';
import ServiceForm from '@/components/ServiceForm';
import AgendaView from '@/components/AgendaView';
import ClientsView from '@/components/ClientsView';
import ServicesView from '@/components/ServicesView';
import MarketingCarousel from '@/components/MarketingCarousel';
import YearlyCalendarView from '@/components/YearlyCalendarView';
import ProfessionalSelection from './components/ProfessionalSelection';

// Componentes administrativos
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import Login from '@/pages/admin/Login';
import AdminLayout from '@/layouts/AdminLayout';
import Dashboard from '@/pages/admin/Dashboard';
import PendingAppointments from '@/pages/admin/PendingAppointments';
import ApprovedAppointments from '@/pages/admin/ApprovedAppointments';
import QuotesManagement from '@/pages/admin/QuotesManagement';
import PaymentsManagement from '@/pages/admin/PaymentsManagement';
import StaffManagement from '@/pages/admin/StaffManagement';

import { useLocalStorage } from '@/hooks/useLocalStorage';

// ✨ Estilos CSS personalizados para animações
const customStyles = `
  .floating-animation {
    animation: float 3s ease-in-out infinite;
  }
  
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
  }
  
  .glass-effect {
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.15);
  }

  .silk-effect {
    background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.02) 100%);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.1), 0 20px 40px rgba(0,0,0,0.3);
  }

  .glow-pink {
    border: 3px solid #ec4899;
    box-shadow: 
      0 0 10px #ec4899,
      0 0 20px #ec4899,
      0 0 30px #ec4899,
      0 0 40px #ec4899;
    transition: all 0.3s ease;
  }

  .glow-pink:hover {
    border: 3px solid #f472b6;
    box-shadow: 
      0 0 15px #ec4899,
      0 0 30px #ec4899,
      0 0 45px #ec4899,
      0 0 60px #ec4899,
      0 0 75px #ec4899;
  }

  .classic-font {
    font-family: 'Playfair Display', 'Times New Roman', Georgia, serif;
  }

  .title-font {
    font-family: 'Great Vibes', cursive;
  }
`;

// Injetar estilos
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = customStyles;
  document.head.appendChild(styleElement);
  
  // Adicionar Google Fonts para fonte clássica
  const linkElement = document.createElement('link');
  linkElement.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Great+Vibes&display=swap';
  linkElement.rel = 'stylesheet';
  document.head.appendChild(linkElement);
}

// ✨ NOVO: Componente da Homepage Prestige
const PrestigeHomepage = ({ onStartBooking, services }) => {
  const navigationItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'Sobre Nós' },
    { id: 'services', label: 'Serviços' },
    { id: 'gallery', label: 'Galeria' },
    { id: 'contact', label: 'Contato' }
  ];

  const socialLinks = [
    { icon: () => <div className="w-5 h-5 bg-blue-400 rounded"></div>, href: '#' },
    { icon: () => <div className="w-5 h-5 bg-pink-400 rounded"></div>, href: '#' },
    { icon: () => <div className="w-5 h-5 bg-blue-300 rounded"></div>, href: '#' },
    { icon: () => <div className="w-5 h-5 bg-red-400 rounded"></div>, href: '#' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 text-white relative overflow-hidden">
      
      {/* Background Pattern - Efeito Seda */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 via-gray-300/5 to-transparent"></div>
        <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-gradient-radial from-white/5 to-transparent rounded-full blur-3xl"></div>
      </div>

      {/* Hero Background Image - Sutil */}
      <div className="absolute inset-0">
        <div 
          className="w-full h-full bg-cover bg-center bg-no-repeat opacity-20"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1560869713-7d0b29430803?w=1920&h=1080&fit=crop')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-800/90 to-gray-900/95"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        
        {/* Navigation Header */}
        <motion.header 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="container mx-auto px-6 py-8"
        >
          <nav className="flex justify-center">
            <div className="flex space-x-12">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  className="text-sm font-light tracking-wider uppercase transition-all duration-300 text-white/80 hover:text-amber-300"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </nav>
        </motion.header>

        {/* Main Content - Flex grow para ocupar espaço restante */}
        <div className="container mx-auto px-6 flex-grow flex flex-col justify-center">
          
          {/* Logo Section */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-16"
          >
            <div className="mb-8">
              <h1 className="text-7xl md:text-8xl font-normal text-amber-200 mb-2 title-font">
                Fabiane Vieira
              </h1>
              <div className="flex items-center justify-center space-x-4">
                <div className="w-16 h-px bg-gradient-to-r from-transparent to-amber-300"></div>
                <p className="text-amber-300 tracking-[0.3em] uppercase text-sm font-light classic-font">
                  Makeup Hair
                </p>
                <div className="w-16 h-px bg-gradient-to-l from-transparent to-amber-300"></div>
              </div>
            </div>
          </motion.div>

          {/* Mosaico de Quadros */}
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mb-16"
          >
            <div className="max-w-3xl mx-auto">
              {/* Primeira linha - 5 quadros */}
              <div className="grid grid-cols-5 gap-0 mb-0">
                {/* 1. Modelo com cabelo bonito */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  whileHover={{ scale: 1.05 }}
                  className="aspect-square relative overflow-hidden group cursor-pointer"
                >
                  <div 
                    className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                    style={{ backgroundImage: "url('https://i.ibb.co/YTZK2P0X/mechas.jpg')" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent"></div>
                </motion.div>

                {/* 2. Texto "CABELO" */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  whileHover={{ scale: 1.05 }}
                  className="aspect-square bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center cursor-pointer group"
                >
                  <h3 className="text-white font-bold text-xl md:text-2xl uppercase tracking-widest classic-font group-hover:text-amber-300 transition-colors duration-300">
                    CABELO
                  </h3>
                </motion.div>

                {/* 3. Unha com esmalte */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 1.0 }}
                  whileHover={{ scale: 1.05 }}
                  className="aspect-square relative overflow-hidden group cursor-pointer"
                >
                  <div 
                    className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=400&fit=crop')" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent"></div>
                </motion.div>

                {/* 4. Texto "UNHA" */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 1.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="aspect-square bg-gradient-to-br from-pink-800 to-red-900 flex items-center justify-center cursor-pointer group"
                >
                  <h3 className="text-white font-bold text-xl md:text-2xl uppercase tracking-widest classic-font group-hover:text-amber-300 transition-colors duration-300">
                    UNHA
                  </h3>
                </motion.div>

                {/* 5. Mulher bonita */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  whileHover={{ scale: 1.05 }}
                  className="aspect-square relative overflow-hidden group cursor-pointer"
                >
                  <div 
                    className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop')" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent"></div>
                </motion.div>
              </div>

              {/* Segunda linha - 3 quadros centralizados */}
              <div className="grid grid-cols-3 gap-0 max-w-2xl mx-auto">
                {/* 6. Texto "MAQUIAGEM" */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 1.3 }}
                  whileHover={{ scale: 1.05 }}
                  className="aspect-square bg-gradient-to-br from-purple-800 to-indigo-900 flex items-center justify-center cursor-pointer group"
                >
                  <h3 className="text-white font-bold text-lg md:text-xl uppercase tracking-widest classic-font group-hover:text-amber-300 transition-colors duration-300 text-center">
                    MAQUIAGEM
                  </h3>
                </motion.div>

                {/* 7. Noiva */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 1.4 }}
                  whileHover={{ scale: 1.05 }}
                  className="aspect-square relative overflow-hidden group cursor-pointer"
                >
                  <div 
                    className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                    style={{ backgroundImage: "url('https://i.ibb.co/ZRxtR2fm/noiva.jpg')" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent"></div>
                </motion.div>

                {/* 8. Quadro extra para simetria (pode ser removido se preferir) */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 1.5 }}
                  whileHover={{ scale: 1.05 }}
                  className="aspect-square relative overflow-hidden group cursor-pointer"
                >
                  <div 
                    className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&h=400&fit=crop')" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent"></div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Call to Action */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="text-center mb-16"
          >
            <Button
              onClick={onStartBooking}
              size="lg"
              className="bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-900 font-bold px-12 py-4 rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300 classic-font glow-pink"
            >
              <Calendar className="w-5 h-5 mr-3" />
              <span className="font-bold">Agendar Horário</span>
            </Button>
          </motion.div>

        </div>

        {/* Footer */}
        <motion.footer 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="container mx-auto px-6 py-8"
        >
          <div className="flex justify-center space-x-8 mb-6">
            {socialLinks.map((social, index) => {
              const IconComponent = social.icon;
              return (
                <motion.a
                  key={index}
                  href={social.href}
                  whileHover={{ scale: 1.2, y: -2 }}
                  className="hover:text-amber-300 transition-colors duration-300"
                >
                  <IconComponent />
                </motion.a>
              );
            })}
          </div>
          
          <div className="text-center">
            <p className="text-white/60 text-xs tracking-wider classic-font">
              © 2024 • FABIANE VIEIRA • PRIVACY POLICY
            </p>
          </div>
        </motion.footer>

      </div>

      {/* Floating Action Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 2 }}
        className="fixed bottom-6 right-6 z-40"
      >
        <Button
          onClick={onStartBooking}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 shadow-2xl glow-pink"
        >
          <Calendar className="w-6 h-6 text-slate-900" />
        </Button>
      </motion.div>
    </div>
  );
};

// Componente de rota protegida
const ProtectedRoute = ({ children, permission = null, role = null }) => {
  const { isAuthenticated, user, hasPermission, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  if (permission && !hasPermission(permission)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600">
        <div className="bg-white rounded-lg p-8 shadow-xl text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Acesso Negado</h2>
          <p className="text-gray-600 mb-4">Você não tem permissão para acessar esta página.</p>
          <button 
            onClick={() => window.history.back()}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  if (role && user?.role !== role && user?.role !== 'super_admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600">
        <div className="bg-white rounded-lg p-8 shadow-xl text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Acesso Restrito</h2>
          <p className="text-gray-600 mb-4">Esta área é restrita ao seu nível de acesso.</p>
          <button 
            onClick={() => window.history.back()}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return children;
};

// Componente principal do site - NOVO FLUXO COM DESIGN PRESTIGE
const MainSite = () => {
  const [activeTab, setActiveTab] = useState('agenda');
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useLocalStorage('salon-clients', []);
  const [services, setServices] = useLocalStorage('salon-services', []);

  // Estados dos modais e fluxo de agendamento
  const [showNewClient, setShowNewClient] = useState(false);
  const [showNewService, setShowNewService] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [editingClient, setEditingClient] = useState(null);
  const [editingService, setEditingService] = useState(null);
  
  // 🎯 NOVO: Estados do fluxo de agendamento
  const [bookingStep, setBookingStep] = useState('prestige'); // 'prestige', 'professional', 'calendar', 'form'
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  
  const [adminClicks, setAdminClicks] = useState(0);
  const navigate = useNavigate();

  // 🎯 TABS para modo gestão
  const TABS = [
    { id: 'agenda', label: 'Agenda', icon: Calendar },
    { id: 'clientes', label: 'Clientes', icon: User },
    { id: 'servicos', label: 'Serviços', icon: Star }
  ];

  useEffect(() => {
    if (services.length === 0) {
      const defaultServices = [
        { id: 1, name: 'Corte Feminino', duration: 60, price: 80, imageUrl: 'corte-feminino.jpg', description: 'Transforme seu visual com um corte moderno e elegante.' },
        { id: 2, name: 'Corte Masculino', duration: 30, price: 40, imageUrl: 'corte-masculino.jpg', description: 'Estilo e precisão para o homem contemporâneo.' },
        { id: 3, name: 'Coloração', duration: 120, price: 150, imageUrl: 'coloracao.jpg', description: 'Cores vibrantes e duradouras para realçar sua beleza.' },
        { id: 4, name: 'Escova', duration: 45, price: 50, imageUrl: 'escova.jpg', description: 'Cabelos lisos, modelados e com brilho intenso.' },
        { id: 5, name: 'Manicure', duration: 60, price: 35, imageUrl: 'manicure.jpg', description: 'Unhas perfeitas e bem cuidadas para todas as ocasiões.' },
        { id: 6, name: 'Pedicure', duration: 60, price: 40, imageUrl: 'pedicure.jpg', description: 'Pés relaxados e unhas impecáveis.' }
      ];
      setServices(defaultServices);
    }
  }, [services, setServices]);

  // 🎯 NOVO: Funções do fluxo de agendamento
  const startBookingProcess = () => {
    console.log('🚀 Iniciando processo de agendamento');
    setBookingStep('professional');
  };

  const goToManagement = () => {
    console.log('📋 Indo para gestão do salão');
    setBookingStep('home');
  };

  const backToPrestige = () => {
    console.log('🏠 Voltando para homepage Prestige');
    setBookingStep('prestige');
  };

  const handleProfessionalSelected = (professional) => {
    console.log('👤 Profissional selecionado:', professional);
    setSelectedProfessional(professional);
    setBookingStep('calendar');
  };

  const handleDateTimeSelected = (date, time) => {
    console.log('📅 Data e hora selecionadas:', date, time);
    setSelectedDate(date);
    setSelectedTime(time);
    setBookingStep('form');
  };

  const handleBookingComplete = () => {
    console.log('✅ Agendamento concluído');
    resetBookingFlow();
    toast({
      title: "Agendamento realizado!",
      description: `Seu agendamento com ${selectedProfessional?.name} foi registrado.`,
    });
  };

  const resetBookingFlow = () => {
    console.log('🔄 Resetando fluxo de agendamento');
    setBookingStep('prestige'); // ✅ VOLTA PARA HOMEPAGE PRESTIGE
    setSelectedProfessional(null);
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const addAppointment = async (appointmentData) => {
    console.log('💾 Salvando agendamento:', appointmentData);
    
    const id = Date.now();
    const newAppointment = {
      id,
      ...appointmentData,
      professionalId: selectedProfessional?.id,
      professionalName: selectedProfessional?.name,
      status: 'pendente',
      createdAt: new Date().toISOString()
    };

    try {
      const response = await fetch('https://coherent-escargot-23835.upstash.io/', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer AV0bAAIjcDEyODVlMzY0YTk2ODk0M2JkOTRlNmVmMmUzZTQwMDNkMnAxMA',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(["SET", `agendamento:${id}`, JSON.stringify(newAppointment)]),
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      handleBookingComplete();

    } catch (error) {
      console.error('❌ Erro ao salvar agendamento:', error);
      toast({
        title: "Erro!",
        description: "Ocorreu um problema ao salvar seu agendamento.",
        variant: "destructive"
      });
    }
  };

  const updateAppointment = (id, updatedData) => {
    setAppointments(appointments.map(apt => 
      apt.id === id ? { ...apt, ...updatedData } : apt
    ));
    toast({
      title: "Agendamento atualizado!",
      description: "As alterações foram salvas com sucesso.",
    });
  };

  const deleteAppointment = (id) => {
    setAppointments(appointments.filter(apt => apt.id !== id));
    toast({
      title: "Agendamento removido!",
      description: "O agendamento foi removido com sucesso.",
    });
  };

  const addClient = (clientData) => {
    const newClient = {
      id: Date.now(),
      ...clientData
    };
    setClients([...clients, newClient]);
    toast({
      title: "Cliente adicionado!",
      description: "O cliente foi adicionado com sucesso.",
    });
  };

  const updateClient = (id, updatedData) => {
    setClients(clients.map(client => 
      client.id === id ? { ...client, ...updatedData } : client
    ));
    toast({
      title: "Cliente atualizado!",
      description: "As alterações foram salvas com sucesso.",
    });
  };

  const deleteClient = (id) => {
    setClients(clients.filter(client => client.id !== id));
    toast({
      title: "Cliente removido!",
      description: "O cliente foi removido com sucesso.",
    });
  };

  const addService = (serviceData) => {
    const newService = {
      id: Date.now(),
      ...serviceData
    };
    setServices([...services, newService]);
    toast({
      title: "Serviço adicionado!",
      description: "O serviço foi adicionado com sucesso.",
    });
  };

  const updateService = (id, updatedData) => {
    setServices(services.map(service => 
      service.id === id ? { ...service, ...updatedData } : service
    ));
    toast({
      title: "Serviço atualizado!",
      description: "As alterações foram salvas com sucesso.",
    });
  };

  const deleteService = (id) => {
    setServices(services.filter(service => service.id !== id));
    toast({
      title: "Serviço removido!",
      description: "O serviço foi removido com sucesso.",
    });
  };

  const handleAdminAccess = () => {
    setAdminClicks(prev => prev + 1);
    
    setTimeout(() => {
      setAdminClicks(0);
    }, 3000);
    
    if (adminClicks >= 2) {
      const choice = confirm('Escolha uma opção:\n\nOK = Painel Administrativo\nCancelar = Permanecer aqui');
      
      if (choice) {
        navigate('/admin');
      }
      // Se clica Cancelar, não faz nada - permanece onde está
      
      setAdminClicks(0);
    }
  };

  // 🎯 NOVO: Renderizar conteúdo baseado no step do booking
  const renderContent = () => {
    // 🏠 HOMEPAGE PRESTIGE (nova tela inicial)
    if (bookingStep === 'prestige') {
      return (
        <PrestigeHomepage 
          onStartBooking={startBookingProcess}
          services={services}
        />
      );
    }

    // 📋 MODO GESTÃO (antiga home com tabs)
    if (bookingStep === 'home') {
      return (
        <div className="min-h-screen p-4 bg-gradient-to-br from-purple-600 to-blue-600">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <div className="flex items-center justify-center mb-4">
                <div className="floating-animation">
                  <Scissors className="w-12 h-12 text-white mr-4" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-white classic-font">
                  Fabiane Vieira Makeup Hair
                </h1>
              </div>
              <p className="text-xl text-white text-opacity-90">
                Sistema de Gestão
              </p>
              
              {/* Botão para voltar à homepage */}
              <motion.div className="mt-6">
                <Button 
                  onClick={backToPrestige}
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 mr-4"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar à Homepage
                </Button>
                <Button 
                  onClick={startBookingProcess}
                  size="lg"
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <Calendar className="w-6 h-6 mr-3" />
                  Novo Agendamento
                </Button>
              </motion.div>
            </motion.div>

            {/* Marketing Carousel */}
            <MarketingCarousel services={services.filter(s => s.imageUrl)} />

            {/* Navigation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-effect rounded-2xl p-2 mb-8 mt-8"
            >
              <div className="flex flex-wrap gap-2">
                {TABS.map(({ id, label, icon: Icon }) => (
                  <Button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    variant={activeTab === id ? 'default' : 'ghost'}
                    className={`flex-1 min-w-0 ${
                      activeTab === id
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                        : 'text-white hover:bg-white hover:bg-opacity-10'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {label}
                  </Button>
                ))}
              </div>
            </motion.div>

            {/* Content das tabs */}
            <AnimatePresence mode="wait">
              {activeTab === 'agenda' && (
                <AgendaView
                  appointments={appointments}
                  setShowNewAppointment={null}
                  setEditingAppointment={setEditingAppointment}
                  updateAppointment={updateAppointment}
                  deleteAppointment={deleteAppointment}
                  hideNewAppointmentButton={true}
                />
              )}
              {activeTab === 'clientes' && (
                <ClientsView
                  clients={clients}
                  setShowNewClient={setShowNewClient}
                  setEditingClient={setEditingClient}
                  deleteClient={deleteClient}
                />
              )}
              {activeTab === 'servicos' && (
                <ServicesView
                  services={services}
                  setShowNewService={setShowNewService}
                  setEditingService={setEditingService}
                  deleteService={deleteService}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      );
    }

    // Se estiver no fluxo de agendamento
    return (
      <div className="min-h-screen p-4 bg-gradient-to-br from-purple-600 to-blue-600">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Header do fluxo de agendamento */}
            <div className="glass-effect rounded-2xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    onClick={resetBookingFlow}
                    className="text-white hover:text-pink-400 hover:bg-pink-500/10"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                  </Button>
                  
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {bookingStep === 'professional' && 'Escolha o Profissional'}
                      {bookingStep === 'calendar' && `Calendário - ${selectedProfessional?.name}`}
                      {bookingStep === 'form' && 'Finalizar Agendamento'}
                    </h2>
                    <p className="text-gray-300 text-sm">
                      {bookingStep === 'professional' && 'Selecione o especialista ideal para você'}
                      {bookingStep === 'calendar' && 'Escolha a data e horário disponível'}
                      {bookingStep === 'form' && 'Preencha os dados para confirmar'}
                    </p>
                  </div>
                </div>
                
                {/* Indicador de progresso */}
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${bookingStep === 'professional' ? 'bg-pink-500' : 'bg-gray-400'}`} />
                  <div className={`w-3 h-3 rounded-full ${bookingStep === 'calendar' ? 'bg-pink-500' : 'bg-gray-400'}`} />
                  <div className={`w-3 h-3 rounded-full ${bookingStep === 'form' ? 'bg-pink-500' : 'bg-gray-400'}`} />
                </div>
              </div>
            </div>

            {/* Conteúdo do step atual */}
            {bookingStep === 'professional' && (
              <ProfessionalSelection 
                onProfessionalSelected={handleProfessionalSelected}
                onCancel={resetBookingFlow}
                isModal={false}
              />
            )}

            {bookingStep === 'calendar' && selectedProfessional && (
              <div className="glass-effect rounded-2xl p-6">
                <YearlyCalendarView
                  appointments={appointments.filter(apt => apt.professionalId === selectedProfessional.id)}
                  services={services}
                  professionalId={selectedProfessional.id}
                  professionalName={selectedProfessional.name}
                  onDateTimeSelect={handleDateTimeSelected}
                  showOnlyThisProfessional={true}
                  hideNewAppointmentButton={true}
                  hideProfessionalSelector={true}
                  bookingMode={true}
                />
              </div>
            )}

            {bookingStep === 'form' && selectedProfessional && selectedDate && (
              <div className="glass-effect rounded-2xl p-6">
                <div className="max-w-2xl mx-auto">
                  <AppointmentForm
                    services={services}
                    selectedProfessional={selectedProfessional}
                    selectedDate={selectedDate}
                    selectedTime={selectedTime}
                    onSave={handleBookingComplete}
                    onCancel={resetBookingFlow}
                    addAppointment={addAppointment}
                    isModal={false}
                  />
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${bookingStep === 'prestige' ? '' : 'p-4'}`}>
      <div className={`${bookingStep === 'prestige' ? '' : 'max-w-7xl mx-auto'}`}>
        {/* Content baseado no step atual */}
        {renderContent()}

        {/* Modais - apenas para edição */}
        <AnimatePresence>
          {editingAppointment && (
            <AppointmentForm
              services={services}
              appointment={editingAppointment}
              onSave={() => {
                setEditingAppointment(null);
              }}
              onCancel={() => {
                setEditingAppointment(null);
              }}
              updateAppointment={updateAppointment}
              isModal={true}
            />
          )}
          
          {showNewClient && (
            <ClientForm
              onSave={() => {
                setShowNewClient(false);
                setEditingClient(null);
              }}
              onCancel={() => {
                setShowNewClient(false);
                setEditingClient(null);
              }}
              addClient={addClient}
            />
          )}
          
          {editingClient && (
            <ClientForm
              client={editingClient}
              onSave={() => {
                setShowNewClient(false);
                setEditingClient(null);
              }}
              onCancel={() => {
                setShowNewClient(false);
                setEditingClient(null);
              }}
              updateClient={updateClient}
            />
          )}
          
          {showNewService && (
            <ServiceForm
              onSave={() => {
                setShowNewService(false);
                setEditingService(null);
              }}
              onCancel={() => {
                setShowNewService(false);
                setEditingService(null);
              }}
              addService={addService}
            />
          )}
          
          {editingService && (
            <ServiceForm
              service={editingService}
              onSave={() => {
                setShowNewService(false);
                setEditingService(null);
              }}
              onCancel={() => {
                setShowNewService(false);
                setEditingService(null);
              }}
              updateService={updateService}
            />
          )}
        </AnimatePresence>

        {/* Botão discreto para acesso administrativo/gestão */}
        <div 
          className="fixed bottom-4 left-4 opacity-5 hover:opacity-100 transition-opacity duration-500 cursor-pointer z-50"
          onClick={handleAdminAccess}
          title="Acesso administrativo/gestão"
        >
          <div className="w-3 h-3 bg-white rounded-full"></div>
        </div>
      </div>
      
      {/* Toaster sempre disponível */}
      <Toaster />
    </div>
  );
};

// Componente de redirecionamento para admin
const AdminRedirect = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Navigate to="/admin/dashboard" replace />;
};

// Componente principal da aplicação
const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainSite />} />
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin" element={<AdminRedirect />} />
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <Dashboard />
                </AdminLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/pending" 
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <PendingAppointments />
                </AdminLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/approved" 
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <ApprovedAppointments />
                </AdminLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/quotes" 
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <QuotesManagement />
                </AdminLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/payments" 
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <PaymentsManagement />
                </AdminLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/staff" 
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <StaffManagement />
                </AdminLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/change-password" 
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <ChangePassword />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;