import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

const DischargeModal = ({ isOpen, onClose, patient }) => {
  const [formData, setFormData] = useState({
    patientName: patient?.name || patient?.firstName || "",
    patientId: patient?.id || patient?.patientId || "",
    ward: patient?.ward || "",
    doctorName: "",
    dischargeDate: "",
    dischargeTime: "",
    actualLeaveDate: "",
    actualLeaveTime: "",
    doctorIncharge: "",
    sisterIncharge: "",
  });

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      patientName: patient?.name || patient?.firstName || "",
      patientId: patient?.id || patient?.patientId || "",
      ward: patient?.ward || "",
    }));
  }, [patient]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Discharge Data:", formData);
    onClose();
  };

  if (!isOpen) return null;

  // Field definitions for mapping
  const fields = [
    {
      name: "patientName",
      placeholder: "Patient Name",
      required: true,
      disabled: true,
      type: "text",
    },
    {
      name: "patientId",
      placeholder: "Patient ID",
      required: true,
      disabled: true,
      type: "text",
    },
    {
      name: "ward",
      placeholder: "Ward / Bed No.",
      required: true,
      disabled: true,
      type: "text",
    },
    {
      name: "doctorName",
      placeholder: "Doctor's Name",
      required: true,
      type: "text",
    },
    {
      name: "dischargeDate",
      placeholder: "Discharge Date",
      required: true,
      type: "date",
    },
    {
      name: "dischargeTime",
      placeholder: "Discharge Time",
      required: true,
      type: "time",
    },
    {
      name: "actualLeaveDate",
      placeholder: "Actual Leave Date",
      required: true,
      type: "date",
    },
    {
      name: "actualLeaveTime",
      placeholder: "Actual Leave Time",
      required: true,
      type: "time",
    },
    {
      name: "doctorIncharge",
      placeholder: "Doctor Incharge",
      required: true,
      type: "text",
    },
    {
      name: "sisterIncharge",
      placeholder: "Sister Incharge",
      required: true,
      type: "text",
    },
  ];

  // Minimal floating input
  const FloatingInput = ({
    name,
    value,
    type = "text",
    placeholder,
    required = false,
    disabled = false,
  }) => (
    <div className="floating-input relative">
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={handleChange}
        placeholder=" "
        required={required}
        className="peer input-field"
        disabled={disabled}
        autoComplete="off"
      />
      <label
        htmlFor={name}
        className="absolute left-3 top-[-0.6rem] text-xs text-[var(--primary-color)] bg-white px-1 z-10 transition-all duration-200 pointer-events-none"
      >
        {placeholder}
        {required && "*"}
      </label>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl p-6 shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
        >
          <X size={20} />
        </button>
        <h2 className="text-xl font-semibold mb-4">Patient Discharge Form</h2>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {fields.map((f) => (
            <FloatingInput
              key={f.name}
              name={f.name}
              placeholder={f.placeholder}
              value={formData[f.name]}
              required={f.required}
              disabled={f.disabled}
              type={f.type}
            />
          ))}
          <div className="col-span-2 flex justify-end mt-4">
            <button
              type="submit"
              className="bg-[var(--primary-color)] text-white px-6 py-2 rounded-md hover:bg-opacity-90"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DischargeModal;