import axiosInstance from "./axiosInstance";


// Fetch all patients
export const getAllPatients = () => axiosInstance.get('/auth/patient/all');

// Get patient by ID (if needed)
export const getPatientPhoto = (path) =>
  axiosInstance.get('/auth/patient/photo', { params: { path }, responseType: 'blob',});
export const getPatientById = (id) => axiosInstance.get(`/auth/patient/${id}`);

// Update patient by ID
export const updatePatient = (id, data) => axiosInstance.put(`/auth/patient/${id}`, data);

// Doctor API Endpoints
export const getAllDoctors = () => axiosInstance.get('/auth/doctor/all');
export const getDoctorById = (id) => axiosInstance.get(`/auth/doctor/${id}`);
export const getDoctorPhoto = (path) =>
  axiosInstance.get('/auth/doctor/photo', { params: { path }, responseType: 'blob' });
export const updateDoctor = (id, data) => axiosInstance.put(`/auth/doctor/${id}`, data);
/* -----------------------------
   MASTER DATA APIs (Dropdowns for all users)
------------------------------ */
export const getSubscriptionPlans = () => axiosInstance.get('/plans');
export const getCoverageTypes = () => axiosInstance.get('/master/coverage-type');
export const getHealthConditions = () => axiosInstance.get('/master/healthConditions');
export const getGenders = () => axiosInstance.get('/master/gender');
export const getBloodGroups = () => axiosInstance.get('/master/blood-group');
export const getRelations = () => axiosInstance.get('/master/relation');
export const getPracticeTypes = () => axiosInstance.get('/master/practiceType');
export const getScanServices = () => axiosInstance.get('/master/scanServices');
export const getSpecialServices = () => axiosInstance.get('/master/specialServices');
export const getSpecializationsBySymptoms = (params) => axiosInstance.get('/master/specializations/search-by-symptoms', { params });

// Enhanced specializations API call with better error handling
export const getSpecializationsByPracticeType = (practiceTypeId) =>axiosInstance.get('/master/specializations/by-practice-type', { params: { practiceTypeId },});
export const getAllSpecializations = () =>axiosInstance.get('/master/specializations');
export const getAllSymptoms = () =>axiosInstance.get(`/symptoms`);
export const getAvailableTests = () => axiosInstance.get('/master/available-tests');
export const getCenterTypes = () => axiosInstance.get('/master/center-type');
export const getHospitalTypes = () => axiosInstance.get('/master/hospitalType');
export const getAllHospitals = () => axiosInstance.get('/hospitals');
export const getHospitalDropdown = () => axiosInstance.get('/hospitals/dropdown');
export const getAllMedicalConditions = () => axiosInstance.get('/master/medicalConditions');
export const getAllMedicalStatus = () => axiosInstance.get('/master/medicalStatus');
export const getConsultationTypes = () => axiosInstance.get('/consultation-types');

// COVERAGE TYPES
export const createCoverageType = (data) => axiosInstance.post('/master/coverage-type', data);
export const updateCoverageType = (id, data) => axiosInstance.put(`/master/coverage-type/${id}`, data);
export const deleteCoverageType = (id) => axiosInstance.delete(`/master/coverage-type/${id}`);

// HEALTH CONDITIONS
export const createHealthCondition = (data) => axiosInstance.post('/master/healthConditions', data);
export const updateHealthCondition = (id, data) => axiosInstance.put(`/master/healthConditions/${id}`, data);
export const deleteHealthCondition = (id) => axiosInstance.delete(`/master/healthConditions/${id}`);

// GENDERS
export const createGender = (data) => axiosInstance.post('/master/gender', data);
export const updateGender = (id, data) => axiosInstance.put(`/master/gender/${id}`, data);
export const deleteGender = (id) => axiosInstance.delete(`/master/gender/${id}`);

// BLOOD GROUPS
export const createBloodGroup = (data) => axiosInstance.post('/master/blood-group', data);
export const updateBloodGroup = (id, data) => axiosInstance.put(`/master/blood-group/${id}`, data);
export const deleteBloodGroup = (id) => axiosInstance.delete(`/master/blood-group/${id}`);

// AVAILABLE TESTS
export const createAvailableTest = (data) => axiosInstance.post('/master/available-tests', data);
export const updateAvailableTest = (id, data) => axiosInstance.put(`/master/available-tests/${id}`, data);
export const deleteAvailableTest = (id) => axiosInstance.delete(`/master/available-tests/${id}`);

// CENTER TYPES
export const createCenterType = (data) => axiosInstance.post('/master/center-type', data);
export const updateCenterType = (id, data) => axiosInstance.put(`/master/center-type/${id}`, data);
export const deleteCenterType = (id) => axiosInstance.delete(`/master/center-type/${id}`);

// HOSPITAL TYPES
export const createHospitalType = (data) => axiosInstance.post('/master/hospitalType', data);
export const updateHospitalType = (id, data) => axiosInstance.put(`/master/hospitalType/${id}`, data);
export const deleteHospitalType = (id) => axiosInstance.delete(`/master/hospitalType/${id}`);

// HOSPITAL LISTS
export const createHospital = (data) => axiosInstance.post('/hospitals', data);
export const getHospitalById = (id) => axiosInstance.get(`/hospitals/${id}`);
export const deleteHospital = (id) => axiosInstance.delete(`/hospitals/${id}`);

  // MEDICAL CONDITION 
export const getMedicalConditionById = (id) => axiosInstance.get(`/master/medicalConditions/${id}`);
export const updateMedicalCondition = (id, data) => axiosInstance.put(`/master/medicalConditions/${id}`, data);
export const deleteMedicalCondition = (id) => axiosInstance.delete(`/master/medicalConditions/${id}`);
export const createMedicalCondition = (data) => axiosInstance.post('/master/medicalConditions', data);

// MEDICAL STATUS 
export const getMedicalStatusById = (id) => axiosInstance.get(`/master/medicalStatus/${id}`);
export const updateMedicalStatus = (id, data) => axiosInstance.put(`/master/medicalStatus/${id}`, data);
export const deleteMedicalStatus = (id) => axiosInstance.delete(`/master/medicalStatus/${id}`);
export const createMedicalStatus = (data) => axiosInstance.post('/master/medicalStatus', data);

//dosage unit api 
export const getDosageUnits = () => axiosInstance.get("/dosage-units");
export const createDosageUnit = data => axiosInstance.post("/dosage-units", data);
export const updateDosageUnit = (id, data) => axiosInstance.put(`/dosage-units/${id}`, data);
export const deleteDosageUnit = id => axiosInstance.delete(`/dosage-units/${id}`);

// frequencies api
export const getFrequencies = () => axiosInstance.get("/frequency");
export const createFrequency = data => axiosInstance.post("/frequency", data);
export const updateFrequency = (id, data) => axiosInstance.put(`/frequency/${id}`, data);
export const deleteFrequency = id => axiosInstance.delete(`/frequency/${id}`);

// intakes api
export const getIntakes = () => axiosInstance.get("/intake");
export const createIntake = data => axiosInstance.post("/intake", data);
export const updateIntake = (id, data) => axiosInstance.put(`/intake/${id}`, data);
export const deleteIntake = id => axiosInstance.delete(`/intake/${id}`);

// vision-type api
export const getVisionTypes = () => axiosInstance.get("/vision-types");
export const createVisionType = data => axiosInstance.post("/vision-types", data);
export const updateVisionType = (id, data) => axiosInstance.put(`/vision-types/${id}`, data);
export const deleteVisionType = id => axiosInstance.delete(`/vision-types/${id}`);

// EyeTest api
export const getAllEyeTests = () => axiosInstance.get("/eye-tests");
export const getEyeTestById = id => axiosInstance.get(`/eye-tests/${id}`);
export const createEyeTest = data => axiosInstance.post("/eye-tests", data);
export const createBulkEyeTests = data => axiosInstance.post("/eye-tests/bulk", data);
export const updateEyeTest = (id, data) => axiosInstance.put(`/eye-tests/${id}`, data);
export const updateBulkEyeTests = data => axiosInstance.put("/eye-tests/bulk", data);
export const deleteEyeTest = id => axiosInstance.delete(`/eye-tests/${id}`);

// vitals api in medicalrecord in patient dashpoard
export const getPatientVitalById = (id, params) =>
  axiosInstance.get(`/Summary/patient-vitals/${id}`, { params: params || undefined });
export const getPatientVitals = () => axiosInstance.get("/Summary/patient-vitals");
export const createPatientVital = data => axiosInstance.post("/Summary/patient-vitals", data);
export const updatePatientVital = (id, data) => axiosInstance.put(`/Summary/patient-vitals/${id}`, data);
export const deletePatientVital = id => axiosInstance.delete(`/Summary/patient-vitals/${id}`);

//CONSULTATION TYPES
export const getConsultationTypeById = (id) => axiosInstance.get(`/consultation-types/${id}`);
export const createConsultationType = (data) => axiosInstance.post('/consultation-types', data);
export const updateConsultationType = (id, data) => axiosInstance.put(`/consultation-types/${id}`, data);
export const deleteConsultationType = (id) => axiosInstance.delete(`/consultation-types/${id}`);

// Tests scans packages
export const getAllTests = () => axiosInstance.get('/lab-tests');
export const getAllScans = () => axiosInstance.get('/scans');
export const getAllhealthpackages = () => axiosInstance.get('/packages');

// ********** ALLERGY API ********** //
export const getAllAllergies = () => axiosInstance.get("/allergies");
export const getAllergyById = (id) => axiosInstance.get(`/allergies/${id}`);
export const createAllergy = (data) => axiosInstance.post("/allergies", data);
export const updateAllergy = (id, data) => axiosInstance.put(`/allergies/${id}`, data);
export const deleteAllergy = (id) => axiosInstance.delete(`/allergies/${id}`);


// ********** SURGERY API ********** //
export const getAllSurgeries = () => axiosInstance.get("/surgeries");
export const getSurgeryById = (id) => axiosInstance.get(`/surgeries/${id}`);
export const createSurgery = (data) => axiosInstance.post("/surgeries", data);
export const updateSurgery = (id, data) => axiosInstance.put(`/surgeries/${id}`, data);
export const deleteSurgery = (id) => axiosInstance.delete(`/surgeries/${id}`);



// Doctor Appointments

export const getDoctorsBySpecialty = (specializationId) =>
  axiosInstance.get(`/doctors/availability/specialization/${specializationId}`);

// **********medical record details api*********//

// prescription api master data
export const getAllPrescriptions = () => axiosInstance.get("/prescriptions");
export const getDoctorPatientPrescriptions = (doctorId, patientId,context) =>
  axiosInstance.get("/doctor/prescriptions/by-doctor-patient", { params: { doctorId, patientId, context } });export const getPrescriptionsByDoctorPatient = params => axiosInstance.get("/prescriptions/by-doctor-patient", { params });
export const createPrescription = data => axiosInstance.post("/prescriptions", data);
export const updatePrescription = (id, data) => axiosInstance.put(`/prescriptions/${id}`, data);
export const deletePrescription = id => axiosInstance.delete(`/prescriptions/${id}`);

// 
export const getRoles = () => axiosInstance.get("/roles");
//dosage unit api 

// lab test api in medicalrecord in dr dashboard

export const getLabTests = () => axiosInstance.get("/lab-tests");
export const createLabTest = data => axiosInstance.post("/lab-tests", data);
export const updateLabTest = (id, data) => axiosInstance.put(`/lab-tests/${id}`, data);
export const deleteLabTest = id => axiosInstance.delete(`/lab-tests/${id}`);

// lab test medical record api in medicalrecord in dr dashboard
export const getLabActions = () => axiosInstance.get("/lab-actions");
export const createLabAction = data => axiosInstance.post("/lab-actions", data);
export const updateLabAction = (id, data) => axiosInstance.put(`/lab-actions/${id}`, data);
export const deleteLabAction = id => axiosInstance.delete(`/lab-actions/${id}`);

export const getAllClinicalNotes = () => axiosInstance.get("/clinical-notes");
export const getClinicalNotes = (patientId, doctorId, context) =>axiosInstance.get("/clinical-notes", { params: { patientId, doctorId, context } });
export const createClinicalNote = data => axiosInstance.post("/clinical-notes", data);
export const updateClinicalNote = (id, data) => axiosInstance.put(`/clinical-notes/${id}`, data);
export const deleteClinicalNote = id => axiosInstance.delete(`/clinical-notes/${id}`);

// dental-problem api
export const getDentalProblems = () => axiosInstance.get("/Dental-Problems");
export const createDentalProblem = data => axiosInstance.post("/Dental-Problems", data);
export const updateDentalProblem = (id, data) => axiosInstance.put(`/Dental-Problems/${id}`, data);
export const deleteDentalProblem = id => axiosInstance.delete(`/Dental-Problems/${id}`);

// treatment-action-plan api
export const getTreatmentActionPlans = () => axiosInstance.get("/TreatmentAction-Plan");
export const createTreatmentActionPlan = data => axiosInstance.post("/TreatmentAction-Plan", data);
export const updateTreatmentActionPlan = (id, data) => axiosInstance.put(`/TreatmentAction-Plan/${id}`, data);
export const deleteTreatmentActionPlan = id => axiosInstance.delete(`/TreatmentAction-Plan/${id}`);
// jaw postion api
export const getJawPositions = () => axiosInstance.get("/jaw-position");
export const createJawPosition = data => axiosInstance.post("/jaw-position", data);
export const updateJawPosition = (id, data) => axiosInstance.put(`/jaw-position/${id}`, data);
export const deleteJawPosition = id => axiosInstance.delete(`/jaw-position/${id}`);

// medicine api in prescription
export const searchMedicinesByName = query => axiosInstance.get(`/medicines/searchByName`, { params: { query } });

// prescription api in dr dashboard
export const getDoctorPrescriptions = () => axiosInstance.get("/doctor/prescriptions");
export const createDoctorPrescription = data => axiosInstance.post("/doctor/prescriptions", data);
export const updateDoctorPrescription = (id, data) => axiosInstance.put(`/doctor/prescriptions/${id}`, data);
export const deleteDoctorPrescription = id => axiosInstance.delete(`/doctor/prescriptions/${id}`);
export const getPrescriptionsByContextDoctorPatient = (context, contextId, doctorId, patientId) =>
  axiosInstance.get("/doctor/prescriptions/by-context-doctor-patient", {
    params: { context, contextId, doctorId, patientId }
  });
// vitals form in dr dashboard
export const createDoctorIpdVital = data => axiosInstance.post("/doctor/ipd-vitals", data);
export const getIpdVitals = (context, contextId, doctorId, patientId) =>
  axiosInstance.get(
    `/doctor/ipd-vitals/context/${context}/contextId/${contextId}/doctor/${doctorId}/patient/${patientId}`
  );

// digital signature api in dr dashboard
export const getDoctorSignatures = () => axiosInstance.get("/v1/doctor-signature");
export const uploadDoctorSignature = data => axiosInstance.post("/v1/doctor-signature", data);


// dental exam api
export const createDentalActions = (patientId, doctorId, context, data) =>
  axiosInstance.post(`/dental-actions/bulk/${patientId}/${doctorId}/${context}`, data);


// ✅ GET ALL queue tokens
export const getQueueTokens = () => axiosInstance.get("/queue-tokens");
// ✅ CREATE a new queue token
export const createQueueToken = (data) =>axiosInstance.post("/queue-tokens", data);
export const patchQueueTokenStatus = (id, status) => axiosInstance.put(`/queue-tokens/${id}/status`, null, { params: { status }});


// pani medical record details api
export const getLabScanByPatient = (patientId, params) =>
  axiosInstance.get(`/medical-record-lab-scan/${patientId}`, {
    params: params || undefined,
  });
// ✅ Get hospital billing by patientId
export const getHospitalBilling = (patientId, params) =>
  axiosInstance.get(`/medical-record-billing/hospitals/${patientId}`, {
    params: {
      patientId: patientId,
      ...params,
    },
  });

// ✅ Get lab billing by patientId
export const getLabBilling = (patientId, params) =>
  axiosInstance.get(`/medical-record-billing/labs/${patientId}`, {
    params: {
      patientId: patientId,
      ...params,
    },
  });

// ✅ Get pharmacy billing by patientId
export const getPharmacyBilling = (patientId, params) =>
  axiosInstance.get(`/medical-record-billing/pharmacy/${patientId}`, {
    params: {
      patientId: patientId,
      ...params,
    },
  });
export const getPatientPrescriptionsData = (patientId, params) => {
  return axiosInstance.get(
    `/patient/prescriptions/${patientId}`,
    {
       params: params || undefined
    }
  );
};
// ✅ Get medical info by patientId
export const getPatientMedicalInfo = (patientId, params) =>
  axiosInstance.get(`/patient/medical-info/${patientId}`, {
    params: params || undefined,
  });


  export const getVideoConsultationByPatient = (patientId, virtualRecordId) => {
  return axiosInstance.get(`/videos/${patientId}`, {
    params: {
      patientId: patientId,          // query param
      virtualRecordId: virtualRecordId
    }
  });
};
// GET /api/lab-available-tests?selectedTests=&selectedScans=&selectedPackages=
export const getAvailableLabsBySelection = ({ selectedTests = [], selectedScans = [], selectedPackages = [] }) =>
  axiosInstance.get("/lab-available-tests", {
    params: { selectedTests, selectedScans, selectedPackages },
    paramsSerializer: {
      serialize: (params) => {
        const usp = new URLSearchParams();
        (params.selectedTests || []).forEach((v) => usp.append("selectedTests", String(v)));
        (params.selectedScans || []).forEach((v) => usp.append("selectedScans", String(v)));
        (params.selectedPackages || []).forEach((v) => usp.append("selectedPackages", String(v)));
        return usp.toString();
      },
    },
  });

  // LAB AVAILABLE TESTS (custom API)
export const getAllLabAvailableTests = () =>
  axiosInstance.get("/lab-available-tests/getall");

// GET /api/lab-available-tests/search?location=Hyderabad
// export const searchAvailableLabsByLocation = (location) =>
//   axiosInstance.get("/lab-available-tests/search", {
//     params: { location },
//   });

  export const getAllAvailableLabs = () =>
  axiosInstance.get("/lab-available-tests/getall");


export const getDoctorIpdVitalsByContext = (doctorId, patientId, context) =>
  axiosInstance.get(`/doctor/ipd-vitals/doctor/${doctorId}/patient/${patientId}/context/${context}`);
export const getConsultationModes = () =>
  axiosInstance.get("/master/consultation-modes");
export const getPatientPrescriptions = (patientId) =>
  axiosInstance.get(`/patient/prescriptions/${patientId}`);
export const getUrgencyLevels = () => axiosInstance.get("/master/urgency-levels");

export const getPharmaciesByCity = (city) =>
  axiosInstance.get("/pharmacies", { params: { city } });
export const getPharmacyByCityAndPincode = (city, pincode) =>
  axiosInstance.get("/pharmacy", { params: { city, pincode } });


/* -----------------------------
   PATIENT NOTIFICATIONS APIs
------------------------------ */
// GET paginated notifications for a patient
export const getPatientNotifications = ({ patientId, page = 1, size = 20 }) =>
  axiosInstance.get(`/patient/notifications`, { params: { patientId, page, size } });

// GET unread count
export const getPatientUnreadNotificationCount = (patientId) =>
  axiosInstance.get(`/patient/notifications/unread/count`, { params: { patientId } });

// GET latest N notifications
export const getLatestPatientNotifications = (patientId, limit = 5) =>
  axiosInstance.get(`/patient/notifications/latest`, { params: { patientId, limit } });

// POST mark one notification as read
export const markPatientNotificationRead = (notificationId, patientId) =>
  axiosInstance.post(`/patient/notifications/${notificationId}/read`, null, { params: { patientId } });

// POST mark all as read
export const markAllPatientNotificationsRead = (patientId) =>
  axiosInstance.post(`/patient/notifications/mark-all-read`, null, { params: { patientId } });




/* -----------------------------
   PATIENT OPD  APIs IN DR DASHBAORD
------------------------------ */
// date in doctor dashboard in opd tab 

export const getDoctorAvailabilityByDate = (doctorId, date) =>
  axiosInstance.get(`/doctors/availability/${doctorId}/date/${date}`);

// ➕ Create new OPD appointment
export const createOpdAppointment = (data) =>
  axiosInstance.post("/v1/appointments/opd", data);

// Get OPD appointments by doctor ID
export const getOpdAppointmentsByDoctor = (doctorId) =>
  axiosInstance.get(`/v1/appointments/opd/doctor/${doctorId}`);
// reason of visite
export const getVisitReasons = () =>
  axiosInstance.get("/master/visit-reasons");
export const updateOpdAppointmentById = (id, data) =>
  axiosInstance.put(`/v1/appointments/opd/${id}`, data);