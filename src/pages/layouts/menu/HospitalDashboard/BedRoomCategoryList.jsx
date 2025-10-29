import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DynamicTable from '../../../../components/microcomponents/DynamicTable';
import ReusableModal from '../../../../components/microcomponents/Modal';

const STORAGE_KEY = 'bedroom_categories';

const defaultRooms = [
  { id: 1, category: 'Emergency', capacity: 5, status: 'Active' },
  { id: 2, category: 'ICU', capacity: 2, status: 'Active' },
  { id: 3, category: 'General', capacity: 10, status: 'Inactive' },
  { id: 4, category: 'Private', capacity: 1, status: 'Active' },
  { id: 5, category: 'Maternity', capacity: 6, status: 'Inactive' },
];

export default function BedroomCategory() {
  const [rooms, setRooms] = useState([]);
  const [modal, setModal] = useState({ open: false, mode: 'add', item: null });

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRooms(parsed);
        } else {
          setRooms(defaultRooms);
        }
      } catch {
        setRooms(defaultRooms);
      }
    } else {
      setRooms(defaultRooms);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
  }, [rooms]);

  const getFields = () => [
    {
      name: 'category',
      label: 'Category Name',
      placeholder: 'e.g. ICU, Emergency',
    },
    {
      name: 'capacity',
      label: 'Room Capacity',
      type: 'number',
      placeholder: 'e.g. 5',
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { label: 'Active', value: 'Active' },
        { label: 'Inactive', value: 'Inactive' },
      ],
    },
  ];

  const openModal = (mode, item = null) => {
    setModal({ open: true, mode, item });
  };

  const closeModal = () => {
    setModal({ open: false, mode: 'add', item: null });
  };

  const handleSave = (data) => {
    const isEdit = modal.mode === 'edit';
    const id = modal.item?.id || Date.now();
    const newItem = { ...data, id, capacity: parseInt(data.capacity) };

    if (isEdit) {
      setRooms(prev => prev.map(r => r.id === id ? newItem : r));
      toast.success('Room updated');
    } else {
      setRooms(prev => [...prev, newItem]);
      toast.success('Room added');
    }
    closeModal();
  };

  const handleDelete = () => {
    setRooms(prev => prev.filter(r => r.id !== modal.item.id));
    toast.success('Room deleted');
    closeModal();
  };

  const fields = getFields();

  const columns = [
    ...fields.map(f => ({
      accessor: f.name,
      header: f.label,
      cell: (val) => {
        // If val is an object, try to extract the correct value
        let displayVal = val;
        if (val && typeof val === 'object') {
          // Try to get the value for this column
          if (f.name in val) {
            displayVal = val[f.name];
          } else {
            displayVal = '';
          }
        }
        if (f.name === 'status') {
          return (
            <span className={`px-2 py-1 text-xs rounded-full uppercase ${displayVal === 'Active'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'}`}>
              {displayVal}
            </span>
          );
        }
        // Prevent rendering objects
        return (typeof displayVal === 'string' || typeof displayVal === 'number') ? displayVal : '';
      }
    })),
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row) => {
        // row is the full row object
        return (
          <div className="flex space-x-2">
            <button
              onClick={() => openModal('edit', row)}
              className="edit-btn flex items-center justify-center hover:bg-blue-100 rounded p-1 transition hover:animate-bounce"
            >
              <FaEdit className="text-[--primary-color]" />
            </button>
            <button
              onClick={() => openModal('confirmDelete', row)}
              className="delete-btn flex items-center justify-center hover:bg-red-100 rounded p-1 transition hover:animate-bounce"
            >
              <FaTrash className="text-red-500" />
            </button>
          </div>
        );
      }
    }
  ];

  return (
    <div className="pt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="h3-heading">Bedroom Management</h2>
        <button className="btn btn-primary flex items-center gap-2" onClick={() => openModal('add')}>
          <Plus size={16} /> Add Category
        </button>
      </div>

      <DynamicTable
        columns={columns}
        data={rooms}
        filters={[
          {
            key: 'combinedFilter',
            label: 'Category',
            options: [...new Set(rooms.map(r => r.category))].map(c => ({ label: c, value: c })),
          },
        ]}
        rowKey="id"
      />

      <ReusableModal
        isOpen={modal.open}
        onClose={closeModal}
        mode={modal.mode}
        title={
          modal.mode === 'edit'
            ? 'Edit Room'
            : modal.mode === 'confirmDelete'
              ? 'Delete Confirmation'
              : 'Add Room'
        }
        data={modal.item}
        fields={modal.mode === 'confirmDelete' ? [] : getFields()}
        onSave={handleSave}
        onDelete={handleDelete}
      />

      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
}
