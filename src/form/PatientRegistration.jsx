import PatientVerificationSteps from '../components/Profile';

const PatientRegistration = ({
  fetchPatientByAadhar,
  fetchPatientByPhone,
  sendOtp,
  onConfirm,
  onCancel,
  otpLength = 4,
}) => {
  return (
      <div className="">
        <div className="bg-white rounded-3xl overflow-hidden">
          {/* Header */}
          <div className="">

            <div className="flex items-center gap-2 text-sm opacity-90">
            </div>
          </div>
          {/* Steps */}
          <PatientVerificationSteps
            fetchPatientByAadhar={fetchPatientByAadhar}
            fetchPatientByPhone={fetchPatientByPhone}
            sendOtp={sendOtp}
            onConfirm={onConfirm}
            onCancel={onCancel}
            otpLength={otpLength}
          />
        </div>
      </div>
    
  );
};

export default PatientRegistration;
