import React, { useState } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import DynamicTable from '../../../../components/microcomponents/DynamicTable';
import ReusableModal from '../../../../components/microcomponents/Modal';

const MOCK_BOOKINGS = [
  {
    id: 1,
    patient_name: 'John Doe',
    patient_photo: 'https://randomuser.me/api/portraits/men/1.jpg',
    test_name: 'Complete Blood Count (CBC)',
    test_type: 'Blood Test',
    date: '2023-11-28',
    time: '09:00',
    technician: 'Dr. Sarah Johnson',
    status: 'Pending',
    preparation: 'Fasting required for 8 hours',
  },
  {
    id: 2,
    patient_name: 'Jane Smith',
    patient_photo: 'https://randomuser.me/api/portraits/women/1.jpg',
    test_name: 'Lipid Profile',
    test_type: 'Blood Test',
    date: '2023-11-28',
    time: '10:30',
    technician: 'Dr. Michael Chen',
    status: 'Completed',
    preparation: 'Fasting required for 12 hours',
  },
  {
    id: 3,
    patient_name: 'Robert Johnson',
    patient_photo: 'https://randomuser.me/api/portraits/men/2.jpg',
    test_name: 'Chest X-Ray',
    test_type: 'X-Ray',
    date: '2023-11-27',
    time: '14:15',
    technician: 'Dr. Emily Wilson',
    status: 'Completed',
    preparation: 'No preparation required',
  },
];

export default function TestBookings() {
  const [bookings, setBookings] = useState(MOCK_BOOKINGS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedBooking, setSelectedBooking] = useState(null);

  const bookingFields = [
    { name: 'patient_name', label: 'Patient Name', type: 'text', required: true },
    { name: 'patient_photo', label: 'Patient Photo URL', type: 'text', required: false },
    { name: 'test_name', label: 'Test Name', type: 'text', required: true },
    {
      name: 'test_type',
      label: 'Test Type',
      type: 'select',
      options: [
        { label: 'Blood Test', value: 'Blood Test' },
        { label: 'Urine Test', value: 'Urine Test' },
        { label: 'X-Ray', value: 'X-Ray' },
        { label: 'Ultrasound', value: 'Ultrasound' },
        { label: 'MRI', value: 'MRI' },
        { label: 'CT Scan', value: 'CT Scan' },
        { label: 'ECG', value: 'ECG' },
      ],
      required: true,
    },
    { name: 'date', label: 'Date', type: 'date', required: true },
    { name: 'time', label: 'Time', type: 'time', required: true },
    {
      name: 'technician',
      label: 'Technician',
      type: 'select',
      options: [
        { label: 'Dr. Sarah Johnson', value: 'Dr. Sarah Johnson' },
        { label: 'Dr. Michael Chen', value: 'Dr. Michael Chen' },
        { label: 'Dr. Emily Wilson', value: 'Dr. Emily Wilson' },
        { label: 'Dr. David Kim', value: 'Dr. David Kim' },
      ],
      required: true,
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
      ],
      required: true,
    },
    { name: 'preparation', label: 'Preparation Instructions', type: 'textarea', rows: 3, required: false },
  ];

  const handleAddBooking = () => {
    setModalMode('add');
    setSelectedBooking(null);
    setIsModalOpen(true);
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
    if (modalMode === 'add') {
      const newBooking = {
        ...formData,
        id: Math.max(0, ...bookings.map((booking) => booking.id)) + 1,
      };
      setBookings([...bookings, newBooking]);
    } else {
      setBookings(
        bookings.map((booking) =>
          booking.id === selectedBooking.id ? { ...formData, id: selectedBooking.id } : booking,
        ),
      );
    }
    setIsModalOpen(false);
  };

  const columns = [
    {
      header: 'Patient',
      accessor: 'patient_name',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <img src={row.patient_photo} alt={row.patient_name} className="h-10 w-10 rounded-full object-cover" />
          <span className="font-medium">{row.patient_name}</span>
        </div>
      ),
    },
    { header: 'Test Name', accessor: 'test_name' },
    { header: 'Date', accessor: 'date' },
    { header: 'Time', accessor: 'time' },
    { header: 'Technician', accessor: 'technician' },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => (
        <span
          className={`status-badge ${
            row.status === 'Completed'
              ? 'status-completed'
              : row.status === 'Pending'
              ? 'status-pending'
              : row.status === 'In Progress'
              ? 'status-in-progress'
              : 'status-cancelled'
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
            className="p-2 hover:bg-accent/10 text-accent rounded-lg transition-colors"
            title="Edit"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteBooking(row.id);
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

  const filters = [
    {
      key: 'test_type',
      title: 'Test Type',
      options: [
        { label: 'Blood Test', value: 'Blood Test' },
        { label: 'Urine Test', value: 'Urine Test' },
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
            label: '+ New Booking',
            onClick: handleAddBooking,
          },
        ]}
      />
      <ReusableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        title={modalMode === 'add' ? 'New Booking' : 'Edit Booking'}
        fields={bookingFields}
        data={selectedBooking}
        onSave={handleSaveBooking}
        saveLabel={modalMode === 'add' ? 'Create' : 'Update'}
        cancelLabel="Cancel"
      />
    </div>
  );
}
