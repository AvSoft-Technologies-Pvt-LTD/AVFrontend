import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from "react-router-dom";
import { useSelector } from 'react-redux';
import { CircleUser, Heart, Users, ClipboardCheck, Pencil, Phone, Calendar, Droplet } from 'lucide-react';
import { FaRegEdit } from "react-icons/fa";
import { GiMale, GiFemale } from "react-icons/gi";
import DashboardOverview from './DashboardOverview';
import ReusableModal from '../../../../components/microcomponents/Modal';
import Healthcard from '../../../../components/Healthcard/Healthcard';
import {
  getFamilyMembersByPatient, createFamily, updateFamily, deleteFamily,
  createPersonalHealth, updatePersonalHealth, getPersonalHealthByPatientId,
  getAdditionalDetailsByPatientId, createAdditionalDetails, updateAdditionalDetails,
} from '../../../../utils/CrudService';
import {
  getHealthConditions, getCoverageTypes, getRelations, getBloodGroups,
  getPatientById, getPatientPhoto
} from '../../../../utils/masterService';

const initialUserData = {
  name: '', email: '', gender: '', phone: '', dob: '', bloodGroup: '', height: '', weight: '',
  isAlcoholicUser: false, isSmokerUser: false, isTobaccoUser: false, smokingDuration: '', alcoholDuration: '', tobaccoDuration: '', allergies: '', surgeries: '',
  familyHistory: { diabetes: false, cancer: false, heartDisease: false, mentalHealth: false, disability: false },
  familyMembers: [], additionalDetails: { provider: '', policyNumber: '', coverageType: '', startDate: '', endDate: '', coverageAmount: '', primaryHolder: false }
};
const defaultFamilyMember = { name: '', relation: '', number: '', diseases: [], email: '' };

const ProfileDetail = ({ icon: Icon, label, value, className = "" }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <div className="w-12 h-12 rounded-xl flex items-center justify-center">
      <Icon className="w-6 h-6 text-[var(--primary-color)]" />
    </div>
    <div className="flex-1 text-left">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-lg font-bold text-gray-900">{value || "NA"}</p>
    </div>
  </div>
);

const SECTIONS = [
  { id: 'basic', name: 'Basic Details', icon: CircleUser },
  { id: 'personal', name: 'Personal Health', icon: Heart },
  { id: 'family', name: 'Family Details', icon: Users },
  { id: 'additional', name: 'Additional Details', icon: ClipboardCheck }
];

function Dashboard() {
  const { user, patientId: reduxPatientId } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [userData, setUserData] = useState(initialUserData);
  const [activeSection, setActiveSection] = useState('basic');
  const [showModal, setShowModal] = useState(false);
  const [modalFields, setModalFields] = useState([]);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMode, setModalMode] = useState('edit');
  const [modalData, setModalData] = useState({});
  const [showHealthCardModal, setShowHealthCardModal] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(33);
  const [feedbackMessage, setFeedbackMessage] = useState({ show: false, message: '', type: '' });
  const [editFamilyMember, setEditFamilyMember] = useState(null);
  const [profileData, setProfileData] = useState({
    name: '', firstName: '', lastName: '', gender: '', dob: '', phone: '', photo: '',
    email: '', address: '', city: '', state: '', pincode: '', emergencyContact: '', registrationDate: ''
  });
  const [loading, setLoading] = useState(true);
  const [coverageTypes, setCoverageTypes] = useState([]);
  const [healthConditions, setHealthConditions] = useState([]);
  const [familyRelations, setFamilyRelations] = useState([]);
  const [bloodGroups, setBloodGroups] = useState([]);
  const [hasPersonalHealthData, setHasPersonalHealthData] = useState(false);
  const [patientData, setPatientData] = useState(null);
  const [additionalDetails, setAdditionalDetails] = useState({
    insuranceProviderName: '',
    policyNum: '',
    coverageTypeId: '',
    coverageAmount: '',
    policyStartDate: '',
    policyEndDate: '',
    primaryHolder: false,
  });

  // Memoized fields
 const basePersonalFields = useMemo(() => [
  { name: 'height', label: 'Height (cm)', type: 'number', colSpan: 1 },
  { name: 'weight', label: 'Weight (kg)', type: 'number', colSpan: 1 },
  { name: 'bloodGroup', label: 'Blood Group', type: 'select', colSpan: 1, options: bloodGroups },

  {
    name: 'isAlcoholicUser',
    label: 'Drink alcohol?',
    type: 'checkboxWithInput',
    colSpan: 1,
    inputName: 'alcoholDuration',
    inputLabel: 'Since (yrs)',
    inputType: 'number',
  },
  {
    name: 'isSmokerUser',
    label: 'Do you smoke?',
    type: 'checkboxWithInput',
    colSpan: 1,
    inputName: 'smokingDuration',
    inputLabel: 'Since (yrs)',
    inputType: 'number',
  },
  {
    name: 'isTobaccoUser',
    label: 'Tobacco Use?',
    type: 'checkboxWithInput',
    colSpan: 1,
    inputName: 'tobaccoDuration',
    inputLabel: 'Since (yrs)',
    inputType: 'number',
  },
  // 🏥 Surgeries dropdown — shows "Since (yrs)" input when not "none"
  {
    name: 'surgeries',
    label: 'Surgeries',
    type: 'select',
    colSpan: 1,
    options: [
      { label: 'None', value: 'none' },
      { label: 'Appendectomy', value: 'appendectomy' },
      { label: 'Heart Surgery', value: 'heart' },
      { label: 'C-section', value: 'csection' },
      { label: 'Fracture Repair', value: 'fracture' },
      { label: 'Other', value: 'other' },
    ],
    durationField: 'surgeriesDuration',   // 👈 field to store duration
    durationFor: ['appendectomy', 'heart', 'csection', 'fracture', 'other'], // 👈 show only for these
    inputLabel: 'Since (yrs)',
    inputType: 'number',
  },

  // 🤧 Allergies dropdown — shows "Since (yrs)" input when not "none"
  {
    name: 'allergies',
    label: 'Allergies',
    type: 'select',
    colSpan: 1,
    options: [
      { label: 'None', value: 'none' },
      { label: 'Food Allergy', value: 'food' },
      { label: 'Drug Allergy', value: 'drug' },
      { label: 'Dust Allergy', value: 'dust' },
      { label: 'Pollen Allergy', value: 'pollen' },
      { label: 'Other', value: 'other' },
    ],
    durationField: 'allergiesDuration',
    durationFor: ['food', 'drug', 'dust', 'pollen', 'other'],
    inputLabel: 'Since (yrs)',
    inputType: 'number',
  },

 
], [bloodGroups]);


  const familyFields = useMemo(() => [
    { name: 'relation', label: 'Relation', type: 'select', colSpan: 1, options: familyRelations },
    { name: 'name', label: 'Name', type: 'text', colSpan: 2 },
    { name: 'number', label: 'Phone Number', type: 'text', colSpan: 1 },
    {
      name: 'diseases',
      label: 'Health Conditions',
      type: 'multiselect',
      colSpan: 2,
      options: healthConditions
    }
  ], [familyRelations, healthConditions]);

  const additionalFields = useMemo(() => [
    { name: 'provider', label: 'Insurance Provider', type: 'text', colSpan: 2 },
    { name: 'policyNumber', label: 'Policy Number', type: 'text', colSpan: 1 },
    { name: 'coverageType', label: 'Coverage Type', type: 'select', colSpan: 1, options: coverageTypes },
    { name: 'coverageAmount', label: 'Coverage Amount', type: 'number', colSpan: 1 },
    { name: 'primaryHolder', label: 'Primary Holder', type: 'radio', colSpan: 1, options: [{ value: "Yes", label: "Yes" }, { value: "No", label: "No" }] },
    { name: 'startDate', label: 'Start Date', type: 'date', colSpan: 1.5 },
    { name: 'endDate', label: 'End Date', type: 'date', colSpan: 1.5 },
  ], [coverageTypes]);

  const showFeedback = (message, type = 'success') => {
    setFeedbackMessage({ show: true, message, type });
    setTimeout(() => setFeedbackMessage({ show: false, message: '', type: '' }), 3000);
  };

  const handleEditClick = () => navigate('/patientdashboard/settings');

  const getSectionCompletionStatus = () => {
    const basicComplete = Boolean(
      (patientData || user)?.firstName &&
      (patientData || user)?.lastName &&
      (patientData || user)?.dob &&
      (patientData || user)?.gender &&
      (patientData || user)?.phone
    );
    const personalComplete = Boolean(
      userData.height &&
      userData.weight &&
      userData.bloodGroupId
    );
    const familyComplete = Array.isArray(userData.familyMembers) && userData.familyMembers.length > 0;
    return {
      basic: basicComplete,
      personal: personalComplete,
      family: familyComplete,
    };
  };

  const fetchAllData = async () => {
   if (!user?.patientId) return;
    setLoading(true);
    try {
      const [coverageRes, healthConditionsRes, familyRelationsRes, bloodGroupsRes] = await Promise.all([
        getCoverageTypes().catch(() => ({ data: [] })),
        getHealthConditions().catch(() => ({ data: [] })),
        getRelations().catch(() => ({ data: [] })),
        getBloodGroups().catch(() => ({ data: [] })),
      ]);

      setBloodGroups(
        bloodGroupsRes.data?.map((item) => ({
          label: item.bloodGroupName || 'Unknown',
          value: item.id,
        })) || []
      );
      setFamilyRelations(
        familyRelationsRes.data?.map((item) => ({
          label: item.relationName || 'Unknown',
          value: item.id,
        })) || []
      );
      setHealthConditions(
        healthConditionsRes.data?.map((item) => ({
          label: item.healthConditionName || 'Unknown',
          value: item.id,
        })) || []
      );
      setCoverageTypes(
        coverageRes.data?.map((item) => ({
          label: item.coverageTypeName || 'Unknown',
          value: item.id,
        })) || []
      );

      const patientId = reduxPatientId;
      if (patientId) {
        const [patientRes, familyRes, healthRes, additionalRes] = await Promise.all([
          getPatientById(patientId).catch(() => ({ data: null })),
          getFamilyMembersByPatient(patientId).catch(() => ({ data: [] })),
          getPersonalHealthByPatientId(patientId).catch(() => ({ data: null })),
          getAdditionalDetailsByPatientId(patientId).catch(() => ({ data: null })),
        ]);

        const currentPatient = patientRes.data;
        if (currentPatient) {
          setPatientData(currentPatient);
          const dob = currentPatient.dob ? new Date(currentPatient.dob[0], currentPatient.dob[1] - 1, currentPatient.dob[2]) : null;
          let photoUrl = null;
          if (currentPatient.photo) {
            try {
              const photoResponse = await getPatientPhoto(currentPatient.photo);
              photoUrl = URL.createObjectURL(photoResponse.data);
            } catch (err) {
              console.error('Failed to fetch photo:', err);
            }
          }

          setProfileData({
            name: `${currentPatient.firstName || 'Guest'} ${currentPatient.lastName || ''}`.trim(),
            firstName: currentPatient.firstName || '',
            lastName: currentPatient.lastName || '',
            dob: dob ? dob.toISOString().split('T')[0] : null,
            gender: currentPatient.gender || '',
            phone: currentPatient.phone || '',
            email: currentPatient.email || '',
            photo: photoUrl,
            address: currentPatient.address || '',
            city: currentPatient.city || '',
            state: currentPatient.state || '',
            pincode: currentPatient.pincode || '',
            emergencyContact: currentPatient.emergencyContact || '',
            registrationDate: currentPatient.createdAt || currentPatient.registrationDate || ''
          });
        }

        const mappedFamilyMembers = familyRes.data?.map((member) => ({
          id: member.id,
          name: member.memberName || 'Unknown',
          relation: member.relationName || 'Unknown',
          relationId: member.relationId,
          number: member.phoneNumber || '',
          diseases: member.healthConditions?.map((hc) => hc.healthConditionName) || [],
          healthConditionIds: member.healthConditions?.map((hc) => hc.id) || [],
        })) || [];

        let personalHealthData = {};
        if (healthRes.data) {
          personalHealthData = {
            id: healthRes.data.id,
            height: healthRes.data.height || '',
            weight: healthRes.data.weight || '',
            bloodGroupId: healthRes.data.bloodGroupId,
            bloodGroupName: healthRes.data.bloodGroupName || '',
            surgeries: healthRes.data.surgeries || '',
            allergies: healthRes.data.allergies || '',
            surgeryDuration: healthRes.data.surgeryDuration || '',
            allergyDuration: healthRes.data.allergyDuration || '',
            isSmokerUser: healthRes.data.isSmoker || false,
            smokingDuration: healthRes.data.yearsSmoking || '',
            isAlcoholicUser: healthRes.data.isAlcoholic || false,
            alcoholDuration: healthRes.data.yearsAlcoholic || '',
            isTobaccoUser: healthRes.data.isTobacco || false,
            tobaccoDuration: healthRes.data.yearsTobacco || '',
          };
          setHasPersonalHealthData(true);
        }

        setUserData(prev => ({ ...prev, ...personalHealthData, familyMembers: mappedFamilyMembers }));

        if (additionalRes.data) {
          setAdditionalDetails({
            insuranceProviderName: additionalRes.data.insuranceProviderName || '',
            policyNum: additionalRes.data.policyNum || '',
            coverageTypeId: additionalRes.data.coverageTypeId || '',
            coverageAmount: additionalRes.data.coverageAmount || '',
            policyStartDate: additionalRes.data.policyStartDate || '',
            policyEndDate: additionalRes.data.policyEndDate || '',
            primaryHolder: additionalRes.data.primaryHolder || false,
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
      showFeedback('Failed to load data. Some features may be limited.', 'warning');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [user, reduxPatientId]);

  const saveUserData = async (updatedData) => {
    const patientId = patientData?.id || reduxPatientId;
    if (!patientId) return showFeedback('Please login to save data', 'error');
    if (!updatedData.height || !updatedData.weight) return showFeedback('Height and weight are required', 'error');
    const bloodGroupId = Number(updatedData.bloodGroup?.value || updatedData.bloodGroup || updatedData.bloodGroupId);
    if (!bloodGroupId || isNaN(bloodGroupId)) return showFeedback('Please select a blood group', 'error');

    try {
      const personalHealthData = {
        height: Number(updatedData.height) || 0,
        weight: Number(updatedData.weight) || 0,
        bloodGroupId,
        surgeries: updatedData.surgeries || '',
        allergies: updatedData.allergies || '',
        surgeryDuration: updatedData.surgeryDuration || '',
        allergyDuration: updatedData.allergyDuration || '',
        isSmoker: Boolean(updatedData.isSmokerUser),
        yearsSmoking: updatedData.isSmokerUser ? Number(updatedData.smokingDuration) || 0 : 0,
        isAlcoholic: Boolean(updatedData.isAlcoholicUser),
        yearsAlcoholic: updatedData.isAlcoholicUser ? Number(updatedData.alcoholDuration) || 0 : 0,
        isTobacco: Boolean(updatedData.isTobaccoUser),
        yearsTobacco: updatedData.isTobaccoUser ? Number(updatedData.tobaccoDuration) || 0 : 0,
        patientId: Number(patientId),
      };

      let savedData;
      try {
        if (hasPersonalHealthData) {
          const updateRes = await updatePersonalHealth(patientId, personalHealthData);
          savedData = updateRes.data;
          showFeedback('Personal health data updated successfully');
        } else {
          const createRes = await createPersonalHealth(personalHealthData);
          savedData = createRes.data;
          setHasPersonalHealthData(true);
          showFeedback('Personal health data saved successfully');
        }
      } catch (createErr) {
        if (createErr.response?.status === 409 || createErr.response?.data?.error?.includes('already exists')) {
          const updateRes = await updatePersonalHealth(patientId, personalHealthData);
          savedData = updateRes.data;
          setHasPersonalHealthData(true);
          showFeedback('Personal health data updated successfully');
        } else throw createErr;
      }

      setUserData(prev => ({
        ...prev,
        id: savedData?.id || prev.id,
        ...personalHealthData,
        bloodGroupName: savedData?.bloodGroupName || bloodGroups.find(bg => bg.value === personalHealthData.bloodGroupId)?.label,
      }));
      return true;
    } catch (err) {
      console.error('Failed to save:', err.response?.data || err.message);
      showFeedback(`Failed to save data: ${err.response?.data?.message || err.message}`, 'error');
      return false;
    }
  };

  const openModal = (section, data = null) => {
    setActiveSection(section);
    setShowModal(true);
    setModalMode(data ? 'edit' : 'add');

    if (section === 'personal') {
      setModalFields(
        basePersonalFields.map((field) =>
          field.name === 'bloodGroup'
            ? { ...field, options: bloodGroups }
            : field
        )
      );
      setModalData({
        height: userData.height || '',
        weight: userData.weight || '',
        bloodGroup: userData.bloodGroupId || '',
        surgeries: userData.surgeries || '',
        allergies: userData.allergies || '',
        isAlcoholicUser: userData.isAlcoholicUser || false,
        alcoholDuration: userData.alcoholDuration || '',
        isSmokerUser: userData.isSmokerUser || false,
        smokingDuration: userData.smokingDuration || '',
        isTobaccoUser: userData.isTobaccoUser || false,
        tobaccoDuration: userData.tobaccoDuration || '',
      });
    } else if (section === 'family') {
      setModalFields(
        familyFields.map((field) =>
          field.name === 'relation'
            ? { ...field, options: familyRelations }
            : field.name === 'diseases'
              ? { ...field, options: healthConditions }
              : field
        )
      );
      if (data) {
        setModalData({
          name: data.name,
          relation: data.relationId,
          number: data.number,
          diseases: data.diseases?.map(diseaseName => {
            const condition = healthConditions.find(hc => hc.label === diseaseName);
            return condition ? { value: condition.value, label: condition.label } : { value: diseaseName, label: diseaseName };
          }) || [],
        });
        setEditFamilyMember(data);
      } else {
        setModalData({
          ...defaultFamilyMember,
          relation: familyRelations[0]?.value || '',
          diseases: [],
        });
        setEditFamilyMember(null);
      }
    } else if (section === 'additional') {
      setModalFields(additionalFields);
      setModalData({
        provider: additionalDetails.insuranceProviderName || '',
        policyNumber: additionalDetails.policyNum || '',
        coverageType: additionalDetails.coverageTypeId || '',
        coverageAmount: additionalDetails.coverageAmount || '',
        startDate: additionalDetails.policyStartDate
          ? new Date(additionalDetails.policyStartDate).toISOString().split('T')[0]
          : '',
        endDate: additionalDetails.policyEndDate
          ? new Date(additionalDetails.policyEndDate).toISOString().split('T')[0]
          : '',
        primaryHolder: additionalDetails.primaryHolder ? 'Yes' : 'No',
      });
    }

    setModalTitle(
      section === 'personal'
        ? 'Personal Health Details'
        : section === 'family'
          ? data
            ? 'Edit Family Member'
            : 'Add Family Member'
          : 'Additional Details'
    );
  };

  const handleModalSave = async (formValues) => {
    const patientId = patientData?.id || reduxPatientId;
    if (activeSection === 'personal') {
      const cleanedValues = { ...formValues };
      if (!formValues.isSmokerUser) cleanedValues.smokingDuration = '';
      if (!formValues.isAlcoholicUser) cleanedValues.alcoholDuration = '';
      if (!formValues.isTobaccoUser) cleanedValues.tobaccoDuration = '';
      await saveUserData({ ...userData, ...cleanedValues });
    } else if (activeSection === 'family') {
      if (!formValues.name || !formValues.relation) return showFeedback('Name and relation are required', 'error');
      const healthConditionIds = formValues.diseases?.map(disease => {
        if (typeof disease === 'object' && disease.value) return Number(disease.value);
        const found = healthConditions.find(hc => hc.label === disease || hc.value === disease);
        return found ? Number(found.value) : null;
      }).filter(id => id !== null) || [];

      const memberData = {
        patientId: Number(patientId),
        relationId: Number(formValues.relation),
        memberName: formValues.name.trim(),
        phoneNumber: formValues.number || '',
        healthConditionIds,
      };

      try {
        if (editFamilyMember?.id) {
          await updateFamily(editFamilyMember.id, memberData);
          showFeedback('Family member updated successfully');
        } else {
          await createFamily(memberData);
          showFeedback('Family member saved successfully');
        }
        const familyRes = await getFamilyMembersByPatient(patientId);
        const mappedFamilyMembers = familyRes.data.map(member => ({
          id: member.id,
          name: member.memberName,
          relation: member.relationName,
          relationId: member.relationId,
          number: member.phoneNumber,
          diseases: member.healthConditions?.map(hc => hc.healthConditionName) || [],
          healthConditionIds: member.healthConditions?.map(hc => hc.id) || [],
        }));
        setUserData(prev => ({ ...prev, familyMembers: mappedFamilyMembers }));
      } catch (err) {
        console.error('Error:', err.response?.data || err.message);
        showFeedback(`Failed to save family member: ${err.response?.data?.message || err.message}`, 'error');
      }
      setEditFamilyMember(null);
    } else if (activeSection === 'additional') {
      try {
        if (!patientId) return showFeedback('Patient ID is required', 'error');
        const payload = {
          insuranceProviderName: formValues.provider,
          policyNum: formValues.policyNumber,
          coverageTypeId: Number(formValues.coverageType?.value || formValues.coverageType),
          coverageAmount: Number(formValues.coverageAmount),
          policyStartDate: new Date(formValues.startDate).toISOString(),
          policyEndDate: new Date(formValues.endDate).toISOString(),
          primaryHolder: formValues.primaryHolder === 'Yes',
        };
        let response;
        if (additionalDetails.insuranceProviderName) {
          response = await updateAdditionalDetails(patientId, payload);
        } else {
          response = await createAdditionalDetails(patientId, payload);
        }
        setAdditionalDetails(response.data);
        showFeedback('Additional details saved successfully');
      } catch (error) {
        console.error("Error saving additional details:", error);
        showFeedback('Failed to save additional details', 'error');
      }
    }
    setShowModal(false);
    setModalData({});
  };

  const handleModalDelete = async (formValues) => {
    const patientId = patientData?.id || reduxPatientId;
    if (activeSection === 'family' && (formValues?.id || editFamilyMember?.id)) {
      const deleteId = formValues?.id || editFamilyMember?.id;
      try {
        await deleteFamily(deleteId);
        const familyRes = await getFamilyMembersByPatient(patientId);
        const mappedFamilyMembers = familyRes.data.map(member => ({
          id: member.id,
          name: member.memberName,
          relation: member.relationName,
          relationId: member.relationId,
          number: member.phoneNumber,
          diseases: member.healthConditions?.map(hc => hc.healthConditionName) || [],
          healthConditionIds: member.healthConditions?.map(hc => hc.id) || [],
        }));
        setUserData(prev => ({ ...prev, familyMembers: mappedFamilyMembers }));
        showFeedback('Family member deleted successfully');
      } catch (err) {
        console.error("Delete failed", err);
        showFeedback('Failed to delete family member', 'error');
      }
    } else {
      showFeedback('Invalid data for delete', 'error');
    }
    setShowModal(false);
    setEditFamilyMember(null);
  };

  const completionStatus = getSectionCompletionStatus();
  useEffect(() => {
    const completedSections = Object.values(completionStatus).filter(Boolean).length;
    const totalSections = Object.keys(completionStatus).length;
    const completion = Math.round((completedSections / totalSections) * 100);
    setProfileCompletion(completion);
  }, [userData, user, completionStatus, additionalDetails]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--primary-color)]"></div>
      </div>
    );
  }

  const profileDetails = [
    { icon: profileData.gender?.toLowerCase() === 'female' ? GiFemale : GiMale, label: 'Gender', value: profileData.gender },
    { icon: Phone, label: 'Phone No.', value: profileData.phone },
    {
      icon: Calendar,
      label: 'Date Of Birth',
      value: profileData.dob
        ? new Date(profileData.dob).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
        : 'NA'
    },
    { icon: Droplet, label: 'Blood Group', value: userData.bloodGroupName }
  ];

  const modalConfig = {
    mode: modalMode,
    title: modalTitle,
    data: modalData,
    fields: modalFields
  };

  return (
    <div className="p-2 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <h1 className="text-l sm:text-2xl lg:text-2xl font-bold text-gray-900 m-0">Patient Information</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowHealthCardModal(true)}
            className="px-2 py-1 sm:px-6 sm:py-3 bg-[var(--accent-color)] hover:bg-green-600 text-white font-medium rounded-xl transition-colors duration-200 text-sm sm:text-base"
          >
            View Health Card
          </button>
          <button
            onClick={() => navigate('/patientdashboard/settings')}
            className="p-2 sm:p-3 bg-gray-900 hover:bg-gray-800 text-white rounded-full transition-colors duration-200"
          >
            <FaRegEdit className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Unified Profile Card - Responsive */}
      <div className="bg-white rounded-lg shadow-sm p-2 md:p-4 mb-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Profile Image and Name */}
          <div className="flex-shrink-0 flex flex-col items-center md:items-start text-center md:text-left">
            <div className="w-24 h-24 md:w-24 md:h-24 rounded-full border border-gray-400 overflow-hidden mb-3">
              {profileData?.photo ? (
                <img
                  src={profileData.photo}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[var(--primary-color)] flex items-center justify-center">
                  <CircleUser className="w-12 h-12 md:w-16 md:h-16 text-gray-500" />
                </div>
              )}
            </div>
            <h2 className="text-l md:text-l font-bold text-gray-900">
              {`${profileData.firstName || "NA"} ${profileData.lastName || "NA"}`.trim()}
            </h2>
          </div>
          {/* Details and Progress */}
          <div className="flex-1 w-full">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-0 mb-0 md:mt-6 md:mb-4">
              {profileDetails.map((detail, index) => (
                <ProfileDetail key={index} {...detail} />
              ))}
            </div>
            {/* Progress Bar */}
            <div className="flex items-center gap-3">
              <div className="relative w-full h-2 bg-[var(--primary-color)] rounded-full">
                <div
                  className="absolute top-0 left-0 h-2 bg-[var(--accent-color)] rounded-full"
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>
              <span className="text-sm font-semibold px-3 py-1 bg-[var(--accent-color)] text-white rounded">
                {profileCompletion}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="overflow-x-auto custom-scrollbar">
        <div className="flex gap-2 sm:gap-4 min-w-max">
          {SECTIONS.map(({ id, name, icon: Icon }) => (
            <button
              key={id}
              onClick={() => id !== 'basic' && openModal(id)}
              className={`px-2 py-1 sm:px-3 sm:py-2 rounded-lg flex items-center gap-1 text-white text-xs sm:text-sm whitespace-nowrap ${activeSection === id ? 'bg-[#0e1630]' : 'bg-[#1f2a4d] hover:bg-[#1b264a]'
                } transition-all duration-300`}
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="truncate">{name}</span>
              {completionStatus[id] && <ClipboardCheck className="text-green-400 ml-1 animate-pulse" />}
            </button>
          ))}
        </div>
      </div>

      {/* Feedback Message */}
      {feedbackMessage.show && (
        <div className={`fixed top-4 right-4 z-50 p-3 sm:p-4 rounded-lg shadow-lg ${feedbackMessage.type === 'success' ? 'bg-green-100 text-green-800' :
            feedbackMessage.type === 'warning' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
          } transition-all duration-300`}>
          {feedbackMessage.message}
        </div>
      )}

      {/* Modals */}
      <ReusableModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditFamilyMember(null); }}
        mode={modalConfig.mode}
        title={modalConfig.title}
        data={modalConfig.data}
        fields={modalConfig.fields}
        onSave={handleModalSave}
        onChange={(updated) => setModalData(updated)}
        onDelete={handleModalDelete}
        saveLabel={
          activeSection === 'personal'
            ? hasPersonalHealthData
              ? 'Update'
              : 'Save'
            : activeSection === 'family'
              ? editFamilyMember?.id
                ? 'Update'
                : 'Save'
              : additionalDetails.insuranceProviderName
                ? 'Update'
                : 'Save'
        }
        cancelLabel="Cancel"
        deleteLabel="Delete"
        size="md"
        extraContent={
          activeSection === 'family' && Array.isArray(userData.familyMembers) && userData.familyMembers.length > 0 && (
            <div className="mt-4 space-y-2">
              <h3 className="text-md font-semibold">Saved Family Members</h3>
              {userData.familyMembers.map((m, index) => (
                <div key={`${m.id}-${index}`} className="p-2 sm:p-3 bg-gray-100 rounded-md flex flex-col sm:flex-row justify-between items-start">
                  <div>
                    <p className="font-semibold">{m.name}</p>
                    <p className="text-sm text-gray-700"><strong>Relation:</strong> {m.relation}</p>
                    {m.number && <p className="text-sm text-gray-700"><strong>Phone:</strong> {m.number}</p>}
                    {m.diseases.length > 0 && <p className="text-sm text-gray-700 mt-1"><strong>Conditions:</strong> {m.diseases.join(', ')}</p>}
                  </div>
                  <div className="flex gap-1 sm:gap-2 mt-2 sm:mt-0">
                    <button className="text-blue-600 hover:underline text-xs sm:text-sm" onClick={() => openModal('family', m)}>Edit</button>
                    <button className="text-red-600 hover:underline text-xs sm:text-sm" onClick={() => handleModalDelete(m)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )
        }
      />

      {/* Health Card Modal */}
      {showHealthCardModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
          <div className="relative w-full max-w-lg mx-auto">
            <button
              className="absolute -top-8 sm:-top-10 right-0 text-[var(--color-surface)] border border-[var(--color-surface)] text-xl sm:text-2xl rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center"
              onClick={() => setShowHealthCardModal(false)}
            >
              &times;
            </button>
            <div className="rounded-lg overflow-hidden">
              <Healthcard hideLogin isOpen onClose={() => setShowHealthCardModal(false)} />
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 sm:mt-8">
        <DashboardOverview />
      </div>
    </div>
  );
}

export default Dashboard;