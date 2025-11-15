// Template-related constants
export const TEMPLATE_TYPES = {
  PREDEFINED: 6,
  UPLOADED: 1
};

export const LAYOUT_TYPES = {
  CLASSIC: 'classic',
  MODERN: 'modern',
  PEDIATRIC: 'pediatric',
  LUXURY: 'luxury',
  SPECIALIST: 'specialist',
  VINTAGE: 'vintage',
  FUTURISTIC: 'futuristic',
  CREATIVE: 'creative'
};

export const MEDICAL_SECTIONS = {
  CHIEF_COMPLAINT: 'chiefComplaint',
  HISTORY: 'historyOfPresentIllness',
  EXAMINATION: 'physicalExamination',
  DIAGNOSIS: 'provisionalDiagnosis',
  TREATMENT: 'treatmentPlan',
  NOTES: 'additionalNotes'
};

// Color constants
export const DEFAULT_TEMPLATE_COLOR = '#2563eb';
export const DEFAULT_BACKGROUND_COLORS = {
  medical: '#F8FAFC',
  pediatric: '#FEFCE8',
  luxury: '#FFF7ED',
  modern: '#FFFFFF',
  specialist: '#F9FAFB'
};

// Validation constants
export const VALID_HEX_COLOR = /^#[0-9A-F]{6}$/i;
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

// Local storage keys
export const STORAGE_KEYS = {
  RECENT_COLORS: 'recentTemplateColors',
  SELECTED_TEMPLATE: 'selectedTemplate',
  USER_PREFERENCES: 'userTemplatePreferences',
  RECENT_TEMPLATES: 'recentTemplates'
};

// API endpoints (for future use)
export const API_ENDPOINTS = {
  TEMPLATES: '/api/templates',
  TEMPLATE_TYPES: '/api/template-types',
  UPLOAD_TEMPLATE: '/api/upload-template',
  DOWNLOAD_TEMPLATE: '/api/download-template'
};

// Responsive breakpoints
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  XXL: 1536
};

// Animation durations
export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500
};

// Export configuration
export const EXPORT_CONFIG = {
  PDF: {
    format: 'a4',
    orientation: 'portrait',
    quality: 1.0
  },
  IMAGE: {
    format: 'png',
    quality: 1.0,
    scale: 2
  }
};

export default {
  TEMPLATE_TYPES,
  LAYOUT_TYPES,
  MEDICAL_SECTIONS,
  DEFAULT_TEMPLATE_COLOR,
  STORAGE_KEYS,
  BREAKPOINTS,
  ANIMATION_DURATIONS,
  EXPORT_CONFIG
};