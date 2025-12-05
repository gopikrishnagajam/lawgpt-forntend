import { useState } from 'react';
import type { DiaryEntry } from '@/types/diary.types';

interface DiaryTimelineProps {
  entries: DiaryEntry[];
  isLoading?: boolean;
  onEntrySelect?: (entry: DiaryEntry) => void;
  onEntryDelete?: (date: string) => Promise<void>;
  selectedDate?: string;
}

export const DiaryTimeline = ({
  entries,
  isLoading,
  onEntrySelect,
  onEntryDelete,
  selectedDate,
}: DiaryTimelineProps) => {
  const [deletingDate, setDeletingDate] = useState<string | null>(null);

  const handleDelete = async (date: string) => {
    if (!onEntryDelete) return;
    if (!window.confirm('Are you sure you want to delete this entry? This action cannot be undone.')) return;

    setDeletingDate(date);
    try {
      await onEntryDelete(date);
    } finally {
      setDeletingDate(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-24 bg-gray-200 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500">No diary entries yet. Start writing your first entry!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => {
        const entryDate = new Date(entry.date);
        const today = new Date();
        const isToday =
          entryDate.toDateString() === today.toDateString();
        const isSelected = selectedDate === entry.date;

        const preview = entry.content.length > 150 ? `${entry.content.substring(0, 150)}...` : entry.content;

        return (
          <div
            key={entry.id}
            onClick={() => onEntrySelect?.(entry)}
            className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
              isSelected
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {isToday ? (
                    <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">T</span>
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 text-xs font-semibold">
                        {entryDate.getDate()}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {entryDate.toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {new Date(entry.updatedAt).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
              {onEntryDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(entry.date);
                  }}
                  disabled={deletingDate === entry.date}
                  className="text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                  title="Delete entry"
                >
                  {deletingDate === entry.date ? (
                    <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </button>
              )}
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">{preview}</p>
            {entry.content.length > 150 && (
              <p className="text-indigo-600 text-xs mt-2 font-medium">Read more →</p>
            )}
          </div>
        );
      })}
    </div>
  );
};
