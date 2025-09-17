import { useState, useEffect } from 'react'
// eslint-disable-next-line no-unused-vars
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// eslint-disable-next-line no-unused-vars
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
/* eslint-disable no-unused-vars */
import { 
  Trophy, Medal, Award, User, Calendar, Clock, 
  ChevronDown, ChevronUp, RefreshCw, X, Plus, Settings,
  Check, Timer
} from 'lucide-react'
/* eslint-enable no-unused-vars */
import { leaderboardService } from '@/services/leaderboardService'
import { rewardsService } from '@/services/rewardsService'
// eslint-disable-next-line no-unused-vars
import LoadingSpinner from '@/components/common/LoadingSpinner'
// eslint-disable-next-line no-unused-vars
import ErrorMessage from '@/components/common/ErrorMessage'

function Game() {
  const [activeTab, setActiveTab] = useState('periods')
  // Leaderboard removido - no existe endpoint según high-score-admin-guide
  const [activePeriod, setActivePeriod] = useState(null)
  const [periods, setPeriods] = useState([])
  const [winners, setWinners] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedPeriod, setExpandedPeriod] = useState(null)
  const [expandedWinner, setExpandedWinner] = useState(null)
  const [showNewPeriodForm, setShowNewPeriodForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingPeriod, setEditingPeriod] = useState(null)
  const [showCloseModal, setShowCloseModal] = useState(false)
  const [periodToClose, setPeriodToClose] = useState(null)
  const [filterClaimed, setFilterClaimed] = useState('pending')
  const [stats, setStats] = useState({
    totalWinners: 0,
    pendingClaims: 0,
    claimedToday: 0
  })

  // gameId hardcodeado para el juego principal - Flappy Bird
  // TODO: En el futuro, esto debería venir de una configuración o API
  const GAME_ID = '7ed73f84-2303-405b-91e9-13f3feec3057' // Flappy Bird UUID

  const [newPeriod, setNewPeriod] = useState({
    gameId: GAME_ID,
    durationDays: 7,
    autoRestart: true,
    rewardId: null
  })

  const [rewards, setRewards] = useState([])
  const [periodRewards, setPeriodRewards] = useState({}) // Mapeo de periodId -> rewardId

  const [editData, setEditData] = useState({
    duration_days: 7,
    auto_restart: true,
    next_period_duration_days: 7,
    reward_id: null
  })

  // Funciones para manejar localStorage de asociaciones periodo-reward
  const loadPeriodRewards = () => {
    const stored = localStorage.getItem('periodRewards')
    if (stored) {
      setPeriodRewards(JSON.parse(stored))
    }
  }

  const savePeriodReward = (periodId, rewardId) => {
    const updated = { ...periodRewards, [periodId]: rewardId }
    setPeriodRewards(updated)
    localStorage.setItem('periodRewards', JSON.stringify(updated))
  }

  const removePeriodReward = (periodId) => {
    const updated = { ...periodRewards }
    delete updated[periodId]
    setPeriodRewards(updated)
    localStorage.setItem('periodRewards', JSON.stringify(updated))
  }

  useEffect(() => {
    if (activeTab === 'periods') {
      loadPeriods()
      fetchActivePeriod()
      loadRewards() // Cargar rewards cuando se muestra la tab de periodos
      loadPeriodRewards() // Cargar asociaciones periodo-reward de localStorage
    } else if (activeTab === 'winners') {
      loadWinners()
    }

    const interval = setInterval(() => {
      if (activeTab === 'periods') {
        fetchActivePeriod()
      }
    }, 60000)
    
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, filterClaimed])

  const fetchActivePeriod = async () => {
    try {
      // Solo obtener el periodo activo del juego hardcodeado
      const period = await leaderboardService.getActivePeriod(GAME_ID)
      console.log('🎯 Active period for game:', GAME_ID, period)
      setActivePeriod(period || null)
    } catch (err) {
      console.error('❌ Error loading active period:', err)
      setActivePeriod(null)
    }
  }

  // fetchLeaderboard eliminado - no existe endpoint para leaderboard en vivo

  const loadPeriods = async () => {
    try {
      setLoading(true)
      // Solo cargar periodos del juego hardcodeado
      const response = await leaderboardService.getAllPeriods(GAME_ID)
      console.log('🔍 Periods response for game:', GAME_ID, response)

      let data = []
      if (Array.isArray(response)) {
        data = response
      } else if (response && response.data && Array.isArray(response.data)) {
        data = response.data
      } else if (response && response.success === false) {
        console.warn('⚠️ Periods endpoint returned error:', response.error || response.message)
        data = []
      }

      setPeriods(data)
      setError(null)
    } catch (err) {
      console.error('❌ Error loading periods:', err)
      setError('Error al cargar los periodos. Verifica que el backend esté configurado.')
      setPeriods([])
    } finally {
      setLoading(false)
    }
  }

  const loadRewards = async () => {
    try {
      const rewardsData = await rewardsService.getRewards()
      console.log('🎁 Rewards loaded:', rewardsData)
      setRewards(rewardsData || [])
    } catch (err) {
      console.error('Error loading rewards:', err)
      setRewards([])
    }
  }

  const loadWinners = async () => {
    try {
      setLoading(true)
      // Obtener ganadores del juego específico
      const response = await leaderboardService.getAllWinners({ gameId: GAME_ID })
      console.log('🔍 Winners response for game:', GAME_ID, response)

      let data = []
      if (Array.isArray(response)) {
        data = response
      } else if (response && response.data && Array.isArray(response.data)) {
        data = response.data
      } else if (response && response.success === false) {
        console.warn('⚠️ Winners endpoint returned error:', response.error || response.message)
        data = []
      }

      let winnersData = data

      if (filterClaimed === 'pending') {
        winnersData = winnersData.filter(w => !w.reward_claimed)
      } else if (filterClaimed === 'claimed') {
        winnersData = winnersData.filter(w => w.reward_claimed)
      }

      setWinners(winnersData)

      const pendingCount = data.filter(w => !w.reward_claimed).length
      const today = new Date().toDateString()
      const claimedTodayCount = data.filter(w =>
        w.reward_claimed && w.claimed_at && new Date(w.claimed_at).toDateString() === today
      ).length

      setStats({
        totalWinners: data.length,
        pendingClaims: pendingCount,
        claimedToday: claimedTodayCount
      })

      setError(null)
    } catch (err) {
      console.error('❌ Error loading winners:', err)
      setError('Error al cargar los ganadores. Verifica que el backend esté configurado.')
      setWinners([])
      setStats({
        totalWinners: 0,
        pendingClaims: 0,
        claimedToday: 0
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePeriod = async (e) => {
    e.preventDefault()
    try {
      // Asegurar que siempre se use el gameId hardcodeado
      const periodData = {
        gameId: GAME_ID, // Siempre usar el gameId hardcodeado
        durationDays: newPeriod.durationDays,
        autoRestart: newPeriod.autoRestart
      }

      console.log('🆕 [Game] Creando nuevo periodo con datos:', periodData)
      const response = await leaderboardService.createPeriod(periodData)
      console.log('✅ [Game] Periodo creado:', response)

      // Si se creó exitosamente y hay una rewardId, guardarla en localStorage
      if (response && response.data && response.data.id && newPeriod.rewardId) {
        savePeriodReward(response.data.id, newPeriod.rewardId)
      }

      setShowNewPeriodForm(false)
      setNewPeriod({ gameId: GAME_ID, durationDays: 7, autoRestart: true, rewardId: null })

      // Mostrar mensaje de éxito
      if (response && response.data) {
        const period = response.data
        alert(`Periodo creado exitosamente\nDuración: ${period.duration_days || newPeriod.durationDays} días\nReinicio automático: ${period.auto_restart ? 'Sí' : 'No'}`)
      }

      await loadPeriods()
      await fetchActivePeriod()
    } catch (err) {
      console.error('❌ [Game] Error creating period:', err)

      // Mejorar manejo de errores
      let errorMessage = 'Error al crear el periodo'
      if (err.message) {
        if (err.message.includes('400')) {
          errorMessage = 'Datos inválidos. Verifica que la duración sea válida'
        } else if (err.message.includes('500')) {
          errorMessage = 'Error del servidor. Posibles causas:\n- Ya existe un periodo activo\n- El gameId no existe en el sistema\n- Problema interno del servidor'
        } else if (err.message.includes('401')) {
          errorMessage = 'No autorizado. Por favor, vuelve a iniciar sesión'
        } else {
          errorMessage = err.message
        }
      }
      setError(errorMessage)
    }
  }

  const handleUpdatePeriod = async (e) => {
    e.preventDefault()
    console.log('🔄 [Game] handleUpdatePeriod called')
    console.log('🔄 [Game] editingPeriod:', editingPeriod)
    console.log('🔄 [Game] editData:', editData)

    if (!editingPeriod) {
      console.error('❌ [Game] No editingPeriod found')
      return
    }

    try {
      // NUEVO: Solo enviamos duration_days y auto_restart
      const updateData = {
        duration_days: editData.duration_days,
        auto_restart: editData.auto_restart
      }

      console.log('📤 [Game] Calling updatePeriod with NEW FORMAT:', {
        periodId: editingPeriod.id,
        updateData
      })

      const result = await leaderboardService.updatePeriod(editingPeriod.id, updateData)
      console.log('✅ [Game] Period updated successfully:', result)

      // Guardar o actualizar la reward en localStorage
      if (editData.reward_id) {
        savePeriodReward(editingPeriod.id, editData.reward_id)
      } else {
        removePeriodReward(editingPeriod.id)
      }

      setShowEditForm(false)
      setEditingPeriod(null)

      // Mostrar mensaje de éxito
      alert(`Periodo actualizado exitosamente\nNueva duración: ${editData.duration_days} días`)

      await loadPeriods()
      await fetchActivePeriod() // Refrescar periodo activo también
    } catch (err) {
      console.error('❌ [Game] Error updating period:', err)
      console.error('❌ [Game] Error details:', {
        message: err.message,
        stack: err.stack
      })

      // Mensaje de error más detallado
      let errorMsg = 'Error al actualizar el periodo'
      if (err.message) {
        if (err.message.includes('404')) {
          errorMsg = 'El periodo no fue encontrado'
        } else if (err.message.includes('400')) {
          errorMsg = 'Datos inválidos para la actualización'
        } else if (err.message.includes('500')) {
          errorMsg = 'Error del servidor al actualizar el periodo'
        } else {
          errorMsg = `Error: ${err.message}`
        }
      }
      setError(errorMsg)
      // NO cerrar el modal para que el usuario pueda intentar de nuevo
    }
  }

  const openCloseModal = (period) => {
    setPeriodToClose(period)
    setShowCloseModal(true)
  }

  const handleClosePeriod = async () => {
    if (!periodToClose) return

    try {
      console.log('🎯 [Game] Cerrando periodo:', periodToClose.id)
      const result = await leaderboardService.closePeriod(periodToClose.id, 1)
      console.log('✅ [Game] Periodo cerrado exitosamente:', result)

      setShowCloseModal(false)
      setPeriodToClose(null)

      // Mostrar mensaje de éxito con información del ganador
      if (result && result.winners && result.winners.length > 0) {
        const winner = result.winners[0]
        alert(`Periodo cerrado exitosamente.\nGanador: ${winner.user_name}\nPuntuación: ${winner.score}`)
      } else {
        alert('Periodo cerrado exitosamente. No se encontraron ganadores.')
      }

      await loadPeriods()
      await fetchActivePeriod()
    } catch (err) {
      console.error('❌ [Game] Error closing period:', err)
      console.error('❌ Error details:', err)

      // Mejorar el manejo de errores
      let errorMessage = 'Error al cerrar el periodo'

      if (err.message) {
        if (err.message.includes('404')) {
          errorMessage = 'El periodo no fue encontrado o ya fue cerrado'
        } else if (err.message.includes('400')) {
          errorMessage = 'Solicitud inválida. Verifica los datos del periodo'
        } else if (err.message.includes('500')) {
          errorMessage = 'Error del servidor. Posibles causas:\n- El periodo ya está cerrado\n- No hay jugadores con puntuaciones\n- Error interno del servidor'
        } else if (err.message.includes('401')) {
          errorMessage = 'No autorizado. Por favor, vuelve a iniciar sesión'
        } else {
          errorMessage = `Error: ${err.message}`
        }
      }

      setError(errorMessage)
      setShowCloseModal(false)
    }
  }

  const handleProcessExpired = async () => {
    try {
      console.log('🔄 [Game] Procesando periodos expirados...')
      const result = await leaderboardService.processExpiredPeriods()
      console.log('✅ [Game] Resultado del procesamiento:', result)

      await loadPeriods()
      await fetchActivePeriod()

      // Mostrar resultado más detallado
      if (result && result.processedCount !== undefined) {
        if (result.processedCount > 0) {
          alert(`Se procesaron ${result.processedCount} periodo(s) expirado(s) correctamente`)
        } else {
          alert('No hay periodos expirados para procesar')
        }
      } else {
        alert('Periodos expirados procesados correctamente')
      }
    } catch (err) {
      console.error('❌ [Game] Error processing expired periods:', err)
      setError('Error al procesar periodos expirados')
    }
  }

  const handleMarkClaimed = async (winnerId) => {
    console.log('🎆 [Game] handleMarkClaimed iniciado con winnerId:', winnerId)

    if (!winnerId) {
      console.error('❌ [Game] ERROR: No winnerId provided to handleMarkClaimed')
      alert('Error: No se encontró el ID del ganador')
      return
    }

    // Encontrar el winner actual para verificar su estado
    const currentWinner = winners.find(w => w.id === winnerId)
    console.log('🔍 [Game] Estado actual del ganador:', {
      id: currentWinner?.id,
      name: currentWinner?.user_name,
      reward_claimed: currentWinner?.reward_claimed,
      claimed_at: currentWinner?.claimed_at
    })

    if (currentWinner?.reward_claimed) {
      console.warn('⚠️ [Game] Este premio ya está marcado como recogido')
      alert('Este premio ya está marcado como recogido')
      return
    }

    if (!confirm('¿Confirmar que el premio ha sido recogido?')) return

    try {
      console.log('📤 [Game] Enviando solicitud para marcar como reclamado:', winnerId)
      const result = await leaderboardService.markWinnerClaimed(winnerId)
      console.log('✅ [Game] Resultado de marcar como reclamado:', result)

      alert('Premio marcado como recogido exitosamente')

      // Recargar la lista de ganadores
      console.log('🔄 [Game] Recargando lista de ganadores...')
      await loadWinners()

      // Verificar si se actualizó
      const updatedWinner = winners.find(w => w.id === winnerId)
      console.log('🔍 [Game] Estado después de actualizar:', {
        id: updatedWinner?.id,
        reward_claimed: updatedWinner?.reward_claimed,
        claimed_at: updatedWinner?.claimed_at
      })
    } catch (err) {
      console.error('❌ [Game] Error marking winner as claimed:', err)
      console.error('❌ [Game] Error details:', {
        message: err.message,
        stack: err.stack
      })
      setError(`Error al marcar premio como recogido: ${err.message}`)
    }
  }

  const openEditForm = (period) => {
    console.log('📝 [Game] openEditForm called with period:', period)

    // Asegurar que duration_days esté presente y sea un número válido
    let durationDays = period.duration_days
    if (!durationDays || isNaN(durationDays)) {
      // Si no hay duration_days, calcularlo desde las fechas
      if (period.start_date && period.end_date) {
        const start = new Date(period.start_date)
        const end = new Date(period.end_date)
        const diff = end - start
        durationDays = Math.ceil(diff / (1000 * 60 * 60 * 24))
      } else {
        durationDays = 7 // Valor por defecto
      }
    }
    durationDays = parseInt(durationDays) || 7

    console.log('📝 [Game] Setting edit data with duration_days:', durationDays)

    setEditingPeriod(period)
    setEditData({
      duration_days: durationDays,
      auto_restart: period.auto_restart || false,
      next_period_duration_days: durationDays,
      reward_id: periodRewards[period.id] || null // Cargar reward desde localStorage
    })
    setShowEditForm(true)
  }

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-gray-900" />
      case 2:
        return <Medal className="w-5 h-5 text-gray-700" />
      case 3:
        return <Award className="w-5 h-5 text-gray-600" />
      default:
        return null
    }
  }

  const getRowStyle = (rank) => {
    if (rank === 1) return 'bg-gray-100 border-l-4 border-gray-900'
    if (rank === 2) return 'bg-gray-50 border-l-4 border-gray-700'
    if (rank === 3) return 'bg-gray-50 border-l-4 border-gray-600'
    return 'hover:bg-gray-50 transition-colors duration-200'
  }

  const formatDaysAgo = (date) => {
    const now = new Date()
    const winDate = new Date(date)
    const diffTime = Math.abs(now - winDate)
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Hoy'
    if (diffDays === 1) return 'Hace 1 día'
    return `Hace ${diffDays} días`
  }

  const getPriorityClass = (winner) => {
    if (winner.reward_claimed) return 'border-gray-200 bg-gray-50'

    const daysAgo = Math.floor((new Date() - new Date(winner.created_at)) / (1000 * 60 * 60 * 24))

    if (daysAgo > 7) return 'border-red-500 bg-red-50'
    if (daysAgo > 3) return 'border-yellow-500 bg-yellow-50'
    return 'border-green-500 bg-green-50'
  }

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />

  return (
    <div className="space-y-6">
      {/* Header con tabs */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">Sistema de Juego</h1>
        
        <div className="flex gap-1 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('periods')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'periods'
                ? 'border-b-2 border-black text-black'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Timer className="inline-block w-4 h-4 mr-2" />
            Periodos
          </button>
          <button
            onClick={() => setActiveTab('winners')}
            className={`px-4 py-2 font-medium transition-colors relative ${
              activeTab === 'winners'
                ? 'border-b-2 border-black text-black'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Award className="inline-block w-4 h-4 mr-2" />
            Ganadores
            {stats.pendingClaims > 0 && (
              <span className="absolute -top-1 -right-1 px-2 py-0.5 bg-yellow-400 text-black text-xs rounded-full">
                {stats.pendingClaims}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tab Content */}

      {activeTab === 'periods' && (
        <div className="space-y-6">
          <div className="flex justify-end gap-2">
            <button
              onClick={handleProcessExpired}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Procesar Expirados
            </button>
            <button
              onClick={() => setShowNewPeriodForm(true)}
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nuevo Periodo
            </button>
          </div>

          {/* No active period message */}
          {!activePeriod && (
            <div className="bg-yellow-50 rounded-lg border-2 border-yellow-300 p-8 text-center">
              <div className="mb-4">
                <Timer className="h-12 w-12 text-yellow-600 mx-auto mb-2" />
                <p className="text-lg font-semibold text-gray-700">No hay periodo activo</p>
                <p className="text-sm text-gray-600 mt-1">Crea un nuevo periodo para comenzar la competencia</p>
              </div>
              <button
                onClick={() => setShowNewPeriodForm(true)}
                className="px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 flex items-center gap-2 mx-auto"
              >
                <Plus className="h-5 w-5" />
                Crear Nuevo Periodo
              </button>
            </div>
          )}

          {/* Active Period Card */}
          {activePeriod && (
            <div className="p-6 border-2 border-black rounded-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold mb-2">PERIODO ACTUAL</h2>
                  <span className="px-2 py-1 bg-green-500 text-white text-sm rounded">ACTIVO</span>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">
                    {leaderboardService.formatTimeRemaining(activePeriod.end_date)}
                  </p>
                  <p className="text-sm text-gray-600">Tiempo restante</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Inicio</p>
                  <p className="font-semibold">
                    {new Date(activePeriod.start_date).toLocaleDateString('es')}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(activePeriod.start_date).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fin</p>
                  <p className="font-semibold">
                    {new Date(activePeriod.end_date).toLocaleDateString('es')}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(activePeriod.end_date).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Duración Configurada</p>
                  <p className="font-semibold">{activePeriod.duration_days || 7} días</p>
                  <p className="text-xs text-gray-500">
                    Real: {(() => {
                      const start = new Date(activePeriod.start_date)
                      const end = new Date(activePeriod.end_date)
                      const diff = end - start
                      const days = diff / (1000 * 60 * 60 * 24)
                      return days.toFixed(2) + ' días'
                    })()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Reinicio Auto</p>
                  <p className="font-semibold">{activePeriod.auto_restart ? 'Sí' : 'No'}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => openCloseModal(activePeriod)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cerrar Periodo
                </button>
                <button
                  onClick={() => {
                    console.log('🎯 [EDIT] Botón Editar Duración clickeado')
                    console.log('🎯 [EDIT] activePeriod:', activePeriod)
                    openEditForm(activePeriod)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Editar Duración
                </button>
              </div>
            </div>
          )}

          {/* Period History */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold">Historial de Periodos</h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              {periods.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No hay periodos registrados
                </div>
              ) : (
                periods.map((period) => (
                  <div key={period.id} className="p-4">
                    <div 
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => setExpandedPeriod(expandedPeriod === period.id ? null : period.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">
                            {leaderboardService.formatPeriodDates(period.start_date, period.end_date)}
                          </span>
                        </div>
                        {periodRewards[period.id] && (
                          <div className="flex items-center gap-1">
                            <Trophy className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm text-gray-600">
                              {(() => {
                                const reward = rewards.find(r => r.id === periodRewards[period.id])
                                return reward ? reward.name : 'Recompensa'
                              })()}
                            </span>
                          </div>
                        )}
                        {period.is_active ? (
                          <span className="px-2 py-1 bg-green-500 text-white text-xs rounded">Activo</span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded">Cerrado</span>
                        )}
                      </div>
                      {expandedPeriod === period.id ? (
                        <ChevronUp className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    
                    {expandedPeriod === period.id && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Duración</p>
                            <p>{period.duration_days} días</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Reinicio Automático</p>
                            <p>{period.auto_restart ? 'Activado' : 'Desactivado'}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Recompensa</p>
                            <p className="font-medium">
                              {periodRewards[period.id] ? (
                                (() => {
                                  const reward = rewards.find(r => r.id === periodRewards[period.id])
                                  return reward ? `${reward.name} (${reward.points} pts)` : 'ID: ' + periodRewards[period.id]
                                })()
                              ) : (
                                <span className="text-gray-400">Sin recompensa</span>
                              )}
                            </p>
                          </div>
                        </div>
                        
                        {period.is_active && (
                          <div className="mt-4 flex gap-2">
                            <button
                              onClick={() => openCloseModal(period)}
                              className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
                            >
                              Cerrar Periodo
                            </button>
                            <button
                              onClick={() => openEditForm(period)}
                              className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
                            >
                              Editar
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* New Period Form Modal */}
          {showNewPeriodForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Crear Nuevo Periodo</h3>
                  <button
                    onClick={() => setShowNewPeriodForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <form onSubmit={handleCreatePeriod} className="space-y-4">
                  <div className="p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-600">
                      <strong>Juego:</strong> Flappy Bird
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      <span className="font-semibold">ID:</span> <span className="font-mono">{GAME_ID}</span>
                    </p>
                    <p className="text-xs text-yellow-600 mt-1">
                      ⚠️ Este es el único juego configurado actualmente
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Duración (días) *</label>
                    <input
                      type="number"
                      value={newPeriod.durationDays}
                      onChange={(e) => setNewPeriod({...newPeriod, durationDays: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      min="1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Recompensa</label>
                    <select
                      value={newPeriod.rewardId || ''}
                      onChange={(e) => setNewPeriod({...newPeriod, rewardId: e.target.value || null})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Sin recompensa</option>
                      {rewards.map((reward) => (
                        <option key={reward.id} value={reward.id}>
                          {reward.name} - {reward.points} puntos
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="autoRestart"
                      checked={newPeriod.autoRestart}
                      onChange={(e) => setNewPeriod({...newPeriod, autoRestart: e.target.checked})}
                      className="rounded"
                    />
                    <label htmlFor="autoRestart" className="text-sm">
                      Reinicio automático (crear nuevo periodo al cerrar)
                    </label>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                    >
                      Crear Periodo
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowNewPeriodForm(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit Period Form Modal */}
          {showEditForm && editingPeriod && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Editar Periodo</h3>
                  <button
                    onClick={() => setShowEditForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <form
                  onSubmit={(e) => {
                    console.log('📨 [EDIT] FORM ONSUBMIT TRIGGERED')
                    handleUpdatePeriod(e)
                  }}
                  className="space-y-4"
                >
                  {/* Mostrar información del periodo actual */}
                  <div className="p-3 bg-gray-50 rounded-md mb-4">
                    <p className="text-xs text-gray-600">Periodo ID: {editingPeriod?.id}</p>
                    <p className="text-xs text-gray-600">Inicio: {editingPeriod?.start_date ? new Date(editingPeriod.start_date).toLocaleString('es') : 'N/A'}</p>
                    <p className="text-xs text-gray-600">Fin actual: {editingPeriod?.end_date ? new Date(editingPeriod.end_date).toLocaleString('es') : 'N/A'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Duración (días) *</label>
                    <input
                      type="number"
                      value={editData.duration_days || ''}
                      onChange={(e) => {
                        const value = e.target.value
                        // Permitir campo vacío temporalmente mientras escribe
                        if (value === '') {
                          console.log('🔄 [EDIT] Duration input cleared')
                          setEditData({...editData, duration_days: ''})
                        } else {
                          const numValue = parseInt(value)
                          if (!isNaN(numValue) && numValue > 0) {
                            console.log('🔄 [EDIT] Duration input changed to:', numValue)
                            setEditData({...editData, duration_days: numValue})
                          }
                        }
                      }}
                      onBlur={(e) => {
                        // Si el campo queda vacío al perder el foco, poner 1
                        if (e.target.value === '' || editData.duration_days === '') {
                          console.log('🔄 [EDIT] Duration defaulted to 1 on blur')
                          setEditData({...editData, duration_days: 1})
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      min="1"
                      max="365"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Recompensa</label>
                    <select
                      value={editData.reward_id || ''}
                      onChange={(e) => setEditData({...editData, reward_id: e.target.value || null})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Sin recompensa</option>
                      {rewards.map((reward) => (
                        <option key={reward.id} value={reward.id}>
                          {reward.name} - {reward.points} puntos
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="editAutoRestart"
                      checked={editData.auto_restart}
                      onChange={(e) => {
                        const newValue = e.target.checked
                        console.log('🔄 [EDIT] Auto-restart changed to:', newValue)
                        setEditData({...editData, auto_restart: newValue})
                      }}
                      className="rounded"
                    />
                    <label htmlFor="editAutoRestart" className="text-sm">
                      Reinicio automático
                    </label>
                  </div>
                  
                  {editData.auto_restart && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Duración del siguiente periodo (días) *</label>
                      <input
                        type="number"
                        value={editData.next_period_duration_days}
                        onChange={(e) => setEditData({...editData, next_period_duration_days: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        min="1"
                        required
                      />
                    </div>
                  )}
                  
                  {/* Botones de debug y prueba */}
                  <div className="p-2 bg-yellow-50 border border-yellow-300 rounded text-xs space-y-2">
                    <p className="font-semibold text-yellow-800">🔧 Herramientas de Debug:</p>
                    <button
                      type="button"
                      onClick={() => {
                        console.log('🔍 [DEBUG] === ESTADO DEL FORMULARIO ===')
                        console.log('🔍 [DEBUG] editingPeriod:', editingPeriod)
                        console.log('🔍 [DEBUG] editData:', editData)
                        console.log('🔍 [DEBUG] showEditForm:', showEditForm)
                        console.log('🔍 [DEBUG] Form will send:', {
                          periodId: editingPeriod?.id,
                          duration_days: editData.duration_days,
                          auto_restart: editData.auto_restart,
                          start_date: editingPeriod?.start_date
                        })
                        alert(`Estado del formulario:\n\nPeriod ID: ${editingPeriod?.id}\nDuración actual: ${editData.duration_days} días\nAuto-restart: ${editData.auto_restart}\nFecha inicio: ${editingPeriod?.start_date}`)
                      }}
                      className="text-yellow-700 underline block w-full text-left hover:bg-yellow-100 p-1"
                    >
                      🔍 Ver estado del formulario
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        console.log('🧪 [TEST] === PROBANDO PUT DIRECTO ===')
                        try {
                          const testData = {
                            duration_days: editData.duration_days,
                            auto_restart: editData.auto_restart,
                            start_date: editingPeriod.start_date
                          }
                          console.log('🧪 [TEST] Enviando a updatePeriod:', testData)
                          const result = await leaderboardService.updatePeriod(editingPeriod.id, testData)
                          console.log('🧪 [TEST] Resultado exitoso:', result)
                          alert('PUT ejecutado exitosamente - revisa la consola')
                          await loadPeriods()
                          await fetchActivePeriod()
                        } catch (err) {
                          console.error('🧪 [TEST] Error en PUT:', err)
                          alert(`Error en PUT: ${err.message}`)
                        }
                      }}
                      className="text-blue-700 underline block w-full text-left hover:bg-blue-100 p-1"
                    >
                      🧪 Probar PUT directamente (sin form submit)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        console.log('📝 [TEST] Simulando submit manual')
                        const form = document.querySelector('form')
                        if (form) {
                          console.log('📝 [TEST] Form found:', form)
                          const event = new Event('submit', { bubbles: true, cancelable: true })
                          form.dispatchEvent(event)
                        } else {
                          console.error('📝 [TEST] No form found!')
                        }
                      }}
                      className="text-green-700 underline block w-full text-left hover:bg-green-100 p-1"
                    >
                      📝 Simular submit del formulario
                    </button>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                      onClick={(e) => {
                        console.log('📤 [EDIT] Submit button clicked')
                        console.log('📤 [EDIT] Event type:', e.type)
                        console.log('📤 [EDIT] Form validity:', e.target.form?.checkValidity())
                      }}
                    >
                      Guardar Cambios
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        console.log('❌ Cancel button clicked')
                        setShowEditForm(false)
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'winners' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Ganadores</p>
                  <p className="text-2xl font-bold">{stats.totalWinners}</p>
                </div>
                <Trophy className="h-8 w-8 text-gray-400" />
              </div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pendientes de Recoger</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendingClaims}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Recogidos Hoy</p>
                  <p className="text-2xl font-bold text-green-600">{stats.claimedToday}</p>
                </div>
                <Check className="h-8 w-8 text-green-500" />
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterClaimed('all')}
              className={`px-4 py-2 rounded-md ${
                filterClaimed === 'all' 
                  ? 'bg-black text-white' 
                  : 'bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterClaimed('pending')}
              className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                filterClaimed === 'pending' 
                  ? 'bg-black text-white' 
                  : 'bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Clock className="h-4 w-4" />
              Pendientes
              {stats.pendingClaims > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-yellow-400 text-black text-xs rounded-full">
                  {stats.pendingClaims}
                </span>
              )}
            </button>
            <button
              onClick={() => setFilterClaimed('claimed')}
              className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                filterClaimed === 'claimed' 
                  ? 'bg-black text-white' 
                  : 'bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Check className="h-4 w-4" />
              Recogidos
            </button>
          </div>

          {/* Winners List */}
          <div className="space-y-4">
            {winners.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
                {filterClaimed === 'pending' 
                  ? 'No hay premios pendientes de recoger'
                  : filterClaimed === 'claimed'
                  ? 'No hay premios recogidos'
                  : 'No hay ganadores registrados'}
              </div>
            ) : (
              winners.map((winner) => (
                <div
                  key={winner.id}
                  className={`rounded-lg border-2 p-4 transition-all ${getPriorityClass(winner)}`}
                >
                  <div
                    className="flex justify-between items-start cursor-pointer"
                    onClick={() => {
                      console.log('👥 [Game] Winner clicked:', {
                        id: winner.id,
                        name: winner.user_name,
                        reward_claimed: winner.reward_claimed,
                        position: winner.position
                      })
                      setExpandedWinner(expandedWinner === winner.id ? null : winner.id)
                    }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <User className="h-5 w-5 text-gray-400" />
                        <span className="text-lg font-semibold">
                          {winner.user_name || 'Usuario Desconocido'}
                        </span>
                        {winner.position === 1 && (
                          <span className="px-2 py-1 bg-yellow-400 text-black text-xs rounded flex items-center gap-1">
                            <Award className="h-3 w-3" />
                            TOP 1
                          </span>
                        )}
                        {winner.reward_claimed && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded flex items-center gap-1">
                            <Check className="h-3 w-3" />
                            Recogido
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Puntuación</p>
                          <p className="font-semibold">{winner.score?.toLocaleString() || 0} pts</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Periodo</p>
                          <p className="font-semibold">
                            {winner.period_id || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Posición</p>
                          <p className="font-semibold">
                            #{winner.position || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Ganó</p>
                          <p className="font-semibold">
                            {formatDaysAgo(winner.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="ml-4">
                      {expandedWinner === winner.id ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {expandedWinner === winner.id && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-4">
                        <div>
                          <p className="text-gray-600">ID de Usuario</p>
                          <p>{winner.user_id || 'N/A'}</p>
                        </div>
                        {winner.reward_claimed && winner.claimed_at && (
                          <div>
                            <p className="text-gray-600">Recogido el</p>
                            <p>{new Date(winner.claimed_at).toLocaleString('es')}</p>
                          </div>
                        )}
                      </div>

                      {!winner.reward_claimed ? (
                        <div className="space-y-2">
                          <button
                            onClick={() => handleMarkClaimed(winner.id)}
                            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 flex items-center gap-2 w-full"
                          >
                            <Check className="h-4 w-4" />
                            Marcar como Recogido
                          </button>

                          {/* Herramientas de debug */}
                          <div className="p-2 bg-gray-100 rounded text-xs space-y-1">
                            <p className="font-semibold">🔧 Debug Info:</p>
                            <p>Winner ID: {winner.id || 'NO ID'}</p>
                            <p>User ID: {winner.user_id || 'NO USER ID'}</p>
                            <p>Status: {winner.reward_claimed ? 'Reclamado' : 'Pendiente'}</p>
                            <button
                              onClick={async () => {
                                console.log('🧪 [DEBUG] Testing mark claimed directly')
                                console.log('🧪 [DEBUG] Winner object:', winner)
                                try {
                                  const result = await leaderboardService.markWinnerClaimed(winner.id)
                                  console.log('🧪 [DEBUG] Direct mark result:', result)
                                  alert('Ver consola para resultado del test')
                                } catch (err) {
                                  console.error('🧪 [DEBUG] Direct mark error:', err)
                                  alert('Error en test - ver consola')
                                }
                              }}
                              className="text-blue-600 underline"
                            >
                              🧪 Test directo del servicio
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-2 bg-green-100 rounded text-sm">
                          ✅ Premio recogido el {winner.claimed_at ? new Date(winner.claimed_at).toLocaleDateString('es') : 'fecha desconocida'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modal de confirmación para cerrar periodo */}
      {showCloseModal && periodToClose && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <Calendar className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Cerrar Periodo</h3>
                <p className="text-sm text-gray-600">Esta acción no se puede deshacer</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm font-medium text-gray-700">Periodo a cerrar:</p>
                <p className="text-lg font-semibold">
                  {leaderboardService.formatPeriodDates(periodToClose.start_date, periodToClose.end_date)}
                </p>
              </div>

              {periodRewards[periodToClose.id] && (
                <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-yellow-600" />
                    <p className="text-sm font-medium text-yellow-700">Recompensa:</p>
                  </div>
                  <p className="text-sm text-yellow-800 ml-6">
                    {(() => {
                      const reward = rewards.find(r => r.id === periodRewards[periodToClose.id])
                      return reward ? `${reward.name} (${reward.points} puntos)` : 'Recompensa asignada'
                    })()}
                  </p>
                </div>
              )}

              <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>¿Qué pasará?</strong>
                </p>
                <ul className="text-sm text-blue-700 mt-1 space-y-1">
                  <li>• Se determinará el ganador basado en las puntuaciones</li>
                  <li>• El periodo se marcará como cerrado</li>
                  {periodToClose.auto_restart && (
                    <li>• Se creará automáticamente un nuevo periodo</li>
                  )}
                </ul>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCloseModal(false)
                  setPeriodToClose(null)
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleClosePeriod}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Cerrar Periodo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Game