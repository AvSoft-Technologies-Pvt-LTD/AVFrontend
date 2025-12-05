

import React from "react";
import SignatureCanvas from "react-signature-canvas";
import { Save, X } from "lucide-react";
import { uploadDoctorSignature } from "../../../../../utils/masterService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { usePatientContext } from "../../../../../context-api/PatientContext";

const SignatureArea = ({ signaturePadRef, doctorSignature, setDoctorSignature, doctorId = 1 }) => {
  const { patient, activeTab } = usePatientContext();

  const handleSignatureUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setDoctorSignature(file);
      const url = URL.createObjectURL(file);
      localStorage.setItem("doctorSignature", url);
    }
  };

  const handleSaveSignature = () => {
    if (signaturePadRef.current && !signaturePadRef.current.isEmpty()) {
      const dataURL = signaturePadRef.current.toDataURL();
      return fetch(dataURL)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], "signature.png", { type: "image/png" });
          setDoctorSignature(file);
          localStorage.setItem("doctorSignature", dataURL);
          return uploadNow(file); // Return the promise
        });
    }
    if (doctorSignature) {
      return uploadNow(doctorSignature); // Return the promise
    }
    toast.warning("⚠ No signature found!");
    return Promise.reject("No signature found");
  };

  const uploadNow = async (file) => {
    try {
      // Convert file to base64
      const base64Signature = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.readAsDataURL(file);
      });
      const payload = {
        contextId:patient?.id,
        patientId: patient?.patientId || 0,
        doctorId: doctorId,
        context: activeTab?.toUpperCase() || "IPD",
        digitalSignature: base64Signature,
      };
      const res = await uploadDoctorSignature(payload);
      console.log("✅ Uploaded successfully:", res.data);
      toast.success("✅ Signature uploaded successfully!");
      return res.data; // Return the response data
    } catch (error) {
      console.error("❌ Upload failed:", error);
      toast.error("❌ Upload Failed");
      throw error; // Re-throw the error
    }
  };

  const handleClearSignature = () => {
    signaturePadRef.current?.clear();
    setDoctorSignature(null);
    localStorage.removeItem("doctorSignature");
    toast.info("🧹 Signature cleared");
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-8 animate-fadeIn">
      <ToastContainer />
      <h3 className="text-base sm:text-lg font-medium sm:font-semibold mb-4">
        Digital Signature
      </h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Upload Section */}
        <div className="space-y-3 sm:space-y-4">
          <label className="block text-[10px] sm:text-sm font-medium text-[var(--primary-color)] mb-2">
            Upload Signature:
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleSignatureUpload}
            className="input-field"
          />
          {doctorSignature && (
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <span className="text-sm font-medium text-blue-800">Preview:</span>
              <img
                src={
                  typeof doctorSignature === "string"
                    ? doctorSignature
                    : URL.createObjectURL(doctorSignature)
                }
                alt="Doctor Signature"
                className="h-12 border border-blue-300 rounded shadow-sm"
              />
            </div>
          )}
        </div>
        {/* Canvas Section */}
        <div className="space-y-3 sm:space-y-4">
          <label className="block text-[10px] sm:text-sm font-medium text-[var(--primary-color)]">
            Or Draw Signature:
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 sm:p-4">
            <SignatureCanvas
              ref={signaturePadRef}
              canvasProps={{
                width: 400,
                height: 100,
                className: "w-full bg-white",
              }}
            />
          </div>
          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={handleSaveSignature}
              className="flex items-center gap-2 px-3 py-2 bg-[var(--primary-color)] text-white rounded-lg"
            >
              <Save /> Save
            </button>
            <button
              onClick={handleClearSignature}
              className="flex items-center gap-2 px-3 py-2 bg-gray-500 text-white rounded-lg"
            >
              <X /> Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignatureArea;
