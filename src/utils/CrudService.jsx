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

export const updateBedStatus = (id, data) =>
  axiosInstance.put(`/bed-statuses/${id}`, data);

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


/* -----------------------------
   VIRTUAL APPOINTMENTS (CRUD)
------------------------------ */
// Get all virtual appointments
export const getAllVirtualAppointments = () =>
  axiosInstance.get('/virtual-appointments');
// Get virtual appointment by ID
export const getVirtualAppointmentById = (id) =>
  axiosInstance.get(`/virtual-appointments/${id}`);
// Create a new virtual appointment
export const createVirtualAppointment = (data) =>
  axiosInstance.post('/virtual-appointments', data);
// Update virtual appointment by ID
export const updateVirtualAppointment = (id, data) =>
  axiosInstance.put(`/virtual-appointments/${id}`, data);
// Delete virtual appointment by ID
export const deleteVirtualAppointment = (id) =>
  axiosInstance.delete(`/virtual-appointments/${id}`);