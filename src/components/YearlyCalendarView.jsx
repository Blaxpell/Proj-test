import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const YearlyCalendarView = ({ appointments, services, setShowNewAppointment }) => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState(null);

  const operatingHours = useMemo(() => {
    const hours = [];
    for (let i = 7; i <= 18; i++) {
      hours.push(`${String(i).padStart(2, '0')}:00`);
    }
    return hours;
  }, []);

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay(); 

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const handlePrevYear = () => setCurrentYear(currentYear - 1);
  const handleNextYear = () => setCurrentYear(currentYear + 1);
  const handleMonthSelect = (monthIndex) => {
    setSelectedMonth(monthIndex);
    setSelectedDay(null); 
  };
  const handleDayClick = (day) => setSelectedDay(day);

  const getAppointmentsForSlot = (year, month, day, time) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return appointments.filter(
      (apt) => apt.date === dateStr && apt.time.startsWith(time.substring(0, 2))
    );
  };

  const renderMonthCalendar = (year, month) => {
    const numDays = daysInMonth(year, month);
    const firstDay = firstDayOfMonth(year, month);
    const calendarDays = [];

    for (let i = 0; i < firstDay; i++) {
      calendarDays.push(<div key={`empty-${i}`} className="p-1 border border-white/10"></div>);
    }

    for (let day = 1; day <= numDays; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayAppointments = appointments.filter(apt => apt.date === dateStr);
      const isSelected = selectedDay === day;
      
      calendarDays.push(
        <motion.div
          key={day}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleDayClick(day)}
          className={`p-2 border cursor-pointer transition-colors duration-200
            ${isSelected ? 'bg-pink-500/50 border-pink-400' : 'border-white/10 hover:bg-white/5'}
            ${dayAppointments.length > 0 ? 'bg-purple-500/30' : ''}
          `}
        >
          <div className={`font-semibold ${isSelected ? 'text-white' : 'text-white/80'}`}>{day}</div>
          {dayAppointments.length > 0 && (
            <div className="text-xs text-pink-300 mt-1">{dayAppointments.length} agend.</div>
          )}
        </motion.div>
      );
    }
    return <div className="grid grid-cols-7 gap-px bg-white/5">{calendarDays}</div>;
  };

  const renderDaySchedule = (year, month, day) => {
    if (day === null) {
      return (
        <div className="text-center text-white/70 p-8">
          Selecione um dia para ver os horários.
        </div>
      );
    }
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    return (
      <div className="space-y-2 p-4">
        <h4 className="text-lg font-semibold text-white mb-3">
          Horários para {day} de {monthNames[month]} de {year}
        </h4>
        {operatingHours.map((hour) => {
          const slotAppointments = getAppointmentsForSlot(year, month, day, hour);
          const isBooked = slotAppointments.length > 0;
          return (
            <motion.div
              key={hour}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: operatingHours.indexOf(hour) * 0.05 }}
              className={`flex items-center justify-between p-3 rounded-lg
                ${isBooked ? 'bg-red-500/30' : 'bg-green-500/30 hover:bg-green-500/40 cursor-pointer'}
              `}
              onClick={() => !isBooked && setShowNewAppointment({ date: dateStr, time: hour })}
            >
              <span className="text-white/90">{hour}</span>
              {isBooked ? (
                <div className="text-xs text-red-200">
                  Reservado ({slotAppointments.map(a => a.clientName).join(', ')})
                </div>
              ) : (
                <div className="text-xs text-green-200 flex items-center">
                  <Plus className="w-3 h-3 mr-1" /> Disponível
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    );
  };


  return (
    <motion.div
      key="yearlyCalendar"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center mb-6 p-4 glass-effect rounded-xl">
        <Button variant="ghost" onClick={handlePrevYear} className="text-white hover:bg-white/10">
          <ChevronLeft className="w-5 h-5 mr-2" /> {currentYear - 1}
        </Button>
        <h2 className="text-3xl font-bold text-white">{currentYear}</h2>
        <Button variant="ghost" onClick={handleNextYear} className="text-white hover:bg-white/10">
          {currentYear + 1} <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {monthNames.map((name, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleMonthSelect(index)}
            className={`p-3 rounded-lg text-center font-medium transition-all duration-200
              ${selectedMonth === index 
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg' 
                : 'bg-white/10 text-white/80 hover:bg-white/20'}
            `}
          >
            {name}
          </motion.button>
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 glass-effect rounded-xl p-4">
          <h3 className="text-xl font-semibold text-white mb-4 text-center">
            {monthNames[selectedMonth]} de {currentYear}
          </h3>
          {renderMonthCalendar(currentYear, selectedMonth)}
        </div>
        <div className="md:col-span-1 glass-effect rounded-xl p-4">
          {renderDaySchedule(currentYear, selectedMonth, selectedDay)}
        </div>
      </div>
    </motion.div>
  );
};

export default YearlyCalendarView;