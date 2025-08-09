import { apiService } from './api.js'

export const allergenService = {
  // Obtener todos los alérgenos
  async getAllergens() {
    return apiService.get('allergens')
  },

  // Obtener un alérgeno por ID
  async getAllergen(id) {
    return apiService.get(`allergens/${id}`)
  },

  // Crear un nuevo alérgeno
  async createAllergen(data) {
    return apiService.post('allergens', data)
  },

  // Actualizar un alérgeno
  async updateAllergen(id, data) {
    return apiService.put(`allergens/${id}`, data)
  },

  // Eliminar un alérgeno
  async deleteAllergen(id) {
    return apiService.delete(`allergens/${id}`)
  },

  // Subir icono para alérgeno
  async uploadAllergenIcon(id, file) {
    const formData = new FormData()
    formData.append('icon', file)
    return apiService.post(`allergens/${id}/icon`, formData)
  }
}