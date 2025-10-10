"use client";

import { useEffect } from 'react';

const Toast = ({ message, type, duration = 5000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500/90 text-white border border-green-400';
      case 'error':
        return 'bg-red-500/90 text-white border border-red-400';
      case 'warning':
        return 'bg-yellow-500/90 text-black border border-yellow-400';
      case 'info':
        return 'bg-blue-500/90 text-white border border-blue-400';
      default:
        return 'bg-gray-500/90 text-white border border-gray-400';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📢';
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm p-4 rounded-lg shadow-lg backdrop-blur-sm ${getToastStyles()}`}>
      <div className="flex items-center gap-3">
        <span className="text-lg">{getIcon()}</span>
        <span className="text-sm font-medium">{message}</span>
        <button
          onClick={onClose}
          className="ml-auto text-white/80 hover:text-white text-lg leading-none"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Toast;


