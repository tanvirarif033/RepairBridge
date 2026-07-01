import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export interface Review {
  id: number;
  userId: number;
  repairRequestId: number;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    name: string;
    email: string;
    image?: string;
  };
  repairRequest?: {
    id: number;
    title: string;
    brand: string;
    model: string;
    status: string;
  };
}

export const reviewService = {
  async getMyReviews(token: string): Promise<Review[]> {
    try {
      const response = await axios.get(`${API_URL}/reviews/my`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.data;
    } catch (error: any) {
      console.error('Get reviews error:', error.response?.data || error.message);
      throw error;
    }
  },

  async create(token: string, data: { repairRequestId: number; rating: number; comment?: string }): Promise<Review> {
    try {
      const response = await axios.post(`${API_URL}/reviews`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.data;
    } catch (error: any) {
      console.error('Create review error:', error.response?.data || error.message);
      throw error;
    }
  },

  async update(token: string, id: number, data: { rating?: number; comment?: string }): Promise<Review> {
    try {
      const response = await axios.patch(`${API_URL}/reviews/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.data;
    } catch (error: any) {
      console.error('Update review error:', error.response?.data || error.message);
      throw error;
    }
  },

  async delete(token: string, id: number): Promise<void> {
    try {
      await axios.delete(`${API_URL}/reviews/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error: any) {
      console.error('Delete review error:', error.response?.data || error.message);
      throw error;
    }
  },
};