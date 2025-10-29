import { useState, useEffect } from 'react'; import axios from 'axios';
import { FaEdit, FaTrash } from 'react-icons/fa';
const Input = ({ label, name, value, onChange, type = 'text', required, disabled }) => (<div><label>{label || name}</label><input type={type} name={name} value={value} onChange={onChange} required={required} disabled={disabled} className={`input-field ${disabled ? 'btn-disabled' : ''} focus:border-[--accent-color] focus:ring-2 focus:ring-[--accent-color]/20`} /></div>);
const Select = ({ label, name, value, onChange, options = [], required, disabled }) => (<div><label >{label || name}</label><select name={name} value={value} onChange={onChange} required={required} disabled={disabled} className={`input-field appearance-none ${disabled ? 'btn-disabled' : ''} focus:border-[--accent-color] focus:ring-2 focus:ring-[--accent-color]/20`}><option value="">Select {name}</option>{options.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></div>);
const STAFF_TYPES = { doctors: { title: 'Doctors', headers: ['Name', 'Phone', 'Email', 'Specialization', 'Join Date', 'Actions'], specializations: { AYUSH: ['Homeopathy', 'Ayurveda', 'Unani', 'Siddha'], Allopathy: ['Cardiologist', 'Dermatologist', 'Neurologist', 'Pediatrician'] } }, nurses: { title: 'Nurses', headers: ['Name', 'Phone', 'Email', 'Designation', 'Join Date', 'Actions'] }, otherStaff: { title: 'Other Staff', headers: ['Name', 'Role', 'Join Date', 'Actions'] } };
const initialForm = { firstName: '', middleName: '', lastName: '', phone: '', aadhaar: '', gender: '', dob: '', email: '', password: '', confirmPassword: '', address: '', registrationNumber: '', practiceType: '', specialization: '', qualification: '', designation: '', department: '', role: '', salary: '', joiningDate: new Date().toISOString().split('T')[0], name: '', documents: [] };
function App() {
  const [activeTab, setActiveTab] = useState('doctors');
  const [staffData, setStaffData] = useState({});
  const [formData, setFormData] = useState(initialForm);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState('add');
  const [message, setMessage] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const is = (type) => activeTab === type;
  useEffect(() => { fetchStaffData(); }, []);
  const fetchStaffData = async () => { try { const { data } = await axios.get('https://6814aa91225ff1af16299ed8.mockapi.io/staff-list'); setStaffData({ doctors: data.filter(i => i.specialization), nurses: data.filter(i => i.designation && !i.specialization), otherStaff: data.filter(i => i.role && !i.specialization && !i.designation) }); } catch (error) { handleError('Failed to load staff data', error); } };
  const handleSubmit = async (e) => { e.preventDefault(); try { const fullName = `${formData.firstName} ${formData.middleName} ${formData.lastName}`.trim(); const payload = { ...formData, name: fullName }; const url = `https://6814aa91225ff1af16299ed8.mockapi.io/staff-list${mode === 'edit' ? `/${formData.id}` : ''}`; const method = mode === 'edit' ? axios.put : axios.post; await method(url, payload); if (mode === 'add' && activeTab === 'doctors') { setIsVerified(true); } fetchStaffData(); closeModal(); } catch (error) { handleError('Failed to save staff data', error); } };
  const handleDelete = async (id) => { if (!window.confirm('Are you sure you want to delete this staff member?')) return; try { await axios.delete(`https://6814aa91225ff1af16299ed8.mockapi.io/staff-list/${id}`); fetchStaffData(); setMessage('Staff deleted successfully'); } catch (error) { handleError('Failed to delete staff', error); } };
  const handleError = (userMessage, error) => { console.error(userMessage, error); setMessage(userMessage); };
  const closeModal = () => { setIsModalOpen(false); setFormData(initialForm); setMode('add'); setIsVerified(false); };
  const handleInputChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
  const handleFileChange = (e) => { const files = Array.from(e.target.files); setFormData(prev => ({ ...prev, documents: [...(prev.documents || []), ...files] })); };
  const renderRow = (label, value) => (<div className="flex justify-between py-2 border-b border-var(--primary-color)]/10"><span className="paragraph [color:var(--primary-color)]/70">{label}</span><span className="paragraph [color:var(--primary-color)]">{value || 'Not Provided'}</span></div>);
  const renderProfile = () => (<div className="space-y-3"><div className="[background-color:var(--primary-color)] p-3 rounded-2xl shadow-lg"><div className="flex items-center gap-3"><div className="w-16 h-16 rounded-full overflow-hidden border border-white/20"><img src={`https://api.dicebear.com/7.x/initials/svg?seed=${formData.name}`} alt={formData.name} /></div><div ><h4 className="sub-heading font-semibold" >{formData.name}</h4><p className="sub-heading text-white/80" >{is('doctors') ? formData.specialization : is('nurses') ? formData.designation : formData.role}</p></div></div></div><div className="grid grid-cols-2 gap-3"><div className="bg-white p-3 rounded-2xl shadow-lg border border-var(--primary-color)]/5"><p className="paragraph font-bold" >Personal</p><div className="space-y-1">{renderRow('Gender', formData.gender)}{renderRow('DOB', formData.dob)}{renderRow('Phone', formData.phone)}{renderRow('Email', formData.email)}</div></div><div className="bg-white p-3 rounded-2xl shadow-lg border border-var(--primary-color)]/5"><h4 className="paragraph font-bold" >Professional</h4><div className="space-y-1">{is('doctors') && (<>{renderRow('Reg. No.', formData.registrationNumber)}{renderRow('Practice', formData.practiceType)}{renderRow('Qual.', formData.qualification)}</>)}{is('nurses') && (<>{renderRow('Dept.', formData.department)}{renderRow('Design.', formData.designation)}</>)}{is('otherStaff') && (<>{renderRow('Role', formData.role)}{renderRow('Salary', formData.salary)}</>)}</div></div></div>
  {formData.documents?.length > 0 && (
  <div className="bg-white p-3 rounded-2xl shadow-lg border border-var(--primary-color)]/5"> <p className="paragraph mb-2 flex items-center gap-1 font-bold" >Documents </p><div className="grid grid-cols-2 gap-2">
  {formData.documents.map((file, idx) => (
    <div key={idx} className="p-2 [background-color:var(--primary-color)]/5  rounded-lg hover:[background-color:var(--primary-color)]/10 transition-colors">
      <span className="text-sm [color:var(--primary-color)] truncate" >
        {file.name} </span> </div> ))}</div></div>)}</div>);
  const renderForm = () => (<div className="space-y-4"><div className="grid grid-cols-3 gap-4"><Input label="First Name" name="firstName" value={formData.firstName} onChange={handleInputChange} required disabled={mode === 'view'} /><Input label="Middle Name" name="middleName" value={formData.middleName} onChange={handleInputChange} disabled={mode === 'view'} /><Input label="Last Name" name="lastName" value={formData.lastName} onChange={handleInputChange} required disabled={mode === 'view'} /></div>{is('doctors') && (<><div className="grid grid-cols-3 gap-4"><Input label="Gender" name="gender" value={formData.gender} onChange={handleInputChange} disabled={mode === 'view'} required /><Input label="Date of Birth" type="date" name="dob" value={formData.dob} onChange={handleInputChange} disabled={mode === 'view'} required /><Input label="Aadhaar Number" name="aadhaar" value={formData.aadhaar} onChange={handleInputChange} disabled={mode === 'view'} required /></div><div className="grid grid-cols-3 gap-4"><Input label="Phone" name="phone" value={formData.phone} onChange={handleInputChange} disabled={mode === 'view'} required /><Input label="Email ID" type="email" name="email" value={formData.email} onChange={handleInputChange} disabled={mode === 'view'} required /><Input label="Registration Number" name="registrationNumber" value={formData.registrationNumber} onChange={handleInputChange} disabled={mode === 'view'} required /></div><div className="grid grid-cols-3 gap-4"><Input label="Qualification" name="qualification" value={formData.qualification} onChange={handleInputChange} disabled={mode === 'view'} required /><Select label="Practice Type" name="practiceType" value={formData.practiceType} onChange={handleInputChange} options={Object.keys(STAFF_TYPES.doctors.specializations)} disabled={mode === 'view'} required />{formData.practiceType && (<Select label="Specialization" name="specialization" value={formData.specialization} onChange={handleInputChange} options={STAFF_TYPES.doctors.specializations[formData.practiceType]} disabled={mode === 'view'} required />)}</div><div className="grid grid-cols-2 gap-4"><Input label="Location" name="location" value={formData.location} onChange={handleInputChange} disabled={mode === 'view'} required /><Input label="Upload Documents" type="file" name="documents" multiple onChange={handleFileChange} className="" disabled={mode === 'view'} /></div></>)}{is('nurses') && (<><div className="grid grid-cols-3 gap-4"><Input label="Phone" name="phone" value={formData.phone} onChange={handleInputChange} disabled={mode === 'view'} required /><Input label="Email" name="email" type="email" value={formData.email} onChange={handleInputChange} disabled={mode === 'view'} required /><Input label="Aadhaar Number" name="aadhaar" value={formData.aadhaar} onChange={handleInputChange} disabled={mode === 'view'} required /></div><div className="grid grid-cols-3 gap-4"><Input label="Date of Birth" type="date" name="dob" value={formData.dob} onChange={handleInputChange} disabled={mode === 'view'} required /><Select label="Gender" name="gender" value={formData.gender} onChange={handleInputChange} options={['Male', 'Female', 'Other']} disabled={mode === 'view'} required /><Input label="Designation" name="designation" value={formData.designation} onChange={handleInputChange} disabled={mode === 'view'} required /></div><div className="grid grid-cols-3 gap-4"><Input label="Department" name="department" value={formData.department} onChange={handleInputChange} disabled={mode === 'view'} required /><Input label="Location" name="location" value={formData.location} onChange={handleInputChange} disabled={mode === 'view'} required /><Input label="Upload Documents" type="file" name="documents" multiple onChange={handleFileChange} className="" disabled={mode === 'view'} /></div></>)}{is('otherStaff') && (<><div className="grid grid-cols-2 gap-4"><Select label="Role" name="role" value={formData.role} onChange={handleInputChange} disabled={mode === 'view'} required options={['Cleaner', "Sweeper's", 'Technician', 'Other']} /><Input label="Phone" name="phone" value={formData.phone} onChange={handleInputChange} disabled={mode === 'view'} required /></div><div className="grid grid-cols-3 gap-4"><Input label="Aadhaar Number" name="aadhaar" value={formData.aadhaar} onChange={handleInputChange} disabled={mode === 'view'} required /><Input label="Date of Birth" type="date" name="dob" value={formData.dob} onChange={handleInputChange} disabled={mode === 'view'} required /><Select label="Gender" name="gender" value={formData.gender} onChange={handleInputChange} options={['Male', 'Female', 'Other']} disabled={mode === 'view'} required /></div><div className="grid grid-cols-2 gap-4"><Input label="Department" name="department" value={formData.department} onChange={handleInputChange} disabled={mode === 'view'} required /><Input label="Salary" name="salary" value={formData.salary} onChange={handleInputChange} disabled={mode === 'view'} required /></div><div className="grid grid-cols-3 gap-4"><Input label="Email" name="email" type="email" value={formData.email} onChange={handleInputChange} disabled={mode === 'view'} required /><Input label="Location" name="location" value={formData.location} onChange={handleInputChange} disabled={mode === 'view'} required /><Input label="Upload Documents" type="file" name="documents" multiple onChange={handleFileChange} className="" disabled={mode === 'view'} /></div></>)}</div>);
  return (<div className="min-h-screen bg-gray-50 pt-6"><div className="max-w-7xl mx-auto space-y-6"><div className="bg-white p-6 rounded-2xl shadow-lg "><div className="flex justify-between items-center mb-6"><div className="flex gap-2">{Object.keys(STAFF_TYPES).map(type => (<button key={type} onClick={() => setActiveTab(type)} className={`btn w-40 h-10 transition-all duration-200 ${activeTab === type ? 'btn-primary scale-105 shadow-lg' : 'btn-secondary hover:scale-105 hover:shadow-md hover:bg-[--primary-color]/10'}`}>{STAFF_TYPES[type].title}</button>))}</div>
<button
  onClick={() => {
    setMode('add');
    setIsModalOpen(true);
  }}
  type="button"
  className="relative overflow-hidden px-8 py-2 rounded-full font-semibold text-black border-2 border-[var(--accent-color)] shadow-md cursor-pointer group transition-all duration-300 ease-in-out
             hover:shadow-xl">
  <span className="absolute inset-0 bg-[var(--accent-color)] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-in-out rounded-full z-0"></span>
  <span className="relative z-10 group-hover:text-white transition-colors duration-300 select-none">
    Add {STAFF_TYPES[activeTab].title}
  </span>
</button>
</div>{message && (<div className="paragraph bg-[--accent-color]/10 text-[--accent-color] p-3 rounded-lg mb-4">{message}</div>)}<div className="bg-white rounded-lg overflow-hidden">
  <div className="overflow-x-auto">
    <table className="table-container">
      <thead className="[background-color:var(--primary-color)]">
        <tr>
          {STAFF_TYPES[activeTab].headers.map(header => (
            <th key={header} className="p-3 text-left ">
              <h4 className="text-white subheading" >{header}</h4>
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="table-body">
        {staffData[activeTab]
          ?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
          .map(staff => (
            <tr key={staff.id} className="tr.style">
              <td>
                <button
                  className="text-[--primary-color] hover:underline transition cursor-pointer font-normal bg-transparent border-none p-0"
                  onClick={() => { setFormData(staff); setMode('view'); setIsModalOpen(true); }}
                  type="button">
                  {staff.name}
                </button>
              </td>
              {activeTab !== 'otherStaff' && (
                <> <td>{staff.phone}</td><td>{staff.email}</td> </>)}
              <td>{staff.specialization || staff.designation || staff.role}</td>
              <td>{staff.joiningDate}</td>
              <td className="p-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => { setFormData(staff); setMode('edit'); setIsModalOpen(true); }}
                    className="edit-btn flex items-center justify-center hover:bg-[--primary-color]/10 rounded p-1 transition hover:animate-bounce"
                    title="Edit"
                    type="button">
                    <FaEdit className="text-[--primary-color]" />
                  </button>
                  <button
                    onClick={() => handleDelete(staff.id)}
                    className="delete-btn flex items-center justify-center hover:bg-red-100 rounded p-1 transition hover:animate-bounce"
                    title="Delete"
                    type="button">
                    <FaTrash className="text-red-500" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  </div>
  {/* Pagination controls */}
  <div className="flex justify-end items-center mt-4 gap-2">
    <button
      className="edit-btn flex items-center justify-center hover:bg-[--primary-color]/10 rounded p-2 transition"
      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
      disabled={currentPage === 1}
      title="Previous Page"
      type="button"
    >
    
      <span className={`ml-1 ${currentPage === 1 ? 'opacity-40' : ''}`}>Previous</span>
    </button>
    <span className="mx-2">
      Page {currentPage} of {Math.ceil((staffData[activeTab]?.length || 0) / itemsPerPage)}
    </span>
    <button
      className="edit-btn flex items-center justify-center hover:bg-[--primary-color]/10 rounded p-2 transition"
      onClick={() => setCurrentPage(p => p + 1)}
      disabled={currentPage >= Math.ceil((staffData[activeTab]?.length || 0) / itemsPerPage)}
      title="Next Page"
      type="button"
    >
      <span className={`mr-1 ${currentPage >= Math.ceil((staffData[activeTab]?.length || 0) / itemsPerPage) ? 'opacity-40' : ''}`}>Next</span>
    </button>
  </div>
</div></div>{isModalOpen && (<div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"><div className="bg-white rounded-2xl shadow-lg w-full p-4 max-w-3xl"><div className="flex justify-between items-center p-3 border-b border-var(--primary-color)]/10"><h4 className="paragraph font-semibold [color:var(--primary-color)]" >{mode === 'view' ? 'View' : mode === 'edit' ? 'Edit' : 'Add'} {STAFF_TYPES[activeTab].title}</h4><button onClick={closeModal} className="[color:var(--primary-color)]/50 hover:[color:var(--primary-color)]"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button></div><div className="p-3"><form onSubmit={handleSubmit}>{mode === 'view' ? renderProfile() : renderForm()}<div className="flex justify-end gap-2 mt-3 pt-3 border-t border-var(--primary-color)]/10"><button type="button" onClick={closeModal} className="btn btn-secondary w-20 h-8">Close</button>{mode !== 'view' && <button type="submit" className="btn btn-primary w-20 h-8">{mode === 'edit' ? 'Update' : 'Submit'}</button>}</div></form></div></div></div>)}</div></div>);
}export default App;






// import { useState, useEffect } from 'react';
// import axios from 'axios';
// import { FaEdit, FaTrash } from 'react-icons/fa';

// // Input with floating label, except for select and file
// const Input = ({ label, name, value, onChange, type = 'text', required, disabled, ...rest }) => {
//   if (type === 'file') {
//     // File input: no floating label, use input-field and upload-file classes
//     return (
//       <div>
//         <label>{label || name}</label>
//         <input
//           type="file"
//           name={name}
//           multiple
//           onChange={onChange}
//           required={required}
//           disabled={disabled}
//           className="input-field upload-file peer"
//           {...rest}
//         />
//       </div>
//     );
//   }
//   // Normal input: floating label
//   return (
//     <div className="floating-input relative" data-placeholder={label || name}>
//       <input
//         type={type}
//         name={name}
//         value={value}
//         onChange={onChange}
//         required={required}
//         disabled={disabled}
//         className={`input-field peer ${disabled ? 'btn-disabled' : ''} focus:border-[--accent-color] focus:ring-2 focus:ring-[--accent-color]/20`}
//         placeholder=" "
//         autoComplete="off"
//         {...rest}
//       />
//     </div>
//   );
// };

// // Select: no floating label, just input-field class
// const Select = ({ label, name, value, onChange, options = [], required, disabled }) => (
//   <div>
//     <label>{label || name}</label>
//     <select
//       name={name}
//       value={value}
//       onChange={onChange}
//       required={required}
//       disabled={disabled}
//       className={`input-field appearance-none ${disabled ? 'btn-disabled' : ''} focus:border-[--accent-color] focus:ring-2 focus:ring-[--accent-color]/20`}
//     >
//       <option value="">Select {name}</option>
//       {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
//     </select>
//   </div>
// );

// const STAFF_TYPES = {
//   doctors: {
//     title: 'Doctors',
//     headers: ['Name', 'Phone', 'Email', 'Specialization', 'Join Date', 'Actions'],
//     specializations: {
//       AYUSH: ['Homeopathy', 'Ayurveda', 'Unani', 'Siddha'],
//       Allopathy: ['Cardiologist', 'Dermatologist', 'Neurologist', 'Pediatrician']
//     }
//   },
//   nurses: {
//     title: 'Nurses',
//     headers: ['Name', 'Phone', 'Email', 'Designation', 'Join Date', 'Actions']
//   },
//   otherStaff: {
//     title: 'Other Staff',
//     headers: ['Name', 'Role', 'Join Date', 'Actions']
//   }
// };

// const initialForm = {
//   firstName: '', middleName: '', lastName: '', phone: '', aadhaar: '', gender: '', dob: '', email: '', password: '', confirmPassword: '', address: '', registrationNumber: '', practiceType: '', specialization: '', qualification: '', designation: '', department: '', role: '', salary: '', joiningDate: new Date().toISOString().split('T')[0], name: '', documents: []
// };

// function App() {
//   const [activeTab, setActiveTab] = useState('doctors');
//   const [staffData, setStaffData] = useState({});
//   const [formData, setFormData] = useState(initialForm);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [mode, setMode] = useState('add');
//   const [message, setMessage] = useState('');
//   const [isVerified, setIsVerified] = useState(false);

//   // Pagination state
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 5;

//   const is = (type) => activeTab === type;

//   useEffect(() => { fetchStaffData(); }, []);

//   const fetchStaffData = async () => {
//     try {
//       const { data } = await axios.get('https://6814aa91225ff1af16299ed8.mockapi.io/staff-list');
//       setStaffData({
//         doctors: data.filter(i => i.specialization),
//         nurses: data.filter(i => i.designation && !i.specialization),
//         otherStaff: data.filter(i => i.role && !i.specialization && !i.designation)
//       });
//     } catch (error) {
//       handleError('Failed to load staff data', error);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const fullName = `${formData.firstName} ${formData.middleName} ${formData.lastName}`.trim();
//       const payload = { ...formData, name: fullName };
//       const url = `https://6814aa91225ff1af16299ed8.mockapi.io/staff-list${mode === 'edit' ? `/${formData.id}` : ''}`;
//       const method = mode === 'edit' ? axios.put : axios.post;
//       await method(url, payload);
//       if (mode === 'add' && activeTab === 'doctors') { setIsVerified(true); }
//       fetchStaffData();
//       closeModal();
//     } catch (error) {
//       handleError('Failed to save staff data', error);
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm('Are you sure you want to delete this staff member?')) return;
//     try {
//       await axios.delete(`https://6814aa91225ff1af16299ed8.mockapi.io/staff-list/${id}`);
//       fetchStaffData();
//       setMessage('Staff deleted successfully');
//     } catch (error) {
//       handleError('Failed to delete staff', error);
//     }
//   };

//   const handleError = (userMessage, error) => {
//     console.error(userMessage, error);
//     setMessage(userMessage);
//   };

//   const closeModal = () => {
//     setIsModalOpen(false);
//     setFormData(initialForm);
//     setMode('add');
//     setIsVerified(false);
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleFileChange = (e) => {
//     const files = Array.from(e.target.files);
//     setFormData(prev => ({ ...prev, documents: [...(prev.documents || []), ...files] }));
//   };

//   const renderRow = (label, value) => (
//     <div className="flex justify-between py-2 border-b border-var(--primary-color)]/10">
//       <span className="paragraph [color:var(--primary-color)]/70">{label}</span>
//       <span className="paragraph [color:var(--primary-color)]">{value || 'Not Provided'}</span>
//     </div>
//   );

//   const renderProfile = () => (
//     <div className="space-y-3">
//       <div className="[background-color:var(--primary-color)] p-3 rounded-2xl shadow-lg">
//         <div className="flex items-center gap-3">
//           <div className="w-16 h-16 rounded-full overflow-hidden border border-white/20">
//             <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${formData.name}`} alt={formData.name} />
//           </div>
//           <div>
//             <h4 className="sub-heading font-semibold">{formData.name}</h4>
//             <p className="sub-heading text-white/80">
//               {is('doctors') ? formData.specialization : is('nurses') ? formData.designation : formData.role}
//             </p>
//           </div>
//         </div>
//       </div>
//       <div className="grid grid-cols-2 gap-3">
//         <div className="bg-white p-3 rounded-2xl shadow-lg border border-var(--primary-color)]/5">
//           <p className="paragraph font-bold">Personal</p>
//           <div className="space-y-1">
//             {renderRow('Gender', formData.gender)}
//             {renderRow('DOB', formData.dob)}
//             {renderRow('Phone', formData.phone)}
//             {renderRow('Email', formData.email)}
//           </div>
//         </div>
//         <div className="bg-white p-3 rounded-2xl shadow-lg border border-var(--primary-color)]/5">
//           <h4 className="paragraph font-bold">Professional</h4>
//           <div className="space-y-1">
//             {is('doctors') && (<>
//               {renderRow('Reg. No.', formData.registrationNumber)}
//               {renderRow('Practice', formData.practiceType)}
//               {renderRow('Qual.', formData.qualification)}
//             </>)}
//             {is('nurses') && (<>
//               {renderRow('Dept.', formData.department)}
//               {renderRow('Design.', formData.designation)}
//             </>)}
//             {is('otherStaff') && (<>
//               {renderRow('Role', formData.role)}
//               {renderRow('Salary', formData.salary)}
//             </>)}
//           </div>
//         </div>
//       </div>
//       {formData.documents?.length > 0 && (
//         <div className="bg-white p-3 rounded-2xl shadow-lg border border-var(--primary-color)]/5">
//           <p className="paragraph mb-2 flex items-center gap-1 font-bold">Documents</p>
//           <div className="grid grid-cols-2 gap-2">
//             {formData.documents.map((file, idx) => (
//               <div key={idx} className="p-2 [background-color:var(--primary-color)]/5  rounded-lg hover:[background-color:var(--primary-color)]/10 transition-colors">
//                 <span className="text-sm [color:var(--primary-color)] truncate">{file.name}</span>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );

//   const renderForm = () => (
//     <div className="space-y-4">
//       <div className="grid grid-cols-3 gap-4">
//         <Input label="First Name" name="firstName" value={formData.firstName} onChange={handleInputChange} required disabled={mode === 'view'} />
//         <Input label="Middle Name" name="middleName" value={formData.middleName} onChange={handleInputChange} disabled={mode === 'view'} />
//         <Input label="Last Name" name="lastName" value={formData.lastName} onChange={handleInputChange} required disabled={mode === 'view'} />
//       </div>
//       {is('doctors') && (<>
//         <div className="grid grid-cols-3 gap-4">
//           <Input label="Gender" name="gender" value={formData.gender} onChange={handleInputChange} disabled={mode === 'view'} required />
//           <Input label="Date of Birth" type="date" name="dob" value={formData.dob} onChange={handleInputChange} disabled={mode === 'view'} required />
//           <Input label="Aadhaar Number" name="aadhaar" value={formData.aadhaar} onChange={handleInputChange} disabled={mode === 'view'} required />
//         </div>
//         <div className="grid grid-cols-3 gap-4">
//           <Input label="Phone" name="phone" value={formData.phone} onChange={handleInputChange} disabled={mode === 'view'} required />
//           <Input label="Email ID" type="email" name="email" value={formData.email} onChange={handleInputChange} disabled={mode === 'view'} required />
//           <Input label="Registration Number" name="registrationNumber" value={formData.registrationNumber} onChange={handleInputChange} disabled={mode === 'view'} required />
//         </div>
//         <div className="grid grid-cols-3 gap-4">
//           <Input name="qualification" value={formData.qualification} onChange={handleInputChange} disabled={mode === 'view'} required />
//           <Select  name="" value={formData.practiceType} onChange={handleInputChange} options={Object.keys(STAFF_TYPES.doctors.specializations)} disabled={mode === 'view'} required />
//           {formData.practiceType && (
//             <Select label="Specialization" name="specialization" value={formData.specialization} onChange={handleInputChange} options={STAFF_TYPES.doctors.specializations[formData.practiceType]} disabled={mode === 'view'} required />
//           )}
//         </div>
//         <div className="grid grid-cols-2 gap-4">
//           <Input label="Location" name="location" value={formData.location} onChange={handleInputChange} disabled={mode === 'view'} required />
//           <Input label="" type="file" name="" onChange={handleFileChange} className="input-field" disabled={mode === 'view'} />
//         </div>
//       </>)}
//       {is('nurses') && (<>
//         <div className="grid grid-cols-3 gap-4">
//           <Input label="Phone" name="phone" value={formData.phone} onChange={handleInputChange} disabled={mode === 'view'} required />
//           <Input label="Email" name="email" type="email" value={formData.email} onChange={handleInputChange} disabled={mode === 'view'} required />
//           <Input label="Aadhaar Number" name="aadhaar" value={formData.aadhaar} onChange={handleInputChange} disabled={mode === 'view'} required />
//         </div>
//         <div className="grid grid-cols-3 gap-4">
//           <Input label="Date of Birth" type="date" name="dob" value={formData.dob} onChange={handleInputChange} disabled={mode === 'view'} required />
//           <Select   value={formData.gender} onChange={handleInputChange} options={['Male', 'Female', 'Other']} disabled={mode === 'view'} required />
//           <Input label="Designation" name="designation" value={formData.designation} onChange={handleInputChange} disabled={mode === 'view'} required />
//         </div>
//         <div className="grid grid-cols-3 gap-4">
//           <Input label="Department" name="department" value={formData.department} onChange={handleInputChange} disabled={mode === 'view'} required />
//           <Input label="Location" name="location" value={formData.location} onChange={handleInputChange} disabled={mode === 'view'} required />
//           <Input label="" type="file" name="" onChange={handleFileChange} className="input-field" disabled={mode === 'view'} />
//         </div>
//       </>)}
//       {is('otherStaff') && (<>
//         <div className="grid grid-cols-2 gap-4">
//           <Select  value={formData.role} onChange={handleInputChange} disabled={mode === 'view'} required options={['Cleaner', "Sweeper's", 'Technician', 'Other']} />
//           <Input label="Phone" name="phone" value={formData.phone} onChange={handleInputChange} disabled={mode === 'view'} required />
//         </div>
//         <div className="grid grid-cols-3 gap-4">
//           <Input label="Aadhaar Number" name="aadhaar" value={formData.aadhaar} onChange={handleInputChange} disabled={mode === 'view'} required />
//           <Input label="Date of Birth" type="date" name="dob" value={formData.dob} onChange={handleInputChange} disabled={mode === 'view'} required />
//           <Select  value={formData.gender} onChange={handleInputChange} options={['Male', 'Female', 'Other']} disabled={mode === 'view'} required />
//         </div>
//         <div className="grid grid-cols-2 gap-4">
//           <Input label="Department" name="department" value={formData.department} onChange={handleInputChange} disabled={mode === 'view'} required />
//           <Input label="Salary" name="salary" value={formData.salary} onChange={handleInputChange} disabled={mode === 'view'} required />
//         </div>
//         <div className="grid grid-cols-3 gap-4">
//           <Input label="Email" name="email" type="email" value={formData.email} onChange={handleInputChange} disabled={mode === 'view'} required />
//           <Input label="Location" name="location" value={formData.location} onChange={handleInputChange} disabled={mode === 'view'} required />
//           <Input  type="file"  onChange={handleFileChange} className="input-field" disabled={mode === 'view'} />
//         </div>
//       </>)}
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-gray-50 pt-6">
//       <div className="max-w-7xl mx-auto space-y-6">
//         <div className="bg-white p-6 rounded-2xl shadow-lg ">
//           <div className="flex justify-between items-center mb-6">
//             <div className="flex gap-2">
//               {Object.keys(STAFF_TYPES).map(type => (
//                 <button
//                   key={type}
//                   onClick={() => setActiveTab(type)}
//                   className={`btn w-40 h-10 transition-all duration-200 ${activeTab === type ? 'btn-primary scale-105 shadow-lg' : 'btn-secondary hover:scale-105 hover:shadow-md hover:bg-[--primary-color]/10'}`}
//                 >
//                   {STAFF_TYPES[type].title}
//                 </button>
//               ))}
//             </div>
//             <button
//               onClick={() => {
//                 setMode('add');
//                 setIsModalOpen(true);
//               }}
//               type="button"
//               className="relative overflow-hidden px-8 py-2 rounded-full font-semibold text-black border-2 border-[var(--accent-color)] shadow-md cursor-pointer group transition-all duration-300 ease-in-out hover:shadow-xl"
//             >
//               <span className="absolute inset-0 bg-[var(--accent-color)] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-in-out rounded-full z-0"></span>
//               <span className="relative z-10 group-hover:text-white transition-colors duration-300 select-none">
//                 Add {STAFF_TYPES[activeTab].title}
//               </span>
//             </button>
//           </div>
//           {message && (
//             <div className="paragraph bg-[--accent-color]/10 text-[--accent-color] p-3 rounded-lg mb-4">{message}</div>
//           )}
//           <div className="bg-white rounded-lg overflow-hidden">
//             <div className="overflow-x-auto">
//               <table className="table-container">
//                 <thead className="[background-color:var(--primary-color)]">
//                   <tr>
//                     {STAFF_TYPES[activeTab].headers.map(header => (
//                       <th key={header} className="p-3 text-left ">
//                         <h4 className="text-white subheading">{header}</h4>
//                       </th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody className="table-body">
//                   {staffData[activeTab]
//                     ?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
//                     .map(staff => (
//                       <tr key={staff.id} className="tr.style">
//                         <td>
//                           <button
//                             className="text-[--primary-color] hover:underline transition cursor-pointer font-normal bg-transparent border-none p-0"
//                             onClick={() => { setFormData(staff); setMode('view'); setIsModalOpen(true); }}
//                             type="button">
//                             {staff.name}
//                           </button>
//                         </td>
//                         {activeTab !== 'otherStaff' && (
//                           <>
//                             <td>{staff.phone}</td>
//                             <td>{staff.email}</td>
//                           </>
//                         )}
//                         <td>{staff.specialization || staff.designation || staff.role}</td>
//                         <td>{staff.joiningDate}</td>
//                         <td className="p-3">
//                           <div className="flex gap-2">
//                             <button
//                               onClick={() => { setFormData(staff); setMode('edit'); setIsModalOpen(true); }}
//                               className="edit-btn flex items-center justify-center hover:bg-[--primary-color]/10 rounded p-1 transition hover:animate-bounce"
//                               title="Edit"
//                               type="button">
//                               <FaEdit className="text-[--primary-color]" />
//                             </button>
//                             <button
//                               onClick={() => handleDelete(staff.id)}
//                               className="delete-btn flex items-center justify-center hover:bg-red-100 rounded p-1 transition hover:animate-bounce"
//                               title="Delete"
//                               type="button">
//                               <FaTrash className="text-red-500" />
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     ))}
//                 </tbody>
//               </table>
//             </div>
//             {/* Pagination controls */}
//             <div className="flex justify-end items-center mt-4 gap-2">
//               <button
//                 className="edit-btn flex items-center justify-center hover:bg-[--primary-color]/10 rounded p-2 transition"
//                 onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
//                 disabled={currentPage === 1}
//                 title="Previous Page"
//                 type="button"
//               >
//                 <span className={`ml-1 ${currentPage === 1 ? 'opacity-40' : ''}`}>Previous</span>
//               </button>
//               <span className="mx-2">
//                 Page {currentPage} of {Math.ceil((staffData[activeTab]?.length || 0) / itemsPerPage)}
//               </span>
//               <button
//                 className="edit-btn flex items-center justify-center hover:bg-[--primary-color]/10 rounded p-2 transition"
//                 onClick={() => setCurrentPage(p => p + 1)}
//                 disabled={currentPage >= Math.ceil((staffData[activeTab]?.length || 0) / itemsPerPage)}
//                 title="Next Page"
//                 type="button"
//               >
//                 <span className={`mr-1 ${currentPage >= Math.ceil((staffData[activeTab]?.length || 0) / itemsPerPage) ? 'opacity-40' : ''}`}>Next</span>
//               </button>
//             </div>
//           </div>
//         </div>
//         {isModalOpen && (
//           <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
//             <div className="bg-white rounded-2xl shadow-lg w-full p-4 max-w-3xl">
//               <div className="flex justify-between items-center p-3 border-b border-var(--primary-color)]/10">
//                 <h4 className="paragraph font-semibold [color:var(--primary-color)]">
//                   {mode === 'view' ? 'View' : mode === 'edit' ? 'Edit' : 'Add'} {STAFF_TYPES[activeTab].title}
//                 </h4>
//                 <button onClick={closeModal} className="[color:var(--primary-color)]/50 hover:[color:var(--primary-color)]">
//                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
//                   </svg>
//                 </button>
//               </div>
//               <div className="p-3">
//                 <form onSubmit={handleSubmit}>
//                   {mode === 'view' ? renderProfile() : renderForm()}
//                   <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-var(--primary-color)]/10">
//                     <button type="button" onClick={closeModal} className="btn btn-secondary w-20 h-8">Close</button>
//                     {mode !== 'view' && <button type="submit" className="btn btn-primary w-20 h-8">{mode === 'edit' ? 'Update' : 'Submit'}</button>}
//                   </div>
//                 </form>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default App;