import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { caseService } from '@/services/case.service';
import { clientService } from '@/services/client.service';
import type { UpcomingHearing, DashboardStats } from '@/types/case.types';
import { Briefcase, Users, FileText, Calendar } from 'lucide-react';

export const DashboardPage = () => {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [clientCount, setClientCount] = useState(0);
  const [upcomingHearings, setUpcomingHearings] = useState<UpcomingHearing[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [dashboardRes, clientsRes, hearingsRes] = await Promise.all([
        caseService.getDashboardStats().catch(() => null),
        clientService.getClients().catch(() => ({ data: [] })),
        caseService.getUpcomingHearings(7).catch(() => ({ data: [] })),
      ]);

      if (dashboardRes) {
        setStats(dashboardRes.data);
      }
      setClientCount(clientsRes.data.length);
      setUpcomingHearings(hearingsRes.data.slice(0, 5));
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'text-red-600 bg-red-50';
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-50';
      case 'LOW':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl">
        <h2 className="text-3xl font-bold">
          Welcome back, {user?.firstName}! 👋
        </h2>
        <p className="mt-2 text-blue-100">Here's what's happening with your cases today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Clients</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {loading ? '...' : clientCount}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Cases</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {loading ? '...' : stats?.total_cases || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Cases</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {loading ? '...' : stats?.cases_by_status.active || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Upcoming Hearings</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {loading ? '...' : stats?.upcoming_hearings_count || 0}
              </p>
              <p className="mt-1 text-xs text-orange-600 font-medium">Next 7 days</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Hearings */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Hearings</h3>
            <button
              onClick={() => navigate('/cases')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View all
            </button>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : upcomingHearings.length > 0 ? (
              <div className="space-y-4">
                {upcomingHearings.map((hearing) => (
                  <div
                    key={hearing.id}
                    onClick={() => navigate(`/cases/${hearing.id}`)}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900">{hearing.caseNumber}</h4>
                          <span
                            className={`px-2 py-0.5 text-xs font-semibold rounded ${getPriorityColor(
                              hearing.casePriority
                            )}`}
                          >
                            {hearing.casePriority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{hearing.caseTitle}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(hearing.nextHearingDate)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{hearing.courtName}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">No upcoming hearings</p>
                <p className="text-sm text-gray-400 mt-1">
                  You're all caught up for the next 7 days
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Cases */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Active Cases</h3>
            <button
              onClick={() => navigate('/cases')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View all
            </button>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : stats?.recent_cases && stats.recent_cases.length > 0 ? (
              <div className="space-y-4">
                {stats.recent_cases.slice(0, 5).map((caseItem) => (
                  <div
                    key={caseItem.id}
                    onClick={() => navigate(`/cases/${caseItem.id}`)}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900">{caseItem.caseNumber}</h4>
                          <span className="px-2 py-0.5 text-xs font-semibold rounded bg-blue-50 text-blue-700">
                            {caseItem.caseType}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{caseItem.caseTitle}</p>
                        {caseItem.client && (
                          <p className="text-xs text-gray-500 mt-1">
                            Client: {caseItem.client.name}
                          </p>
                        )}
                        <div className="flex items-center space-x-4 mt-2">
                          <span
                            className={`px-2 py-0.5 text-xs font-semibold rounded ${getPriorityColor(
                              caseItem.casePriority
                            )}`}
                          >
                            {caseItem.casePriority}
                          </span>
                          {caseItem.nextHearingDate && (
                            <span className="text-xs text-gray-500">
                              Next: {formatDate(caseItem.nextHearingDate)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">No active cases</p>
                <p className="text-sm text-gray-400 mt-1">
                  Start by creating your first case
                </p>
                <button
                  onClick={() => navigate('/cases')}
                  className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md"
                >
                  Create Case
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
