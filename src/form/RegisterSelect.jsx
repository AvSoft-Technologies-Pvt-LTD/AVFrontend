import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Building2, Stethoscope, FlaskConical } from 'lucide-react';

const RegisterSelect = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState("patient");

  const userType = [
    {
      label: "Patient",
      value: "patient",
      icon: User,
      description: "Order medicines, consult Doctors, store all your Medical Records & manage your family's health.",
      image: "https://img.freepik.com/premium-vector/doctor-examines-report-disease-medical-checkup-annual-doctor-health-test-appointment-tiny-person-concept-preventive-examination-patient-consults-hospital-specialist-vector-illustration_419010-581.jpg"
    },
    {
      label: "Doctor",
      value: "doctor",
      icon: Stethoscope,
      description: "Centralised access to Consultations, Patients & their Medical Histories for all your practices.",
      image: "https://img.freepik.com/free-vector/doctor-character-background_1270-84.jpg"
    },
    {
      label: "Hospital",
      value: "hospital",
      icon: Building2,
      description: "Access to AI-driven insights & analytics on day-to-day operations for admins, staff & stakeholders.",
      image: "https://img.freepik.com/free-vector/doctors-concept-illustration_114360-1515.jpg"
    },
    {
      label: "Pharmacy",
      value: "lab",
      icon: FlaskConical,
      description: "Real-time access to your store's Sales, Purchases, Inventory, Deliveries, Customers & Finances.",
      image: "https://img.freepik.com/free-vector/pharmacist-concept-illustration_114360-6511.jpg"
    },
  ];

  const currentSelection = userType.find(u => u.value === selectedType) || userType[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex flex-col">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-2xl font-bold text-gray-900 mb-2">
              Welcome to <span className="text-[var(--primary-color)]">AVSwasthya!</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600">
              Get started as a <span className="font-semibold text-[var(--primary-color)]">{currentSelection.label}</span>
            </p>
          </div>

          {/* Illustration */}
          <div className="mb-6 flex justify-center">
            <img
              src={currentSelection.image}
              alt={currentSelection.label}
              className="w-full max-w-xs sm:max-w-sm h-auto max-h-48 sm:max-h-64 object-contain"
            />
          </div>

          {/* Description */}
          <div className="mb-6 px-2 sm:px-4">
            <p className="text-gray-700 text-center text-sm sm:text-base leading-relaxed">
              {currentSelection.description}
            </p>
          </div>

          {/* Proceed Button */}
          <div className="px-2 sm:px-4 mb-4">
            <button
              onClick={() => navigate("/registration", { state: { userType: selectedType } })}
              className="w-full py-2 sm:py-3 px-2 sm:px-4 bg-gradient-to-r from-[var(--primary-color)] to-[var(--accent-color)] text-white text-base sm:text-lg font-semibold rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all "
            >
              Proceed
            </button>
          </div>

          <p className="text-center text-xs sm:text-sm text-gray-500 mb-6 sm:mb-8">
            Join us today!
          </p>
        </div>
      </div>

      {/* Bottom Tab Bar */}
       <div className="bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-2xl mx-auto px-2 sm:px-4 py-2 sm:py-3">
          <div className="grid grid-cols-4 gap-1 sm:gap-2">
            {userType.map((type) => {
              const Icon = type.icon;
              const isActive = type.value === selectedType;

              return (
                <motion.button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  whileTap={{ scale: 0.9 }}
                  animate={
                    isActive
                      ? {
                          scale: [1, 1.15, 1],
                          boxShadow: [
                            "0 0 0px rgba(0,0,0,0)",
                            "0 0 10px rgba(0,255,127,0.5)",
                            "0 0 0px rgba(0,0,0,0)",
                          ],
                        }
                      : { scale: 1 }
                  }
                  transition={{ duration: 0.5 }}
                  className={`flex flex-col items-center py-1 sm:py-1 px-1 sm:px-2 rounded-full transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-[var(--primary-color)] to-[var(--accent-color)] text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <motion.div
                    animate={isActive ? { y: [0, -4, 0] } : { y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Icon
                      className={`w-5 h-5 sm:w-6 sm:h-6 mb-1 ${
                        isActive ? "text-white" : "text-gray-600"
                      }`}
                    />
                  </motion.div>
                  <span
                    className={`text-xs font-medium ${
                      isActive ? "text-white" : "text-gray-700"
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
  );
};

export default RegisterSelect;
