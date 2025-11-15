import React, { useRef } from 'react';
import { X, Download, Check } from 'lucide-react';
import html2canvas from 'html2canvas';

const TemplatePreview = ({ previewData, onClose, onUseTemplate }) => {
  const previewRef = useRef(null);

  const handleDownload = async () => {
    if (previewRef.current) {
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const link = document.createElement('a');
      link.download = `template-preview-${previewData.template.name}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-2 md:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full h-full md:h-auto md:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 md:p-6 border-b border-gray-200">
          <h2 className="text-lg md:text-xl font-semibold">
            Preview: {previewData.template.name}
          </h2>
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Download Preview</span>
              <span className="sm:hidden">Download</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X size={20} md:size={24} />
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-auto p-4 md:p-6">
          <div
            ref={previewRef}
            className="bg-white border border-gray-300 rounded-lg mx-auto"
            style={{ 
              maxWidth: '210mm',
              minHeight: '297mm',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
          >
            {/* Template Preview Implementation */}
            <div className="p-8">
              {/* Header Section */}
              <div 
                className="text-center py-6 rounded-lg mb-6 text-white"
                style={{ backgroundColor: previewData.color }}
              >
                <h1 className="text-2xl font-bold mb-2">
                  {previewData.elements.header.title}
                </h1>
                <p className="text-lg opacity-90">
                  {previewData.elements.header.subtitle}
                </p>
                <p className="mt-4 font-semibold">
                  {previewData.elements.header.doctorName}
                </p>
              </div>

              {/* Patient Information */}
              <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div>
                  <strong>Patient Name:</strong> {previewData.elements.patientInfo.name}
                </div>
                <div>
                  <strong>Age:</strong> {previewData.elements.patientInfo.age}
                </div>
                <div>
                  <strong>Gender:</strong> {previewData.elements.patientInfo.gender}
                </div>
                <div>
                  <strong>Contact:</strong> {previewData.elements.patientInfo.contact}
                </div>
              </div>

              {/* Medical Sections */}
              <div className="space-y-4">
                {previewData.elements.medicalContent.map((section, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                    <h3 className="font-semibold text-lg mb-2">{section.title}</h3>
                    <p className="text-gray-700">{section.content}</p>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="mt-8 pt-4 border-t border-gray-300">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">Signature: ________________</p>
                    <p className="text-sm text-gray-600">{previewData.elements.footer.signature}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">Date: {previewData.elements.footer.date}</p>
                    <p className="text-sm text-gray-600">{previewData.elements.footer.license}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 p-4 md:p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onUseTemplate}
            className="flex items-center justify-center sm:justify-start gap-2 w-full sm:w-auto px-4 sm:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            <Check size={16} />
            <span className="hidden sm:inline">Use This Template</span>
            <span className="sm:hidden">Use Template</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplatePreview;