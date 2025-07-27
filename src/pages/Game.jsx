import { useState } from 'react'
import { 
  Trophy, 
  Users, 
  BarChart3, 
  Tag, 
  Download, 
  RefreshCw, 
  Medal, 
  Star, 
  Award,
  Search,
  Gamepad2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const Game = () => {
  // Mock games data
  const games = [
    { id: '1', name: 'Café Runner', description: 'Juego de plataformas con temática de café' },
    { id: '2', name: 'Barista Challenge', description: 'Simulador de barista' },
    { id: '3', name: 'Coffee Quiz', description: 'Trivia sobre café' }
  ]

  const [leaderboard, setLeaderboard] = useState([
    { id: '1', user_id: '1', game_id: '1', high_score: 2840, achieved_at: '2024-02-15T10:30:00Z' },
    { id: '2', user_id: '2', game_id: '1', high_score: 2650, achieved_at: '2024-02-14T15:45:00Z' },
    { id: '3', user_id: '3', game_id: '2', high_score: 2480, achieved_at: '2024-02-13T09:20:00Z' },
    { id: '4', user_id: '4', game_id: '1', high_score: 2320, achieved_at: '2024-02-12T14:15:00Z' },
    { id: '5', user_id: '5', game_id: '3', high_score: 2180, achieved_at: '2024-02-11T11:30:00Z' },
    { id: '6', user_id: '6', game_id: '2', high_score: 2050, achieved_at: '2024-02-10T16:45:00Z' },
    { id: '7', user_id: '7', game_id: '1', high_score: 1920, achieved_at: '2024-02-09T13:20:00Z' },
    { id: '8', user_id: '8', game_id: '3', high_score: 1780, achieved_at: '2024-02-08T10:10:00Z' },
  ])

  // Mock users data for display
  const users = {
    '1': { name: 'María García' },
    '2': { name: 'Carlos López' },
    '3': { name: 'Ana Martínez' },
    '4': { name: 'Luis Rodríguez' },
    '5': { name: 'Sofia Pérez' },
    '6': { name: 'Diego Torres' },
    '7': { name: 'Elena Ruiz' },
    '8': { name: 'Javier Moreno' }
  }

  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('high_score')
  const [gameFilter, setGameFilter] = useState('all')

  const filteredLeaderboard = leaderboard.filter(score => {
    const userName = users[score.user_id]?.name || ''
    const gameName = games.find(g => g.id === score.game_id)?.name || ''
    const matchesSearch = userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         gameName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesGame = gameFilter === 'all' || score.game_id === gameFilter
    return matchesSearch && matchesGame
  })

  const sortedLeaderboard = [...filteredLeaderboard].sort((a, b) => {
    if (sortBy === 'high_score') {
      return b.high_score - a.high_score
    } else if (sortBy === 'achieved_at') {
      return new Date(b.achieved_at) - new Date(a.achieved_at)
    }
    return 0
  })

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <Trophy className="w-5 h-5 text-gray-800" />
      case 2: return <Medal className="w-5 h-5 text-gray-500" />
      case 3: return <Award className="w-5 h-5 text-gray-400" />
      default: return <span className="text-gray-500 font-medium">#{rank}</span>
    }
  }

  const getRankColor = (rank) => {
    return 'bg-white border-gray-200'
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Clasificación del Juego</h1>
          <p className="text-gray-600 mt-1 text-sm lg:text-base">Seguimiento de puntuaciones y logros de los jugadores</p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
          <Button className="bg-black hover:bg-gray-800 px-4 sm:px-6 lg:px-8 py-3 lg:py-4 text-base lg:text-lg focus:outline-none focus:ring-2 focus:ring-gray-300 touch-manipulation w-full sm:w-auto">
            <Download className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
            Exportar Datos
          </Button>
          <Button variant="outline" className="px-4 sm:px-6 lg:px-8 py-3 lg:py-4 text-base lg:text-lg focus:outline-none focus:ring-2 focus:ring-gray-300 touch-manipulation w-full sm:w-auto">
            <RefreshCw className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        <Card className="p-4 lg:p-6 shadow-lg rounded-2xl bg-white border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-gray-100 mb-2">
            <CardTitle className="text-sm lg:text-base font-medium">Engagement Real</CardTitle>
            <div className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center rounded-full bg-gray-100">
              <Users className="h-5 w-5 lg:h-6 lg:w-6 text-gray-800" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl lg:text-3xl font-bold text-gray-900">{leaderboard.length}</div>
            <div className="text-xs lg:text-sm text-gray-500">usuarios jugando activamente</div>
          </CardContent>
        </Card>

        <Card className="p-4 lg:p-6 shadow-lg rounded-2xl bg-white border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-gray-100 mb-2">
            <CardTitle className="text-sm lg:text-base font-medium">Rendimiento Promedio</CardTitle>
            <div className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center rounded-full bg-gray-100">
              <BarChart3 className="h-5 w-5 lg:h-6 lg:w-6 text-gray-800" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl lg:text-3xl font-bold text-gray-900">{Math.round(leaderboard.reduce((sum, p) => sum + p.high_score, 0) / leaderboard.length)}</div>
            <div className="text-xs lg:text-sm text-gray-500">puntos (indicador retención)</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="p-4 lg:p-6">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row gap-3 lg:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 lg:w-5 lg:h-5 pointer-events-none" />
              <Input
                type="text"
                placeholder="Buscar jugadores..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="!pl-12 w-full"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 lg:py-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent text-base lg:text-lg"
            >
              <option value="high_score">Ordenar por Puntuación</option>
              <option value="achieved_at">Ordenar por Fecha</option>
            </select>
            <select
              value={gameFilter}
              onChange={(e) => setGameFilter(e.target.value)}
              className="px-4 py-3 lg:py-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent text-base lg:text-lg"
            >
              <option value="all">Todos los Juegos</option>
              {games.map(game => (
                <option key={game.id} value={game.id}>{game.name}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard Table */}
      <Card className="p-4 lg:p-6">
        <CardHeader className="p-0 pb-4 lg:pb-6">
          <CardTitle className="text-lg lg:text-xl">Top Jugadores</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-sm lg:text-base font-medium">Posición</TableHead>
                  <TableHead className="text-sm lg:text-base font-medium">Jugador</TableHead>
                  <TableHead className="text-sm lg:text-base font-medium">Juego</TableHead>
                  <TableHead className="text-sm lg:text-base font-medium">Puntuación</TableHead>
                  <TableHead className="text-sm lg:text-base font-medium">Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedLeaderboard.map((score, index) => {
                  const userName = users[score.user_id]?.name || 'Desconocido'
                  const gameName = games.find(g => g.id === score.game_id)?.name || 'Desconocido'
                  const rank = index + 1
                  return (
                    <TableRow key={score.id} className={getRankColor(rank)}>
                      <TableCell className="py-3 lg:py-4">
                        <div className="flex items-center">
                          {getRankIcon(rank)}
                        </div>
                      </TableCell>
                      <TableCell className="py-3 lg:py-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gray-200 rounded-full flex items-center justify-center mr-2 lg:mr-3 flex-shrink-0">
                            <span className="text-gray-600 text-sm lg:text-base font-medium">
                              {userName.charAt(0)}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm lg:text-base font-medium text-gray-900 truncate">{userName}</div>
                            <div className="text-xs lg:text-sm text-gray-500">ID: {score.user_id}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 lg:py-4">
                        <div className="text-sm lg:text-base font-medium text-gray-900 truncate">{gameName}</div>
                        <div className="text-xs lg:text-sm text-gray-500">ID: {score.game_id}</div>
                      </TableCell>
                      <TableCell className="py-3 lg:py-4">
                        <div className="text-sm lg:text-base font-bold text-gray-900">{score.high_score.toLocaleString()}</div>
                        <div className="text-xs lg:text-sm text-gray-500">puntos</div>
                      </TableCell>
                      <TableCell className="py-3 lg:py-4">
                        <div className="text-xs lg:text-sm text-gray-500">{formatDate(score.achieved_at)}</div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Achievement Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <Card className="p-4 lg:p-6 shadow-lg rounded-2xl bg-white border border-gray-200">
          <CardHeader className="p-0 pb-4 border-b border-gray-100 mb-2">
            <CardTitle className="text-base lg:text-lg text-gray-900">Logros Más Comunes</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-3 lg:space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm lg:text-base text-gray-600">Primer Café</span>
                <span className="text-sm lg:text-base font-medium text-gray-900">89%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 lg:h-3">
                <div className="bg-gray-700 h-2 lg:h-3 rounded-full" style={{ width: '89%' }}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm lg:text-base text-gray-600">Café Diario</span>
                <span className="text-sm lg:text-base font-medium text-gray-900">67%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 lg:h-3">
                <div className="bg-gray-700 h-2 lg:h-3 rounded-full" style={{ width: '67%' }}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm lg:text-base text-gray-600">Arte Latte</span>
                <span className="text-sm lg:text-base font-medium text-gray-900">45%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 lg:h-3">
                <div className="bg-gray-700 h-2 lg:h-3 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="p-4 lg:p-6 shadow-lg rounded-2xl bg-white border border-gray-200">
          <CardHeader className="p-0 pb-4 border-b border-gray-100 mb-2">
            <CardTitle className="text-base lg:text-lg text-gray-900">Niveles de Actividad</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-3 lg:space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm lg:text-base text-gray-600">Muy Activos</span>
                <span className="text-sm lg:text-base font-medium text-gray-900">23%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 lg:h-3">
                <div className="bg-gray-700 h-2 lg:h-3 rounded-full" style={{ width: '23%' }}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm lg:text-base text-gray-600">Activos</span>
                <span className="text-sm lg:text-base font-medium text-gray-900">45%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 lg:h-3">
                <div className="bg-gray-700 h-2 lg:h-3 rounded-full" style={{ width: '45%' }}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm lg:text-base text-gray-600">Inactivos</span>
                <span className="text-sm lg:text-base font-medium text-gray-900">32%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 lg:h-3">
                <div className="bg-gray-700 h-2 lg:h-3 rounded-full" style={{ width: '32%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="p-4 lg:p-6 shadow-lg rounded-2xl bg-white border border-gray-200">
          <CardHeader className="p-0 pb-4 border-b border-gray-100 mb-2">
            <CardTitle className="text-base lg:text-lg text-gray-900">Estadísticas Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-3 lg:space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm lg:text-base text-gray-600">Jugador con más puntos</span>
                <span className="text-sm lg:text-base font-medium text-gray-900 truncate">María García</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm lg:text-base text-gray-600">Mayor nivel alcanzado</span>
                <span className="text-sm lg:text-base font-medium text-gray-900">Nivel 15</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm lg:text-base text-gray-600">Más logros obtenidos</span>
                <span className="text-sm lg:text-base font-medium text-gray-900">8 logros</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm lg:text-base text-gray-600">Promedio de sesiones</span>
                <span className="text-sm lg:text-base font-medium text-gray-900">3.2/día</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Game 