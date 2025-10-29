import React, { useState } from 'react';

const ResetPassword = ({
  title = "Reset Password",
  description = "Create a new password for your account.",
  newPasswordPlaceholder = "New Password",
  confirmPasswordPlaceholder = "Confirm Password",
  buttonText = "Reset Password",
  onSubmit,
  onBackToLogin,
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-teal-50 p-4 animate-fade-in">
      <div className="w-full max-w-4xl flex flex-row items-center bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Left Side: Reset Password Form */}
        <div className="w-1/2 p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
            <p className="mt-2 text-sm text-gray-600">{description}</p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit(newPassword, confirmPassword);
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {newPasswordPlaceholder}
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showNewPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {confirmPasswordPlaceholder}
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 bg-[var(--primary-color)] text-white font-medium rounded-md hover:bg-[var(--accent-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition-all"
            >
              {buttonText}
            </button>
          </form>

          <div className="text-center">
            <button
              onClick={onBackToLogin}
              className="text-sm text-gray-600 hover:text-[var(--primary-color)] transition-all"
            >
              Remember your password? <span className="font-medium">Back to Login</span>
            </button>
          </div>
        </div>

        {/* Right Side: Image */}
       <div className="w-full md:w-1/2 md:pl-4 hidden md:block">
          <img
            src="https://img.freepik.com/free-vector/reset-password-concept-illustration_114360-7886.jpg"
            alt="Reset password illustration"
            className="w-full h-auto rounded-xl animate-slideIn"
          />
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
