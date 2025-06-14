// 📁 CRIAR ARQUIVO: src/components/ui/ProfessionalAvatar.jsx

import React from 'react';
import { User, Scissors, Heart, Sparkles, UserCog } from 'lucide-react';

const ProfessionalAvatar = ({ 
  professional, 
  size = 'medium', 
  showStatus = true,
  className = '' 
}) => {
  // Mapeamento de ícones por categoria
  const categoryIcons = {
    cabelo: Scissors,
    unhas: Heart,
    estetica: Sparkles,
    administrativo: UserCog,
    default: User
  };

  // Mapeamento de cores por categoria
  const categoryGradients = {
    cabelo: 'from-purple-400 to-blue-500',
    unhas: 'from-pink-400 to-orange-400',
    estetica: 'from-green-400 to-blue-500',
    administrativo: 'from-gray-400 to-gray-600',
    default: 'from-gray-400 to-gray-600'
  };

  // Tamanhos disponíveis
  const sizes = {
    small: {
      container: 'w-8 h-10',
      icon: 'w-4 h-4',
      status: 'w-2 h-2',
      statusPos: '-top-0.5 -right-0.5'
    },
    medium: {
      container: 'w-12 h-16',
      icon: 'w-6 h-6',
      status: 'w-3 h-3',
      statusPos: '-top-1 -right-1'
    },
    large: {
      container: 'w-16 h-24',
      icon: 'w-8 h-8',
      status: 'w-4 h-4',
      statusPos: '-top-2 -right-2'
    }
  };

  const sizeConfig = sizes[size] || sizes.medium;
  const Icon = categoryIcons[professional.category] || categoryIcons.default;
  const gradient = categoryGradients[professional.category] || categoryGradients.default;

  const handleImageError = (e) => {
    e.target.style.display = 'none';
    e.target.nextSibling.style.display = 'flex';
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {professional.photo ? (
        <div className="relative overflow-hidden rounded-lg shadow-sm border border-gray-200 bg-white">
          {/* Container com proporção 3:4 */}
          <div className={`${sizeConfig.container} relative`}>
            <img 
              className="absolute inset-0 w-full h-full object-cover rounded-lg transition-transform duration-200 hover:scale-105" 
              src={professional.photo} 
              alt={professional.name}
              loading="lazy"
              onError={handleImageError}
            />
            
            {/* Fallback avatar (oculto por padrão) */}
            <div 
              className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center`}
              style={{ display: 'none' }}
            >
              <Icon className={`${sizeConfig.icon} text-white`} />
            </div>
          </div>
          
          {/* Indicador de status */}
          {showStatus && (
            <div className={`absolute ${sizeConfig.statusPos}`}>
              <div className={`${sizeConfig.status} rounded-full border-2 border-white shadow-sm ${
                professional.status === 'active' 
                  ? 'bg-green-400' 
                  : professional.status === 'inactive' 
                  ? 'bg-red-400' 
                  : 'bg-yellow-400'
              }`}></div>
            </div>
          )}

          {/* Overlay sutil no hover */}
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200 rounded-lg"></div>
        </div>
      ) : (
        <div className={`${sizeConfig.container} bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center shadow-sm border border-gray-200 relative`}>
          <Icon className={`${sizeConfig.icon} text-white`} />
          
          {/* Indicador de status para avatar sem foto */}
          {showStatus && (
            <div className={`absolute ${sizeConfig.statusPos}`}>
              <div className={`${sizeConfig.status} rounded-full border-2 border-white shadow-sm ${
                professional.status === 'active' 
                  ? 'bg-green-400' 
                  : professional.status === 'inactive' 
                  ? 'bg-red-400' 
                  : 'bg-yellow-400'
              }`}></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfessionalAvatar;