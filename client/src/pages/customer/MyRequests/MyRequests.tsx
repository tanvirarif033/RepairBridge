import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { repairRequestService } from '../../../services/repairRequest.service';
import { 
  FiSearch, FiPlus, FiEye, FiClock, FiCheckCircle, 
  FiXCircle, FiAlertCircle, FiRefreshCw, FiChevronLeft, 
  FiChevronRight, FiTrash2, FiCalendar, FiTool, 
  FiMapPin, FiGrid, FiList, FiLoader, FiInbox
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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRequests, setTotalRequests] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [error, setError] = useState<string | null>(null);

  const limit = 6;

  // Fetch requests
  const fetchRequests = useCallback(async (showRefresh = false) => {
    if (!token) {
      setLoading(false);
      setError('Please login to view your requests');
      return;
    }

    try {
      if (showRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const filters: any = {
        page: currentPage,
        limit: limit,
      };

      if (search.trim()) {
        filters.search = search.trim();
      }

      if (filter !== 'all') {
        filters.status = filter;
      }

      console.log('Fetching with filters:', filters);

      const response = await repairRequestService.getAll(token, filters);
      
      console.log('API Response:', response);
      
      if (response && response.data) {
        setRequests(response.data);
        setTotalPages(response.meta?.totalPage || 1);
        setTotalRequests(response.meta?.total || 0);
      } else {
        setRequests([]);
        setTotalPages(1);
        setTotalRequests(0);
      }
    } catch (error: any) {
      console.error('Fetch error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to fetch repair requests';
      setError(errorMessage);
      toast.error(errorMessage);
      setRequests([]);
      setTotalPages(1);
      setTotalRequests(0);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [token, currentPage, search, filter]);

  // Initial fetch
  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchRequests();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Handle filter change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      fetchRequests();
    }
  }, [filter]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchRequests(true);
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

  // Get status badge
  const getStatusBadge = (status: RequestStatus) => {
    const statusMap: { [key in RequestStatus]: { bg: string; text: string; label: string; icon: any } } = {
      'PENDING': { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Pending Review', icon: FiClock },
      'APPROVED': { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Approved', icon: FiCheckCircle },
      'REJECTED': { bg: 'bg-red-50', text: 'text-red-700', label: 'Rejected', icon: FiXCircle },
      'CANCELLED': { bg: 'bg-gray-50', text: 'text-gray-700', label: 'Cancelled', icon: FiAlertCircle },
      'QUOTATION_SENT': { bg: 'bg-purple-50', text: 'text-purple-700', label: 'Quotation Sent', icon: FiClock },
      'WAITING_CUSTOMER_RESPONSE': { bg: 'bg-orange-50', text: 'text-orange-700', label: 'Waiting Response', icon: FiClock },
      'APPOINTMENT_CONFIRMED': { bg: 'bg-indigo-50', text: 'text-indigo-700', label: 'Appointment Confirmed', icon: FiCheckCircle },
      'REPAIR_IN_PROGRESS': { bg: 'bg-cyan-50', text: 'text-cyan-700', label: 'In Progress', icon: FiTool },
      'COMPLETED': { bg: 'bg-green-50', text: 'text-green-700', label: 'Completed', icon: FiCheckCircle },
    };
    return statusMap[status] || { bg: 'bg-gray-50', text: 'text-gray-700', label: status, icon: FiAlertCircle };
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    const iconMap: { [key: string]: string } = {
      'SCREEN_REPLACEMENT': '📱',
      'BATTERY_REPLACEMENT': '🔋',
      'CAMERA_REPAIR': '📷',
      'CHARGING_PORT': '🔌',
      'SPEAKER_REPAIR': '🔊',
      'MICROPHONE_REPAIR': '🎤',
      'SOFTWARE_ISSUE': '💻',
      'WATER_DAMAGE': '💧',
      'MOTHERBOARD_REPAIR': '🔧',
      'OTHER': '📦',
    };
    return iconMap[category] || '🔧';
  };

  // Get category label
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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
          <FiLoader className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600 text-2xl animate-pulse" />
        </div>
        <p className="mt-6 text-gray-500 font-medium">Loading your repair requests...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-4xl">
          <FiAlertCircle className="text-red-500" />
        </div>
        <h3 className="mt-6 text-xl font-semibold text-gray-900">Something went wrong</h3>
        <p className="mt-2 text-gray-500 text-center max-w-md">{error}</p>
        <button
          onClick={handleRefresh}
          className="mt-6 btn-primary flex items-center gap-2"
        >
          <FiRefreshCw /> Try Again
        </button>
      </div>
    );
  }

  // Empty state
  if (requests.length === 0) {
    return (
      <div className="space-y-6">
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
              className={`p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all ${isRefreshing ? 'animate-spin' : ''}`}
            >
              <FiRefreshCw className="w-5 h-5 text-gray-600" />
            </button>
            <Link to="/request-repair" className="btn-primary flex items-center gap-2">
              <FiPlus /> New Request
            </Link>
          </div>
        </div>

        {/* Search & Filter - Always show */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title, brand, or model..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {['all', 'PENDING', 'APPROVED', 'COMPLETED', 'REJECTED', 'CANCELLED'].map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setFilter(status as RequestStatus | 'all');
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

        {/* Empty State Card */}
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
          <div className="w-32 h-32 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full flex items-center justify-center mx-auto">
            <FiInbox className="text-6xl text-blue-400" />
          </div>
          <h3 className="mt-6 text-2xl font-semibold text-gray-900">No Repair Requests Found</h3>
          <p className="mt-3 text-gray-500 max-w-md mx-auto">
            {search || filter !== 'all' 
              ? 'No requests match your current filters. Try adjusting your search or filter.'
              : 'You haven\'t created any repair requests yet.'}
          </p>
          {(search || filter !== 'all') && (
            <button
              onClick={() => {
                setSearch('');
                setFilter('all');
                setCurrentPage(1);
              }}
              className="mt-4 btn-secondary"
            >
              Clear Filters
            </button>
          )}
          {!search && filter === 'all' && (
            <Link to="/request-repair" className="mt-6 btn-primary inline-flex items-center gap-2">
              <FiPlus /> Create Your First Request
            </Link>
          )}
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Repair Requests</h1>
          <p className="text-gray-500 text-sm mt-1">
            {totalRequests} request{totalRequests > 1 ? 's' : ''} found
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
            className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all hover:border-blue-300"
          >
            {viewMode === 'list' ? <FiGrid className="w-5 h-5 text-gray-600" /> : <FiList className="w-5 h-5 text-gray-600" />}
          </button>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all ${isRefreshing ? 'animate-spin' : ''}`}
          >
            <FiRefreshCw className="w-5 h-5 text-gray-600" />
          </button>
          <Link to="/request-repair" className="btn-primary flex items-center gap-2">
            <FiPlus /> New Request
          </Link>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, brand, or model..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {['all', 'PENDING', 'APPROVED', 'COMPLETED', 'REJECTED', 'CANCELLED'].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setFilter(status as RequestStatus | 'all');
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

      {/* Requests List */}
      <div className={viewMode === 'grid' 
        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
        : 'space-y-4'
      }>
        {requests.map((request) => {
          const statusBadge = getStatusBadge(request.status);
          const StatusIcon = statusBadge.icon;
          
          return (
            <div
              key={request.id}
              onClick={() => navigate(`/my-requests/${request.id}`)}
              className={`bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group border border-gray-100 hover:border-blue-200 ${
                viewMode === 'grid' ? 'p-6' : 'p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4'
              }`}
            >
              <div className={`flex-1 min-w-0 ${viewMode === 'grid' ? '' : 'w-full'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
                      {getCategoryIcon(request.repairCategory)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                        {request.title}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">
                        {request.brand} • {request.model}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 whitespace-nowrap ${statusBadge.bg} ${statusBadge.text}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {statusBadge.label}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg">
                    <span className="text-base">{getCategoryIcon(request.repairCategory)}</span>
                    {getCategoryLabel(request.repairCategory)}
                  </span>
                  <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg">
                    <FiCalendar className="w-3.5 h-3.5" />
                    {formatDate(request.createdAt)}
                  </span>
                  {request.customerAddress && (
                    <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg truncate max-w-[180px]">
                      <FiMapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{request.customerAddress}</span>
                    </span>
                  )}
                </div>
              </div>

              <div className={`flex items-center gap-2 ${viewMode === 'grid' ? 'mt-4 pt-4 border-t border-gray-100 w-full justify-end' : 'flex-shrink-0'}`}>
                {request.status === 'PENDING' && (
                  <button
                    onClick={(e) => handleCancelRequest(request.id, e)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all hover:scale-110"
                    title="Cancel Request"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                )}
                <Link
                  to={`/my-requests/${request.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-all flex items-center gap-2 shadow-md shadow-blue-200 hover:shadow-lg"
                >
                  <FiEye className="w-4 h-4" /> View Details
                </Link>
              </div>
            </div>
          );
        })}
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
    </div>
  );
};

export default MyRequests;