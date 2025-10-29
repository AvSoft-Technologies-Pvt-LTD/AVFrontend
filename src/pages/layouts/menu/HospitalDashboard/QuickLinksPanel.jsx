import React, { useState } from "react";
import { RiArrowRightLine, RiArrowLeftLine } from "react-icons/ri";
import {
  BadgeCheck,
  Stethoscope,
  ScrollText,
  FlaskRound,
  LogOut,
  Settings,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import GatePassModal from "./GatePassModal";
import DischargeModal from "./DischargeModal";

const API = {
  FORM: "https://684be316ed2578be881cdb55.mockapi.io/addpatient",
  HD: "https://680cc0c92ea307e081d4edda.mockapi.io/personalHealthDetails",
};

const QuickLinksPanel = ({
  setActiveForm,
  setActiveTab,
  patient: propPatient,
}) => {
   const location = useLocation();
    const patient = location.state?.patient || {
      name: "Unknown Patient",
      email: "unknown@example.com",
      phone: "N/A",
      age: "N/A",
      gender: "N/A",
      diagnosis: "N/A",
  };
  const [open, setOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState(null);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [gateModalOpen, setGateModalOpen] = useState(false);
  const [dischargeModalOpen, setDischargeModalOpen] = useState(false); // <-- Add state
  const navigate = useNavigate();

  const links = [
    { name: "Gate Pass", icon: BadgeCheck, api: "FORM" },
    { name: "Nursing & Treatment", icon: Stethoscope, api: "HD" },
    { name: "Prescription", icon: ScrollText, api: "HD" },
    { name: "Lab Tests/Scans", icon: FlaskRound, api: "HD" },
    { name: "Discharge", icon: LogOut, api: "HD" },
    { name: "Edit Profile", icon: Settings },
  ];

  const handleLinkClick = async (link) => {
    setSelectedLink(link.name);
    setFormData({});
    setError(null);

    if (link.name === "Nursing & Treatment") {
      const patientId = patient?.id || patient?.patientId || "";
      navigate(`/hospitaldashboard/opd-dashboard/${patientId}`, { state: { patient } });
      return;
    }
    if (link.name === "Prescription") {
      if (setActiveForm) setActiveForm("prescription");
      navigate("/hospitaldashboard/form", { state: { patient, activeForm: "prescription" } });
      return;
    }
    if (link.name === "Lab Tests/Scans") {
      if (setActiveForm) setActiveForm("lab");
      navigate("/hospitaldashboard/form", { state: { patient, activeForm: "lab" } });
      return;
    }
    if (link.name === "Edit Profile") {
      navigate("/hospitaldashboard/settings");
      return;
    }
    if (link.name === "Gate Pass") {
      setGateModalOpen(true);
      return;
    }
    if (link.name === "Discharge") {
      setDischargeModalOpen(true); // <-- Open discharge modal
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API[link.api]}/${patientId}`);
      if (!response.ok) throw new Error("Failed to fetch data");
      const data = await response.json();
      setFormData(data);
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="relative">
        {!open && (
          <button
            onClick={() => setOpen(true)}
            className="bg-[#0e1630] text-white shadow w-12 h-12 flex items-center justify-center rounded-full border-2 border-[#0e1630] hover:bg-[#021630] transition-all duration-200"
          >
            <RiArrowRightLine size={28} />
          </button>
        )}
        <div
          className={`fixed top-20 right-0 h-[80vh] w-64 bg-gray-100 border-l shadow-xl z-50 transform transition-transform duration-500 ease-in-out ${
            open
              ? "translate-x-0 pointer-events-auto"
              : "translate-x-full pointer-events-none"
          }`}
        >
          <div className="bg-[#0e1630] text-white font-semibold px-4 py-3 rounded-t-md flex justify-between items-center">
            Quick Links
            <button onClick={() => setOpen(false)} className="ml-2 text-white">
              <RiArrowLeftLine size={24} />
            </button>
          </div>
          <ul className="px-4 py-2 space-y-2 overflow-y-auto max-h-[70vh]">
            {links.map((link, index) => (
              <li
                key={index}
                onClick={() => handleLinkClick(link)}
                className={`text-sm font-medium cursor-pointer px-3 py-2 border-b border-gray-300 hover:bg-gray-200 transition-colors rounded-lg flex items-center gap-3 ${
                  selectedLink === link.name
                    ? "bg-[var(--accent-color)] text-white"
                    : ""
                }`}
              >
                <link.icon className="w-4 h-4" />
                <span className="truncate">{link.name}</span>
              </li>
            ))}
          </ul>
        </div>
        {open && (
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setOpen(false)}
          />
        )}
      </div>
      {gateModalOpen && (
        <GatePassModal
          isOpen={gateModalOpen}
          onClose={() => setGateModalOpen(false)}
          patient={{
            ...patient,
            name: patient?.name || patient?.firstName || "",
            id: patient?.id || patient?.patientId || "",
            admissionDate: patient?.admissionDate || patient?.doa || "",
            department: patient?.department || "",
            wardType: patient?.wardType || "",
            wardNo: patient?.wardNo || "",
            bedNo: patient?.bedNo || "",
            ward: patient?.ward || "",
            type: patient?.type || "",
          }}
        />
      )}
      {dischargeModalOpen && (
        <DischargeModal
          isOpen={dischargeModalOpen}
          onClose={() => setDischargeModalOpen(false)}
          patient={patient}
        />
      )}
    </>
  );
};

export default QuickLinksPanel;