import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export interface Quotation {
  id: number;
  repairRequestId: number;
  serviceCenterId: number;
  estimatedCost: number;
  estimatedRepairDays: number;
  warranty?: string;
  appointmentDate: string;
  notes?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'RESCHEDULE_REQUESTED' | 'ANOTHER_SERVICE_CENTER_REQUESTED';
  createdAt: string;
  updatedAt: string;
  repairRequest?: {
    id: number;
    title: string;
    brand: string;
    model: string;
    status: string;
  };
  serviceCenter?: {
    id: number;
    name: string;
    address: string;
    phone?: string;
    rating?: number;
  };
}

export const quotationService = {
  async getMyQuotations(token: string): Promise<Quotation[]> {
    try {
      const response = await axios.get(`${API_URL}/quotations/my`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.data;
    } catch (error: any) {
      console.error('Get quotations error:', error.response?.data || error.message);
      throw error;
    }
  },

  async getById(token: string, id: number): Promise<Quotation> {
    try {
      const response = await axios.get(`${API_URL}/quotations/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.data;
    } catch (error: any) {
      console.error('Get quotation by id error:', error.response?.data || error.message);
      throw error;
    }
  },

  async accept(token: string, id: number): Promise<Quotation> {
    try {
      const response = await axios.patch(`${API_URL}/quotations/${id}/action`, 
        { action: 'ACCEPT' },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Accept quotation error:', error.response?.data || error.message);
      throw error;
    }
  },

  async reject(token: string, id: number): Promise<Quotation> {
    try {
      const response = await axios.patch(`${API_URL}/quotations/${id}/action`,
        { action: 'REJECT' },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Reject quotation error:', error.response?.data || error.message);
      throw error;
    }
  },

  async requestReschedule(token: string, id: number): Promise<Quotation> {
    try {
      const response = await axios.patch(`${API_URL}/quotations/${id}/action`,
        { action: 'RESCHEDULE' },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Request reschedule error:', error.response?.data || error.message);
      throw error;
    }
  },

  async requestAnotherCenter(token: string, id: number): Promise<Quotation> {
    try {
      const response = await axios.patch(`${API_URL}/quotations/${id}/action`,
        { action: 'ANOTHER_SERVICE_CENTER' },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Request another center error:', error.response?.data || error.message);
      throw error;
    }
  },
};