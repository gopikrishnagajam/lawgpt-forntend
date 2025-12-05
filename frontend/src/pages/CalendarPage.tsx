import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CalendarHearing } from '@/types/case.types';
import { Calendar, ChevronLeft, ChevronRight, Briefcase } from 'lucide-react';
import { caseService } from '@/services/case.service';
import { NotesPanel } from '@/components/NotesPanel';

export const CalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedCaseId, setSelectedCaseId] = useState<number | null>(null);
  const [allHearings, setAllHearings] = useState<CalendarHearing[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch all hearings from API on mount
  useEffect(() => {
    const fetchAllHearings = async () => {
      try {
        setLoading(true);
        const { data } = await caseService.getAllHearings(false, 100, 0);

        // API returns { success, data: { hearings: [...] } }
        const hearings = Array.isArray((data as any)?.hearings)
          ? ((data as any).hearings as CalendarHearing[])
          : Array.isArray((data as any)?.data?.hearings)
            ? ((data as any).data.hearings as CalendarHearing[])
            : Array.isArray(data)
              ? (data as CalendarHearing[])
              : [];

        setAllHearings(hearings);

        // If nothing selected yet, default to today and first hearing
        if (!selectedDate) {
          setSelectedDate(new Date());
        }
      } catch (err) {
        console.error('Error fetching hearings:', err);
        setAllHearings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllHearings();
  }, []);

  // Filter hearings to the visible month
  const hearingsForMonth = useMemo(() => {
    return allHearings.filter((h) => {
      const d = new Date(h.hearing_date);
      return d.getFullYear() === currentDate.getFullYear() && d.getMonth() === currentDate.getMonth();
    });
  }, [allHearings, currentDate]);

  // Helper: days in month and starting weekday
  const getMonthInfo = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    return { daysInMonth: last.getDate(), startWeekday: first.getDay() };
  };

  const { daysInMonth, startWeekday } = getMonthInfo(currentDate);

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: startWeekday }, () => null);

  const isToday = (d: Date) => {
    const n = new Date();
    return n.getFullYear() === d.getFullYear() && n.getMonth() === d.getMonth() && n.getDate() === d.getDate();
  };

  const getHearingsForDate = (d: Date) => {
    return hearingsForMonth.filter((h) => {
      const hd = new Date(h.hearing_date);
      return hd.getFullYear() === d.getFullYear() && hd.getMonth() === d.getMonth() && hd.getDate() === d.getDate();
    });
  };

  const getPriorityColor = (priority: string | undefined) => {
    switch (priority?.toUpperCase()) {
      case 'HIGH':
        return 'bg-red-500';
      case 'MEDIUM':
        return 'bg-yellow-500';
      case 'LOW':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Ensure a case is selected when date changes
  useEffect(() => {
    if (!selectedDate) return;
    const todaysHearings = getHearingsForDate(selectedDate);
    if (todaysHearings.length > 0) {
      // If current selection not in today's hearings, pick the first
      const stillValid = todaysHearings.some((h) => h.case_id === selectedCaseId);
      if (!stillValid) {
        setSelectedCaseId(todaysHearings[0].case_id);
      }
    } else {
      setSelectedCaseId(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, allHearings]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Calendar className="w-8 h-8 text-blue-600" />
              Hearings Calendar
            </h1>
            <p className="text-gray-600 mt-1">{loading ? 'Loading hearings...' : `${hearingsForMonth.length} hearings in ${currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`}</p>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={goToday} className="px-3 py-2 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium text-sm">Today</button>
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
              <button onClick={prevMonth} title="Previous month" className="p-2 hover:bg-white rounded"><ChevronLeft className="w-5 h-5 text-gray-600" /></button>
              <div className="px-4 py-2 text-sm font-semibold text-gray-900 min-w-[160px] text-center">{monthName}</div>
              <button onClick={nextMonth} title="Next month" className="p-2 hover:bg-white rounded"><ChevronRight className="w-5 h-5 text-gray-600" /></button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: date info + hearings list + notes */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sticky top-6 space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{selectedDate ? selectedDate.toLocaleDateString() : 'Select a date'}</h3>
              <p className="text-sm text-gray-600">{selectedDate ? 'Hearings for selected date' : 'Click a date to view hearings'}</p>
            </div>

            {selectedDate ? (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {getHearingsForDate(selectedDate).map((h) => (
                  <div
                    key={h.id}
                    className={`p-3 border rounded-lg transition-colors cursor-pointer ${
                      selectedCaseId === h.case_id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                    onClick={() => setSelectedCaseId(h.case_id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-gray-500 font-medium">{h.case_number}</div>
                        <div className="font-semibold text-sm text-gray-900 truncate">{h.case_title || 'Untitled case'}</div>
                      </div>
                      <div className={`text-xs font-semibold px-2 py-1 rounded whitespace-nowrap ${getPriorityColor(h.priority)} text-white`}>{h.priority || 'NA'}</div>
                    </div>
                    {h.court_name && (
                      <div className="text-xs text-gray-600 mt-2 flex items-center gap-1">
                        <Briefcase className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{h.court_name}</span>
                      </div>
                    )}
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(h.hearing_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <button
                      className="mt-2 text-xs text-blue-600 hover:underline"
                      onClick={(e) => { e.stopPropagation(); navigate(`/cases/${h.case_id}`); }}
                    >
                      View case details
                    </button>
                  </div>
                ))}
                {getHearingsForDate(selectedDate).length === 0 && (
                  <div className="text-center py-6 text-gray-500">No hearings for this date</div>
                )}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">Click a date to view hearings</div>
            )}

            {/* Notes area */}
            {selectedCaseId && selectedDate && (
              <div className="pt-2 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Case notes</h4>
                <NotesPanel caseId={selectedCaseId} date={selectedDate.toISOString().split('T')[0]} />
              </div>
            )}
          </div>
        </div>

        {/* Right column: calendar grid */}
        <div className="lg:col-span-2 order-1 lg:order-2">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="text-gray-600 mt-4">Loading calendar...</p>
              </div>
            ) : (
              <>
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => (
                <div key={d} className="text-center text-sm font-semibold text-gray-600 py-2">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {blanks.map((_, idx) => <div key={`b-${idx}`} className="aspect-square" />)}
              {days.map((day) => {
                const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                const items = getHearingsForDate(date);
                const todayFlag = isToday(date);
                const selectedFlag = selectedDate && date.toDateString() === selectedDate.toDateString();

                return (
                  <div
                    key={day}
                    onClick={() => { setSelectedDate(date); }}
                    className={`aspect-square p-2 border rounded-lg cursor-pointer transition-all ${
                      selectedFlag ? 'border-blue-500 bg-blue-50' : todayFlag ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex flex-col h-full">
                      <span className={`text-sm font-semibold ${selectedFlag ? 'text-blue-700' : todayFlag ? 'text-blue-600' : 'text-gray-900'}`}>{day}</span>
                      {items.length > 0 && (
                        <div className="mt-1 space-y-1">
                          {items.slice(0, 2).map((it) => (
                            <div key={it.id} className={`w-full h-1.5 rounded-full ${getPriorityColor(it.priority)}`} title={`${it.case_number} - ${it.case_title}`} />
                          ))}
                          {items.length > 2 && <div className="text-xs text-gray-500 font-medium">+{items.length - 2}</div>}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
