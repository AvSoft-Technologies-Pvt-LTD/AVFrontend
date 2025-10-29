import React from "react";
import { ArrowRight } from "lucide-react";
import { Routes, Route, useNavigate } from "react-router-dom";
// Component imports
import LabSettings from "./LabSettings";
import SecuritySettings from "./SecuritySettings";
import EmployeeList from "./EmployeeList";
import LookupMasterData from "./LookupMasterData";
import DoctorEnlistmentList from "./DoctorEnlistmentList";
import Designation from "./Designation";
// import Department from "./components/settings/Department";
import ProductsPage from "./ProductsPage";
import SupplierList from "./SupplierList";
// import ProductsPage from "./ProductsPage";
import ProductsPackageList from "./ProductsPackageList";
import DiagnosisCategory from "./DiagnosisCategory";
import HistoryTakingSetup from "./HistoryTakingSetup";
import MedicineTemplateList from "./MedicineTemplateList";
import TreatmentAdviceTemplateList from "./TreatmentAdviceTemplateList";
import BedRoomCategoryList from "./BedRoomCategoryList";
import BedRoomList from "./BedRoomList";
import OrganizationLogoSetting from "./OrganizationLogoSetting";
import PropertySettings from "./PropertySettings";
import OrganizationInfoSettings from "./OrganizationInfoSettings";
import TelephoneDirectory from "./TelephoneDirectory";
import AccountsAutoTransactionSettings from "./AccountsAutoTransactionSettings";
// import FavouriteMenuSettings from "./FavouriteMenuSettings";
const settingsData = [
  { label: "Lab Settings", color: "bg-blue-500", component: "LabSettings", path: "lab-settings" },
  { label: "Security Settings", color: "bg-cyan-500", component: "SecuritySettings", path: "security-settings" },
  { label: "Employee List", color: "bg-teal-400", component: "EmployeeList", path: "employee-list" },
  { label: "Lookup Master Data", color: "bg-emerald-500", component: "LookupMasterData", path: "lookup-master-data" },
  { label: "Doctor Enlistment List", color: "bg-green-400", component: "DoctorEnlistmentList", path: "doctor-enlistment" },
  { label: "Designation & Departments", color: "bg-amber-400", component: "Designation", path: "designation" },
  // { label: "Department", color: "bg-orange-400", component: "Department", path: "department" },
  { label: "Products Category List", color: "bg-red-400", component: "ProductsPage", path: "products-category" },
  { label: "Supplier List Grid", color: "bg-pink-400", component: "SupplierList", path: "supplier-list" },
  // { label: "Products List", color: "bg-rose-400", component: "ProductsList", path: "products-list" },
  { label: "Products Package List", color: "bg-purple-700", component: "ProductsPackageList", path: "products-package" },
  { label: "Diagnosis Category", color: "bg-indigo-700", component: "DiagnosisCategory", path: "diagnosis-category" },
  { label: "History Taking Setup", color: "bg-slate-600", component: "HistoryTakingSetup", path: "history-taking" },
  { label: "Medicine Template List", color: "bg-sky-400", component: "MedicineTemplateList", path: "medicine-template" },
  { label: "Treatment Advice Template List", color: "bg-cyan-800", component: "TreatmentAdviceTemplateList", path: "treatment-advice" },
  { label: "Bed/Room Category List", color: "bg-teal-500", component: "BedRoomCategoryList", path: "bedroom-category" },
  { label: "Bed/Room List", color: "bg-emerald-300", component: "BedRoomList", path: "bedroom-list" },
  { label: "Organization Logo Setting", color: "bg-lime-600", component: "OrganizationLogoSetting", path: "organization-logo" },
  { label: "Property Settings", color: "bg-yellow-300", component: "PropertySettings", path: "property-settings" },
  { label: "Organization Info Settings", color: "bg-amber-400", component: "OrganizationInfoSettings", path: "organization-info" },
  { label: "Telephone Directory", color: "bg-orange-300", component: "TelephoneDirectory", path: "telephone-directory" },
  { label: "Accounts Auto Transaction Settings", color: "bg-rose-200", component: "AccountsAutoTransactionSettings", path: "accounts-settings" },
  // { label: "Favourite Menu Settings", color: "bg-pink-300", component: "FavouriteMenuSettings", path: "favourite-menu" },
];
const componentMap = {
  LabSettings,
  SecuritySettings,
  EmployeeList,
  LookupMasterData,
  DoctorEnlistmentList,
  Designation,

  ProductsPage,
  SupplierList,
  // ProductsList,
  ProductsPackageList,
  DiagnosisCategory,
  HistoryTakingSetup,
  MedicineTemplateList,
  TreatmentAdviceTemplateList,
  BedRoomCategoryList,
  BedRoomList,
  OrganizationLogoSetting,
  PropertySettings,
  OrganizationInfoSettings,
  TelephoneDirectory,
  AccountsAutoTransactionSettings,
  // FavouriteMenuSettings,
};
const Settings = () => {
  const navigate = useNavigate();
  return (
    <div className="p-6">
      <Routes>
        {/* Main settings list */}
        <Route
          path=""
          element={
            <>
              <h1 className="h3-heading mb-4" style={{ fontFamily: 'var(--font-family)' }}>
                Settings
              </h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {settingsData.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => navigate(item.path)}
                    className="flex justify-between items-center px-4 py-3 rounded-lg bg-white border shadow hover:shadow-md transition"
                  >
                    <span className="text-sm font-medium text-blue-900">{item.label}</span>
                    <span className={`ml-3 p-2 rounded-full text-white ${item.color}`}>
                      <ArrowRight size={16} />
                    </span>
                  </button>
                ))}
              </div>
            </>
          }
        />
        {/* Dynamic routes for components */}
        {settingsData.map((item, index) => {
          const Component = componentMap[item.component];
          return (
            <Route
              key={index}
              path={item.path}
              element={
                <>
                  <div className="mb-4">
                    <h1 className="h2-heading flex items-center">
                      <button
                        className="h3-heading text-[var(--accent-color)] font-black focus:outline-none"
                        onClick={() => navigate(-1)}
                        style={{ fontFamily: 'var(--font-family)' }}
                      >
                        Settings
                      </button>
                      <span className="text-lg font-semibold text-[var(--accent-color)] ml-2" style={{ fontFamily: 'var(--font-family)' }}>
                        / {item.label}
                      </span>
                    </h1>
                  </div>
                  {Component && <Component />}
                </>
              }
            />
          );
        })}
      </Routes>
    </div>
  );
};
export default Settings;