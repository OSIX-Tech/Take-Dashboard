import { apiService } from './api.js'

export const gameService = {
  // Los endpoints de games no están implementados en el backend
  // Solo mantenemos comentarios para referencia futura
}

export const highScoreService = {
  // Obtener high scores - endpoint existe en backend
  async getHighScores() {
    return apiService.get('high_score')
  },

  // Crear high score - endpoint existe en backend
  async createHighScore(data) {
    return apiService.post('high_score', data)
  }
}

// leaderboardService eliminado - endpoints con PostgREST syntax no existen en el backend 