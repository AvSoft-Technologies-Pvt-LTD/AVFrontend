export const layoutStyles = {
  classic: {
    header: { 
      textAlign: 'center', 
      borderRadius: '12px',
      fontSize: '28px',
      fontFamily: 'serif',
      padding: '25px',
      marginBottom: '20px'
    },
    footer: { 
      borderTop: '2px solid', 
      textAlign: 'center',
      paddingTop: '20px',
      marginTop: '30px'
    },
    section: {
      margin: '15px 0',
      padding: '15px',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      backgroundColor: '#ffffff'
    }
  },
  modern: {
    header: { 
      textAlign: 'left', 
      borderRadius: '0', 
      borderLeft: '8px solid',
      fontSize: '24px',
      fontFamily: 'sans-serif',
      padding: '20px',
      marginBottom: '15px'
    },
    footer: { 
      borderTop: '4px double', 
      textAlign: 'left',
      paddingTop: '15px',
      marginTop: '25px'
    },
    section: {
      margin: '10px 0',
      padding: '12px',
      borderLeft: '4px solid',
      backgroundColor: '#f8fafc',
      borderRadius: '4px'
    }
  },
  pediatric: {
    header: { 
      textAlign: 'center', 
      borderRadius: '20px', 
      border: '4px solid',
      fontSize: '26px',
      fontFamily: 'comic sans ms, cursive',
      padding: '22px',
      marginBottom: '18px'
    },
    footer: { 
      borderTop: '3px dotted', 
      textAlign: 'center',
      paddingTop: '18px',
      marginTop: '20px'
    },
    section: {
      margin: '12px 0',
      padding: '14px',
      borderRadius: '15px',
      border: '2px dashed #fbbf24',
      backgroundColor: '#fefce8'
    }
  },
  luxury: {
    header: { 
      textAlign: 'center', 
      borderRadius: '0', 
      border: '3px solid gold',
      fontSize: '28px',
      fontFamily: 'Georgia, serif',
      padding: '25px',
      marginBottom: '25px',
      background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)'
    },
    footer: { 
      borderTop: '2px solid gold', 
      textAlign: 'center',
      paddingTop: '25px',
      marginTop: '30px',
      background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)'
    },
    section: {
      margin: '15px 0',
      padding: '20px',
      border: '1px solid #fcd34d',
      borderRadius: '8px',
      backgroundColor: '#fffbeb',
      boxShadow: '0 2px 4px rgba(252, 211, 77, 0.1)'
    }
  }
};

export const colorSchemes = {
  medical: [
    '#2563eb', '#1e40af', '#1e3a8a',     // Blues
    '#0ea5e9', '#0369a1', '#0c4a6e',     // Light Blues
    '#3b82f6', '#60a5fa', '#93c5fd'      // Additional Blues
  ],
  pediatric: [
    '#f59e0b', '#d97706', '#b45309',     // Ambers
    '#fbbf24', '#f97316', '#ea580c',     // Oranges
    '#fcd34d', '#fdba74', '#fed7aa'      // Light Oranges
  ],
  luxury: [
    '#f59e0b', '#b45309', '#78350f',     // Golds
    '#a16207', '#854d0e', '#713f12',     // Dark Golds
    '#fcd34d', '#fde68a', '#fef3c7'      // Light Golds
  ],
  modern: [
    '#64748b', '#475569', '#334155',     // Slates
    '#94a3b8', '#cbd5e1', '#e2e8f0',     // Light Slates
    '#475569', '#334155', '#1e293b'      // Dark Slates
  ],
  specialist: [
    '#8b5cf6', '#7c3aed', '#6d28d9',    // Purples
    '#a855f7', '#c084fc', '#d8b4fe',     // Light Purples
    '#9333ea', '#7e22ce', '#6b21a8'      // Dark Purples
  ],
  vibrant: [
    '#ec4899', '#db2777', '#be185d',     // Pinks
    '#f472b6', '#f9a8d4', '#fbcfe8',     // Light Pinks
    '#dc2626', '#ef4444', '#f87171'      // Reds
  ],
  natural: [
    '#22c55e', '#16a34a', '#15803d',     // Greens
    '#84cc16', '#65a30d', '#4d7c0f',     // Lime Greens
    '#10b981', '#059669', '#047857'      // Emerald Greens
  ]
};

export const defaultColors = {
  primary: '#2563eb',
  secondary: '#64748b',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#dc2626',
  background: '#ffffff',
  text: '#000000',
  border: '#e5e7eb'
};