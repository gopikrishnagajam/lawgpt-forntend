import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { caseService } from '@/services/case.service';
import type { CalendarHearing } from '@/types/case.types';
import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin, User, Phone, Briefcase } from 'lucide-react';

export const CalendarPage = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hearings, setHearings] = useState<CalendarHearing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    fetchHearings();
  }, [currentDate]);

  const fetchHearings = async () => {
    try {
      setLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);
      
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      const response = await caseService.getHearingsCalendar(startDateStr, endDateStr);
      setHearings(response.data);
    } catch (err) {
      console.error('Error fetching hearings:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const getHearingsForDate = (date: Date) => {
    return hearings.filter((hearing) => {
      const hearingDate = new Date(hearing.hearing_date);
      return (
        hearingDate.getDate() === date.getDate() &&
        hearingDate.getMonth() === date.getMonth() &&
        hearingDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toUpperCase()) {
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

  const getHearingTypeLabel = (type: string) => {
    switch (type) {
      case 'next_hearing':
        return 'Next Hearing';
      case 'first_hearing':
        return 'First Hearing';
      case 'last_hearing':
        return 'Last Hearing';
      default:
        return type;
    }
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    setSelectedDate(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    setSelectedDate(null);
  };

  const today = () => {
    setCurrentDate(new Date());
    setSelectedDate(null);
  };

  const isToday = (date: Date) => {
    const now = new Date();
    return (
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: startingDayOfWeek }, (_, i) => i);

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const selectedDayHearings = selectedDate ? getHearingsForDate(selectedDate) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Calendar className="w-8 h-8 text-blue-600" />
              Hearings Calendar
            </h1>
            <p className="text-gray-600 mt-1">View and manage all scheduled hearings</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={today}
              className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              Today
            </button>
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
              <button
                onClick={previousMonth}
                className="p-2 hover:bg-white rounded-lg transition-colors"
                title="Previous month"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <span className="px-4 py-2 text-sm font-semibold text-gray-900 min-w-[160px] text-center">
                {monthName}
              </span>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-white rounded-lg transition-colors"
                title="Next month"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="text-gray-600 mt-4">Loading hearings...</p>
              </div>
            ) : (
              <div>
                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div
                      key={day}
                      className="text-center text-sm font-semibold text-gray-600 py-2"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-2">
                  {/* Empty cells for days before month starts */}
                  {blanks.map((blank) => (
                    <div key={`blank-${blank}`} className="aspect-square" />
                  ))}

                  {/* Days of the month */}
                  {days.map((day) => {
                    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                    const dayHearings = getHearingsForDate(date);
                    const isTodayDate = isToday(date);
                    const isSelected = selectedDate?.toDateString() === date.toDateString();

                    return (
                      <div
                        key={day}
                        onClick={() => setSelectedDate(date)}
                        className={`aspect-square p-2 border rounded-lg cursor-pointer transition-all ${
                          isTodayDate
                            ? 'border-blue-500 bg-blue-50'
                            : isSelected
                            ? 'border-blue-400 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex flex-col h-full">
                          <span
                            className={`text-sm font-semibold ${
                              isTodayDate ? 'text-blue-600' : 'text-gray-900'
                            }`}
                          >
                            {day}
                          </span>
                          {dayHearings.length > 0 && (
                            <div className="mt-1 space-y-1">
                              {dayHearings.slice(0, 2).map((hearing) => (
                                <div
                                  key={hearing.id}
                                  className={`w-full h-1 rounded-full ${getPriorityColor(
                                    hearing.case_priority
                                  )}`}
                                  title={`${hearing.case_number} - ${hearing.case_title}`}
                                />
                              ))}
                              {dayHearings.length > 2 && (
                                <div className="text-xs text-gray-500 font-medium">
                                  +{dayHearings.length - 2}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Hearing Details Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {selectedDate
                ? selectedDate.toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'Select a date'}
            </h3>

            {selectedDate && selectedDayHearings.length > 0 ? (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {selectedDayHearings.map((hearing) => (
                  <div
                    key={hearing.id}
                    onClick={() => navigate(`/cases/${hearing.case_id}`)}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`w-2 h-2 rounded-full ${getPriorityColor(
                              hearing.case_priority
                            )}`}
                          />
                          <span className="text-xs font-semibold text-gray-500">
                            {hearing.case_number}
                          </span>
                        </div>
                        <h4 className="font-semibold text-gray-900 text-sm">
                          {hearing.case_title}
                        </h4>
                      </div>
                      <span className="px-2 py-0.5 text-xs font-semibold rounded bg-blue-50 text-blue-700">
                        {hearing.case_type}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs text-gray-600">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        <span>{getHearingTypeLabel(hearing.hearing_type)}</span>
                      </div>

                      {hearing.court_name && (
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-3 h-3" />
                          <span className="truncate">{hearing.court_name}</span>
                        </div>
                      )}

                      {hearing.court_hall_number && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3" />
                          <span>Hall {hearing.court_hall_number}</span>
                        </div>
                      )}

                      {hearing.judge_name && (
                        <div className="flex items-center gap-2">
                          <User className="w-3 h-3" />
                          <span>{hearing.judge_name}</span>
                        </div>
                      )}

                      {hearing.client && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <div className="font-medium text-gray-700">Client</div>
                          <div className="mt-1">{hearing.client.name}</div>
                          {hearing.client.phone && (
                            <div className="flex items-center gap-2 mt-1">
                              <Phone className="w-3 h-3" />
                              <span>{hearing.client.phone}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <span className="text-xs text-blue-600 font-medium">
                        Click to view case details →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : selectedDate ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">No hearings</p>
                <p className="text-sm text-gray-400 mt-1">
                  No hearings scheduled for this date
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">Select a date</p>
                <p className="text-sm text-gray-400 mt-1">
                  Click on a date to view hearings
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Monthly Summary - {monthName}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Hearings</span>
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-600 mt-2">
              {loading ? '...' : hearings.length}
            </p>
          </div>

          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">High Priority</span>
              <div className="w-3 h-3 rounded-full bg-red-500" />
            </div>
            <p className="text-2xl font-bold text-red-600 mt-2">
              {loading ? '...' : hearings.filter(h => h.case_priority === 'HIGH').length}
            </p>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Medium Priority</span>
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
            </div>
            <p className="text-2xl font-bold text-yellow-600 mt-2">
              {loading ? '...' : hearings.filter(h => h.case_priority === 'MEDIUM').length}
            </p>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Low Priority</span>
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <p className="text-2xl font-bold text-green-600 mt-2">
              {loading ? '...' : hearings.filter(h => h.case_priority === 'LOW').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
