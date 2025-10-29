import React, { useState, useEffect } from 'react';

const ForgotPassword = ({
  title = "Forgot Password?",
  description = "Enter your email or phone number to receive a reset code.",
  inputPlaceholder = "Email or Phone Number",
  buttonText = "Send OTP",
  onSubmit,
  onBackToLogin,
  methodOptions = [{ label: "Email", value: "email" }, { label: "Phone", value: "phone" }],
  selectedMethod = "email",
  onMethodChange,
  rememberEmail = false,
  onRememberEmailChange,
  email: propsEmail,
  setEmail: propsSetEmail,
}) => {
  const [localEmail, setLocalEmail] = useState(propsEmail || '');
  const [localRememberEmail, setLocalRememberEmail] = useState(rememberEmail);

  useEffect(() => {
    if (propsSetEmail) {
      propsSetEmail(localEmail);
    }
  }, [localEmail]);

  const handleRememberEmailChange = (checked) => {
    if (onRememberEmailChange) {
      onRememberEmailChange(checked);
    } else {
      setLocalRememberEmail(checked);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 animate-fade-in">
      <div className="w-full max-w-4xl flex flex-row items-center bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Left Side: Form */}
        <div className="w-1/2 p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
            <p className="mt-2 text-sm text-gray-600">{description}</p>
          </div>

          {methodOptions.length > 1 && (
            <div className="flex bg-gray-100 rounded-lg p-1 mt-4">
              {methodOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onMethodChange(option.value)}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    selectedMethod === option.value
                      ? 'bg-white text-[var(--primary-color)] shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit(localEmail);
            }}
            className="space-y-4 mt-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {selectedMethod === 'email' ? 'Email Address' : 'Phone Number'}
              </label>
              <div className="relative">
                <input
                  type={selectedMethod === 'email' ? 'email' : 'tel'}
                  value={localEmail}
                  onChange={(e) => setLocalEmail(e.target.value)}
                  placeholder={inputPlaceholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {selectedMethod === 'email' ? '📧' : '📞'}
                </div>
              </div>
            </div>

            {selectedMethod === 'email' && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={onRememberEmailChange ? rememberEmail : localRememberEmail}
                  onChange={(e) => handleRememberEmailChange(e.target.checked)}
                  className="h-4 w-4 text-[var(--primary-color)] rounded focus:ring-[var(--primary-color)]"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Remember this email
                </label>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2 px-4 bg-[var(--primary-color)] text-white font-medium rounded-md hover:bg-[var(--accent-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] transition-all"
            >
              {buttonText}
            </button>
          </form>

          <div className="text-center mt-4">
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
            src="https://img.freepik.com/free-vector/forgot-password-concept-illustration_114360-1010.jpg"
            alt="Forgot password illustration"
            className="w-full h-auto rounded-xl animate-slideIn"
          />
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
