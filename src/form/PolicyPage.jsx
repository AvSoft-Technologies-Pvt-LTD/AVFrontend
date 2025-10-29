import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PolicyPage = () => {
  const navigate = useNavigate();
  
  useEffect(() => window.scrollTo(0, 0), []);
  
  const sections = [
    { title: "1. Introduction", content: "Welcome to our healthcare application. By accessing or using our services, you agree to comply with and be bound by the following terms and conditions. Please read them carefully." },
    { title: "2. Services Provided", content: "We provide healthcare-related services such as lab test bookings, digital prescriptions, doctor consultations, and medical records management. These services are intended to assist users in managing their health, not to replace professional medical advice." },
    { title: "3. User Responsibilities", list: ["You must be 18 years or older to register.", "Provide accurate, complete, and current information.", "Maintain confidentiality of your login credentials.", "Use the services lawfully and responsibly."] },
    { title: "4. Privacy & Data Protection", content: "We respect your privacy. Your personal health data is stored securely and is not shared with third parties without your explicit consent, except as required by law." },
    { title: "5. Appointments & Cancellations", content: "Users can book, reschedule, or cancel appointments. Cancellations within 24 hours of the appointment time may be subject to a fee." },
    { title: "6. Payments & Refunds", content: "Payments for services are processed through secure gateways. Refunds are issued as per our cancellation policy and are subject to verification and processing time." },
    { title: "7. Limitation of Liability", content: "We are not liable for any indirect, incidental, or consequential damages arising from the use or inability to use our services. All healthcare decisions must be made in consultation with a qualified medical professional." },
    { title: "8. Modifications to Terms", content: "We may update these Terms & Conditions at any time. Continued use of the platform implies acceptance of the updated terms." },
    { title: "9. Contact Information", content: "If you have questions regarding these Terms & Conditions, please contact us at:\n\nEmail: support@yourhealthapp.com\nPhone: +91-9876543210" },
  ];

  const handleAgreementChange = (checked) => {
    localStorage.setItem("agreeDeclaration", JSON.stringify(checked));
    if (checked) {
      localStorage.setItem("justAgreed", "true");
      setTimeout(() => {
        navigate(-1); // Go back to previous page (registration form)
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-blue-900 drop-shadow-sm">Terms & Conditions</h1>
          <button 
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            ← Back
          </button>
        </div>
        
        {sections.map((s, i) => (
          <section key={i} className="mb-6">
            <h2 className="text-xl font-semibold text-blue-800 mb-2">{s.title}</h2>
            {s.list ? (
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {s.list.map((li, j) => <li key={j}>{li}</li>)}
              </ul>
            ) : (
              <p className="text-gray-700 whitespace-pre-line">{s.content}</p>
            )}
          </section>
        ))}
        
        <div className="flex items-center mt-8 bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
          <input 
            type="checkbox" 
            id="policyAgree" 
            onChange={(e) => handleAgreementChange(e.target.checked)}
            className="mr-4 w-5 h-5 text-blue-600 accent-blue-600 cursor-pointer"
          />
          <label 
            htmlFor="policyAgree" 
            className="text-lg font-medium text-gray-800 cursor-pointer select-none"
          >
            I have read and agree to the Terms & Privacy Policy
          </label>
        </div>
        
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            By checking the above box, you will be automatically redirected back to the registration form.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PolicyPage;