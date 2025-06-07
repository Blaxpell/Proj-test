import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';

const ServiceForm = ({ service, onSave, onCancel, addService, updateService }) => {
  const [formData, setFormData] = useState({
    name: service?.name || '',
    duration: service?.duration || '',
    price: service?.price || '',
    description: service?.description || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (service) {
      updateService(service.id, formData);
    } else {
      addService(formData);
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
          {service ? 'Editar Serviço' : 'Novo Serviço'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white text-sm font-medium mb-2">Nome do Serviço</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-70 border border-white border-opacity-30"
              placeholder="Ex: Corte Feminino"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">Duração (min)</label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                className="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-70 border border-white border-opacity-30"
                placeholder="60"
                required
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">Preço (R$)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                className="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-70 border border-white border-opacity-30"
                placeholder="80.00"
                step="0.01"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-white text-sm font-medium mb-2">Descrição</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-70 border border-white border-opacity-30"
              placeholder="Descrição do serviço..."
              rows="3"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
              <Check className="w-4 h-4 mr-2" />
              Salvar
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

export default ServiceForm;