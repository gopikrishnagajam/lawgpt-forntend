// Organization Types

export interface OrganizationMember {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'member';
  joinedAt: string;
}

export interface OrganizationMembersResponse {
  organizationId: number;
  memberCount: number;
  memberLimit: number;
  members: OrganizationMember[];
}

export interface Invitation {
  email: string;
  status: 'pending' | 'sent' | 'accepted' | 'expired';
  invitationId: number;
  token: string;
  createdAt?: string;
  expiresAt?: string;
}

export interface SendInvitationsRequest {
  emails: string[];
}

export interface SendInvitationsResponse {
  message: string;
  availableSlots: number;
  memberLimit: number;
  invitations: Invitation[];
}

export interface PendingInvitationsResponse {
  organizationId: number;
  invitations: Invitation[];
}
