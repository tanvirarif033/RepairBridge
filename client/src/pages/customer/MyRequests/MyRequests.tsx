import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { repairRequestService } from '../../../services/repairRequest.service';
import { 
  FiSearch, FiFilter, FiPlus, FiEye, FiClock, FiCheckCircle, 
  FiXCircle, FiAlertCircle, FiRefreshCw, FiChevronLeft, 
  FiChevronRight, FiTrash2, FiCalendar
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { RepairRequest, RequestStatus } from '../../../types/repairRequest.types';

const MyRequests: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<RepairRequest[]>([]);
  const [filter, setFilter] = useState<RequestStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRequests, setTotalRequests] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const limit = 10;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch requests
  const fetchRequests = useCallback(async (showRefresh = false) => {
    if (!token) return;

    try {
      if (showRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }

      const filters: any = {
        page: currentPage,
        limit: limit,
      };

      if (debouncedSearch) {
        filters.search = debouncedSearch;
      }

      if (filter !== 'all') {
        filters.status = filter;
      }

      const response = await repairRequestService.getAll(token, filters);
      
      setRequests(response.data);
      setTotalPages(response.meta.totalPage);
      setTotalRequests(response.meta.total);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch repair requests');
      setRequests([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [token, currentPage, debouncedSearch, filter]);

  // Fetch on change
  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Handle refresh
  const handleRefresh = () => {
    fetchRequests(true);
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Handle cancel request
  const handleCancelRequest = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to cancel this repair request?')) {
      return;
    }

    try {
      await repairRequestService.cancel(token!, id);
      toast.success('Repair request cancelled successfully');
      fetchRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel request');
    }
  };

  // Get status badge configuration
  const getStatusBadge = (status: RequestStatus) => {
    const statusMap: { [key in RequestStatus]: { color: string; label: string; icon: any } } = {
      'PENDING': { color: 'badge-yellow', label: 'Pending', icon: FiClock },
      'APPROVED': { color: 'badge-blue', label: 'Approved', icon: FiCheckCircle },
      'REJECTED': { color: 'badge-red', label: 'Rejected', icon: FiXCircle },
      'CANCELLED': { color: 'badge-gray', label: 'Cancelled', icon: FiAlertCircle },
      'QUOTATION_SENT': { color: 'badge-purple', label: 'Quotation Sent', icon: FiClock },
      'WAITING_CUSTOMER_RESPONSE': { color: 'badge-orange', label: 'Waiting Response', icon: FiClock },
      'APPOINTMENT_CONFIRMED': { color: 'badge-indigo', label: 'Appointment Confirmed', icon: FiCheckCircle },
      'REPAIR_IN_PROGRESS': { color: 'badge-cyan', label: 'In Progress', icon: FiClock },
      'COMPLETED': { color: 'badge-green', label: 'Completed', icon: FiCheckCircle },
    };
    return statusMap[status] || { color: 'badge-gray', label: status, icon: FiAlertCircle };
  };

  // Get category label
  const getCategoryLabel = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      'SCREEN_REPLACEMENT': 'Screen Replacement',
      'BATTERY_REPLACEMENT': 'Battery Replacement',
      'CAMERA_REPAIR': 'Camera Repair',
      'CHARGING_PORT': 'Charging Port Repair',
      'SPEAKER_REPAIR': 'Speaker Repair',
      'MICROPHONE_REPAIR': 'Microphone Repair',
      'SOFTWARE_ISSUE': 'Software Issue',
      'WATER_DAMAGE': 'Water Damage',
      'MOTHERBOARD_REPAIR': 'Motherboard Repair',
      'OTHER': 'Other',
    };
    return categoryMap[category] || category;
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your repair requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Repair Requests</h1>
          <p className="text-gray-500 text-sm mt-1">
            {totalRequests > 0 ? `${totalRequests} request${totalRequests > 1 ? 's' : ''} found` : 'No requests found'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-all ${
              isRefreshing ? 'animate-spin' : ''
            }`}
          >
            <FiRefreshCw className="w-5 h-5 text-gray-600" />
          </button>
          <Link to="/request-repair" className="btn-primary flex items-center gap-2">
            <FiPlus /> New Request
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, brand, or model..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['all', 'PENDING', 'APPROVED', 'COMPLETED', 'REJECTED', 'CANCELLED', 'QUOTATION_SENT', 'REPAIR_IN_PROGRESS'].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setFilter(status as RequestStatus | 'all');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  filter === status
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'All' : status.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Requests List */}
      {requests.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <div className="text-6xl mb-4">🔧</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Repair Requests Found</h3>
          <p className="text-gray-500 mb-6">
            {search || filter !== 'all' 
              ? 'No requests match your current filters.' 
              : 'You haven\'t created any repair requests yet.'}
          </p>
          {(search || filter !== 'all') ? (
            <button
              onClick={() => {
                setSearch('');
                setFilter('all');
                setCurrentPage(1);
              }}
              className="btn-secondary"
            >
              Clear Filters
            </button>
          ) : (
            <Link to="/request-repair" className="btn-primary inline-block">
              Create Your First Request
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {requests.map((request) => {
              const statusBadge = getStatusBadge(request.status);
              const StatusIcon = statusBadge.icon;
              
              return (
                <div 
                  key={request.id} 
                  className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => navigate(`/my-requests/${request.id}`)}
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {request.title}
                        </h3>
                        <span className={`badge ${statusBadge.color}`}>
                          <StatusIcon className="w-3 h-3 mr-1 inline" />
                          {statusBadge.label}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-600">
                        <span>📱 {request.brand}</span>
                        <span>🔹 {request.model}</span>
                        <span>🔧 {getCategoryLabel(request.repairCategory)}</span>
                        <span>📍 {request.customerAddress}</span>
                        <span className="flex items-center gap-1">
                          <FiCalendar className="w-3 h-3" />
                          {formatDate(request.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {request.status === 'PENDING' && (
                        <button
                          onClick={(e) => handleCancelRequest(request.id, e)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Cancel Request"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      )}
                      <Link
                        to={`/my-requests/${request.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="btn-outline text-sm flex items-center gap-2 whitespace-nowrap"
                      >
                        <FiEye /> View Details
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg border ${
                  currentPage === 1
                    ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FiChevronLeft className="w-5 h-5" />
              </button>
              
              <span className="text-sm text-gray-600 px-4">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg border ${
                  currentPage === totalPages
                    ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FiChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyRequests;