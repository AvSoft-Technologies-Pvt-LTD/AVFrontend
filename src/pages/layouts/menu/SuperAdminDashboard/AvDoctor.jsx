import React, { useState } from 'react';
import { FaEdit } from 'react-icons/fa';

const DoctorManagement = () => {
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    phone: '',
    email: '',
    aadhaar: '',
    registrationNo: '',
    gender: '',
    doctorType: '',
    specializationType: '',
    ayushSpecializations: [],
    qualification: '',
    documentType: '',
    file: null,
    location: '',
    associatedHospital: '',
    associatedClinic: '',
    totalAppointments: '',
    commission: '',
    status: '',
    rejectionReason: '',
    rejectionDate: '',
    password: '',
    confirmPassword: ''
  });

  const genderOptions = ['Male', 'Female', 'Other'];
  const doctorTypeOptions = ['Allopathy', 'Ayush'];
  const specializationOptions = ['Cardiology', 'Gynecology', 'Dermatology', 'Pediatrics', 'Orthopedics', 'Neurology', 'General Physician'];
  const ayushOptions = ['Ayurveda', 'Homeopathy', 'Unani', 'Siddha', 'Yoga & Naturopathy'];
  const documentTypeOptions = ['Medical Degree Certificate', 'Medical Registration Certificate', 'Government ID Proof', 'Experience Certificate'];

  const handleChange = ({ target: { name, value, type, checked } }) => {
    setFormData(prev => ({
      ...prev,
      [name]: name === 'ayushSpecializations' ? (checked ? [...prev.ayushSpecializations, value] : prev.ayushSpecializations.filter(i => i !== value)) : value
    }));
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      middleName: '',
      lastName: '',
      phone: '',
      email: '',
      aadhaar: '',
      registrationNo: '',
      gender: '',
      doctorType: '',
      specializationType: '',
      ayushSpecializations: [],
      qualification: '',
      documentType: '',
      file: null,
      location: '',
      associatedHospital: '',
      associatedClinic: '',
      totalAppointments: '',
      commission: '',
      status: '',
      rejectionReason: '',
      rejectionDate: '',
      password: '',
      confirmPassword: ''
    });
    setSelectedDoctor(null);
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) return alert("Passwords do not match");

    const newDoctor = {
      ...formData,
      id: selectedDoctor ? selectedDoctor.id : Date.now(),
      specialization: formData.doctorType === 'Allopathy' ? formData.specializationType : formData.ayushSpecializations,
      ayushSpecialization: formData.ayushSpecializations,
      documents: formData.file ? [{ name: formData.file.name, url: URL.createObjectURL(formData.file) }] : [],
      status: 'pending'
    };

    if (selectedDoctor) {
      // Update existing doctor
      setDoctors(prev => prev.map(doc => (doc.id === selectedDoctor.id ? newDoctor : doc)));
    } else {
      // Add new doctor
      setDoctors(prev => [...prev, newDoctor]);
    }

    setShowModal(false);
    setShowEditModal(false);
    resetForm();
  };

  const filteredDoctors = doctors.filter(doc =>
    [doc.firstName, doc.lastName, doc.phone, doc.doctorType, doc.specialization, doc.qualification, doc.location]
      .join(' ')
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // Open view modal on doctor name click
  const openViewModal = (doctor) => {
    setSelectedDoctor(doctor);
    setShowViewModal(true);
  };

  // Open edit modal on edit icon click
  const openEditModal = (doctor) => {
    setSelectedDoctor(doctor);
    setFormData({
      ...doctor,
      ayushSpecializations: doctor.ayushSpecializations || [],
      file: null,
      password: '',
      confirmPassword: ''
    });
    setShowEditModal(true);
  };

  return (
    <div className="p-6 max-w-7xl">
      <h1 className="h3-heading mb-8">Doctor Management</h1>
      <div className="flex gap-4 mb-6">
  <div className="floating-input relative" data-placeholder="Search pharmacy name...">
    <input
      placeholder=" "
      value={search}
      onChange={e => setSearch(e.target.value)}
      className="input-field peer w-full"
      autoComplete="off"
    />
  </div>
  <select
    value={filterStatus}
    onChange={e => setFilterStatus(e.target.value)}
    className="input-field max-w-60"
  >
    {['All', 'Pending', 'Approved', 'Rejected'].map(s => (
      <option key={s}>{s}</option>
    ))}
  </select>
</div>

      <div className="overflow-x-auto shadow-sm">
        <table className="table-container">
          <thead>
            <tr className="table-head">
              {['Name', 'Phone', 'Doctor Type', 'Specialization', 'Qualification', 'Location', 'Action'].map(h => (
                <th key={h} className="p-2">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="table-body">
            {filteredDoctors.length ? filteredDoctors.map((doc, i) => (
              <tr key={i} className="tr-style hover:bg-[var(--color-surface)]">
                <td>
                  <button
                    onClick={() => openViewModal(doc)}
                    className="text-[var(--primary-color)] font-semibold hover:text-[var(--accent-color)] focus:outline-none bg-none border-none p-0 cursor-pointer"
                  >
                    {doc.firstName} {doc.lastName}
                  </button>
                </td>
                <td>{doc.phone}</td>
                <td>{doc.doctorType}</td>
                <td>{Array.isArray(doc.specialization) ? doc.specialization.join(', ') : doc.specialization}</td>
                <td>{doc.qualification}</td>
                <td>{doc.location}</td>
                <td>
                  <button
                    type="button"
                    className="edit-btn p-1 rounded hover:bg-[--primary-color]/10 transition hover:animate-bounce"
                    onClick={() => openEditModal(doc)}
                    title="Edit"
                  >
                    <FaEdit className="text-[--primary-color]" />
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="7" className="text-center py-10">No doctors added yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Doctor Modal */}
   {showModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <div className="bg-[var(--color-surface)] rounded-lg shadow-lg max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6">
      <h2 className="h3-heading mb-4">Register New Doctor</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 ">
        {['firstName', 'middleName', 'lastName'].map(name => (
          <div key={name} className="floating-input relative" data-placeholder={name.replace(/([A-Z])/g, ' $1').trim()}>
            <input
              name={name}
              placeholder=" "
              className="input-field peer"
              onChange={handleChange}
              value={formData[name]}
              required={['firstName', 'lastName'].includes(name)}
              autoComplete="off"
            />
          </div>
        ))}
        {['phone', 'email', 'aadhaar', 'registrationNo', 'qualification', 'location'].map(f => (
          <div key={f} className="floating-input relative" data-placeholder={f[0].toUpperCase() + f.slice(1)}>
            <input
              name={f}
              placeholder=" "
              className="input-field peer"
              onChange={handleChange}
              value={formData[f]}
              required
              autoComplete="off"
            />
          </div>
        ))}
        <select
          name="gender"
          onChange={handleChange}
          value={formData.gender}
          required
          className="input-field"
        >
          <option value="" disabled>Gender</option>
          {genderOptions.map(opt => <option key={opt}>{opt}</option>)}
        </select>
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            name="doctorType"
            onChange={handleChange}
            value={formData.doctorType}
            required
            className="input-field"
          >
            <option value="" disabled>Doctor Type</option>
            {doctorTypeOptions.map(opt => <option key={opt}>{opt}</option>)}
          </select>
          <select
            name="specializationType"
            onChange={handleChange}
            value={formData.specializationType}
            required
            className="input-field"
            disabled={!formData.doctorType}
          >
            <option value="" disabled>{formData.doctorType ? `Select ${formData.doctorType} Specialization` : 'Select Specialization'}</option>
            {(formData.doctorType === 'Allopathy' ? specializationOptions : formData.doctorType === 'Ayush' ? ayushOptions : []).map(opt => <option key={opt}>{opt}</option>)}
          </select>
        </div>
        {['associatedHospital', 'associatedClinic'].map(f => (
          <div key={f} className="floating-input relative" data-placeholder={f.replace(/([A-Z])/g, ' $1').trim()}>
            <input
              name={f}
              placeholder=" "
              className="input-field peer"
              onChange={handleChange}
              value={formData[f]}
              autoComplete="off"
            />
          </div>
        ))}
        <select
          name="documentType"
          onChange={handleChange}
          value={formData.documentType}
          required
          className="input-field"
        >
          <option value="" disabled>Select Document Type</option>
          {documentTypeOptions.map(d => <option key={d}>{d}</option>)}
        </select>
        <input
          type="file"
          accept="application/pdf,image/*"
          onChange={e => setFormData(prev => ({ ...prev, file: e.target.files[0] }))}
          required
          className="input-field text-sm"
        />
        <div className="col-span-1 md:col-span-2 flex justify-end space-x-3 mt-4">
          <button type="submit" className="btn btn-primary">Submit</button>
          <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="btn btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  </div>
)}

{/* Edit Doctor Modal */}
{showEditModal && selectedDoctor && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <div className="bg-[var(--color-surface)] rounded-lg shadow-lg max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6">
      <h2 className="h3-heading mb-4">Edit Doctor Details</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 ">
        {['firstName', 'middleName', 'lastName'].map(name => (
          <div key={name} className="floating-input relative" data-placeholder={name.replace(/([A-Z])/g, ' $1').trim()}>
            <input
              name={name}
              placeholder=" "
              className="input-field peer"
              onChange={handleChange}
              value={formData[name]}
              required={['firstName', 'lastName'].includes(name)}
              autoComplete="off"
            />
          </div>
        ))}
        {['phone', 'email', 'aadhaar', 'registrationNo', 'qualification', 'location'].map(f => (
          <div key={f} className="floating-input relative" data-placeholder={f[0].toUpperCase() + f.slice(1)}>
            <input
              name={f}
              placeholder=" "
              className="input-field peer"
              onChange={handleChange}
              value={formData[f]}
              required
              autoComplete="off"
            />
          </div>
        ))}
        <select
          name="gender"
          onChange={handleChange}
          value={formData.gender}
          required
          className="input-field"
        >
          <option value="" disabled>Gender</option>
          {genderOptions.map(opt => <option key={opt}>{opt}</option>)}
        </select>
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            name="doctorType"
            onChange={handleChange}
            value={formData.doctorType}
            required
            className="input-field"
          >
            <option value="" disabled>Doctor Type</option>
            {doctorTypeOptions.map(opt => <option key={opt}>{opt}</option>)}
          </select>
          <select
            name="specializationType"
            onChange={handleChange}
            value={formData.specializationType}
            required
            className="input-field"
            disabled={!formData.doctorType}
          >
            <option value="" disabled>{formData.doctorType ? `Select ${formData.doctorType} Specialization` : 'Select Specialization'}</option>
            {(formData.doctorType === 'Allopathy' ? specializationOptions : formData.doctorType === 'Ayush' ? ayushOptions : []).map(opt => <option key={opt}>{opt}</option>)}
          </select>
        </div>
        {['associatedHospital', 'associatedClinic'].map(f => (
          <div key={f} className="floating-input relative" data-placeholder={f.replace(/([A-Z])/g, ' $1').trim()}>
            <input
              name={f}
              placeholder=" "
              className="input-field peer"
              onChange={handleChange}
              value={formData[f]}
              autoComplete="off"
            />
          </div>
        ))}
        <select
          name="documentType"
          onChange={handleChange}
          value={formData.documentType}
          className="input-field"
        >
          <option value="" disabled>Select Document Type</option>
          {documentTypeOptions.map(d => <option key={d}>{d}</option>)}
        </select>
        <input
          type="file"
          accept="application/pdf,image/*"
          onChange={e => setFormData(prev => ({ ...prev, file: e.target.files[0] }))}
          className="input-field text-sm"
        />
        <div className="col-span-1 md:col-span-2 flex justify-end space-x-3 mt-4">
          <button type="submit" className="btn btn-primary">Update</button>
          <button type="button" onClick={() => { setShowEditModal(false); resetForm(); }} className="btn btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  </div>
)}

      {/* View Doctor Modal */}
      {showViewModal && selectedDoctor && (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-end p-4 overflow-y-auto">
          <div className="bg-[var(--color-surface)] rounded-2xl shadow-2xl max-w-3xl w-full mr-[10%] p-8 max-h-[90vh] overflow-y-auto relative">
            <button onClick={() => { setShowViewModal(false); setSelectedDoctor(null); }} className="absolute top-5 right-5 text-2xl">✕</button>
            <h2 className="h3-heading mb-4">Doctor Full Details</h2>
            <section className="border p-4 rounded-md shadow-sm hover:shadow-md transition-shadow">
              <h3 className="paragraph font-bold mb-3 border-b pb-2">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {['id', 'firstName', 'middleName', 'lastName', 'phone', 'email', 'gender', 'location', 'aadhaar'].map(k => (
                  <p key={k} className="paragraph">
                    <strong>{k[0].toUpperCase() + k.slice(1)}:</strong> {selectedDoctor[k] !== undefined && selectedDoctor[k] !== '' ? (Array.isArray(selectedDoctor[k]) ? selectedDoctor[k].join(', ') : selectedDoctor[k]) : 'None'}
                  </p>
                ))}
              </div>
            </section>
            <section className="border p-4 rounded-md shadow-sm hover:shadow-md transition-shadow mt-4">
              <h3 className="paragraph font-bold mb-3 border-b pb-2">Professional Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {['doctorType', 'specialization', 'qualification', 'registrationNo', 'associatedHospital', 'associatedClinic'].map(k => (
                  <p key={k} className="paragraph">
                    <strong>{k[0].toUpperCase() + k.slice(1)}:</strong> {selectedDoctor[k] !== undefined && selectedDoctor[k] !== '' ? (Array.isArray(selectedDoctor[k]) ? selectedDoctor[k].join(', ') : selectedDoctor[k]) : 'None'}
                  </p>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorManagement;


