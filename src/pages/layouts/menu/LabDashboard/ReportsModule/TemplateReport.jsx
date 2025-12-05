// Report Template Definitions
// Each template has customizable colors and layout styles

export const templateThemes = {
  modern: {
    primary: '#01D48C',
    secondary: '#0E1630',
    accent: '#6366f1',
    background: '#ffffff',
    textPrimary: '#0E1630',
    textSecondary: '#6b7280',
    borderColor: '#e5e7eb'
  },
  classic: {
    primary: '#1e40af',
    secondary: '#1f2937',
    accent: '#3b82f6',
    background: '#ffffff',
    textPrimary: '#111827',
    textSecondary: '#6b7280',
    borderColor: '#d1d5db'
  },
  minimalist: {
    primary: '#000000',
    secondary: '#4b5563',
    accent: '#9ca3af',
    background: '#ffffff',
    textPrimary: '#000000',
    textSecondary: '#6b7280',
    borderColor: '#e5e7eb'
  },
  labSpecific: {
    primary: '#dc2626',
    secondary: '#991b1b',
    accent: '#ef4444',
    background: '#ffffff',
    textPrimary: '#1f2937',
    textSecondary: '#6b7280',
    borderColor: '#fca5a5'
  },
  corporate: {
    primary: '#0891b2',
    secondary: '#0e7490',
    accent: '#06b6d4',
    background: '#ffffff',
    textPrimary: '#0f172a',
    textSecondary: '#64748b',
    borderColor: '#cbd5e1'
  }
};

export const reportTemplates = [
  {
    id: 'modern',
    name: 'Modern Template',
    description: 'Clean and contemporary design with vibrant colors',
    defaultTheme: templateThemes.modern,
    preview: 'modern-preview'
  },
  {
    id: 'classic',
    name: 'Classic Template',
    description: 'Traditional professional medical report layout',
    defaultTheme: templateThemes.classic,
    preview: 'classic-preview'
  },
  {
    id: 'minimalist',
    name: 'Minimalist Template',
    description: 'Simple and elegant monochrome design',
    defaultTheme: templateThemes.minimalist,
    preview: 'minimalist-preview'
  },
  {
    id: 'labSpecific',
    name: 'Lab-Specific Template',
    description: 'Designed specifically for laboratory reports',
    defaultTheme: templateThemes.labSpecific,
    preview: 'lab-preview'
  },
  {
    id: 'corporate',
    name: 'Corporate Template',
    description: 'Professional corporate-style layout',
    defaultTheme: templateThemes.corporate,
    preview: 'corporate-preview'
  }
];

export const unitOptions = [
  { value: 'mg/dL', label: 'mg/dL (Milligrams per Deciliter)' },
  { value: 'mmol/L', label: 'mmol/L (Millimoles per Liter)' },
  { value: 'g/L', label: 'g/L (Grams per Liter)' },
  { value: 'g/dL', label: 'g/dL (Grams per Deciliter)' },
  { value: 'µg/dL', label: 'µg/dL (Micrograms per Deciliter)' },
  { value: 'ng/mL', label: 'ng/mL (Nanograms per Milliliter)' },
  { value: 'pg/mL', label: 'pg/mL (Picograms per Milliliter)' },
  { value: 'U/L', label: 'U/L (Units per Liter)' },
  { value: 'IU/L', label: 'IU/L (International Units per Liter)' },
  { value: 'mEq/L', label: 'mEq/L (Milliequivalents per Liter)' },
  { value: 'µIU/mL', label: 'µIU/mL (Micro International Units per Milliliter)' },
  { value: 'fL', label: 'fL (Femtoliters)' },
  { value: 'pg', label: 'pg (Picograms)' },
  { value: '%', label: '% (Percentage)' },
  { value: 'million/µL', label: 'million/µL' },
  { value: 'thousand/µL', label: 'thousand/µL' },
  { value: 'cells/µL', label: 'cells/µL' }
];

// Template rendering function
export const renderTemplate = (templateId, theme, reportData, results) => {
  const templates = {
    modern: renderModernTemplate,
    classic: renderClassicTemplate,
    minimalist: renderMinimalistTemplate,
    labSpecific: renderLabSpecificTemplate,
    corporate: renderCorporateTemplate
  };

  return templates[templateId] ? templates[templateId](theme, reportData, results) : null;
};

// Modern Template
const renderModernTemplate = (theme, reportData, results) => {
  return (
    <div className="bg-white p-12" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Header with gradient */}
      <div 
        className="pb-6 mb-8 border-b-4" 
        style={{ 
          borderColor: theme.primary,
          background: `linear-gradient(135deg, ${theme.primary}15 0%, ${theme.accent}10 100%)`
        }}
      >
        <div className="flex items-start justify-between p-6 rounded-lg">
          <div>
            <h1 className="text-4xl font-bold mb-2" style={{ color: theme.secondary }}>
              MedLab Diagnostics
            </h1>
            <p className="text-sm" style={{ color: theme.textSecondary }}>NABL Accredited Laboratory</p>
            <div className="text-sm mt-4" style={{ color: theme.textSecondary }}>
              <p>123 Medical Plaza, Health District</p>
              <p>City, State - 123456</p>
              <p>Phone: +1 (555) 123-4567 | Email: info@medlab.com</p>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-gray-100 p-4 rounded-lg">
              <div className="text-xs" style={{ color: theme.textSecondary }}>Report ID</div>
              <div className="text-lg font-bold" style={{ color: theme.primary }}>{reportData.reportId}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Patient Info */}
      <div className="mb-8">
        <div 
          className="px-4 py-3 rounded-t-lg" 
          style={{ backgroundColor: theme.secondary }}
        >
          <h2 className="text-lg font-bold text-white">LABORATORY REPORT</h2>
        </div>
        <div className="border rounded-b-lg p-6" style={{ borderColor: theme.borderColor }}>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm" style={{ color: theme.textSecondary }}>Patient Name</p>
              <p className="font-semibold" style={{ color: theme.textPrimary }}>{reportData.patientName}</p>
            </div>
            <div>
              <p className="text-sm" style={{ color: theme.textSecondary }}>Patient ID</p>
              <p className="font-semibold" style={{ color: theme.textPrimary }}>{reportData.patientId}</p>
            </div>
            <div>
              <p className="text-sm" style={{ color: theme.textSecondary }}>Age / Gender</p>
              <p className="font-semibold" style={{ color: theme.textPrimary }}>{reportData.age}Y / {reportData.gender}</p>
            </div>
            <div>
              <p className="text-sm" style={{ color: theme.textSecondary }}>Report Date</p>
              <p className="font-semibold" style={{ color: theme.textPrimary }}>{new Date(reportData.reportGeneratedDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Test Results */}
      <div className="mb-8">
        <div 
          className="px-4 py-3 rounded-t-lg" 
          style={{ backgroundColor: theme.secondary }}
        >
          <h3 className="text-lg font-bold text-white">{reportData.testName}</h3>
        </div>
        <div className="border rounded-b-lg overflow-hidden" style={{ borderColor: theme.borderColor }}>
          <table className="w-full">
            <thead style={{ backgroundColor: `${theme.primary}20` }}>
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: theme.textPrimary }}>Parameter</th>
                <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: theme.textPrimary }}>Result</th>
                <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: theme.textPrimary }}>Unit</th>
                <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: theme.textPrimary }}>Reference Range</th>
                <th className="px-4 py-3 text-center text-sm font-semibold" style={{ color: theme.textPrimary }}>Flag</th>
              </tr>
            </thead>
            <tbody>
              {results && results.map((result, index) => (
                <tr key={index} className={result.status !== 'normal' ? 'bg-red-50' : index % 2 === 0 ? 'bg-gray-50' : ''}>
                  <td className="px-4 py-3 text-sm font-medium" style={{ color: theme.textPrimary }}>{result.name}</td>
                  <td className="px-4 py-3 text-sm font-bold" style={{ 
                    color: result.status === 'high' ? '#dc2626' : result.status === 'low' ? '#2563eb' : theme.textPrimary 
                  }}>{result.value || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: theme.textSecondary }}>{result.unit}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: theme.textSecondary }}>{result.range}</td>
                  <td className="px-4 py-3 text-center">
                    {result.status === 'high' && <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">HIGH</span>}
                    {result.status === 'low' && <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">LOW</span>}
                    {result.status === 'normal' && <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">NORMAL</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Signatures */}
      <div className="border-t-2 pt-6" style={{ borderColor: theme.borderColor }}>
        <div className="grid grid-cols-2 gap-8">
          <div>
            <p className="text-sm mb-2" style={{ color: theme.textSecondary }}>Technician</p>
            <p className="font-semibold" style={{ color: theme.textPrimary }}>{reportData.technician}</p>
            <div className="mt-4 pt-2 border-t" style={{ borderColor: theme.borderColor }}>
              <p className="text-xs" style={{ color: theme.textSecondary }}>Digital Signature</p>
            </div>
          </div>
          <div>
            <p className="text-sm mb-2" style={{ color: theme.textSecondary }}>Pathologist</p>
            <p className="font-semibold" style={{ color: theme.textPrimary }}>{reportData.doctor}</p>
            <div className="mt-4 pt-2 border-t" style={{ borderColor: theme.borderColor }}>
              <p className="text-xs" style={{ color: theme.textSecondary }}>Digital Signature</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t text-center" style={{ borderColor: theme.borderColor }}>
        <p className="text-xs" style={{ color: theme.textSecondary }}>This is a computer-generated report and does not require a physical signature.</p>
        <p className="text-xs mt-1" style={{ color: theme.textSecondary }}>For any queries, please contact us at support@medlab.com or +1 (555) 123-4567</p>
      </div>
    </div>
  );
};

// Classic Template
const renderClassicTemplate = (theme, reportData, results) => {
  return (
    <div className="bg-white p-12" style={{ fontFamily: 'Georgia, serif' }}>
      {/* Traditional Header */}
      <div className="text-center pb-6 mb-8 border-b-2" style={{ borderColor: theme.primary }}>
        <h1 className="text-4xl font-bold mb-2" style={{ color: theme.primary }}>MedLab Diagnostics</h1>
        <p className="text-sm italic" style={{ color: theme.textSecondary }}>NABL Accredited Laboratory</p>
        <div className="text-sm mt-4" style={{ color: theme.textSecondary }}>
          <p>123 Medical Plaza, Health District | City, State - 123456</p>
          <p>Phone: +1 (555) 123-4567 | Email: info@medlab.com</p>
        </div>
      </div>

      {/* Report Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold" style={{ color: theme.secondary }}>MEDICAL LABORATORY REPORT</h2>
        <p className="text-sm mt-2" style={{ color: theme.textSecondary }}>Report No: {reportData.reportId}</p>
      </div>

      {/* Patient Details */}
      <div className="mb-8 border p-6" style={{ borderColor: theme.borderColor }}>
        <h3 className="text-lg font-bold mb-4" style={{ color: theme.secondary }}>Patient Information</h3>
        <table className="w-full">
          <tbody>
            <tr>
              <td className="py-2 font-semibold" style={{ color: theme.textPrimary, width: '30%' }}>Patient Name:</td>
              <td className="py-2" style={{ color: theme.textSecondary }}>{reportData.patientName}</td>
              <td className="py-2 font-semibold" style={{ color: theme.textPrimary, width: '30%' }}>Patient ID:</td>
              <td className="py-2" style={{ color: theme.textSecondary }}>{reportData.patientId}</td>
            </tr>
            <tr>
              <td className="py-2 font-semibold" style={{ color: theme.textPrimary }}>Age:</td>
              <td className="py-2" style={{ color: theme.textSecondary }}>{reportData.age} Years</td>
              <td className="py-2 font-semibold" style={{ color: theme.textPrimary }}>Gender:</td>
              <td className="py-2" style={{ color: theme.textSecondary }}>{reportData.gender}</td>
            </tr>
            <tr>
              <td className="py-2 font-semibold" style={{ color: theme.textPrimary }}>Report Date:</td>
              <td className="py-2" style={{ color: theme.textSecondary }}>{new Date(reportData.reportGeneratedDate).toLocaleDateString()}</td>
              <td className="py-2 font-semibold" style={{ color: theme.textPrimary }}>Sample Date:</td>
              <td className="py-2" style={{ color: theme.textSecondary }}>{new Date(reportData.sampleCollectedDate).toLocaleDateString()}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Test Results */}
      <div className="mb-8">
        <h3 className="text-lg font-bold mb-4 pb-2 border-b" style={{ color: theme.secondary, borderColor: theme.primary }}>
          {reportData.testName}
        </h3>
        <table className="w-full border-collapse" style={{ border: `1px solid ${theme.borderColor}` }}>
          <thead>
            <tr style={{ backgroundColor: theme.primary, color: 'white' }}>
              <th className="px-4 py-3 text-left border" style={{ borderColor: theme.borderColor }}>Investigation</th>
              <th className="px-4 py-3 text-left border" style={{ borderColor: theme.borderColor }}>Observed Value</th>
              <th className="px-4 py-3 text-left border" style={{ borderColor: theme.borderColor }}>Unit</th>
              <th className="px-4 py-3 text-left border" style={{ borderColor: theme.borderColor }}>Biological Reference</th>
            </tr>
          </thead>
          <tbody>
            {results && results.map((result, index) => (
              <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f9fafb' : 'white' }}>
                <td className="px-4 py-3 border font-medium" style={{ color: theme.textPrimary, borderColor: theme.borderColor }}>{result.name}</td>
                <td className="px-4 py-3 border font-bold" style={{ 
                  color: result.status === 'high' ? '#dc2626' : result.status === 'low' ? '#2563eb' : theme.textPrimary,
                  borderColor: theme.borderColor
                }}>{result.value || 'N/A'}</td>
                <td className="px-4 py-3 border" style={{ color: theme.textSecondary, borderColor: theme.borderColor }}>{result.unit}</td>
                <td className="px-4 py-3 border" style={{ color: theme.textSecondary, borderColor: theme.borderColor }}>{result.range}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Signatures */}
      <div className="mt-12 grid grid-cols-2 gap-8">
        <div className="text-left">
          <div className="border-t-2 pt-2 inline-block" style={{ borderColor: theme.primary, minWidth: '200px' }}>
            <p className="text-sm font-semibold" style={{ color: theme.textPrimary }}>{reportData.technician}</p>
            <p className="text-xs" style={{ color: theme.textSecondary }}>Lab Technician</p>
          </div>
        </div>
        <div className="text-right">
          <div className="border-t-2 pt-2 inline-block" style={{ borderColor: theme.primary, minWidth: '200px' }}>
            <p className="text-sm font-semibold" style={{ color: theme.textPrimary }}>{reportData.doctor}</p>
            <p className="text-xs" style={{ color: theme.textSecondary }}>Consulting Pathologist</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t text-center" style={{ borderColor: theme.borderColor }}>
        <p className="text-xs italic" style={{ color: theme.textSecondary }}>End of Report</p>
      </div>
    </div>
  );
};

// Minimalist Template
const renderMinimalistTemplate = (theme, reportData, results) => {
  return (
    <div className="bg-white p-12" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
      {/* Minimal Header */}
      <div className="pb-4 mb-8 border-b" style={{ borderColor: theme.primary }}>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-light mb-1" style={{ color: theme.textPrimary }}>MedLab</h1>
            <p className="text-xs" style={{ color: theme.textSecondary }}>Laboratory Report</p>
          </div>
          <div className="text-right">
            <p className="text-xs" style={{ color: theme.textSecondary }}>Report ID</p>
            <p className="text-lg font-medium" style={{ color: theme.textPrimary }}>{reportData.reportId}</p>
          </div>
        </div>
      </div>

      {/* Patient Info - Minimal Grid */}
      <div className="mb-8 grid grid-cols-4 gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider mb-1" style={{ color: theme.textSecondary }}>Patient</p>
          <p className="text-sm font-medium" style={{ color: theme.textPrimary }}>{reportData.patientName}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider mb-1" style={{ color: theme.textSecondary }}>ID</p>
          <p className="text-sm font-medium" style={{ color: theme.textPrimary }}>{reportData.patientId}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider mb-1" style={{ color: theme.textSecondary }}>Age/Gender</p>
          <p className="text-sm font-medium" style={{ color: theme.textPrimary }}>{reportData.age}Y / {reportData.gender}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider mb-1" style={{ color: theme.textSecondary }}>Date</p>
          <p className="text-sm font-medium" style={{ color: theme.textPrimary }}>{new Date(reportData.reportGeneratedDate).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Test Name */}
      <div className="mb-4">
        <h2 className="text-xl font-light" style={{ color: theme.textPrimary }}>{reportData.testName}</h2>
      </div>

      {/* Results - Clean Table */}
      <div className="mb-8">
        <table className="w-full">
          <thead>
            <tr className="border-b-2" style={{ borderColor: theme.primary }}>
              <th className="py-2 text-left text-xs uppercase tracking-wider" style={{ color: theme.textSecondary }}>Test</th>
              <th className="py-2 text-left text-xs uppercase tracking-wider" style={{ color: theme.textSecondary }}>Value</th>
              <th className="py-2 text-left text-xs uppercase tracking-wider" style={{ color: theme.textSecondary }}>Unit</th>
              <th className="py-2 text-left text-xs uppercase tracking-wider" style={{ color: theme.textSecondary }}>Range</th>
            </tr>
          </thead>
          <tbody>
            {results && results.map((result, index) => (
              <tr key={index} className="border-b" style={{ borderColor: theme.borderColor }}>
                <td className="py-3 text-sm" style={{ color: theme.textPrimary }}>{result.name}</td>
                <td className="py-3 text-sm font-medium" style={{ 
                  color: result.status === 'high' ? '#dc2626' : result.status === 'low' ? '#2563eb' : theme.textPrimary 
                }}>{result.value || 'N/A'}</td>
                <td className="py-3 text-sm" style={{ color: theme.textSecondary }}>{result.unit}</td>
                <td className="py-3 text-sm" style={{ color: theme.textSecondary }}>{result.range}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Minimal Signatures */}
      <div className="mt-12 flex justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider mb-1" style={{ color: theme.textSecondary }}>Technician</p>
          <p className="text-sm" style={{ color: theme.textPrimary }}>{reportData.technician}</p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wider mb-1" style={{ color: theme.textSecondary }}>Pathologist</p>
          <p className="text-sm" style={{ color: theme.textPrimary }}>{reportData.doctor}</p>
        </div>
      </div>
    </div>
  );
};

// Lab-Specific Template
const renderLabSpecificTemplate = (theme, reportData, results) => {
  return (
    <div className="bg-white p-12" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Bold Lab Header */}
      <div className="pb-6 mb-8" style={{ borderBottom: `4px solid ${theme.primary}` }}>
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center space-x-3">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.primary }}>
                <span className="text-2xl font-bold text-white">ML</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold" style={{ color: theme.primary }}>MedLab Diagnostics</h1>
                <p className="text-sm font-semibold" style={{ color: theme.secondary }}>NABL & ISO Certified Laboratory</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="px-4 py-2 rounded" style={{ backgroundColor: `${theme.primary}20` }}>
              <p className="text-xs font-semibold" style={{ color: theme.primary }}>REPORT ID</p>
              <p className="text-xl font-bold" style={{ color: theme.secondary }}>{reportData.reportId}</p>
            </div>
          </div>
        </div>
        <div className="mt-4 text-sm" style={{ color: theme.textSecondary }}>
          <p>📍 123 Medical Plaza, Health District, City, State - 123456</p>
          <p>📞 +1 (555) 123-4567 | 📧 info@medlab.com</p>
        </div>
      </div>

      {/* Patient Card */}
      <div className="mb-8 rounded-lg p-6" style={{ backgroundColor: `${theme.primary}10`, border: `2px solid ${theme.primary}30` }}>
        <h3 className="text-lg font-bold mb-4" style={{ color: theme.secondary }}>PATIENT DETAILS</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs font-semibold" style={{ color: theme.textSecondary }}>NAME</p>
            <p className="text-sm font-bold" style={{ color: theme.textPrimary }}>{reportData.patientName}</p>
          </div>
          <div>
            <p className="text-xs font-semibold" style={{ color: theme.textSecondary }}>PATIENT ID</p>
            <p className="text-sm font-bold" style={{ color: theme.textPrimary }}>{reportData.patientId}</p>
          </div>
          <div>
            <p className="text-xs font-semibold" style={{ color: theme.textSecondary }}>AGE / GENDER</p>
            <p className="text-sm font-bold" style={{ color: theme.textPrimary }}>{reportData.age}Y / {reportData.gender}</p>
          </div>
          <div>
            <p className="text-xs font-semibold" style={{ color: theme.textSecondary }}>REPORT DATE</p>
            <p className="text-sm font-bold" style={{ color: theme.textPrimary }}>{new Date(reportData.reportGeneratedDate).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-xs font-semibold" style={{ color: theme.textSecondary }}>SAMPLE DATE</p>
            <p className="text-sm font-bold" style={{ color: theme.textPrimary }}>{new Date(reportData.sampleCollectedDate).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Test Results */}
      <div className="mb-8">
        <div className="rounded-t-lg px-4 py-3" style={{ backgroundColor: theme.primary }}>
          <h3 className="text-lg font-bold text-white">{reportData.testName}</h3>
        </div>
        <table className="w-full border-l border-r border-b" style={{ borderColor: theme.primary }}>
          <thead>
            <tr style={{ backgroundColor: `${theme.primary}30` }}>
              <th className="px-4 py-3 text-left text-sm font-bold" style={{ color: theme.secondary }}>PARAMETER</th>
              <th className="px-4 py-3 text-left text-sm font-bold" style={{ color: theme.secondary }}>RESULT</th>
              <th className="px-4 py-3 text-left text-sm font-bold" style={{ color: theme.secondary }}>UNIT</th>
              <th className="px-4 py-3 text-left text-sm font-bold" style={{ color: theme.secondary }}>REFERENCE INTERVAL</th>
              <th className="px-4 py-3 text-center text-sm font-bold" style={{ color: theme.secondary }}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {results && results.map((result, index) => (
              <tr key={index} className={index % 2 === 0 ? '' : 'bg-gray-50'} style={{ borderBottom: `1px solid ${theme.borderColor}` }}>
                <td className="px-4 py-3 text-sm font-semibold" style={{ color: theme.textPrimary }}>{result.name}</td>
                <td className="px-4 py-3 text-sm font-bold" style={{ 
                  color: result.status === 'high' ? '#dc2626' : result.status === 'low' ? '#2563eb' : theme.textPrimary 
                }}>{result.value || 'N/A'}</td>
                <td className="px-4 py-3 text-sm" style={{ color: theme.textSecondary }}>{result.unit}</td>
                <td className="px-4 py-3 text-sm" style={{ color: theme.textSecondary }}>{result.range}</td>
                <td className="px-4 py-3 text-center">
                  {result.status === 'high' && (
                    <span className="px-3 py-1 rounded text-xs font-bold" style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}>⚠ HIGH</span>
                  )}
                  {result.status === 'low' && (
                    <span className="px-3 py-1 rounded text-xs font-bold" style={{ backgroundColor: '#dbeafe', color: '#1e40af' }}>⚠ LOW</span>
                  )}
                  {result.status === 'normal' && (
                    <span className="px-3 py-1 rounded text-xs font-bold" style={{ backgroundColor: '#d1fae5', color: '#065f46' }}>✓ NORMAL</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Signatures */}
      <div className="mt-8 grid grid-cols-2 gap-8">
        <div className="p-4 rounded-lg" style={{ backgroundColor: `${theme.primary}10` }}>
          <p className="text-xs font-semibold mb-2" style={{ color: theme.textSecondary }}>VERIFIED BY</p>
          <p className="text-sm font-bold" style={{ color: theme.textPrimary }}>{reportData.technician}</p>
          <p className="text-xs" style={{ color: theme.textSecondary }}>Laboratory Technician</p>
        </div>
        <div className="p-4 rounded-lg" style={{ backgroundColor: `${theme.primary}10` }}>
          <p className="text-xs font-semibold mb-2" style={{ color: theme.textSecondary }}>APPROVED BY</p>
          <p className="text-sm font-bold" style={{ color: theme.textPrimary }}>{reportData.doctor}</p>
          <p className="text-xs" style={{ color: theme.textSecondary }}>Consulting Pathologist</p>
        </div>
      </div>
    </div>
  );
};

// Corporate Template
const renderCorporateTemplate = (theme, reportData, results) => {
  return (
    <div className="bg-white p-12" style={{ fontFamily: 'Calibri, sans-serif' }}>
      {/* Corporate Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start pb-4 border-b-2" style={{ borderColor: theme.primary }}>
          <div>
            <h1 className="text-4xl font-bold" style={{ color: theme.primary }}>MedLab</h1>
            <p className="text-sm mt-1" style={{ color: theme.secondary }}>Diagnostics & Healthcare Solutions</p>
          </div>
          <div className="text-right">
            <div className="inline-block px-4 py-2" style={{ backgroundColor: theme.primary, color: 'white' }}>
              <p className="text-xs font-semibold">REPORT NUMBER</p>
              <p className="text-lg font-bold">{reportData.reportId}</p>
            </div>
          </div>
        </div>
        <div className="mt-2 text-xs" style={{ color: theme.textSecondary }}>
          <p>123 Medical Plaza, Health District, City, State - 123456 | Phone: +1 (555) 123-4567 | Web: www.medlab.com</p>
        </div>
      </div>

      {/* Professional Info Box */}
      <div className="mb-8">
        <div className="px-4 py-2" style={{ backgroundColor: theme.secondary, color: 'white' }}>
          <h2 className="text-lg font-bold">LABORATORY INVESTIGATION REPORT</h2>
        </div>
        <div className="border p-6" style={{ borderColor: theme.borderColor }}>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
            <div className="flex">
              <span className="font-semibold w-32" style={{ color: theme.textPrimary }}>Patient Name:</span>
              <span style={{ color: theme.textSecondary }}>{reportData.patientName}</span>
            </div>
            <div className="flex">
              <span className="font-semibold w-32" style={{ color: theme.textPrimary }}>Patient ID:</span>
              <span style={{ color: theme.textSecondary }}>{reportData.patientId}</span>
            </div>
            <div className="flex">
              <span className="font-semibold w-32" style={{ color: theme.textPrimary }}>Age:</span>
              <span style={{ color: theme.textSecondary }}>{reportData.age} Years</span>
            </div>
            <div className="flex">
              <span className="font-semibold w-32" style={{ color: theme.textPrimary }}>Gender:</span>
              <span style={{ color: theme.textSecondary }}>{reportData.gender}</span>
            </div>
            <div className="flex">
              <span className="font-semibold w-32" style={{ color: theme.textPrimary }}>Report Date:</span>
              <span style={{ color: theme.textSecondary }}>{new Date(reportData.reportGeneratedDate).toLocaleDateString()}</span>
            </div>
            <div className="flex">
              <span className="font-semibold w-32" style={{ color: theme.textPrimary }}>Sample Date:</span>
              <span style={{ color: theme.textSecondary }}>{new Date(reportData.sampleCollectedDate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Test Results */}
      <div className="mb-8">
        <div className="px-4 py-2 mb-4" style={{ backgroundColor: `${theme.primary}20` }}>
          <h3 className="text-lg font-bold" style={{ color: theme.secondary }}>{reportData.testName}</h3>
        </div>
        <table className="w-full" style={{ border: `2px solid ${theme.borderColor}` }}>
          <thead>
            <tr style={{ backgroundColor: theme.primary }}>
              <th className="px-4 py-3 text-left text-white font-semibold border-r" style={{ borderColor: 'white' }}>Test Parameter</th>
              <th className="px-4 py-3 text-left text-white font-semibold border-r" style={{ borderColor: 'white' }}>Result</th>
              <th className="px-4 py-3 text-left text-white font-semibold border-r" style={{ borderColor: 'white' }}>Units</th>
              <th className="px-4 py-3 text-left text-white font-semibold border-r" style={{ borderColor: 'white' }}>Reference Range</th>
              <th className="px-4 py-3 text-center text-white font-semibold">Interpretation</th>
            </tr>
          </thead>
          <tbody>
            {results && results.map((result, index) => (
              <tr key={index} style={{ 
                backgroundColor: index % 2 === 0 ? 'white' : '#f9fafb',
                borderBottom: `1px solid ${theme.borderColor}`
              }}>
                <td className="px-4 py-3 font-semibold border-r" style={{ color: theme.textPrimary, borderColor: theme.borderColor }}>{result.name}</td>
                <td className="px-4 py-3 font-bold border-r" style={{ 
                  color: result.status === 'high' ? '#dc2626' : result.status === 'low' ? '#2563eb' : theme.textPrimary,
                  borderColor: theme.borderColor
                }}>{result.value || 'N/A'}</td>
                <td className="px-4 py-3 border-r" style={{ color: theme.textSecondary, borderColor: theme.borderColor }}>{result.unit}</td>
                <td className="px-4 py-3 border-r" style={{ color: theme.textSecondary, borderColor: theme.borderColor }}>{result.range}</td>
                <td className="px-4 py-3 text-center">
                  {result.status === 'high' && <span className="px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-700">ABOVE NORMAL</span>}
                  {result.status === 'low' && <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-700">BELOW NORMAL</span>}
                  {result.status === 'normal' && <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-700">WITHIN RANGE</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Professional Footer with Signatures */}
      <div className="mt-12">
        <div className="grid grid-cols-2 gap-12">
          <div>
            <div className="border-t-2 pt-3" style={{ borderColor: theme.primary }}>
              <p className="text-sm font-bold" style={{ color: theme.textPrimary }}>{reportData.technician}</p>
              <p className="text-xs" style={{ color: theme.textSecondary }}>Laboratory Technician</p>
              <p className="text-xs mt-1" style={{ color: theme.textSecondary }}>Date: {new Date(reportData.reportGeneratedDate).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="border-t-2 pt-3 inline-block" style={{ borderColor: theme.primary }}>
              <p className="text-sm font-bold" style={{ color: theme.textPrimary }}>{reportData.doctor}</p>
              <p className="text-xs" style={{ color: theme.textSecondary }}>Consultant Pathologist</p>
              <p className="text-xs mt-1" style={{ color: theme.textSecondary }}>Date: {new Date(reportData.reportGeneratedDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-8 pt-4 border-t text-center" style={{ borderColor: theme.borderColor }}>
        <p className="text-xs" style={{ color: theme.textSecondary }}>This report is confidential and intended solely for the use of the patient mentioned above.</p>
        <p className="text-xs mt-1" style={{ color: theme.textSecondary }}>For inquiries, contact: support@medlab.com | +1 (555) 123-4567</p>
      </div>
    </div>
  );
};

export default { reportTemplates, templateThemes, unitOptions, renderTemplate };