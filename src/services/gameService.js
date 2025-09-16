import { apiService } from './api.js'

export const gameService = {
  // Los endpoints de games no están implementados en el backend
  // Solo mantenemos comentarios para referencia futura
}

// NOTA: No existen endpoints públicos de high scores según high-score-admin-guide
// El sistema de high scores solo expone endpoints administrativos a través de leaderboardService.js
// Los endpoints disponibles son:
// - Gestión de periodos de competencia
// - Gestión de ganadores
// - Marcar premios como reclamados
// Ver leaderboardService.js para la implementación completa

export const highScoreService = {
  // Este servicio está deprecado - no existen estos endpoints
  // Usar leaderboardService en su lugar para gestión administrativa
}