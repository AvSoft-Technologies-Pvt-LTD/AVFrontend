import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Modal = ({ children }) => (<div className="fixed inset-0 bg-black/40 flex items-center justify-end z-50 pr-[18%]"><div className="bg-[var(--color-surface)] p-6 rounded shadow-lg w-full max-w-2xl min-w-[500px] max-h-[80vh] overflow-y-auto relative">{children}</div></div>);
const statusColor = { approved: "text-green-400", pending: "text-yellow-400", rejected: "text-red-400" };
const LabTable = () => {
  const [labs, setLabs] = useState([]), [selectedLab, setSelectedLab] = useState(null), [searchQuery, setSearchQuery] = useState(""), [showModal, setShowModal] = useState(false), [deleteConfirm, setDeleteConfirm] = useState(false), [showRejectModal, setShowRejectModal] = useState(false), [rejectionReason, setRejectionReason] = useState(""), [filter, setFilter] = useState("all"), [showEditModal, setShowEditModal] = useState(false), [showViewModal, setShowViewModal] = useState(false), [currentPage, setCurrentPage] = useState(1), itemsPerPage = 5;
  useEffect(() => { axios.get("https://mocki.io/v1/00d6ce96-c961-491c-9cfe-01cb3b9a30a9").then(res => setLabs(res.data)).catch(console.error); }, []);
  const handleApprove = () => {
    setLabs(prev => prev.map(lab => lab.centerName === selectedLab.centerName ? { ...lab, status: "approved" } : lab));
    toast.success("Lab approved!");
    setShowViewModal(false); // This closes the popup immediately after approve
    setSelectedLab(null);
  };
  const confirmReject = () => { setLabs(prev => prev.map(lab => lab.centerName === selectedLab.centerName ? { ...lab, status: "rejected", rejectionReason, rejectionDate: new Date().toLocaleDateString() } : lab)); toast.error("Lab rejected!"); setShowRejectModal(false); setShowViewModal(false); setSelectedLab(null); setRejectionReason(""); };
  const handleEdit = e => { e.preventDefault(); setLabs(prev => prev.map(lab => lab.labId === selectedLab.labId ? { ...selectedLab } : lab)); setShowEditModal(false); setSelectedLab(null); };
  const handleChange = (field, e) => setSelectedLab(prev => ({ ...prev, [field]: e.target.value }));
  const handleDelete = () => { setLabs(prev => prev.filter(lab => lab.centerName !== selectedLab.centerName)); setDeleteConfirm(false); setSelectedLab(null); };
  const handleDropdownSelect = (field, e) => { const value = e.target.value; if (!value) return; setSelectedLab(prev => ({ ...prev, [field]: prev[field] ? [...new Set([...prev[field], value])] : [value] })); };
  const filteredLabs = labs.filter(lab => filter === "all" || lab.status === filter).filter(lab => (lab.centerName?.toLowerCase() || "").includes(searchQuery.toLowerCase()) || (lab.ownerName?.toLowerCase() || "").includes(searchQuery.toLowerCase()));
  const totalPages = Math.ceil(filteredLabs.length / itemsPerPage), currentLabs = filteredLabs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  return (
    <div className="p-6 overflow-x-auto">
      <h2 className="h3-heading mb-4">Labs List</h2>
    <div className="flex gap-3 mb-4">
  <div className="floating-input relative" data-placeholder="Search by lab or owner name...">
    <input
      type="text"
      placeholder=" "
      className="input-field peer w-[200px] md:w-[200px] lg:w-[200px] xl:w-[200px] xl:w-[200px] min-w-[50vw]"
      value={searchQuery}
      onChange={e => setSearchQuery(e.target.value)}
      autoComplete="off"
    />
  </div>
  <select
    className="input-field max-w-60"
    value={filter}
    onChange={e => setFilter(e.target.value)}
  >
    {["all", "pending", "approved", "rejected"].map(f => (
      <option key={f} value={f}>
        {f.charAt(0).toUpperCase() + f.slice(1)}
      </option>
    ))}
  </select>
</div>
      <table className="table-container">
        <thead>
          <tr className="table-head">
           <th className="p-3 text-left">Lab Id</th><th className="p-3 text-left">Lab Name</th><th className="p-3 text-left">Type</th><th className="p-3 text-left">Location</th><th className="p-3 text-left">Status</th><th className="p-3 text-left">Action</th>
          </tr>
        </thead>
       <tbody className="table-body">
  {currentLabs.map((lab, i) => (
    <tr key={i} className="tr-style">
      <td>{lab.labId}</td>
      <td>
        <span className="hover:underline cursor-pointer " onClick={() => { setSelectedLab(lab); setShowViewModal(true); }} title="View Details">{lab.centerName}</span>
      </td>
      <td>{lab.centerType}</td>
      <td>{lab.location}</td>
      <td><span className={statusColor[lab.status]}>{lab.status}</span></td>
      <td className="flex gap-2">
        {lab.status !== "pending" && (
          <>
            <button
              onClick={() => { setSelectedLab(lab); setShowEditModal(true); }}
              className="edit-btn p-2 rounded hover:bg-green-100 transition hover:animate-bounce"
              title="Edit"
            >
              <FaEdit className="text-[--primary-color]" />
            </button>
            <button
              onClick={() => { setSelectedLab(lab); setDeleteConfirm(true); }}
              className="delete-btn p-2 rounded hover:bg-red-100 transition hover:animate-bounce"
              title="Delete"
            >
              <FaTrash className="text-red-500" />
            </button>
          </>
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
      {selectedLab && showViewModal && (
        <Modal>
          <div className="fixed inset-0 bg-black/40 z-50 flex justify-end p-4 overflow-y-auto">
            <div className="bg-[var(--color-surface)] rounded-2xl shadow-2xl max-w-3xl w-full mr-[10%] p-8 max-h-[90vh] overflow-y-auto relative">
              <button onClick={() => setShowViewModal(false)} className="absolute top-5 right-5 text-2xl">✕</button>
              <h2 className="h3-heading border-b pb-3 mb-3">Lab Full Details</h2>
              <section className=" p-6 rounded-lg shadow-sm border mb-4">
                <h3 className="paragraph font-bold mb-3 border-b pb-2">Basic Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 paragraph">
                  <p><strong>Lab Name:</strong> {selectedLab.centerName}</p>
                  <p><strong>Owner:</strong> {selectedLab.ownerName}</p>
                  <p><strong>Phone:</strong> {selectedLab.phoneNumber}</p>
                  <p><strong>Email:</strong> {selectedLab.email}</p>
                  <p><strong>Type:</strong> {selectedLab.centerType}</p>
                  <p><strong>Location:</strong> {selectedLab.location}</p>
                  <p><strong>GST Number:</strong> {selectedLab.gstNumber}</p>
                  <p><strong>Registration Number:</strong> {selectedLab.registrationNumber}</p>
                  <p><strong>License Number:</strong> {selectedLab.licenseNumber}</p>
                </div>
              </section>
              <section className=" p-6 rounded-lg shadow-sm border mb-4">
                <h3 className="paragraph font-bold mb-3 border-b pb-2">Services</h3>
                <p className='paragraph'><strong>Available Tests:</strong> {selectedLab.availableTests?.join(", ")}</p>
                <p className='paragraph'><strong>Special Services:</strong> {selectedLab.specialServices?.join(", ")}</p>
              </section>
              <section className=" p-6 rounded-lg shadow-sm border mb-4">
                <h3 className="paragraph font-bold mb-3 border-b pb-2">Documents</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedLab.certificates && Object.entries(selectedLab.certificates).map(([key, value], i) => (<div key={i} className="border rounded-lg p-3 bg-[var(--color-surface)] shadow truncate"><p>{value}</p></div>))}
                </div>
              </section>
              <section className="p-6 rounded-lg shadow-sm border mb-4">
                <h3 className="paragraph font-bold mb-3 border-b pb-2">Status</h3>
                <p><span className={`px-2 py-1 rounded ${statusColor[selectedLab.status]}`}>{selectedLab.status}</span></p>
                {selectedLab.rejectionReason && (<div className="bg-red-50 p-4 mt-2 text-red-700"><p><b>Reason:</b> {selectedLab.rejectionReason}</p><p><b>Date:</b> {selectedLab.rejectionDate}</p></div>)}
              </section>
              {selectedLab.status === "pending" && (
                <div className="flex justify-end gap-4 pt-4 border-t">
                  <button onClick={handleApprove} className="view-btn px-7 py-2">Approve</button>
                  <button onClick={() => setShowRejectModal(true)} className="delete-btn px-7 py-2">Reject</button>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
      {selectedLab && showEditModal && (
       <Modal>
  <form onSubmit={handleEdit} className="space-y-6 p-4">
    <h3 className="h4-heading mb-4">Edit Lab Details</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-[var(--color-overlay)]">
      {[
        { label: "Lab Name", field: "centerName", type: "text" },
        { label: "Owner Name", field: "ownerName", type: "text" },
        { label: "Phone Number", field: "phoneNumber", type: "text" },
        { label: "Email", field: "email", type: "email" },
        { label: "Center Type", field: "centerType", type: "text" },
        { label: "Location", field: "location", type: "text" },
        { label: "GST Number", field: "gstNumber", type: "text" },
        { label: "Registration Number", field: "registrationNumber", type: "text" },
        { label: "License Number", field: "licenseNumber", type: "text" }
      ].map(({ label, field, type }) => (
        <div key={field}>
          <div className="floating-input relative" data-placeholder={label}>
            <input
              type={type}
              value={selectedLab[field]}
              onChange={e => handleChange(field, e)}
              className="input-field peer"
              placeholder=" "
              autoComplete="off"
            />
          </div>
        </div>
      ))}
      <div>
        <select onChange={e => handleDropdownSelect('availableTests', e)} className="input-field">
          <option value="">Add Test</option>
          {["Blood Test", "X-Ray", "MRI", "CT Scan"].map((test, idx) => (
            <option key={idx} value={test}>{test}</option>
          ))}
        </select>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-[var(--color-overlay)]">
      <div>
        <select onChange={e => handleDropdownSelect('specialServices', e)} className="input-field">
          <option value="">Add Service</option>
          {["Home Sample Collection", "Emergency Test", "24x7 Support", "Online Reports"].map((service, idx) => (
            <option key={idx} value={service}>{service}</option>
          ))}
        </select>
      </div>
    </div>
    <div className="flex justify-end gap-4 pt-6 border-t">
      <button type="button" onClick={() => setShowEditModal(false)} className="btn btn-secondary">Cancel</button>
      <button type="submit" className="btn btn-primary">Save Changes</button>
    </div>
  </form>
</Modal>
      )}
      {deleteConfirm && selectedLab && (
        <Modal>
          <h3 className="h4-heading mb-4">Confirm Deletion</h3>
          <p className="mb-4">Are you sure you want to delete <strong>{selectedLab.centerName}</strong>?</p>
          <div className="flex justify-end gap-4">
            <button onClick={() => { setDeleteConfirm(false); setSelectedLab(null); }} className="view-btn">Cancel</button>
            <button onClick={handleDelete} className="delete-btn">Yes, Delete</button>
          </div>
        </Modal>
      )}
      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
};
export default LabTable;