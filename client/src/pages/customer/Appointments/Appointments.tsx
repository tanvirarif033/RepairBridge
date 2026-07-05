import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { appointmentService, Appointment } from '../../../services/appointment.service';
import {
  FiSearch, FiRefreshCw, FiLoader, FiInbox,
  FiCalendar, FiClock, FiMapPin, FiUser,
  FiCheckCircle, FiXCircle, FiAlertCircle,
  FiChevronLeft, FiChevronRight, FiEye
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const Appointments: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const limit = 5;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchAppointments = useCallback(async (showRefresh = false) => {
    if (!token) return;
    
    try {
      if (showRefresh) setIsRefreshing(true);
      else setLoading(true);

      const response = await appointmentService.getMyAppointments(token);
      setAppointments(response);
      setTotalAppointments(response.length);
      setTotalPages(Math.ceil(response.length / limit));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch appointments');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { bg: string; text: string; label: string; icon: any } } = {
      'PENDING': { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Pending', icon: FiClock },
      'CONFIRMED': { bg: 'bg-green-50', text: 'text-green-700', label: 'Confirmed', icon: FiCheckCircle },
      'COMPLETED': { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Completed', icon: FiCheckCircle },
      'CANCELLED': { bg: 'bg-red-50', text: 'text-red-700', label: 'Cancelled', icon: FiXCircle },
    };
    return statusMap[status] || { bg: 'bg-gray-50', text: 'text-gray-700', label: status, icon: FiAlertCircle };
  };

  const filteredAppointments = appointments.filter(a => {
    const matchesSearch = a.repairRequest?.title?.toLowerCase().includes(search.toLowerCase()) ||
                          a.repairRequest?.brand?.toLowerCase().includes(search.toLowerCase()) ||
                          a.repairRequest?.user?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || a.status === filter;
    return matchesSearch && matchesFilter;
  });

  const paginatedAppointments = filteredAppointments.slice(
    (currentPage - 1) * limit,
    currentPage * limit
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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
          <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
          <p className="text-gray-500 text-sm mt-1">
            {totalAppointments} appointment{totalAppointments > 1 ? 's' : ''} found
          </p>
        </div>
        <button
          onClick={() => fetchAppointments(true)}
          disabled={isRefreshing}
          className={`p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all ${
            isRefreshing ? 'animate-spin' : ''
          }`}
        >
          <FiRefreshCw className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by request title or brand..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {['all', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((status) => (
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
                {status === 'all' ? 'All' : status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Appointments List */}
      {paginatedAppointments.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
          <div className="w-32 h-32 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full flex items-center justify-center mx-auto">
            <FiInbox className="text-6xl text-blue-400" />
          </div>
          <h3 className="mt-6 text-2xl font-semibold text-gray-900">No Appointments Found</h3>
          <p className="mt-3 text-gray-500 max-w-md mx-auto">
            {search || filter !== 'all' 
              ? 'No appointments match your current filters.'
              : 'You don\'t have any appointments scheduled yet.'}
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
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {paginatedAppointments.map((appointment) => {
              const statusBadge = getStatusBadge(appointment.status);
              const StatusIcon = statusBadge.icon;

              return (
                <div
                  key={appointment.id}
                  onClick={() => navigate(`/appointments/${appointment.id}`)}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 p-6 cursor-pointer hover:border-blue-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {appointment.repairRequest?.title || `Appointment #${appointment.id}`}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {appointment.repairRequest?.brand} • {appointment.repairRequest?.model}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-xl text-xs font-medium flex items-center gap-1.5 ${statusBadge.bg} ${statusBadge.text}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {statusBadge.label}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <FiCalendar className="text-blue-600" />
                      <span>{new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FiClock className="text-blue-600" />
                      <span>{new Date(appointment.appointmentDate).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}</span>
                    </div>
                    {appointment.quotation?.serviceCenter && (
                      <div className="flex items-start gap-2 text-gray-600">
                        <FiMapPin className="text-blue-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-800">{appointment.quotation.serviceCenter.name}</p>
                          <p className="text-xs text-gray-500">{appointment.quotation.serviceCenter.address}</p>
                        </div>
                      </div>
                    )}
                    {appointment.quotation && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <FiCheckCircle className="text-green-600" />
                        <span>Estimated Cost: ৳{appointment.quotation.estimatedCost}</span>
                      </div>
                    )}
                    {appointment.repairRequest?.user && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <FiUser className="text-gray-400" />
                        <span>{appointment.repairRequest.user.name}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <Link
                      to={`/appointments/${appointment.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="btn-primary text-sm flex items-center gap-2 px-4 py-2 w-full justify-center"
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
        </>
      )}
    </div>
  );
};

export default Appointments;
