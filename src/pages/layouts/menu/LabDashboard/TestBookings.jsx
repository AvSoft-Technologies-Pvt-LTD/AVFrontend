import React, { useState } from 'react';
import { Edit, Trash2, UserCheck, Eye } from 'lucide-react';
import DynamicTable from '../../../../components/microcomponents/DynamicTable';
import ReusableModal from '../../../../components/microcomponents/Modal';
import AadharVerificationFlow from '../../../../components/AadharVerification/Profile';

const MOCK_BOOKINGS = [
  {
    id: 1,
    patient_name: 'John Doe',
    test_name: 'Complete Blood Count (CBC)',
    test_type: 'Blood Test',
    date: '2023-11-28',
    time: '09:00',
    technician: 'Dr. Sarah Johnson',
    status: 'Pending',
    preparation: 'Fasting required for 8 hours',
    gender: 'Male',
    age: 35,
    contact: '+91 9876543210',
    address: '123 Main St, Bangalore, Karnataka'
  },
  {
    id: 2,
    patient_name: 'Jane Smith',
    test_name: 'Lipid Profile',
    test_type: 'Blood Test',
    date: '2023-11-28',
    time: '10:30',
    technician: 'Dr. Michael Chen',
    status: 'Completed',
    preparation: 'Fasting required for 12 hours',
    gender: 'Female',
    age: 28,
    contact: '+91 9876543211',
    address: '456 Park Ave, Mumbai, Maharashtra'
  },
  {
    id: 3,
    patient_name: 'Robert Johnson',
    test_name: 'Chest X-Ray',
    test_type: 'X-Ray',
    date: '2023-11-27',
    time: '14:15',
    technician: 'Dr. Emily Wilson',
    status: 'Completed',
    preparation: 'No preparation required',
    gender: 'Male',
    age: 42,
    contact: '+91 9876543212',
    address: '789 Oak St, Delhi'
  },
];

export default function TestBookings() {
  const [bookings, setBookings] = useState(MOCK_BOOKINGS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAadharModalOpen, setIsAadharModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedBooking, setSelectedBooking] = useState(null);
    const [newRowIds, setNewRowIds] = useState([]);
  const [isVerifying, setIsVerifying] = useState(false);

  const [tests] = useState([
    { id: 1, name: 'Complete Blood Count (CBC)', code: 'CBC', category: 'Hematology', price: 500 },
    { id: 2, name: 'Lipid Profile', code: 'LIPID', category: 'Biochemistry', price: 800 },
    { id: 3, name: 'Thyroid Profile', code: 'THY', category: 'Hormone', price: 1200 },
    { id: 4, name: 'Liver Function Test', code: 'LFT', category: 'Biochemistry', price: 900 },
    { id: 5, name: 'Full Body Checkup', code: 'FBC', category: 'Package', price: 2500 },
  ]);

  const [technicians] = useState([
    { id: 1, name: 'Dr. Sarah Johnson', available: true },
    { id: 2, name: 'Dr. Michael Chen', available: true },
    { id: 3, name: 'Dr. Emily Wilson', available: false },
  ]);

  const viewFields = [
    { 
      label: 'Patient Name', 
      key: 'patient_name',
      titleKey: 'patient_name'
    },
    { 
      label: 'Test Name', 
      key: 'test_name',
      subtitleKey: 'test_name'
    },
    { label: 'Gender', key: 'gender' },
    { label: 'Age', key: 'age' },
    { label: 'Contact', key: 'contact' },
    { label: 'Email', key: 'email' },
    { label: 'Address', key: 'address' },
    { label: 'Test Type', key: 'test_type' },
    { label: 'Date', key: 'date' },
    { label: 'Time', key: 'time' },
    { label: 'Technician', key: 'technician' },
    { label: 'Status', key: 'status' },
    { label: 'Preparation', key: 'preparation' }
  ];

  const bookingFields = [
   { 
    name: 'patient_name', 
    label: 'Patient Name', 
    type: 'text', 
    colSpan: 1 
  },
  {
    name: 'test_type',
    label: 'Test Type',
    type: 'select',
    options: [
      { label: 'Single Test', value: 'single' },
      { label: 'Multiple Tests', value: 'multiple' },
      { label: 'Test Package', value: 'package' },
    ],
    required: true,
    colSpan: 1
  },
  {
    name: 'test_id',
    label: 'Select Test / Package',
    type: 'search-select',
    options: tests.map(test => ({
      label: `${test.name} (${test.code}) - ₹${test.price}`,
      value: test.id,
      category: test.category,
      price: test.price
    })),
    required: true,
    colSpan: 1
  },
    { 
    name: 'gender', 
    label: 'Gender', 
    type: 'select', 
       options:[
      {label:'Male',value:'male'},
      {label:'Female',value:'female'},
      {label:'Other',value:'other'},
       ],
    required: true, 
    colSpan: 1 
  },
   { 
    name: 'contact', 
    label: 'Contact', 
    type: 'text', 
    required: true, 
    colSpan: 1 
  },
   { 
    name: 'age', 
    label: 'Age', 
    type: 'number', 
    required: true, 
    colSpan: 1 
  },
  { 
    name: 'test_code', 
    label: 'Test Code', 
    type: 'text', 
    colSpan: 1 
  },
  { 
    name: 'test_category', 
    label: 'Test Category', 
    type: 'text', 
    colSpan: 1 
  },
  { 
    name: 'price', 
    label: 'Price (₹)', 
    type: 'number', 
    required: true, 
    colSpan: 1 
  },

  {
    name: 'sample_type',
    label: 'Sample Type',
    type: 'select',
    options: [
      { label: 'Blood', value: 'blood' },
      { label: 'Urine', value: 'urine' },
      { label: 'Stool', value: 'stool' },
      { label: 'Swab', value: 'swab' },
      { label: 'Sputum', value: 'sputum' },
      { label: 'Saliva', value: 'saliva' },
      { label: 'Other', value: 'other' },
    ],
    required: true,
    colSpan: 1
  },
  {
    name: 'urgency',
    label: 'Urgency Type',
    type: 'select',
    options: [
      { label: 'Normal', value: 'normal' },
      { label: 'Fast Track', value: 'fast_track' },
      { label: 'Emergency (Extra Charges)', value: 'emergency' },
    ],
    required: true,
    colSpan: 1
  },

  
  {
    name: 'technician_id',
    label: 'Technician Name',
    type: 'select',
    options: technicians.map(tech => ({
      label: `${tech.name} ${tech.available ? '🟢' : '🔴'}`,
      value: tech.id,
      disabled: !tech.available
    })),
    required: false,
    colSpan: 1,
    showIf: (values) => values.assign_technician === 'yes'
  },
  { 
    name: 'date', 
    label: 'Date', 
    type: 'date', 
    required: true, 
    colSpan: 1 
  },

  { 
    name: 'time', 
    label: 'Time', 
    type: 'time', 
    required: true, 
    colSpan: 1 
  },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { label: 'Pending', value: 'Pending' },
      { label: 'In Progress', value: 'In Progress' },
      { label: 'Completed', value: 'Completed' },
      { label: 'Cancelled', value: 'Cancelled' },
      { label: 'Completed', value: 'Completed' },
      { label: 'Cancelled', value: 'Cancelled' },
    ],
    required: true,
    colSpan: 1
  },
  { 
    name: 'preparation', 
    label: 'Special Instructions', 
    type: 'textarea', 
    rows: 2, 
    required: false, 
    colSpan: 1 
  },
   {
    name: 'address',
    label: 'Address',
    type: 'textarea',
    rows: 2,
    required: false,
    colSpan: 2,
  },
];
  const handleViewProfile = (booking) => {
    setSelectedBooking(booking);
    setModalMode('viewProfile');
    setIsModalOpen(true);
  };

  const handleAddBooking = () => {
    setIsAadharModalOpen(true);
  };

  const handleEditBooking = (booking) => {
    setModalMode('edit');
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleDeleteBooking = (bookingId) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      setBookings(bookings.filter((booking) => booking.id !== bookingId));
    }
  };

  const handleSaveBooking = (formData) => {
    const finalData = {
      ...formData,
      final_price: formData.price * (1 - (formData.discount || 0) / 100)
    };

    if (modalMode === 'add') {
      const newBooking = {
        ...finalData,
        id: Math.max(0, ...bookings.map((booking) => booking.id)) + 1,
        created_at: new Date().toISOString(),
      };
      setBookings([...bookings, newBooking]);
    } else {
      setBookings(
        bookings.map((booking) =>
          booking.id === selectedBooking.id ? { ...finalData, id: selectedBooking.id } : booking,
        ),
      );
    }
    setIsModalOpen(false);
  };

  const handleAadharVerificationComplete = (aadharData) => {
    setIsAadharModalOpen(false);
    const newBooking = {
      patient_name: aadharData.fullName,
      test_type: 'single',
      test_id: '',
      test_code: '',
      test_category: '',
      price: '',
      discount: 0,
      final_price: '',
      sample_type: 'blood',
      urgency: 'normal',
      assign_technician: 'no',
      technician_id: '',
      collection_time: '',
      technician_instructions: '',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      status: 'Pending',
      preparation: '',
    };
    setSelectedBooking(newBooking);
    setModalMode('add');
    setTimeout(() => setIsModalOpen(true), 100);
  };

  const columns = [
    {
      header: 'Patient',
      accessor: 'patient_name',
      cell: (row) => (
        <div 
          className="flex items-center gap-3 cursor-pointer hover:text-blue-600 transition-colors"
          onClick={() => handleViewProfile(row)}
        >
          <div>
            <div className="font-medium">{row.patient_name}</div>
            <div className="text-xs text-gray-500">{row.test_name}</div>
          </div>
        </div>
      ),
    },
    { 
      header: 'Test Type', 
      accessor: 'test_type',
      cell: (row) => (
        <span className="text-sm text-gray-600">{row.test_type}</span>
      )
    },
    { 
      header: 'Date & Time', 
      accessor: 'datetime',
      cell: (row) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{row.date}</span>
          <span className="text-xs text-gray-500">{row.time}</span>
        </div>
      )
    },
    { 
      header: 'Technician', 
      accessor: 'technician',
      cell: (row) => (
        <span className="text-sm">{row.technician}</span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            row.status === 'Completed'
              ? 'bg-green-100 text-green-800'
              : row.status === 'Pending'
              ? 'bg-yellow-100 text-yellow-800'
              : row.status === 'In Progress'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEditBooking(row);
            }}
            className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteBooking(row.id);
            }}
            className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  const filters = [
    {
      key: 'test_type',
      title: 'Test Type',
      options: [
        { label: 'Blood Test', value: 'Blood Test' },
        { label: 'X-Ray', value: 'X-Ray' },
      ],
    },
    {
      key: 'status',
      title: 'Status',
      options: [
        { label: 'Completed', value: 'Completed' },
        { label: 'Pending', value: 'Pending' },
        { label: 'In Progress', value: 'In Progress' },
        { label: 'Cancelled', value: 'Cancelled' },
      ],
    },
  ];

  return (
    <div className="p-4">
      <DynamicTable
        title="Test Bookings"
        columns={columns}
        data={bookings}
        filters={filters}
        tabActions={[
          {
            label: 'New Booking',
            onClick: handleAddBooking,
            icon: <UserCheck size={16} className="mr-2" />,
          }
        ]}
        onRowClick={handleViewProfile}
         newRowIds={newRowIds} 
        rowClassName="hover:bg-gray-50 cursor-pointer"
      />
      
      <ReusableModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedBooking(null);
        }}
        mode={modalMode}
        title={modalMode === 'viewProfile' ? 'Patient Details' : (modalMode === 'add' ? 'New Booking' : 'Edit Booking')}
        fields={modalMode === 'viewProfile' ? [] : bookingFields}
        viewFields={modalMode === 'viewProfile' ? viewFields : []}
        data={selectedBooking || {}}
        onSave={handleSaveBooking}
        saveLabel={modalMode === 'add' ? 'Create' : 'Update'}
        cancelLabel="Close"
        size="lg"
      />
      
      {isAadharModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-4xl bg-white rounded-lg shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#01B07A] to-[#004f3d] px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">Verify Patient</h2>
              <button
                onClick={() => setIsAadharModalOpen(false)}
                className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 max-h-[80vh] overflow-y-auto">
              <AadharVerificationFlow 
                onComplete={handleAadharVerificationComplete}
                onClose={() => setIsAadharModalOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}