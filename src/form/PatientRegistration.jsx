import AadharVerificationFlow from '../components/AadharVerification/Profile';

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
           <AadharVerificationFlow
          
        />
      </div>
        </div>
   
    
  );
};

export default PatientRegistration;
