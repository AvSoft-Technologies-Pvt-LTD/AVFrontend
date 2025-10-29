import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
const rolePermissions = { superAdmin: ['View & Edit All Modules', 'Approve/Reject Doctors', 'Approve/Reject Hospitals', 'Approve/Reject Pharmacies', 'Approve/Reject Labs', 'Manage All Patients', 'Manage All Transactions', 'Access Settings', 'Access Billing & Reports', 'Manage Sub Admins'], subAdmin: ['View & Edit All Modules', 'Approve/Reject Doctors', 'Approve/Reject Hospitals', 'Approve/Reject Pharmacies', 'Approve/Reject Labs', 'Manage All Patients', 'Access Billing Info', 'View Transactions', 'Limited Access to Settings', 'Generate Reports'], patient: ['Book Appointments', 'Download Health Card', 'View/Upload Reports', 'View Transactions', 'Add Presptions', 'Tracking Delievry'], hospital: ['Add/Edit Assosiated Doctors', 'Add/Edit Staffs', 'Add/Edit Departments', 'Manage Patients', 'Add Patients in OPD', 'Assign Departments to Doctors', 'Billing & Payments', 'View & Manage All Appointments', 'View Reports', 'View Prescrptions'], freelancerDoctor: ['Access Patient History', 'Prescribe Medications', 'Request Lab Tests', 'View Appointments', 'Refer Labs', 'Access Payments'], avSwasthyaDoctor: ['Access Patient History', 'Prescribe Medications', 'View Appointments', 'Prescribe Medication'], pharmacy: ['View Prescriptions', 'Add Medications', 'Manage Inventory', 'Track Orders', 'Handle Delivery', 'Generate Reports'], lab: ['Add Test/Scans', 'Upload Reports', 'View Prescriptions', 'Manage Inventory', 'Manage Appointments', 'Generate Bills', 'Track Test Deliveries', 'View Appointments'] };
const roleLabels = { superAdmin: 'Super Admin', subAdmin: 'Sub Admin', patient: 'Patient', hospital: 'Hospital', freelancerDoctor: 'Freelancer Doctor', avSwasthyaDoctor: 'AV Swasthya Doctor', pharmacy: 'Pharmacy', lab: 'Lab / Scan Center' };
const roleTags = { superAdmin: 'bg-[#0E1630] text-white', subAdmin: 'bg-[#01D48C] text-white', patient: 'bg-blue-100 text-blue-700', hospital: 'bg-purple-100 text-purple-700', freelancerDoctor: 'bg-orange-100 text-orange-700', avSwasthyaDoctor: 'bg-pink-100 text-pink-700', pharmacy: 'bg-green-100 text-green-700', lab: 'bg-yellow-100 text-yellow-700' };
const UserRolePermissionManager = () => {
  const [selectedRole, setSelectedRole] = useState('patient'), [availablePermissions, setAvailablePermissions] = useState(rolePermissions['patient']), [selectedPermissions, setSelectedPermissions] = useState(rolePermissions['patient']), [assignedRoles, setAssignedRoles] = useState([]), [newPermission, setNewPermission] = useState(''), [ipAddress, setIpAddress] = useState(''), [manualIpAddress, setManualIpAddress] = useState('');
  useEffect(() => { fetch('https://api.ipify.org?format=json').then(r => r.json()).then(d => setIpAddress(d.ip)).catch(console.error); }, []);
  const handleRoleChange = e => { const role = e.target.value; setSelectedRole(role); setAvailablePermissions(rolePermissions[role]); setSelectedPermissions(rolePermissions[role]); };
  const addNewPermission = () => { if (newPermission.trim() && !availablePermissions.includes(newPermission)) { setAvailablePermissions(prev => [...prev, newPermission.trim()]); setSelectedPermissions(prev => [...prev, newPermission.trim()]); setNewPermission(''); } };
  const togglePermission = perm => setSelectedPermissions(prev => prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]);
  const addRoleWithPermissions = () => { if (!selectedPermissions.length) return alert('Please select at least one permission.'); setAssignedRoles(prev => [...prev, { id: Date.now(), role: selectedRole, permissions: selectedPermissions, timestamp: new Date().toISOString(), ipAddress: manualIpAddress || ipAddress, isAdmin: selectedRole === 'superAdmin' || selectedRole === 'subAdmin' }]); setManualIpAddress(''); };
  return (
    <div className="w-full p-6 text-black">
      <AnimatePresence>
        <motion.div
          className="bg-white shadow-xl rounded-2xl p-8 border border-gray-200"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0 }}
        >
          {/* Section 1: Role Selection */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="h3-heading">Role Management System</h2>
            <p className="paragraph">Manage user roles and permissions across the platform</p>
          </motion.div>
          {/* Section 2: Choose User Type */}
          <motion.div
            className="bg-[var(--color-surface)] p-6 rounded-xl shadow-sm border border-gray-100 mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <div className="flex flex-col md:flex-row md:items-end gap-6">
              <div className="flex-1 min-w-[220px]">
                <label className="h4-heading ">Choose User Type</label>
                <select value={selectedRole} onChange={handleRoleChange} className="input-field mt-3">
                  {Object.entries(roleLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                </select>
              </div>
              {(selectedRole === 'superAdmin' || selectedRole === 'subAdmin') && (
                <motion.div className="flex-1 min-w-[220px] md:ml-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.2 }}>
                  <label className="font-semibold mb-2 text-[var(--color-overlay)] block">IP Address</label>
                  <input type="text" value={manualIpAddress} onChange={e => setManualIpAddress(e.target.value)} placeholder="Enter IP address" className="input-field" />
                  <p className="paragraph mt-1">Current IP: <span className="font-mono">{ipAddress}</span></p>
                </motion.div>
              )}
            </div>
          </motion.div>
          {/* Section 3: Add New Permission */}
          <motion.div
            className="bg-[var(--color-surface)] p-6 rounded-xl shadow-sm border border-gray-100 mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <h3 className="h4-heading mb-3 ">Add New Permission</h3>
            <div className="flex gap-3">
              <div className="floating-input relative w-3xl" data-placeholder="Enter new permission">
  <input
    type="text"
    value={newPermission}
    onChange={e => setNewPermission(e.target.value)}
    placeholder=" " // single space for floating effect
    className="input-field flex-1 peer"
  />
</div>
             <motion.button
  onClick={addNewPermission}
  className="relative overflow-hidden text-sm font-semibold border border-[var(--accent-color)] text-[var(--accent-color)] px-6 py-2 rounded-lg group transition-all duration-300"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, delay: 1.4 }}
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
>
  {/* Text */}
  <span className="relative z-10 transition-colors duration-300 group-hover:text-white">
    Add Permission
  </span>

  {/* Animated sweeping overlay */}
  <span className="absolute top-0 left-1/2 w-0 h-full bg-[var(--accent-color)] opacity-70 group-hover:w-full group-hover:left-0 transition-all duration-500 ease-in-out z-0 rounded-lg"></span>
</motion.button>

            </div>
          </motion.div>
          {/* Section 4: Module Permissions */}
          <motion.div
            className="bg-[var(--color-surface)] p-6 rounded-xl shadow-sm border border-gray-100 mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.7 }}
          >
            <h3 className="h4-heading mb-3">Module Permissions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {availablePermissions.map((perm, i) => (
                <motion.label key={i} className="bg-gray-50 p-2 rounded-xl shadow-sm border border-gray-100 mb-2">
                  <input type="checkbox" checked={selectedPermissions.includes(perm)} onChange={() => togglePermission(perm)} className="accent-[var(--primary-color)] mt-1" />
                  <span className="text-sm text-[var(--color-overlay)] m-4">{perm}</span>
                </motion.label>
              ))}
            </div>
          </motion.div>
          {/* Section 5: Add Role Button */}
          <motion.div
            className="flex justify-end"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2.2 }}
          >
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  onClick={addRoleWithPermissions}
  className="btn btn-primary relative overflow-hidden"
  style={{ position: 'relative', overflow: 'hidden' }}
>
  <span className="relative z-10">Add Role</span>
  {/* Slow, wide shimmer overlay */}
  <span
    className="shimmer-overlay pointer-events-none"
    aria-hidden="true"
  ></span>
  <style>
    {`
      .btn.btn-primary .shimmer-overlay {
        position: absolute;
        top: 0;
        left: -80%;
        width: 80%;
        height: 100%;
        background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%);
        transition: left 2.2s cubic-bezier(.4,0,.2,1);
        z-index: 1;
        border-radius: inherit;
      }
      .btn.btn-primary:hover .shimmer-overlay {
        left: 120%;
        transition: left 2.2s cubic-bezier(.4,0,.2,1);
      }
    `}
  </style>
</motion.button>          </motion.div>
        </motion.div>
        {/* Section 6: Role Assignments List */}
        {assignedRoles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 1, delay: 2.7 }}
            className="mt-10 bg-gradient-to-br from-white to-gray-50 shadow-2xl rounded-2xl overflow-hidden border border-gray-100"
          >
            <div className="p-4 bg-[var(--primary-color)] border-b">
              <h2 className="sub-heading">Role Assignments and Login History</h2>
            </div>
            <div className="flex flex-col gap-6 p-8">
              {assignedRoles.map(entry => (
                <motion.div key={entry.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 ${entry.isAdmin ? 'bg-gradient-to-br from-[var(--primary-color)]/5 to-[#283593]/5' : ''}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${roleTags[entry.role]} font-bold`}>
                        <span className="text-lg">{entry.role.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <span className={`font-semibold text-lg mr-2 ${roleTags[entry.role]} px-3 py-1 rounded-full`}>{roleLabels[entry.role]}</span>
                        {entry.isAdmin && <span className="ml-2 px-3 py-1 text-xs font-medium bg-[var(--primary-color)] text-white rounded-full">Admin</span>}
                      </div>
                    </div>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setAssignedRoles(prev => prev.filter(r => r.id !== entry.id))} className="delete-btn">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    </motion.button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="paragraph">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-[var(--primary-color)]" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                        Permissions
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {entry.permissions.map((perm, idx) => (
                          <span key={idx} className="px-3 py-1.5 bg-gray-50 text-[var(--color-overlay)] text-sm rounded-full border border-gray-200 hover:bg-gray-100 transition-colors">{perm}</span>
                        ))}
                      </div>
                    </div>
                    {entry.isAdmin && (
                      <div>
                        <h4 className="paragraph">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-[var(--primary-color)]" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                          IP Address
                        </h4>
                        <span className="font-mono text-sm bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 block">{entry.ipAddress}</span>
                      </div>
                    )}
                    <div>
                      <h4 className="paragraph">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-[var(--primary-color)]" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
                        Timestamp
                      </h4>
                      <span className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 block">{new Date(entry.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default UserRolePermissionManager;