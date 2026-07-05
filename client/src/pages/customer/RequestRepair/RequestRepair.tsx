import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { repairRequestService } from '../../../services/repairRequest.service';
import LocationPicker from '../../../components/common/LocationPicker/LocationPicker';
import { NearbyPlace } from '../../../services/location.service';
import { 
  FiArrowLeft, FiCheck,  
  FiSmartphone, FiTool, FiMessageCircle,
   FiClock, FiAward, FiShield
} from 'react-icons/fi';
import toast from 'react-hot-toast';

// Import RepairCategory type
import { RepairCategory } from '../../../types/repairRequest.types';

const REPAIR_CATEGORIES = [
  { value: 'SCREEN_REPLACEMENT' as RepairCategory, label: 'Screen Replacement', icon: '📱', desc: 'Cracked or broken screen' },
  { value: 'BATTERY_REPLACEMENT' as RepairCategory, label: 'Battery Replacement', icon: '🔋', desc: 'Battery draining or swelling' },
  { value: 'CAMERA_REPAIR' as RepairCategory, label: 'Camera Repair', icon: '📷', desc: 'Camera not working properly' },
  { value: 'CHARGING_PORT' as RepairCategory, label: 'Charging Port', icon: '🔌', desc: 'Charging issues or loose port' },
  { value: 'SPEAKER_REPAIR' as RepairCategory, label: 'Speaker Repair', icon: '🔊', desc: 'No sound or distorted audio' },
  { value: 'MICROPHONE_REPAIR' as RepairCategory, label: 'Microphone Repair', icon: '🎤', desc: 'Microphone not working' },
  { value: 'SOFTWARE_ISSUE' as RepairCategory, label: 'Software Issue', icon: '💻', desc: 'OS or app related problems' },
  { value: 'WATER_DAMAGE' as RepairCategory, label: 'Water Damage', icon: '💧', desc: 'Liquid or water damage' },
  { value: 'MOTHERBOARD_REPAIR' as RepairCategory, label: 'Motherboard Repair', icon: '🔧', desc: 'Internal hardware issues' },
  { value: 'OTHER' as RepairCategory, label: 'Other', icon: '📦', desc: 'Other phone problems' },
];

// Define error type
interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

const RequestRepair: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    repairCategory: '' as RepairCategory | '',
    title: '',
    description: '',
    customerLatitude: 0,
    customerLongitude: 0,
    customerAddress: '',
    serviceCenter: null as NearbyPlace | null,
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setFormData(prev => ({
      ...prev,
      repairCategory: category as RepairCategory,
    }));
  };

  const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    setFormData(prev => ({
      ...prev,
      customerLatitude: location.lat,
      customerLongitude: location.lng,
      customerAddress: location.address,
    }));
  };

  const handlePlaceSelect = (place: NearbyPlace) => {
    setFormData(prev => ({
      ...prev,
      serviceCenter: place,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.serviceCenter) {
      toast.error('Please select a service center');
      return;
    }

    // Validate repairCategory
    if (!formData.repairCategory) {
      toast.error('Please select a repair category');
      return;
    }

    setIsSubmitting(true);
    try {
      const requestData = {
        brand: formData.brand,
        model: formData.model,
        repairCategory: formData.repairCategory as RepairCategory, // Type assertion
        title: formData.title,
        description: formData.description,
        customerLatitude: formData.customerLatitude,
        customerLongitude: formData.customerLongitude,
        customerAddress: formData.customerAddress || 'Location detected',
        serviceCenter: {
          googlePlaceId: formData.serviceCenter.id || 'place_' + Date.now(),
          name: formData.serviceCenter.name,
          address: formData.serviceCenter.address,
          phone: formData.serviceCenter.phone,
          rating: formData.serviceCenter.rating,
          latitude: formData.serviceCenter.latitude,
          longitude: formData.serviceCenter.longitude,
        },
      };

      await repairRequestService.create(token!, requestData);
      toast.success('Repair request submitted successfully!');
      navigate('/my-requests');
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.response?.data?.message || 'Failed to submit repair request');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render Step 1: Details
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

      {/* Device Info */}
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

      {/* Title */}
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

      {/* Description */}
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

      {/* Next Button */}
      <button
        type="button"
        onClick={() => setStep(2)}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3.5 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
      >
        Continue to Location <FiArrowLeft className="rotate-180" />
      </button>
    </div>
  );

  // Render Step 2: Location
  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Your Location *
        </label>
        <LocationPicker
          onLocationSelect={handleLocationSelect}
          onPlaceSelect={handlePlaceSelect}
          radius={2000}
        />
        {formData.customerAddress && (
          <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">
            📍 {formData.customerAddress}
          </div>
        )}
        {formData.serviceCenter && (
          <div className="mt-3 text-sm text-green-600 bg-green-50 p-3 rounded-xl flex items-center gap-2">
            <FiCheck className="text-green-600" />
            Selected: {formData.serviceCenter.name}
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

  // Render Step 3: Review
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
            <p className="font-medium text-gray-900">{formData.customerAddress || 'Location detected'}</p>
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

      {/* Steps Indicator */}
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
        {/* Progress Bar */}
        <div className="absolute top-6 left-0 w-full h-0.5 bg-gray-200 -z-10">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-blue-700 transition-all duration-500"
            style={{ width: `${((step - 1) / 2) * 100}%` }}
          />
        </div>
      </div>

      {/* Form Card */}
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