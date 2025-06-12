// src/utils/api.js

class ApiClient {
  constructor(baseURL = '/api') {
    this.baseURL = baseURL;
  }

  // Método genérico para fazer requisições
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('admin_token');

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      
      // Se não autorizado, redirecionar para login
      if (response.status === 401) {
        localStorage.removeItem('admin_token');
        window.location.href = '/admin/login';
        return null;
      }

      // Se não foi bem sucedido, lançar erro
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`);
      }

      // Tentar parsear JSON, se falhar retornar response
      try {
        return await response.json();
      } catch {
        return response;
      }
    } catch (error) {
      console.error(`Erro na requisição ${endpoint}:`, error);
      throw error;
    }
  }

  // Métodos HTTP específicos
  async get(endpoint, params = {}) {
    const searchParams = new URLSearchParams(params);
    const queryString = searchParams.toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url, { method: 'GET' });
  }

  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  async patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }
}

// Instância global da API
const api = new ApiClient();

// Endpoints específicos do admin
export const adminApi = {
  // Dashboard
  dashboard: {
    getStats: () => api.get('/admin/dashboard/stats'),
    getRecentAppointments: (limit = 5) => api.get('/admin/dashboard/recent-appointments', { limit })
  },

  // Autenticação
  auth: {
    login: (email, password) => api.post('/auth/login', { email, password }),
    logout: () => api.post('/auth/logout'),
    verify: () => api.get('/auth/verify'),
    changePassword: (currentPassword, newPassword) => api.post('/auth/change-password', { currentPassword, newPassword }),
    resetPassword: (email) => api.post('/auth/reset-password', { email })
  },

  // Agendamentos
  appointments: {
    getPending: (page = 1, limit = 10) => api.get('/admin/appointments/pending', { page, limit }),
    getApproved: (page = 1, limit = 10) => api.get('/admin/appointments/approved', { page, limit }),
    approve: (id) => api.patch(`/admin/appointments/${id}/approve`),
    reject: (id, reason) => api.patch(`/admin/appointments/${id}/reject`, { reason }),
    getById: (id) => api.get(`/admin/appointments/${id}`),
    update: (id, data) => api.put(`/admin/appointments/${id}`, data),
    delete: (id) => api.delete(`/admin/appointments/${id}`)
  },

  // Orçamentos
  quotes: {
    getAll: (page = 1, limit = 10) => api.get('/admin/quotes', { page, limit }),
    create: (data) => api.post('/admin/quotes', data),
    update: (id, data) => api.put(`/admin/quotes/${id}`, data),
    delete: (id) => api.delete(`/admin/quotes/${id}`),
    getById: (id) => api.get(`/admin/quotes/${id}`),
    approve: (id) => api.patch(`/admin/quotes/${id}/approve`),
    send: (id) => api.patch(`/admin/quotes/${id}/send`)
  },

  // Pagamentos
  payments: {
    getAll: (page = 1, limit = 10) => api.get('/admin/payments', { page, limit }),
    getPending: () => api.get('/admin/payments/pending'),
    confirm: (id) => api.patch(`/admin/payments/${id}/confirm`),
    getById: (id) => api.get(`/admin/payments/${id}`),
    update: (id, data) => api.put(`/admin/payments/${id}`, data)
  },

  // Equipe
  staff: {
    getAll: () => api.get('/admin/staff'),
    create: (data) => api.post('/admin/staff', data),
    update: (id, data) => api.put(`/admin/staff/${id}`, data),
    delete: (id) => api.delete(`/admin/staff/${id}`),
    getById: (id) => api.get(`/admin/staff/${id}`),
    updatePermissions: (id, permissions) => api.patch(`/admin/staff/${id}/permissions`, { permissions })
  },

  // Clientes
  clients: {
    getAll: (page = 1, limit = 10) => api.get('/admin/clients', { page, limit }),
    getById: (id) => api.get(`/admin/clients/${id}`),
    update: (id, data) => api.put(`/admin/clients/${id}`, data),
    delete: (id) => api.delete(`/admin/clients/${id}`),
    search: (query) => api.get('/admin/clients/search', { q: query })
  },

  // Serviços
  services: {
    getAll: () => api.get('/admin/services'),
    create: (data) => api.post('/admin/services', data),
    update: (id, data) => api.put(`/admin/services/${id}`, data),
    delete: (id) => api.delete(`/admin/services/${id}`),
    getById: (id) => api.get(`/admin/services/${id}`)
  },

  // Notificações
  notifications: {
    getAll: (page = 1, limit = 10) => api.get('/admin/notifications', { page, limit }),
    markAsRead: (id) => api.patch(`/admin/notifications/${id}/read`),
    markAllAsRead: () => api.patch('/admin/notifications/read-all'),
    getUnreadCount: () => api.get('/admin/notifications/unread-count')
  },

  // Configurações
  settings: {
    get: () => api.get('/admin/settings'),
    update: (data) => api.put('/admin/settings', data),
    getBusinessHours: () => api.get('/admin/settings/business-hours'),
    updateBusinessHours: (data) => api.put('/admin/settings/business-hours', data)
  },

  // Relatórios
  reports: {
    getRevenue: (startDate, endDate) => api.get('/admin/reports/revenue', { startDate, endDate }),
    getAppointments: (startDate, endDate) => api.get('/admin/reports/appointments', { startDate, endDate }),
    getClients: (startDate, endDate) => api.get('/admin/reports/clients', { startDate, endDate }),
    export: (type, format, params) => api.get(`/admin/reports/export/${type}`, { format, ...params })
  }
};

// Interceptador para tratamento de erros global
export const handleApiError = (error) => {
  console.error('Erro na API:', error);
  
  // Aqui você pode adicionar lógica global de tratamento de erros
  // Como mostrar toasts, logs, etc.
  
  return {
    success: false,
    error: error.message || 'Erro desconhecido na API'
  };
};

// Hook personalizado para usar a API com loading e error states
export const useApiCall = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = async (apiCall) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      return { success: true, data: result };
    } catch (err) {
      const errorResult = handleApiError(err);
      setError(errorResult.error);
      return errorResult;
    } finally {
      setLoading(false);
    }
  };

  return { execute, loading, error };
};

export default api;
export const clientApi = api;