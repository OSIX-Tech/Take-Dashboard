import { apiService } from './api';

const WALLET_BASE_URL = 'admin/wallet';

export const walletService = {
  // Public endpoint - no auth required
  async validateQRToken(qrToken) {
    return apiService.get(`wallet/validate/${qrToken}`);
  },

  // Admin endpoints - require auth
  async scanQRToken(qrToken) {
    return apiService.get(`wallet/scan/${qrToken}`);
  },

  async addSeals(qrToken, seals, notes = '') {
    return apiService.post(`wallet/scan/${qrToken}/add`, {
      seals,
      notes
    });
  },

  async getTransactions(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.userId) queryParams.append('userId', params.userId);
    if (params.from) queryParams.append('from', params.from);
    if (params.to) queryParams.append('to', params.to);
    if (params.rewardGranted !== undefined) queryParams.append('rewardGranted', params.rewardGranted);
    if (params.limit) queryParams.append('limit', params.limit);

    const queryString = queryParams.toString();
    const url = `${WALLET_BASE_URL}/transactions${queryString ? `?${queryString}` : ''}`;
    return apiService.get(url);
  },

  async getStats() {
    return apiService.get(`${WALLET_BASE_URL}/stats`);
  }
};

export default walletService;