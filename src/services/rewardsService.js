import { apiService } from './api.js'

export const rewardsService = {
  // Obtener todas las recompensas
  async getRewards() {
    return apiService.get('reward')
  },

  // Obtener una recompensa por ID
  async getReward(id) {
    return apiService.get(`reward/${id}`)
  },

  // Crear una nueva recompensa
  async createReward(data) {
    return apiService.post('reward', data)
  },

  // Editar una recompensa
  async updateReward(id, data) {
    return apiService.put(`reward/${id}`, data)
  },

  // Eliminar una recompensa
  async deleteReward(id) {
    return apiService.delete(`reward/${id}`)
  }
}

// Statistics Service for Rewards
export const rewardsStatsService = {
  // Get total seals across all wallets
  async getTotalSeals() {
    const appleWallets = await apiService.get('wallets_apple?select=total_seals')
    const googleWallets = await apiService.get('wallets_google?select=total_seals')
    
    const totalApple = appleWallets.reduce((sum, wallet) => sum + wallet.total_seals, 0)
    const totalGoogle = googleWallets.reduce((sum, wallet) => sum + wallet.total_seals, 0)
    
    return totalApple + totalGoogle
  },

  // Get users with most seals
  async getTopUsersBySeals(limit = 10) {
    const appleWallets = await apiService.get(`wallets_apple?select=*,users(name)&order=total_seals.desc&limit=${limit}`)
    const googleWallets = await apiService.get(`wallets_google?select=*,users(name)&order=total_seals.desc&limit=${limit}`)
    
    // Combine and sort by total seals
    const allWallets = [...appleWallets, ...googleWallets]
    return allWallets.sort((a, b) => b.total_seals - a.total_seals).slice(0, limit)
  },

  // Get total free coffees given (rewards with required_seals <= 10)
  async getTotalFreeCoffees() {
    const coffeeRewards = await apiService.get('rewards?required_seals=lte.10')
    return coffeeRewards.length
  },

  // Get total rewards given
  async getTotalRewardsGiven() {
    const rewards = await apiService.get('rewards')
    return rewards.length
  },

  // Get wallet statistics
  async getWalletStats() {
    const appleWallets = await apiService.get('wallets_apple?select=*')
    const googleWallets = await apiService.get('wallets_google?select=*')
    
    return {
      totalAppleWallets: appleWallets.length,
      totalGoogleWallets: googleWallets.length,
      totalSeals: appleWallets.reduce((sum, w) => sum + w.total_seals, 0) + 
                  googleWallets.reduce((sum, w) => sum + w.total_seals, 0),
      averageSealsPerUser: (appleWallets.reduce((sum, w) => sum + w.total_seals, 0) + 
                           googleWallets.reduce((sum, w) => sum + w.total_seals, 0)) / 
                           (appleWallets.length + googleWallets.length)
    }
  }
} 