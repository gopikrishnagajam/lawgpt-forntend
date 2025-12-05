import { useState } from 'react';
import type { DiaryEntry } from '@/types/diary.types';

interface DiaryEntryEditorProps {
  entry?: DiaryEntry | null;
  onSave: (content: string) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export const DiaryEntryEditor = ({ entry, onSave, onCancel, isLoading }: DiaryEntryEditorProps) => {
  const [content, setContent] = useState(entry?.content || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!content.trim()) {
      setError('Please write something in your diary');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await onSave(content);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save entry');
    } finally {
      setIsSaving(false);
    }
  };

  const characterCount = content.length;
  const isModified = content !== (entry?.content || '');

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4">
        <h2 className="text-xl font-semibold text-white">
          {entry ? 'Edit Diary Entry' : "Today's Diary Entry"}
        </h2>
        <p className="text-indigo-100 text-sm mt-1">
          {entry?.date ? new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Editor */}
      <div className="p-6">
        {/* Text Area */}
        <div className="mb-4">
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setError(null);
            }}
            placeholder="Write your diary entry here... Share your thoughts, feelings, and important moments of the day."
            className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none font-light text-gray-700 placeholder-gray-400"
            disabled={isLoading || isSaving}
          />
        </div>

        {/* Character Count */}
        <div className="mb-4 flex justify-between items-center">
          <p className="text-xs text-gray-500">
            {characterCount} character{characterCount !== 1 ? 's' : ''}
          </p>
          {entry && (
            <p className="text-xs text-gray-500">
              Last updated: {new Date(entry.updatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          {onCancel && (
            <button
              onClick={onCancel}
              disabled={isSaving || isLoading}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving || isLoading || !isModified}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isSaving && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {isSaving ? 'Saving...' : 'Save Entry'}
          </button>
        </div>

        {/* Privacy Notice */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-xs text-blue-600">
            🔒 <strong>Private & Secure:</strong> Your diary is completely private. No one else, not even team members or admins, can see your entries.
          </p>
        </div>
      </div>
    </div>
  );
};
