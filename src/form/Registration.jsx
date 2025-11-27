import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { registerUser, sendOTP } from "../context-api/authSlice";
import { Eye, EyeOff, Upload, FileText, X, Camera, ChevronDown } from 'lucide-react';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  getAvailableTests,
  getCenterTypes,
  getHospitalTypes,
  getPracticeTypes,
  getSpecializationsByPracticeType,
  getScanServices,
  getSpecialServices,
  getGenders,
} from '../utils/masterService';
import PatientRegistration from "./PatientRegistration";
import HospitalRegistration from "./HospitalRegistration";
import LabRegistration from "./LabRegistration";
import DoctorRegistration from "./DoctorRegistration";

// File Upload Component


// Compact Dropdown Checkbox Component
const CompactDropdownCheckbox = ({
  label,
  options,
  selected,
  onChange,
  required = false,
  placeholder = "Select options",
  allowOther = false,
  otherValue = "",
  onOtherChange = () => {},
  loading = false
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleCheckboxChange = (option, checked) => {
    if (checked) {
      onChange([...selected, option]);
    } else {
      onChange(selected.filter(item => item !== option));
    }
  };

  const displayText = loading
    ? "Loading..."
    : selected.length > 0
      ? selected.length === 1
        ? selected[0]
        : `${selected.length} selected`
      : placeholder;

  return (
    <div className="floating-input relative w-full" data-placeholder={`${label}${required ? ' *' : ''}`}>
      <div className="relative">
        <button
          type="button"
          onClick={() => !loading && setIsOpen(!isOpen)}
          disabled={loading}
          className={`input-field peer w-full flex items-center justify-between text-left ${loading ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          <span className={selected.length > 0 && !loading ? 'text-gray-900' : 'text-gray-400'}>
            {displayText}
          </span>
          <ChevronDown size={16} className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        {isOpen && !loading && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {options.map((option, index) => (
              <label key={`${String(option)}-${index}`} className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selected.includes(String(option))}
                  onChange={(e) => handleCheckboxChange(String(option), e.target.checked)}
                  className="mr-3 rounded border-gray-300 text-[var(--accent-color)] focus:ring-[var(--accent-color)]"
                />
                <span className="text-sm text-gray-700">{String(option)}</span>
              </label>
            ))}
            {allowOther && (
              <div className="border-t border-gray-200 p-3">
                <label className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    checked={selected.includes("Other")}
                    onChange={(e) => handleCheckboxChange("Other", e.target.checked)}
                    className="mr-3 rounded border-gray-300 text-[var(--accent-color)] focus:ring-[var(--accent-color)]"
                  />
                  <span className="text-sm text-gray-700">Other</span>
                </label>
                {selected.includes("Other") && (
                  <input
                    type="text"
                    placeholder="Specify other..."
                    value={otherValue}
                    onChange={(e) => onOtherChange(e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-[var(--accent-color)]"
                  />
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const RegisterForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userType = location.state?.userType;
  const dispatch = useDispatch();
  const { loading, error, isOTPSent } = useSelector((state) => state.auth || {});

  const displayUserType = {
    patient: "Patient / User",
    hospital: "Hospital",
    doctor: "Doctor",
    lab: "Lab"
  }[userType] || userType;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [availableCities, setAvailableCities] = useState([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    aadhaar: '',
    gender: '',
    gender_id: '',
    dob: '',
    occupation: '',
    pinCode: '',
    city: '',
    district: '',
    state: '',
    agreeDeclaration: false,
    photo: null,
    active: true,
    // Hospital specific
    hospitalName: '',
    headCeoName: '',
    registrationNumber: '',
    location: '',
    hospitalType: [],
    gstNumber: '',
    nabhCertificate: null,
    inHouseLab: '',
    inHousePharmacy: '',
    labLicenseNo: '',
    pharmacyLicenseNo: '',
    otherHospitalType: '',
    // Lab specific
    centerType: '',
    centerName: '',
    ownerFullName: '',
    availableTests: [],
    scanServices: [],
    specialServices: [],
    licenseNumber: '',
    certificates: [],
    certificateTypes: [],
    otherCertificate: '',
    otherSpecialService: '',
    documents: [],
    // Doctor specific
    roleSpecificData: {
      registrationNumber: '',
      practiceType: '',
      practiceTypeId: '',
      specialization: '',
      specializationId: '',
      qualification: '',
      agreeDeclaration: false
    },
    // Associated with clinic/hospital fields
    isAssociatedWithClinicHospital: '',
    associatedClinic: '',
    associatedHospital: '',
    associatedHospitalId: ''
  });

  const [apiData, setApiData] = useState({
    availableTests: [],
    centerTypes: [],
    hospitalTypes: [],
    hospitals: [],
    practiceTypes: [],
    specializations: [],
    scanServices: [],
    specialServices: [],
    genders: [],
    practiceTypeMapping: {},
    specializationMapping: {},
    hospitalMapping: {},
    genderIdMapping: {},
    loading: {
      availableTests: false,
      centerTypes: false,
      hospitalTypes: false,
      hospitals: false,
      practiceTypes: false,
      specializations: false,
      scanServices: false,
      specialServices: false,
      genders: false,
    }
  });

  const extractApiData = (response, fieldName = null) => {
    try {
      if (!response?.data) return [];
      const data = response.data;
      if (Array.isArray(data)) {
        return data.map((item) => {
          if (typeof item === 'string') return item;
          if (typeof item === 'object' && item !== null) {
            if (fieldName) return item[fieldName] || item.name || item.title || String(item);
            return item.name || item.title || item.label || item.value ||
                   item.testName || item.centerTypeName || item.hospitalTypeName ||
                   item.practiceTypeName || item.specializationName ||
                   item.genderName || item.scanName || item.serviceName ||
                   JSON.stringify(item);
          }
          return String(item);
        });
      }
      return [];
    } catch (error) {
      return [];
    }
  };

  const extractApiDataWithId = (response, nameField = 'name', idField = 'id') => {
    try {
      if (!response?.data) return { options: [], mapping: {} };
      const data = response.data;
      if (Array.isArray(data)) {
        const options = [];
        const mapping = {};
        data.forEach(item => {
          if (typeof item === 'object' && item !== null) {
            const displayName = item[nameField] || item.name || item.title || item.label || String(item);
            const id = item[idField] || item._id;
            options.push(displayName);
            if (id !== undefined) mapping[displayName] = id;
          } else {
            options.push(String(item));
          }
        });
        return { options, mapping };
      }
      return { options: [], mapping: {} };
    } catch (error) {
      return { options: [], mapping: {} };
    }
  };

  useEffect(() => {
    const loadApiData = async () => {
      if (userType === "patient" || userType === "doctor") {
        setApiData(prev => ({ ...prev, loading: { ...prev.loading, genders: true } }));
        try {
          const response = await getGenders();
          const { options: genders, mapping: genderIdMapping } = extractApiDataWithId(response, "genderName", "id");
          setApiData(prev => ({ ...prev, genders, genderIdMapping, loading: { ...prev.loading, genders: false } }));
        } catch (err) {
          setApiData(prev => ({ ...prev, genders: [], genderIdMapping: {}, loading: { ...prev.loading, genders: false } }));
        }
      }
      if (userType === "lab") {
        setApiData(prev => ({ ...prev, loading: { ...prev.loading, availableTests: true } }));
        try {
          const res = await getAvailableTests();
          const tests = extractApiData(res, "testName");
          setApiData(prev => ({ ...prev, availableTests: tests, loading: { ...prev.loading, availableTests: false } }));
        } catch {
          setApiData(prev => ({ ...prev, availableTests: [], loading: { ...prev.loading, availableTests: false } }));
        }
        setApiData(prev => ({ ...prev, loading: { ...prev.loading, centerTypes: true } }));
        try {
          const res = await getCenterTypes();
          const centerTypes = extractApiData(res, "centerTypeName");
          setApiData(prev => ({ ...prev, centerTypes, loading: { ...prev.loading, centerTypes: false } }));
        } catch {
          setApiData(prev => ({ ...prev, centerTypes: [], loading: { ...prev.loading, centerTypes: false } }));
        }
        setApiData(prev => ({ ...prev, loading: { ...prev.loading, scanServices: true } }));
        try {
          const res = await getScanServices();
          const scanServices = extractApiData(res, "scanName");
          setApiData(prev => ({ ...prev, scanServices, loading: { ...prev.loading, scanServices: false } }));
        } catch {
          setApiData(prev => ({ ...prev, scanServices: [], loading: { ...prev.loading, scanServices: false } }));
        }
        setApiData(prev => ({ ...prev, loading: { ...prev.loading, specialServices: true } }));
        try {
          const res = await getSpecialServices();
          const specialServices = extractApiData(res, "serviceName");
          setApiData(prev => ({ ...prev, specialServices, loading: { ...prev.loading, specialServices: false } }));
        } catch {
          setApiData(prev => ({ ...prev, specialServices: [], loading: { ...prev.loading, specialServices: false } }));
        }
      }
      if (userType === "hospital") {
        setApiData(prev => ({ ...prev, loading: { ...prev.loading, hospitalTypes: true } }));
        try {
          const res = await getHospitalTypes();
          const hospitalTypes = extractApiData(res, "hospitalTypeName");
          setApiData(prev => ({ ...prev, hospitalTypes, loading: { ...prev.loading, hospitalTypes: false } }));
        } catch {
          setApiData(prev => ({ ...prev, hospitalTypes: [], loading: { ...prev.loading, hospitalTypes: false } }));
        }
      }
      if (userType === "doctor") {
        setApiData(prev => ({ ...prev, loading: { ...prev.loading, practiceTypes: true } }));
        try {
          const res = await getPracticeTypes();
          const { options, mapping } = extractApiDataWithId(res, "practiceName", "id");
          setApiData(prev => ({ ...prev, practiceTypes: options, practiceTypeMapping: mapping, loading: { ...prev.loading, practiceTypes: false } }));
        } catch {
          setApiData(prev => ({ ...prev, practiceTypes: [], practiceTypeMapping: {}, loading: { ...prev.loading, practiceTypes: false } }));
        }
      }
    };
    loadApiData();
  }, [userType]);

  useEffect(() => {
    if (formData.roleSpecificData.practiceTypeId && userType === 'doctor') {
      setApiData(prev => ({ ...prev, loading: { ...prev.loading, specializations: true } }));
      const fetchSpecializations = async () => {
        try {
          const response = await getSpecializationsByPracticeType(formData.roleSpecificData.practiceTypeId);
          const { options: specializations, mapping: specializationMapping } = extractApiDataWithId(response, 'specializationName', 'id');
          setApiData(prev => ({ ...prev, specializations, specializationMapping, loading: { ...prev.loading, specializations: false } }));
        } catch (error) {
          setApiData(prev => ({ ...prev, specializations: [], specializationMapping: {}, loading: { ...prev.loading, specializations: false } }));
        }
      };
      fetchSpecializations();
    } else {
      setApiData(prev => ({ ...prev, specializations: [], specializationMapping: {}, loading: { ...prev.loading, specializations: false } }));
    }
    if (userType === 'doctor') {
      setFormData(prev => ({
        ...prev,
        roleSpecificData: {
          ...prev.roleSpecificData,
          specialization: "",
          specializationId: ""
        }
      }));
    }
  }, [formData.roleSpecificData.practiceTypeId, userType]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === "radio") {
      if (name === "isAssociatedWithClinicHospital") {
        setFormData(prev => ({
          ...prev,
          isAssociatedWithClinicHospital: value,
          associatedClinic: "",
          associatedHospital: "",
          associatedHospitalId: ""
        }));
        setErrors(prev => ({ ...prev, associationType: "", associatedClinic: "", associatedHospital: "" }));
        return;
      }
      setFormData(prev => ({ ...prev, [name]: value }));
    } else {
      if (name === "phone") {
        const formatted = value.replace(/\D/g, "").slice(0, 10);
        setFormData(prev => ({ ...prev, phone: formatted }));
        return;
      }
      if (name === "aadhaar") {
        const formatted = value.replace(/\D/g, "").slice(0, 12).replace(/(\d{4})(\d{4})(\d{0,4})/, (_, g1, g2, g3) => [g1, g2, g3].filter(Boolean).join("-"));
        setFormData(prev => ({ ...prev, aadhaar: formatted }));
        return;
      }
      if (name === "gender") {
        const genderId = apiData.genderIdMapping?.[value] || '';
        setFormData(prev => ({ ...prev, gender: value, gender_id: genderId }));
        setErrors(prev => ({ ...prev, gender: "" }));
        return;
      }
      if (name.startsWith("roleSpecificData.")) {
        const fieldName = name.replace("roleSpecificData.", "");
        if (fieldName === "practiceType") {
          const practiceTypeId = apiData.practiceTypeMapping?.[value] || '';
          setFormData(prev => ({
            ...prev,
            roleSpecificData: {
              ...prev.roleSpecificData,
              practiceType: value,
              practiceTypeId: practiceTypeId,
              specialization: '',
              specializationId: ''
            }
          }));
        } else if (fieldName === "specialization") {
          const specializationId = apiData.specializationMapping?.[value] || '';
          setFormData(prev => ({
            ...prev,
            roleSpecificData: {
              ...prev.roleSpecificData,
              specialization: value,
              specializationId: specializationId
            }
          }));
        } else {
          setFormData(prev => ({ ...prev, roleSpecificData: { ...prev.roleSpecificData, [fieldName]: value } }));
        }
      } else {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    }
    setErrors(prev => ({ ...prev, [name]: "" }));
    if (name === "password" || name === "confirmPassword") {
      setErrors(prev => ({ ...prev, confirmPassword: "" }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (!files || files.length === 0) return;
    if (name === "photo") {
      const file = files[0];
      if (!file.type.startsWith("image/")) {
        alert("Please upload a valid image file for the photo.");
        e.target.value = "";
        return;
      }
      setPhotoPreview(URL.createObjectURL(file));
      setFormData(prev => ({ ...prev, photo: file }));
    } else if (name === "nabhCertificate") {
      const file = files[0];
      setFormData(prev => ({ ...prev, nabhCertificate: [file] }));
    } else if (name === "certificates" || name === "documents") {
      const validFiles = Array.from(files).filter(file => file.type === "application/pdf" || file.type.startsWith("image/"));
      if (validFiles.length === 0) {
        alert("Only PDF or image files are allowed.");
        e.target.value = "";
        return;
      }
      setFormData(prev => ({ ...prev, [name]: [...(prev[name] || []), ...validFiles] }));
    }
  };

  const handlePincodeChange = async (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setFormData(prev => ({ ...prev, pinCode: value }));
    if (value.length === 6) {
      setIsLoadingCities(true);
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${value}`);
        const data = await res.json();
        if (data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
          const cities = [...new Set(data[0].PostOffice.map(office => office.Name))];
          setAvailableCities(cities);
          setFormData(prev => ({
            ...prev,
            city: '',
            district: data[0].PostOffice[0].District,
            state: data[0].PostOffice[0].State
          }));
        } else {
          setAvailableCities([]);
          setFormData(prev => ({ ...prev, city: '', district: '', state: '' }));
        }
      } catch {
        setAvailableCities([]);
        setFormData(prev => ({ ...prev, city: '', district: '', state: '' }));
      } finally {
        setIsLoadingCities(false);
      }
    } else {
      setAvailableCities([]);
      setFormData(prev => ({ ...prev, city: '', district: '', state: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^\S+@\S+\.\S+$/;
    const phoneRegex = /^\d{10}$/;
    const passwordValue = formData.password || "";
    const confirmPasswordValue = formData.confirmPassword || "";

    if (!formData.firstName?.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName?.trim()) newErrors.lastName = "Last name is required";
    if (!formData.phone?.match(phoneRegex)) newErrors.phone = "Phone must be 10 digits";
    if (!formData.email || !emailRegex.test(formData.email)) newErrors.email = "Enter a valid email";
    if (!passwordValue) newErrors.password = "Password is required";
    if (!confirmPasswordValue) newErrors.confirmPassword = "Confirm password is required";
    else if (passwordValue !== confirmPasswordValue) newErrors.confirmPassword = "Passwords do not match";
    if (!formData.dob) newErrors.dob = "Date of birth is required";
    if (!formData.pinCode || String(formData.pinCode).length !== 6) newErrors.pinCode = "Pincode must be 6 digits";
    if (!formData.city?.trim()) newErrors.city = "City is required";
    if (!formData.photo) newErrors.photo = "Photo is required";

    if (userType === "doctor") {
      if (!formData.aadhaar || formData.aadhaar.replace(/-/g, "").length !== 12) newErrors.aadhaar = "Aadhaar must be 12 digits";
      if (!formData.gender_id) newErrors.gender = "Gender is required";
      if (!formData.roleSpecificData?.registrationNumber?.trim()) newErrors.registrationNumber = "Registration number is required";
      if (!formData.roleSpecificData?.practiceType) newErrors.practiceType = "Practice type is required";
      if (!formData.roleSpecificData?.specialization) newErrors.specialization = "Specialization is required";
      if (!formData.roleSpecificData?.qualification?.trim()) newErrors.qualification = "Qualification is required";
      if (formData.isAssociatedWithClinicHospital === "clinic" && !formData.associatedClinic?.trim()) newErrors.associatedClinic = "Clinic name is required";
      if (formData.isAssociatedWithClinicHospital === "hospital" && !formData.associatedHospital?.trim()) newErrors.associatedHospital = "Hospital is required";
      if (!formData.isAssociatedWithClinicHospital) newErrors.associationType = "Association type is required";
      if (!formData.agreeDeclaration) newErrors.agreeDeclaration = "Please accept the declaration";
    }

    if (userType === "hospital") {
      if (!formData.hospitalName?.trim()) newErrors.hospitalName = "Hospital name is required";
      if (!formData.headCeoName?.trim()) newErrors.headCeoName = "Head/CEO name is required";
      if (!formData.registrationNumber?.trim()) newErrors.registrationNumber = "Registration number is required";
      if (!formData.gstNumber?.trim()) newErrors.gstNumber = "GST number is required";
      if (!formData.hospitalType?.length) newErrors.hospitalType = "Hospital type is required";
      if (!formData.inHouseLab) newErrors.inHouseLab = "Please select in-house lab option";
      if (!formData.inHousePharmacy) newErrors.inHousePharmacy = "Please select in-house pharmacy option";
      if (formData.inHouseLab === "yes" && !formData.labLicenseNo?.trim()) newErrors.labLicenseNo = "Lab license number is required";
      if (formData.inHousePharmacy === "yes" && !formData.pharmacyLicenseNo?.trim()) newErrors.pharmacyLicenseNo = "Pharmacy license number is required";
      if (!formData.agreeDeclaration) newErrors.agreeDeclaration = "Please accept the declaration";
    }

    if (userType === "lab") {
      if (!formData.centerType?.trim()) newErrors.centerType = "Center type is required";
      if (!formData.centerName?.trim()) newErrors.centerName = "Center name is required";
      if (!formData.ownerFullName?.trim()) newErrors.ownerFullName = "Owner's full name is required";
      if (!formData.registrationNumber?.trim()) newErrors.registrationNumber = "Registration number is required";
      if (!formData.gstNumber?.trim()) newErrors.gstNumber = "GST number is required";
      if (!formData.licenseNumber?.trim()) newErrors.licenseNumber = "License number is required";
      if (!formData.availableTests?.length) newErrors.availableTests = "Available tests are required";
      if (!formData.scanServices?.length) newErrors.scanServices = "Scan services are required";
      if (!formData.agreeDeclaration) newErrors.agreeDeclaration = "Please accept the declaration";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const formDataToSubmit = new FormData();
      formDataToSubmit.append('userType', userType);
      formDataToSubmit.append('firstName', formData.firstName);
      formDataToSubmit.append('middleName', formData.middleName);
      formDataToSubmit.append('lastName', formData.lastName);
      formDataToSubmit.append('phone', formData.phone);
      formDataToSubmit.append('email', formData.email);
      formDataToSubmit.append('password', (formData.password || '').trim());
      formDataToSubmit.append('confirmPassword', (formData.confirmPassword || '').trim());
      formDataToSubmit.append('dob', formData.dob);
      formDataToSubmit.append('pincode', formData.pinCode);
      formDataToSubmit.append('city', formData.city);
      formDataToSubmit.append('district', formData.district);
      formDataToSubmit.append('state', formData.state);
      if (formData.photo) formDataToSubmit.append('photo', formData.photo);

      if (userType === "hospital") {
        formDataToSubmit.append('hospitalName', formData.hospitalName);
        formDataToSubmit.append('headCeoName', formData.headCeoName);
        formDataToSubmit.append('registrationNumber', formData.registrationNumber);
        formDataToSubmit.append('gstNumber', formData.gstNumber);
        formDataToSubmit.append('inHouseLab', formData.inHouseLab);
        formDataToSubmit.append('inHousePharmacy', formData.inHousePharmacy);
        formDataToSubmit.append('labLicenseNo', formData.labLicenseNo);
        formDataToSubmit.append('pharmacyLicenseNo', formData.pharmacyLicenseNo);
        formDataToSubmit.append('agreeDeclaration', formData.agreeDeclaration);
        formData.hospitalType.forEach(type => formDataToSubmit.append('hospitalType[]', type));
        if (formData.nabhCertificate && formData.nabhCertificate.length > 0) {
          formDataToSubmit.append('nabhCertificate', formData.nabhCertificate[0]);
        }
      }

      if (userType === "lab") {
        formDataToSubmit.append('centerType', formData.centerType);
        formDataToSubmit.append('centerName', formData.centerName);
        formDataToSubmit.append('ownerFullName', formData.ownerFullName);
        formDataToSubmit.append('registrationNumber', formData.registrationNumber);
        formDataToSubmit.append('gstNumber', formData.gstNumber);
        formDataToSubmit.append('licenseNumber', formData.licenseNumber);
        formDataToSubmit.append('agreeDeclaration', formData.agreeDeclaration);
        formData.availableTests.forEach(test => formDataToSubmit.append('availableTests[]', test));
        formData.scanServices.forEach(service => formDataToSubmit.append('scanServices[]', service));
        formData.specialServices.forEach(service => formDataToSubmit.append('specialServices[]', service));
        formData.certificates.forEach(cert => formDataToSubmit.append('certificates[]', cert));
      }

      if (userType === "doctor") {
        const associationType = formData.isAssociatedWithClinicHospital === 'clinic' ? 'CLINIC' : formData.isAssociatedWithClinicHospital === 'hospital' ? 'HOSPITAL' : '';
        formDataToSubmit.append('aadhaar', formData.aadhaar);
        formDataToSubmit.append('genderId', formData.gender_id);
        formDataToSubmit.append('registrationNumber', formData.roleSpecificData.registrationNumber);
        formDataToSubmit.append('practiceTypeId', formData.roleSpecificData.practiceTypeId);
        formDataToSubmit.append('specializationId', formData.roleSpecificData.specializationId);
        formDataToSubmit.append('qualification', formData.roleSpecificData.qualification);
        formDataToSubmit.append('agreeDeclaration', formData.agreeDeclaration);
        formDataToSubmit.append('associationType', associationType);
        if (formData.isAssociatedWithClinicHospital === 'clinic') {
          formDataToSubmit.append('associatedClinic', formData.associatedClinic);
        }
        if (formData.isAssociatedWithClinicHospital === 'hospital') {
          formDataToSubmit.append('associatedHospital', formData.associatedHospital);
          if (formData.associatedHospitalId) {
            formDataToSubmit.append('hospitalId', formData.associatedHospitalId);
          }
        }
      }

      const resultAction = await dispatch(registerUser(formDataToSubmit));
      if (registerUser.fulfilled.match(resultAction)) {
        const otpResult = await dispatch(sendOTP(formData.phone));
        if (sendOTP.fulfilled.match(otpResult)) {
          navigate("/verification", {
            state: {
              userType,
              phone: formData.phone,
              registrationData: formData,
            }
          });
        } else {
          setErrors({ global: "Registration successful but failed to send OTP. Please try again." });
        }
      } else {
        setErrors({ global: resultAction.payload || "Registration failed" });
      }
    } catch (error) {
      setErrors({ global: "An error occurred during registration. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInput = (name, type = "text", placeholder = "", required = false) => (
    <div className="floating-input relative w-full" data-placeholder={`${placeholder}${required ? " *" : ""}`}>
      <input
        type={type}
        name={name}
        placeholder=" "
        required={required}
        autoComplete="off"
        value={formData[name] || ""}
        onChange={handleInputChange}
        className={`input-field peer ${errors[name] ? "input-error" : ""}`}
      />
      {errors[name] && <p className="error-text">{errors[name]}</p>}
    </div>
  );

  let userFields = null;
  if (userType === "patient") {
    userFields = (
      <PatientRegistration
        onConfirm={(data) => {
          setFormData(prev => ({
            ...prev,
            aadhaar: data.aadharNumber,
          }));
        }}
      />
    );
  } else if (userType === "hospital") {
    userFields = (
      <HospitalRegistration
        formData={formData}
        setFormData={setFormData}
        errors={errors}
        handleInputChange={handleInputChange}
        handleFileChange={handleFileChange}
        apiData={apiData}
        photoPreview={photoPreview}
        onPreviewClick={() => setIsModalOpen(true)}
      />
    );
  } else if (userType === "lab") {
    userFields = (
      <LabRegistration
        formData={formData}
        errors={errors}
        handleInputChange={handleInputChange}
        handleFileChange={handleFileChange}
        apiData={apiData}
        photoPreview={photoPreview}
        onPreviewClick={() => setIsModalOpen(true)}
      />
    );
  } else if (userType === "doctor") {
    userFields = (
      <DoctorRegistration
        formData={formData}
        errors={errors}
        handleInputChange={handleInputChange}
        handleFileChange={handleFileChange}
        apiData={apiData}
        photoPreview={photoPreview}
        onPreviewClick={() => setIsModalOpen(true)}
      />
    );
  }

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-5xl bg-white p-8 sm:p-10 shadow-xl border border-gray-200 rounded-xl">
          <h2 className="text-3xl font-bold text-center mb-1"> {displayUserType} Registration</h2>
          <p className="text-gray-600 text-center mb-6">Please fill in your details to create an account.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {userFields}

            {userType !== "patient" && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="floating-input relative w-full" data-placeholder="Pincode *">
                  <input
                    name="pinCode"
                    type="text"
                    maxLength="6"
                    placeholder=" "
                    value={formData.pinCode || ""}
                    onChange={handlePincodeChange}
                    className={`input-field peer ${errors.pinCode ? "input-error" : ""}`}
                    required
                  />
                  {errors.pinCode && <p className="error-text">{errors.pinCode}</p>}
                </div>
                <div className="floating-input relative w-full" data-placeholder="City *">
                  <select
                    name="city"
                    value={formData.city || ""}
                    onChange={handleInputChange}
                    disabled={!availableCities.length || isLoadingCities}
                    className={`input-field peer ${errors.city ? "input-error" : ""} ${
                      !availableCities.length ? "bg-gray-100 cursor-not-allowed" : ""
                    }`}
                    required
                  >
                    <option value="">
                      {isLoadingCities
                        ? "Loading cities..."
                        : availableCities.length
                          ? "Select City"
                          : "Enter pincode first"
                      }
                    </option>
                    {availableCities.map((city, index) => (
                      <option key={`${city}-${index}`} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                  {errors.city && <p className="error-text">{errors.city}</p>}
                </div>
                <div className="floating-input relative w-full" data-placeholder="District">
                  <input
                    name="district"
                    type="text"
                    value={formData.district || ""}
                    readOnly
                    className="input-field peer bg-gray-100 cursor-not-allowed"
                  />
                </div>
                <div className="floating-input relative w-full" data-placeholder="State">
                  <input
                    name="state"
                    type="text"
                    value={formData.state || ""}
                    readOnly
                    className="input-field peer bg-gray-100 cursor-not-allowed"
                  />
                </div>
              </div>
            )}

            {userType !== "patient" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="floating-input relative w-full" data-placeholder="Create Password *">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder=" "
                    onChange={handleInputChange}
                    className={`input-field peer pr-10 ${errors.password ? "input-error" : ""}`}
                    value={formData.password}
                    autoComplete="off"
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-3 right-3 cursor-pointer text-gray-700"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </span>
                  {errors.password && <p className="error-text">{errors.password}</p>}
                </div>
                <div className="floating-input relative w-full" data-placeholder="Confirm Password *">
                  <input
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder=" "
                    onChange={handleInputChange}
                    className={`input-field peer pr-10 ${errors.confirmPassword ? "input-error" : ""}`}
                    value={formData.confirmPassword}
                    autoComplete="off"
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-3 right-3 cursor-pointer text-gray-700"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </span>
                  {errors.confirmPassword && <p className="error-text">{errors.confirmPassword}</p>}
                </div>
              </div>
            )}

            {userType !== "patient" && (
              <label className="flex items-start">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="agreeDeclaration"
                    checked={formData.agreeDeclaration}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setFormData(prev => ({ ...prev, agreeDeclaration: checked }));
                      setErrors(prev => ({ ...prev, agreeDeclaration: "" }));
                    }}
                    className="text-[var(--accent-color)] focus:ring-[var(--accent-color)]"
                  />
                  <span className="text-sm text-gray-700 ml-2">
                    I agree to the {" "}
                    <button
                      type="button"
                      onClick={() => navigate("/terms-and-conditions")}
                      className="text-[var(--accent-color)] underline hover:text-[var(--accent-color)]"
                    >
                      declaration / Privacy Policy
                    </button>{" "}
                    *
                  </span>
                </div>
              </label>
            )}

            {userType !== "patient" && errors.agreeDeclaration && <p className="error-text">{errors.agreeDeclaration}</p>}

            {userType !== "patient" && (
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className={`btn btn-primary ${
                    (isSubmitting || loading)
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'btn btn-primary-hover'
                  }`}
                >
                  {isSubmitting || loading ? "Submitting..." : "Verify & Proceed"}
                </button>
              </div>
            )}

            {(error || errors.global) && (
              <p className="text-red-600 text-center mt-2">{error || errors.global}</p>
            )}

            <div className="text-center mt-4 text-[var(--accent-color)]900">
              <p>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="font-semibold text-[var(--accent-color)] hover:text-[var(--accent-color)] transition-colors"
                >
                  Login Here
                </button>
              </p>
            </div>
          </form>

          {isModalOpen && photoPreview && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white p-4 rounded shadow-lg relative max-w-2xl max-h-[80vh] overflow-auto">
                <img src={photoPreview} alt="Preview" className="max-h-[60vh] max-w-full object-contain" />
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default RegisterForm;
