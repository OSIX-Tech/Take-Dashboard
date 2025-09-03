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
import { highScoreService } from '@/services/gameService'
import { leaderboardService } from '@/services/leaderboardService'
// eslint-disable-next-line no-unused-vars
import LoadingSpinner from '@/components/common/LoadingSpinner'
// eslint-disable-next-line no-unused-vars
import ErrorMessage from '@/components/common/ErrorMessage'

function Game() {
  const [activeTab, setActiveTab] = useState('leaderboard')
  const [leaderboard, setLeaderboard] = useState([])
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
  const [filterClaimed, setFilterClaimed] = useState('pending')
  const [stats, setStats] = useState({
    totalWinners: 0,
    pendingClaims: 0,
    claimedToday: 0
  })

  const [newPeriod, setNewPeriod] = useState({
    gameId: '',
    durationDays: 7,
    autoRestart: true
  })

  const [editData, setEditData] = useState({
    duration_days: 7,
    auto_restart: true,
    next_period_duration_days: 7
  })

  useEffect(() => {
    if (activeTab === 'leaderboard') {
      fetchLeaderboard()
      fetchActivePeriod()
    } else if (activeTab === 'periods') {
      loadPeriods()
    } else if (activeTab === 'winners') {
      loadWinners()
    }

    const interval = setInterval(() => {
      if (activeTab === 'leaderboard' || activeTab === 'periods') {
        fetchActivePeriod()
      }
    }, 60000)
    
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, filterClaimed])

  const fetchActivePeriod = async () => {
    try {
      const period = await leaderboardService.getActivePeriod()
      setActivePeriod(period)
    } catch (err) {
      console.error('Error loading active period:', err)
    }
  }

  const fetchLeaderboard = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await highScoreService.getHighScoresRange(1, 50)
      
      let data = []
      if (Array.isArray(response)) {
        data = response
      } else if (response && response.data) {
        data = response.data
      } else if (response && Array.isArray(response.results)) {
        data = response.results
      }
      
      const leaderboardData = data
        .map((item) => ({
          id: item.id,
          user: item.user_name || 'Usuario',
          score: item.high_score || 0,
          date: item.achieved_at
        }))
        .sort((a, b) => b.score - a.score)
        .map((item, index) => ({
          ...item,
          rank: index + 1
        }))
      
      setLeaderboard(leaderboardData)
    } catch (err) {
      console.error('Error loading leaderboard:', err)
      setError('Error al cargar el leaderboard')
    } finally {
      setLoading(false)
    }
  }

  const loadPeriods = async () => {
    try {
      setLoading(true)
      const data = await leaderboardService.getAllPeriods()
      setPeriods(Array.isArray(data) ? data : [])
      setError(null)
    } catch (err) {
      console.error('Error loading periods:', err)
      setError('Error al cargar los periodos')
    } finally {
      setLoading(false)
    }
  }

  const loadWinners = async () => {
    try {
      setLoading(true)
      const data = await leaderboardService.getAllWinners()
      let winnersData = Array.isArray(data) ? data : []
      
      if (filterClaimed === 'pending') {
        winnersData = winnersData.filter(w => !w.claimed)
      } else if (filterClaimed === 'claimed') {
        winnersData = winnersData.filter(w => w.claimed)
      }
      
      setWinners(winnersData)
      
      const allWinners = Array.isArray(data) ? data : []
      const pendingCount = allWinners.filter(w => !w.claimed).length
      const today = new Date().toDateString()
      const claimedTodayCount = allWinners.filter(w => 
        w.claimed && w.claimed_at && new Date(w.claimed_at).toDateString() === today
      ).length
      
      setStats({
        totalWinners: allWinners.length,
        pendingClaims: pendingCount,
        claimedToday: claimedTodayCount
      })
      
      setError(null)
    } catch (err) {
      console.error('Error loading winners:', err)
      setError('Error al cargar los ganadores')
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePeriod = async (e) => {
    e.preventDefault()
    try {
      await leaderboardService.createPeriod(newPeriod)
      setShowNewPeriodForm(false)
      setNewPeriod({ gameId: '', durationDays: 7, autoRestart: true })
      await loadPeriods()
    } catch (err) {
      console.error('Error creating period:', err)
      setError('Error al crear el periodo')
    }
  }

  const handleUpdatePeriod = async (e) => {
    e.preventDefault()
    if (!editingPeriod) return
    
    try {
      await leaderboardService.updatePeriod(editingPeriod.id, editData)
      setShowEditForm(false)
      setEditingPeriod(null)
      await loadPeriods()
    } catch (err) {
      console.error('Error updating period:', err)
      setError('Error al actualizar el periodo')
    }
  }

  const handleClosePeriod = async (periodId) => {
    if (!confirm('¿Cerrar este periodo y determinar el ganador?')) return
    
    try {
      await leaderboardService.closePeriod(periodId)
      await loadPeriods()
      await fetchActivePeriod()
    } catch (err) {
      console.error('Error closing period:', err)
      setError('Error al cerrar el periodo')
    }
  }

  const handleProcessExpired = async () => {
    try {
      await leaderboardService.processExpiredPeriods()
      await loadPeriods()
      alert('Periodos expirados procesados correctamente')
    } catch (err) {
      console.error('Error processing expired periods:', err)
      setError('Error al procesar periodos expirados')
    }
  }

  const handleMarkClaimed = async (winnerId) => {
    if (!confirm('¿Confirmar que el premio ha sido recogido?')) return
    
    try {
      await leaderboardService.markWinnerClaimed(winnerId)
      await loadWinners()
    } catch (err) {
      console.error('Error marking winner as claimed:', err)
      setError('Error al marcar premio como recogido')
    }
  }

  const openEditForm = (period) => {
    setEditingPeriod(period)
    setEditData({
      duration_days: period.duration_days,
      auto_restart: period.auto_restart,
      next_period_duration_days: period.duration_days
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
    if (winner.claimed) return 'border-gray-200 bg-gray-50'
    
    const daysAgo = Math.floor((new Date() - new Date(winner.leaderboard_periods?.end_date || winner.created_at)) / (1000 * 60 * 60 * 24))
    
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
            onClick={() => setActiveTab('leaderboard')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'leaderboard'
                ? 'border-b-2 border-black text-black'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Trophy className="inline-block w-4 h-4 mr-2" />
            Leaderboard
          </button>
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
      {activeTab === 'leaderboard' && (
        <div className="space-y-6">
          {/* Active Period Info */}
          {activePeriod && (
            <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-800 rounded-xl">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-800 text-white rounded-lg">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Periodo Actual</p>
                      <p className="font-semibold text-gray-900">
                        {leaderboardService.formatPeriodDates(activePeriod.start_date, activePeriod.end_date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-800 text-white rounded-lg">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Tiempo Restante</p>
                      <p className="font-bold text-gray-900 text-lg">
                        {leaderboardService.formatTimeRemaining(activePeriod.end_date)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-300">
                  <p className="text-sm text-gray-700 text-center">
                    <Trophy className="inline-block w-4 h-4 mr-1" />
                    El ganador del periodo recibirá un premio especial en la cafetería
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Top 3 Cards */}
          {leaderboard.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {leaderboard.slice(0, 3).map((player, index) => (
                <Card key={player.id} className={`bg-white border-2 ${
                  index === 0 ? 'border-gray-900' :
                  index === 1 ? 'border-gray-700' :
                  'border-gray-600'
                } rounded-xl shadow-sm transition-all duration-300 hover:shadow-lg`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          index === 0 ? 'bg-gray-900' :
                          index === 1 ? 'bg-gray-700' :
                          'bg-gray-600'
                        }`}>
                          <span className="text-white font-bold text-lg">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-bold text-lg text-gray-900">{player.user}</p>
                          <p className="text-sm text-gray-600">{getRankIcon(index + 1) && 'Top Player'}</p>
                        </div>
                      </div>
                      {getRankIcon(index + 1)}
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{player.score.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">puntos</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Leaderboard Table */}
          <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Ranking Completo</CardTitle>
            </CardHeader>
            <CardContent>
              {leaderboard.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>No hay puntuaciones registradas</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20 text-gray-700">Posición</TableHead>
                      <TableHead className="text-gray-700">Jugador</TableHead>
                      <TableHead className="text-right text-gray-700">Puntuación</TableHead>
                      <TableHead className="text-right text-gray-700">Fecha</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaderboard.map((player) => (
                      <TableRow 
                        key={player.id} 
                        className={getRowStyle(player.rank)}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {getRankIcon(player.rank)}
                            <span className={`${player.rank <= 3 ? 'font-bold' : ''} text-gray-900`}>
                              {player.rank}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                              player.rank === 1 ? 'bg-gray-900' :
                              player.rank === 2 ? 'bg-gray-700' :
                              player.rank === 3 ? 'bg-gray-600' :
                              'bg-gray-400'
                            }`}>
                              {player.user.charAt(0).toUpperCase()}
                            </div>
                            <span className={`${player.rank <= 3 ? 'font-semibold' : ''} text-gray-900`}>
                              {player.user}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={`font-mono ${player.rank <= 3 ? 'font-bold text-lg' : ''} text-gray-900`}>
                            {player.score.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-gray-600">
                          {player.date ? new Date(player.date).toLocaleDateString('es-ES') : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      )}

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
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fin</p>
                  <p className="font-semibold">
                    {new Date(activePeriod.end_date).toLocaleDateString('es')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Duración</p>
                  <p className="font-semibold">{activePeriod.duration_days} días</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Reinicio Auto</p>
                  <p className="font-semibold">{activePeriod.auto_restart ? 'Sí' : 'No'}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleClosePeriod(activePeriod.id)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cerrar Periodo
                </button>
                <button
                  onClick={() => openEditForm(activePeriod)}
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
                        </div>
                        
                        {period.is_active && (
                          <div className="mt-4 flex gap-2">
                            <button
                              onClick={() => handleClosePeriod(period.id)}
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
                  <div>
                    <label className="block text-sm font-medium mb-1">ID del Juego</label>
                    <input
                      type="text"
                      value={newPeriod.gameId}
                      onChange={(e) => setNewPeriod({...newPeriod, gameId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="UUID del juego"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Duración (días)</label>
                    <input
                      type="number"
                      value={newPeriod.durationDays}
                      onChange={(e) => setNewPeriod({...newPeriod, durationDays: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      min="1"
                      required
                    />
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
                      Reinicio automático
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
                
                <form onSubmit={handleUpdatePeriod} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Duración (días)</label>
                    <input
                      type="number"
                      value={editData.duration_days}
                      onChange={(e) => setEditData({...editData, duration_days: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      min="1"
                      required
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="editAutoRestart"
                      checked={editData.auto_restart}
                      onChange={(e) => setEditData({...editData, auto_restart: e.target.checked})}
                      className="rounded"
                    />
                    <label htmlFor="editAutoRestart" className="text-sm">
                      Reinicio automático
                    </label>
                  </div>
                  
                  {editData.auto_restart && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Duración del siguiente periodo (días)</label>
                      <input
                        type="number"
                        value={editData.next_period_duration_days}
                        onChange={(e) => setEditData({...editData, next_period_duration_days: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        min="1"
                      />
                    </div>
                  )}
                  
                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                    >
                      Guardar Cambios
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowEditForm(false)}
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
                    onClick={() => setExpandedWinner(expandedWinner === winner.id ? null : winner.id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <User className="h-5 w-5 text-gray-400" />
                        <span className="text-lg font-semibold">
                          {winner.users?.name || 'Usuario Desconocido'}
                        </span>
                        {winner.position === 1 && (
                          <span className="px-2 py-1 bg-yellow-400 text-black text-xs rounded flex items-center gap-1">
                            <Award className="h-3 w-3" />
                            TOP 1
                          </span>
                        )}
                        {winner.claimed && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded flex items-center gap-1">
                            <Check className="h-3 w-3" />
                            Recogido
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Puntuación</p>
                          <p className="font-semibold">{winner.final_score?.toLocaleString()} pts</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Periodo</p>
                          <p className="font-semibold">
                            {winner.leaderboard_periods 
                              ? leaderboardService.formatPeriodDates(
                                  winner.leaderboard_periods.start_date,
                                  winner.leaderboard_periods.end_date
                                )
                              : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Juego</p>
                          <p className="font-semibold">
                            {winner.leaderboard_periods?.games?.name || 'Flappy Bird'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Ganó</p>
                          <p className="font-semibold">
                            {formatDaysAgo(winner.leaderboard_periods?.end_date || winner.created_at)}
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
                          <p className="text-gray-600">Email</p>
                          <p>{winner.users?.email || 'N/A'}</p>
                        </div>
                        {winner.claimed && winner.claimed_at && (
                          <div>
                            <p className="text-gray-600">Recogido el</p>
                            <p>{new Date(winner.claimed_at).toLocaleString('es')}</p>
                          </div>
                        )}
                      </div>
                      
                      {!winner.claimed && (
                        <button
                          onClick={() => handleMarkClaimed(winner.id)}
                          className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 flex items-center gap-2"
                        >
                          <Check className="h-4 w-4" />
                          Marcar como Recogido
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Game