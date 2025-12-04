# Case Team Feature - Quick Reference Guide

## Files Modified/Created

### Core Types
- ✅ `src/types/case.types.ts` - Added 5 new interfaces for team management

### Services
- ✅ `src/services/case.service.ts` - Added 4 new API methods

### Components
- ✅ `src/components/CaseTeamModal.tsx` - NEW component for team management
- ✅ `src/components/CaseFormModal.tsx` - Updated to auto-assign creator

### Pages
- ✅ `src/pages/CasesPage.tsx` - Added admin detection and UI indicator
- ✅ `src/pages/CaseDetailPage.tsx` - Added team members section

---

## Feature Checklist

### ✅ 1. Admin can view all cases created by team members
- Admin sees a "Viewing all team member cases" indicator on CasesPage
- Uses `useAuthStore` to detect ADMIN role
- Backend filters cases based on organization context

### ✅ 2. Admin can add/delete/view members associated with a case
- New `CaseTeamModal` component handles all team management
- Add: Via dropdown selecting from unassigned org members
- Delete: With confirmation dialog
- View: Listed with details (name, email, phone, assignment date)

### ✅ 3. Any member/admin auto-assigned when creating a case
- Modified `CaseFormModal` to auto-assign creator
- Uses `useAuthStore` to get current user
- Happens immediately after case creation
- Error handling doesn't block case creation

### ✅ 4. Only assigned members can view cases
- Access control handled by backend API
- Frontend reflects this by showing cases in list
- Cannot access case detail if not assigned

---

## API Integration Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/cases/:caseId/team/members` | Fetch assigned team members |
| POST | `/cases/:caseId/team/members` | Add member to case |
| DELETE | `/cases/:caseId/team/members/:memberId` | Remove member from case |
| GET | `/cases/admin/member/:memberId` | Get cases by org member |
| GET | `/organizations/:organizationId/members` | Get available org members |

---

## Component Usage Examples

### Using CaseTeamModal in a component:
```tsx
import { CaseTeamModal } from '@/components/CaseTeamModal';

const [showTeamModal, setShowTeamModal] = useState(false);

// In render:
<CaseTeamModal
  isOpen={showTeamModal}
  onClose={() => setShowTeamModal(false)}
  caseId={caseData.id}
  onSuccess={fetchTeamMembers}
/>
```

### Checking if user is admin:
```tsx
import { useAuthStore } from '@/store/auth.store';

const { sessionContext } = useAuthStore();
const isAdmin = sessionContext?.roles?.includes('ADMIN') || 
                sessionContext?.roles?.includes('admin');
```

### Calling team member APIs:
```tsx
import { caseService } from '@/services/case.service';

// Get team members
const response = await caseService.getCaseTeamMembers(caseId);

// Add member
await caseService.addCaseTeamMember(caseId, { userId: 123 });

// Remove member
await caseService.removeCaseTeamMember(caseId, memberId);
```

---

## Key Design Decisions

1. **Auto-Assignment**: Creator automatically added as team member on creation
   - Ensures creator always has access to their own cases
   - Non-blocking on case creation

2. **Admin Detection**: Uses role from auth context
   - Supports both 'ADMIN' and 'admin' values
   - Used in CasesPage and CaseDetailPage for UI elements

3. **Modal-Based Management**: Dedicated modal for team management
   - Clean separation of concerns
   - Reusable across the app
   - Filters available members automatically

4. **Error Handling**: User-friendly messages with state management
   - Loading states prevent double submissions
   - Errors displayed in modal
   - Confirmation dialogs for destructive actions

---

## Testing Scenarios

### Test 1: Create Case as Member
1. Login as member
2. Create new case
3. Navigate to case details
4. Verify user is listed in Team Members section

### Test 2: Add Team Member (Admin)
1. Login as admin
2. Open existing case
3. Click "Manage" button
4. Select member and click "Add"
5. Verify member appears in list

### Test 3: Remove Team Member (Admin)
1. Login as admin
2. Open case with multiple members
3. Click "Remove" on a member
4. Confirm deletion
5. Verify member removed from list

### Test 4: View Cases (Member)
1. Login as member assigned to case
2. View case in list and details
3. Verify team members displayed
4. Verify no "Manage" button visible (member, not admin)

### Test 5: View Cases (Admin)
1. Login as admin
2. Go to Cases page
3. Verify "Viewing all team member cases" message
4. Open a case
5. Verify "Manage" button visible in Team Members section

---

## Notes

- All date formatting uses `toLocaleDateString()`
- Phone number is optional in CaseTeamMember display
- Assignment confirmation prevents accidental removals
- Available members list updates automatically
- Components handle loading and error states appropriately
