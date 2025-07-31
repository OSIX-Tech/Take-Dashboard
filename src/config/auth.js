// Authentication Configuration
export const AUTH_CONFIG = {
  // Google OAuth Client ID
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'AQUI_TU_CLIENT_ID_DE_GOOGLE',
  
  // Google OAuth Client Secret (for admin)
  GOOGLE_CLIENT_SECRET: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || 'AQUI_TU_CLIENT_SECRET_DE_GOOGLE',
  
  // API Base URL
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  
  // Demo mode
  DEMO_MODE: import.meta.env.VITE_DEMO_MODE === 'true',
  
  // Admin email whitelist
  ADMIN_EMAIL_WHITELIST: import.meta.env.VITE_ADMIN_EMAIL_WHITELIST?.split(',') || [],
  
  // JWT Secret (for demo tokens)
  JWT_SECRET: import.meta.env.VITE_JWT_SECRET || 'change-this-in-production'
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