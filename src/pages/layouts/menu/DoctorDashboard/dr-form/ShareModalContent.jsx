
// ------------------------------
// File: DrForm/ShareModalContent.jsx
// ------------------------------
import React from "react";
import { X, Globe, Printer } from "lucide-react";

const ShareModalContent = ({ onClose, prescriptions = [], patient = {} }) => (
  <div className="bg-white rounded-lg shadow-2xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto">
    <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-[#01D48C] to-[#0E1630] text-white">
      <h3 className="text-xl font-semibold">Prescription Preview</h3>
      <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><X size={24}/></button>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
      <div className="p-4 rounded-lg flex flex-col items-center">
        <div className="bg-white border border-[#222] rounded-lg shadow-lg overflow-hidden p-8">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h2 className="text-xl font-bold text-[#0E1630] mb-1">Dr. Sheetal S. Shelke</h2>
              <div className="text-xs text-gray-700 leading-tight"><div>MBBS, MD</div><div>Neurologist</div></div>
            </div>
            <img src="/logo.png" alt="AV Swasthya" className="h-10 w-auto" />
          </div>

          <div className="bg-gray-100 rounded px-4 py-2 mb-4 flex flex-wrap gap-4 items-center text-sm">
            <span><b>Name:</b> {patient?.name || "N/A"}</span>
            <span><b>Age:</b> {patient?.age || "N/A"}</span>
            <span><b>Gender:</b> {patient?.gender || "N/A"}</span>
            <span><b>Contact:</b> {patient?.phone || "N/A"}</span>
          </div>

          <div className="mb-4">
            <div className="text-[#0E1630] font-semibold mb-2">Prescription</div>
            <table className="w-full border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-2 py-1">Medicine</th>
                  <th className="border border-gray-300 px-2 py-1">Dosage</th>
                  <th className="border border-gray-300 px-2 py-1">Frequency</th>
                  <th className="border border-gray-300 px-2 py-1">Intake</th>
                  <th className="border border-gray-300 px-2 py-1">Duration</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.map((med, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 px-2 py-1">{med.drugName || "-"}</td>
                    <td className="border border-gray-300 px-2 py-1">{med.dosage || "-"} {med.dosageUnit || ""}</td>
                    <td className="border border-gray-300 px-2 py-1">{med.frequency || "-"}</td>
                    <td className="border border-gray-300 px-2 py-1">{med.intake || "-"}</td>
                    <td className="border border-gray-300 px-2 py-1">{med.duration ? `${med.duration} day(s)` : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>

      <div className="space-y-6">
        <h4 className="text-lg font-semibold text-[#0E1630]">Share Options</h4>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"><Globe size={16}/> Language</label>
          <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
            <option>English</option>
            <option>हिंदी (Hindi)</option>
            <option>मराठी (Marathi)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input type="email" placeholder="Enter patient's email" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg"><Globe size={16}/> WhatsApp</button>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg"><Globe size={16}/> Email</button>
          <button onClick={()=>window.print()} className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded-lg"><Printer size={16}/> Print</button>
        </div>
      </div>

    </div>
  </div>
);

export default ShareModalContent;