import React, { useState, useEffect, useRef, memo } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEdit, FaTrash } from "react-icons/fa";
const Modal = ({ children, onClose }) => {
  const ref = useRef();
  useEffect(() => {
    const handler = e => ref.current && !ref.current.contains(e.target) && onClose();
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);
  return <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"><div ref={ref} className="bg-[var(--color-surface)] rounded-xl shadow-xl p-6 max-w-2xl w-full">{children}</div></div>;
};
const PharmacyApprovedModal = memo(({ onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 2000); return () => clearTimeout(t); }, [onClose]);
  return <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4"><div className="bg-[var(--color-surface)] rounded-xl shadow-2xl w-full max-w-sm p-6 flex flex-col items-center"><svg className="w-16 h-16 text-green-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg><h3 className="text-2xl font-semibold text-green-700 mb-2">Pharmacy Approved!</h3><button onClick={onClose} className="btn btn-primary px-6 py-2">Close</button></div></div>;
});
export default function PharmacyList() {
  const [pharmacies, setPharmacies] = useState([]),
    [search, setSearch] = useState(''),
    [filterStatus, setFilterStatus] = useState('All'),
    [sel, setSel] = useState(null),
    [rejModal, setRejModal] = useState(false),
    [rejReason, setRejReason] = useState(''),
    [err, setErr] = useState(''),
    [successMsg, setSuccessMsg] = useState(''),
    [deleteConfirm, setDeleteConfirm] = useState(false),
    [pharmacyToDelete, setPharmacyToDelete] = useState(null),
    [editModal, setEditModal] = useState(false),
    [editForm, setEditForm] = useState({});
  useEffect(() => { axios.get('https://mocki.io/v1/738614f4-5d55-41f4-b002-fe5e825d561b').then(res => setPharmacies(res.data.pharmacies || res.data)).catch(console.error); }, []);
  const closeAll = () => { setSel(null); setRejModal(false); setRejReason(''); setErr(''); setEditModal(false); setEditForm({}); };
  const updateStatus = (id, status, reason = '') => {
    setPharmacies(p => p.map(x => x.id === id ? { ...x, status, reason } : x));
    closeAll();
    if (status === 'Approved') {
      setSuccessMsg('Pharmacy approved successfully!');
      toast.success('Pharmacy approved successfully!', { position: "top-right", autoClose: 3000 });
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };
  const submitRej = () => rejReason.trim() ? updateStatus(sel.id, 'Rejected', rejReason.trim()) : setErr('Please enter a rejection reason.');
  const confirmDelete = p => { setPharmacyToDelete(p); setDeleteConfirm(true); };
  const handleDelete = () => { setPharmacies(p => p.filter(x => x.id !== pharmacyToDelete.id)); setDeleteConfirm(false); setPharmacyToDelete(null); };
  const openEditModal = p => { setEditForm(p); setEditModal(true); };
  const handleEditChange = e => setEditForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleEditSubmit = e => { e.preventDefault(); setPharmacies(p => p.map(x => x.id === editForm.id ? { ...editForm } : x)); closeAll(); setSuccessMsg('Pharmacy updated successfully!'); setTimeout(() => setSuccessMsg(''), 3000); };
  const filtered = pharmacies.filter(p => p.pharmacyName.toLowerCase().includes(search.toLowerCase()) && (filterStatus === 'All' || p.status === filterStatus));
  return (
    <div className="p-6 w-full">
      <ToastContainer />
      <h2 className="h3-heading mb-4">Pharmacy Management</h2>
      <div className="flex gap-4 mb-6">
        <input placeholder="Search pharmacy name..." value={search} onChange={e => setSearch(e.target.value)} className="input-field w-full" />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input-field max-w-60">{['All', 'Pending', 'Approved', 'Rejected'].map(s => <option key={s}>{s}</option>)}</select>
      </div>
      {!filtered.length ? <p className="text-[var(--color-overlay)]">No pharmacies found.</p> : (
        <table className="table-container border">
          <thead className="table-head">
            <tr>
              {['Pharm.ID', 'Pharmacy Name', 'Phone No.', 'Reg.No.', 'Status', 'Action'].map(h => <th key={h} className="p-2 text-left">{h}</th>)}
            </tr>
          </thead>
          <tbody className="table-body ">
            {filtered.map(p => (
              <tr key={p.id} className="tr-style">
                <td>{p.id}</td>
                <td className="flex items-center gap-2">
                  <span className="cursor-pointer hover:underline" onClick={() => setSel(p)}>{p.pharmacyName}</span>
                  <button onClick={() => setSel(p)} className="p-1" title="View"></button>
                </td>
                <td>{p.phone}</td>
                <td>{p.registrationNumber}</td>
                <td>
                  <span className={`font-semibold ${
                    p.status === 'Approved' ? 'text-green-600' :
                    p.status === 'Rejected' ? 'text-red-600' :
                    p.status === 'Pending' ? 'text-yellow-600' : ''
                  }`}>{p.status}</span>
                </td>
                <td className="flex justify-center gap-2 flex-wrap">
                  {p.status === 'Approved' && (
                    <>
                      <button
                        onClick={() => openEditModal(p)}
                        className="edit-btn p-2 rounded hover:bg-green-100 transition hover:animate-bounce"
                        title="Edit"
                      >
                        <FaEdit className="text-[--primary-color]" />
                      </button>
                      <button
                        onClick={() => confirmDelete(p)}
                        className="delete-btn p-2 rounded hover:bg-red-100 transition hover:animate-bounce"
                        title="Delete"
                      >
                        <FaTrash className="text-red-500" />
                      </button>
                    </>
                  )}
                  {p.status === 'Rejected' && (
                    <button
                      onClick={() => confirmDelete(p)}
                      className="delete-btn p-2 rounded hover:bg-red-100 transition hover:animate-bounce"
                      title="Delete"
                    >
                      <FaTrash className="text-red-500" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {sel && !rejModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4 overflow-y-auto">
          <div className="relative bg-[var(--color-surface)] rounded-2xl shadow-2xl max-w-3xl w-full mx-auto p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <button onClick={closeAll} className="absolute top-5 right-5 text-[var(--color-overlay)] text-2xl">✕</button>
            <h2 className="h3-heading border-b pb-3">Pharmacy Details</h2>
            <section className='p-6 rounded-lg shadow-sm border mb-4'>
               <h3 className="paragraph font-bold mb-3 border-b pb-2">Basic Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 paragraph">
              {[['Pharmacy Name', sel.pharmacyName], ['Owner Name', sel.ownerName], ['Phone No.', sel.phone], ['Email', sel.email], ['Location', sel.location], ['Aadhaar', 'XXXX XXXX XXXX']].map(([k, v], i) => <p key={i}><strong>{k}:</strong> {v}</p>)}
            </div>
            </section>
            <section className='p-6 rounded-lg shadow-sm border mb-4'>
              <h3 className="paragraph font-bold mb-3 border-b pb-2">Additional Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 paragraph">
              {[['Pharmacy Type', sel.pharmacyType.join(', ')], ['License No.', sel.licenseNumber], ['Registration No.', sel.registrationNumber], ['Services Offered', sel.servicesOffered.join(', ')]].map(([k, v], i) => <p key={i}><strong>{k}:</strong> {v}</p>)}
            </div>
             </section>
              <section className='p-6 rounded-lg shadow-sm border mb-4'>
              <h3 className="paragraph font-bold mb-3 border-b pb-2">Documents</h3>
            {sel.documents && Object.keys(sel.documents).length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 paragraph">
                {Object.entries(sel.documents).map(([doc, uploaded], i) => (
                  <div key={i} className="p-4 bg-[var(--color-surface)] border rounded shadow">
                    <p className="font-medium mb-2">📄 {doc.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</p>
                    {uploaded ? <a href={sel.documentUrls?.[doc] || '#'} className="text-yellow-600 underline text-xs" target="_blank" rel="noreferrer">View</a> : <p className="text-gray-400 italic text-xs">Not available</p>}
                  </div>
                ))}
              </div>
            )}
            </section>
            <div className=" p-6 rounded border">
              <p><strong>Status:</strong> <span className={`font-semibold ${sel.status === 'Approved' ? 'text-green-600' : sel.status === 'Rejected' ? 'text-red-600' : 'text-yellow-600'}`}>{sel.status}</span></p>
            </div>
            {sel.status === 'Pending' && <div className="flex justify-end gap-4 pt-4 border-t"><button onClick={() => updateStatus(sel.id, 'Approved')} className="view-btn ">Approve</button><button onClick={() => setRejModal(true)} className="delete-btn px-6 py-2">Reject</button></div>}
              {sel.status === 'Rejected' && <p className="mt-4 font-semibold">Reason: <span>{sel.reason || 'N/A'}</span></p>}
          </div>
        </div>
      )}
      {rejModal && (
        <Modal onClose={closeAll}>
          <h3 className="h4-heading mb-4">Reject Pharmacy</h3>
          <textarea value={rejReason} onChange={e => { setErr(''); setRejReason(e.target.value); }} rows={2} placeholder="Enter reason for rejection..." className="input-field" />
          {err && <p className="error-text mt-2">{err}</p>}
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={closeAll} className="btn btn-secondary">Cancel</button>
            <button onClick={submitRej} className="btn btn-primary">Submit</button>
          </div>
        </Modal>
      )}
      {deleteConfirm && (
        <Modal onClose={() => setDeleteConfirm(false)}>
          <h3 className="h4-heading mb-4 ">Confirm Delete</h3>
          <p>Are you sure you want to delete <strong>{pharmacyToDelete.pharmacyName}</strong>?</p>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => setDeleteConfirm(false)} className="view-btn">Cancel</button>
            <button onClick={handleDelete} className="delete-btn">Yes,Delete</button>
          </div>
        </Modal>
      )}
     {editModal && (
        <Modal onClose={closeAll}>
          <h3 className="text-lg font-semibold mb-4">Edit Pharmacy</h3>
          <form onSubmit={handleEditSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {['pharmacyName','ownerName','phone','email','location','licenseNumber','registrationNumber'].map(f=>(
                <div key={f}>
                  <label className="block text-sm font-medium text-[var(--color-overlay)] mb-1">{f.replace(/([A-Z])/g,' $1')}</label>
                  <input name={f} value={editForm[f]||''} onChange={handleEditChange} className="input-field" />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-4">
              <button type="button" onClick={closeAll} className="btn btn-secondary">Cancel</button>
              <button type="submit" className="btn btn-primary">Save</button>
            </div>
          </form>
        </Modal>
      )}
    </div>  );
}