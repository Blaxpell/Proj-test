import React from 'react';

const Badge = React.forwardRef(({ children, variant, className = '', ...props }, ref) => {
  const baseClasses = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium';
  
  // Variantes opcionais (mas prioriza className se fornecido)
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    proprietario: 'bg-yellow-100 text-yellow-800',
    gerente: 'bg-blue-100 text-blue-800', 
    funcionario: 'bg-gray-100 text-gray-800',
    pending: 'bg-orange-100 text-orange-800',
    success: 'bg-green-100 text-green-800',
    error: 'bg-red-100 text-red-800'
  };

  // Se className for fornecido, usa ele; senão usa a variante
  const finalClasses = className 
    ? `${baseClasses} ${className}`
    : `${baseClasses} ${variants[variant] || variants.default}`;

  return (
    <span 
      className={finalClasses}
      ref={ref}
      {...props}
    >
      {children}
    </span>
  );
});

Badge.displayName = 'Badge';

export { Badge };