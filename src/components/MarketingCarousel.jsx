
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MarketingCarousel = ({ services }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const filteredServices = services.filter(service => service.imageUrl && service.description);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % filteredServices.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + filteredServices.length) % filteredServices.length);
  };

  useEffect(() => {
    if (filteredServices.length <= 1) return;
    const timer = setTimeout(nextSlide, 5000);
    return () => clearTimeout(timer);
  }, [currentIndex, filteredServices.length]);

  if (filteredServices.length === 0) {
    return (
      <div className="glass-effect rounded-2xl p-8 text-center text-white text-opacity-70">
        <p>Adicione imagens e descrições aos seus serviços para exibi-los aqui!</p>
      </div>
    );
  }

  const currentService = filteredServices[currentIndex];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-full max-w-3xl mx-auto glass-effect rounded-2xl overflow-hidden shadow-2xl"
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5 }}
          className="w-full h-64 md:h-96 relative"
        >
          <img  
            alt={currentService.name} 
            className="w-full h-full object-cover"
           src="https://images.unsplash.com/photo-1634139874781-49669bf9befe" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-6 md:p-8 text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-2 drop-shadow-lg">{currentService.name}</h3>
            <p className="text-sm md:text-base text-white text-opacity-90 drop-shadow-md">{currentService.description}</p>
          </div>
        </motion.div>
      </AnimatePresence>

      {filteredServices.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={prevSlide}
            className="absolute top-1/2 left-2 md:left-4 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 text-white rounded-full p-2"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={nextSlide}
            className="absolute top-1/2 right-2 md:right-4 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 text-white rounded-full p-2"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {filteredServices.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full ${currentIndex === index ? 'bg-white' : 'bg-white/50'} transition-all duration-300`}
                aria-label={`Ir para slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
};

export default MarketingCarousel;
