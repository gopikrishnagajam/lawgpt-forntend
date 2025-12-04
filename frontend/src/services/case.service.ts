import { api } from '@/lib/axios';
import type {
  CaseDocument,
  CaseFilters,
  CasesResponse,
  CaseResponse,
  CreateCaseRequest,
  UpdateCaseRequest,
  UpcomingHearingsResponse,
  DocumentUploadRequest,
  GetCaseTeamMembersResponse,
  AddCaseTeamMemberRequest,
  AddCaseTeamMemberResponse,
  RemoveCaseTeamMemberResponse,
  GetCasesByOrgMemberResponse,
} from '@/types/case.types';
import type { ApiResponse } from '@/types/api.types';



export const caseService = {
  /**
   * Get all cases with optional filters
   */
  getCases: async (filters?: CaseFilters): Promise<CasesResponse> => {
    const { data } = await api.get<CasesResponse>('/cases', {
      params: filters,
    });
    return data;
  },

  /**
   * Get a single case by ID
   */
  getCaseById: async (caseId: number, includeDocuments = true): Promise<CaseResponse> => {
    const { data } = await api.get<CaseResponse>(`/cases/${caseId}`, {
      params: { includeDocuments },
    });
    return data;
  },

  /**
   * Create a new case
   */
  createCase: async (caseData: CreateCaseRequest): Promise<CaseResponse> => {
    const { data } = await api.post<CaseResponse>('/cases', caseData);
    return {
      ...data,
    };
  },

  /**
   * Update an existing case
   */
  updateCase: async (caseId: number, updates: UpdateCaseRequest): Promise<CaseResponse> => {
    const { data } = await api.put<CaseResponse>(`/cases/${caseId}`, updates);
    return data;
  },

  /**
   * Delete a case
   */
  deleteCase: async (caseId: number): Promise<ApiResponse<void>> => {
    const { data } = await api.delete<ApiResponse<void>>(`/cases/${caseId}`);
    return data;
  },

  /**
   * Get upcoming hearings
   */
  getUpcomingHearings: async (days = 30): Promise<UpcomingHearingsResponse> => {
    const { data } = await api.get<UpcomingHearingsResponse>(
      '/cases/hearings/upcoming',
      {
        params: { days },
      }
    );
    return data;
  },

  /**
   * Upload a document to a case
   */
  uploadDocument: async (
    caseId: number,
    uploadData: DocumentUploadRequest
  ): Promise<ApiResponse<CaseDocument>> => {
    const formData = new FormData();
    formData.append('file', uploadData.file);
    formData.append('documentType', uploadData.documentType);
    
    if (uploadData.description) {
      formData.append('description', uploadData.description);
    }
    
    if (uploadData.metadata) {
      formData.append('metadata', JSON.stringify(uploadData.metadata));
    }

    const { data } = await api.post<ApiResponse<CaseDocument>>(
      `/cases/${caseId}/documents`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return data;
  },

  /**
   * Get all documents for a case
   */
  getCaseDocuments: async (caseId: number): Promise<ApiResponse<CaseDocument[]>> => {
    const { data } = await api.get<ApiResponse<CaseDocument[]>>(
      `/cases/${caseId}/documents`
    );
    return data;
  },

  /**
   * Download a document
   */
  downloadDocument: async (documentId: string): Promise<Blob> => {
    const { data } = await api.get(`/documents/${documentId}/download`, {
      responseType: 'blob',
    });
    return data;
  },

  /**
   * Delete a document
   */
  deleteDocument: async (documentId: string): Promise<ApiResponse<void>> => {
    const { data } = await api.delete<ApiResponse<void>>(`/documents/${documentId}`);
    return data;
  },

  /**
   * Helper function to trigger document download in browser
   */
  triggerDownload: async (documentId: string, filename: string): Promise<void> => {
    const blob = await caseService.downloadDocument(documentId);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  /**
   * Get dashboard statistics
   */
  getDashboardStats: async (): Promise<import('@/types/case.types').DashboardStatsResponse> => {
    const { data } = await api.get<import('@/types/case.types').DashboardStatsResponse>(
      '/cases/stats/dashboard'
    );
    return data;
  },

  /**
   * Get hearings calendar for date range
   */
  getHearingsCalendar: async (
    startDate: string,
    endDate: string
  ): Promise<import('@/types/case.types').CalendarHearingsResponse> => {
    const { data } = await api.get<import('@/types/case.types').CalendarHearingsResponse>(
      '/cases/hearings/calendar',
      {
        params: { startDate, endDate },
      }
    );
    return data;
  },

  /**
   * Get team members assigned to a case
   */
  getCaseTeamMembers: async (caseId: number): Promise<GetCaseTeamMembersResponse> => {
    const { data } = await api.get<GetCaseTeamMembersResponse>(
      `/cases/${caseId}/team/members`
    );
    return data;
  },

  /**
   * Add a member to a case team
   */
  addCaseTeamMember: async (
    caseId: number,
    request: AddCaseTeamMemberRequest
  ): Promise<AddCaseTeamMemberResponse> => {
    const { data } = await api.post<AddCaseTeamMemberResponse>(
      `/cases/${caseId}/team/members`,
      request
    );
    return data;
  },

  /**
   * Remove a member from a case team
   */
  removeCaseTeamMember: async (
    caseId: number,
    memberId: number
  ): Promise<RemoveCaseTeamMemberResponse> => {
    const { data } = await api.delete<RemoveCaseTeamMemberResponse>(
      `/cases/${caseId}/team/members/${memberId}`
    );
    return data;
  },

  /**
   * Get cases assigned to an organization member
   */
  getCasesByOrgMember: async (
    organizationId: number,
    memberId: number,
    filters?: CaseFilters
  ): Promise<GetCasesByOrgMemberResponse> => {
    const { data } = await api.get<GetCasesByOrgMemberResponse>(
      `/cases/admin/member/${memberId}`,
      {
        params: { ...filters, organizationId },
      }
    );
    return data;
  },
};
