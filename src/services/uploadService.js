import { apiService } from './api.js'

export const uploadService = {
  /**
   * Sube una imagen a Supabase Storage
   * @param {File} file - El archivo de imagen a subir
   * @param {string} folder - La carpeta donde guardar (ej: 'menu-items', 'categories')
   * @returns {Promise<{url: string}>} - La URL pública de la imagen
   */
  async uploadImage(file, folder = 'menu-items') {
    try {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        throw new Error('El archivo debe ser una imagen')
      }

      // Validar tamaño (máximo 5MB)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        throw new Error('La imagen no debe superar los 5MB')
      }

      // Crear FormData
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)

      // Generar nombre único para el archivo
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(7)
      const fileExtension = file.name.split('.').pop()
      const fileName = `${timestamp}-${randomString}.${fileExtension}`
      formData.append('fileName', fileName)

      // Enviar al backend
      const response = await apiService.post('upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.url) {
        return { url: response.url }
      } else {
        throw new Error('No se recibió URL de la imagen')
      }
    } catch (error) {
      
      throw error
    }
  },

  /**
   * Elimina una imagen de Supabase Storage
   * @param {string} imageUrl - La URL de la imagen a eliminar
   * @returns {Promise<void>}
   */
  async deleteImage(imageUrl) {
    try {
      // Extraer el path del archivo de la URL
      const urlParts = imageUrl.split('/storage/v1/object/public/')
      if (urlParts.length < 2) {
        throw new Error('URL de imagen inválida')
      }

      const filePath = urlParts[1]
      
      await apiService.delete('upload/image', {
        data: { filePath }
      })
    } catch (error) {
      
      // No lanzar error para no interrumpir el flujo si falla el borrado
    }
  },

  /**
   * Valida si una URL es una imagen válida
   * @param {string} url - La URL a validar
   * @returns {Promise<boolean>}
   */
  async validateImageUrl(url) {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => resolve(true)
      img.onerror = () => resolve(false)
      img.src = url
    })
  }
}