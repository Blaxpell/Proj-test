// src/components/RedisTest.jsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const RedisTest = () => {
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);
  const { redisRequest } = useAuth();

  const testConnection = async () => {
    setLoading(true);
    setTestResult('Testando conexão...');
    
    try {
      // Teste 1: PING
      const pingResult = await redisRequest(['PING']);
      setTestResult(prev => prev + '\n✅ PING: ' + JSON.stringify(pingResult));
      
      // Teste 2: SET/GET
      const setResult = await redisRequest(['SET', 'test_key', 'test_value']);
      setTestResult(prev => prev + '\n✅ SET: ' + JSON.stringify(setResult));
      
      const getResult = await redisRequest(['GET', 'test_key']);
      setTestResult(prev => prev + '\n✅ GET: ' + JSON.stringify(getResult));
      
      // Teste 3: Verificar se admin existe
      const adminResult = await redisRequest(['HGET', 'users', 'admin']);
      setTestResult(prev => prev + '\n🔍 Admin exists: ' + (adminResult.result ? 'Sim' : 'Não'));
      
      // Teste 4: Criar usuário admin se não existir
      if (!adminResult.result) {
        const adminData = {
          username: 'admin',
          password: 'fabiane2025temp',
          role: 'super_admin',
          permissions: ['all'],
          name: 'Administrador Principal'
        };
        
        const createAdmin = await redisRequest(['HSET', 'users', 'admin', JSON.stringify(adminData)]);
        setTestResult(prev => prev + '\n✅ Admin criado: ' + JSON.stringify(createAdmin));
      }
      
      // Teste 5: Listar todos os usuários
      const usersResult = await redisRequest(['HGETALL', 'users']);
      setTestResult(prev => prev + '\n👥 Usuários: ' + JSON.stringify(usersResult));
      
      setTestResult(prev => prev + '\n\n🎉 Todos os testes passaram!');
      
    } catch (error) {
      setTestResult(prev => prev + '\n❌ Erro: ' + error.message);
      console.error('Erro no teste Redis:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearData = async () => {
    setLoading(true);
    try {
      await redisRequest(['DEL', 'test_key']);
      setTestResult('Dados de teste limpos');
    } catch (error) {
      setTestResult('Erro ao limpar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const initializeSystem = async () => {
    setLoading(true);
    setTestResult('Inicializando sistema...');
    
    try {
      // Criar usuário admin padrão
      const adminData = {
        username: 'admin',
        password: 'fabiane2025temp',
        role: 'super_admin',
        permissions: ['all'],
        name: 'Administrador Principal',
        createdAt: new Date().toISOString()
      };
      
      const result = await redisRequest(['HSET', 'users', 'admin', JSON.stringify(adminData)]);
      setTestResult('✅ Sistema inicializado! Usuário admin criado.\n' + JSON.stringify(result));
      
    } catch (error) {
      setTestResult('❌ Erro na inicialização: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Teste de Conexão Redis</h2>
      
      <div className="space-y-4">
        <div className="flex space-x-4">
          <button
            onClick={testConnection}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Testando...' : 'Testar Conexão'}
          </button>
          
          <button
            onClick={initializeSystem}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            Inicializar Sistema
          </button>
          
          <button
            onClick={clearData}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          >
            Limpar Teste
          </button>
        </div>
        
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Resultado do Teste:</h3>
          <pre className="whitespace-pre-wrap text-sm font-mono">
            {testResult || 'Clique em "Testar Conexão" para começar'}
          </pre>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2 text-blue-800">Informações do Redis:</h3>
          <p className="text-sm text-blue-700">
            <strong>URL:</strong> https://coherent-escargot-23835.upstash.io<br />
            <strong>Token:</strong> AV0bAAIjcDEyODVlMzY0YTk2ODk0M2JkOTRlNmVmMmUzZTQwMDNkMnAxMA
          </p>
        </div>
      </div>
    </div>
  );
};

export default RedisTest;