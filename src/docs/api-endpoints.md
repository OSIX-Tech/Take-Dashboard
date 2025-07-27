# API Endpoints Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication Endpoints

### POST /auth/login
**Login de usuario**
```json
{
  "email": "admin@take.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "admin@take.com",
    "name": "Admin User",
    "role": "admin"
  }
}
```

### POST /auth/logout
**Logout de usuario**
```json
{
  "token": "jwt_token_here"
}
```

### POST /auth/refresh
**Renovar token**
```json
{
  "refreshToken": "refresh_token_here"
}
```

## Menu Endpoints

### GET /menu/items
**Obtener todos los elementos del menú**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Café Solo",
      "description": "Café espresso tradicional",
      "price": 1.30,
      "category_id": "cafe-clasico",
      "is_available": true,
      "image_url": null,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### GET /menu/items/:id
**Obtener elemento específico del menú**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Café Solo",
    "description": "Café espresso tradicional",
    "price": 1.30,
    "category_id": "cafe-clasico",
    "is_available": true,
    "image_url": null
  }
}
```

### POST /menu/items
**Crear nuevo elemento del menú**
```json
{
  "name": "Nuevo Producto",
  "description": "Descripción del producto",
  "price": 2.50,
  "category_id": "cafe-clasico",
  "is_available": true,
  "image_url": "https://example.com/image.jpg"
}
```

### PATCH /menu/items/:id
**Actualizar elemento del menú**
```json
{
  "name": "Producto Actualizado",
  "price": 3.00,
  "is_available": false
}
```

### DELETE /menu/items/:id
**Eliminar elemento del menú**
```json
{
  "success": true,
  "message": "Elemento eliminado correctamente"
}
```

### GET /menu/categories
**Obtener todas las categorías**
```json
{
  "success": true,
  "data": [
    {
      "id": "cafe-clasico",
      "name": "Café Clásico",
      "description": "Cafés tradicionales"
    }
  ]
}
```

### GET /menu/stats
**Obtener estadísticas del menú**
```json
{
  "success": true,
  "data": {
    "total_items": 52,
    "available_items": 50,
    "unavailable_items": 2,
    "total_value": 142.85,
    "average_price": 2.75,
    "highest_price": 4.00,
    "categories_count": 13
  }
}
```

## Events Endpoints

### GET /events
**Obtener todos los eventos**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Evento de Café",
      "content": "Descripción del evento",
      "image_url": "https://example.com/event.jpg",
      "published_at": "2024-01-01T00:00:00Z",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST /events
**Crear nuevo evento**
```json
{
  "title": "Nuevo Evento",
  "content": "Contenido del evento",
  "image_url": "https://example.com/image.jpg",
  "published_at": "2024-01-01T00:00:00Z"
}
```

### PATCH /events/:id
**Actualizar evento**
```json
{
  "title": "Evento Actualizado",
  "content": "Nuevo contenido"
}
```

### DELETE /events/:id
**Eliminar evento**
```json
{
  "success": true,
  "message": "Evento eliminado correctamente"
}
```

## Rewards Endpoints

### GET /rewards
**Obtener todas las recompensas**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Café Gratis",
      "description": "Café gratis al acumular 10 sellos",
      "seals_required": 10,
      "active": true,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### GET /rewards/users
**Obtener usuarios con sellos**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Juan Pérez",
      "email": "juan@example.com",
      "total_seals": 25,
      "current_seals": 15,
      "max_seals": 30
    }
  ]
}
```

### GET /rewards/stats
**Obtener estadísticas de recompensas**
```json
{
  "success": true,
  "data": {
    "total_users": 150,
    "active_users": 120,
    "total_seals": 2500,
    "available_seals": 1800,
    "users_ready_to_redeem": 25,
    "average_seals_per_user": 16.67
  }
}
```

## Game Endpoints

### GET /games
**Obtener todos los juegos**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Café Quiz",
      "description": "Juego de preguntas sobre café"
    }
  ]
}
```

### GET /games/leaderboard
**Obtener leaderboard**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "game_id": 1,
      "high_score": 1500,
      "achieved_at": "2024-01-01T00:00:00Z",
      "user": {
        "name": "Juan Pérez",
        "email": "juan@example.com"
      },
      "game": {
        "name": "Café Quiz"
      }
    }
  ]
}
```

### GET /games/stats
**Obtener estadísticas de juegos**
```json
{
  "success": true,
  "data": {
    "total_players": 85,
    "active_players": 65,
    "total_games": 3,
    "average_score": 1250,
    "highest_score": 2500
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Validation error",
  "message": "Invalid input data",
  "details": {
    "field": "error description"
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Invalid or missing token"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Not Found",
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal Server Error",
  "message": "Something went wrong"
}
```

## Headers Required

Para endpoints protegidos, incluir:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## Query Parameters

### Pagination
```
?page=1&limit=10
```

### Filtering
```
?category_id=cafe-clasico&is_available=true
```

### Sorting
```
?sort_by=price&order=desc
```

### Search
```
?search=café
``` 