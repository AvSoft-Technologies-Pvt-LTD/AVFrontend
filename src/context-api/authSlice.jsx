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
      return {
        ...response.data,
        userType,
        phone: formData.get('phone'),
        email: formData.get('email'),
        name: formData.get('name'),
        number: formData.get('number'),
        address: formData.get('address'),
        gender: formData.get('gender'),
        dob: formData.get('dob'),
        patientId: response.data.patientId || null,
        userId: response.data.userId || null,
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
      const userWithToken = {
        ...userData,
        userType: normalizedUserType,
        role: userData.role,
        identifier: userData.identifier || identifier,
        isAuthenticated: true,
        patientId: userData.patientId,
        userId: userData.userId,
        permissions: userData.permissions,
        name: userData.name,
        number: userData.number,
        address: userData.address,
        gender: userData.gender,
        dob: userData.dob,
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
        userId: 4,
        permissions: [],
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

// Get User Profile
export const getUserProfile = createAsyncThunk(
  'auth/getUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/profile`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Failed to fetch user profile'
      );
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: JSON.parse(localStorage.getItem('user')) || null,
    loading: false,
    error: null,
    isOTPSent: false,
    isVerified: false,
    isAuthenticated: !!localStorage.getItem('token'),
    userType: JSON.parse(localStorage.getItem('user'))?.userType || null,
    registrationData: null,
    token: localStorage.getItem('token') || null,
    mockOTP: MOCK_OTP,
    patientId: JSON.parse(localStorage.getItem('user'))?.patientId || null,
    doctorId: JSON.parse(localStorage.getItem('user'))?.doctorId || null,
    userId: JSON.parse(localStorage.getItem('user'))?.userId || null,
    permissions: JSON.parse(localStorage.getItem('user'))?.permissions || [],
    name: JSON.parse(localStorage.getItem('user'))?.name || null,
    number: JSON.parse(localStorage.getItem('user'))?.number || null,
    address: JSON.parse(localStorage.getItem('user'))?.address || null,
    gender: JSON.parse(localStorage.getItem('user'))?.gender || null,
    dob: JSON.parse(localStorage.getItem('user'))?.dob || null,
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
      state.userId = null;
      state.permissions = [];
      state.name = null;
      state.number = null;
      state.address = null;
      state.gender = null;
      state.dob = null;
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
      state.userId = null;
      state.permissions = [];
      state.name = null;
      state.number = null;
      state.address = null;
      state.gender = null;
      state.dob = null;
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
        };
        state.patientId = action.payload.patientId;
        state.doctorId = action.payload.doctorId || null; 
        state.userId = action.payload.userId;
        state.userType = action.payload.userType;
        state.isOTPSent = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
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
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isVerified = false;
      })
      .addCase(getUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = { ...state.user, ...action.payload };
        state.name = action.payload.name;
        state.number = action.payload.number;
        state.address = action.payload.address;
        state.gender = action.payload.gender;
        state.dob = action.payload.dob;
      })
      .addCase(getUserProfile.rejected, (state, action) => {
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
