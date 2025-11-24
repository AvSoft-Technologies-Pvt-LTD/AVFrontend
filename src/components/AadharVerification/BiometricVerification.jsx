import { useState, useEffect } from 'react';
import { Fingerprint, Eye, CheckCircle2, Loader2 } from 'lucide-react';

export default function BiometricVerification({ onVerified, onCancel }) {
  const [selectedType, setSelectedType] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (scanning) {
      const interval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setVerified(true);
            setTimeout(() => {
              onVerified();
            }, 1500);
            return 100;
          }
          return prev + 2;
        });
      }, 30);
      return () => clearInterval(interval);
    }
  }, [scanning, onVerified]);

  const handleBiometricSelect = (type) => {
    setSelectedType(type);
    setScanning(true);
  };

  return (
    <div className="w-full max-w-2xl bg-gray-100 rounded-2xl shadow-xl p-8 border border-gray-100">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[var(--primary-color)] mb-2">
          Biometric Verification
        </h2>
        <p className="text-gray-500 text-sm">
          {!selectedType ? 'Select your preferred biometric method' : 'Scanning in progress...'}
        </p>
      </div>
      {!selectedType ? (
        <div className="grid md:grid-cols-2 gap-6">
          <button
            onClick={() => handleBiometricSelect('fingerprint')}
            className="group relative bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border-2 border-gray-200 hover:border-[var(--accent-color)] transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="w-24 h-24 bg-gradient-to-br from-[var(--primary-color)] to-[var(--accent-color)] rounded-2xl flex items-center justify-center group-hover:shadow-2xl transition-all duration-300">
                <Fingerprint className="w-12 h-12 text-[var(--color-surface)]" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold text-[var(--primary-color)] mb-1">
                  Fingerprint Scan
                </h3>
                <p className="text-xs text-gray-500">Place finger on scanner</p>
              </div>
            </div>
          </button>
          <button
            onClick={() => handleBiometricSelect('iris')}
            className="group relative bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border-2 border-gray-200 hover:border-[var(--accent-color)] transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="w-24 h-24 bg-gradient-to-br from-[var(--primary-color)] to-[var(--accent-color)] rounded-2xl flex items-center justify-center group-hover:shadow-2xl transition-all duration-300">
                <Eye className="w-12 h-12 text-[var(--color-surface)]" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold text-[var(--primary-color)] mb-1">
                  Iris Scan
                </h3>
                <p className="text-xs text-gray-500">Look directly at camera</p>
              </div>
            </div>
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="relative w-48 h-48 mb-6">
            <div className="absolute inset-0 bg-[var(--accent-color)]/10 blur-3xl rounded-full animate-pulse"></div>
            <div className="relative w-full h-full rounded-full border-4 border-gray-200 flex items-center justify-center overflow-hidden">
              <div
                className="absolute inset-0 bg-gradient-to-t from-[var(--accent-color)] to-[var(--accent-color)]/50 transition-all duration-300 ease-out"
                style={{ transform: `translateY(${100 - scanProgress}%)` }}
              ></div>
              <div className="relative z-10">
                {verified ? (
                  <CheckCircle2 className="w-20 h-20 text-white" />
                ) : scanning ? (
                  selectedType === 'fingerprint' ? (
                    <Fingerprint className="w-20 h-20 text-[var(--primary-color)]" />
                  ) : (
                    <Eye className="w-20 h-20 text-[var(--primary-color)]" />
                  )
                ) : (
                  <Loader2 className="w-20 h-20 text-[var(--primary-color)] animate-spin" />
                )}
              </div>
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg">
              <span className="text-sm font-bold text-[var(--accent-color)]">{scanProgress}%</span>
            </div>
          </div>
          <div className="text-center space-y-2">
            {verified ? (
              <>
                <h3 className="text-xl font-bold text-[var(--accent-color)]">Verification Successful!</h3>
                <p className="text-sm text-gray-500">Your identity has been verified</p>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold text-[var(--primary-color)]">
                  {selectedType === 'fingerprint' ? 'Scanning Fingerprint...' : 'Scanning Iris...'}
                </h3>
                <p className="text-sm text-gray-500">Please hold steady</p>
              </>
            )}
          </div>
        </div>
      )}
      {!scanning && (
        <div className="mt-8 pt-6 border-t border-gray-100">
          <button
            onClick={onCancel}
            className="w-full py-3 text-gray-600 hover:text-[var(--primary-color)] font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
