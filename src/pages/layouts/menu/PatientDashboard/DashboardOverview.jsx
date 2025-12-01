import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaHeartbeat,
  FaThermometerHalf,
  FaTint,
  FaStethoscope,
  FaPlusCircle,
  FaCalendarAlt,
  FaChevronRight,
} from "react-icons/fa";
import { Activity, Droplets, Mic, MicOff } from "lucide-react";
import { useSelector } from "react-redux";
import ReusableModal from "../../../../components/microcomponents/Modal";
import AppointmentList from "./AppointmentList";
import {
  getVitalsById,
  createVitals,
  updateVitals,
} from "../../../../utils/CrudService";

const DashboardOverview = () => {
  const patientId = useSelector((s) => s.auth?.user?.patientId);

  const [healthSummary, setHealthSummary] = useState({});
  const [summaryId, setSummaryId] = useState(null);
  const [isNew, setIsNew] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalFormVals, setModalFormVals] = useState({});
  const [modalErrors, setModalErrors] = useState({});

  // Voice input state
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [recognition, setRecognition] = useState(null);
  const [isSupported, setIsSupported] = useState(false);

  // Initialize voice recognition
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    ) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = "en-US";
      setRecognition(recognitionInstance);
      setIsSupported(true);
    }
  }, []);

  // Start/stop voice recognition
  const startListening = () => {
    if (recognition && !isListening) {
      setTranscript("");
      recognition.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const toggleListening = () => {
    if (isListening) stopListening();
    else startListening();
  };

  const resetTranscript = () => setTranscript("");

  // Handle voice recognition results
  useEffect(() => {
    if (recognition) {
      recognition.onresult = (event) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal)
            finalTranscript += event.results[i][0].transcript;
        }
        if (finalTranscript) setTranscript(finalTranscript);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
    }
  }, [recognition]);

  // Parse vitals from speech
  const parseVitalFromSpeech = (transcript, vitalType) => {
    const text = transcript.toLowerCase().trim();
    const patterns = {
      heartRate: { regex: /heart rate.*?(\d{2,3})/i, simple: /^(\d{2,3})$/ },
      temperature: {
        regex: /temperature.*?(\d{1,2}\.\d?)/i,
        simple: /^(\d{1,2}\.\d?)$/,
      },
      bloodSugar: { regex: /blood sugar.*?(\d{2,3})/i, simple: /^(\d{2,3})$/ },
      bloodPressure: {
        regex: /blood pressure.*?(\d{2,3})\s*(?:over|\/)\s*(\d{2,3})/i,
        simple: /^(\d{2,3})\s*\/\s*(\d{2,3})$/,
      },
      respiratoryRate: { regex: /respiratory rate.*?(\d{1,2})/i },
      spo2: { regex: /spo2.*?(\d{2,3})/i },
      steps: { regex: /steps.*?(\d{1,6})/i },
    };
    const vitalPattern = patterns[vitalType];
    if (!vitalPattern) return null;
    const match =
      text.match(vitalPattern.regex) || text.match(vitalPattern.simple);
    if (!match) return null;
    if (vitalType === "bloodPressure" && match[2])
      return `${match[1]}/${match[2]}`;
    return match[1];
  };

  const parseMultipleVitals = (transcript) => {
    const vitals = {};
    const vitalTypes = [
      "heartRate",
      "temperature",
      "bloodSugar",
      "bloodPressure",
      "respiratoryRate",
      "spo2",
      "steps",
    ];
    vitalTypes.forEach((vitalType) => {
      const value = parseVitalFromSpeech(transcript, vitalType);
      if (value) vitals[vitalType] = value;
    });
    return vitals;
  };

  // Update modal form values from voice input
  useEffect(() => {
    if (transcript && !isListening) {
      const parsedVitals = parseMultipleVitals(transcript);
      if (Object.keys(parsedVitals).length > 0) {
        setModalFormVals((prev) => ({ ...prev, ...parsedVitals }));
        const clearedErrors = { ...modalErrors };
        Object.keys(parsedVitals).forEach((key) => {
          delete clearedErrors[key];
        });
        setModalErrors(clearedErrors);
        setTimeout(() => resetTranscript(), 1000);
      }
    }
  }, [transcript, isListening]);

  // Vitals fields configuration
  const vitalFields = [
    {
      name: "heartRate",
      label: "Heart Rate",
      type: "number",
      unit: "bpm",
      normalRange: "60-100 bpm",
    },
    {
      name: "temperature",
      label: "Temperature",
      type: "number",
      unit: "°C",
      step: "0.1",
      normalRange: "36.1-37.2 °C",
    },
    {
      name: "bloodSugar",
      label: "Blood Sugar",
      type: "number",
      unit: "mg/dL",
      normalRange: "70-140 mg/dL",
    },
    {
      name: "bloodPressure",
      label: "Blood Pressure",
      type: "text",
      unit: "mmHg",
      normalRange: "120/80 mmHg",
    },
    {
      name: "respiratoryRate",
      label: "Respiratory Rate",
      type: "number",
      unit: "breaths/min",
      normalRange: "12-20 breaths/min",
    },
    {
      name: "spo2",
      label: "SpO₂",
      type: "number",
      unit: "%",
      normalRange: ">= 95%",
    },
    {
      name: "steps",
      label: "Steps",
      type: "number",
      unit: "steps",
      normalRange: "Varies",
    },
  ];

  // Fetch health summary
  useEffect(() => {
    if (!patientId) return;
    (async () => {
      try {
        const res = await getVitalsById(patientId);
        if (res.data) {
          setHealthSummary(res.data);
          setSummaryId(res.data.id);
          setIsNew(false);
        } else {
          setHealthSummary({});
          setIsNew(true);
        }
      } catch (error) {
        console.error("Error fetching vitals:", error);
      }
    })();
  }, [patientId]);

  // Save vitals (create/update)
  const saveHealthSummary = async (formVals) => {
    if (!patientId) {
      console.error("patientId not found");
      return;
    }
    const vitals = {
      ...formVals,
      patientId,
      lastUpdated: new Date().toISOString(),
    };
    try {
      const response = isNew
        ? await createVitals(vitals)
        : await updateVitals(summaryId, vitals);
      setHealthSummary(response.data);
      setSummaryId(response.data.id);
      setIsNew(false);
      setShowModal(false);
    } catch (error) {
      console.error("Error saving vitals:", error);
    }
  };

  // Modal handlers
  const handleOpenModal = () => {
    // Pre-fill with existing vitals if available
    if (healthSummary && Object.keys(healthSummary).length > 0) {
      const existingVitals = {};
      vitalFields.forEach((f) => {
        if (healthSummary[f.name] !== undefined && healthSummary[f.name] !== null) {
          existingVitals[f.name] = healthSummary[f.name];
        }
      });
      setModalFormVals(existingVitals);
    } else {
      setModalFormVals({});
    }
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  // Summary cards
  const summaryCards = [
    {
      label: "Heart Rate",
      value: healthSummary.heartRate,
      unit: "bpm",
      icon: <FaHeartbeat className="text-base text-[var(--accent-color)]" />,
    },
    {
      label: "Temperature",
      value: healthSummary.temperature,
      unit: "°C",
      icon: (
        <FaThermometerHalf className="text-base text-[var(--accent-color)]" />
      ),
    },
    {
      label: "Blood Sugar",
      value: healthSummary.bloodSugar,
      unit: "mg/dL",
      icon: <FaTint className="text-base text-[var(--accent-color)]" />,
    },
    {
      label: "Blood Pressure",
      value: healthSummary.bloodPressure,
      unit: "mmHg",
      icon: <FaStethoscope className="text-base text-[var(--accent-color)]" />,
    },
    {
      label: "Respiratory Rate",
      value: healthSummary.respiratoryRate,
      unit: "breaths/min",
      icon: <Activity className="w-4 h-4 text-[var(--accent-color)]" />,
    },
    {
      label: "SpO₂",
      value: healthSummary.spo2,
      unit: "%",
      icon: <Droplets className="w-4 h-4 text-[var(--accent-color)]" />,
    },
  ];

  return (
    <div className="bg-[var(--color-surface)] text-[var(--primary-color)]">
      <div className="max-w-full mx-auto custom-scrollbar">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Appointments */}
          <div className="flex-1 overflow-x-auto rounded-2xl slide-in-up sm:p-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <h4 className="h4-heading flex items-center gap-2 sm:gap-3 text-base sm:text-lg">
                <FaCalendarAlt className="text-[var(--accent-color)]" />
                Recent Appointments
              </h4>
              <Link
                to="/patientdashboard/appointments"
                className="text-[var(--primary-color)] font-medium hover:text-[var(--accent-color)] transition-colors duration-200 flex items-center space-x-1 text-sm"
              >
                <span>View All</span>
                <FaChevronRight className="text-xs" />
              </Link>
            </div>
            <div className="overflow-x-auto custom-scrollbar pt-3">
              <AppointmentList
                displayType="doctor"
                showOnlyDoctorColumns={true}
                isOverview={true}
              />
            </div>
          </div>

          {/* Health Summary */}
          <div className="w-full lg:w-1/2 rounded-2xl slide-in-up">
            <div className="flex justify-between items-center mb-6">
              <h4 className="h4-heading flex items-center gap-3">
                <FaHeartbeat className="text-[var(--accent-color)]" />
                Health Summary
              </h4>
              <button
                className="btn-secondary animate-bounce-gentle"
                onClick={handleOpenModal}
              >
                <FaPlusCircle />
                {isNew ? "Add Vital" : "Update"}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              {summaryCards.map((item, idx) => {
                const hasData =
                  item.value !== undefined &&
                  item.value !== null &&
                  item.value !== "" &&
                  item.value !== "N/A";
                return (
                  <div
                    key={idx}
                    className="card-stat hover:shadow-lg transition-all duration-300 sm:p-4 rounded-xl bg-white"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">{item.icon}</div>
                      <div>
                        <h5 className="card-stat-label font-semibold text-sm sm:text-base">
                          {item.label}
                        </h5>
                        {hasData ? (
                          <div className="flex items-baseline space-x-1">
                            <span className="font-semibold text-sm sm:text-lg">
                              {item.value}
                            </span>
                            <span className="text-xs paragraph">
                              {item.unit}
                            </span>
                          </div>
                        ) : (
                          <button
                            onClick={handleOpenModal}
                            className="text-xs mt-1 px-2 py-1 bg-gray-100 paragraph hover:bg-[var(--accent-color)] hover:text-white rounded-full transition-all duration-200"
                          >
                            + Add
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {healthSummary.lastUpdated && (
              <div className="mt-6 pt-4 border-t border-gray-100">
                <p className="text-xs paragraph text-center">
                  Last updated: {healthSummary.lastUpdated}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <ReusableModal
        isOpen={showModal}
        onClose={handleCloseModal}
        mode={isNew ? "add" : "edit"}
        title={isNew ? "Add Vital Details" : "Update Vital Details"}
        fields={vitalFields}
        data={modalFormVals}
        saveLabel={isNew ? "Save" : "Update"}
        cancelLabel="Cancel"
        onSave={saveHealthSummary}
        extraContent={
          isSupported && (
            <div className="mb-4">
              <button
                type="button"
                onClick={toggleListening}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg border-none focus:outline-none ${
                  isListening
                    ? "bg-red-500 text-white animate-pulse ring-4 ring-red-200"
                    : "bg-[var(--accent-color)] text-white hover:bg-[var(--accent-color)]/80"
                }`}
                title={
                  isListening ? "Stop voice input" : "Start voice input"
                }
              >
                {isListening ? (
                  <MicOff className="w-6 h-6" />
                ) : (
                  <Mic className="w-6 h-6" />
                )}
              </button>
              <span className="ml-3 text-sm font-medium text-gray-700 align-middle">
                {isListening ? "Listening..." : "Voice Input"}
              </span>
              {transcript && (
                <div className="mt-2 text-blue-700 text-sm">
                  Heard: <span className="font-semibold">{transcript}</span>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Say vitals like: "Heart rate 72, temperature 98.6, blood
                pressure 120 over 80"
              </p>
            </div>
          )
        }
      />
    </div>
  );
};

export default DashboardOverview;