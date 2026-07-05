import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { quotationService, Quotation } from '../../../services/quotation.service';
import { locationService, NearbyPlace } from '../../../services/location.service';
import {
  FiArrowLeft, FiDollarSign, FiClock, FiCalendar,
  FiCheckCircle, FiXCircle, FiAlertCircle, FiRefreshCw,
  FiLoader, FiUser, FiPhone, FiMapPin, FiTool,
  FiShield, FiMessageSquare, FiHome, FiSend, FiInfo,
  FiEdit2, FiCheck, FiSearch, FiNavigation, FiStar
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const QuotationDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  
  // Another Service Center states
  const [showServiceCenterModal, setShowServiceCenterModal] = useState(false);
  const [nearbyCenters, setNearbyCenters] = useState<NearbyPlace[]>([]);
  const [searchingCenters, setSearchingCenters] = useState(false);
  const [selectedNewCenter, setSelectedNewCenter] = useState<NearbyPlace | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const fetchQuotationDetails = async () => {
    if (!id || !token) return;
    
    try {
      setLoading(true);
      const data = await quotationService.getById(token, Number(id));
      setQuotation(data);
    } catch (error: any) {
      console.error('Fetch error:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch quotation details');
      navigate('/quotations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && token) {
      fetchQuotationDetails();
    }
  }, [id, token]);

  const getUserLocation = async () => {
    try {
      const position = await locationService.getCurrentPosition();
      setUserLocation({ lat: position.lat, lng: position.lng });
      return position;
    } catch (error: any) {
      toast.error('Failed to get your location. Please try again.');
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

  const handleAction = async (action: 'ACCEPT' | 'REJECT' | 'RESCHEDULE' | 'ANOTHER_SERVICE_CENTER') => {
    if (action === 'RESCHEDULE') {
      if (!newDate) {
        toast.error('Please select a new date');
        return;
      }
      if (!newTime) {
        toast.error('Please select a new time');
        return;
      }
      const dateTime = new Date(`${newDate}T${newTime}`);
      if (!confirm(`Are you sure you want to request reschedule to ${dateTime.toLocaleString()}?`)) return;
    } else if (action === 'ANOTHER_SERVICE_CENTER') {
      if (!selectedNewCenter) {
        toast.error('Please select a service center');
        return;
      }
      const centerDetails = `ANOTHER_CENTER_REQUEST: ${selectedNewCenter.name} | Address: ${selectedNewCenter.address} | Phone: ${selectedNewCenter.phone || 'N/A'} | Distance: ${selectedNewCenter.distance ? (selectedNewCenter.distance * 1000).toFixed(0) + 'm' : 'N/A'}`;
      if (!confirm(`Are you sure you want to request "${selectedNewCenter.name}" as new service center?`)) return;
    } else {
      const actionLabels = {
        'ACCEPT': 'accept',
        'REJECT': 'reject',
      };
      if (!confirm(`Are you sure you want to ${actionLabels[action as keyof typeof actionLabels] || action.toLowerCase()} this quotation?`)) return;
    }
    
    setActionLoading(true);
    try {
      let result;
      if (action === 'RESCHEDULE') {
        const dateTime = new Date(`${newDate}T${newTime}`);
        result = await quotationService.customerAction(token!, Number(id), action, {
          newDate: dateTime.toISOString(),
          notes: `Customer requested reschedule to: ${dateTime.toLocaleString()}`
        });
      } else if (action === 'ANOTHER_SERVICE_CENTER') {
        const centerDetails = `ANOTHER_CENTER_REQUEST: ${selectedNewCenter.name} | Address: ${selectedNewCenter.address} | Phone: ${selectedNewCenter.phone || 'N/A'} | Distance: ${selectedNewCenter.distance ? (selectedNewCenter.distance * 1000).toFixed(0) + 'm' : 'N/A'}`;
        result = await quotationService.customerAction(token!, Number(id), action, {
          notes: centerDetails
        });
      } else {
        result = await quotationService.customerAction(token!, Number(id), action);
      }
      
      toast.success(`Quotation ${action.toLowerCase()} successfully`);
      await fetchQuotationDetails();
      
      if (action === 'ACCEPT') {
        setTimeout(() => navigate('/appointments'), 2000);
      }
    } catch (error: any) {
      console.error('Action error:', error);
      toast.error(error.response?.data?.message || `Failed to ${action.toLowerCase()} quotation`);
    } finally {
      setActionLoading(false);
      setShowRescheduleModal(false);
      setShowServiceCenterModal(false);
      setSelectedNewCenter(null);
      setNewDate('');
      setNewTime('');
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

  const getAdminResponseInfo = (notes?: string) => {
    if (!notes) return null;
    
    const adminUpdateMatch = notes.match(/Admin updated: (.*?)(?:\.|$)/);
    if (adminUpdateMatch) {
      return {
        message: adminUpdateMatch[1],
        isAdminResponse: true,
      };
    }
    
    if (notes.includes('Admin updated:')) {
      return {
        message: 'Admin has updated this quotation',
        isAdminResponse: true,
      };
    }
    
    return null;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
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

  if (!quotation) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📄</div>
        <p className="text-gray-500 text-lg">Quotation not found</p>
        <Link to="/quotations" className="btn-primary mt-4 inline-block">
          Back to Quotations
        </Link>
      </div>
    );
  }

  const statusBadge = getStatusBadge(quotation.status);
  const StatusIcon = statusBadge.icon;
  const isPending = quotation.status === 'PENDING';
  const isAccepted = quotation.status === 'ACCEPTED';
  const isRejected = quotation.status === 'REJECTED';
  const isRescheduleRequested = quotation.status === 'RESCHEDULE_REQUESTED';
  const isAnotherCenterRequested = quotation.status === 'ANOTHER_SERVICE_CENTER_REQUESTED';
  
  const adminResponse = getAdminResponseInfo(quotation.notes);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/quotations')}
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

      {/* Status Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 ${statusBadge.bg} ${statusBadge.text}`}>
              <StatusIcon className="w-4 h-4" />
              {statusBadge.label}
            </span>
            <span className="text-sm text-gray-500">
              Received: {new Date(quotation.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="text-sm text-gray-500">
            {quotation.repairRequest?.brand} • {quotation.repairRequest?.model}
          </div>
        </div>
      </div>

      {/* Admin Response */}
      {adminResponse && (
        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
          <div className="flex items-start gap-3">
            <div className="text-blue-600 mt-0.5">
              <FiInfo className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium text-blue-800">Admin Response</p>
              <p className="text-sm text-blue-700">{adminResponse.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
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
                <p className="font-medium text-gray-900">{formatDate(quotation.appointmentDate)}</p>
              </div>
              <div className="flex-1 bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500">Time</p>
                <p className="font-medium text-gray-900">{formatTime(quotation.appointmentDate)}</p>
              </div>
            </div>
          </div>

          {/* Service Center Info */}
          {quotation.serviceCenter && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FiTool className="text-blue-600" /> Service Center
              </h3>
              <div className="space-y-2">
                <p className="font-medium text-gray-900">{quotation.serviceCenter.name}</p>
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
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <h3 className="font-semibold text-gray-900 mb-4">Your Response</h3>
            
            {isPending && (
              <div className="space-y-3">
                <button
                  onClick={() => handleAction('ACCEPT')}
                  disabled={actionLoading}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-medium hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {actionLoading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <FiCheckCircle className="w-5 h-5" />
                      Accept Quotation
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => setShowRescheduleModal(true)}
                  disabled={actionLoading}
                  className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-3 rounded-xl font-medium hover:from-yellow-600 hover:to-yellow-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  <FiClock className="w-5 h-5" />
                  Request Reschedule
                </button>
                
                <button
                  onClick={openServiceCenterModal}
                  disabled={actionLoading}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 rounded-xl font-medium hover:from-purple-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  <FiHome className="w-5 h-5" />
                  Another Service Center
                </button>
                
                <button
                  onClick={() => handleAction('REJECT')}
                  disabled={actionLoading}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-xl font-medium hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  <FiXCircle className="w-5 h-5" />
                  Reject Quotation
                </button>
              </div>
            )}

            {isAccepted && (
              <div className="text-center py-4">
                <div className="text-green-600 text-4xl mb-2">✅</div>
                <p className="font-medium text-gray-900">Appointment Confirmed!</p>
                <p className="text-sm text-gray-500 mt-1">
                  Your appointment has been confirmed for {formatDate(quotation.appointmentDate)} at {formatTime(quotation.appointmentDate)}
                </p>
                <Link to="/appointments" className="btn-primary mt-4 inline-block">
                  View Appointment
                </Link>
              </div>
            )}

            {isRejected && (
              <div className="text-center py-4">
                <div className="text-red-600 text-4xl mb-2">❌</div>
                <p className="font-medium text-gray-900">Quotation Rejected</p>
                <p className="text-sm text-gray-500 mt-1">You have rejected this quotation</p>
              </div>
            )}

            {isRescheduleRequested && (
              <div className="text-center py-4">
                <div className="text-orange-600 text-4xl mb-2">🔄</div>
                <p className="font-medium text-gray-900">Reschedule Requested</p>
                <p className="text-sm text-gray-500 mt-1">Waiting for admin response</p>
                {quotation.notes && quotation.notes.includes('RESCHEDULE_REQUEST') && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm">
                    <p className="text-gray-600">Your requested reschedule is being reviewed by admin.</p>
                    <p className="text-xs text-gray-400 mt-1">You will be notified once confirmed.</p>
                  </div>
                )}
              </div>
            )}

            {isAnotherCenterRequested && (
              <div className="text-center py-4">
                <div className="text-purple-600 text-4xl mb-2">🔍</div>
                <p className="font-medium text-gray-900">Another Center Requested</p>
                <p className="text-sm text-gray-500 mt-1">Admin will review your requested service center</p>
              </div>
            )}

            {!isPending && !isAccepted && !isRejected && !isRescheduleRequested && !isAnotherCenterRequested && (
              <div className="text-center py-4">
                <p className="text-gray-500">This quotation is no longer actionable</p>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-100">
              <Link
                to={`/my-requests/${quotation.repairRequestId}`}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <FiArrowLeft className="w-4 h-4" />
                View Related Request
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slideUp">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Request Reschedule</h3>
            <p className="text-gray-600 text-sm mb-4">
              Select a new date and time for your appointment
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  New Date
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="input-field"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  New Time
                </label>
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="input-field"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRescheduleModal(false);
                    setNewDate('');
                    setNewTime('');
                  }}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAction('RESCHEDULE')}
                  disabled={actionLoading || !newDate || !newTime}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  {actionLoading ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <FiSend className="w-4 h-4" />
                      Submit Request
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Another Service Center Modal */}
      {showServiceCenterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 animate-slideUp">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Select Service Center</h3>
              <button
                onClick={() => {
                  setShowServiceCenterModal(false);
                  setSelectedNewCenter(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiXCircle className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-gray-600 text-sm mb-4">
              Choose a new service center for your repair
            </p>

            {searchingCenters ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-4 text-gray-500">Searching nearby service centers...</p>
              </div>
            ) : nearbyCenters.length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {nearbyCenters.map((center) => (
                  <div
                    key={center.id}
                    onClick={() => setSelectedNewCenter(center)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedNewCenter?.id === center.id
                        ? 'border-blue-600 bg-blue-50 shadow-md shadow-blue-100'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
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
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <FiCheck className="text-white text-sm" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-xl">
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
                onClick={() => handleAction('ANOTHER_SERVICE_CENTER')}
                disabled={!selectedNewCenter || actionLoading}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                {actionLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <FiSend className="w-4 h-4" />
                    Request Center
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

export default QuotationDetails;