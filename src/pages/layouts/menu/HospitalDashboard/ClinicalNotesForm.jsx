import React, { useState, useEffect, useCallback } from "react";
import { FileText, Save, Printer, Import } from "lucide-react";


import { useOptimizedVoiceRecognition } from "./useOptimizedVoiceRecognition";
import VoiceButton from "./VoiceButton";

const ClinicalNotesForm = ({ data, onSave, onPrint }) => {
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
      data || { chiefComplaint: "", history: "", advice: "", plan: "" }
    );
  }, [data]);

  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSave = () => {
    onSave("clinical", formData);
  
  };

  const parseClinicalNotesFromSpeech = useCallback((text, confidence, type) => {
    const lowerText = text.toLowerCase().trim();

    // Chief complaint parsing
    const ccMatch = lowerText.match(
      /(?:chief complaint|main complaint|primary complaint)[\s:]*([\w\W]+?)(?:\.|$|history|advice|plan)/i
    );
    if (ccMatch && ccMatch[1].trim().length > 2) {
      setFormData((prev) => ({ ...prev, chiefComplaint: ccMatch[1].trim() }));
    }

    // History parsing
    const historyMatch = lowerText.match(
      /(?:history|medical history|past history)[\s:]*([\w\W]+?)(?:\.|$|chief|advice|plan)/i
    );
    if (historyMatch && historyMatch[1].trim().length > 2) {
      setFormData((prev) => ({ ...prev, history: historyMatch[1].trim() }));
    }

    // Advice parsing
    const adviceMatch = lowerText.match(
      /(?:advice|diagnosis|clinical advice)[\s:]*([\w\W]+?)(?:\.|$|chief|history|plan)/i
    );
    if (adviceMatch && adviceMatch[1].trim().length > 2) {
      setFormData((prev) => ({ ...prev, advice: adviceMatch[1].trim() }));
    }

    // Plan parsing
    const planMatch = lowerText.match(
      /(?:plan|treatment plan|management plan)[\s:]*([\w\W]+?)(?:\.|$|chief|history|advice)/i
    );
    if (planMatch && planMatch[1].trim().length > 2) {
      setFormData((prev) => ({ ...prev, plan: planMatch[1].trim() }));
    }
  }, []);

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
          <h3 className="text-white font-semibold">Clinical Notes</h3>
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
        <div className="flex items-center gap-3 text-white">
          <button
            onClick={handleSave}
            className="hover:bg-[var(--primary-color)] hover:bg-opacity-20 p-2 rounded-lg transition-colors"
          >
            <Save className="w-5 h-5" />
          </button>
          <button
            onClick={() => onPrint("clinical")}
            className="hover:bg-[var(--primary-color)] hover:bg-opacity-20 p-2 rounded-lg transition-colors"
          >
            <Printer className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {["chiefComplaint", "history", "advice", "plan"].map((field) => (
          <div key={field} className="space-y-2">
            <label className="block text-sm font-medium text-[var(--primary-color)]">
              {field
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (c) => c.toUpperCase())}
            </label>
            <textarea
              name={field}
              value={formData[field]}
              onChange={handleChange}
              className={`input-field min-h-[80px] resize-none ${
                formData[field]
                  ? "bg-green-50 border-green-300 ring-2 ring-green-200"
                  : ""
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
            <strong className="text-green-800 text-sm">Voice Input:</strong>
            <span className="text-green-700 text-sm ml-2">{transcript}</span>
            {isListening && (
              <div className="text-sm text-green-600 mt-1">
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
