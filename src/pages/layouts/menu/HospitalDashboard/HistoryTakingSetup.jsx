import React, { useState } from 'react';
import { Plus, Download } from 'lucide-react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DynamicTable from '../../../../components/microcomponents/DynamicTable';
import ReusableModal from '../../../../components/microcomponents/Modal';

const CATEGORY_OPTIONS = [
  { label: 'Vital History', value: 'vital' },
  { label: 'Family History', value: 'family' },
  { label: 'Chief Complaints', value: 'chief' },
  { label: 'Clinical Notes', value: 'clinical' }
];

export default function ClinicalNotes() {
  const [records, setRecords] = useState([
    { id: 1, category: 'vital', subcategory: 'BP Low', description: 'Patient reported low blood pressure in the morning.' },
    { id: 2, category: 'family', subcategory: 'Diabetes', description: 'Father has type 2 diabetes.' },
    { id: 3, category: 'chief', subcategory: 'Migraine', description: 'Recurring headaches, worsened by light.' },
    { id: 4, category: 'clinical', subcategory: 'Fever', description: 'High-grade fever noted since 2 days.' },
    { id: 5, category: 'vital', subcategory: 'Pulse High', description: 'Pulse rate was 110 bpm during examination.' },
    { id: 6, category: 'family', subcategory: 'Hypertension', description: 'Mother has a history of high blood pressure.' },
    { id: 7, category: 'chief', subcategory: 'Chest Pain', description: 'Sharp chest pain experienced intermittently.' },
    { id: 8, category: 'clinical', subcategory: 'Cough', description: 'Persistent dry cough lasting over a week.' },
    { id: 9, category: 'vital', subcategory: 'Temperature High', description: 'Recorded body temperature at 102°F.' },
    { id: 10, category: 'clinical', subcategory: 'Shortness of Breath', description: 'Difficulty breathing during physical activity.' }
  ]);

  const [modal, setModal] = useState({ open: false, mode: 'add', item: null });

  const openModal = (mode, item = null) => setModal({ open: true, mode, item });
  const closeModal = () => setModal({ open: false, mode: 'add', item: null });

  const getFields = () => [
    {
      name: 'category',
      label: 'Category',
      type: 'select',
      options: CATEGORY_OPTIONS
    },
    { name: 'subcategory', label: 'Subcategory' },
    { name: 'description', label: 'Description', type: 'textarea' }
  ];

  const handleSave = (data) => {
    const isEdit = modal.mode === 'edit';
    const id = modal.item?.id || Date.now();
    const newItem = { ...data, id };
    if (isEdit) {
      setRecords(prev => prev.map(r => r.id === id ? newItem : r));
      toast.success('Note updated successfully');
    } else {
      setRecords(prev => [...prev, newItem]);
      toast.success('Note added successfully');
    }
    closeModal();
  };

  const handleDelete = () => {
    setRecords(prev => prev.filter(r => r.id !== modal.item.id));
    toast.success('Note deleted');
    closeModal();
  };

  const generateTemplate = () => {
    const grouped = records.reduce((acc, curr) => {
      const categoryLabel = CATEGORY_OPTIONS.find(c => c.value === curr.category)?.label || curr.category;
      if (!acc[categoryLabel]) acc[categoryLabel] = [];
      acc[categoryLabel].push(curr);
      return acc;
    }, {});
    const content = Object.entries(grouped).map(([cat, entries]) => {
      return `=== ${cat.toUpperCase()} ===\n${entries.map(e => `- ${e.subcategory}: ${e.description}`).join('\n')}`;
    }).join('\n\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `past-history-template-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Template downloaded');
  };

  const categoryFilter = {
    key: 'category',
    label: 'Category',
    options: CATEGORY_OPTIONS
  };

  return (
    <div className="pt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="h3-heading">Past History Records</h2>
        <div className="flex gap-2">
          <button onClick={generateTemplate} className="edit-btn flex items-center gap-1">
            <Download size={16} /> 
          </button>
          <button onClick={() => openModal('add')} className="btn btn-primary flex items-center gap-1">
            <Plus size={16} /> Add History
          </button>
        </div>
      </div>

      <DynamicTable
        columns={[
          {
            accessor: 'category',
            header: 'Category',
            cell: (row) => CATEGORY_OPTIONS.find(opt => opt.value === row.category)?.label || row.category
          },
          { accessor: 'subcategory', header: 'Subcategory', cell: row => row.subcategory || '-' },
          { accessor: 'description', header: 'Description', cell: row => row.description || '-' },
          {
            header: 'Actions', accessor: 'actions',
            cell: (row) => (
              <div className="flex space-x-2">
                <button onClick={() => openModal('edit', row)} className="edit-btn hover:bg-blue-100 rounded p-1 transition hover:animate-bounce">
                  <FaEdit className="text-[--primary-color]" />
                </button>
                <button onClick={() => openModal('confirmDelete', row)} className="delete-btn hover:bg-red-100 rounded p-1 transition hover:animate-bounce">
                  <FaTrash className="text-red-500" />
                </button>
              </div>
            )
          }
        ]}
        data={records}
  filters={[{
  key: 'combinedFilter',
  label: 'Category',
  options: CATEGORY_OPTIONS
}]}
      />
      <ReusableModal
        isOpen={modal.open}
        onClose={closeModal}
        mode={modal.mode}
        title={
          modal.mode === 'edit' ? 'Edit Record' :
            modal.mode === 'confirmDelete' ? 'Delete Confirmation' :
              'Add Past History Record'
        }
        data={modal.item}
        fields={getFields()}
        onSave={handleSave}
        onDelete={handleDelete}
      />
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
