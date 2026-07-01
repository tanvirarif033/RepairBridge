import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export interface AdminStats {
  totalUsers: number;
  totalRepairRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  cancelledRequests: number;
  quotationSent: number;
  appointmentConfirmed: number;
  repairInProgress: number;
  completedRepairs: number;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: 'USER' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
  image?: string;
}

export interface AdminRequest {
  id: number;
  title: string;
  brand: string;
  model: string;
  repairCategory: string;
  status: string;
  createdAt: string;
  customerAddress: string;
  user: {
    id: number;
    name: string;
    email: string;
    phone?: string;
  };
  selectedServiceCenters?: any[];
  images?: any[];
}

export const adminService = {
  async getDashboardStats(token: string): Promise<AdminStats> {
    try {
      const response = await axios.get(`${API_URL}/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error: any) {
      console.error('Get dashboard stats error:', error.response?.data || error.message);
      throw error;
    }
  },

  async getRequests(
    token: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string
  ): Promise<{ data: AdminRequest[]; meta: any }> {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (search) params.append('search', search);
      if (status && status !== 'all') params.append('status', status);

      const response = await axios.get(`${API_URL}/admin/repair-requests?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      console.error('Get admin requests error:', error.response?.data || error.message);
      throw error;
    }
  },

  async approveRequest(token: string, id: number): Promise<any> {
    try {
      const response = await axios.patch(`${API_URL}/admin/repair-requests/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error: any) {
      console.error('Approve request error:', error.response?.data || error.message);
      throw error;
    }
  },

  async rejectRequest(token: string, id: number): Promise<any> {
    try {
      const response = await axios.patch(`${API_URL}/admin/repair-requests/${id}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error: any) {
      console.error('Reject request error:', error.response?.data || error.message);
      throw error;
    }
  },

  async cancelRequest(token: string, id: number): Promise<any> {
    try {
      const response = await axios.patch(`${API_URL}/admin/repair-requests/${id}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error: any) {
      console.error('Cancel request error:', error.response?.data || error.message);
      throw error;
    }
  },

  async getUsers(
    token: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    role?: string
  ): Promise<{ data: AdminUser[]; meta: any }> {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (search) params.append('search', search);
      if (role && role !== 'all') params.append('role', role);

      const response = await axios.get(`${API_URL}/admin/users?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      console.error('Get admin users error:', error.response?.data || error.message);
      throw error;
    }
  },

  // NEW: Change user role
  async changeUserRole(token: string, userId: number, role: 'USER' | 'ADMIN'): Promise<AdminUser> {
    try {
      const response = await axios.patch(
        `${API_URL}/admin/users/${userId}/role`,
        { role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Change user role error:', error.response?.data || error.message);
      throw error;
    }
  },

  // NEW: Toggle user status
  async toggleUserStatus(token: string, userId: number): Promise<AdminUser> {
    try {
      const response = await axios.patch(
        `${API_URL}/admin/users/${userId}/status`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Toggle user status error:', error.response?.data || error.message);
      throw error;
    }
  },
};