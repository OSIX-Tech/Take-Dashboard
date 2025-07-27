# Endpoints Documentation

Esta documentación describe los endpoints esperados basados en el esquema de Supabase.

## Base URL
```
https://your-project.supabase.co/rest/v1/
```

## Headers Required
```
Content-Type: application/json
apikey: your_supabase_anon_key
Authorization: Bearer your_supabase_anon_key
```

## Categories Endpoints

### GET /categories
Obtener todas las categorías
```javascript
// Response
[
  {
    id: "uuid",
    name: "Coffee",
    description: "Hot and cold coffee drinks",
    created_at: "2024-01-01T00:00:00Z"
  }
]
```

### GET /categories?id=eq.{id}
Obtener categoría por ID

### POST /categories
Crear nueva categoría
```javascript
// Request body
{
  name: "Coffee",
  description: "Hot and cold coffee drinks"
}
```

### PATCH /categories?id=eq.{id}
Actualizar categoría

### DELETE /categories?id=eq.{id}
Eliminar categoría

## Menu Items Endpoints

### GET /menu_items?select=*,categories(*)
Obtener todos los items del menú con sus categorías

### GET /menu_items?id=eq.{id}&select=*,categories(*)
Obtener item del menú por ID

### GET /menu_items?category_id=eq.{categoryId}&select=*,categories(*)
Obtener items por categoría

### GET /menu_items?is_available=eq.true&select=*,categories(*)
Obtener items disponibles

### POST /menu_items
Crear nuevo item del menú
```javascript
// Request body
{
  name: "Espresso",
  description: "Single shot of espresso",
  price: 2.50,
  image_url: "https://example.com/espresso.jpg",
  category_id: "uuid",
  is_available: true
}
```

### PATCH /menu_items?id=eq.{id}
Actualizar item del menú

### DELETE /menu_items?id=eq.{id}
Eliminar item del menú

## Events Endpoints

### GET /events
Obtener todos los eventos

### GET /events?id=eq.{id}
Obtener evento por ID

### GET /events?published_at=not.is.null
Obtener eventos publicados

### GET /events?published_at=gte.{date}&published_at=lte.{date}
Obtener eventos por rango de fechas

### POST /events
Crear nuevo evento
```javascript
// Request body
{
  title: "Coffee Tasting",
  content: "Join us for a coffee tasting event",
  image_url: "https://example.com/event.jpg",
  published_at: "2024-02-15T14:00:00Z"
}
```

### PATCH /events?id=eq.{id}
Actualizar evento

### DELETE /events?id=eq.{id}
Eliminar evento

## Rewards Endpoints

### GET /rewards
Obtener todas las recompensas

### GET /rewards?id=eq.{id}
Obtener recompensa por ID

### GET /rewards?required_seals=lte.{seals}
Obtener recompensas por sellos requeridos

### POST /rewards
Crear nueva recompensa
```javascript
// Request body
{
  name: "Free Coffee",
  description: "Get a free coffee of your choice",
  required_seals: 10,
  image_url: "https://example.com/reward.jpg"
}
```

### PATCH /rewards?id=eq.{id}
Actualizar recompensa

### DELETE /rewards?id=eq.{id}
Eliminar recompensa

## Users Endpoints

### GET /users
Obtener todos los usuarios

### GET /users?id=eq.{id}
Obtener usuario por ID

### GET /users?email=eq.{email}
Obtener usuario por email

### GET /users?google_id=eq.{googleId}
Obtener usuario por Google ID

### POST /users
Crear nuevo usuario
```javascript
// Request body
{
  name: "John Doe",
  email: "john@example.com",
  phone: "+1234567890",
  google_id: "google_user_id",
  jwt_secure_code: "secure_code"
}
```

### PATCH /users?id=eq.{id}
Actualizar usuario

### DELETE /users?id=eq.{id}
Eliminar usuario

## Wallets Endpoints

### Apple Wallet

### GET /wallets_apple?user_id=eq.{userId}
Obtener wallet de Apple por usuario

### POST /wallets_apple
Crear wallet de Apple
```javascript
// Request body
{
  user_id: "uuid",
  total_seals: 0,
  current_seals: 0,
  max_seals: 100
}
```

### PATCH /wallets_apple?user_id=eq.{userId}
Actualizar wallet de Apple

### DELETE /wallets_apple?user_id=eq.{userId}
Eliminar wallet de Apple

### Google Wallet

### GET /wallets_google?user_id=eq.{userId}
Obtener wallet de Google por usuario

### POST /wallets_google
Crear wallet de Google

### PATCH /wallets_google?user_id=eq.{userId}
Actualizar wallet de Google

### DELETE /wallets_google?user_id=eq.{userId}
Eliminar wallet de Google

## Games Endpoints

### GET /games
Obtener todos los juegos

### GET /games?id=eq.{id}
Obtener juego por ID

### POST /games
Crear nuevo juego
```javascript
// Request body
{
  name: "Coffee Quiz",
  description: "Test your coffee knowledge"
}
```

### PATCH /games?id=eq.{id}
Actualizar juego

### DELETE /games?id=eq.{id}
Eliminar juego

## High Scores Endpoints

### GET /high_scores?select=*,users(name),games(name)
Obtener todos los high scores con información de usuario y juego

### GET /high_scores?game_id=eq.{gameId}&select=*,users(name),games(name)&order=high_score.desc
Obtener high scores por juego ordenados

### GET /high_scores?user_id=eq.{userId}&select=*,users(name),games(name)&order=high_score.desc
Obtener high scores por usuario ordenados

### GET /high_scores?select=*,users(name),games(name)&order=high_score.desc&limit={limit}
Obtener top scores (leaderboard)

### POST /high_scores
Crear nuevo high score
```javascript
// Request body
{
  user_id: "uuid",
  game_id: "uuid",
  high_score: 1000,
  achieved_at: "2024-01-01T00:00:00Z"
}
```

### PATCH /high_scores?id=eq.{id}
Actualizar high score

### DELETE /high_scores?id=eq.{id}
Eliminar high score

## Query Parameters

### Select
```
?select=*,categories(*)
?select=id,name,price
```

### Filter
```
?id=eq.{value}
?name=ilike.*{search}*
?price=gte.{value}
?created_at=gte.{date}
```

### Order
```
?order=name.asc
?order=price.desc
?order=created_at.desc
```

### Limit
```
?limit=10
```

### Offset
```
?offset=20
```

## Error Responses

### 400 Bad Request
```javascript
{
  "error": "Invalid request",
  "details": "Field 'name' is required"
}
```

### 401 Unauthorized
```javascript
{
  "error": "Invalid API key"
}
```

### 404 Not Found
```javascript
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```javascript
{
  "error": "Internal server error"
}
``` 