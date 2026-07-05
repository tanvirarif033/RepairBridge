import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { adminService } from '../../../services/admin.service';
import { locationService, NearbyPlace } from '../../../services/location.service';
import {
  FiArrowLeft, FiDollarSign, FiClock, FiCalendar,
  FiCheckCircle, FiXCircle, FiAlertCircle, FiRefreshCw,
  FiLoader, FiUser, FiPhone, FiMapPin, FiTool,
  FiShield, FiMessageSquare, FiEdit2, FiSave,
  FiHome, FiSearch, FiNavigation, FiCheck, FiX, FiStar,
  FiClock as FiClockIcon
} from 'react-icons/fi';
import toast from 'react-hot-toast';

interface SelectedServiceCenter {
  id: number;
  name: string;
  address: string;
  phone?: string;
  rating?: number;
}

interface QuotationDetail {
  id: number;
  repairRequestId: number;
  serviceCenterId: number;
  estimatedCost: number;
  estimatedRepairDays: number;
  warranty?: string;
  appointmentDate: string;
  notes?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  repairRequest?: {
    id: number;
    title: string;
    brand: string;
    model: string;
    description?: string;
    user: {
      id: number;
      name: string;
      email: string;
      phone?: string;
    };
    selectedServiceCenters?: SelectedServiceCenter[];
  };
  serviceCenter?: {
    id: number;
    name: string;
    address: string;
    phone?: string;
    rating?: number;
  };
  appointment?: {
    id: number;
    appointmentDate: string;
    status: string;
  };
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

const AdminQuotationDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [quotation, setQuotation] = useState<QuotationDetail | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    estimatedCost: '',
    estimatedRepairDays: '',
    warranty: '',
    appointmentDate: '',
    appointmentTime: '',
    notes: '',
    status: '',
  });

  const [showServiceCenterModal, setShowServiceCenterModal] = useState(false);
  const [nearbyCenters, setNearbyCenters] = useState<NearbyPlace[]>([]);
  const [searchingCenters, setSearchingCenters] = useState(false);
  const [selectedNewCenter, setSelectedNewCenter] = useState<NearbyPlace | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [updatingCenter, setUpdatingCenter] = useState(false);

  useEffect(() => {
    if (id && token) {
      fetchQuotationDetails();
    }
  }, [id, token]);

  const fetchQuotationDetails = async () => {
    if (!id || !token) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getQuotationById(token, Number(id));
      setQuotation(data);
      
      const appointmentDate = data.appointmentDate ? new Date(data.appointmentDate) : null;
      
      setFormData({
        estimatedCost: data.estimatedCost?.toString() || '',
        estimatedRepairDays: data.estimatedRepairDays?.toString() || '',
        warranty: data.warranty || '',
        appointmentDate: appointmentDate ? appointmentDate.toISOString().split('T')[0] : '',
        appointmentTime: appointmentDate ? appointmentDate.toTimeString().slice(0, 5) : '',
        notes: data.notes || '',
        status: data.status || '',
      });
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Fetch error:', error);
      setError(apiError.response?.data?.message || 'Failed to fetch quotation details');
      toast.error(apiError.response?.data?.message || 'Failed to fetch quotation details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let appointmentDateTime = null;
      if (formData.appointmentDate) {
        const date = new Date(formData.appointmentDate);
        if (formData.appointmentTime) {
          const [hours, minutes] = formData.appointmentTime.split(':').map(Number);
          date.setHours(hours, minutes);
        }
        appointmentDateTime = date.toISOString();
      }

      const data = {
        estimatedCost: Number(formData.estimatedCost),
        estimatedRepairDays: Number(formData.estimatedRepairDays),
        warranty: formData.warranty || undefined,
        appointmentDate: appointmentDateTime,
        notes: formData.notes || undefined,
        status: formData.status,
      };

      await adminService.adminUpdateQuotation(token!, Number(id), data);
      toast.success('Quotation updated successfully');
      setIsEditing(false);
      fetchQuotationDetails();
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.response?.data?.message || 'Failed to update quotation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!confirm(`Are you sure you want to change status to ${newStatus.replace(/_/g, ' ')}?`)) return;
    
    setSubmitting(true);
    try {
      await adminService.adminUpdateQuotation(token!, Number(id), { status: newStatus });
      toast.success(`Quotation status updated to ${newStatus.replace(/_/g, ' ')}`);
      fetchQuotationDetails();
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.response?.data?.message || 'Failed to update status');
    } finally {
      setSubmitting(false);
    }
  };

  const getUserLocation = async () => {
    try {
      const position = await locationService.getCurrentPosition();
      setUserLocation({ lat: position.lat, lng: position.lng });
      return position;
    } catch (error: any) {
      toast.error('Failed to get your location. Please enter address manually.');
      return null;
    }
  };

  const searchNearbyCenters = async () => {
    const location = await getUserLocation();
    if (!location) return;

    setSearchingCenters(true);
    try {
      const places = await locationService.searchNearbyPlaces(location.lat, location.lng, 5000);
      setNearbyCenters(places);
      if (places.length === 0) {
        toast.info('No service centers found near your location.');
      }
    } catch (error) {
      toast.error('Failed to search service centers');
    } finally {
      setSearchingCenters(false);
    }
  };

  const openServiceCenterModal = async () => {
    setShowServiceCenterModal(true);
    await searchNearbyCenters();
  };

  const handleUpdateServiceCenter = async () => {
    if (!selectedNewCenter) {
      toast.error('Please select a service center');
      return;
    }

    setUpdatingCenter(true);
    try {
      // Try to find the center in existing service centers
      let centerId = parseInt(selectedNewCenter.id);
      
      // If ID is not valid, try to find by name in the repair request's service centers
      if (isNaN(centerId) || centerId === 0) {
        const existingCenter = quotation?.repairRequest?.selectedServiceCenters?.find(
          (sc: any) => sc.name === selectedNewCenter.name
        );
        
        if (existingCenter) {
          centerId = existingCenter.id;
        } else {
          // Use the first available service center
          const firstCenter = quotation?.repairRequest?.selectedServiceCenters?.[0];
          if (firstCenter) {
            centerId = firstCenter.id;
          } else {
            toast.error('No valid service center found. Please create one first.');
            return;
          }
        }
      }

      await adminService.updateQuotationServiceCenter(
        token!, 
        Number(id), 
        centerId,
        `Admin changed service center to: ${selectedNewCenter.name} | Address: ${selectedNewCenter.address} | Phone: ${selectedNewCenter.phone || 'N/A'} | Distance: ${selectedNewCenter.distance ? (selectedNewCenter.distance * 1000).toFixed(0) + 'm' : 'N/A'}`
      );
      
      toast.success(`Service center updated to "${selectedNewCenter.name}" successfully!`);
      setShowServiceCenterModal(false);
      setSelectedNewCenter(null);
      fetchQuotationDetails();
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Update error:', error);
      toast.error(apiError.response?.data?.message || 'Failed to update service center');
    } finally {
      setUpdatingCenter(false);
    }
  };

  const handleUseCustomerRequestedCenter = async () => {
    if (!anotherCenterInfo) {
      toast.error('No customer requested center found');
      return;
    }

    if (!confirm(`Do you want to use "${anotherCenterInfo.name}" as the new service center?`)) {
      return;
    }

    setUpdatingCenter(true);
    try {
      // Try to find the center in existing service centers by name
      let centerId = quotation?.serviceCenterId;
      
      // If no service center ID, try to find by name
      if (!centerId && quotation?.repairRequest?.selectedServiceCenters?.length) {
        const existingCenter = quotation.repairRequest.selectedServiceCenters.find(
          (sc: any) => sc.name === anotherCenterInfo.name
        );
        if (existingCenter) {
          centerId = existingCenter.id;
        } else {
          // Use the first available service center
          centerId = quotation.repairRequest.selectedServiceCenters[0]?.id;
        }
      }
      
      if (!centerId) {
        toast.error('No service center available to update');
        return;
      }

      await adminService.updateQuotationServiceCenter(
        token!, 
        Number(id), 
        centerId,
        `Admin updated service center to customer's requested: ${anotherCenterInfo.name} | Address: ${anotherCenterInfo.address} | Phone: ${anotherCenterInfo.phone || 'N/A'}`
      );
      
      toast.success(`Service center updated to "${anotherCenterInfo.name}" successfully!`);
      setShowServiceCenterModal(false);
      fetchQuotationDetails();
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Update error:', error);
      toast.error(apiError.response?.data?.message || 'Failed to update service center');
    } finally {
      setUpdatingCenter(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { bg: string; text: string; label: string; icon: any } } = {
      'PENDING': { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Pending Review', icon: FiClock },
      'ACCEPTED': { bg: 'bg-green-50', text: 'text-green-700', label: 'Accepted', icon: FiCheckCircle },
      'REJECTED': { bg: 'bg-red-50', text: 'text-red-700', label: 'Rejected', icon: FiXCircle },
      'RESCHEDULE_REQUESTED': { bg: 'bg-orange-50', text: 'text-orange-700', label: 'Reschedule Requested', icon: FiClockIcon },
      'ANOTHER_SERVICE_CENTER_REQUESTED': { bg: 'bg-purple-50', text: 'text-purple-700', label: 'Another Center Requested', icon: FiAlertCircle },
    };
    return statusMap[status] || { bg: 'bg-gray-50', text: 'text-gray-700', label: status, icon: FiAlertCircle };
  };

  const getCustomerResponseMessage = () => {
    if (!quotation) return null;
    if (quotation.status === 'RESCHEDULE_REQUESTED') {
      return 'Customer has requested a reschedule. Please update the appointment date and time.';
    }
    if (quotation.status === 'ANOTHER_SERVICE_CENTER_REQUESTED') {
      return 'Customer has requested another service center. Please update the service center.';
    }
    if (quotation.status === 'REJECTED') {
      return 'Customer has rejected this quotation.';
    }
    if (quotation.status === 'ACCEPTED') {
      return 'Customer has accepted this quotation. Appointment has been confirmed.';
    }
    return null;
  };

  const getRescheduleInfo = (notes?: string) => {
    if (!notes) return null;
    
    const rescheduleMatch = notes.match(/RESCHEDULE_REQUEST:\s*([^|]+)\s*\|\s*Customer requested reschedule to: (.*?)(?:\.|$)/);
    if (rescheduleMatch) {
      try {
        const isoDateStr = rescheduleMatch[1].trim();
        const date = new Date(isoDateStr);
        if (!isNaN(date.getTime())) {
          return {
            requestedDate: date,
            dateStr: date.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }),
            timeStr: date.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            }),
            fullDateTime: date.toLocaleString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
          };
        }
      } catch (e) {
        console.error('Error parsing reschedule date:', e);
      }
    }
    
    const fallbackMatch = notes.match(/Customer requested reschedule to: (.*?)(?:\.|$)/);
    if (fallbackMatch) {
      try {
        const dateStr = fallbackMatch[1];
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          return {
            requestedDate: date,
            dateStr: date.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }),
            timeStr: date.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            }),
            fullDateTime: date.toLocaleString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
          };
        }
      } catch (e) {
        console.error('Error parsing reschedule date (fallback):', e);
      }
    }
    
    return null;
  };

  const getAnotherCenterInfo = (notes?: string) => {
    if (!notes) return null;
    
    const fullMatch = notes.match(/ANOTHER_CENTER_REQUEST: (.*?) \| Address: (.*?)(?: \| Phone: (.*?))?(?: \| Distance: (.*?))?(?:$|\.)/);
    if (fullMatch) {
      return {
        name: fullMatch[1].trim(),
        address: fullMatch[2].trim() || 'Address not provided',
        phone: fullMatch[3]?.trim() || 'N/A',
        distance: fullMatch[4]?.trim() || 'N/A',
      };
    }
    
    const simpleMatch = notes.match(/ANOTHER_CENTER_REQUEST: (.*?)(?:$|\.)/);
    if (simpleMatch) {
      return {
        name: simpleMatch[1].trim(),
        address: 'Address not provided',
        phone: 'N/A',
        distance: 'N/A',
      };
    }
    
    const oldMatch = notes.match(/Customer requested another service center[:\s]*(.*?)(?:$|\.)/);
    if (oldMatch) {
      return {
        name: oldMatch[1].trim() || 'Customer requested another service center',
        address: 'Address not provided',
        phone: 'N/A',
        distance: 'N/A',
      };
    }
    
    return null;
  };

  // Get the current service center name for display
  const getCurrentServiceCenterName = () => {
    if (quotation?.serviceCenter) {
      return quotation.serviceCenter.name;
    }
    if (quotation?.repairRequest?.selectedServiceCenters?.length) {
      const center = quotation.repairRequest.selectedServiceCenters.find(
        (sc: any) => sc.id === quotation.serviceCenterId
      );
      return center?.name || 'Unknown';
    }
    return 'Unknown';
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
          <FiLoader className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600 text-xl animate-pulse" />
        </div>
        <p className="mt-4 text-gray-500">Loading quotation details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">⚠️</div>
        <p className="text-gray-500 text-lg">{error}</p>
        <div className="mt-4 flex gap-3 justify-center">
          <button
            onClick={fetchQuotationDetails}
            className="btn-primary"
          >
            Try Again
          </button>
          <Link to="/admin/quotations" className="btn-secondary">
            Back to Quotations
          </Link>
        </div>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📄</div>
        <p className="text-gray-500 text-lg">Quotation not found</p>
        <Link to="/admin/quotations" className="btn-primary mt-4 inline-block">
          Back to Quotations
        </Link>
      </div>
    );
  }

  const statusBadge = getStatusBadge(quotation.status);
  const StatusIcon = statusBadge.icon;
  const customerResponse = getCustomerResponseMessage();
  const rescheduleInfo = getRescheduleInfo(quotation.notes);
  const anotherCenterInfo = getAnotherCenterInfo(quotation.notes);
  const isAnotherCenterRequested = quotation.status === 'ANOTHER_SERVICE_CENTER_REQUESTED';
  const isRescheduleRequested = quotation.status === 'RESCHEDULE_REQUESTED';

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/quotations')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quotation Details</h1>
            <p className="text-sm text-gray-500">#{quotation.id} - {quotation.repairRequest?.title || 'Repair Request'}</p>
          </div>
        </div>
        <button
          onClick={fetchQuotationDetails}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Refresh"
        >
          <FiRefreshCw className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Customer Response Alert */}
      {customerResponse && (
        <div className={`rounded-2xl p-4 border ${
          quotation.status === 'ACCEPTED' ? 'bg-green-50 border-green-200' :
          quotation.status === 'REJECTED' ? 'bg-red-50 border-red-200' :
          'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-start gap-3">
            <div className={`mt-0.5 ${
              quotation.status === 'ACCEPTED' ? 'text-green-600' :
              quotation.status === 'REJECTED' ? 'text-red-600' :
              'text-yellow-600'
            }`}>
              {quotation.status === 'ACCEPTED' ? <FiCheckCircle className="w-5 h-5" /> :
               quotation.status === 'REJECTED' ? <FiXCircle className="w-5 h-5" /> :
               <FiAlertCircle className="w-5 h-5" />}
            </div>
            <div>
              <p className={`font-medium ${
                quotation.status === 'ACCEPTED' ? 'text-green-800' :
                quotation.status === 'REJECTED' ? 'text-red-800' :
                'text-yellow-800'
              }`}>
                Customer Response
              </p>
              <p className={`text-sm ${
                quotation.status === 'ACCEPTED' ? 'text-green-700' :
                quotation.status === 'REJECTED' ? 'text-red-700' :
                'text-yellow-700'
              }`}>
                {customerResponse}
              </p>
              {isAnotherCenterRequested && (
                <button
                  onClick={openServiceCenterModal}
                  className="mt-2 text-sm bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-1"
                >
                  <FiEdit2 className="w-4 h-4" />
                  Change Service Center
                </button>
              )}
              {isRescheduleRequested && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-2 text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                >
                  <FiEdit2 className="w-4 h-4" />
                  Update Date & Time
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Request Details */}
      {rescheduleInfo && isRescheduleRequested && (
        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
            <FiCalendar className="w-4 h-4" />
            Customer's Requested Reschedule
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-white/70 rounded-xl p-3">
              <p className="text-xs text-blue-600 font-medium">Requested Date</p>
              <p className="font-semibold text-gray-900 text-lg">{rescheduleInfo.dateStr}</p>
            </div>
            <div className="bg-white/70 rounded-xl p-3">
              <p className="text-xs text-blue-600 font-medium">Requested Time</p>
              <p className="font-semibold text-gray-900 text-lg">{rescheduleInfo.timeStr}</p>
            </div>
          </div>
          <div className="mt-3 p-3 bg-yellow-50 rounded-xl border border-yellow-200">
            <p className="text-sm text-yellow-800 flex items-start gap-2">
              <span className="text-yellow-600 text-lg">📌</span>
              <span>Please update the appointment date and time to match customer's request.</span>
            </p>
          </div>
        </div>
      )}

      {/* Another Center Request Details */}
      {anotherCenterInfo && isAnotherCenterRequested && (
        <div className="bg-purple-50 rounded-2xl p-4 border border-purple-200">
          <h4 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
            <FiHome className="w-4 h-4" />
            Customer's Requested Service Center
          </h4>
          <div className="bg-white/70 rounded-xl p-3 space-y-1">
            <p className="font-medium text-gray-900">{anotherCenterInfo.name}</p>
            <p className="text-sm text-gray-600 flex items-start gap-2">
              <FiMapPin className="text-gray-400 mt-0.5" />
              {anotherCenterInfo.address}
            </p>
            {anotherCenterInfo.phone && anotherCenterInfo.phone !== 'N/A' && (
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <FiPhone className="text-gray-400" />
                {anotherCenterInfo.phone}
              </p>
            )}
            {anotherCenterInfo.distance && anotherCenterInfo.distance !== 'N/A' && (
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <FiMapPin className="w-3 h-3" />
                {anotherCenterInfo.distance} away
              </p>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={handleUseCustomerRequestedCenter}
              disabled={updatingCenter}
              className="text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {updatingCenter ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <FiCheck className="w-4 h-4" />
              )}
              Use Customer's Requested Center
            </button>
            <button
              onClick={() => {
                setShowServiceCenterModal(true);
                searchNearbyCenters();
              }}
              className="text-sm bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <FiEdit2 className="w-4 h-4" />
              Choose Different Center
            </button>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to keep the current service center and change status to PENDING?')) {
                  handleStatusUpdate('PENDING');
                }
              }}
              className="text-sm bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Keep Current & Reset
            </button>
          </div>
          <p className="text-sm text-purple-700 mt-2">
            <span className="font-medium">💡 Tip:</span> Click "Use Customer's Requested Center" to directly apply their choice, or "Choose Different Center" to select another.
          </p>
        </div>
      )}

      {/* Status & Actions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 ${statusBadge.bg} ${statusBadge.text}`}>
              <StatusIcon className="w-4 h-4" />
              {statusBadge.label}
            </span>
            <span className="text-sm text-gray-500">
              Created: {new Date(quotation.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {!isEditing && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-primary text-sm flex items-center gap-2"
                >
                  <FiEdit2 className="w-4 h-4" />
                  Edit Quotation
                </button>
                {quotation.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate('ACCEPTED')}
                      disabled={submitting}
                      className="btn-success text-sm flex items-center gap-2"
                    >
                      <FiCheckCircle className="w-4 h-4" />
                      Accept
                    </button>
                    <button
                      onClick={() => handleStatusUpdate('REJECTED')}
                      disabled={submitting}
                      className="btn-danger text-sm flex items-center gap-2"
                    >
                      <FiXCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </>
                )}
              </>
            )}
            {quotation.appointment && (
              <Link
                to={`/admin/appointments/${quotation.appointment.id}`}
                className="btn-secondary text-sm flex items-center gap-2"
              >
                <FiCalendar className="w-4 h-4" />
                View Appointment
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Edit Form */}
      {isEditing && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FiEdit2 className="text-blue-600" /> Edit Quotation
          </h3>
          <form onSubmit={handleUpdateQuotation} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Estimated Cost (BDT) *
                </label>
                <div className="relative">
                  <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    name="estimatedCost"
                    value={formData.estimatedCost}
                    onChange={handleChange}
                    className="input-field pl-10"
                    required
                    min="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Repair Days *
                </label>
                <div className="relative">
                  <FiClock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    name="estimatedRepairDays"
                    value={formData.estimatedRepairDays}
                    onChange={handleChange}
                    className="input-field pl-10"
                    required
                    min="1"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Warranty
              </label>
              <input
                type="text"
                name="warranty"
                value={formData.warranty}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., 30 Days"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Appointment Date *
                </label>
                <div className="relative">
                  <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    name="appointmentDate"
                    value={formData.appointmentDate}
                    onChange={handleChange}
                    className="input-field pl-10"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Appointment Time *
                </label>
                <div className="relative">
                  <FiClockIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="time"
                    name="appointmentTime"
                    value={formData.appointmentTime}
                    onChange={handleChange}
                    className="input-field pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="input-field"
              >
                <option value="PENDING">Pending</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="REJECTED">Rejected</option>
                <option value="RESCHEDULE_REQUESTED">Reschedule Requested</option>
                <option value="ANOTHER_SERVICE_CENTER_REQUESTED">Another Center Requested</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="input-field"
                rows={3}
                placeholder="Additional notes..."
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <FiSave className="w-4 h-4" />
                    Update Quotation
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Quotation Details Display */}
      {!isEditing && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Cost & Time */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FiDollarSign className="text-blue-600" /> Quotation Summary
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-500">Estimated Cost</p>
                  <p className="text-2xl font-bold text-blue-600">৳{quotation.estimatedCost}</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-500">Repair Time</p>
                  <p className="text-2xl font-bold text-purple-600">{quotation.estimatedRepairDays} days</p>
                </div>
              </div>
              {quotation.warranty && (
                <div className="mt-4 flex items-center gap-2 bg-green-50 rounded-xl p-3">
                  <FiShield className="text-green-600" />
                  <span className="text-sm text-green-700">Warranty: {quotation.warranty}</span>
                </div>
              )}
            </div>

            {/* Appointment Date */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FiCalendar className="text-blue-600" /> Appointment Details
              </h3>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium text-gray-900">
                    {quotation.appointmentDate ? new Date(quotation.appointmentDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    }) : 'Not set'}
                  </p>
                </div>
                <div className="flex-1 bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">Time</p>
                  <p className="font-medium text-gray-900">
                    {quotation.appointmentDate ? new Date(quotation.appointmentDate).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    }) : 'Not set'}
                  </p>
                </div>
              </div>
              {quotation.notes && !quotation.notes.includes('RESCHEDULE_REQUEST') && !quotation.notes.includes('ANOTHER_CENTER_REQUEST') && (
                <div className="mt-3 flex items-start gap-2 bg-gray-50 rounded-xl p-3">
                  <FiMessageSquare className="text-gray-400 mt-0.5" />
                  <p className="text-sm text-gray-600">{quotation.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FiUser className="text-blue-600" /> Customer
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                    {quotation.repairRequest?.user?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="font-medium">{quotation.repairRequest?.user?.name || 'Unknown'}</p>
                    <p className="text-sm text-gray-500">{quotation.repairRequest?.user?.email || 'No email'}</p>
                  </div>
                </div>
                {quotation.repairRequest?.user?.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FiPhone className="text-gray-400" />
                    {quotation.repairRequest.user.phone}
                  </div>
                )}
              </div>
            </div>

            {/* Service Center */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FiTool className="text-blue-600" /> Service Center
              </h3>
              <div className="space-y-2">
                <p className="font-medium text-gray-900">{getCurrentServiceCenterName()}</p>
                {quotation.serviceCenter && (
                  <>
                    <p className="text-sm text-gray-600 flex items-start gap-2">
                      <FiMapPin className="text-gray-400 mt-0.5" />
                      {quotation.serviceCenter.address}
                    </p>
                    {quotation.serviceCenter.phone && (
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <FiPhone className="text-gray-400" />
                        {quotation.serviceCenter.phone}
                      </p>
                    )}
                    {quotation.serviceCenter.rating && (
                      <span className="inline-flex items-center gap-1 text-sm text-yellow-600">
                        <span className="text-yellow-400">★</span> {quotation.serviceCenter.rating}
                      </span>
                    )}
                  </>
                )}
                <button
                  onClick={openServiceCenterModal}
                  className="mt-3 w-full bg-purple-50 text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <FiEdit2 className="w-4 h-4" />
                  Change Service Center
                </button>
              </div>
            </div>

            {/* Appointment Status */}
            {quotation.appointment && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FiCheckCircle className="text-blue-600" /> Appointment Status
                </h3>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    quotation.appointment.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                    quotation.appointment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                    quotation.appointment.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {quotation.appointment.status}
                  </span>
                  <Link
                    to={`/admin/appointments/${quotation.appointment.id}`}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Service Center Change Modal */}
      {showServiceCenterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 animate-slideUp">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Change Service Center</h3>
              <button
                onClick={() => {
                  setShowServiceCenterModal(false);
                  setSelectedNewCenter(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-gray-600 text-sm mb-4">
              Search and select a new service center for this quotation
            </p>

            <button
              onClick={searchNearbyCenters}
              disabled={searchingCenters}
              className="w-full bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {searchingCenters ? (
                <span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <FiSearch className="w-4 h-4" />
              )}
              {searchingCenters ? 'Searching...' : 'Search Nearby Centers'}
            </button>

            {searchingCenters ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-4 text-gray-500">Searching nearby service centers...</p>
              </div>
            ) : nearbyCenters.length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto mt-4">
                {nearbyCenters.map((center) => (
                  <div
                    key={center.id}
                    onClick={() => setSelectedNewCenter(center)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedNewCenter?.id === center.id
                        ? 'border-purple-600 bg-purple-50 shadow-md shadow-purple-100'
                        : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-gray-900">{center.name}</h4>
                          {center.rating && (
                            <span className="flex items-center gap-1 text-sm bg-yellow-50 px-2 py-0.5 rounded-full">
                              <FiStar className="fill-yellow-400 text-yellow-400" /> 
                              <span className="font-medium">{center.rating}</span>
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{center.address}</p>
                        {center.phone && (
                          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <FiPhone className="w-3.5 h-3.5" /> {center.phone}
                          </p>
                        )}
                        {center.distance && (
                          <p className="text-xs text-gray-400 mt-1">
                            {(center.distance * 1000).toFixed(0)}m away
                          </p>
                        )}
                      </div>
                      {selectedNewCenter?.id === center.id && (
                        <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <FiCheck className="text-white text-sm" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-xl mt-4">
                <FiMapPin className="text-4xl text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No service centers found</p>
                <button
                  onClick={searchNearbyCenters}
                  className="mt-3 btn-primary text-sm"
                >
                  <FiRefreshCw className="inline mr-1" /> Retry
                </button>
              </div>
            )}

            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={() => {
                  setShowServiceCenterModal(false);
                  setSelectedNewCenter(null);
                }}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateServiceCenter}
                disabled={!selectedNewCenter || updatingCenter}
                className="flex-1 bg-purple-600 text-white py-2.5 rounded-xl font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {updatingCenter ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <FiSave className="w-4 h-4" />
                    Update Center
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQuotationDetails;