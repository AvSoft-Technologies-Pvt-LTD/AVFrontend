import React, { useState, useEffect } from "react";
import { Pill } from "lucide-react";
import DynamicTable from "../../../../../../components/microcomponents/DynamicTable";
import DocsReader from "../../../../../../components/DocsReader";
import { getPatientPrescriptionsData } from "../../../../../../utils/masterService";

const PrescriptionTab = ({
  patientId,
  recordId,
  recordTab
}) => {
  const [prescriptionData, setPrescriptionData] = useState([]);
  const [loading, setPrescriptionLoading] = useState(false);
  const [error, setPrescriptionError] = useState(null);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      if (!recordId) {
        console.warn("No recordId available to fetch prescriptions");
        setPrescriptionError("No patient record selected");
        return;
      }
      try {
        setPrescriptionLoading(true);
        setPrescriptionError(null);
        console.log("Fetching prescriptions for Patient ID:", patientId, "Record ID:", recordId);
        const recordType = recordTab?.toLowerCase() || "";
        const recordIdParam = `${recordType}RecordId`;
        const params = {
          patientId,
          [recordIdParam]: recordId,
        };
        console.log("Prescriptions API Request Params:", params);
        const response = await getPatientPrescriptionsData(patientId, params);
        console.log("Prescriptions API Response:", response);
        if (response?.data) {
          const prescriptions = Array.isArray(response.data) ? response.data : [response.data];
          setPrescriptionData(prescriptions);
          if (prescriptions.length === 0) {
            setPrescriptionError("No prescriptions found for this patient");
          }
        } else {
          setPrescriptionError("No prescription data available");
          setPrescriptionData([]);
        }
      } catch (error) {
        console.error("Error fetching prescriptions:", error);
        setPrescriptionError(error.response?.data?.message || "Failed to load prescriptions");
        setPrescriptionData([]);
      } finally {
        setPrescriptionLoading(false);
      }
    };
    fetchPrescriptions();
  }, [recordId, patientId, recordTab]);

  return (
    <div className="ml-6 mr-6 space-y-4 md:space-y-6">
      
      {loading ? (
        <div className="text-center py-6 md:py-8 text-sm md:text-base">
          Loading prescriptions...
        </div>
      ) : error || prescriptionData.length === 0 ? (
        <div className="w-full h-full flex flex-col items-center justify-center p-4">
          <DocsReader />
          <p className="mt-4 text-gray-600 text-sm md:text-base">
            {error || "No prescriptions found for this patient"}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <DynamicTable
            columns={[
              { header: "Date", accessor: "date" },
              { header: "Doctor Name", accessor: "doctorName" },
              { header: "Medicines", accessor: "medicines" },
              { header: "Instructions", accessor: "instructions" },
            ]}
            showSearchBar={true}
            data={prescriptionData}
          />
        </div>
      )}
    </div>
  );
};

export default PrescriptionTab;