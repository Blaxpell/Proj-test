import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, X, User, Phone, Calendar, Clock, Scissors, MessageSquare, Sparkles, Star } from 'lucide-react';

const AppointmentForm = ({ 
  appointment, 
  services, 
  onSave, 
  onCancel, 
  addAppointment, 
  updateAppointment,
  selectedProfessional,
  selectedDate,
  selectedTime,
  isModal = true  // ✅ NOVO: prop para controlar se é modal ou inline
}) => {
  const [formData, setFormData] = useState({
    clientName: appointment?.clientName || '',
    clientPhone: appointment?.clientPhone || '',
    service: appointment?.service || '',
    date: appointment?.date || selectedDate || '',
    time: appointment?.time || selectedTime || '',
    notes: appointment?.notes || ''
  });

  const selectedService = services.find(s => s.name === formData.service);

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

  // ✅ NOVO: Renderização condicional baseada em isModal
  const formContent = (
    <div className={`relative overflow-hidden glass-effect backdrop-blur-xl border-white/30 rounded-3xl p-8 w-full ${isModal ? 'max-w-md' : 'max-w-2xl mx-auto'}`}>
      
      {/* ✨ Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-400 to-indigo-600 rounded-full blur-2xl"></div>
      </div>

      {/* ✨ Header Estiloso */}
      <div className="relative text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full mb-4 shadow-lg"
        >
          <Sparkles className="w-8 h-8 text-white" />
        </motion.div>
        
        <h3 className="text-2xl font-bold text-white mb-2">
          {appointment ? 'Editar Agendamento' : '✨ Novo Agendamento'}
        </h3>
        
        <p className="text-white/80 text-sm">
          Preencha os dados para confirmar sua reserva
        </p>
      </div>
      
      {/* ✅ NOVO: Mostrar informações do profissional selecionado quando não for modal */}
      {!isModal && selectedProfessional && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect border border-white/20 rounded-2xl p-6 mb-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-300/30 to-pink-300/30 rounded-full blur-xl"></div>
          
          <div className="relative">
            {/* Header com ícone */}
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-white text-lg">Profissional Selecionado</h4>
                <p className="text-white/80 text-sm">Conheça seu especialista</p>
              </div>
            </div>

            {/* Foto e Biografia lado a lado */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Coluna da Foto */}
              <div className="md:col-span-1">
                <div className="relative">
                  {selectedProfessional.photo ? (
                    <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-gray-700 to-gray-800 shadow-xl">
                      <img
                        src={selectedProfessional.photo}
                        alt={selectedProfessional.name}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.nextSibling.style.display = 'flex';
                        }}
                      />
                      {/* Overlay sutil */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                  ) : null}
                  
                  {/* Fallback quando não há foto */}
                  <div 
                    className="w-full aspect-square bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl"
                    style={{ display: selectedProfessional?.photo ? 'none' : 'flex' }}
                  >
                    <div className="text-center text-white">
                      <User className="w-16 h-16 mx-auto mb-3 opacity-80" />
                      <p className="text-sm font-medium opacity-90">Foto em breve</p>
                    </div>
                  </div>

                  {/* Badge com especialidade principal */}
                  <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-full text-xs font-semibold shadow-lg">
                      {selectedProfessional.category || 'Especialista'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Coluna da Biografia */}
              <div className="md:col-span-2 space-y-4">
                {/* Nome */}
                <div>
                  <h5 className="text-2xl font-bold text-white mb-1">{selectedProfessional.name}</h5>
                  <p className="text-white/70 text-sm">{selectedProfessional.category || 'Profissional'}</p>
                  
                  {/* Instagram */}
                  {selectedProfessional.email && (
                    <div className="flex items-center space-x-2 mt-2">
                      <div className="w-5 h-5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                      </div>
                      <a 
                        href={`https://instagram.com/${selectedProfessional.email.replace('@', '').replace(/[^a-zA-Z0-9._]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-pink-300 font-medium text-sm hover:text-pink-200 transition-colors duration-200"
                      >
                        @{selectedProfessional.email.replace('@', '').replace(/[^a-zA-Z0-9._]/g, '')}
                      </a>
                    </div>
                  )}
                </div>

                {/* Especialidades */}
                {selectedProfessional.specialties && (
                  <div>
                    <h6 className="text-white font-semibold mb-2 flex items-center">
                      <Star className="w-4 h-4 text-pink-300 mr-2" />
                      Especialidades
                    </h6>
                    <div className="flex flex-wrap gap-2">
                      {(Array.isArray(selectedProfessional.specialties) 
                        ? selectedProfessional.specialties 
                        : selectedProfessional.specialties.split(',')
                      ).map((specialty, index) => (
                        <span 
                          key={index}
                          className="bg-white/10 text-white/90 px-3 py-1 rounded-full text-sm font-medium border border-white/20"
                        >
                          {specialty.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Biografia - com diferentes possibilidades de campo */}
                {(selectedProfessional.biography || selectedProfessional.bio || selectedProfessional.description) && (
                  <div>
                    <h6 className="text-white font-semibold mb-3 flex items-center">
                      <User className="w-4 h-4 text-blue-300 mr-2" />
                      Sobre o Profissional
                    </h6>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <p className="text-white/80 leading-relaxed text-sm">
                        {selectedProfessional.biography || selectedProfessional.bio || selectedProfessional.description}
                      </p>
                    </div>
                  </div>
                )}

                {/* Informações adicionais */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedProfessional.experience && (
                    <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-white/70 text-xs font-medium">EXPERIÊNCIA</span>
                      </div>
                      <p className="text-white font-semibold">{selectedProfessional.experience}</p>
                    </div>
                  )}
                  
                  {selectedProfessional.price && (
                    <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        <span className="text-white/70 text-xs font-medium">A PARTIR DE</span>
                      </div>
                      <p className="text-white font-semibold text-lg">{selectedProfessional.price}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ✅ NOVO: Mostrar data/hora selecionadas quando não for modal */}
      {!isModal && (selectedDate || selectedTime) && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-effect border border-white/20 rounded-2xl p-6 mb-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-green-300/30 to-emerald-300/30 rounded-full blur-xl"></div>
          <div className="relative">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-white text-lg">Data e Horário</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {selectedDate && (
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-green-300" />
                  <p className="text-white/90 font-semibold">
                    {new Date(selectedDate).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              )}
              {selectedTime && (
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-green-300" />
                  <p className="text-white/90 font-semibold">{selectedTime}</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 relative">
        {/* ✨ Nome do Cliente */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <label className="flex items-center space-x-2 text-white text-sm font-semibold mb-3">
            <User className="w-4 h-4" />
            <span>Nome do Cliente</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.clientName}
              onChange={(e) => setFormData({...formData, clientName: e.target.value})}
              className="w-full p-4 rounded-xl transition-all duration-300 bg-white/10 text-white placeholder-white/70 border border-white/30 focus:border-white/60 focus:bg-white/20 backdrop-blur-sm focus:scale-105 transform"
              placeholder="Digite o nome completo"
              required
            />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/5 to-pink-500/5 pointer-events-none"></div>
          </div>
        </motion.div>
        
        {/* ✨ Telefone */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="relative"
        >
          <label className="flex items-center space-x-2 text-white text-sm font-semibold mb-3">
            <Phone className="w-4 h-4" />
            <span>WhatsApp</span>
          </label>
          <div className="relative">
            <input
              type="tel"
              value={formData.clientPhone}
              onChange={(e) => setFormData({...formData, clientPhone: e.target.value})}
              className="w-full p-4 rounded-xl transition-all duration-300 bg-white/10 text-white placeholder-white/70 border border-white/30 focus:border-white/60 focus:bg-white/20 backdrop-blur-sm focus:scale-105 transform"
              placeholder="(11) 99999-9999"
              required
            />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-500/5 to-blue-500/5 pointer-events-none"></div>
          </div>
        </motion.div>
        
        {/* ✨ Serviço */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="relative"
        >
          <label className="flex items-center space-x-2 text-white text-sm font-semibold mb-3">
            <Scissors className="w-4 h-4" />
            <span>Tipo de Serviço</span>
          </label>
          <div className="relative">
            <select
              value={formData.service}
              onChange={(e) => setFormData({...formData, service: e.target.value})}
              className="w-full p-4 rounded-xl transition-all duration-300 bg-white/10 text-white border border-white/30 focus:border-white/60 focus:bg-white/20 backdrop-blur-sm focus:scale-105 transform cursor-pointer"
              required
            >
              <option value="" className="text-gray-800 bg-gray-100">Escolha o serviço desejado</option>
              {services.map(service => (
                <option key={service.id} value={service.name} className="text-gray-800 bg-gray-100 p-2">
                  {service.name} - {service.duration} min - R$ {service.price}
                </option>
              ))}
            </select>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/5 to-pink-500/5 pointer-events-none"></div>
          </div>
        </motion.div>
        
        {/* ✨ Data e Hora em Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Data */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="relative"
          >
            <label className="flex items-center space-x-2 text-white text-sm font-semibold mb-3">
              <Calendar className="w-4 h-4" />
              <span>Data</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className={`w-full p-4 rounded-xl transition-all duration-300 bg-white/10 text-white border border-white/30 focus:border-white/60 focus:bg-white/20 backdrop-blur-sm focus:scale-105 transform ${(!isModal && selectedDate) ? 'opacity-75' : ''}`}
                required
                readOnly={!isModal && selectedDate} // ✅ NOVO: readonly se já foi selecionada
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-indigo-500/5 pointer-events-none"></div>
            </div>
          </motion.div>

          {/* Hora */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="relative"
          >
            <label className="flex items-center space-x-2 text-white text-sm font-semibold mb-3">
              <Clock className="w-4 h-4" />
              <span>Horário</span>
            </label>
            <div className="relative">
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
                className={`w-full p-4 rounded-xl transition-all duration-300 bg-white/10 text-white border border-white/30 focus:border-white/60 focus:bg-white/20 backdrop-blur-sm focus:scale-105 transform ${(!isModal && selectedTime) ? 'opacity-75' : ''}`}
                required
                readOnly={!isModal && selectedTime} // ✅ NOVO: readonly se já foi selecionada
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/5 to-teal-500/5 pointer-events-none"></div>
            </div>
          </motion.div>
        </div>
        
        {/* ✨ Resumo do Serviço Selecionado */}
        {selectedService && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
            className="relative rounded-2xl p-6 glass-effect border border-white/20"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <h4 className="font-bold text-lg text-white">
                Resumo do Serviço
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-white/90">
                <p className="text-sm font-medium opacity-75">Serviço</p>
                <p className="font-bold">{selectedService.name}</p>
              </div>
              <div className="text-white/90">
                <p className="text-sm font-medium opacity-75">Duração</p>
                <p className="font-bold">{selectedService.duration} minutos</p>
              </div>
              <div className="text-white/90">
                <p className="text-sm font-medium opacity-75">Valor</p>
                <p className="font-bold text-lg">R$ {selectedService.price}</p>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* ✨ Observações */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
          className="relative"
        >
          <label className="flex items-center space-x-2 text-white text-sm font-semibold mb-3">
            <MessageSquare className="w-4 h-4" />
            <span>Observações (Opcional)</span>
          </label>
          <div className="relative">
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full p-4 rounded-xl transition-all duration-300 resize-none bg-white/10 text-white placeholder-white/70 border border-white/30 focus:border-white/60 focus:bg-white/20 backdrop-blur-sm focus:scale-105 transform"
              placeholder="Alguma preferência ou observação especial?"
              rows="4"
            />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500/5 to-red-500/5 pointer-events-none"></div>
          </div>
        </motion.div>
        
        {/* ✨ Botões de Ação */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="flex gap-4 pt-6"
        >
          <Button 
            type="submit" 
            className="flex-1 h-14 text-lg font-bold rounded-xl shadow-xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-600 hover:from-pink-600 hover:via-purple-600 hover:to-pink-700 text-white shadow-pink-500/25"
          >
            <Check className="w-5 h-5 mr-3" />
            {appointment ? 'Atualizar Agendamento' : 'Confirmar Agendamento'}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel} 
            className="flex-1 h-14 text-lg font-bold rounded-xl transition-all duration-300 transform hover:scale-105 border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 backdrop-blur-sm"
          >
            <X className="w-5 h-5 mr-3" />
            Cancelar
          </Button>
        </motion.div>
      </form>
    </div>
  );

  // ✅ NOVO: Renderização condicional do container
  if (isModal) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      >
        {formContent}
      </motion.div>
    );
  }

  // ✅ NOVO: Renderização inline para o novo fluxo
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full"
    >
      {formContent}
    </motion.div>
  );
};

export default AppointmentForm;