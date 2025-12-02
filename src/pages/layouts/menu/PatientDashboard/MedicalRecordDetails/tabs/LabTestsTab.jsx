import React, { useState, useEffect } from "react";
import { TestTube } from "lucide-react";
import DynamicTable from "../../../../../../components/microcomponents/DynamicTable";
import DocsReader from "../../../../../../components/DocsReader";
import { getLabScanByPatient } from "../../../../../../utils/masterService";

const LabTab = ({
  patientId,
  recordId,
  recordTab
}) => {
  const [labScansData, setLabScansData] = useState([]);
  const [loading, setLabScansLoading] = useState(false);
  const [error, setLabScansError] = useState(null);
  const [imageModal, setImageModal] = useState({ isOpen: false, imageUrl: "", title: "" });

  useEffect(() => {
    const fetchLabScans = async () => {
      if (!recordId) {
        console.warn("No recordId available to fetch lab scans");
        setLabScansError("No patient record selected");
        return;
      }
      try {
        setLabScansLoading(true);
        setLabScansError(null);
        console.log("Fetching lab scans for Patient ID:", patientId, "Record ID:", recordId);
        const recordType = recordTab?.toLowerCase() || "";
        const recordIdParam = `${recordType}RecordId`;
        const params = {
          patientId,
          [recordIdParam]: recordId,
        };
        console.log("Lab Scans API Request Params:", params);
        const response = await getLabScanByPatient(patientId, params);
        console.log("Lab Scans API Response:", response);
        if (response?.data) {
          const scans = Array.isArray(response.data) ? response.data : [response.data];
          setLabScansData(scans);
          if (scans.length === 0) {
            setLabScansError("No lab scans found for this patient");
          }
        } else {
          setLabScansError("No lab scan data available");
          setLabScansData([]);
        }
      } catch (error) {
        console.error("Error fetching lab scans:", error);
        setLabScansError(error.response?.data?.message || "Failed to load lab scans");
        setLabScansData([]);
      } finally {
        setLabScansLoading(false);
      }
    };
    fetchLabScans();
  }, [recordId, patientId, recordTab]);

  return (
    <div className="ml-6 mr-6 space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-3 sm:mb-4 md:mb-6 gap-2 sm:gap-3">
       
        
      </div>
      {loading ? (
        <div className="text-center py-6 md:py-8 text-sm md:text-base">
          Loading lab scans...
        </div>
      ) : error || labScansData.length === 0 ? (
        <div className="w-full h-full flex flex-col items-center justify-center p-4">
          <DocsReader />
          <p className="mt-4 text-gray-600 text-sm md:text-base">
            {error || "No lab tests found for this patient"}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <DynamicTable
            columns={[
              { header: "Date", accessor: "date" },
              { header: "Test name", accessor: "testName" },
              { header: "Result", accessor: "result" },
              { header: "Normal Range", accessor: "normalRange" },
              { header: "Status", accessor: "status" },
              // {
              //   header: "Actions",
              //   accessor: "actions",
              //   Cell: ({ row }) => (
              //     <button
              //       onClick={() => window.open(row.original.fileUrl, "_blank")}
              //       className="text-blue-500 hover:text-blue-700"
              //     >
              //       View
              //     </button>
              //   ),
              // },
            ]}
            showSearchBar={true}
            data={labScansData}
          />
        </div>
      )}
    </div>
  );
};

export default LabTab;