import { apiService } from './api';

const WALLET_BASE_URL = 'admin/wallet';

export const walletService = {
  // Public endpoint - no auth required
  async validateQRToken(qrToken) {
    const response = await apiService.get(`wallet/validate/${qrToken}`);
    return response.data;
  },

  // Admin endpoints - require auth
  async scanQRToken(qrToken) {
    const response = await apiService.get(`${WALLET_BASE_URL}/scan/${qrToken}`);
    return response.data;
  },

  async addSeals(qrToken, seals, notes = '') {
    const response = await apiService.post(`${WALLET_BASE_URL}/scan/${qrToken}/add`, {
      seals,
      notes
    });
    return response.data;
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
    const response = await apiService.get(url);
    return response.data;
  },

  async getStats() {
    const response = await apiService.get(`${WALLET_BASE_URL}/stats`);
    return response.data;
  }
};

export default walletService;