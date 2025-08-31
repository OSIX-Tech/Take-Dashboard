import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // Allow connections from network (needed for Android emulator)
    host: true, // This exposes the server to all network interfaces
    port: 5173,
    // Alternatively, you can use:
    // host: '0.0.0.0'
  }
})
