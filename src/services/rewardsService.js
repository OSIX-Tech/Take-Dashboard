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

  // Crear una nueva recompensa (ya no se usa, mantenido por compatibilidad)
  async createReward(data) {
    // Redirigir a createRewardWithImage ya que el backend siempre espera multipart
    return this.createRewardWithImage(data, null)
  },

  // Crear recompensa con imagen
  async createRewardWithImage(rewardData, imageFile) {
    try {
      const formData = new FormData()
      
      // Add reward fields directly (not as JSON)
      formData.append('name', rewardData.name)
      formData.append('description', rewardData.description)
      formData.append('required_seals', String(rewardData.required_seals))
      
      // Add image file if provided
      if (imageFile) {
        formData.append('image', imageFile)
      }
      
      const response = await apiService.postFormData('reward', formData)
      return response.data || response
    } catch (error) {
      console.error('Error creating reward with image:', error)
      throw error
    }
  },

  // Editar una recompensa (ya no se usa, mantenido por compatibilidad)
  async updateReward(id, data) {
    // Redirigir a updateRewardWithImage ya que el backend siempre espera multipart
    return this.updateRewardWithImage(id, data, null)
  },

  // Actualizar recompensa con imagen (siempre usa multipart)
  async updateRewardWithImage(id, rewardData, imageFile) {
    try {
      const formData = new FormData()
      
      // Add reward fields - all optional for PUT
      if (rewardData.name !== undefined) {
        formData.append('name', rewardData.name)
      }
      if (rewardData.description !== undefined) {
        formData.append('description', rewardData.description)
      }
      if (rewardData.required_seals !== undefined) {
        formData.append('required_seals', String(rewardData.required_seals))
      }
      
      // Add image file if provided
      if (imageFile) {
        formData.append('image', imageFile)
      }
      
      const response = await apiService.putFormData(`reward/${id}`, formData)
      return response.data || response
    } catch (error) {
      console.error('Error updating reward with image:', error)
      throw error
    }
  },

  // Eliminar una recompensa
  async deleteReward(id) {
    return apiService.delete(`reward/${id}`)
  }
}

// rewardsStatsService eliminado - endpoints con sintaxis PostgREST no existen en el backend
// usar walletService.js para estadísticas de wallet que sí están implementadas 