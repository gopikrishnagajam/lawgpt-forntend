import { api } from '@/lib/axios';
import type {
  CreateDiaryRequest,
  DiaryResponse,
  DiaryListResponse,
  DiaryStatsResponse,
  DiaryFilters,
} from '@/types/diary.types';

export const diaryService = {
  /**
   * Create or update a diary entry
   */
  createEntry: async (data: CreateDiaryRequest): Promise<DiaryResponse> => {
    const { data: response } = await api.post<DiaryResponse>('/diary', data);
    return response;
  },

  /**
   * Get today's diary entry
   */
  getTodayEntry: async (): Promise<DiaryResponse> => {
    const { data } = await api.get<DiaryResponse>('/diary/today');
    return data;
  },

  /**
   * Get diary entry for a specific date
   */
  getEntryByDate: async (date: string): Promise<DiaryResponse> => {
    const { data } = await api.get<DiaryResponse>(`/diary/date/${date}`);
    return data;
  },

  /**
   * Get all diary entries with pagination and filters
   */
  getAllEntries: async (filters?: DiaryFilters): Promise<DiaryListResponse> => {
    const { data } = await api.get<DiaryListResponse>('/diary', {
      params: filters,
    });
    return data;
  },

  /**
   * Get diary entries for a date range
   */
  getEntriesByDateRange: async (startDate: string, endDate: string, limit = 50): Promise<DiaryListResponse> => {
    const { data } = await api.get<DiaryListResponse>('/diary', {
      params: { startDate, endDate, limit },
    });
    return data;
  },

  /**
   * Get diary statistics
   */
  getStats: async (): Promise<DiaryStatsResponse> => {
    const { data } = await api.get<DiaryStatsResponse>('/diary/stats');
    return data;
  },

  /**
   * Delete a diary entry
   */
  deleteEntry: async (date: string): Promise<{ success: boolean; message: string }> => {
    const { data } = await api.delete<{ success: boolean; message: string }>(`/diary/date/${date}`);
    return data;
  },

  /**
   * Update a diary entry (alias for createEntry since POST updates existing)
   */
  updateEntry: async (data: CreateDiaryRequest): Promise<DiaryResponse> => {
    return diaryService.createEntry(data);
  },
};
