// Diary Types

export interface DiaryEntry {
  id: string;
  userId: number;
  date: string; // YYYY-MM-DD format
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDiaryRequest {
  content: string;
  date?: string; // Optional, defaults to today if not provided
}

export interface DiaryResponse {
  success: boolean;
  message?: string;
  data: DiaryEntry;
}

export interface DiaryListResponse {
  success: boolean;
  data: DiaryEntry[];
  total: number;
}

export interface DiaryStatsResponse {
  success: boolean;
  data: {
    totalEntries: number;
    last30Days: number;
    totalDays: number;
  };
}

export interface DiaryFilters {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  date?: string;
}
