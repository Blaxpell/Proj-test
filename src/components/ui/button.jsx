// src/components/ui/button.jsx
import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';

const Button = forwardRef(({ 
  children, 
  variant = 'default', 
  size = 'default',
  className = '', 
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  ...props 
}, ref) => {
  
  // Variantes de estilo
  const variants = {
    default: 'bg-pink-600 hover:bg-pink-700 text-white border border-pink-600',
    outline: 'bg-transparent hover:bg-pink-50 text-pink-600 border border-pink-600 hover:text-pink-700',
    ghost: 'bg-transparent hover:bg-pink-50 text-pink-600 border-transparent',
    destructive: 'bg-red-600 hover:bg-red-700 text-white border border-red-600',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900 border border-gray-200'
  };

  // Tamanhos
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    default: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  };

  // Classes base
  const baseClasses = [
    'inline-flex items-center justify-center',
    'font-medium rounded-lg',
    'transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'shadow-sm hover:shadow-md',
    variants[variant],
    sizes[size],
    className
  ].join(' ');

  const handleClick = (e) => {
    if (disabled || loading) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  return (
    <motion.button
      ref={ref}
      type={type}
      className={baseClasses}
      disabled={disabled || loading}
      onClick={handleClick}
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {children}
    </motion.button>
  );
});

Button.displayName = 'Button';

export { Button };