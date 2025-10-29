import React, { useState } from 'react';
import { Plus,Download } from 'lucide-react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DynamicTable from '../../../../components/microcomponents/DynamicTable';
import ReusableModal from '../../../../components/microcomponents/Modal';

// Default data
const defaultAdvice = [
  {
    id: 1,
    advisedBy: 'Dr. Meera Singh',
    priority: 'High',
    followUpRequired: 'yes',
    additionalNotes: 'Immediate lifestyle changes needed'
  },
  {
    id: 2,
    advisedBy: 'Dr. Rakesh Kumar',
    priority: 'Medium',
    followUpRequired: 'no',
    additionalNotes: 'Review after 2 weeks'
  },
  {
    id: 3,
    advisedBy: 'Dr. Priya Sharma',
    priority: 'Low',
    followUpRequired: 'yes',
    additionalNotes: 'Basic monitoring suggested'
  },
  {
  id: 4,
  advisedBy: 'Dr. Arjun Patel',
  priority: 'High',
  followUpRequired: 'yes',
  additionalNotes: 'Schedule lab tests and monitor vitals daily'
},
{
  id: 5,
  advisedBy: 'Dr. Sneha Roy',
  priority: 'Medium',
  followUpRequired: 'no',
  additionalNotes: 'Suggest physiotherapy sessions'
},
{
  id: 6,
  advisedBy: 'Dr. Karan Desai',
  priority: 'High',
  followUpRequired: 'yes',
  additionalNotes: 'Urgent cardiac evaluation recommended'
},
{
  id: 7,
  advisedBy: 'Dr. Anjali Verma',
  priority: 'Low',
  followUpRequired: 'no',
  additionalNotes: 'Maintain hydration and rest'
},
{
  id: 8,
  advisedBy: 'Dr. Vikram Joshi',
  priority: 'Medium',
  followUpRequired: 'yes',
  additionalNotes: 'Re-evaluation in one month with updated reports'
}
];

const priorityOptions = [
  { value: 'High', label: 'High Priority' },
  { value: 'Medium', label: 'Medium Priority' },
  { value: 'Low', label: 'Low Priority' }
];

export default function AdviceCategory() {
  const [advice, setAdvice] = useState(defaultAdvice);
  const [modal, setModal] = useState({ open: false, mode: 'add', item: null });

  // Open modal
  const openModal = (mode, item = null) => {
    setModal({ open: true, mode, item });
  };

  // Close modal
  const closeModal = () => {
    setModal({ open: false, mode: 'add', item: null });
  };

  // Fields for modal
  const getFields = () => [
    { name: 'advisedBy', label: 'Advised By' },
    {
      name: 'priority',
      label: 'Priority',
      type: 'select',
      options: priorityOptions
    },
    {
      name: 'followUpRequired',
      label: 'Follow-up Required',
      type: 'select',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' }
      ]
    },
    { name: 'additionalNotes', label: 'Additional Notes', type: 'textarea' }
  ];

  // Save handler
  const handleSave = (data) => {
    const isEdit = modal.mode === 'edit';
    const id = modal.item?.id || Date.now();
    const newItem = { ...data, id };

    if (isEdit) {
      setAdvice(prev => prev.map(a => a.id === id ? newItem : a));
      toast.success('Advice updated');
    } else {
      setAdvice(prev => [...prev, newItem]);
      toast.success('Advice added');
    }
    closeModal();
  };

  // Delete handler
  const handleDelete = () => {
    setAdvice(prev => prev.filter(a => a.id !== modal.item.id));
    toast.success('Advice deleted');
    closeModal();
  };

  // Table data (display Yes/No, but keep state as 'yes'/'no')
  const data = advice.map(a => ({
    ...a,
    followUpRequiredDisplay: a.followUpRequired === 'yes' ? 'Yes' : 'No'
  }));

  return (
    <div className="pt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="h3-heading">Advice Management</h2>
        <div className="flex items-center gap-2">
        <button className="btn btn-primary flex items-center gap-2" onClick={() => openModal('add')}>
          <Plus size={16} /> Add Advice
        </button>
      </div>
</div>
      <DynamicTable
        columns={[
          { accessor: 'advisedBy', header: 'Advised By' },
          { accessor: 'priority', header: 'Priority' },
          {
            accessor: 'followUpRequiredDisplay',
            header: 'Follow-up',
            cell: (row) => row.followUpRequiredDisplay
          },
          { accessor: 'additionalNotes', header: 'Additional Notes' },
          {
            accessor: 'actions',
            header: 'Actions',
            cell: (row) => (
              <div className="flex space-x-2">
                <button onClick={() => openModal('edit', advice.find(a => a.id === row.id))} className="edit-btn hover:bg-blue-100 rounded p-1 transition hover:animate-bounce">
                  <FaEdit className="text-[--primary-color]" />
                </button>
                <button onClick={() => openModal('confirmDelete', advice.find(a => a.id === row.id))} className="delete-btn  hover:bg-blue-100 rounded p-1 transition hover:animate-bounce">
                  <FaTrash className="text-red-500" />
                </button>
              </div>
            )
          }
        ]}
        data={data}
      />

      <ReusableModal
        isOpen={modal.open}
        onClose={closeModal}
        mode={modal.mode}
        title={
          modal.mode === 'edit' ? 'Edit Advice' :
          modal.mode === 'confirmDelete' ? 'Delete Confirmation' :
          'Add Advice'
        }
        data={modal.item}
        fields={getFields()}
        onSave={handleSave}
        onDelete={handleDelete}
      />

      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
}