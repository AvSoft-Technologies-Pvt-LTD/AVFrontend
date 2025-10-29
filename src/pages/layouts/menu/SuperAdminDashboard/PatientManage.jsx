import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrash } from "react-icons/fa";
import { FileText } from "lucide-react";

const editReasons = ["Incorrect DOB","Update contact info","Address mismatch","Spelling mistake in name","Occupation changed","Incorrect Aadhaar number"];
const Modal = ({ children, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
      <button onClick={onClose} className="absolute top-2 right-3 text-gray-600 hover:text-red-500 text-xl font-bold">&times;</button>
      {children}
    </div>
  </div>
);

const PatientManagement = () => {
  const [patients,setPatients]=useState([]),[search,setSearch]=useState(''),[loading,setLoading]=useState(true),
    [modalData,setModalData]=useState(null),[isOpen,setIsOpen]=useState(false),[randomReasonMap,setRandomReasonMap]=useState({}),
    [allowedIds,setAllowedIds]=useState({}),[selectedReason,setSelectedReason]=useState(''),[reasonModalOpen,setReasonModalOpen]=useState(false),
    [deleteModalOpen,setDeleteModalOpen]=useState(false),[patientToDelete,setPatientToDelete]=useState(null),[currentPage,setCurrentPage]=useState(1);
  const ITEMS_PER_PAGE=5;
  useEffect(()=>{
    axios.get('https://6810972027f2fdac2411f6a5.mockapi.io/users').then(res=>{
      let reasons={};
      res.data.forEach(p=>{reasons[p.id]=editReasons[Math.floor(Math.random()*editReasons.length)];});
      setPatients(res.data); setRandomReasonMap(reasons); setLoading(false);
    }).catch(()=>setLoading(false));
  },[]);
  const calculateAge=dob=>{
    const b=new Date(dob),t=new Date();
    let age=t.getFullYear()-b.getFullYear();
    if(t.getMonth()<b.getMonth()||(t.getMonth()===b.getMonth()&&t.getDate()<b.getDate())) age--;
    return age;
  };
  const fetchFullProfile=async email=>{
    setModalData(null); setIsOpen(true);
    const e=(email||'').toLowerCase().trim();
    const basic=patients.find(p=>(p.email||'').toLowerCase().trim()===e);
    try {
      const [fRes,hRes,hidRes]=await Promise.all([
        axios.get('https://6808fb0f942707d722e09f1d.mockapi.io/FamilyData'),
        axios.get('https://680cc0c92ea307e081d4edda.mockapi.io/personalHealthDetails'),
        axios.get('https://6810972027f2fdac2411f6a5.mockapi.io/healthcard')
      ]);
      const family=fRes.data.filter(f=>(f.email||'').toLowerCase().trim()===e);
      const health=hRes.data.find(h=>(h.email||'').toLowerCase().trim()===e)||null;
      const healthIdData=hidRes.data.find(hid=>(hid.email||'').toLowerCase().trim()===e);
      setModalData({basic:{...basic,healthId:healthIdData?.healthId||null},family,health});
    } catch {}
  };
  const handleAllow=id=>setAllowedIds(s=>({...s,[id]:'allowed'}));
  const handleDeny=id=>setAllowedIds(s=>({...s,[id]:'denied'}));
  const openDeleteModal=p=>{setPatientToDelete(p);setDeleteModalOpen(true);};
  const confirmDelete=()=>{if(patientToDelete)setPatients(s=>s.filter(p=>p.id!==patientToDelete.id));setDeleteModalOpen(false);setPatientToDelete(null);};
  const cancelDelete=()=>{setDeleteModalOpen(false);setPatientToDelete(null);};
  const filtered=patients.filter(p=>`${p.firstName} ${p.lastName}`.toLowerCase().includes(search.toLowerCase())||(p.email||'').toLowerCase().includes(search.toLowerCase())||(p.phone||'').includes(search));
  const totalPages=Math.ceil(filtered.length/ITEMS_PER_PAGE);
  const paginatedPatients=filtered.slice((currentPage-1)*ITEMS_PER_PAGE,currentPage*ITEMS_PER_PAGE);
  const changePage=n=>{if(n<1||n>totalPages)return;setCurrentPage(n);};

  return (
    <div className="p-6">
      <h2 className="h3-heading mb-4">Manage Patients</h2>
      <input value={search} onChange={e=>{setSearch(e.target.value);setCurrentPage(1);}} placeholder="Search by name, email, or phone" className="input-field mb-4"/>
      {loading ? <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent-color)]"></div>
                  </div> : (
        <>
          <table className="table-container">
            <thead><tr className="table-head">{["Name","Age/Gender","Phone","Reason","Allow /Deny","Actions"].map((h,i)=><th key={i} className="p-2">{h}</th>)}</tr></thead>
            <tbody className="table-body">
              {paginatedPatients.map(p=>(
                <tr key={p.id} className="tr-style hover:bg-gray-50 transition-colors">
                  <td><button className="text-[var(--primary-color)] font-semibold hover:text-[var(--accent-color)] focus:outline-none bg-none border-none p-0 cursor-pointer" onClick={()=>fetchFullProfile(p.email)}>{p.firstName} {p.lastName}</button></td>
                  <td>{p.dob ? `${calculateAge(p.dob)} yrs` : 'N/A'} / {p.gender}</td>
                  <td>{p.phone}</td>
                  <td className="text-center">
                    {(allowedIds[p.id]==='allowed'||allowedIds[p.id]==='denied') ? (
                      <span className={`font-semibold ${allowedIds[p.id]==='allowed'?'text-green-600':'text-red-600'}`}>{allowedIds[p.id]==='allowed'?'Received':'Denied'}</span>
                    ) : (
                      <button onClick={() => {setSelectedReason(randomReasonMap[p.id]);setReasonModalOpen(true);}} className="group relative view-btn p-2 rounded-full border border-[var(--accent-color)] text-[var(--accent-color)] bg-white shadow-md hover:bg-[var(--accent-color)] hover:text-white transition-all duration-300 hover:scale-105" >
                        <span className="absolute inset-0 rounded-full animate-[subtle-glow_1.8s_ease-in-out_infinite] opacity-60 z-0" />
                        <FileText className="w-5 h-5 relative z-10 transition-all duration-300 group-hover:animate-[paper-wobble_0.6s]" />
                      </button>
                    )}
                  </td>
                  <td><div className="flex justify-center gap-2 flex-wrap"><button onClick={()=>handleAllow(p.id)} className="text-green-600 font-medium">Allow</button><button onClick={()=>handleDeny(p.id)} className="text-red-600 font-medium">Deny</button></div></td>
                  <td><div className="flex justify-center items-center gap-2"> <button type="button" className="delete-btn p-1 rounded hover:bg-red-100 transition hover:animate-bounce" onClick={() => openDeleteModal(p)} title="Delete"> <FaTrash className="text-red-500" /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-end items-center gap-2 mt-4">
            <button disabled={currentPage===1} onClick={()=>changePage(currentPage-1)} className="edit-btn">Prev</button>
            <span>Page {currentPage} of {totalPages||1}</span>
            <button disabled={currentPage===totalPages||totalPages===0} onClick={()=>changePage(currentPage+1)} className="edit-btn">Next</button>
          </div>
        </>
      )}

      {isOpen && modalData && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="fixed inset-0 flex items-center justify-end overflow-y-auto">
            <div className="bg-[var(--color-surface)] rounded-2xl shadow-2xl max-w-3xl w-full mr-[10%] p-8 max-h-[90vh] overflow-y-auto relative">
              <button onClick={()=>setIsOpen(false)} className="absolute top-3 right-4 text-2xl text-[var(--color-overlay)] hover:text-red-500">&times;</button>
              <h4 className="h4-heading mb-4 text-[var(--primary-color)]">Patient Details</h4>
              <div className="space-y-6">
                {modalData.basic && <div className="border p-4 rounded-md shadow-sm hover:shadow-md transition-shadow">
                  <h4 className="paragraph font-bold mb-3 border-b pb-2">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><p className='paragraph'><strong>Name:</strong> {modalData.basic.firstName} {modalData.basic.lastName}</p><p className='paragraph'><strong>Gender:</strong> {modalData.basic.gender||'N/A'}</p><p className='paragraph'><strong>Age:</strong> {modalData.basic.dob ? calculateAge(modalData.basic.dob)+' yrs' : 'N/A'}</p></div>
                    <div><p className='paragraph'><strong>Email:</strong> {modalData.basic.email}</p><p className='paragraph'><strong>Phone:</strong> {modalData.basic.phone}</p><p className='paragraph '><strong>Address:</strong> {modalData.basic.permanentAddress}</p><p className='paragraph '><strong>Health ID:</strong> {modalData.basic.healthId||<span className="text-red-500">Not Generated</span>}</p></div>
                  </div>
                </div>}
                {modalData.health && <div className="border p-4 rounded-md shadow-sm hover:shadow-md transition-shadow">
                  <h4 className="paragraph font-bold mb-3 border-b pb-2">Health Info</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {['height','weight','bloodGroup'].map((key,i)=>(
                      <div key={i} className="bg-gray-50 p-3 text-[var(--color-overlay)] rounded-md">
                        <span className="text-sm">{key.charAt(0).toUpperCase()+key.slice(1).replace(/([A-Z])/g,' $1')}</span><br/>
                        <span className="text-lg font-semibold">{modalData.health[key]||'N/A'}</span>
                      </div>
                    ))}
                  </div>
                </div>}
                {modalData.family?.length>0 && <div className="border p-4 rounded-md shadow-sm hover:shadow-md transition-shadow">
                  <h4 className="paragraph font-bold mb-3 border-b pb-2">Family Members</h4>
                  {modalData.family.map(f=>(
                    <div key={f.id} className="border rounded-md p-3 mb-3">
                      <p className='paragraph'><strong>Name:</strong> {f.name}</p>
                      <p className='paragraph'><strong>Relationship:</strong> {f.relationship}</p>
                      <p className='paragraph'><strong>Phone:</strong> {f.phone}</p>
                      <p className='paragraph'><strong>Email:</strong> {f.email}</p>
                    </div>
                  ))}
                </div>}
              </div>
            </div>
          </div>
        </div>
      )}

      {reasonModalOpen && (
        <Modal onClose={()=>setReasonModalOpen(false)}>
          <h3 className="text-xl font-semibold text-[var(--primary-color)] mb-4">Edit Reason</h3>
          <p className="text-gray-700 text-base">{selectedReason}</p>
        </Modal>
      )}

      {deleteModalOpen && (
        <Modal onClose={cancelDelete}>
          <h3 className="h4-heading mb-4">Confirm Delete</h3>
          <p>Are you sure you want to delete <strong>{patientToDelete?.firstName}</strong>?</p>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={cancelDelete} className="view-btn">Cancel</button>
            <button onClick={confirmDelete} className="delete-btn">Yes, Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PatientManagement;
