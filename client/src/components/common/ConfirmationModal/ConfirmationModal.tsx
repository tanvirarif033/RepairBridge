import React from 'react';
import { FiAlertCircle, FiCheckCircle, FiXCircle, FiInfo } from 'react-icons/fi';
import Modal from '../Modal/Modal';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'success' | 'info';
  isLoading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning',
  isLoading = false,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <FiAlertCircle className="w-12 h-12 text-yellow-500" />;
      case 'danger':
        return <FiXCircle className="w-12 h-12 text-red-500" />;
      case 'success':
        return <FiCheckCircle className="w-12 h-12 text-green-500" />;
      case 'info':
        return <FiInfo className="w-12 h-12 text-blue-500" />;
      default:
        return <FiAlertCircle className="w-12 h-12 text-yellow-500" />;
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
      case 'success':
        return 'bg-green-600 hover:bg-green-700 focus:ring-green-500';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500';
      case 'info':
        return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';
      default:
        return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="text-center">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className={`p-3 rounded-full ${
            type === 'danger' ? 'bg-red-50' :
            type === 'success' ? 'bg-green-50' :
            type === 'warning' ? 'bg-yellow-50' :
            'bg-blue-50'
          }`}>
            {getIcon()}
          </div>
        </div>

        {/* Message */}
        <p className="text-gray-600 mb-6">{message}</p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2.5 text-white rounded-xl transition-all font-medium shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${getButtonColor()} disabled:opacity-70 disabled:cursor-not-allowed`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Processing...
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;