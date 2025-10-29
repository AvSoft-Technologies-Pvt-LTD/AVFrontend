import React, { useState } from "react";

const allTests = [
  "CBC", "LFT", "KFT", "Lipid Profile", "T3/T4/TSH", "Dengue", "Malaria",
  "X-Ray", "MRI", "CT Scan", "ECG", "2D Echo", "Mammography"
];
const allServices = [
  "Home Sample Collection", "Emergency Diagnostic Services",
  "Tele-Radiology Services", "Mobile Diagnostic Units"
];
const initialSettings = {
  centerName: "ABC Diagnostics",
  centerType: "Diagnostic Center",
  phone: "+91 9876543210",
  aadhaar: "1234-5678-9012",
  gender: "Male",
  dob: "01/01/1980",
  email: "abc.lab@email.com",
  regNumber: "REG123456",
  owner: "Dr. John Doe",
  license: "LIC987654",
  location: "Mumbai, India",
  notifications: true,
  onlineAppointments: true,
  availableTests: [
    "CBC", "KFT", "T3/T4/TSH", "Malaria", "MRI", "ECG", "Mammography"
  ],
  specialServices: [
    "Home Sample Collection", "Tele-Radiology Services"
  ],
  specify: ""
};

export default function LabDashboardSettings() {
  const [settings, setSettings] = useState(initialSettings);
  const [edit, setEdit] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleToggle = (field) => {
    if (!edit) return;
    setSettings(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleTestChange = (test) => {
    if (!edit) return;
    setSettings(prev => ({
      ...prev,
      availableTests: prev.availableTests.includes(test)
        ? prev.availableTests.filter(t => t !== test)
        : [...prev.availableTests, test]
    }));
  };

  const handleServiceChange = (service) => {
    if (!edit) return;
    setSettings(prev => ({
      ...prev,
      specialServices: prev.specialServices.includes(service)
        ? prev.specialServices.filter(s => s !== service)
        : [...prev.specialServices, service]
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
    } finally {
      setLoading(false);
      setEdit(false);
    }
  };

  const handleCancel = () => setEdit(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="h2-heading mb-1">Lab Settings</h2>
        <p className="text-gray-500 mb-6">Manage your lab settings and preferences</p>
        <div className="font-semibold text-lg mb-4 border-l-4 border-[var(--primary-color)] pl-3">Lab Details</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "Diagnostic Center Name", name: "centerName", disabled: !edit },
            { label: "Diagnostic Center Type", name: "centerType", disabled: !edit },
            { label: "Contact Phone", name: "phone", disabled: !edit },
            { label: "Aadhaar Number", name: "aadhaar", disabled: true },
            { label: "Gender", name: "gender", type: "select", disabled: !edit },
            { label: "Date of Birth", name: "dob", disabled: !edit, placeholder: "mm/dd/yyyy" },
            { label: "Email", name: "email", disabled: !edit },
            { label: "Registration Number", name: "regNumber", disabled: true },
            { label: "Owner's Full Name", name: "owner", disabled: !edit },
            { label: "License Number", name: "license", disabled: true },
            { label: "Location", name: "location", disabled: !edit }
          ].map((field) => (
            <div
              key={field.name}
              className="floating-input relative"
              data-placeholder={field.label}
            >
              {field.type === "select" ? (
                <select
                  className="input-field peer"
                  name={field.name}
                  value={settings[field.name]}
                  onChange={handleChange}
                  disabled={field.disabled}
                >
                  <option value="">Select Gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              ) : (
                <input
                  className="input-field peer"
                  name={field.name}
                  value={settings[field.name]}
                  onChange={handleChange}
                  disabled={field.disabled}
                  placeholder={field.placeholder || " "}
                  autoComplete="off"
                />
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="font-semibold mb-2">Available Tests</div>
            <div className="grid grid-cols-2 gap-2">
              {allTests.map(test => (
                <label key={test} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={settings.availableTests.includes(test)}
                    onChange={() => handleTestChange(test)}
                    disabled={!edit}
                  />
                  {test}
                </label>
              ))}
            </div>
          </div>
          <div>
            <div className="font-semibold mb-2">Special Services</div>
            <div className="flex flex-col gap-2">
              {allServices.map(service => (
                <label key={service} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={settings.specialServices.includes(service)}
                    onChange={() => handleServiceChange(service)}
                    disabled={!edit}
                  />
                  {service}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <div className="font-semibold text-lg mb-4 border-l-4 border-[var(--primary-color)] pl-3">Notifications</div>
        <div className="flex flex-col gap-6">
          {[{ label: "Enable Notifications", desc: "Receive alerts for important updates", field: "notifications" }].map(item => (
            <div className="flex items-center justify-between" key={item.field}>
              <div>
                <div className="font-medium">{item.label}</div>
                <div className="text-xs text-gray-500">{item.desc}</div>
              </div>
              <button
                type="button"
                className={`w-12 h-6 rounded-full transition-colors duration-200 flex items-center ${settings[item.field] ? "bg-[var(--accent-color)]" : "bg-gray-300"}`}
                onClick={() => handleToggle(item.field)}
              >
                <span className={`inline-block w-5 h-5 rounded-full bg-white shadow transform transition-transform duration-200 ${settings[item.field] ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-4 mt-6">
        {edit ? (
          <>
            <button
              className="relative group overflow-hidden px-6 py-2 rounded-md font-medium shadow-md bg-[var(--primary-color)] text-white border border-[var(--primary-color)] transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50"
              onClick={handleCancel}
              type="button"
              disabled={loading}
            >
              <span className="absolute inset-0 w-full h-full bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left z-0"></span>
              <span className="relative z-10 group-hover:text-[var(--primary-color)] transition-colors duration-300">Cancel</span>
            </button>
            <button
              className="relative group overflow-hidden px-8 py-2 rounded-md font-medium shadow-md bg-[var(--accent-color)] text-white transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              onClick={handleSave}
              type="button"
              disabled={loading}
            >
              <span className="absolute inset-0 w-full h-full bg-white opacity-10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-center"></span>
              <span className="relative z-10 flex items-center gap-2">
                {loading && (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.372 0 0 5.372 0 12h4z"></path>
                  </svg>
                )}
                {loading ? "Saving..." : "Save Changes"}
              </span>
            </button>
          </>
        ) : (
          <button
            className="relative group overflow-hidden px-8 py-2 rounded-md font-medium shadow-md bg-transparent border border-[var(--primary-color)] text-[var(--primary-color)] transition-all duration-300 ease-in-out"
            onClick={() => setEdit(true)}
            type="button"
          >
            <span className="absolute inset-0 w-full h-full bg-[var(--primary-color)] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-center"></span>
            <span className="relative z-10 group-hover:text-white transition-colors duration-300">Edit</span>
          </button>
        )}
      </div>
    </div>
  );
}