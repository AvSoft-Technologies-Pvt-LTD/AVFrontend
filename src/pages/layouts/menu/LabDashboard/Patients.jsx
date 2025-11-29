import React, { useState } from 'react';
import { Edit, Trash2, Eye, X } from 'lucide-react';
import DynamicTable from '../../../../components/microcomponents/DynamicTable';
import ProfileCard from '../../../../components/microcomponents/ProfileCard';
import ReusableModal from '../../../../components/microcomponents/Modal';

const MOCK_PATIENTS = [
  {
    id: 1,
    name: 'John Doe',
    age: 32,
    phone: '+1 (555) 123-4567',
    email: 'john.doe@example.com',
    photo: 'https://randomuser.me/api/portraits/men/1.jpg',
    address: '123 Main St, Anytown, USA',
    blood_group: 'O+',
    gender: 'Male',
    date_of_birth: '1991-05-15',
  },
  {
    id: 2,
    name: 'Jane Smith',
    age: 28,
    phone: '+1 (555) 987-6543',
    email: 'jane.smith@example.com',
    photo: 'https://randomuser.me/api/portraits/women/1.jpg',
    address: '456 Oak Ave, Somewhere, USA',
    blood_group: 'A-',
    gender: 'Female',
    date_of_birth: '1995-08-22',
  },
  {
    id: 3,
    name: 'Robert Johnson',
    age: 45,
    phone: '+1 (555) 456-7890',
    email: 'robert.j@example.com',
    photo: 'https://randomuser.me/api/portraits/men/2.jpg',
    address: '789 Pine Rd, Nowhere, USA',
    blood_group: 'B+',
    gender: 'Male',
    date_of_birth: '1978-11-10',
  },
];

export default function Patients() {
  const [patients, setPatients] = useState(MOCK_PATIENTS);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const patientFields = [
    { name: 'name', label: 'Full Name', type: 'text', required: true },
    { name: 'date_of_birth', label: 'Date Of Birth', type: 'date', required: true },
    {
      name: 'blood_group',
      label: 'Blood Group',
      type: 'select',
      options: [
        { label: 'A+', value: 'A+' },
        { label: 'A-', value: 'A-' },
        { label: 'B+', value: 'B+' },
        { label: 'B-', value: 'B-' },
        { label: 'O+', value: 'O+' },
        { label: 'O-', value: 'O-' },
        { label: 'AB+', value: 'AB+' },
        { label: 'AB-', value: 'AB-' },
      ],
      required: true,
    },
    { name: 'phone', label: 'Phone', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'address', label: 'Address', type: 'textarea', rows: 3, required: true },
    {
      name: 'gender',
      label: 'Gender',
      type: 'select',
      options: [
        { label: 'Male', value: 'Male' },
        { label: 'Female', value: 'Female' },
        { label: 'Other', value: 'Other' },
      ],
      required: true,
    },
  ];

  const handleAddPatient = () => {
    setModalMode('add');
    setSelectedPatient(null);
    setIsModalOpen(true);
  };

  const handleViewProfile = (patient) => {
    setSelectedPatient(patient);
    setIsProfileDrawerOpen(true);
  };

  const handleEditPatient = (patient) => {
    setModalMode('edit');
    setSelectedPatient(patient);
    setIsModalOpen(true);
  };

  const handleDeletePatient = (patientId) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      setPatients(patients.filter((patient) => patient.id !== patientId));
    }
  };

  const handleSavePatient = (formData) => {
    if (modalMode === 'add') {
      const newPatient = {
        ...formData,
        id: Math.max(0, ...patients.map((patient) => patient.id)) + 1,
        age: new Date().getFullYear() - new Date(formData.date_of_birth).getFullYear(),
      };
      setPatients([...patients, newPatient]);
    } else {
      setPatients(
        patients.map((patient) =>
          patient.id === selectedPatient.id ? { ...formData, id: selectedPatient.id } : patient,
        ),
      );
    }
    setIsModalOpen(false);
  };

  const columns = [
    {
      header: 'Patient',
      accessor: 'name',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <img src={row.photo} alt={row.name} className="h-10 w-10 rounded-full object-cover" />
          <span className="font-medium">{row.name}</span>
        </div>
      ),
    },
    { header: 'Age', accessor: 'age' },
    { header: 'Phone', accessor: 'phone' },
    { header: 'Email', accessor: 'email' },
    { header: 'Blood Group', accessor: 'blood_group' },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewProfile(row);
            }}
            className="p-2 hover:bg-blue-500/10 text-blue-400 rounded-lg transition-colors"
            title="View Profile"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEditPatient(row);
            }}
            className="p-2 hover:bg-accent/10 text-accent rounded-lg transition-colors"
            title="Edit"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeletePatient(row.id);
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
      <DynamicTable
        title="Patients"
        columns={columns}
        data={patients}
        tabActions={[
          {
            label: '+ New Patient',
            onClick: handleAddPatient,
          },
        ]}
      />
      <ReusableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        title={modalMode === 'add' ? 'New Patient' : 'Edit Patient'}
        fields={patientFields}
        data={selectedPatient}
        onSave={handleSavePatient}
        saveLabel={modalMode === 'add' ? 'Add Patient' : 'Update Patient'}
        cancelLabel="Cancel"
      />
      {isProfileDrawerOpen && selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md h-full glassmorphism-modal border-l border-white/10 overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-slate-100">Patient Profile</h2>
              <button
                onClick={() => setIsProfileDrawerOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full text-slate-300 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <ProfileCard
              photo={selectedPatient.photo}
              name={selectedPatient.name}
              fields={[
                { label: 'Age', value: selectedPatient.age },
                { label: 'Blood Group', value: selectedPatient.blood_group },
                { label: 'Phone', value: selectedPatient.phone },
                { label: 'Email', value: selectedPatient.email },
                { label: 'Address', value: selectedPatient.address },
                { label: 'Gender', value: selectedPatient.gender },
                { label: 'Date of Birth', value: selectedPatient.date_of_birth },
              ]}
            />
          </div>
        </div>
      )}
    </div>
  );
}
