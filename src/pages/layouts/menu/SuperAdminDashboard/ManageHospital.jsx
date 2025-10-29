import React, { useState, useCallback, useMemo } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const HospitalComponent = () => {
  const [state, setState] = useState({
    hospitals: [
      { id: 1, name: 'Sunrise Hospital', ceo: 'Dr. Anjali Mehta', registrationNumber: 'MH-HOSP-001', phone: '9876543210', email: 'sunrise@example.com', city: 'Mumbai', state: 'Maharashtra', type: 'Private', gst: '27AABCU9603R1Z2', labInbuilt: true, labGst: '27LAB1234R1Z9', pharmacyInbuilt: false, status: 'pending', rejectionReason: '', documents: [{ name: "Registration Certificate", url: "https://example.com/doc1.pdf" }] },
      { id: 2, name: 'Apollo Healthcare', ceo: 'Dr. Rajiv Khanna', registrationNumber: 'DL-HOSP-202', phone: '9871234560', email: 'apollo@example.com', city: 'Delhi', state: 'Delhi', type: 'Trust', gst: '07AAACA1234R1Z8', labInbuilt: true, labGst: '07LAB5678R1Z6', pharmacyInbuilt: true, pharmacyGst: '07PHAR4567R1Z3', status: 'approved', rejectionReason: '', documents: [{ name: "Registration Certificate", url: "https://example.com/doc1.pdf" }] },
      { id: 3, name: 'Green Life Hospital', ceo: 'Dr. Neha Sharma', registrationNumber: 'KA-HOSP-107', phone: '9765432180', email: 'greenlife@example.com', city: 'Bangalore', state: 'Karnataka', type: 'Public', gst: '29ABCDG1234H1Z5', labInbuilt: false, pharmacyInbuilt: true, pharmacyGst: '29PHARM1234Z9R1', status: 'pending', rejectionReason: '', documents: [{ name: "Registration Certificate", url: "https://example.com/doc1.pdf" }] }
    ],
    filter: 'all', searchQuery: '', selectedHospital: null, editForm: {}, rejectionReason: '',
    modals: { detail: false, reject: false, delete: false, edit: false },
    currentPage: 1, rowsPerPage: 5,
  });

  const updateState = useCallback(updates => setState(prev => ({ ...prev, ...updates })), []);
  const toggleModal = useCallback(modal => updateState({ modals: { ...state.modals, [modal]: !state.modals[modal] } }), [state.modals, updateState]);
  const filteredHospitals = useMemo(() => state.hospitals.filter(h => (state.filter === 'all' || h.status === state.filter) && (!state.searchQuery || Object.values(h).some(v => String(v).toLowerCase().includes(state.searchQuery.toLowerCase())))), [state.hospitals, state.filter, state.searchQuery]);
  const totalPages = useMemo(() => Math.ceil(filteredHospitals.length / state.rowsPerPage), [filteredHospitals.length, state.rowsPerPage]);
  const paginatedHospitals = useMemo(() => { const start = (state.currentPage - 1) * state.rowsPerPage; return filteredHospitals.slice(start, start + state.rowsPerPage); }, [filteredHospitals, state.currentPage, state.rowsPerPage]);
  const updateStatus = useCallback((id, status, reason = '') => { setState(prev => ({ ...prev, hospitals: prev.hospitals.map(h => h.id === id ? { ...h, status, rejectionReason: status === 'rejected' ? reason : '' } : h), modals: { ...prev.modals, reject: false, detail: false }, rejectionReason: '' })); if (status === 'approved') toast.success('Hospital approved successfully!'); }, [state.modals, updateState]);
  const deleteHospital = useCallback(id => setState(prev => ({ ...prev, hospitals: prev.hospitals.filter(h => h.id !== id), modals: { ...prev.modals, delete: false } })), []);
  const handleEdit = useCallback(hospital => updateState({ editForm: hospital, modals: { ...state.modals, edit: true, detail: false } }), [state.modals, updateState]);
  const handleInputChange = useCallback(e => { const { name, value } = e.target; setState(prev => ({ ...prev, editForm: { ...prev.editForm, [name]: value } })); }, []);
  const handleEditSubmit = useCallback(e => { e.preventDefault(); setState(prev => ({ ...prev, hospitals: prev.hospitals.map(h => h.id === prev.editForm.id ? { ...h, ...prev.editForm } : h), modals: { ...prev.modals, edit: false } })); }, [state.modals, updateState]);
  const Modal = ({ isOpen, title, children }) => isOpen && (<div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50"><div className="bg-[var(--color-surface)] rounded-2xl shadow-2xl max-w-3xl w-full mx-4 p-8 space-y-6 max-h-[90vh] overflow-y-auto relative animate-fade-in"><button onClick={() => toggleModal(title)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition hover:rotate-90 duration-300"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[var(--color-overlay)]" fill="currentColor" viewBox="0 0 20 20"><path d="M6 6L14 14M6 14L14 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></button><h2 className="h3-heading pr-8">{title === 'detail' ? 'Hospital Details' : title === 'edit' ? 'Edit Hospital' : title === 'reject' ? 'Reject Hospital' : 'Delete Hospital'}</h2>{children}</div></div>);
  const handlePageChange = useCallback(page => { updateState({ currentPage: page }); }, [updateState]);

  return (
    <div className="p-6 rounded-xl w-full max-w-7xl mx-auto m-2">
      <ToastContainer position="top-right" autoClose={2000} />
      <h2 className="h3-heading mb-6">Manage Hospitals</h2>
      <div className="flex items-center gap-2 mb-4">
       <div className="relative w-full">
  <div className="floating-input relative" data-placeholder="Search...">
    <input
      type="text"
      placeholder=" "
      value={state.searchQuery}
      onChange={e => updateState({ searchQuery: e.target.value })}
      className="input-field peer pl-8 pr-2 py-2 text-md"
      autoComplete="off"
    />
  </div>
</div>
        <select value={state.filter} onChange={e => updateState({ filter: e.target.value })} className="input-field text-md max-w-60">
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      <div className="table-container">
        <table className="table min-w-full">
          <thead>
            <tr className="table-head">
              <th className="p-2 text-center">ID</th>
              <th className="p-2 text-center">Name</th>
              <th className="p-2 text-center">City</th>
              <th className="p-2 text-center">Phone</th>
              <th className="p-2 text-center">Reg. No.</th>
              <th className="p-2 text-center">Status</th>
              <th className="p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="table-body">
            {paginatedHospitals.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-4">No hospitals found.</td>
              </tr>
            ) : (
              paginatedHospitals.map(h => (
                <tr key={h.id} className="tr-style">
                  <td className="text-center">{h.id}</td>
                  <td className="text-center">
                    <button onClick={() => updateState({ selectedHospital: h, modals: { ...state.modals, detail: true } })} className="hover:underline text-[var(--primary-color)] font-medium" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>{h.name}</button>
                  </td>
                  <td className="text-center">{h.city}</td>
                  <td className="text-center">{h.phone}</td>
                  <td className="text-center">{h.registrationNumber}</td>
                  <td className="text-center">
                    <span className={`font-medium ${h.status === 'approved' ? 'text-green-600' : h.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'}`}>{h.status}</span>
                  </td>
                  <td className="flex gap-2 justify-center">
                    {h.status === 'approved' && (
                      <button onClick={() => handleEdit(h)} className="edit-btn p-2 rounded hover:bg-green-100 transition hover:animate-bounce" title="Edit"><FaEdit className="text-[--primary-color]" /></button>
                    )}
                    {(h.status === 'approved' || h.status === 'rejected') && (
                      <button onClick={() => updateState({ selectedHospital: h, modals: { ...state.modals, delete: true } })} className="delete-btn p-2 rounded hover:bg-red-100 transition hover:animate-bounce" title="Delete"><FaTrash className="text-red-600" /></button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-end justify-end mt-4">
        <div className="flex items-center gap-2">
          <button onClick={() => handlePageChange(state.currentPage - 1)} disabled={state.currentPage === 1} className="edit-btn px-3">Previous</button>
          <span>Page {state.currentPage} of {totalPages}</span>
          <button onClick={() => handlePageChange(state.currentPage + 1)} disabled={state.currentPage === totalPages || totalPages === 0} className="edit-btn px-3">Next</button>
        </div>
      </div>
      <Modal isOpen={state.modals.detail} title="detail">
        {state.selectedHospital && (<><section className="p-4 rounded-lg shadow-sm border"><h3 className="paragraph font-bold mb-3 border-b pb-2">Basic Information</h3><div className="grid grid-cols-1 sm:grid-cols-2 gap-4 paragraph">{Object.entries({'Hospital Name': state.selectedHospital.name,'CEO Name': state.selectedHospital.ceo,'Registration No.': state.selectedHospital.registrationNumber,'Hospital Type': state.selectedHospital.type,'Phone': state.selectedHospital.phone,'Email': state.selectedHospital.email,'City': state.selectedHospital.city,'State': state.selectedHospital.state,'Main GST Number': state.selectedHospital.gst}).map(([key, value]) => (<p key={key} className={key === 'Main GST Number' ? 'paragraph sm:col-span-2' : ''}><strong>{key}:</strong> {value}</p>))}</div></section><section className="p-4 rounded-lg shadow-sm border"><h3 className="paragraph font-bold mb-3 border-b pb-2">Inbuilt Facilities</h3><div className="grid grid-cols-1 sm:grid-cols-2 gap-6 paragraph"><p><span className="font-semibold">Lab Inbuilt:</span> {state.selectedHospital.labInbuilt ? "Yes" : "No"}</p>{state.selectedHospital.labInbuilt && <p><span className="font-semibold">Lab GST Number:</span> {state.selectedHospital.labGst}</p>}<p><span className="font-semibold">Pharmacy Inbuilt:</span> {state.selectedHospital.pharmacyInbuilt ? "Yes" : "No"}</p>{state.selectedHospital.pharmacyInbuilt && <p><span className="font-semibold">Pharmacy GST Number:</span> {state.selectedHospital.pharmacyGst}</p>}</div></section>{state.selectedHospital.documents?.length > 0 && (<section className="p-4 rounded-lg shadow-sm border"><h3 className="paragraph font-bold mb-3 border-b pb-2">Documents</h3><div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">{state.selectedHospital.documents.map((doc, i) => (<div key={i} className="border rounded-lg p-4 bg-[var(--color-surface)] shadow hover:shadow-md transition-shadow cursor-pointer truncate"><p className="font-medium mb-2 flex items-center gap-2"><span role="img" aria-label="document">📄</span> {doc.name || `Document ${i + 1}`}</p><a href={doc.url} target="_blank" rel="noreferrer" className="text-yellow-600 hover:text-yellow-800 underline text-xs">View Document</a></div>))}</div></section>)}{state.selectedHospital.status === 'pending' && (<section className="flex justify-end gap-4 pt-4 border-t border-gray-300"><button onClick={() => updateStatus(state.selectedHospital.id, 'approved')} className="view-btn px-7 py-2">Approve</button><button onClick={() => { toggleModal('detail'); updateState({ selectedHospital: state.selectedHospital, modals: { ...state.modals, reject: true } }); }} className="delete-btn px-7 py-2">Reject</button></section>)}</>)}
      </Modal>
      <Modal isOpen={state.modals.edit} title="edit">
  <form onSubmit={handleEditSubmit}>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
      {Object.entries({
        name: 'Hospital Name',
        ceo: 'CEO Name',
        registrationNumber: 'Registration Number',
        type: 'Hospital Type',
        phone: 'Phone',
        email: 'Email',
        city: 'City',
        state: 'State',
        gst: 'GST Number',
        labGst: 'Lab GST Number',
        pharmacyGst: 'Pharmacy GST Number'
      }).map(([field, label]) => (
        <div key={field}>
          <div className="floating-input relative" data-placeholder={label}>
            <input
              type={field === 'email' ? 'email' : 'text'}
              name={field}
              value={state.editForm[field] || ''}
              onChange={handleInputChange}
              className="input-field peer"
              placeholder=" "
              autoComplete="off"
            />
          </div>
        </div>
      ))}
      <div className="flex-1">
        <select
          name="labInbuilt"
          value={state.editForm.labInbuilt}
          onChange={handleInputChange}
          className="input-field"
        >
          <option value={true}>Yes</option>
          <option value={false}>No</option>
        </select>
      </div>
      <div className="flex-1">
        <select
          name="pharmacyInbuilt"
          value={state.editForm.pharmacyInbuilt}
          onChange={handleInputChange}
          className="input-field"
        >
          <option value={true}>Yes</option>
          <option value={false}>No</option>
        </select>
      </div>
    </div>
    <div className="flex justify-end gap-4 pt-6">
      <button type="button" onClick={() => toggleModal('edit')} className="delete-btn">Cancel</button>
      <button type="submit" className="btn btn-primary">Save Changes</button>
    </div>
  </form>
</Modal>
      <Modal isOpen={state.modals.reject} title="reject">
        {state.selectedHospital && (<><p className="mb-2 font-bold">Please provide a reason for rejection:</p><textarea className="input-field" rows={2} value={state.rejectionReason} onChange={e => updateState({ rejectionReason: e.target.value })} /><div className="flex justify-end gap-3"><button onClick={() => toggleModal('reject')} className="btn btn-secondary">Cancel</button><button onClick={() => updateStatus(state.selectedHospital.id, 'rejected', state.rejectionReason)} className="btn btn-primary" disabled={!state.rejectionReason.trim()}>Confirm Reject</button></div></>)}
      </Modal>
      <Modal isOpen={state.modals.delete} title="delete">
        {state.selectedHospital && (<><p className="mb-4">Are you sure you want to delete {state.selectedHospital.name}?</p><div className="mt-4 flex justify-end gap-2"><button onClick={() => toggleModal('delete')} className="view-btn">Cancel</button><button onClick={() => deleteHospital(state.selectedHospital.id)} className="delete-btn">Confirm Delete</button></div></>)}
      </Modal>
    </div>);};export default HospitalComponent;