import React, { useState } from "react";
import DepartmentWiseDoctorReport from "./DepartmentWiseDoctorReport";
import OpdPatientBilling from "./OpdPatientBilling";
import PatientList from "./PatientManagement";

const TABS = [
  { label: "All OPD Patient List", key: "patient" },

  { label: "Doctor wise Report", key: "departmentWise" },
  { label: "OPD Patient Billing", key: "opdBilling" },
];

const Opd = () => {
  const [activeTab, setActiveTab] = useState(TABS[0].key);

  return (
    <div className="p-4">
      {/* Tab Bar Styled Like DynamicTable */}
      <div className="flex items-center justify-between ">
        <div className="flex gap-4">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative cursor-pointer flex items-center gap-1 px-4 py-2 font-medium transition-colors duration-300
                ${activeTab === tab.key
                  ? "text-[var(--primary-color)] after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-full after:bg-[var(--primary-color)]"
                  : "text-gray-500 hover:text-[var(--accent-color)] before:content-[''] before:absolute before:left-0 before:bottom-0 before:h-[2px] before:w-0 before:bg-[var(--accent-color)] before:transition-all before:duration-300 hover:before:w-full"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {/* You can add tabActions here if needed */}
      </div>
      <div>
        {activeTab === "patient" && <PatientList />}
        
        {activeTab === "departmentWise" && <DepartmentWiseDoctorReport />}
        {activeTab === "opdBilling" && <OpdPatientBilling />}
      </div></div>
  );
};

export default Opd;