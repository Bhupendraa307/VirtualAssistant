import React, { useEffect, useState } from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimes } from 'react-icons/fa';

const Toast = ({ 
  message, 
  type = 'info', 
  duration = 5000, 
  onClose, 
  position = 'top-right' 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose && onClose();
    }, 300);
  };

  const getToastStyles = () => {
    const baseStyles = "flex items-center p-4 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out";
    
    const typeStyles = {
      success: "bg-green-100 border-l-4 border-green-500 text-green-800",
      error: "bg-red-100 border-l-4 border-red-500 text-red-800",
      warning: "bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800",
      info: "bg-blue-100 border-l-4 border-blue-500 text-blue-800"
    };

    const positionStyles = {
      'top-right': "top-4 right-4",
      'top-left': "top-4 left-4",
      'bottom-right': "bottom-4 right-4",
      'bottom-left': "bottom-4 left-4",
      'top-center': "top-4 left-1/2 transform -translate-x-1/2",
      'bottom-center': "bottom-4 left-1/2 transform -translate-x-1/2"
    };

    return `${baseStyles} ${typeStyles[type]} ${positionStyles[position]}`;
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className="text-green-500 mr-3 flex-shrink-0" />;
      case 'error':
        return <FaExclamationTriangle className="text-red-500 mr-3 flex-shrink-0" />;
      case 'warning':
        return <FaExclamationTriangle className="text-yellow-500 mr-3 flex-shrink-0" />;
      default:
        return <FaInfoCircle className="text-blue-500 mr-3 flex-shrink-0" />;
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed z-50 max-w-sm w-full ${getToastStyles()}`}>
      <div className="flex items-start">
        {getIcon()}
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={handleClose}
          className="ml-3 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          aria-label="Close notification"
        >
          <FaTimes className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
