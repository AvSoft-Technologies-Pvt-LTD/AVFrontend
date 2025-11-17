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
}) => {
  const { patient, activeTab } = usePatientContext();
  const contextId = patient?.id;
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVitalsRecords = async () => {
      setIsLoading(true);
      const validDoctorId = doctorId || 1;
      const patientId = patient?.patientId;
      const context = activeTab?.toUpperCase();

      if (!patientId || !validDoctorId || !context) {
        console.warn("Missing required parameters for getIpdVitals");
        setIsLoading(false);
        return;
      }

      try {
        const response = await getIpdVitals(context, contextId, validDoctorId, patientId);
        const records = Array.isArray(response.data) ? response.data : response.data?.content || [];
        const formattedRecords = records.map((r, index) => {
          let recDate;
          try {
            if (Array.isArray(r.recordedAt)) {
              const [year, month, day, hour, minute, second] = r.recordedAt;
              recDate = new Date(year, month - 1, day, hour, minute, second);
            } else {
              recDate = new Date(r.recordedAt);
            }
            if (isNaN(recDate.getTime())) throw new Error("Invalid Date Object");
          } catch (error) {
            return {
              ...r,
              formattedDate: "Invalid Date",
              formattedTime: "Invalid Time",
              timeSlot: "Unknown",
            };
          }

          const istString = recDate.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
          const istDate = new Date(istString);
          const formattedDate = istDate.toLocaleDateString("en-IN", {
            timeZone: "Asia/Kolkata",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          });
          const formattedTime = istDate.toLocaleTimeString("en-IN", {
            timeZone: "Asia/Kolkata",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          });
          const istHour = istDate.getHours();
          let timeSlot;
          if (istHour < 12) timeSlot = "Morning";
          else if (istHour < 17) timeSlot = "Afternoon";
          else timeSlot = "Evening";

          return {
            ...r,
            formattedDate,
            formattedTime,
            timeSlot,
          };
        });

        setVitalsRecords(formattedRecords);
      } catch (error) {
        console.error("Failed to fetch vitals records:", error);
        toast.error("Failed to fetch IPD vitals", {
          position: "top-right",
          autoClose: 2000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchVitalsRecords();
  }, [patient, doctorId, activeTab]);

  useEffect(() => {
    if (vitalsRecords.length === 0) {
      setHeaderRecordIdx(null);
    }
  }, [vitalsRecords]);

  useEffect(() => {
    if (headerRecordIdx !== null && vitalsRecords[headerRecordIdx]) {
      const selectedRecord = vitalsRecords[headerRecordIdx];
      setFormData({
        ...selectedRecord,
        timeOfDay: selectedRecord.timeOfDay || "morning",
      });
    } else {
      setFormData({ ...emptyVitals, ...data });
    }
  }, [headerRecordIdx, vitalsRecords, data]);

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
      const nowUTC = new Date();
      const istString = nowUTC.toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
      });
      const ist = new Date(istString);
      const recordedAt = new Date(
        ist.getTime() - ist.getTimezoneOffset() * 60000
      ).toISOString();
      const timeSlot = formData.timeOfDay?.toUpperCase() || "MORNING";

      const ipdVitalPayload = {
        contextId,
        patientId: patient?.patientId,
        doctorId: doctorId,
        context: activeTab.toUpperCase(),
        timeSlot,
        recordedAt,
        heartRate: +formData.heartRate,
        temperature: +formData.temperature,
        bloodSugar: +formData.bloodSugar,
        bloodPressure: formData.bloodPressure,
        respiratoryRate: +formData.respiratoryRate,
        spo2: +formData.spo2,
        height: +formData.height,
        weight: +formData.weight,
      };

      const res = await createDoctorIpdVital(ipdVitalPayload);
      toast.success("Vitals saved successfully!", {
        position: "top-right",
        autoClose: 2000,
      });

      const newRecord = {
        ...formData,
        recordedAt: recordedAt,
        formattedDate: ist.toLocaleDateString("en-IN", {
          timeZone: "Asia/Kolkata",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }),
        formattedTime: ist.toLocaleTimeString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
        timeSlot: timeSlot,
      };

      const updatedVitalsRecords = [...vitalsRecords, newRecord];
      setVitalsRecords(updatedVitalsRecords);
      setHeaderRecordIdx(updatedVitalsRecords.length - 1);
      onSave("vitals", { ...formData, vitalsRecords: updatedVitalsRecords });
      setFormData({ ...emptyVitals });
    } catch (error) {
      console.error(" Full error response:", error);
      toast.error(`Failed: ${error.response?.data?.message || error.message}`, {
        position: "top-right",
        autoClose: 2000,
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

  if (!patient) return <div>Loading patient data...</div>;

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
                onClick={() => {
                  if (headerRecordIdx === null) {
                    toast.info("Please save the vitals first, then print.", {
                      position: "top-right",
                      autoClose: 2000,
                    });
                    return;
                  }
                  onPrint("vitals", {
                    ...formData,
                    vitalsRecords,
                  });
                }}
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
                  <span className="opacity-75">({Math.round(confidence * 100)}%)</span>
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
                onClick={() => {
                  if (headerRecordIdx === null) {
                    toast.info("Please save the vitals first, then print.", {
                      position: "top-right",
                      autoClose: 2000,
                    });
                    return;
                  }
                  onPrint("vitals", {
                    ...formData,
                    vitalsRecords,
                  });
                }}
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
                  setHeaderRecordIdx(e.target.value === "" ? null : Number(e.target.value))
                }
                disabled={isLoading}
              >
                <option value="">{isLoading ? "Loading..." : "Select Record"}</option>
                {vitalsRecords.map((rec, idx) => (
                  <option
                    key={`${rec.id ?? 'rec'}-${idx}`}
                    value={idx}
                    className="text-[8px] sm:text-[12px]"
                  >
                    {rec.formattedDate} {rec.formattedTime} ({rec.timeSlot})
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
                className={`w-full rounded-lg border px-2 sm:px-3 py-1 sm:py-1.5 md:py-2 text-[10px] sm:text-xs md:text-sm ${formData[field]
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
