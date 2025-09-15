# High Score System - Admin Implementation Guide

## Overview

The High Score system implements time-based competition periods with automatic winner selection and reward management. This guide covers all admin-specific endpoints and functionalities for managing the leaderboard system.

## Authentication

All admin endpoints require Admin JWT authentication:
```
Authorization: Bearer <admin_jwt_token>
```

Admin authentication uses Google OAuth with JWT tokens that include `jwtSecureCode` for token revocation capabilities.

## Base URL

All endpoints are prefixed with: `/api/high_score`

## Admin Endpoints

### 1. Period Management

#### Get All Periods
```http
GET /api/high_score/periods?gameId=<uuid>
```

**Query Parameters:**
- `gameId` (optional): Filter periods by specific game

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "period-uuid",
      "game_id": "game-uuid",
      "start_date": "2024-01-15T00:00:00Z",
      "end_date": "2024-01-22T23:59:59Z",
      "is_active": true,
      "auto_restart": true,
      "created_at": "2024-01-15T00:00:00Z"
    }
  ]
}
```

#### Create New Period
```http
POST /api/high_score/periods
```

**Request Body:**
```json
{
  "gameId": "123e4567-e89b-12d3-a456-426614174000",
  "durationDays": 7,
  "autoRestart": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "new-period-uuid",
    "game_id": "123e4567-e89b-12d3-a456-426614174000",
    "start_date": "2024-01-15T00:00:00Z",
    "end_date": "2024-01-22T23:59:59Z",
    "is_active": true,
    "auto_restart": true,
    "created_at": "2024-01-15T00:00:00Z"
  },
  "message": "Periodo creado exitosamente"
}
```

#### Update Period Settings
```http
PUT /api/high_score/periods/<period-id>
```

**Request Body:**
```json
{
  "end_date": "2024-01-25T23:59:59Z",
  "auto_restart": false
}
```

**Use Cases:**
- Extend or shorten competition period
- Enable/disable automatic restart
- Emergency period modifications

#### Close Period Manually
```http
POST /api/high_score/periods/<period-id>/close
```

**Request Body (optional):**
```json
{
  "topPositions": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "period": {
      "id": "period-uuid",
      "is_active": false,
      "end_date": "2024-01-15T12:00:00Z"
    },
    "winners": [
      {
        "id": "winner-uuid",
        "user_id": "user-uuid",
        "user_name": "Maria",
        "position": 1,
        "score": 5000,
        "reward_claimed": false
      }
    ]
  },
  "message": "Periodo cerrado exitosamente"
}
```

#### Get Period Winners
```http
GET /api/high_score/periods/<period-id>/winners
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "winner-uuid",
      "period_id": "period-uuid",
      "user_id": "user-uuid",
      "user_name": "Maria",
      "position": 1,
      "score": 5000,
      "reward_claimed": false,
      "claimed_at": null,
      "created_at": "2024-01-15T12:00:00Z"
    }
  ]
}
```

### 2. Winner Management

#### Get Winners History
```http
GET /api/high_score/winners?gameId=<uuid>&position=1&limit=50
```

**Query Parameters:**
- `gameId` (optional): Filter by specific game
- `position` (optional): Filter by winning position (1 = first place)
- `limit` (optional): Maximum results (default: 50)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "winner-uuid",
      "period_id": "period-uuid",
      "user_id": "user-uuid",
      "user_name": "Maria",
      "position": 1,
      "score": 5000,
      "reward_claimed": false,
      "claimed_at": null,
      "created_at": "2024-01-15T12:00:00Z"
    }
  ]
}
```

#### Mark Reward as Claimed
```http
POST /api/high_score/winners/<winner-id>/mark-claimed
```

**Use Case:** When a user physically collects their reward at the café.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "winner-uuid",
    "reward_claimed": true,
    "claimed_at": "2024-01-16T10:30:00Z"
  },
  "message": "Premio marcado como recogido"
}
```

### 3. System Management

#### Process Expired Periods
```http
POST /api/high_score/process-expired
```

**Description:** Processes all expired periods, selects winners, and creates new periods if auto-restart is enabled. Normally executed by cron job.

**Response:**
```json
{
  "success": true,
  "data": {
    "processedCount": 2,
    "results": [
      {
        "periodId": "period-1-uuid",
        "winnersCount": 1,
        "newPeriodCreated": true
      },
      {
        "periodId": "period-2-uuid",
        "winnersCount": 0,
        "newPeriodCreated": false
      }
    ]
  },
  "message": "2 periodos procesados"
}
```

## Implementation Flow

### 1. Initial Setup
1. Create periods for each game using `POST /periods`
2. Set appropriate duration (typically 7 days)
3. Enable auto-restart for continuous competitions

### 2. Monitoring Competitions
1. Use `GET /periods` to monitor active periods
2. Check `GET /periods/<id>/winners` to see current standings
3. Use `GET /winners` for historical analysis

### 3. Manual Intervention
1. `PUT /periods/<id>` to modify period settings
2. `POST /periods/<id>/close` for emergency closures
3. `POST /process-expired` to manually trigger period processing

### 4. Reward Management
1. Monitor `GET /winners` for unclaimed rewards (`reward_claimed: false`)
2. Use `POST /winners/<id>/mark-claimed` when users collect rewards
3. Track reward distribution metrics

## Business Logic

### Period Lifecycle
1. **Active Period**: Users can submit scores
2. **Period Expiration**: Automatically processed by scheduler
3. **Winner Selection**: Top positions become winners
4. **New Period**: Auto-created if `auto_restart: true`

### Winner Selection
- Only users with scores are eligible
- Ties are resolved by earliest `achieved_at` timestamp
- Number of winners determined by `topPositions` parameter

### Automatic Processing
- Scheduler runs every 60 minutes in production
- Processes expired periods automatically
- Creates new periods based on `auto_restart` setting

## Error Handling

### Common Error Responses

**401 Unauthorized:**
```json
{
  "error": "No autorizado"
}
```

**400 Bad Request:**
```json
{
  "success": false,
  "error": "gameId y durationDays son obligatorios"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": "Error interno del servidor"
}
```

## Best Practices

### 1. Period Management
- Create periods in advance to avoid gaps
- Use consistent duration across games
- Monitor active periods regularly

### 2. Reward Management
- Check for unclaimed rewards daily
- Mark rewards as claimed promptly
- Track reward distribution statistics

### 3. System Maintenance
- Monitor `POST /process-expired` for failures
- Set up alerts for processing errors
- Regularly review winner selection accuracy

### 4. Security
- Always validate admin authentication
- Log all administrative actions
- Monitor for suspicious activity

## Monitoring & Analytics

### Key Metrics to Track
1. **Period Statistics**:
   - Average participants per period
   - Score distributions
   - Period completion rates

2. **Winner Statistics**:
   - Reward claim rates
   - Time between winning and claiming
   - Repeat winners analysis

3. **System Health**:
   - Period processing success rate
   - API endpoint response times
   - Error rates by endpoint

### Recommended Dashboards
1. Active competitions status
2. Pending rewards awaiting collection
3. Historical winner trends
4. System processing metrics

## Troubleshooting

### Common Issues

**Period Not Closing Automatically:**
- Check if scheduler is running
- Verify period end_date is in the past
- Run `POST /process-expired` manually

**Winners Not Selected:**
- Ensure users have submitted scores
- Check for database connectivity issues
- Verify period has expired

**Auto-restart Not Working:**
- Confirm `auto_restart: true` in period settings
- Check scheduler execution logs
- Verify game_id exists for new period

### Emergency Procedures

**Manual Period Closure:**
```http
POST /api/high_score/periods/<id>/close
```

**Force Period Processing:**
```http
POST /api/high_score/process-expired
```

**Extend Period Duration:**
```http
PUT /api/high_score/periods/<id>
{
  "end_date": "2024-01-30T23:59:59Z"
}
```

## API Testing

### Using cURL

**Get all periods:**
```bash
curl -X GET "https://api.domain.com/api/high_score/periods" \
  -H "Authorization: Bearer <admin-token>"
```

**Create new period:**
```bash
curl -X POST "https://api.domain.com/api/high_score/periods" \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "gameId": "123e4567-e89b-12d3-a456-426614174000",
    "durationDays": 7,
    "autoRestart": true
  }'
```

**Mark reward as claimed:**
```bash
curl -X POST "https://api.domain.com/api/high_score/winners/<winner-id>/mark-claimed" \
  -H "Authorization: Bearer <admin-token>"
```