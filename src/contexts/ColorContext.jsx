import React, { createContext, useContext, useState, useCallback } from 'react';

// Create the context
const ColorContext = createContext();

// Custom hook to use the color context
export const useColorContext = () => {
  const context = useContext(ColorContext);
  if (!context) {
    throw new Error('useColorContext must be used within a ColorProvider');
  }
  return context;
};

// Color provider component
export const ColorProvider = ({ children }) => {
  const [selectedColor, setSelectedColor] = useState('#049dfdff');
  const [recentColors, setRecentColors] = useState([]);

  // Handle color change
  const handleColorChange = useCallback((color) => {
    const hexColor = typeof color === 'string' ? color : color.hex;
    setSelectedColor(hexColor);
    addToRecentColors(hexColor);
  }, []);

  // Add color to recent colors
  const addToRecentColors = useCallback((color) => {
    setRecentColors(prev => {
      const filtered = prev.filter(c => c !== color);
      return [color, ...filtered].slice(0, 10);
    });
  }, []);

  // Clear recent colors
  const clearRecentColors = useCallback(() => {
    setRecentColors([]);
  }, []);

  const value = {
    selectedColor,
    setSelectedColor: handleColorChange,
    recentColors,
    addToRecentColors,
    clearRecentColors,
  };

  return (
    <ColorContext.Provider value={value}>
      {children}
    </ColorContext.Provider>
  );
};

export default ColorContext;
