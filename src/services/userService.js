import { apiService } from './api.js'

export const userService = {
  // Get all users
  async getUsers() {
    return apiService.get('users')
  },

  // Get user by ID
  async getUser(id) {
    return apiService.get(`users?id=eq.${id}`)
  },

  // Get user by email
  async getUserByEmail(email) {
    return apiService.get(`users?email=eq.${email}`)
  },

  // Get user by Google ID
  async getUserByGoogleId(googleId) {
    return apiService.get(`users?google_id=eq.${googleId}`)
  },

  // Create new user
  async createUser(data) {
    return apiService.post('users', data)
  },

  // Update user
  async updateUser(id, data) {
    return apiService.patch(`users?id=eq.${id}`, data)
  },

  // Delete user
  async deleteUser(id) {
    return apiService.delete(`users?id=eq.${id}`)
  },

  // Get users with their wallets
  async getUsersWithWallets() {
    const users = await apiService.get('users')
    const appleWallets = await apiService.get('wallets_apple')
    const googleWallets = await apiService.get('wallets_google')
    
    return users.map(user => ({
      ...user,
      apple_wallet: appleWallets.find(w => w.user_id === user.id),
      google_wallet: googleWallets.find(w => w.user_id === user.id)
    }))
  }
}

export const walletService = {
  // Apple Wallet operations
  async getAppleWallet(userId) {
    return apiService.get(`wallets_apple?user_id=eq.${userId}`)
  },

  async createAppleWallet(data) {
    return apiService.post('wallets_apple', data)
  },

  async updateAppleWallet(userId, data) {
    return apiService.patch(`wallets_apple?user_id=eq.${userId}`, data)
  },

  async deleteAppleWallet(userId) {
    return apiService.delete(`wallets_apple?user_id=eq.${userId}`)
  },

  // Google Wallet operations
  async getGoogleWallet(userId) {
    return apiService.get(`wallets_google?user_id=eq.${userId}`)
  },

  async createGoogleWallet(data) {
    return apiService.post('wallets_google', data)
  },

  async updateGoogleWallet(userId, data) {
    return apiService.patch(`wallets_google?user_id=eq.${userId}`, data)
  },

  async deleteGoogleWallet(userId) {
    return apiService.delete(`wallets_google?user_id=eq.${userId}`)
  },

  // Combined wallet operations
  async getUserWallets(userId) {
    const [appleWallet, googleWallet] = await Promise.all([
      this.getAppleWallet(userId),
      this.getGoogleWallet(userId)
    ])
    
    return {
      apple_wallet: appleWallet[0] || null,
      google_wallet: googleWallet[0] || null
    }
  },

  // Add seals to wallet
  async addSealsToWallet(userId, seals, walletType = 'apple') {
    const wallet = walletType === 'apple' 
      ? await this.getAppleWallet(userId)
      : await this.getGoogleWallet(userId)
    
    if (wallet && wallet[0]) {
      const currentWallet = wallet[0]
      const updatedData = {
        total_seals: currentWallet.total_seals + seals,
        current_seals: currentWallet.current_seals + seals
      }
      
      return walletType === 'apple'
        ? this.updateAppleWallet(userId, updatedData)
        : this.updateGoogleWallet(userId, updatedData)
    }
    
    throw new Error('Wallet not found')
  },

  // Get wallet statistics
  async getWalletStats() {
    const [appleWallets, googleWallets] = await Promise.all([
      apiService.get('wallets_apple'),
      apiService.get('wallets_google')
    ])
    
    const totalAppleSeals = appleWallets.reduce((sum, w) => sum + w.total_seals, 0)
    const totalGoogleSeals = googleWallets.reduce((sum, w) => sum + w.total_seals, 0)
    
    return {
      totalWallets: appleWallets.length + googleWallets.length,
      totalSeals: totalAppleSeals + totalGoogleSeals,
      appleWallets: appleWallets.length,
      googleWallets: googleWallets.length,
      averageSealsPerWallet: (totalAppleSeals + totalGoogleSeals) / (appleWallets.length + googleWallets.length)
    }
  }
} 