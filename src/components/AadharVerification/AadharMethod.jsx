import { useState } from 'react';
import { CreditCard, Fingerprint, Smartphone } from 'lucide-react';

export default function AadharInputAndMethod({ onSubmit }) {
  const [aadharNumber, setAadharNumber] = useState('');
  const [error, setError] = useState('');
  const [showMethods, setShowMethods] = useState(false);

  const handleDigitChange = (index, value, e) => {
    const numbers = value.replace(/\D/g, '').substring(0, 4);
    const parts = aadharNumber.split(' ');
    parts[index] = numbers;
    const updated = parts.join(' ').trim().substring(0, 14);
    setAadharNumber(updated);
    setError('');
    if (numbers.length === 4 && index < 2) {
      const nextInput = e.target.parentElement.nextElementSibling?.querySelector('input');
      nextInput?.focus();
    }
  };

  const getPart = (index) => aadharNumber.split(' ')[index] || '';

  const handleAadharSubmit = (e) => {
    e.preventDefault();
    const clean = aadharNumber.replace(/\s/g, '');
    if (clean.length !== 12) {
      setError('Aadhar number must be 12 digits');
      return;
    }
    setShowMethods(true);
  };

  const handleMethodSelect = (method) => {
    onSubmit({
      aadharNumber: aadharNumber.replace(/\s/g, ''),
      method
    });
  };

  return (
    <div className="w-full bg-gray-50 p-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        {/* AADHAR ICON */}
        <div className="flex items-center justify-center mb-3">
          <div className="w-16 h-14 bg-gradient-to-br from-[var(--primary-color)] to-[var(--accent-color)] rounded-2xl flex items-center justify-center shadow-lg">
            <CreditCard className="w-8 h-8 text-[var(--color-surface)]" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-[var(--primary-color)] text-center mb-2">
          Aadhar Verification
        </h2>
        <p className="text-gray-500 text-center mb-8 text-sm">
          Enter your 12-digit Aadhar number to proceed
        </p>

        {/* Aadhar Input */}
        <div>
          <div className="flex items-center justify-center space-x-4 mb-4">
            {[0, 1, 2].map((partIndex) => (
              <div key={partIndex} className="relative">
                <input
                  type="text"
                  value={getPart(partIndex)}
                  onChange={(e) => handleDigitChange(partIndex, e.target.value, e)}
                  maxLength={4}
                  inputMode="numeric"
                  placeholder="0000"
                  className="w-28 h-14 text-lg font-mono text-center border-2 rounded-lg focus:outline-none border-gray-200 focus:border-blue-500 bg-gray-50"
                />
                {partIndex < 2 && (
                  <span className="absolute right-[-18px] top-1/2 -translate-y-1/2 text-gray-400 text-xl"> - </span>
                )}
              </div>
            ))}
          </div>
          {error && <p className="text-red-500 text-sm mb-3 text-center">{error}</p>}
          {!showMethods && (
            <div className="flex justify-center">
              <button
                onClick={handleAadharSubmit}
                className="btn btn-primary px-8"
              >
                Continue
              </button>
            </div>
          )}
        </div>

        {/* Verification Methods */}
        {showMethods && (
          <div className="mt-10">
            <h3 className="text-center font-semibold text-[var(--primary-color)] mb-6">
              Choose Verification Method
            </h3>
            <div className="flex justify-center gap-6 max-w-2xl mx-auto">
              {/* Biometric Button */}
              <button
                onClick={() => handleMethodSelect('biometric')}
                className="flex items-center gap-3 px-6 py-3 border border-gray-200 hover:bg-opacity-90 text-[var(--primary-color)] rounded-lg transition text-sm font-medium"
              >
                <Fingerprint className="w-5 h-5 text-[var(--primary-color)]" />
                Biometric Verification
              </button>
              {/* OTP Button */}
              <button
                onClick={() => handleMethodSelect('otp')}
                className="flex items-center gap-3 px-6 py-3 border border-gray-200 hover:bg-opacity-90 text-[var(--accent-color)] rounded-lg transition text-sm font-medium"
              >
                <Smartphone className="w-5 h-5 text-[var(--accent-color)]" />
                OTP Verification
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
