import { useState, useEffect, useCallback } from 'react';
import { useColorContext } from '../../../contexts/ColorContext';

export const useColor = (initialColor = '#2563eb') => {
  const { selectedColor, setSelectedColor, recentColors, addToRecentColors, clearRecentColors } = useColorContext();
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);

  // Load recent colors from localStorage on mount
  useEffect(() => {
    const savedColors = localStorage.getItem('recentTemplateColors');
    if (savedColors) {
      try {
        const parsedColors = JSON.parse(savedColors);
        parsedColors.forEach(color => addToRecentColors(color));
      } catch (error) {
        console.error('Error loading recent colors:', error);
      }
    }
  }, [addToRecentColors]);

  // Save recent colors to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('recentTemplateColors', JSON.stringify(recentColors));
  }, [recentColors]);

  const handleColorChange = useCallback((color) => {
    console.log("HANDLING COLOR", color)
    const hexColor = typeof color === 'string' ? color : color.hex;
    setSelectedColor(hexColor);
  }, [setSelectedColor]);

  const toggleColorPicker = useCallback(() => {
    setIsColorPickerOpen(prev => !prev);
  }, []);

  const openColorPicker = useCallback(() => {
    setIsColorPickerOpen(true);
  }, []);

  const closeColorPicker = useCallback(() => {
    setIsColorPickerOpen(false);
  }, []);

  const resetColor = useCallback(() => {
    setSelectedColor('#2563eb');
  }, [setSelectedColor]);

  const getContrastColor = useCallback((hexColor) => {
    if (!hexColor || typeof hexColor !== 'string') return '#000000';
    
    try {
      const hex = hexColor.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness > 128 ? '#000000' : '#FFFFFF';
    } catch (error) {
      return '#000000';
    }
  }, []);

  const isLightColor = useCallback((hexColor) => {
    const contrast = getContrastColor(hexColor);
    return contrast === '#000000';
  }, [getContrastColor]);

  const generateShades = useCallback((hexColor, count = 5) => {
    // Simple shade generation - in a real app, use a proper color library
    const shades = [hexColor];
    return shades;
  }, []);

  return {
    // State
    selectedColor,
    isColorPickerOpen,
    recentColors,
    
    // Actions
    setSelectedColor,
    setIsColorPickerOpen,
    
    // Methods
    handleColorChange,
    toggleColorPicker,
    openColorPicker,
    closeColorPicker,
    resetColor,
    getContrastColor,
    isLightColor,
    generateShades,
    addToRecentColors
  };
};