import { apiService } from './api.js'

export const rewardsService = {
  // Get all rewards
  async getRewards() {
    return apiService.get('rewards')
  },

  // Get reward by ID
  async getReward(id) {
    return apiService.get(`rewards?id=eq.${id}`)
  },

  // Create new reward
  async createReward(data) {
    return apiService.post('rewards', data)
  },

  // Update reward
  async updateReward(id, data) {
    return apiService.patch(`rewards?id=eq.${id}`, data)
  },

  // Delete reward
  async deleteReward(id) {
    return apiService.delete(`rewards?id=eq.${id}`)
  },

  // Get rewards by required seals
  async getRewardsBySeals(seals) {
    return apiService.get(`rewards?required_seals=lte.${seals}`)
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