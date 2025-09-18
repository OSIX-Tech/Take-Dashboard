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
    console.log('🎯 [LeaderboardService] getAllPeriods called with gameId:', gameId)
    const params = gameId ? { gameId } : {}
    const url = 'high_score/periods'
    console.log('🔗 [LeaderboardService] Request URL:', url)
    console.log('📦 [LeaderboardService] Request params:', params)

    try {
      const response = await apiService.get(url, params)
      console.log('✅ [LeaderboardService] getAllPeriods response:', response)

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
      console.error('❌ [LeaderboardService] getAllPeriods error:', error)

      // Si es 404, devolver mock data
      if (error.message && (error.message.includes('404') || error.message.includes('no encontrado'))) {
        console.log('📦 [LeaderboardService] Using mock data for periods')
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
    console.log('🎯 [LeaderboardService] createPeriod called with data:', data)
    console.log('🔍 [LeaderboardService] Checking reward_id in received data:', {
      'data.reward_id': data.reward_id,
      'all data keys': Object.keys(data),
      'full data': data
    })

    // API expects camelCase for most fields, but reward_id uses snake_case
    const requestBody = {
      gameId: data.gameId,
      durationDays: data.durationDays,
      autoRestart: data.autoRestart,
      reward_id: data.reward_id || null // Enviar reward_id al backend
    }

    const url = 'high_score/periods'

    // Debug para verificar que reward_id está en el body
    console.log('🔗 [LeaderboardService] POST URL:', url)
    console.log('📦 [LeaderboardService] Request body:', requestBody)
    console.log('🎯 [LeaderboardService] REWARD_ID being sent:', requestBody.reward_id)
    console.log('🔍 [LeaderboardService] Request body stringified:', JSON.stringify(requestBody))

    try {
      const response = await apiService.post(url, requestBody)
      console.log('✅ [LeaderboardService] createPeriod response:', response)

      // El backend devuelve start_date y end_date, calculamos duration_days
      if (response && response.data) {
        if (response.data.start_date && response.data.end_date) {
          const start = new Date(response.data.start_date)
          const end = new Date(response.data.end_date)
          const diffInMs = end - start
          // Usar ceil para incluir el día completo
          const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24))
          response.data.duration_days = diffInDays

          // Log para debug
          console.log('📊 [LeaderboardService] Period dates from backend:', {
            requested_days: data.durationDays,
            start_date: response.data.start_date,
            end_date: response.data.end_date,
            calculated_days: diffInDays,
            diff_in_hours: diffInMs / (1000 * 60 * 60)
          })
        }
      }

      return response
    } catch (error) {
      console.error('❌ [LeaderboardService] createPeriod error:', error)

      // Si es 404, simular creación con mock data
      if (error.message && (error.message.includes('404') || error.message.includes('no encontrado'))) {
        console.log('📦 [LeaderboardService] Simulating period creation with mock data')
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
    console.log('🎯 [LeaderboardService] updatePeriod called with periodId:', periodId, 'data:', data)
    console.log('🎯 [LeaderboardService] Data received:')
    console.log('  - duration_days:', data.duration_days)
    console.log('  - auto_restart:', data.auto_restart)

    // Verificar si tenemos los datos necesarios
    if (!periodId) {
      console.error('❌ [LeaderboardService] ERROR: No periodId provided')
      throw new Error('periodId es requerido')
    }

    if (data.duration_days === undefined || data.duration_days === null || data.duration_days === '') {
      console.error('❌ [LeaderboardService] ERROR: duration_days es requerido')
      throw new Error('duration_days es requerido para actualizar el período')
    }

    // NUEVO FORMATO: Backend ahora espera duration_days en lugar de end_date
    const requestBody = {
      duration_days: parseInt(data.duration_days),
      auto_restart: data.auto_restart || false
    }
    const url = `high_score/periods/${periodId}`
    console.log('🔗 [LeaderboardService] PUT URL:', url)
    console.log('📦 [LeaderboardService] Request body (NUEVO FORMATO):', JSON.stringify(requestBody, null, 2))
    console.log('📦 [LeaderboardService] Body details:')
    console.log('  - duration_days enviado:', requestBody.duration_days)
    console.log('  - auto_restart enviado:', requestBody.auto_restart)
    console.log('  - Tipo de duration_days:', typeof requestBody.duration_days)

    try {
      console.log('🚀 [LeaderboardService] Sending PUT request...')
      const response = await apiService.put(url, requestBody)
      console.log('✅ [LeaderboardService] updatePeriod response:', response)
      console.log('✅ [LeaderboardService] Response data:', response?.data)

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
      console.error('❌ [LeaderboardService] updatePeriod error:', error)
      console.error('❌ [LeaderboardService] Error details:')
      console.error('  - Status:', error.status)
      console.error('  - Message:', error.message)
      console.error('  - Stack:', error.stack)

      // Si es 404, simular actualización con mock data
      if (error.message && (error.message.includes('404') || error.message.includes('no encontrado'))) {
        console.log('📦 [LeaderboardService] Simulating period update with mock data')
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
    console.log('🎯 [LeaderboardService] closePeriod called with periodId:', periodId, 'topPositions:', topPositions)

    if (!periodId) {
      throw new Error('periodId es requerido para cerrar un periodo')
    }

    const url = `high_score/periods/${periodId}/close`

    // Intentar primero con el body según la documentación
    const requestBody = { topPositions }
    console.log('🔗 [LeaderboardService] POST URL:', url)
    console.log('📦 [LeaderboardService] Request body:', requestBody)

    try {
      const response = await apiService.post(url, requestBody)
      console.log('✅ [LeaderboardService] closePeriod response:', response)
      return response.data || response
    } catch (error) {
      console.error('❌ [LeaderboardService] closePeriod error:', error)
      console.error('❌ Error details:', {
        status: error.status,
        message: error.message,
        response: error.response,
        periodId: periodId,
        requestBody: requestBody
      })

      // Si es 404, simular cierre con mock data
      if (error.message && (error.message.includes('404') || error.message.includes('no encontrado'))) {
        console.log('📦 [LeaderboardService] Simulating period closure with mock data')
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
    console.log('🎯 [LeaderboardService] getPeriodWinners called with periodId:', periodId)
    const url = `high_score/periods/${periodId}/winners`
    console.log('🔗 [LeaderboardService] GET URL:', url)

    try {
      const response = await apiService.get(url)
      console.log('✅ [LeaderboardService] getPeriodWinners response:', response)
      return response.data || response
    } catch (error) {
      console.error('❌ [LeaderboardService] getPeriodWinners error:', error)

      // Si es 404, devolver mock data filtrada
      if (error.message && (error.message.includes('404') || error.message.includes('no encontrado'))) {
        console.log('📦 [LeaderboardService] Using mock data for period winners')
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
    console.log('🎯 [LeaderboardService] getAllWinners called with params:', params)
    const url = 'high_score/winners'
    console.log('🔗 [LeaderboardService] GET URL:', url)
    console.log('📦 [LeaderboardService] Request params:', params)

    try {
      const response = await apiService.get(url, params)
      console.log('✅ [LeaderboardService] getAllWinners response:', response)
      return response.data || response
    } catch (error) {
      console.error('❌ [LeaderboardService] getAllWinners error:', error)

      // Si es 404, devolver mock data
      if (error.message && (error.message.includes('404') || error.message.includes('no encontrado'))) {
        console.log('📦 [LeaderboardService] Using mock data for winners')
        let result = [...mockWinners]

        if (params.gameId) {
          // Para filtrar por gameId, necesitaríamos el game_id en los winners
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
    console.log('🎯 [LeaderboardService] markWinnerClaimed called with winnerId:', winnerId)

    if (!winnerId) {
      console.error('❌ [LeaderboardService] ERROR: No winnerId provided')
      throw new Error('winnerId es requerido para marcar como reclamado')
    }

    const url = `high_score/winners/${winnerId}/mark-claimed`
    console.log('🔗 [LeaderboardService] POST URL:', url)
    console.log('📦 [LeaderboardService] Sending POST request to mark as claimed...')

    try {
      const response = await apiService.post(url, {})
      console.log('✅ [LeaderboardService] markWinnerClaimed response:', response)
      console.log('✅ [LeaderboardService] Response type:', typeof response)
      console.log('✅ [LeaderboardService] Response keys:', Object.keys(response || {}))
      console.log('✅ [LeaderboardService] Response details:', {
        success: response?.success,
        data: response?.data,
        message: response?.message,
        full_response: JSON.stringify(response)
      })

      // Verificar si la respuesta indica éxito
      if (response && (response.success || response.data)) {
        console.log('✅ [LeaderboardService] Marcado exitosamente')
        return response.data || response
      } else {
        console.error('⚠️ [LeaderboardService] Respuesta inesperada:', response)
        throw new Error('Respuesta inesperada del servidor')
      }
    } catch (error) {
      console.error('❌ [LeaderboardService] markWinnerClaimed error:', error)

      // Si es 404, simular marcado con mock data
      if (error.message && (error.message.includes('404') || error.message.includes('no encontrado'))) {
        console.log('📦 [LeaderboardService] Simulating mark claimed with mock data')
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
    console.log('🎯 [LeaderboardService] processExpiredPeriods called')
    const url = 'high_score/process-expired'
    console.log('🔗 [LeaderboardService] POST URL:', url)

    try {
      const response = await apiService.post(url)
      console.log('✅ [LeaderboardService] processExpiredPeriods response:', response)
      return response.data || response
    } catch (error) {
      console.error('❌ [LeaderboardService] processExpiredPeriods error:', error)

      // Si es 404, simular procesamiento con mock data
      if (error.message && (error.message.includes('404') || error.message.includes('no encontrado'))) {
        console.log('📦 [LeaderboardService] Simulating expired periods processing with mock data')
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
    console.log('🔍 [LeaderboardService] getActivePeriod called with gameId:', gameId)
    try {
      const response = await this.getAllPeriods(gameId)
      console.log('📊 [LeaderboardService] getActivePeriod - response received:', response)

      let periods = []
      if (Array.isArray(response)) {
        periods = response
      } else if (response && response.data && Array.isArray(response.data)) {
        periods = response.data
      }

      if (periods.length > 0) {
        const activePeriods = periods.filter(p => p.is_active)
        console.log('🎯 [LeaderboardService] Active periods found:', activePeriods.length)

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
          console.log('✨ [LeaderboardService] Period for gameId', gameId, ':', period)
          return processPeriod(period) || null
        }
        console.log('✨ [LeaderboardService] Returning first active period:', activePeriods[0])
        return processPeriod(activePeriods[0]) || null
      }

      console.log('⚠️ [LeaderboardService] No periods found')
      return null
    } catch (error) {
      console.error('❌ [LeaderboardService] getActivePeriod error:', error)
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