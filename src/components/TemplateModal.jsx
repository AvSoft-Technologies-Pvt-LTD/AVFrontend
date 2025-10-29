import React, { useState } from 'react';
import { X, Palette, Stethoscope, Heart, Eye, Brain, Baby, Crown, Sparkles, Shield, Star, Activity, Book, Leaf, ChevronDown, ChevronUp } from 'lucide-react';
import { SketchPicker } from 'react-color';

const layoutStyles = {
  traditional: {
    header: { textAlign: 'center', borderRadius: '12px' },
    footer: { borderTop: '2px solid', textAlign: 'center' },
  },
  modern: {
    header: { textAlign: 'left', borderRadius: '0', borderLeft: '8px solid' },
    footer: { borderTop: '4px double', textAlign: 'left' },
  },
  pediatric: {
    header: { textAlign: 'center', borderRadius: '20px', border: '4px solid' },
    footer: { borderTop: '3px dotted', textAlign: 'center' },
  },
  specialist: {
    header: { textAlign: 'right', borderRadius: '0', borderBottom: '6px solid' },
    footer: { borderTop: '2px solid', borderBottom: '2px solid', textAlign: 'right' },
  },
  luxury: {
    header: { textAlign: 'center', borderRadius: '0', border: '3px solid'},
    footer: { borderTop: '4px double', textAlign: 'center' },
  },
  creative: {
    header: { textAlign: 'left', borderRadius: '25px 0 25px 0' },
    footer: { borderTop: '3px wavy', textAlign: 'center' },
  },
  minimalist: {
    header: { textAlign: 'center', borderRadius: '0', border: '1px solid' },
    footer: { borderTop: '1px solid', textAlign: 'center' },
  },
  vintage: {
    header: { textAlign: 'center', borderRadius: '0', border: '2px dashed' },
    footer: { borderTop: '2px dashed', textAlign: 'center' },
  },
  futuristic: {
    header: { textAlign: 'left', borderRadius: '0', borderLeft: '5px solid'},
    footer: { borderTop: '3px solid', textAlign: 'left' },
  },
};

const prescriptionTemplates = {
  classic: { id: 'classic', name: 'Classic Medical', icon: Stethoscope, preview: 'Traditional medical prescription format', layout: 'traditional' },
  modern: { id: 'modern', name: 'Modern Healthcare', icon: Heart, preview: 'Clean, modern design with emphasis on readability', layout: 'modern' },
  pediatric: { id: 'pediatric', name: 'Pediatric Care', icon: Baby, preview: 'Child-friendly design with soft colors', layout: 'pediatric' },
  specialist: { id: 'specialist', name: 'Specialist Clinic', icon: Brain, preview: 'Professional template for specialist consultations', layout: 'specialist' },
  minimalist: { id: 'minimalist', name: 'Minimalist Care', icon: Shield, preview: 'Simple and clean design', layout: 'minimalist' },
  vintage: { id: 'vintage', name: 'Vintage Clinic', icon: Book, preview: 'Retro design with classic elements', layout: 'vintage' },
  futuristic: { id: 'futuristic', name: 'Futuristic Health', icon: Activity, preview: 'Advanced design with a modern touch', layout: 'futuristic' },
  luxury: { id: 'luxury', name: 'Luxury Clinic', icon: Crown, preview: 'Premium design with gold accents', layout: 'luxury' },
  creative: { id: 'creative', name: 'Creative Wellness', icon: Sparkles, preview: 'Artistic design with vibrant colors', layout: 'creative' },
};

const TemplateModal = ({ isOpen, onClose, onSelectTemplate, selectedTemplate, selectedColor, setSelectedColor }) => {
  const [hoveredTemplate, setHoveredTemplate] = useState(null);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);

  const handleColorChange = (color) => {
    setSelectedColor(color.hex);
  };

  const getTemplateStyle = (template) => {
    const layout = layoutStyles[template.layout] || layoutStyles.traditional;
    return {
      headerStyle: {
        backgroundColor: selectedColor,
        color: 'white',
        fontSize: '28px',
        fontFamily: 'serif',
        padding: '25px',
        ...layout.header,
      },
      doctorStyle: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: selectedColor,
        textAlign: layout.header.textAlign,
        marginBottom: '10px',
      },
      addressStyle: {
        fontSize: '14px',
        color: '#666',
        textAlign: layout.header.textAlign,
        lineHeight: '1.6',
      },
      footerStyle: {
        borderTopColor: selectedColor,
        paddingTop: '20px',
        textAlign: layout.footer.textAlign,
        ...layout.footer,
      },
    };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <Palette className="mr-3 text-blue-600" size={28} />
              Choose Your Template
            </h2>
          </div>
          <div className="flex items-center gap-4">
            {/* Color Display */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Selected Color:</span>
              <div className="w-8 h-8 rounded-full border-2 border-gray-300" style={{ backgroundColor: selectedColor }}></div>
            </div>
            {/* Color Picker Button and Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
                className="flex items-center p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Palette size={24} className="text-gray-500" />
                {isColorPickerOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {isColorPickerOpen && (
                <div className="absolute right-0 mt-2 z-50">
                  <SketchPicker color={selectedColor} onChange={handleColorChange} />
                </div>
              )}
            </div>
            {/* Close Button */}
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X size={24} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Template Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.values(prescriptionTemplates).map((template) => {
              const IconComponent = template.icon;
              const isSelected = selectedTemplate === template.id;
              const isHovered = hoveredTemplate === template.id;
              const templateStyle = getTemplateStyle(template);

              return (
                <div
                  key={template.id}
                  className={`relative cursor-pointer transition-all duration-300 transform hover:scale-105 ${isSelected ? 'ring-4 ring-blue-500' : ''}`}
                  onMouseEnter={() => setHoveredTemplate(template.id)}
                  onMouseLeave={() => setHoveredTemplate(null)}
                  onClick={() => onSelectTemplate(template.id)}
                >
                  {/* Template Preview Card */}
                  <div className="bg-white border-2 border-gray-200 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                    {/* Mini Header Preview */}
                    <div className="h-20 flex flex-col justify-center p-2" style={templateStyle.headerStyle}>
                      <div className="text-white text-xs font-bold" style={{ textAlign: templateStyle.headerStyle.textAlign }}>
                        <div>Your Hospital Name</div>
                        <div style={{ marginTop: '2px' }}>Dr. Your Name</div>
                        <div style={{ marginTop: '2px', fontSize: '10px' }}>123 Medical Street, City</div>
                      </div>
                    </div>
                    {/* Template Content Preview */}
                    <div className="p-4">
                      <div className="flex items-center mb-3">
                        <IconComponent size={20} className="text-gray-600 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-800">{template.name}</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">{template.preview}</p>
                      {/* Footer Preview */}
                      <div className="text-xs pt-2" style={templateStyle.footerStyle}>
                        Signature: ___________
                      </div>
                      {/* Selection Indicator */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                          <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Hover Effect */}
                  {isHovered && <div className="absolute inset-0 rounded-xl pointer-events-none border-4 border-blue-500"></div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button onClick={onClose} className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors">
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            disabled={!selectedTemplate}
          >
            Use Selected Template
          </button>
        </div>
      </div>
    </div>
  );
};

export { TemplateModal, prescriptionTemplates, layoutStyles };