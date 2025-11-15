import { useState, useEffect, useCallback } from 'react';

export const useColor = (initialColor = '#2563eb') => {
  const [selectedColor, setSelectedColor] = useState(initialColor);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [recentColors, setRecentColors] = useState([]);

  // Load recent colors from localStorage on mount
  useEffect(() => {
    const savedColors = localStorage.getItem('recentTemplateColors');
    if (savedColors) {
      try {
        setRecentColors(JSON.parse(savedColors));
      } catch (error) {
        console.error('Error loading recent colors:', error);
      }
    }
  }, []);

  // Save recent colors to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('recentTemplateColors', JSON.stringify(recentColors));
  }, [recentColors]);

  const handleColorChange = useCallback((color) => {
    const hexColor = typeof color === 'string' ? color : color.hex;
    setSelectedColor(hexColor);
    addToRecentColors(hexColor);
  }, []);

  const addToRecentColors = useCallback((color) => {
    setRecentColors(prev => {
      const filtered = prev.filter(c => c !== color);
      return [color, ...filtered].slice(0, 8); // Keep only 8 most recent
    });
  }, []);

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
    addToRecentColors('#2563eb');
  }, [addToRecentColors]);

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
    setSelectedColor: handleColorChange,
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