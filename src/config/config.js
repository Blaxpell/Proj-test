// src/config/config.js

// Configurações por ambiente
const config = {
  development: {
    API_BASE_URL: 'http://localhost:3001/api',
    APP_NAME: 'Fabiane Vieira Admin',
    ENVIRONMENT: 'development',
    DEBUG: true,
    AUTO_REFRESH_INTERVAL: 30000, // 30 segundos
    TOKEN_REFRESH_THRESHOLD: 300000, // 5 minutos
    STORAGE_PREFIX: 'fv_admin_dev_'
  },
  production: {
    API_BASE_URL: 'https://api.fabianevieira.com/api',
    APP_NAME: 'Fabiane Vieira Admin',
    ENVIRONMENT: 'production',
    DEBUG: false,
    AUTO_REFRESH_INTERVAL: 120000, // 2 minutos
    TOKEN_REFRESH_THRESHOLD: 600000, // 10 minutos
    STORAGE_PREFIX: 'fv_admin_'
  },
  staging: {
    API_BASE_URL: 'https://staging-api.fabianevieira.com/api',
    APP_NAME: 'Fabiane Vieira Admin (Staging)',
    ENVIRONMENT: 'staging',
    DEBUG: true,
    AUTO_REFRESH_INTERVAL: 60000, // 1 minuto
    TOKEN_REFRESH_THRESHOLD: 300000, // 5 minutos
    STORAGE_PREFIX: 'fv_admin_staging_'
  }
};

// Detectar ambiente atual
const getEnvironment = () => {
  if (typeof window !== 'undefined') {
    // No browser
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'development';
    } else if (hostname.includes('staging')) {
      return 'staging';
    } else {
      return 'production';
    }
  } else {
    // No servidor (SSR)
    return process.env.NODE_ENV || 'development';
  }
};

// Configuração atual baseada no ambiente
const currentEnvironment = getEnvironment();
const currentConfig = config[currentEnvironment] || config.development;

// Adicionar configurações específicas do sistema
const systemConfig = {
  ...currentConfig,
  
  // Configurações de autenticação
  AUTH: {
    TOKEN_KEY: `${currentConfig.STORAGE_PREFIX}token`,
    USER_KEY: `${currentConfig.STORAGE_PREFIX}user`,
    LOGIN_PATH: '/admin/login',
    DEFAULT_REDIRECT: '/admin/dashboard',
    SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 horas
  },

  // Configurações de UI
  UI: {
    TOAST_DURATION: 5000,
    ANIMATION_DURATION: 300,
    DEBOUNCE_DELAY: 300,
    PAGINATION_LIMIT: 10,
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  },

  // Configurações de notificações
  NOTIFICATIONS: {
    SOUND_ENABLED: true,
    DESKTOP_ENABLED: true,
    EMAIL_ENABLED: true,
    CHECK_INTERVAL: 60000, // 1 minuto
  },

  // Configurações de cache
  CACHE: {
    STATS_TTL: 5 * 60 * 1000, // 5 minutos
    NOTIFICATIONS_TTL: 1 * 60 * 1000, // 1 minuto
    USER_TTL: 15 * 60 * 1000, // 15 minutos
  },

  // Permissões do sistema
  PERMISSIONS: {
    SUPER_ADMIN: 'super_admin',
    ADMIN: 'admin',
    STAFF: 'staff',
    
    // Específicas
    VIEW_DASHBOARD: 'view_dashboard',
    MANAGE_APPOINTMENTS: 'manage_appointments',
    VIEW_APPOINTMENTS: 'view_appointments',
    MANAGE_QUOTES: 'manage_quotes',
    VIEW_PAYMENTS: 'view_payments',
    MANAGE_STAFF: 'manage_staff',
    MANAGE_CLIENTS: 'manage_clients',
    VIEW_REPORTS: 'view_reports',
    MANAGE_SETTINGS: 'manage_settings'
  },

  // Status dos agendamentos
  APPOINTMENT_STATUS: {
    PENDING: 'pendente',
    APPROVED: 'aprovado',
    REJECTED: 'rejeitado',
    COMPLETED: 'concluido',
    CANCELLED: 'cancelado'
  },

  // Status dos pagamentos
  PAYMENT_STATUS: {
    PENDING: 'pendente',
    PAID: 'pago',
    CANCELLED: 'cancelado',
    REFUNDED: 'reembolsado'
  },

  // Tipos de notificação
  NOTIFICATION_TYPES: {
    APPOINTMENT: 'appointment',
    PAYMENT: 'payment',
    SYSTEM: 'system',
    REMINDER: 'reminder'
  },

  // Configurações de formato
  FORMATS: {
    DATE: 'dd/MM/yyyy',
    TIME: 'HH:mm',
    DATETIME: 'dd/MM/yyyy HH:mm',
    CURRENCY: 'pt-BR',
    CURRENCY_CODE: 'BRL'
  },

  // Configurações de validação
  VALIDATION: {
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_REQUIRE_SPECIAL: true,
    PASSWORD_REQUIRE_NUMBER: true,
    PASSWORD_REQUIRE_UPPERCASE: true,
    PHONE_FORMAT: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
    EMAIL_FORMAT: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },

  // URLs e rotas
  ROUTES: {
    ADMIN: {
      LOGIN: '/admin/login',
      DASHBOARD: '/admin/dashboard',
      PENDING: '/admin/pending',
      APPROVED: '/admin/approved',
      QUOTES: '/admin/quotes',
      PAYMENTS: '/admin/payments',
      STAFF: '/admin/staff',
      CLIENTS: '/admin/clients',
      REPORTS: '/admin/reports',
      SETTINGS: '/admin/settings',
      CHANGE_PASSWORD: '/admin/change-password'
    },
    PUBLIC: {
      HOME: '/',
      BOOKING: '/agendamento',
      SERVICES: '/servicos',
      CONTACT: '/contato'
    }
  },

  // Configurações de upload
  UPLOAD: {
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    QUALITY: 0.8,
    MAX_WIDTH: 1920,
    MAX_HEIGHT: 1080
  }
};

// Funções utilitárias
export const isDevelopment = () => currentEnvironment === 'development';
export const isProduction = () => currentEnvironment === 'production';
export const isStaging = () => currentEnvironment === 'staging';

export const getApiUrl = (endpoint = '') => {
  const baseUrl = systemConfig.API_BASE_URL;
  return endpoint ? `${baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}` : baseUrl;
};

export const getStorageKey = (key) => {
  return `${systemConfig.STORAGE_PREFIX}${key}`;
};

export const formatCurrency = (value) => {
  return new Intl.NumberFormat(systemConfig.FORMATS.CURRENCY, {
    style: 'currency',
    currency: systemConfig.FORMATS.CURRENCY_CODE
  }).format(value || 0);
};

export const formatDate = (date, format = 'DATETIME') => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  const options = {};
  
  switch (format) {
    case 'DATE':
      return dateObj.toLocaleDateString('pt-BR');
    case 'TIME':
      return dateObj.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    case 'DATETIME':
    default:
      return dateObj.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
  }
};

export const validatePassword = (password) => {
  const errors = [];
  
  if (password.length < systemConfig.VALIDATION.PASSWORD_MIN_LENGTH) {
    errors.push(`Senha deve ter pelo menos ${systemConfig.VALIDATION.PASSWORD_MIN_LENGTH} caracteres`);
  }
  
  if (systemConfig.VALIDATION.PASSWORD_REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra maiúscula');
  }
  
  if (systemConfig.VALIDATION.PASSWORD_REQUIRE_NUMBER && !/\d/.test(password)) {
    errors.push('Senha deve conter pelo menos um número');
  }
  
  if (systemConfig.VALIDATION.PASSWORD_REQUIRE_SPECIAL && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Senha deve conter pelo menos um caractere especial');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateEmail = (email) => {
  return systemConfig.VALIDATION.EMAIL_FORMAT.test(email);
};

export const validatePhone = (phone) => {
  return systemConfig.VALIDATION.PHONE_FORMAT.test(phone);
};

// Log configurações em desenvolvimento
if (isDevelopment() && typeof window !== 'undefined') {
  console.log('🔧 Configurações do sistema:', {
    environment: currentEnvironment,
    apiUrl: systemConfig.API_BASE_URL,
    debug: systemConfig.DEBUG
  });
}

export default systemConfig;