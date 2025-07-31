import { apiService } from './api.js'

export const menuService = {
  // Obtener menú completo
  async getMenu() {
    return apiService.get('menu')
  },

  // Añadir una nueva categoría
  async addCategory(data) {
    return apiService.post('menu/category', data)
  },

  // Editar una categoría
  async updateCategory(id, data) {
    return apiService.put(`menu/category/${id}`, data)
  },

  // Eliminar una categoría
  async deleteCategory(id) {
    return apiService.delete(`menu/category/${id}`)
  },

  // Añadir un nuevo item de menú
  async addItem(data) {
    return apiService.post('menu/item', data)
  },

  // Editar un item de menú
  async updateItem(id, data) {
    return apiService.put(`menu/item/${id}`, data)
  },

  // Eliminar un item de menú
  async deleteItem(id) {
    return apiService.delete(`menu/item/${id}`)
  }
} 