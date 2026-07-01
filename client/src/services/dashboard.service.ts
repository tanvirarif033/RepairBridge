import axios from 'axios';
import { DashboardStats, RecentActivity } from '../types/auth.types';

// Use environment variable with fallback
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const dashboardService = {
  async getStats(token: string): Promise<DashboardStats> {
    try {
      const response = await axios.get(`${API_URL}/dashboard/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.data;
    } catch (error: any) {
      console.error('Get stats error:', error.response?.data || error.message);
      throw error;
    }
  },

  async getRecentActivities(token: string): Promise<RecentActivity[]> {
    try {
      const response = await axios.get(`${API_URL}/dashboard/recent-activities`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.data;
    } catch (error: any) {
      console.error('Get recent activities error:', error.response?.data || error.message);
      throw error;
    }
  },
};