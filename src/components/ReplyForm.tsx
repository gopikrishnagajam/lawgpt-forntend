import { useState } from 'react';
import { X, Send } from 'lucide-react';
import { forumService } from '@/services/forum.service';

interface ReplyFormProps {
  forumId: number;
  threadId: string;
  parentPostId?: string;
  onSuccess: () => void;
  onCancel: () => void;
  placeholder?: string;
}

export const ReplyForm = ({
  forumId,
  threadId,
  parentPostId,
  onSuccess,
  onCancel,
  placeholder = 'Write your reply...',
}: ReplyFormProps) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!content.trim()) {
      setError('Reply content is required');
      return;
    }

    setIsSubmitting(true);

    try {
      await forumService.createPost(forumId, threadId, {
        content: content.trim(),
        parentPostId,
      });

      setContent('');
      onSuccess();
    } catch (err: any) {
      console.error('Failed to create post:', err);
      setError(err.response?.data?.error || 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="space-y-3">
        {/* Textarea */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          placeholder={placeholder}
          disabled={isSubmitting}
        />

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            {isSubmitting ? 'Posting...' : 'Post Reply'}
          </button>
        </div>
      </div>
    </form>
  );
};
