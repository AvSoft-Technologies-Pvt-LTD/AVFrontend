import React from 'react';
import { X } from 'lucide-react';

const ImageViewer = ({ isOpen, onClose, imageUrl, title }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
      onClick={onClose}
    >
      <div 
        className="relative bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-medium">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <img
            src={imageUrl}
            alt={title}
            className="max-w-full max-h-[calc(90vh-100px)] mx-auto"
            style={{ objectFit: 'contain' }}
          />
        </div>
      </div>
    </div>
  );
};

export default ImageViewer;
