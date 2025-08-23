import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, Crown } from 'lucide-react'
import { highScoreService } from '@/services/gameService'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorMessage from '@/components/common/ErrorMessage'

function Game() {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

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
      
      // Mapear datos del backend
      const leaderboardData = data.map((item, index) => ({
        id: item.id,
        rank: item.idx_high_scores || (index + 1),
        user: item.user_name || 'Usuario',
        score: item.high_score || 0,
        date: item.achieved_at
      }))
      
      setLeaderboard(leaderboardData)
    } catch (err) {
      console.error('Error cargando leaderboard:', err)
      setError('Error al cargar el leaderboard')
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />
    if (rank === 2) return <Trophy className="w-5 h-5 text-gray-400" />
    if (rank === 3) return <Trophy className="w-5 h-5 text-amber-600" />
    return <span className="text-sm font-semibold text-gray-600">#{rank}</span>
  }

  const getRankStyle = (rank) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200'
    if (rank === 2) return 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200'
    if (rank === 3) return 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200'
    return 'bg-white border-gray-100'
  }

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Leaderboard</h1>
        <p className="text-sm lg:text-base text-gray-600 mt-1">
          Clasificación de jugadores ({leaderboard.length} jugadores)
        </p>
      </div>

      {/* Leaderboard */}
      <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Ranking Global
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-1">
            {leaderboard.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No hay puntuaciones registradas</p>
              </div>
            ) : (
              leaderboard.map((player) => (
                <div
                  key={player.id}
                  className={`flex items-center justify-between px-6 py-4 border-l-4 ${getRankStyle(player.rank)} hover:shadow-sm transition-all`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10">
                      {getRankIcon(player.rank)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {player.user}
                      </p>
                      {player.date && (
                        <p className="text-xs text-gray-500">
                          {new Date(player.date).toLocaleDateString('es-ES')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">
                      {player.score.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">puntos</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Game