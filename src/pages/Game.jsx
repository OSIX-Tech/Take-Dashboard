import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, Medal, Star, TrendingUp, Users, Gamepad2, Crown, Flame, Zap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { highScoreService } from '@/services/gameService'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorMessage from '@/components/common/ErrorMessage'

function Game() {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedGame, setSelectedGame] = useState('all')

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Hoy'
    if (diffDays === 1) return 'Ayer'
    if (diffDays < 7) return `Hace ${diffDays} días`
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`
    
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short'
    })
  }

  const getRankIcon = (rank) => {
    return <span className="text-base font-semibold text-gray-700">#{rank}</span>
  }

  const getRankStyle = (rank) => {
    return 'bg-white hover:bg-gray-50'
  }

  const fetchLeaderboard = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await highScoreService.getHighScores(1, 50)
      
      let data = []
      
      if (Array.isArray(response)) {
        data = response
      } else if (response && response.data) {
        data = response.data
      } else if (response && Array.isArray(response.results)) {
        data = response.results
      }
      
      // Ordenar por high_score de mayor a menor
      const sortedData = [...data].sort((a, b) => (b.high_score || 0) - (a.high_score || 0))
      
      // Asignar el ranking correcto basado en el orden
      const leaderboardWithRank = sortedData.map((item, index) => ({
        ...item,
        rank: index + 1,
        user: item.user_name || item.user,
        game: item.game_name || item.game
      }))
      
      setLeaderboard(leaderboardWithRank)
    } catch (err) {
      console.error('Error cargando leaderboard:', err)
      setError('Error al cargar el leaderboard')
      setLeaderboard([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return <ErrorMessage message={error} />
  }

  if (!leaderboard || leaderboard.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Gamepad2 className="w-20 h-20 text-gray-300 mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-3">No hay puntuaciones aún</h2>
        <p className="text-gray-600 text-center max-w-md">
          Los jugadores aparecerán aquí cuando comiencen a jugar y obtener puntuaciones
        </p>
      </div>
    )
  }

  // Get unique games for filter
  const uniqueGames = [...new Set(leaderboard.map(score => score.game_name || score.game).filter(Boolean))]
  const filteredLeaderboard = selectedGame === 'all' 
    ? leaderboard 
    : leaderboard.filter(score => (score.game_name || score.game) === selectedGame)

  // Calculate stats
  const totalPlayers = new Set(leaderboard.map(score => score.user_id)).size
  const averageScore = Math.round(
    leaderboard.reduce((acc, score) => acc + (score.high_score || 0), 0) / leaderboard.length
  )
  const topScore = Math.max(...leaderboard.map(score => score.high_score || 0))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Leaderboard</h1>
          <p className="text-sm lg:text-base text-gray-600 mt-1">
            Clasificación global de jugadores
          </p>
        </div>
        
        {/* Game Filter */}
        {uniqueGames.length > 0 && (
          <select
            value={selectedGame}
            onChange={(e) => setSelectedGame(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            <option value="all">Todos los juegos</option>
            {uniqueGames.map(game => (
              <option key={game} value={game}>{game}</option>
            ))}
          </select>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-gray-50 to-white border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Jugadores</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{totalPlayers}</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-full">
                <Users className="w-6 h-6 text-gray-700" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-gray-50 to-white border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Puntuación Media</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{averageScore.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-gray-700" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-gray-50 to-white border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Récord Actual</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{topScore.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-full">
                <Flame className="w-6 h-6 text-gray-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top 3 Podium */}
      {filteredLeaderboard.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Second Place */}
          <div className="card md:mt-8 bg-gradient-to-br from-gray-50 to-white rounded-2xl border-0 shadow-lg order-2 md:order-1">
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-gray-100 rounded-full">
                  <Medal className="w-10 h-10 text-gray-400" />
                </div>
              </div>
              <Badge className="mb-2 bg-gray-200 text-gray-700 border-0">2º Lugar</Badge>
              <h3 className="text-xl font-bold text-gray-900 mt-3">{filteredLeaderboard[1].user_name || filteredLeaderboard[1].user || 'Jugador'}</h3>
              <p className="text-sm text-gray-600 mt-1">{filteredLeaderboard[1].game_name || filteredLeaderboard[1].game || 'Juego'}</p>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-3xl font-bold text-gray-900">
                  {filteredLeaderboard[1].high_score?.toLocaleString() || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">puntos</p>
              </div>
            </CardContent>
          </div>

          {/* First Place */}
          <div className="card bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl border-0 shadow-xl transform md:scale-105 order-1 md:order-2">
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-yellow-100 rounded-full">
                  <Crown className="w-12 h-12 text-yellow-500" />
                </div>
              </div>
              <Badge className="mb-2 bg-yellow-200 text-yellow-800 border-0">1º Lugar</Badge>
              <h3 className="text-xl font-bold text-gray-900 mt-3">{filteredLeaderboard[0].user_name || filteredLeaderboard[0].user || 'Jugador'}</h3>
              <p className="text-sm text-gray-600 mt-1">{filteredLeaderboard[0].game_name || filteredLeaderboard[0].game || 'Juego'}</p>
              <div className="mt-4 pt-4 border-t border-yellow-200">
                <p className="text-3xl font-bold text-gray-900">
                  {filteredLeaderboard[0].high_score?.toLocaleString() || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">puntos</p>
              </div>
            </CardContent>
          </div>

          {/* Third Place */}
          <div className="card md:mt-8 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border-0 shadow-lg order-3">
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-orange-100 rounded-full">
                  <Medal className="w-10 h-10 text-amber-600" />
                </div>
              </div>
              <Badge className="mb-2 bg-orange-200 text-orange-800 border-0">3º Lugar</Badge>
              <h3 className="text-xl font-bold text-gray-900 mt-3">{filteredLeaderboard[2].user_name || filteredLeaderboard[2].user || 'Jugador'}</h3>
              <p className="text-sm text-gray-600 mt-1">{filteredLeaderboard[2].game_name || filteredLeaderboard[2].game || 'Juego'}</p>
              <div className="mt-4 pt-4 border-t border-orange-200">
                <p className="text-3xl font-bold text-gray-900">
                  {filteredLeaderboard[2].high_score?.toLocaleString() || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">puntos</p>
              </div>
            </CardContent>
          </div>
        </div>
      )}

      {/* Full Leaderboard */}
      <div className="card-macos rounded-2xl border-0 shadow-sm">
        <div className="border-b bg-gray-50 rounded-t-2xl p-4 sm:p-6">
          <div className="flex items-center space-x-2 font-semibold text-lg">
            <Trophy className="w-5 h-5" />
            <span>Clasificación Completa</span>
          </div>
        </div>
        <div className="p-0">
          <div className="divide-y divide-gray-100">
            {filteredLeaderboard.map((score, index) => (
              <div
                key={score.id}
                className="flex items-center justify-between p-4 bg-white"
              >
                {/* Rank and Player Info */}
                <div className="flex items-center space-x-4 flex-1">
                  <div className="flex-shrink-0 w-12 flex justify-center">
                    {getRankIcon(score.rank)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-semibold text-gray-900 truncate">
                        {score.user_name || score.user || 'Jugador Anónimo'}
                      </h4>
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {score.game_name || score.game || 'Juego'} • {formatDate(score.achieved_at)}
                    </p>
                  </div>
                </div>

                {/* Score */}
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="flex items-center space-x-1">
                      <span className="text-lg font-bold text-gray-900">
                        {score.high_score?.toLocaleString() || 0}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">puntos</p>
                  </div>
                  
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Game