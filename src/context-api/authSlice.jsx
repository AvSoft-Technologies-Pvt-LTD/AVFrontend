import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../utils/axiosInstance';

const BASE_URL = 'http://localhost:8080/api/auth';
const MOCK_OTP = "123456";

// Helper function to simulate API delay
const mockApiDelay = () => new Promise(resolve => setTimeout(resolve, 1000));

// Helper to set/remove Bearer token globally
const setAuthToken = (token) => {
  if (token) {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers.common['Authorization'];
  }
};

const storedUser = JSON.parse(localStorage.getItem('user')) || null;
const storedToken = localStorage.getItem('token') || null;

// Register User
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (formData, { rejectWithValue }) => {
    try {
      const userType = formData.get('userType');
      if (!userType) {
        return rejectWithValue('User type is required');
      }
      const endpoint = `${BASE_URL}/${userType}/register`;
      const response = await axiosInstance.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Helper function to safely get form data values
      const getValue = (key) => {
        const value = formData.get(key);
        if (value !== undefined && value !== null && value !== '') {
          return value;
        }
        return response.data?.[key] ?? null;
      };

      // Extract all necessary values from form data
      const firstName = getValue('firstName');
      const middleName = getValue('middleName');
      const lastName = getValue('lastName');
      const phone = getValue('phone');
      const email = getValue('email');
      const aadhaar = getValue('aadhaar');
      const gender = getValue('gender');
      const genderId = getValue('genderId');
      const dob = getValue('dob');
      const pinCode = getValue('pinCode');
      const city = getValue('city');
      const district = getValue('district');
      const stateName = getValue('stateName');
      const occupation = getValue('occupation');
      const agreeDeclaration = getValue('agreeDeclaration');
      const registrationNumber = getValue('registrationNumber');
      const practiceTypeId = getValue('practiceTypeId');
      const specializationId = getValue('specializationId');
      const qualification = getValue('qualification');
      const isAssociatedWithClinicHospital = getValue('isAssociatedWithClinicHospital');
      const clinicName = getValue('clinicName');
      const associatedHospital = getValue('associatedHospital');
      const hospitalId = getValue('hospitalId');
      const practiceType = getValue('practiceType');
      const specialization = getValue('specialization');

      const fullName = [firstName, middleName, lastName].filter(Boolean).join(' ');
      const address = [
        getValue('address'),
        city,
        district,
        stateName,
        pinCode
      ].filter(Boolean).join(', ');

      return {
        ...response.data,
        userType,
        firstName,
        middleName,
        lastName,
        name: fullName,
        fullName,
        phone,
        number: phone,
        email,
        aadhaar,
        gender,
        genderId,
        dob,
        pinCode,
        city,
        district,
        stateName,
        occupation,
        agreeDeclaration,
        address: response.data?.address || address,
        registrationNumber,
        practiceTypeId,
        practiceType,
        specializationId,
        specialization,
        qualification,
        isAssociatedWithClinicHospital,
        clinicName,
        associatedHospital,
        hospitalId,
        doctorDetails: response.data?.doctorDetails || {
          registrationNumber,
          practiceTypeId,
          specializationId,
          qualification,
          practiceType,
          specialization,
          isAssociatedWithClinicHospital,
          clinicName,
          associatedHospital,
          hospitalId,
          agreeDeclaration
        },
        patientId: response.data?.patientId ?? null,
        doctorId: response.data?.doctorId ?? null,
        userId: response.data?.userId ?? null,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Registration failed. Please try again.'
      );
    }
  }
);

// Update Patient
export const updatePatient = createAsyncThunk(
  'auth/updatePatient',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        `${BASE_URL}/patient/${id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to update patient'
      );
    }
  }
);

// Update Doctor
export const updateDoctor = createAsyncThunk(
  'auth/updateDoctor',
  async ({ id, formData }, { rejectWithValue }) => {
    if (!id) {
      return rejectWithValue("Doctor ID is required.");
    }

    try {
      const response = await axiosInstance.put(
        `${BASE_URL}/doctor/${id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to update doctor'
      );
    }
  }
);

// Login User
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ identifier, password }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${BASE_URL}/login`, {
        identifier,
        password
      });
      const userData = response.data;
      const normalizedUserType = userData.role ? userData.role.toLowerCase() : null;
      const doctorDetails = userData.doctorDetails || (normalizedUserType === 'doctor' ? {
        registrationNumber: userData.registrationNumber || null,
        practiceTypeId: userData.practiceTypeId || null,
        specializationId: userData.specializationId || null,
        qualification: userData.qualification || null,
        practiceType: userData.practiceType || null,
        specialization: userData.specialization || null,
        isAssociatedWithClinicHospital: userData.isAssociatedWithClinicHospital || null,
        clinicName: userData.clinicName || null,
        associatedHospital: userData.associatedHospital || null,
        agreeDeclaration: userData.agreeDeclaration ?? null,
      } : null);

      const userWithToken = {
        ...userData,
        userType: normalizedUserType,
        role: userData.role,
        identifier: userData.identifier || identifier,
        isAuthenticated: true,
        patientId: userData.patientId,
        doctorId: userData.doctorId || null,
        userId: userData.userId,
        permissions: userData.permissions,
        name: userData.name,
        number: userData.number,
        address: userData.address,
        gender: userData.gender,
        dob: userData.dob,
        qualification: userData.qualification || null,
        practiceType: userData.practiceType || null,
        specialization: userData.specialization || null,
        registrationNumber: userData.registrationNumber || doctorDetails?.registrationNumber || null,
        practiceTypeId: userData.practiceTypeId || doctorDetails?.practiceTypeId || null,
        specializationId: userData.specializationId || doctorDetails?.specializationId || null,
        isAssociatedWithClinicHospital: userData.isAssociatedWithClinicHospital || doctorDetails?.isAssociatedWithClinicHospital || null,
        clinicName: userData.clinicName || doctorDetails?.clinicName || null,
        associatedHospital: userData.associatedHospital || doctorDetails?.associatedHospital || null,
        hospitalName: userData.hospitalName || null,
        clinicName: userData.clinicName || null,
        doctorDetails,
      };

      // Save in localStorage
      localStorage.setItem('user', JSON.stringify(userWithToken));
      localStorage.setItem('token', userWithToken.token);
      localStorage.setItem('identifier', identifier);
      // Set Bearer token globally
      setAuthToken(userWithToken.token);
      return userWithToken;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Login failed. Please check your credentials.'
      );
    }
  }
);

// Mock Send Registration OTP
export const sendOTP = createAsyncThunk(
  'auth/sendOTP',
  async (identifier, { rejectWithValue }) => {
    try {
      await mockApiDelay();
      console.log(`[MOCK] OTP sent to ${identifier}. Use "${MOCK_OTP}" for verification.`);
      return {
        success: true,
        message: "OTP sent successfully",
        data: { sent: true, identifier, otpSentAt: new Date().toISOString() }
      };
    } catch {
      return rejectWithValue('Failed to send OTP');
    }
  }
);

// Mock Send Login OTP
export const sendLoginOTP = createAsyncThunk(
  'auth/sendLoginOTP',
  async (identifier, { rejectWithValue }) => {
    try {
      await mockApiDelay();
      console.log(`[MOCK] Login OTP sent to ${identifier}. Use "${MOCK_OTP}" for verification.`);
      return {
        success: true,
        message: "Login OTP sent successfully",
        data: { sent: true, identifier, otpSentAt: new Date().toISOString() }
      };
    } catch {
      return rejectWithValue('Failed to send login OTP');
    }
  }
);

// Verify OTP
export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async ({ identifier, otp, type, registrationData }, { rejectWithValue, dispatch }) => {
    try {
      // For testing, we'll use the hardcoded OTP
      const expectedOTP = process.env.NODE_ENV === 'development' ? MOCK_OTP : otp;

      // In production, you would verify the OTP with your backend
      // const response = await axiosInstance.post(`${BASE_URL}/verify-otp`, { identifier, otp });

      await mockApiDelay();

      if (otp !== expectedOTP) {
        return rejectWithValue(`Invalid OTP. Please use "${MOCK_OTP}" for testing.`);
      }

      if (type === 'registration' && registrationData) {
        // Helper function to sanitize file objects
        const sanitizeFile = (file) => {
          if (!file) return null;
          if (file instanceof File) {
            return {
              name: file.name,
              size: file.size,
              type: file.type,
              lastModified: file.lastModified
            };
          }
          return file;
        };

        // Create a sanitized copy of registrationData
        const sanitizedData = {
          ...registrationData,
          // Handle photo file
          photo: sanitizeFile(registrationData.photo),
          // Handle other potential file fields
          ...(registrationData.certificates && {
            certificates: registrationData.certificates.map(cert => ({
              ...cert,
              file: sanitizeFile(cert.file)
            }))
          }),
          // Handle any other file fields that might exist
          ...(registrationData.documents && {
            documents: registrationData.documents.map(doc => ({
              ...doc,
              file: sanitizeFile(doc.file)
            }))
          })
        };

        const userType = sanitizedData.userType || 'patient';
        const role = userType.charAt(0).toUpperCase() + userType.slice(1);

        const userData = {
          ...sanitizedData,
          isAuthenticated: true,
          token: `mock-jwt-token-${Date.now()}`,
          userType,
          role,
          permissions: sanitizedData.permissions || [],
          name: sanitizedData.name || `${sanitizedData.firstName || ''} ${sanitizedData.lastName || ''}`.trim(),
          number: sanitizedData.phone || sanitizedData.number,
          ...(userType === 'doctor' && { doctorId: sanitizedData.doctorId }),
          ...(userType === 'patient' && { patientId: sanitizedData.patientId }),
          ...(userType === 'hospital' && { hospitalId: sanitizedData.hospitalId }),
          ...(userType === 'lab' && { labId: sanitizedData.labId }),
        };

        // Ensure we're not storing any non-serializable data
        const serializableUserData = JSON.parse(JSON.stringify(userData));

        localStorage.setItem('user', JSON.stringify(serializableUserData));
        localStorage.setItem('token', userData.token);
        setAuthToken(userData.token);
        return serializableUserData;
      } else if (type === 'login') {
        return {
          isAuthenticated: true,
          token: `mock-jwt-token-${Date.now()}`,
          userType: 'patient',
          role: 'Patient',
          permissions: []
        };
      }
      return rejectWithValue('Invalid verification type or missing data');
    } catch (error) {
      console.error('OTP Verification Error:', error);
      return rejectWithValue(error.message || 'OTP verification failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: storedUser || null,
    loading: false,
    error: null,
    isOTPSent: false,
    isVerified: false,
    isAuthenticated: !!storedToken,
    userType: storedUser?.userType || null,
    registrationData: null,
    token: storedToken || null,
    mockOTP: MOCK_OTP,
    patientId: storedUser?.patientId || null,
    doctorId: storedUser?.doctorId || null,
    userId: storedUser?.userId || null,
    permissions: storedUser?.permissions || [],
    name: storedUser?.name || null,
    number: storedUser?.number || null,
    address: storedUser?.address || null,
    gender: storedUser?.gender || null,
    dob: storedUser?.dob || null,
    qualification: storedUser?.qualification || null,
    practiceType: storedUser?.practiceType || null,
    practiceTypeId: storedUser?.practiceTypeId || null,
    specialization: storedUser?.specialization || null,
    specializationId: storedUser?.specializationId || null,
    registrationNumber: storedUser?.registrationNumber || null,
    isAssociatedWithClinicHospital: storedUser?.isAssociatedWithClinicHospital || null,
    clinicName: storedUser?.clinicName || null,
    associatedHospital: storedUser?.associatedHospital || null,
    hospitalName: storedUser?.hospitalName || null,
    doctorDetails: storedUser?.doctorDetails || null,
  },
  reducers: {
    resetAuthState: (state) => {
      state.user = null;
      state.loading = false;
      state.error = null;
      state.isOTPSent = false;
      state.isVerified = false;
      state.isAuthenticated = false;
      state.userType = null;
      state.registrationData = null;
      state.token = null;
      state.patientId = null;
      state.doctorId = null;
      state.userId = null;
      state.permissions = [];
      state.name = null;
      state.number = null;
      state.address = null;
      state.gender = null;
      state.dob = null;
      state.qualification = null;
      state.practiceType = null;
      state.specialization = null;
      state.registrationNumber = null;
      state.isAssociatedWithClinicHospital = null;
      state.clinicName = null;
      state.associatedHospital = null;
      state.hospitalName = null;
      state.doctorDetails = null;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('identifier');
      setAuthToken(null);
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setUserType: (state, action) => {
      state.userType = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.token = null;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('identifier');
      setAuthToken(null);
    },
    clearError: (state) => {
      state.error = null;
    },
    initializeAuth: (state) => {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');
      if (user && token) {
        state.user = user;
        state.isAuthenticated = true;
        state.token = token;
        state.userType = user.userType;
        state.patientId = user.patientId;
        state.doctorId = user.doctorId;
        state.userId = user.userId;
        state.permissions = user.permissions;
        state.name = user.name;
        state.number = user.number;
        state.address = user.address;
        state.gender = user.gender;
        state.dob = user.dob;
        state.qualification = user.qualification;
        state.practiceType = user.practiceType;
        state.specialization = user.specialization;
        state.registrationNumber = user.registrationNumber;
        state.isAssociatedWithClinicHospital = user.isAssociatedWithClinicHospital;
        state.clinicName = user.clinicName;
        state.associatedHospital = user.associatedHospital;
        state.hospitalName = user.hospitalName;
        state.doctorDetails = user.doctorDetails;
        setAuthToken(token);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.userType = action.payload.userType;
        state.isVerified = true;
        state.isAuthenticated = true;
        state.registrationData = null;
        state.token = action.payload.token;
        state.patientId = action.payload.patientId;
        state.doctorId = action.payload.doctorId || null;
        state.userId = action.payload.userId;
        state.permissions = action.payload.permissions;
        state.name = action.payload.name;
        state.number = action.payload.number;
        state.address = action.payload.address;
        state.gender = action.payload.gender;
        state.dob = action.payload.dob;
        state.qualification = action.payload.qualification || null;
        state.practiceType = action.payload.practiceType || null;
        state.specialization = action.payload.specialization || null;
        state.hospitalName = action.payload.hospitalName || null;
        state.clinicName = action.payload.clinicName || null;
        state.doctorDetails = action.payload.doctorDetails || null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isVerified = false;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.userType = action.payload.userType;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.patientId = action.payload.patientId;
        state.doctorId = action.payload.doctorId || null;
        state.userId = action.payload.userId;
        state.permissions = action.payload.permissions;
        state.name = action.payload.name;
        state.number = action.payload.number;
        state.address = action.payload.address;
        state.gender = action.payload.gender;
        state.dob = action.payload.dob;
        state.qualification = action.payload.qualification || null;
        state.practiceType = action.payload.practiceType || null;
        state.specialization = action.payload.specialization || null;
        state.hospitalName = action.payload.hospitalName || null;
        state.clinicName = action.payload.clinicName || null;
        state.doctorDetails = action.payload.doctorDetails || null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      .addCase(sendOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendOTP.fulfilled, (state) => {
        state.loading = false;
        state.isOTPSent = true;
      })
      .addCase(sendOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(sendLoginOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendLoginOTP.fulfilled, (state) => {
        state.loading = false;
        state.isOTPSent = true;
      })
      .addCase(sendLoginOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(verifyOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.userType = action.payload.userType;
        state.isVerified = true;
        state.isAuthenticated = true;
        state.registrationData = null;
        state.token = action.payload.token;
        state.patientId = action.payload.patientId;
        state.doctorId = action.payload.doctorId || null;
        state.userId = action.payload.userId;
        state.permissions = action.payload.permissions;
        state.name = action.payload.name;
        state.number = action.payload.number;
        state.address = action.payload.address;
        state.gender = action.payload.gender;
        state.dob = action.payload.dob;
        state.qualification = action.payload.qualification || null;
        state.practiceType = action.payload.practiceType || null;
        state.specialization = action.payload.specialization || null;
        state.hospitalName = action.payload.hospitalName || null;
        state.clinicName = action.payload.clinicName || null;
        state.doctorDetails = action.payload.doctorDetails || null;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isVerified = false;
      })
      .addCase(updatePatient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePatient.fulfilled, (state, action) => {
        state.loading = false;
        state.user = { ...state.user, ...action.payload };
      })
      .addCase(updatePatient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateDoctor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDoctor.fulfilled, (state, action) => {
        state.loading = false;
        state.user = { ...state.user, ...action.payload };
      })
      .addCase(updateDoctor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  resetAuthState,
  setUser,
  setUserType,
  logout,
  clearError,
  initializeAuth
} = authSlice.actions;

export default authSlice.reducer;
