import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export interface Payment {
  id: number;
  quotationId: number;
  amount: number;
  paymentMethod?: 'BKASH' | 'NAGAD' | 'ROCKET' | 'CARD' | 'CASH';
  paymentStatus: 'PENDING' | 'PARTIAL' | 'PAID' | 'FAILED' | 'REFUNDED';
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
  quotation?: {
    id: number;
    estimatedCost: number;
    repairRequest?: {
      id: number;
      title: string;
      brand: string;
      model: string;
    };
    serviceCenter?: {
      name: string;
    };
  };
}

export const paymentService = {
  async getMyPayments(token: string): Promise<Payment[]> {
    try {
      const response = await axios.get(`${API_URL}/payments/my`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.data;
    } catch (error: any) {
      console.error('Get payments error:', error.response?.data || error.message);
      throw error;
    }
  },

  async getById(token: string, id: number): Promise<Payment> {
    try {
      const response = await axios.get(`${API_URL}/payments/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.data;
    } catch (error: any) {
      console.error('Get payment by id error:', error.response?.data || error.message);
      throw error;
    }
  },
};