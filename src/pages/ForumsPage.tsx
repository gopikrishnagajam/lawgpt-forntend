import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { forumService } from '@/services/forum.service';
import { MessageSquare, Plus, Users, Scale, Trash2, Settings } from 'lucide-react';
import type { Forum } from '@/types/forum.types';
import { CreateForumModal } from '@/components/CreateForumModal';

export const ForumsPage = () => {
  const navigate = useNavigate();
  const { user, sessionContext } = useAuthStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedForum, setSelectedForum] = useState<Forum | null>(null);

  const isAdmin = sessionContext?.roles.includes('admin');
  const loginType = sessionContext?.loginType;

  // Fetch forums
  const { data: forumsData, isLoading, refetch } = useQuery({
    queryKey: ['forums'],
    queryFn: () => forumService.getForums(),
  });

  const forums = forumsData?.data || [];

  const handleCreateForum = () => {
    setIsCreateModalOpen(true);
  };

  const handleForumCreated = () => {
    refetch();
    setIsCreateModalOpen(false);
  };

  const handleDeleteForum = async (forumId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this forum? This action cannot be undone.')) {
      return;
    }

    try {
      await forumService.deleteForum(forumId);
      refetch();
    } catch (error) {
      console.error('Failed to delete forum:', error);
      alert('Failed to delete forum');
    }
  };

  const canManageForum = (forum: Forum) => {
    if (forum.type === 'organizational') {
      return isAdmin && sessionContext?.organizationId === forum.organizationId;
    }
    return forum.createdByUserId === Number(user?.id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Forums
          </h1>
          <p className="text-gray-600 mt-1">
            {loginType === 'individual'
              ? 'Discuss legal topics and get advice from the community'
              : 'Collaborate with your team members'}
          </p>
        </div>
        <button
          onClick={handleCreateForum}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Create Forum
        </button>
      </div>

      {/* Forums Grid */}
      {forums.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No forums yet</h3>
          <p className="text-gray-600 mb-6">
            Create your first forum to start discussions
          </p>
          <button
            onClick={handleCreateForum}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            Create Forum
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forums.map((forum) => (
            <div
              key={forum.id}
              onClick={() => navigate(`/forums/${forum.id}/threads`)}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer border border-gray-200 hover:border-blue-300 overflow-hidden group"
            >
              <div className="p-6">
                {/* Forum Type Badge */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {forum.type === 'organizational' ? (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 rounded-full text-xs font-semibold">
                        <Users className="w-3.5 h-3.5" />
                        Team
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 rounded-full text-xs font-semibold">
                        <Scale className="w-3.5 h-3.5" />
                        Legal Advice
                      </div>
                    )}
                  </div>

                  {/* Management Actions */}
                  {canManageForum(forum) && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/forums/${forum.id}/settings`);
                        }}
                        className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Forum Settings"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteForum(forum.id, e)}
                        className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete Forum"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Forum Name */}
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {forum.name}
                </h3>

                {/* Description */}
                {forum.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {forum.description}
                  </p>
                )}

                {/* Organization Info */}
                {forum.organization && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                    <Users className="w-3.5 h-3.5" />
                    {forum.organization.name}
                  </div>
                )}

                {/* Creator Info */}
                {forum.creator && (
                  <div className="text-xs text-gray-500">
                    Created by {forum.creator.firstName} {forum.creator.lastName}
                  </div>
                )}

                {/* Footer */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      <span>Discussions</span>
                    </div>
                  </div>
                  <div className="text-xs">
                    {new Date(forum.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Forum Modal */}
      <CreateForumModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleForumCreated}
      />
    </div>
  );
};
