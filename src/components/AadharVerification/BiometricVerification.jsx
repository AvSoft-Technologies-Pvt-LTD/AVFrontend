import { useState, useEffect } from 'react';
import { Fingerprint, CheckCircle2, Loader2 } from 'lucide-react';

export default function BiometricVerification({ onVerified, onCancel }) {
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

  const startScan = () => {
    setScanning(true);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 border border-gray-100">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--primary-color)] mb-1 sm:mb-2">
          Fingerprint Verification
        </h2>
        <p className="text-gray-500 text-sm sm:text-base">
          {!scanning ? 'Place your finger on the scanner' : 'Scanning in progress...'}
        </p>
      </div>

      {!scanning ? (
        <div className="flex flex-col items-center">
          <button
            onClick={startScan}
            className="group relative w-full max-w-xs bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 sm:p-8 border-2 border-gray-200 hover:border-[var(--accent-color)] transition-all duration-300 hover:shadow-xl mx-auto"
          >
            <div className="flex flex-col items-center space-y-3 sm:space-y-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[var(--primary-color)] to-[var(--accent-color)] rounded-2xl flex items-center justify-center group-hover:shadow-2xl transition-all duration-300">
                <Fingerprint className="w-8 h-8 sm:w-10 sm:h-10 text-[var(--color-surface)]" />
              </div>
              <div className="text-center">
                <h3 className="text-base sm:text-lg font-semibold text-[var(--primary-color)]">
                  Start Fingerprint Scan
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Place your finger on the scanner
                </p>
              </div>
            </div>
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 mb-4 sm:mb-6">
            <div className="absolute inset-0 bg-[var(--accent-color)]/10 blur-3xl rounded-full animate-pulse"></div>
            <div className="relative w-full h-full rounded-full border-4 border-gray-200 flex items-center justify-center overflow-hidden">
              <div
                className="absolute inset-0 bg-gradient-to-t from-[var(--accent-color)] to-[var(--accent-color)]/50 transition-all duration-300 ease-out"
                style={{ transform: `translateY(${100 - scanProgress}%)` }}
              ></div>
              <div className="relative z-10">
                {verified ? (
                  <CheckCircle2 className="w-16 h-16 sm:w-20 sm:h-20 text-white" />
                ) : scanning ? (
                  <Fingerprint className="w-16 h-16 sm:w-20 sm:h-20 text-[var(--primary-color)]" />
                ) : (
                  <Loader2 className="w-16 h-16 sm:w-20 sm:h-20 text-[var(--primary-color)] animate-spin" />
                )}
              </div>
            </div>
            <div className="absolute -bottom-1 sm:bottom-0 left-1/2 -translate-x-1/2 bg-white px-3 py-1 sm:px-4 sm:py-2 rounded-full shadow-lg">
              <span className="text-xs sm:text-sm font-bold text-[var(--accent-color)]">{scanProgress}%</span>
            </div>
          </div>
          <div className="text-center space-y-1 sm:space-y-2">
            {verified ? (
              <>
                <h3 className="text-lg sm:text-xl font-bold text-[var(--accent-color)]">Verification Successful!</h3>
                <p className="text-xs sm:text-sm text-gray-500">Your identity has been verified</p>
              </>
            ) : (
              <>
                <h3 className="text-lg sm:text-xl font-bold text-[var(--primary-color)]">
                  Scanning Fingerprint...
                </h3>
                <p className="text-xs sm:text-sm text-gray-500">Please hold steady</p>
              </>
            )}
          </div>
        </div>
      )}

      {(!scanning || verified) && (
        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-100">
          <button
            onClick={onCancel}
            className="w-full max-w-xs mx-auto py-2.5 sm:py-3 text-sm sm:text-base text-gray-600 hover:text-[var(--primary-color)] font-medium rounded-xl hover:bg-gray-50 transition-all duration-200 flex items-center justify-center"
          >
            {verified ? 'Done' : 'Cancel'}
          </button>
        </div>
      )}
    </div>
  );
}