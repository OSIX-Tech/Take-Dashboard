import { apiService } from './api.js'

export const eventsService = {
  // Get all events
  async getEvents() {
    return apiService.get('events')
  },

  // Get event by ID
  async getEvent(id) {
    return apiService.get(`events?id=eq.${id}`)
  },

  // Create new event
  async createEvent(data) {
    return apiService.post('events', data)
  },

  // Update event
  async updateEvent(id, data) {
    return apiService.patch(`events?id=eq.${id}`, data)
  },

  // Delete event
  async deleteEvent(id) {
    return apiService.delete(`events?id=eq.${id}`)
  },

  // Get published events
  async getPublishedEvents() {
    return apiService.get('events?published_at=not.is.null')
  },

  // Get events by date range
  async getEventsByDateRange(startDate, endDate) {
    return apiService.get(`events?published_at=gte.${startDate}&published_at=lte.${endDate}`)
  },

  // Get upcoming events
  async getUpcomingEvents() {
    const now = new Date().toISOString()
    return apiService.get(`events?published_at=gte.${now}`)
  }
} 