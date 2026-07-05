import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { adminService } from '../../../services/admin.service';
import {
  FiArrowLeft, FiSave, FiDollarSign, FiClock,
  FiCalendar, FiUser, FiSmartphone, FiLoader,
  FiCheckCircle, FiAlertCircle
} from 'react-icons/fi';
import toast from 'react-hot-toast';

interface RequestDetail {
  id: number;
  title: string;
  brand: string;
  model: string;
  user: {
    name: string;
    email: string;
    phone?: string;
  };
  selectedServiceCenters?: Array<{
    id: number;
    name: string;
    address: string;
  }>;
}

const AdminCreateQuotation: React.FC = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [request, setRequest] = useState<RequestDetail | null>(null);
  const [formData, setFormData] = useState({
    serviceCenterId: '',
    estimatedCost: '',
    estimatedRepairDays: '',
    warranty: '',
    appointmentDate: '',
    notes: '',
  });

  useEffect(() => {
    fetchRequestDetails();
  }, [requestId]);

  const fetchRequestDetails = async () => {
    if (!requestId || !token) return;
    
    try {
      setLoading(true);
      const data = await adminService.getRequestById(token, Number(requestId));
      setRequest(data);
      
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 3);
      setFormData(prev => ({
        ...prev,
        appointmentDate: defaultDate.toISOString().split('T')[0],
      }));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch request details');
      navigate('/admin/requests');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.serviceCenterId) {
      toast.error('Please select a service center');
      return;
    }
    if (!formData.estimatedCost || Number(formData.estimatedCost) <= 0) {
      toast.error('Please enter a valid estimated cost');
      return;
    }
    if (!formData.estimatedRepairDays || Number(formData.estimatedRepairDays) <= 0) {
      toast.error('Please enter valid repair days');
      return;
    }
    if (!formData.appointmentDate) {
      toast.error('Please select an appointment date');
      return;
    }

    setSubmitting(true);
    try {
      const data = {
        repairRequestId: Number(requestId),
        serviceCenterId: Number(formData.serviceCenterId),
        estimatedCost: Number(formData.estimatedCost),
        estimatedRepairDays: Number(formData.estimatedRepairDays),
        warranty: formData.warranty || undefined,
        appointmentDate: new Date(formData.appointmentDate).toISOString(),
        notes: formData.notes || undefined,
      };

      await adminService.createQuotation(token!, data);
      toast.success('Quotation created successfully!');
      navigate('/admin/requests');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create quotation');
    } finally {
      setSubmitting(false);
    }
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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/requests')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Quotation</h1>
          <p className="text-sm text-gray-500">
            For request #{request.id} - {request.title}
          </p>
        </div>
      </div>

      {/* Request Info */}
      <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
        <div className="flex items-center gap-3">
          <FiSmartphone className="text-blue-600 text-xl" />
          <div>
            <p className="font-medium text-gray-900">{request.brand} {request.model}</p>
            <p className="text-sm text-gray-600">Customer: {request.user.name}</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-6">
        {/* Service Center */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Select Service Center *
          </label>
          <select
            name="serviceCenterId"
            value={formData.serviceCenterId}
            onChange={handleChange}
            className="input-field"
            required
          >
            <option value="">Select a service center</option>
            {request.selectedServiceCenters?.map((center) => (
              <option key={center.id} value={center.id}>
                {center.name} - {center.address}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Estimated Cost */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
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
                placeholder="e.g., 3500"
                required
                min="0"
              />
            </div>
          </div>

          {/* Estimated Repair Days */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Estimated Repair Days *
            </label>
            <div className="relative">
              <FiClock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                name="estimatedRepairDays"
                value={formData.estimatedRepairDays}
                onChange={handleChange}
                className="input-field pl-10"
                placeholder="e.g., 2"
                required
                min="1"
              />
            </div>
          </div>
        </div>

        {/* Warranty */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Warranty
          </label>
          <input
            type="text"
            name="warranty"
            value={formData.warranty}
            onChange={handleChange}
            className="input-field"
            placeholder="e.g., 30 Days, 6 Months"
          />
        </div>

        {/* Appointment Date */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
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
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Notes (Optional)
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="input-field"
            rows={3}
            placeholder="Any additional notes for the customer..."
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => navigate('/admin/requests')}
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
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Creating...
              </>
            ) : (
              <>
                <FiSave className="w-4 h-4" />
                Create Quotation
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminCreateQuotation;