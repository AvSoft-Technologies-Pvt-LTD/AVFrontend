import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';

function Pharmacy() {
  const [pharmacies, setPharmacies] = useState([]);
  const [newPharmacy, setNewPharmacy] = useState({ pharmacyName: '', ownerName: '', phoneNumber: '', email: '', location: '', registrationNumber: '', licenseNumber: '', gstNumber: '', type: 'In-house', status: 'active' });
  const [editIndex, setEditIndex] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  useEffect(() => {
    const storedPharmacies = localStorage.getItem('pharmacies');
    if (storedPharmacies) setPharmacies(JSON.parse(storedPharmacies));
    else {
      const mockData = [{ id: 1, pharmacyName: 'Main Hospital Pharmacy', ownerName: 'Dr. Sarah Johnson', phoneNumber: '9876543210', email: 'pharmacy@hospital.com', location: 'Ground Floor, Block A', registrationNumber: 'PH-001', licenseNumber: 'LIC-001', gstNumber: 'GST-001', type: 'In-house', status: 'active' }];
      setPharmacies(mockData);
      localStorage.setItem('pharmacies', JSON.stringify(mockData));
    }}, []);
  const handleSave = () => {
    const updatedPharmacies = editIndex !== null ? pharmacies.map((p, i) => i === editIndex ? { ...p, ...newPharmacy } : p) : [...pharmacies, { ...newPharmacy, id: Date.now() }];
    setPharmacies(updatedPharmacies);
    localStorage.setItem('pharmacies', JSON.stringify(updatedPharmacies));
    setShowModal(false);
    setEditIndex(null);
    setNewPharmacy({ ...newPharmacy, pharmacyName: '', ownerName: '', phoneNumber: '', email: '', location: '', registrationNumber: '', licenseNumber: '', gstNumber: '' }); };
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this pharmacy?')) {
      const updatedPharmacies = pharmacies.filter(p => p.id !== id);
      setPharmacies(updatedPharmacies);
      localStorage.setItem('pharmacies', JSON.stringify(updatedPharmacies));  } };
  const filteredPharmacies = pharmacies.filter(p =>
    Object.values(p).some(v => v.toString().toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredPharmacies.length / itemsPerPage);
  const paginatedPharmacies = filteredPharmacies.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  return (
    <div className="pt-6 mt-6 bg-white p-6 rounded-2xl shadow-lg" style={{ fontFamily: 'var(--font-family)' }}>
      <div className="flex justify-between mb-4 items-center">
        <div> <h3 className="h3-heading">Hospital Pharmacy</h3>
          <p className="paragraph">Manage your pharmacy operations and inventory</p>
        </div><div className="flex gap-4">
          <div className="relative"> <input type="text" placeholder="Search pharmacies..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-field pl-10 focus:border-[#0E1630] focus:ring-2 focus:ring-[#0E1630]/20" />
          </div>
         <button
  onClick={() => {
    setShowModal(true);
    setEditIndex(null);
  }}
  className="relative inline-flex items-center justify-center p-4 px-6 py-3 overflow-hidden font-medium text-[var(--accent-color)] transition duration-300 ease-out border-2 border-[var(--accent-color)]ounded-full shadow-md group"
>
  <span className="absolute inset-0 flex items-center justify-center w-full h-full text-white duration-300 -translate-x-full bg-[var(--accent-color)] group-hover:translate-x-0 ease">
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M14 5l7 7m0 0l-7 7m7-7H3"
      />
    </svg>
  </span>
  <span className="absolute flex items-center justify-center w-full h-full text-[var(--accent-color)] transition-all duration-300 transform group-hover:translate-x-full ease">
    Add New Pharmacy
  </span>
  <span className="relative invisible">Add New Pharmacy</span>
</button>
  </div>   </div>
      <div className="mt-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#0E1630]/10 rounded-lg border border-[#0E1630]/10 overflow-hidden">
            <thead className="bg-[#0E1630]">
            <tr> {['Pharmacy Name', 'Owner', 'Contact', 'Location', 'Type', 'Actions'].map((h, i) => (
                  <th key={i} className="px-6 py-3 text-left"><p className="text-white font-medium">{h}</p></th>
                ))}   </tr> </thead>
            <tbody className="bg-white divide-y divide-[#0E1630]/10">
              {paginatedPharmacies.length === 0 ? (
                <tr><td colSpan="6" className="py-8 text-center text-[#0E1630]/50">No pharmacies found</td></tr>
              ) : (
                paginatedPharmacies.map((p, i) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4">
                      <div className="font-medium text-[#0E1630]">{p.pharmacyName}</div>
                      <div className="text-sm text-[#0E1630]/70">{p.email}</div></td>
                    <td className="px-6 py-4 text-[#0E1630]">{p.ownerName}</td>
                    <td className="px-6 py-4 text-[#0E1630]">{p.phoneNumber}</td>
                    <td className="px-6 py-4 text-[#0E1630]">{p.location}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${p.type === 'In-house' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>{p.type}</span>
                    </td><td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setEditIndex(i); setNewPharmacy(p); setShowModal(true); }}
                          className="edit-btn flex items-center justify-center hover:bg-blue-100 rounded p-1 transition hover:animate-bounce"
                          title="Edit"
                        >
                          <FaEdit className="text-[#0E1630]" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="delete-btn flex items-center justify-center hover:bg-red-100 rounded p-1 transition hover:animate-bounce"
                          title="Delete"
                        >
                          <FaTrash className="text-red-500" />
                        </button>
                      </div>
                    </td> </tr> ))  )} </tbody>  </table> </div></div>
<div className="flex justify-end items-center mt-4 gap-2">
  <button
    className="edit-btn flex items-center justify-center hover:bg-[--primary-color]/10 rounded p-2 transition"
    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
    disabled={currentPage === 1}
    title="Previous Page"
    type="button">Previous</button>
  <span className="mx-2">Page {currentPage} of {totalPages}</span>
  <button
    className="edit-btn flex items-center justify-center hover:bg-[--primary-color]/10 rounded p-2 transition"
    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
    disabled={currentPage === totalPages || totalPages === 0}
    title="Next Page"
    type="button">Next</button>
</div>
    {showModal && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl p-6 w-full max-w-2xl">
      <div className="flex justify-between items-center border-b border-[#0E1630]/10 pb-4">
        <h3 className="h4-heading">{editIndex !== null ? 'Edit Pharmacy' : 'Add New Pharmacy'}</h3>
        <button onClick={() => setShowModal(false)} className="text-[#0E1630]/50 hover:text-[#0E1630]">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-4">
        {[
          ['Pharmacy Name', 'pharmacyName'],
          ['Owner Name', 'ownerName'],
          ['Phone Number', 'phoneNumber'],
          ['Email', 'email'],
          ['Location', 'location'],
          ['Registration Number', 'registrationNumber'],
          ['License Number', 'licenseNumber'],
          ['GST Number', 'gstNumber'],
          ['Type', 'type']
        ].map(([label, name]) => (
          <div key={name} className="col-span-1">
            {name === 'type' ? (
              <>
                <label className="paragraph text-[#0E1630] font-medium mb-1">{label}</label>
                <select
                  name={name}
                  value={newPharmacy[name]}
                  onChange={e => setNewPharmacy({ ...newPharmacy, [name]: e.target.value })}
                  className="input-field"
                >
                  <option value="In-house">In-house</option>
                  <option value="External">External</option>
                </select>
              </>
            ) : (
              <div className="floating-input relative" data-placeholder={label}>
                <input
                  name={name}
                  value={newPharmacy[name]}
                  onChange={e => setNewPharmacy({ ...newPharmacy, [name]: e.target.value })}
                  placeholder=" "
                  className="input-field peer"
                  autoComplete="off"
                />
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#0E1630]/10">
        <button onClick={() => setShowModal(false)} className="btn-secondary">Close</button>
        <button onClick={handleSave} className="btn btn-primary">{editIndex !== null ? 'Update' : 'Submit'}</button>
      </div>
    </div>
  </div>
)}  </div>);}
export default Pharmacy;