import { apiService } from './api.js'

export const gameService = {
  // Los endpoints de games no están implementados en el backend
  // Solo mantenemos comentarios para referencia futura
}

export const highScoreService = {
  // Obtener high scores en un rango específico (start-end posiciones en ranking)
  async getHighScoresRange(start = 1, end = 50) {
    const params = { start, end }
    return apiService.get('high_score', params)
  },

  // Obtener todos los high scores (usar con precaución)
  async getAllHighScores() {
    return apiService.get('high_score')
  },

  // Obtener top N high scores (más común)
  async getTopHighScores(limit = 10) {
    return this.getHighScoresRange(1, limit)
  },

  // Crear nuevo high score
  async createHighScore(data) {
    return apiService.post('high_score', data)
  },

  // Obtener high scores de un usuario específico (filtrado local)
  async getUserHighScores(userId, start = 1, end = 50) {
    const highScores = await this.getHighScoresRange(start, end)
    // Filtrar por usuario en el cliente ya que el endpoint no soporta filtros
    if (Array.isArray(highScores)) {
      return highScores.filter(score => score.user_id === userId)
    }
    return []
  },

  // Obtener high scores de un juego específico (filtrado local)
  async getGameHighScores(gameId, start = 1, end = 50) {
    const highScores = await this.getHighScoresRange(start, end)
    // Filtrar por juego en el cliente ya que el endpoint no soporta filtros
    if (Array.isArray(highScores)) {
      return highScores.filter(score => score.game_id === gameId)
    }
    return []
  }
}

// leaderboardService eliminado - endpoints con PostgREST syntax no existen en el backend 