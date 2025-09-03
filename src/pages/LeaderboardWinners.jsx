import { useState, useEffect, useCallback } from 'react'
// eslint-disable-next-line no-unused-vars
import { Trophy, User, Clock, Check, Award, ChevronDown, ChevronUp } from 'lucide-react'
// eslint-disable-next-line no-unused-vars
import Layout from '../components/layout/Layout.jsx'
import { leaderboardService } from '../services/leaderboardService.js'

function LeaderboardWinners() {
  const [winners, setWinners] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedWinner, setExpandedWinner] = useState(null)
  const [filterClaimed, setFilterClaimed] = useState('pending') // 'all', 'pending', 'claimed'
  const [stats, setStats] = useState({
    totalWinners: 0,
    pendingClaims: 0,
    claimedToday: 0
  })

  const loadWinners = useCallback(async () => {
    try {
      setLoading(true)
      const params = {}
      
      const data = await leaderboardService.getAllWinners(params)
      let winnersData = Array.isArray(data) ? data : []
      
      // Apply client-side filtering based on claimed status
      if (filterClaimed === 'pending') {
        winnersData = winnersData.filter(w => !w.claimed)
      } else if (filterClaimed === 'claimed') {
        winnersData = winnersData.filter(w => w.claimed)
      }
      
      setWinners(winnersData)
      
      // Calculate stats
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
  }, [filterClaimed])

  useEffect(() => {
    loadWinners()
  }, [loadWinners])


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

  if (loading) return <Layout><div className="p-6">Cargando ganadores...</div></Layout>
  if (error) return <Layout><div className="p-6 text-red-500">{error}</div></Layout>

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Ganadores del Leaderboard</h1>
          <button
            onClick={loadWinners}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Actualizar
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
        <div className="flex gap-2 mb-4">
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
                          {winner.leaderboard_periods?.games?.name || 'N/A'}
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
                      <div>
                        <p className="text-gray-600">ID del Ganador</p>
                        <p className="font-mono text-xs">{winner.id}</p>
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
    </Layout>
  )
}

export default LeaderboardWinners