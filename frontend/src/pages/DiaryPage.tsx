import { useState, useEffect } from 'react';
import { diaryService } from '@/services/diary.service';
import { DiaryEntryEditor } from '@/components/DiaryEntryEditor';
import { DiaryTimeline } from '@/components/DiaryTimeline';
import { DiaryStats } from '@/components/DiaryStats';
import type { DiaryEntry } from '@/types/diary.types';

export const DiaryPage = () => {
  const [todayEntry, setTodayEntry] = useState<DiaryEntry | null>(null);
  const [allEntries, setAllEntries] = useState<DiaryEntry[]>([]);
  const [stats, setStats] = useState({ totalEntries: 0, last30Days: 0, totalDays: 0 });
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
  const [isLoadingToday, setIsLoadingToday] = useState(true);
  const [isLoadingAll, setIsLoadingAll] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'today' | 'history'>('today');

  // Load today's entry and all entries
  useEffect(() => {
    loadTodayEntry();
    loadAllEntries();
    loadStats();
  }, []);

  const loadTodayEntry = async () => {
    try {
      setIsLoadingToday(true);
      const response = await diaryService.getTodayEntry();
      setTodayEntry(response.data || null);
    } catch (err) {
      console.error('Failed to load today entry:', err);
      // Don't show error if it's just not found
    } finally {
      setIsLoadingToday(false);
    }
  };

  const loadAllEntries = async () => {
    try {
      setIsLoadingAll(true);
      const response = await diaryService.getAllEntries({ limit: 30, offset: 0 });
      setAllEntries(response.data || []);
    } catch (err) {
      console.error('Failed to load entries:', err);
      setError('Failed to load diary entries');
    } finally {
      setIsLoadingAll(false);
    }
  };

  const loadStats = async () => {
    try {
      setIsLoadingStats(true);
      const response = await diaryService.getStats();
      setStats(response.data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleSaveEntry = async (content: string) => {
    try {
      setError(null);
      const response = await diaryService.createEntry({ content });
      setTodayEntry(response.data);
      setSelectedEntry(null);
      setSuccessMessage('Diary entry saved successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
      
      // Reload data
      loadAllEntries();
      loadStats();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save entry';
      setError(message);
      throw err;
    }
  };

  const handleDeleteEntry = async (date: string) => {
    try {
      setError(null);
      await diaryService.deleteEntry(date);
      
      // Update states
      if (todayEntry?.date === date) {
        setTodayEntry(null);
      }
      setSelectedEntry(null);
      setAllEntries(allEntries.filter(e => e.date !== date));
      setSuccessMessage('Diary entry deleted successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
      
      // Reload stats
      loadStats();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete entry';
      setError(message);
    }
  };

  const handleSelectEntry = (entry: DiaryEntry) => {
    setSelectedEntry(entry);
    setActiveTab('history');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold text-gray-900">📖 Personal Diary</h1>
          </div>
          <p className="text-gray-600">
            A private space to reflect on your day, track your progress, and capture your thoughts.
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <span className="text-green-600 text-xl mt-1">✓</span>
            <p className="text-green-700">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <span className="text-red-600 text-xl mt-1">✕</span>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Stats */}
        <div className="mb-8">
          <DiaryStats
            totalEntries={stats.totalEntries}
            last30Days={stats.last30Days}
            totalDays={stats.totalDays}
            isLoading={isLoadingStats}
          />
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('today')}
            className={`pb-3 px-4 font-medium transition-colors ${
              activeTab === 'today'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Today's Entry
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 px-4 font-medium transition-colors ${
              activeTab === 'history'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            History
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Editor (Left Side) */}
          <div className="lg:col-span-2">
            {activeTab === 'today' ? (
              <DiaryEntryEditor
                entry={todayEntry}
                onSave={handleSaveEntry}
                isLoading={isLoadingToday}
              />
            ) : selectedEntry ? (
              <DiaryEntryEditor
                entry={selectedEntry}
                onSave={handleSaveEntry}
                onCancel={() => setSelectedEntry(null)}
                isLoading={false}
              />
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <p className="text-gray-500">Select an entry to view</p>
              </div>
            )}
          </div>

          {/* Timeline (Right Side) */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Entries</h3>
              <DiaryTimeline
                entries={allEntries}
                isLoading={isLoadingAll}
                onEntrySelect={handleSelectEntry}
                onEntryDelete={handleDeleteEntry}
                selectedDate={selectedEntry?.date}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
