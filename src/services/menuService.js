import { apiService } from './api.js'

// Menu Items Service
export const menuService = {
  // Get all menu items with categories
  async getMenuItems() {
    try {
      const response = await apiService.get('menu/items', {
        include: 'categories'
      })
      return response.data || response
    } catch (error) {
      console.error('Error fetching menu items:', error)
      throw error
    }
  },

  // Get menu item by ID
  async getMenuItem(id) {
    try {
      const response = await apiService.get(`menu/items/${id}`, {
        include: 'categories'
      })
      return response.data || response
    } catch (error) {
      console.error('Error fetching menu item:', error)
      throw error
    }
  },

  // Create new menu item
  async createMenuItem(data) {
    try {
      const response = await apiService.post('menu/items', data)
      return response.data || response
    } catch (error) {
      console.error('Error creating menu item:', error)
      throw error
    }
  },

  // Update menu item
  async updateMenuItem(id, data) {
    try {
      const response = await apiService.patch(`menu/items/${id}`, data)
      return response.data || response
    } catch (error) {
      console.error('Error updating menu item:', error)
      throw error
    }
  },

  // Delete menu item
  async deleteMenuItem(id) {
    try {
      const response = await apiService.delete(`menu/items/${id}`)
      return response.data || response
    } catch (error) {
      console.error('Error deleting menu item:', error)
      throw error
    }
  },

  // Get menu items by category
  async getMenuItemsByCategory(categoryId) {
    try {
      const response = await apiService.get('menu/items', {
        category_id: categoryId,
        include: 'categories'
      })
      return response.data || response
    } catch (error) {
      console.error('Error fetching menu items by category:', error)
      throw error
    }
  },

  // Get available menu items
  async getAvailableMenuItems() {
    try {
      const response = await apiService.get('menu/items', {
        is_available: true,
        include: 'categories'
      })
      return response.data || response
    } catch (error) {
      console.error('Error fetching available menu items:', error)
      throw error
    }
  },

  // Get menu statistics
  async getMenuStats() {
    try {
      const response = await apiService.get('menu/stats')
      return response.data || response
    } catch (error) {
      console.error('Error fetching menu stats:', error)
      throw error
    }
  }
}

// Categories Service
export const categoryService = {
  // Get all categories
  async getCategories() {
    try {
      const response = await apiService.get('menu/categories')
      return response.data || response
    } catch (error) {
      console.error('Error fetching categories:', error)
      throw error
    }
  },

  // Get category by ID
  async getCategory(id) {
    try {
      const response = await apiService.get(`menu/categories/${id}`)
      return response.data || response
    } catch (error) {
      console.error('Error fetching category:', error)
      throw error
    }
  },

  // Create new category
  async createCategory(data) {
    try {
      const response = await apiService.post('menu/categories', data)
      return response.data || response
    } catch (error) {
      console.error('Error creating category:', error)
      throw error
    }
  },

  // Update category
  async updateCategory(id, data) {
    try {
      const response = await apiService.patch(`menu/categories/${id}`, data)
      return response.data || response
    } catch (error) {
      console.error('Error updating category:', error)
      throw error
    }
  },

  // Delete category
  async deleteCategory(id) {
    try {
      const response = await apiService.delete(`menu/categories/${id}`)
      return response.data || response
    } catch (error) {
      console.error('Error deleting category:', error)
      throw error
    }
  }
} 