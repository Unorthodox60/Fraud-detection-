import axios from 'axios';

const API_URL = 'http://localhost:8000';

export interface TransactionInput {
  Time: number;
  Amount: number;
  V1: number; V2: number; V3: number; V4: number; V5: number;
  V6: number; V7: number; V8: number; V9: number; V10: number;
  V11: number; V12: number; V13: number; V14: number; V15: number;
  V16: number; V17: number; V18: number; V19: number; V20: number;
  V21: number; V22: number; V23: number; V24: number; V25: number;
  V26: number; V27: number; V28: number;
}

export const api = {
  predict: async (data: TransactionInput) => {
    const response = await axios.post(`${API_URL}/predict`, data);
    return response.data;
  },
  
  simulate: async (count: number = 5, fraudRate: number = 0.2) => {
    const response = await axios.post(`${API_URL}/transactions/simulate?count=${count}&fraud_rate=${fraudRate}`);
    return response.data;
  },
  
  getRecentTransactions: async (limit: number = 50) => {
    const response = await axios.get(`${API_URL}/transactions/recent?limit=${limit}`);
    return response.data;
  },
  
  getStats: async () => {
    const response = await axios.get(`${API_URL}/stats`);
    return response.data;
  }
};
