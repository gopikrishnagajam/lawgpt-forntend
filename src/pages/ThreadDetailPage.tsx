import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { forumService } from '@/services/forum.service';
import {
  ArrowLeft,
  Pin,
  Lock,
  Eye,
  Edit2,
  Trash2,
  MessageSquare,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { PostItem } from '@/components/PostItem';
import { ReplyForm } from '@/components/ReplyForm';

export const ThreadDetailPage = () => {
  const { forumId, threadId } = useParams<{ forumId: string; threadId: string }>();
  const navigate = useNavigate();
  const { user, sessionContext } = useAuthStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingToPostId, setReplyingToPostId] = useState<string | null>(null);

  const userId = Number(user?.id);
  const isAdmin = sessionContext?.roles.includes('admin');

  // Fetch thread details
  const {
    data: threadData,
    isLoading: isLoadingThread,
    refetch: refetchThread,
  } = useQuery({
    queryKey: ['thread', forumId, threadId],
    queryFn: () => forumService.getThreadById(Number(forumId), threadId!),
    enabled: !!forumId && !!threadId,
  });

  const thread = threadData?.data;

  // Fetch posts
  const {
    data: postsData,
    isLoading: isLoadingPosts,
    refetch: refetchPosts,
  } = useQuery({
    queryKey: ['posts', forumId, threadId],
    queryFn: () =>
      forumService.getPosts(Number(forumId), threadId!, {
        limit: 100,
        offset: 0,
      }),
    enabled: !!forumId && !!threadId,
  });

  const posts = postsData?.data || [];

  const isThreadOwner = thread?.userId === userId;
  const canManageThread = () => {
    if (!thread) return false;
    if (thread.forum?.type === 'organizational') {
      return isAdmin && sessionContext?.organizationId === thread.forum.organizationId;
    }
    return isThreadOwner;
  };

  const handleEditThread = () => {
    if (thread) {
      setEditTitle(thread.title);
      setEditContent(thread.content);
      setIsEditing(true);
    }
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim() || !editContent.trim()) {
      alert('Title and content are required');
      return;
    }

    setIsSubmitting(true);

    try {
      await forumService.updateThread(Number(forumId), threadId!, {
        title: editTitle.trim(),
        content: editContent.trim(),
      });
      setIsEditing(false);
      refetchThread();
    } catch (error) {
      console.error('Failed to update thread:', error);
      alert('Failed to update thread');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePin = async () => {
    if (!thread) return;

    try {
      await forumService.updateThread(Number(forumId), threadId!, {
        isPinned: !thread.isPinned,
      });
      refetchThread();
    } catch (error) {
      console.error('Failed to toggle pin:', error);
      alert('Failed to toggle pin');
    }
  };

  const handleToggleClosed = async () => {
    if (!thread) return;

    try {
      await forumService.updateThread(Number(forumId), threadId!, {
        isClosed: !thread.isClosed,
      });
      refetchThread();
    } catch (error) {
      console.error('Failed to toggle closed:', error);
      alert('Failed to toggle closed');
    }
  };

  const handleDeleteThread = async () => {
    if (!confirm('Are you sure you want to delete this thread? This action cannot be undone.')) {
      return;
    }

    try {
      await forumService.deleteThread(Number(forumId), threadId!);
      navigate(`/forums/${forumId}/threads`);
    } catch (error) {
      console.error('Failed to delete thread:', error);
      alert('Failed to delete thread');
    }
  };

  const handleReplySuccess = () => {
    setReplyingToPostId(null);
    refetchPosts();
  };

  if (!forumId || !threadId) {
    return <div>Thread not found</div>;
  }

  if (isLoadingThread) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!thread) {
    return <div>Thread not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/forums/${forumId}/threads`)}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              {thread.isPinned && <Pin className="w-5 h-5 text-blue-600" />}
              {thread.isClosed && <Lock className="w-5 h-5 text-gray-500" />}
              <span className="text-sm text-gray-600">{thread.forum?.name}</span>
              {thread.category && (
                <>
                  <span className="text-gray-400">/</span>
                  <span className="text-sm px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                    {thread.category.name}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Thread Actions */}
        <div className="flex items-center gap-2">
          {canManageThread() && (
            <>
              <button
                onClick={handleTogglePin}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                  thread.isPinned
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
                title={thread.isPinned ? 'Unpin' : 'Pin'}
              >
                <Pin className="w-4 h-4" />
                {thread.isPinned ? 'Unpin' : 'Pin'}
              </button>
              <button
                onClick={handleToggleClosed}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                  thread.isClosed
                    ? 'bg-gray-100 text-gray-700 border border-gray-300'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
                title={thread.isClosed ? 'Reopen' : 'Close'}
              >
                {thread.isClosed ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Reopen
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    Close
                  </>
                )}
              </button>
            </>
          )}
          {isThreadOwner && (
            <>
              {!isEditing && (
                <button
                  onClick={handleEditThread}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit Thread"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={handleDeleteThread}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete Thread"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Thread Content */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          {isEditing ? (
            <div className="space-y-4">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3 py-2 text-2xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
              />
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                disabled={isSubmitting}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveEdit}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{thread.title}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {thread.user?.firstName?.charAt(0) || 'U'}
                  </div>
                  <span className="font-medium">
                    {thread.user?.firstName} {thread.user?.lastName}
                  </span>
                </div>
                <span>{new Date(thread.createdAt).toLocaleString()}</span>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {thread.viewCount} views
                </div>
              </div>
              <div className="text-gray-800 whitespace-pre-wrap">{thread.content}</div>
            </>
          )}
        </div>

        {/* Reply to Thread (Main) */}
        {!thread.isClosed && replyingToPostId === null && (
          <div className="p-6">
            <ReplyForm
              forumId={Number(forumId)}
              threadId={threadId}
              onSuccess={handleReplySuccess}
              onCancel={() => {}}
              placeholder="Reply to this thread..."
            />
          </div>
        )}

        {thread.isClosed && (
          <div className="p-6 bg-gray-50 text-center text-gray-600">
            <Lock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p>This thread is closed and cannot accept new replies.</p>
          </div>
        )}
      </div>

      {/* Posts/Replies */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 border-b border-gray-200 flex items-center gap-2 bg-gray-50">
          <MessageSquare className="w-5 h-5 text-gray-600" />
          <h2 className="font-semibold text-gray-900">
            Replies ({posts.length})
          </h2>
        </div>

        {isLoadingPosts ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>No replies yet. Be the first to reply!</p>
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <div key={post.id}>
                <PostItem
                  post={post}
                  forumId={Number(forumId)}
                  threadId={threadId}
                  onReply={(postId) => setReplyingToPostId(postId)}
                  onUpdate={refetchPosts}
                />
                {replyingToPostId === post.id && !thread.isClosed && (
                  <div className="px-6 pb-6">
                    <ReplyForm
                      forumId={Number(forumId)}
                      threadId={threadId}
                      parentPostId={post.id}
                      onSuccess={handleReplySuccess}
                      onCancel={() => setReplyingToPostId(null)}
                      placeholder={`Reply to ${post.user?.firstName}...`}
                    />
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};
