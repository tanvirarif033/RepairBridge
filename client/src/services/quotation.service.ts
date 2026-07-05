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
  status: string;
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
        headers: { Authorization: `Bearer ${token}` },
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
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error: any) {
      console.error('Get quotation by id error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Customer action on quotation with optional reschedule data
  async customerAction(
    token: string, 
    id: number, 
    action: 'ACCEPT' | 'REJECT' | 'RESCHEDULE' | 'ANOTHER_SERVICE_CENTER',
    rescheduleData?: { newDate?: string; notes?: string }
  ): Promise<Quotation> {
    try {
      const payload: any = { action };
      if (rescheduleData) {
        payload.newDate = rescheduleData.newDate;
        payload.notes = rescheduleData.notes;
      }
      
      const response = await axios.patch(
        `${API_URL}/quotations/${id}/action`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Customer action error:', error.response?.data || error.message);
      throw error;
    }
  },

  async accept(token: string, id: number): Promise<Quotation> {
    return this.customerAction(token, id, 'ACCEPT');
  },

  async reject(token: string, id: number): Promise<Quotation> {
    return this.customerAction(token, id, 'REJECT');
  },

  async requestReschedule(token: string, id: number, newDate?: string): Promise<Quotation> {
    return this.customerAction(token, id, 'RESCHEDULE', { newDate });
  },

  async requestAnotherCenter(token: string, id: number): Promise<Quotation> {
    return this.customerAction(token, id, 'ANOTHER_SERVICE_CENTER');
  },
};

