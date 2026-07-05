import axios from 'axios';
import { RepairRequest, CreateRepairRequest, UpdateRepairRequest, RepairRequestFilters } from '../types/repairRequest.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const repairRequestService = {
  async getAll(token: string, filters?: RepairRequestFilters): Promise<{ data: RepairRequest[]; meta: any }> {
    try {
      const params = new URLSearchParams();
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.search) params.append('search', filters.search);
      if (filters?.status) params.append('status', filters.status);
      
      const response = await axios.get(`${API_URL}/repair-requests?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Get all repair requests error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  },

  async getById(token: string, id: number): Promise<RepairRequest> {
    try {
      const response = await axios.get(`${API_URL}/repair-requests/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.data;
    } catch (error: any) {
      console.error('Get repair request by id error:', error.response?.data || error.message);
      throw error;
    }
  },

  async create(token: string, data: CreateRepairRequest): Promise<RepairRequest> {
    try {
      const response = await axios.post(`${API_URL}/repair-requests`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data.data;
    } catch (error: any) {
      console.error('Create repair request error:', error.response?.data || error.message);
      throw error;
    }
  },

  async update(token: string, id: number, data: UpdateRepairRequest): Promise<RepairRequest> {
    try {
      const response = await axios.patch(`${API_URL}/repair-requests/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.data;
    } catch (error: any) {
      console.error('Update repair request error:', error.response?.data || error.message);
      throw error;
    }
  },

  async cancel(token: string, id: number): Promise<RepairRequest> {
    try {
      const response = await axios.patch(`${API_URL}/repair-requests/${id}/cancel`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.data;
    } catch (error: any) {
      console.error('Cancel repair request error:', error.response?.data || error.message);
      throw error;
    }
  },
};