

import React, { useState, useEffect } from "react";
import { Heart, Activity, Thermometer, Pencil } from "lucide-react";
import {
  getPatientVitalById,
  createPatientVital,
  updatePatientVital,
} from "../../../../../../utils/masterService";
import ReusableModal from "../../../../../../components/microcomponents/Modal";
import { ErrorBoundary } from "react-error-boundary";

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert" className="p-4 bg-red-50 text-red-700 rounded-lg">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <button
        onClick={resetErrorBoundary}
        className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg"
      >
        Try again
      </button>
    </div>
  );
}

const VitalsTab = ({
  isExactPatient,
  isExactDoctor,
  patientId,
  recordId,
  recordTab,
}) => {
  // State Management
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [vitalId, setVitalId] = useState(null);
  const [vitalsData, setVitalsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [vitalsExist, setVitalsExist] = useState(false);
  const [vitalsError, setVitalsError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Vitals Fields Configuration
  const vitalsFields = [
    {
      name: "bloodPressure",
      label: "Blood Pressure",
      type: "text",
      placeholder: "120/80",
      unit: "mmHg",
      required: true,
    },
    {
      name: "heartRate",
      label: "Heart Rate",
      type: "number",
      placeholder: "72",
      unit: "bpm",
      required: true,
    },
    {
      name: "temperature",
      label: "Temperature",
      type: "number",
      placeholder: "36.5",
      unit: "°C",
      required: true,
    },
    {
      name: "respiratoryRate",
      label: "Respiratory Rate",
      type: "number",
      placeholder: "16",
      unit: "bpm",
    },
    {
      name: "spo2",
      label: "SpO2",
      type: "number",
      placeholder: "98",
      unit: "%",
    },
    {
      name: "height",
      label: "Height",
      type: "number",
      placeholder: "170",
      unit: "cm",
    },
    {
      name: "weight",
      label: "Weight",
      type: "number",
      placeholder: "65",
      unit: "kg",
    },
  ];

  // Fetch Vitals Data
  useEffect(() => {
    const fetchVitals = async () => {
      if (!patientId || !recordId) {
        console.warn("No patientId or recordId provided.");
        return;
      }
      try {
        setLoading(true);
        setError(null);
        setVitalsExist(false);
        console.log("📌 Fetching vitals for patientId:", patientId, "recordId:", recordId);
        const recordType = recordTab?.toLowerCase() || 'opd';
        const recordIdParam = `${recordType}RecordId`;
        const params = {
          [recordIdParam]: recordId,
          consultationType: recordTab,
        };
        console.log("Sending params:", params);
        const response = await getPatientVitalById(patientId, params);
        console.log("📥 API Response:", response);
        const payloadData = response.data?.data ?? response.data;
        const patientVitals = Array.isArray(payloadData) ? payloadData[0] ?? null : payloadData;
        if (patientVitals && Object.keys(patientVitals).length > 0) {
          setVitalsExist(true);
          const updatedVitals = {
            bloodPressure: patientVitals.bloodPressure || patientVitals.blood_pressure || "--",
            heartRate: patientVitals.heartRate || patientVitals.heart_rate || "--",
            temperature: patientVitals.temperature || patientVitals.temp || "--",
            spo2: patientVitals.spo2 || patientVitals.spO2 || "--",
            respiratoryRate: patientVitals.respiratoryRate || patientVitals.respiratory_rate || "--",
            height: patientVitals.height || "--",
            weight: patientVitals.weight || "--",
            id: patientVitals.id,
          };
          console.log("Updated vitalsData:", updatedVitals);
          setVitalsData(updatedVitals);
          setVitalId(patientVitals.id);
          setVitalsExist(true);
        } else {
          console.warn("⚠️ No vitals found for this record!");
          setVitalsData({
            bloodPressure: "--",
            heartRate: "--",
            temperature: "--",
            spo2: "--",
            respiratoryRate: "--",
            height: "--",
            weight: "--",
          });
          setVitalsExist(false);
        }
      } catch (err) {
        console.error("❌ Error fetching vitals:", err.response || err);
        if (err.response?.status === 404 || err.message?.includes('No vitals found')) {
          setVitalsExist(false);
          setError("No vitals recorded for this consultation yet.");
        } else {
          setError(err.response?.data?.message || err.message || "Failed to fetch vitals");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchVitals();
  }, [patientId, recordId, recordTab]);

  // Save Vitals (Add/Update)
  const handleSaveVitals = async (formData) => {
    try {
      setIsSaving(true);
      setVitalsError(null);

      // Validate required fields
      if (!formData.bloodPressure || !formData.heartRate || !formData.temperature) {
        throw new Error("Blood Pressure, Heart Rate, and Temperature are required.");
      }

      const recordType = recordTab?.toLowerCase() || 'opd';
      const recordIdParam = `${recordType}RecordId`;

      // Prepare payload
      const payload = {
        patientId: Number(patientId),
        recordId: Number(recordId),
        heartRate: parseInt(formData.heartRate, 10),
        temperature: parseFloat(formData.temperature),
        bloodPressure: formData.bloodPressure,
        respiratoryRate: parseInt(formData.respiratoryRate, 10) || 0,
        spo2: parseInt(formData.spo2, 10) || 0,
        height: parseFloat(formData.height) || 0,
        weight: parseFloat(formData.weight) || 0,
        consultationType: recordTab || 'OPD',
      };

      console.log("Sending payload to server:", payload);

      // Send request
      if (vitalsExist && vitalId) {
        await updatePatientVital(vitalId, payload);
      } else {
        await createPatientVital(payload);
      }

      // Refresh data
      const refreshParams = { [recordIdParam]: recordId, consultationType: recordTab };
      const response = await getPatientVitalById(patientId, refreshParams);
      if (response?.data) {
        const vitals = response.data.data || response.data;
        const vitalsData = Array.isArray(vitals) ? vitals[0] : vitals;
        if (vitalsData) {
          setVitalsData({
            bloodPressure: vitalsData.bloodPressure || vitalsData.blood_pressure || "--",
            heartRate: vitalsData.heartRate || vitalsData.heart_rate || "--",
            temperature: vitalsData.temperature || vitalsData.temp || "--",
            respiratoryRate: vitalsData.respiratoryRate || vitalsData.respiratory_rate || "--",
            spo2: vitalsData.spo2 || vitalsData.spO2 || "--",
            height: vitalsData.height || "--",
            weight: vitalsData.weight || "--",
          });
          setVitalsExist(true);
        }
      }
      setShowUpdateModal(false);
    } catch (err) {
      console.error("❌ Error saving vitals:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to save vitals. Please check your input and try again.";
      setVitalsError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // Vitals Cards Configuration
  const vitalsCards = [
    { key: "bloodPressure", icon: Heart, color: "red", label: "Blood Pressure" },
    { key: "heartRate", icon: Activity, color: "blue", label: "Heart Rate" },
    { key: "temperature", icon: Thermometer, color: "orange", label: "Temperature" },
    { key: "spo2", icon: Activity, color: "emerald", label: "SpO2" },
    { key: "respiratoryRate", icon: Activity, color: "violet", label: "Respiratory Rate" },
    { key: "height", icon: Activity, color: "cyan", label: "Height" },
    { key: "weight", icon: Activity, color: "amber", label: "Weight" },
  ];

  // Render Loading State
  if (loading) {
    return <div className="p-4 text-center">Loading vitals...</div>;
  }

  // Render No Vitals State
  if (!vitalsExist && !error) {
    return (
      <div className="p-6 text-center">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 inline-block">
          <p className="text-blue-700">No vitals recorded for this consultation yet.</p>
          {!isExactDoctor && (
            <button
              onClick={() => setShowUpdateModal(true)}
              className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              + Add Vitals
            </button>
          )}
        </div>
      </div>
    );
  }

  // Main Render
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="space-y-4 md:space-y-6">
        {/* Error Message */}
        {error && (
          <div className="">
           
          </div>
        )}
        {/* Add/Update Modal */}
        <ReusableModal
          isOpen={showUpdateModal}
          onClose={() => {
            setShowUpdateModal(false);
            setVitalsError(null);
          }}
          title={vitalsExist ? "Update Vitals" : "Add Vitals"}
          mode="edit"
          saveLabel={isSaving ? "Saving..." : vitalsExist ? "Update Vitals" : "Add Vitals"}
          fields={vitalsFields}
          data={{
            bloodPressure: vitalsData?.bloodPressure !== "--" ? String(vitalsData?.bloodPressure || "") : "",
            heartRate: vitalsData?.heartRate !== "--" ? String(vitalsData?.heartRate || "") : "",
            temperature: vitalsData?.temperature !== "--" ? String(vitalsData?.temperature || "") : "",
            respiratoryRate: vitalsData?.respiratoryRate !== "--" ? String(vitalsData?.respiratoryRate || "") : "",
            spo2: vitalsData?.spo2 !== "--" ? String(vitalsData?.spo2 || "") : "",
            height: vitalsData?.height !== "--" ? String(vitalsData?.height || "") : "",
            weight: vitalsData?.weight !== "--" ? String(vitalsData?.weight || "") : "",
          }}
          onSave={handleSaveVitals}
          shouldValidate={true}
          error={vitalsError}
        />
        {/* Title + Update Button */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Activity size={20} className="text-green-600" />
            <h3 className="text-lg font-semibold">Vitals Summary</h3>
          </div>
          {!isExactDoctor && (
            <button
              onClick={() => setShowUpdateModal(true)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg flex items-center gap-2"
            >
              <Pencil size={16} />
              {vitalsExist ? "Update" : "Add Vitals"}
            </button>
          )}
        </div>
        {/* Vitals Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 p-2">
          {vitalsCards.map(({ key, icon: Icon, color, label }) => (
            <div
              key={key}
              className={`bg-${color}-50 border-l-4 border-${color}-500 p-3 rounded-lg shadow-sm`}
            >
              <div className="flex items-center gap-2">
                <Icon size={16} className={`text-${color}-500`} />
                <span className={`text-sm font-medium text-${color}-700`}>
                  {label}
                </span>
              </div>
              <div className={`text-lg font-semibold text-${color}-800 mt-1`}>
                {vitalsData?.[key] ?? "--"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default VitalsTab;
