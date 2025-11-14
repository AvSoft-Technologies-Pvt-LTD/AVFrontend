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
      const getValue = (key) => {
        const value = formData.get(key);
        if (value !== undefined && value !== null && value !== '') {
          return value;
        }
        return response.data?.[key] ?? null;
      };

      const parseBoolean = (value) => {
        if (value === null || value === undefined) return null;
        if (typeof value === 'boolean') return value;
        const normalized = String(value).trim().toLowerCase();
        if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
        if (['false', '0', 'no', 'off'].includes(normalized)) return false;
        return null;
      };

      const firstName = getValue('firstName');
      const middleName = getValue('middleName');
      const lastName = getValue('lastName');
      const phone = getValue('phone');
      const email = getValue('email');
      const pinCode = getValue('pinCode');
      const city = getValue('city');
      const district = getValue('district');
      const stateName = getValue('state');
      const dob = getValue('dob');
      const aadhaar = getValue('aadhaar');
      const genderId = getValue('genderId');
      const occupation = getValue('occupation');
      const number = getValue('number') ?? phone;
      const gender = response.data?.gender ?? getValue('gender');
      const agreeDeclaration = parseBoolean(getValue('agreeDeclaration'));
      const addressFromResponse = response.data?.address ?? null;
      const derivedAddressParts = [city, district, stateName].filter(Boolean);
      const derivedAddress = derivedAddressParts.length ? derivedAddressParts.join(', ') : null;
      const nameFromResponse = response.data?.name ?? response.data?.fullName ?? null;
      const fullName = nameFromResponse || [firstName, middleName, lastName].filter(Boolean).join(' ') || null;

      let doctorDetails = null;
      let registrationNumber = response.data?.registrationNumber ?? null;
      let practiceTypeId = response.data?.practiceTypeId ?? null;
      let specializationId = response.data?.specializationId ?? null;
      let qualification = response.data?.qualification ?? null;
      let practiceType = response.data?.practiceType ?? null;
      let specialization = response.data?.specialization ?? null;
      let isAssociatedWithClinicHospital = response.data?.isAssociatedWithClinicHospital ?? null;
      let associatedClinic = response.data?.associatedClinic ?? null;
      let associatedHospital = response.data?.associatedHospital ?? null;

      if (userType === 'doctor') {
        registrationNumber = getValue('registrationNumber') ?? registrationNumber;
        practiceTypeId = getValue('practiceTypeId') ?? practiceTypeId;
        specializationId = getValue('specializationId') ?? specializationId;
        qualification = getValue('qualification') ?? qualification;
        isAssociatedWithClinicHospital = getValue('isAssociatedWithClinicHospital') ?? isAssociatedWithClinicHospital;
        associatedClinic = getValue('associatedClinic') ?? associatedClinic;
        associatedHospital = getValue('associatedHospital') ?? associatedHospital;

        doctorDetails = {
          registrationNumber,
          practiceTypeId,
          specializationId,
          qualification,
          practiceType,
          specialization,
          isAssociatedWithClinicHospital,
          associatedClinic,
          associatedHospital,
          agreeDeclaration,
        };
      }

      return {
        ...response.data,
        userType,
        firstName,
        middleName,
        lastName,
        name: fullName,
        fullName,
        phone,
        number,
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
        address: addressFromResponse || derivedAddress,
        registrationNumber,
        practiceTypeId,
        practiceType,
        specializationId,
        specialization,
        qualification,
        isAssociatedWithClinicHospital,
        associatedClinic,
        associatedHospital,
        doctorDetails,
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
      console.log("Update patient API response:", response.data); // <-- Add this
      return response.data;
    } catch (error) {
      console.error("Update patient API error:", error.response?.data || error.message); // <-- Add this
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
    console.log("Update doctor called with ID:", id ,formData);
    
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
      console.log("Update doctor API response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Update doctor API error:", error.response?.data || error.message);
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
        associatedClinic: userData.associatedClinic || null,
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
        associatedClinic: userData.associatedClinic || doctorDetails?.associatedClinic || null,
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

// Mock Verify OTP
export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async ({ identifier, otp, type, registrationData }, { rejectWithValue }) => {
    try {
      await mockApiDelay();
      if (otp !== MOCK_OTP) {
        return rejectWithValue(`Invalid OTP. Please use "${MOCK_OTP}" for testing.`);
      }
      const isEmail = identifier.includes('@');
      const mockUser = {
        id: `mock-${Math.random().toString(36).substring(2, 9)}`,
        name: registrationData?.get('name') || "Test User",
        email: isEmail ? identifier : registrationData?.get('email'),
        phone: !isEmail ? identifier : registrationData?.get('phone'),
        number: registrationData?.get('number') || "1234567890",
        address: registrationData?.get('address') || "Test Address",
        gender: registrationData?.get('gender') || "Male",
        dob: registrationData?.get('dob') || "2000-01-01",
        role: registrationData?.get('userType')?.toUpperCase() || "USER",
        userType: registrationData?.get('userType')?.toLowerCase() || "user",
        token: `mock-token-${Math.random().toString(36).substring(2, 15)}`,
        isVerified: true,
        isAuthenticated: true,
        identifier,
        patientId: registrationData?.get('userType')?.toLowerCase() === 'patient' ? 2 : null,
        doctorId: registrationData?.get('userType')?.toLowerCase() === 'doctor' ? 2 : null,
        userId: 4,
        permissions: [],
        qualification: registrationData?.get('qualification') || null,
        practiceType: registrationData?.get('practiceType') || null,
        specialization: registrationData?.get('specialization') || null,
        hospitalName: registrationData?.get('hospitalName') || null,
        clinicName: registrationData?.get('clinicName') || null,
      };
      // Save & Set token
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('token', mockUser.token);
      localStorage.setItem('identifier', identifier);
      setAuthToken(mockUser.token);
      console.log('[MOCK] OTP verification successful. User data:', mockUser);
      return mockUser;
    } catch (error) {
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
    associatedClinic: storedUser?.associatedClinic || null,
    associatedHospital: storedUser?.associatedHospital || null,
    hospitalName: storedUser?.hospitalName || null,
    clinicName: storedUser?.clinicName || null,
    doctorDetails: storedUser?.doctorDetails || null,
  },
  reducers: {
    resetAuthState: (state) => {
      state.loading = false;
      state.error = null;
      state.isOTPSent = false;
      state.isVerified = false;
      state.isAuthenticated = false;
      state.user = null;
      state.registrationData = null;
      state.token = null;
      state.userType = null;
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
      state.practiceTypeId = null;
      state.specialization = null;
      state.specializationId = null;
      state.registrationNumber = null;
      state.isAssociatedWithClinicHospital = null;
      state.associatedClinic = null;
      state.associatedHospital = null;
      state.hospitalName = null;
      state.clinicName = null;
      state.doctorDetails = null;
      setAuthToken(null);
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.userType = action.payload.userType;
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
      state.practiceTypeId = action.payload.practiceTypeId || null;
      state.specialization = action.payload.specialization || null;
      state.specializationId = action.payload.specializationId || null;
      state.registrationNumber = action.payload.registrationNumber || null;
      state.isAssociatedWithClinicHospital = action.payload.isAssociatedWithClinicHospital || null;
      state.associatedClinic = action.payload.associatedClinic || null;
      state.associatedHospital = action.payload.associatedHospital || null;
      state.hospitalName = action.payload.hospitalName || null;
      state.clinicName = action.payload.clinicName || null;
      state.doctorDetails = action.payload.doctorDetails || null;
      setAuthToken(action.payload.token);
    },
    setUserType: (state, action) => {
      state.userType = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.userType = null;
      state.registrationData = null;
      state.token = null;
      state.isVerified = false;
      state.isOTPSent = false;
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
      state.practiceTypeId = null;
      state.specialization = null;
      state.specializationId = null;
      state.registrationNumber = null;
      state.isAssociatedWithClinicHospital = null;
      state.associatedClinic = null;
      state.associatedHospital = null;
      state.hospitalName = null;
      state.clinicName = null;
      state.doctorDetails = null;
      // Clear all from localStorage
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
        const normalizedUserType = user.role ? user.role.toLowerCase() : user.userType;
        state.user = { ...user, userType: normalizedUserType };
        state.token = token;
        state.userType = normalizedUserType;
        state.isAuthenticated = true;
        state.isVerified = true;
        state.patientId = user.patientId;
        state.doctorId = user.doctorId || null;
        state.userId = user.userId;
        state.permissions = user.permissions;
        state.name = user.name;
        state.number = user.number;
        state.address = user.address;
        state.gender = user.gender;
        state.dob = user.dob;
        state.qualification = user.qualification || null;
        state.practiceType = user.practiceType || null;
        state.practiceTypeId = user.practiceTypeId || null;
        state.specialization = user.specialization || null;
        state.specializationId = user.specializationId || null;
        state.registrationNumber = user.registrationNumber || null;
        state.isAssociatedWithClinicHospital = user.isAssociatedWithClinicHospital || null;
        state.associatedClinic = user.associatedClinic || null;
        state.associatedHospital = user.associatedHospital || null;
        state.hospitalName = user.hospitalName || null;
        state.clinicName = user.clinicName || null;
        state.doctorDetails = user.doctorDetails || null;
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
        state.registrationData = {
          name: action.payload.name,
          email: action.payload.email,
          phone: action.payload.phone,
          number: action.payload.number,
          address: action.payload.address,
          gender: action.payload.gender,
          dob: action.payload.dob,
          userType: action.payload.userType,
          patientId: action.payload.patientId,
          doctorId: action.payload.doctorId || null,
          userId: action.payload.userId,
          qualification: action.payload.qualification || null,
          practiceType: action.payload.practiceType || null,
          specialization: action.payload.specialization || null,
          hospitalName: action.payload.hospitalName || null,
          clinicName: action.payload.clinicName || null,
        };
        state.patientId = action.payload.patientId;
        state.doctorId = action.payload.doctorId || null;
        state.userId = action.payload.userId;
        state.userType = action.payload.userType;
        state.isOTPSent = false;
        state.qualification = action.payload.qualification || state.qualification;
        state.practiceType = action.payload.practiceType || state.practiceType;
        state.specialization = action.payload.specialization || state.specialization;
        state.hospitalName = action.payload.hospitalName || state.hospitalName;
        state.clinicName = action.payload.clinicName || state.clinicName;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updatePatient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePatient.fulfilled, (state, action) => {
        state.loading = false;
          console.log("Update patient response:", action.payload); 
        state.user = { ...state.user, ...action.payload };
        state.name = action.payload.firstName || action.payload.name || state.name;
        state.address = action.payload.address || state.address;
        state.gender = action.payload.gender || state.gender;
        state.dob = action.payload.dob || state.dob;
        state.qualification = action.payload.qualification || state.qualification;
        state.practiceType = action.payload.practiceType || state.practiceType;
        state.specialization = action.payload.specialization || state.specialization;
        state.hospitalName = action.payload.hospitalName || state.hospitalName;
        state.clinicName = action.payload.clinicName || state.clinicName;
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
        console.log("Update doctor response:", action.payload);
        state.user = { ...state.user, ...action.payload };
        state.name = action.payload.firstName || action.payload.name || state.name;
        state.address = action.payload.address || state.address;
        state.gender = action.payload.gender || state.gender;
        state.dob = action.payload.dob || state.dob;
        state.qualification = action.payload.qualification || state.qualification;
        state.practiceType = action.payload.practiceType || state.practiceType;
        state.specialization = action.payload.specialization || state.specialization;
        state.hospitalName = action.payload.hospitalName || state.hospitalName;
        state.clinicName = action.payload.clinicName || state.clinicName;
      })
      .addCase(updateDoctor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.userType = action.payload.userType;
        state.isVerified = true;
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
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
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
        state.isOTPSent = false;
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
        state.isOTPSent = false;
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
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isVerified = false;
      })
      // .addCase(getUserProfile.pending, (state) => {
      //   state.loading = true;
      // })
      // .addCase(getUserProfile.fulfilled, (state, action) => {
      //   state.loading = false;
      //   state.user = { ...state.user, ...action.payload };
      //   state.name = action.payload.name;
      //   state.number = action.payload.number;
      //   state.address = action.payload.address;
      //   state.gender = action.payload.gender;
      //   state.dob = action.payload.dob;
      // })
      // .addCase(getUserProfile.rejected, (state, action) => {
      //   state.loading = false;
      //   state.error = action.payload;
      // });
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
