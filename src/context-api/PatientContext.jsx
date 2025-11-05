import React, { createContext, useState, useContext, useEffect } from "react";

const PatientContext = createContext();

export const PatientProvider = ({ children }) => {
  const [activeTab, setActiveTab] = useState(() => {
    // Initialize activeTab from localStorage if it exists, otherwise default to "OPD"
    return localStorage.getItem('activeTab') || "OPD";
  });
  const [patient, setPatient] = useState(null);

  // Simulate async retrieval of patient data
  useEffect(() => {
    const fetchPatient = async () => {
      const savedPatient = localStorage.getItem("selectedThisPatient");
      console.log("🩺 Retrieved from localStorage:", savedPatient);
      const parsedPatient = savedPatient ? JSON.parse(savedPatient) : null;
      setPatient(parsedPatient);
      console.log("🩺 Patient state set:", parsedPatient);
    };
    fetchPatient();
  }, []);

  // Update localStorage whenever activeTab changes
  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
    console.log("PatientProvider - Active tab updated:", activeTab);
  }, [activeTab]);

  // Log patient state updates
  useEffect(() => {
    console.log("🩺 Patient state updated:", patient);
  }, [patient]);

  // Function to handle tab changes
  const handleTabChange = (tabValue) => {
    setActiveTab(tabValue);
    localStorage.setItem('activeTab', tabValue);
    // If you're using React Router, you can navigate here or pass the navigate function as a prop
    // navigate(`/doctordashboard/patients?tab=${tabValue}`);
  };

  return (
    <PatientContext.Provider
      value={{
        activeTab,
        setActiveTab,
        patient,
        setPatient,
        handleTabChange, // Expose handleTabChange to consumers
      }}
    >
      {children}
    </PatientContext.Provider>
  );
};

export const usePatientContext = () => useContext(PatientContext);