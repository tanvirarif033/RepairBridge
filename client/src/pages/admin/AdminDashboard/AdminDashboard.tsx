import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { adminService, AdminStats } from '../../../services/admin.service';
import {
  FiUsers, FiFileText, FiDollarSign, FiCalendar,
  FiTrendingUp, FiCheckCircle, FiClock, FiAlertCircle,
  FiLoader, FiRefreshCw, FiArrowUp, FiArrowDown
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const AdminDashboard: React.FC = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalRepairRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    cancelledRequests: 0,
    quotationSent: 0,
    appointmentConfirmed: 0,
    repairInProgress: 0,
    completedRepairs: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const data = await adminService.getDashboardStats(token);
      setStats(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: FiUsers, color: 'blue' },
    { label: 'Total Requests', value: stats.totalRepairRequests, icon: FiFileText, color: 'purple' },
    { label: 'Pending', value: stats.pendingRequests, icon: FiClock, color: 'yellow' },
    { label: 'Completed', value: stats.completedRepairs, icon: FiCheckCircle, color: 'green' },
  ];

  const statusCards = [
    { label: 'Approved', value: stats.approvedRequests, color: 'blue', icon: FiCheckCircle },
    { label: 'Rejected', value: stats.rejectedRequests, color: 'red', icon: FiAlertCircle },
    { label: 'Cancelled', value: stats.cancelledRequests, color: 'gray', icon: FiAlertCircle },
    { label: 'In Progress', value: stats.repairInProgress, color: 'cyan', icon: FiTrendingUp },
  ];

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
          <FiLoader className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600 text-xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
     
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Welcome back! Here's what's happening with your business.</p>
        </div>
        <button
          onClick={fetchStats}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
        >
          <FiRefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl bg-${stat.color}-50`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

     
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statusCards.map((card, index) => (
          <div key={index} className={`bg-${card.color}-50 rounded-xl p-4 border border-${card.color}-100`}>
            <div className="flex items-center gap-3">
              <card.icon className={`w-5 h-5 text-${card.color}-600`} />
              <div>
                <p className={`text-xs font-medium text-${card.color}-700`}>{card.label}</p>
                <p className={`text-xl font-bold text-${card.color}-800`}>{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/admin/requests"
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all hover:border-blue-200"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <FiFileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Manage Requests</h3>
              <p className="text-sm text-gray-500">Review and manage repair requests</p>
            </div>
          </div>
        </Link>

        <Link
          to="/admin/users"
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all hover:border-blue-200"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-xl">
              <FiUsers className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Manage Users</h3>
              <p className="text-sm text-gray-500">View and manage all users</p>
            </div>
          </div>
        </Link>

        <Link
          to="/admin/quotations"
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all hover:border-blue-200"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 rounded-xl">
              <FiDollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Quotations</h3>
              <p className="text-sm text-gray-500">Create and manage quotations</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;