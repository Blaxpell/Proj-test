import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';

const ClientForm = ({ client, onSave, onCancel, addClient, updateClient }) => {
  const [formData, setFormData] = useState({
    name: client?.name || '',
    phone: client?.phone || '',
    email: client?.email || '',
    address: client?.address || '',
    notes: client?.notes || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (client) {
      updateClient(client.id, formData);
    } else {
      addClient(formData);
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
          {client ? 'Editar Cliente' : 'Novo Cliente'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white text-sm font-medium mb-2">Nome</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-70 border border-white border-opacity-30"
              placeholder="Nome completo"
              required
            />
          </div>
          <div>
            <label className="block text-white text-sm font-medium mb-2">Telefone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-70 border border-white border-opacity-30"
              placeholder="(11) 99999-9999"
              required
            />
          </div>
          <div>
            <label className="block text-white text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-70 border border-white border-opacity-30"
              placeholder="email@exemplo.com"
            />
          </div>
          <div>
            <label className="block text-white text-sm font-medium mb-2">Endereço</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-70 border border-white border-opacity-30"
              placeholder="Endereço completo"
            />
          </div>
          <div>
            <label className="block text-white text-sm font-medium mb-2">Observações</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-70 border border-white border-opacity-30"
              placeholder="Observações sobre o cliente..."
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

export default ClientForm;