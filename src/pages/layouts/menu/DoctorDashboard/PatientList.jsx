// src/pages/layouts/menu/DoctorDashboard/PatientList.js
import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import {
  getGenders,
  getBloodGroups,
  getSpecializationsByPracticeType,
  getAllHospitals,
} from "../../../../utils/masterService";
import OpdTab from "./OPDTab";
import IpdTab from "./ipd/IPDTab";
import VirtualTab from "./VirtualTab";
import { usePatientContext } from "../../../../context-api/PatientContext";

const PatientList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const { activeTab: contextActiveTab, setActiveTab: setContextActiveTab } = usePatientContext();
  const [activeTab, setActiveTab] = useState(contextActiveTab || "OPD");
  const [tabActions, setTabActions] = useState([]);
  const opdTabRef = useRef();
  const ipdTabRef = useRef();
  const virtualTabRef = useRef();
  const [masterData, setMasterData] = useState({
    genders: [],
    bloodGroups: [],
    departments: [],
    hospitals: [],
    loading: true,
  });

  const tabs = [
    { label: "OPD", value: "OPD" },
    { label: "IPD", value: "IPD" },
    { label: "VIRTUAL", value: "VIRTUAL" },
  ];

  const parentTabActions = [
    {
      label: "Add Patient",
      onClick: () => {
        if (activeTab === "OPD") opdTabRef.current?.openAddPatientModal();
        else if (activeTab === "IPD") {
          navigate("/doctordashboard/patients/basic", {
            state: { tab: "IPD", autoNavigated: true },
          });
        }
        else if (activeTab === "VIRTUAL") virtualTabRef.current?.openScheduleConsultationModal();
      },
      className: "btn btn-primary",
    },
  ];

  // Get doctorId and doctorName from Redux
  const doctorId = user?.doctorId;
  const doctorName = user?.firstName && user?.lastName
    ? `Dr. ${user.firstName} ${user.lastName}`.trim()
    : "Dr. User";

  const loadMasterData = async () => {
    try {
      setMasterData((prev) => ({ ...prev, loading: true }));
      const [gendersRes, bloodGroupsRes, hospitalsRes] = await Promise.allSettled([
        getGenders(),
        getBloodGroups(),
        getAllHospitals(),
      ]);

      const genders = gendersRes.status === "fulfilled"
        ? gendersRes.value.data.map((g) => ({
            value: g.genderName || g.name,
            label: g.genderName || g.name,
          }))
        : [];

      const bloodGroups = bloodGroupsRes.status === "fulfilled"
        ? bloodGroupsRes.value.data.map((bg) => ({
            value: bg.bloodGroupName || bg.name,
            label: bg.bloodGroupName || bg.name,
          }))
        : [];

      const hospitals = hospitalsRes.status === "fulfilled" ? hospitalsRes.value.data : [];

      let departments = [];
      try {
        const specializationsRes = await getSpecializationsByPracticeType(1);
        departments = specializationsRes.data.map((spec) => ({
          value: spec.specializationName || spec.name,
          label: spec.specializationName || spec.name,
        }));
      } catch (error) {
        departments = [];
      }

      setMasterData({
        genders,
        bloodGroups,
        departments,
        hospitals,
        loading: false,
      });
    } catch (error) {
      console.error("Error loading master data:", error);
      setMasterData({
        genders: [],
        bloodGroups: [],
        departments: [],
        hospitals: [],
        loading: false,
      });
      toast.error("Failed to load master data");
    }
  };

  const handlePatientSelect = (patient) => {
    localStorage.setItem("selectedThisPatient", JSON.stringify(patient));
    navigate("/doctordashboard/medical-record", { state: { patient } });
  };

  const handleTabChange = (tabValue) => {
    setActiveTab(tabValue);
    setContextActiveTab(tabValue);
    localStorage.setItem('activeTab', tabValue);
    navigate(`/doctordashboard/patients?tab=${tabValue}`);
  };

  useEffect(() => {
    loadMasterData();
  }, []);

  useEffect(() => {
    const isBasicPath = location.pathname?.includes("/doctordashboard/patients/basic");
    if (isBasicPath) {
      setActiveTab("IPD");
      setContextActiveTab("IPD");
      localStorage.setItem("activeTab", "IPD");
      return;
    }

    const tabFromUrl = new URLSearchParams(location.search).get("tab");
    const tabFromState = location.state?.tab;
    const autoNavigated = location.state?.autoNavigated;
    if (autoNavigated && tabFromState) {
      setActiveTab(tabFromState);
    } else if (tabFromUrl) {
      setActiveTab(tabFromUrl.charAt(0).toUpperCase() + tabFromUrl.slice(1));
    }
  }, [location.pathname, location.search, location.state]);

  if (masterData.loading) {
    return (
      <div className="p-4 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading master data...</span>
        </div>
      </div>
    );
  }

  const renderActiveTab = () => {
    const commonProps = {
      doctorName,
      doctorId, // Pass doctorId if needed
      masterData,
      location,
      setTabActions,
      tabActions,
      onPatientSelect: handlePatientSelect,
    };
    const sharedTabProps = {
      tabs,
      tabActions: tabActions.length ? tabActions : parentTabActions,
      activeTab,
      onTabChange: handleTabChange,
    };
    switch (activeTab) {
      case "OPD":
        return <OpdTab ref={opdTabRef} {...commonProps} {...sharedTabProps} />;
      case "IPD":
        return <IpdTab ref={ipdTabRef} {...commonProps} {...sharedTabProps} />;
      case "VIRTUAL":
        return <VirtualTab ref={virtualTabRef} {...commonProps} {...sharedTabProps} />;
      default:
        return <OpdTab ref={opdTabRef} {...commonProps} {...sharedTabProps} />;
    }
  };

  return (
    <div className="p-2 sm:p-4 md:p-2">
      <div className="mb-16 lg:mb-4">{renderActiveTab()}</div>
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-xl backdrop-blur-sm z-30">
        <div className="flex gap-3 w-full mx-auto">
          <button
            onClick={() => parentTabActions[0].onClick()}
            className="flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 transform active:scale-95 shadow-md bg-gradient-to-r from-[var(--primary-color)] to-[var(--primary-color)] text-white hover:from-[var(--primary-color)] hover:to-[var(--primary-color)] shadow-lg hover:shadow-xl border-2 border-[var(--primary-color)]"
          >
            Add Patient
          </button>
        </div>
      </div>
      {tabActions.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-xl backdrop-blur-sm z-30">
          <div className="flex gap-3 w-full mx-auto">
            {tabActions.map((action, index) => (
              <button
                key={typeof action.label === "string" ? action.label : index}
                onClick={action.onClick}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 transform active:scale-95 shadow-md ${
                  index === 0
                    ? "bg-gradient-to-r from-[var(--primary-color)] to-[var(--primary-color)] text-white hover:from-[var(--primary-color)] hover:to-[var(--primary-color)] shadow-lg hover:shadow-xl border-2 border-[var(--primary-color)]"
                    : "bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-300 hover:border-gray-400"
                } ${action.className || ""}`}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientList;
