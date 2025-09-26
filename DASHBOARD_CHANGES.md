# Dashboard Changes for Multiple Winners System

## 1. **Creación de períodos** (`POST /api/high_score/periods`)
Cambiar el formulario para enviar:
```json
{
  "game_id": "uuid",
  "duration_days": 7,
  "auto_restart": true,
  "first_place_reward_id": "uuid",   // Premio 1er lugar
  "second_place_reward_id": "uuid",  // Premio 2do lugar
  "third_place_reward_id": "uuid"    // Premio 3er lugar
}
```
**IMPORTANTE**: Ya NO se envía `reward_id`.

## 2. **Visualización de períodos**
Mostrar las 3 recompensas diferentes:
- 1er lugar: [Nombre del premio]
- 2do lugar: [Nombre del premio]
- 3er lugar: [Nombre del premio]

## 3. **Tabla de ganadores** (`GET /api/high_score/periods/:id/winners`)
Ahora muestra hasta 3 ganadores con sus respectivos premios:
```json
[
  {"position": 1, "user": "Juan", "score": 2000, "reward": "Café premium gratis"},
  {"position": 2, "user": "María", "score": 1800, "reward": "Descuento 50%"},
  {"position": 3, "user": "Pedro", "score": 1500, "reward": "Galleta gratis"}
]
```

## 4. **Actualización de períodos** (`PUT /api/high_score/periods/:id`)
Permitir editar los 3 premios:
```json
{
  "first_place_reward_id": "uuid",
  "second_place_reward_id": "uuid",
  "third_place_reward_id": "uuid"
}
```

## 5. **Estadísticas**
- Mostrar "Top 3 ganadores" en lugar de "Ganador"
- Indicar cuántos premios se han entregado por posición

## 6. **Cambios en la base de datos**
La tabla `leaderboard_periods` ahora tiene:
- `first_place_reward_id` - Premio para el 1er lugar
- `second_place_reward_id` - Premio para el 2do lugar
- `third_place_reward_id` - Premio para el 3er lugar
- El campo `reward_id` ya no se usa