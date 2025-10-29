import React, { useState, useEffect, useCallback } from "react";
import {
  Heart,
  Save,
  Printer,
  AlertTriangle,
  X,
  BarChart3,
  TrendingUp,
  PieChart,
  Activity,
  Radar
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { useOptimizedVoiceRecognition } from "./useOptimizedVoiceRecognition";
import VoiceButton from "./VoiceButton";
import VitalsChart from "./VitalsChart";

const API_URL = "https://6808fb0f942707d722e09f1d.mockapi.io/health-summary";

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
};

const VitalsForm = ({ data, onSave, onPrint, setIsChartOpen, setChartVital }) => {
  const emptyVitals = {
    heartRate: "",
    temperature: "",
    bloodSugar: "",
    bloodPressure: "",
    height: "",
    weight: "",
    timeOfDay: "morning",
  };
  const [formData, setFormData] = useState({ ...emptyVitals, ...data });
  const [headerRecordIdx, setHeaderRecordIdx] = useState(null);
  const [warnings, setWarnings] = useState({});
  const [loading, setLoading] = useState(false);
  const [chartTab, setChartTab] = useState("heartRate");
  const [vitalsRecords, setVitalsRecords] = useState([]);
  const [selectedRecordIdx, setSelectedRecordIdx] = useState(null);

  useEffect(() => {
    if (headerRecordIdx === null) {
      setFormData({ ...emptyVitals });
    } else if (vitalsRecords[headerRecordIdx]) {
      const rec = vitalsRecords[headerRecordIdx];
      setFormData({
        heartRate: rec.heartRate || "",
        temperature: rec.temperature || "",
        bloodSugar: rec.bloodSugar || "",
        bloodPressure: rec.bloodPressure || "",
        height: rec.height || "",
        weight: rec.weight || "",
        timeOfDay: rec.timeOfDay || "morning",
      });
    }
  }, [headerRecordIdx, vitalsRecords]);

  useEffect(() => {
    const stored = localStorage.getItem("vitalsRecords");
    if (stored) {
      const loadedRecords = JSON.parse(stored);
      setVitalsRecords(loadedRecords);
      // Sync with parent so chart always has data
      onSave("vitals", { ...formData, vitalsRecords: loadedRecords });
    }
    // eslint-disable-next-line
  }, []);

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
      await axios.post(API_URL, { ...formData, email: "demo@demo.com" });
      // Pass the full records array to the parent
      onSave("vitals", { ...formData, vitalsRecords: [...vitalsRecords, { ...formData, timestamp: Date.now() }] });
      
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
      };
      setVitalsRecords((prev) => {
        let updated = [...prev, newRecord];
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        updated = updated.filter((r) => new Date(r.date) >= sevenDaysAgo);
        localStorage.setItem("vitalsRecords", JSON.stringify(updated));
        return updated;
      });
      
      setHeaderRecordIdx(null);
      setFormData({ ...emptyVitals });
      toast.success("✅ Vitals saved successfully!", {
        position: "top-right",
        autoClose: 2000,
      });
    } catch (error) {
      toast.error("❌ Failed to save vitals!", {
        position: "top-right",
        autoClose: 3000,
      });
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
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
    const lowerText = text.toLowerCase().trim();

    const hrMatch = lowerText.match(
      /(?:heart rate|pulse|hr)(?:\s+is|\s+of|\s+at)?\s+(\d+)/
    );
    if (hrMatch) {
      const heartRate = hrMatch[1];
      if (heartRate >= 40 && heartRate <= 200) {
        setFormData((prev) => ({ ...prev, heartRate }));
        setWarnings((prev) => ({
          ...prev,
          heartRate: validate("heartRate", heartRate),
        }));
      }
    }

    const tempMatch = lowerText.match(
      /(?:temperature|temp)(?:\s+is|\s+of|\s+at)?\s+(\d+\.?\d*)/
    );
    if (tempMatch) {
      const temperature = tempMatch[1];
      if (temperature >= 30 && temperature <= 45) {
        setFormData((prev) => ({ ...prev, temperature }));
        setWarnings((prev) => ({
          ...prev,
          temperature: validate("temperature", temperature),
        }));
      }
    }

    const bsMatch = lowerText.match(
      /(?:blood sugar|glucose|sugar level)(?:\s+is|\s+of|\s+at)?\s+(\d+)/
    );
    if (bsMatch) {
      const bloodSugar = bsMatch[1];
      if (bloodSugar >= 50 && bloodSugar <= 500) {
        setFormData((prev) => ({ ...prev, bloodSugar }));
        setWarnings((prev) => ({
          ...prev,
          bloodSugar: validate("bloodSugar", bloodSugar),
        }));
      }
    }

    const bpMatch = lowerText.match(
      /(?:blood pressure|bp)(?:\s+is|\s+of|\s+at)?\s+(\d+)\s*(?:over|\/)\s*(\d+)/
    );
    if (bpMatch) {
      const systolic = bpMatch[1];
      const diastolic = bpMatch[2];
      if (
        systolic >= 70 &&
        systolic <= 200 &&
        diastolic >= 40 &&
        diastolic <= 120
      ) {
        const bloodPressure = `${systolic}/${diastolic}`;
        setFormData((prev) => ({ ...prev, bloodPressure }));
        setWarnings((prev) => ({
          ...prev,
          bloodPressure: validate("bloodPressure", bloodPressure),
        }));
      }
    }

    const weightMatch = lowerText.match(
      /(?:weight|weighs)(?:\s+is|\s+of|\s+at)?\s+(\d+\.?\d*)/
    );
    if (weightMatch) {
      const weight = weightMatch[1];
      if (weight >= 20 && weight <= 300) {
        setFormData((prev) => ({ ...prev, weight }));
        setWarnings((prev) => ({
          ...prev,
          weight: validate("weight", weight),
        }));
      }
    }

    const heightMatch = lowerText.match(
      /(?:height|tall)(?:\s+is|\s+of|\s+at)?\s+(\d+\.?\d*)/
    );
    if (heightMatch) {
      const height = heightMatch[1];
      if (height >= 50 && height <= 250) {
        setFormData((prev) => ({ ...prev, height }));
        setWarnings((prev) => ({
          ...prev,
          height: validate("height", height),
        }));
      }
    }
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

  // Get chart icon for vital
  const getVitalIcon = (vital) => {
    switch (vital) {
      case 'heartRate': return <Heart className="w-4 h-4" />;
      case 'temperature': return <Activity className="w-4 h-4" />;
      case 'bloodSugar': return <TrendingUp className="w-4 h-4" />;
      case 'bloodPressure': return <BarChart3 className="w-4 h-4" />;
      case 'height': return <Activity className="w-4 h-4" />;
      case 'weight': return <PieChart className="w-4 h-4" />;
      default: return <BarChart3 className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-slideIn">
      <div className="sub-heading px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <Heart className="text-xl text-white" />
          <h3 className="text-white font-semibold">Vital Signs</h3>
          <div className="flex items-center gap-2 bg-white/10 px-2 py-1 rounded-lg">
            <span className="text-xs text-white">Record:</span>
            <select
              className="rounded px-1 py-0.5 text-xs bg-white text-[var(--primary-color)] border border-gray-200"
              value={headerRecordIdx === null ? "" : headerRecordIdx}
              onChange={(e) =>
                setHeaderRecordIdx(
                  e.target.value === "" ? null : Number(e.target.value)
                )
              }
            >
              <option value="">Current</option>
              {vitalsRecords.map((rec, idx) => (
                <option key={rec.timestamp} value={idx}>
                  {rec.date} {rec.time} (
                  {rec.timeOfDay === "morning" ? "Morning" : "Evening"})
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 bg-white/10 px-2 py-1 rounded-lg">
            <label className="flex items-center gap-1 text-xs text-white">
              <input
                type="radio"
                name="timeOfDay"
                value="morning"
                checked={formData.timeOfDay === "morning"}
                onChange={handleChange}
                className="accent-[var(--accent-color)]"
              />
              Morning
            </label>
            <label className="flex items-center gap-1 text-xs text-white">
              <input
                type="radio"
                name="timeOfDay"
                value="evening"
                checked={formData.timeOfDay === "evening"}
                onChange={handleChange}
                className="accent-[var(--accent-color)]"
              />
              Evening
            </label>
          </div>
          <VoiceButton
            isListening={isListening}
            onToggle={toggleListening}
            isSupported={isSupported}
            size="md"
            confidence={confidence}
          />
          {isListening && (
            <div className="flex items-center gap-2 text-white text-sm">
              <span className="animate-pulse">🎤 Listening...</span>
              {confidence > 0 && (
                <span className="text-xs opacity-75">
                  ({Math.round(confidence * 100)}%)
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 text-white mt-2 md:mt-0">
          <button
            onClick={save}
            disabled={loading}
            className="hover:bg-[var(--primary-color)] hover:bg-opacity-20 p-2 rounded-lg transition-colors"
          >
            <Save className="w-5 h-5" />
          </button>
          <button
            onClick={() => onPrint("vitals")}
            className="hover:bg-[var(--primary-color)] hover:bg-opacity-20 p-2 rounded-lg transition-colors"
          >
            <Printer className="w-5 h-5" />
          </button>
     <button
  onClick={() => {
    setChartVital("heartRate"); // Set the vital you want to display
    setIsChartOpen(true); // Open the modal
  }}
  className="hover:bg-[var(--primary-color)] hover:bg-opacity-20 p-2 rounded-lg transition-colors flex items-center gap-1 bg-white/10 px-3 py-2 rounded-lg"
>
  <BarChart3 className="w-4 h-4" />
  <span className="text-xs font-medium">Charts & Analytics</span>
</button>
        </div>
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.keys(vitalRanges).map((field) => (
          <div key={field} className="space-y-2">
            <label className="block text-sm font-medium text-[var(--primary-color)]">
              {field
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (c) => c.toUpperCase())}
            </label>
            <div className="relative">
              <input
                name={field}
                value={formData[field]}
                onChange={handleChange}
                placeholder={vitalRanges[field].placeholder}
                className={`input-field ${
                  formData[field]
                    ? "bg-green-50 border-green-300 ring-2 ring-green-200"
                    : ""
                }`}
              />
              {formData[field] && (
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm pointer-events-none">
                  {vitalRanges[field].label}
                </span>
              )}
            </div>
            {warnings[field] && (
              <span className="flex items-center text-xs text-yellow-700 bg-yellow-100 rounded-lg px-3 py-2 gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                {warnings[field]}
              </span>
            )}
          </div>
        ))}
      </div>
      
    

      {/* Voice Input Display */}
      {transcript && (
        <div className="px-6 pb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <strong className="text-blue-800 text-sm">Voice Input:</strong>
            <span className="text-blue-700 ml-2 text-sm">{transcript}</span>
            {isListening && (
              <div className="text-sm text-blue-600 mt-1">
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