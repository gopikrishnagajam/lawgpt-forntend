import { api } from '@/lib/axios';
import type { 
  Note, 
  CreateNoteRequest, 
  UpdateNoteRequest,
  NotesResponse,
  NoteResponse,
  DeleteNoteResponse
} from '@/types/case.types';
import type { ApiResponse } from '@/types/api.types';

export const notesService = {
  /**
   * Create a new note for a case
   */
  createNote: async (
    caseId: number,
    request: CreateNoteRequest
  ): Promise<NoteResponse> => {
    const { data } = await api.post<NoteResponse>(
      `/cases/${caseId}/notes`,
      request
    );
    return data;
  },

  /**
   * Get notes for a specific date on a case
   */
  getNotesByDate: async (
    caseId: number,
    date: string
  ): Promise<NotesResponse> => {
    const { data } = await api.get<NotesResponse>(
      `/cases/${caseId}/notes`,
      {
        params: { date },
      }
    );
    return data;
  },

  /**
   * Get notes for a date range on a case
   */
  getNotesByDateRange: async (
    caseId: number,
    startDate: string,
    endDate: string
  ): Promise<NotesResponse> => {
    const { data } = await api.get<NotesResponse>(
      `/cases/${caseId}/notes`,
      {
        params: { startDate, endDate },
      }
    );
    return data;
  },

  /**
   * Get notes by a specific team member for a case
   */
  getNotesByUserId: async (
    caseId: number,
    userId: number
  ): Promise<NotesResponse> => {
    const { data } = await api.get<NotesResponse>(
      `/cases/${caseId}/notes`,
      {
        params: { userId },
      }
    );
    return data;
  },

  /**
   * Get all notes for a case with pagination
   */
  getAllNotesForCase: async (
    caseId: number,
    limit: number = 50,
    offset: number = 0
  ): Promise<ApiResponse<Note[]> & { total?: number }> => {
    const { data } = await api.get<ApiResponse<Note[]> & { total?: number }>(
      `/cases/${caseId}/notes/all`,
      {
        params: { limit, offset },
      }
    );
    return data;
  },

  /**
   * Get your notes across all cases for a specific date
   */
  getYourNotesByDate: async (date: string): Promise<NotesResponse> => {
    const { data } = await api.get<NotesResponse>(
      `/notes/by-date/${date}`
    );
    return data;
  },

  /**
   * Update a note
   */
  updateNote: async (
    caseId: number,
    noteId: string,
    request: UpdateNoteRequest
  ): Promise<NoteResponse> => {
    const { data } = await api.put<NoteResponse>(
      `/cases/${caseId}/notes/${noteId}`,
      request
    );
    return data;
  },

  /**
   * Delete a note
   */
  deleteNote: async (
    caseId: number,
    noteId: string
  ): Promise<DeleteNoteResponse> => {
    const { data } = await api.delete<DeleteNoteResponse>(
      `/cases/${caseId}/notes/${noteId}`
    );
    return data;
  },
};
