import { apiService } from './api.js'

export const leaderboardService = {
  // Period Management
  async getAllPeriods(gameId = null) {
    console.log('🎯 [LeaderboardService] getAllPeriods called with gameId:', gameId)
    const params = gameId ? { gameId } : {}
    const url = 'high_score/periods'
    console.log('🔗 [LeaderboardService] Request URL:', url)
    console.log('📦 [LeaderboardService] Request params:', params)

    try {
      const response = await apiService.get(url, params)
      console.log('✅ [LeaderboardService] getAllPeriods response:', response)
      return response.data || response
    } catch (error) {
      console.error('❌ [LeaderboardService] getAllPeriods error:', error)
      throw error
    }
  },

  async getPeriod(periodId) {
    return await apiService.get(`high_score/periods/${periodId}`)
  },

  async createPeriod(data) {
    console.log('🎯 [LeaderboardService] createPeriod called with data:', data)
    // Convert camelCase to snake_case for backend
    const requestBody = {
      game_id: data.gameId,
      duration_days: data.durationDays,
      auto_restart: data.autoRestart
    }
    const url = 'high_score/periods'
    console.log('🔗 [LeaderboardService] POST URL:', url)
    console.log('📦 [LeaderboardService] Request body:', requestBody)

    try {
      const response = await apiService.post(url, requestBody)
      console.log('✅ [LeaderboardService] createPeriod response:', response)
      return response
    } catch (error) {
      console.error('❌ [LeaderboardService] createPeriod error:', error)
      throw error
    }
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
    console.log('🎯 [LeaderboardService] closePeriod called with periodId:', periodId, 'topPositions:', topPositions)
    const url = `high_score/periods/${periodId}/close`
    console.log('🔗 [LeaderboardService] POST URL:', url)

    try {
      const response = await apiService.post(url, { topPositions })
      console.log('✅ [LeaderboardService] closePeriod response:', response)
      return response.data || response
    } catch (error) {
      console.error('❌ [LeaderboardService] closePeriod error:', error)
      throw error
    }
  },

  async processExpiredPeriods() {
    console.log('🎯 [LeaderboardService] processExpiredPeriods called')
    const url = 'high_score/process-expired'
    console.log('🔗 [LeaderboardService] POST URL:', url)

    try {
      const response = await apiService.post(url)
      console.log('✅ [LeaderboardService] processExpiredPeriods response:', response)
      return response.data || response
    } catch (error) {
      console.error('❌ [LeaderboardService] processExpiredPeriods error:', error)
      throw error
    }
  },

  // Winner Management
  async getAllWinners(params = {}) {
    console.log('🎯 [LeaderboardService] getAllWinners called with params:', params)
    const url = 'high_score/winners'
    console.log('🔗 [LeaderboardService] Request URL:', url)

    try {
      const response = await apiService.get(url, params)
      console.log('✅ [LeaderboardService] getAllWinners response:', response)
      return response.data || response
    } catch (error) {
      console.error('❌ [LeaderboardService] getAllWinners error:', error)
      throw error
    }
  },

  async getWinner(winnerId) {
    return await apiService.get(`high_score/winners/${winnerId}`)
  },

  async markWinnerClaimed(winnerId) {
    console.log('🎯 [LeaderboardService] markWinnerClaimed called with winnerId:', winnerId)
    const url = `high_score/winners/${winnerId}/mark-claimed`
    console.log('🔗 [LeaderboardService] POST URL:', url)

    try {
      const response = await apiService.post(url)
      console.log('✅ [LeaderboardService] markWinnerClaimed response:', response)
      return response.data || response
    } catch (error) {
      console.error('❌ [LeaderboardService] markWinnerClaimed error:', error)
      throw error
    }
  },

  async getPeriodWinners(periodId) {
    console.log('🎯 [LeaderboardService] getPeriodWinners called with periodId:', periodId)
    const url = `high_score/periods/${periodId}/winners`
    console.log('🔗 [LeaderboardService] Request URL:', url)

    try {
      const response = await apiService.get(url)
      console.log('✅ [LeaderboardService] getPeriodWinners response:', response)
      return response.data || response
    } catch (error) {
      console.error('❌ [LeaderboardService] getPeriodWinners error:', error)
      throw error
    }
  },

  // Helper functions
  async getActivePeriod(gameId = null) {
    console.log('🔍 [LeaderboardService] getActivePeriod called with gameId:', gameId)
    try {
      const periods = await this.getAllPeriods()
      console.log('📊 [LeaderboardService] getActivePeriod - periods received:', periods)
      if (Array.isArray(periods)) {
        const activePeriods = periods.filter(p => p.is_active)
        console.log('🎯 [LeaderboardService] Active periods found:', activePeriods.length)
        if (gameId) {
          const period = activePeriods.find(p => p.game_id === gameId)
          console.log('✨ [LeaderboardService] Period for gameId', gameId, ':', period)
          return period
        }
        console.log('✨ [LeaderboardService] Returning first active period:', activePeriods[0])
        return activePeriods[0]
      }
      console.log('⚠️ [LeaderboardService] No periods array received')
      return null
    } catch (error) {
      console.error('❌ [LeaderboardService] getActivePeriod error:', error)
      return null
    }
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