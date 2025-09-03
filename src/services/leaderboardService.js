import { apiService } from './api.js'

// Mock data para desarrollo mientras el backend implementa los endpoints
const mockPeriods = [
  {
    id: 'mock-period-1',
    game_id: 'flappy-bird-1',
    start_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    duration_days: 7,
    is_active: true,
    auto_restart: true,
    games: { name: 'Flappy Bird' }
  },
  {
    id: 'mock-period-2',
    game_id: 'flappy-bird-1',
    start_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    duration_days: 7,
    is_active: false,
    auto_restart: true,
    games: { name: 'Flappy Bird' }
  },
  {
    id: 'mock-period-3',
    game_id: 'flappy-bird-1',
    start_date: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString(),
    duration_days: 7,
    is_active: false,
    auto_restart: true,
    games: { name: 'Flappy Bird' }
  },
  {
    id: 'mock-period-4',
    game_id: 'flappy-bird-1',
    start_date: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000).toISOString(),
    duration_days: 7,
    is_active: false,
    auto_restart: false,
    games: { name: 'Flappy Bird' }
  }
]

const mockWinners = [
  {
    id: 'mock-winner-1',
    position: 1,
    final_score: 4850,
    claimed: false,
    claimed_at: null,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    users: {
      name: 'Carlos Martínez',
      email: 'carlos@example.com'
    },
    leaderboard_periods: {
      id: 'mock-period-2',
      start_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      end_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      games: { name: 'Flappy Bird' }
    }
  },
  {
    id: 'mock-winner-2',
    position: 1,
    final_score: 5200,
    claimed: true,
    claimed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString(),
    users: {
      name: 'Ana García',
      email: 'ana@example.com'
    },
    leaderboard_periods: {
      id: 'mock-period-3',
      start_date: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000).toISOString(),
      end_date: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString(),
      games: { name: 'Flappy Bird' }
    }
  },
  {
    id: 'mock-winner-3',
    position: 1,
    final_score: 3900,
    claimed: false,
    claimed_at: null,
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    users: {
      name: 'Luis Rodríguez',
      email: 'luis@example.com'
    },
    leaderboard_periods: {
      id: 'mock-period-4',
      start_date: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString(),
      end_date: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000).toISOString(),
      games: { name: 'Flappy Bird' }
    }
  },
  {
    id: 'mock-winner-4',
    position: 1,
    final_score: 6100,
    claimed: false,
    claimed_at: null,
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    users: {
      name: 'María López',
      email: 'maria@example.com'
    },
    leaderboard_periods: {
      id: 'mock-period-5',
      start_date: new Date(Date.now() - 38 * 24 * 60 * 60 * 1000).toISOString(),
      end_date: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString(),
      games: { name: 'Flappy Bird' }
    }
  },
  {
    id: 'mock-winner-5',
    position: 1,
    final_score: 7250,
    claimed: true,
    claimed_at: new Date().toISOString(),
    created_at: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
    users: {
      name: 'Pedro Sánchez',
      email: 'pedro@example.com'
    },
    leaderboard_periods: {
      id: 'mock-period-6',
      start_date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      end_date: new Date(Date.now() - 38 * 24 * 60 * 60 * 1000).toISOString(),
      games: { name: 'Flappy Bird' }
    }
  }
]

// Helper para simular delay de red
const simulateDelay = () => new Promise(resolve => setTimeout(resolve, 300))

export const leaderboardService = {
  // Period Management
  async getAllPeriods() {
    try {
      return await apiService.get('high_score/periods')
    } catch (error) {
      console.warn('Using mock data for periods:', error.message)
      await simulateDelay()
      return [...mockPeriods]
    }
  },

  async getPeriod(periodId) {
    try {
      return await apiService.get(`high_score/periods/${periodId}`)
    } catch (error) {
      console.warn('Using mock data for period:', error.message)
      await simulateDelay()
      return mockPeriods.find(p => p.id === periodId) || null
    }
  },

  async createPeriod(data) {
    try {
      return await apiService.post('high_score/periods', data)
    } catch (error) {
      console.warn('Mock: Creating period locally', error.message)
      await simulateDelay()
      const newPeriod = {
        id: `mock-period-${Date.now()}`,
        game_id: data.gameId,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + data.durationDays * 24 * 60 * 60 * 1000).toISOString(),
        duration_days: data.durationDays,
        is_active: true,
        auto_restart: data.autoRestart,
        games: { name: 'Flappy Bird' }
      }
      // Desactivar otros periodos
      mockPeriods.forEach(p => p.is_active = false)
      mockPeriods.unshift(newPeriod)
      return newPeriod
    }
  },

  async updatePeriod(periodId, data) {
    try {
      return await apiService.put(`high_score/periods/${periodId}`, data)
    } catch (error) {
      console.warn('Mock: Updating period locally', error.message)
      await simulateDelay()
      const period = mockPeriods.find(p => p.id === periodId)
      if (period) {
        Object.assign(period, data)
      }
      return period
    }
  },

  async closePeriod(periodId, topPositions = 1) {
    try {
      return await apiService.post(`high_score/periods/${periodId}/close`, { topPositions })
    } catch (error) {
      console.warn('Mock: Closing period locally', error.message)
      await simulateDelay()
      const period = mockPeriods.find(p => p.id === periodId)
      if (period) {
        period.is_active = false
        period.end_date = new Date().toISOString()
      }
      return { success: true }
    }
  },

  async processExpiredPeriods() {
    try {
      return await apiService.post('high_score/process-expired')
    } catch (error) {
      console.warn('Mock: Processing expired periods', error.message)
      await simulateDelay()
      return { processed: 0 }
    }
  },

  // Winner Management
  async getAllWinners(params = {}) {
    try {
      return await apiService.get('high_score/winners', params)
    } catch (error) {
      console.warn('Using mock data for winners:', error.message)
      await simulateDelay()
      return [...mockWinners]
    }
  },

  async getWinner(winnerId) {
    try {
      return await apiService.get(`high_score/winners/${winnerId}`)
    } catch (error) {
      console.warn('Using mock data for winner:', error.message)
      await simulateDelay()
      return mockWinners.find(w => w.id === winnerId) || null
    }
  },

  async markWinnerClaimed(winnerId) {
    try {
      return await apiService.post(`high_score/winners/${winnerId}/mark-claimed`)
    } catch (error) {
      console.warn('Mock: Marking winner as claimed locally', error.message)
      await simulateDelay()
      const winner = mockWinners.find(w => w.id === winnerId)
      if (winner) {
        winner.claimed = true
        winner.claimed_at = new Date().toISOString()
      }
      return { success: true }
    }
  },

  async getPeriodWinners(periodId) {
    try {
      return await apiService.get(`high_score/periods/${periodId}/winners`)
    } catch (error) {
      console.warn('Using mock data for period winners:', error.message)
      await simulateDelay()
      return mockWinners.filter(w => w.leaderboard_periods?.id === periodId)
    }
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