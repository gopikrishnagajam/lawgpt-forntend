# Case Management API Documentation

## Overview

The Case Management API allows lawyers to create, manage, and track legal cases (both civil and criminal) with support for document uploads, dashboard statistics, and calendar hearings. All endpoints require JWT authentication.

**Base URL:** `http://localhost:3000/api`

---

## Authentication

All case management endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

---

## Table of Contents

1. [Create Case](#1-create-case)
2. [List All Cases](#2-list-all-cases)
3. [Get Single Case](#3-get-single-case)
4. [Update Case](#4-update-case)
5. [Delete Case](#5-delete-case)
6. [Dashboard Statistics](#6-dashboard-statistics)
7. [Upcoming Hearings](#7-upcoming-hearings)
8. [Hearings Calendar](#8-hearings-calendar)

---

## 1. Create Case

**POST** `/api/cases`

Create a new case with structured format support.

### Headers
```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

### Request Body (Structured Format - Recommended)

#### Civil Case Example

```json
{
  "case_type": "CIVIL",
  "sub_type": "Suit for Recovery",
  "title": "ABC Pvt. Ltd. vs XYZ Enterprises",
  "filing_date": "2025-11-20",
  "case_year": 2025,
  "court_info": {
    "court_level": "District Court",
    "court_name": "Court of Civil Judge (Sr. Div.)",
    "state": "Karnataka",
    "district": "Bengaluru Urban",
    "court_complex": "City Civil Court Complex",
    "court_hall_number": "12",
    "judge_name": "Sri. Ramesh Kumar",
    "case_stage": "Filed"
  },
  "party_info": {
    "plaintiffs": [
      {
        "name": "ABC Pvt. Ltd.",
        "address": {
          "street": "No. 12, MG Road",
          "city": "Bengaluru",
          "state": "Karnataka",
          "postal_code": "560001"
        },
        "phone": "+91-9876543210",
        "email": "legal@abcpvtltd.in",
        "advocate_name": "Adv. S. Narayan"
      }
    ],
    "defendants": [
      {
        "name": "XYZ Enterprises",
        "address": {
          "street": "No. 45, Residency Road",
          "city": "Bengaluru"
        }
      }
    ]
  },
  "case_details": {
    "nature_of_suit": "Suit for recovery of money",
    "relief_sought": "Decree for recovery of INR 25,00,000",
    "claim_amount": 2500000,
    "brief_facts": "Plaintiff supplied goods...",
    "acts_applicable": ["CPC, 1908", "Contract Act, 1872"]
  },
  "assigned_client": {
    "client_id": 42,
    "client_type": "PLAINTIFF"
  },
  "important_dates": {
    "first_hearing_date": "2025-12-10",
    "next_hearing_date": "2025-12-10"
  },
  "additional_info": {
    "priority": "MEDIUM",
    "status": "ACTIVE",
    "tags": ["money_recovery", "corporate"]
  }
}
```

### Response (Success - 201 Created)

```json
{
  "success": true,
  "data": {
    "id": 123,
    "userId": 1,
    "clientId": 42,
    "caseNumber": "CIVIL/2025/1732614000000",
    "caseTitle": "ABC Pvt. Ltd. vs XYZ Enterprises",
    "caseType": "CIVIL",
    "caseSubType": "Suit for Recovery",
    "filingDate": "2025-11-20T00:00:00.000Z",
    "caseYear": 2025,
    "caseStage": "Filed",
    "caseStatus": "ACTIVE",
    "casePriority": "MEDIUM",
    "clientType": "PLAINTIFF",
    "courtLevel": "District Court",
    "courtName": "Court of Civil Judge (Sr. Div.)",
    "state": "Karnataka",
    "district": "Bengaluru Urban",
    "courtComplex": "City Civil Court Complex",
    "courtHallNumber": "12",
    "judgeName": "Sri. Ramesh Kumar",
    "civilCaseDetails": {...},
    "criminalCaseDetails": {},
    "firstHearingDate": "2025-12-10T00:00:00.000Z",
    "nextHearingDate": "2025-12-10T00:00:00.000Z",
    "tags": ["money_recovery", "corporate"],
    "createdAt": "2025-11-26T10:00:00.000Z",
    "updatedAt": "2025-11-26T10:00:00.000Z",
    "client": {
      "id": 42,
      "name": "ABC Pvt. Ltd.",
      "email": "contact@abcpvtltd.in",
      "phone": "+91-9876543210"
    }
  }
}
```

### Response (Error - 400)

```json
{
  "success": false,
  "error": {
    "message": "case_type must be either CIVIL or CRIMINAL",
    "statusCode": 400
  }
}
```

### cURL Example

```bash
curl -X POST http://localhost:3000/api/cases \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "case_type": "CIVIL",
    "title": "ABC vs XYZ",
    "court_info": {"state": "Karnataka"}
  }'
```

---

## 2. List All Cases

**GET** `/api/cases`

Get all cases for the authenticated user with filtering and pagination.

### Headers
```
Authorization: Bearer <your-jwt-token>
```

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `search` | string | No | - | Search in case number, title, court, judge |
| `caseType` | string | No | - | Filter: `CIVIL` or `CRIMINAL` |
| `caseStatus` | string | No | - | Filter: `ACTIVE`, `CLOSED`, `ARCHIVED` |
| `casePriority` | string | No | - | Filter: `HIGH`, `MEDIUM`, `LOW` |
| `clientId` | number | No | - | Filter by client ID |
| `limit` | number | No | 50 | Results per page |
| `offset` | number | No | 0 | Pagination offset |

### Request Examples

```bash
# Get all cases
GET /api/cases

# Get active civil cases
GET /api/cases?caseType=CIVIL&caseStatus=ACTIVE

# Search and paginate
GET /api/cases?search=ABC&limit=20&offset=0

# Filter by client
GET /api/cases?clientId=42&limit=10
```

### Response (Success - 200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "caseNumber": "CIVIL/2025/123",
      "caseTitle": "ABC vs XYZ",
      "caseType": "CIVIL",
      "caseStatus": "ACTIVE",
      "casePriority": "MEDIUM",
      "nextHearingDate": "2025-12-10T00:00:00.000Z",
      "courtName": "District Court",
      "state": "Karnataka",
      "district": "Bengaluru Urban",
      "createdAt": "2025-11-26T10:00:00.000Z",
      "client": {
        "id": 42,
        "name": "ABC Pvt. Ltd.",
        "email": "contact@abcpvtltd.in",
        "phone": "+91-9876543210"
      }
    },
    {
      "id": 124,
      "caseNumber": "CRIMINAL/2025/124",
      "caseTitle": "State vs John Doe",
      "caseType": "CRIMINAL",
      "caseStatus": "ACTIVE",
      "casePriority": "HIGH",
      "nextHearingDate": "2025-12-15T00:00:00.000Z",
      "client": {
        "id": 15,
        "name": "John Doe"
      }
    }
  ],
  "pagination": {
    "total": 45,
    "limit": 50,
    "offset": 0,
    "hasMore": false
  }
}
```

### cURL Example

```bash
curl -X GET "http://localhost:3000/api/cases?caseType=CIVIL&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 3. Get Single Case

**GET** `/api/cases/:id`

Get detailed information about a specific case.

### Headers
```
Authorization: Bearer <your-jwt-token>
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | Yes | Case ID |

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `includeDocuments` | boolean | No | false | Include document list |

### Request Examples

```bash
# Get case details
GET /api/cases/123

# Get case with documents
GET /api/cases/123?includeDocuments=true
```

### Response (Success - 200 OK)

```json
{
  "success": true,
  "data": {
    "id": 123,
    "userId": 1,
    "clientId": 42,
    "caseNumber": "CIVIL/2025/1732614000000",
    "caseTitle": "ABC Pvt. Ltd. vs XYZ Enterprises",
    "caseType": "CIVIL",
    "caseSubType": "Suit for Recovery",
    "filingDate": "2025-11-20T00:00:00.000Z",
    "caseYear": 2025,
    "caseStage": "Filed",
    "caseStatus": "ACTIVE",
    "casePriority": "MEDIUM",
    "clientType": "PLAINTIFF",
    "courtLevel": "District Court",
    "courtName": "Court of Civil Judge (Sr. Div.)",
    "state": "Karnataka",
    "district": "Bengaluru Urban",
    "courtComplex": "City Civil Court Complex",
    "courtHallNumber": "12",
    "judgeName": "Sri. Ramesh Kumar",
    "civilCaseDetails": {
      "plaintiffs": [
        {
          "name": "ABC Pvt. Ltd.",
          "address": {
            "street": "No. 12, MG Road",
            "city": "Bengaluru"
          }
        }
      ],
      "defendants": [],
      "nature_of_suit": "Suit for recovery of money",
      "relief_sought": "Decree for recovery",
      "claim_amount": 2500000
    },
    "criminalCaseDetails": {},
    "firstHearingDate": "2025-12-10T00:00:00.000Z",
    "nextHearingDate": "2025-12-10T00:00:00.000Z",
    "lastHearingDate": null,
    "internalNotes": "Client notes...",
    "tags": ["money_recovery", "corporate"],
    "metadata": {},
    "createdAt": "2025-11-26T10:00:00.000Z",
    "updatedAt": "2025-11-26T10:00:00.000Z",
    "client": {
      "id": 42,
      "name": "ABC Pvt. Ltd.",
      "email": "contact@abcpvtltd.in",
      "phone": "+91-9876543210",
      "company": "ABC Private Limited"
    },
    "documents": [
      {
        "id": "doc_abc123",
        "documentType": "PETITION",
        "originalFilename": "petition.pdf",
        "fileSize": 245678,
        "mimeType": "application/pdf",
        "description": "Initial petition",
        "createdAt": "2025-11-20T10:00:00.000Z"
      }
    ]
  }
}
```

### Response (Error - 404)

```json
{
  "success": false,
  "error": {
    "message": "Case not found",
    "statusCode": 404
  }
}
```

### cURL Example

```bash
curl -X GET "http://localhost:3000/api/cases/123?includeDocuments=true" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 4. Update Case

**PUT** `/api/cases/:id`

Update an existing case. Supports both structured and flat formats. Only provided fields will be updated.

### Headers
```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | Yes | Case ID |

### Request Body (Structured Format)

```json
{
  "court_info": {
    "judge_name": "Sri. New Judge Name",
    "case_stage": "Under Trial"
  },
  "important_dates": {
    "next_hearing_date": "2026-01-15"
  },
  "additional_info": {
    "priority": "HIGH",
    "internal_notes": "Updated after client meeting"
  }
}
```

### Request Body (Flat Format - Legacy)

```json
{
  "caseStage": "Under Trial",
  "nextHearingDate": "2026-01-15",
  "casePriority": "HIGH",
  "internalNotes": "Updated notes"
}
```

### Response (Success - 200 OK)

```json
{
  "success": true,
  "data": {
    "id": 123,
    "caseNumber": "CIVIL/2025/123",
    "caseTitle": "ABC vs XYZ",
    "caseStage": "Under Trial",
    "nextHearingDate": "2026-01-15T00:00:00.000Z",
    "casePriority": "HIGH",
    "updatedAt": "2025-11-26T15:30:00.000Z",
    "client": {}
  }
}
```

### Response (Error - 404)

```json
{
  "success": false,
  "error": {
    "message": "Case not found",
    "statusCode": 404
  }
}
```

### cURL Example

```bash
curl -X PUT http://localhost:3000/api/cases/123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "court_info": {
      "case_stage": "Under Trial"
    },
    "additional_info": {
      "priority": "HIGH"
    }
  }'
```

---

## 5. Delete Case

**DELETE** `/api/cases/:id`

Permanently delete a case and all its associated documents.

### Headers
```
Authorization: Bearer <your-jwt-token>
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | Yes | Case ID |

### Request Example

```bash
DELETE /api/cases/123
```

### Response (Success - 200 OK)

```json
{
  "success": true,
  "message": "Case deleted successfully"
}
```

### Response (Error - 404)

```json
{
  "success": false,
  "error": {
    "message": "Case not found",
    "statusCode": 404
  }
}
```

### cURL Example

```bash
curl -X DELETE http://localhost:3000/api/cases/123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 6. Dashboard Statistics

**GET** `/api/cases/stats/dashboard`

Get comprehensive statistics about all cases for dashboard widgets.

### Headers
```
Authorization: Bearer <your-jwt-token>
```

### Request Example

```bash
GET /api/cases/stats/dashboard
```

### Response (Success - 200 OK)

```json
{
  "success": true,
  "data": {
    "total_cases": 45,
    "cases_by_status": {
      "active": 32,
      "closed": 10,
      "archived": 3
    },
    "cases_by_type": {
      "civil": 28,
      "criminal": 17
    },
    "cases_by_priority": {
      "high": 8,
      "medium": 18,
      "low": 6
    },
    "upcoming_hearings_count": 12,
    "cases_by_state": [
      {
        "state": "Karnataka",
        "count": 15
      },
      {
        "state": "Maharashtra",
        "count": 12
      },
      {
        "state": "Delhi",
        "count": 8
      }
    ],
    "recent_cases": [
      {
        "id": 123,
        "caseNumber": "CIVIL/2025/123",
        "caseTitle": "ABC vs XYZ",
        "caseType": "CIVIL",
        "caseStatus": "ACTIVE",
        "createdAt": "2025-11-26T10:00:00.000Z"
      },
      {
        "id": 122,
        "caseNumber": "CRIMINAL/2025/122",
        "caseTitle": "State vs John",
        "caseType": "CRIMINAL",
        "caseStatus": "ACTIVE",
        "createdAt": "2025-11-25T14:30:00.000Z"
      }
    ]
  }
}
```

### Frontend Usage Example (React)

```javascript
const DashboardStats = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch('/api/cases/stats/dashboard', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => res.json())
    .then(data => setStats(data.data));
  }, []);

  return (
    <div>
      <Card title="Total Cases" value={stats?.total_cases} />
      <Card title="Active" value={stats?.cases_by_status.active} />
      <PieChart data={stats?.cases_by_type} />
    </div>
  );
};
```

### cURL Example

```bash
curl -X GET http://localhost:3000/api/cases/stats/dashboard \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 7. Upcoming Hearings

**GET** `/api/cases/hearings/upcoming`

Get cases with hearings in the next N days.

### Headers
```
Authorization: Bearer <your-jwt-token>
```

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `days` | number | No | 7 | Days to look ahead |

### Request Examples

```bash
# Get hearings for next 7 days
GET /api/cases/hearings/upcoming

# Get hearings for next 30 days
GET /api/cases/hearings/upcoming?days=30
```

### Response (Success - 200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "caseNumber": "CIVIL/2025/123",
      "caseTitle": "ABC vs XYZ",
      "caseType": "CIVIL",
      "casePriority": "MEDIUM",
      "nextHearingDate": "2025-12-10T00:00:00.000Z",
      "courtName": "District Court",
      "courtHallNumber": "12",
      "judgeName": "Sri. Ramesh Kumar",
      "client": {
        "id": 42,
        "name": "ABC Pvt. Ltd.",
        "email": "contact@abcpvtltd.in",
        "phone": "+91-9876543210"
      }
    },
    {
      "id": 124,
      "caseNumber": "CRIMINAL/2025/124",
      "caseTitle": "State vs John Doe",
      "caseType": "CRIMINAL",
      "casePriority": "HIGH",
      "nextHearingDate": "2025-12-15T00:00:00.000Z",
      "courtName": "Sessions Court",
      "client": {
        "id": 15,
        "name": "John Doe"
      }
    }
  ]
}
```

### cURL Example

```bash
curl -X GET "http://localhost:3000/api/cases/hearings/upcoming?days=14" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 8. Hearings Calendar

**GET** `/api/cases/hearings/calendar`

Get all hearings within a date range for calendar view.

### Headers
```
Authorization: Bearer <your-jwt-token>
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `startDate` | string | **Yes** | Start date (YYYY-MM-DD) |
| `endDate` | string | **Yes** | End date (YYYY-MM-DD) |

### Request Examples

```bash
# Get hearings for November 2025
GET /api/cases/hearings/calendar?startDate=2025-11-01&endDate=2025-11-30

# Get hearings for next 3 months
GET /api/cases/hearings/calendar?startDate=2025-11-26&endDate=2026-02-26
```

### Response (Success - 200 OK)

```json
{
  "success": true,
  "count": 8,
  "data": [
    {
      "id": "123-next",
      "case_id": 123,
      "case_number": "CIVIL/2025/123",
      "case_title": "ABC vs XYZ",
      "case_type": "CIVIL",
      "case_priority": "MEDIUM",
      "hearing_type": "next_hearing",
      "hearing_date": "2025-12-10T00:00:00.000Z",
      "court_name": "District Court",
      "court_hall_number": "12",
      "judge_name": "Sri. Ramesh Kumar",
      "client": {
        "id": 42,
        "name": "ABC Pvt. Ltd.",
        "phone": "+91-9876543210"
      }
    },
    {
      "id": "124-next",
      "case_id": 124,
      "case_number": "CRIMINAL/2025/124",
      "case_title": "State vs John Doe",
      "case_type": "CRIMINAL",
      "case_priority": "HIGH",
      "hearing_type": "next_hearing",
      "hearing_date": "2025-12-15T00:00:00.000Z",
      "court_name": "Sessions Court",
      "court_hall_number": "5",
      "judge_name": "Hon. Justice Patel",
      "client": {
        "id": 15,
        "name": "John Doe",
        "phone": "+91-9876543210"
      }
    }
  ]
}
```

### Response (Error - 400)

```json
{
  "success": false,
  "error": {
    "message": "Start date and end date are required",
    "statusCode": 400
  }
}
```

### Frontend Usage Example (FullCalendar)

```javascript
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';

const HearingsCalendar = () => {
  const [events, setEvents] = useState([]);

  const fetchHearings = async (startDate, endDate) => {
    const response = await fetch(
      `/api/cases/hearings/calendar?startDate=${startDate}&endDate=${endDate}`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    const data = await response.json();
    
    const calendarEvents = data.data.map(hearing => ({
      id: hearing.id,
      title: hearing.case_title,
      start: hearing.hearing_date,
      backgroundColor: hearing.case_priority === 'HIGH' ? '#e74c3c' : '#3788d8',
      extendedProps: {
        caseId: hearing.case_id,
        caseNumber: hearing.case_number,
        courtName: hearing.court_name
      }
    }));
    
    setEvents(calendarEvents);
  };

  return (
    <FullCalendar
      plugins={[dayGridPlugin]}
      initialView="dayGridMonth"
      events={events}
      datesSet={(info) => {
        const start = info.startStr.split('T')[0];
        const end = info.endStr.split('T')[0];
        fetchHearings(start, end);
      }}
    />
  );
};
```

### cURL Example

```bash
curl -X GET "http://localhost:3000/api/cases/hearings/calendar?startDate=2025-11-01&endDate=2025-11-30" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Error Responses

All endpoints may return the following error responses:

### 401 Unauthorized

```json
{
  "success": false,
  "error": {
    "message": "Authentication required",
    "statusCode": 401
  }
}
```

### 403 Forbidden

```json
{
  "success": false,
  "error": {
    "message": "Access denied",
    "statusCode": 403
  }
}
```

### 404 Not Found

```json
{
  "success": false,
  "error": {
    "message": "Case not found",
    "statusCode": 404
  }
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "error": {
    "message": "Internal server error",
    "statusCode": 500
  }
}
```

---

## Notes

- All dates are in ISO 8601 format (UTC)
- Case numbers are auto-generated if not provided
- The API supports both structured (recommended) and legacy flat formats
- Documents are cascade deleted when a case is deleted
- Client relationships are optional but recommended
- All responses include `success` boolean flag
