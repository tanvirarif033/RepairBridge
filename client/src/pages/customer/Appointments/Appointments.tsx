import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { appointmentService, Appointment } from '../../../services/appointment.service';
import { 
  FiCalendar, FiClock, FiMapPin, FiCheckCircle, 
  FiXCircle, FiAlertCircle, FiRefreshCw, FiEye,
  FiLoader, FiInbox, FiUser, FiPhone
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const Appointments: React.FC = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async (showRefresh = false) => {
    if (!token) {
      setLoading(false);
      return;
    }
    
    try {
      if (showRefresh) setIsRefreshing(true);
      else setLoading(true);

      const data = await appointmentService.getMyAppointments(token);
      setAppointments(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch appointments');
      setAppointments([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { bg: string; text: string; label: string; icon: any } } = {
      'PENDING': { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Pending', icon: FiClock },
      'CONFIRMED': { bg: 'bg-green-50', text: 'text-green-700', label: 'Confirmed', icon: FiCheckCircle },
      'COMPLETED': { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Completed', icon: FiCheckCircle },
      'CANCELLED': { bg: 'bg-red-50', text: 'text-red-700', label: 'Cancelled', icon: FiXCircle },
    };
    return statusMap[status] || { bg: 'bg-gray-50', text: 'text-gray-700', label: status, icon: FiAlertCircle };
  };

  const filteredAppointments = appointments.filter(a => 
    filter === 'all' || a.status === filter
  );

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
          <FiLoader className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600 text-2xl animate-pulse" />
        </div>
        <p className="mt-6 text-gray-500 font-medium">Loading your appointments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
   
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
          <p className="text-gray-500 text-sm mt-1">
            {appointments.length} appointment{appointments.length > 1 ? 's' : ''} found
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

     
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
        <div className="flex flex-wrap gap-2">
          {['all', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((status) => (
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

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
          <div className="w-32 h-32 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full flex items-center justify-center mx-auto">
            <FiInbox className="text-6xl text-blue-400" />
          </div>
          <h3 className="mt-6 text-2xl font-semibold text-gray-900">No Appointments Found</h3>
          <p className="mt-3 text-gray-500 max-w-md mx-auto">
            {filter !== 'all' 
              ? 'No appointments match your current filter.'
              : 'You don\'t have any appointments scheduled yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAppointments.map((appointment) => {
            const statusBadge = getStatusBadge(appointment.status);
            const StatusIcon = statusBadge.icon;

            return (
              <div key={appointment.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 p-6">
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
                    <>
                      <div className="flex items-start gap-2 text-gray-600">
                        <FiMapPin className="text-blue-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-800">{appointment.quotation.serviceCenter.name}</p>
                          <p className="text-xs text-gray-500">{appointment.quotation.serviceCenter.address}</p>
                          {appointment.quotation.serviceCenter.phone && (
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <FiPhone className="w-3 h-3" /> {appointment.quotation.serviceCenter.phone}
                            </p>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                  {appointment.quotation && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <FiCheckCircle className="text-green-600" />
                      <span>Estimated Cost: ৳{appointment.quotation.estimatedCost}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <Link
                    to={`/appointments/${appointment.id}`}
                    className="btn-primary text-sm flex items-center gap-2 px-4 py-2 w-full justify-center"
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

export default Appointments;