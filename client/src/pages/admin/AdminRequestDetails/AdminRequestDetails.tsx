import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { adminService } from '../../../services/admin.service';
import {
  FiArrowLeft, FiUser, FiMail, FiPhone, FiMapPin,
  FiCalendar, FiClock, FiTool, FiSmartphone,
  FiCheckCircle, FiXCircle, FiAlertCircle, FiRefreshCw,
  FiLoader, FiDollarSign, FiMessageSquare, FiImage,
  FiEdit2, FiSend
} from 'react-icons/fi';
import toast from 'react-hot-toast';

interface RequestDetail {
  id: number;
  title: string;
  brand: string;
  model: string;
  repairCategory: string;
  description: string;
  status: string;
  createdAt: string;
  customerAddress: string;
  customerLatitude: number;
  customerLongitude: number;
  user: {
    id: number;
    name: string;
    email: string;
    phone?: string;
  };
  selectedServiceCenters?: Array<{
    id: number;
    name: string;
    address: string;
    phone?: string;
    rating?: number;
  }>;
  images?: Array<{
    id: number;
    imageUrl: string;
  }>;
}

const AdminRequestDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState<RequestDetail | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchRequestDetails();
  }, [id]);

  const fetchRequestDetails = async () => {
    if (!id || !token) return;
    
    try {
      setLoading(true);
      // Mock data - Replace with actual API call
      const mockRequest: RequestDetail = {
        id: Number(id),
        title: 'Screen Replacement',
        brand: 'iPhone 13',
        model: 'A2633',
        repairCategory: 'SCREEN_REPLACEMENT',
        description: 'The screen is completely cracked and not responding to touch. Need urgent replacement with original display.',
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        customerAddress: '123, Gulshan Avenue, Dhaka',
        customerLatitude: 23.7925,
        customerLongitude: 90.4078,
        user: {
          id: 1,
          name: 'Md. Rahman',
          email: 'rahman@example.com',
          phone: '+880 1234 567890',
        },
        selectedServiceCenters: [
          {
            id: 1,
            name: 'Mobile Care Center',
            address: '123, Gulshan Avenue, Dhaka',
            phone: '+880 1234 567890',
            rating: 4.8,
          }
        ],
        images: [
          { id: 1, imageUrl: 'https://via.placeholder.com/200' },
          { id: 2, imageUrl: 'https://via.placeholder.com/200' },
        ]
      };
      setRequest(mockRequest);
    } catch (error: any) {
      toast.error('Failed to fetch request details');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: 'approve' | 'reject' | 'cancel') => {
    if (!confirm(`Are you sure you want to ${action} this request?`)) return;
    
    setActionLoading(true);
    try {

      toast.success(`Request ${action}d successfully`);
      fetchRequestDetails();
    } catch (error: any) {
      toast.error(`Failed to ${action} request`);
    } finally {
      setActionLoading(false);
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

  if (!request) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Request not found</p>
        <Link to="/admin/requests" className="btn-primary mt-4 inline-block">
          Back to Requests
        </Link>
      </div>
    );
  }

  const statusBadge = getStatusBadge(request.status);
  const StatusIcon = statusBadge.icon;

  return (
    <div className="space-y-6">
     
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/requests')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Request Details</h1>
            <p className="text-sm text-gray-500">#{request.id} - {request.title}</p>
          </div>
        </div>
        <button
          onClick={fetchRequestDetails}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
        >
          <FiRefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 ${statusBadge.bg} ${statusBadge.text}`}>
              <StatusIcon className="w-4 h-4" />
              {statusBadge.label}
            </span>
            <span className="text-sm text-gray-500">
              Created: {new Date(request.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex gap-2">
            {request.status === 'PENDING' && (
              <>
                <button
                  onClick={() => handleAction('approve')}
                  disabled={actionLoading}
                  className="btn-success text-sm flex items-center gap-2"
                >
                  <FiCheckCircle className="w-4 h-4" />
                  Approve
                </button>
                <button
                  onClick={() => handleAction('reject')}
                  disabled={actionLoading}
                  className="btn-danger text-sm flex items-center gap-2"
                >
                  <FiXCircle className="w-4 h-4" />
                  Reject
                </button>
              </>
            )}
            {(request.status === 'PENDING' || request.status === 'APPROVED') && (
              <button
                onClick={() => handleAction('cancel')}
                disabled={actionLoading}
                className="btn-secondary text-sm flex items-center gap-2"
              >
                <FiAlertCircle className="w-4 h-4" />
                Cancel
              </button>
            )}
            {request.status === 'APPROVED' && (
              <Link
                to={`/admin/quotations/create/${request.id}`}
                className="btn-primary text-sm flex items-center gap-2"
              >
                <FiDollarSign className="w-4 h-4" />
                Create Quotation
              </Link>
            )}
          </div>
        </div>
      </div>

      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Device Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiSmartphone className="text-blue-600" /> Device Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Brand</p>
                <p className="font-medium">{request.brand}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Model</p>
                <p className="font-medium">{request.model}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Category</p>
                <p className="font-medium">{getCategoryLabel(request.repairCategory)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Title</p>
                <p className="font-medium">{request.title}</p>
              </div>
            </div>
          </div>

        
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FiMessageSquare className="text-blue-600" /> Problem Description
            </h3>
            <p className="text-gray-700 leading-relaxed">{request.description}</p>
          </div>

         
          {request.images && request.images.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FiImage className="text-blue-600" /> Attached Images
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {request.images.map((image) => (
                  <div key={image.id} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={image.imageUrl}
                      alt={`Request image ${image.id}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

       
        <div className="space-y-6">
        
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FiUser className="text-blue-600" /> Customer
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                  {request.user.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium">{request.user.name}</p>
                  <p className="text-sm text-gray-500">{request.user.email}</p>
                </div>
              </div>
              {request.user.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FiPhone className="text-gray-400" />
                  {request.user.phone}
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiMail className="text-gray-400" />
                {request.user.email}
              </div>
            </div>
          </div>

        
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FiMapPin className="text-blue-600" /> Location
            </h3>
            <p className="text-gray-700">{request.customerAddress}</p>
            <div className="mt-2 text-xs text-gray-400">
              Lat: {request.customerLatitude}, Lng: {request.customerLongitude}
            </div>
          </div>

          {request.selectedServiceCenters && request.selectedServiceCenters.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FiTool className="text-blue-600" /> Service Center
              </h3>
              {request.selectedServiceCenters.map((center) => (
                <div key={center.id} className="space-y-1">
                  <p className="font-medium text-gray-900">{center.name}</p>
                  <p className="text-sm text-gray-600">{center.address}</p>
                  {center.phone && (
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <FiPhone className="w-3 h-3" /> {center.phone}
                    </p>
                  )}
                  {center.rating && (
                    <span className="inline-flex items-center gap-1 text-sm text-yellow-600">
                      <span className="text-yellow-400">★</span> {center.rating}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminRequestDetails;