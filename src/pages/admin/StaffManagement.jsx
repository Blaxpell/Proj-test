import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  Edit, 
  Trash2, 
  Upload,
  Star,
  Phone,
  Mail,
  Scissors,
  Heart,
  Sparkles,
  Eye,
  EyeOff,
  RefreshCw,
  Camera,
  MapPin,
  Clock,
  DollarSign,
  Key,
  User,
  CheckCircle,
  AlertTriangle,
  Plus,
  Settings,
  UserCheck,
  UserCog,
  Briefcase,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

const StaffManagement = () => {
  const { user, hasPermission, createUser } = useAuth();
  const [professionals, setProfessionals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProfessionals, setFilteredProfessionals] = useState([]);
  const [filterGroup, setFilterGroup] = useState('all');
  const [filterType, setFilterType] = useState('all'); // Novo filtro por tipo

  // Estados do formulário expandido
  const [formData, setFormData] = useState({
    // Tipo de usuário (NOVO)
    userType: 'professional', // 'professional' ou 'administrative'
    
    // Dados do profissional
    name: '',
    category: '', // Mudou de 'group' para 'category'
    photo: '',
    specialties: '',
    experience: '',
    price: '',
    phone: '',
    email: '',
    status: 'active',
    bio: '',
    workDays: ['seg', 'ter', 'qua', 'qui', 'sex'],
    startTime: '08:00',
    endTime: '18:00',
    
    // Dados de login
    createLogin: true,
    username: '',
    password: '',
    confirmPassword: '',
    adminRole: 'gerente' // Para usuários administrativos
  });

  // Estados para gerenciar categorias
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    icon: 'Scissors',
    color: 'purple'
  });

  // Ícones disponíveis para categorias
  const availableIcons = [
    { name: 'Scissors', icon: Scissors, label: 'Tesoura' },
    { name: 'Heart', icon: Heart, label: 'Coração' },
    { name: 'Sparkles', icon: Sparkles, label: 'Brilho' },
    { name: 'Star', icon: Star, label: 'Estrela' },
    { name: 'Camera', icon: Camera, label: 'Câmera' },
    { name: 'Briefcase', icon: Briefcase, label: 'Maleta' },
    { name: 'User', icon: User, label: 'Usuário' }
  ];

  // Cores disponíveis para categorias
  const availableColors = [
    { name: 'purple', label: 'Roxo', class: 'bg-purple-100 text-purple-800' },
    { name: 'pink', label: 'Rosa', class: 'bg-pink-100 text-pink-800' },
    { name: 'blue', label: 'Azul', class: 'bg-blue-100 text-blue-800' },
    { name: 'green', label: 'Verde', class: 'bg-green-100 text-green-800' },
    { name: 'yellow', label: 'Amarelo', class: 'bg-yellow-100 text-yellow-800' },
    { name: 'red', label: 'Vermelho', class: 'bg-red-100 text-red-800' },
    { name: 'indigo', label: 'Índigo', class: 'bg-indigo-100 text-indigo-800' },
    { name: 'gray', label: 'Cinza', class: 'bg-gray-100 text-gray-800' }
  ];

  // Tipos de usuário
  const userTypes = [
    {
      id: 'professional',
      label: 'Profissional',
      description: 'Trabalha diretamente com clientes (cabeleireiro, manicure, etc.)',
      icon: Scissors,
      permissions: ['Ver próprio calendário', 'Aprovar agendamentos', 'Criar orçamentos', 'Receber pagamentos']
    },
    {
      id: 'administrative',
      label: 'Administrativo',
      description: 'Staff de apoio (secretária, recepcionista, assistente, etc.)',
      icon: UserCog,
      permissions: ['Ver todos agendamentos', 'Gerenciar clientes', 'Criar orçamentos', 'Ver relatórios']
    }
  ];

  // Dias da semana
  const weekDays = [
    { id: 'seg', name: 'Segunda' },
    { id: 'ter', name: 'Terça' },
    { id: 'qua', name: 'Quarta' },
    { id: 'qui', name: 'Quinta' },
    { id: 'sex', name: 'Sexta' },
    { id: 'sab', name: 'Sábado' },
    { id: 'dom', name: 'Domingo' }
  ];

  // Carregar categorias do Redis
  const loadCategories = async () => {
    try {
      const response = await fetch('https://coherent-escargot-23835.upstash.io/', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer AV0bAAIjcDEyODVlMzY0YTk2ODk0M2JkOTRlNmVmMmUzZTQwMDNkMnAxMA',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(['GET', 'salon_categories']),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.result) {
          const savedCategories = JSON.parse(data.result);
          setCategories(savedCategories);
        } else {
          // Criar categorias padrão se não existirem
          const defaultCategories = [
            { id: 'cabelo', name: 'Cabelo', icon: 'Scissors', color: 'purple' },
            { id: 'unhas', name: 'Unhas', icon: 'Heart', color: 'pink' },
            { id: 'estetica', name: 'Estética', icon: 'Sparkles', color: 'blue' }
          ];
          setCategories(defaultCategories);
          await saveCategories(defaultCategories);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      // Fallback para categorias padrão
      setCategories([
        { id: 'cabelo', name: 'Cabelo', icon: 'Scissors', color: 'purple' },
        { id: 'unhas', name: 'Unhas', icon: 'Heart', color: 'pink' }
      ]);
    }
  };

  // Salvar categorias no Redis
  const saveCategories = async (categoriesToSave) => {
    try {
      const response = await fetch('https://coherent-escargot-23835.upstash.io/', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer AV0bAAIjcDEyODVlMzY0YTk2ODk0M2JkOTRlNmVmMmUzZTQwMDNkMnAxMA',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(['SET', 'salon_categories', JSON.stringify(categoriesToSave)]),
      });

      if (response.ok) {
        setCategories(categoriesToSave);
        toast({
          title: "Categorias atualizadas!",
          description: "As categorias foram salvas com sucesso.",
        });
      }
    } catch (error) {
      console.error('Erro ao salvar categorias:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar categorias",
        variant: "destructive"
      });
    }
  };

  // Adicionar nova categoria
  const addCategory = async () => {
    if (!categoryForm.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome da categoria é obrigatório",
        variant: "destructive"
      });
      return;
    }

    const newCategory = {
      id: categoryForm.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
      name: categoryForm.name,
      icon: categoryForm.icon,
      color: categoryForm.color
    };

    const updatedCategories = [...categories, newCategory];
    await saveCategories(updatedCategories);
    
    setCategoryForm({ name: '', icon: 'Scissors', color: 'purple' });
    setShowCategoryModal(false);
  };

  // Remover categoria
  const removeCategory = async (categoryId) => {
    if (!confirm('Tem certeza que deseja remover esta categoria?')) return;
    
    const updatedCategories = categories.filter(cat => cat.id !== categoryId);
    await saveCategories(updatedCategories);
  };

  // Carregar profissionais do Redis
  const loadProfessionals = async () => {
    setLoading(true);
    try {
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
                  allProfessionals.push(professional);
                }
              }
            } catch (error) {
              console.error(`Erro ao buscar ${key}:`, error);
            }
          }
        }

        setProfessionals(allProfessionals);
        setFilteredProfessionals(allProfessionals);
      }
    } catch (error) {
      console.error('Erro ao carregar profissionais:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar profissionais",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Filtrar profissionais
  useEffect(() => {
    let filtered = professionals;

    if (filterGroup !== 'all') {
      filtered = filtered.filter(prof => prof.category === filterGroup);
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(prof => prof.userType === filterType);
    }

    if (searchTerm) {
      filtered = filtered.filter(prof =>
        prof.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (prof.specialties && prof.specialties.join(' ').toLowerCase().includes(searchTerm.toLowerCase())) ||
        (prof.email && prof.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredProfessionals(filtered);
  }, [professionals, searchTerm, filterGroup, filterType]);

  // Resetar formulário
  const resetForm = () => {
    setFormData({
      userType: 'professional',
      name: '',
      category: categories.length > 0 ? categories[0].id : '',
      photo: '',
      specialties: '',
      experience: '',
      price: '',
      phone: '',
      email: '',
      status: 'active',
      bio: '',
      workDays: ['seg', 'ter', 'qua', 'qui', 'sex'],
      startTime: '08:00',
      endTime: '18:00',
      createLogin: true,
      username: '',
      password: '',
      confirmPassword: '',
      adminRole: 'gerente'
    });
  };

  // Gerar username automaticamente baseado no nome
  const generateUsername = (name) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9]/g, '') // Remove caracteres especiais
      .substring(0, 15); // Limita tamanho
  };

  // Gerar senha aleatória
  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  // Abrir modal de adicionar
  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  // Fechar modais
  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowCategoryModal(false);
    setSelectedProfessional(null);
    resetForm();
  };

  // Salvar novo usuário (profissional ou administrativo)
  const saveNewUser = async () => {
    if (!formData.name) {
      toast({
        title: "Erro",
        description: "Nome é obrigatório",
        variant: "destructive"
      });
      return;
    }

    // Validações específicas por tipo
    if (formData.userType === 'professional' && !formData.category) {
      toast({
        title: "Erro",
        description: "Categoria é obrigatória para profissionais",
        variant: "destructive"
      });
      return;
    }

    // Validações de login
    if (formData.createLogin) {
      if (!formData.username) {
        toast({
          title: "Erro",
          description: "Username é obrigatório para criar login",
          variant: "destructive"
        });
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Erro",
          description: "As senhas não coincidem",
          variant: "destructive"
        });
        return;
      }

      if (formData.password.length < 6) {
        toast({
          title: "Erro",
          description: "A senha deve ter pelo menos 6 caracteres",
          variant: "destructive"
        });
        return;
      }
    }

    try {
      let professionalId = null;
      
      // 1. Se for profissional, criar entrada de profissional
      if (formData.userType === 'professional') {
        professionalId = Date.now();
        
        const newProfessional = {
          id: professionalId,
          name: formData.name,
          category: formData.category, // Usando categoria personalizada
          photo: formData.photo,
          specialties: formData.specialties.split(',').map(s => s.trim()).filter(s => s),
          experience: formData.experience,
          price: formData.price,
          phone: formData.phone,
          email: formData.email,
          status: formData.status,
          bio: formData.bio,
          workDays: formData.workDays,
          startTime: formData.startTime,
          endTime: formData.endTime,
          rating: 5.0,
          hasUserAccount: formData.createLogin,
          username: formData.createLogin ? formData.username : null,
          userType: 'professional', // Novo campo
          createdAt: new Date().toISOString()
        };

        // Salvar profissional no Redis
        const profResponse = await fetch('https://coherent-escargot-23835.upstash.io/', {
          method: 'POST',
          headers: {
            Authorization: 'Bearer AV0bAAIjcDEyODVlMzY0YTk2ODk0M2JkOTRlNmVmMmUzZTQwMDNkMnAxMA',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(['SET', `profissional:${professionalId}`, JSON.stringify(newProfessional)]),
        });

        if (!profResponse.ok) {
          throw new Error('Erro ao salvar profissional');
        }
      }

      // 2. Criar usuário de login (se solicitado)
      if (formData.createLogin) {
        try {
          const userRole = formData.userType === 'professional' ? 'profissional' : formData.adminRole;
          
          await createUser({
            name: formData.name,
            username: formData.username,
            email: formData.email,
            role: userRole,
            password: formData.password,
            professionalId: professionalId, // Só terá valor se for profissional
            userType: formData.userType // Novo campo para distinguir tipos
          });

          const userTypeLabel = formData.userType === 'professional' ? 'Profissional' : 'Usuário administrativo';
          
          toast({
            title: `🎉 ${userTypeLabel} criado!`,
            description: `${formData.name} foi adicionado com acesso ao sistema.`,
          });
          
          // Mostrar credenciais
          setTimeout(() => {
            toast({
              title: "🔑 Credenciais de acesso:",
              description: `Username: ${formData.username} | Senha: ${formData.password}`,
              duration: 10000,
            });
          }, 1000);

        } catch (userError) {
          console.error('Erro ao criar usuário:', userError);
          toast({
            title: "⚠️ Erro ao criar login",
            description: userError.message || "Houve erro ao criar o acesso ao sistema.",
            variant: "destructive"
          });
        }
      } else {
        const userTypeLabel = formData.userType === 'professional' ? 'Profissional' : 'Usuário';
        toast({
          title: `✅ ${userTypeLabel} criado!`,
          description: `${formData.name} foi adicionado sem acesso ao sistema.`,
        });
      }

      closeModals();
      loadProfessionals();

    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar usuário",
        variant: "destructive"
      });
    }
  };

  // Carregar dados ao montar componente
  useEffect(() => {
    loadCategories();
    loadProfessionals();
  }, []);

  // Auto-gerar username quando nome mudar
  useEffect(() => {
    if (formData.createLogin && formData.name) {
      const username = generateUsername(formData.name);
      setFormData(prev => ({ ...prev, username }));
    }
  }, [formData.name, formData.createLogin]);

  // Atualizar categoria padrão quando categorias carregarem
  useEffect(() => {
    if (categories.length > 0 && !formData.category) {
      setFormData(prev => ({ ...prev, category: categories[0].id }));
    }
  }, [categories]);

  // Obter dados da categoria
  const getCategoryData = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (!category) return { name: categoryId, icon: User, color: 'gray' };
    
    const IconComponent = availableIcons.find(i => i.name === category.icon)?.icon || User;
    return {
      ...category,
      icon: IconComponent
    };
  };

  // Obter cor da categoria
  const getCategoryColor = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (!category) return 'bg-gray-100 text-gray-800';
    
    const colorData = availableColors.find(c => c.name === category.color);
    return colorData ? colorData.class : 'bg-gray-100 text-gray-800';
  };

  // Toggle dia de trabalho
  const toggleWorkDay = (day) => {
    const newWorkDays = formData.workDays.includes(day)
      ? formData.workDays.filter(d => d !== day)
      : [...formData.workDays, day];
    
    setFormData({ ...formData, workDays: newWorkDays });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Equipe</h1>
          <p className="text-gray-600">Gerencie profissionais e usuários administrativos</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => setShowCategoryModal(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Categorias
          </Button>
          <Button onClick={openAddModal}>
            <UserPlus className="w-4 h-4 mr-2" />
            Adicionar Pessoa
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-purple-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold">{professionals.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Scissors className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Profissionais</p>
              <p className="text-2xl font-bold">
                {professionals.filter(p => p.userType === 'professional').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <UserCog className="w-8 h-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Administrativos</p>
              <p className="text-2xl font-bold">
                {professionals.filter(p => p.userType === 'administrative').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Key className="w-8 h-8 text-orange-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Com Acesso</p>
              <p className="text-2xl font-bold">
                {professionals.filter(p => p.hasUserAccount).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <input
              type="text"
              placeholder="Buscar por nome, especialidade ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">Todos os tipos</option>
            <option value="professional">Profissionais</option>
            <option value="administrative">Administrativos</option>
          </select>
          
          <select
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">Todas as categorias</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
          
          <Button variant="outline" onClick={loadProfessionals}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Lista de Usuários */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pessoa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Especialidades
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acesso Sistema
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProfessionals.map((professional) => {
                const categoryData = getCategoryData(professional.category);
                const Icon = categoryData.icon;
                
                return (
                  <tr key={professional.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {professional.photo ? (
                            <img className="h-10 w-10 rounded-full object-cover" src={professional.photo} alt={professional.name} />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <Icon className="w-5 h-5 text-gray-600" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {professional.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {professional.email || professional.phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      {professional.userType === 'professional' ? (
                        <Badge className="bg-blue-100 text-blue-800">
                          <Scissors className="w-3 h-3 mr-1" />
                          Profissional
                        </Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-800">
                          <UserCog className="w-3 h-3 mr-1" />
                          Administrativo
                        </Badge>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      {professional.category ? (
                        <Badge className={getCategoryColor(professional.category)}>
                          <Icon className="w-3 h-3 mr-1" />
                          {categoryData.name}
                        </Badge>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {Array.isArray(professional.specialties) && professional.specialties.length > 0
                          ? professional.specialties.slice(0, 2).join(', ')
                          : professional.specialties || '-'
                        }
                        {Array.isArray(professional.specialties) && professional.specialties.length > 2 && (
                          <span className="text-gray-500"> +{professional.specialties.length - 2} mais</span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {professional.hasUserAccount ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            <span className="text-sm text-green-600">Sim</span>
                            {professional.username && (
                              <Badge className="ml-2 bg-green-100 text-green-800 text-xs">
                                @{professional.username}
                              </Badge>
                            )}
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-500">Não</span>
                          </>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {professional.status === 'active' ? (
                          <>
                            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                            <span className="text-sm text-green-600">Ativo</span>
                          </>
                        ) : (
                          <>
                            <div className="w-2 h-2 bg-red-400 rounded-full mr-2"></div>
                            <span className="text-sm text-red-600">Inativo</span>
                          </>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {/* openEditModal(professional) */}}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {/* deleteProfessional(professional) */}}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredProfessionals.length === 0 && (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Nenhuma pessoa encontrada</p>
          </div>
        )}
      </div>

      {/* Modal Gerenciar Categorias */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Gerenciar Categorias</h2>
              <Button variant="ghost" onClick={closeModals}>✕</Button>
            </div>
            
            {/* Lista de categorias existentes */}
            <div className="space-y-4 mb-6">
              <h3 className="font-medium text-gray-800">Categorias Existentes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {categories.map(category => {
                  const IconComponent = availableIcons.find(i => i.name === category.icon)?.icon || User;
                  const colorClass = availableColors.find(c => c.name === category.color)?.class || 'bg-gray-100 text-gray-800';
                  
                  return (
                    <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        <Badge className={colorClass}>
                          <IconComponent className="w-3 h-3 mr-1" />
                          {category.name}
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeCategory(category.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Adicionar nova categoria */}
            <div className="border-t pt-6">
              <h3 className="font-medium text-gray-800 mb-4">Adicionar Nova Categoria</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da Categoria
                  </label>
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                    placeholder="Ex: Massagem, Depilação, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ícone
                    </label>
                    <select
                      value={categoryForm.icon}
                      onChange={(e) => setCategoryForm({...categoryForm, icon: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      {availableIcons.map(icon => (
                        <option key={icon.name} value={icon.name}>{icon.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cor
                    </label>
                    <select
                      value={categoryForm.color}
                      onChange={(e) => setCategoryForm({...categoryForm, color: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      {availableColors.map(color => (
                        <option key={color.name} value={color.name}>{color.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Preview da categoria */}
                {categoryForm.name && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Preview:</p>
                    <Badge className={availableColors.find(c => c.name === categoryForm.color)?.class}>
                      {React.createElement(availableIcons.find(i => i.name === categoryForm.icon)?.icon || User, {
                        className: "w-3 h-3 mr-1"
                      })}
                      {categoryForm.name}
                    </Badge>
                  </div>
                )}
              </div>

              <div className="flex space-x-3 mt-6">
                <Button onClick={addCategory} className="flex-1">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Categoria
                </Button>
                <Button variant="outline" onClick={closeModals} className="flex-1">
                  Fechar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Adicionar Pessoa */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-5xl max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Adicionar Nova Pessoa</h2>
              <Button variant="ghost" onClick={closeModals}>✕</Button>
            </div>

            {/* Seleção do tipo de usuário */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                🎯 Que tipo de pessoa você quer adicionar?
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userTypes.map(type => {
                  const Icon = type.icon;
                  const isSelected = formData.userType === type.id;
                  
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setFormData({...formData, userType: type.id})}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        isSelected 
                          ? 'border-purple-500 bg-purple-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <Icon className={`w-6 h-6 mt-1 ${isSelected ? 'text-purple-600' : 'text-gray-500'}`} />
                        <div className="flex-1">
                          <h4 className={`font-medium ${isSelected ? 'text-purple-900' : 'text-gray-900'}`}>
                            {type.label}
                          </h4>
                          <p className={`text-sm mt-1 ${isSelected ? 'text-purple-700' : 'text-gray-600'}`}>
                            {type.description}
                          </p>
                          <div className="mt-2">
                            <p className={`text-xs font-medium ${isSelected ? 'text-purple-700' : 'text-gray-500'}`}>
                              Poderá:
                            </p>
                            <ul className={`text-xs mt-1 space-y-0.5 ${isSelected ? 'text-purple-600' : 'text-gray-500'}`}>
                              {type.permissions.slice(0, 2).map((perm, idx) => (
                                <li key={idx}>• {perm}</li>
                              ))}
                              {type.permissions.length > 2 && (
                                <li>• +{type.permissions.length - 2} outras</li>
                              )}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Coluna 1: Dados da Pessoa */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                  📋 Dados {formData.userType === 'professional' ? 'do Profissional' : 'da Pessoa'}
                </h3>
                
                {/* Nome */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Digite o nome completo"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                
                {/* Categoria (apenas para profissionais) */}
                {formData.userType === 'professional' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categoria *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                    {categories.length === 0 && (
                      <p className="text-sm text-amber-600 mt-1">
                        ⚠️ Nenhuma categoria criada. Crie categorias primeiro.
                      </p>
                    )}
                  </div>
                )}
                
                {/* Foto URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL da Foto
                  </label>
                  <input
                    type="url"
                    value={formData.photo}
                    onChange={(e) => setFormData({...formData, photo: e.target.value})}
                    placeholder="https://exemplo.com/foto.jpg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                
                {/* Telefone e Email */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="(11) 99999-9999"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="pessoa@email.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Campos específicos para profissionais */}
                {formData.userType === 'professional' && (
                  <>
                    {/* Especialidades */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Especialidades
                      </label>
                      <input
                        type="text"
                        value={formData.specialties}
                        onChange={(e) => setFormData({...formData, specialties: e.target.value})}
                        placeholder="Corte, Escova, Coloração (separado por vírgula)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    
                    {/* Experiência e Preço */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Experiência
                        </label>
                        <input
                          type="text"
                          value={formData.experience}
                          onChange={(e) => setFormData({...formData, experience: e.target.value})}
                          placeholder="5 anos"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Faixa de Preço
                        </label>
                        <input
                          type="text"
                          value={formData.price}
                          onChange={(e) => setFormData({...formData, price: e.target.value})}
                          placeholder="R$ 80-150"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    {/* Horário de Trabalho */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Início
                        </label>
                        <input
                          type="time"
                          value={formData.startTime}
                          onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Fim
                        </label>
                        <input
                          type="time"
                          value={formData.endTime}
                          onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    {/* Dias de Trabalho */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dias de Trabalho
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {weekDays.map(day => (
                          <button
                            key={day.id}
                            type="button"
                            onClick={() => toggleWorkDay(day.id)}
                            className={`px-3 py-1 rounded-md text-sm ${
                              formData.workDays.includes(day.id)
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {day.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Coluna 2: Acesso ao Sistema */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                  🔑 Acesso ao Sistema
                </h3>

                {/* Checkbox para criar login */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      checked={formData.createLogin}
                      onChange={(e) => setFormData({...formData, createLogin: e.target.checked})}
                      className="mt-1 mr-3"
                    />
                    <div>
                      <span className="text-sm font-medium text-blue-900">
                        Criar acesso ao sistema administrativo
                      </span>
                      <p className="text-xs text-blue-700 mt-1">
                        {formData.userType === 'professional' 
                          ? 'Permitir que o profissional acesse o sistema para ver próprio calendário, aprovar agendamentos, fazer orçamentos e receber pagamentos.'
                          : 'Permitir que a pessoa acesse o sistema administrativo para ajudar na gestão do salão.'
                        }
                      </p>
                    </div>
                  </label>
                </div>

                {/* Campos de login (condicionais) */}
                {formData.createLogin && (
                  <div className="space-y-4">
                    {/* Tipo de permissão para administrativos */}
                    {formData.userType === 'administrative' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nível de Acesso
                        </label>
                        <select
                          value={formData.adminRole}
                          onChange={(e) => setFormData({...formData, adminRole: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="gerente">Gerente - Acesso amplo</option>
                          <option value="atendente">Atendente - Acesso limitado</option>
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Username *
                      </label>
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                        placeholder="nome_da_pessoa"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">Gerado automaticamente baseado no nome</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Senha Temporária *
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                          placeholder="Digite uma senha temporária"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            const newPassword = generatePassword();
                            setFormData({...formData, password: newPassword, confirmPassword: newPassword});
                          }}
                        >
                          Gerar
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirmar Senha *
                      </label>
                      <input
                        type="text"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        placeholder="Confirme a senha"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    {/* Preview das credenciais */}
                    {formData.username && formData.password && (
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <h4 className="text-sm font-medium text-green-800 mb-2">
                          📋 Credenciais que serão criadas:
                        </h4>
                        <div className="text-sm text-green-700">
                          <p><strong>Username:</strong> {formData.username}</p>
                          <p><strong>Senha:</strong> {formData.password}</p>
                          <p><strong>Tipo:</strong> {formData.userType === 'professional' ? 'Profissional' : 'Administrativo'}</p>
                          {formData.userType === 'administrative' && (
                            <p><strong>Nível:</strong> {formData.adminRole}</p>
                          )}
                          <p className="text-xs mt-2 text-green-600">
                            ⚠️ Anote essas credenciais para entregar à pessoa!
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Permissões que a pessoa terá */}
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <h4 className="text-sm font-medium text-gray-800 mb-2">
                        🔐 Permissões no sistema:
                      </h4>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {formData.userType === 'professional' ? (
                          <>
                            <li>✅ Ver próprio calendário</li>
                            <li>✅ Aprovar/recusar agendamentos</li>
                            <li>✅ Criar orçamentos</li>
                            <li>✅ Receber pagamentos</li>
                            <li>✅ Alterar própria senha</li>
                            <li>❌ Ver dados de outros profissionais</li>
                          </>
                        ) : (
                          <>
                            <li>✅ Ver todos agendamentos</li>
                            <li>✅ Gerenciar clientes</li>
                            <li>✅ Criar orçamentos</li>
                            <li>✅ Ver relatórios básicos</li>
                            <li>✅ Alterar própria senha</li>
                            <li>{formData.adminRole === 'gerente' ? '✅' : '❌'} Gerenciar configurações</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Bio/Observações */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {formData.userType === 'professional' ? 'Biografia' : 'Observações'}
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    placeholder={formData.userType === 'professional' 
                      ? 'Conte um pouco sobre o profissional...'
                      : 'Observações sobre a pessoa...'
                    }
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-8 pt-6 border-t">
              <Button onClick={saveNewUser} className="flex-1">
                {formData.createLogin ? (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Criar {formData.userType === 'professional' ? 'Profissional' : 'Usuário'} + Login
                  </>
                ) : (
                  <>
                    <User className="w-4 h-4 mr-2" />
                    Criar Apenas {formData.userType === 'professional' ? 'Profissional' : 'Cadastro'}
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={closeModals} className="flex-1">
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default StaffManagement;