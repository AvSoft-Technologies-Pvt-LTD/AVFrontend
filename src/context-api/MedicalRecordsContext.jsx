// import { createContext, useContext, useState, useEffect } from "react";

// const MedicalRecordsContext = createContext();

// export const MedicalRecordsProvider = ({ children }) => {
//   const getInitialTab = () => {
//     if (typeof window !== "undefined") {
//       return localStorage.getItem("activeMedicalTab") ;
//     }
//     return "OPD";
//   };

//   const getInitialClickedRecord = () => {
//     if (typeof window !== "undefined") {
//       const record = localStorage.getItem("clickedHospitalRecord");
//       return record ? JSON.parse(record) : null;
//     }
//     return null;
//   };

//   const [activeTab, setActiveTab] = useState(getInitialTab());
//   const [clickedRecord, setClickedRecord] = useState(getInitialClickedRecord());

//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       localStorage.setItem("activeMedicalTab", activeTab);
//     }
//   }, [activeTab]);

//   useEffect(() => {
//     if (typeof window !== "undefined" && clickedRecord) {
//       localStorage.setItem("clickedHospitalRecord", JSON.stringify(clickedRecord));
//     }
//   }, [clickedRecord]);

//   useEffect(() => {
//     console.log("✅ Active Medical Tab:", activeTab);
//   }, [activeTab]);

//   useEffect(() => {
//     console.log("🏥 Clicked Hospital Record:", clickedRecord);
//   }, [clickedRecord]);

//   return (
//     <MedicalRecordsContext.Provider
//       value={{
//         activeTab,
//         setActiveTab,
//         clickedRecord,
//         setClickedRecord,
//       }}
//     >
//       {children}
//     </MedicalRecordsContext.Provider>
//   );
// };

// export const useMedicalRecords = () => {
//   const context = useContext(MedicalRecordsContext);
//   if (!context) {
//     throw new Error("useMedicalRecords must be used within a MedicalRecordsProvider");
//   }
//   return context;
// };



import { createContext, useContext, useState, useEffect } from "react";

const MedicalRecordsContext = createContext();

export const MedicalRecordsProvider = ({ children }) => {
  const getInitialTab = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("activeMedicalTab") || "OPD";
    }
    return "OPD";
  };

  const getInitialClickedRecord = () => {
    if (typeof window !== "undefined") {
      const record = localStorage.getItem("clickedHospitalRecord");
      return record ? JSON.parse(record) : null;
    }
    return null;
  };

  // ⬇️ Renamed here
  const [recordTab, setRecordTab] = useState(getInitialTab());
  const [clickedRecord, setClickedRecord] = useState(getInitialClickedRecord());

  // Save tab to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("activeMedicalTab", recordTab);
    }
  }, [recordTab]);

  // Save clicked record
  useEffect(() => {
    if (typeof window !== "undefined" && clickedRecord) {
      localStorage.setItem(
        "clickedHospitalRecord",
        JSON.stringify(clickedRecord)
      );
    }
  }, [clickedRecord]);

  // Debug logs
  useEffect(() => {
    console.log("✅ Active Medical Tab:", recordTab);
  }, [recordTab]);

  useEffect(() => {
    console.log("🏥 Clicked Hospital Record:", clickedRecord);
  }, [clickedRecord]);

  return (
    <MedicalRecordsContext.Provider
      value={{
        recordTab,
        setRecordTab,
        clickedRecord,
        setClickedRecord,
      }}
    >
      {children}
    </MedicalRecordsContext.Provider>
  );
};

export const useMedicalRecords = () => {
  const context = useContext(MedicalRecordsContext);
  if (!context) {
    throw new Error(
      "useMedicalRecords must be used within a MedicalRecordsProvider"
    );
  }
  return context;
};








