import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, User, Scissors, Star, Phone, Mail, MapPin, Plus, Edit, Trash2, Check, X, Grid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster';
import { toast } from '@/components/ui/use-toast';
import AppointmentForm from '@/components/AppointmentForm';
import ClientForm from '@/components/ClientForm';
import ServiceForm from '@/components/ServiceForm';
import AgendaView from '@/components/AgendaView';
import ClientsView from '@/components/ClientsView';
import ServicesView from '@/components/ServicesView';
import MarketingCarousel from '@/components/MarketingCarousel';
import YearlyCalendarView from '@/components/YearlyCalendarView';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const App = () => {
  const [activeTab, setActiveTab] = useState('agenda');
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useLocalStorage('salon-clients', []);
  const [services, setServices] = useLocalStorage('salon-services', []);

  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [showNewClient, setShowNewClient] = useState(false);
  const [showNewService, setShowNewService] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [editingClient, setEditingClient] = useState(null);
  const [editingService, setEditingService] = useState(null);

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

  // VERSÃO DEBUG - substitua temporariamente a função addAppointment no App.jsx

// VERSÃO DEBUG - substitua temporariamente a função addAppointment no App.jsx

// VERSÃO DEBUG - substitua temporariamente a função addAppointment no App.jsx

// VERSÃO DEBUG - substitua temporariamente a função addAppointment no App.jsx

// VERSÃO DEBUG - substitua temporariamente a função addAppointment no App.jsx

const addAppointment = async (appointmentData) => {
  console.log('🚀 === INICIANDO SALVAMENTO ===');
  console.log('📥 Dados recebidos:', appointmentData);
  
  const id = Date.now();
  console.log('🔢 ID gerado:', id);

  const newAppointment = {
    id,
    ...appointmentData,
    status: 'pendente', // GARANTIR que seja pendente
    createdAt: new Date().toISOString()
  };
  
  console.log('📦 Objeto completo a ser salvo:', newAppointment);
  console.log('🔑 Chave que será usada:', `agendamento:${id}`);

  try {
    console.log('📡 Enviando para Upstash...');
    
    const response = await fetch('https://coherent-escargot-23835.upstash.io/', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer AV0bAAIjcDEyODVlMzY0YTk2ODk0M2JkOTRlNmVmMmUzZTQwMDNkMnAxMA',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(["SET", `agendamento:${id}`, JSON.stringify(newAppointment)]),
    });

    console.log('📊 Response status:', response.status);
    console.log('📊 Response ok:', response.ok);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro na resposta:', errorText);
      throw new Error(`Erro HTTP: ${response.status} - ${errorText}`);
    }
    
    const responseData = await response.json();
    console.log('✅ Resposta do servidor:', responseData);

    // TESTE: Verificar se foi salvo imediatamente
    console.log('🔍 Verificando se foi salvo...');
    setTimeout(async () => {
      try {
        const verifyResponse = await fetch('https://coherent-escargot-23835.upstash.io/', {
          method: 'POST',
          headers: {
            Authorization: 'Bearer AV0bAAIjcDEyODVlMzY0YTk2ODk0M2JkOTRlNmVmMmUzZTQwMDNkMnAxMA',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(["GET", `agendamento:${id}`]),
        });
        
        if (verifyResponse.ok) {
          const verifyData = await verifyResponse.json();
          console.log('🔍 Verificação - dados encontrados:', verifyData);
          
          if (verifyData.result) {
            const savedData = JSON.parse(verifyData.result);
            console.log('✅ Agendamento foi salvo corretamente:', savedData);
          } else {
            console.log('❌ Agendamento não foi encontrado na verificação');
          }
        } else {
          const errorText = await verifyResponse.text();
          console.error('❌ Erro na verificação:', verifyResponse.status, errorText);
        }
      } catch (verifyError) {
        console.error('❌ Erro na verificação:', verifyError);
      }
    }, 1000); // Verificar após 1 segundo

    toast({
      title: "Solicitação enviada!",
      description: `Agendamento ${id} registrado e aguardando aprovação.`,
    });

  } catch (error) {
    console.error('❌ Erro completo:', error);
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

  const TABS = [
    { id: 'agenda', label: 'Agenda', icon: Calendar },
    { id: 'calendarioAnual', label: 'Calendário Anual', icon: Grid },
    { id: 'clientes', label: 'Clientes', icon: User },
    { id: 'servicos', label: 'Serviços', icon: Star }
  ];

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
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
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Fabiane Vieira Makeup Hair
            </h1>
          </div>
          <p className="text-xl text-white text-opacity-90">
            Sistema de Agendamento
          </p>
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

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'agenda' && (
            <AgendaView
              appointments={appointments}
              setShowNewAppointment={setShowNewAppointment}
              setEditingAppointment={setEditingAppointment}
              updateAppointment={updateAppointment}
              deleteAppointment={deleteAppointment}
            />
          )}
          {activeTab === 'calendarioAnual' && (
            <YearlyCalendarView
              appointments={appointments}
              services={services}
              setShowNewAppointment={setShowNewAppointment}
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

        {/* Modals */}
        <AnimatePresence>
          {showNewAppointment && (
            <AppointmentForm
              services={services}
              onSave={() => {
                setShowNewAppointment(false);
                setEditingAppointment(null);
              }}
              onCancel={() => {
                setShowNewAppointment(false);
                setEditingAppointment(null);
              }}
              addAppointment={addAppointment}
            />
          )}
          {editingAppointment && (
            <AppointmentForm
              services={services}
              appointment={editingAppointment}
              onSave={() => {
                setShowNewAppointment(false);
                setEditingAppointment(null);
              }}
              onCancel={() => {
                setShowNewAppointment(false);
                setEditingAppointment(null);
              }}
              updateAppointment={updateAppointment}
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
      </div>
      <Toaster />
    </div>
  );
};

export default App;