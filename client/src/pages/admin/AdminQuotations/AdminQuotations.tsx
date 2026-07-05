import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { adminService, AdminQuotation } from '../../../services/admin.service';
import {
  FiSearch, FiRefreshCw, FiLoader, FiInbox,
  FiDollarSign, FiCalendar, FiClock, FiEye,
  FiCheckCircle, FiXCircle, FiAlertCircle,
  FiChevronLeft, FiChevronRight, FiUser, FiTrash2,
  FiEdit2, FiPlus
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const AdminQuotations: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [quotations, setQuotations] = useState<AdminQuotation[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalQuotations, setTotalQuotations] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const limit = 5;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchQuotations = useCallback(async (showRefresh = false) => {
    if (!token) {
      setLoading(false);
      return;
    }
    
    try {
      if (showRefresh) setIsRefreshing(true);
      else setLoading(true);

      const response = await adminService.getQuotations(
        token,
        currentPage,
        limit,
        debouncedSearch || undefined,
        filter !== 'all' ? filter : undefined
      );
      
      setQuotations(response.data);
      setTotalQuotations(response.meta.total);
      setTotalPages(response.meta.totalPage);
    } catch (error: any) {
      console.error('Fetch quotations error:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch quotations');
      setQuotations([]);
      setTotalQuotations(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [token, currentPage, debouncedSearch, filter]);

  useEffect(() => {
    fetchQuotations();
  }, [fetchQuotations]);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this quotation?')) return;
    
    try {
      await adminService.deleteQuotation(token!, id);
      toast.success('Quotation deleted successfully');
      fetchQuotations();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete quotation');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { bg: string; text: string; label: string; icon: any } } = {
      'PENDING': { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Pending Review', icon: FiClock },
      'ACCEPTED': { bg: 'bg-green-50', text: 'text-green-700', label: 'Accepted', icon: FiCheckCircle },
      'REJECTED': { bg: 'bg-red-50', text: 'text-red-700', label: 'Rejected', icon: FiXCircle },
      'RESCHEDULE_REQUESTED': { bg: 'bg-orange-50', text: 'text-orange-700', label: 'Reschedule Requested', icon: FiClock },
      'ANOTHER_SERVICE_CENTER_REQUESTED': { bg: 'bg-purple-50', text: 'text-purple-700', label: 'Another Center Requested', icon: FiAlertCircle },
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

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const clearFilters = () => {
    setSearch('');
    setFilter('all');
    setCurrentPage(1);
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
          <h1 className="text-2xl font-bold text-gray-900">Quotations</h1>
          <p className="text-sm text-gray-500">{totalQuotations} quotations found</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchQuotations(true)}
            disabled={isRefreshing}
            className={`p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all ${
              isRefreshing ? 'animate-spin' : ''
            }`}
          >
            <FiRefreshCw className="w-5 h-5 text-gray-600" />
          </button>
          <Link
            to="/admin/requests"
            className="btn-primary flex items-center gap-2"
          >
            <FiPlus className="w-4 h-4" />
            Create New
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
              placeholder="Search by request title or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {['all', 'PENDING', 'ACCEPTED', 'REJECTED', 'RESCHEDULE_REQUESTED', 'ANOTHER_SERVICE_CENTER_REQUESTED'].map((status) => (
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

      {/* Quotations List */}
      {quotations.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
          <div className="w-32 h-32 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full flex items-center justify-center mx-auto">
            <FiInbox className="text-6xl text-blue-400" />
          </div>
          <h3 className="mt-6 text-2xl font-semibold text-gray-900">No Quotations Found</h3>
          <p className="mt-3 text-gray-500 max-w-md mx-auto">
            {search || filter !== 'all' 
              ? 'No quotations match your current filters.'
              : 'No quotations have been created yet.'}
          </p>
          {(search || filter !== 'all') && (
            <button
              onClick={clearFilters}
              className="mt-4 btn-secondary"
            >
              Clear Filters
            </button>
          )}
          {!search && filter === 'all' && (
            <Link
              to="/admin/requests"
              className="mt-4 btn-primary inline-flex items-center gap-2"
            >
              <FiPlus className="w-4 h-4" />
              Create First Quotation
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {quotations.map((quotation) => {
              const statusBadge = getStatusBadge(quotation.status);
              const StatusIcon = statusBadge.icon;

              return (
                <div
                  key={quotation.id}
                  onClick={() => navigate(`/admin/quotations/${quotation.id}`)}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 p-6 cursor-pointer hover:border-blue-200"
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {quotation.repairRequest?.title || `Quotation #${quotation.id}`}
                        </h3>
                        <span className={`px-3 py-1 rounded-xl text-xs font-medium flex items-center gap-1.5 ${statusBadge.bg} ${statusBadge.text}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {statusBadge.label}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <FiDollarSign className="text-green-600" />
                          ৳{quotation.estimatedCost}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiClock className="text-blue-600" />
                          {quotation.estimatedRepairDays} days
                        </span>
                        <span className="flex items-center gap-1">
                          <FiCalendar className="text-purple-600" />
                          {quotation.appointmentDate ? new Date(quotation.appointmentDate).toLocaleDateString() : 'Not set'}
                        </span>
                        {quotation.warranty && (
                          <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                            {quotation.warranty} warranty
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex items-center gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <FiUser className="w-3.5 h-3.5" />
                          {quotation.repairRequest?.user?.name || 'Unknown'}
                        </span>
                        <span>•</span>
                        <span>{quotation.serviceCenter?.name || 'Unknown Service Center'}</span>
                        {quotation.repairRequest && (
                          <span className="text-xs text-gray-400">
                            {quotation.repairRequest.brand} • {quotation.repairRequest.model}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <Link
                        to={`/admin/quotations/${quotation.id}`}
                        className="btn-primary text-sm flex items-center gap-2 px-4 py-2 whitespace-nowrap"
                      >
                        <FiEye className="w-4 h-4" /> View
                      </Link>
                      <button
                        onClick={() => handleDelete(quotation.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all hover:scale-110"
                        title="Delete Quotation"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
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
        </>
      )}
    </div>
  );
};

export default AdminQuotations;