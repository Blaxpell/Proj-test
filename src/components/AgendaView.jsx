// src/components/AgendaView.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Plus, Edit, Trash2, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AgendaView = ({ 
  appointments, 
  setShowNewAppointment, 
  setEditingAppointment, 
  updateAppointment, 
  deleteAppointment,
  hideNewAppointmentButton = false // ✅ NOVA PROP
}) => {
  return (
    <motion.div
      key="agenda"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="glass-effect rounded-2xl p-6"
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Agenda</h2>
          <p className="text-gray-300">Visualize os agendamentos realizados</p>
        </div>
        
        {/* 🚫 CONDICIONAL: Só mostra botão se não for para ocultar */}
        {!hideNewAppointmentButton && setShowNewAppointment && (
          <Button
            onClick={() => setShowNewAppointment()}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Agendamento
          </Button>
        )}
      </div>

      {/* Lista de agendamentos */}
      <div className="space-y-4">
        {appointments.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Nenhum agendamento encontrado</p>
            {!hideNewAppointmentButton && (
              <p className="text-gray-500 text-sm mt-2">
                Clique em "Novo Agendamento" para criar o primeiro
              </p>
            )}
          </div>
        ) : (
          appointments.map((appointment) => (
            <motion.div
              key={appointment.id}
              whileHover={{ scale: 1.02 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-white">{appointment.clientName}</h3>
                    <div className="flex items-center text-gray-300 text-sm">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{appointment.date} às {appointment.time}</span>
                    </div>
                    <p className="text-gray-400 text-sm">{appointment.service}</p>
                    {appointment.professionalName && (
                      <p className="text-purple-300 text-sm">
                        📋 Com: {appointment.professionalName}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    appointment.status === 'aprovado' 
                      ? 'bg-green-500/20 text-green-300'
                      : appointment.status === 'pendente'
                      ? 'bg-yellow-500/20 text-yellow-300'
                      : 'bg-red-500/20 text-red-300'
                  }`}>
                    {appointment.status}
                  </span>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingAppointment(appointment)}
                    className="text-white hover:text-pink-400 hover:bg-pink-500/10"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteAppointment(appointment.id)}
                    className="text-white hover:text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default AgendaView;