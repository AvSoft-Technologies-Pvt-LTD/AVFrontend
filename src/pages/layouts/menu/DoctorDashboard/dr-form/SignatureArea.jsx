// ------------------------------
// File: DrForm/SignatureArea.jsx
// ------------------------------
import React from "react";
import SignatureCanvas from "react-signature-canvas";
import { Save, X } from "lucide-react";

const SignatureArea = ({ signaturePadRef, doctorSignature, setDoctorSignature }) => {
  const handleSignatureUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ({ target }) => {
        if (target?.result) {
          setDoctorSignature(target.result);
          localStorage.setItem("doctorSignature", target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearSignature = () => {
    if (signaturePadRef.current) signaturePadRef.current.clear();
    setDoctorSignature(null);
    localStorage.removeItem("doctorSignature");
  };

  const handleSaveSignature = () => {
    if (signaturePadRef.current) {
      const signatureData = signaturePadRef.current.toDataURL();
      setDoctorSignature(signatureData);
      localStorage.setItem("doctorSignature", signatureData);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-8 animate-fadeIn">
      <h3 className="text-base sm:text-lg font-medium sm:font-semibold mb-4">Digital Signature</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <div className="space-y-3 sm:space-y-4">
          <label className="block text-[10px] sm:text-sm font-medium text-[var(--primary-color)] mb-2">Upload Signature:</label>
          <input type="file" accept="image/*" onChange={handleSignatureUpload} className="input-field" />
          {doctorSignature && (
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <span className="text-sm font-medium text-blue-800">Preview:</span>
              <img src={doctorSignature} alt="Doctor's Signature" className="h-12 border border-blue-300 rounded shadow-sm" />
            </div>
          )}
        </div>

        <div className="space-y-3 sm:space-y-4">
          <label className="block text-[10px] sm:text-sm font-medium text-[var(--primary-color)]">Or Draw Signature:</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 sm:p-4">
            <SignatureCanvas ref={signaturePadRef} canvasProps={{ width: 400, height: 100, className: "w-full bg-white" }} />
          </div>
          <div className="flex gap-2 sm:gap-3">
            <button onClick={handleSaveSignature} className="flex items-center gap-2 px-3 py-2 bg-[var(--primary-color)] text-white rounded-lg"><Save/> Save</button>
            <button onClick={handleClearSignature} className="flex items-center gap-2 px-3 py-2 bg-gray-500 text-white rounded-lg"><X/> Clear</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignatureArea;