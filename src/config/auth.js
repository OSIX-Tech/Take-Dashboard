// Authentication Configuration
const isDevelopment = import.meta.env.VITE_APP_ENV === 'development'
const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000').replace(/\/api$/, '')

export const AUTH_CONFIG = {
  // API Base URL (lo único que necesita el frontend)
  // Ensure the URL ends with /api
  API_BASE_URL: API_BASE + '/api',
  
  // Demo mode
  DEMO_MODE: import.meta.env.VITE_DEMO_MODE === 'true',
  
  // JWT Secret (for demo tokens)
  JWT_SECRET: import.meta.env.VITE_JWT_SECRET || 'change-this-in-production',
  
  // Callback URL para OAuth
  CALLBACK_URL: isDevelopment 
    ? 'http://localhost:5173/admin/auth/callback'
    : 'https://take-dashboard.vercel.app/admin/auth/callback',
  
  // Debug mode para logs detallados
  DEBUG: false
}


// Demo user data
export const DEMO_USER = {
  name: 'Demo User',
  email: 'demo@example.com',
  isDemo: true,
  isAdmin: false,
  role: 'user'
}

// Google user data (fallback)
export const GOOGLE_USER = {
  name: 'Usuario Google',
  email: 'google@example.com',
  isDemo: false,
  isAdmin: false,
  role: 'user'
}

// Admin user data (fallback)
export const ADMIN_USER = {
  name: 'Admin User',
  email: 'admin@take.com',
  isDemo: false,
  isAdmin: true,
  role: 'admin'
} 