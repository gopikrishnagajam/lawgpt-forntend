import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { caseService } from '@/services/case.service';
import type { UpcomingHearing } from '@/types/case.types';
import { Calendar, Clock, MapPin, User, Phone, Mail, Briefcase, AlertCircle, Filter } from 'lucide-react';

export const HearingsPage = () => {
  const navigate = useNavigate();
  const [hearings, setHearings] = useState<UpcomingHearing[]>([]);
  const [loading, setLoading] = useState(true);
  const [daysFilter, setDaysFilter] = useState(7);
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    fetchHearings();
  }, [daysFilter]);

  const fetchHearings = async () => {
    try {
      setLoading(true);
      const response = await caseService.getUpcomingHearings(daysFilter);
      setHearings(response.data);
    } catch (err) {
      console.error('Error fetching hearings:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (date.toDateString() === today.toDateString()) {
      return { label: 'Today', className: 'bg-red-100 text-red-700', daysAway: 0 };
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return { label: 'Tomorrow', className: 'bg-orange-100 text-orange-700', daysAway: 1 };
    } else if (diffDays <= 7) {
      return {
        label: date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
        className: 'bg-yellow-100 text-yellow-700',
        daysAway: diffDays,
      };
    } else {
      return {
        label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        className: 'bg-blue-100 text-blue-700',
        daysAway: diffDays,
      };
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toUpperCase()) {
      case 'HIGH':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'LOW':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityDot = (priority: string) => {
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

  // Filter hearings based on selected filters
  const filteredHearings = hearings.filter((hearing) => {
    if (priorityFilter !== 'all' && hearing.casePriority !== priorityFilter) return false;
    if (typeFilter !== 'all' && hearing.caseType !== typeFilter) return false;
    return true;
  });

  // Group hearings by date
  const groupedHearings = filteredHearings.reduce((groups, hearing) => {
    const dateKey = new Date(hearing.nextHearingDate).toDateString();
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(hearing);
    return groups;
  }, {} as Record<string, UpcomingHearing[]>);

  const sortedDates = Object.keys(groupedHearings).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Clock className="w-8 h-8 text-blue-600" />
              Upcoming Hearings
            </h1>
            <p className="text-gray-600 mt-1">Track and manage all upcoming court hearings</p>
          </div>

          {/* Days Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 font-medium">Show hearings for:</span>
            <div className="flex gap-2">
              {[7, 15, 30, 60, 90].map((days) => (
                <button
                  key={days}
                  onClick={() => setDaysFilter(days)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    daysFilter === days
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {days} days
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-wrap items-center gap-4 pt-6 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Priority:</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          {/* Case Type Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Case Type:</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All</option>
              <option value="CIVIL">Civil</option>
              <option value="CRIMINAL">Criminal</option>
            </select>
          </div>

          {/* Reset Filters */}
          {(priorityFilter !== 'all' || typeFilter !== 'all') && (
            <button
              onClick={() => {
                setPriorityFilter('all');
                setTypeFilter('all');
              }}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Total Hearings</span>
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-600 mt-2">
            {loading ? '...' : filteredHearings.length}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">High Priority</span>
            <div className="w-3 h-3 rounded-full bg-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-600 mt-2">
            {loading ? '...' : filteredHearings.filter((h) => h.casePriority === 'HIGH').length}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Civil Cases</span>
            <Briefcase className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {loading ? '...' : filteredHearings.filter((h) => h.caseType === 'CIVIL').length}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Criminal Cases</span>
            <AlertCircle className="w-4 h-4 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {loading ? '...' : filteredHearings.filter((h) => h.caseType === 'CRIMINAL').length}
          </p>
        </div>
      </div>

      {/* Hearings List */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-4">Loading hearings...</p>
        </div>
      ) : filteredHearings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Upcoming Hearings</h3>
          <p className="text-gray-600">
            {hearings.length === 0
              ? `No hearings scheduled in the next ${daysFilter} days`
              : 'No hearings match your selected filters'}
          </p>
          {priorityFilter !== 'all' || typeFilter !== 'all' ? (
            <button
              onClick={() => {
                setPriorityFilter('all');
                setTypeFilter('all');
              }}
              className="mt-4 px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          ) : null}
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((dateKey) => {
            const dateHearings = groupedHearings[dateKey];
            const dateInfo = formatDate(dateHearings[0].nextHearingDate);

            return (
              <div key={dateKey} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                {/* Date Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-gray-900">{dateInfo.label}</h2>
                        <p className="text-sm text-gray-600">
                          {dateHearings.length} hearing{dateHearings.length !== 1 ? 's' : ''} scheduled
                          {dateInfo.daysAway > 1 && ` • ${dateInfo.daysAway} days away`}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1.5 text-sm font-semibold rounded-lg ${dateInfo.className}`}>
                      {dateInfo.daysAway === 0
                        ? 'Today'
                        : dateInfo.daysAway === 1
                        ? 'Tomorrow'
                        : `In ${dateInfo.daysAway} days`}
                    </span>
                  </div>
                </div>

                {/* Hearings */}
                <div className="divide-y divide-gray-100">
                  {dateHearings.map((hearing) => (
                    <div
                      key={hearing.id}
                      onClick={() => navigate(`/cases/${hearing.id}`)}
                      className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        {/* Priority Indicator */}
                        <div className={`w-1 h-full ${getPriorityDot(hearing.casePriority)} rounded-full`} />

                        <div className="flex-1">
                          {/* Header */}
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-semibold text-gray-500">
                                  {hearing.caseNumber}
                                </span>
                                <span className="px-2 py-0.5 text-xs font-semibold rounded bg-blue-50 text-blue-700">
                                  {hearing.caseType}
                                </span>
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900">{hearing.caseTitle}</h3>
                            </div>
                            <span
                              className={`px-3 py-1 text-xs font-semibold rounded-lg border ${getPriorityColor(
                                hearing.casePriority
                              )}`}
                            >
                              {hearing.casePriority} PRIORITY
                            </span>
                          </div>

                          {/* Details Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {/* Court Info */}
                            <div className="space-y-2">
                              {hearing.courtName && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Briefcase className="w-4 h-4 text-gray-400" />
                                  <span>{hearing.courtName}</span>
                                </div>
                              )}
                              {hearing.courtHallNumber && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <MapPin className="w-4 h-4 text-gray-400" />
                                  <span>Court Hall {hearing.courtHallNumber}</span>
                                </div>
                              )}
                              {hearing.judgeName && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <User className="w-4 h-4 text-gray-400" />
                                  <span>{hearing.judgeName}</span>
                                </div>
                              )}
                            </div>

                            {/* Client Info */}
                            {hearing.client && (
                              <div className="bg-gray-50 rounded-lg p-3">
                                <div className="text-xs font-semibold text-gray-500 mb-2">CLIENT</div>
                                <div className="space-y-1">
                                  <div className="text-sm font-medium text-gray-900">
                                    {hearing.client.name}
                                  </div>
                                  {hearing.client.email && (
                                    <div className="flex items-center gap-2 text-xs text-gray-600">
                                      <Mail className="w-3 h-3" />
                                      <span>{hearing.client.email}</span>
                                    </div>
                                  )}
                                  {hearing.client.phone && (
                                    <div className="flex items-center gap-2 text-xs text-gray-600">
                                      <Phone className="w-3 h-3" />
                                      <span>{hearing.client.phone}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Action */}
                          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                            <span className="text-xs text-gray-500">
                              Click to view full case details
                            </span>
                            <span className="text-sm text-blue-600 font-medium">
                              View Case →
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
