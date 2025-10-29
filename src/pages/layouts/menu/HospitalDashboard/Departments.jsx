import React, { useEffect, useState } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
const API_URL = 'https://6825b85c0f0188d7e72e26eb.mockapi.io/departments';

function Department() {
  const [departments, setDepartments] = useState([]);  
  const [formOpen, setFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({ id: '', name: '', head: '', infra: '', staff: '', generalBeds: '', privateBeds: '', icuBeds: '' });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const totalPages = Math.ceil(departments.length / pageSize);
  const currentDepartments = departments.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const fetchDepartments = async () => {
    try {
      const res = await fetch(API_URL);
      setDepartments(await res.json());
    } catch (err) {
      console.error('Fetch error', err);
    }
  };

  useEffect(() => { fetchDepartments(); }, []);

  const handleSubmit = async () => {
    const payload = {
      id: formData.id,
      name: formData.name,
      head: formData.head,
      infra: formData.infra,
      staff: formData.staff,
      wards: {
        general: formData.generalBeds,
        private: formData.privateBeds,
        icu: formData.icuBeds
      }
    };
    try {
      const res = await fetch(isEditMode ? `${API_URL}/${formData.id}` : API_URL, {
        method: isEditMode ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to save');
      fetchDepartments();
      resetForm();
    } catch (err) {
      console.error('Save error', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      fetchDepartments();
    } catch (err) {
      console.error('Delete error', err);
    }
    setDeleteModalOpen(false);
    setDeleteId(null);
  };

  const handleEdit = (d) => {
    setFormData({
      id: d.id,
      name: d.name,
      head: d.head,
      infra: d.infra,
      staff: d.staff,
      generalBeds: d.wards?.general,
      privateBeds: d.wards?.private,
      icuBeds: d.wards?.icu
    });
    setIsEditMode(true);
    setFormOpen(true);
  };

  const resetForm = () => {
    setFormData({ id: '', name: '', head: '', infra: '', staff: '', generalBeds: '', privateBeds: '', icuBeds: '' });
    setIsEditMode(false);
    setFormOpen(false);
  };

  // Helper to render input/select with correct classes
  const renderField = (label, name, type = 'text', disabled = false) => {
    // If select (for future use) or file/image input, do not use floating label
    if (type === 'select') {
      // Example for select, not used in your current fields
      return (
        <select
          className="input-field"
          disabled={disabled}
          value={formData[name]}
          onChange={e => setFormData(p => ({ ...p, [name]: e.target.value }))}
        >
          {/* options here */}
        </select>
      );
    }
    if (type === 'file' || type === 'image') {
      return (
        <input
          type={type}
          disabled={disabled}
          className="input-field"
          value={formData[name]}
          onChange={e => setFormData(p => ({ ...p, [name]: e.target.value }))}
        />
      );
    }
    // Default: floating label
    return (
      <div className="floating-input relative" data-placeholder={label}>
        <input
          type={type}
          disabled={disabled}
          className="input-field peer"
          placeholder=" "
          value={formData[name]}
          onChange={e => setFormData(p => ({ ...p, [name]: e.target.value }))}
        />
      </div>
    );
  };

  return (
    <>
      <div className="p-6 mt-4 bg-white rounded-2xl shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="h3-heading">Departments</h3>
            <p className="paragraph">Manage your hospital departments</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setFormOpen(true);
            }}
            className="btn btn-primary relative group overflow-hidden px-6 font-semibold rounded-full border 
             text-[var(--accent-color)] bg-transparent border-[var(--accent-color)] transition-all duration-300 ease-in-out">
            <span className="absolute left-0 top-0 w-1/2 h-full bg-[var(--accent-color)] 
                   translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 ease-out z-0 rounded-l-full"></span>
            <span className="absolute right-0 top-0 w-1/2 h-full bg-[var(--accent-color)] 
                   translate-x-[100%] group-hover:translate-x-0 transition-transform duration-500 ease-out z-0 rounded-r-full"></span>
            <span className="relative z-10 transition-colors duration-300 group-hover:text-white">
              Add Department
            </span>
          </button>
        </div>
        <div className="mt-2">
          <div className="overflow-x-auto">
            <table className="table-container">
              <thead className="table-head">
                <tr>{['deptId', 'departmentName', 'headOfDepartment', 'infra', 'staff', 'wards', 'actions'].map((h, i) => (
                  <th key={i} className="px-6 py-2 text-start"><p className="tr-style">{h.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</p></th>
                ))}</tr></thead>
              <tbody className="table-body">
                {currentDepartments.map(d => (
                  <tr key={d.id} className="hover:bg-gray-50 transition-colors duration-200">
                    {[d.id, d.name, d.head, d.infra, d.staff, `Gen: ${d.wards?.general}, Priv: ${d.wards?.private}, ICU: ${d.wards?.icu}`].map((value, i) => (
                      <td key={i} className="px-6 py-4 whitespace-nowrap"><p className="paragraph">{value}</p></td>
                    ))}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(d)}
                          className="edit-btn flex items-center justify-center hover:bg-blue-100 rounded p-1 transition hover:animate-bounce"
                          title="Edit"
                        >
                          <FaEdit className="text-[--primary-color]" />
                        </button>
                        <button
                          onClick={() => { setDeleteModalOpen(true); setDeleteId(d.id); }}
                          className="delete-btn flex items-center justify-center hover:bg-red-100 rounded p-1 transition hover:animate-bounce"
                          title="Delete"
                        >
                          <FaTrash className="text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {formOpen && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl">
              <div className="flex justify-between items-center border-b border-[--primary-color]/10 pb-4">
                <h3 className="h3-heading">{isEditMode ? 'Edit Department' : 'Add New Department'}</h3>
                <button onClick={resetForm} className="text-[--primary-color]/50 hover:text-[--primary-color]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                {/* Use renderField for each input */}
                {[
                  ['Department ID', 'id', 'text', isEditMode],
                  ['Name', 'name'],
                  ['Head', 'head'],
                  ['Infrastructure', 'infra'],
                  ['Staff Names', 'staff'],
                  ['General Beds', 'generalBeds'],
                  ['Private Beds', 'privateBeds'],
                  ['ICU Beds', 'icuBeds'],
                  // Example for image/file: ['Department Image', 'image', 'file']
                  // Example for select: ['Type', 'type', 'select']
                ].map(([label, name, type = 'text', disabled = false]) => (
                  <div key={name} className="col-span-1">
                    {renderField(label, name, type, disabled)}
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[--primary-color]/10">
                <button onClick={resetForm} className="btn-secondary">Close</button>
                <button onClick={handleSubmit} className="btn btn-primary">{isEditMode ? 'Update' : 'Submit'}</button>
              </div>
            </div>
          </div>
        )}
        {deleteModalOpen && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
              <h3 className="h3-heading mb-4">Confirm Delete</h3>
              <p className="paragraph mb-6">Are you sure you want to delete this department?</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => { setDeleteModalOpen(false); setDeleteId(null); }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteId)}
                  className="btn btn-primary bg-red-500 hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* PAGINATION OUTSIDE CARD */}
      <div className="flex justify-end items-center mt-4">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(p => p - 1)}
          className={`edit-btn ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Previous
        </button>
        <span className="mx-2">Page {currentPage} of {totalPages || 1}</span>
        <button
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() => setCurrentPage(p => p + 1)}
          className={`edit-btn ${currentPage === totalPages || totalPages === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Next
        </button>
      </div>
    </>
  );
}
export default Department;