import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { caseService } from '@/services/case.service';
import { clientService } from '@/services/client.service';
import type { DashboardStats } from '@/types/case.types';
import { Briefcase, Users, FileText, Calendar, TrendingUp, AlertCircle, MapPin } from 'lucide-react';

export const DashboardPage = () => {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [clientCount, setClientCount] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [dashboardRes, clientsRes] = await Promise.all([
        caseService.getDashboardStats().catch(() => null),
        clientService.getClients().catch(() => ({ data: [] })),
      ]);

      if (dashboardRes) {
        setStats(dashboardRes.data);
      }
      setClientCount(clientsRes.data.length);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
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
        {/* Case Statistics */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
              Case Overview
            </h3>
          </div>
          <div className="p-6 space-y-6">
            {/* Cases by Status */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">By Status</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{
                          width: `${stats?.total_cases ? (stats.cases_by_status.active / stats.total_cases) * 100 : 0}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-8 text-right">
                      {loading ? '...' : stats?.cases_by_status.active || 0}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Closed</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{
                          width: `${stats?.total_cases ? (stats.cases_by_status.closed / stats.total_cases) * 100 : 0}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-8 text-right">
                      {loading ? '...' : stats?.cases_by_status.closed || 0}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Archived</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gray-500 h-2 rounded-full"
                        style={{
                          width: `${stats?.total_cases ? (stats.cases_by_status.archived / stats.total_cases) * 100 : 0}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-8 text-right">
                      {loading ? '...' : stats?.cases_by_status.archived || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cases by Type */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">By Type</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Civil</span>
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-blue-600 mt-2">
                    {loading ? '...' : stats?.cases_by_type.civil || 0}
                  </p>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Criminal</span>
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  </div>
                  <p className="text-2xl font-bold text-red-600 mt-2">
                    {loading ? '...' : stats?.cases_by_type.criminal || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Cases by Priority */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">By Priority</h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-red-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-600 mb-1">High</p>
                  <p className="text-xl font-bold text-red-600">
                    {loading ? '...' : stats?.cases_by_priority.high || 0}
                  </p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-600 mb-1">Medium</p>
                  <p className="text-xl font-bold text-yellow-600">
                    {loading ? '...' : stats?.cases_by_priority.medium || 0}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-600 mb-1">Low</p>
                  <p className="text-xl font-bold text-green-600">
                    {loading ? '...' : stats?.cases_by_priority.low || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cases by State */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-blue-600" />
              Cases by State
            </h3>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : stats?.cases_by_state && stats.cases_by_state.length > 0 ? (
              <div className="space-y-3">
                {stats.cases_by_state.map((stateData, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{stateData.state}</p>
                        <p className="text-xs text-gray-500">
                          {((stateData.count / (stats?.total_cases || 1)) * 100).toFixed(1)}% of total
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${(stateData.count / (stats?.total_cases || 1)) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-lg font-bold text-gray-900 w-8 text-right">
                        {stateData.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">No state data available</p>
                <p className="text-sm text-gray-400 mt-1">
                  Cases will be grouped by state once you add case locations
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Two Column Layout - Recent Cases and Hearings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Cases */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Cases</h3>
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
                {stats.recent_cases.map((caseItem) => (
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
                        <div className="flex items-center space-x-3 mt-2">
                          <span
                            className={`px-2 py-0.5 text-xs font-semibold rounded ${
                              caseItem.caseStatus === 'ACTIVE'
                                ? 'bg-green-50 text-green-700'
                                : caseItem.caseStatus === 'CLOSED'
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-gray-50 text-gray-700'
                            }`}
                          >
                            {caseItem.caseStatus}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-xs font-semibold rounded ${getPriorityColor(
                              caseItem.casePriority
                            )}`}
                          >
                            {caseItem.casePriority}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Created: {new Date(caseItem.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">No recent cases</p>
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

        {/* Upcoming Hearings Info */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Hearing Schedule</h3>
            <button
              onClick={() => navigate('/cases')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View all
            </button>
          </div>
          <div className="p-6">
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-100">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-orange-600" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-orange-600 mb-2">
                  {loading ? '...' : stats?.upcoming_hearings_count || 0}
                </p>
                <p className="text-gray-700 font-medium">Upcoming Hearings</p>
                <p className="text-sm text-gray-600 mt-1">
                  Scheduled in the next 7 days
                </p>
              </div>
              <div className="mt-6 pt-6 border-t border-orange-200">
                <button
                  onClick={() => navigate('/calendar')}
                  className="w-full px-4 py-3 bg-white text-orange-600 font-medium rounded-lg hover:bg-orange-50 transition-colors shadow-sm"
                >
                  View Calendar
                </button>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-600 mb-1">Total Cases</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : stats?.total_cases || 0}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-600 mb-1">Active Cases</p>
                <p className="text-2xl font-bold text-green-600">
                  {loading ? '...' : stats?.cases_by_status.active || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
