import React, { useState } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import DynamicTable from '../../../../components/microcomponents/DynamicTable';
import ReusableModal from '../../../../components/microcomponents/Modal';

const MOCK_TESTS = [
  {
    id: 1,
    test_name: 'Complete Blood Count (CBC)',
    category: 'Hematology',
    description: 'Measures components of blood, including red and white blood cells, and platelets.',
    price: 125.50,
    parameters: ['WBC', 'RBC', 'Hemoglobin', 'Hematocrit', 'Platelets'],
    reference_ranges: {
      WBC: '4.5-11.0 x10^9/L',
      RBC: '4.2-5.9 x10^12/L',
      Hemoglobin: '13.5-17.5 g/dL (Male), 12.0-15.5 g/dL (Female)',
      Hematocrit: '38.8-50.0% (Male), 34.9-44.5% (Female)',
      Platelets: '150-450 x10^9/L',
    },
    preparation: 'No fasting required.',
  },
  {
    id: 2,
    test_name: 'Lipid Profile',
    category: 'Biochemistry',
    description: 'Measures cholesterol and triglycerides to assess cardiovascular risk.',
    price: 89.99,
    parameters: ['Total Cholesterol', 'LDL', 'HDL', 'Triglycerides'],
    reference_ranges: {
      'Total Cholesterol': '< 200 mg/dL',
      LDL: '< 100 mg/dL',
      HDL: '> 40 mg/dL (Male), > 50 mg/dL (Female)',
      Triglycerides: '< 150 mg/dL',
    },
    preparation: 'Fasting required for 12 hours.',
  },
];

export default function TestCatalogs() {
  const [tests, setTests] = useState(MOCK_TESTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedTest, setSelectedTest] = useState(null);

  const testFields = [
    { name: 'test_name', label: 'Test Name', type: 'text', required: true },
    {
      name: 'category',
      label: 'Category',
      type: 'select',
      options: [
        { label: 'Hematology', value: 'Hematology' },
        { label: 'Biochemistry', value: 'Biochemistry' },
        { label: 'Microbiology', value: 'Microbiology' },
        { label: 'Immunology', value: 'Immunology' },
        { label: 'Cytology', value: 'Cytology' },
        { label: 'Histopathology', value: 'Histopathology' },
      ],
      required: true,
    },
    { name: 'description', label: 'Description', type: 'textarea', rows: 3, required: true },
    { name: 'price', label: 'Price', type: 'number', min: 0, step: 0.01, required: true },
    { name: 'parameters', label: 'Parameters (comma-separated)', type: 'text', required: true },
    { name: 'preparation', label: 'Preparation Instructions', type: 'textarea', rows: 3, required: false },
  ];

  const handleAddTest = () => {
    setModalMode('add');
    setSelectedTest(null);
    setIsModalOpen(true);
  };

  const handleEditTest = (test) => {
    setModalMode('edit');
    setSelectedTest(test);
    setIsModalOpen(true);
  };

  const handleDeleteTest = (testId) => {
    if (window.confirm('Are you sure you want to delete this test?')) {
      setTests(tests.filter((test) => test.id !== testId));
    }
  };

  const handleSaveTest = (formData) => {
    const parameters = formData.parameters.split(',').map((param) => param.trim());
    const newFormData = { ...formData, parameters };
    if (modalMode === 'add') {
      const newTest = {
        ...newFormData,
        id: Math.max(0, ...tests.map((test) => test.id)) + 1,
      };
      setTests([...tests, newTest]);
    } else {
      setTests(
        tests.map((test) =>
          test.id === selectedTest.id ? { ...newFormData, id: selectedTest.id } : test,
        ),
      );
    }
    setIsModalOpen(false);
  };

  const columns = [
    { header: 'Test Name', accessor: 'test_name' },
    { header: 'Category', accessor: 'category' },
    { 
      header: 'Price', 
      accessor: 'price', 
      cell: (row) => `$${parseFloat(row.price).toFixed(2)}` 
    },
    {
      header: 'Parameters',
      accessor: 'parameters',
      cell: (row) => row.parameters.join(', '),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEditTest(row);
            }}
            className="p-2 hover:bg-accent/10 text-accent rounded-lg transition-colors"
            title="Edit"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteTest(row.id);
            }}
            className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

 return (
  <div className="p-4">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold text-gray-800">Test Catalogs</h2>
      <button
        onClick={handleAddTest}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
      >
        <span>+ New Test</span>
      </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tests.map((test) => (
        <div
          key={test.id}
          className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow"
        >
          <div className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{test.test_name}</h3>
                <span className="inline-block px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full mt-1">
                  {test.category}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-700">
                ${parseFloat(test.price).toFixed(2)}
              </div>
            </div>

            <p className="mt-3 text-gray-600 text-sm line-clamp-2">{test.description}</p>

            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-500">Parameters:</h4>
              <p className="text-sm text-gray-700 mt-1 line-clamp-2">
                {test.parameters.join(', ')}
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {test.preparation || 'No special preparation required'}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditTest(test);
                  }}
                  className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteTest(test.id);
                  }}
                  className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>

    <ReusableModal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      mode={modalMode}
      title={modalMode === 'add' ? 'New Test' : 'Edit Test'}
      fields={testFields}
      data={selectedTest}
      onSave={handleSaveTest}
      saveLabel={modalMode === 'add' ? 'Add' : 'Update'}
      cancelLabel="Cancel"
    />
  </div>
);
}
