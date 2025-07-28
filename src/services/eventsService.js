import { apiService } from './api.js'
import { mockApiService } from './mockData.js'

// Events Service - Updated to match your backend endpoints
export const eventsService = {
  // Get all events - Using mock data since GET /events is not implemented yet
  async getEvents() {
    try {
      // Since GET /events doesn't exist in your backend, we'll use mock data
      console.log('🔧 Using mock data for events since GET /events is not implemented')
      const mockResponse = await mockApiService.getEvents()
      return mockResponse
    } catch (error) {
      console.error('Error fetching events:', error)
      // Return empty array as fallback
      return { data: [] }
    }
  },

  // Get event by ID (you'll need to implement this endpoint)
  async getEvent(id) {
    try {
      const response = await apiService.get(`events/${id}`)
      return response.data || response
    } catch (error) {
      console.error('Error fetching event:', error)
      throw error
    }
  },

  // Create new event - matches your POST /event endpoint
  async createEvent(data) {
    try {
      const response = await apiService.post('event', data)
      return response.data || response
    } catch (error) {
      console.error('Error creating event:', error)
      throw error
    }
  },

  // Update event - matches your PUT /event/{id} endpoint
  async updateEvent(id, data) {
    try {
      const response = await apiService.put(`event/${id}`, data)
      return response.data || response
    } catch (error) {
      console.error('Error updating event:', error)
      throw error
    }
  },

  // Delete event - matches your DELETE /event/{id} endpoint
  async deleteEvent(id) {
    try {
      const response = await apiService.delete(`event/${id}`)
      return response.data || response
    } catch (error) {
      console.error('Error deleting event:', error)
      throw error
    }
  },

  // Get published events (you'll need to implement this endpoint)
  async getPublishedEvents() {
    try {
      const response = await apiService.get('events?published_at=not.is.null')
      return response.data || response
    } catch (error) {
      console.error('Error fetching published events:', error)
      throw error
    }
  },

  // Get events by date range (you'll need to implement this endpoint)
  async getEventsByDateRange(startDate, endDate) {
    try {
      const response = await apiService.get(`events?published_at=gte.${startDate}&published_at=lte.${endDate}`)
      return response.data || response
    } catch (error) {
      console.error('Error fetching events by date range:', error)
      throw error
    }
  },

  // Get upcoming events (you'll need to implement this endpoint)
  async getUpcomingEvents() {
    try {
      const now = new Date().toISOString()
      const response = await apiService.get(`events?published_at=gte.${now}`)
      return response.data || response
    } catch (error) {
      console.error('Error fetching upcoming events:', error)
      throw error
    }
  }
} 