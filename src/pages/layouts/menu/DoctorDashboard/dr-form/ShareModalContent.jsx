
// ------------------------------
// File: DrForm/ShareModalContent.jsx
// ------------------------------
import React, { useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { X, Globe, Printer, Phone, Mail } from "lucide-react";
import { getDoctorById } from "../../../../../utils/masterService";
import { usePatientContext } from "../../../../../context-api/PatientContext";

// Base English translations (master language)
const baseTranslations = {
  prescriptionPreview: "Prescription Preview",
  contactInformation: "Contact Information",
  language: "Language",
  whatsappNumber: "WhatsApp Number",
  enterWhatsApp: "Enter WhatsApp number",
  emailAddress: "Email Address",
  enterEmail: "Enter patient's email",
  whatsapp: "WhatsApp",
  email: "Email",
  printPdf: "Print PDF",
  note: "Note: Please provide WhatsApp number or email address to send the PDF document.",
  prescription: "Prescription",
  medicine: "Medicine",
  dosage: "Dosage",
  frequency: "Frequency",
  intake: "Intake",
  duration: "Duration",
  name: "Name",
  age: "Age",
  gender: "Gender",
  contact: "Contact",
  doctorName: "Dr. Sheetal S. Shelke",
  doctorQualifications: "MBBS, MD",
  doctorSpecialization: "Neurologist",
  patientDetails: "Patient Details",
  drugName: "Drug Name",
  dosageUnit: "Unit",
  days: "Days",
  doctorSignature: "Doctor's Signature",
};

// Doctor information that needs translation
const doctorInfo = {
  name: "",
  qualifications: "", 
  specialization: ""
};

// Field mappings for patient information
const fieldLabels = {
  name: "Name",
  age: "Age", 
  gender: "Gender",
  contact: "Contact"
};

// Supported Indian languages
const languages = [
  { code: "en", name: "English" },
  { code: "hi", name: "हिंदी (Hindi)" },
  { code: "mr", name: "मराठी (Marathi)" },
  { code: "ta", name: "தமிழ் (Tamil)" },
  { code: "te", name: "తెలుగు (Telugu)" },
  { code: "kn", name: "ಕನ್ನಡ (Kannada)" },
  { code: "ml", name: "മലയാളം (Malayalam)" },
  { code: "bn", name: "বাংলা (Bengali)" },
  { code: "gu", name: "ગુજરાતી (Gujarati)" },
  { code: "pa", name: "ਪੰਜਾਬੀ (Punjabi)" },
  { code: "or", name: "ଓଡ଼ିଆ (Odia)" },
  { code: "as", name: "অসমীয়া (Assamese)" },
  { code: "ks", name: "कॉशुर (Kashmiri)" },
  { code: "sa", name: "संस्कृतम् (Sanskrit)" },
  { code: "sd", name: "सिन्धी (Sindhi)" },
  { code: "ur", name: "اردو (Urdu)" },
  { code: "ne", name: "नेपाली (Nepali)" }
];

// Enhanced Translation API function with better performance
const translateText = async (text, targetLang) => {
  if (targetLang === "en" || !text?.trim()) return text;
  
  // Enhanced cache implementation
  const cacheKey = `trans_${btoa(text)}_${targetLang}`;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) return cached;
  } catch (e) {
    // localStorage might be unavailable, continue without cache
  }

  try {
    // Use multiple fallback APIs for better reliability
    const apis = [
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`,
      `https://libretranslate.de/translate?q=${encodeURIComponent(text)}&source=en&target=${targetLang}&format=text`
    ];

    let response = null;
    for (const apiUrl of apis) {
      try {
        response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });
        if (response.ok) break;
      } catch (e) {
        continue; // Try next API
      }
    }

    if (!response || !response.ok) {
      throw new Error("All translation APIs failed");
    }

    const data = await response.json();
    let translatedText = text;

    // Handle different API response formats
    if (data.responseData?.translatedText) {
      translatedText = data.responseData.translatedText;
    } else if (data.translatedText) {
      translatedText = data.translatedText;
    }

    // Clean up translation (remove extra spaces, etc.)
    translatedText = translatedText.trim();

    // Cache the translation
    try {
      localStorage.setItem(cacheKey, translatedText);
    } catch (e) {
      // Ignore cache errors
    }

    return translatedText;
  } catch (error) {
    console.warn("Translation failed, using original text:", error);
    return text; // Fallback to original text
  }
};

// Batch translation function for better performance
const translateBatch = async (texts, targetLang) => {
  if (targetLang === "en") return texts;
  
  const translated = {};
  const promises = Object.entries(texts).map(async ([key, text]) => {
    translated[key] = await translateText(text, targetLang);
  });
  
  await Promise.all(promises);
  return translated;
};

// PDF Generation Function (using backend-generated URL instead of Blob)
const generatePdfUrl = async (prescriptions = [], patient = {}, doctorInfo = {}, translatedTexts = {}, lang = 'en') => {
  try {
    // Call backend API to generate the PDF and return a URL
    // TODO: Replace "/api/prescriptions/generate-pdf" with your real endpoint URL if different
    const response = await fetch("/api/prescriptions/generate-pdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prescriptions,
        patient,
        doctorInfo,
        translatedTexts,
        lang,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate PDF. Status: ${response.status}`);
    }

    const data = await response.json();

    // Expect backend to return something like: { pdfUrl: "https://.../file.pdf" }
    const pdfUrl = data?.pdfUrl;

    if (!pdfUrl || typeof pdfUrl !== "string") {
      throw new Error("PDF URL not found in response.");
    }

    console.log("Generated PDF URL from backend:", pdfUrl);
    return pdfUrl;
  } catch (error) {
    console.error("Error getting PDF URL from backend:", error);
    throw error;
  }
};

const ShareModalContent = ({ onClose, prescriptions = [], patient = {}, onSendWhatsApp, onSendEmail, onPrint }) => {
  const auth = useSelector((state) => state.auth);
  const user = auth?.user;

  // Get patient data from PatientContext
  const { patient: contextPatient } = usePatientContext() || {};

  const [doctorData, setDoctorData] = useState(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  React.useEffect(() => {
    if (!user?.doctorId) return;

    let isMounted = true;

    (async () => {
      try {
        const res = await getDoctorById(user.doctorId);
       
        if (!isMounted) return;
        if (res?.data) {
          console.log("ShareModal doctor data:", res.data);
          console.log("ShareModal doctor qualification:", res.data.qualification);
          console.log("ShareModal doctor specialization:", res.data.specialization);
          setDoctorData(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch doctor data for ShareModal:", error);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [user?.doctorId]);

  const getUserDisplayName = (user) => {
    if (!user) return null;
    const userType = user.role?.toLowerCase();
    switch (userType) {
      case "doctor":
      case "freelancer":
        return `Dr. ${user.firstName || user.email?.split("@")[0] || "Doctor"}`;
      case "hospital":
        return user.hospitalName || user.email?.split("@")[0] || "Hospital Admin";
      case "lab":
        return user.labName || user.email?.split("@")[0] || "Lab Admin";
      case "superadmin":
        return user.SuperadminName || user.email?.split("@")[0] || "Super Admin";
      case "patient":
        return `${user.firstName || user.email?.split("@")[0] || "Patient"}`;
      default:
        return user.email?.split("@")[0] || null;
    }
  };

  const baseDoctorInfo = {
    name:
      (getUserDisplayName(user) && String(getUserDisplayName(user)).trim()) ||
      (auth?.name && String(auth.name).trim()) ||
      (auth?.doctorDetails?.name && String(auth.doctorDetails.name).trim()) ||
      doctorInfo.name,
    qualifications:
      (doctorData?.qualification && String(doctorData.qualification).trim()) ||
      (auth?.qualification && String(auth.qualification).trim()) ||
      (auth?.doctorDetails?.qualification && String(auth.doctorDetails.qualification).trim()) ||
      doctorInfo.qualifications,
    specialization:
      (doctorData?.specialization && String(doctorData.specialization).trim()) ||
      (auth?.specialization && String(auth.specialization).trim()) ||
      (auth?.doctorDetails?.specialization && String(auth.doctorDetails.specialization).trim()) ||
      doctorInfo.specialization,
  };

  const [lang, setLang] = useState("en");
  const [translatedPrescriptions, setTranslatedPrescriptions] = useState(null);
  const [translatedTexts, setTranslatedTexts] = useState(baseTranslations);
  const [isTranslating, setIsTranslating] = useState(false);
  const [phone, setPhone] = useState(contextPatient?.phone || patient?.phone || "");
  const [email, setEmail] = useState(contextPatient?.email || patient?.email || "");
  const [translatedDoctor, setTranslatedDoctor] = useState(baseDoctorInfo);
  const [translatedFields, setTranslatedFields] = useState(fieldLabels);
  const [translatedPatientData, setTranslatedPatientData] = useState({
    name: contextPatient?.name || patient?.name || "Kavya Patil",
    age: contextPatient?.age || patient?.age || "N/A",
    gender: contextPatient?.gender || patient?.gender || "N/A", 
    contact: contextPatient?.phone || patient?.phone || "N/A"
  });
  const [translatedDoctorAddress, setTranslatedDoctorAddress] = useState("");

  // Build doctor's address from doctorData fields for footer display
  const doctorAddressParts = [
    doctorData?.city || doctorData?.district,
    doctorData?.state,
    doctorData?.pincode,
  ].filter(Boolean);
  const doctorAddress = doctorAddressParts.join(", ");

  // Debounced language change handler
  const handleLanguageChange = useCallback((newLang) => {
    setLang(newLang);
  }, []);

  // Function to translate patient data values
  const translatePatientData = async (patientData, targetLang) => {
    if (targetLang === "en") return patientData;

    const translated = { ...patientData };
    
    // Translate name if present
    if (patientData.name && patientData.name !== "N/A") {
      translated.name = await translateText(patientData.name, targetLang);
    }

    // Translate gender if it's not N/A
    if (patientData.gender && patientData.gender !== "N/A") {
      translated.gender = await translateText(patientData.gender, targetLang);
    }

    // Translate contact/phone if it's not N/A
    if (patientData.contact && patientData.contact !== "N/A") {
      translated.contact = await translateText(String(patientData.contact), targetLang);
    }

    // Note: We don't translate age numbers
    
    return translated;
  };

  // Enhanced WhatsApp handler with PDF generation
// Enhanced WhatsApp handler with PDF generation
const handleWhatsAppClick = async () => {
  if (typeof onSendWhatsApp === "function") {
    onSendWhatsApp({ phone, prescriptions: displayPrescriptions, patient, lang });
    return;
  }
  
  if (!isPhoneValid) return;
  
  try {
    setIsGeneratingPdf(true);
    
    // Generate PDF and get URL
    const generatedPdfUrl = await generatePdfUrl(
      displayPrescriptions,
      translatedPatientData,
      translatedDoctor,
      translatedTexts,
      lang
    );
    
    // Create WhatsApp message with PDF URL - Make sure URL is properly formatted
    const messageLines = [];
    messageLines.push(`*${translatedTexts.prescription} - ${translatedPatientData.name}*`);
    messageLines.push(`*Doctor:* ${translatedDoctor.name}`);
    messageLines.push("");
    messageLines.push("*Patient Details:*");
    messageLines.push(`Name: ${translatedPatientData.name}`);
    messageLines.push(`Age: ${translatedPatientData.age}`);
    messageLines.push(`Gender: ${translatedPatientData.gender}`);
    messageLines.push(`Contact: ${translatedPatientData.contact}`);
    messageLines.push("");
    messageLines.push("*Prescription:*");
    
    displayPrescriptions.forEach((m, i) => {
      const medDetails = [];
      medDetails.push(`${i + 1}. *${m.drugName || "Medicine"}*`);
      if (m.dosage) medDetails.push(`Dosage: ${m.dosage}${m.dosageUnit ? ` ${m.dosageUnit}` : ''}`);
      if (m.frequency) medDetails.push(`Frequency: ${m.frequency}`);
      if (m.intake) medDetails.push(`Intake: ${m.intake}`);
      if (m.duration) medDetails.push(`Duration: ${m.duration} ${translatedTexts.days || 'days'}`);
      
      messageLines.push(medDetails.join(' | '));
    });
    
    messageLines.push("");
    messageLines.push("*Download Your Prescription PDF:*");
    messageLines.push(generatedPdfUrl); // This will be clickable in WhatsApp
    messageLines.push("");
    messageLines.push(`*${translatedTexts.doctorSignature}:* ${translatedDoctor.name}`);
    messageLines.push(`*Address:* ${translatedDoctorAddress}`);
    
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(messageLines.join("\n"))}`;
    
    // Open WhatsApp with the PDF URL
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    
    console.log('PDF URL sent to WhatsApp:', generatedPdfUrl);
    
  } catch (error) {
    console.error('Error generating PDF for WhatsApp:', error);
    // Fallback to text-only message
    const messageLines = [];
    messageLines.push(`*${translatedTexts.prescription} - ${translatedPatientData.name}*`);
    messageLines.push(`*Doctor:* ${translatedDoctor.name}`);
    messageLines.push("");
    messageLines.push("*Patient Details:*");
    messageLines.push(`Name: ${translatedPatientData.name}`);
    messageLines.push(`Age: ${translatedPatientData.age}`);
    messageLines.push(`Gender: ${translatedPatientData.gender}`);
    messageLines.push(`Contact: ${translatedPatientData.contact}`);
    messageLines.push("");
    messageLines.push("*Prescription:*");
    
    displayPrescriptions.forEach((m, i) => {
      messageLines.push(`${i + 1}. *${m.drugName || ""}* - ${m.dosage || ""} ${m.dosageUnit || ""} - ${m.frequency || ""}`);
    });
    
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(messageLines.join("\n"))}`;
    window.open(url, "_blank");
  } finally {
    setIsGeneratingPdf(false);
  }
};

  // Enhanced Print handler with PDF generation
  const handlePrintClick = async () => {
    if (typeof onPrint === 'function') {
      onPrint({ prescriptions: displayPrescriptions, patient, lang }); 
      return;
    }
    
    try {
      setIsGeneratingPdf(true);
      
      // Generate PDF using our function
      const generatedPdfUrl = await generatePdfUrl(
        displayPrescriptions,
        translatedPatientData,
        translatedDoctor,
        translatedTexts,
        lang
      );
      
      // Open PDF in new tab for printing
      window.open(generatedPdfUrl, '_blank');
      
    } catch (error) {
      console.error('Error generating PDF for print:', error);
      // Fallback to browser print
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Enhanced Email handler with PDF generation
  const handleEmailClick = async () => {
    const trimmedEmail = email.trim();
    if (typeof onSendEmail === "function") {
      if (!isEmailValid) return;
      onSendEmail({ email: trimmedEmail, prescriptions: displayPrescriptions, patient, lang });
      return;
    }
    
    if (!isEmailValid) return;
    
    try {
      setIsGeneratingPdf(true);
      
      // Generate PDF for email
      const generatedPdfUrl = await generatePdfUrl(
        displayPrescriptions,
        translatedPatientData,
        translatedDoctor,
        translatedTexts,
        lang
      );
      
      const subject = `${translatedTexts.prescription} - ${translatedPatientData.name} - ${translatedDoctor.name}`;
      
      const bodyLines = [];
      bodyLines.push(`Patient: ${translatedPatientData.name}`);
      bodyLines.push(`Doctor: ${translatedDoctor.name}`);
      bodyLines.push("");
      bodyLines.push("Prescription Details:");
      displayPrescriptions.forEach((m, i) => {
        bodyLines.push(`${i + 1}. ${m.drugName || ""} - ${m.dosage || ""} ${m.dosageUnit || ""} - ${m.frequency || ""}`);
      });
      bodyLines.push("");
      bodyLines.push("Download your prescription PDF from the link below:");
      bodyLines.push(generatedPdfUrl);
      bodyLines.push("");
      bodyLines.push(`Doctor's Signature: ${translatedDoctor.name}`);
      bodyLines.push(`Address: ${translatedDoctorAddress}`);
      
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(trimmedEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join("\n"))}`;
      try {
        window.open(gmailUrl, "_blank");
      } catch (e) {
        const mailto = `mailto:${encodeURIComponent(trimmedEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join("\n"))}`;
        window.location.href = mailto;
      }
      
    } catch (error) {
      console.error('Error generating PDF for email:', error);
      // Fallback to text-only email
      const subject = `${translatedTexts.prescription} - ${translatedPatientData.name}`;
      const bodyLines = [];
      bodyLines.push(`Patient: ${translatedPatientData.name}`);
      bodyLines.push(`Doctor: ${translatedDoctor.name}`);
      bodyLines.push("");
      bodyLines.push("Prescription:");
      displayPrescriptions.forEach((m, i) => {
        bodyLines.push(`${i + 1}. ${m.drugName || ""} - ${m.dosage || ""} ${m.dosageUnit || ""}`);
      });
      
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(trimmedEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join("\n"))}`;
      try {
        window.open(gmailUrl, "_blank");
      } catch (e) {
        const mailto = `mailto:${encodeURIComponent(trimmedEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join("\n"))}`;
        window.location.href = mailto;
      }
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Optimized translation effect - only translates what's necessary
  React.useEffect(() => {
    let mounted = true;
    let translationTimeout;

    const performTranslations = async () => {
      if (!mounted) return;

      setIsTranslating(true);

      try {
        // Immediate UI update for better responsiveness
        if (lang === "en") {
          setTranslatedTexts(baseTranslations);
          setTranslatedPrescriptions(null);
          setTranslatedDoctor(baseDoctorInfo);
          setTranslatedFields(fieldLabels);
          setTranslatedPatientData({
            name: contextPatient?.name || patient?.patientName || "N/A",
            age: contextPatient?.age || patient?.age || "N/A",
            gender: contextPatient?.gender || patient?.gender || "N/A",
            contact: contextPatient?.phone || patient?.patientPhoneNumber || "N/A"
          });
          setTranslatedDoctorAddress(doctorAddress || "");
          return;
        }

        // Batch translate all content in parallel
        const [
          uiTranslations, 
          prescriptionTranslations, 
          doctorTranslations,
          fieldTranslations,
          patientDataTranslations,
          doctorAddressTranslation
        ] = await Promise.all([
          translateBatch(baseTranslations, lang),
          translatePrescriptionsData(prescriptions, lang),
          translateDoctorInfo(lang),
          translateBatch(fieldLabels, lang),
          translatePatientData({
            name: contextPatient?.name || patient?.patientName || "N/A",
            age: contextPatient?.age || patient?.age || "N/A",
            gender: contextPatient?.gender || patient?.gender || "N/A",
            contact: contextPatient?.phone || patient?.patientPhoneNumber || "N/A"
          }, lang),
          doctorAddress ? translateText(doctorAddress, lang) : ""
        ]);

        if (mounted) {
          setTranslatedTexts(uiTranslations);
          setTranslatedPrescriptions(prescriptionTranslations);
          setTranslatedDoctor(doctorTranslations);
          setTranslatedFields(fieldTranslations);
          setTranslatedPatientData(patientDataTranslations);
          setTranslatedDoctorAddress(doctorAddressTranslation || doctorAddress || "");
        }
      } catch (error) {
        console.error("Translation error:", error);
        if (mounted) {
          // Fallback to English
          setTranslatedTexts(baseTranslations);
          setTranslatedPrescriptions(null);
          setTranslatedDoctor(baseDoctorInfo);
          setTranslatedFields(fieldLabels);
          setTranslatedPatientData({
            name: contextPatient?.name || patient?.name || "Kavya Patil",
            age: contextPatient?.age || patient?.age || "N/A",
            gender: contextPatient?.gender || patient?.gender || "N/A",
            contact: contextPatient?.phone || patient?.phone || "N/A"
          });
          setTranslatedDoctorAddress(doctorAddress || "");
        }
      } finally {
        if (mounted) {
          setIsTranslating(false);
        }
      }
    };

    // Debounce translations to avoid rapid API calls
    translationTimeout = setTimeout(performTranslations, 300);

    return () => {
      mounted = false;
      clearTimeout(translationTimeout);
    };
  }, [lang, prescriptions, patient, contextPatient, doctorData]);

  // Separate function for prescription translation
  const translatePrescriptionsData = async (prescriptions, targetLang) => {
    if (targetLang === "en" || !prescriptions?.length) {
      return null;
    }

    const translated = await Promise.all(
      prescriptions.map(async (med) => {
        const [drugName, frequency, intake, dosageUnit] = await Promise.all([
          translateText(med.drugName || "", targetLang),
          translateText(med.frequency || "", targetLang),
          translateText(med.intake || "", targetLang),
          translateText(med.dosageUnit || "", targetLang)
        ]);
        return { ...med, drugName, frequency, intake, dosageUnit };
      })
    );

    return translated;
  };

  // Separate function for doctor info translation, using Redux-derived baseDoctorInfo
  const translateDoctorInfo = async (targetLang) => {
    if (targetLang === "en") {
      return baseDoctorInfo;
    }

    const [name, qualifications, specialization] = await Promise.all([
      translateText(baseDoctorInfo.name || "", targetLang),
      translateText(baseDoctorInfo.qualifications || "", targetLang),
      translateText(baseDoctorInfo.specialization || "", targetLang),
    ]);

    return { name, qualifications, specialization };
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handlePhoneChange = (e) => {
    const digits = e.target.value.replace(/\D/g, "");
    setPhone(digits);
  };

  const isPhoneValid = /^\d{10}$/.test(phone);

  // Memoized prescription data for better performance
  const displayPrescriptions = translatedPrescriptions || prescriptions;

  return (
    <div className="bg-white rounded-lg shadow-2xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-[#01D48C] to-[#0E1630] text-white">
        <h3 className="text-xl font-semibold">{translatedTexts.prescriptionPreview}</h3>
        <button 
          onClick={onClose} 
          className="text-white hover:text-gray-200 transition-colors"
          disabled={isTranslating || isGeneratingPdf}
        >
          <X size={24}/>
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
        {/* Prescription Preview */}
        <div className="p-4 rounded-lg flex flex-col items-center">
          <div className="bg-white border border-[#222] rounded-lg shadow-lg overflow-hidden p-8 w-full">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h2 className="text-xl font-bold text-[#0E1630] mb-1">{translatedDoctor.name}</h2>
                <div className="text-xs text-gray-700 leading-tight">
                  {translatedDoctor.qualifications && (
                    <div><span className="font-semibold"></span> {translatedDoctor.qualifications}</div>
                  )}
                  {translatedDoctor.specialization && (
                    <div><span className="font-semibold"></span> {translatedDoctor.specialization}</div>
                  )}
                </div>
              </div>
              <img src="/logo.png" alt="AV Swasthya" className="h-10 w-auto" />
            </div>

            {/* Patient Information Section - Fully Translated */}
            <div className="bg-gray-100 rounded px-4 py-2 mb-4 flex flex-wrap gap-4 items-center text-sm">
              <span><b>{translatedFields.name}:</b> {translatedPatientData.name}</span>
              <span><b>{translatedFields.age}:</b> {translatedPatientData.age}</span>
              <span><b>{translatedFields.gender}:</b> {translatedPatientData.gender}</span>
              <span><b>{translatedFields.contact}:</b> {translatedPatientData.contact}</span>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[#0E1630] font-semibold">{translatedTexts.prescription}</div>
                {(isTranslating || isGeneratingPdf) && (
                  <div className="text-xs text-blue-600 animate-pulse">
                    {isGeneratingPdf ? 'Generating PDF...' : 'Translating...'}
                  </div>
                )}
              </div>
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full border border-gray-300 text-sm min-w-[500px]">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-2 py-1 text-left">{translatedTexts.medicine}</th>
                      <th className="border border-gray-300 px-2 py-1 text-left">{translatedTexts.dosage}</th>
                      <th className="border border-gray-300 px-2 py-1 text-left">{translatedTexts.frequency}</th>
                      <th className="border border-gray-300 px-2 py-1 text-left">{translatedTexts.intake}</th>
                      <th className="border border-gray-300 px-2 py-1 text-left">{translatedTexts.duration}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayPrescriptions.map((med, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-2 py-1">
                          {med.drugName || "-"}
                        </td>
                        <td className="border border-gray-300 px-2 py-1">
                          {med.dosage || "-"} {med.dosageUnit || ""}
                        </td>
                        <td className="border border-gray-300 px-2 py-1">
                          {med.frequency || "-"}
                        </td>
                        <td className="border border-gray-300 px-2 py-1">
                          {med.intake || "-"}
                        </td>
                        <td className="border border-gray-300 px-2 py-1">
                          {med.duration ? `${med.duration} ${translatedTexts.days || 'day(s)'}` : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Doctor Signature Footer */}
            <div className="mt-8 border-t border-gray-300 pt-3 flex items-center justify-between text-xs text-[#0E1630]">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="AV Swasthya" className="h-8 w-auto" />
                <div className="leading-tight">
                  <div>{translatedDoctorAddress}</div>
                </div>
              </div>
              <div className="flex-1 flex justify-end">
                <div className="text-right">
                  <div className="w-32 border-t border-gray-400 mb-1 ml-auto" />
                  <div className="text-[11px] font-medium text-gray-700">{translatedTexts.doctorSignature}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information & Controls */}
        <div className="space-y-6">
          <h4 className="text-lg font-semibold text-[#0E1630]">{translatedTexts.contactInformation}</h4>

          {/* Language Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Globe size={16}/> {translatedTexts.language}
            </label>
            <select 
              value={lang} 
              onChange={(e) => handleLanguageChange(e.target.value)} 
              className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3 text-sm transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              disabled={isTranslating || isGeneratingPdf}
            >
              {languages.map((language) => (
                <option key={language.code} value={language.code}>
                  {language.name}
                </option>
              ))}
            </select>
          </div>

          {/* WhatsApp Number */}
          <div>
            <div className={`flex items-center gap-2 mb-1.5 text-sm ${isPhoneValid ? 'text-green-700' : 'text-gray-700'}`}>
              <Phone size={14} />
              <label className={`font-medium ${isPhoneValid ? 'text-green-700' : ''}`}>
                {translatedTexts.whatsappNumber}
              </label>
            </div>
            <input
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              placeholder={translatedTexts.enterWhatsApp}
              className={`w-full rounded-md px-3 py-2 mb-3 text-sm shadow-sm transition-colors duration-150 ${
                isPhoneValid 
                  ? 'border border-green-500 bg-green-50 focus:ring-2 focus:ring-green-200 focus:border-green-500' 
                  : 'border border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500'
              } outline-none`}
              maxLength={10}
              disabled={isTranslating || isGeneratingPdf}
            />
          </div>

          {/* Email Address */}
          <div>
            <div className={`flex items-center gap-2 mb-1.5 text-sm ${isEmailValid ? 'text-green-700' : 'text-gray-700'}`}>
              <Mail size={14} />
              <label className={`font-medium ${isEmailValid ? 'text-green-700' : ''}`}>
                {translatedTexts.emailAddress}
              </label>
            </div>
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder={translatedTexts.enterEmail}
              className={`w-full rounded-md px-3 py-2 mb-3 text-sm shadow-sm transition-colors duration-150 ${
                isEmailValid 
                  ? 'border border-green-500 bg-green-50 focus:ring-2 focus:ring-green-200 focus:border-green-500' 
                  : 'border border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500'
              } outline-none`}
              maxLength={254}
              disabled={isTranslating || isGeneratingPdf}
            />
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-3 mt-2">
            {/* WhatsApp Button */}
            <button
              onClick={handleWhatsAppClick}
              disabled={!isPhoneValid || isTranslating || isGeneratingPdf}
              className={`flex flex-col items-center justify-center p-4 rounded-lg border transition-all duration-200 ${
                !isPhoneValid || isTranslating || isGeneratingPdf
                  ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                  : 'border-gray-200 bg-white hover:bg-gray-50 hover:shadow-md active:scale-95'
              }`}
            >
              <div className="w-10 h-10 flex items-center justify-center rounded-full mb-2">
                {isGeneratingPdf ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
                ) : (
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" 
                    alt="WhatsApp" 
                    className="w-8 h-8" 
                  />
                )}
              </div>
              <span className="text-sm text-gray-600">
                {isGeneratingPdf ? 'Generating...' : translatedTexts.whatsapp}
              </span>
            </button>

            {/* Email Button */}
            <button
              onClick={handleEmailClick}
              disabled={!isEmailValid || isTranslating || isGeneratingPdf}
              className={`flex flex-col items-center justify-center p-4 rounded-lg border transition-all duration-200 ${
                !isEmailValid || isTranslating || isGeneratingPdf
                  ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                  : 'border-gray-200 bg-white hover:bg-gray-50 hover:shadow-md active:scale-95'
              }`}
            >
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#FCE9E7] text-[#EA4335] mb-2">
                {isGeneratingPdf ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#EA4335]"></div>
                ) : (
                  <Mail size={18} />
                )}
              </div>
              <span className="text-sm text-gray-600">
                {isGeneratingPdf ? 'Generating...' : translatedTexts.email}
              </span>
            </button>

            {/* Print Button */}
            <button 
              onClick={handlePrintClick}
              disabled={isTranslating || isGeneratingPdf}
              className={`flex flex-col items-center justify-center p-4 rounded-lg border transition-all duration-200 ${
                isTranslating || isGeneratingPdf
                  ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                  : 'border-gray-200 bg-white hover:bg-gray-50 hover:shadow-md active:scale-95'
              }`}
            >
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-900 text-white mb-2">
                {isGeneratingPdf ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                ) : (
                  <Printer size={16} />
                )}
              </div>
              <span className="text-sm text-gray-600">
                {isGeneratingPdf ? 'Generating...' : translatedTexts.printPdf}
              </span>
            </button>
          </div>

          {/* Note */}
          <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">{translatedTexts.note}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Export the generatePdfUrl function for use elsewhere
export { generatePdfUrl };
export default ShareModalContent;