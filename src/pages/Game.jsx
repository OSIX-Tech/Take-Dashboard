import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Trophy, Medal, Award, Star, TrendingUp, Calendar, User } from 'lucide-react'
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
        return <Trophy className="w-6 h-6 text-yellow-500" />
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />
      case 3:
        return <Award className="w-5 h-5 text-orange-600" />
      default:
        return null
    }
  }

  // Función para obtener estilos de fila según ranking
  const getRowStyle = (rank) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-500'
    if (rank === 2) return 'bg-gradient-to-r from-gray-50 to-slate-50 border-l-4 border-gray-400'
    if (rank === 3) return 'bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-orange-500'
    return 'hover:bg-gray-50 transition-colors duration-200'
  }

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-black text-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold flex items-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-400" />
              Leaderboard
            </h1>
            <p className="text-gray-300 mt-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Top {leaderboard.length} mejores jugadores
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Última actualización</p>
            <p className="text-lg font-semibold">{new Date().toLocaleDateString('es-ES')}</p>
          </div>
        </div>
      </div>

      {/* Top 3 Cards */}
      {leaderboard.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {leaderboard.slice(0, 3).map((player, index) => (
            <Card key={player.id} className={`relative overflow-hidden transition-all duration-300 hover:scale-105 ${
              index === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white' :
              index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white' :
              'bg-gradient-to-br from-orange-400 to-orange-500 text-white'
            }`}>
              <div className="absolute top-2 right-2 opacity-20">
                {getRankIcon(index + 1)}
              </div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                      {getRankIcon(index + 1)}
                    </div>
                    <div>
                      <p className="text-sm opacity-90">#{index + 1}</p>
                      <p className="font-bold text-lg">{player.user}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{player.score.toLocaleString()}</p>
                    <p className="text-sm opacity-75">puntos</p>
                  </div>
                  <Star className="w-8 h-8 opacity-50" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Leaderboard Table */}
      <Card className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Trophy className="w-5 h-5 text-gray-700" />
            Ranking Completo
          </CardTitle>
        </CardHeader>
        <CardContent>
          {leaderboard.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p style={{ color: '#6b7280' }}>No hay puntuaciones registradas</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-20 font-bold text-gray-800">Posición</TableHead>
                    <TableHead className="font-bold text-gray-800">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Jugador
                      </div>
                    </TableHead>
                    <TableHead className="text-right font-bold text-gray-800">
                      <div className="flex items-center justify-end gap-2">
                        <Star className="w-4 h-4" />
                        Puntuación
                      </div>
                    </TableHead>
                    <TableHead className="text-right font-bold text-gray-800">
                      <div className="flex items-center justify-end gap-2">
                        <Calendar className="w-4 h-4" />
                        Fecha
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
              <TableBody>
                  {leaderboard.map((player) => (
                    <TableRow 
                      key={player.id} 
                      className={`${getRowStyle(player.rank)} transition-all duration-200`}
                    >
                      <TableCell className="font-bold">
                        <div className="flex items-center gap-2">
                          {getRankIcon(player.rank)}
                          <span className={`${
                            player.rank <= 3 ? 'text-lg' : 'text-base'
                          } ${player.rank === 1 ? 'text-yellow-600' : 
                             player.rank === 2 ? 'text-gray-600' :
                             player.rank === 3 ? 'text-orange-600' : 'text-gray-700'}`}>
                            {player.rank}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${
                            player.rank === 1 ? 'from-yellow-400 to-amber-500' :
                            player.rank === 2 ? 'from-gray-300 to-gray-400' :
                            player.rank === 3 ? 'from-orange-400 to-orange-500' :
                            'from-gray-200 to-gray-300'
                          } flex items-center justify-center text-white font-bold text-sm`}>
                            {player.user.charAt(0).toUpperCase()}
                          </div>
                          <span className={`font-medium ${
                            player.rank <= 3 ? 'text-base font-semibold' : 'text-sm'
                          } text-gray-800`}>
                            {player.user}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`font-mono font-bold ${
                          player.rank === 1 ? 'text-xl text-yellow-600' :
                          player.rank === 2 ? 'text-lg text-gray-600' :
                          player.rank === 3 ? 'text-lg text-orange-600' :
                          'text-base text-gray-700'
                        }`}>
                          {player.score.toLocaleString()}
                        </span>
                        {player.rank <= 3 && (
                          <span className="ml-2 text-xs text-gray-500">pts</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-sm text-gray-500">
                          {player.date ? new Date(player.date).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          }) : '-'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default Game