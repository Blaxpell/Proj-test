// src/components/ProfessionalSelection.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Scissors, 
  Sparkles, 
  Palette,
  Star,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  User,
  Crown,
  Award,
  Heart,
  Camera,
  Loader2,
  CheckCircle,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const ProfessionalSelection = ({ 
  onProfessionalSelected, 
  selectedDate, 
  onCancel, 
  isModal = false 
}) => {
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState('hair');
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [carouselIndex, setCarouselIndex] = useState({});

  // Grupos de profissionais com ícones e cores
  const professionalGroups = [
    {
      id: 'hair',
      name: 'Cabeleireiros',
      icon: Scissors,
      color: 'from-pink-500 to-rose-600',
      bgColor: 'bg-pink-500/10',
      description: 'Corte, coloração e tratamentos'
    },
    {
      id: 'nails',
      name: 'Manicures',
      icon: Sparkles,
      color: 'from-purple-500 to-violet-600',
      bgColor: 'bg-purple-500/10',
      description: 'Unhas e design nail art'
    },
    {
      id: 'makeup',
      name: 'Maquiadores',
      icon: Palette,
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-500/10',
      description: 'Maquiagem social e profissional'
    }
  ];

  // Carregar profissionais da API
  useEffect(() => {
    loadProfessionals();
  }, []);

  const loadProfessionals = async () => {
    try {
      setLoading(true);
      
      // CORRIGIDO: Buscar profissionais do Redis
      const response = await fetch('https://coherent-escargot-23835.upstash.io/', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer AV0bAAIjcDEyODVlMzY0YTk2ODk0M2JkOTRlNmVmMmUzZTQwMDNkMnAxMA',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(['KEYS', 'profissional:*']),
      });

      if (response.ok) {
        const keysData = await response.json();
        let allProfessionals = [];

        if (keysData.result && Array.isArray(keysData.result)) {
          for (const key of keysData.result) {
            try {
              const getResponse = await fetch('https://coherent-escargot-23835.upstash.io/', {
                method: 'POST',
                headers: {
                  Authorization: 'Bearer AV0bAAIjcDEyODVlMzY0YTk2ODk0M2JkOTRlNmVmMmUzZTQwMDNkMnAxMA',
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(['GET', key]),
              });

              if (getResponse.ok) {
                const getData = await getResponse.json();
                if (getData.result) {
                  const professional = JSON.parse(getData.result);
                  // Filtrar apenas profissionais ativos
                  if (professional.status === 'active') {
                    allProfessionals.push(professional);
                  }
                }
              }
            } catch (error) {
              console.error(`Erro ao buscar ${key}:`, error);
            }
          }
        }

        setProfessionals(allProfessionals);
        
        // Inicializar índices do carrossel para cada grupo
        const initialIndexes = {};
        professionalGroups.forEach(group => {
          initialIndexes[group.id] = 0;
        });
        setCarouselIndex(initialIndexes);
        
      } else {
        console.error('Erro ao buscar profissionais');
        setProfessionals([]);
      }
      
    } catch (error) {
      console.error('Erro ao carregar profissionais:', error);
      setProfessionals([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar profissionais por grupo/categoria
  const getProfessionalsByGroup = (groupId) => {
    return professionals.filter(prof => {
      // Mapear categorias do sistema para grupos da UI
      const categoryMapping = {
        'cabelo': 'hair',
        'unhas': 'nails', 
        'estetica': 'makeup',
        'maquiagem': 'makeup'
      };
      
      const mappedCategory = categoryMapping[prof.category] || prof.category;
      return mappedCategory === groupId || prof.group === groupId;
    });
  };

  // Navegar no carrossel
  const navigateCarousel = (groupId, direction) => {
    const groupProfessionals = getProfessionalsByGroup(groupId);
    const currentIndex = carouselIndex[groupId] || 0;
    
    let newIndex;
    if (direction === 'next') {
      newIndex = currentIndex + 1 >= groupProfessionals.length ? 0 : currentIndex + 1;
    } else {
      newIndex = currentIndex - 1 < 0 ? groupProfessionals.length - 1 : currentIndex - 1;
    }
    
    setCarouselIndex(prev => ({
      ...prev,
      [groupId]: newIndex
    }));
  };

  // Selecionar profissional - MODIFICADO para usar callback
  const handleSelectProfessional = (professional) => {
    setSelectedProfessional(professional);
    
    // Chamar callback após pequeno delay para animação
    setTimeout(() => {
      onProfessionalSelected(professional);
    }, 800);
  };

  // Componente do carrossel para cada grupo
  const ProfessionalCarousel = ({ group }) => {
    const groupProfessionals = getProfessionalsByGroup(group.id);
    const currentIndex = carouselIndex[group.id] || 0;
    const currentProfessional = groupProfessionals[currentIndex];

    if (groupProfessionals.length === 0) {
      return (
        <div className="text-center py-12">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Nenhum profissional cadastrado</p>
          <p className="text-gray-500 text-sm mt-2">em {group.name}</p>
        </div>
      );
    }

    return (
      <div className="relative">
        {/* Carrossel de fotos */}
        <div className="relative h-80 mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-gray-800 to-gray-900">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              {currentProfessional?.photo ? (
                <img
                  src={currentProfessional.photo}
                  alt={currentProfessional.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              
              {/* Fallback quando não há foto */}
              <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center"
                   style={{ display: currentProfessional?.photo ? 'none' : 'flex' }}>
                <div className="text-center">
                  <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300 text-lg font-semibold">{currentProfessional?.name}</p>
                  <p className="text-gray-400 text-sm">Foto não disponível</p>
                </div>
              </div>

              {/* Overlay com informações */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              
              {/* Informações do profissional */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-2xl font-bold drop-shadow-lg">
                    {currentProfessional?.name}
                  </h3>
                  {currentProfessional?.rating && (
                    <div className="flex items-center bg-black/30 backdrop-blur-sm rounded-full px-3 py-1">
                      <Star className="w-4 h-4 text-yellow-400 mr-1 fill-current" />
                      <span className="text-sm font-semibold">{currentProfessional.rating}</span>
                    </div>
                  )}
                </div>
                
                {currentProfessional?.specialties && (
                  <p className="text-sm text-gray-200 mb-2">
                    {Array.isArray(currentProfessional.specialties) 
                      ? currentProfessional.specialties.join(' • ')
                      : currentProfessional.specialties
                    }
                  </p>
                )}
                
                <div className="flex items-center justify-between">
                  {currentProfessional?.experience && (
                    <div className="flex items-center text-sm text-gray-300">
                      <Award className="w-4 h-4 mr-1" />
                      <span>{currentProfessional.experience}</span>
                    </div>
                  )}
                  
                  {currentProfessional?.price && (
                    <div className="flex items-center text-sm text-green-300 font-semibold">
                      <span>{currentProfessional.price}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Botões de navegação */}
          {groupProfessionals.length > 1 && (
            <>
              <button
                onClick={() => navigateCarousel(group.id, 'prev')}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/30 backdrop-blur-sm hover:bg-black/50 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <button
                onClick={() => navigateCarousel(group.id, 'next')}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/30 backdrop-blur-sm hover:bg-black/50 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Indicadores */}
          {groupProfessionals.length > 1 && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex space-x-2">
              {groupProfessionals.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCarouselIndex(prev => ({ ...prev, [group.id]: index }))}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentIndex 
                      ? 'bg-white scale-110' 
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Botão de seleção */}
        {currentProfessional && (
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={() => handleSelectProfessional(currentProfessional)}
              className={`w-full h-14 text-lg font-semibold bg-gradient-to-r ${group.color} hover:shadow-lg hover:shadow-pink-500/25 transition-all duration-200 relative overflow-hidden`}
              disabled={!!selectedProfessional}
            >
              {selectedProfessional?.id === currentProfessional.id ? (
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Profissional Selecionado
                </div>
              ) : (
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Ver Calendário de {currentProfessional.name}
                </div>
              )}
            </Button>
          </motion.div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  // Se for modal, usar layout simplificado
  if (isModal) {
    return (
      <div className="p-6">
        {/* Header simplificado para modal */}
        <div className="mb-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Escolha seu Profissional
            </h2>
            <p className="text-gray-600">
              Selecione o especialista ideal para você
              {selectedDate && (
                <span className="block text-sm text-purple-600 mt-1">
                  📅 Para: {new Date(selectedDate).toLocaleDateString()}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Seletor de grupos - versão compacta */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {professionalGroups.map((group) => {
              const Icon = group.icon;
              const isActive = selectedGroup === group.id;
              
              return (
                <motion.button
                  key={group.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedGroup(group.id)}
                  className={`relative overflow-hidden rounded-xl p-4 transition-all duration-300 ${
                    isActive
                      ? `bg-gradient-to-r ${group.color} text-white shadow-lg`
                      : `${group.bgColor} text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300`
                  }`}
                >
                  <div className="flex flex-col items-center text-center min-w-[100px]">
                    <Icon className={`w-6 h-6 mb-2 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                    <h3 className="text-sm font-semibold mb-1">{group.name}</h3>
                    <p className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                      {getProfessionalsByGroup(group.id).length} disp.
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Carrossel do grupo selecionado */}
        <motion.div
          key={selectedGroup}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-lg mx-auto"
        >
          <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {professionalGroups.find(g => g.id === selectedGroup)?.name}
                </h3>
                <p className="text-gray-600 text-sm">
                  {getProfessionalsByGroup(selectedGroup).length} profissional(is) disponível(is)
                </p>
              </div>

              <ProfessionalCarousel 
                group={professionalGroups.find(g => g.id === selectedGroup)} 
              />
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Layout para tela completa no fluxo
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Seletor de grupos */}
        <div className="lg:col-span-1">
          <div className="glass-effect rounded-2xl p-6 h-full">
            <h3 className="text-lg font-semibold text-white mb-6 text-center">
              Áreas de Especialidade
            </h3>
            
            <div className="space-y-4">
              {professionalGroups.map((group) => {
                const Icon = group.icon;
                const isActive = selectedGroup === group.id;
                const groupProfessionals = getProfessionalsByGroup(group.id);
                
                return (
                  <motion.button
                    key={group.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedGroup(group.id)}
                    className={`w-full text-left p-4 rounded-xl transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
                        : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                    }`}
                  >
                    <div className="flex items-center">
                      <Icon className={`w-6 h-6 mr-3 ${isActive ? 'text-white' : 'text-gray-300'}`} />
                      <div className="flex-1">
                        <h4 className="font-semibold">{group.name}</h4>
                        <p className={`text-sm ${isActive ? 'text-white/80' : 'text-gray-400'}`}>
                          {group.description}
                        </p>
                        <p className={`text-xs mt-1 ${isActive ? 'text-white/70' : 'text-gray-500'}`}>
                          {groupProfessionals.length} profissional(is)
                        </p>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Carrossel de profissionais */}
        <div className="lg:col-span-2">
          <motion.div
            key={selectedGroup}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-effect rounded-2xl p-6 h-full"
          >
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">
                {professionalGroups.find(g => g.id === selectedGroup)?.name}
              </h3>
              <p className="text-gray-300">
                {getProfessionalsByGroup(selectedGroup).length} profissional(is) disponível(is)
              </p>
            </div>

            <ProfessionalCarousel 
              group={professionalGroups.find(g => g.id === selectedGroup)} 
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfessionalSelection;