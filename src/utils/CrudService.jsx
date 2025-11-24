import axiosInstance from "./axiosInstance";



// Fetch all patients
export const getAllPatients = () => axiosInstance.get('/auth/patient/all');

// Get patient by ID (if needed)
export const getPatientPhoto = (path) =>
  axiosInstance.get('/auth/patient/photo', { params: { path }, responseType: 'blob',});
export const getPatientById = (id) => axiosInstance.get(`/auth/patient/${id}`);

// Update patient by ID
export const updatePatient = (id, data) => axiosInstance.put(`/auth/patient/${id}`, data);
/* -----------------------------


/* -----------------------------
   FAMILY MEMBERS (CRUD)
------------------------------ */
// Get ALL family members (for admin/super admin use)
export const getAllFamilyMembers = () => 
  axiosInstance.get('/patient-dashboard/family-members');

// Get family members by patientId
export const getFamilyMembersByPatient = (patientId) => 
  axiosInstance.get(`/patient-dashboard/family-members/by-patient/${patientId}`);

// Get family member by its id
export const getFamilyById = (id) => 
  axiosInstance.get(`/patient-dashboard/family-members/${id}`);

// Create a new family member
export const createFamily = (data) => 
  axiosInstance.post('/patient-dashboard/family-members', data);

// Update family member by id
export const updateFamily = (id, data) => 
  axiosInstance.put(`/patient-dashboard/family-members/${id}`, data);

// Delete family member by id
export const deleteFamily = (id) => 
  axiosInstance.delete(`/patient-dashboard/family-members/${id}`);


/* -----------------------------
   HEALTHCARD GENERATION (CRUD)
------------------------------ */

// Generate a new health card for a patient
export const generateHealthCard = (patientId) => {
  return axiosInstance.post(`/health-cards/generate/${patientId}`);
};

// Get an existing health card by patientId
export const getHealthCardByPatientId = (patientId) => {
  return axiosInstance.get(`/health-cards/patient/${patientId}`);
};

// Create or update health card (POST endpoint for new cards)
export const createHealthCard = (data) => {
  return axiosInstance.post('/health-cards', data);
};

// Update existing health card
export const updateHealthCard = (healthCardId, data) => {
  return axiosInstance.put(`/health-cards/${healthCardId}`, data);
};

/* -----------------------------
   HEALTHCARD PLAN SELECTION (CRUD)
------------------------------ */

// Get patient subscription
export const getPatientSubscription = (patientId) => {
  return axiosInstance.get(`/patients/${patientId}/subscription`);
};

// Create subscription for a patient
export const createPatientSubscription = (patientId, data) => {
  return axiosInstance.post(`/patients/${patientId}/subscription`, data);
};

// Update subscription for a patient
export const updatePatientSubscription = (patientId, data) => {
  return axiosInstance.put(`/patients/${patientId}/subscription`, data);
};

// Get QR image as blob
export const getQRImage = (filename) => {
  return axiosInstance.get(`/uploads/qrcodes/${filename}`, {
    responseType: 'blob'
  });
};

/* -----------------------------
   ADDITIONAL DETAILS (CRUD)
------------------------------ */
export const getAdditionalDetailsByPatientId = (patientId) =>
  axiosInstance.get(`/auth/patient/additional-details/${patientId}`);
export const createAdditionalDetails = (patientId, data) =>
  axiosInstance.post(`/auth/patient/additional-details/${patientId}`, data);
export const updateAdditionalDetails = (patientId, data) =>
  axiosInstance.put(`/auth/patient/additional-details/${patientId}`, data);
export const deleteAdditionalDetails = (patientId) =>
  axiosInstance.delete(`/auth/patient/additional-details/${patientId}`);
/* -----------------------------
   IPD VITALS (CRUD)
------------------------------ */
// Get vitals by doctorId, patientId, and context
export const getIpdVitals = (doctorId, patientId, context) =>
  axiosInstance.get(`/ipd-vitals/doctor/${doctorId}/patient/${patientId}/context/${context}`);

// Create new IPD vitals
export const createIpdVitals = (data) =>
  axiosInstance.post("/ipd-vitals", data);

// Update IPD vitals by ID
export const updateIpdVitals = (id, data) =>
  axiosInstance.put(`/ipd-vitals/${id}`, data);

// Delete IPD vitals by ID
export const deleteIpdVitals = (id) =>
  axiosInstance.delete(`/ipd-vitals/${id}`);

/* -----------------------------
   PATIENT VITALS (CRUD)
------------------------------ */

// Get all vitals
export const getAllVitals = () => axiosInstance.get("/patient/vitals");

// Get vitals by ID
export const getVitalsById = (patientId) => axiosInstance.get(`/patient/vitals/${patientId}`);

// Create new vitals
export const createVitals = (data) => axiosInstance.post("/patient/vitals", data);

// Update vitals by ID
export const updateVitals = (patientId, data) => axiosInstance.put(`/patient/vitals/${patientId}`, data);

// Delete vitals by ID
export const deleteVitals = (patientId) => axiosInstance.delete(`/patient/vitals/${patientId}`);
/* -----------------------------
   PERSONAL HEALTH (CRUD)
------------------------------ */
// Get all personal health records (for admin use)
export const getAllPersonalHealth = () => 
  axiosInstance.get('/patient-dashboard/personal-health');

// Get personal health by patientId (NEW - matches your API)
export const getPersonalHealthByPatientId = (patientId) => 
  axiosInstance.get(`/patient-dashboard/personal-health/${patientId}`);

// Create personal health record
export const createPersonalHealth = (data) => 
  axiosInstance.post('/patient-dashboard/personal-health', data);

// Update personal health by patientId (UPDATED - matches your API)
export const updatePersonalHealth = (patientId, data) => 
  axiosInstance.put(`/patient-dashboard/personal-health/${patientId}`, data);

// Delete personal health by patientId (UPDATED - matches your API)
export const deletePersonalHealth = (patientId) => 
  axiosInstance.delete(`/patient-dashboard/personal-health/${patientId}`);

// Legacy functions for backward compatibility (if needed elsewhere)
export const getPersonalHealthById = (id) => 
  axiosInstance.get(`/patient-dashboard/personal-health/${id}`);


// OPD Records
export const getOPDRecordsByPatientId = (patientId) =>
  axiosInstance.get(`/opd-records/${patientId}`);

export const createOPDRecord = (data) =>
  axiosInstance.post("opd-records", data);

export const deleteOPDRecord = (recordId) =>
  axiosInstance.delete(`/opd-records/${recordId}`);

// IPD Records
export const getIPDRecordsByPatientId = (patientId) =>
  axiosInstance.get(`/ipd-records/${patientId}`);

export const createIPDRecord = (data) =>
  axiosInstance.post("/ipd-records", data);

export const deleteIPDRecord = (recordId) =>
  axiosInstance.delete(`/ipd-records/${recordId}`);

// Virtual Records
export const getVirtualRecordsByPatientId = (patientId) =>
  axiosInstance.get(`/virtual-records/${patientId}`);

export const createVirtualRecord = (data) =>
  axiosInstance.post("/virtual-records", data);

export const deleteVirtualRecord = (recordId) =>
  axiosInstance.delete(`/virtual-records/${recordId}`);

/* -----------------------------
   WARD TYPES (CRUD)
------------------------------ */
export const getAllWardTypes = () =>
  axiosInstance.get('/ward-types');

export const getWardTypeById = (id) =>
  axiosInstance.get(`/ward-types/${id}`);

export const createWardType = (data) =>
  axiosInstance.post('/ward-types', data);

export const updateWardType = (id, data) =>
  axiosInstance.put(`/ward-types/${id}`, data);

export const deleteWardType = (id) =>
  axiosInstance.delete(`/ward-types/${id}`);


/* -----------------------------
   ROOM AMENITIES (CRUD)
------------------------------ */
// Get all room amenities
export const getAllRoomAmenities = () =>
  axiosInstance.get('/room-amenities');

// Get room amenity by id
export const getRoomAmenityById = (id) =>
  axiosInstance.get(`/room-amenities/${id}`);

// Create a new room amenity
export const createRoomAmenity = (data) =>
  axiosInstance.post('/room-amenities', data);

// Update room amenity by id
export const updateRoomAmenity = (id, data) =>
  axiosInstance.put(`/room-amenities/${id}`, data);

// Delete room amenity by id
export const deleteRoomAmenity = (id) =>
  axiosInstance.delete(`/room-amenities/${id}`);

/* -----------------------------
   BED AMENITIES (CRUD)  <-- ADDED
   Endpoint base: /bed-amenities
------------------------------ */
// Get all bed amenities
export const getAllBedAmenities = () =>
  axiosInstance.get('/bed-amenities');

// Get bed amenity by id
export const getBedAmenityById = (id) =>
  axiosInstance.get(`/bed-amenities/${id}`);

// Create a new bed amenity
export const createBedAmenity = (data) =>
  axiosInstance.post('/bed-amenities', data);

// Update bed amenity by id
export const updateBedAmenity = (id, data) =>
  axiosInstance.put(`/bed-amenities/${id}`, data);

// Delete bed amenity by id
export const deleteBedAmenity = (id) =>
  axiosInstance.delete(`/bed-amenities/${id}`);

export const getAllBedStatuses = () =>
  axiosInstance.get('/bed-statuses');

export const getBedStatusById = (id) =>
  axiosInstance.get(`/bed-statuses/${id}`);

export const createBedStatus = (data) =>
  axiosInstance.post('/bed-statuses', data);

export const updateBedStatus = (id, status) =>
  axiosInstance.put(`/bed-statuses/${id}`, { status });


export const deleteBedStatus = (id) =>
  axiosInstance.delete(`/bed-statuses/${id}`);

export const getSpecializationsWithWards = () =>
  axiosInstance.get("/specializations/wards");

export const createSpecializationWards = (data) =>
  axiosInstance.post(
    '/specializations/wards',
    Array.isArray(data) ? data : [data]
  );


// PUT: Update ward hierarchy for a specific specialization
export const updateSpecializationWards = (specializationId, data) =>
  axiosInstance.put(
    `/specializations/wards/specializations/${specializationId}/wards`,
    Array.isArray(data) ? data : (data?.wards ?? [data])
  );


// DELETE: Delete a specific ward by wardId
export const deleteWard = (wardId) =>
  axiosInstance.delete(`/specializations/wards/wards/${wardId}`);
export const getSpecializationsWardsSummaryById = (specializationId) =>
  axiosInstance.get(`/specializations/wards/summary/${specializationId}`);

// Get summary of specializations with wards (new)
export const getSpecializationsWardsSummary = () =>
  axiosInstance.get('/specializations/wards/summary');

// Get a single ward by id
export const getWardById = (wardId) =>
  axiosInstance.get(`/specializations/wards/ward/${wardId}`);

/* -----------------------------
   🚑 AMBULANCE (PUBLIC APIs)
------------------------------ */

export const getAllAmbulanceTypes = () =>
  axiosInstance.get('/ambulance/public/types');

export const getAllAmbulanceEquipments = () =>
  axiosInstance.get('/ambulance/public/equipments');

export const getAllAmbulanceCategories = () =>
  axiosInstance.get('/ambulance/public/categories');

// ✅ NEW: Get all hospitals (public)
export const getAllHospitals = () =>
  axiosInstance.get('/ambulance/public/hospitals');

export const getSpecializationsWardsSummaryForIpdAdmission = () =>
  axiosInstance.get('/specializations/wards/summary/ipd-addmission');

export const createAmbulanceBooking = (data) =>
  axiosInstance.post('/ambulance/bookings', data);
/* -----------------------------
   VIRTUAL APPOINTMENTS (CRUD)
------------------------------ */
// Get all virtual appointments
export const getAllVirtualAppointments = () =>
  axiosInstance.get('/doc-virtual-appointments');
 
// Get virtual appointment by ID
export const getVirtualAppointmentById = (doctorId) => {
  return axiosInstance.get(`/doc-virtual-appointments/doctorId/${doctorId}`);
};

// Create a new virtual appointment
export const createVirtualAppointment = (data) =>
  axiosInstance.post('/doc-virtual-appointments', data);
 
// Update virtual appointment by ID
export const updateVirtualAppointment = (id, data) =>
  axiosInstance.put(`/doc-virtual-appointments/${id}`, data);
 
// Delete virtual appointment by ID
export const deleteVirtualAppointment = (id) =>
  axiosInstance.delete(`/doc-virtual-appointments/${id}`);

// -----------------------------
// MEDICAL RECORDS (CRUD)
// -----------------------------
// Get all medical records
export const getAllMedicalRecords = (doctorId, patientId, context, registerPhone) =>
  axiosInstance.get('/medical-records', {params: { doctorId, patientId, context, registerPhone } });

// Get medical record by ID
export const getMedicalRecordById = (id) =>
  axiosInstance.get(`/medical-records/${id}`);

// Create a new medical record
export const createMedicalRecord = (data) =>
  axiosInstance.post('/medical-records', data);

export const createIpdMedicalRecord = (payload) =>
  axiosInstance.post('/medical-records/ipd', payload);

// Update medical record by ID
export const updateMedicalRecord = (id, data) =>
  axiosInstance.put(`/medical-records/${id}`, data);

// Delete medical record by ID
export const deleteMedicalRecord = (id) =>
  axiosInstance.delete(`/medical-records/${id}`);


/* -----------------------------
   AVAILABILITY SCHEDULES (CRUD)
------------------------------ */

// Get all availability schedules
export const getAllAvailabilitySchedules = () =>
  axiosInstance.get('/availability-schedules');

// Get availability schedule by ID
export const getAvailabilityScheduleById = (scheduleId) =>
  axiosInstance.get(`/availability-schedules/${scheduleId}`);

// Get availability schedules by doctor ID
export const getAvailabilitySchedulesByDoctor = (doctorId) =>
  axiosInstance.get(`/availability-schedules/doctor/${doctorId}`);

// Get current availability schedules for a doctor
export const getCurrentAvailabilitySchedules = (doctorId) =>
  axiosInstance.get(`/availability-schedules/doctor/${doctorId}/current`);

// Get availability schedules by doctor and specific date
export const getAvailabilitySchedulesByDoctorAndDate = (doctorId, date) =>
  axiosInstance.get(`/availability-schedules/doctor/${doctorId}/date/${date}`);

// Get availability schedules by doctor and date range
export const getAvailabilitySchedulesByDoctorAndDateRange = (doctorId, startDate, endDate) =>
  axiosInstance.get(`/availability-schedules/doctor/${doctorId}/date-range`, {
    params: { startDate, endDate }
  });

// Create new availability schedule
export const createAvailabilitySchedule = (data) =>
  axiosInstance.post('/availability-schedules', data);

// Update availability schedule
export const updateAvailabilitySchedule = (scheduleId, data) =>
  axiosInstance.put(`/availability-schedules/${scheduleId}`, data);

// Delete availability schedule
export const deleteAvailabilitySchedule = (scheduleId) =>
  axiosInstance.delete(`/availability-schedules/${scheduleId}`);

/* -----------------------------
   APPOINTMENT DURATIONS (CRUD)
------------------------------ */

// Get all appointment durations
export const getAllAppointmentDurations = () =>
  axiosInstance.get('/appointment-durations');

// Get appointment duration by ID
export const getAppointmentDurationById = (id) =>
  axiosInstance.get(`/appointment-durations/${id}`);

// Create new appointment duration
export const createAppointmentDuration = (data) =>
  axiosInstance.post('/appointment-durations', data);

// Update appointment duration
export const updateAppointmentDuration = (id, data) =>
  axiosInstance.put(`/appointment-durations/${id}`, data);

// Delete appointment duration
export const deleteAppointmentDuration = (id) =>
  axiosInstance.delete(`/appointment-durations/${id}`);

export const searchAmbulancesPublic = (keyword) =>
  axiosInstance.get('/ambulance/public/search', { params: { keyword } });

export const getNearbyAmbulances = (latitude, longitude, radiusKm = 10) =>
  axiosInstance.get('/ambulance/public/nearby', {
    params: { latitude, longitude, radiusKm },
  });

//cart
// Cart API functions
// CREATE CART (POST /lab/cart/add)
export const createLabCart = (cartData) =>
  axiosInstance.post('/lab/cart/add', cartData);

// GET CART BY CART ID (GET /lab/cart/{id})
export const getLabCart = (cartId) =>
  axiosInstance.get(`/lab/cart/${cartId}`);

// UPDATE CART (PUT /lab/cart/{id})
export const updateLabCart = (cartId, cartData) =>
  axiosInstance.put(`/lab/cart/${cartId}`, cartData);

// DELETE CART (DELETE /lab/cart/{id})
export const deleteLabCart = (cartId) =>
  axiosInstance.delete(`/lab/cart/${cartId}`);
// available labs
export const getLabDetails = () =>
  axiosInstance.get('/lab-details');


// --- Lab catalog detail APIs ---
export const getLabTestById = (id) => axiosInstance.get(`/lab-tests/${id}`);
export const getScanById = (id) => axiosInstance.get(`/scans/${id}`);
export const getPackageById = (id) => axiosInstance.get(`/packages/${id}`);
// ✅ Get ambulances based on current location (no radius needed)
export const getCurrentAmbulances = (latitude, longitude) =>
  axiosInstance.get('/ambulance/public/current', {
    params: { latitude, longitude },
  });


  // Addd staff 
 // Get all staff
export const getAllStaff = () =>
  axiosInstance.get('/dashboard/staff');

// Get staff by ID
export const getStaffById = (id) =>
  axiosInstance.get(`/dashboard/staff/${id}`);

// Get staff by role ID
export const getStaffByRoleId = (roleId) =>
  axiosInstance.get(`/dashboard/staff/role/${roleId}`);

// Get staff by role name
export const getStaffByRoleName = (roleName) =>
  axiosInstance.get(`/dashboard/staff/role/name/${roleName}`);

// Create new staff
export const createStaff = (data) =>
  axiosInstance.post('/dashboard/staff', data);

// Update staff by ID
export const updateStaff = (id, data) =>
  axiosInstance.put(`/dashboard/staff/${id}`, data);

// Delete staff by ID
export const deleteStaff = (id) =>
  axiosInstance.delete(`/dashboard/staff/${id}`);

export const createAppointment = (data) =>
  axiosInstance.post('/labs/appointments/create', data);

export const getLabAppointmentProgress = (bookingId) =>
  axiosInstance.get(`/lab/appointments/progress/tracking/track-appointment/${bookingId}`);
// lab payment
export const createLabPayment = (paymentData) =>
  axiosInstance.post(`/lab/appoinment/api/payments`, paymentData);
// lab verfication payment otp
export const verifyLabPayment = (data) =>
  axiosInstance.post(`/lab/appoinment/api/payments/verify`, data);

export const getLabPaymentsByPatient = (patientId) =>
  axiosInstance.get(`/lab/appoinment/api/payments/appointments/${patientId}`);

// Get appointments by patient ID
export const getAppointmentsByPatientId = (patientId) =>
  axiosInstance.get(`/appointments/patient/${patientId}`);

// Get appointments by doctor ID
export const getAppointmentsByDoctorId = (doctorId) =>
  axiosInstance.get(`/appointments/doctor/${doctorId}`);

// Get rejected appointments for a doctor
export const getRejectedAppointmentsByDoctorId = (doctorId) =>
  axiosInstance.get(`/appointments/doctor/${doctorId}/rejected`);

// Get pending appointments for a doctor
export const getPendingAppointmentsByDoctorId = (doctorId) =>
  axiosInstance.get(`/appointments/doctor/${doctorId}/pending`);

// Get confirmed appointments for a doctor
export const getConfirmedAppointmentsByDoctorId = (doctorId) =>
  axiosInstance.get(`/appointments/doctor/${doctorId}/confirmed`);

// Create a new appointment
export const createAppointments = (data) =>
  axiosInstance.post('/appointments', data);

// Doctor rejects an appointment (optionally send body, e.g. rejectReason)
export const rejectAppointment = (appointmentId, data) =>
  axiosInstance.put(`/appointments/${appointmentId}/reject`, data);

// Doctor confirms an appointment
export const confirmAppointment = (appointmentId) =>
  axiosInstance.put(`/appointments/${appointmentId}/confirm`);

// Patient cancels an appointment (optionally send body, e.g. rejectReason)
export const cancelAppointment = (appointmentId, data) =>
  axiosInstance.put(`/appointments/${appointmentId}/cancel`, data);

// Get all master queue tokens
export const getAllMasterQueueTokens = () =>
  axiosInstance.get('/master-queue-tokens');

// Get master queue token by ID
export const getMasterQueueTokenById = (tokenId) =>
  axiosInstance.get(`/master-queue-tokens/${tokenId}`);

// Create new master queue token
export const createMasterQueueToken = (data) =>
  axiosInstance.post('/master-queue-tokens', data);

// GET all IPD admissions for the entire post 
export const getAllIpdAdmissions = () =>
  axiosInstance.get("/ipd-admissions");

// GET IPD admission by ID
export const getIpdAdmissionById = (id) =>
  axiosInstance.get(`/ipd-admissions/${id}`);

// CREATE/POST new IPD admission
export const createIpdAdmission = (data) =>
  axiosInstance.post("/ipd-admissions", data);


// =======================
// INSURANCE CRUD SERVICES
// =======================

// Get all insurance list
export const getAllInsurance = () => axiosInstance.get('/insurance/all');

// Get insurance by ID
export const getInsuranceById = (id) => axiosInstance.get(`/insurance/${id}`);

// Create new insurance
export const createInsurance = (data) => axiosInstance.post('/insurance', data);

// Update insurance
export const updateInsurance = (id, data) =>
  axiosInstance.put(`/insurance/${id}`, data);

// Delete insurance
export const deleteInsurance = (id) =>
  axiosInstance.delete(`/insurance/${id}`);

//ipd entire post

export const fetchIPDAdmissions = () => axiosInstance.get('/ipd-admissions');
export const fetchIPDAdmission = (id) => axiosInstance.get(`/ipd-admissions/${id}`);
export const addIPDAdmission = (data) => axiosInstance.post('/ipd-admissions', data);
export const editIPDAdmission = (id, data) => axiosInstance.put(`/ipd-admissions/${id}`, data);
export const removeIPDAdmission = (id) => axiosInstance.delete(`/ipd-admissions/${id}`);

// Get all lab available tests
export const getAllLabAvailablesTests = () =>
  axiosInstance.get('/lab-available-tests/getall');

export const getOpdAppointmentById = (appointmentId) =>
  axiosInstance.get(`/v1/appointments/opd/appointment-id/${appointmentId}`);