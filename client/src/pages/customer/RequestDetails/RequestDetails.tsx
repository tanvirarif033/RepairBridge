import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { repairRequestService } from '../../../services/repairRequest.service';
import {
  FiArrowLeft, FiClock, FiCheckCircle, FiXCircle, FiAlertCircle,
  FiMapPin, FiUser, FiPhone, FiMail, FiCalendar, FiPackage,
  FiTool, FiStar, FiMessageCircle, FiRefreshCw
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { RepairRequest } from '../../../types/repairRequest.types';

const RequestDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [request, setRequest] = useState<RepairRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchRequestDetails();
  }, [id]);

  const fetchRequestDetails = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await repairRequestService.getById(token!, parseInt(id));
      setRequest(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch request details');
      navigate('/my-requests');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!id || !confirm('Are you sure you want to cancel this repair request?')) return;
    
    setCancelling(true);
    try {
      await repairRequestService.cancel(token!, parseInt(id));
      toast.success('Repair request cancelled successfully');
      fetchRequestDetails();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel request');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { color: string; label: string; icon: any } } = {
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

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading request details...</p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Request not found</p>
        <Link to="/my-requests" className="btn-primary mt-4 inline-block">
          Back to My Requests
        </Link>
      </div>
    );
  }

  const statusBadge = getStatusBadge(request.status);
  const StatusIcon = statusBadge.icon;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/my-requests')}
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
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Refresh"
        >
          <FiRefreshCw className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className={`badge ${statusBadge.color} text-sm px-4 py-2`}>
              <StatusIcon className="w-4 h-4 mr-2 inline" />
              {statusBadge.label}
            </span>
            <span className="text-sm text-gray-500">
              Created: {new Date(request.createdAt).toLocaleDateString()}
            </span>
          </div>
          {request.status === 'PENDING' && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="btn-danger text-sm flex items-center gap-2"
            >
              {cancelling ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Cancelling...
                </>
              ) : (
                'Cancel Request'
              )}
            </button>
          )}
        </div>
      </div>

      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
       
        <div className="lg:col-span-2 space-y-6">
         
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiPackage className="text-blue-600" /> Device Information
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

         
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FiMessageCircle className="text-blue-600" /> Problem Description
            </h3>
            <p className="text-gray-700 leading-relaxed">{request.description}</p>
          </div>
        </div>

       
        <div className="space-y-6">
          {/* Location */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FiMapPin className="text-blue-600" /> Location
            </h3>
            <p className="text-gray-700">{request.customerAddress}</p>
            <div className="mt-2 text-xs text-gray-400">
              Lat: {request.customerLatitude}, Lng: {request.customerLongitude}
            </div>
          </div>

         
          {request.selectedServiceCenters && request.selectedServiceCenters.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FiTool className="text-blue-600" /> Service Center
              </h3>
              {request.selectedServiceCenters.map((center, index) => (
                <div key={index} className="space-y-1">
                  <p className="font-medium text-gray-900">{center.name}</p>
                  <p className="text-sm text-gray-600">{center.address}</p>
                  {center.phone && (
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <FiPhone className="w-3 h-3" /> {center.phone}
                    </p>
                  )}
                  {center.rating && (
                    <span className="flex items-center gap-1 text-sm text-yellow-600">
                      <FiStar className="fill-yellow-400" /> {center.rating}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

     
      <div className="flex flex-wrap gap-3">
        {request.status === 'QUOTATION_SENT' && (
          <Link to={`/quotations/${request.id}`} className="btn-primary">
            View Quotation
          </Link>
        )}
        {request.status === 'COMPLETED' && (
          <Link to={`/reviews/create/${request.id}`} className="btn-primary">
            Write a Review
          </Link>
        )}
        <Link to="/my-requests" className="btn-secondary">
          Back to Requests
        </Link>
      </div>
    </div>
  );
};

export default RequestDetails;