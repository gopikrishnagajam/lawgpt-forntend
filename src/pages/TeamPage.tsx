import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/auth.store';
import { organizationService } from '../services/organization.service';
import type { OrganizationMember, Invitation } from '../types/organization.types';
import { Users, Mail, UserPlus, Shield, User, Loader2, AlertCircle, CheckCircle2, X } from 'lucide-react';

export const TeamPage = () => {
  const { sessionContext } = useAuthStore();
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [memberCount, setMemberCount] = useState(0);
  const [memberLimit, setMemberLimit] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmails, setInviteEmails] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState<string>('');

  const isAdmin = sessionContext?.roles.includes('admin');
  const organizationId = sessionContext?.organizationId ? Number(sessionContext.organizationId) : null;

  useEffect(() => {
    if (isAdmin && organizationId) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, organizationId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError('');

      const [membersData, invitationsData] = await Promise.all([
        organizationService.getMembers(organizationId!),
        organizationService.getPendingInvitations(organizationId!),
      ]);

      setMembers(membersData.members);
      setMemberCount(membersData.memberCount);
      setMemberLimit(membersData.memberLimit);
      setInvitations(invitationsData.invitations);
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Failed to load team data';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendInvitations = async () => {
    try {
      setInviteLoading(true);
      setError('');
      setInviteSuccess('');

      const emails = inviteEmails
        .split(',')
        .map(e => e.trim())
        .filter(Boolean);

      if (emails.length === 0) {
        setError('Please enter at least one email address');
        return;
      }

      const response = await organizationService.sendInvitations(organizationId!, { emails });
      setInviteSuccess(response.message);
      setInviteEmails('');
      setShowInviteModal(false);
      
      // Reload data
      await loadData();
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Failed to send invitations';
      setError(errorMessage);
    } finally {
      setInviteLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Access Required</h2>
        <p className="text-gray-600">You need admin privileges to access team management.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-600 mt-1">
            {memberCount} of {memberLimit} members
          </p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md"
        >
          <UserPlus className="w-4 h-4" />
          Invite Members
        </button>
      </div>

      {/* Success Message */}
      {inviteSuccess && (
        <div className="flex items-center gap-2 p-4 bg-green-50 text-green-800 rounded-lg border border-green-200">
          <CheckCircle2 className="w-5 h-5" />
          <span>{inviteSuccess}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 text-red-800 rounded-lg border border-red-200">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Members List */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Team Members</h2>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {members.map((member) => (
            <div key={member.userId} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  member.role === 'admin' 
                    ? 'bg-gradient-to-br from-purple-500 to-indigo-600' 
                    : 'bg-gradient-to-br from-blue-500 to-cyan-500'
                }`}>
                  {member.role === 'admin' ? (
                    <Shield className="w-6 h-6 text-white" />
                  ) : (
                    <User className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {member.firstName} {member.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">{member.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  member.role === 'admin'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {member.role.toUpperCase()}
                </span>
                <span className="text-sm text-gray-500">
                  Joined {new Date(member.joinedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <div className="bg-white rounded-xl shadow-md border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">Pending Invitations</h2>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {invitations.map((invitation) => (
              <div key={invitation.invitationId} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{invitation.email}</h3>
                    <p className="text-sm text-gray-600">Invitation sent</p>
                  </div>
                </div>
                <span className="px-3 py-1 text-xs font-semibold bg-yellow-100 text-yellow-700 rounded-full">
                  PENDING
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Invite Team Members</h2>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Addresses
              </label>
              <textarea
                value={inviteEmails}
                onChange={(e) => setInviteEmails(e.target.value)}
                placeholder="member1@example.com, member2@example.com"
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-2 text-sm text-gray-500">
                Enter email addresses separated by commas. Available slots: {memberLimit - memberCount}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowInviteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendInvitations}
                disabled={inviteLoading}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {inviteLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Invitations'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
