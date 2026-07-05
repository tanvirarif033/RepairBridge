import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { appointmentService } from '../../../services/appointment.service';
import {
  FiArrowLeft, FiCalendar, FiClock, FiMapPin,
  FiUser, FiPhone, FiCheckCircle, FiXCircle,
  FiLoader, FiRefreshCw, FiTool, FiDollarSign
} from 'react-icons/fi';
import toast from 'react-hot-toast';

// Use the same type as the service returns
interface AppointmentDetail {
  id: number;
  repairRequestId: number;
  quotationId: number;
  appointmentDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  repairRequest?: {
    id: number;
    title: string;
    brand: string;
    model: string;
    status: string;
    user?: {
      name: string;
      email: string;
      phone?: string;
    };
  };
  quotation?: {
    id: number;
    estimatedCost: number;
    serviceCenter?: {
      name: string;
      address: string;
      phone?: string;
    };
  };
}

const AppointmentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState<AppointmentDetail | null>(null);

  useEffect(() => {
    if (id && token) {
      fetchAppointmentDetails();
    }
  }, [id, token]);

  const fetchAppointmentDetails = async () => {
    if (!id || !token) return;
    
    try {
      setLoading(true);
      const data = await appointmentService.getById(token, Number(id));
      setAppointment(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch appointment details');
      navigate('/appointments');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { bg: string; text: string; label: string; icon: any } } = {
      'PENDING': { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Pending', icon: FiClock },
      'CONFIRMED': { bg: 'bg-green-50', text: 'text-green-700', label: 'Confirmed', icon: FiCheckCircle },
      'COMPLETED': { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Completed', icon: FiCheckCircle },
      'CANCELLED': { bg: 'bg-red-50', text: 'text-red-700', label: 'Cancelled', icon: FiXCircle },
    };
    return statusMap[status] || { bg: 'bg-gray-50', text: 'text-gray-700', label: status, icon: FiClock };
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

  if (!appointment) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Appointment not found</p>
        <Link to="/appointments" className="btn-primary mt-4 inline-block">
          Back to Appointments
        </Link>
      </div>
    );
  }

  const statusBadge = getStatusBadge(appointment.status);
  const StatusIcon = statusBadge.icon;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/appointments')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Appointment Details</h1>
            <p className="text-sm text-gray-500">#{appointment.id}</p>
          </div>
        </div>
        <button
          onClick={fetchAppointmentDetails}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FiRefreshCw className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Status Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3">
          <span className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 ${statusBadge.bg} ${statusBadge.text}`}>
            <StatusIcon className="w-4 h-4" />
            {statusBadge.label}
          </span>
          <span className="text-sm text-gray-500">
            Created: {new Date(appointment.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Date & Time */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FiCalendar className="text-blue-600" /> Date & Time
            </h3>
            <div className="space-y-2">
              <p className="text-gray-700">
                {new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              <p className="text-gray-700">
                {new Date(appointment.appointmentDate).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>

          {/* Service Center */}
          {appointment.quotation?.serviceCenter && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FiTool className="text-blue-600" /> Service Center
              </h3>
              <div className="space-y-2">
                <p className="font-medium text-gray-900">{appointment.quotation.serviceCenter.name}</p>
                <p className="text-sm text-gray-600 flex items-start gap-2">
                  <FiMapPin className="text-gray-400 mt-0.5" />
                  {appointment.quotation.serviceCenter.address}
                </p>
                {appointment.quotation.serviceCenter.phone && (
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <FiPhone className="text-gray-400" />
                    {appointment.quotation.serviceCenter.phone}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Repair Request */}
          {appointment.repairRequest && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FiTool className="text-blue-600" /> Repair Request
              </h3>
              <div className="space-y-2">
                <p className="font-medium text-gray-900">{appointment.repairRequest.title}</p>
                <p className="text-sm text-gray-600">
                  {appointment.repairRequest.brand} • {appointment.repairRequest.model}
                </p>
                {appointment.repairRequest.user && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FiUser className="text-gray-400" />
                    {appointment.repairRequest.user.name}
                  </div>
                )}
              </div>
              <Link
                to={`/my-requests/${appointment.repairRequestId}`}
                className="mt-3 text-sm text-blue-600 hover:text-blue-700 inline-block"
              >
                View Request →
              </Link>
            </div>
          )}

          {/* Quotation Info */}
          {appointment.quotation && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FiDollarSign className="text-blue-600" /> Quotation
              </h3>
              <p className="text-gray-700">
                Estimated Cost: ৳{appointment.quotation.estimatedCost}
              </p>
              <Link
                to={`/quotations/${appointment.quotationId}`}
                className="mt-3 text-sm text-blue-600 hover:text-blue-700 inline-block"
              >
                View Quotation →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Link to="/appointments" className="btn-secondary">
          Back to Appointments
        </Link>
        {appointment.status === 'CONFIRMED' && (
          <Link
            to={`/my-requests/${appointment.repairRequestId}`}
            className="btn-primary"
          >
            Track Request
          </Link>
        )}
      </div>
    </div>
  );
};

export default AppointmentDetails;