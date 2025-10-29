import React, { useState, useEffect, useCallback } from "react";
import { FileText, Save, Printer } from "lucide-react";
import { toast } from "react-toastify";
import VoiceButton from "./VoiceButton";
import { useOptimizedVoiceRecognition } from "./useOptimizedVoiceRecognition";
import { createClinicalNote } from "../../../../../utils/masterService";
import { useSelector } from "react-redux";
import { usePatientContext } from "../../../../../context-api/PatientContext"; // Adjust the import path as needed

const ClinicalNotesForm = ({
  data,
  onSave,
  onPrint,
  ptemail,
  hospitalname,
  drEmail,
  drname,
  patientname,
  diagnosis,
  type,
}) => {
  const doctorId = useSelector((state) => state.auth.doctorId);
  const { activeTab, patients } = usePatientContext(); // Access activeTab and patients from context

  // Log doctorId and activeTab when the component mounts or when they change
  useEffect(() => {
    console.log("Doctor ID from Redux:", doctorId);
    console.log("Active Tab from Context:", activeTab);
    console.log("Patients from Context:", patients);
  }, [doctorId, activeTab, patients]);

  const [formData, setFormData] = useState(
    data || {
      chiefComplaint: "",
      history: "",
      advice: "",
      plan: "",
    }
  );

  useEffect(() => {
    setFormData(
      data || {
        chiefComplaint: "",
        history: "",
        advice: "",
        plan: "",
      }
    );
  }, [data]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    console.log("Doctor ID being used in handleSave:", doctorId);
    console.log("Active Tab being used in handleSave:", activeTab);
    console.log("Patients from Context in handleSave:", patients);

    const patientId = patients.length > 0 ? patients[0].id : 1; 
    const currentTimestamp = new Date().toISOString();
    const clinicalNotePayload = {
      patientId: patientId, // Use patientId from context
      doctorId: doctorId || 1, // Use doctorId from Redux
      context:  activeTab.toUpperCase(), // Use activeTab from context
      chiefComplaint: formData.chiefComplaint,
      history: formData.history,
      advice: formData.advice,
      plan: formData.plan,
      createdBy: drname,
      createdAt: currentTimestamp,
      updatedBy: drname,
      updatedAt: currentTimestamp,
    };

    try {
      const clinicalNoteResponse = await createClinicalNote(clinicalNotePayload);
      if (!clinicalNoteResponse) {
        throw new Error("Failed to save clinical note.");
      }
      toast.success(" Clinical notes saved and posted successfully!", {
        position: "top-right",
        autoClose: 2000,
        closeOnClick: true,
      });
      onSave("clinical", formData);
    } catch (error) {
      console.error("API Error:", error.response ? error.response.data : error.message);
      toast.error(` ${error.response ? error.response.data.message : error.message}`, {
        position: "top-right",
        autoClose: 2000,
        closeOnClick: true,
      });
    }
  };

  const parseClinicalNotesFromSpeech = useCallback(
    (text, confidence, type) => {
      const lowerText = text.toLowerCase().trim();
      const ccMatch = lowerText.match(
        /(?:chief complaint|main complaint|primary complaint)[\s:]*([\w\W]+?)(?:\.|$|history|advice|plan)/i
      );
      if (ccMatch && ccMatch[1].trim().length > 2) {
        setFormData((prev) => ({ ...prev, chiefComplaint: ccMatch[1].trim() }));
      }
      const historyMatch = lowerText.match(
        /(?:history|medical history|past history)[\s:]*([\w\W]+?)(?:\.|$|chief|advice|plan)/i
      );
      if (historyMatch && historyMatch[1].trim().length > 2) {
        setFormData((prev) => ({ ...prev, history: historyMatch[1].trim() }));
      }
      const adviceMatch = lowerText.match(
        /(?:advice|diagnosis|clinical advice)[\s:]*([\w\W]+?)(?:\.|$|chief|history|plan)/i
      );
      if (adviceMatch && adviceMatch[1].trim().length > 2) {
        setFormData((prev) => ({ ...prev, advice: adviceMatch[1].trim() }));
      }
      const planMatch = lowerText.match(
        /(?:plan|treatment plan|management plan)[\s:]*([\w\W]+?)(?:\.|$|chief|history|advice)/i
      );
      if (planMatch && planMatch[1].trim().length > 2) {
        setFormData((prev) => ({ ...prev, plan: planMatch[1].trim() }));
      }
    },
    []
  );

  const { isListening, transcript, isSupported, confidence, toggleListening } =
    useOptimizedVoiceRecognition(parseClinicalNotesFromSpeech, {
      continuous: true,
      interimResults: true,
      lang: "en-US",
      sensitivity: 0.4,
      pauseThreshold: 1500,
      maxAlternatives: 3,
      realTimeProcessing: true,
    });

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-slideIn">
      <div className="sub-heading px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <FileText className="text-xl text-white" />
          <h3 className="text-white font-semibold text-sm sm:text-base">
            Clinical Notes
          </h3>
          <VoiceButton
            isListening={isListening}
            onToggle={toggleListening}
            isSupported={isSupported}
            size="md"
            confidence={confidence}
          />
          {isListening && (
            <div className="flex items-center gap-2 text-white text-xs sm:text-sm">
              <span className="animate-pulse">🎤 Listening...</span>
              {confidence > 0 && (
                <span className="opacity-75">({Math.round(confidence * 100)}%)</span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 text-white">
          <button
            onClick={handleSave}
            className="hover:bg-[var(--primary-color)] hover:bg-opacity-20 p-2 rounded-lg transition-colors"
          >
            <Save className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={() => onPrint("clinical", formData)}
            className="hover:bg-[var(--primary-color)] hover:bg-opacity-20 p-2 rounded-lg transition-colors"
          >
            <Printer className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {["chiefComplaint", "history", "advice", "plan"].map((field) => (
          <div key={field} className="space-y-2">
            <label className="block text-xs sm:text-sm font-medium text-[var(--primary-color)]">
              {field
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (str) => str.toUpperCase())}
            </label>
            <textarea
              name={field}
              value={formData[field]}
              onChange={handleChange}
              className={`input-field text-xs sm:text-sm min-h-[80px] resize-none ${
                formData[field] ? "bg-green-50 border-green-300 ring-2 ring-green-200" : ""
              }`}
              placeholder={`Enter ${field
                .replace(/([A-Z])/g, " $1")
                .toLowerCase()}...`}
            />
          </div>
        ))}
      </div>
      {transcript && (
        <div className="px-6 pb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <strong className="text-green-800 text-xs sm:text-sm">Voice Input:</strong>
            <span className="text-green-700 text-xs sm:text-sm ml-2">{transcript}</span>
            {isListening && (
              <div className="text-xs sm:text-sm text-green-600 mt-1">
                <em>Speaking... Fields will update automatically</em>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClinicalNotesForm;