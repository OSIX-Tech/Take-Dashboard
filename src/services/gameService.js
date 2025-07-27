import { apiService } from './api.js'

export const gameService = {
  // Get all games
  async getGames() {
    return apiService.get('games')
  },

  // Get game by ID
  async getGame(id) {
    return apiService.get(`games?id=eq.${id}`)
  },

  // Create new game
  async createGame(data) {
    return apiService.post('games', data)
  },

  // Update game
  async updateGame(id, data) {
    return apiService.patch(`games?id=eq.${id}`, data)
  },

  // Delete game
  async deleteGame(id) {
    return apiService.delete(`games?id=eq.${id}`)
  }
}

export const highScoreService = {
  // Get all high scores
  async getHighScores() {
    return apiService.get('high_scores?select=*,users(name),games(name)')
  },

  // Get high scores by game
  async getHighScoresByGame(gameId) {
    return apiService.get(`high_scores?game_id=eq.${gameId}&select=*,users(name),games(name)&order=high_score.desc`)
  },

  // Get high scores by user
  async getHighScoresByUser(userId) {
    return apiService.get(`high_scores?user_id=eq.${userId}&select=*,users(name),games(name)&order=high_score.desc`)
  },

  // Create new high score
  async createHighScore(data) {
    return apiService.post('high_scores', data)
  },

  // Update high score
  async updateHighScore(id, data) {
    return apiService.patch(`high_scores?id=eq.${id}`, data)
  },

  // Delete high score
  async deleteHighScore(id) {
    return apiService.delete(`high_scores?id=eq.${id}`)
  },

  // Get top scores (leaderboard)
  async getTopScores(limit = 10) {
    return apiService.get(`high_scores?select=*,users(name),games(name)&order=high_score.desc&limit=${limit}`)
  },

  // Get user's best score for a game
  async getUserBestScore(userId, gameId) {
    return apiService.get(`high_scores?user_id=eq.${userId}&game_id=eq.${gameId}&order=high_score.desc&limit=1`)
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