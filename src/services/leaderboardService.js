import { apiService } from './api.js'

export const leaderboardService = {
  // Period Management
  async getAllPeriods() {
    return apiService.get('high_score/periods')
  },

  async getPeriod(periodId) {
    return apiService.get(`high_score/periods/${periodId}`)
  },

  async createPeriod(data) {
    return apiService.post('high_score/periods', data)
  },

  async updatePeriod(periodId, data) {
    return apiService.put(`high_score/periods/${periodId}`, data)
  },

  async closePeriod(periodId, topPositions = 1) {
    return apiService.post(`high_score/periods/${periodId}/close`, { topPositions })
  },

  async processExpiredPeriods() {
    return apiService.post('high_score/process-expired')
  },

  // Winner Management
  async getAllWinners(params = {}) {
    return apiService.get('high_score/winners', params)
  },

  async getWinner(winnerId) {
    return apiService.get(`high_score/winners/${winnerId}`)
  },

  async markWinnerClaimed(winnerId) {
    return apiService.post(`high_score/winners/${winnerId}/mark-claimed`)
  },

  async getPeriodWinners(periodId) {
    return apiService.get(`high_score/periods/${periodId}/winners`)
  },

  // Helper functions
  async getActivePeriod(gameId = null) {
    const periods = await this.getAllPeriods()
    if (Array.isArray(periods)) {
      const activePeriods = periods.filter(p => p.is_active)
      if (gameId) {
        return activePeriods.find(p => p.game_id === gameId)
      }
      return activePeriods[0]
    }
    return null
  },

  async getPendingWinners() {
    const winners = await this.getAllWinners()
    if (Array.isArray(winners)) {
      return winners.filter(w => !w.claimed)
    }
    return []
  },

  formatTimeRemaining(endDate) {
    const end = new Date(endDate)
    const now = new Date()
    const diff = end - now

    if (diff <= 0) return 'Periodo terminado'

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    return `${days}d ${hours}h ${minutes}m`
  },

  formatPeriodDates(startDate, endDate) {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const options = { day: '2-digit', month: '2-digit' }
    
    return `${start.toLocaleDateString('es', options)} - ${end.toLocaleDateString('es', options)}`
  }
}