import React, { useState } from 'react';
import { X, Phone, AtSign, Printer } from 'lucide-react';

const PreviewModal = ({ 
  isOpen, 
  onClose, 
  capturedImage, 
  onSendWhatsApp, 
  onSendEmail, 
  onPrint,
  isSending = { whatsapp: false, email: false }
}) => {
  const [contactInfo, setContactInfo] = useState({
    phone: '',
    email: ''
  });

  if (!isOpen) return null;

  const handleInputChange = (field, value) => {
    setContactInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleWhatsApp = () => {
    if (contactInfo.phone && onSendWhatsApp) {
      onSendWhatsApp(contactInfo.phone, capturedImage);
    }
  };

  const handleEmail = () => {
    if (contactInfo.email && onSendEmail) {
      onSendEmail(contactInfo.email, capturedImage);
    }
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint(capturedImage);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-[#01B07A] to-[#1A223F] text-white rounded-t-2xl">
          <h3 className="text-xl font-semibold">Document Preview</h3>
          <button 
            onClick={onClose} 
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          {/* Left side - Image Preview */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800">Captured Document</h4>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              {capturedImage ? (
                <img
                  src={capturedImage}
                  alt="Captured document"
                  className="w-full h-auto max-h-96 object-contain rounded-lg shadow-md"
                />
              ) : (
                <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">No image captured</span>
                </div>
              )}
            </div>
          </div>

          {/* Right side - Contact Options */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-gray-800">Send Document</h4>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Phone size={16} className="inline mr-2" />
                    WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    value={contactInfo.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B07A] focus:border-transparent"
                    placeholder="Enter WhatsApp number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <AtSign size={16} className="inline mr-2" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={contactInfo.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#01B07A] focus:border-transparent"
                    placeholder="Enter email address"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={handleWhatsApp}
                disabled={!contactInfo.phone || isSending.whatsapp}
                className={`flex flex-col items-center p-4 rounded-lg border transition-all ${
                  contactInfo.phone && !isSending.whatsapp
                    ? "border-green-300 hover:bg-green-50 hover:scale-105"
                    : "border-gray-300 opacity-50 cursor-not-allowed"
                }`}
              >
                {isSending.whatsapp ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                ) : (
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                    alt="WhatsApp"
                    className="w-8 h-8 mb-2"
                  />
                )}
                <span className="text-xs font-medium text-center">
                  {isSending.whatsapp ? "Sending..." : "WhatsApp"}
                </span>
              </button>

              <button
                onClick={handleEmail}
                disabled={!contactInfo.email || isSending.email}
                className={`flex flex-col items-center p-4 rounded-lg border transition-all ${
                  contactInfo.email && !isSending.email
                    ? "border-red-300 hover:bg-red-50 hover:scale-105"
                    : "border-gray-300 opacity-50 cursor-not-allowed"
                }`}
              >
                {isSending.email ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                ) : (
                  <img
                    src="https://img.icons8.com/color/48/gmail--v1.png"
                    alt="Email"
                    className="w-7 h-7 mb-2"
                  />
                )}
                <span className="text-xs font-medium text-center">
                  {isSending.email ? "Sending..." : "Email"}
                </span>
              </button>

              <button
                onClick={handlePrint}
                className="flex flex-col items-center p-4 rounded-lg border border-gray-300 hover:bg-gray-50 hover:scale-105 transition-all"
              >
                <img
                  src="https://img.icons8.com/ios-filled/50/000000/print.png"
                  alt="Print"
                  className="w-6 h-6 mb-2"
                />
                <span className="text-xs font-medium text-center">Print</span>
              </button>
            </div>

            {!contactInfo.phone && !contactInfo.email && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                  <strong>Note:</strong> Please provide WhatsApp number or email address to send the document.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;