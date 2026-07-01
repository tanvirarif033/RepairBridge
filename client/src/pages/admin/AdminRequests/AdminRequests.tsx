import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { adminService, AdminRequest } from '../../../services/admin.service';
import { 
  FiSearch, FiEye, FiCheckCircle, FiXCircle, 
  FiAlertCircle, FiRefreshCw, FiLoader, FiInbox,
  FiCalendar, FiUser, FiMapPin, FiClock,
  FiChevronLeft, FiChevronRight
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const AdminRequests: React.FC = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRequests, setTotalRequests] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const limit = 5;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchRequests = useCallback(async (showRefresh = false) => {
    if (!token) return;

    try {
      if (showRefresh) setIsRefreshing(true);
      else setLoading(true);

      const response = await adminService.getRequests(
        token,
        currentPage,
        limit,
        debouncedSearch,
        filter
      );
      
      setRequests(response.data);
      setTotalPages(response.meta.totalPage);
      setTotalRequests(response.meta.total);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch repair requests');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [token, currentPage, debouncedSearch, filter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleAction = async (id: number, action: 'approve' | 'reject' | 'cancel') => {
    if (!confirm(`Are you sure you want to ${action} this request?`)) return;
    
    setActionLoading(id);
    try {
      let result;
      if (action === 'approve') {
        result = await adminService.approveRequest(token!, id);
        toast.success('Request approved successfully');
      } else if (action === 'reject') {
        result = await adminService.rejectRequest(token!, id);
        toast.success('Request rejected successfully');
      } else {
        result = await adminService.cancelRequest(token!, id);
        toast.success('Request cancelled successfully');
      }
      fetchRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${action} request`);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { bg: string; text: string; label: string; icon: any } } = {
      'PENDING': { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Pending', icon: FiClock },
      'APPROVED': { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Approved', icon: FiCheckCircle },
      'REJECTED': { bg: 'bg-red-50', text: 'text-red-700', label: 'Rejected', icon: FiXCircle },
      'CANCELLED': { bg: 'bg-gray-50', text: 'text-gray-700', label: 'Cancelled', icon: FiAlertCircle },
      'QUOTATION_SENT': { bg: 'bg-purple-50', text: 'text-purple-700', label: 'Quotation Sent', icon: FiClock },
      'APPOINTMENT_CONFIRMED': { bg: 'bg-indigo-50', text: 'text-indigo-700', label: 'Appointment Confirmed', icon: FiCheckCircle },
      'REPAIR_IN_PROGRESS': { bg: 'bg-cyan-50', text: 'text-cyan-700', label: 'In Progress', icon: FiClock },
      'COMPLETED': { bg: 'bg-green-50', text: 'text-green-700', label: 'Completed', icon: FiCheckCircle },
    };
    return statusMap[status] || { bg: 'bg-gray-50', text: 'text-gray-700', label: status, icon: FiAlertCircle };
  };

  const getCategoryLabel = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      'SCREEN_REPLACEMENT': 'Screen Replacement',
      'BATTERY_REPLACEMENT': 'Battery Replacement',
      'CAMERA_REPAIR': 'Camera Repair',
      'CHARGING_PORT': 'Charging Port',
      'SPEAKER_REPAIR': 'Speaker Repair',
      'MICROPHONE_REPAIR': 'Microphone Repair',
      'SOFTWARE_ISSUE': 'Software Issue',
      'WATER_DAMAGE': 'Water Damage',
      'MOTHERBOARD_REPAIR': 'Motherboard Repair',
      'OTHER': 'Other',
    };
    return categoryMap[category] || category;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

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
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Repair Requests</h1>
          <p className="text-sm text-gray-500">
            {totalRequests} request{totalRequests > 1 ? 's' : ''} found
          </p>
        </div>
        <button
          onClick={() => fetchRequests(true)}
          disabled={isRefreshing}
          className={`flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all ${
            isRefreshing ? 'animate-spin' : ''
          }`}
        >
          <FiRefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, brand, or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {['all', 'PENDING', 'APPROVED', 'COMPLETED', 'REJECTED', 'CANCELLED', 'QUOTATION_SENT'].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setFilter(status);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  filter === status
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'All' : status.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Requests Table */}
      {requests.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
          <div className="w-32 h-32 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full flex items-center justify-center mx-auto">
            <FiInbox className="text-6xl text-blue-400" />
          </div>
          <h3 className="mt-6 text-2xl font-semibold text-gray-900">No Requests Found</h3>
          <p className="mt-3 text-gray-500 max-w-md mx-auto">
            {search || filter !== 'all' 
              ? 'No requests match your current filters.'
              : 'No repair requests have been submitted yet.'}
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {requests.map((request) => {
                    const statusBadge = getStatusBadge(request.status);
                    const StatusIcon = statusBadge.icon;
                    const isLoading = actionLoading === request.id;

                    return (
                      <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{request.title}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span>{request.brand}</span>
                              <span>•</span>
                              <span>{request.model}</span>
                              <span>•</span>
                              <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                                {getCategoryLabel(request.repairCategory)}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-xs">
                              {request.user.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{request.user.name}</p>
                              <p className="text-xs text-gray-500">{request.user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 w-fit ${statusBadge.bg} ${statusBadge.text}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {statusBadge.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <FiCalendar className="w-4 h-4 text-gray-400" />
                            {formatDate(request.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/admin/requests/${request.id}`}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                              title="View Details"
                            >
                              <FiEye className="w-4 h-4" />
                            </Link>
                            {request.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => handleAction(request.id, 'approve')}
                                  disabled={isLoading}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all disabled:opacity-50"
                                  title="Approve"
                                >
                                  {isLoading ? (
                                    <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                                  ) : (
                                    <FiCheckCircle className="w-4 h-4" />
                                  )}
                                </button>
                                <button
                                  onClick={() => handleAction(request.id, 'reject')}
                                  disabled={isLoading}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                                  title="Reject"
                                >
                                  {isLoading ? (
                                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                  ) : (
                                    <FiXCircle className="w-4 h-4" />
                                  )}
                                </button>
                              </>
                            )}
                            {(request.status === 'PENDING' || request.status === 'APPROVED') && (
                              <button
                                onClick={() => handleAction(request.id, 'cancel')}
                                disabled={isLoading}
                                className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-all disabled:opacity-50"
                                title="Cancel"
                              >
                                {isLoading ? (
                                  <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <FiAlertCircle className="w-4 h-4" />
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-4 pt-4">
              <p className="text-sm text-gray-500 hidden md:block">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex items-center gap-2 mx-auto md:mx-0">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`p-2.5 rounded-xl border transition-all ${
                    currentPage === 1
                      ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-blue-400'
                  }`}
                >
                  <FiChevronLeft className="w-5 h-5" />
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 rounded-xl font-medium transition-all ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`p-2.5 rounded-xl border transition-all ${
                    currentPage === totalPages
                      ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-blue-400'
                  }`}
                >
                  <FiChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminRequests;