

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
import {
  getDosageUnits,
  getFrequencies,
  getIntakes,
  searchMedicinesByName,
  createDoctorPrescription,
  updateDoctorPrescription,
  deleteDoctorPrescription,
  getPrescriptionsByContextDoctorPatient,
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
  email: propEmail,
  phone: propPhone,
  setShowShareModal,
  doctorName,
  hospitalName,
  type,
  doctorId: doctorIdFromProps,
}) => {
  const { activeTab, patient: ctxPatient } = usePatientContext();
  const doctorIdFromRedux = useSelector((state) => state.auth.doctorId);
  const [prescriptions, setPrescriptions] = useState(
    data?.prescriptions?.length
      ? data.prescriptions
      : [{ ...defaultMedicine, drugName: "" }]
  );
  const [drugSuggestions, setDrugSuggestions] = useState([]);
  const [activeInputIndex, setActiveInputIndex] = useState(null);
  const [isSaved, setIsSaved] = useState(!!data?.id);
  const [prescriptionId, setPrescriptionId] = useState(data?.id);
  const [isEdit, setIsEdit] = useState(!data?.id);
  const [capturedImage, setCapturedImage] = useState(null);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dosageUnits, setDosageUnits] = useState([]);
  const [frequencies, setFrequencies] = useState([]);
  const [intakes, setIntakes] = useState([]);
  const canvasRef = useRef(null);
  const [appointmentId, setAppointmentId] = useState(null);

  // Helper to resolve option IDs from various possible name fields
  const resolveId = (options, value, fallbackId = 0) => {
    if (!value) return 0;
    const v = String(value).trim().toLowerCase();
    const match = (options || []).find((o) => {
      const names = [o.name, o.unitName, o.dosageUnitName, o.label];
      return names.some((n) => n && String(n).trim().toLowerCase() === v);
    });
    return match?.id ?? fallbackId;
  };

  useEffect(() => {
    setEmail(propEmail || patient?.email || "");
    setPhone(propPhone || patient?.phone || patient?.mobileNo || "");
  }, [propEmail, propPhone, patient]);

  useEffect(() => {
    const apptIdRaw = ctxPatient?.appointmentId ?? patient?.appointmentId ?? null;
    const apptIdNum = apptIdRaw != null ? Number(apptIdRaw) : null;
    setAppointmentId(Number.isFinite(apptIdNum) ? apptIdNum : null);
  }, [ctxPatient, patient]);

  useEffect(() => {
    const loadExistingPrescriptions = async () => {
      try {
        const context = (activeTab || type || "").toUpperCase();
        const contextId = appointmentId;
        const doctorId = doctorIdFromRedux || doctorIdFromProps || 1;
        const patientId = ctxPatient?.patientId ?? patient?.patientId;
        if (!context || !contextId || !doctorId || !patientId) return;
        const res = await getPrescriptionsByContextDoctorPatient(
          context,
          contextId,
          doctorId,
          patientId
        );
        const list = Array.isArray(res.data) ? res.data : res.data?.content || [];
        if (!list.length) return;
        const first = list[0];
        const meds =
          first.medicines ||
          first.prescriptionMedicines ||
          first.medicineList ||
          [];
        const mapped = meds.map((m) => ({
          ...defaultMedicine,
          medicineId: m.medicineId || m.medicineIdId,
          dosage: Number(m.dosage),
          duration: Number(m.duration),
          dosageUnitId: m.dosageUnitId,
          frequencyId: m.frequencyId,
          intakeId: m.intakeId,
          drugName: m.drugName || m.medicineName,
        }));
        if (mapped.length) {
          setPrescriptions(mapped);
        }
        setPrescriptionId(first.id || first.prescriptionId || first.prescriptionID || null);
        setIsSaved(true);
        setIsEdit(false);
      } catch (error) {
        console.error("Failed to load prescriptions:", error);
        toast.error("Failed to load prescriptions. Please try again later.", {
          position: "top-right",
          autoClose: 2000,
        });
      }
    };
    loadExistingPrescriptions();
  }, [activeTab, ctxPatient, patient, doctorIdFromRedux, doctorIdFromProps, type]);

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

  useEffect(() => {
    setPrescriptions((prev) => {
      let changed = false;
      const mapped = (prev || []).map((p) => {
        const n = { ...p };
        if ((!n.dosageUnitId || Number(n.dosageUnitId) === 0) && n.dosageUnit) {
          const u = (dosageUnits || []).find((x) => x.name === n.dosageUnit);
          if (u) {
            n.dosageUnitId = u.id;
            changed = true;
          }
        }
        if ((!n.frequencyId || Number(n.frequencyId) === 0) && n.frequency) {
          const f = (frequencies || []).find((x) => x.name === n.frequency);
          if (f) {
            n.frequencyId = f.id;
            changed = true;
          }
        }
        if ((!n.intakeId || Number(n.intakeId) === 0) && n.intake) {
          const t = (intakes || []).find((x) => x.name === n.intake);
          if (t) {
            n.intakeId = t.id;
            changed = true;
          }
        }
        return n;
      });
      return changed ? mapped : prev;
    });
  }, [dosageUnits, frequencies, intakes]);

  const handleChange = (i, field, val) => {
    setPrescriptions((prev) =>
      prev.map((p, idx) => (idx === i ? { ...p, [field]: val } : p))
    );
  };

  const addPrescription = () => {
    setPrescriptions((prev) => [...prev, { ...defaultMedicine, drugName: "" }]);
  };

  const removePrescription = async (i) => {
    if (prescriptions.length <= 1) {
      toast.warning("At least one prescription is required.", {
        position: "top-right",
        autoClose: 2000,
      });
      return;
    }
    const updatedPrescriptions = prescriptions.filter((_, idx) => idx !== i);
    setPrescriptions(updatedPrescriptions);
    if (!prescriptionId) return;
    try {
      const medicines = updatedPrescriptions.map((med) => ({
        medicineId: med.medicineId || 0,
        dosage: med.dosage.toString(),
        duration: med.duration.toString(),
        dosageUnitId: med.dosageUnitId,
        frequencyId: med.frequencyId || 0,
        intakeId: med.intakeId || 0,
      }));
      for (let idx = 0; idx < medicines.length; idx++) {
        const m = medicines[idx];
        if (!Number.isFinite(m.dosageUnitId) || m.dosageUnitId <= 0) {
          toast.error(`Please select a dosage unit for medicine #${idx + 1}`);
          return;
        }
        if (!Number.isFinite(m.frequencyId) || m.frequencyId <= 0) {
          toast.error(`Please select a frequency for medicine #${idx + 1}`);
          return;
        }
        if (!Number.isFinite(m.intakeId) || m.intakeId <= 0) {
          toast.error(`Please select an intake for medicine #${idx + 1}`);
          return;
        }
      }
      const rawContextId = appointmentId ?? ctxPatient?.id ?? patient?.id ?? null;
      const contextIdNum = rawContextId != null ? Number(rawContextId) : null;
      if (!Number.isFinite(contextIdNum)) {
        toast.error("Context ID is required");
        return;
      }
      const payload = {
        contextId: contextIdNum,
        patientId: ctxPatient?.patientId ?? patient?.patientId,
        doctorId: doctorIdFromRedux || doctorIdFromProps,
        context: activeTab.toUpperCase(),
        medicines,
      };
      await updateDoctorPrescription(prescriptionId, payload);
      toast.success("Medicine removed from prescription", {
        position: "top-right",
        autoClose: 2000,
      });
    } catch (error) {
      console.error("Failed to update prescription after removal:", error);
      toast.error("Failed to update prescription after removal", {
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
    const medicines = prescriptions.map((med) => {
      const unitId = med.dosageUnitId || (dosageUnits.find((u) => u.name === med.dosageUnit)?.id ?? 0);
      const freqId = med.frequencyId || (frequencies.find((f) => f.name === med.frequency)?.id ?? 0);
      const intakeId = med.intakeId || (intakes.find((i) => i.name === med.intake)?.id ?? 0);
      return {
        medicineId: med.medicineId,
        dosage: String(med.dosage),
        duration: String(med.duration),
        dosageUnitId: unitId,
        frequencyId: freqId,
        intakeId: intakeId,
      };
    });
    for (let i = 0; i < medicines.length; i++) {
      const m = medicines[i];
      if (!Number.isFinite(m.dosageUnitId) || m.dosageUnitId <= 0) {
        toast.error(`Please select a dosage unit for medicine #${i + 1}`);
        return;
      }
      if (!Number.isFinite(m.frequencyId) || m.frequencyId <= 0) {
        toast.error(`Please select a frequency for medicine #${i + 1}`);
        return;
      }
      if (!Number.isFinite(m.intakeId) || m.intakeId <= 0) {
        toast.error(`Please select an intake for medicine #${i + 1}`);
        return;
      }
    }
    const rawContextId = appointmentId ?? ctxPatient?.id ?? patient?.id ?? null;
    const contextIdNum = rawContextId != null ? Number(rawContextId) : null;
    if (!Number.isFinite(contextIdNum)) {
      toast.error("Context ID is required");
      return;
    }
    const payload = {
      contextId: contextIdNum,
      patientId: ctxPatient?.patientId ?? patient?.patientId,
      doctorId: doctorIdFromRedux || doctorIdFromProps,
      context: (activeTab).toUpperCase(),
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
        toast.success("Prescription saved successfully!", {
          position: "top-right",
          autoClose: 2000,
          closeOnClick: true,
        });
      } else {
        throw new Error(`API failed: ${response.status}`);
      }
    } catch (error) {
      console.error("API Error:", error);
      toast.error(` ${error.message}`, {
        position: "top-right",
        autoClose: 2000,
        closeOnClick: true,
      });
    }
  };

  const handleUpdate = async () => {
    if (!prescriptionId) {
      toast.error("Prescription ID is missing.", {
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
      dosageUnitId: med.dosageUnitId,
      frequencyId: med.frequencyId || 0,
      intakeId: med.intakeId || 0,
    }));
    for (let i = 0; i < medicines.length; i++) {
      const m = medicines[i];
      if (!Number.isFinite(m.dosageUnitId) || m.dosageUnitId <= 0) {
        toast.error(`Please select a dosage unit for medicine #${i + 1}`);
        return;
      }
      if (!Number.isFinite(m.frequencyId) || m.frequencyId <= 0) {
        toast.error(`Please select a frequency for medicine #${i + 1}`);
        return;
      }
      if (!Number.isFinite(m.intakeId) || m.intakeId <= 0) {
        toast.error(`Please select an intake for medicine #${i + 1}`);
        return;
      }
    }
    const rawContextId = ctxPatient?.id ?? patient?.id ?? null;
    const contextIdNum = rawContextId != null ? Number(rawContextId) : null;
    if (!Number.isFinite(contextIdNum)) {
      toast.error("Context ID is required");
      return;
    }
    const payload = {
      contextId: contextIdNum,
      patientId: ctxPatient?.patientId ?? patient?.patientId,
      doctorId: doctorIdFromRedux || doctorIdFromProps,
      context: (activeTab).toUpperCase(),
      medicines,
    };
    try {
      const response = await updateDoctorPrescription(prescriptionId, payload);
      if (response.status >= 200 && response.status < 300) {
        setIsEdit(false);
        if (onSave) {
          onSave("prescription", { prescriptions, id: prescriptionId });
        }
        toast.success("Prescription updated successfully!", {
          position: "top-right",
          autoClose: 2000,
          closeOnClick: true,
        });
      } else {
        throw new Error(`API failed: ${response.status}`);
      }
    } catch (error) {
      console.error("API Error:", error);
      toast.error(` ${error.message}`, {
        position: "top-right",
        autoClose: 2000,
        closeOnClick: true,
      });
    }
  };

  const handleDelete = async () => {
    if (!prescriptionId) {
      toast.error("Prescription ID is missing.", {
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
        toast.success("Prescription deleted successfully!", {
          position: "top-right",
          autoClose: 2000,
          closeOnClick: true,
        });
      } else {
        throw new Error(`API failed: ${response.status}`);
      }
    } catch (error) {
      console.error("API Error:", error);
      toast.error(` ${error.message}`, {
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
                          value={Number(med.dosageUnitId) || (dosageUnits.find((u) => u.name === med.dosageUnit)?.id || 0)}
                          onChange={(e) => {
                            const id = Number(e.target.value);
                            const selectedUnit = dosageUnits.find(unit => unit.id === id);
                            handleChange(i, "dosageUnitId", id || 0);
                            handleChange(i, "dosageUnit", selectedUnit?.name || selectedUnit?.unitName || selectedUnit?.dosageUnitName || "");
                          }}
                          disabled={!isEdit}
                        >
                          <option value={0}>Select unit</option>
                          {dosageUnits.map((unit) => (
                            <option key={unit.id} value={unit.id}>
                              {unit.name || unit.unitName || unit.dosageUnitName}
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
                        value={Number(med.frequencyId) || (frequencies.find((f) => f.name === med.frequency)?.id || 0)}
                        onChange={(e) => {
                          const id = Number(e.target.value);
                          const selectedFrequency = frequencies.find(freq => freq.id === id);
                          handleChange(i, "frequencyId", id || 0);
                          handleChange(i, "frequency", selectedFrequency?.name || selectedFrequency?.frequencyName || selectedFrequency?.label || "");
                        }}
                        disabled={!isEdit}
                      >
                        <option value={0}>Select frequency</option>
                        {frequencies.map((freq) => (
                          <option key={freq.id} value={freq.id}>
                            {freq.name || freq.frequencyName || freq.label}
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
                        value={Number(med.intakeId) || (intakes.find((t) => t.name === med.intake)?.id || 0)}
                        onChange={(e) => {
                          const id = Number(e.target.value);
                          const selectedIntake = intakes.find(intake => intake.id === id);
                          handleChange(i, "intakeId", id || 0);
                          handleChange(i, "intake", selectedIntake?.name || selectedIntake?.intakeName || selectedIntake?.label || "");
                        }}
                        disabled={!isEdit}
                      >
                        <option value={0}>Select intake</option>
                        {intakes.map((intake) => (
                          <option key={intake.id} value={intake.id}>
                            {intake.name || intake.intakeName || intake.label}
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
                        value={Number(med.dosageUnitId) || (dosageUnits.find((u) => u.name === med.dosageUnit)?.id || 0)}
                        onChange={(e) => {
                          const id = Number(e.target.value);
                          const selectedUnit = dosageUnits.find(unit => unit.id === id);
                          handleChange(i, "dosageUnitId", id || 0);
                          handleChange(i, "dosageUnit", selectedUnit?.name || selectedUnit?.unitName || selectedUnit?.dosageUnitName || selectedUnit?.unit || selectedUnit?.displayName || "");
                        }}
                        disabled={!isEdit}
                      >
                        <option value={0}>Select unit</option>
                        {dosageUnits.map((unit) => (
                          <option key={unit.id} value={unit.id}>
                            {unit.name || unit.unitName || unit.dosageUnitName || unit.unit || unit.displayName}
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
                      value={Number(med.frequencyId) || (frequencies.find((f) => f.name === med.frequency)?.id || 0)}
                      onChange={(e) => {
                        const id = Number(e.target.value);
                        const selectedFrequency = frequencies.find(freq => freq.id === id);
                        handleChange(i, "frequencyId", id || 0);
                        handleChange(i, "frequency", selectedFrequency?.name || selectedFrequency?.frequencyName || selectedFrequency?.label || "");
                      }}
                      disabled={!isEdit}
                    >
                      <option value={0}>Select frequency</option>
                      {frequencies.map((freq) => (
                        <option key={freq.id} value={freq.id}>
                          {freq.name || freq.frequencyName || freq.label}
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
                        value={Number(med.intakeId) || (intakes.find((t) => t.name === med.intake)?.id || 0)}
                        onChange={(e) => {
                          const id = Number(e.target.value);
                          const selectedIntake = intakes.find(intake => intake.id === id);
                          handleChange(i, "intakeId", id || 0);
                          handleChange(i, "intake", selectedIntake?.name || selectedIntake?.intakeName || selectedIntake?.label || "");
                        }}
                        disabled={!isEdit}
                      >
                        <option value={0}>Select intake</option>
                        {intakes.map((intake) => (
                          <option key={intake.id} value={intake.id}>
                            {intake.name || intake.intakeName || intake.label}
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
