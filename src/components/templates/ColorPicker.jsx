import React, { useState, useRef, useEffect } from 'react';
import { Palette, ChevronDown, ChevronUp, Check, RefreshCw } from 'lucide-react';
import { SketchPicker } from 'react-color';
import { colorSchemes } from '../../utils/styles/layoutStyles';

const ColorPicker = ({ 
  selectedColor, 
  onColorChange, 
  size = 'medium',
  showLabel = true,
  showPresets = true,
  position = 'bottom-right'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [recentColors, setRecentColors] = useState([]);
  const pickerRef = useRef(null);

  // Initialize recent colors from localStorage
  useEffect(() => {
    const savedColors = localStorage.getItem('recentTemplateColors');
    if (savedColors) {
      setRecentColors(JSON.parse(savedColors));
    }
  }, []);

  // Save color to recent colors
  const saveToRecentColors = (color) => {
    const newRecentColors = [
      color,
      ...recentColors.filter(c => c !== color)
    ].slice(0, 8); // Keep only 8 most recent colors
    
    setRecentColors(newRecentColors);
    localStorage.setItem('recentTemplateColors', JSON.stringify(newRecentColors));
  };

  const handleColorChange = (color) => {
    onColorChange(color.hex);
    saveToRecentColors(color.hex);
  };

  const handlePresetClick = (color) => {
    onColorChange(color);
    saveToRecentColors(color);
    setIsOpen(false);
  };

  const handleReset = () => {
    const defaultColor = '#2563eb';
    onColorChange(defaultColor);
    saveToRecentColors(defaultColor);
  };

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getPositionClasses = () => {
    const positions = {
      'bottom-right': 'left-0 top-full mt-2',
      'bottom-left': 'right-0 top-full mt-2',
      'top-right': 'left-0 bottom-full mb-2',
      'top-left': 'right-0 bottom-full mb-2'
    };
    return positions[position] || positions['bottom-right'];
  };

  const getSizeClasses = () => {
    const sizes = {
      small: 'w-8 h-8',
      medium: 'w-10 h-10',
      large: 'w-12 h-12'
    };
    return sizes[size] || sizes.medium;
  };

  return (
    <div className="relative inline-block" ref={pickerRef}>
      {/* Color Picker Trigger Button */}
      <div className="flex items-center gap-2">
        {showLabel && (
          <span className="text-sm text-gray-600 whitespace-nowrap">
            Template Color:
          </span>
        )}
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            relative flex items-center justify-center border-2 border-gray-300 rounded-full 
            shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105
            ${getSizeClasses()}
            ${isOpen ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
          `}
          style={{ backgroundColor: selectedColor }}
          title="Change template color"
        >
          <Palette 
            size={size === 'small' ? 14 : size === 'large' ? 20 : 16} 
            className="text-white mix-blend-overlay opacity-80" 
          />
          
          {/* Checkmark for current color */}
          <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
            <Check 
              size={12} 
              className="text-green-600" 
            />
          </div>
        </button>

        {/* Dropdown Arrow */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          {isOpen ? (
            <ChevronUp size={16} className="text-gray-500" />
          ) : (
            <ChevronDown size={16} className="text-gray-500" />
          )}
        </button>

        {/* Reset Button */}
        <button
          onClick={handleReset}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors tooltip"
          title="Reset to default color"
        >
          <RefreshCw size={16} className="text-gray-500" />
        </button>
      </div>

      {/* Color Picker Dropdown */}
      {isOpen && (
        <div className={`
          absolute z-50 bg-white rounded-xl shadow-2xl border border-gray-200 
          p-4 min-w-64 animate-in fade-in-0 zoom-in-95
          ${getPositionClasses()}
        `}>
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-gray-800">Choose Color</h3>
            <div className="flex items-center gap-2">
              <div 
                className="w-6 h-6 rounded border border-gray-300"
                style={{ backgroundColor: selectedColor }}
              ></div>
              <span className="text-xs font-mono text-gray-600">
                {selectedColor}
              </span>
            </div>
          </div>

          {/* Sketch Color Picker */}
          <div className="mb-4">
            <SketchPicker
              color={selectedColor}
              onChange={handleColorChange}
              width="100%"
              styles={{
                default: {
                  picker: {
                    boxShadow: 'none',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    width: '100%'
                  }
                }
              }}
              presetColors={[]}
            />
          </div>

          {/* Color Presets */}
          {showPresets && (
            <>
              {/* Recent Colors */}
              {recentColors.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-medium text-gray-600 mb-2">Recent Colors</h4>
                  <div className="grid grid-cols-8 gap-1">
                    {recentColors.map((color, index) => (
                      <button
                        key={index}
                        onClick={() => handlePresetClick(color)}
                        className={`
                          w-6 h-6 rounded border border-gray-300 hover:scale-110 
                          transition-transform relative
                          ${selectedColor === color ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
                        `}
                        style={{ backgroundColor: color }}
                        title={color}
                      >
                        {selectedColor === color && (
                          <Check 
                            size={12} 
                            className="text-white absolute inset-0 m-auto" 
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Theme Color Schemes */}
              <div className="space-y-3">
                <h4 className="text-xs font-medium text-gray-600">Theme Colors</h4>
                
                {Object.entries(colorSchemes).map(([theme, colors]) => (
                  <div key={theme} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 capitalize">
                        {theme}
                      </span>
                    </div>
                    <div className="grid grid-cols-6 gap-1">
                      {colors.map((color, index) => (
                        <button
                          key={index}
                          onClick={() => handlePresetClick(color)}
                          className={`
                            w-6 h-6 rounded border border-gray-300 hover:scale-110 
                            transition-transform relative
                            ${selectedColor === color ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
                          `}
                          style={{ backgroundColor: color }}
                          title={color}
                        >
                          {selectedColor === color && (
                            <Check 
                              size={12} 
                              className="text-white absolute inset-0 m-auto" 
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Basic Colors */}
              <div className="mt-4">
                <h4 className="text-xs font-medium text-gray-600 mb-2">Basic Colors</h4>
                <div className="grid grid-cols-8 gap-1">
                  {[
                    '#000000', '#333333', '#666666', '#999999',
                    '#ffffff', '#f3f4f6', '#e5e7eb', '#d1d5db',
                    '#ef4444', '#f59e0b', '#eab308', '#22c55e',
                    '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899'
                  ].map((color, index) => (
                    <button
                      key={index}
                      onClick={() => handlePresetClick(color)}
                      className={`
                        w-6 h-6 rounded border border-gray-300 hover:scale-110 
                        transition-transform relative
                        ${selectedColor === color ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
                        ${color === '#ffffff' ? 'border-gray-400' : ''}
                      `}
                      style={{ backgroundColor: color }}
                      title={color}
                    >
                      {selectedColor === color && (
                        <Check 
                          size={12} 
                          className={`
                            absolute inset-0 m-auto
                            ${color === '#ffffff' || color === '#f3f4f6' || color === '#e5e7eb' ? 'text-gray-600' : 'text-white'}
                          `} 
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Custom Color Input */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <label className="text-xs font-medium text-gray-600 mb-2 block">
              Custom HEX Color
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={selectedColor}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^#[0-9A-F]{6}$/i.test(value)) {
                    onColorChange(value);
                  }
                }}
                onBlur={(e) => {
                  const value = e.target.value;
                  if (!/^#[0-9A-F]{6}$/i.test(value)) {
                    // Reset to valid color if invalid
                    onColorChange('#2563eb');
                  }
                }}
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                placeholder="#2563eb"
                maxLength={7}
              />
              <div 
                className="w-8 h-8 rounded border border-gray-300 flex-shrink-0"
                style={{ backgroundColor: selectedColor }}
              ></div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between">
            <button
              onClick={handleReset}
              className="text-xs text-gray-600 hover:text-gray-800 px-2 py-1 hover:bg-gray-100 rounded"
            >
              Reset Default
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPicker;