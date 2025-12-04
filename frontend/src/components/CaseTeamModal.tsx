import { useEffect, useState } from 'react';
import { caseService } from '@/services/case.service';
import { organizationService } from '@/services/organization.service';
import { useAuthStore } from '@/store/auth.store';
import type { CaseTeamMember } from '@/types/case.types';
import type { OrganizationMember } from '@/types/organization.types';

interface CaseTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: number;
  onSuccess?: () => void;
}

export const CaseTeamModal = ({ isOpen, onClose, caseId, onSuccess }: CaseTeamModalProps) => {
  const { sessionContext } = useAuthStore();
  const [teamMembers, setTeamMembers] = useState<CaseTeamMember[]>([]);
  const [organizationMembers, setOrganizationMembers] = useState<OrganizationMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isRemoving, setIsRemoving] = useState<number | null>(null);

  const organizationId = sessionContext?.organizationId
    ? parseInt(sessionContext.organizationId as string)
    : null;

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const response = await caseService.getCaseTeamMembers(caseId);
      setTeamMembers(response.data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to fetch team members');
      console.error('Error fetching team members:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizationMembers = async () => {
    if (!organizationId) return;

    try {
      const response = await organizationService.getMembers(organizationId);
      setOrganizationMembers(response.members);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      console.error('Error fetching organization members:', error.response?.data?.message || err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTeamMembers();
      fetchOrganizationMembers();
    }
  }, [isOpen]);

  const handleAddMember = async () => {
    if (!selectedUserId) return;

    try {
      setIsAdding(true);
      setError(null);
      await caseService.addCaseTeamMember(caseId, { userId: selectedUserId });
      setSelectedUserId(null);
      await fetchTeamMembers();
      onSuccess?.();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to add team member');
      console.error('Error adding team member:', err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    if (!confirm('Are you sure you want to remove this team member from the case?')) {
      return;
    }

    try {
      setIsRemoving(memberId);
      setError(null);
      await caseService.removeCaseTeamMember(caseId, memberId);
      await fetchTeamMembers();
      onSuccess?.();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to remove team member');
      console.error('Error removing team member:', err);
    } finally {
      setIsRemoving(null);
    }
  };

  // Get available members (organization members not already in case team)
  const assignedUserIds = new Set(teamMembers.map((m) => m.userId));
  const availableMembers = organizationMembers.filter(
    (member) => !assignedUserIds.has(member.userId)
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Manage Case Team</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Add Member Section */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Add Team Member</h4>
            <div className="flex gap-2">
              <select
                value={selectedUserId || ''}
                onChange={(e) => setSelectedUserId(e.target.value ? parseInt(e.target.value) : null)}
                disabled={isAdding || availableMembers.length === 0}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">
                  {availableMembers.length === 0
                    ? 'All members already added'
                    : 'Select a member to add'}
                </option>
                {availableMembers.map((member) => (
                  <option key={member.userId} value={member.userId}>
                    {member.firstName} {member.lastName} ({member.email})
                  </option>
                ))}
              </select>
              <button
                onClick={handleAddMember}
                disabled={!selectedUserId || isAdding}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isAdding ? 'Adding...' : 'Add'}
              </button>
            </div>
          </div>

          {/* Current Team Members */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Current Team Members</h4>
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600 text-sm">Loading team members...</p>
              </div>
            ) : teamMembers.length === 0 ? (
              <p className="text-gray-500 text-sm py-4">No team members assigned yet</p>
            ) : (
              <div className="space-y-2">
                {teamMembers.map((member) => (
                  <div
                    key={member.userId}
                    className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {member.user.firstName} {member.user.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{member.user.email}</p>
                      {member.user.phone && (
                        <p className="text-xs text-gray-500">{member.user.phone}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        Assigned: {new Date(member.joinedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveMember(member.userId)}
                      disabled={isRemoving === member.userId}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isRemoving === member.userId ? 'Removing...' : 'Remove'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
