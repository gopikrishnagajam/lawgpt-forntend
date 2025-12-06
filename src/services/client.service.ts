import api from '../lib/axios';
import type { ApiResponse, PaginatedResponse } from '../types/api.types';
import type { Client, CreateClientRequest, UpdateClientRequest } from '../types/client.types';

export const clientService = {
  // Get all clients
  getClients: async (params?: {
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<Client>> => {
    const response = await api.get<PaginatedResponse<Client>>('/clients', { params });
    return response.data;
  },

  // Get single client
  getClient: async (id: number): Promise<ApiResponse<Client>> => {
    const response = await api.get<ApiResponse<Client>>(`/clients/${id}`);
    return response.data;
  },

  // Create client
  createClient: async (data: CreateClientRequest): Promise<ApiResponse<Client>> => {
    const response = await api.post<ApiResponse<Client>>('/clients', data);
    return response.data;
  },

  // Update client
  updateClient: async (id: number, data: UpdateClientRequest): Promise<ApiResponse<Client>> => {
    const response = await api.put<ApiResponse<Client>>(`/clients/${id}`, data);
    return response.data;
  },

  // Delete client
  deleteClient: async (id: number): Promise<void> => {
    await api.delete(`/clients/${id}`);
  },
};
