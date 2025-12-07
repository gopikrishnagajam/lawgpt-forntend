import { useState } from 'react';
import { ThumbsUp, Lightbulb, Star, Edit2, Trash2, Reply } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { forumService } from '@/services/forum.service';
import type { ForumPost, ReactionType } from '@/types/forum.types';

interface PostItemProps {
  post: ForumPost;
  forumId: number;
  threadId: string;
  onReply: (postId: string) => void;
  onUpdate: () => void;
}

export const PostItem = ({ post, forumId, threadId, onReply, onUpdate }: PostItemProps) => {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userId = Number(user?.id);
  const isOwner = post.userId === userId;

  const reactionIcons: Record<ReactionType, any> = {
    like: ThumbsUp,
    helpful: Lightbulb,
    insightful: Star,
  };

  const reactionColors: Record<ReactionType, string> = {
    like: 'text-blue-600',
    helpful: 'text-green-600',
    insightful: 'text-purple-600',
  };

  const handleReaction = async (reactionType: ReactionType) => {
    try {
      const hasReacted = post.userReactions?.includes(reactionType);

      if (hasReacted) {
        await forumService.removeReaction(forumId, threadId, post.id, reactionType);
      } else {
        await forumService.addReaction(forumId, threadId, post.id, reactionType);
      }

      onUpdate();
    } catch (error) {
      console.error('Failed to toggle reaction:', error);
    }
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) {
      alert('Post content cannot be empty');
      return;
    }

    setIsSubmitting(true);

    try {
      await forumService.updatePost(forumId, threadId, post.id, {
        content: editContent.trim(),
      });
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Failed to update post:', error);
      alert('Failed to update post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      await forumService.deletePost(forumId, threadId, post.id);
      onUpdate();
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('Failed to delete post');
    }
  };

  return (
    <div className="border-b border-gray-200 last:border-b-0 p-6 hover:bg-gray-50 transition-colors">
      {/* Post Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
            {post.user?.firstName?.charAt(0) || 'U'}
          </div>
          <div>
            <div className="font-semibold text-gray-900">
              {post.user?.firstName} {post.user?.lastName}
            </div>
            <div className="text-sm text-gray-500">
              {new Date(post.createdAt).toLocaleString()}
              {post.updatedAt !== post.createdAt && (
                <span className="ml-2 text-xs">(edited)</span>
              )}
            </div>
          </div>
        </div>

        {/* Post Actions */}
        {isOwner && !isEditing && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="Edit"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Parent Post Reference */}
      {post.parentPost && (
        <div className="mb-3 pl-4 border-l-2 border-gray-300 text-sm text-gray-600 bg-gray-50 p-2 rounded">
          <div className="font-semibold text-gray-700">
            Replying to {post.parentPost.user?.firstName} {post.parentPost.user?.lastName}
          </div>
          <div className="line-clamp-2">{post.parentPost.content}</div>
        </div>
      )}

      {/* Post Content */}
      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={5}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            disabled={isSubmitting}
          />
          <div className="flex gap-2">
            <button
              onClick={handleSaveEdit}
              disabled={isSubmitting}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditContent(post.content);
              }}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="text-gray-800 whitespace-pre-wrap mb-4">{post.content}</div>
      )}

      {/* Post Footer - Reactions and Reply */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        {/* Reactions */}
        <div className="flex items-center gap-2">
          {(['like', 'helpful', 'insightful'] as ReactionType[]).map((reactionType) => {
            const Icon = reactionIcons[reactionType];
            const count = post.reactionCounts?.[reactionType] || 0;
            const hasReacted = post.userReactions?.includes(reactionType);

            return (
              <button
                key={reactionType}
                onClick={() => handleReaction(reactionType)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
                  hasReacted
                    ? `bg-blue-50 ${reactionColors[reactionType]} border border-blue-200`
                    : 'text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
                title={reactionType.charAt(0).toUpperCase() + reactionType.slice(1)}
              >
                <Icon className={`w-4 h-4 ${hasReacted ? '' : ''}`} />
                {count > 0 && <span className="text-sm font-medium">{count}</span>}
              </button>
            );
          })}
        </div>

        {/* Reply Button */}
        <button
          onClick={() => onReply(post.id)}
          className="flex items-center gap-1 px-3 py-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <Reply className="w-4 h-4" />
          <span className="text-sm font-medium">Reply</span>
        </button>
      </div>
    </div>
  );
};
