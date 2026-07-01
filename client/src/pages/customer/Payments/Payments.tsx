import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { paymentService, Payment } from '../../../services/payment.service';
import { 
  FiDollarSign, FiClock, FiCheckCircle, FiXCircle, 
  FiRefreshCw, FiEye, FiLoader, FiInbox, FiCreditCard,
  FiTrendingUp, FiCalendar
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const Payments: React.FC = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async (showRefresh = false) => {
    if (!token) {
      setLoading(false);
      return;
    }
    
    try {
      if (showRefresh) setIsRefreshing(true);
      else setLoading(true);

      const data = await paymentService.getMyPayments(token);
      setPayments(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch payments');
      setPayments([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { bg: string; text: string; label: string; icon: any } } = {
      'PENDING': { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Pending', icon: FiClock },
      'PARTIAL': { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Partial', icon: FiClock },
      'PAID': { bg: 'bg-green-50', text: 'text-green-700', label: 'Paid', icon: FiCheckCircle },
      'FAILED': { bg: 'bg-red-50', text: 'text-red-700', label: 'Failed', icon: FiXCircle },
      'REFUNDED': { bg: 'bg-purple-50', text: 'text-purple-700', label: 'Refunded', icon: FiCheckCircle },
    };
    return statusMap[status] || { bg: 'bg-gray-50', text: 'text-gray-700', label: status, icon: FiClock };
  };

  const getPaymentMethodLabel = (method?: string) => {
    const methodMap: { [key: string]: string } = {
      'BKASH': 'Bkash',
      'NAGAD': 'Nagad',
      'ROCKET': 'Rocket',
      'CARD': 'Card',
      'CASH': 'Cash',
    };
    return method ? methodMap[method] || method : 'N/A';
  };

  const filteredPayments = payments.filter(p => 
    filter === 'all' || p.paymentStatus === filter
  );

  // Calculate total paid
  const totalPaid = payments
    .filter(p => p.paymentStatus === 'PAID' || p.paymentStatus === 'PARTIAL')
    .reduce((sum, p) => sum + p.amount, 0);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
          <FiLoader className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600 text-2xl animate-pulse" />
        </div>
        <p className="mt-6 text-gray-500 font-medium">Loading your payments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Payments</h1>
          <p className="text-gray-500 text-sm mt-1">
            {payments.length} payment{payments.length > 1 ? 's' : ''} found
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-green-50 px-4 py-2 rounded-xl">
            <p className="text-xs text-green-600">Total Paid</p>
            <p className="text-lg font-bold text-green-700">৳{totalPaid}</p>
          </div>
          <button
            onClick={() => fetchPayments(true)}
            disabled={isRefreshing}
            className={`p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all ${
              isRefreshing ? 'animate-spin' : ''
            }`}
          >
            <FiRefreshCw className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
        <div className="flex flex-wrap gap-2">
          {['all', 'PENDING', 'PARTIAL', 'PAID', 'FAILED', 'REFUNDED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
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

      
      {filteredPayments.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
          <div className="w-32 h-32 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full flex items-center justify-center mx-auto">
            <FiInbox className="text-6xl text-blue-400" />
          </div>
          <h3 className="mt-6 text-2xl font-semibold text-gray-900">No Payments Found</h3>
          <p className="mt-3 text-gray-500 max-w-md mx-auto">
            {filter !== 'all' 
              ? 'No payments match your current filter.'
              : 'You haven\'t made any payments yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPayments.map((payment) => {
            const statusBadge = getStatusBadge(payment.paymentStatus);
            const StatusIcon = statusBadge.icon;

            return (
              <div key={payment.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {payment.quotation?.repairRequest?.title || `Payment #${payment.id}`}
                      </h3>
                      <span className={`px-3 py-1 rounded-xl text-xs font-medium flex items-center gap-1.5 ${statusBadge.bg} ${statusBadge.text}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {statusBadge.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <FiDollarSign className="text-green-600" />
                        ৳{payment.amount}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiCreditCard className="text-blue-600" />
                        {getPaymentMethodLabel(payment.paymentMethod)}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiCalendar className="text-purple-600" />
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </span>
                      {payment.transactionId && (
                        <span className="text-xs text-gray-400">
                          TX: {payment.transactionId}
                        </span>
                      )}
                    </div>
                    {payment.quotation?.serviceCenter && (
                      <p className="mt-1 text-sm text-gray-500">
                        Service: {payment.quotation.serviceCenter.name}
                      </p>
                    )}
                  </div>
                  <Link
                    to={`/payments/${payment.id}`}
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

export default Payments;