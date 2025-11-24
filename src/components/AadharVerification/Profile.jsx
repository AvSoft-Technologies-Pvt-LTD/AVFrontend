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
    const data = {
      id: 5,   // IMPORTANT: Give a patient ID (backend will replace later)
      name: 'John Doe',
      aadharNumber,
      dateOfBirth: '1990-01-01',
      gender: 'Male',
      address: '123 Main St, Mumbai, India',
      photoUrl:
        'https://t4.ftcdn.net/jpg/04/31/64/75/360_F_431647519_usrbQ8Z983hTYe8zgA7t1XVc5fEtqcpa.jpg',
      verificationMethod: step === 'biometric' ? 'Fingerprint' : 'OTP',
      verifiedAt: new Date().toISOString(),
    };

    setUserData(data);
    setStep('details');

    // 🔥 IMMEDIATELY notify parent (THIS FIXES YOUR ERROR)
    onComplete?.(data);
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
