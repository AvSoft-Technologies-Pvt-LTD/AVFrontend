import { VALID_HEX_COLOR, DEFAULT_TEMPLATE_COLOR } from './constants';

// Color helpers
export const isValidHexColor = (color) => {
  return VALID_HEX_COLOR.test(color);
};

export const getContrastColor = (hexColor) => {
  if (!isValidHexColor(hexColor)) return '#000000';
  
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
};

export const lightenColor = (hex, percent) => {
  if (!isValidHexColor(hex)) return hex;
  
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  
  return "#" + (
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  ).toString(16).slice(1);
};

export const darkenColor = (hex, percent) => {
  return lightenColor(hex, -percent);
};

// Template helpers
export const filterTemplates = (templates, filters) => {
  const { category, searchTerm, sortBy } = filters;
  
  let filtered = templates.filter(template => {
    const matchesCategory = category === 'all' || template.category === category;
    const matchesSearch = !searchTerm || 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  // Sort templates
  filtered.sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'category':
        return a.category.localeCompare(b.category);
      case 'sortOrder':
        return a.sortOrder - b.sortOrder;
      default:
        return a.sortOrder - b.sortOrder;
    }
  });

  return filtered;
};

export const getTemplatePreviewData = (template, userData = {}) => {
  return {
    id: template.id,
    name: template.name,
    description: template.description,
    layout: template.layoutName,
    color: DEFAULT_TEMPLATE_COLOR,
    userData: {
      hospitalName: userData.hospitalName || 'Medical Center',
      doctorName: userData.doctorFullName || 'Dr. John Smith',
      patientName: userData.patientName || 'Patient Name',
      ...userData
    },
    timestamp: new Date().toISOString()
  };
};

// File helpers
export const validateFile = (file, allowedTypes, maxSize) => {
  if (!file) return { isValid: false, error: 'No file provided' };
  
  if (!allowedTypes.includes(file.type)) {
    return { 
      isValid: false, 
      error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}` 
    };
  }
  
  if (file.size > maxSize) {
    return { 
      isValid: false, 
      error: `File too large. Maximum size: ${maxSize / 1024 / 1024}MB` 
    };
  }
  
  return { isValid: true, error: null };
};

export const readFileAsDataURL = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Local storage helpers
export const getFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error);
    return defaultValue;
  }
};

export const setToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error);
    return false;
  }
};

export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from localStorage key "${key}":`, error);
    return false;
  }
};

// Date and time helpers
export const formatDate = (date, options = {}) => {
  const defaultOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  
  return new Date(date).toLocaleDateString(undefined, { ...defaultOptions, ...options });
};

export const formatTime = (date, options = {}) => {
  const defaultOptions = { 
    hour: '2-digit', 
    minute: '2-digit' 
  };
  
  return new Date(date).toLocaleTimeString(undefined, { ...defaultOptions, ...options });
};

// DOM helpers
export const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      return true;
    } catch (fallbackError) {
      console.error('Copy to clipboard failed:', fallbackError);
      return false;
    } finally {
      document.body.removeChild(textArea);
    }
  }
};

// Validation helpers
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

// Export all helpers
export default {
  // Color helpers
  isValidHexColor,
  getContrastColor,
  lightenColor,
  darkenColor,
  
  // Template helpers
  filterTemplates,
  getTemplatePreviewData,
  
  // File helpers
  validateFile,
  readFileAsDataURL,
  
  // Storage helpers
  getFromStorage,
  setToStorage,
  removeFromStorage,
  
  // Date helpers
  formatDate,
  formatTime,
  
  // DOM helpers
  downloadBlob,
  copyToClipboard,
  
  // Validation helpers
  validateEmail,
  validatePhone
};