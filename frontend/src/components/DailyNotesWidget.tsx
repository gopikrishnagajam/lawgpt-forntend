import React, { useEffect, useState } from 'react';
import { MessageSquare, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Note } from '@/types/case.types';
import { notesService } from '@/services/notes.service';

export const DailyNotesWidget: React.FC = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTodayNotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const today = new Date().toISOString().split('T')[0];
      const response = await notesService.getYourNotesByDate(today);
      setNotes(response.data?.slice(0, 5) || []);
    } catch (err) {
      console.error('Error fetching notes:', err);
      setError('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayNotes();
    // Refresh every 30 seconds
    const interval = setInterval(fetchTodayNotes, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          Today's Notes
          {notes.length > 0 && (
            <span className="bg-blue-100 text-blue-600 text-xs font-bold px-2 py-1 rounded-full">
              {notes.length}
            </span>
          )}
        </h3>
      </div>

      {error && (
        <div className="text-sm text-red-600 mb-4">{error}</div>
      )}

      {loading ? (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No notes yet today</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notes.map((note) => (
            <div
              key={note.id}
              onClick={() => navigate(`/cases/${note.caseId}`)}
              className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-600 font-medium">
                    {note.case?.caseNumber} • {note.user.fullName} •{' '}
                    {formatTime(note.createdAt)}
                  </p>
                  <p className="text-sm text-gray-900 mt-1 truncate">
                    {note.content}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 ml-2 flex-shrink-0" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
