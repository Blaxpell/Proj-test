import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Scissors, Phone, Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AgendaView = ({ appointments, setShowNewAppointment, setEditingAppointment, updateAppointment, deleteAppointment }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Data inválida';
    const dateParts = dateString.split('-');
    if (dateParts.length !== 3) return 'Data inválida';
    const [year, month, day] = dateParts;
    const date = new Date(year, month - 1, day);
    if (isNaN(date.getTime())) {
      return 'Data inválida';
    }
    return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-500';
      case 'agendado': return 'bg-blue-500';
      case 'confirmado': return 'bg-green-500';
      case 'cancelado': return 'bg-red-500';
      case 'concluido': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <motion.div
      key="agenda"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Agendamentos</h2>
        <Button
          onClick={() => setShowNewAppointment(true)}
          className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 pulse-glow"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Agendamento
        </Button>
      </div>

      <div className="grid gap-4">
        {appointments.length === 0 ? (
          <div className="appointment-card rounded-2xl p-8 text-center">
            <Calendar className="w-16 h-16 text-white text-opacity-50 mx-auto mb-4" />
            <p className="text-white text-opacity-70 text-lg">
              Nenhum agendamento encontrado
            </p>
            <p className="text-white text-opacity-50">
              Clique em "Novo Agendamento" para começar
            </p>
          </div>
        ) : (
          appointments.map((appointment) => (
            <motion.div
              key={appointment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="appointment-card rounded-2xl p-6"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start mb-4">
                <div className="flex-1 mb-4 sm:mb-0">
                  <h3 className="text-xl font-bold text-white mb-2">
                    {appointment.clientName}
                  </h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-white text-opacity-80">
                    <div className="flex items-center">
                      <Scissors className="w-4 h-4 mr-2" />
                      {appointment.service}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(appointment.date)}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      {formatTime(appointment.startTime)} {appointment.endTime ? `- ${formatTime(appointment.endTime)}` : ''}
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2" />
                      {appointment.clientPhone}
                    </div>
                  </div>
                  {appointment.notes && (
                    <p className="text-white text-opacity-70 mt-2 text-sm">
                      {appointment.notes}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(appointment.status)} flex-shrink-0`}></div>
                  <select
                    value={appointment.status}
                    onChange={(e) => updateAppointment(appointment.id, { status: e.target.value })}
                    className="bg-white bg-opacity-20 text-white rounded-lg px-3 py-1 text-sm border border-white border-opacity-30 appearance-none"
                  >
                    <option value="pendente" className="text-gray-800">Pendente</option>
                    <option value="agendado" className="text-gray-800">Agendado</option>
                    <option value="confirmado" className="text-gray-800">Confirmado</option>
                    <option value="concluido" className="text-gray-800">Concluído</option>
                    <option value="cancelado" className="text-gray-800">Cancelado</option>
                  </select>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingAppointment(appointment)}
                    className="text-white hover:bg-white hover:bg-opacity-10 p-2"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteAppointment(appointment.id)}
                    className="text-red-300 hover:bg-red-500 hover:bg-opacity-20 p-2"
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
