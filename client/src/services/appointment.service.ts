import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export interface Appointment {
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
    status: string;
    user?: {
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

export const appointmentService = {
  async getMyAppointments(token: string): Promise<Appointment[]> {
    try {
      const response = await axios.get(`${API_URL}/appointments/my`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.data;
    } catch (error: any) {
      console.error('Get appointments error:', error.response?.data || error.message);
      throw error;
    }
  },

  async getById(token: string, id: number): Promise<Appointment> {
    try {
      const response = await axios.get(`${API_URL}/appointments/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.data;
    } catch (error: any) {
      console.error('Get appointment by id error:', error.response?.data || error.message);
      throw error;
    }
  },

  async cancel(token: string, id: number): Promise<Appointment> {
    try {
      const response = await axios.patch(`${API_URL}/appointments/${id}/cancel`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.data;
    } catch (error: any) {
      console.error('Cancel appointment error:', error.response?.data || error.message);
      throw error;
    }
  },
};