// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

// Auth Types
export interface User {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  accountType: 'INDIVIDUAL' | 'ORGANIZATION';
  emailVerified: boolean;
  primaryOrganizationId: string | null;
  profile?: {
    planType: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
  organizationId?: string;
}

export interface LoginResponse {
  sessionId: string;
  accessToken: string;
  expiresAt: string;
  refreshToken: string;
  refreshExpiresAt: string;
  context: {
    sessionId: string;
    userId: string;
    organizationId: string | null;
    roles: string[];
    planHints: Record<string, unknown>;
    loginType: 'individual' | 'organization';
  };
  user: User;
}

export interface SignupRequest {
  email: string;
  phone: string;
  phoneCountry: string;
  password: string;
  firstName: string;
  lastName: string;
  planType: string;
  inviteToken?: string; // For invitation signups
  profile?: {
    barNumber?: string;
    specialty?: string;
    [key: string]: string | undefined;
  };
  organization?: {
    name: string;
    planType: string;
    description?: string;
    licenseNumber?: string;
    address?: string;
    [key: string]: string | undefined;
  };
}

export interface SignupResponse {
  userId: number;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  subscription: {
    planType: string;
    status: string;
    role: string | null;
    organizationId: number | null;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  sessionId: string;
  accessToken: string;
  expiresAt: string;
  refreshToken: string;
  refreshExpiresAt: string;
  context: {
    sessionId: string;
    userId: string;
    organizationId: string | null;
    roles: string[];
    planHints: Record<string, unknown>;
    loginType: 'individual' | 'organization';
  };
}

export interface SessionContext {
  sessionId: string;
  userId: string;
  organizationId: string | null;
  roles: string[];
  planHints: Record<string, unknown>;
  loginType: 'individual' | 'organization';
}
