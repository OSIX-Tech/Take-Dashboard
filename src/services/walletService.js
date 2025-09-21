import { apiService } from './api';
import { sealService } from './sealService';

const WALLET_BASE_URL = 'admin/wallet';

export const walletService = {
  // Public endpoint - no auth required
  async validateQRToken(qrToken) {
    return apiService.get(`wallet/validate/${qrToken}`);
  },

  // Admin endpoints - require auth
  async scanQRToken(qrToken) {
    try {
      const response = await apiService.get(`wallet/scan/${qrToken}`);

      // Handle the API response format: {success: true, data: {...}}
      let scanData;
      if (response?.success && response?.data) {
        scanData = response.data;
      } else if (response?.data) {
        scanData = response.data;
      } else {
        scanData = response;
      }
      
      // The response already includes availableRewards from the backend
      // No need to fetch them separately

      return scanData;
    } catch (error) {
      
      throw error;
    }
  },

  async getWalletStatus(qrToken) {
    // Get wallet status for a specific QR token
    if (qrToken) {
      // Pass the qrToken as a query parameter
      return apiService.get(`wallet/status?qrToken=${qrToken}`);
    }
    // Without qrToken, gets the status of the currently authenticated user
    return apiService.get(`wallet/status`);
  },

  async addSeals(qrToken, seals, notes = '') {
    try {

      // Add seals
      const response = await apiService.post(`wallet/scan/${qrToken}/add`, {
        seals,
        notes
      });

      // Handle the API response format
      let result;
      if (response?.success && response?.data) {
        result = {
          ...response.data,
          message: response.message,
          success: response.success
        };
      } else if (response?.data) {
        result = response.data;
      } else {
        result = response;
      }
      
      return result;
    } catch (error) {
      
      throw error;
    }
  },

  async getTransactions(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.userId) queryParams.append('userId', params.userId);
      if (params.from) queryParams.append('from', params.from);
      if (params.to) queryParams.append('to', params.to);
      if (params.rewardGranted !== undefined) queryParams.append('rewardGranted', params.rewardGranted);
      if (params.limit) queryParams.append('limit', params.limit);

      const queryString = queryParams.toString();
      const url = `${WALLET_BASE_URL}/transactions${queryString ? `?${queryString}` : ''}`;
      const response = await apiService.get(url);

      // IMPORTANT: Check for unexpected structures first
      if (response && response.success && response.data) {
        const data = response.data;
        
        // Check for unexpected {seals, rewards} structure
        if (data.seals !== undefined || data.rewards !== undefined) {

          // Return empty transactions to prevent rendering error
          return { transactions: [], count: 0 };
        }
        
        // If data has transactions array
        if (data.transactions) {
          
          return { transactions: data.transactions, count: data.count || data.transactions.length };
        }
        
        // If data is an array of transactions directly
        if (Array.isArray(data)) {
          
          return { transactions: data, count: data.length };
        }
      }
      
      // If response has transactions directly (without success wrapper)
      if (response && response.transactions) {
        
        return { transactions: response.transactions, count: response.count || response.transactions.length };
      }
      
      // If response is an array directly
      if (Array.isArray(response)) {
        
        return { transactions: response, count: response.length };
      }

      return { transactions: [], count: 0 };
    } catch (error) {
      
      throw error;
    }
  },

  async getStats() {
    try {
      const response = await apiService.get(`${WALLET_BASE_URL}/stats`);

      // IMPORTANT: Don't blindly return response.data
      // Check the structure first
      
      // If response has success and data structure
      if (response && response.success && response.data) {
        const data = response.data;
        
        // Check if data has the correct wallet stats structure
        if (data.wallets || data.today || data.thisWeek) {
          
          return data;
        }
        
        // Check if data has unexpected structure like {seals, rewards}
        if (data.seals !== undefined || data.rewards !== undefined) {

          // Return empty stats to prevent rendering error
          return {
            wallets: { totalUsers: 0, usersCloseToReward: 0, totalLifetimeSeals: 0 },
            today: { sealsGivenToday: 0, rewardsGrantedToday: 0, transactionsToday: 0 },
            thisWeek: { sealsGivenThisWeek: 0, rewardsGrantedThisWeek: 0, transactionsThisWeek: 0, dailyBreakdown: {} }
          };
        }
      }
      
      // If response is the stats directly (without wrapper)
      if (response && (response.wallets || response.today || response.thisWeek)) {
        
        return response;
      }

      // Return empty stats structure to prevent errors
      return {
        wallets: { totalUsers: 0, usersCloseToReward: 0, totalLifetimeSeals: 0 },
        today: { sealsGivenToday: 0, rewardsGrantedToday: 0, transactionsToday: 0 },
        thisWeek: { sealsGivenThisWeek: 0, rewardsGrantedThisWeek: 0, transactionsThisWeek: 0, dailyBreakdown: {} }
      };
    } catch (error) {
      
      throw error;
    }
  }
};

export default walletService;