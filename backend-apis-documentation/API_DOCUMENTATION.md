# LawGBT API Documentation

## Authentication
All endpoints require a Bearer token in the Authorization header.
```
Authorization: Bearer <token>
```

## Cases

### List Cases
- `GET /api/cases` - List cases (admin sees all org cases, members see only assigned)
- Query params: `limit`, `offset`, `search`, `caseType`, `caseStatus`, `casePriority`

### Create Case
- `POST /api/cases` - Create new case (user auto-assigned to it)
- Body: `{ case_type, title, case_number, case_number_type, case_registration_date, case_year, sub_type, filing_date, court_info, party_info, case_details, important_dates, additional_info, current_status, disposed_on_date, final_order_summary, client_id }`

### Get Case
- `GET /api/cases/:id` - Get case details (admin sees all org cases, members see only if assigned)

### Update Case 
- `PUT /api/cases/:id` - Update case
- Body: any case fields

### Delete Case
- `DELETE /api/cases/:id` - Delete case

### Admin Routes
- `GET /api/cases/admin/all` - Get all org cases (redundant, use GET /api/cases)
- `GET /api/cases/admin/member/:memberId` - Get cases assigned to specific member (admin only)

### Case Statistics
- `GET /api/cases/stats/dashboard` - Dashboard statistics

### Hearings / Calendar
- `GET /api/cases/hearings/calendar-month?month=YYYY-MM` - Get hearings for a month in calendar grid format (returns count and hearing summaries per day)
- `GET /api/cases/hearings/day?date=YYYY-MM-DD` - Get detailed hearings for a specific date (day view)
- `GET /api/cases/hearings/upcoming?days=N` - Get upcoming hearings for the next N days (optional `days`, default 7)
- `GET /api/cases/hearings/calendar?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` - Get hearings between two dates (range)

## Case Team

### List Team Members
- `GET /api/cases/:caseId/team/members` - Get case team members (admin only)

### Add Team Member
- `POST /api/cases/:caseId/team/members` - Add member to case (admin only)
- Body: `{ userId }`

### Remove Team Member
- `DELETE /api/cases/:caseId/team/members/:memberId` - Remove member from case (admin only)

## Documents

### Upload Document
- `POST /api/cases/:caseId/documents` - Upload document for case
- Form: multipart/form-data with `file` + optional `documentType`, `description`, `metadata`
- Requires: user assigned to case

### List Documents
- `GET /api/cases/:caseId/documents` - List case documents
- Query params: `limit`, `offset`
- Requires: user assigned to case

### Download Document
- `GET /api/documents/:id/download` - Download document file
- Requires: user assigned to case

### Update Document
- `PUT /api/documents/:id` - Update document metadata
- Body: `{ documentType, description, metadata }`
- Requires: user assigned to case

### Delete Document
- `DELETE /api/documents/:id` - Delete document
- Requires: user assigned to case

## Clients

### List Clients
- `GET /api/clients` - List organization clients

### Create Client
- `POST /api/clients` - Create new client
- Body: `{ name, email, phone, address, city, state, zipCode, country }`

### Get Client
- `GET /api/clients/:id` - Get client details

### Update Client
- `PUT /api/clients/:id` - Update client

### Delete Client
- `DELETE /api/clients/:id` - Delete client

## Authentication

### Register
- `POST /api/auth/register` - Register new user
- Body: `{ firstName, lastName, email, password }`

### Login
- `POST /api/auth/login` - Login user
- Body: `{ email, password }`
- Returns: `{ token, user }`

### Logout
- `POST /api/auth/logout` - Logout user

### Get Current User
- `GET /api/auth/me` - Get current authenticated user

## Invitations

### Send Invitation
- `POST /api/invitations` - Invite user to organization
- Body: `{ email, role }`
- Requires: admin

### List Invitations
- `GET /api/invitations` - List pending invitations

### Accept Invitation
- `POST /api/invitations/:id/accept` - Accept organization invitation

### Reject Invitation
- `DELETE /api/invitations/:id` - Reject invitation

## Access Control

- **Admin**: 
  - Can view ALL cases in organization
  - Can manage team members on any case
  - Can invite users, create clients
  - Bypass all team assignment restrictions
  
- **Member**: 
  - Can only view cases they're assigned to via CaseTeam
  - Can only manage their own profile
  - Cannot manage team members
  
- **Document Access**: 
  - Any team member assigned to a case can upload, download, update, delete documents
  - Admins can access documents on any case in organization

## Response Format

All responses follow this format:
```json
{
  "success": true/false,
  "data": { ... },
  "message": "error message if applicable",
  "pagination": { "total", "limit", "offset", "hasMore" }
}
```
