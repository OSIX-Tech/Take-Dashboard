import { apiService } from './api.js'
import { mockApiService } from './mockData.js'
import { uploadService } from './uploadService.js'

// Events Service - Updated to match your backend endpoints exactly
export const eventsService = {
  // Get all events
  async getEvents() {
    try {
      const response = await apiService.get('event')
      return response.data || response
    } catch (error) {
      console.error('Error fetching events:', error)
      // Fallback to mock data if backend is not available
      console.log('🔧 Falling back to mock data for events')
      return mockApiService.getEvents()
    }
  },

  // Get event by ID
  async getEvent(id) {
    try {
      const response = await apiService.get(`event/${id}`)
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

  // Create event with image
  async createEventWithImage(eventData, imageFile) {
    try {
      const formData = new FormData()
      
      // Add event fields directly (not as JSON)
      formData.append('title', eventData.title)
      formData.append('content', eventData.content)
      
      // Add published_at if provided
      if (eventData.published_at) {
        formData.append('published_at', eventData.published_at)
      }
      
      // Add link_ev if provided
      if (eventData.link_ev) {
        formData.append('link_ev', eventData.link_ev)
      }
      
      // Add image file if provided
      if (imageFile) {
        formData.append('image', imageFile)
      }
      
      const response = await apiService.postFormData('event', formData)
      return response.data || response
    } catch (error) {
      console.error('Error creating event with image:', error)
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

  // Update event with image
  async updateEventWithImage(id, eventData, imageFile) {
    try {
      const formData = new FormData()
      
      // Add event fields directly (not as JSON)
      formData.append('title', eventData.title)
      formData.append('content', eventData.content)
      
      // Add published_at if provided
      if (eventData.published_at) {
        formData.append('published_at', eventData.published_at)
      }
      
      // Add link_ev if provided
      if (eventData.link_ev) {
        formData.append('link_ev', eventData.link_ev)
      }
      
      // Add image file if provided
      if (imageFile) {
        formData.append('image', imageFile)
      }
      
      const response = await apiService.putFormData(`event/${id}`, formData)
      return response.data || response
    } catch (error) {
      console.error('Error updating event with image:', error)
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

  // Get events by status
  async getEventsByStatus(status) {
    try {
      const events = await this.getEvents()
      return events.filter(event => event.status === status)
    } catch (error) {
      console.error('Error fetching events by status:', error)
      throw error
    }
  },

  // Get upcoming events
  async getUpcomingEvents() {
    try {
      const events = await this.getEvents()
      const now = new Date()
      return events.filter(event => new Date(event.published_at) > now)
    } catch (error) {
      console.error('Error fetching upcoming events:', error)
      throw error
    }
  },

  // Get past events
  async getPastEvents() {
    try {
      const events = await this.getEvents()
      const now = new Date()
      return events.filter(event => new Date(event.published_at) < now)
    } catch (error) {
      console.error('Error fetching past events:', error)
      throw error
    }
  },

  // Calculate event statistics
  async getEventStats() {
    try {
      const events = await this.getEvents()
      
      const totalEvents = events.length
      const upcomingEvents = events.filter(event => new Date(event.published_at) > new Date()).length
      const pastEvents = totalEvents - upcomingEvents
      const activeEvents = events.filter(event => event.status === 'active').length
      const completedEvents = events.filter(event => event.status === 'completed').length
      
      return {
        total_events: totalEvents,
        upcoming_events: upcomingEvents,
        past_events: pastEvents,
        active_events: activeEvents,
        completed_events: completedEvents
      }
    } catch (error) {
      console.error('Error calculating event stats:', error)
      throw error
    }
  }
} 