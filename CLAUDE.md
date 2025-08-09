# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TakeDash is a minimalist admin dashboard for a restaurant/café application built with React and Tailwind CSS. It manages menu items, events, rewards, games, and user authentication with a clean black & white design.

## Essential Commands

```bash
# Development
npm run dev          # Start development server at http://localhost:5173
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint

# Testing (no test framework configured yet)
# Before adding tests, choose and install a framework like Vitest or Jest
```

## Architecture

### Tech Stack
- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS (minimalist black/white theme)
- **Routing**: React Router DOM v7
- **Auth**: Google OAuth via backend + demo mode
- **State**: React hooks (useState, useEffect)
- **API**: Services layer with mock data fallback

### Project Structure
```
src/
├── services/          # API services layer
│   ├── api.js        # Base API client
│   ├── authService.js # Authentication logic
│   └── *Service.js   # Domain-specific services
├── pages/            # Route components with business logic
├── components/       # Reusable UI components
│   ├── ui/          # shadcn/ui components
│   ├── layout/      # Layout components
│   └── common/      # Shared components
├── hooks/           # Custom React hooks
└── config/          # Configuration files
```

### Key Architectural Patterns

1. **Service Layer Pattern**: All API calls go through dedicated service files in `src/services/`. Each service handles a specific domain (menu, events, rewards, etc.).

2. **Authentication Flow**:
   - Login supports Google OAuth (via backend) and demo mode
   - Auth state managed in App.jsx with localStorage tokens
   - Protected routes redirect to login if not authenticated
   - Demo mode bypasses backend authentication

3. **Error Handling**:
   - Centralized error handling in api.js
   - Health check system in healthService.js
   - User-friendly error messages with retry capabilities
   - SystemStatus component for diagnostics

4. **Mock Data Fallback**:
   - When `VITE_USE_MOCK_DATA=true` or backend unavailable
   - Mock data in mockData.js mirrors expected API responses
   - Seamless switching between real and mock data

## Development Workflow

### Environment Setup
1. Copy `env.example` to `.env`
2. Set `VITE_API_BASE_URL` to your backend URL
3. Optional: Enable demo mode with `VITE_DEMO_MODE=true`

### Adding New Features
1. Create service methods in appropriate `*Service.js` file
2. Create/update page component in `src/pages/`
3. Add route in App.jsx if needed
4. Use existing UI components from `src/components/ui/`

### API Integration
- Services expect RESTful endpoints
- Authentication uses Bearer tokens
- CORS must be configured on backend
- Health endpoint: `GET /api/health`

### Styling Guidelines
- Use Tailwind classes exclusively
- Maintain black/white color scheme
- Follow existing component patterns
- Consistent spacing: px-6, py-4, gap-4

## Critical Files

- `src/App.jsx`: Main routing and auth state
- `src/services/api.js`: Base API configuration
- `src/services/authService.js`: Authentication logic
- `src/components/layout/Layout.jsx`: Main layout wrapper
- `src/pages/*`: CRUD operations for each section

## Backend Requirements

The frontend expects these endpoints:

### Authentication
- `POST /api/auth/admin/google` - Google OAuth
- `GET /api/auth/admin/profile` - Get current user
- `POST /api/auth/admin/logout` - Logout

### CRUD Endpoints
- `/api/menu` - Menu items management
- `/api/events` - Events management  
- `/api/rewards` - Rewards and statistics
- `/api/games` - Game leaderboards
- `/api/users` - User management

### Health Check
- `GET /api/health` - System status

## Common Tasks

### Switch between mock and real data
Set `VITE_USE_MOCK_DATA` in `.env` to `true` for mock data or `false` for real backend.

### Add a new page
1. Create component in `src/pages/`
2. Add route in App.jsx
3. Add navigation item in Sidebar.jsx
4. Create corresponding service in `src/services/`

### Modify the theme
Edit colors in `tailwind.config.js` - currently uses minimal black/white palette.

### Debug API issues
1. Check browser console for detailed errors
2. Visit SystemStatus component for diagnostics
3. Verify CORS configuration on backend
4. Check network tab for request/response details