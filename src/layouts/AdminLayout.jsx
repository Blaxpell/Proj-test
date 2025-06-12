// src/layouts/AdminLayout.jsx
import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Calendar, 
  CheckCircle, 
  FileText, 
  CreditCard, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Scissors,
  Bell,
  User,
  ChevronRight,
  ChevronDown,
  Home
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { adminApi } from '@/utils/api';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const [stats, setStats] = useState({
    pendingCount: 0,
    approvedCount: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalClients: 0,
    recentAppointments: [],
    pendingPayments: 0
  });
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const userButtonRef = useRef(null);
  const { user, logout, hasPermission } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // CSS customizado para efeitos avançados
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse-glow {
        0%, 100% { 
          box-shadow: 0 0 20px rgba(239, 68, 68, 0.4), 0 0 40px rgba(239, 68, 68, 0.2); 
        }
        50% { 
          box-shadow: 0 0 40px rgba(239, 68, 68, 0.6), 0 0 80px rgba(239, 68, 68, 0.3); 
        }
      }
      
      @keyframes notification-pulse {
        0%, 100% { 
          box-shadow: 0 0 8px rgba(239, 68, 68, 0.8); 
        }
        50% { 
          box-shadow: 0 0 20px rgba(239, 68, 68, 1), 0 0 35px rgba(239, 68, 68, 0.6); 
        }
      }
      
      .glow-container {
        position: relative;
      }
      
      .glow-container::before {
        content: '';
        position: absolute;
        top: -3px;
        left: -3px;
        right: -3px;
        bottom: -3px;
        background: linear-gradient(45deg, 
          rgba(236, 72, 153, 0.2), 
          rgba(244, 114, 182, 0.2), 
          rgba(236, 72, 153, 0.2)
        );
        border-radius: 20px;
        z-index: -1;
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      
      .glow-container:hover::before {
        opacity: 1;
      }
      
      .notification-dot {
        animation: notification-pulse 2s ease-in-out infinite;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Calcular posição do dropdown
  const updateDropdownPosition = () => {
    if (userButtonRef.current) {
      const rect = userButtonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right
      });
    }
  };

  // Atualizar posição quando abrir o menu
  useEffect(() => {
    if (userMenuOpen) {
      updateDropdownPosition();
    }
  }, [userMenuOpen]);

  // Atualizar posição no resize
  useEffect(() => {
    const handleResize = () => {
      if (userMenuOpen) {
        updateDropdownPosition();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [userMenuOpen]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuOpen && userButtonRef.current && !userButtonRef.current.contains(event.target)) {
        const dropdownElements = document.querySelectorAll('[data-dropdown="user-menu"]');
        let clickedInsideDropdown = false;
        dropdownElements.forEach(element => {
          if (element.contains(event.target)) {
            clickedInsideDropdown = true;
          }
        });
        
        if (!clickedInsideDropdown) {
          setUserMenuOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuOpen]);

  // Atalho de teclado para voltar ao dashboard
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === 'h') {
        event.preventDefault();
        navigate('/admin/dashboard');
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  // Carregar estatísticas para badges
  const loadStats = async () => {
    try {
      const data = await adminApi.dashboard.getStats();
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  // Carregar notificações
  const loadNotifications = async () => {
    try {
      const [notificationsData, unreadData] = await Promise.all([
        adminApi.notifications.getAll(1, 5),
        adminApi.notifications.getUnreadCount()
      ]);
      
      setNotifications(notificationsData.notifications || []);
      setUnreadCount(unreadData.count || 0);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    }
  };

  // Carregar dados quando o componente montar
  useEffect(() => {
    loadStats();
    loadNotifications();
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(() => {
      loadStats();
      loadNotifications();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Componente do dropdown via portal
  const UserDropdownPortal = () => {
    if (!userMenuOpen) return null;

    return ReactDOM.createPortal(
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          data-dropdown="user-menu"
          className="fixed w-56 bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl ring-1 ring-pink-400/30 border border-pink-500/20"
          style={{
            top: dropdownPosition.top,
            right: dropdownPosition.right,
            zIndex: 999999,
            boxShadow: `
              0 0 40px rgba(236, 72, 153, 0.3),
              0 0 80px rgba(236, 72, 153, 0.15),
              0 20px 40px rgba(0, 0, 0, 0.2)
            `
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4">
            {/* User info header */}
            <div className="flex items-center space-x-3 pb-4 border-b border-pink-500/30">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-pink-700 rounded-full flex items-center justify-center shadow-lg">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  {user?.name || 'Administrador'}
                </p>
                <p className="text-xs text-gray-300">
                  {user?.role || 'Admin'}
                </p>
                <p className="text-xs text-green-300 font-medium">● Online</p>
              </div>
            </div>

            {/* Menu options */}
            <div className="py-2 space-y-1">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleChangePassword();
                }}
                className="w-full flex items-center px-3 py-2 text-sm text-white hover:bg-pink-500/20 rounded-lg transition-colors group"
              >
                <Settings className="w-4 h-4 mr-3 text-pink-400 group-hover:text-pink-300" />
                <span>Trocar Senha</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.01 }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setUserMenuOpen(false);
                }}
                className="w-full flex items-center px-3 py-2 text-sm text-gray-500 hover:bg-gray-500/10 rounded-lg transition-colors cursor-not-allowed"
              >
                <User className="w-4 h-4 mr-3 text-gray-600" />
                <span>Personalizar</span>
                <span className="ml-auto text-xs bg-gray-600 text-gray-300 px-2 py-0.5 rounded-full">Em breve</span>
              </motion.button>

              <div className="border-t border-pink-500/30 my-2"></div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleLogout();
                }}
                className="w-full flex items-center px-3 py-2 text-sm text-red-400 hover:bg-red-500/20 rounded-lg transition-colors group"
              >
                <LogOut className="w-4 h-4 mr-3 text-red-400 group-hover:text-red-300" />
                <span>Sair do Sistema</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>,
      document.body
    );
  };

  const handleLogout = async () => {
    try {
      setUserMenuOpen(false);
      await logout();
      navigate('/admin/login');
    } catch (error) {
      console.error('Erro no logout:', error);
      navigate('/admin/login');
    }
  };

  const handleChangePassword = () => {
    setUserMenuOpen(false);
    navigate('/admin/change-password');
  };

  const menuItems = [
    {
      name: 'Dashboard',
      icon: LayoutDashboard,
      path: '/admin/dashboard',
      permission: 'view_dashboard',
      description: 'Visão geral do negócio'
    },
    {
      name: 'Pendentes',
      icon: Calendar,
      path: '/admin/pending',
      permission: 'manage_appointments',
      badge: stats.pendingCount || 0,
      description: 'Agendamentos para aprovar'
    },
    {
      name: 'Aprovados',
      icon: CheckCircle,
      path: '/admin/approved',
      permission: 'view_appointments',
      description: 'Agendamentos confirmados'
    },
    {
      name: 'Orçamentos',
      icon: FileText,
      path: '/admin/quotes',
      permission: 'manage_quotes',
      description: 'Propostas de serviços'
    },
    {
      name: 'Pagamentos',
      icon: CreditCard,
      path: '/admin/payments',
      permission: 'view_payments',
      description: 'Controle financeiro'
    },
    {
      name: 'Equipe',
      icon: Users,
      path: '/admin/staff',
      permission: 'manage_staff',
      description: 'Gerenciar funcionários'
    }
  ].filter(item => hasPermission(item.permission));

  const userMenuItems = [
    {
      name: 'Alterar Senha',
      icon: Settings,
      path: '/admin/change-password',
      permission: null,
      description: 'Configurações de segurança'
    }
  ];

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  const getCurrentPageTitle = () => {
    const currentItem = [...menuItems, ...userMenuItems].find(item => item.path === location.pathname);
    return currentItem?.name || 'Painel Administrativo';
  };

  const isOnDashboard = location.pathname === '/admin/dashboard';

  const markNotificationAsRead = async (notificationId) => {
    try {
      await adminApi.notifications.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, read: true }
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  const formatNotificationDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora';
    if (diffInMinutes < 60) return `Há ${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `Há ${Math.floor(diffInMinutes / 60)} h`;
    return `Há ${Math.floor(diffInMinutes / 1440)} dias`;
  };

  return (
    <div className="min-h-screen bg-black flex">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="absolute inset-0 bg-black opacity-75"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          x: sidebarOpen ? 0 : -300,
          transition: { type: "spring", stiffness: 300, damping: 30 }
        }}
        className="fixed inset-y-0 left-0 z-50 w-72 bg-gray-900/95 backdrop-blur-xl border-r border-pink-500/30 shadow-2xl transform lg:translate-x-0 lg:static lg:inset-0
                   shadow-pink-500/40 
                   ring-1 ring-pink-400/40 flex flex-col"
        style={{
          boxShadow: `
            0 0 50px rgba(236, 72, 153, 0.4),
            0 0 100px rgba(236, 72, 153, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.1)
          `
        }}
      >
        {/* Header da Sidebar */}
        <div className="flex items-center justify-between h-16 px-6 bg-gradient-to-r from-pink-600 to-pink-800 shadow-lg flex-shrink-0"
             style={{
               boxShadow: `0 0 30px rgba(236, 72, 153, 0.5)`
             }}>
          <div className="flex items-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="mr-3"
            >
              <Scissors className="w-8 h-8 text-white drop-shadow-lg" />
            </motion.div>
            <div className="text-white">
              <h1 className="text-lg font-bold drop-shadow-md">Admin Panel</h1>
              <p className="text-xs opacity-90">Fabiane Vieira</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:text-pink-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* User info */}
        <div className="p-6 border-b border-pink-500/30">
          <div className="flex items-center">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-pink-700 rounded-full flex items-center justify-center shadow-lg ring-2 ring-pink-400/50"
                   style={{
                     boxShadow: `
                       0 0 30px rgba(236, 72, 153, 0.6),
                       0 0 60px rgba(236, 72, 153, 0.3),
                       0 4px 20px rgba(0, 0, 0, 0.3)
                     `
                   }}>
                <User className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-black shadow-lg"
                   style={{
                     boxShadow: `0 0 15px rgba(34, 197, 94, 0.8)`
                   }}></div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-white drop-shadow-md">{user?.name || 'Administrador'}</p>
              <p className="text-xs text-gray-300">{user?.role || 'Admin'}</p>
              <p className="text-xs text-green-300 font-medium drop-shadow-sm">● Online</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-4 flex-1 overflow-y-auto">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActivePath(item.path);
              
              return (
                <motion.div
                  key={item.name}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      active
                        ? 'bg-white text-pink-600 shadow-lg ring-1 ring-pink-300'
                        : 'text-white hover:bg-pink-500/20 hover:backdrop-blur-sm hover:ring-1 hover:ring-pink-400/50'
                    }`}
                    style={active ? {
                      boxShadow: `
                        0 0 30px rgba(236, 72, 153, 0.5),
                        0 0 60px rgba(236, 72, 153, 0.2),
                        0 4px 20px rgba(0, 0, 0, 0.2)
                      `
                    } : {}}
                  >
                    <Icon className={`mr-3 h-5 w-5 ${active ? 'text-pink-600' : 'text-white/90 group-hover:text-white'}`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span>{item.name}</span>
                        {item.badge && item.badge > 0 && (
                          <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 ml-2 shadow-lg">
                            {item.badge}
                          </span>
                        )}
                        {active && (
                          <ChevronRight className="w-4 h-4 text-pink-600" />
                        )}
                      </div>
                      {active && (
                        <p className="text-xs text-pink-500 mt-0.5">{item.description}</p>
                      )}
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Separador */}
          <div className="my-6">
            <div className="h-px bg-gradient-to-r from-transparent via-pink-500/50 to-transparent shadow-lg"
                 style={{
                   boxShadow: `0 0 10px rgba(236, 72, 153, 0.3)`
                 }}></div>
            <p className="px-4 mt-4 text-xs font-bold text-pink-300 uppercase tracking-wider drop-shadow-sm">
              Configurações
            </p>
          </div>

          {/* Menu do usuário */}
          <div className="space-y-2">
            {userMenuItems.map((item) => {
              const Icon = item.icon;
              const active = isActivePath(item.path);
              
              return (
                <motion.div
                  key={item.name}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      active
                        ? 'bg-white text-pink-600 shadow-lg ring-1 ring-pink-300'
                        : 'text-white hover:bg-pink-500/20 hover:backdrop-blur-sm hover:ring-1 hover:ring-pink-400/50'
                    }`}
                    style={active ? {
                      boxShadow: `
                        0 0 30px rgba(236, 72, 153, 0.5),
                        0 0 60px rgba(236, 72, 153, 0.2),
                        0 4px 20px rgba(0, 0, 0, 0.2)
                      `
                    } : {}}
                  >
                    <Icon className={`mr-3 h-5 w-5 ${active ? 'text-pink-600' : 'text-white/90 group-hover:text-white'}`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span>{item.name}</span>
                        {active && (
                          <ChevronRight className="w-4 h-4 text-pink-600" />
                        )}
                      </div>
                      {active && (
                        <p className="text-xs text-pink-500 mt-0.5">{item.description}</p>
                      )}
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </nav>

        {/* Logout button */}
        <div className="p-4 border-t border-pink-500/30 flex-shrink-0">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={handleLogout}
              className="w-full justify-start bg-red-500/30 border border-red-400/50 text-white hover:bg-red-500/50 hover:border-red-400/70 backdrop-blur-sm
                         hover:ring-1 hover:ring-red-400/70 transition-all duration-200"
              style={{
                boxShadow: `0 0 25px rgba(239, 68, 68, 0.4)`
              }}
            >
              <LogOut className="mr-3 h-4 w-4" />
              Sair do Sistema
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top bar */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex h-12 bg-gray-900/95 backdrop-blur-xl border-b border-pink-500/30 shadow-lg
                     shadow-pink-500/20 
                     ring-1 ring-pink-400/30 flex-shrink-0"
          style={{
            boxShadow: `
              0 0 30px rgba(236, 72, 153, 0.2),
              0 4px 20px rgba(0, 0, 0, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.1)
            `
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="px-4 border-r border-pink-500/30 text-white hover:bg-pink-500/20 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-pink-400/50 lg:hidden transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1 flex justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex-1 flex items-center">
              {/* Breadcrumb com Home */}
              <div className="flex items-center space-x-2 text-white">
                {isOnDashboard ? (
                  <div className="flex items-center space-x-1 text-sm text-pink-400">
                    <Home className="w-4 h-4" />
                    <span>Admin</span>
                  </div>
                ) : (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link 
                      to="/admin/dashboard"
                      className="flex items-center space-x-1 text-sm text-gray-400 hover:text-pink-400 transition-colors group p-1 rounded-lg hover:bg-pink-500/10"
                      title="Voltar ao Dashboard (Ctrl+H)"
                    >
                      <Home className="w-4 h-4 group-hover:text-pink-300" />
                      <span>Admin</span>
                    </Link>
                  </motion.div>
                )}
                
                {!isOnDashboard && (
                  <>
                    <ChevronRight className="w-4 h-4 text-pink-400" />
                    <span className="text-sm font-medium drop-shadow-sm">{getCurrentPageTitle()}</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="p-2 text-white hover:bg-pink-500/20 rounded-lg relative backdrop-blur-sm transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-black notification-dot"></span>
                  )}
                </motion.button>

                {/* Notifications dropdown */}
                <AnimatePresence>
                  {notificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl ring-1 ring-pink-400/30 border border-pink-500/20"
                      style={{
                        boxShadow: `
                          0 0 40px rgba(236, 72, 153, 0.3),
                          0 0 80px rgba(236, 72, 153, 0.15),
                          0 20px 40px rgba(0, 0, 0, 0.2)
                        `
                      }}
                    >
                      <div className="p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Notificações</h3>
                        <div className="space-y-4">
                          {notifications.length > 0 ? (
                            notifications.map((notification) => (
                              <div 
                                key={notification.id} 
                                className={`flex items-start space-x-3 p-3 rounded-lg border-l-4 cursor-pointer transition-colors ${
                                  notification.type === 'appointment' ? 'bg-orange-500/20 border-orange-400' :
                                  notification.type === 'payment' ? 'bg-green-500/20 border-green-400' :
                                  'bg-blue-500/20 border-blue-400'
                                } ${!notification.read ? 'ring-1 ring-white/20' : 'opacity-75'}`}
                                onClick={() => markNotificationAsRead(notification.id)}
                              >
                                <div className="flex-shrink-0 mt-0.5">
                                  {notification.type === 'appointment' && <Calendar className="w-5 h-5 text-orange-400" />}
                                  {notification.type === 'payment' && <CreditCard className="w-5 h-5 text-green-400" />}
                                  {notification.type === 'system' && <Bell className="w-5 h-5 text-blue-400" />}
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-white">{notification.title}</p>
                                  <p className="text-xs text-gray-400">{formatNotificationDate(notification.createdAt)}</p>
                                </div>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-red-400 rounded-full flex-shrink-0 mt-2"></div>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="p-8 text-center">
                              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                              <p className="text-gray-300">Nenhuma notificação</p>
                              <p className="text-xs text-gray-500 mt-2">Você está em dia com tudo!</p>
                            </div>
                          )}
                        </div>
                        <div className="mt-6 pt-4 border-t border-pink-500/30">
                          <Link
                            to="/admin/dashboard"
                            className="text-sm text-pink-400 hover:text-pink-300 font-semibold flex items-center transition-colors"
                            onClick={() => setNotificationsOpen(false)}
                          >
                            Ver todas as notificações
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User menu dropdown */}
              <div className="relative">
                <motion.button
                  ref={userButtonRef}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setUserMenuOpen(!userMenuOpen);
                  }}
                  className="flex items-center space-x-3 p-2 text-white hover:bg-pink-500/20 rounded-lg backdrop-blur-sm transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-pink-700 rounded-full flex items-center justify-center shadow-lg ring-1 ring-pink-400/50"
                       style={{
                         boxShadow: `
                           0 0 20px rgba(236, 72, 153, 0.4),
                           0 0 40px rgba(236, 72, 153, 0.2)
                         `
                       }}>
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-white drop-shadow-sm">
                      {user?.name || 'Admin'}
                    </p>
                    <p className="text-xs text-gray-300">
                      {user?.role || 'Administrador'}
                    </p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-white/60 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Page content - CORREÇÃO AQUI */}
        <main className="flex-1 overflow-y-auto bg-black">
          <div className="p-4 max-w-none">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-900/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-pink-500/30 p-4 min-h-[calc(100vh-8rem)]
                         shadow-pink-500/30 
                         ring-1 ring-pink-400/40 
                         hover:ring-pink-400/60 
                         hover:shadow-pink-500/40 
                         transition-all duration-300
                         glow-container mx-auto max-w-7xl"
              style={{
                boxShadow: `
                  0 0 40px rgba(236, 72, 153, 0.3),
                  0 0 80px rgba(236, 72, 153, 0.15),
                  0 0 120px rgba(236, 72, 153, 0.08),
                  inset 0 1px 0 rgba(255, 255, 255, 0.1)
                `
              }}
            >
              {children || <Outlet />}
            </motion.div>
          </div>
        </main>
      </div>

      {/* Dropdown via Portal */}
      <UserDropdownPortal />
    </div>
  );
};

export default AdminLayout;