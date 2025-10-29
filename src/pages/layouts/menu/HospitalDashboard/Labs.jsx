import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash } from 'react-icons/fa'; // <-- Add this import
const LabManagement = ({ hospitalId }) => {
  const initialLabState = (id) => ({ centerName: '', ownerName: '', phoneNumber: '', email: '', location: '', registrationNumber: '', licenseNumber: '', hospitalId: id || '' });
  const [labs, setLabs] = useState([]);
  const [newLab, setNewLab] = useState(initialLabState(hospitalId));
  const [editIndex, setEditIndex] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  useEffect(() => { fetchLabs(); }, []);
  const fetchLabs = async () => {
    try {
      const stored = localStorage.getItem('labs');
      if (stored) setLabs(Array.isArray(JSON.parse(stored)) ? JSON.parse(stored) : []);
      else {
        const res = await axios.get(`https://680cc0c92ea307e081d4edda.mockapi.io/labhospital?hospitalId=${hospitalId}`);
        setLabs(Array.isArray(res.data) ? res.data : []);
      }  } catch (err) { console.error('Fetch error:', err); setLabs([]); } };
  const handleChange = (e) => setNewLab({ ...newLab, [e.target.name]: e.target.value });
  const handleSave = async () => {
    try {
      let updated;
      if (editIndex !== null) {
        const updatedLab = { ...labs[editIndex], ...newLab };
        await axios.put(`https://680cc0c92ea307e081d4edda.mockapi.io/labhospital/${labs[editIndex].id}`, updatedLab);
        updated = [...labs]; updated[editIndex] = updatedLab;
        setEditIndex(null);
      } else {
        const res = await axios.post('https://680cc0c92ea307e081d4edda.mockapi.io/labhospital', newLab);
        updated = [...labs, res.data];
      }
      setLabs(updated); localStorage.setItem('labs', JSON.stringify(updated));
      fetchLabs(); setNewLab(initialLabState(hospitalId)); setShowModal(false);
    } catch (err) { console.error('Save error:', err); } };
  const handleEdit = (i) => { setEditIndex(i); setNewLab(labs[i]); setShowModal(true); };
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this lab?')) return;
    try {
      await axios.delete(`https://680cc0c92ea307e081d4edda.mockapi.io/labhospital/${id}`);
      const updated = labs.filter(l => l.id !== id);
      setLabs(updated); localStorage.setItem('labs', JSON.stringify(updated));
    } catch (err) { console.error('Delete error:', err); } };
  const filteredLabs = labs.filter(lab => Object.values(lab).some(v => v.toString().toLowerCase().includes(searchTerm.toLowerCase())));
  const totalPages = Math.ceil(filteredLabs.length / itemsPerPage);
  const paginatedLabs = filteredLabs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  return (
    <div className="pt-6 mt-6 bg-white p-6 rounded-2xl shadow-lg" style={{ fontFamily: 'var(--font-family)' }}>
      <div className="flex justify-between mb-4 items-center">
        <div>
          <h3 className="h3-heading">Hospital Labs</h3>
          <p className="paragraph">Manage your associated laboratory centers</p></div>
        <div className="flex gap-4">
          <div className="relative">
            <input  type="text" 
              placeholder="Search labs..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="input-field pl-10 focus:border-[--primary-color] focus:ring-2 focus:ring-[--primary-color]/20"   />
          </div>
         <button
  onClick={() => {
    setNewLab(initialLabState(hospitalId));
    setShowModal(true);
    setEditIndex(null);
  }}
  className="relative px-5 py-3 overflow-hidden font-medium text-gray-600 bg-gray-100 border border-gray-100 rounded-lg shadow-inner group"
>
  <span className="absolute top-0 left-0 w-0 h-0 transition-all duration-200 border-t-2 border-gray-600 group-hover:w-full ease"></span>
  <span className="absolute bottom-0 right-0 w-0 h-0 transition-all duration-200 border-b-2 border-gray-600 group-hover:w-full ease"></span>
  <span className="absolute top-0 left-0 w-full h-0 transition-all duration-300 delay-200 bg-gray-600 group-hover:h-full ease"></span>
  <span className="absolute bottom-0 left-0 w-full h-0 transition-all duration-300 delay-200 bg-gray-600 group-hover:h-full ease"></span>
  <span className="absolute inset-0 w-full h-full duration-300 delay-300 bg-gray-900 opacity-0 group-hover:opacity-100"></span>
  <span className="relative transition-colors duration-300 delay-200 group-hover:text-white ease">
    Add New Lab
  </span>
</button>
</div> </div>
      <div className="mt-6">
        <div className="overflow-x-auto">
          <table className="table-container">
            <thead className="table-head"><tr>
                {['Center Name', 'Owner', 'Contact', 'Location', 'Registration', 'Actions'].map((h, i) => (
                  <th key={i} className="px-6 py-3 text-left">
                    <p className="text-white">{h}</p>
                  </th> ))} </tr> </thead>
            <tbody className="table-body">
              {paginatedLabs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-[--primary-color]/50">No labs found</td>
                </tr>
              ) : paginatedLabs.map((lab, i) => (
                <tr key={lab.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4">
                    <div className="paragraph">{lab.centerName}</div>
                    <div className="paragraph">{lab.email}</div>
                  </td>
                  <td className="paragraph">{lab.ownerName}</td>
                  <td className="paragraph">{lab.phoneNumber}</td>
                  <td className="paragraph">{lab.location}</td>
                  <td className="px-6 py-4">
                    <div className="paragraph">Reg: {lab.registrationNumber}</div>
                    <div className="paragraph">License: {lab.licenseNumber}</div> </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(i)}
                        className="edit-btn flex items-center justify-center hover:bg-blue-100 rounded p-1 transition hover:animate-bounce"
                        title="Edit"
                      >
                        <FaEdit className="text-[--primary-color]" />
                      </button>
                      <button
                        onClick={() => handleDelete(lab.id)}
                        className="delete-btn flex items-center justify-center hover:bg-red-100 rounded p-1 transition hover:animate-bounce"
                        title="Delete"
                      >
                        <FaTrash className="text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>))}
            </tbody></table></div></div>
      {/* Pagination controls */}
<div className="flex justify-end items-center mt-4 gap-2">
  <button
    className="edit-btn flex items-center justify-center hover:bg-[--primary-color]/10 rounded p-2 transition"
    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
    disabled={currentPage === 1}
    title="Previous Page"
    type="button"
  >
    Previous
  </button>
  <span className="mx-2">
    Page {currentPage} of {totalPages}
  </span>
  <button
    className="edit-btn flex items-center justify-center hover:bg-[--primary-color]/10 rounded p-2 transition"
    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
    disabled={currentPage === totalPages || totalPages === 0}
    title="Next Page"
    type="button"
  >
    Next
  </button>
</div>
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center border-b border-[--primary-color]/10 pb-4">
              <h3 className="h4-heading">{editIndex !== null ? 'Edit Lab' : 'Add New Lab'}</h3>
              <button onClick={() => setShowModal(false)} className="text-[--primary-color]/50 hover:text-[--primary-color]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>     </button>   </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {[
                ['Center Name', 'centerName'],
                ['Owner Name', 'ownerName'],
                ['Phone Number', 'phoneNumber'],
                ['Email', 'email'],
                ['Location', 'location'],
                ['Registration Number', 'registrationNumber'],
                ['License Number', 'licenseNumber']
              ].map(([label, name]) => (
                <div key={name} className="col-span-1">
                  <label className="paragraph text-[--primary-color] mb-1">{label}</label>
                  <input name={name} value={newLab[name]}onChange={handleChange}placeholder={`Enter ${label.toLowerCase()}`}className="input-field" /></div> ))} </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[--primary-color]/10">
              <button onClick={() => setShowModal(false)} className="btn-secondary">Close</button>
              <button onClick={handleSave} className="btn btn-primary">
                {editIndex !== null ? 'Update' : 'Submit'}
              </button> </div></div></div> )} </div> );};
export default LabManagement;





// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { FaEdit, FaTrash } from 'react-icons/fa'; // <-- Add this import
// const LabManagement = ({ hospitalId }) => {
//   const initialLabState = (id) => ({ centerName: '', ownerName: '', phoneNumber: '', email: '', location: '', registrationNumber: '', licenseNumber: '', hospitalId: id || '' });
//   const [labs, setLabs] = useState([]);
//   const [newLab, setNewLab] = useState(initialLabState(hospitalId));
//   const [editIndex, setEditIndex] = useState(null);
//   const [showModal, setShowModal] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 4;
//   useEffect(() => { fetchLabs(); }, []);
//   const fetchLabs = async () => {
//     try {
//       const stored = localStorage.getItem('labs');
//       if (stored) setLabs(Array.isArray(JSON.parse(stored)) ? JSON.parse(stored) : []);
//       else {
//         const res = await axios.get(`https://680cc0c92ea307e081d4edda.mockapi.io/labhospital?hospitalId=${hospitalId}`);
//         setLabs(Array.isArray(res.data) ? res.data : []);
//       }  } catch (err) { console.error('Fetch error:', err); setLabs([]); } };
//   const handleChange = (e) => setNewLab({ ...newLab, [e.target.name]: e.target.value });
//   const handleSave = async () => {
//     try {
//       let updated;
//       if (editIndex !== null) {
//         const updatedLab = { ...labs[editIndex], ...newLab };
//         await axios.put(`https://680cc0c92ea307e081d4edda.mockapi.io/labhospital/${labs[editIndex].id}`, updatedLab);
//         updated = [...labs]; updated[editIndex] = updatedLab;
//         setEditIndex(null);
//       } else {
//         const res = await axios.post('https://680cc0c92ea307e081d4edda.mockapi.io/labhospital', newLab);
//         updated = [...labs, res.data];
//       }
//       setLabs(updated); localStorage.setItem('labs', JSON.stringify(updated));
//       fetchLabs(); setNewLab(initialLabState(hospitalId)); setShowModal(false);
//     } catch (err) { console.error('Save error:', err); } };
//   const handleEdit = (i) => { setEditIndex(i); setNewLab(labs[i]); setShowModal(true); };
//   const handleDelete = async (id) => {
//     if (!window.confirm('Delete this lab?')) return;
//     try {
//       await axios.delete(`https://680cc0c92ea307e081d4edda.mockapi.io/labhospital/${id}`);
//       const updated = labs.filter(l => l.id !== id);
//       setLabs(updated); localStorage.setItem('labs', JSON.stringify(updated));
//     } catch (err) { console.error('Delete error:', err); } };
//   const filteredLabs = labs.filter(lab => Object.values(lab).some(v => v.toString().toLowerCase().includes(searchTerm.toLowerCase())));
//   const totalPages = Math.ceil(filteredLabs.length / itemsPerPage);
//   const paginatedLabs = filteredLabs.slice(
//     (currentPage - 1) * itemsPerPage,
//     currentPage * itemsPerPage
//   );
//   return (
//     <div className="pt-6 mt-6 bg-white p-6 rounded-2xl shadow-lg" style={{ fontFamily: 'var(--font-family)' }}>
//       <div className="flex justify-between mb-4 items-center">
//         <div>
//           <h3 className="h3-heading">Hospital Labs</h3>
//           <p className="paragraph">Manage your associated laboratory centers</p></div>
//         <div className="flex gap-4">
//          <div className="floating-input relative" data-placeholder="Search labs...">
//   <input
//     type="text"
//     value={searchTerm}
//     onChange={(e) => setSearchTerm(e.target.value)}
//     placeholder=" "
//     className="input-field peer pl-10 focus:border-[--primary-color] focus:ring-2 focus:ring-[--primary-color]/20"
//     autoComplete="off"
//   />
// </div>
//          <button
//   onClick={() => {
//     setNewLab(initialLabState(hospitalId));
//     setShowModal(true);
//     setEditIndex(null);
//   }}
//   className="relative px-5 py-3 overflow-hidden font-medium text-gray-600 bg-gray-100 border border-gray-100 rounded-lg shadow-inner group"
// >
//   <span className="absolute top-0 left-0 w-0 h-0 transition-all duration-200 border-t-2 border-gray-600 group-hover:w-full ease"></span>
//   <span className="absolute bottom-0 right-0 w-0 h-0 transition-all duration-200 border-b-2 border-gray-600 group-hover:w-full ease"></span>
//   <span className="absolute top-0 left-0 w-full h-0 transition-all duration-300 delay-200 bg-gray-600 group-hover:h-full ease"></span>
//   <span className="absolute bottom-0 left-0 w-full h-0 transition-all duration-300 delay-200 bg-gray-600 group-hover:h-full ease"></span>
//   <span className="absolute inset-0 w-full h-full duration-300 delay-300 bg-gray-900 opacity-0 group-hover:opacity-100"></span>
//   <span className="relative transition-colors duration-300 delay-200 group-hover:text-white ease">
//     Add New Lab
//   </span>
// </button>
// </div> </div>
//       <div className="mt-6">
//         <div className="overflow-x-auto">
//           <table className="table-container">
//             <thead className="table-head"><tr>
//                 {['Center Name', 'Owner', 'Contact', 'Location', 'Registration', 'Actions'].map((h, i) => (
//                   <th key={i} className="px-6 py-3 text-left">
//                     <p className="text-white">{h}</p>
//                   </th> ))} </tr> </thead>
//             <tbody className="table-body">
//               {paginatedLabs.length === 0 ? (
//                 <tr>
//                   <td colSpan="6" className="py-8 text-center text-[--primary-color]/50">No labs found</td>
//                 </tr>
//               ) : paginatedLabs.map((lab, i) => (
//                 <tr key={lab.id} className="hover:bg-gray-50 transition-colors duration-200">
//                   <td className="px-6 py-4">
//                     <div className="paragraph">{lab.centerName}</div>
//                     <div className="paragraph">{lab.email}</div>
//                   </td>
//                   <td className="paragraph">{lab.ownerName}</td>
//                   <td className="paragraph">{lab.phoneNumber}</td>
//                   <td className="paragraph">{lab.location}</td>
//                   <td className="px-6 py-4">
//                     <div className="paragraph">Reg: {lab.registrationNumber}</div>
//                     <div className="paragraph">License: {lab.licenseNumber}</div> </td>
//                   <td className="px-6 py-4">
//                     <div className="flex gap-2">
//                       <button
//                         onClick={() => handleEdit(i)}
//                         className="edit-btn flex items-center justify-center hover:bg-blue-100 rounded p-1 transition hover:animate-bounce"
//                         title="Edit"
//                       >
//                         <FaEdit className="text-[--primary-color]" />
//                       </button>
//                       <button
//                         onClick={() => handleDelete(lab.id)}
//                         className="delete-btn flex items-center justify-center hover:bg-red-100 rounded p-1 transition hover:animate-bounce"
//                         title="Delete"
//                       >
//                         <FaTrash className="text-red-500" />
//                       </button>
//                     </div>
//                   </td>
//                 </tr>))}
//             </tbody></table></div></div>
//       {/* Pagination controls */}
// <div className="flex justify-end items-center mt-4 gap-2">
//   <button
//     className="edit-btn flex items-center justify-center hover:bg-[--primary-color]/10 rounded p-2 transition"
//     onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
//     disabled={currentPage === 1}
//     title="Previous Page"
//     type="button"
//   >
//     Previous
//   </button>
//   <span className="mx-2">
//     Page {currentPage} of {totalPages}
//   </span>
//   <button
//     className="edit-btn flex items-center justify-center hover:bg-[--primary-color]/10 rounded p-2 transition"
//     onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
//     disabled={currentPage === totalPages || totalPages === 0}
//     title="Next Page"
//     type="button"
//   >
//     Next
//   </button>
// </div>
//      {showModal && (
//   <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
//     <div className="bg-white rounded-2xl p-6 w-full max-w-2xl">
//       <div className="flex justify-between items-center border-b border-[--primary-color]/10 pb-4">
//         <h3 className="h4-heading">{editIndex !== null ? 'Edit Lab' : 'Add New Lab'}</h3>
//         <button onClick={() => setShowModal(false)} className="text-[--primary-color]/50 hover:text-[--primary-color]">
//           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
//           </svg>
//         </button>
//       </div>
//       <div className="grid grid-cols-2 gap-4 mt-4">
//         {[
//           ['Center Name', 'centerName'],
//           ['Owner Name', 'ownerName'],
//           ['Phone Number', 'phoneNumber'],
//           ['Email', 'email'],
//           ['Location', 'location'],
//           ['Registration Number', 'registrationNumber'],
//           ['License Number', 'licenseNumber']
//         ].map(([label, name]) => (
//           <div key={name} className="col-span-1">
//             <div className="floating-input relative" data-placeholder={label}>
//               <input
//                 name={name}
//                 value={newLab[name]}
//                 onChange={handleChange}
//                 placeholder=" "
//                 className="input-field peer"
//                 autoComplete="off"
//               />
//             </div>
//           </div>
//         ))}
//       </div>
//       <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[--primary-color]/10">
//         <button onClick={() => setShowModal(false)} className="btn-secondary">Close</button>
//         <button onClick={handleSave} className="btn btn-primary">
//           {editIndex !== null ? 'Update' : 'Submit'}
//         </button>
//       </div>
//     </div>
//   </div>
// )}</div> );};
// export default LabManagement;
