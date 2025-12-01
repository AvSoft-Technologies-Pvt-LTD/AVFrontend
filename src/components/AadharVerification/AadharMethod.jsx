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
    <div className="w-full p-4 md:p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 border border-gray-100">
        {/* AADHAR ICON */}
        <div className="flex items-center justify-center mb-3">
          <div className="w-14 h-12 sm:w-16 sm:h-14 bg-gradient-to-br from-[var(--primary-color)] to-[var(--accent-color)] rounded-2xl flex items-center justify-center shadow-lg">
            <CreditCard className="w-6 h-6 sm:w-8 sm:h-8 text-[var(--color-surface)]" />
          </div>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--primary-color)] text-center mb-2">
          Aadhar Verification
        </h2>
        <p className="text-gray-500 text-center mb-6 sm:mb-8 text-sm sm:text-base">
          Enter your 12-digit Aadhar number to proceed
        </p>

        {/* Aadhar Input */}
        <div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4">
            {[0, 1, 2].map((partIndex) => (
              <div key={partIndex} className="relative w-full sm:w-auto">
                <input
                  type="text"
                  value={getPart(partIndex)}
                  onChange={(e) => handleDigitChange(partIndex, e.target.value, e)}
                  maxLength={4}
                  inputMode="numeric"
                  placeholder="0000"
                  className="w-full sm:w-24 md:w-28 h-12 sm:h-14 text-base sm:text-lg font-mono text-center border-2 rounded-lg focus:outline-none border-gray-200 focus:border-blue-500 bg-gray-50"
                />
                {partIndex < 2 && (
                  <span className="hidden sm:inline absolute right-[-18px] top-1/2 -translate-y-1/2 text-gray-400 text-xl">-</span>
                )}
              </div>
            ))}
          </div>
          
          {error && <p className="text-red-500 text-xs sm:text-sm mb-3 text-center">{error}</p>}
          
          {!showMethods && (
            <div className="flex justify-center mt-6">
              <button
                onClick={handleAadharSubmit}
                className="w-full sm:w-auto btn btn-primary px-6 sm:px-8 py-2.5 text-sm sm:text-base"
              >
                Continue
              </button>
            </div>
          )}
        </div>

        {/* Verification Methods */}
        {showMethods && (
          <div className="mt-8 sm:mt-10">
            <h3 className="text-center font-semibold text-[var(--primary-color)] mb-4 sm:mb-6 text-lg sm:text-xl">
              Choose Verification Method
            </h3>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 md:gap-6 max-w-2xl mx-auto">
              {/* Biometric Button */}
              <button
                onClick={() => handleMethodSelect('biometric')}
                className="flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-200 hover:bg-gray-50 text-[var(--primary-color)] rounded-lg transition text-sm sm:text-base font-medium w-full sm:w-auto"
              >
                <Fingerprint className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--primary-color)]" />
                <span>Biometric</span>
              </button>
              
              {/* OTP Button */}
              <button
                onClick={() => handleMethodSelect('otp')}
                className="flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-200 hover:bg-gray-50 text-[var(--accent-color)] rounded-lg transition text-sm sm:text-base font-medium w-full sm:w-auto"
              >
                <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--accent-color)]" />
                <span>OTP</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}