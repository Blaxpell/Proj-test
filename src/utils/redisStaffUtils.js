// src/utils/redisStaffUtils.js
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.VITE_UPSTASH_REDIS_REST_URL,
  token: process.env.VITE_UPSTASH_REDIS_REST_TOKEN,
});

export const redisStaffUtils = {
  // Prefixos para as chaves do Redis
  KEYS: {
    STAFF_IDS: 'staff:ids',
    STAFF_PREFIX: 'staff:',
    STAFF_ACTIVE: 'staff:active',
    STAFF_INACTIVE: 'staff:inactive'
  },

  // Buscar apenas usuários ativos
  async getActiveStaff() {
    try {
      const staffIds = await redis.smembers(this.KEYS.STAFF_IDS);
      const activeStaff = [];

      for (const id of staffIds) {
        const userData = await redis.hgetall(`${this.KEYS.STAFF_PREFIX}${id}`);
        
        // Verifica se o usuário está realmente ativo
        const isActive = userData && 
                        userData.status !== 'inactive' && 
                        userData.status !== 'deleted' &&
                        userData.isActive !== 'false' &&
                        !userData.deletedAt;
        
        if (isActive) {
          activeStaff.push({
            id,
            ...userData
          });
        }
      }

      // Ordena por nome
      return activeStaff.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } catch (error) {
      console.error('Erro ao buscar equipe ativa:', error);
      throw error;
    }
  },

  // Buscar todos os usuários (incluindo inativos)
  async getAllStaff() {
    try {
      const staffIds = await redis.smembers(this.KEYS.STAFF_IDS);
      const allStaff = [];

      for (const id of staffIds) {
        const userData = await redis.hgetall(`${this.KEYS.STAFF_PREFIX}${id}`);
        if (userData && userData.status !== 'deleted') {
          allStaff.push({
            id,
            ...userData
          });
        }
      }

      return allStaff.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } catch (error) {
      console.error('Erro ao buscar toda equipe:', error);
      throw error;
    }
  },

  // Criar novo membro da equipe
  async createStaff(staffData) {
    try {
      // Gera um ID único
      const id = `staff_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const newStaff = {
        ...staffData,
        id,
        status: 'active',
        isActive: 'true',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Salva no Redis
      await redis.hset(`${this.KEYS.STAFF_PREFIX}${id}`, newStaff);
      await redis.sadd(this.KEYS.STAFF_IDS, id);
      await redis.sadd(this.KEYS.STAFF_ACTIVE, id);

      return { success: true, data: newStaff };
    } catch (error) {
      console.error('Erro ao criar membro da equipe:', error);
      throw error;
    }
  },

  // Atualizar membro da equipe
  async updateStaff(staffId, updateData) {
    try {
      const currentData = await redis.hgetall(`${this.KEYS.STAFF_PREFIX}${staffId}`);
      
      if (!currentData) {
        throw new Error('Membro da equipe não encontrado');
      }

      const updatedStaff = {
        ...currentData,
        ...updateData,
        updatedAt: new Date().toISOString()
      };

      await redis.hset(`${this.KEYS.STAFF_PREFIX}${staffId}`, updatedStaff);

      return { success: true, data: updatedStaff };
    } catch (error) {
      console.error('Erro ao atualizar membro da equipe:', error);
      throw error;
    }
  },

  // Soft delete - marca como inativo
  async softDeleteStaff(staffId, deletedBy = 'admin') {
    try {
      const updateData = {
        status: 'inactive',
        isActive: 'false',
        deletedAt: new Date().toISOString(),
        deletedBy
      };

      await redis.hset(`${this.KEYS.STAFF_PREFIX}${staffId}`, updateData);
      
      // Move o ID para a lista de inativos
      await redis.sadd(this.KEYS.STAFF_INACTIVE, staffId);
      await redis.srem(this.KEYS.STAFF_ACTIVE, staffId);

      return { success: true, message: 'Usuário desativado com sucesso' };
    } catch (error) {
      console.error('Erro no soft delete:', error);
      throw error;
    }
  },

  // Hard delete - remove completamente
  async hardDeleteStaff(staffId) {
    try {
      // Remove de todas as listas
      await redis.srem(this.KEYS.STAFF_IDS, staffId);
      await redis.srem(this.KEYS.STAFF_ACTIVE, staffId);
      await redis.srem(this.KEYS.STAFF_INACTIVE, staffId);
      
      // Remove dados do usuário
      await redis.del(`${this.KEYS.STAFF_PREFIX}${staffId}`);
      
      // Remove dados relacionados
      const relatedKeys = [
        `${this.KEYS.STAFF_PREFIX}${staffId}:appointments`,
        `${this.KEYS.STAFF_PREFIX}${staffId}:schedule`,
        `${this.KEYS.STAFF_PREFIX}${staffId}:permissions`,
        `${this.KEYS.STAFF_PREFIX}${staffId}:services`,
        `${this.KEYS.STAFF_PREFIX}${staffId}:availability`,
        `appointments:professional:${staffId}`,
        `schedule:${staffId}`
      ];

      for (const key of relatedKeys) {
        await redis.del(key);
      }

      return { success: true, message: 'Usuário removido permanentemente' };
    } catch (error) {
      console.error('Erro no hard delete:', error);
      throw error;
    }
  },

  // Reativar usuário
  async reactivateStaff(staffId) {
    try {
      const currentData = await redis.hgetall(`${this.KEYS.STAFF_PREFIX}${staffId}`);
      
      if (!currentData) {
        throw new Error('Usuário não encontrado');
      }

      // Remove campos de deleção
      await redis.hdel(`${this.KEYS.STAFF_PREFIX}${staffId}`, 'deletedAt', 'deletedBy');
      
      // Atualiza status
      await redis.hset(`${this.KEYS.STAFF_PREFIX}${staffId}`, {
        status: 'active',
        isActive: 'true',
        reactivatedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      // Move entre listas
      await redis.srem(this.KEYS.STAFF_INACTIVE, staffId);
      await redis.sadd(this.KEYS.STAFF_ACTIVE, staffId);

      return { success: true, message: 'Usuário reativado com sucesso' };
    } catch (error) {
      console.error('Erro ao reativar usuário:', error);
      throw error;
    }
  },

  // Verificar se email já existe
  async checkEmailExists(email, excludeId = null) {
    try {
      const staffIds = await redis.smembers(this.KEYS.STAFF_IDS);
      
      for (const id of staffIds) {
        if (excludeId && id === excludeId) continue;
        
        const userData = await redis.hgetall(`${this.KEYS.STAFF_PREFIX}${id}`);
        if (userData && userData.email === email && userData.status !== 'deleted') {
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao verificar email:', error);
      throw error;
    }
  },

  // Limpar usuários inativos antigos (manutenção)
  async cleanupInactiveStaff(daysOld = 30) {
    try {
      const staffIds = await redis.smembers(this.KEYS.STAFF_INACTIVE);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);
      
      let deletedCount = 0;

      for (const id of staffIds) {
        const userData = await redis.hgetall(`${this.KEYS.STAFF_PREFIX}${id}`);
        
        if (userData && userData.deletedAt) {
          const deletedDate = new Date(userData.deletedAt);
          
          if (deletedDate < cutoffDate) {
            await this.hardDeleteStaff(id);
            deletedCount++;
          }
        }
      }

      return { 
        success: true, 
        message: `${deletedCount} usuários inativos removidos permanentemente` 
      };
    } catch (error) {
      console.error('Erro na limpeza de usuários inativos:', error);
      throw error;
    }
  }
};

export default redisStaffUtils;