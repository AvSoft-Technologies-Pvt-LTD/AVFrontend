import React, { useState } from 'react';
import { FiUser, FiLock, FiBell, FiShield, FiDatabase, FiGlobe, FiX, FiCalendar, FiClock, FiSave, FiRefreshCw } from 'react-icons/fi';
const InputField = ({ label, type, placeholder, icon: Icon, value, onChange }) => (
  <div className="relative"><label className="block text-sm font-medium text-[var(--color-overlay)] mb-1">{label}</label><div className="relative">{Icon && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Icon className="h-5 w-5 text-gray-400" /></div>}<input type={type} placeholder={placeholder} value={value} onChange={onChange} className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-royal-blue-500 focus:border-royal-blue-500 transition-all duration-200 ${Icon ? 'pl-10' : ''}`} /></div></div>
);
const Modal = ({ isOpen, onClose, title, children }) => !isOpen ? null : (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"><div className="bg-[var(--color-surface)] rounded-xl shadow-lg w-full max-w-2xl mx-4 transform transition-all duration-300 ease-in-out"><div className="flex items-center justify-between p-6 border-b"><h3 className="text-xl font-bold text-[var(--color-overlay)]">{title}</h3><button onClick={onClose} className="text-gray-500 hover:text-[var(--color-overlay)] transition-colors duration-200"><FiX className="w-6 h-6" /></button></div><div className="p-6">{children}</div></div></div>
);
const MaintenanceModal = ({ isOpen, onClose, onSave }) => {
  const [maintenance, setMaintenance] = useState({ startDate: '', startTime: '', duration: '1', type: 'scheduled', description: '', affectedServices: [] });
  const handleSubmit = (e) => { e.preventDefault(); onSave(maintenance); onClose(); };
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="System Maintenance Configuration">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><label className="block text-sm font-medium text-[var(--color-overlay)] mb-1">Start Date</label><input type="date" value={maintenance.startDate} onChange={(e) => setMaintenance(prev => ({ ...prev, startDate: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-royal-blue-500 focus:border-royal-blue-500" required /></div>
          <div><label className="block text-sm font-medium text-[var(--color-overlay)] mb-1">Start Time</label><input type="time" value={maintenance.startTime} onChange={(e) => setMaintenance(prev => ({ ...prev, startTime: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-royal-blue-500 focus:border-royal-blue-500" required /></div>
        </div>
        <div><label className="block text-sm font-medium text-[var(--color-overlay)] mb-1">Duration (hours)</label><select value={maintenance.duration} onChange={(e) => setMaintenance(prev => ({ ...prev, duration: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-royal-blue-500 focus:border-royal-blue-500">{[1, 2, 4, 6, 8, 12, 24].map(hours => <option key={hours} value={hours}>{hours} hour{hours !== 1 ? 's' : ''}</option>)}</select></div>
        <div><label className="block text-sm font-medium text-[var(--color-overlay)] mb-1">Maintenance Type</label><select value={maintenance.type} onChange={(e) => setMaintenance(prev => ({ ...prev, type: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-royal-blue-500 focus:border-royal-blue-500"><option value="scheduled">Scheduled Maintenance</option><option value="emergency">Emergency Maintenance</option><option value="upgrade">System Upgrade</option></select></div>
        <div><label className="block text-sm font-medium text-[var(--color-overlay)] mb-1">Description</label><textarea value={maintenance.description} onChange={(e) => setMaintenance(prev => ({ ...prev, description: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-royal-blue-500 focus:border-royal-blue-500" rows="3" placeholder="Describe the maintenance work..." required /></div>
        <div><label className="block text-sm font-medium text-[var(--color-overlay)] mb-1">Affected Services</label><div className="space-y-2">{['User Management', 'Authentication', 'Database', 'API Services', 'File Storage'].map(service => (<label key={service} className="flex items-center space-x-2"><input type="checkbox" checked={maintenance.affectedServices.includes(service)} onChange={(e) => {const services = e.target.checked ? [...maintenance.affectedServices, service] : maintenance.affectedServices.filter(s => s !== service);setMaintenance(prev => ({ ...prev, affectedServices: services }));}} className="rounded text-royal-blue-600 focus:ring-royal-blue-500" /><span className="text-sm text-[var(--color-overlay)]">{service}</span></label>))}</div></div>
        <div className="flex justify-end space-x-4"><button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-[var(--color-overlay)] hover:text-[var(--color-overlay)]">Cancel</button><button type="submit" className="px-4 py-2 bg-royal-blue-600 text-[var(--color-surface)] rounded-lg hover:bg-royal-blue-700 transition-colors duration-200">Schedule Maintenance</button></div>
      </form>
    </Modal>
  );
};
const BackupModal = ({ isOpen, onClose, onSave }) => {
  const [backup, setBackup] = useState({ frequency: 'daily', retention: '30', storage: 'local', compression: true, encryption: true, schedule: { time: '02:00', days: ['monday', 'wednesday', 'friday'] } });
  const handleSubmit = (e) => { e.preventDefault(); onSave(backup); onClose(); };
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Backup Configuration">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div><label className="block text-sm font-medium text-[var(--color-overlay)] mb-1">Backup Frequency</label><select value={backup.frequency} onChange={(e) => setBackup(prev => ({ ...prev, frequency: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-royal-blue-500 focus:border-royal-blue-500"><option value="hourly">Hourly</option><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option></select></div>
        <div><label className="block text-sm font-medium text-[var(--color-overlay)] mb-1">Retention Period (days)</label><select value={backup.retention} onChange={(e) => setBackup(prev => ({ ...prev, retention: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-royal-blue-500 focus:border-royal-blue-500"><option value="7">7 days</option><option value="30">30 days</option><option value="90">90 days</option><option value="365">1 year</option></select></div>
        <div><label className="block text-sm font-medium text-[var(--color-overlay)] mb-1">Storage Location</label><select value={backup.storage} onChange={(e) => setBackup(prev => ({ ...prev, storage: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-royal-blue-500 focus:border-royal-blue-500"><option value="local">Local Storage</option><option value="s3">Amazon S3</option><option value="gcs">Google Cloud Storage</option><option value="azure">Azure Blob Storage</option></select></div>
        <div className="space-y-4">
          <label className="flex items-center space-x-2"><input type="checkbox" checked={backup.compression} onChange={(e) => setBackup(prev => ({ ...prev, compression: e.target.checked }))} className="rounded text-royal-blue-600 focus:ring-royal-blue-500" /><span className="text-sm text-[var(--color-overlay)]">Enable Compression</span></label>
          <label className="flex items-center space-x-2"><input type="checkbox" checked={backup.encryption} onChange={(e) => setBackup(prev => ({ ...prev, encryption: e.target.checked }))} className="rounded text-royal-blue-600 focus:ring-royal-blue-500" /><span className="text-sm text-[var(--color-overlay)]">Enable Encryption</span></label>
        </div>
        <div><label className="block text-sm font-medium text-[var(--color-overlay)] mb-1">Backup Schedule</label><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="block text-xs text-gray-500 mb-1">Time</label><input type="time" value={backup.schedule.time} onChange={(e) => setBackup(prev => ({ ...prev, schedule: { ...prev.schedule, time: e.target.value } }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-royal-blue-500 focus:border-royal-blue-500" /></div><div><label className="block text-xs text-gray-500 mb-1">Days</label><div className="flex flex-wrap gap-2">{['monday', 'wednesday', 'friday'].map(day => (<label key={day} className="flex items-center space-x-1"><input type="checkbox" checked={backup.schedule.days.includes(day)} onChange={(e) => {const days = e.target.checked ? [...backup.schedule.days, day] : backup.schedule.days.filter(d => d !== day);setBackup(prev => ({ ...prev, schedule: { ...prev.schedule, days } }));}} className="rounded text-royal-blue-600 focus:ring-royal-blue-500" /><span className="text-sm text-[var(--color-overlay)] capitalize">{day}</span></label>))}</div></div></div></div>
        <div className="flex justify-end space-x-4"><button type="button" onClick={onClose} className="delete-btn">Cancel</button><button type="submit" className="px-4 py-2 bg-royal-blue-600 text-[var(--color-surface)] rounded-lg hover:bg-royal-blue-700 transition-colors duration-200">Save Backup Configuration</button></div>
      </form>
    </Modal>
  );
};
const SessionModal = ({ isOpen, onClose }) => {
  const [sessions, setSessions] = useState([{ id: 1, device: 'Chrome on Windows', location: 'New York, USA', lastActive: '2024-03-15 14:30', current: true }, { id: 2, device: 'Safari on iPhone', location: 'London, UK', lastActive: '2024-03-15 12:15', current: false }, { id: 3, device: 'Firefox on Mac', location: 'Tokyo, Japan', lastActive: '2024-03-14 23:45', current: false }]);
  const handleTerminateSession = (sessionId) => { setSessions(prev => prev.filter(session => session.id !== sessionId)); };
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Active Sessions">
      <div className="space-y-4">{sessions.map(session => (<div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"><div><div className="flex items-center space-x-2"><span className="font-medium text-[var(--color-overlay)]">{session.device}</span>{session.current && <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">Current</span>}</div><div className="text-sm text-gray-500 mt-1"><p>{session.location}</p><p>Last active: {session.lastActive}</p></div></div>{!session.current && <button onClick={() => handleTerminateSession(session.id)} className="px-3 py-1 text-sm text-red-600 hover:text-red-700">Terminate</button>}</div>))}</div>
    </Modal>
  );
};
const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [profile, setProfile] = useState({ fullName: '', email: '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [security, setSecurity] = useState({ twoFactorAuth: false });
  const [notifications, setNotifications] = useState({ email: false, sms: false, push: false });
  const [system, setSystem] = useState({ maintenanceMode: false, backupEnabled: false });
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const handleProfileChange = (e) => { const { name, value } = e.target; setProfile(prev => ({ ...prev, [name]: value })); };
  const handlePasswordChange = (e) => { const { name, value } = e.target; setPasswords(prev => ({ ...prev, [name]: value })); };
  const handleSecurityToggle = (setting) => { setSecurity(prev => ({ ...prev, [setting]: !prev[setting] })); };
  const handleNotificationToggle = (type) => { setNotifications(prev => ({ ...prev, [type]: !prev[type] })); };
  const handleSystemToggle = (setting) => { setSystem(prev => ({ ...prev, [setting]: !prev[setting] })); };
  const handleSaveProfile = () => { console.log('Saving profile:', profile); alert('Profile saved successfully!'); };
  const handleChangePassword = () => { if (passwords.newPassword !== passwords.confirmPassword) { alert('New passwords do not match!'); return; } console.log('Changing password:', passwords); alert('Password changed successfully!'); setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' }); };
  const handleMaintenanceSave = (config) => { console.log('Saving maintenance configuration:', config); alert('Maintenance schedule saved successfully!'); };
  const handleBackupSave = (config) => { console.log('Saving backup configuration:', config); alert('Backup configuration saved successfully!'); };
  const handleViewSessions = () => { console.log('Viewing sessions'); alert('Opening session management...'); };
  const handleSystemMaintenance = () => { console.log('Configuring system maintenance'); alert('Opening maintenance configuration...'); };
  const handleBackupSettings = () => { console.log('Managing backup settings'); alert('Opening backup configuration...'); };
  const tabs = [{ id: 'general', label: 'General', icon: FiUser }, { id: 'security', label: 'Security', icon: FiShield }, { id: 'notifications', label: 'Notifications', icon: FiBell }, { id: 'system', label: 'System', icon: FiDatabase }];
  return (
    <div className="p-8 bg-[var(--color-surface)]rounded-xl shadow-lg mt-4">
      <div className="mb-8"><h1 className="h3-heading mb-2">Settings</h1><p className="paragraph">Manage and configure system-wide settings</p></div>
      <div className="border-b border-gray-200 mb-8"><div className="flex space-x-8">{tabs.map(tab => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center pb-4 px-2 text-sm font-medium transition-all duration-200 ${activeTab === tab.id ? 'text-[var(--accent-color)] border-b-2 border-[var(--accent-color)]' : 'text-gray-500 hover:text-[var(--color-overlay)]'}`}><tab.icon className="w-5 h-5 mr-2" />{tab.label}</button>))}</div></div>
      {activeTab === 'general' && (
        <div className="space-y-8">
          <div className="bg-[var(--color-surface)] p-6 rounded-xl shadow-sm">
            <h2 className="h4-heading mb-6 flex items-center"><FiUser className="mr-2" /> Profile Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="Full Name" type="text" placeholder="Super Admin Name" icon={FiUser} name="fullName" value={profile.fullName} onChange={handleProfileChange} />
              <InputField label="Email Address" type="email" placeholder="support@example.com" icon={FiGlobe} name="email" value={profile.email} onChange={handleProfileChange} />
            </div>
            <div className="mt-6"><button onClick={handleSaveProfile} className="btn btn-primary">Save Profile</button></div>
          </div>
          <div className="bg-[var(--color-surface)] p-6 rounded-xl shadow-sm">
            <h2 className="h4-heading mb-6 flex items-center"><FiLock className="mr-2" /> Change Password</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="Current Password" type="password" placeholder="••••••••" icon={FiLock} name="currentPassword" value={passwords.currentPassword} onChange={handlePasswordChange} />
              <InputField label="New Password" type="password" placeholder="••••••••" icon={FiLock} name="newPassword" value={passwords.newPassword} onChange={handlePasswordChange} />
              <div className="md:col-span-2"><InputField label="Confirm New Password" type="password" placeholder="••••••••" icon={FiLock} name="confirmPassword" value={passwords.confirmPassword} onChange={handlePasswordChange} /></div>
            </div>
            <div className="mt-6"><button onClick={handleChangePassword} className="btn btn-primary">Change Password</button></div>
          </div>
        </div>
      )}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="bg-[var(--color-surface)] p-6 rounded-xl shadow-sm">
            <h2 className="h4-heading mb-6 flex items-center"><FiShield className="mr-2" /> Security Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                <div><h3 className="paragraph">Two-Factor Authentication</h3><p className="text-sm text-gray-500">Add an extra layer of security to your account</p></div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={security.twoFactorAuth} onChange={() => handleSecurityToggle('twoFactorAuth')} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:ring-royal-blue-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--color-surface)] after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-royal-blue-600" />
                </label>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                <div><h3 className="paragraph">Session Management</h3><p className="text-sm text-gray-500">Manage active sessions and login history</p></div>
                <button onClick={() => setIsSessionModalOpen(true)} className="edit-btn">View Sessions</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {activeTab === 'notifications' && (
        <div className="bg-[var(--color-surface)] p-6 rounded-xl shadow-sm">
          <h2 className="h4-heading mb-6 flex items-center"><FiBell className="mr-2" /> Notification Preferences</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[{ label: 'Email Notifications', description: 'Receive updates via email', key: 'email' }, { label: 'SMS Notifications', description: 'Get alerts on your phone', key: 'sms' }, { label: 'Push Notifications', description: 'Real-time browser notifications', key: 'push' }].map((item) => (
              <div key={item.key} className="flex flex-col bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm paragraph">{item.label}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={notifications[item.key]} onChange={() => handleNotificationToggle(item.key)} />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:ring-royal-blue-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--color-surface)] after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-royal-blue-600" />
                  </label>
                </div>
                <p className="text-xs text-gray-500">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {activeTab === 'system' && (
        <div className="bg-[var(--color-surface)] p-6 rounded-xl shadow-sm">
          <h2 className="h4-heading mb-6 flex items-center"><FiDatabase className="mr-2" /> System Configuration</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
              <div><h3 className="paragraph">Backup Settings</h3><p className="text-sm paragraph">Manage system backups and recovery points</p></div>
              <button onClick={() => setIsBackupModalOpen(true)} className=" edit-btn">Manage</button>
            </div>
          </div>
        </div>
      )}
      <BackupModal isOpen={isBackupModalOpen} onClose={() => setIsBackupModalOpen(false)} onSave={handleBackupSave} />
      <SessionModal isOpen={isSessionModalOpen} onClose={() => setIsSessionModalOpen(false)} />
    </div>
  );
};
export default Settings;
