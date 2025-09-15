import { apiService } from './api.js'

export const leaderboardService = {
  // Period Management
  async getAllPeriods(gameId = null) {
    const params = gameId ? { gameId } : {}
    const response = await apiService.get('high_score/periods', params)
    return response.data || response
  },

  async getPeriod(periodId) {
    return await apiService.get(`high_score/periods/${periodId}`)
  },

  async createPeriod(data) {
    // Convert camelCase to snake_case for backend
    const requestBody = {
      game_id: data.gameId,
      duration_days: data.durationDays,
      auto_restart: data.autoRestart
    }
    return await apiService.post('high_score/periods', requestBody)
  },

  async updatePeriod(periodId, data) {
    // Convert camelCase to snake_case for backend if needed
    const requestBody = {
      end_date: data.end_date,
      auto_restart: data.auto_restart
    }
    return await apiService.put(`high_score/periods/${periodId}`, requestBody)
  },

  async closePeriod(periodId, topPositions = 1) {
    const response = await apiService.post(`high_score/periods/${periodId}/close`, { topPositions })
    return response.data || response
  },

  async processExpiredPeriods() {
    const response = await apiService.post('high_score/process-expired')
    return response.data || response
  },

  // Winner Management
  async getAllWinners(params = {}) {
    const response = await apiService.get('high_score/winners', params)
    return response.data || response
  },

  async getWinner(winnerId) {
    return await apiService.get(`high_score/winners/${winnerId}`)
  },

  async markWinnerClaimed(winnerId) {
    const response = await apiService.post(`high_score/winners/${winnerId}/mark-claimed`)
    return response.data || response
  },

  async getPeriodWinners(periodId) {
    const response = await apiService.get(`high_score/periods/${periodId}/winners`)
    return response.data || response
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