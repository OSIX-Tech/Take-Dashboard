import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Trophy, Medal, Calendar, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

function Game() {
  // Mock leaderboard data
  const leaderboard = [
    {
      id: 1,
      name: "Jugador 1",
      email: "jugador1@example.com",
      score: 2500,
      level: 15,
      achievements: 8,
      lastPlayed: "2024-01-15T10:30:00Z",
      rank: 1
    },
    {
      id: 2,
      name: "Jugador 2",
      email: "jugador2@example.com",
      score: 2200,
      level: 12,
      achievements: 6,
      lastPlayed: "2024-01-14T15:45:00Z",
      rank: 2
    },
    {
      id: 3,
      name: "Jugador 3",
      email: "jugador3@example.com",
      score: 1950,
      level: 10,
      achievements: 5,
      lastPlayed: "2024-01-13T09:20:00Z",
      rank: 3
    },
    {
      id: 4,
      name: "Jugador 4",
      email: "jugador4@example.com",
      score: 1800,
      level: 9,
      achievements: 4,
      lastPlayed: "2024-01-12T14:15:00Z",
      rank: 4
    },
    {
      id: 5,
      name: "Jugador 5",
      email: "jugador5@example.com",
      score: 1650,
      level: 8,
      achievements: 3,
      lastPlayed: "2024-01-11T11:30:00Z",
      rank: 5
    },
    {
      id: 6,
      name: "Jugador 6",
      email: "jugador6@example.com",
      score: 1500,
      level: 7,
      achievements: 3,
      lastPlayed: "2024-01-10T16:45:00Z",
      rank: 6
    },
    {
      id: 7,
      name: "Jugador 7",
      email: "jugador7@example.com",
      score: 1350,
      level: 6,
      achievements: 2,
      lastPlayed: "2024-01-09T13:20:00Z",
      rank: 7
    },
    {
      id: 8,
      name: "Jugador 8",
      email: "jugador8@example.com",
      score: 1200,
      level: 5,
      achievements: 2,
      lastPlayed: "2024-01-08T10:10:00Z",
      rank: 8
    },
    {
      id: 9,
      name: "Jugador 9",
      email: "jugador9@example.com",
      score: 1050,
      level: 4,
      achievements: 1,
      lastPlayed: "2024-01-07T12:30:00Z",
      rank: 9
    },
    {
      id: 10,
      name: "Jugador 10",
      email: "jugador10@example.com",
      score: 900,
      level: 3,
      achievements: 1,
      lastPlayed: "2024-01-06T08:45:00Z",
      rank: 10
    }
  ]

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />
      default:
        return <span className="text-sm font-bold text-gray-600">#{rank}</span>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Juegos</h1>
          <p className="text-sm lg:text-base text-gray-600 mt-1">Clasificación y estadísticas de jugadores</p>
        </div>
      </div>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 lg:w-6 lg:h-6" />
            <span>Clasificación de Jugadores</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Posición</TableHead>
                <TableHead>Jugador</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Puntuación</TableHead>
                <TableHead>Nivel</TableHead>
                <TableHead>Logros</TableHead>
                <TableHead>Última Partida</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboard.map((player) => (
                <TableRow key={player.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getRankIcon(player.rank)}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{player.name}</TableCell>
                  <TableCell className="text-gray-600">{player.email}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="font-semibold">{player.score.toLocaleString()}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-medium">
                      Nivel {player.level}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Trophy className="w-4 h-4 text-purple-500" />
                      <span>{player.achievements}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(player.lastPlayed)}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default Game 