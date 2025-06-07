import React from 'react';
import { motion } from 'framer-motion';
import { User, Phone, Mail, MapPin, Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ClientsView = ({ clients, setShowNewClient, setEditingClient, deleteClient }) => {
  return (
    <motion.div
      key="clientes"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Clientes</h2>
        <Button
          onClick={() => setShowNewClient(true)}
          className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 pulse-glow"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {clients.length === 0 ? (
          <div className="col-span-full appointment-card rounded-2xl p-8 text-center">
            <User className="w-16 h-16 text-white text-opacity-50 mx-auto mb-4" />
            <p className="text-white text-opacity-70 text-lg">
              Nenhum cliente cadastrado
            </p>
            <p className="text-white text-opacity-50">
              Clique em "Novo Cliente" para começar
            </p>
          </div>
        ) : (
          clients.map((client) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="service-card rounded-2xl p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-white">{client.name}</h3>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingClient(client)}
                    className="text-white hover:bg-white hover:bg-opacity-10 p-2"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteClient(client.id)}
                    className="text-red-300 hover:bg-red-500 hover:bg-opacity-20 p-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2 text-white text-opacity-80">
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  {client.phone}
                </div>
                {client.email && (
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    {client.email}
                  </div>
                )}
                {client.address && (
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {client.address}
                  </div>
                )}
                {client.notes && (
                  <p className="text-white text-opacity-70 mt-2 text-sm">
                    {client.notes}
                  </p>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default ClientsView;