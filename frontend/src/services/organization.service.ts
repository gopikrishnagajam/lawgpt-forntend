import api from '../lib/axios';
import type {
  OrganizationMembersResponse,
  SendInvitationsRequest,
  SendInvitationsResponse,
  PendingInvitationsResponse,
} from '../types/organization.types';

export const organizationService = {
  // Get organization members (admin only)
  getMembers: async (organizationId: number): Promise<OrganizationMembersResponse> => {
    const response = await api.get<OrganizationMembersResponse>(
      `/organizations/${organizationId}/members`
    );
    return response.data;
  },

  // Send invitations (admin only)
  sendInvitations: async (
    organizationId: number,
    data: SendInvitationsRequest
  ): Promise<SendInvitationsResponse> => {
    const response = await api.post<SendInvitationsResponse>(
      `/organizations/${organizationId}/invitations`,
      data
    );
    return response.data;
  },

  // Get pending invitations (admin only)
  getPendingInvitations: async (organizationId: number): Promise<PendingInvitationsResponse> => {
    const response = await api.get<PendingInvitationsResponse>(
      `/organizations/${organizationId}/invitations?status=pending`
    );
    return response.data;
  },
};
