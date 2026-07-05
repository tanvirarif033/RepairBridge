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
  description?: string;
  status: string;
  createdAt: string;
  customerAddress: string;
  customerLatitude?: number;
  customerLongitude?: number;
  user: {
    id: number;
    name: string;
    email: string;
    phone?: string;
  };
  selectedServiceCenters?: Array<{
    id: number;
    name: string;
    address: string;
    phone?: string;
    rating?: number;
  }>;
  images?: Array<{
    id: number;
    imageUrl: string;
  }>;
  quotations?: Array<any>;
  appointment?: any;
  review?: any;
}

export interface AdminQuotation {
  id: number;
  repairRequestId: number;
  serviceCenterId: number;
  estimatedCost: number;
  estimatedRepairDays: number;
  warranty?: string;
  appointmentDate: string;
  notes?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  repairRequest?: {
    id: number;
    title: string;
    brand: string;
    model: string;
    user: {
      id: number;
      name: string;
      email: string;
      phone?: string;
    };
  };
  serviceCenter?: {
    id: number;
    name: string;
    address: string;
    phone?: string;
    rating?: number;
  };
  appointment?: any;
  payment?: any;
}

export interface AdminAppointment {
  id: number;
  repairRequestId: number;
  quotationId: number;
  appointmentDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  repairRequest?: {
    id: number;
    title: string;
    brand: string;
    model: string;
    user: {
      name: string;
      email: string;
      phone?: string;
    };
  };
  quotation?: {
    id: number;
    estimatedCost: number;
    serviceCenter?: {
      name: string;
      address: string;
      phone?: string;
    };
  };
}

export const adminService = {
  // ==================== DASHBOARD ====================
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

  // ==================== USERS ====================
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

  async getUserById(token: string, id: number): Promise<AdminUser> {
    try {
      const response = await axios.get(`${API_URL}/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error: any) {
      console.error('Get user by id error:', error.response?.data || error.message);
      throw error;
    }
  },

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

  async deleteUser(token: string, userId: number): Promise<any> {
    try {
      const response = await axios.delete(`${API_URL}/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error: any) {
      console.error('Delete user error:', error.response?.data || error.message);
      throw error;
    }
  },

  // ==================== REPAIR REQUESTS ====================
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

  async getRequestById(token: string, id: number): Promise<AdminRequest> {
    try {
      const response = await axios.get(`${API_URL}/admin/repair-requests/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error: any) {
      console.error('Get request by id error:', error.response?.data || error.message);
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

  // ==================== QUOTATIONS ====================
  async getQuotations(
    token: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string
  ): Promise<{ data: AdminQuotation[]; meta: any }> {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (search) params.append('search', search);
      if (status && status !== 'all') params.append('status', status);

      const response = await axios.get(`${API_URL}/admin/quotations?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      console.error('Get admin quotations error:', error.response?.data || error.message);
      throw error;
    }
  },

  async getQuotationById(token: string, id: number): Promise<AdminQuotation> {
    try {
      const response = await axios.get(`${API_URL}/admin/quotations/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error: any) {
      console.error('Get quotation by id error:', error.response?.data || error.message);
      throw error;
    }
  },

  async createQuotation(token: string, data: any): Promise<AdminQuotation> {
    try {
      const response = await axios.post(`${API_URL}/admin/quotations`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error: any) {
      console.error('Create quotation error:', error.response?.data || error.message);
      throw error;
    }
  },

  async updateQuotation(token: string, id: number, data: any): Promise<AdminQuotation> {
    try {
      const response = await axios.patch(`${API_URL}/admin/quotations/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error: any) {
      console.error('Update quotation error:', error.response?.data || error.message);
      throw error;
    }
  },

  async deleteQuotation(token: string, id: number): Promise<any> {
    try {
      const response = await axios.delete(`${API_URL}/admin/quotations/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error: any) {
      console.error('Delete quotation error:', error.response?.data || error.message);
      throw error;
    }
  },

  async adminUpdateQuotation(token: string, id: number, data: any): Promise<AdminQuotation> {
    try {
      const response = await axios.patch(
        `${API_URL}/admin/quotations/${id}/admin`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Admin update quotation error:', error.response?.data || error.message);
      throw error;
    }
  },

// ==================== SERVICE CENTER ====================
async updateQuotationServiceCenter(token: string, id: number, serviceCenterId: number, notes?: string): Promise<any> {
  try {
    const response = await axios.patch(
      `${API_URL}/admin/quotations/${id}/service-center`,
      { 
        serviceCenterId: serviceCenterId,
        notes: notes || ''
      },
      { 
        headers: { 
          Authorization: `Bearer ${token}` 
        } 
      }
    );
    return response.data.data;
  } catch (error: any) {
    console.error('Update service center error:', error.response?.data || error.message);
    throw error;
  }
},

  // ==================== APPOINTMENTS ====================
  async getAppointments(
    token: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string
  ): Promise<{ data: AdminAppointment[]; meta: any }> {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (search) params.append('search', search);
      if (status && status !== 'all') params.append('status', status);

      const response = await axios.get(`${API_URL}/admin/appointments?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      console.error('Get admin appointments error:', error.response?.data || error.message);
      throw error;
    }
  },

  async getAppointmentById(token: string, id: number): Promise<AdminAppointment> {
    try {
      const response = await axios.get(`${API_URL}/admin/appointments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error: any) {
      console.error('Get appointment by id error:', error.response?.data || error.message);
      throw error;
    }
  },

  async updateAppointmentStatus(token: string, id: number, status: string): Promise<AdminAppointment> {
    try {
      const response = await axios.patch(
        `${API_URL}/admin/appointments/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Update appointment status error:', error.response?.data || error.message);
      throw error;
    }
  },

  async createAppointment(token: string, data: any): Promise<AdminAppointment> {
    try {
      const response = await axios.post(`${API_URL}/admin/appointments`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error: any) {
      console.error('Create appointment error:', error.response?.data || error.message);
      throw error;
    }
  },

  async cancelAppointment(token: string, id: number): Promise<AdminAppointment> {
    try {
      const response = await axios.patch(`${API_URL}/admin/appointments/${id}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error: any) {
      console.error('Cancel appointment error:', error.response?.data || error.message);
      throw error;
    }
  },

  // ==================== PAYMENTS ====================
  async getPayments(
    token: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string
  ): Promise<{ data: any[]; meta: any }> {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (search) params.append('search', search);
      if (status && status !== 'all') params.append('status', status);

      const response = await axios.get(`${API_URL}/admin/payments?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      console.error('Get admin payments error:', error.response?.data || error.message);
      throw error;
    }
  },

  async getPaymentById(token: string, id: number): Promise<any> {
    try {
      const response = await axios.get(`${API_URL}/admin/payments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error: any) {
      console.error('Get payment by id error:', error.response?.data || error.message);
      throw error;
    }
  },

  // ==================== REVIEWS ====================
  async getReviews(
    token: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    rating?: number
  ): Promise<{ data: any[]; meta: any }> {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (search) params.append('search', search);
      if (rating) params.append('rating', rating.toString());

      const response = await axios.get(`${API_URL}/admin/reviews?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      console.error('Get admin reviews error:', error.response?.data || error.message);
      throw error;
    }
  },

  async deleteReview(token: string, id: number): Promise<any> {
    try {
      const response = await axios.delete(`${API_URL}/admin/reviews/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error: any) {
      console.error('Delete review error:', error.response?.data || error.message);
      throw error;
    }
  },
};