



import React, { useState, useEffect, useCallback } from "react";
import {
  Heart,
  Save,
  Printer,
  AlertTriangle,
  BarChart3,
} from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useOptimizedVoiceRecognition } from "./useOptimizedVoiceRecognition";
import VoiceButton from "./VoiceButton";
import { usePatientContext } from "../../../../../context-api/PatientContext";
import { useSelector } from "react-redux";
import { createDoctorIpdVital, getIpdVitals } from "../../../../../utils/masterService";

const vitalRanges = {
  heartRate: { min: 60, max: 100, label: "bpm", placeholder: "e.g. 72" },
  temperature: { min: 36.1, max: 37.2, label: "°C", placeholder: "e.g. 36.8" },
  bloodSugar: { min: 70, max: 140, label: "mg/dL", placeholder: "e.g. 90" },
  bloodPressure: {
    min: 90,
    max: 120,
    label: "mmHg",
    placeholder: "e.g. 120/80",
  },
  height: { min: 100, max: 220, label: "cm", placeholder: "e.g. 170" },
  weight: { min: 30, max: 200, label: "kg", placeholder: "e.g. 65" },
  spo2: { min: 90, max: 100, label: "%", placeholder: "e.g. 98" },
  respiratoryRate: { min: 12, max: 20, label: "bpm", placeholder: "e.g. 16" },
};

const VitalsForm = ({
  data,
  onSave,
  onPrint,
  setIsChartOpen,
  setChartVital,
  hospitalName,
  ptemail,
  drEmail,
  diagnosis,
  type,
}) => {
  const { patients, activeTab } = usePatientContext();
  const doctorId = useSelector((state) => state.auth.doctorId);
  const emptyVitals = {
    heartRate: "",
    temperature: "",
    bloodSugar: "",
    bloodPressure: "",
    height: "",
    weight: "",
    spo2: "",
    respiratoryRate: "",
    timeOfDay: "morning",
  };
  const [formData, setFormData] = useState({ ...emptyVitals, ...data });
  const [headerRecordIdx, setHeaderRecordIdx] = useState(null);
  const [warnings, setWarnings] = useState({});
  const [loading, setLoading] = useState(false);
  const [vitalsRecords, setVitalsRecords] = useState([]);

  // Fetch vitals records
useEffect(() => {
  const fetchVitalsRecords = async () => {
    const validDoctorId = doctorId || 1; // 👈 use default doctor ID 1
    const patientId = patients[0]?.id;
    const context = activeTab?.toUpperCase();

    if (patients.length > 0 && validDoctorId && context) {
      console.log("Calling API with:", {
        doctorId: validDoctorId,
        patientId,
        context,
      });

      try {
        const response = await getIpdVitals(validDoctorId, patientId, context);
        console.log("Fetched vitals records:::::::::::::::::", response.data);
        setVitalsRecords(response.data?.content || response.data || []);
      } catch (error) {
        console.error("Failed to fetch vitals records:", error);
        toast.error("Failed to fetch vitals records");
      }
    } else {
      console.log("❌ Skipping API call — missing values", {
        hasPatients: patients.length > 0,
        doctorId: validDoctorId,
        context,
      });
    }
  };

  fetchVitalsRecords();
}, [patients, doctorId, activeTab]);


  // Load selected record into form
  useEffect(() => {
    if (headerRecordIdx !== null && vitalsRecords[headerRecordIdx]) {
      const selectedRecord = vitalsRecords[headerRecordIdx];
      setFormData({
        ...selectedRecord,
        timeOfDay: selectedRecord.timeOfDay || "morning",
      });
    }
  }, [headerRecordIdx, vitalsRecords]);

  const validate = (field, value) => {
    const range = vitalRanges[field];
    if (!range) return "";
    if (field === "bloodPressure") {
      const [systolic, diastolic] = value.split("/").map(Number);
      if (!systolic || !diastolic) return "Enter as systolic/diastolic";
      if (systolic < 90 || systolic > 180 || diastolic < 60 || diastolic > 120)
        return "Out of normal range";
      return "";
    }
    if (value === "") return "";
    const num = +value;
    if (isNaN(num)) return "Enter a number";
    if (num < range.min || num > range.max)
      return `Out of range (${range.min}-${range.max} ${range.label})`;
    return "";
  };

  const save = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const date = now.toISOString().split("T")[0];
      const time = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      const newRecord = {
        ...formData,
        timestamp: now.getTime(),
        date,
        time,
        id: Date.now().toString(),
        doctorId: doctorId,
      };
      const ipdVitalPayload = {
        patientId: patients[0].id,
        doctorId: doctorId||1,
        context: activeTab.toUpperCase(),
        timeSlot: formData.timeOfDay,
        recordedAt: now.toISOString(),
        heartRate: parseFloat(formData.heartRate) || 0,
        temperature: parseFloat(formData.temperature) || 0.1,
        bloodSugar: parseFloat(formData.bloodSugar) || 0.1,
        bloodPressure: formData.bloodPressure || "0/0",
        respiratoryRate: parseInt(formData.respiratoryRate) || 0,
        spo2: parseInt(formData.spo2) || 0,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };
      const res = await createDoctorIpdVital(ipdVitalPayload);
      console.log("IPD data saved", res.data);
      toast.success("✅ IPD Vitals saved successfully!");
      setVitalsRecords((prev) => {
        let updated = [...prev, newRecord];
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        updated = updated.filter((r) => new Date(r.date) >= sevenDaysAgo);
        localStorage.setItem("vitalsRecords", JSON.stringify(updated));
        return updated;
      });
      onSave("vitals", {
        ...formData,
        vitalsRecords: [...vitalsRecords, newRecord],
      });
      setHeaderRecordIdx(null);
      setFormData({ ...emptyVitals });
      toast.success("✅ Vitals saved successfully!", {
        position: "top-right",
        autoClose: 2000,
      });
    } catch (error) {
      console.error("Full error response:", error);
      toast.error(`❌ Failed to save vitals: ${error.message}`, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    if (name === "timeOfDay") {
      setFormData((p) => ({ ...p, timeOfDay: value }));
      return;
    }
    if (name !== "bloodPressure") {
      processedValue = value.replace(/[^0-9.]/g, "");
    }
    setFormData((p) => ({ ...p, [name]: processedValue }));
    setWarnings((p) => ({ ...p, [name]: validate(name, processedValue) }));
  };

  const parseVitalsFromSpeech = useCallback((text, confidence, type) => {
    // Your existing speech parsing logic
  }, []);

  const { isListening, transcript, isSupported, confidence, toggleListening } =
    useOptimizedVoiceRecognition(parseVitalsFromSpeech, {
      continuous: true,
      interimResults: true,
      lang: "en-US",
      sensitivity: 0.4,
      pauseThreshold: 1000,
      maxAlternatives: 3,
      realTimeProcessing: true,
    });

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-slideIn">
      {/* Header */}
      <div className="sub-heading px-2 sm:px-3 md:px-4 py-2 flex flex-col gap-1 sm:gap-2">
        <div className="flex flex-nowrap items-center justify-between gap-1">
          <div className="flex items-center gap-1">
            <Heart className="text-base text-white" />
            <h3 className="text-white font-medium text-xs sm:text-sm md:text-base">
              Vital Signs
            </h3>
          </div>
          <div className="flex items-center gap-1">
            <div className="flex sm:hidden">
              <button
                onClick={save}
                disabled={loading}
                className="hover:bg-[var(--primary-color)] hover:bg-opacity-20 p-1 rounded-lg transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onPrint("vitals")}
                className="hover:bg-[var(--primary-color)] hover:bg-opacity-20 p-1 rounded-lg transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  setChartVital("heartRate");
                  setIsChartOpen(true);
                }}
                className="flex items-center gap-0.5 bg-white/10 px-1.5 py-0.5 rounded-lg text-[8px] font-medium hover:bg-[var(--primary-color)] hover:bg-opacity-20"
              >
                <BarChart3 className="w-3 h-3" />
              </button>
            </div>
            <VoiceButton
              isListening={isListening}
              onToggle={toggleListening}
              isSupported={isSupported}
              className="!w-6 !h-6 sm:!w-7 sm:!h-7"
              confidence={confidence}
            />
            {isListening && (
              <div className="flex items-center gap-0.5 text-white text-[8px] sm:text-xs">
                <span className="animate-pulse">🎤</span>
                {confidence > 0 && (
                  <span className="opacity-75">
                    ({Math.round(confidence * 100)}%)
                  </span>
                )}
              </div>
            )}
            <div className="hidden sm:flex items-center gap-1">
              <button
                onClick={save}
                disabled={loading}
                className="hover:bg-[var(--primary-color)] hover:bg-opacity-20 p-1.5 rounded-lg transition-colors"
              >
                <Save className="w-5 h-5" />
              </button>
              <button
                onClick={() => onPrint("vitals")}
                className="hover:bg-[var(--primary-color)] hover:bg-opacity-20 p-1.5 rounded-lg transition-colors"
              >
                <Printer className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  setChartVital("heartRate");
                  setIsChartOpen(true);
                }}
                className="flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-[var(--primary-color)] hover:bg-opacity-20"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="text-xs">Charts</span>
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-lg">
            <span className="text-[10px] sm:text-xs text-white">Record:</span>
            <div className="relative w-full max-w-[120px] sm:max-w-[150px]">
              <select
                className="rounded px-1 py-0.5 text-[8px] sm:text-[12px] bg-white text-[var(--primary-color)]
                           border border-gray-200 w-full truncate appearance-none
                           pr-6 bg-right bg-no-repeat"
                style={{
                  backgroundImage:
                    'url(\'data:image/svg+xml;utf8,<svg fill="black" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>)',
                  backgroundPosition: "right 0.5rem center",
                  backgroundSize: "1em",
                }}
                value={headerRecordIdx === null ? "" : headerRecordIdx}
                onChange={(e) =>
                  setHeaderRecordIdx(
                    e.target.value === "" ? null : Number(e.target.value)
                  )
                }
              >
                <option value="" className="text-[8px] sm:text-[12px]">
                  Current
                </option>
                {vitalsRecords.map((rec, idx) => (
                  <option
                    key={`${rec.timestamp}-${rec.id || idx}`}
                    value={idx}
                    className="text-[8px] sm:text-[12px]"
                  >
                    {rec.date} {rec.time}{" "}
                    {rec.timeOfDay === "morning" ? "(Morning)" : "(Evening)"}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-x-2 bg-white/10 px-2 py-1 rounded-lg">
            {["morning", "evening"].map((t) => (
              <label
                key={t}
                className="flex items-center gap-1 text-[10px] sm:text-xs text-white"
              >
                <input
                  type="radio"
                  name="timeOfDay"
                  value={t}
                  checked={formData.timeOfDay === t}
                  onChange={handleChange}
                  className="accent-[var(--accent-color)]"
                />
                <span className="hidden sm:inline">
                  {t[0].toUpperCase() + t.slice(1)}
                </span>
                <span className="sm:hidden">{t[0].toUpperCase()}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
      {/* Vitals Input Grid */}
      <div className="p-3 sm:p-4 md:p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {Object.keys(vitalRanges).map((field) => (
          <div key={field} className="space-y-1">
            <div className="relative floating-input">
              <label className="block text-[12px] sm:text-sm md:text-text-base font-medium text-[var(--primary-color)]">
                {field
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (c) => c.toUpperCase())}
              </label>
              <input
                name={field}
                value={formData[field]}
                onChange={handleChange}
                placeholder={vitalRanges[field].placeholder}
                className={`w-full rounded-lg border px-2 sm:px-3 py-1 sm:py-1.5 md:py-2 text-[10px] sm:text-xs md:text-sm ${
                  formData[field]
                    ? "bg-green-50 border-green-300 ring-2 ring-green-200"
                    : ""
                }`}
              />
              {formData[field] && (
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-[10px] sm:text-xs md:text-sm">
                  {vitalRanges[field].label}
                </span>
              )}
            </div>
            {warnings[field] && (
              <span className="flex items-center text-[10px] sm:text-xs md:text-sm text-yellow-700 bg-yellow-100 rounded-lg px-2 sm:px-3 py-1 gap-1 sm:gap-2">
                <AlertTriangle className="w-3 sm:w-4 h-3 sm:h-4 text-yellow-500" />
                {warnings[field]}
              </span>
            )}
          </div>
        ))}
      </div>
      {/* Voice Transcript */}
      {transcript && (
        <div className="px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3 md:p-4 max-h-24 overflow-y-auto">
            <strong className="text-blue-800 text-[10px] sm:text-xs md:text-sm">
              Voice Input:
            </strong>
            <span className="text-blue-700 ml-1 text-[10px] sm:text-xs md:text-sm">
              {transcript}
            </span>
            {isListening && (
              <div className="text-[10px] sm:text-xs md:text-sm text-blue-600 mt-1">
                <em>Speaking... Fields will update automatically</em>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VitalsForm;