// Case Management Types

export type CaseType = 'CIVIL' | 'CRIMINAL';
export type CaseStatus = 'ACTIVE' | 'CLOSED' | 'ARCHIVED';
export type CasePriority = 'HIGH' | 'MEDIUM' | 'LOW';
export type ClientType = 'PLAINTIFF' | 'DEFENDANT' | 'ACCUSED' | 'VICTIM';

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

export interface PartyInfo {
  name: string;
  address?: Address;
  phone?: string;
  email?: string;
  advocate_name?: string;
  advocate_bar_registration?: string;
}

export interface CourtInfo {
  court_level: string;
  court_name: string;
  state?: string;
  district?: string;
  court_complex?: string;
  court_hall_number?: string;
  judge_name?: string;
  case_stage?: string;
}

export interface CaseDetails {
  nature_of_suit?: string;
  relief_sought?: string;
  claim_amount?: number;
  subject_matter?: string;
  brief_facts?: string;
  acts_applicable?: string[];
  // Criminal case specific
  fir_number?: string;
  police_station?: string;
  fir_date?: string;
  offense_details?: string;
  custody_status?: string;
  investigation_officer?: string;
}

export interface AssignedClient {
  client_id: number;
  client_type: ClientType;
}

export interface ImportantDates {
  date_of_filing: string;
  first_hearing_date?: string;
  next_hearing_date?: string;
  last_hearing_date?: string;
}

export interface AdditionalInfo {
  priority: CasePriority;
  status: CaseStatus;
  internal_notes?: string;
  tags?: string[];
}

export interface Case {
  id: number;
  userId: number;
  clientId?: number;
  
  // API response structure (camelCase from backend)
  caseNumber: string;
  caseTitle: string;
  caseType: CaseType;
  caseSubType?: string;
  caseNumberType?: string; // e.g., 'TRC', 'WP', 'CS'
  caseRegistrationDate?: string;
  filingDate?: string;
  caseYear: number;
  caseStage?: string;
  caseStatus: CaseStatus;
  casePriority: CasePriority;
  clientType?: ClientType;
  currentStatus?: string; // e.g., 'Disposed', 'Pending'
  disposedOnDate?: string;
  finalOrderSummary?: string;
  
  // Court info (flattened from backend)
  courtLevel?: string;
  courtName?: string;
  state?: string;
  district?: string;
  courtComplex?: string;
  courtHallNumber?: string;
  judgeName?: string;
  
  // Case details objects from backend
  civilCaseDetails?: {
    plaintiffs?: PartyInfo[];
    defendants?: PartyInfo[];
    nature_of_suit?: string;
    relief_sought?: string;
    claim_amount?: number;
    subject_matter?: string;
    brief_facts?: string;
    acts_applicable?: string[];
  };
  criminalCaseDetails?: {
    accused?: PartyInfo[];
    complainant?: PartyInfo[];
    fir_number?: string;
    police_station?: string;
    fir_date?: string;
    offense_details?: string;
    custody_status?: string;
    investigation_officer?: string;
  };
  
  // Dates
  firstHearingDate?: string;
  nextHearingDate?: string;
  lastHearingDate?: string;
  
  // Additional fields
  internalNotes?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  
  createdAt: string;
  updatedAt: string;
  
  documents?: CaseDocument[];
  
  // Client info from backend
  client?: {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    company?: string;
  };
}

export interface CaseDocument {
  id: string;
  caseId: number;
  documentType: string;
  originalFilename: string;
  storedFilename: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  fileExtension: string;
  description?: string;
  metadata?: Record<string, unknown>;
  uploadedByUserId: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateCaseRequest {
  case_type: CaseType;
  title: string;
  case_number: string;
  case_number_type?: string; // e.g., 'TRC', 'WP', 'CS'
  case_registration_date?: string | null;
  case_year: number;
  sub_type?: string;
  filing_date?: string | null;
  court_info: CourtInfo;
  party_info: {
    plaintiffs?: PartyInfo[];
    defendants?: PartyInfo[];
  };
  case_details: CaseDetails;
  important_dates: ImportantDates;
  additional_info: AdditionalInfo;
  current_status?: string; // e.g., 'Disposed', 'Pending'
  disposed_on_date?: string; // Format: YYYY-MM-DD
  final_order_summary?: string;
  client_id?: number;
}

export interface UpdateCaseRequest {
  title?: string;
  case_number?: string;
  case_number_type?: string;
  case_registration_date?: string | null;
  case_year?: number;
  sub_type?: string;
  filing_date?: string | null;
  court_info?: Partial<CourtInfo>;
  party_info?: {
    plaintiffs?: PartyInfo[];
    defendants?: PartyInfo[];
  };
  case_details?: Partial<CaseDetails>;
  important_dates?: Partial<ImportantDates>;
  additional_info?: Partial<AdditionalInfo>;
  current_status?: string;
  disposed_on_date?: string;
  final_order_summary?: string;
}

export interface CaseFilters {
  search?: string;
  caseType?: CaseType;
  caseStatus?: CaseStatus;
  casePriority?: CasePriority;
  clientId?: number;
  limit?: number;
  offset?: number;
}

export interface CasesResponse {
  success: boolean;
  data: Case[];
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface CaseResponse {
  success: boolean;
  data: Case;
}

export interface UpcomingHearing {
  id: number;
  caseNumber: string;
  caseTitle: string;
  caseType: CaseType;
  casePriority: CasePriority;
  nextHearingDate: string;
  courtName: string;
  courtHallNumber?: string;
  judgeName?: string;
  client?: {
    id: number;
    name: string;
    email?: string;
    phone?: string;
  };
}

export interface UpcomingHearingsResponse {
  success: boolean;
  data: UpcomingHearing[];
}

export interface DocumentUploadRequest {
  file: File;
  documentType: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface DashboardStats {
  total_cases: number;
  cases_by_status: {
    active: number;
    closed: number;
    archived: number;
  };
  cases_by_type: {
    civil: number;
    criminal: number;
  };
  cases_by_priority: {
    high: number;
    medium: number;
    low: number;
  };
  upcoming_hearings_count: number;
  cases_by_state: Array<{
    state: string;
    count: number;
  }>;
  recent_cases: Case[];
}

export interface DashboardStatsResponse {
  success: boolean;
  data: DashboardStats;
}

export interface CalendarHearing {
  id: string;
  case_id: number;
  case_number: string;
  case_title: string;
  case_type: CaseType;
  priority?: CasePriority; // From API response
  case_priority?: CasePriority; // Legacy support
  hearing_type: 'next_hearing' | 'first_hearing' | 'last_hearing';
  hearing_date: string;
  hearing_date_only?: string; // YYYY-MM-DD format
  status?: 'upcoming' | 'past';
  days_until?: number;
  days_ago?: number;
  court_name?: string;
  court_hall_number?: string;
  judge_name?: string;
  client?: {
    id: number;
    name: string;
    phone?: string;
  };
  outcome?: string;
  notes?: string;
}

export interface CalendarHearingsResponse {
  success: boolean;
  count: number;
  data: CalendarHearing[];
}

// Case Team Member Types
export interface CaseTeamMember {
  id: string; // UUID from backend
  caseId: number;
  userId: number;
  joinedAt: string;
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
  };
}

export interface GetCaseTeamMembersResponse {
  success: boolean;
  data: CaseTeamMember[];
}

export interface AddCaseTeamMemberRequest {
  userId: number;
}

export interface AddCaseTeamMemberResponse {
  success: boolean;
  data: CaseTeamMember;
}

export interface RemoveCaseTeamMemberResponse {
  success: boolean;
  message: string;
}

export interface GetCasesByOrgMemberResponse {
  success: boolean;
  data: Case[];
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

// Notes Types
export interface User {
  id: number;
  fullName: string;
  email: string;
}

export interface CaseInfo {
  id: number;
  caseNumber: string;
  caseTitle: string;
}

export interface Note {
  id: string;
  caseId: number;
  userId: number;
  date: string;
  content: string;
  user: User;
  case?: CaseInfo;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteRequest {
  content: string;
  date: string;
}

export interface UpdateNoteRequest {
  content: string;
  date?: string;
}

export interface NotesResponse {
  success: boolean;
  data: Note[];
}

export interface SingleNoteResponse {
  success: boolean;
  data: Note;
}

export interface NoteResponse {
  success: boolean;
  message: string;
  data: Note;
}

export interface DeleteNoteResponse {
  success: boolean;
  message: string;
}
