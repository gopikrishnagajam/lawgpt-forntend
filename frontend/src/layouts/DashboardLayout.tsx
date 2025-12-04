import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { LogOut, Scale, User, FileText, Briefcase, Users, Shield, UserCircle, Calendar, Clock } from 'lucide-react';

export const DashboardLayout = () => {
  const navigate = useNavigate();
  const { user, sessionContext, logout } = useAuthStore();

  const isAdmin = sessionContext?.roles.includes('admin');
  const isOrganization = sessionContext?.loginType === 'organization';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <img src="/src/assets/legalnest.png" alt="LegalNest" className="w-10 h-10 object-contain" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">LegalNest</h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </span>
                    {isOrganization && (
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                        isAdmin 
                          ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white' 
                          : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                      }`}>
                        {isAdmin ? (
                          <span className="flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            ADMIN
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <UserCircle className="w-3 h-3" />
                            MEMBER
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">{user?.email}</div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 border border-transparent hover:border-red-200"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-4 py-4 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-t-lg border-b-2 border-transparent hover:border-blue-600 transition-all duration-200"
            >
              <Briefcase className="w-4 h-4" />
              Dashboard
            </Link>
            <Link
              to="/clients"
              className="flex items-center gap-2 px-4 py-4 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-t-lg border-b-2 border-transparent hover:border-blue-600 transition-all duration-200"
            >
              <Users className="w-4 h-4" />
              Clients
            </Link>
            <Link
              to="/cases"
              className="flex items-center gap-2 px-4 py-4 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-t-lg border-b-2 border-transparent hover:border-blue-600 transition-all duration-200"
            >
              <FileText className="w-4 h-4" />
              Cases
            </Link>
            <Link
              to="/hearings"
              className="flex items-center gap-2 px-4 py-4 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-t-lg border-b-2 border-transparent hover:border-blue-600 transition-all duration-200"
            >
              <Clock className="w-4 h-4" />
              Hearings
            </Link>
            <Link
              to="/calendar"
              className="flex items-center gap-2 px-4 py-4 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-t-lg border-b-2 border-transparent hover:border-blue-600 transition-all duration-200"
            >
              <Calendar className="w-4 h-4" />
              Calendar
            </Link>
            {isAdmin && (
              <Link
                to="/team"
                className="flex items-center gap-2 px-4 py-4 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-t-lg border-b-2 border-transparent hover:border-blue-600 transition-all duration-200"
              >
                <Shield className="w-4 h-4" />
                Team
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};
