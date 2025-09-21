import { apiService } from './api.js'

export const menuService = {
  // Obtener menú completo (categorías, items y alérgenos)
  async getMenu() {
    return apiService.get('menu')
  },

  // Obtener menú con estructura anidada para usuario
  async getMenuUser() {
    return apiService.get('menu/menuUser')
  },

  // === CATEGORÍAS ===
  // Añadir una nueva categoría
  async addCategory(data) {
    return apiService.post('menu/category', data)
  },

  // Añadir categoría con imagen (multipart)
  async addCategoryWithImage(data, file) {
    try {
      const formData = new FormData()
      
      // Campos requeridos
      formData.append('name', data.name)
      
      // Description es opcional según tu API
      if (data.description) {
        formData.append('description', data.description)
      }
      
      // Type es opcional con enum ['drinks','snacks']
      if (data.type) {
        formData.append('type', data.type)
      }
      
      // Image es opcional
      if (file) {
        formData.append('image', file)
      }
      
      const response = await apiService.postFormData('menu/category', formData)
      return response.data || response
    } catch (error) {
            throw error
    }
  },

  // Editar una categoría
  async updateCategory(id, data) {
    return apiService.put(`menu/category/${id}`, data)
  },

  // Editar categoría con imagen (multipart)
  async updateCategoryWithImage(id, data, file) {
    try {
      const formData = new FormData()
      
      // Campos requeridos para PUT
      formData.append('name', data.name)
      formData.append('description', data.description || '')
      
      // Type es opcional
      if (data.type) {
        formData.append('type', data.type)
      }
      
      // Image es opcional
      if (file) {
        formData.append('image', file)
      }
      
      const response = await apiService.putFormData(`menu/category/${id}`, formData)
      return response.data || response
    } catch (error) {
            throw error
    }
  },

  // Eliminar una categoría
  async deleteCategory(id) {
    return apiService.delete(`menu/category/${id}`)
  },

  // === ITEMS DE MENÚ ===
  // Añadir un nuevo item de menú
  async addItem(data) {
    return apiService.post('menu/item', data)
  },

  // Añadir un nuevo item con imagen (multipart)
  async addItemWithImage(data, file) {
    const formData = new FormData()
    // Campos básicos
    formData.append('name', data.name)
    formData.append('description', data.description)
    formData.append('price', String(data.price))
    formData.append('category_id', data.category_id)
    formData.append('is_available', String(Boolean(data.is_available)))
    // Imagen
    if (file) {
      formData.append('image', file)
      // opcional: carpeta
      if (data.folder) formData.append('folder', data.folder)
    }
    return apiService.postFormData('menu/item', formData)
  },

  // Editar un item de menú
  async updateItem(id, data) {
    // If image_url is empty or null, replace with blank image
    const dataToSend = {...data}
    if (!dataToSend.image_url) {
      dataToSend.image_url = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
    }
    return apiService.put(`menu/item/${id}`, dataToSend)
  },

  // Editar un item con imagen (multipart)
  async updateItemWithImage(id, data, file) {
    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('description', data.description)
    formData.append('price', String(data.price))
    formData.append('category_id', data.category_id)
    formData.append('is_available', String(Boolean(data.is_available)))
    
    if (file) {
      // New image file to upload
      formData.append('image', file)
      if (data.folder) formData.append('folder', data.folder)
    } else if (data.image_url) {
      // Keep or update image URL (including blank image)
      formData.append('image_url', data.image_url)
    } else {
      // No image at all - send blank image
      const blankImageUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
      formData.append('image_url', blankImageUrl)
    }
    
    return apiService.putFormData(`menu/item/${id}`, formData)
  },

  // Eliminar un item de menú
  async deleteItem(id) {
    return apiService.delete(`menu/item/${id}`)
  },

  // === ALÉRGENOS ===
  // Añadir un nuevo alérgeno
  async addAllergen(data) {
    return apiService.post('menu/allergen', data)
  },

  // Editar un alérgeno
  async updateAllergen(id, data) {
    return apiService.put(`menu/allergen/${id}`, data)
  },

  // Eliminar un alérgeno
  async deleteAllergen(id) {
    return apiService.delete(`menu/allergen/${id}`)
  }
} 