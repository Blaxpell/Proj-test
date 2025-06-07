import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ServicesView = ({ services, setShowNewService, setEditingService, deleteService }) => {
  return (
    <motion.div
      key="servicos"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Serviços</h2>
        <Button
          onClick={() => setShowNewService(true)}
          className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 pulse-glow"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Serviço
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="service-card rounded-2xl p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-white">{service.name}</h3>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingService(service)}
                  className="text-white hover:bg-white hover:bg-opacity-10 p-2"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteService(service.id)}
                  className="text-red-300 hover:bg-red-500 hover:bg-opacity-20 p-2"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2 text-white text-opacity-80">
              <div className="flex justify-between">
                <span>Duração:</span>
                <span>{service.duration} min</span>
              </div>
              <div className="flex justify-between">
                <span>Preço:</span>
                <span className="font-bold text-green-300">R$ {service.price.toFixed(2)}</span>
              </div>
              {service.description && (
                <p className="text-white text-opacity-70 mt-2 text-sm">
                  {service.description}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ServicesView;