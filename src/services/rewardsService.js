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

  // Crear recompensa con imagen
  async createRewardWithImage(data, imageFile) {
    const formData = new FormData()
    
    // Add all fields to FormData
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key])
      }
    })
    
    // Add image file if provided
    if (imageFile) {
      formData.append('image', imageFile)
    }
    
    return apiService.post('reward/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // Editar una recompensa
  async updateReward(id, data) {
    return apiService.put(`reward/${id}`, data)
  },

  // Actualizar recompensa con imagen
  async updateRewardWithImage(id, data, imageFile) {
    const formData = new FormData()
    
    // Add all fields to FormData
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key])
      }
    })
    
    // Add image file if provided
    if (imageFile) {
      formData.append('image', imageFile)
    }
    
    return apiService.put(`reward/${id}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // Eliminar una recompensa
  async deleteReward(id) {
    return apiService.delete(`reward/${id}`)
  }
}

// rewardsStatsService eliminado - endpoints con sintaxis PostgREST no existen en el backend
// usar walletService.js para estadísticas de wallet que sí están implementadas 