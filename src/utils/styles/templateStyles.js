import { layoutStyles, colorSchemes } from './layoutStyles';

export const getTemplateStyle = (template, selectedColor) => {
  if (!template) return {};
  
  const layout = layoutStyles[template.layoutName] || layoutStyles.classic;
  
  return {
    container: {
      backgroundColor: template.bgColor,
      minHeight: '100vh',
      padding: '20px'
    },
    header: {
      backgroundColor: selectedColor,
      color: getContrastColor(selectedColor),
      ...layout.header
    },
    section: {
      ...layout.section
    },
    footer: {
      borderTopColor: selectedColor,
      ...layout.footer
    }
  };
};

export const getContrastColor = (hexColor) => {
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
};

export const getTextStyle = (layout) => {
  const textStyles = {
    classic: {
      fontFamily: 'serif',
      lineHeight: '1.6'
    },
    modern: {
      fontFamily: 'sans-serif',
      lineHeight: '1.5'
    },
    pediatric: {
      fontFamily: 'comic sans ms, cursive',
      lineHeight: '1.6'
    },
    luxury: {
      fontFamily: 'Georgia, serif',
      lineHeight: '1.7'
    }
  };

  return textStyles[layout] || textStyles.classic;
};

export const getColorScheme = (category) => {
  return colorSchemes[category] || colorSchemes.medical;
};

export const templateClasses = {
  container: 'min-h-screen p-5 transition-colors duration-300',
  header: 'mb-6 transition-all duration-300',
  section: 'my-4 transition-all duration-300',
  footer: 'mt-8 transition-all duration-300'
};