import { useState, useMemo } from 'react';
import { FileText, Activity, Package, Download, Mail, Printer, Check, X, Plus, Users, Clock, AlertCircle, QrCode, Upload, MessageSquare, Share2, Palette, Eye } from 'lucide-react';
import DynamicTable from '../../../../../components/microcomponents/DynamicTable';
import { reportTemplates, templateThemes, unitOptions, renderTemplate } from '../ReportsModule/TemplateReport';

const ReportsModule = () => {
  const [currentView, setCurrentView] = useState('list');
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [customTheme, setCustomTheme] = useState(templateThemes.modern);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  
  const [filters, setFilters] = useState({
    search: '',
    dateFrom: '',
    dateTo: '',
    reportType: 'all',
    status: 'all',
    branch: 'all',
    category: 'all',
  });

  const [currentUser] = useState({
    id: '1',
    name: 'Dr. Sarah Johnson',
    role: 'admin',
    branch: 'Main Branch',
  });

  const [formData, setFormData] = useState({
    patientName: '',
    patientId: '',
    age: '',
    gender: 'Male',
    phone: '',
    email: '',
    address: '',
    testType: '',
    reportType: 'test',
    category: '',
    sampleType: '',
    sampleCollectedDate: '',
    findings: '',
    impression: '',
    remarks: '',
    parameters: [],
    template: 'modern',
    theme: templateThemes.modern
  });

  const [reports, setReports] = useState([
    {
      id: '1',
      reportId: 'RPT-2024-001',
      patientName: 'John Doe',
      patientId: 'PAT-001',
      age: 45,
      gender: 'Male',
      phone: '+1234567890',
      testName: 'Complete Blood Count',
      category: 'Hematology',
      reportType: 'test',
      status: 'approved',
      technician: 'Emily Roberts',
      doctor: 'Dr. Michael Chen',
      branch: 'Main Branch',
      sampleCollectedDate: '2024-12-01T08:30:00',
      reportGeneratedDate: '2024-12-01T14:00:00',
      deliveryMethod: 'Email',
      template: 'modern',
      theme: templateThemes.modern,
      parameters: [
        { name: 'Hemoglobin', value: '14.2', unit: 'g/dL', range: '13.0-17.0', status: 'normal' },
        { name: 'RBC Count', value: '5.1', unit: 'million/μL', range: '4.5-5.5', status: 'normal' },
        { name: 'WBC Count', value: '13.5', unit: 'thousand/μL', range: '4.0-11.0', status: 'high' },
        { name: 'Platelet Count', value: '280', unit: 'thousand/μL', range: '150-400', status: 'normal' },
      ]
    },
    {
      id: '2',
      reportId: 'RPT-2024-002',
      patientName: 'Sarah Williams',
      patientId: 'PAT-002',
      age: 32,
      gender: 'Female',
      phone: '+1234567891',
      testName: 'Chest X-Ray',
      category: 'X-Ray',
      reportType: 'scan',
      status: 'under_review',
      technician: 'James Anderson',
      doctor: 'Dr. Lisa Thompson',
      branch: 'City Branch',
      sampleCollectedDate: '2024-12-02T10:00:00',
      reportGeneratedDate: '2024-12-02T16:00:00',
      deliveryMethod: 'WhatsApp',
      template: 'classic',
      theme: templateThemes.classic,
      parameters: []
    },
  ]);

  const [activeTab, setActiveTab] = useState('all');

  const reportStatuses = [
    { value: 'sample_collected', label: 'Sample Collected', color: 'bg-blue-100 text-blue-800' },
    { value: 'processing', label: 'Processing', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'technician_completed', label: 'Technician Completed', color: 'bg-purple-100 text-purple-800' },
    { value: 'under_review', label: 'Under Review', color: 'bg-orange-100 text-orange-800' },
    { value: 'approved', label: 'Approved', color: 'bg-green-100 text-green-800' },
    { value: 'delivered', label: 'Delivered', color: 'bg-teal-100 text-teal-800' },
    { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' },
  ];

  const testCategories = [
    { name: 'Blood Tests', type: 'pathology' },
    { name: 'Urine Tests', type: 'pathology' },
    { name: 'Stool Tests', type: 'pathology' },
    { name: 'Hormone Tests', type: 'pathology' },
    { name: 'Biochemistry', type: 'pathology' },
    { name: 'Hematology', type: 'pathology' },
    { name: 'Microbiology', type: 'pathology' },
    { name: 'Immunology', type: 'pathology' },
    { name: 'COVID Tests', type: 'pathology' },
    { name: 'X-Ray', type: 'radiology' },
    { name: 'Ultrasound', type: 'radiology' },
    { name: 'CT Scan', type: 'radiology' },
    { name: 'MRI', type: 'radiology' },
    { name: 'ECG/Echo', type: 'radiology' },
    { name: 'Mammography', type: 'radiology' },
    { name: 'DEXA Scan', type: 'radiology' },
  ];

  const testTemplates = {
    'CBC': [
      { name: 'Hemoglobin', unit: 'g/dL', range: '13.0-17.0', value: '' },
      { name: 'RBC Count', unit: 'million/μL', range: '4.5-5.5', value: '' },
      { name: 'WBC Count', unit: 'thousand/μL', range: '4.0-11.0', value: '' },
      { name: 'Platelet Count', unit: 'thousand/μL', range: '150-400', value: '' },
      { name: 'Hematocrit', unit: '%', range: '40-50', value: '' },
      { name: 'MCV', unit: 'fL', range: '80-100', value: '' },
      { name: 'MCH', unit: 'pg', range: '27-31', value: '' },
      { name: 'MCHC', unit: 'g/dL', range: '32-36', value: '' },
    ],
    'LFT': [
      { name: 'Total Bilirubin', unit: 'mg/dL', range: '0.1-1.2', value: '' },
      { name: 'Direct Bilirubin', unit: 'mg/dL', range: '0.0-0.3', value: '' },
      { name: 'SGOT (AST)', unit: 'U/L', range: '5-40', value: '' },
      { name: 'SGPT (ALT)', unit: 'U/L', range: '5-40', value: '' },
      { name: 'Alkaline Phosphatase', unit: 'U/L', range: '44-147', value: '' },
      { name: 'Total Protein', unit: 'g/dL', range: '6.0-8.3', value: '' },
      { name: 'Albumin', unit: 'g/dL', range: '3.5-5.5', value: '' },
      { name: 'Globulin', unit: 'g/dL', range: '2.0-3.5', value: '' },
    ],
    'KFT': [
      { name: 'Blood Urea', unit: 'mg/dL', range: '15-40', value: '' },
      { name: 'Creatinine', unit: 'mg/dL', range: '0.6-1.2', value: '' },
      { name: 'Uric Acid', unit: 'mg/dL', range: '3.5-7.2', value: '' },
      { name: 'Sodium', unit: 'mEq/L', range: '135-145', value: '' },
      { name: 'Potassium', unit: 'mEq/L', range: '3.5-5.0', value: '' },
      { name: 'Chloride', unit: 'mEq/L', range: '98-107', value: '' },
    ],
    'Lipid Profile': [
      { name: 'Total Cholesterol', unit: 'mg/dL', range: '<200', value: '' },
      { name: 'Triglycerides', unit: 'mg/dL', range: '<150', value: '' },
      { name: 'HDL Cholesterol', unit: 'mg/dL', range: '>40', value: '' },
      { name: 'LDL Cholesterol', unit: 'mg/dL', range: '<100', value: '' },
      { name: 'VLDL Cholesterol', unit: 'mg/dL', range: '10-40', value: '' },
      { name: 'Cholesterol/HDL Ratio', unit: '', range: '<4.5', value: '' },
    ],
    'Thyroid Profile': [
      { name: 'T3 Total', unit: 'ng/mL', range: '0.8-2.0', value: '' },
      { name: 'T4 Total', unit: 'μg/dL', range: '4.5-12.0', value: '' },
      { name: 'TSH', unit: 'μIU/mL', range: '0.4-4.0', value: '' },
      { name: 'Free T3', unit: 'pg/mL', range: '2.0-4.4', value: '' },
      { name: 'Free T4', unit: 'ng/dL', range: '0.8-1.8', value: '' },
    ],
    'Diabetes Panel': [
      { name: 'Fasting Blood Sugar', unit: 'mg/dL', range: '70-100', value: '' },
      { name: 'HbA1c', unit: '%', range: '<5.7', value: '' },
      { name: 'Postprandial Blood Sugar', unit: 'mg/dL', range: '<140', value: '' },
    ],
  };

  const healthPackages = [
    {
      name: 'Full Body Checkup - Basic',
      tests: ['CBC', 'LFT', 'KFT', 'Lipid Profile', 'Diabetes Panel'],
    },
    {
      name: 'Full Body Checkup - Advanced',
      tests: ['CBC', 'LFT', 'KFT', 'Lipid Profile', 'Diabetes Panel', 'Thyroid Profile'],
    },
    {
      name: 'Cardiac Health Package',
      tests: ['Lipid Profile', 'ECG', 'Troponin', 'CK-MB'],
    },
    {
      name: "Women's Health Package",
      tests: ['CBC', 'Thyroid Profile', 'Vitamin D', 'Calcium', 'Iron Studies'],
    },
  ];

  const getStatusStyle = (status) => {
    const statusObj = reportStatuses.find((s) => s.value === status);
    return statusObj ? statusObj.color : 'bg-gray-100 text-gray-800';
  };

  const checkAbnormal = (value, range) => {
    if (!value || value === '') return 'normal';
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return 'normal';

    if (range.includes('-')) {
      const [min, max] = range.split('-').map((v) => parseFloat(v));
      if (numValue < min) return 'low';
      if (numValue > max) return 'high';
      return 'normal';
    } else if (range.includes('<')) {
      const max = parseFloat(range.replace('<', ''));
      return numValue > max ? 'high' : 'normal';
    } else if (range.includes('>')) {
      const min = parseFloat(range.replace('>', ''));
      return numValue < min ? 'low' : 'normal';
    }
    return 'normal';
  };

  const handleGenerateReport = () => {
    // Calculate status for each parameter
    const parametersWithStatus = formData.parameters.map(param => ({
      ...param,
      status: checkAbnormal(param.value, param.range)
    }));

    const newReport = {
      id: (reports.length + 1).toString(),
      reportId: `RPT-${new Date().getFullYear()}-${String(reports.length + 1).padStart(3, '0')}`,
      patientName: formData.patientName,
      patientId: formData.patientId,
      age: parseInt(formData.age) || 0,
      gender: formData.gender,
      phone: formData.phone,
      testName: formData.testType,
      category: formData.category,
      reportType: formData.reportType,
      status: 'technician_completed',
      technician: currentUser.name,
      doctor: 'Dr. ' + currentUser.name.split(' ').slice(1).join(' '),
      branch: currentUser.branch,
      sampleCollectedDate: formData.sampleCollectedDate || new Date().toISOString(),
      reportGeneratedDate: new Date().toISOString(),
      deliveryMethod: 'Email',
      template: selectedTemplate,
      theme: customTheme,
      parameters: parametersWithStatus,
      findings: formData.findings,
      impression: formData.impression,
      remarks: formData.remarks
    };

    setReports(prevReports => [newReport, ...prevReports]);
    
    // Show the newly created report
    setSelectedReport(newReport);
    setCurrentView('detail');
  };

  const reportColumns = useMemo(() => [
    {
      header: 'Report ID',
      accessor: 'reportId',
      cell: (row) => (
        <button
          onClick={() => {
            setSelectedReport(row);
            setCurrentView('detail');
          }}
          className="font-semibold text-[#0E1630] hover:underline cursor-pointer"
        >
          <div>
            <div>{row.reportId}</div>
            <div className="text-xs text-gray-500">
              {new Date(row.sampleCollectedDate).toLocaleDateString()}
            </div>
          </div>
        </button>
      )
    },
    {
      header: 'Patient',
      accessor: 'patientName',
      cell: (row) => (
        <button
          onClick={() => {
            setSelectedReport(row);
            setCurrentView('detail');
          }}
          className="font-medium text-gray-900 hover:underline cursor-pointer"
        >
          <div>
            <div>{row.patientName}</div>
            <div className="text-sm text-gray-500">
              {row.patientId} • {row.age}Y/{row.gender[0]}
            </div>
          </div>
        </button>
      )
    },
    {
      header: 'Test/Scan',
      accessor: 'testName',
      cell: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.testName}</div>
          <div className="text-sm text-gray-500">{row.category}</div>
        </div>
      )
    },
    {
      header: 'Type',
      accessor: 'reportType',
      cell: (row) => (
        <div className="flex items-center space-x-1">
          {row.reportType === 'test' && <FileText className="w-4 h-4 text-blue-500" />}
          {row.reportType === 'scan' && <Activity className="w-4 h-4 text-purple-500" />}
          {row.reportType === 'package' && <Package className="w-4 h-4 text-green-500" />}
          <span className="text-sm capitalize">{row.reportType}</span>
        </div>
      )
    },
    {
      header: 'Technician',
      accessor: 'technician',
      cell: (row) => <div className="text-sm text-gray-900">{row.technician}</div>
    },
    {
      header: 'Doctor',
      accessor: 'doctor',
      cell: (row) => <div className="text-sm text-gray-900">{row.doctor}</div>
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(row.status)}`}>
          {reportStatuses.find((s) => s.value === row.status)?.label}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <button
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Share Report"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setSelectedReport(row);
              setCurrentView('preview');
            }}
            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            title="Preview PDF"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ], [currentUser.role]);

  const reportFilters = useMemo(() => [
    {
      key: 'reportType',
      title: 'Report Type',
      options: [
        { value: 'test', label: 'Test' },
        { value: 'scan', label: 'Scan' },
        { value: 'package', label: 'Package' }
      ]
    },
    {
      key: 'status',
      title: 'Status',
      options: reportStatuses.map(status => ({
        value: status.value,
        label: status.label
      }))
    },
    {
      key: 'branch',
      title: 'Branch',
      options: [
        { value: 'Main Branch', label: 'Main Branch' },
        { value: 'City Branch', label: 'City Branch' },
        { value: 'Downtown Branch', label: 'Downtown Branch' }
      ]
    }
  ], []);

  // Mini Template Preview Components
  const renderMiniPreview = (template) => {
    const theme = template.defaultTheme;
    const templateId = template.id;

    // Mini preview styles based on template type
    const previewStyles = {
      modern: (
        <div className="bg-white p-3 rounded border" style={{ borderColor: theme.borderColor, fontSize: '6px' }}>
          <div className="mb-2 p-2 rounded" style={{ background: `linear-gradient(135deg, ${theme.primary}15 0%, ${theme.accent}10 100%)`, borderBottom: `2px solid ${theme.primary}` }}>
            <div style={{ color: theme.secondary, fontWeight: 'bold', fontSize: '8px' }}>MedLab Diagnostics</div>
            <div style={{ color: theme.textSecondary, fontSize: '5px' }}>NABL Accredited</div>
          </div>
          <div className="mb-2 p-1.5 rounded" style={{ backgroundColor: `${theme.primary}20` }}>
            <div style={{ fontSize: '6px', fontWeight: 'bold', color: theme.textPrimary }}>Patient Info</div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between" style={{ fontSize: '5px', color: theme.textSecondary }}>
              <span>Parameter</span><span>Result</span>
            </div>
            <div className="h-px" style={{ backgroundColor: theme.borderColor }}></div>
            <div className="flex justify-between" style={{ fontSize: '5px', color: theme.textSecondary }}>
              <span>Value 1</span><span style={{ color: theme.primary }}>Normal</span>
            </div>
            <div className="flex justify-between" style={{ fontSize: '5px', color: theme.textSecondary }}>
              <span>Value 2</span><span style={{ color: theme.primary }}>Normal</span>
            </div>
          </div>
        </div>
      ),
      classic: (
        <div className="bg-white p-3 rounded border" style={{ borderColor: theme.borderColor, fontSize: '6px' }}>
          <div className="text-center mb-2 pb-1" style={{ borderBottom: `2px solid ${theme.primary}` }}>
            <div style={{ color: theme.primary, fontWeight: 'bold', fontSize: '8px' }}>MedLab</div>
            <div style={{ color: theme.textSecondary, fontSize: '5px', fontStyle: 'italic' }}>Laboratory Report</div>
          </div>
          <div className="mb-2 p-1.5 border rounded" style={{ borderColor: theme.borderColor }}>
            <div style={{ fontSize: '6px', fontWeight: 'bold', color: theme.secondary }}>Patient Information</div>
          </div>
          <table className="w-full text-[5px]" style={{ border: `1px solid ${theme.borderColor}` }}>
            <thead style={{ backgroundColor: theme.primary }}>
              <tr>
                <th className="text-white text-left px-1 py-0.5" style={{ fontSize: '5px' }}>Test</th>
                <th className="text-white text-left px-1 py-0.5" style={{ fontSize: '5px' }}>Result</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-1 py-0.5" style={{ fontSize: '5px', color: theme.textPrimary }}>Param 1</td>
                <td className="px-1 py-0.5" style={{ fontSize: '5px', color: theme.textPrimary }}>14.2</td>
              </tr>
            </tbody>
          </table>
        </div>
      ),
      minimalist: (
        <div className="bg-white p-3 rounded" style={{ fontSize: '6px' }}>
          <div className="flex justify-between mb-2 pb-1" style={{ borderBottom: `1px solid ${theme.primary}` }}>
            <div style={{ color: theme.textPrimary, fontWeight: '300', fontSize: '7px' }}>MedLab</div>
            <div style={{ color: theme.textSecondary, fontSize: '5px' }}>RPT-001</div>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <div style={{ fontSize: '4px', color: theme.textSecondary, textTransform: 'uppercase' }}>PATIENT</div>
              <div style={{ fontSize: '5px', color: theme.textPrimary }}>John Doe</div>
            </div>
            <div>
              <div style={{ fontSize: '4px', color: theme.textSecondary, textTransform: 'uppercase' }}>DATE</div>
              <div style={{ fontSize: '5px', color: theme.textPrimary }}>12/01/24</div>
            </div>
          </div>
          <div className="border-b mb-1" style={{ borderColor: theme.primary, fontSize: '5px', paddingBottom: '2px' }}>
            <div style={{ fontWeight: '300' }}>Complete Blood Count</div>
          </div>
          <div className="space-y-0.5">
            <div className="flex justify-between" style={{ fontSize: '5px', color: theme.textPrimary }}>
              <span>Hemoglobin</span><span>14.2</span>
            </div>
            <div className="flex justify-between" style={{ fontSize: '5px', color: theme.textPrimary }}>
              <span>WBC Count</span><span>8.5</span>
            </div>
          </div>
        </div>
      ),
      labSpecific: (
        <div className="bg-white p-3 rounded" style={{ fontSize: '6px' }}>
          <div className="mb-2 pb-2" style={{ borderBottom: `3px solid ${theme.primary}` }}>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.primary }}>
                <span className="text-white font-bold" style={{ fontSize: '6px' }}>ML</span>
              </div>
              <div>
                <div style={{ color: theme.primary, fontWeight: 'bold', fontSize: '7px' }}>MedLab</div>
                <div style={{ color: theme.secondary, fontSize: '4px' }}>NABL & ISO Certified</div>
              </div>
            </div>
          </div>
          <div className="mb-2 p-1.5 rounded" style={{ backgroundColor: `${theme.primary}10`, border: `1px solid ${theme.primary}30` }}>
            <div style={{ fontSize: '5px', fontWeight: 'bold', color: theme.secondary }}>PATIENT DETAILS</div>
          </div>
          <div className="rounded-t p-1" style={{ backgroundColor: theme.primary }}>
            <div className="text-white font-bold" style={{ fontSize: '5px' }}>Test Results</div>
          </div>
          <div className="border border-t-0" style={{ borderColor: theme.primary }}>
            <div className="flex justify-between p-1" style={{ backgroundColor: `${theme.primary}30`, fontSize: '4px' }}>
              <span>PARAMETER</span><span>RESULT</span><span>STATUS</span>
            </div>
            <div className="p-1 flex justify-between" style={{ fontSize: '5px' }}>
              <span>Hemoglobin</span><span>14.2</span>
              <span className="px-1 rounded text-[4px]" style={{ backgroundColor: '#d1fae5', color: '#065f46' }}>✓ OK</span>
            </div>
          </div>
        </div>
      ),
      corporate: (
        <div className="bg-white p-3 rounded" style={{ fontSize: '6px' }}>
          <div className="flex justify-between mb-2 pb-1" style={{ borderBottom: `2px solid ${theme.primary}` }}>
            <div>
              <div style={{ color: theme.primary, fontWeight: 'bold', fontSize: '8px' }}>MedLab</div>
              <div style={{ color: theme.secondary, fontSize: '4px' }}>Healthcare Solutions</div>
            </div>
            <div className="px-1.5 py-0.5" style={{ backgroundColor: theme.primary }}>
              <div className="text-white font-bold" style={{ fontSize: '5px' }}>RPT-001</div>
            </div>
          </div>
          <div className="p-1 mb-2" style={{ backgroundColor: theme.secondary }}>
            <div className="text-white font-bold" style={{ fontSize: '5px' }}>INVESTIGATION REPORT</div>
          </div>
          <div className="border p-1.5 mb-2" style={{ borderColor: theme.borderColor }}>
            <div className="space-y-0.5">
              <div className="flex" style={{ fontSize: '5px' }}>
                <span className="font-semibold" style={{ width: '40%', color: theme.textPrimary }}>Name:</span>
                <span style={{ color: theme.textSecondary }}>John Doe</span>
              </div>
              <div className="flex" style={{ fontSize: '5px' }}>
                <span className="font-semibold" style={{ width: '40%', color: theme.textPrimary }}>Age:</span>
                <span style={{ color: theme.textSecondary }}>45 Years</span>
              </div>
            </div>
          </div>
          <table className="w-full" style={{ border: `1px solid ${theme.borderColor}` }}>
            <thead style={{ backgroundColor: theme.primary }}>
              <tr>
                <th className="text-white text-left px-1 py-0.5" style={{ fontSize: '4px' }}>PARAMETER</th>
                <th className="text-white text-left px-1 py-0.5" style={{ fontSize: '4px' }}>RESULT</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ backgroundColor: '#f9fafb' }}>
                <td className="px-1 py-0.5" style={{ fontSize: '5px' }}>Hemoglobin</td>
                <td className="px-1 py-0.5" style={{ fontSize: '5px' }}>14.2</td>
              </tr>
            </tbody>
          </table>
        </div>
      )
    };

    return previewStyles[templateId] || previewStyles.modern;
  };

  // Template Selector Modal with Enhanced Previews
  const renderTemplateSelector = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-[#0E1630]">Select Report Template</h3>
              <p className="text-sm text-gray-600 mt-1">Choose a template design for your report - Preview shows actual layout</p>
            </div>
            <button
              onClick={() => setShowTemplateSelector(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportTemplates.map((template) => (
              <div
                key={template.id}
                onClick={() => {
                  setSelectedTemplate(template.id);
                  setCustomTheme(template.defaultTheme);
                  setFormData({ ...formData, template: template.id, theme: template.defaultTheme });
                  setShowTemplateSelector(false);
                }}
                className={`border-2 rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-xl ${
                  selectedTemplate === template.id
                    ? 'border-[#01D48C] bg-[#01D48C]/5 shadow-lg'
                    : 'border-gray-200 hover:border-gray-400'
                }`}
              >
                {/* Mini Preview */}
                <div className="relative bg-gray-50 p-4 h-64 flex items-center justify-center overflow-hidden">
                  <div className="transform scale-90 w-full">
                    {renderMiniPreview(template)}
                  </div>
                  {selectedTemplate === template.id && (
                    <div className="absolute top-2 right-2 w-8 h-8 bg-[#01D48C] rounded-full flex items-center justify-center shadow-lg">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 right-2 bg-white/95 backdrop-blur-sm rounded px-2 py-1 flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-700">Live Preview</span>
                    <Eye className="w-3 h-3 text-gray-500" />
                  </div>
                </div>

                {/* Template Info */}
                <div className="p-4 bg-white">
                  <div className="flex items-center space-x-2 mb-2">
                    {selectedTemplate === template.id && (
                      <div className="w-5 h-5 bg-[#01D48C] rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <h4 className="font-bold text-gray-900">{template.name}</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{template.description}</p>

                  {/* Color Preview */}
                  <div className="flex items-center space-x-2 pt-3 border-t border-gray-200">
                    <span className="text-xs text-gray-500">Colors:</span>
                    <div className="flex space-x-1">
                      <div className="w-5 h-5 rounded border-2 border-white shadow" style={{ backgroundColor: template.defaultTheme.primary }} title="Primary"></div>
                      <div className="w-5 h-5 rounded border-2 border-white shadow" style={{ backgroundColor: template.defaultTheme.secondary }} title="Secondary"></div>
                      <div className="w-5 h-5 rounded border-2 border-white shadow" style={{ backgroundColor: template.defaultTheme.accent }} title="Accent"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Tip:</span> Click on any template to select and apply it instantly
            </p>
            <button
              onClick={() => setShowTemplateSelector(false)}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-all font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Color Picker Modal
  const renderColorPicker = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-[#0E1630]">Customize Colors</h3>
              <p className="text-sm text-gray-600 mt-1">Personalize your template colors</p>
            </div>
            <button
              onClick={() => setShowColorPicker(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={customTheme.primary}
                  onChange={(e) => setCustomTheme({ ...customTheme, primary: e.target.value })}
                  className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={customTheme.primary}
                  onChange={(e) => setCustomTheme({ ...customTheme, primary: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={customTheme.secondary}
                  onChange={(e) => setCustomTheme({ ...customTheme, secondary: e.target.value })}
                  className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={customTheme.secondary}
                  onChange={(e) => setCustomTheme({ ...customTheme, secondary: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Accent Color</label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={customTheme.accent}
                  onChange={(e) => setCustomTheme({ ...customTheme, accent: e.target.value })}
                  className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={customTheme.accent}
                  onChange={(e) => setCustomTheme({ ...customTheme, accent: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Border Color</label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={customTheme.borderColor}
                  onChange={(e) => setCustomTheme({ ...customTheme, borderColor: e.target.value })}
                  className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={customTheme.borderColor}
                  onChange={(e) => setCustomTheme({ ...customTheme, borderColor: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Color Preview */}
          <div className="mt-6 p-6 rounded-lg border-2" style={{ borderColor: customTheme.primary }}>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 rounded-lg" style={{ backgroundColor: customTheme.primary }}></div>
              <div className="w-20 h-20 rounded-lg" style={{ backgroundColor: customTheme.secondary }}></div>
              <div className="w-20 h-20 rounded-lg" style={{ backgroundColor: customTheme.accent }}></div>
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: customTheme.primary }}>Primary</p>
                <p className="text-sm font-semibold" style={{ color: customTheme.secondary }}>Secondary</p>
                <p className="text-sm font-semibold" style={{ color: customTheme.accent }}>Accent</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={() => {
                // Reset to template default
                const template = reportTemplates.find(t => t.id === selectedTemplate);
                if (template) {
                  setCustomTheme(template.defaultTheme);
                }
              }}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
            >
              Reset to Default
            </button>
            <button
              onClick={() => {
                setFormData({ ...formData, theme: customTheme });
                setShowColorPicker(false);
              }}
              className="px-6 py-2.5 bg-[#01D48C] text-white rounded-lg hover:bg-[#00c27d] transition-all font-semibold"
            >
              Apply Colors
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReportsList = () => {
    const filteredReports = reports.filter(report => {
      const matchesSearch = filters.search === '' ||
        report.patientName.toLowerCase().includes(filters.search.toLowerCase()) ||
        report.patientId.toLowerCase().includes(filters.search.toLowerCase()) ||
        report.reportId.toLowerCase().includes(filters.search.toLowerCase());

      const matchesReportType = filters.reportType === 'all' || report.reportType === filters.reportType;
      const matchesStatus = filters.status === 'all' || report.status === filters.status;
      const matchesBranch = filters.branch === 'all' || report.branch === filters.branch;
      const matchesCategory = filters.category === 'all' || report.category === filters.category;

      const matchesDateFrom = filters.dateFrom === '' ||
        new Date(report.sampleCollectedDate) >= new Date(filters.dateFrom);
      const matchesDateTo = filters.dateTo === '' ||
        new Date(report.sampleCollectedDate) <= new Date(filters.dateTo);

      return matchesSearch && matchesReportType && matchesStatus &&
        matchesBranch && matchesCategory && matchesDateFrom && matchesDateTo;
    });

    return (
      <DynamicTable
        title="Reports"
        columns={reportColumns}
        data={filteredReports}
        filters={reportFilters}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabActions={[
          {
            label: 'New Report',
            icon: <Plus className="w-4 h-4" />,
            onClick: () => {
              setCurrentView('create');
              setFormData({
                patientName: '',
                patientId: '',
                age: '',
                gender: 'Male',
                phone: '',
                email: '',
                address: '',
                testType: '',
                reportType: 'test',
                category: '',
                sampleType: '',
                sampleCollectedDate: '',
                findings: '',
                impression: '',
                remarks: '',
                parameters: [],
                template: selectedTemplate,
                theme: customTheme
              });
            }
          }
        ]}
        searchConfig={{
          placeholder: 'Search reports',
          onSearch: (searchTerm) => setFilters(prev => ({ ...prev, search: searchTerm }))
        }}
        onFilterChange={(key, value) => setFilters(prev => ({ ...prev, [key]: value }))}
        dateRange={{
          start: filters.dateFrom,
          end: filters.dateTo,
          onStartChange: (date) => setFilters(prev => ({ ...prev, dateFrom: date })),
          onEndChange: (date) => setFilters(prev => ({ ...prev, dateTo: date }))
        }}
      />
    );
  };

  // Continued in next part due to size...
  // I'll create the rest of the render functions

  const renderCreateReport = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-bold text-[#0E1630] mb-6">Generate New Report</h2>

        {/* Template Selection */}
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Report Template & Design</h3>
              <p className="text-sm text-gray-600">
                Current template: <span className="font-semibold capitalize">{selectedTemplate}</span>
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowColorPicker(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:border-[#01D48C] transition-all font-medium"
              >
                <Palette className="w-4 h-4" />
                <span>Customize Colors</span>
              </button>
              <button
                onClick={() => setShowTemplateSelector(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-[#01D48C] text-white rounded-lg hover:bg-[#00c27d] transition-all font-semibold"
              >
                <Eye className="w-4 h-4" />
                <span>Change Template</span>
              </button>
            </div>
          </div>
          
          {/* Color Preview */}
          <div className="flex items-center space-x-2 mt-3">
            <span className="text-xs text-gray-600">Current colors:</span>
            <div className="flex space-x-1">
              <div className="w-6 h-6 rounded border border-white" style={{ backgroundColor: customTheme.primary }} title="Primary"></div>
              <div className="w-6 h-6 rounded border border-white" style={{ backgroundColor: customTheme.secondary }} title="Secondary"></div>
              <div className="w-6 h-6 rounded border border-white" style={{ backgroundColor: customTheme.accent }} title="Accent"></div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
          <div className="grid grid-cols-3 gap-4">
            {['test', 'scan', 'package'].map((type) => (
              <button
                key={type}
                onClick={() => setFormData({ ...formData, reportType: type })}
                className={`p-4 border-2 rounded-lg transition-all ${
                  formData.reportType === type
                    ? 'border-[#01D48C] bg-[#01D48C]/10'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex flex-col items-center space-y-2">
                  {type === 'test' && <FileText className="w-8 h-8 text-blue-500" />}
                  {type === 'scan' && <Activity className="w-8 h-8 text-purple-500" />}
                  {type === 'package' && <Package className="w-8 h-8 text-green-500" />}
                  <span className="font-semibold capitalize">{type} Report</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-[#0E1630] mb-4">Patient Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name *</label>
              <input
                type="text"
                value={formData.patientName}
                onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#01D48C] focus:border-transparent"
                placeholder="Enter patient name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Patient ID *</label>
              <input
                type="text"
                value={formData.patientId}
                onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#01D48C] focus:border-transparent"
                placeholder="PAT-XXX"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#01D48C] focus:border-transparent"
                placeholder="Enter age"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#01D48C] focus:border-transparent"
              >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#01D48C] focus:border-transparent"
                placeholder="+1234567890"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#01D48C] focus:border-transparent"
                placeholder="patient@email.com"
              />
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#01D48C] focus:border-transparent"
                placeholder="Enter full address"
              />
            </div>
          </div>
        </div>

        <div className="border-t pt-6 mt-6">
          <h3 className="text-lg font-semibold text-[#0E1630] mb-4">
            {formData.reportType === 'test' && 'Test Details'}
            {formData.reportType === 'scan' && 'Scan Details'}
            {formData.reportType === 'package' && 'Package Details'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {formData.reportType === 'package' ? 'Select Package' : 'Select Test/Scan'} *
              </label>
              <select
                value={formData.testType}
                onChange={(e) => {
                  const testType = e.target.value;
                  setFormData({
                    ...formData,
                    testType,
                    parameters: testTemplates[testType]
                      ? testTemplates[testType].map((p) => ({ ...p, value: '' }))
                      : [],
                  });
                }}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#01D48C] focus:border-transparent"
              >
                <option value="">Select...</option>
                {formData.reportType === 'package'
                  ? healthPackages.map((pkg) => (
                      <option key={pkg.name} value={pkg.name}>
                        {pkg.name}
                      </option>
                    ))
                  : Object.keys(testTemplates).map((test) => (
                      <option key={test} value={test}>
                        {test}
                      </option>
                    ))}
              </select>
            </div>

            {formData.reportType !== 'package' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#01D48C] focus:border-transparent"
                  >
                    <option value="">Select category...</option>
                    {testCategories
                      .filter((cat) =>
                        formData.reportType === 'scan' ? cat.type === 'radiology' : cat.type === 'pathology'
                      )
                      .map((cat) => (
                        <option key={cat.name} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                  </select>
                </div>

                {formData.reportType === 'test' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sample Type</label>
                    <input
                      type="text"
                      value={formData.sampleType}
                      onChange={(e) => setFormData({ ...formData, sampleType: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#01D48C] focus:border-transparent"
                      placeholder="Blood, Urine, etc."
                    />
                  </div>
                )}
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sample Collected Date & Time</label>
              <input
                type="datetime-local"
                value={formData.sampleCollectedDate}
                onChange={(e) => setFormData({ ...formData, sampleCollectedDate: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#01D48C] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {formData.reportType === 'test' && formData.parameters.length > 0 && (
          <div className="border-t pt-6 mt-6">
            <h3 className="text-lg font-semibold text-[#0E1630] mb-4">Test Parameters & Results</h3>
            <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Parameter</th>
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Result</th>
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Unit</th>
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Reference Range</th>
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.parameters.map((param, index) => {
                    const status = param.value ? checkAbnormal(param.value, param.range) : 'normal';
                    return (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-3 px-2 text-sm font-medium text-gray-900">{param.name}</td>
                        <td className="py-3 px-2">
                          <input
                            type="number"
                            step="0.01"
                            value={param.value}
                            onChange={(e) => {
                              const newParams = [...formData.parameters];
                              newParams[index].value = e.target.value;
                              setFormData({ ...formData, parameters: newParams });
                            }}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#01D48C] focus:border-transparent"
                            placeholder="Enter value"
                          />
                        </td>
                        <td className="py-3 px-2">
                          <select
                            value={param.unit}
                            onChange={(e) => {
                              const newParams = [...formData.parameters];
                              newParams[index].unit = e.target.value;
                              setFormData({ ...formData, parameters: newParams });
                            }}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#01D48C] focus:border-transparent text-sm"
                          >
                            {unitOptions.map((unit) => (
                              <option key={unit.value} value={unit.value}>
                                {unit.value}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 px-2 text-sm text-gray-600">{param.range}</td>
                        <td className="py-3 px-2">
                          {param.value && (
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                status === 'high'
                                  ? 'bg-red-100 text-red-800'
                                  : status === 'low'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {status === 'high' ? 'High' : status === 'low' ? 'Low' : 'Normal'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {formData.reportType === 'scan' && (
          <div className="border-t pt-6 mt-6">
            <h3 className="text-lg font-semibold text-[#0E1630] mb-4">Scan Findings & Impression</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Findings</label>
                <textarea
                  value={formData.findings}
                  onChange={(e) => setFormData({ ...formData, findings: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#01D48C] focus:border-transparent"
                  placeholder="Enter detailed observations, measurements, and findings..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Impression</label>
                <textarea
                  value={formData.impression}
                  onChange={(e) => setFormData({ ...formData, impression: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#01D48C] focus:border-transparent"
                  placeholder="Enter summary/conclusion..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Attachments</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#01D48C] transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Click to upload images or drag and drop</p>
                  <p className="text-xs text-gray-400 mt-1">DICOM, JPG, PNG (Max 10MB)</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="border-t pt-6 mt-6">
          <h3 className="text-lg font-semibold text-[#0E1630] mb-4">Additional Information</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Remarks / Health Advice</label>
            <textarea
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#01D48C] focus:border-transparent"
              placeholder="Enter doctor's comments, health advice, or recommendations..."
            />
          </div>
        </div>

        <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t">
          <button
            onClick={() => setCurrentView('list')}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerateReport}
            className="px-6 py-2.5 bg-[#01D48C] text-white rounded-lg hover:bg-[#00c27d] transition-all font-semibold"
          >
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );

  const renderReportDetail = () => {
    if (!selectedReport) return null;

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[#0E1630]">{selectedReport.reportId}</h2>
              <p className="text-gray-600 mt-1">{selectedReport.testName}</p>
            </div>
            <button
              onClick={() => setCurrentView('list')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
            >
              Back to List
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Status</div>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(selectedReport.status)}`}>
                {reportStatuses.find((s) => s.value === selectedReport.status)?.label}
              </span>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Report Type</div>
              <div className="flex items-center space-x-2">
                {selectedReport.reportType === 'package' && <Package className="w-5 h-5 text-green-500" />}
                {selectedReport.reportType === 'test' && <FileText className="w-5 h-5 text-blue-500" />}
                {selectedReport.reportType === 'scan' && <Activity className="w-5 h-5 text-purple-500" />}
                <span className="font-semibold text-gray-900 capitalize">{selectedReport.reportType}</span>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Template</div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: selectedReport.theme?.primary || '#01D48C' }}></div>
                <span className="font-semibold text-gray-900 capitalize">{selectedReport.template || 'modern'}</span>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Branch</div>
              <div className="font-semibold text-gray-900">{selectedReport.branch}</div>
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-[#0E1630] mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-[#01D48C]" />
                  Patient Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-semibold text-gray-900">{selectedReport.patientName}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Patient ID:</span>
                    <span className="font-semibold text-gray-900">{selectedReport.patientId}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Age / Gender:</span>
                    <span className="font-semibold text-gray-900">
                      {selectedReport.age}Y / {selectedReport.gender}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-semibold text-gray-900">{selectedReport.phone}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#0E1630] mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-[#01D48C]" />
                  Report Timeline
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Sample Collected:</span>
                    <span className="font-semibold text-gray-900">
                      {new Date(selectedReport.sampleCollectedDate).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Report Generated:</span>
                    <span className="font-semibold text-gray-900">
                      {new Date(selectedReport.reportGeneratedDate).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Technician:</span>
                    <span className="font-semibold text-gray-900">{selectedReport.technician}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Doctor:</span>
                    <span className="font-semibold text-gray-900">{selectedReport.doctor}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Display Parameters if available */}
          {selectedReport.parameters && selectedReport.parameters.length > 0 && (
            <div className="border-t pt-6 mt-6">
              <h3 className="text-lg font-semibold text-[#0E1630] mb-4">Test Results</h3>
              <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Parameter</th>
                      <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Result</th>
                      <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Unit</th>
                      <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Reference Range</th>
                      <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedReport.parameters.map((param, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-3 px-2 text-sm font-medium text-gray-900">{param.name}</td>
                        <td className="py-3 px-2 text-sm font-bold" style={{
                          color: param.status === 'high' ? '#dc2626' : param.status === 'low' ? '#2563eb' : '#000'
                        }}>{param.value || 'N/A'}</td>
                        <td className="py-3 px-2 text-sm text-gray-600">{param.unit}</td>
                        <td className="py-3 px-2 text-sm text-gray-600">{param.range}</td>
                        <td className="py-3 px-2">
                          {param.status && (
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                param.status === 'high'
                                  ? 'bg-red-100 text-red-800'
                                  : param.status === 'low'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {param.status === 'high' ? 'High' : param.status === 'low' ? 'Low' : 'Normal'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t">
            {currentUser.role !== 'technician' && selectedReport.status === 'under_review' && (
              <>
                <button className="flex items-center space-x-2 px-6 py-2.5 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-all font-medium">
                  <X className="w-4 h-4" />
                  <span>Reject</span>
                </button>
                <button className="flex items-center space-x-2 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-semibold">
                  <Check className="w-4 h-4" />
                  <span>Approve Report</span>
                </button>
              </>
            )}
            <button
              onClick={() => setCurrentView('preview')}
              className="flex items-center space-x-2 px-6 py-2.5 bg-[#01D48C] text-white rounded-lg hover:bg-[#00c27d] transition-all font-semibold"
            >
              <Printer className="w-4 h-4" />
              <span>Preview PDF</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderPreviewPDF = () => {
    if (!selectedReport) return null;

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#0E1630]">Report Preview</h2>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setCurrentView('detail')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
              >
                Back
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all">
                <Mail className="w-4 h-4" />
                <span>Email</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all">
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center space-x-2 px-4 py-2 bg-[#0E1630] text-white rounded-lg hover:bg-[#1a2847] transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </button>
            </div>
          </div>

          {/* Render the selected template */}
          <div className="bg-white border-2 border-gray-200 rounded-lg shadow-lg max-w-4xl mx-auto">
            {renderTemplate(
              selectedReport.template || 'modern',
              selectedReport.theme || templateThemes.modern,
              selectedReport,
              selectedReport.parameters || []
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        {currentView === 'list' && renderReportsList()}
        {currentView === 'create' && renderCreateReport()}
        {currentView === 'detail' && renderReportDetail()}
        {currentView === 'preview' && renderPreviewPDF()}
      </div>

      {/* Modals */}
      {showTemplateSelector && renderTemplateSelector()}
      {showColorPicker && renderColorPicker()}
    </div>
  );
};

export default ReportsModule;
