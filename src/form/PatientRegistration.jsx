import AadharVerificationFlow from '../components/AadharVerification/Profile';

const PatientRegistration = ({ onConfirm,}) => {
  // Handle the completion of Aadhar verification
  const handleAadharVerificationComplete = (data) => {
    onConfirm?.(data);
  };

  return (
    <div className="patient-registration-container">
        <AadharVerificationFlow onComplete={handleAadharVerificationComplete} />
    </div>
  );
};

export default PatientRegistration;
