// Client Types
export interface Client {
  id: number;
  userId: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  address: { street?: string; city?: string; state?: string; zip?: string; country?: string } | null;
  notes: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientRequest {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  notes?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateClientRequest {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  notes?: string;
  metadata?: Record<string, unknown>;
}
