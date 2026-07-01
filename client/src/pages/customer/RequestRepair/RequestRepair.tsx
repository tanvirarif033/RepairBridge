import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { repairRequestService } from '../../../services/repairRequest.service';
import { 
  FiArrowLeft, FiUpload, FiMapPin, FiSearch, FiCheck, 
  FiStar, FiPhone, FiNavigation, FiX, FiPlus, FiInfo,
  FiSmartphone, FiTool, FiMessageCircle, FiUser,
  FiHome, FiClock, FiAward, FiShield
} from 'react-icons/fi';
import toast from 'react-hot-toast';

interface ServiceCenter {
  googlePlaceId: string;
  name: string;
  address: string;
  phone?: string;
  rating?: number;
  latitude: number;
  longitude: number;
}

interface FormData {
  brand: string;
  model: string;
  repairCategory: string;
  title: string;
  description: string;
  customerLatitude: number;
  customerLongitude: number;
  customerAddress: string;
  serviceCenter: ServiceCenter | null;
}

const REPAIR_CATEGORIES = [
  { value: 'SCREEN_REPLACEMENT', label: 'Screen Replacement', icon: '📱', desc: 'Cracked or broken screen' },
  { value: 'BATTERY_REPLACEMENT', label: 'Battery Replacement', icon: '🔋', desc: 'Battery draining or swelling' },
  { value: 'CAMERA_REPAIR', label: 'Camera Repair', icon: '📷', desc: 'Camera not working properly' },
  { value: 'CHARGING_PORT', label: 'Charging Port', icon: '🔌', desc: 'Charging issues or loose port' },
  { value: 'SPEAKER_REPAIR', label: 'Speaker Repair', icon: '🔊', desc: 'No sound or distorted audio' },
  { value: 'MICROPHONE_REPAIR', label: 'Microphone Repair', icon: '🎤', desc: 'Microphone not working' },
  { value: 'SOFTWARE_ISSUE', label: 'Software Issue', icon: '💻', desc: 'OS or app related problems' },
  { value: 'WATER_DAMAGE', label: 'Water Damage', icon: '💧', desc: 'Liquid or water damage' },
  { value: 'MOTHERBOARD_REPAIR', label: 'Motherboard Repair', icon: '🔧', desc: 'Internal hardware issues' },
  { value: 'OTHER', label: 'Other', icon: '📦', desc: 'Other phone problems' },
];

const RequestRepair: React.FC = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    brand: '',
    model: '',
    repairCategory: '',
    title: '',
    description: '',
    customerLatitude: 0,
    customerLongitude: 0,
    customerAddress: '',
    serviceCenter: null,
  });
  const [nearbyCenters, setNearbyCenters] = useState<ServiceCenter[]>([]);
  const [searchingLocation, setSearchingLocation] = useState(false);
  const [searchingCenters, setSearchingCenters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get user location
  const getCurrentLocation = () => {
    setSearchingLocation(true);
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      setSearchingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({
          ...prev,
          customerLatitude: latitude,
          customerLongitude: longitude,
        }));
        
        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
          );
          const data = await response.json();
          if (data.results && data.results[0]) {
            setFormData(prev => ({
              ...prev,
              customerAddress: data.results[0].formatted_address,
            }));
          }
        } catch (error) {
          console.error('Reverse geocoding error:', error);
        }
        
        searchNearbyCenters(latitude, longitude);
        setSearchingLocation(false);
        toast.success('Location detected successfully');
      },
      (error) => {
        setSearchingLocation(false);
        toast.error('Failed to get location: ' + error.message);
      },
      { enableHighAccuracy: true }
    );
  };

  // Search nearby service centers
  const searchNearbyCenters = async (lat: number, lng: number) => {
    setSearchingCenters(true);
    try {
      // Mock data - replace with actual API
      const mockCenters: ServiceCenter[] = [
        {
          googlePlaceId: 'place1',
          name: 'Mobile Care Center',
          address: '123, Gulshan Avenue, Dhaka',
          phone: '+880 1234 567890',
          rating: 4.8,
          latitude: lat + 0.01,
          longitude: lng + 0.01,
        },
        {
          googlePlaceId: 'place2',
          name: 'Gadget Doctor',
          address: '456, Banani Road, Dhaka',
          phone: '+880 9876 543210',
          rating: 4.5,
          latitude: lat - 0.008,
          longitude: lng + 0.015,
        },
        {
          googlePlaceId: 'place3',
          name: 'Phone Lab',
          address: '789, Dhanmondi, Dhaka',
          phone: '+880 5555 555555',
          rating: 4.2,
          latitude: lat + 0.015,
          longitude: lng - 0.01,
        },
      ];
      setNearbyCenters(mockCenters);
    } catch (error) {
      toast.error('Failed to search nearby service centers');
    } finally {
      setSearchingCenters(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setFormData({
      ...formData,
      repairCategory: category,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.serviceCenter) {
      toast.error('Please select a service center');
      return;
    }

    setIsSubmitting(true);
    try {
      const requestData = {
        brand: formData.brand,
        model: formData.model,
        repairCategory: formData.repairCategory as any,
        title: formData.title,
        description: formData.description,
        customerLatitude: formData.customerLatitude,
        customerLongitude: formData.customerLongitude,
        customerAddress: formData.customerAddress,
        serviceCenter: formData.serviceCenter,
      };

      await repairRequestService.create(token!, requestData);
      toast.success('Repair request submitted successfully!');
      navigate('/my-requests');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit repair request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      {/* Category Selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Select Repair Category *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {REPAIR_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => handleCategorySelect(cat.value)}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                selectedCategory === cat.value
                  ? 'border-blue-600 bg-blue-50 shadow-md shadow-blue-100'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
              }`}
            >
              <div className="text-2xl mb-1">{cat.icon}</div>
              <div className="text-sm font-medium text-gray-900">{cat.label}</div>
              <div className="text-xs text-gray-500 mt-0.5">{cat.desc}</div>
            </button>
          ))}
        </div>
      </div>

     
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Phone Brand *
          </label>
          <div className="relative">
            <FiSmartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="e.g., iPhone, Samsung, Xiaomi"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Phone Model *
          </label>
          <div className="relative">
            <FiTool className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="model"
              value={formData.model}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="e.g., iPhone 13, Galaxy S23"
              required
            />
          </div>
        </div>
      </div>

     
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Request Title *
        </label>
        <div className="relative">
          <FiMessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Brief title of your repair request"
            required
          />
        </div>
      </div>

     
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Problem Description *
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
          rows={4}
          placeholder="Describe your phone problem in detail..."
          required
        />
      </div>

     
      <button
        type="button"
        onClick={() => setStep(2)}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3.5 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
      >
        Continue to Location <FiArrowLeft className="rotate-180" />
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
     
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Your Location *
        </label>
        <div className="space-y-3">
          <button
            type="button"
            onClick={getCurrentLocation}
            disabled={searchingLocation}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3.5 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg shadow-green-200 flex items-center justify-center gap-2"
          >
            {searchingLocation ? (
              <>
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Detecting Location...
              </>
            ) : (
              <>
                <FiNavigation /> Use Current Location
              </>
            )}
          </button>
          <div className="relative">
            <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="customerAddress"
              value={formData.customerAddress}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Or enter your address manually"
            />
          </div>
        </div>
      </div>

    
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Select Service Center *
        </label>
        {searchingCenters ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-500">Searching nearby service centers...</p>
          </div>
        ) : nearbyCenters.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {nearbyCenters.map((center) => (
              <div
                key={center.googlePlaceId}
                onClick={() => setFormData({ ...formData, serviceCenter: center })}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  formData.serviceCenter?.googlePlaceId === center.googlePlaceId
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
                  </div>
                  {formData.serviceCenter?.googlePlaceId === center.googlePlaceId && (
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
            <p className="text-gray-500">Use your location to find nearby service centers</p>
          </div>
        )}
      </div>

     
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="flex-1 bg-gray-100 text-gray-700 py-3.5 rounded-xl font-semibold hover:bg-gray-200 transition-all"
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => setStep(3)}
          disabled={!formData.serviceCenter}
          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3.5 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          Review & Submit <FiCheck />
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
     
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FiCheck className="text-blue-600" /> Review Your Request
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/60 rounded-xl p-3">
            <p className="text-xs text-gray-500">Brand</p>
            <p className="font-medium text-gray-900">{formData.brand}</p>
          </div>
          <div className="bg-white/60 rounded-xl p-3">
            <p className="text-xs text-gray-500">Model</p>
            <p className="font-medium text-gray-900">{formData.model}</p>
          </div>
          <div className="bg-white/60 rounded-xl p-3">
            <p className="text-xs text-gray-500">Category</p>
            <p className="font-medium text-gray-900">
              {REPAIR_CATEGORIES.find(c => c.value === formData.repairCategory)?.label}
            </p>
          </div>
          <div className="bg-white/60 rounded-xl p-3">
            <p className="text-xs text-gray-500">Title</p>
            <p className="font-medium text-gray-900">{formData.title}</p>
          </div>
          <div className="bg-white/60 rounded-xl p-3 md:col-span-2">
            <p className="text-xs text-gray-500">Location</p>
            <p className="font-medium text-gray-900">{formData.customerAddress}</p>
          </div>
          <div className="bg-white/60 rounded-xl p-3 md:col-span-2">
            <p className="text-xs text-gray-500">Service Center</p>
            <p className="font-medium text-gray-900">{formData.serviceCenter?.name}</p>
            <p className="text-sm text-gray-500">{formData.serviceCenter?.address}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setStep(2)}
          className="flex-1 bg-gray-100 text-gray-700 py-3.5 rounded-xl font-semibold hover:bg-gray-200 transition-all"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3.5 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg shadow-green-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Submitting...
            </>
          ) : (
            <>
              Submit Request <FiCheck />
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/my-requests')}
          className="p-3 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Request Repair</h1>
          <p className="text-gray-500 text-sm">Fill in the details to submit a repair request</p>
        </div>
      </div>

      <div className="relative mb-10">
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex flex-col items-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  s <= step
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200 scale-110'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {s <= step ? <FiCheck className="text-xl" /> : s}
              </div>
              <span className={`text-xs mt-2 font-medium ${
                s <= step ? 'text-blue-600' : 'text-gray-400'
              }`}>
                {s === 1 ? 'Details' : s === 2 ? 'Location' : 'Review'}
              </span>
            </div>
          ))}
        </div>
        
        <div className="absolute top-6 left-0 w-full h-0.5 bg-gray-200 -z-10">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-blue-700 transition-all duration-500"
            style={{ width: `${((step - 1) / 2) * 100}%` }}
          />
        </div>
      </div>

     
      <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
        <form onSubmit={handleSubmit}>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </form>
      </div>

      {/* Trust Badges */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <FiShield className="text-blue-600" />
          <span>100% Secure</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <FiClock className="text-blue-600" />
          <span>Quick Response</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <FiAward className="text-blue-600" />
          <span>Quality Guarantee</span>
        </div>
      </div>
    </div>
  );
};

export default RequestRepair;