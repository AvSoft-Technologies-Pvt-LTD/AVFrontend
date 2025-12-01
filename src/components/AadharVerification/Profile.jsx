import { useState } from 'react';
import AadharMethod from '../AadharVerification/AadharMethod';
import BiometricVerification from '../AadharVerification/BiometricVerification';
import OTPVerification from '../AadharVerification/OTPVerification';
import VerifiedDetails from '../AadharVerification/VerifiedDetails';

export default function AadharVerificationFlow({ onComplete }) {
  const [step, setStep] = useState('input');
  const [userData, setUserData] = useState(null);
  const [aadharNumber, setAadharNumber] = useState('');

  const handleSubmitFromInput = ({ aadharNumber, method }) => {
    setAadharNumber(aadharNumber);
    if (method === 'biometric') setStep('biometric');
    if (method === 'otp') setStep('otp');
  };

  const handleVerificationSuccess = () => {
    // Replace hardcoded data with actual data fetched from your backend
    const data = {
      id: 5, // Replace with actual patient ID from backend
      fullName: 'John Doe', // Replace with actual data
      aadharNumber: aadharNumber, // Use the Aadhar number entered by the user
      phoneNumber: '1234567890', // Replace with actual data
      dateOfBirth: '1990-01-01', // Replace with actual data
      gender: 'Male', // Replace with actual data
      address: '123 Main St, Mumbai, India', // Replace with actual data
      photoUrl: 'https://t4.ftcdn.net/jpg/04/31/64/75/360_F_431647519_usrbQ8Z983hTYe8zgA7t1XVc5fEtqcpa.jpg', // Replace with actual photo URL
      verificationMethod: step === 'biometric' ? 'Fingerprint' : 'OTP',
      verifiedAt: new Date().toISOString(),
    };

    setUserData(data);
    setStep('details');
    // Optionally, call onComplete here if you want to notify the parent immediately after verification
    // onComplete?.(data);
  };

  const handleReset = () => {
    setStep('input');
    setUserData(null);
    setAadharNumber('');
  };

  return (
    <div className="flex flex-col items-center justify-center">
      {step === 'input' && <AadharMethod onSubmit={handleSubmitFromInput} />}

      {step === 'biometric' && (
        <BiometricVerification
          onVerified={handleVerificationSuccess}
          onCancel={() => setStep('input')}
        />
      )}

      {step === 'otp' && (
        <OTPVerification
          onVerified={handleVerificationSuccess}
          onCancel={() => setStep('input')}
        />
      )}

      {step === 'details' && (
        <VerifiedDetails
          userData={userData}
          onReset={handleReset}
          onNext={() => onComplete?.(userData)}
        />
      )}
    </div>
  );
}