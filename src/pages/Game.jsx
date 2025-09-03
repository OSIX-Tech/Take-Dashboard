import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Trophy, Medal, Award, Star, User, Calendar, Clock } from 'lucide-react'
import { highScoreService } from '@/services/gameService'
import { leaderboardService } from '@/services/leaderboardService'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorMessage from '@/components/common/ErrorMessage'

function Game() {
  const [leaderboard, setLeaderboard] = useState([])
  const [activePeriod, setActivePeriod] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchLeaderboard()
    fetchActivePeriod()
    const interval = setInterval(() => {
      fetchActivePeriod()
    }, 60000) // Update period info every minute
    return () => clearInterval(interval)
  }, [])

  const fetchActivePeriod = async () => {
    try {
      const period = await leaderboardService.getActivePeriod()
      setActivePeriod(period)
    } catch (err) {
      console.error('Error cargando periodo activo:', err)
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
      
      // Mapear datos del backend y ordenar por puntuación (mayor a menor)
      const leaderboardData = data
        .map((item) => ({
          id: item.id,
          user: item.user_name || 'Usuario',
          score: item.high_score || 0,
          date: item.achieved_at
        }))
        .sort((a, b) => b.score - a.score) // Ordenar por score descendente
        .map((item, index) => ({
          ...item,
          rank: index + 1 // Asignar ranking correcto después del ordenamiento
        }))
      
      setLeaderboard(leaderboardData)
    } catch (err) {
      console.error('Error cargando leaderboard:', err)
      setError('Error al cargar el leaderboard')
    } finally {
      setLoading(false)
    }
  }

  // Función para obtener el icono de ranking
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

  // Función para obtener estilos de fila según ranking
  const getRowStyle = (rank) => {
    if (rank === 1) return 'bg-gray-100 border-l-4 border-gray-900'
    if (rank === 2) return 'bg-gray-50 border-l-4 border-gray-700'
    if (rank === 3) return 'bg-gray-50 border-l-4 border-gray-600'
    return 'hover:bg-gray-50 transition-colors duration-200'
  }

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Leaderboard</h1>
          <p className="text-sm lg:text-base text-gray-600 mt-1">
            Top {leaderboard.length} mejores jugadores
          </p>
        </div>
      </div>

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
              <p style={{ color: '#6b7280' }}>No hay puntuaciones registradas</p>
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
                        <span className={`${
                          player.rank <= 3 ? 'font-bold' : ''
                        } text-gray-900`}>
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
                        <span className={`${
                          player.rank <= 3 ? 'font-semibold' : ''
                        } text-gray-900`}>
                          {player.user}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`font-mono ${
                        player.rank <= 3 ? 'font-bold text-lg' : ''
                      } text-gray-900`}>
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
  )
}

export default Game