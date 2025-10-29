import React, { useState } from "react";
import axios from "axios";
import { IoClose } from "react-icons/io5";
import { BiErrorCircle } from "react-icons/bi";
import {
  FaShieldAlt, FaFileMedical, FaMoneyBillWave, FaCalendarAlt,
  FaUserShield, FaBuilding, FaIdCard, FaHospital, FaUserFriends,
  FaRupeeSign, FaExclamationCircle, FaChartLine, FaChevronDown, FaChevronUp
} from "react-icons/fa";

const Insurance = () => {
  const [state, setState] = useState({
    insuranceInfo: null,
    mobileNumber: "",
    loading: false,
    error: "",
    message: "",
    showEnrollmentForm: false,
    showInsuranceModal: false,
    showAllDetails: false,
    formData: { diagnosis: "", sumAssured: "", policyType: "", duration: "" }
  });

  const policyTypes = [
    "Individual Health Insurance",
    "Family Health Insurance",
    "Critical Illness Insurance",
    "Senior Citizen Health Insurance"
  ];

  const insuranceProviders = [
    "HDFC ERGO Health Insurance",
    "ICICI Lombard Health Insurance",
    "Star Health Insurance",
    "Bajaj Allianz Health Insurance",
    "Max Bupa Health Insurance",
    "Care Health Insurance",
    "Niva Bupa Health Insurance",
    "Aditya Birla Health Insurance"
  ];

  const diagnoses = [
    "Diabetes", "Hypertension", "Heart Disease", "Asthma",
    "Arthritis", "Thyroid", "Kidney Disease", "Cancer",
    "Stroke", "COPD", "Liver Disease", "None"
  ];

  const coverageTypes = [
    "Individual", "Family Floater", "Senior Citizen",
    "Critical Illness", "Maternity", "Pre & Post Hospitalization"
  ];

  const updateState = (updates) => setState(prev => ({ ...prev, ...updates }));
  const updateFormData = (updates) => setState(prev => ({ ...prev, formData: { ...prev.formData, ...updates } }));

  const generateInsuranceData = (mobile) => {
    const seed = mobile.split('').reduce((acc, digit) => acc + parseInt(digit), 0);

    const policyTypeIndex = seed % policyTypes.length;
    const providerIndex = seed % insuranceProviders.length;
    const diagnosisIndex = seed % diagnoses.length;
    const coverageIndex = seed % coverageTypes.length;

    const baseAmount = 100000 + (seed * 50000);
    const sumAssured = Math.min(baseAmount, 2000000);
    const premium = Math.floor(sumAssured * 0.03 + (seed * 100));
    const claimLimit = Math.floor(sumAssured * 0.8);

    const currentYear = new Date().getFullYear();
    const enrolledYear = currentYear - (seed % 5 + 1);
    const duration = seed % 10 + 1;

    return {
      policyNumber: `POL${mobile.slice(-6)}${seed}`,
      policyType: policyTypes[policyTypeIndex],
      insurerName: insuranceProviders[providerIndex],
      sumAssured: sumAssured.toLocaleString(),
      premiumAmount: premium.toLocaleString(),
      coverageType: coverageTypes[coverageIndex],
      diagnosis: diagnoses[diagnosisIndex],
      duration: duration,
      enrolledDate: `${enrolledYear}-${String((seed % 12) + 1).padStart(2, '0')}-${String((seed % 28) + 1).padStart(2, '0')}`,
      nominee: `Nominee ${mobile.slice(-2)}`,
      preExistingCover: seed % 2 === 0 ? "Covered after 2 years" : "Covered after 4 years",
      claimLimit: claimLimit.toLocaleString(),
      status: "Active",
      renewalDate: `${currentYear + 1}-${String((seed % 12) + 1).padStart(2, '0')}-${String((seed % 28) + 1).padStart(2, '0')}`
    };
  };

  const fetchInsuranceData = async (mobile) => {
    if (!mobile || mobile.length !== 10) {
      updateState({ error: "Please enter a valid 10-digit mobile number" });
      return;
    }
    updateState({ loading: true, error: "", message: "" });

    try {
      const response = await axios.get(`https://jsonplaceholder.typicode.com/users/${mobile.slice(-1) || 1}`);
      if (response.data) {
        const apiUser = response.data;
        const insuranceData = {
          policyNumber: `POL${mobile.slice(-6)}${apiUser.id}`,
          policyType: policyTypes[apiUser.id % policyTypes.length],
          insurerName: insuranceProviders[apiUser.id % insuranceProviders.length],
          sumAssured: (500000 + (apiUser.id * 100000)).toLocaleString(),
          premiumAmount: (15000 + (apiUser.id * 2000)).toLocaleString(),
          coverageType: coverageTypes[apiUser.id % coverageTypes.length],
          diagnosis: diagnoses[apiUser.id % diagnoses.length],
          duration: (apiUser.id % 10) + 1,
          enrolledDate: "2022-01-15",
          nominee: apiUser.name.split(' ')[0],
          preExistingCover: apiUser.id % 2 === 0 ? "Covered after 2 years" : "Covered after 4 years",
          claimLimit: (400000 + (apiUser.id * 80000)).toLocaleString(),
          status: "Active",
          renewalDate: "2025-01-15",
          holderName: apiUser.name,
          email: apiUser.email,
          phone: apiUser.phone,
          address: `${apiUser.address.street}, ${apiUser.address.city}`,
          company: apiUser.company.name
        };

        updateState({
          insuranceInfo: insuranceData,
          message: "",
          showInsuranceModal: true,
          showAllDetails: false
        });
      }

    } catch (err) {
      console.log("API failed, using fallback data generation");
      const insuranceData = generateInsuranceData(mobile);

      updateState({
        insuranceInfo: insuranceData,
        message: "",
        showInsuranceModal: true,
        showAllDetails: false
      });

    } finally {
      updateState({ loading: false });
    }
  };

  const InsuranceDetailCard = ({ icon: Icon, title, value, className = "" }) => (
    <div className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white rounded-lg border border-gray-100 hover:shadow-sm transition-all duration-300 ${className}`}>
      <div className="p-1.5 sm:p-2 rounded-lg bg-[var(--primary-color)]/5">
        <Icon className="text-[var(--primary-color)] text-base sm:text-lg" />
      </div>
      <div>
        <h4 className="text-xs sm:text-sm font-medium text-gray-600">{title}</h4>
        <p className="text-xs sm:text-sm font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="pt-4 sm:pt-6 mt-4 sm:mt-6 bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm sm:shadow-lg">
      <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">Insurance Management</h2>

      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg mb-3 sm:mb-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (state.mobileNumber) {
              fetchInsuranceData(state.mobileNumber);
              updateState({ showEnrollmentForm: false });
            }
          }}
          className="flex flex-col sm:flex-row gap-2 sm:gap-3"
        >
          <div className="flex-grow">
            <div className="floating-input relative w-full" data-placeholder="Enter Mobile Number">
              <input
                type="tel"
                placeholder=" "
                className="w-full px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-300 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                value={state.mobileNumber}
                onChange={e => updateState({ mobileNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                maxLength="10"
              />
              <label className="absolute left-3 sm:left-4 -top-2.5 text-xs sm:text-sm text-gray-500 bg-white px-1 transition-all">Enter Mobile Number</label>
            </div>
          </div>
          <div className="flex gap-1.5 sm:gap-2 self-end">
            <button
              type="submit"
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[var(--primary-color)] text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-opacity-90 transition-colors"
              disabled={state.loading || state.mobileNumber.length !== 10}
            >
              {state.loading ? (
                <>
                  <span className="inline-block w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5 sm:mr-2"></span>
                  Fetching...
                </>
              ) : (
                "Fetch Insurance"
              )}
            </button>
            <button
              type="button"
              onClick={() => updateState({ showEnrollmentForm: true, insuranceInfo: null })}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-200 text-gray-800 rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-300 transition-colors"
            >
              New Enrollment
            </button>
          </div>
        </form>
      </div>

      {state.error && (
        <div className="mt-3 sm:mt-4 bg-red-50 border-l-4 border-red-500 p-3 sm:p-4 rounded-md flex items-start">
          <BiErrorCircle className="text-red-500 mr-2 sm:mr-3 text-base sm:text-lg flex-shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-red-700">{state.error}</p>
        </div>
      )}

      {state.message && (
        <div className="mt-3 sm:mt-4 bg-blue-50 border-l-4 border-blue-500 p-3 sm:p-4 rounded-md">
          <p className="text-xs sm:text-sm text-blue-700">{state.message}</p>
        </div>
      )}

      {/* Insurance Details Modal */}
      {state.showInsuranceModal && state.insuranceInfo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-xl w-full max-w-xs sm:max-w-md md:max-w-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => updateState({ showInsuranceModal: false })}
              className="absolute top-3 sm:top-4 right-3 sm:right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <IoClose className="text-xl sm:text-2xl" />
            </button>

            <div className="mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 sm:mb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-800">{state.insuranceInfo.policyType}</h3>
                  <p className="text-xs sm:text-sm text-gray-600">{state.insuranceInfo.insurerName}</p>
                  {state.insuranceInfo.holderName && (
                    <p className="text-xs text-gray-500">Holder: {state.insuranceInfo.holderName}</p>
                  )}
                  <span className="inline-block mt-1.5 sm:mt-2 px-2.5 sm:px-3 py-0.5 sm:py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    {state.insuranceInfo.status}
                  </span>
                </div>
                <div className="text-right mt-2 sm:mt-0">
                  <p className="text-xs sm:text-sm text-gray-600">Policy Number</p>
                  <p className="text-sm sm:text-base font-bold text-gray-800">{state.insuranceInfo.policyNumber}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
              {[
                { label: "Sum Assured", value: `₹${state.insuranceInfo.sumAssured}`, icon: FaShieldAlt },
                { label: "Annual Premium", value: `₹${state.insuranceInfo.premiumAmount}`, icon: FaMoneyBillWave },
                { label: "Coverage Type", value: state.insuranceInfo.coverageType, icon: FaUserFriends }
              ].map((item, i) => (
                <div key={i} className="bg-white p-3 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-[var(--primary-color)]/10">
                      <item.icon className="text-[var(--primary-color)] text-base" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{item.label}</p>
                      <p className="text-sm font-semibold text-gray-800">{item.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-3 sm:pt-4">
              <button
                onClick={() => updateState({ showAllDetails: !state.showAllDetails })}
                className="w-full flex items-center justify-between p-2 sm:p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <span className="text-xs sm:text-sm font-medium text-gray-700">View All Details</span>
                {state.showAllDetails ? <FaChevronUp className="text-xs sm:text-sm" /> : <FaChevronDown className="text-xs sm:text-sm" />}
              </button>

              {state.showAllDetails && (
                <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
                  {[
                    { icon: FaFileMedical, title: "Diagnosis", value: state.insuranceInfo.diagnosis },
                    { icon: FaCalendarAlt, title: "Policy Duration", value: `${state.insuranceInfo.duration} Years` },
                    { icon: FaUserShield, title: "Enrolled Date", value: state.insuranceInfo.enrolledDate },
                    { icon: FaUserFriends, title: "Nominee", value: state.insuranceInfo.nominee },
                    { icon: FaExclamationCircle, title: "Pre-existing Cover", value: state.insuranceInfo.preExistingCover },
                    { icon: FaChartLine, title: "Claim Limit", value: `₹${state.insuranceInfo.claimLimit}` },
                    ...(state.insuranceInfo.email ? [
                      { icon: FaIdCard, title: "Email", value: state.insuranceInfo.email },
                      { icon: FaBuilding, title: "Address", value: state.insuranceInfo.address }
                    ] : [])
                  ].map((item, i) => (
                    <InsuranceDetailCard key={i} {...item} />
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 sm:gap-3 mt-4 sm:mt-6">
              <button
                onClick={() => updateState({ showInsuranceModal: false })}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-200 text-gray-800 rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enrollment Form Modal */}
      {state.showEnrollmentForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-xl w-full max-w-xs sm:max-w-md">
            <button
              onClick={() => updateState({ showEnrollmentForm: false })}
              className="absolute top-3 sm:top-4 right-3 sm:right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <IoClose className="text-xl sm:text-2xl" />
            </button>

            <div className="mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-bold text-gray-800">New Insurance Enrollment</h3>
              <p className="text-xs sm:text-sm text-gray-600">Fill in your details to get started</p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert("Enrollment submitted successfully! We'll contact you shortly.");
                updateState({
                  showEnrollmentForm: false,
                  formData: { diagnosis: "", sumAssured: "", policyType: "", duration: "" }
                });
              }}
              className="space-y-3 sm:space-y-4"
            >
              <div className="floating-input relative w-full" data-placeholder="Select Policy Type">
                <select
                  value={state.formData.policyType}
                  onChange={e => updateFormData({ policyType: e.target.value })}
                  className="w-full px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-300 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                  required
                >
                  <option value="">Select Policy</option>
                  {policyTypes.map((type, i) => (
                    <option key={i} value={type}>{type}</option>
                  ))}
                </select>
                <label className="absolute left-3 sm:left-4 -top-2.5 text-xs sm:text-sm text-gray-500 bg-white px-1 transition-all">Select Policy Type</label>
              </div>

              {[
                { label: "Medical Diagnosis", field: "diagnosis", type: "text", placeholder: "Enter your medical condition" },
                { label: "Required Sum Assured", field: "sumAssured", type: "text", placeholder: "e.g., 5,00,000" },
                { label: "Policy Duration (Years)", field: "duration", type: "number", placeholder: "1-30 years", props: { min: "1", max: "30" } }
              ].map((item, i) => (
                <div className="floating-input relative w-full" data-placeholder={item.label} key={i}>
                  <input
                    type={item.type}
                    placeholder=" "
                    className="w-full px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-300 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                    value={state.formData[item.field]}
                    onChange={e => updateFormData({ [item.field]: e.target.value })}
                    required
                    {...item.props}
                  />
                  <label className="absolute left-3 sm:left-4 -top-2.5 text-xs sm:text-sm text-gray-500 bg-white px-1 transition-all">{item.label}</label>
                </div>
              ))}

              <button
                type="submit"
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-[var(--primary-color)] text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-opacity-90 transition-colors"
              >
                Submit Enrollment
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Insurance;
