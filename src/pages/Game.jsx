import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
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

  // Funciones de estilo eliminadas - tabla simple

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

      {/* Leaderboard Table */}
      <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle>Ranking Global</CardTitle>
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
                  <TableHead className="w-16">#</TableHead>
                  <TableHead>Jugador</TableHead>
                  <TableHead className="text-right">Puntuación</TableHead>
                  <TableHead className="text-right">Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard.map((player) => (
                  <TableRow key={player.id}>
                    <TableCell className="font-medium">{player.rank}</TableCell>
                    <TableCell>{player.user}</TableCell>
                    <TableCell className="text-right font-mono">
                      {player.score.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-gray-500">
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