import React, { useState, useEffect } from "react";
import { CreditCard } from "lucide-react";
import DynamicTable from "../../../../../../components/microcomponents/DynamicTable";
import DocsReader from "../../../../../../components/DocsReader";
import {
  getHospitalBilling,
  getLabBilling,
  getPharmacyBilling,
} from "../../../../../../utils/masterService";

const BillingTab = ({
  patientId,
  recordId,
  recordTab,
  state,
  setState,
  isExactPatient,
}) => {
  const [hospitalBillingData, setHospitalBillingData] = useState([]);
  const [labBillingData, setLabBillingData] = useState([]);
  const [pharmacyBillingData, setPharmacyBillingData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [docsModal, setDocsModal] = useState({ isOpen: false });
  const [selectedBillingType, setSelectedBillingType] = useState("");

  useEffect(() => {
    const fetchBillingData = async () => {
      if (!recordId || !recordTab) {
        console.warn("No recordId or recordTab available to fetch billing data");
        setError("No patient record selected");
        return;
      }
      try {
        setLoading(true);
        setError(null);
        console.log("Fetching billing data for Patient ID:", patientId, "Record ID:", recordId, "Record Type:", recordTab);
        const recordType = recordTab.toLowerCase();
        const recordIdParam = `${recordType}RecordId`;
        const params = {
          [recordIdParam]: recordId,
        };
        console.log("API Params:", params);
        const [hospitalRes, labRes, pharmacyRes] = await Promise.all([
          getHospitalBilling(patientId, params).catch((e) => {
            console.warn("Error fetching hospital billing:", e);
            return { data: [] };
          }),
          getLabBilling(patientId, params).catch((e) => {
            if (e.response?.status === 404) {
              console.log("No lab billing records found");
              return { data: [] };
            }
            console.error("Error fetching lab billing:", e);
            throw e;
          }),
          getPharmacyBilling(patientId, params).catch((e) => {
            console.warn("Error fetching pharmacy billing:", e);
            return { data: [] };
          }),
        ]);
        console.log("Billing API Responses:", { hospitalRes, labRes, pharmacyRes });
        setHospitalBillingData(Array.isArray(hospitalRes?.data) ? hospitalRes.data : hospitalRes?.data ? [hospitalRes.data] : []);
        setLabBillingData(Array.isArray(labRes?.data) ? labRes.data : labRes?.data ? [labRes.data] : []);
        setPharmacyBillingData(Array.isArray(pharmacyRes?.data) ? pharmacyRes.data : pharmacyRes?.data ? [pharmacyRes.data] : []);
      } catch (error) {
        console.error("Error fetching billing data:", error);
        setError(error.response?.data?.message || "Failed to load billing information");
      } finally {
        setLoading(false);
      }
    };
    fetchBillingData();
  }, [recordId, patientId, recordTab]);

  const hasBillingData = pharmacyBillingData.length > 0 || labBillingData.length > 0 || hospitalBillingData.length > 0;

  const handleBillingTypeSelect = (type) => {
    setSelectedBillingType(type);
    console.log("Selected billing type:", type);
  };

  const handleUploadClick = () => {
    setDocsModal({ isOpen: true });
  };

  const handleCloseModal = () => {
    setDocsModal({ isOpen: false });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const columnMaps = {
    pharmacy: [
      { header: "Medicine Name", accessor: "medicineName" },
      { header: "Quantity", accessor: "quantity" },
      { header: "Unit Price (₹)", accessor: "unitPrice" },
      { header: "Total Price (₹)", accessor: "totalPrice" },
      { header: "Date", accessor: "date" },
    ],
    labs: [
      { header: "Test Name", accessor: "testName" },
      { header: "Cost (₹)", accessor: "cost" },
      { header: "Date", accessor: "date" },
      {
        header: "Payment Status",
        accessor: "paymentStatus",
        cell: (row) => (
          <span
            className={`text-xs md:text-sm font-semibold px-2 py-1 rounded-full ${
              row.paymentStatus === "Paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {row.paymentStatus}
          </span>
        ),
      },
    ],
    hospital: [
      { header: "Bill Type", accessor: "billType" },
      { header: "Amount (₹)", accessor: "amount" },
      { header: "Payment Mode", accessor: "paymentMode" },
      {
        header: "Status",
        accessor: "status",
        cell: (row) => (
          <span
            className={`text-xs md:text-sm font-semibold px-2 py-1 rounded-full ${
              row.status === "Paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {row.status}
          </span>
        ),
      },
      { header: "Bill Date", accessor: "billDate" },
    ],
  };

  const activeBillingTab = state.billingActiveTab;
  const activeData = (() => {
    const dataMaps = {
      pharmacy: pharmacyBillingData,
      labs: labBillingData,
      hospital: hospitalBillingData,
    };
    return dataMaps[activeBillingTab] || [];
  })();

  return (
    <div className="space-y-4 md:space-y-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-3 sm:mb-4 md:mb-6 gap-2 sm:gap-3 mx-6">
      
        <div className="flex gap-2">
    
        </div>
      </div>
      <>
        {docsModal.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg font-semibold">Upload Billing Document</h3>
                <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                  ✕
                </button>
              </div>
              <div className="p-4">
                <DocsReader
                  askBillingTypeOnUpload={true}
                  activeTab="billing"
                  onBillingTypeSelect={handleBillingTypeSelect}
                />
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    onClick={handleCloseModal}
                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCloseModal}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Upload
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
      <div className="overflow-x-auto mx-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {!hasBillingData ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-4">
            <div className="text-center">
              <DocsReader
                askBillingTypeOnUpload={true}
                activeTab="billing"
                onBillingTypeSelect={handleBillingTypeSelect}
              />
              <p className="mt-4 text-gray-600 text-sm md:text-base">
                {error || "No billing information available for this patient"}
              </p>
              {isExactPatient && (
                <button
                  onClick={handleUploadClick}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Upload Billing Document
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {!activeData || activeData.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center p-4">
                <div className="text-center">
                  <DocsReader
                    askBillingTypeOnUpload={true}
                    activeTab="billing"
                    onBillingTypeSelect={handleBillingTypeSelect}
                  />
                  <p className="mt-4 text-gray-600 text-sm md:text-base">
                    No {activeBillingTab === 'hospital' ? 'hospital billing' : activeBillingTab === 'labs' ? 'lab test' : 'pharmacy'} records found. Upload a new {activeBillingTab === 'hospital' ? 'bill' : activeBillingTab === 'labs' ? 'test result' : 'prescription'} or select another tab.
                  </p>
                  {isExactPatient && (
                    <button
                      onClick={handleUploadClick}
                      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Upload {activeBillingTab === 'hospital' ? 'Hospital Bill' : activeBillingTab === 'labs' ? 'Lab Test Result' : 'Pharmacy Prescription'}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <DynamicTable
                columns={columnMaps[activeBillingTab] || columnMaps.pharmacy}
                data={activeData}
                tabs={[
                  { value: "pharmacy", label: "Pharmacy" },
                  { value: "labs", label: "Labs" },
                  { value: "hospital", label: "Hospital Bills" }
                ]}
                activeTab={activeBillingTab}
                onTabChange={(tab) => setState((prev) => ({ ...prev, billingActiveTab: tab }))}
                filters={[
                  {
                    key: "paymentStatus",
                    label: "Payment Status",
                    options: [
                      { value: "Paid", label: "Paid" },
                      { value: "Unpaid", label: "Unpaid" },
                    ],
                  },
                ]}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BillingTab;