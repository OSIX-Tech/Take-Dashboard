import { apiService } from './api.js'

// Mock data para desarrollo
const mockPeriods = [
  {
    id: 'period-1',
    game_id: 'game-flappy-bird',
    start_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    is_active: true,
    auto_restart: true,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'period-2',
    game_id: 'game-flappy-bird',
    start_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    is_active: false,
    auto_restart: true,
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  }
]

const mockWinners = [
  {
    id: 'winner-1',
    period_id: 'period-2',
    user_id: 'user-123',
    user_name: 'María González',
    position: 1,
    score: 5420,
    reward_claimed: false,
    claimed_at: null,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'winner-2',
    period_id: 'period-3',
    user_id: 'user-456',
    user_name: 'Juan Pérez',
    position: 1,
    score: 4890,
    reward_claimed: true,
    claimed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  }
]

export const leaderboardService = {
  // ========================================
  // 1. PERIOD MANAGEMENT
  // ========================================

  /**
   * Get All Periods
   * GET /api/high_score/periods?gameId=<uuid>
   * Según high-score-admin-guide.md
   */
  async getAllPeriods(gameId = null) {
    const params = gameId ? { game_id: gameId } : {} // Usar snake_case para el parámetro
    const url = 'high_score/periods'

    try {
      const response = await apiService.get(url, params)

      // Procesar los periodos para asegurar que tengan duration_days
      let periods = response.data || response
      if (Array.isArray(periods)) {
        periods = periods.map(period => {
          // SIEMPRE calcular duration_days desde las fechas para precisión
          if (period.start_date && period.end_date) {
            const start = new Date(period.start_date)
            const end = new Date(period.end_date)
            const diffInMs = end - start
            // Usar ceil para incluir el día completo
            const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24))
            period.duration_days = diffInDays
          }
          return period
        })
      }

      return periods
    } catch (error) {

      // Si es 404, devolver mock data
      if (error.message && (error.message.includes('404') || error.message.includes('no encontrado'))) {
        return gameId ? mockPeriods.filter(p => p.game_id === gameId) : mockPeriods
      }

      throw error
    }
  },

  /**
   * Create New Period
   * POST /api/high_score/periods
   * Body: { gameId, durationDays, autoRestart }
   * Según high-score-admin-guide.md
   */
  async createPeriod(data) {

    // API expects snake_case for game_id and reward_id, camelCase for others
    const requestBody = {
      game_id: data.gameId, // Convertir a snake_case
      durationDays: data.durationDays,
      autoRestart: data.autoRestart,
      reward_id: data.reward_id || null // TODO es reward_id en snake_case
    }

    const url = 'high_score/periods'


    try {
      const response = await apiService.post(url, requestBody)

      // El backend devuelve start_date y end_date, calculamos duration_days
      if (response && response.data) {
        if (response.data.start_date && response.data.end_date) {
          const start = new Date(response.data.start_date)
          const end = new Date(response.data.end_date)
          const diffInMs = end - start
          // Usar ceil para incluir el día completo
          const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24))
          response.data.duration_days = diffInDays

        }
      }

      return response
    } catch (error) {

      // Si es 404, simular creación con mock data
      if (error.message && (error.message.includes('404') || error.message.includes('no encontrado'))) {
        const now = new Date()
        const startDate = new Date(now)
        // Establecer el inicio al principio del día actual
        startDate.setHours(0, 0, 0, 0)
        // Calcular el fin exacto: días * 24 horas - 1 segundo para terminar en 23:59:59
        const endDate = new Date(startDate.getTime() + (data.durationDays * 24 * 60 * 60 * 1000) - 1000)

        const newPeriod = {
          id: `period-${Date.now()}`,
          game_id: data.gameId,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          duration_days: data.durationDays,
          is_active: true,
          auto_restart: data.autoRestart,
          created_at: now.toISOString()
        }
        mockPeriods.forEach(p => p.is_active = false) // Desactivar otros periodos
        mockPeriods.unshift(newPeriod)
        return {
          success: true,
          data: newPeriod,
          message: 'Periodo creado exitosamente (mock)'
        }
      }

      throw error
    }
  },

  /**
   * Update Period Settings
   * PUT /api/high_score/periods/<period-id>
   * Body: { end_date, auto_restart }
   * NOTA: Backend solo acepta end_date y auto_restart según la guía
   * Según high-score-admin-guide.md
   */
  async updatePeriod(periodId, data) {

    // Verificar si tenemos los datos necesarios
    if (!periodId) {
      throw new Error('periodId es requerido')
    }

    if (data.duration_days === undefined || data.duration_days === null || data.duration_days === '') {
      throw new Error('duration_days es requerido para actualizar el período')
    }

    // Backend espera camelCase para algunos campos, pero reward_id en snake_case
    const requestBody = {
      durationDays: parseInt(data.duration_days),  // camelCase
      autoRestart: data.auto_restart || false,     // camelCase
      reward_id: data.reward_id || null             // snake_case para reward_id
    }
    const url = `high_score/periods/${periodId}`

    try {
      const response = await apiService.put(url, requestBody)

      // El backend devuelve el periodo actualizado, calcular duration_days
      if (response && response.data) {
        if (response.data.start_date && response.data.end_date) {
          const start = new Date(response.data.start_date)
          const end = new Date(response.data.end_date)
          const diffInMs = end - start
          // Usar ceil para incluir el día completo
          const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24))
          response.data.duration_days = diffInDays
        }
      }

      return response
    } catch (error) {

      // Si es 404, simular actualización con mock data
      if (error.message && (error.message.includes('404') || error.message.includes('no encontrado'))) {
        const period = mockPeriods.find(p => p.id === periodId)
        if (period) {
          if (requestBody.end_date) period.end_date = requestBody.end_date
          if (requestBody.auto_restart !== undefined) period.auto_restart = requestBody.auto_restart

          // Calcular duration_days para el mock
          if (period.start_date && period.end_date) {
            const start = new Date(period.start_date)
            const end = new Date(period.end_date)
            const diffInMs = end - start
            const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24))
            period.duration_days = diffInDays
          }

          return {
            success: true,
            data: period,
            message: 'Periodo actualizado exitosamente (mock)'
          }
        }
      }
      throw error
    }
  },

  /**
   * Close Period Manually
   * POST /api/high_score/periods/<period-id>/close
   * Body (opcional): { topPositions: 1 }
   * Según high-score-admin-guide.md
   */
  async closePeriod(periodId, topPositions = 1) {

    if (!periodId) {
      throw new Error('periodId es requerido para cerrar un periodo')
    }

    const url = `high_score/periods/${periodId}/close`

    // Intentar primero con el body según la documentación
    const requestBody = { topPositions }

    try {
      const response = await apiService.post(url, requestBody)
      return response.data || response
    } catch (error) {

      // Si es 404, simular cierre con mock data
      if (error.message && (error.message.includes('404') || error.message.includes('no encontrado'))) {
        const period = mockPeriods.find(p => p.id === periodId)
        if (period) {
          period.is_active = false
          period.end_date = new Date().toISOString()

          // Crear un ganador mock
          const newWinner = {
            id: `winner-${Date.now()}`,
            period_id: periodId,
            user_id: `user-${Math.floor(Math.random() * 1000)}`,
            user_name: 'Usuario Demo',
            position: 1,
            score: Math.floor(Math.random() * 10000),
            reward_claimed: false,
            claimed_at: null,
            created_at: new Date().toISOString()
          }
          mockWinners.unshift(newWinner)

          return {
            success: true,
            data: {
              period: period,
              winners: [newWinner]
            },
            message: 'Periodo cerrado exitosamente (mock)'
          }
        }
      }

      throw error
    }
  },

  /**
   * Get Period Winners
   * GET /api/high_score/periods/<period-id>/winners
   * Según high-score-admin-guide.md
   */
  async getPeriodWinners(periodId) {
    const url = `high_score/periods/${periodId}/winners`

    try {
      const response = await apiService.get(url)
      return response.data || response
    } catch (error) {

      // Si es 404, devolver mock data filtrada
      if (error.message && (error.message.includes('404') || error.message.includes('no encontrado'))) {
        return mockWinners.filter(w => w.period_id === periodId)
      }

      throw error
    }
  },

  // ========================================
  // 2. WINNER MANAGEMENT
  // ========================================

  /**
   * Get Winners History
   * GET /api/high_score/winners?gameId=<uuid>&position=1&limit=50
   * Query params: gameId, position, limit (todos opcionales)
   * Según high-score-admin-guide.md
   */
  async getAllWinners(params = {}) {
    const url = 'high_score/winners'

    try {
      const response = await apiService.get(url, params)
      return response.data || response
    } catch (error) {

      // Si es 404, devolver mock data
      if (error.message && (error.message.includes('404') || error.message.includes('no encontrado'))) {
        let result = [...mockWinners]

        if (params.gameId || params.game_id) {
          // Para filtrar por game_id, necesitaríamos el game_id en los winners
          // Por ahora solo devolvemos todos
        }
        if (params.position) {
          result = result.filter(w => w.position === params.position)
        }
        if (params.limit) {
          result = result.slice(0, params.limit)
        }

        return result
      }

      throw error
    }
  },

  /**
   * Mark Reward as Claimed
   * POST /api/high_score/winners/<winner-id>/mark-claimed
   * Uso: Cuando un usuario físicamente recoge su premio en el café
   * Según high-score-admin-guide.md
   */
  async markWinnerClaimed(winnerId) {

    if (!winnerId) {
      throw new Error('winnerId es requerido para marcar como reclamado')
    }

    const url = `high_score/winners/${winnerId}/mark-claimed`

    try {
      const response = await apiService.post(url, {})

      // Verificar si la respuesta indica éxito
      if (response && (response.success || response.data)) {
        return response.data || response
      } else {
        throw new Error('Respuesta inesperada del servidor')
      }
    } catch (error) {

      // Si es 404, simular marcado con mock data
      if (error.message && (error.message.includes('404') || error.message.includes('no encontrado'))) {
        const winner = mockWinners.find(w => w.id === winnerId)
        if (winner) {
          winner.reward_claimed = true
          winner.claimed_at = new Date().toISOString()
          return {
            success: true,
            data: {
              id: winnerId,
              reward_claimed: true,
              claimed_at: winner.claimed_at
            },
            message: 'Premio marcado como recogido (mock)'
          }
        }
      }

      throw error
    }
  },

  // ========================================
  // 3. SYSTEM MANAGEMENT
  // ========================================

  /**
   * Process Expired Periods
   * POST /api/high_score/process-expired
   * Normalmente ejecutado por cron job, procesa periodos expirados
   * Según high-score-admin-guide.md
   */
  async processExpiredPeriods() {
    const url = 'high_score/process-expired'

    try {
      const response = await apiService.post(url)
      return response.data || response
    } catch (error) {

      // Si es 404, simular procesamiento con mock data
      if (error.message && (error.message.includes('404') || error.message.includes('no encontrado'))) {
        const now = new Date()
        const expiredPeriods = mockPeriods.filter(p => p.is_active && new Date(p.end_date) < now)

        expiredPeriods.forEach(period => {
          period.is_active = false

          // Crear ganador para cada periodo expirado
          const newWinner = {
            id: `winner-${Date.now()}-${Math.random()}`,
            period_id: period.id,
            user_id: `user-${Math.floor(Math.random() * 1000)}`,
            user_name: `Usuario Demo ${Math.floor(Math.random() * 100)}`,
            position: 1,
            score: Math.floor(Math.random() * 10000),
            reward_claimed: false,
            claimed_at: null,
            created_at: new Date().toISOString()
          }
          mockWinners.unshift(newWinner)

          // Crear nuevo periodo si auto_restart está activo
          if (period.auto_restart) {
            const newPeriod = {
              id: `period-${Date.now()}-${Math.random()}`,
              game_id: period.game_id,
              start_date: new Date().toISOString(),
              end_date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              is_active: true,
              auto_restart: period.auto_restart,
              created_at: new Date().toISOString()
            }
            mockPeriods.unshift(newPeriod)
          }
        })

        return {
          success: true,
          data: {
            processedCount: expiredPeriods.length,
            results: expiredPeriods.map(p => ({
              periodId: p.id,
              winnersCount: 1,
              newPeriodCreated: p.auto_restart
            }))
          },
          message: `${expiredPeriods.length} periodos procesados (mock)`
        }
      }

      throw error
    }
  },

  // ========================================
  // HELPER FUNCTIONS (for UI convenience)
  // ========================================

  /**
   * Get the active period for a specific game
   */
  async getActivePeriod(gameId = null) {
    try {
      const response = await this.getAllPeriods(gameId)

      let periods = []
      if (Array.isArray(response)) {
        periods = response
      } else if (response && response.data && Array.isArray(response.data)) {
        periods = response.data
      }

      if (periods.length > 0) {
        const activePeriods = periods.filter(p => p.is_active)

        // Asegurar que el periodo activo tenga duration_days
        const processPeriod = (period) => {
          if (period && period.start_date && period.end_date) {
            const start = new Date(period.start_date)
            const end = new Date(period.end_date)
            const diffInMs = end - start
            // SIEMPRE recalcular para precisión
            const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24))
            period.duration_days = diffInDays
          }
          return period
        }

        if (gameId) {
          const period = activePeriods.find(p => p.game_id === gameId)
          return processPeriod(period) || null
        }
        return processPeriod(activePeriods[0]) || null
      }

      return null
    } catch (error) {
      return null
    }
  },

  /**
   * Get all unclaimed winners
   */
  async getPendingWinners() {
    const winners = await this.getAllWinners()
    if (Array.isArray(winners)) {
      return winners.filter(w => !w.reward_claimed)
    }
    return []
  },

  /**
   * Format time remaining for a period
   */
  formatTimeRemaining(endDate) {
    const end = new Date(endDate)
    const now = new Date()
    // Sumar 2 horas al cálculo (2 * 60 * 60 * 1000 ms)
    const diff = end - now + (2 * 60 * 60 * 1000)

    if (diff <= 0) return 'Periodo terminado'

    // Calcular componentes de tiempo más precisamente
    const totalMinutes = Math.floor(diff / (1000 * 60))
    const days = Math.floor(totalMinutes / (24 * 60))
    const hours = Math.floor((totalMinutes % (24 * 60)) / 60)
    const minutes = totalMinutes % 60

    return `${days}d ${hours}h ${minutes}m`
  },

  /**
   * Format period dates for display
   */
  formatPeriodDates(startDate, endDate) {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const options = { day: '2-digit', month: '2-digit' }

    return `${start.toLocaleDateString('es', options)} - ${end.toLocaleDateString('es', options)}`
  }
}