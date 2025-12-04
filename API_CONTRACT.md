# API Contract - Case Team Member Management

## Base URL
```
http://localhost:3000/api
```

---

## Endpoints

### 1. Get Team Members Assigned to a Case

**Endpoint:**
```
GET /cases/:caseId/team/members
```

**Authorization:**
```
Header: Authorization: Bearer <accessToken>
```

**Path Parameters:**
```
caseId: number (required) - The case ID
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "userId": 2,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+1-555-0123",
      "assignedAt": "2025-01-15T10:30:00Z"
    },
    {
      "id": 2,
      "userId": 3,
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane@example.com",
      "phone": "+1-555-0124",
      "assignedAt": "2025-01-16T14:22:00Z"
    }
  ]
}
```

**Error Response (401/403/404):**
```json
{
  "success": false,
  "error": "Case not found or unauthorized"
}
```

---

### 2. Add Member to Case Team

**Endpoint:**
```
POST /cases/:caseId/team/members
```

**Authorization:**
```
Header: Authorization: Bearer <accessToken>
```

**Path Parameters:**
```
caseId: number (required) - The case ID
```

**Request Body:**
```json
{
  "userId": 2
}
```

**Success Response (200/201):**
```json
{
  "success": true,
  "data": {
    "id": 3,
    "userId": 2,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1-555-0123",
    "assignedAt": "2025-01-17T09:15:00Z"
  }
}
```

**Error Response (400/401/403/404):**
```json
{
  "success": false,
  "error": "User already assigned to this case"
}
```

**Possible Error Messages:**
- "User already assigned to this case"
- "User not found"
- "Case not found"
- "Unauthorized to manage case team"

---

### 3. Remove Member from Case

**Endpoint:**
```
DELETE /cases/:caseId/team/members/:memberId
```

**Authorization:**
```
Header: Authorization: Bearer <accessToken>
```

**Path Parameters:**
```
caseId: number (required) - The case ID
memberId: number (required) - The member user ID to remove
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Member removed from case successfully"
}
```

**Error Response (401/403/404):**
```json
{
  "success": false,
  "error": "Member not found in case team"
}
```

**Example cURL:**
```bash
curl -X DELETE http://localhost:3000/api/cases/3/team/members/7 \
  -H "Authorization: Bearer <token>"
```

---

### 4. Get Organization Members

**Endpoint:**
```
GET /organizations/:organizationId/members
```

**Authorization:**
```
Header: Authorization: Bearer <accessToken>
```

**Path Parameters:**
```
organizationId: number (required) - The organization ID
```

**Success Response (200):**
```json
{
  "organizationId": 1,
  "memberCount": 5,
  "memberLimit": 10,
  "members": [
    {
      "userId": 1,
      "email": "admin@example.com",
      "firstName": "Admin",
      "lastName": "User",
      "role": "admin",
      "joinedAt": "2025-01-01T10:00:00Z"
    },
    {
      "userId": 2,
      "email": "member1@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "member",
      "joinedAt": "2025-01-05T14:30:00Z"
    }
  ]
}
```

---

### 5. Get Cases by Organization Member (Admin Only)

**Endpoint:**
```
GET /cases/admin/member/:memberId
```

**Authorization:**
```
Header: Authorization: Bearer <accessToken> (Admin token required)
```

**Path Parameters:**
```
memberId: number (required) - The organization member ID
```

**Query Parameters:**
```
?organizationId=1&limit=50&offset=0&search=&caseType=&caseStatus=&casePriority=
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "userId": 2,
      "caseNumber": "CASE-2025-001",
      "caseTitle": "Smith v. Jones",
      "caseType": "CIVIL",
      "caseStatus": "ACTIVE",
      "casePriority": "HIGH",
      "filingDate": "2025-01-01T00:00:00Z",
      "nextHearingDate": "2025-02-15T09:00:00Z",
      "courtName": "District Court",
      "createdAt": "2025-01-05T10:30:00Z",
      "updatedAt": "2025-01-15T14:22:00Z"
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 50,
    "offset": 0,
    "hasMore": false
  }
}
```

---

## Status Codes

| Code | Meaning | Common Scenarios |
|------|---------|------------------|
| 200 | Success | GET, DELETE successful |
| 201 | Created | POST successful (member added) |
| 400 | Bad Request | Missing/invalid userId, member already assigned |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | User not admin, trying to manage other's case |
| 404 | Not Found | Case, member, or user not found |
| 500 | Server Error | Database error |

---

## Authorization Rules

### Adding Member to Case
- ✅ Admin of organization
- ✅ Case creator (in some implementations)
- ❌ Regular member
- ❌ Member not in organization

### Removing Member from Case
- ✅ Admin of organization
- ✅ Case creator (in some implementations)
- ❌ Regular member
- ❌ Self-removal

### Getting Team Members
- ✅ All organization members
- ✅ Case team members
- ❌ Non-members (backend filters)

### Getting Member Cases
- ✅ Admin viewing another member's cases
- ✅ User viewing own cases
- ❌ Member viewing other member's cases (without admin)

---

## Request/Response Examples

### Example 1: Add Member via Frontend
```typescript
const response = await caseService.addCaseTeamMember(3, { userId: 7 });
// Makes POST request:
// POST /cases/3/team/members
// Body: { "userId": 7 }
// Response: { success: true, data: { id: 10, userId: 7, ... } }
```

### Example 2: Get Team Members via Frontend
```typescript
const response = await caseService.getCaseTeamMembers(3);
// Makes GET request:
// GET /cases/3/team/members
// Response: { success: true, data: [ { id: 1, userId: 2, ... }, ... ] }
```

### Example 3: Remove Member via Frontend
```typescript
const response = await caseService.removeCaseTeamMember(3, 7);
// Makes DELETE request:
// DELETE /cases/3/team/members/7
// Response: { success: true, message: "..." }
```

### Example 4: Get Organization Members via Frontend
```typescript
const response = await organizationService.getMembers(1);
// Makes GET request:
// GET /organizations/1/members
// Response: { organizationId: 1, memberCount: 5, members: [...] }
```

---

## Error Handling

### Typical Error Response Format
```json
{
  "success": false,
  "error": "User already assigned to this case"
}
```

### Common Error Messages
1. **"User already assigned to this case"** - When adding duplicate member
2. **"User not found"** - Invalid userId
3. **"Case not found"** - Invalid caseId
4. **"Unauthorized to manage case team"** - Non-admin trying to manage
5. **"Member not found in case team"** - Removing non-existent member
6. **"Invalid token"** - Missing or expired authorization

---

## Rate Limiting

Assuming standard API rate limits:
- No specific rate limiting mentioned
- Implement on frontend to prevent rapid clicks
- Use loading states to prevent double-submission

---

## Notes for Frontend Implementation

1. **Always include Authorization header** with valid Bearer token
2. **Handle all error scenarios** with user-friendly messages
3. **Use loading states** to prevent duplicate requests
4. **Add confirmation dialogs** for destructive operations (delete)
5. **Filter organization members** to exclude already-assigned ones
6. **Refresh data** after successful operations
7. **Log all errors** for debugging
8. **Convert userId to number** if coming from string
9. **Format dates** appropriately for UI display
10. **Handle empty lists gracefully** with appropriate messages

---

## Testing Curl Commands

```bash
# Get team members
curl -X GET http://localhost:3000/api/cases/3/team/members \
  -H "Authorization: Bearer YOUR_TOKEN"

# Add member
curl -X POST http://localhost:3000/api/cases/3/team/members \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userId": 7}'

# Remove member
curl -X DELETE http://localhost:3000/api/cases/3/team/members/7 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get org members
curl -X GET http://localhost:3000/api/organizations/1/members \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get member's cases
curl -X GET http://localhost:3000/api/cases/admin/member/4 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Frontend Service Integration

All methods are available via `caseService`:
- `caseService.getCaseTeamMembers(caseId)`
- `caseService.addCaseTeamMember(caseId, request)`
- `caseService.removeCaseTeamMember(caseId, memberId)`
- `caseService.getCasesByOrgMember(orgId, memberId, filters)`

And `organizationService`:
- `organizationService.getMembers(organizationId)`

See implementation files for complete type safety and error handling.
