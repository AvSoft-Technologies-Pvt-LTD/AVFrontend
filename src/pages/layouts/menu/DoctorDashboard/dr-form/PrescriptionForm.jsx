
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import {
  Pill,
  Save,
  Printer,
  Plus,
  Trash2,
  Edit,
  Check,
  X,
  Share2,
} from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getDosageUnits,
  getFrequencies,
  getIntakes,
  searchMedicinesByName,
  createDoctorPrescription,
  updateDoctorPrescription,
  deleteDoctorPrescription,
} from "../../../../../utils/masterService";
import { usePatientContext } from "../../../../../context-api/PatientContext";

const defaultMedicine = {
  drugName: "",
  form: "",
  strength: "",
  dosage: 1,
  dosageUnit: "",
  dosageUnitId: 0,
  frequency: "",
  frequencyId: 0,
  intake: "",
  intakeId: 0,
  duration: 1,
  medicineId: 0,
};

const PrescriptionForm = ({
  data,
  onSave,
  onPrint,
  patient,
  patientName,
  gender,
  age,
  email: propEmail,
  phone: propPhone,
  address,
  showShareModal,
  setShowShareModal,
  doctorName,
  hospitalName,
  ptemail,
  drEmail,
  diagnosis,
  type,
  doctorId: doctorIdFromProps,
}) => {
  const { activeTab, patients } = usePatientContext();
  const doctorIdFromRedux = useSelector((state) => state.auth.doctorId);
  const [prescriptions, setPrescriptions] = useState(
    data?.prescriptions?.length
      ? data.prescriptions
      : [{ ...defaultMedicine, drugName: "" }]
  );
  const [drugSuggestions, setDrugSuggestions] = useState([]);
  const [activeInputIndex, setActiveInputIndex] = useState(null);
  const [isSaved, setIsSaved] = useState(!!data?.id);
  const [prescriptionId, setPrescriptionId] = useState(data?.id || null);
  const [isEdit, setIsEdit] = useState(!data?.id);
  const [capturedImage, setCapturedImage] = useState(null);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dosageUnits, setDosageUnits] = useState([]);
  const [frequencies, setFrequencies] = useState([]);
  const [intakes, setIntakes] = useState([]);
  const canvasRef = useRef(null);

  useEffect(() => {
    setEmail(propEmail || patient?.email || "");
    setPhone(propPhone || patient?.phone || patient?.mobileNo || "");
  }, [propEmail, propPhone, patient]);

  useEffect(() => {
    const fetchDosageUnits = async () => {
      try {
        const response = await getDosageUnits();
        setDosageUnits(response.data);
      } catch (error) {
        console.error("Failed to fetch dosage units:", error);
        toast.error("Failed to load dosage units. Please try again later.", {
          position: "top-right",
          autoClose: 2000,
        });
      }
    };
    const fetchFrequencies = async () => {
      try {
        const response = await getFrequencies();
        setFrequencies(response.data);
      } catch (error) {
        console.error("Failed to fetch frequencies:", error);
        toast.error("Failed to load frequencies. Please try again later.", {
          position: "top-right",
          autoClose: 2000,
        });
      }
    };
    const fetchIntakes = async () => {
      try {
        const response = await getIntakes();
        setIntakes(response.data);
      } catch (error) {
        console.error("Failed to fetch intakes:", error);
        toast.error("Failed to load intakes. Please try again later.", {
          position: "top-right",
          autoClose: 2000,
        });
      }
    };
    fetchDosageUnits();
    fetchFrequencies();
    fetchIntakes();
  }, []);

  const handleChange = (i, field, val) => {
    setPrescriptions((prev) =>
      prev.map((p, idx) => (idx === i ? { ...p, [field]: val } : p))
    );
  };

  const addPrescription = () => {
    setPrescriptions((prev) => [...prev, { ...defaultMedicine, drugName: "" }]);
  };

  const removePrescription = (i) => {
    if (prescriptions.length > 1) {
      setPrescriptions((prev) => prev.filter((_, idx) => idx !== i));
    } else {
      toast.warning("At least one prescription is required.", {
        position: "top-right",
        autoClose: 2000,
      });
    }
  };

  const fetchDrugSuggestions = async (query) => {
    if (query.length < 2) {
      setDrugSuggestions([]);
      return;
    }
    try {
      const response = await searchMedicinesByName(query);
      const drugs = response.data;
      setDrugSuggestions(
        drugs.filter((drug) =>
          drug.name.toLowerCase().includes(query.toLowerCase())
        )
      );
    } catch (error) {
      console.error("Failed to fetch drug suggestions:", error);
      toast.error("Failed to fetch drug suggestions. Please try again later.", {
        position: "top-right",
        autoClose: 2000,
      });
    }
  };

  const handleSave = async () => {
    // Filter out medicines with medicineId: 0 if backend ignores them
    const medicines = prescriptions.map((med) => ({
      medicineId: med.medicineId || 0,
      dosage: med.dosage.toString(),
      duration: med.duration.toString(),
      dosageUnitId: med.dosageUnitId || 0,
      frequencyId: med.frequencyId || 0,
      intakeId: med.intakeId || 0,
    }));
    console.log("Medicines payload:", medicines); // Debugging
    const payload = {
      patientId: patient?.patientId,
      doctorId: doctorIdFromRedux || doctorIdFromProps || 1,
      context: (activeTab || "IPD").toUpperCase(),
      medicines,
    };
    try {
      const response = await createDoctorPrescription(payload);
      if (response.status >= 200 && response.status < 300) {
        setIsSaved(true);
        setIsEdit(false);
        setPrescriptionId(response.data.prescriptionId);
        if (onSave) {
          onSave("prescription", { prescriptions, id: response.data.prescriptionId });
        }
        toast.success("✅ Prescription saved successfully!", {
          position: "top-right",
          autoClose: 2000,
          closeOnClick: true,
        });
      } else {
        throw new Error(`API failed: ${response.status}`);
      }
    } catch (error) {
      console.error("API Error:", error);
      toast.error(`❌ ${error.message}`, {
        position: "top-right",
        autoClose: 2000,
        closeOnClick: true,
      });
    }
  };

  const handleUpdate = async () => {
    if (!prescriptionId) {
      toast.error("❌ Prescription ID is missing.", {
        position: "top-right",
        autoClose: 2000,
        closeOnClick: true,
      });
      return;
    }
    const medicines = prescriptions.map((med) => ({
      medicineId: med.medicineId || 0,
      dosage: med.dosage.toString(),
      duration: med.duration.toString(),
      dosageUnitId: med.dosageUnitId || 0,
      frequencyId: med.frequencyId || 0,
      intakeId: med.intakeId || 0,
    }));
    console.log("Medicines payload:", medicines); // Debugging
    const payload = {
      patientId: patient?.id || 1,
      doctorId: doctorIdFromRedux || doctorIdFromProps || 1,
      context: (activeTab || "OPD").toUpperCase(),
      medicines,
    };
    try {
      const response = await updateDoctorPrescription(prescriptionId, payload);
      if (response.status >= 200 && response.status < 300) {
        setIsEdit(false);
        if (onSave) {
          onSave("prescription", { prescriptions, id: prescriptionId });
        }
        toast.success("✅ Prescription updated successfully!", {
          position: "top-right",
          autoClose: 2000,
          closeOnClick: true,
        });
      } else {
        throw new Error(`API failed: ${response.status}`);
      }
    } catch (error) {
      console.error("API Error:", error);
      toast.error(`❌ ${error.message}`, {
        position: "top-right",
        autoClose: 2000,
        closeOnClick: true,
      });
    }
  };

  const handleDelete = async () => {
    if (!prescriptionId) {
      toast.error("❌ Prescription ID is missing.", {
        position: "top-right",
        autoClose: 2000,
        closeOnClick: true,
      });
      return;
    }
    try {
      const response = await deleteDoctorPrescription(prescriptionId);
      if (response.status >= 200 && response.status < 300) {
        setIsSaved(false);
        setPrescriptionId(null);
        setPrescriptions([{ ...defaultMedicine, drugName: "" }]);
        if (onSave) {
          onSave("prescription", { prescriptions: [], id: null });
        }
        toast.success("✅ Prescription deleted successfully!", {
          position: "top-right",
          autoClose: 2000,
          closeOnClick: true,
        });
      } else {
        throw new Error(`API failed: ${response.status}`);
      }
    } catch (error) {
      console.error("API Error:", error);
      toast.error(`❌ ${error.message}`, {
        position: "top-right",
        autoClose: 2000,
        closeOnClick: true,
      });
    }
  };

  const generateWhatsAppMessage = () => {
    let message = `*Prescription from ${hospitalName || "AV Hospital"}*\n`;
    message += `*Patient:* ${patientName || patient?.name || "---"}\n`;
    message += `*Doctor:* ${doctorName || "Dr. Kavya Patil"}\n`;
    message += `*Date:* ${new Date().toLocaleDateString()}\n\n`;
    message += `*Prescribed Medicines:*\n`;
    prescriptions.forEach((med, index) => {
      message += `${index + 1}. *${med.drugName || "Medicine"}*\n`;
      message += `   - Dosage: ${med.dosage} ${med.dosageUnit || "Tablet"}\n`;
      message += `   - Frequency: ${med.frequency || "As directed"}\n`;
      message += `   - Intake: ${med.intake}\n`;
      message += `   - Duration: ${med.duration} day(s)\n\n`;
    });
    return encodeURIComponent(message);
  };

  const formattedPhone = String(phone).replace(/\D/g, "");
  const whatsappLink = `https://wa.me/${formattedPhone}?text=${generateWhatsAppMessage()}`;

  const openShareModal = () => {
    if (setShowShareModal) {
      setShowShareModal(true);
    }
  };

  const handleEdit = () => {
    setIsEdit(true);
  };

  const handleCancel = () => {
    setPrescriptions(
      data?.prescriptions?.length
        ? data.prescriptions
        : [{ ...defaultMedicine, drugName: "" }]
    );
    setIsEdit(false);
  };

  return (
    <>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 6px;
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
        @media (min-width: 768px) {
          .desktop-view {
            display: block;
          }
          .mobile-view {
            display: none;
          }
        }
        @media (max-width: 767px) {
          .desktop-view {
            display: none;
          }
          .mobile-view {
            display: block;
          }
        }
      `}</style>
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "0.5rem",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
          border: "1px solid #e5e7eb",
          overflow: "hidden",
          width: "100%",
          maxWidth: "100%",
        }}
      >
        <div
          style={{
            backgroundColor: "var(--primary-color)",
            padding: "0.75rem 1rem",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Pill style={{ color: "#fff", width: "1.25rem", height: "1.25rem" }} />
            <h3 style={{ color: "#fff", fontWeight: "600", fontSize: "1rem" }}>
              Prescription
            </h3>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <button
              onClick={openShareModal}
              style={{
                backgroundColor: "transparent",
                border: "none",
                color: "#fff",
                padding: "0.5rem",
                borderRadius: "0.5rem",
                cursor: "pointer",
              }}
              title="Share Prescription"
            >
              <Share2 style={{ width: "1.25rem", height: "1.25rem" }} />
            </button>
            <button
              onClick={() => onPrint && onPrint("prescription")}
              style={{
                backgroundColor: "transparent",
                border: "none",
                color: "#fff",
                padding: "0.5rem",
                borderRadius: "0.5rem",
                cursor: "pointer",
              }}
              title="Print Prescription"
            >
              <Printer style={{ width: "1.25rem", height: "1.25rem" }} />
            </button>
          </div>
        </div>
        {capturedImage && (
          <div style={{ margin: "1rem", padding: "1rem", backgroundColor: "#f9fafb", borderRadius: "0.5rem", border: "1px solid #e5e7eb" }}>
            <h3 style={{ fontSize: "0.875rem", fontWeight: "600", color: "#374151", marginBottom: "0.5rem" }}>
              Attached Documents
            </h3>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: "0.5rem" }}>Patient Photo</p>
                <img
                  src={capturedImage}
                  alt="Patient"
                  style={{ width: "6rem", height: "6rem", objectFit: "cover", borderRadius: "0.5rem", border: "1px solid #d1d5db" }}
                />
                <button
                  onClick={() => setCapturedImage(null)}
                  style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: "0.25rem", cursor: "pointer" }}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}
        <div style={{ padding: "1rem" }}>
          <div className="desktop-view">
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "1rem" }}>
              <thead>
                <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                  <th style={{ padding: "0.75rem", textAlign: "left", fontSize: "0.875rem", fontWeight: "600" }}>Medicine</th>
                  <th style={{ padding: "0.75rem", textAlign: "left", fontSize: "0.875rem", fontWeight: "600" }}>Dosage</th>
                  <th style={{ padding: "0.75rem", textAlign: "left", fontSize: "0.875rem", fontWeight: "600" }}>Frequency</th>
                  <th style={{ padding: "0.75rem", textAlign: "left", fontSize: "0.875rem", fontWeight: "600" }}>Intake</th>
                  <th style={{ padding: "0.75rem", textAlign: "left", fontSize: "0.875rem", fontWeight: "600" }}>Duration (days)</th>
                  <th style={{ padding: "0.75rem", textAlign: "left", fontSize: "0.875rem", fontWeight: "600" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.map((med, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #e5e7eb" }}>
                    <td style={{ padding: "0.75rem" }}>
                      <input
                        type="text"
                        style={{
                          width: "100%",
                          padding: "0.5rem",
                          border: "1px solid #d1d5db",
                          borderRadius: "0.5rem",
                          fontSize: "0.875rem",
                        }}
                        placeholder="Search or enter drug name"
                        value={med.drugName}
                        onChange={(e) => {
                          handleChange(i, "drugName", e.target.value);
                          fetchDrugSuggestions(e.target.value);
                          setActiveInputIndex(i);
                        }}
                        onFocus={() => setActiveInputIndex(i)}
                        onBlur={() => setTimeout(() => setDrugSuggestions([]), 200)}
                        disabled={!isEdit}
                      />
                      {activeInputIndex === i && drugSuggestions.length > 0 && (
                        <ul
                          style={{
                            position: "absolute",
                            zIndex: 10,
                            width: "200px",
                            backgroundColor: "#fff",
                            border: "1px solid #d1d5db",
                            borderRadius: "0.5rem",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                            maxHeight: "160px",
                            overflowY: "auto",
                            marginTop: "0.25rem",
                            fontSize: "0.875rem",
                          }}
                        >
                          {drugSuggestions.map((drug) => (
                            <li
                              key={drug.id}
                              onClick={() => {
                                handleChange(i, "drugName", drug.name);
                                handleChange(i, "form", drug.form || "");
                                handleChange(i, "strength", drug.strength || "");
                                handleChange(i, "medicineId", drug.id);
                                setDrugSuggestions([]);
                              }}
                              style={{
                                padding: "0.5rem 0.75rem",
                                cursor: "pointer",
                                borderBottom: "1px solid #e5e7eb",
                              }}
                            >
                              <strong>{drug.name}</strong>
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                    <td style={{ padding: "0.75rem" }}>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <input
                          type="number"
                          style={{
                            width: "60px",
                            padding: "0.5rem",
                            border: "1px solid #d1d5db",
                            borderRadius: "0.5rem",
                            fontSize: "0.875rem",
                          }}
                          placeholder="Qty"
                          min="1"
                          value={med.dosage}
                          onChange={(e) => handleChange(i, "dosage", +e.target.value)}
                          disabled={!isEdit}
                        />
                        <select
                          style={{
                            width: "100px",
                            padding: "0.5rem",
                            border: "1px solid #d1d5db",
                            borderRadius: "0.5rem",
                            fontSize: "0.875rem",
                          }}
                          value={med.dosageUnit}
                          onChange={(e) => {
                            const selectedUnit = dosageUnits.find(unit => unit.name === e.target.value);
                            handleChange(i, "dosageUnit", e.target.value);
                            handleChange(i, "dosageUnitId", selectedUnit?.id || 0);
                          }}
                          disabled={!isEdit}
                        >
                          {dosageUnits.map((unit) => (
                            <option key={unit.id} value={unit.name}>
                              {unit.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td style={{ padding: "0.75rem" }}>
                      <select
                        style={{
                          width: "100%",
                          padding: "0.5rem",
                          border: "1px solid #d1d5db",
                          borderRadius: "0.5rem",
                          fontSize: "0.875rem",
                        }}
                        value={med.frequency}
                        onChange={(e) => {
                          const selectedFrequency = frequencies.find(freq => freq.name === e.target.value);
                          handleChange(i, "frequency", e.target.value);
                          handleChange(i, "frequencyId", selectedFrequency?.id || 0);
                        }}
                        disabled={!isEdit}
                      >
                        <option value="">Select frequency</option>
                        {frequencies.map((freq) => (
                          <option key={freq.id} value={freq.name}>
                            {freq.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td style={{ padding: "0.75rem" }}>
                      <select
                        style={{
                          width: "100%",
                          padding: "0.5rem",
                          border: "1px solid #d1d5db",
                          borderRadius: "0.5rem",
                          fontSize: "0.875rem",
                        }}
                        value={med.intake}
                        onChange={(e) => {
                          const selectedIntake = intakes.find(intake => intake.name === e.target.value);
                          handleChange(i, "intake", e.target.value);
                          handleChange(i, "intakeId", selectedIntake?.id || 0);
                        }}
                        disabled={!isEdit}
                      >
                        <option value="">Select intake</option>
                        {intakes.map((intake) => (
                          <option key={intake.id} value={intake.name}>
                            {intake.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td style={{ padding: "0.75rem" }}>
                      <input
                        type="number"
                        style={{
                          width: "60px",
                          padding: "0.5rem",
                          border: "1px solid #d1d5db",
                          borderRadius: "0.5rem",
                          fontSize: "0.875rem",
                        }}
                        placeholder="Days"
                        min="1"
                        value={med.duration}
                        onChange={(e) => handleChange(i, "duration", +e.target.value)}
                        disabled={!isEdit}
                      />
                    </td>
                    <td style={{ padding: "0.75rem" }}>
                      <button
                        onClick={() => removePrescription(i)}
                        style={{ color: "#ef4444", padding: "0.25rem", cursor: "pointer" }}
                        title="Remove"
                      >
                        <Trash2 style={{ width: "1rem", height: "1rem" }} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mobile-view">
            {prescriptions.map((med, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: "#f9fafb",
                  borderRadius: "0.5rem",
                  padding: "1rem",
                  border: "1px solid #e5e7eb",
                  marginBottom: "1rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                  <span style={{ fontSize: "0.875rem", fontWeight: "500", color: "#374151" }}>
                    Medicine {i + 1}
                  </span>
                  <button
                    onClick={() => removePrescription(i)}
                    style={{ color: "#ef4444", padding: "0.25rem", cursor: "pointer" }}
                    title="Remove"
                  >
                    <Trash2 style={{ width: "1rem", height: "1rem" }} />
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div style={{ position: "relative" }}>
                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "500", color: "#374151", marginBottom: "0.25rem" }}>
                      Medicine Name
                    </label>
                    <input
                      type="text"
                      style={{
                        width: "100%",
                        padding: "0.5rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "0.5rem",
                        fontSize: "0.875rem",
                      }}
                      placeholder="Search or enter drug name"
                      value={med.drugName}
                      onChange={(e) => {
                        handleChange(i, "drugName", e.target.value);
                        fetchDrugSuggestions(e.target.value);
                        setActiveInputIndex(i);
                      }}
                      onFocus={() => setActiveInputIndex(i)}
                      onBlur={() => setTimeout(() => setDrugSuggestions([]), 200)}
                      disabled={!isEdit}
                    />
                    {activeInputIndex === i && drugSuggestions.length > 0 && (
                      <ul
                        style={{
                          position: "absolute",
                          zIndex: 10,
                          width: "100%",
                          backgroundColor: "#fff",
                          border: "1px solid #d1d5db",
                          borderRadius: "0.5rem",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          maxHeight: "160px",
                          overflowY: "auto",
                          marginTop: "0.25rem",
                          fontSize: "0.875rem",
                        }}
                      >
                        {drugSuggestions.map((drug) => (
                          <li
                            key={drug.id}
                            onClick={() => {
                              handleChange(i, "drugName", drug.name);
                              handleChange(i, "form", drug.form || "");
                              handleChange(i, "strength", drug.strength || "");
                              handleChange(i, "medicineId", drug.id);
                              setDrugSuggestions([]);
                            }}
                            style={{
                              padding: "0.5rem 0.75rem",
                              cursor: "pointer",
                              borderBottom: "1px solid #e5e7eb",
                            }}
                          >
                            <strong>{drug.name}</strong>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "500", color: "#374151", marginBottom: "0.25rem" }}>
                      Dosage
                    </label>
                    <div
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                        width: "100%",
                        flexWrap: "nowrap",
                      }}
                    >
                      <input
                        type="number"
                        style={{
                          flex: 1,
                          minWidth: 0,
                          padding: "0.5rem",
                          border: "1px solid #d1d5db",
                          borderRadius: "0.5rem",
                          fontSize: "0.875rem",
                        }}
                        placeholder="Qty"
                        min="1"
                        value={med.dosage}
                        onChange={(e) => handleChange(i, "dosage", +e.target.value)}
                        disabled={!isEdit}
                      />
                      <select
                        style={{
                          flex: 1,
                          minWidth: 0,
                          padding: "0.5rem",
                          border: "1px solid #d1d5db",
                          borderRadius: "0.5rem",
                          fontSize: "0.875rem",
                        }}
                        value={med.dosageUnit}
                        onChange={(e) => {
                          const selectedUnit = dosageUnits.find(unit => unit.name === e.target.value);
                          handleChange(i, "dosageUnit", e.target.value);
                          handleChange(i, "dosageUnitId", selectedUnit?.id || 0);
                        }}
                        disabled={!isEdit}
                      >
                        {dosageUnits.map((unit) => (
                          <option key={unit.id} value={unit.name}>
                            {unit.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "500", color: "#374151", marginBottom: "0.25rem" }}>
                      Frequency
                    </label>
                    <select
                      style={{
                        width: "100%",
                        padding: "0.5rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "0.5rem",
                        fontSize: "0.875rem",
                      }}
                      value={med.frequency}
                      onChange={(e) => {
                        const selectedFrequency = frequencies.find(freq => freq.name === e.target.value);
                        handleChange(i, "frequency", e.target.value);
                        handleChange(i, "frequencyId", selectedFrequency?.id || 0);
                      }}
                      disabled={!isEdit}
                    >
                      <option value="">Select frequency</option>
                      {frequencies.map((freq) => (
                        <option key={freq.id} value={freq.name}>
                          {freq.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "500", color: "#374151", marginBottom: "0.25rem" }}>
                        Intake
                      </label>
                      <select
                        style={{
                          width: "100%",
                          padding: "0.5rem",
                          border: "1px solid #d1d5db",
                          borderRadius: "0.5rem",
                          fontSize: "0.875rem",
                        }}
                        value={med.intake}
                        onChange={(e) => {
                          const selectedIntake = intakes.find(intake => intake.name === e.target.value);
                          handleChange(i, "intake", e.target.value);
                          handleChange(i, "intakeId", selectedIntake?.id || 0);
                        }}
                        disabled={!isEdit}
                      >
                        <option value="">Select intake</option>
                        {intakes.map((intake) => (
                          <option key={intake.id} value={intake.name}>
                            {intake.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "500", color: "#374151", marginBottom: "0.25rem" }}>
                        Duration (days)
                      </label>
                      <input
                        type="number"
                        style={{
                          width: "100%",
                          padding: "0.5rem",
                          border: "1px solid #d1d5db",
                          borderRadius: "0.5rem",
                          fontSize: "0.85rem",
                        }}
                        placeholder="Days"
                        min="1"
                        value={med.duration}
                        onChange={(e) => handleChange(i, "duration", +e.target.value)}
                        disabled={!isEdit}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 w-full">
            {isEdit && (
              <>
                <div className="mb-2 w-full flex justify-start">
                  <button
                    onClick={addPrescription}
                    className="flex items-center justify-center gap-2 px-6 py-3
                               bg-[var(--primary-color)] text-white rounded-lg
                               text-sm md:text-base
                               w-full md:w-auto md:max-w-[200px]"
                  >
                    <Plus className="w-4 h-4" />
                    Add Medicine
                  </button>
                </div>
                {!isSaved ? (
                  <div className="mb-4 w-full flex justify-end">
                    <button
                      onClick={handleSave}
                      className="flex items-center justify-center gap-2 px-6 py-3
                                 bg-[var(--primary-color)] text-white rounded-lg
                                 text-sm md:text-base
                                 w-full md:w-auto md:max-w-[500px]"
                    >
                      <Save className="w-4 h-4" />
                      Save Prescription
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row gap-2 justify-end items-center w-full mt-2">
                    <button
                      onClick={handleUpdate}
                      className="flex items-center justify-center gap-2 px-6 py-3
                                 bg-green-500 text-white rounded-lg
                                 text-sm md:text-base
                                 w-full md:w-auto md:max-w-[200px]"
                    >
                      <Check className="w-4 h-4" />
                      Update
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center justify-center gap-2 px-6 py-3
                                 bg-gray-600 text-white rounded-lg
                                 text-sm md:text-base
                                 w-full md:w-auto md:max-w-[200px]"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                )}
              </>
            )}
            {!isEdit && isSaved && (
              <div className="flex flex-col md:flex-row gap-2 justify-end items-center w-full mt-2">
                <button
                  onClick={handleEdit}
                  className="flex items-center justify-center gap-2 px-6 py-3
                             bg-[var(--primary-color)] text-white rounded-lg
                             text-sm md:text-base
                             w-full md:w-auto md:max-w-[200px]"
                >
                  <Edit className="w-4 h-4" />
                  Edit Prescription
                </button>
              </div>
            )}
          </div>
        </div>
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>
    </>
  );
};

export default PrescriptionForm;
