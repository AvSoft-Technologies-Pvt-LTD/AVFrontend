import React from 'react';
import { useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import CommonBill from './CommonBill';

const BillingIntegration = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const statePatient = location.state?.patient || {};
  const context = searchParams.get('context') || (statePatient?.type ? String(statePatient.type).toLowerCase() : 'opd');
  const doctorName = useSelector((s) => s.auth?.user?.name) || 'Doctor';

  // Ensure the patient object includes all profile props
  const patient = {
    ...statePatient,
    type: statePatient?.type || (context === 'ipd' ? 'IPD' : 'OPD'),
    fullName: statePatient.fullName || statePatient.name || '',
    id: statePatient.id || statePatient.patientId || '',
    phoneNumber: statePatient.phoneNumber || statePatient.phone || statePatient.contact || '',
    aadharNumber: statePatient.aadharNumber || statePatient.aadhaarNumber || '',
    gender: statePatient.gender || '',
    dateOfBirth: statePatient.dateOfBirth || statePatient.dob || '',
    address: statePatient.address || '',
    admissionId: statePatient.admissionId || statePatient.admissionID || '',
    wardType: statePatient.wardType || '',
    wardNo: statePatient.wardNo || '',
    roomNo: statePatient.roomNo || '',
    bedNo: statePatient.bedNo || '',
  };

  return (
    <div className="w-full">
      <CommonBill
        patient={patient}
        doctorName={doctorName}
        mode="create"
        asPage={true}
        onClose={() => navigate(-1)}
        onSave={(bill) => {
          console.log('Bill saved:', bill);
        }}
      />
    </div>
  );
};

export default BillingIntegration;
