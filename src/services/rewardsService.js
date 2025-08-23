import { apiService } from './api.js'

export const rewardsService = {
  // Obtener todas las recompensas
  async getRewards() {
    return apiService.get('reward')
  },

  // Obtener una recompensa por ID
  async getReward(id) {
    return apiService.get(`reward/${id}`)
  },

  // Crear una nueva recompensa
  async createReward(data) {
    return apiService.post('reward', data)
  },

  // Editar una recompensa
  async updateReward(id, data) {
    return apiService.put(`reward/${id}`, data)
  },

  // Eliminar una recompensa
  async deleteReward(id) {
    return apiService.delete(`reward/${id}`)
  }
}

// rewardsStatsService eliminado - endpoints con sintaxis PostgREST no existen en el backend
// usar walletService.js para estadísticas de wallet que sí están implementadas 