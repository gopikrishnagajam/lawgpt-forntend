import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { forumService } from '@/services/forum.service';
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Pin,
  Lock,
  MessageSquare,
  Eye,
  Settings,
} from 'lucide-react';
import { CreateThreadModal } from '@/components/CreateThreadModal';
import { CategoryManagementModal } from '@/components/CategoryManagementModal';

export const ForumThreadsPage = () => {
  const { forumId } = useParams<{ forumId: string }>();
  const navigate = useNavigate();
  const { user, sessionContext } = useAuthStore();

  const [isCreateThreadModalOpen, setIsCreateThreadModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);

  const isAdmin = sessionContext?.roles.includes('admin');
  const userId = Number(user?.id);

  // Fetch forum details
  const { data: forumData } = useQuery({
    queryKey: ['forum', forumId],
    queryFn: () => forumService.getForumById(Number(forumId)),
    enabled: !!forumId,
  });

  const forum = forumData?.data;

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories', forumId],
    queryFn: () => forumService.getCategories(Number(forumId)),
    enabled: !!forumId,
  });

  const categories = categoriesData?.data || [];

  // Fetch threads
  const {
    data: threadsData,
    isLoading: isLoadingThreads,
    refetch: refetchThreads,
  } = useQuery({
    queryKey: ['threads', forumId, selectedCategory, searchQuery, showPinnedOnly],
    queryFn: () =>
      forumService.getThreads(Number(forumId), {
        categoryId: selectedCategory,
        search: searchQuery || undefined,
        isPinned: showPinnedOnly || undefined,
        limit: 50,
        offset: 0,
      }),
    enabled: !!forumId,
  });

  const threads = threadsData?.data || [];

  const handleThreadCreated = () => {
    refetchThreads();
    setIsCreateThreadModalOpen(false);
  };

  const handleCategoriesUpdated = () => {
    refetchThreads();
  };

  const canManageCategories = () => {
    if (!forum) return false;
    if (forum.type === 'organizational') {
      return isAdmin && sessionContext?.organizationId === forum.organizationId;
    }
    return forum.createdByUserId === userId;
  };

  if (!forumId) {
    return <div>Forum not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/forums')}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {forum?.name || 'Forum'}
            </h1>
            {forum?.description && (
              <p className="text-gray-600 mt-1">{forum.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {canManageCategories() && (
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Manage Categories
            </button>
          )}
          <button
            onClick={() => setIsCreateThreadModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Plus className="w-5 h-5" />
            New Thread
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search threads..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : undefined)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Pinned Filter */}
          <button
            onClick={() => setShowPinnedOnly(!showPinnedOnly)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              showPinnedOnly
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Pin className="w-4 h-4" />
            Pinned Only
          </button>
        </div>
      </div>

      {/* Threads List */}
      {isLoadingThreads ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : threads.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No threads yet</h3>
          <p className="text-gray-600 mb-6">
            Be the first to start a discussion in this forum
          </p>
          <button
            onClick={() => setIsCreateThreadModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            Create Thread
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md divide-y divide-gray-200">
          {threads.map((thread) => (
            <div
              key={thread.id}
              onClick={() => navigate(`/forums/${forumId}/threads/${thread.id}`)}
              className="p-6 hover:bg-gray-50 transition-colors cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Thread Title with Badges */}
                  <div className="flex items-center gap-2 mb-2">
                    {thread.isPinned && (
                      <Pin className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    )}
                    {thread.isClosed && (
                      <Lock className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    )}
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                      {thread.title}
                    </h3>
                  </div>

                  {/* Thread Content Preview */}
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {thread.content}
                  </p>

                  {/* Thread Meta */}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {thread.category && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                        {thread.category.name}
                      </span>
                    )}
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {thread.viewCount} views
                    </div>
                    <span>
                      by {thread.user?.firstName} {thread.user?.lastName}
                    </span>
                    <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Thread Stats */}
                <div className="flex flex-col items-end gap-2 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    <span>Replies</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateThreadModal
        isOpen={isCreateThreadModalOpen}
        onClose={() => setIsCreateThreadModalOpen(false)}
        onSuccess={handleThreadCreated}
        forumId={Number(forumId)}
        categories={categories}
      />

      {canManageCategories() && (
        <CategoryManagementModal
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          onSuccess={handleCategoriesUpdated}
          forumId={Number(forumId)}
          categories={categories}
        />
      )}
    </div>
  );
};
