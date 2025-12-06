import React, { useEffect, useState, useCallback } from 'react';
import { MessageSquare, Calendar } from 'lucide-react';
import type { Note } from '@/types/case.types';
import { notesService } from '@/services/notes.service';

interface NotesTimelineProps {
  caseId: number;
  startDate?: string;
  endDate?: string;
}

export const NotesTimeline: React.FC<NotesTimelineProps> = ({
  caseId,
  startDate,
  endDate,
}) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [groupedNotes, setGroupedNotes] = useState<Record<string, Note[]>>({});

  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      if (startDate && endDate) {
        response = await notesService.getNotesByDateRange(
          caseId,
          startDate,
          endDate
        );
      } else {
        response = await notesService.getAllNotesForCase(caseId);
      }

      const notesData = response.data || [];
      setNotes(notesData);

      // Group by date
      const grouped = notesData.reduce(
        (acc, note) => {
          const dateKey = note.date;
          if (!acc[dateKey]) {
            acc[dateKey] = [];
          }
          acc[dateKey].push(note);
          return acc;
        },
        {} as Record<string, Note[]>
      );

      // Sort notes within each date group by timestamp
      Object.keys(grouped).forEach((date) => {
        grouped[date].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });

      setGroupedNotes(grouped);
    } catch (err) {
      console.error('Error fetching notes:', err);
      setError('Failed to load notes');
    } finally {
      setLoading(false);
    }
  }, [caseId, startDate, endDate]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const groupColors = [
    'bg-blue-50',
    'bg-purple-50',
    'bg-green-50',
    'bg-yellow-50',
    'bg-pink-50',
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-blue-600" />
        Notes Timeline
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-4 text-sm">Loading timeline...</p>
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <MessageSquare className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-sm">No notes found</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.keys(groupedNotes)
            .sort()
            .reverse()
            .map((date, dateIndex) => (
              <div key={date}>
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <h3 className="font-semibold text-gray-900">
                    {formatDate(date)}
                  </h3>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {groupedNotes[date].length} note
                    {groupedNotes[date].length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="space-y-2 ml-6 border-l-2 border-gray-200 pl-4">
                  {groupedNotes[date].map((note) => (
                    <div
                      key={note.id}
                      className={`p-4 rounded-lg border border-gray-200 ${
                        groupColors[dateIndex % groupColors.length]
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-xs text-gray-600 font-medium">
                            <span className="text-blue-600">
                              {note.user.fullName}
                            </span>
                            {' '}• {formatTime(note.createdAt)}
                          </p>
                          <p className="text-sm text-gray-900 mt-2 whitespace-pre-wrap break-words">
                            {note.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}

      <div className="mt-6 text-sm text-gray-600 text-center">
        Total: {notes.length} note{notes.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
};
