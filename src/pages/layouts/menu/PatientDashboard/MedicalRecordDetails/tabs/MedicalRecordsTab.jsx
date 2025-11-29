
import React, { useState, useEffect } from "react";
import { FileText } from "lucide-react";
import DynamicTable from "../../../../../../components/microcomponents/DynamicTable";
import DocsReader from "../../../../../../components/DocsReader";
import { getPatientMedicalInfo } from "../../../../../../utils/masterService";

// ... existing imports ...

const MedicalRecordTab = ({
  activeTab,
  isExactPatient,
  isExactDoctor,
  patientId,
  recordId,
  recordTab,
  renderMedicalGrid,
}) => {
  const [medicalInfo, setMedicalInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
   const fetchMedicalInfo = async () => {
  try {
    setLoading(true);
    setError(null);
    console.log("Fetching medical info for Patient ID:", patientId, "Record ID:", recordId);
    const recordType = recordTab?.toLowerCase() || "";
    const recordIdParam = `${recordType}RecordId`;
    const params = {
      patientId,
      [recordIdParam]: recordId,
    };
    console.log("API Request Params:", params);
    
    // Log the API call
    console.log("Making API call to getPatientMedicalInfo with:", { patientId, params });
    const response = await getPatientMedicalInfo(patientId, params);
    console.log("Raw API Response:", response);
    
    if (response?.data) {
      console.log("API Response Data:", response.data);
      
      // Handle case where data might be an array
      let medicalData;
      if (Array.isArray(response.data)) {
        // If it's an array, take the first item
        medicalData = response.data[0] || {};
      } else {
        // If it's an object, use it directly
        medicalData = response.data.data || response.data;
      }
      
      console.log("Processed Medical Data:", medicalData);
      
      if (medicalData && Object.keys(medicalData).length > 0) {
        console.log("Setting medicalInfo with:", medicalData);
        setMedicalInfo(medicalData);
      } else {
        console.warn("Medical data is empty");
        setError("No medical information available for this record");
      }
    } else {
      console.warn("No data in API response");
      setError("No medical information found");
    }
  } catch (error) {
    console.error("Error fetching medical info:", error);
    setError(error.response?.data?.message || "Failed to load medical information");
  } finally {
    setLoading(false);
  }
};
    fetchMedicalInfo();
  }, [recordId, patientId, recordTab]);

  // Debug: Log medicalInfo whenever it changes
  useEffect(() => {
    console.log("Current medicalInfo:", medicalInfo);
  }, [medicalInfo]);

  if (loading) {
    return (
      <div className="text-center py-6 md:py-8 text-sm md:text-base">
        Loading medical info...
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-4">
        <DocsReader />
        <p className="mt-4 text-gray-600 text-sm md:text-base">
          {error}
        </p>
      </div>
    );
  }

  if (!medicalInfo) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-4">
        <DocsReader />
        <p className="mt-4 text-gray-600 text-sm md:text-base">
          No medical information available for this patient.
        </p>
      </div>
    );
  }

  // Debug: Log the data being passed to renderMedicalGrid
// Update the medicalInfoGrid mapping to match the API response structure
const medicalInfoGrid = [
  { label: "Chief Complaint", value: medicalInfo.chiefComplaint || "N/A" },
  
  { label: "Past History", value: medicalInfo.pastHistory || "N/A" },
  { label: "Treatment Advice", value: medicalInfo.treatmentAdvice || "N/A" },
  { label: "Plan", value: medicalInfo.plan || "N/A" },
  ...(String(activeTab || "").toUpperCase() === "IPD"
    ? [
        { label: "Discharge Summary", value: medicalInfo.dischargeSummary || "N/A" },
       
      ]
    : []),
];

console.log("Medical Info Object:", medicalInfo);
console.log("Processed medicalInfoGrid:", medicalInfoGrid);

  console.log("Rendering medicalInfoGrid:", medicalInfoGrid);

  return (
    <div className="ml-6 mr-6 space-y-4 sm:space-y-5 md:space-y-6">
      
      {renderMedicalGrid(medicalInfoGrid)}
    </div>
  );
};

export default MedicalRecordTab;