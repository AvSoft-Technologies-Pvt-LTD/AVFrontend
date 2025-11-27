import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Building2, Stethoscope, FlaskConical } from 'lucide-react';
import Navbar from '../components/Navbar';

// Import images
import PatientImg from '../assets/PatientReg.jpg';
import DoctorImg from '../assets/DocReg.jpg';
import HospitalImg from '../assets/HosReg.jpg';
import LabImg from '../assets/LabReg.jpg';

const RegisterSelect = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState("patient");

  const userType = [
    {
      label: "Patient",
      value: "patient",
      icon: User,
      description: "Order medicines, consult Doctors, store all your Medical Records & manage your family's health.",
      image: PatientImg
    },
    {
      label: "Doctor",
      value: "doctor",
      icon: Stethoscope,
      description: "Centralised access to Consultations, Patients & their Medical Histories for all your practices.",
      image: DoctorImg
    },
    {
      label: "Hospital",
      value: "hospital",
      icon: Building2,
      description: "Access to AI-driven insights & analytics on day-to-day operations for admins, staff & stakeholders.",
      image: HospitalImg
    },
    {
      label: "Lab",
      value: "lab",
      icon: FlaskConical,
      description: "Real-time access to your store's Sales, Purchases, Inventory, Deliveries, Customers & Finances.",
      image: LabImg
    },
  ];

  // Rest of your component remains the same...
  const currentSelection = userType.find(u => u.value === selectedType) || userType[0];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 via-white to-green-100">
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="w-full max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
            {/* Left Side - Form */}
            <div className="w-full md:w-1/2 p-6 sm:p-8 lg:p-10 flex flex-col">
              <div className="text-center md:text-left mb-6">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                  Welcome to <span className="text-[var(--accent-color)]">PocketClinic!</span>
                </h1>
                <p className="text-base sm:text-lg text-gray-600">
                  Get started as a <span className="font-semibold text-[var(--accent-color)]">{currentSelection.label}</span>
                </p>
              </div>

              {/* Mobile Image - Only shown on small screens */}
              <div className="md:hidden mb-6 flex justify-center">
  <div className="w-full max-w-xs">
    <img
      src={currentSelection.image}
      alt={currentSelection.label}
      className="w-full h-auto max-h-64 object-contain rounded-lg"
    />
  </div>
</div>


              <div className="mb-6 flex-grow">
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                  {currentSelection.description}
                </p>
              </div>

              <div className="mt-auto">
                <button
                  onClick={() => navigate("/registration", { state: { userType: selectedType } })}
                  className="w-full py-3 px-4 bg-gradient-to-r from-[var(--accent-color)] to-[var(--primary-color)] text-white text-base sm:text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:ring-opacity-50"
                >
                  Proceed
                </button>
                <p className="text-center text-xs sm:text-sm text-[var(--primary-color)] mt-3">
                  Join us today!
                </p>
              </div>
            </div>

            {/* Right Side - Image (Desktop) */}
            <div className="hidden md:flex md:w-1/2 p-6 items-center justify-center">
  <div className="w-full max-w-md">
    <img
      src={currentSelection.image}
      alt={currentSelection.label}
      className="w-full h-auto max-h-[800px] object-contain"
    />
  </div>
</div>
          </div>

          {/* Bottom Tab Bar - Fixed on mobile, inline on desktop */}
          <div className="mt-6 md:mt-8 bg-white rounded-2xl shadow-lg">
            <div className="p-2 sm:p-3">
              <div className="grid grid-cols-4 gap-1 sm:gap-2">
                {userType.map((type) => {
                  const Icon = type.icon;
                  const isActive = type.value === selectedType;

                  return (
                    <motion.button
                      key={type.value}
                      onClick={() => setSelectedType(type.value)}
                      whileTap={{ scale: 0.95 }}
                      animate={
                        isActive
                          ? {
                            scale: [1, 1.1, 1],
                            boxShadow: [
                              "0 0 0px rgba(0,0,0,0)",
                              "0 0 10px rgba(16, 185, 129, 0.5)",
                              "0 0 0px rgba(0,0,0,0)",
                            ],
                          }
                          : { scale: 1 }
                      }
                      transition={{ duration: 0.3 }}
                      className={`flex flex-col items-center py-2 px-1 sm:px-3 rounded-xl transition-all ${isActive
                        ? "bg-gradient-to-r from-[var(--accent-color)] to-[var(--primary-color)] text-white shadow-md"
                        : "text-gray-600 hover:bg-gray-50"
                        }`}
                    >
                      <motion.div
                        animate={isActive ? { y: [0, -4, 0] } : { y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Icon
                          className={`w-5 h-5 sm:w-6 sm:h-6 mb-1 ${isActive ? "text-white" : "text-gray-600"
                            }`}
                        />
                      </motion.div>
                      <span
                        className={`text-xs font-medium ${isActive ? "text-white" : "text-gray-700"
                          }`}
                      >
                        {type.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RegisterSelect;