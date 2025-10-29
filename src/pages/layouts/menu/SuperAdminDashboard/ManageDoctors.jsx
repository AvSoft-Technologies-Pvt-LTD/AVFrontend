import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash } from 'react-icons/fa';
const Modal = ({ children }) => (<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"><div className="bg-[var(--color-surface)] p-6 rounded shadow-lg w-full max-w-xl min-w-[350px] max-h-[80vh] overflow-y-auto relative">{children}</div></div>);
const statusColor = { approved: "text-green-400", pending: "text-yellow-400", rejected: "text-red-400" };
const DoctorTable = () => {
  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1), [doctors, setDoctors] = useState([]), [selectedDoctor, setSelectedDoctor] = useState(null), [filter, setFilter] = useState("all"), [searchQuery, setSearchQuery] = useState(""), [showModal, setShowModal] = useState(false), [deleteConfirm, setDeleteConfirm] = useState(false), [showRejectModal, setShowRejectModal] = useState(false), [rejectionReason, setRejectionReason] = useState(""), [showEditModal, setShowEditModal] = useState(false);
  useEffect(() => { axios.get("https://mocki.io/v1/e3c8154d-f562-40cc-81e7-be6d74695d06").then(res => setDoctors(res.data)).catch(console.error); }, []);
  const handleApprove = () => { setDoctors(prev => prev.map(doc => doc.id === selectedDoctor.id ? { ...doc, status: "approved" } : doc)); setShowModal(true); setTimeout(() => { setShowModal(false); setSelectedDoctor(null); }, 2000); };
  const confirmReject = () => { setDoctors(prev => prev.map(doc => doc.id === selectedDoctor.id ? { ...doc, status: "rejected", rejectionReason, rejectionDate: new Date().toLocaleDateString() } : doc)); setShowRejectModal(false); setSelectedDoctor(null); setRejectionReason(""); };
  const handleDelete = () => { setDoctors(prev => prev.filter(doc => doc.id !== selectedDoctor.id)); setDeleteConfirm(false); setSelectedDoctor(null); };
  const handleEdit = e => { e.preventDefault(); setDoctors(prev => prev.map(doc => doc.id === selectedDoctor.id ? selectedDoctor : doc)); setShowEditModal(false); setSelectedDoctor(null); };
  const filteredDoctors = doctors.filter(doc => { const matchesFilter = filter === "all" || doc.status === filter; const matchesSearch = doc.firstName.toLowerCase().includes(searchQuery.toLowerCase()) || doc.lastName.toLowerCase().includes(searchQuery.toLowerCase()); return matchesFilter && matchesSearch; });
  const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage);
  const paginatedDoctors = filteredDoctors.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  return (<div className="p-4">
    <h2 className="h3-heading mb-4">Freelancer Doctor List</h2>
    <div className="flex gap-3 mb-4">
      <input type="text" placeholder="Search..." className="input-field w-64" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
      <select className="input-field w-40" value={filter} onChange={e => setFilter(e.target.value)}>{["all", "pending", "approved", "rejected"].map(f => (<option key={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>))}</select>
    </div>
    <table className="table-container">
      <thead>
        <tr className="table-head">{["Dr ID", "Name", "Phone", "Type", "Specialization", "Status", "Action"].map((h, i) => (<th key={i} className="p-2">{h}</th>))}</tr>
      </thead>
    <tbody className="table-body">
  {paginatedDoctors.map(doc => (
    <tr key={doc.id} className="tr-style hover:bg-[var(--color-surface)] transition-colors">
      <td>{doc.id}</td>
      <td><button type="button" className="text-[var(--primary-color)] font-semibold hover:text-[var(--accent-color)] focus:outline-none bg-none border-none p-0 cursor-pointer"onClick={() => { setSelectedDoctor(doc); setShowEditModal(false); setDeleteConfirm(false); }}>{`${doc.firstName} ${doc.middleName} ${doc.lastName}`}</button></td>
      <td>{doc.phone}</td>
      <td>{doc.doctorType}</td>
      <td>{Array.isArray(doc.specializationType) ? doc.specializationType.join(", ") : doc.specializationType}</td>
      <td><span className={statusColor[doc.status]}>{doc.status}</span></td>
      <td>
        {doc.status !== "pending" && (
          <div className="flex gap-2">
            <button type="button" className="edit-btn p-1 rounded hover:bg-[--primary-color]/10 transition hover:animate-bounce"
              onClick={() => { setSelectedDoctor(doc); setShowEditModal(true); }} title="Edit">
              <FaEdit className="text-[--primary-color]" />
            </button>
            <button type="button" className="delete-btn p-1 rounded hover:bg-red-100 transition hover:animate-bounce"
              onClick={() => { setSelectedDoctor(doc); setDeleteConfirm(true); }} title="Delete">
              <FaTrash className="text-red-500" />
            </button>
          </div>
        )}
      </td>
    </tr>
  ))}
</tbody>

    </table>
    <div className="flex justify-end items-center mt-4">
      <div className="flex items-center gap-2">
        <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="edit-btn">Previous</button>
        <span>Page {currentPage} of {totalPages}</span>
        <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="edit-btn">Next</button>
      </div>
    </div>
    {selectedDoctor && !deleteConfirm && !showEditModal && (
      <div className="fixed inset-0 bg-black/40 z-50 flex justify-end p-4 overflow-y-auto">
        <div className="bg-[var(--color-surface)] rounded-2xl shadow-2xl max-w-3xl w-full mr-[10%] p-8 max-h-[90vh] overflow-y-auto relative">
          <button onClick={() => { setSelectedDoctor(null); setShowEditModal(false); }} className="absolute top-5 right-5 text-2xl">✕</button>
          <h2 className="h3-heading ">Doctor Full Details</h2>
          <section className="border p-4 rounded-md shadow-sm hover:shadow-md transition-shadow">
            <h3 className="paragraph font-bold mb-3 border-b pb-2">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <p className='paragraph'><strong>Doctor ID:</strong> {selectedDoctor.id}</p> <p className='paragraph'><strong>Name:</strong> {`${selectedDoctor.firstName} ${selectedDoctor.middleName} ${selectedDoctor.lastName}`}</p><p className='paragraph'><strong>Phone:</strong> {selectedDoctor.phone}</p>
              <p className='paragraph'><strong>Email:</strong> {selectedDoctor.email}</p> <p className='paragraph'><strong>Gender:</strong> {selectedDoctor.gender}</p><p className='paragraph'><strong>Location:</strong> {selectedDoctor.location}</p><p className='paragraph'><strong>Aadhaar:</strong> {selectedDoctor.aadhaar}</p>
            </div>
          </section>
          <section className="border p-4 rounded-md shadow-sm hover:shadow-md transition-shadow mt-4">
            <h3 className="paragraph font-bold mb-3 border-b pb-2">Professional Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[var(--color-overlay)]text-base">
              <p className='paragraph '><strong>Doctor Type:</strong> {selectedDoctor.doctorType}</p><p className='paragraph '><strong>Specialization:</strong> {Array.isArray(selectedDoctor.specializationType) ? selectedDoctor.specializationType.join(", ") : selectedDoctor.specializationType}</p><p className='paragraph '><strong>Qualification:</strong> {selectedDoctor.qualification}</p><p className='paragraph '><strong>Registration No.:</strong> {selectedDoctor.registrationNo}</p>
              <p className='paragraph '><strong>Associated Hospital:</strong> {selectedDoctor.associatedHospital?.value === "Yes" ? selectedDoctor.associatedHospital.name : "None"}</p><p className='paragraph '><strong>Associated Clinic:</strong> {selectedDoctor.associatedClinic?.value === "Yes" ? selectedDoctor.associatedClinic.name : "None"}</p><p className='paragraph '><strong>AYUSH Specialization:</strong> {selectedDoctor.ayushSpecialization?.length > 0 ? selectedDoctor.ayushSpecialization.join(", ") : "None"}</p>
              {selectedDoctor.totalAppointments !== undefined && (<p className='paragraph '><strong>Total Appointments:</strong> {selectedDoctor.totalAppointments}</p>)}
              {selectedDoctor.commission !== undefined && (<p className='paragraph '><strong>Commission:</strong> ₹{selectedDoctor.commission}</p>)}
            </div>
          </section>
          {selectedDoctor.documents?.length > 0 && (
            <section className="border p-4 rounded-md shadow-sm hover:shadow-md transition-shadow mt-4">
              <h3 className="paragraph font-bold mb-3 border-b pb-2">Documents</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {selectedDoctor.documents.map((doc, i) => (
                  <div key={i} className="border rounded-lg p-4 bg-[var(--color-surface)] shadow hover:shadow-md cursor-pointer truncate">
                    <p className="mb-2 flex items-center gap-2">📄 {typeof doc === "string" ? doc : doc.name || `Document ${i + 1}`}</p>
                    {typeof doc === "object" && doc.url && (
                      <a href={doc.url} target="_blank" rel="noreferrer" className="text-yellow-600 hover:text-yellow-800 underline text-xs">View Document</a>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
          {(selectedDoctor.status || selectedDoctor.rejectionReason) && (
            <section className="border p-4 rounded-md shadow-sm hover:shadow-md transition-shadow mt-4">
              <h3 className="paragraph font-bold mb-3 border-b pb-2">Status</h3>
              {selectedDoctor.status && (<p className='paragraph font-semibold'><span className={`px-2 py-1 rounded text-xs ${statusColor[selectedDoctor.status]}`}>{selectedDoctor.status}</span></p>)}
              {selectedDoctor.rejectionReason && (<div className="bg-red-50 p-4 mt-2 text-red-700"><p className='paragraph font-semibold'>Reason: {selectedDoctor.rejectionReason}</p><p className='paragraph font-semibold'>Date: {selectedDoctor.rejectionDate}</p></div>)}
            </section>
          )}
          {selectedDoctor.status === "pending" && (
            <div className="flex justify-end gap-4 pt-4 border-t">
              <button onClick={handleApprove} className="view-btn px-7 py-2">Approve</button>
              <button onClick={() => setShowRejectModal(true)} className="delete-btn px-7 py-2">Reject</button>
            </div>
          )}
        </div>
      </div>
    )}
    {showEditModal && selectedDoctor && (
      <Modal onClose={() => setShowEditModal(false)}>
        <form onSubmit={handleEdit} className="">
          <h3 className="h3-heading mb-4">Edit Doctor Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            {[{ label: "First Name", field: "firstName" }, { label: "Middle Name", field: "middleName" }, { label: "Last Name", field: "lastName" }, { label: "Phone", field: "phone" }, { label: "Email", field: "email", type: "email" }, { label: "Gender", field: "gender" }, { label: "Location", field: "location" }, { label: "Aadhaar", field: "aadhaar" }].map(({ label, field, type = "text" }) => (
              <div key={field}>
                <label className="block text-sm text-[var(--color-overlay)]mb-1">{label}</label>
                <input type={type} name={field} value={selectedDoctor[field] || ""} onChange={e => setSelectedDoctor({ ...selectedDoctor, [field]: e.target.value })} className="input-field" />
              </div>
            ))}
            {[{ label: "Doctor Type", field: "doctorType" }, { label: "Specialization (comma-separated)", field: "specializationType", transform: v => v.split(",").map(s => s.trim()), format: v => (Array.isArray(v) ? v.join(", ") : v) }, { label: "Qualification", field: "qualification" }, { label: "Registration Number", field: "registrationNo" }, { label: "Associated Hospital", field: "associatedHospital", nested: true }, { label: "Associated Clinic", field: "associatedClinic", nested: true }, { label: "AYUSH Specialization", field: "ayushSpecialization", transform: v => v.split(",").map(s => s.trim()), format: v => (Array.isArray(v) ? v.join(", ") : v) }, { label: "Commission (%)", field: "commission", type: "number", transform: v => parseFloat(v) }].map(({ label, field, type = "text", transform, format, nested }) => (
              <div key={field}>
                <label className="block text-sm text-[var(--color-overlay)]mb-1">{label}</label>
                <input type={type} name={field} value={nested ? selectedDoctor[field]?.name || "" : format ? format(selectedDoctor[field]) : selectedDoctor[field] || ""} onChange={e => setSelectedDoctor(prev => ({ ...prev, [field]: transform ? transform(e.target.value) : nested ? { value: e.target.value ? "Yes" : "No", name: e.target.value } : e.target.value }))} className="input-field" />
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-4 pt-6">
            <button type="button" onClick={() => { setShowEditModal(false); setSelectedDoctor(null); }} className="delete-btn">Cancel</button>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </Modal>
    )}
    {showModal && (
      <Modal>
        <div className="text-center">
          <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
          <h3 className="text-2xl text-green-700 mb-2">Doctor Approved!</h3>
          <p className='paragraph font-semibold'>The doctor has been successfully approved.</p>
        </div>
      </Modal>
    )}
    {showRejectModal && (
      <Modal className="max-w-xl">
        <h3 className="mb-2 font-bold">Reject {selectedDoctor.firstName}</h3>
        <textarea rows={2} value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} placeholder="Reason" className="input-field mb-2" />
        <div className="flex justify-end gap-3">
          <button onClick={() => setShowRejectModal(false)} className="btn btn-secondary">Cancel</button>
          <button onClick={confirmReject} disabled={!rejectionReason.trim()} className="btn btn-primary">Submit</button>
        </div>
      </Modal>
    )}
    {deleteConfirm && (
      <Modal>
        <h3 className="font-bold mb-2">Confirm Deletion</h3>
        <p className='paragraph font-semibold'>Are you sure to delete {selectedDoctor.firstName} {selectedDoctor.lastName}?</p>
        <div className="flex justify-end gap-4 mt-4">
          <button onClick={() => { setDeleteConfirm(false); setSelectedDoctor(null); }} className="view-btn">Cancel</button>
          <button onClick={handleDelete} className="delete-btn">Yes,Delete</button>
        </div>
      </Modal>
    )}
  </div>);
};
export default DoctorTable;