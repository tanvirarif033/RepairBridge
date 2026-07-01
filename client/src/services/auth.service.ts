import axios from 'axios';
import { LoginCredentials, RegisterCredentials, AuthResponse } from '../types/auth.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    return response.data;
  },

  async register(data: RegisterCredentials): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/auth/register`, data);
    return response.data;
  },

  async getProfile(token: string): Promise<AuthResponse> {
    const response = await axios.get(`${API_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};