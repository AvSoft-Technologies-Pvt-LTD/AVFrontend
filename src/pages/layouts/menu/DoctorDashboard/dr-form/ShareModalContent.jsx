
// ------------------------------
// File: DrForm/ShareModalContent.jsx
// ------------------------------
import React, { useState } from "react";
import { X, Globe, Printer, Phone, Mail } from "lucide-react";

const translations = {
  en: {
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
  },
  hi: {
    prescriptionPreview: "प्रिस्क्रिप्शन पूर्वावलोकन",
    contactInformation: "संपर्क जानकारी",
    language: "भाषा",
    whatsappNumber: "व्हाट्सएप नंबर",
    enterWhatsApp: "व्हाट्सएप नंबर दर्ज करें",
    emailAddress: "ईमेल पता",
    enterEmail: "रोगी का ईमेल दर्ज करें",
    whatsapp: "व्हाट्सएप",
    email: "ईमेल",
    printPdf: "पीडीएफ प्रिंट करें",
    note: "नोट: कृपया पीडीएफ दस्तावेज़ भेजने के लिए व्हाट्सएप नंबर या ईमेल पता प्रदान करें।",
    prescription: "प्रिस्क्रिप्शन",
    medicine: "दवा",
    dosage: "खुराक",
    frequency: "आवृत्ति",
    intake: "लेने का तरीका",
    duration: "अवधि",
    name: "नाम",
    age: "आयु",
    gender: "लिंग",
    contact: "संपर्क",
  },
  mr: {
    prescriptionPreview: "प्रिस्क्रिप्शन पूर्वावलोकन",
    contactInformation: "संपर्क माहिती",
    language: "भाषा",
    whatsappNumber: "व्हाट्सअप नंबर",
    enterWhatsApp: "व्हाट्सअप नंबर प्रविष्ट करा",
    emailAddress: "ईमेल पत्ता",
    enterEmail: "रुग्णाचा ईमेल प्रविष्ट करा",
    whatsapp: "व्हाट्सअप",
    email: "ईमेल",
    printPdf: "पीडीएफ प्रिंट करा",
    note: "टीप: कृपया पीडीएफ दस्तऐवज पाठवण्यासाठी व्हाट्सअप नंबर किंवा ईमेल पत्ता द्या.",
    prescription: "प्रिस्क्रिप्शन",
    medicine: "औषध",
    dosage: "डोस",
    frequency: "वारंवारता",
    intake: "घेण्याचा प्रकार",
    duration: "कालावधी",
    name: "नाव",
    age: "वय",
    gender: "लिंग",
    contact: "संपर्क",
  },
};

const ShareModalContent = ({ onClose, prescriptions = [], patient = {}, onSendWhatsApp, onSendEmail, onPrint }) => {
  const [lang, setLang] = useState("en");
  const [translatedPrescriptions, setTranslatedPrescriptions] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [phone, setPhone] = useState(patient?.phone || "");
  const [email, setEmail] = useState(patient?.email || "");
  const t = translations[lang] || translations.en;

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Simple client-side cache in sessionStorage to avoid repeated translations
  const getCache = () => {
    try {
      return JSON.parse(sessionStorage.getItem("translation_cache") || "{}");
    } catch (e) {
      return {};
    }
  };
  const setCache = (cache) => {
    try {
      sessionStorage.setItem("translation_cache", JSON.stringify(cache));
    } catch (e) {
      // ignore
    }
  };

  // Translate text using LibreTranslate public instance (free). Falls back to original text on error.
  const translateText = async (text, target) => {
    if (!text) return text;
    if (target === "en") return text;
    const key = `${text}__${target}`;
    const cache = getCache();
    if (cache[key]) return cache[key];

    try {
      const res = await fetch("https://libretranslate.de/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: text, source: "auto", target, format: "text" }),
      });
      if (!res.ok) throw new Error("Translation API error");
      const json = await res.json();
      const translated = json.translatedText || text;
      cache[key] = translated;
      setCache(cache);
      return translated;
    } catch (err) {
      // On failure, return original text
      console.error("Translation failed:", err);
      return text;
    }
  };

  // When language changes, translate prescription free-text fields
  React.useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!prescriptions || prescriptions.length === 0) {
        setTranslatedPrescriptions([]);
        return;
      }
      if (lang === "en") {
        setTranslatedPrescriptions(null); // use originals
        return;
      }
      setIsTranslating(true);
      try {
        const translated = await Promise.all(
          prescriptions.map(async (med) => {
            const drugName = await translateText(med.drugName || "", lang);
            const frequency = await translateText(med.frequency || "", lang);
            const intake = await translateText(med.intake || "", lang);
            return { ...med, drugName, frequency, intake };
          })
        );
        if (mounted) setTranslatedPrescriptions(translated);
      } finally {
        if (mounted) setIsTranslating(false);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, [lang, prescriptions]);

  const handlePhoneChange = (e) => {
    // allow only digits
    const digits = e.target.value.replace(/\D/g, "");
    setPhone(digits);
  };

  const isPhoneValid = /^\d{10}$/.test(phone);

  return (
    <div className="bg-white rounded-lg shadow-2xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto">
    <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-[#01D48C] to-[#0E1630] text-white">
      <h3 className="text-xl font-semibold">{t.prescriptionPreview}</h3>
      <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><X size={24}/></button>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
      <div className="p-4 rounded-lg flex flex-col items-center">
        <div className="bg-white border border-[#222] rounded-lg shadow-lg overflow-hidden p-8">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h2 className="text-xl font-bold text-[#0E1630] mb-1">Dr. Sheetal S. Shelke</h2>
              <div className="text-xs text-gray-700 leading-tight"><div>MBBS, MD</div><div>Neurologist</div></div>
            </div>
            <img src="/logo.png" alt="AV Swasthya" className="h-10 w-auto" />
          </div>

          <div className="bg-gray-100 rounded px-4 py-2 mb-4 flex flex-wrap gap-4 items-center text-sm">
            <span><b>{t.name}:</b> {patient?.name || "N/A"}</span>
            <span><b>{t.age}:</b> {patient?.age || "N/A"}</span>
            <span><b>{t.gender}:</b> {patient?.gender || "N/A"}</span>
            <span><b>{t.contact}:</b> {patient?.phone || "N/A"}</span>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[#0E1630] font-semibold">{t.prescription}</div>
              {isTranslating && (
                <div className="text-xs text-gray-500">Translating...</div>
              )}
            </div>
            <table className="w-full border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-2 py-1">{t.medicine}</th>
                  <th className="border border-gray-300 px-2 py-1">{t.dosage}</th>
                  <th className="border border-gray-300 px-2 py-1">{t.frequency}</th>
                  <th className="border border-gray-300 px-2 py-1">{t.intake}</th>
                  <th className="border border-gray-300 px-2 py-1">{t.duration}</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.map((med, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 px-2 py-1">{(translatedPrescriptions ? translatedPrescriptions[index]?.drugName : med.drugName) || "-"}</td>
                    <td className="border border-gray-300 px-2 py-1">{med.dosage || "-"} {med.dosageUnit || ""}</td>
                    <td className="border border-gray-300 px-2 py-1">{(translatedPrescriptions ? translatedPrescriptions[index]?.frequency : med.frequency) || "-"}</td>
                    <td className="border border-gray-300 px-2 py-1">{(translatedPrescriptions ? translatedPrescriptions[index]?.intake : med.intake) || "-"}</td>
                    <td className="border border-gray-300 px-2 py-1">{med.duration ? `${med.duration} day(s)` : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>

      <div className="space-y-6">
        <h4 className="text-lg font-semibold text-[#0E1630]">Contact Information</h4>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"><Globe size={16}/> {t.language}</label>
          <select value={lang} onChange={(e) => setLang(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3 text-sm">
            <option value="en">English</option>
            <option value="hi">हिंदी (Hindi)</option>
            <option value="mr">मराठी (Marathi)</option>
          </select>
        </div>

        <div>
          <div className={`flex items-center gap-2 mb-1.5 text-sm ${isPhoneValid ? 'text-green-700' : 'text-gray-700'}`}>
            <Phone size={14} />
            <label className={`font-medium ${isPhoneValid ? 'text-green-700' : ''}`}>{t.whatsappNumber}</label>
          </div>
            <input
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              placeholder={t.enterWhatsApp}
              className={`w-full rounded-md px-3 py-2 mb-3 text-sm shadow-sm transition-colors duration-150 ${isPhoneValid ? 'border border-green-500 bg-green-50 focus:ring-2 focus:ring-green-200 focus:border-green-500 focus:outline-none' : 'border border-gray-300 focus:ring-2 focus:ring-transparent focus:border-gray-300 focus:outline-none'}`}
              maxLength={10}
            />
        </div>

        <div>
          <div className={`flex items-center gap-2 mb-1.5 text-sm ${isEmailValid ? 'text-green-700' : 'text-gray-700'}`}>
            <Mail size={14} />
            <label className={`font-medium ${isEmailValid ? 'text-green-700' : ''}`}>{t.emailAddress}</label>
          </div>
          <input
            type="email"
            value={email}
            onChange={handleEmailChange}
            placeholder={t.enterEmail}
            className={`w-full rounded-md px-3 py-2 mb-3 text-sm shadow-sm transition-colors duration-150 ${isEmailValid ? 'border border-green-500 bg-green-50 focus:ring-2 focus:ring-green-200 focus:border-green-500 focus:outline-none' : 'border border-gray-300 focus:ring-2 focus:ring-transparent focus:border-gray-300 focus:outline-none'}`}
            maxLength={254}
          />
        </div>

        <div className="grid grid-cols-3 gap-3 mt-2">
          <button
            onClick={async () => {
              // prefer parent handler if provided
              if (typeof onSendWhatsApp === "function") {
                onSendWhatsApp({ phone, prescriptions: translatedPrescriptions || prescriptions, patient, lang });
                return;
              }
              // fallback: open wa.me with text message (can't attach file via URL)
              if (!/^\d{10}$/.test(phone)) return;
              const messageLines = [];
              messageLines.push(`${t.prescription} - ${patient?.name || ""}`);
              (translatedPrescriptions || prescriptions || []).forEach((m, i) => {
                const med = translatedPrescriptions ? translatedPrescriptions[i] : m;
                messageLines.push(`${i + 1}. ${med.drugName || m.drugName || ""} - ${med.dosage || ""} ${med.dosageUnit || ""}`);
              });
              const url = `https://wa.me/${phone}?text=${encodeURIComponent(messageLines.join("\n"))}`;
              window.open(url, "_blank");
            }}
            disabled={!isPhoneValid}
            className={`flex flex-col items-center justify-center p-4 rounded-lg border ${!isPhoneValid ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed' : 'border-gray-200 bg-white hover:bg-gray-50'}`}
          >
            <div className="w-10 h-10 flex items-center justify-center rounded-full text-white mb-2">
             <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" className="w-8 h-8 mb-2" />
            </div>
            <span className="text-sm text-gray-600">{t.whatsapp}</span>
          </button>

          <button
            onClick={async () => {
              const trimmedEmail = (email || "").trim();
              if (typeof onSendEmail === "function") {
                // only call parent handler when email looks valid
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) return;
                onSendEmail({ email: trimmedEmail, prescriptions: translatedPrescriptions || prescriptions, patient, lang });
                return;
              }
              // fallback: require a valid email before opening mail client
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) return;
              // fallback: open mail client with subject/body (cannot attach file)
              const subject = `${t.prescription} - ${patient?.name || ""}`;
              const bodyLines = [];
              (translatedPrescriptions || prescriptions || []).forEach((m, i) => {
                const med = translatedPrescriptions ? translatedPrescriptions[i] : m;
                bodyLines.push(`${i + 1}. ${med.drugName || m.drugName || ""} - ${med.dosage || ""} ${med.dosageUnit || ""}`);
              });
              const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(trimmedEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join("\n"))}`;
              try {
                window.open(gmailUrl, "_blank");
              } catch (e) {
                // fallback to mailto if popup blocked or window.open fails
                const mailto = `mailto:${encodeURIComponent(trimmedEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join("\n"))}`;
                window.location.href = mailto;
              }
            }}
            disabled={!isEmailValid}
            className={`flex flex-col items-center justify-center p-4 rounded-lg border ${!isEmailValid ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed' : 'border-gray-200 bg-white hover:bg-gray-50'}`}
          >
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#FCE9E7] text-[#EA4335] mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 12.713l11.985-7.713A.996.996 0 0022.796 4H1.204a1 1 0 00-.189 1.999L12 12.713z"/><path d="M12 14.287L.015 6.574A.996.996 0 010 6.999V18a2 2 0 002 2h20a2 2 0 002-2V6.999a.996.996 0 00-.015-.425L12 14.287z"/></svg>
            </div>
            <span className="text-sm text-gray-600">{t.email}</span>
          </button>

          <button onClick={() => { if (typeof onPrint === 'function') onPrint({ prescriptions: translatedPrescriptions || prescriptions, patient, lang }); else window.print(); }} className="flex flex-col items-center justify-center p-4 rounded-lg border border-gray-200 bg-white hover:bg-gray-50">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-900 text-white mb-2">
              <Printer size={16} />
            </div>
            <span className="text-sm text-gray-600">{t.printPdf}</span>
          </button>
        </div>

        <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">{t.note}</p>
        </div>
      </div>

    </div>
  </div>
  );
};

export default ShareModalContent;