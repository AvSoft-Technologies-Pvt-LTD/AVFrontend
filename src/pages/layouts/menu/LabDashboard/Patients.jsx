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
    setModalMode('viewProfile');
    setIsModalOpen(true);
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
        <div 
          className="flex items-center gap-3 cursor-pointer hover:text-blue-400 transition-colors"
          onClick={() => handleViewProfile(row)}
        >
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
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPatient(null);
        }}
        mode={modalMode}
        title={modalMode === 'add' ? 'New Patient' : modalMode === 'edit' ? 'Edit Patient' : 'Patient Profile'}
        fields={modalMode === 'viewProfile' ? [] : patientFields}
        viewFields={[
          { label: 'Name', key: 'name' },
          { label: 'Age', key: 'age' },
          { label: 'Blood Group', key: 'blood_group' },
          { label: 'Phone', key: 'phone' },
          { label: 'Email', key: 'email' },
          { label: 'Address', key: 'address' },
          { label: 'Gender', key: 'gender' },
          { label: 'Date of Birth', key: 'date_of_birth' },
        ]}
        data={selectedPatient}
        onSave={handleSavePatient}
        saveLabel={modalMode === 'add' ? 'Add Patient' : 'Update Patient'}
        cancelLabel="Close"
      />
    </div>
  );
}
