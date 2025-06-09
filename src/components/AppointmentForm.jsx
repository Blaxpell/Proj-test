import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';

const AppointmentForm = ({ appointment, services, onSave, onCancel, addAppointment, updateAppointment }) => {
  const [formData, setFormData] = useState({
    clientName: appointment?.clientName || '',
    clientPhone: appointment?.clientPhone || '',
    service: appointment?.service || '',
    date: appointment?.date || '',
    time: appointment?.time || '', // MUDANÇA: usar 'time' em vez de 'startTime'
    endTime: appointment?.endTime || '',
    notes: appointment?.notes || ''
  });

  const selectedService = services.find(s => s.name === formData.service);

  useEffect(() => {
    if (selectedService && formData.time && selectedService.duration) {
      const [hours, minutes] = formData.time.split(':').map(Number);
      const startDate = new Date();
      startDate.setHours(hours, minutes, 0, 0);
      
      const endDate = new Date(startDate.getTime() + selectedService.duration * 60000);
      
      const endHours = String(endDate.getHours()).padStart(2, '0');
      const endMinutes = String(endDate.getMinutes()).padStart(2, '0');
      setFormData(prev => ({ ...prev, endTime: `${endHours}:${endMinutes}` }));
    } else if (!selectedService || !formData.time) {
       setFormData(prev => ({ ...prev, endTime: '' }));
    }
  }, [formData.time, formData.service, services, selectedService]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Debug: verificar dados antes de enviar
    console.log('📝 Dados do formulário:', formData);
    
    // Criar objeto padronizado
    const appointmentData = {
      clientName: formData.clientName,
      clientPhone: formData.clientPhone,
      service: formData.service,
      date: formData.date,
      time: formData.time,
      endTime: formData.endTime,
      notes: formData.notes,
      servicePrice: selectedService?.price || 0,
      serviceDuration: selectedService?.duration || 0,
      status: 'pendente' // IMPORTANTE: garantir que sempre seja 'pendente'
    };
    
    console.log('📤 Enviando agendamento:', appointmentData);
    
    if (appointment) {
      updateAppointment(appointment.id, appointmentData);
    } else {
      addAppointment(appointmentData);
    }
    
    onSave();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <div className="glass-effect rounded-2xl p-6 w-full max-w-md">
        <h3 className="text-xl font-bold text-white mb-4">
          {appointment ? 'Editar Agendamento' : 'Novo Agendamento'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white text-sm font-medium mb-2">Nome do Cliente</label>
            <input
              type="text"
              value={formData.clientName}
              onChange={(e) => setFormData({...formData, clientName: e.target.value})}
              className="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-70 border border-white border-opacity-30"
              placeholder="Digite o nome do cliente"
              required
            />
          </div>
          
          <div>
            <label className="block text-white text-sm font-medium mb-2">Telefone</label>
            <input
              type="tel"
              value={formData.clientPhone}
              onChange={(e) => setFormData({...formData, clientPhone: e.target.value})}
              className="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-70 border border-white border-opacity-30"
              placeholder="(11) 99999-9999"
              required
            />
          </div>
          
          <div>
            <label className="block text-white text-sm font-medium mb-2">Serviço</label>
            <select
              value={formData.service}
              onChange={(e) => setFormData({...formData, service: e.target.value})}
              className="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white border border-white border-opacity-30"
              required
            >
              <option value="" className="text-gray-800">Selecione um serviço</option>
              {services.map(service => (
                <option key={service.id} value={service.name} className="text-gray-800">
                  {service.name} - {service.duration} min - R$ {service.price}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-white text-sm font-medium mb-2">Data</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white border border-white border-opacity-30"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">Hora Início</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
                className="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white border border-white border-opacity-30"
                required
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">Hora Fim</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                className="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white border border-white border-opacity-30"
                readOnly={!!selectedService?.duration} 
                required
              />
            </div>
          </div>
          
          {selectedService && (
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-white/80 text-sm">
                <strong>Serviço:</strong> {selectedService.name}
              </p>
              <p className="text-white/80 text-sm">
                <strong>Duração:</strong> {selectedService.duration} minutos
              </p>
              <p className="text-white/80 text-sm">
                <strong>Preço:</strong> R$ {selectedService.price}
              </p>
            </div>
          )}
          
          <div>
            <label className="block text-white text-sm font-medium mb-2">Observações</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-70 border border-white border-opacity-30"
              placeholder="Observações adicionais..."
              rows="3"
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
              <Check className="w-4 h-4 mr-2" />
              {appointment ? 'Atualizar' : 'Solicitar Agendamento'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1 border-white border-opacity-30 text-white hover:bg-white hover:bg-opacity-10">
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default AppointmentForm;