import React, { useEffect, useState, useCallback } from 'react';
import { MessageSquare, Plus, Trash2, Calendar, AlertCircle } from 'lucide-react';
import type { Note } from '@/types/case.types';
import { notesService } from '@/services/notes.service';
import { useAuthStore } from '@/store/auth.store';

interface NotesPanelProps {
  caseId: number;
  date?: string;
}

export const NotesPanel: React.FC<NotesPanelProps> = ({ caseId, date }) => {
  const { sessionContext } = useAuthStore();
  const userId = sessionContext?.userId ? parseInt(sessionContext.userId) : undefined;

  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const currentDate = date || new Date().toISOString().split('T')[0];

  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await notesService.getNotesByDate(caseId, currentDate);
      setNotes(response.data || []);
    } catch (err) {
      console.error('Error fetching notes:', err);
      setError('Failed to load notes');
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }, [caseId, currentDate]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleCreateNote = async () => {
    if (!newNoteContent.trim()) {
      return;
    }

    try {
      setSaving(true);
      setAutoSaveStatus('saving');
      setError(null);
      await notesService.createNote(caseId, {
        content: newNoteContent,
        date: currentDate,
      });
      setNewNoteContent('');
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus('idle'), 2000);
      await fetchNotes();
    } catch (err) {
      console.error('Error creating note:', err);
      setError('Failed to save note');
      setAutoSaveStatus('idle');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateNote = async (noteId: string) => {
    if (!editingContent.trim()) {
      setError('Note content cannot be empty');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await notesService.updateNote(caseId, noteId, {
        content: editingContent,
      });
      setEditingNoteId(null);
      setEditingContent('');
      await fetchNotes();
    } catch (err) {
      console.error('Error updating note:', err);
      setError('Failed to update note');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      setSaving(true);
      setError(null);
      await notesService.deleteNote(caseId, noteId);
      setShowDeleteConfirm(null);
      await fetchNotes();
    } catch (err) {
      console.error('Error deleting note:', err);
      setError('Failed to delete note');
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (note: Note) => {
    setEditingNoteId(note.id);
    setEditingContent(note.content);
  };

  const cancelEditing = () => {
    setEditingNoteId(null);
    setEditingContent('');
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          Case Notes
        </h2>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          {new Date(currentDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* New Note Input */}
      <div className="mb-6 border-b border-gray-200 pb-6">
        <div className="space-y-2">
          <textarea
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            onBlur={handleCreateNote}
            placeholder="Add a note... (auto-saves on blur)"
            className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
            disabled={saving}
          />
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                {newNoteContent.length} / 5000 characters
              </span>
              {autoSaveStatus === 'saving' && (
                <span className="text-xs text-blue-600 flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                  Saving...
                </span>
              )}
              {autoSaveStatus === 'saved' && (
                <span className="text-xs text-green-600 flex items-center gap-1">
                  ✓ Saved
                </span>
              )}
            </div>
            <button
              onClick={handleCreateNote}
              disabled={saving || !newNoteContent.trim()}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Note
            </button>
          </div>
        </div>
      </div>

      {/* Notes List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {loading ? (
          <div className="text-center py-8 text-gray-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-sm">Loading notes...</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-2" />
            <p className="text-sm">No notes for this date</p>
          </div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors">
              {editingNoteId === note.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateNote(note.id)}
                      disabled={saving}
                      className="px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:bg-gray-400"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEditing}
                      disabled={saving}
                      className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 disabled:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">
                        <span className="font-medium text-blue-600">{note.user.fullName}</span>
                        {' '}at{' '}
                        {formatTime(note.createdAt)}
                      </p>
                      <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap break-words">
                        {note.content}
                      </p>
                    </div>
                    {userId === note.userId && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => startEditing(note)}
                          className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit note"
                        >
                          ✎
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(note.id)}
                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete note"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {showDeleteConfirm === note.id && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm">
                      <p className="text-red-700 mb-2">Delete this note?</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          disabled={saving}
                          className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(null)}
                          disabled={saving}
                          className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ))
        )}
      </div>

      <div className="mt-4 text-xs text-gray-500">
        {notes.length} {notes.length === 1 ? 'note' : 'notes'} today
      </div>
    </div>
  );
};
