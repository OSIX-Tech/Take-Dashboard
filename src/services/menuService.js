import { apiService } from './api.js'
import { mockApiService } from './mockData.js'

// Menu Service - Updated to match your backend endpoints exactly
export const menuService = {
  // Get complete menu (categories and items) - matches your GET /menu endpoint
  async getMenu() {
    try {
      const response = await apiService.get('menu')
      return response.data || response
    } catch (error) {
      console.error('Error fetching menu:', error)
      // Fallback to mock data if backend is not available
      console.log('🔧 Falling back to mock data for menu')
      return mockApiService.getMenuItems()
    }
  },

  // Get menu items from the complete menu response
  async getMenuItems() {
    try {
      const menuResponse = await this.getMenu()
      // Extract items from the complete menu response
      return menuResponse.items || menuResponse
    } catch (error) {
      console.error('Error fetching menu items:', error)
      throw error
    }
  },

  // Get categories from the complete menu response
  async getCategories() {
    try {
      const menuResponse = await this.getMenu()
      // Extract categories from the complete menu response
      return menuResponse.categories || []
    } catch (error) {
      console.error('Error fetching categories:', error)
      throw error
    }
  },

  // Create new menu item - matches your POST /menu/item endpoint
  async createMenuItem(data) {
    try {
      const response = await apiService.post('menu/item', data)
      return response.data || response
    } catch (error) {
      console.error('Error creating menu item:', error)
      throw error
    }
  },

  // Update menu item - matches your PUT /menu/item/{id} endpoint
  async updateMenuItem(id, data) {
    try {
      const response = await apiService.put(`menu/item/${id}`, data)
      return response.data || response
    } catch (error) {
      console.error('Error updating menu item:', error)
      throw error
    }
  },

  // Delete menu item - matches your DELETE /menu/item/{id} endpoint
  async deleteMenuItem(id) {
    try {
      const response = await apiService.delete(`menu/item/${id}`)
      return response.data || response
    } catch (error) {
      console.error('Error deleting menu item:', error)
      throw error
    }
  },

  // Create new category - matches your POST /menu/category endpoint
  async createCategory(data) {
    try {
      const response = await apiService.post('menu/category', data)
      return response.data || response
    } catch (error) {
      console.error('Error creating category:', error)
      throw error
    }
  },

  // Update category - matches your PUT /menu/category/{id} endpoint
  async updateCategory(id, data) {
    try {
      const response = await apiService.put(`menu/category/${id}`, data)
      return response.data || response
    } catch (error) {
      console.error('Error updating category:', error)
      throw error
    }
  },

  // Delete category - matches your DELETE /menu/category/{id} endpoint
  async deleteCategory(id) {
    try {
      const response = await apiService.delete(`menu/category/${id}`)
      return response.data || response
    } catch (error) {
      console.error('Error deleting category:', error)
      throw error
    }
  },

  // Get menu items by category (filter from complete menu)
  async getMenuItemsByCategory(categoryId) {
    try {
      const menuItems = await this.getMenuItems()
      return menuItems.filter(item => item.category_id === categoryId)
    } catch (error) {
      console.error('Error fetching menu items by category:', error)
      throw error
    }
  },

  // Get available menu items (filter from complete menu)
  async getAvailableMenuItems() {
    try {
      const menuItems = await this.getMenuItems()
      return menuItems.filter(item => item.is_available === true)
    } catch (error) {
      console.error('Error fetching available menu items:', error)
      throw error
    }
  },

  // Calculate menu statistics from complete menu
  async getMenuStats() {
    try {
      const menuItems = await this.getMenuItems()
      const categories = await this.getCategories()
      
      const totalItems = menuItems.length
      const availableItems = menuItems.filter(item => item.is_available).length
      const unavailableItems = totalItems - availableItems
      const totalValue = menuItems.reduce((sum, item) => sum + (item.price || 0), 0)
      const averagePrice = totalItems > 0 ? totalValue / totalItems : 0
      const highestPrice = Math.max(...menuItems.map(item => item.price || 0))
      
      return {
        total_items: totalItems,
        available_items: availableItems,
        unavailable_items: unavailableItems,
        total_value: totalValue,
        average_price: averagePrice,
        highest_price: highestPrice,
        categories_count: categories.length
      }
    } catch (error) {
      console.error('Error calculating menu stats:', error)
      throw error
    }
  }
}

// Categories Service - Updated to match your API endpoints
export const categoryService = {
  // Get all categories from the complete menu
  async getCategories() {
    try {
      const menuResponse = await apiService.get('menu')
      return menuResponse.categories || []
    } catch (error) {
      console.error('Error fetching categories:', error)
      throw error
    }
  },

  // Get category by ID (filter from complete menu)
  async getCategory(id) {
    try {
      const categories = await this.getCategories()
      return categories.find(cat => cat.id === id)
    } catch (error) {
      console.error('Error fetching category:', error)
      throw error
    }
  },

  // Create new category - matches your POST /menu/category endpoint
  async createCategory(data) {
    try {
      const response = await apiService.post('menu/category', data)
      return response.data || response
    } catch (error) {
      console.error('Error creating category:', error)
      throw error
    }
  },

  // Update category - matches your PUT /menu/category/{id} endpoint
  async updateCategory(id, data) {
    try {
      const response = await apiService.put(`menu/category/${id}`, data)
      return response.data || response
    } catch (error) {
      console.error('Error updating category:', error)
      throw error
    }
  },

  // Delete category - matches your DELETE /menu/category/{id} endpoint
  async deleteCategory(id) {
    try {
      const response = await apiService.delete(`menu/category/${id}`)
      return response.data || response
    } catch (error) {
      console.error('Error deleting category:', error)
      throw error
    }
  }
} 