import { apiService } from './api.js'

export const gameService = {
  // Obtener todos los juegos
  async getGames() {
    return apiService.get('games')
  },

  // Obtener un juego por ID
  async getGame(id) {
    return apiService.get(`games?id=eq.${id}`)
  },

  // Crear un nuevo juego
  async createGame(data) {
    return apiService.post('games', data)
  },

  // Editar un juego
  async updateGame(id, data) {
    return apiService.put(`games?id=eq.${id}`, data)
  },

  // Eliminar un juego
  async deleteGame(id) {
    return apiService.delete(`games?id=eq.${id}`)
  }
}

export const highScoreService = {
  // Obtener high scores en un rango
  async getHighScores(start = 1, end = 50) {
    return apiService.get(`high_score?order=high_score.desc&limit=${end-start+1}&offset=${start-1}`)
  },

  // Obtener high scores por usuario
  async getHighScoresByUser(userId) {
    return apiService.get(`high_score?user_id=eq.${userId}&order=high_score.desc`)
  },

  // Obtener high scores por juego
  async getHighScoresByGame(gameId) {
    return apiService.get(`high_score?game_id=eq.${gameId}&order=high_score.desc`)
  },

  // Obtener el mejor score de un usuario para un juego específico
  async getUserBestScore(userId, gameId) {
    return apiService.get(`high_score?user_id=eq.${userId}&game_id=eq.${gameId}&order=high_score.desc&limit=1`)
  },

  // Obtener top scores (leaderboard)
  async getTopScores(limit = 10) {
    return apiService.get(`high_score?order=high_score.desc&limit=${limit}`)
  }
}

export const leaderboardService = {
  // Get overall leaderboard
  async getOverallLeaderboard(limit = 10) {
    return apiService.get(`high_scores?select=*,users(name),games(name)&order=high_score.desc&limit=${limit}`)
  },

  // Get leaderboard by game
  async getGameLeaderboard(gameId, limit = 10) {
    return apiService.get(`high_scores?game_id=eq.${gameId}&select=*,users(name),games(name)&order=high_score.desc&limit=${limit}`)
  },

  // Get leaderboard statistics
  async getLeaderboardStats() {
    const highScores = await apiService.get('high_scores?select=*')
    const users = await apiService.get('users?select=id')
    const games = await apiService.get('games?select=id')
    
    return {
      totalScores: highScores.length,
      totalPlayers: users.length,
      totalGames: games.length,
      averageScore: highScores.reduce((sum, score) => sum + score.high_score, 0) / highScores.length
    }
  },

  // Get top players by total score across all games
  async getTopPlayers(limit = 10) {
    const highScores = await apiService.get('high_scores?select=*,users(name)')
    
    // Group by user and sum their scores
    const playerScores = highScores.reduce((acc, score) => {
      const userId = score.user_id
      if (!acc[userId]) {
        acc[userId] = {
          user: score.users,
          totalScore: 0,
          gamesPlayed: 0
        }
      }
      acc[userId].totalScore += score.high_score
      acc[userId].gamesPlayed += 1
      return acc
    }, {})
    
    // Convert to array and sort by total score
    return Object.values(playerScores)
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, limit)
  }
} 