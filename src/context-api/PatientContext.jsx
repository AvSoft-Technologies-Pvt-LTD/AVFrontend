// src/context/PatientContext.jsx
import React, { createContext, useState, useContext, useEffect } from "react";

const PatientContext = createContext();

export const PatientProvider = ({ children }) => {
  const [patients, setPatients] = useState([]);
  const [activeTab, setActiveTab] = useState("OPD");

  // Log when patients or activeTab changes
  useEffect(() => {
    console.log("PatientProvider - Patients updated:", patients);
  }, [patients]);

  useEffect(() => {
    console.log("PatientProvider - Active tab updated:", activeTab);
  }, [activeTab]);

  return (
    <PatientContext.Provider
      value={{
        patients,
        setPatients,
        activeTab,
        setActiveTab,
      }}
    >
      {children}
    </PatientContext.Provider>
  );
};

export const usePatientContext = () => useContext(PatientContext);











