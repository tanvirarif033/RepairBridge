import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { quotationService, Quotation } from '../../../services/quotation.service';
import { 
  FiFileText, FiDollarSign, FiClock, FiCheckCircle, 
  FiXCircle, FiAlertCircle, FiRefreshCw, FiEye,
  FiCalendar, FiLoader, FiInbox, FiTrendingUp
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const Quotations: React.FC = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async (showRefresh = false) => {
    if (!token) {
      setLoading(false);
      return;
    }
    
    try {
      if (showRefresh) setIsRefreshing(true);
      else setLoading(true);

      const data = await quotationService.getMyQuotations(token);
      setQuotations(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch quotations');
      setQuotations([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { bg: string; text: string; label: string; icon: any } } = {
      'PENDING': { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Pending', icon: FiClock },
      'ACCEPTED': { bg: 'bg-green-50', text: 'text-green-700', label: 'Accepted', icon: FiCheckCircle },
      'REJECTED': { bg: 'bg-red-50', text: 'text-red-700', label: 'Rejected', icon: FiXCircle },
      'RESCHEDULE_REQUESTED': { bg: 'bg-orange-50', text: 'text-orange-700', label: 'Reschedule Requested', icon: FiClock },
      'ANOTHER_SERVICE_CENTER_REQUESTED': { bg: 'bg-purple-50', text: 'text-purple-700', label: 'Another Center Requested', icon: FiAlertCircle },
    };
    return statusMap[status] || { bg: 'bg-gray-50', text: 'text-gray-700', label: status, icon: FiAlertCircle };
  };

  const filteredQuotations = quotations.filter(q => 
    filter === 'all' || q.status === filter
  );

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
          <FiLoader className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600 text-2xl animate-pulse" />
        </div>
        <p className="mt-6 text-gray-500 font-medium">Loading your quotations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Quotations</h1>
          <p className="text-gray-500 text-sm mt-1">
            {quotations.length} quotation{quotations.length > 1 ? 's' : ''} found
          </p>
        </div>
        <button
          onClick={() => fetchQuotations(true)}
          disabled={isRefreshing}
          className={`p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all ${
            isRefreshing ? 'animate-spin' : ''
          }`}
        >
          <FiRefreshCw className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
        <div className="flex flex-wrap gap-2">
          {['all', 'PENDING', 'ACCEPTED', 'REJECTED', 'RESCHEDULE_REQUESTED', 'ANOTHER_SERVICE_CENTER_REQUESTED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
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

    
      {filteredQuotations.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
          <div className="w-32 h-32 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full flex items-center justify-center mx-auto">
            <FiInbox className="text-6xl text-blue-400" />
          </div>
          <h3 className="mt-6 text-2xl font-semibold text-gray-900">No Quotations Found</h3>
          <p className="mt-3 text-gray-500 max-w-md mx-auto">
            {filter !== 'all' 
              ? 'No quotations match your current filter.'
              : 'You haven\'t received any quotations yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuotations.map((quotation) => {
            const statusBadge = getStatusBadge(quotation.status);
            const StatusIcon = statusBadge.icon;

            return (
              <div key={quotation.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
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
                        {new Date(quotation.appointmentDate).toLocaleDateString()}
                      </span>
                      {quotation.warranty && (
                        <span className="flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-full text-green-700 text-xs">
                          <FiCheckCircle className="w-3 h-3" />
                          {quotation.warranty} warranty
                        </span>
                      )}
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      <p>{quotation.serviceCenter?.name}</p>
                      <p className="text-xs">{quotation.serviceCenter?.address}</p>
                    </div>
                  </div>
                  <Link
                    to={`/quotations/${quotation.id}`}
                    className="btn-primary text-sm flex items-center gap-2 px-4 py-2 whitespace-nowrap"
                  >
                    <FiEye className="w-4 h-4" /> View Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Quotations;