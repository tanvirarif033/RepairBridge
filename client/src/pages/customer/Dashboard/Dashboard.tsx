import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiUser, FiFileText, FiClock, FiCreditCard, FiStar, FiTool,
  FiCheckCircle, FiXCircle, FiAlertCircle, FiTrendingUp,
  FiCalendar, FiDollarSign, FiPackage, FiRefreshCw
} from 'react-icons/fi';
import { useAuth } from '../../../context/AuthContext';
import { dashboardService } from '../../../services/dashboard.service';
import toast from 'react-hot-toast';

interface DashboardStats {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  cancelledRequests: number;
  completedRequests: number;
  totalPayments: number;
  totalSpent: number;
}

interface RecentActivity {
  id: number;
  title: string;
  status: string;
  date: string;
  type: 'request' | 'payment' | 'appointment';
}

const Dashboard: React.FC = () => {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    cancelledRequests: 0,
    completedRequests: 0,
    totalPayments: 0,
    totalSpent: 0,
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const statsData = await dashboardService.getStats(token);
        setStats(statsData);

        const activities = await dashboardService.getRecentActivities(token);
        setRecentActivities(activities);
      } catch (error: any) {
        console.error('Dashboard error:', error);
        toast.error(error.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  const statCards = [
    { 
      label: 'Total Requests', 
      value: stats.totalRequests, 
      icon: FiFileText, 
      bg: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    { 
      label: 'Pending', 
      value: stats.pendingRequests, 
      icon: FiClock, 
      bg: 'bg-yellow-50',
      textColor: 'text-yellow-600'
    },
    { 
      label: 'Completed', 
      value: stats.completedRequests, 
      icon: FiCheckCircle, 
      bg: 'bg-green-50',
      textColor: 'text-green-600'
    },
    { 
      label: 'Total Spent', 
      value: `৳${stats.totalSpent}`, 
      icon: FiDollarSign, 
      bg: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
  ];

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { color: string; label: string } } = {
      'PENDING': { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      'APPROVED': { color: 'bg-blue-100 text-blue-800', label: 'Approved' },
      'REJECTED': { color: 'bg-red-100 text-red-800', label: 'Rejected' },
      'CANCELLED': { color: 'bg-gray-100 text-gray-800', label: 'Cancelled' },
      'QUOTATION_SENT': { color: 'bg-purple-100 text-purple-800', label: 'Quotation Sent' },
      'APPOINTMENT_CONFIRMED': { color: 'bg-indigo-100 text-indigo-800', label: 'Appointment Confirmed' },
      'REPAIR_IN_PROGRESS': { color: 'bg-cyan-100 text-cyan-800', label: 'In Progress' },
      'COMPLETED': { color: 'bg-green-100 text-green-800', label: 'Completed' },
    };
    return statusMap[status] || { color: 'bg-gray-100 text-gray-800', label: status };
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'request':
        return <FiPackage className="text-blue-500" />;
      case 'payment':
        return <FiDollarSign className="text-green-500" />;
      case 'appointment':
        return <FiCalendar className="text-purple-500" />;
      default:
        return <FiClock className="text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 md:p-8 text-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-blue-100">
                {user?.role === 'ADMIN' ? 'Admin Dashboard' : 'Customer Dashboard'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg text-sm">
              <span className="font-semibold">{stats.totalRequests}</span> Total Requests
            </span>
            <button 
              onClick={() => window.location.reload()}
              className="bg-white/20 backdrop-blur-sm p-2 rounded-lg hover:bg-white/30 transition-colors"
            >
              <FiRefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-full ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={stat.textColor} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center">
              <FiCheckCircle className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Approved</p>
              <p className="text-lg font-bold text-gray-900">{stats.approvedRequests}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center">
              <FiXCircle className="text-red-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Rejected</p>
              <p className="text-lg font-bold text-gray-900">{stats.rejectedRequests}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center">
              <FiAlertCircle className="text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Cancelled</p>
              <p className="text-lg font-bold text-gray-900">{stats.cancelledRequests}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-50 rounded-full flex items-center justify-center">
              <FiTrendingUp className="text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Payments</p>
              <p className="text-lg font-bold text-gray-900">{stats.totalPayments}</p>
            </div>
          </div>
        </div>
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/request-repair"
          className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all hover:-translate-y-1 text-center group"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-200 transition-colors">
            <FiTool className="text-xl text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Request Repair</h3>
          <p className="text-sm text-gray-500">Submit a new repair request</p>
        </Link>

        <Link
          to="/my-requests"
          className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all hover:-translate-y-1 text-center group"
        >
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-green-200 transition-colors">
            <FiFileText className="text-xl text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900">My Requests</h3>
          <p className="text-sm text-gray-500">Track your repair status</p>
        </Link>

        <Link
          to="/profile"
          className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all hover:-translate-y-1 text-center group"
        >
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-200 transition-colors">
            <FiUser className="text-xl text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Profile</h3>
          <p className="text-sm text-gray-500">Manage your account</p>
        </Link>
      </div>

      

      {recentActivities.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FiClock className="text-blue-600" />
            Recent Activities
          </h3>
          <div className="space-y-3">
            {recentActivities.map((activity) => {
              const statusBadge = getStatusBadge(activity.status);
              return (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    {getActivityIcon(activity.type)}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.date).toLocaleDateString()} at {new Date(activity.date).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${statusBadge.color}`}>
                    {statusBadge.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;