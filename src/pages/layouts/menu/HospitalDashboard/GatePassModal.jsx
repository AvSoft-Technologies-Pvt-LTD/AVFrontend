import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const GatePassModal = ({ isOpen, onClose, patient }) => {
  const [type, setType] = useState("visitor");

  // Detect if patient is IPD (by type or presence of admissionDate/wardType)
  const isIPD =
    patient?.type?.toLowerCase() === "ipd" ||
    !!patient?.admissionDate ||
    !!patient?.wardType;

  // Compose ward string as "WardType-WardNo-BedNo" for IPD, else use patient.ward
  const getWardString = (p) => {
    // If all three fields exist, join them
    if (isIPD && p?.wardType && p?.wardNo && p?.bedNo) {
      return [p.wardType, p.wardNo, p.bedNo].join("-");
    }
    // If wardType is already in "ICU-A-5" format, just use it
    if (
      isIPD &&
      typeof p?.wardType === "string" &&
      p.wardType.match(/-/) &&
      !p.wardNo &&
      !p.bedNo
    ) {
      return p.wardType;
    }
    // If only wardType exists, use it
    if (isIPD && p?.wardType) {
      return p.wardType;
    }
    // Fallback to ward field
    return p?.ward || "";
  };

  const [formData, setFormData] = useState({
    patientName: patient?.name || patient?.firstName || "",
    patientId: patient?.id || patient?.patientId || "",
    doa: isIPD ? patient?.admissionDate || patient?.doa || "" : "",
    department: patient?.department || "",
    ward: getWardString(patient),
    validity: "",
    extendedDate: "",
    visitorName: "",
    relationToPatient: "",
    idProofType: "",
    idProofNumber: "",
    timeSlot: "",
    shift: "",
  });

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      patientName: patient?.name || patient?.firstName || "",
      patientId: patient?.id || patient?.patientId || "",
      doa: isIPD ? patient?.admissionDate || patient?.doa || "" : "",
      department: patient?.department || "",
      ward: getWardString(patient),
    }));
    // eslint-disable-next-line
  }, [patient]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Gate Pass Data:", { type, ...formData });
    onClose();
  };

  if (!isOpen) return null;

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

  const DateFloatingInput = ({
    name,
    value,
    placeholder,
    required = false,
    disabled = false,
  }) => (
    <div className="floating-input relative">
      <input
        type="date"
        id={name}
        name={name}
        value={value}
        onChange={handleChange}
        placeholder=" "
        required={required}
        className="peer input-field"
        disabled={disabled}
      />
      <label
        htmlFor={name}
        className="absolute left-3 top-4 text-base text-gray-400 transition-all duration-200 pointer-events-none 
        peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 
        peer-focus:top-[-0.6rem] peer-focus:text-xs peer-focus:text-[var(--primary-color)]
        peer-not-placeholder-shown:top-[-0.6rem] peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:text-[var(--primary-color)]
        bg-white px-1 z-10"
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
        <h2 className="text-xl font-semibold mb-4">Gate Pass Entry</h2>

        <div className="flex gap-4 mb-6">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="type"
              value="visitor"
              checked={type === "visitor"}
              onChange={() => setType("visitor")}
            />
            Visitor (Just Visits)
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="type"
              value="stay"
              checked={type === "stay"}
              onChange={() => setType("stay")}
            />
            Attender (Full Day)
          </label>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <FloatingInput
            name="patientName"
            placeholder="Patient Name"
            value={formData.patientName}
            required
            disabled
          />
          <FloatingInput
            name="patientId"
            placeholder="Patient ID"
            value={formData.patientId}
            required
            disabled
          />
          <DateFloatingInput
            name="doa"
            placeholder="D.O.A"
            value={formData.doa}
            required={isIPD}
            disabled={isIPD}
          />
          <FloatingInput
            name="department"
            placeholder="Department"
            value={formData.department}
            disabled={isIPD}
          />
          <FloatingInput
            name="ward"
            placeholder="Ward / Bed No."
            value={formData.ward}
            disabled
          />

          {/* Common fields */}
          <FloatingInput
            name="visitorName"
            placeholder={type === "stay" ? "Attendant Name" : "Visitor Name"}
            value={formData.visitorName}
            required
          />
          <FloatingInput
            name="relationToPatient"
            placeholder="Relation to Patient"
            value={formData.relationToPatient}
            required
          />
          <FloatingInput
            name="idProofType"
            placeholder="ID Proof Type (e.g., Aadhaar)"
            value={formData.idProofType}
            required
          />
          <FloatingInput
            name="idProofNumber"
            placeholder="ID Proof Number"
            value={formData.idProofNumber}
            required
          />

          {/* Visitor-specific field */}
          {type === "visitor" && (
            <FloatingInput
              name="timeSlot"
              placeholder="Visiting Time Slot (e.g., 4PM - 5PM)"
              value={formData.timeSlot}
              required
            />
          )}

          {/* Attender-specific field */}
          {type === "stay" && (
            <div className="floating-input relative">
              <select
                id="shift"
                name="shift"
                value={formData.shift}
                onChange={handleChange}
                required
                className="peer input-field"
              >
                <option value="" disabled>
                  Select Shift
                </option>
                <option value="Morning">Morning</option>
                <option value="Afternoon">Afternoon</option>
                <option value="Evening">Evening</option>
              </select>
              <label
                htmlFor="shift"
                className="absolute left-3 top-4 text-base text-gray-400 transition-all duration-200 pointer-events-none 
                peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 
                peer-focus:top-[-0.6rem] peer-focus:text-xs peer-focus:text-[var(--primary-color)]
                peer-not-placeholder-shown:top-[-0.6rem] peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:text-[var(--primary-color)]
                bg-white px-1 z-10"
              >
                Shift*
              </label>
            </div>
          )}

          <DateFloatingInput
            name="validity"
            placeholder="Valid Upto"
            value={formData.validity}
            required
          />
          <DateFloatingInput
            name="extendedDate"
            placeholder="Extended Upto (Optional)"
            value={formData.extendedDate}
          />

          <div className="col-span-2 flex justify-end mt-4">
            <button
              type="submit"
              className="bg-[var(--primary-color)] text-white px-6 py-2 rounded-md hover:bg-opacity-90"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GatePassModal;