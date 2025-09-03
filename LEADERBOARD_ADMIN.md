# Sistema de Leaderboard - Guía para Admin Dashboard

## 📋 Resumen
El sistema de leaderboard ahora funciona por **periodos de tiempo configurables**. Cada periodo tiene una duración (ej: 7 días), y cuando termina:
1. Se determina automáticamente el ganador (top 1)
2. Se crea un nuevo periodo si está configurado para reinicio automático
3. Los ganadores pueden recoger su premio físicamente en la cafetería

## 🎯 Funcionalidades para el Admin

### 1. Gestión de Periodos

#### Ver todos los periodos
```javascript
GET /api/high_score/periods
Headers: Authorization: Bearer {ADMIN_TOKEN}

Response:
[
  {
    id: "uuid",
    game_id: "uuid",
    start_date: "2025-01-01T00:00:00Z",
    end_date: "2025-01-08T00:00:00Z",
    duration_days: 7,
    is_active: true,
    auto_restart: true,
    games: { name: "Flappy Bird" }
  }
]
```

#### Crear nuevo periodo
```javascript
POST /api/high_score/periods
Headers: Authorization: Bearer {ADMIN_TOKEN}
Body: {
  gameId: "UUID_DEL_JUEGO_FLAPPY_BIRD", // Flappy Bird (obtener de la BD)
  durationDays: 7,  // Duración en días
  autoRestart: true  // Si crear automáticamente el siguiente
}
```

#### Modificar periodo activo
```javascript
PUT /api/high_score/periods/{periodId}
Headers: Authorization: Bearer {ADMIN_TOKEN}
Body: {
  duration_days: 14,  // Nueva duración
  auto_restart: false,
  next_period_duration_days: 7  // Duración del siguiente periodo
}
```

#### Cerrar periodo manualmente
```javascript
POST /api/high_score/periods/{periodId}/close
Headers: Authorization: Bearer {ADMIN_TOKEN}
Body: {
  topPositions: 1  // Cuántos ganadores registrar (por defecto 1)
}
```

### 2. Gestión de Ganadores

#### Ver todos los ganadores
```javascript
GET /api/high_score/winners
Headers: Authorization: Bearer {ADMIN_TOKEN}
Query params:
  - gameId (opcional): filtrar por juego
  - position (opcional): filtrar por posición (1, 2, 3...)
  - limit (opcional): cantidad de resultados

Response:
[
  {
    id: "uuid",
    position: 1,
    final_score: 5000,
    claimed: false,  // Si ya recogió el premio
    claimed_at: null,
    users: {
      name: "Juan Pérez",
      email: "juan@example.com"
    },
    leaderboard_periods: {
      start_date: "2025-01-01",
      end_date: "2025-01-08",
      games: { name: "Flappy Bird" }
    }
  }
]
```

#### Marcar premio como recogido
```javascript
POST /api/high_score/winners/{winnerId}/mark-claimed
Headers: Authorization: Bearer {ADMIN_TOKEN}

// Usar cuando el ganador viene físicamente a recoger su premio
```

#### Ver ganadores de un periodo específico
```javascript
GET /api/high_score/periods/{periodId}/winners
Headers: Authorization: Bearer {ADMIN_TOKEN}
```

### 3. Procesamiento Manual

#### Procesar periodos expirados manualmente
```javascript
POST /api/high_score/process-expired
Headers: Authorization: Bearer {ADMIN_TOKEN}

// Útil si el scheduler automático falla
// Procesará todos los periodos que deberían haber terminado
```

## 📊 Interfaz Recomendada para el Dashboard

### Vista Principal de Leaderboard
```
┌─────────────────────────────────────────────────────────┐
│ LEADERBOARD - PERIODO ACTUAL                           │
│                                                         │
│ Estado: ACTIVO                                          │
│ Inicio: 01/01/2025                                      │
│ Fin: 08/01/2025                                         │
│ Tiempo restante: 5d 14h 32m                            │
│                                                         │
│ [Cerrar Periodo] [Editar Duración]                     │
└─────────────────────────────────────────────────────────┘
```

### Lista de Ganadores Pendientes
```
┌─────────────────────────────────────────────────────────┐
│ GANADORES PENDIENTES DE RECOGER PREMIO                 │
│                                                         │
│ ┌──────────────────────────────────────────────┐      │
│ │ 👤 Juan Pérez                                 │      │
│ │ 🏆 Top 1 - Periodo: 25/12 - 01/01            │      │
│ │ 📊 Puntuación: 5,420 puntos                  │      │
│ │ 📅 Ganó hace: 3 días                         │      │
│ │                                               │      │
│ │ [✓ Marcar como Recogido]                     │      │
│ └──────────────────────────────────────────────┘      │
│                                                         │
│ ┌──────────────────────────────────────────────┐      │
│ │ 👤 María González                             │      │
│ │ 🏆 Top 1 - Periodo: 18/12 - 25/12            │      │
│ │ 📊 Puntuación: 4,890 puntos                  │      │
│ │ 📅 Ganó hace: 10 días                        │      │
│ │                                               │      │
│ │ [✓ Marcar como Recogido]                     │      │
│ └──────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────┘
```

### Configuración del Sistema
```
┌─────────────────────────────────────────────────────────┐
│ CONFIGURACIÓN DE PERIODOS                              │
│                                                         │
│ Duración del periodo: [7] días                         │
│ ☑ Reinicio automático                                  │
│ Próxima duración: [7] días                            │
│                                                         │
│ [Guardar Cambios]                                      │
│                                                         │
│ ─────────────────────────────────────                  │
│                                                         │
│ HISTORIAL DE PERIODOS                                  │
│                                                         │
│ • 01/01 - 08/01 (Activo) - 45 participantes           │
│ • 25/12 - 01/01 (Cerrado) - Ganador: Juan Pérez       │
│ • 18/12 - 25/12 (Cerrado) - Ganador: María González   │
└─────────────────────────────────────────────────────────┘
```

## 🔄 Flujo de Trabajo

1. **Configuración Inicial**
   - Crear el primer periodo con duración deseada (ej: 7 días)
   - Activar reinicio automático si se desea

2. **Durante el Periodo**
   - Ver el leaderboard actual
   - Monitorear tiempo restante
   - Los usuarios compiten jugando

3. **Fin del Periodo**
   - Sistema determina ganador automáticamente
   - Crea nuevo periodo si auto_restart = true
   - Ganador aparece en lista de "Pendientes de recoger"

4. **Entrega de Premio**
   - Ganador viene a la cafetería
   - Admin verifica identidad
   - Entrega premio físico
   - Marca como "Recogido" en el sistema

## ⚠️ Consideraciones Importantes

1. **Solo un periodo activo**: Solo puede haber un periodo activo por juego
2. **Ganadores automáticos**: El sistema determina automáticamente el top 1
3. **Sin premio específico**: El premio se decide y entrega físicamente
4. **Verificación cada 60 min**: El sistema verifica periodos expirados cada hora
5. **Reinicio automático**: Si está activado, no requiere intervención manual

## 🚨 Troubleshooting

### El periodo no se cierra automáticamente
- Ejecutar manualmente: `POST /api/high_score/process-expired`
- Verificar logs del servidor
- Comprobar que el scheduler está activo

### No aparece el ganador
- Verificar que había scores en ese periodo
- Comprobar que el periodo se cerró correctamente
- Revisar la tabla `leaderboard_winners` en Supabase

### Error al crear periodo
- Verificar que no hay otro periodo activo
- Comprobar que el game_id existe
- Revisar permisos del token admin