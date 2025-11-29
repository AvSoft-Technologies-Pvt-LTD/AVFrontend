import React, { useState } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import DynamicTable from '../../../../components/microcomponents/DynamicTable';
import ReusableModal from '../../../../components/microcomponents/Modal';

const MOCK_TECHNICIANS = [
  {
    id: 1,
    name: 'Dr. Sarah Johnson',
    specialization: 'Clinical Pathology',
    phone: '+1 (555) 123-4567',
    email: 'sarah.johnson@example.com',
    photo: 'https://randomuser.me/api/portraits/women/44.jpg',
    status: 'Active',
    experience_years: 8,
    shift: 'Morning',
    certifications: ['Phlebotomy', 'Clinical Chemistry'],
  },
  {
    id: 2,
    name: 'Dr. Michael Chen',
    specialization: 'Hematology',
    phone: '+1 (555) 234-5678',
    email: 'michael.chen@example.com',
    photo: 'https://randomuser.me/api/portraits/men/32.jpg',
    status: 'Active',
    experience_years: 5,
    shift: 'Evening',
    certifications: ['Hematology', 'Molecular Diagnostics'],
  },
  {
    id: 3,
    name: 'Dr. Emily Wilson',
    specialization: 'Microbiology',
    phone: '+1 (555) 345-6789',
    email: 'emily.wilson@example.com',
    photo: 'https://randomuser.me/api/portraits/women/68.jpg',
    status: 'On Leave',
    experience_years: 3,
    shift: 'Night',
    certifications: ['Microbiology', 'Immunology'],
  },
];

export default function LabTechnicians() {
  const [technicians, setTechnicians] = useState(MOCK_TECHNICIANS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedTech, setSelectedTech] = useState(null);

  const technicianFields = [
    { name: 'name', label: 'Full Name', type: 'text', required: true },
    {
      name: 'specialization',
      label: 'Specialization',
      type: 'select',
      options: [
        { label: 'Clinical Pathology', value: 'Clinical Pathology' },
        { label: 'Hematology', value: 'Hematology' },
        { label: 'Microbiology', value: 'Microbiology' },
        { label: 'Biochemistry', value: 'Biochemistry' },
        { label: 'Cytology', value: 'Cytology' },
        { label: 'Histopathology', value: 'Histopathology' },
      ],
      required: true,
    },
    { name: 'phone', label: 'Phone', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'experience_years', label: 'Experience (years)', type: 'number', min: 0, max: 50, required: true },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { label: 'Active', value: 'Active' },
        { label: 'On Leave', value: 'On Leave' },
        { label: 'Inactive', value: 'Inactive' },
      ],
      required: true,
    },
    {
      name: 'shift',
      label: 'Shift',
      type: 'select',
      options: [
        { label: 'Morning', value: 'Morning' },
        { label: 'Evening', value: 'Evening' },
        { label: 'Night', value: 'Night' },
      ],
      required: true,
    },
    { name: 'certifications', label: 'Certifications', type: 'multiselect', options: [
      { label: 'Phlebotomy', value: 'Phlebotomy' },
      { label: 'Clinical Chemistry', value: 'Clinical Chemistry' },
      { label: 'Hematology', value: 'Hematology' },
      { label: 'Microbiology', value: 'Microbiology' },
      { label: 'Molecular Diagnostics', value: 'Molecular Diagnostics' },
      { label: 'Immunology', value: 'Immunology' },
    ], required: false },
  ];

  const handleAddTech = () => {
    setModalMode('add');
    setSelectedTech(null);
    setIsModalOpen(true);
  };

  const handleEditTech = (tech) => {
    setModalMode('edit');
    setSelectedTech(tech);
    setIsModalOpen(true);
  };

  const handleDeleteTech = (techId) => {
    if (window.confirm('Are you sure you want to delete this technician?')) {
      setTechnicians(technicians.filter((tech) => tech.id !== techId));
    }
  };

  const handleSaveTech = (formData) => {
    if (modalMode === 'add') {
      const newTech = {
        ...formData,
        id: Math.max(0, ...technicians.map((tech) => tech.id)) + 1,
      };
      setTechnicians([...technicians, newTech]);
    } else {
      setTechnicians(
        technicians.map((tech) =>
          tech.id === selectedTech.id ? { ...formData, id: selectedTech.id } : tech,
        ),
      );
    }
    setIsModalOpen(false);
  };

  const columns = [
    {
      header: 'Technician',
      accessor: 'name',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <img src={row.photo} alt={row.name} className="h-10 w-10 rounded-full object-cover" />
          <span className="font-medium">{row.name}</span>
        </div>
      ),
    },
    { header: 'Specialization', accessor: 'specialization' },
    { header: 'Phone', accessor: 'phone' },
    { header: 'Email', accessor: 'email' },
    { 
      header: 'Experience', 
      accessor: 'experience_years', 
      cell: (row) => `${row.experience_years} years` 
    },
    { header: 'Shift', accessor: 'shift' },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => (
        <span className={`status-badge ${row.status === 'Active' ? 'status-active' : 'status-inactive'}`}>
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
              handleEditTech(row);
            }}
            className="p-2 hover:bg-accent/10 text-accent rounded-lg transition-colors"
            title="Edit"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteTech(row.id);
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
        title="Lab Technicians"
        columns={columns}
        data={technicians}
        tabActions={[
          {
            label: '+ New Technician',
            onClick: handleAddTech,
          },
        ]}
      />
      <ReusableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        title={modalMode === 'add' ? 'New Technician' : 'Edit Technician'}
        fields={technicianFields}
        data={selectedTech}
        onSave={handleSaveTech}
        saveLabel={modalMode === 'add' ? 'Add' : 'Update'}
        cancelLabel="Cancel"
      />
    </div>
  );
}
