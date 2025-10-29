import React, { useState, useRef, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  User,
  Phone,
  MapPin,
  FileText,
  Heart,
  Brain,
  Baby,
  Bone,
  Eye,
  Stethoscope,
  Save,
  Printer as Print,
  Download,
  Leaf,
  FlaskConical,
  Activity,
  Users,
  PenTool,
  Trash2,
  ChevronDown,
  ChevronUp,
  Settings,
  Upload,
  Image as ImageIcon,
  AlertCircle,
  Loader2,
  X,
  Plus,
} from "lucide-react";
import {
  TemplateModal,
  prescriptionTemplates,
  layoutStyles,
} from "./TemplateModal";
import {
  getPracticeTypes,
  getSpecializationsByPracticeType,
} from "../utils/masterService";

const iconMapping = {
  ayurveda: Leaf,
  homeopathy: FlaskConical,
  unani: Activity,
  siddha: Users,
  "general-medicine": Stethoscope,
  cardiology: Heart,
  pediatrics: Baby,
  orthopedics: Bone,
  ophthalmology: Eye,
  neurology: Brain,
  default: FileText,
};

const templateTypes = [
  { id: "past-history", name: "Past History", color: "#3B82F6" },
  { id: "discharge-summary", name: "Discharge Summary", color: "#10B981" },
  { id: "registration-form", name: "Registration Form", color: "#F59E0B" },
  { id: "prescription", name: "Prescription", color: "#8B5CF6" },
  { id: "lab-report", name: "Lab Report", color: "#EF4444" },
];

const InitialAssessment = () => {
  const [practiceTypes, setPracticeTypes] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [specialtyTemplates, setSpecialtyTemplates] = useState({});
  const [templateFields, setTemplateFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPracticeType, setSelectedPracticeType] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [formData, setFormData] = useState({});
  const [handwrittenNotes, setHandwrittenNotes] = useState("");
  const [annotatedImages, setAnnotatedImages] = useState([]);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("classic");
  const [selectedColor, setSelectedColor] = useState("#2563eb");
  const [selectedTemplateType, setSelectedTemplateType] = useState("past-history");
  const [uploadedTemplates, setUploadedTemplates] = useState([]);
  const [showTemplateUpload, setShowTemplateUpload] = useState(false);
  const [templateUploadLoading, setTemplateUploadLoading] = useState(false);
  const fileInputRef = useRef(null);
  const templateFileInputRef = useRef(null);
  const navigate = useNavigate();

  const [patientInfo, setPatientInfo] = useState({
    patientId: "",
    name: "",
    age: "",
    gender: "",
    contact: "",
    address: "",
    referredBy: "",
    consultingDoctor: "Dr. Sheetal Shelke, BHMS",
  });

  const [vitals, setVitals] = useState({
    temperature: "",
    pulse: "",
    bp: "",
    respiration: "",
    spo2: "",
    height: "",
    weight: "",
    bmi: "",
  });

  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    (async () => {
      await loadPracticeTypes();
      await loadUploadedTemplates();
      setInitialLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (selectedPracticeType) {
      loadSpecializations(selectedPracticeType);
    } else {
      setSpecializations([]);
      setSelectedSpecialty("");
    }
  }, [selectedPracticeType]);

  useEffect(() => {
    if (selectedSpecialty) {
      loadTemplateFields(selectedSpecialty);
    } else {
      setTemplateFields([]);
    }
  }, [selectedSpecialty]);

  useEffect(() => {
    loadUploadedTemplates();
  }, [selectedTemplateType]);

  const loadPracticeTypes = async () => {
    try {
      setInitialLoading(true);
      setError(null);
      const response = await getPracticeTypes();
      const data = response.data || [];
      setPracticeTypes(data);
      if (data.length > 0) {
        setSelectedPracticeType(data[0].id.toString());
      }
    } catch (err) {
      setError("Failed to load practice types. Please try again.");
      setPracticeTypes([]);
    } finally {
      setInitialLoading(false);
    }
  };

  const loadSpecializations = async (practiceTypeId) => {
    try {
      setError(null);
      const response = await getSpecializationsByPracticeType(practiceTypeId);
      const data = response.data || [];
      const processedData = data.map((item) => ({
        id: item.id,
        name: item.specializationName || item.name || "Unknown Specialization",
        code:
          item.code ||
          item.specializationName?.toLowerCase().replace(/\s+/g, "-") ||
          "general",
      }));
      setSpecializations(processedData);
      if (processedData.length > 0) {
        setSelectedSpecialty(processedData[0].id.toString());
      }
    } catch (err) {
      setError("Failed to load specializations. Please try again.");
      setSpecializations([]);
    }
  };

  const loadTemplateFields = async (specializationId) => {
    try {
      setError(null);
      const mockFields = [
        { id: "chief-complaint", label: "Chief Complaint", type: "textarea", required: true },
        { id: "history", label: "History of Present Illness", type: "textarea" },
        { id: "examination", label: "Physical Examination", type: "textarea" },
        { id: "diagnosis", label: "Provisional Diagnosis", type: "text" },
        { id: "treatment", label: "Treatment Plan", type: "textarea" },
      ];
      setTemplateFields(mockFields);
      setFormData({});
    } catch (err) {
      setError("Failed to load template fields. Using default template.");
      setTemplateFields([]);
      setFormData({});
    }
  };

  const loadUploadedTemplates = async () => {
    try {
      const storedTemplates = JSON.parse(localStorage.getItem("uploadedTemplates") || "[]");
      const filteredTemplates = storedTemplates.filter(
        template => template.templateType === selectedTemplateType
      );
      setUploadedTemplates(filteredTemplates);
    } catch (err) {
      console.log("Failed to load templates from localStorage");
      setUploadedTemplates([]);
    }
  };

  const handleTemplateUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setTemplateUploadLoading(true);
    const reader = new FileReader();

    reader.onloadend = async () => {
      const base64String = reader.result.split(",")[1];
      const templateData = {
        id: Date.now().toString(),
        templateType: selectedTemplateType,
        image: base64String,
        originalFile: reader.result,
        fileName: file.name,
        uploadedAt: new Date().toISOString(),
        doctorName: patientInfo.consultingDoctor,
        specialty: selectedSpecialty,
        practiceType: selectedPracticeType,
      };
      try {
        const storedTemplates = JSON.parse(localStorage.getItem("uploadedTemplates") || "[]");
        storedTemplates.push(templateData);
        localStorage.setItem("uploadedTemplates", JSON.stringify(storedTemplates));

        toast.success(`${templateTypes.find(t => t.id === selectedTemplateType)?.name} template uploaded successfully!`);
        await loadUploadedTemplates();
      } catch (err) {
        toast.error("Failed to upload template. Please try again.");
      } finally {
        setTemplateUploadLoading(false);
      }
    };

    reader.readAsDataURL(file);
  };

  const deleteTemplate = async (templateId) => {
    try {
      const storedTemplates = JSON.parse(localStorage.getItem("uploadedTemplates") || "[]");
      const updatedTemplates = storedTemplates.filter(template => template.id !== templateId);
      localStorage.setItem("uploadedTemplates", JSON.stringify(updatedTemplates));

      toast.success("Template deleted successfully!");
      await loadUploadedTemplates();
    } catch (err) {
      toast.error("Failed to delete template. Please try again.");
    }
  };

  const handlePracticeTypeChange = (practiceTypeId) => {
    setSelectedPracticeType(practiceTypeId);
    setSelectedSpecialty("");
    setTemplateFields([]);
    setFormData({});
  };

  const handleSpecialtyChange = (specializationId) => {
    setSelectedSpecialty(specializationId);
    setFormData({});
  };

  const getCurrentSpecialty = () => {
    const practiceType = practiceTypes.find(
      (pt) => pt.id.toString() === selectedPracticeType
    );
    const specialization = specializations.find(
      (sp) => sp.id.toString() === selectedSpecialty
    );
    return {
      title: specialization?.name || "Assessment",
      icon: iconMapping[specialization?.code] || iconMapping.default,
      backgroundImage:
        "https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg",
      category: practiceType?.name || practiceType?.practiceName || "Medical",
      sections: templateFields,
    };
  };

  const template = getCurrentSpecialty();
  const IconComponent = template.icon;

  const handleInputChange = (sectionId, value) => {
    setFormData((prev) => ({
      ...prev,
      [sectionId]: value,
    }));
  };

  const handlePatientInfoChange = (field, value) => {
    setPatientInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleVitalsChange = (field, value) => {
    setVitals((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTemplateSelect = (templateId) => {
    setSelectedTemplate(templateId);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result.split(",")[1];
      const newImage = {
        id: Date.now(),
        originalFile: reader.result,
        base64: base64String,
        timestamp: new Date().toISOString(),
        specialty: selectedSpecialty,
        templateType: selectedTemplateType,
        fileName: file.name,
        size: file.size,
        apiLink: "",
      };

      setAnnotatedImages((prev) => [...prev, newImage]);
      const storedImages = JSON.parse(localStorage.getItem("medicalImages") || "[]");
      storedImages.push(newImage);
      localStorage.setItem("medicalImages", JSON.stringify(storedImages));
      toast.success("Image uploaded successfully!");
    };
    reader.readAsDataURL(file);
  };

  const navigateToAnnotation = (image) => {
    navigate("/image-annotation", {
      state: {
        initialImage: image.originalFile || `data:image/jpeg;base64,${image.image}`,
        patient: patientInfo,
        annotatedImages: annotatedImages,
        templateType: selectedTemplateType,
        uploadedTemplates: uploadedTemplates,
        from: "form",
      },
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", {
      patientInfo,
      vitals,
      formData,
      handwrittenNotes,
      annotatedImages,
    });
    alert("Assessment form submitted successfully!");
  };

  const generatePrintTemplate = () => {
    const currentTemplate = prescriptionTemplates[selectedTemplate];
    const currentLayout = layoutStyles[currentTemplate.layout] || layoutStyles.traditional;
    const printContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${template.title} - ${patientInfo.name || "Patient"}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Georgia', 'Times New Roman', serif;
            line-height: 1.6;
            color: #333;
            background: white;
            padding: 20px;
            font-size: 14px;
          }
          .header {
            background-color: ${selectedColor} !important;
            color: white !important;
            padding: 20px;
            margin-bottom: 20px;
            text-align: ${currentLayout.header.textAlign};
            border-radius: ${currentLayout.header.borderRadius};
            ${currentLayout.header.borderLeft ? `border-left: ${currentLayout.header.borderLeft} !important;` : ""}
            ${currentLayout.header.border ? `border: ${currentLayout.header.border} !important;` : ""}
            ${currentLayout.header.borderBottom ? `border-bottom: ${currentLayout.header.borderBottom} !important;` : ""}
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .hospital-name {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 8px;
          }
          .doctor-name {
            font-size: 18px;
            margin-bottom: 4px;
          }
          .hospital-address {
            font-size: 12px;
            opacity: 0.9;
            margin-bottom: 10px;
          }
          .form-title {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 8px;
          }
          .patient-info {
            background: #f8fafc;
            border: 1px solid ${selectedColor} !important;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
          }
          .patient-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 10px;
          }
          .section {
            margin-bottom: 15px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          }
          .section-header {
            background: ${selectedColor} !important;
            color: white !important;
            padding: 10px 15px;
            font-weight: bold;
            font-size: 14px;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .section-content {
            padding: 15px;
          }
          .field-value {
            border: 1px solid #e5e7eb;
            padding: 10px 12px;
            border-radius: 6px;
            background: #fafafa;
            min-height: 60px;
            margin-bottom: 10px;
            white-space: pre-wrap;
          }
          .footer {
            border-top: ${currentLayout.footer.borderTop} !important;
            padding-top: 20px;
            text-align: ${currentLayout.footer.textAlign};
            margin-top: 20px;
          }
          @media print {
            .header, .section-header {
              background-color: ${selectedColor} !important;
              color: white !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="hospital-name">AVSwasthya Hospital System</div>
          <div class="doctor-name">${patientInfo.consultingDoctor || "Dr. Sample Name"}</div>
          <div class="hospital-address">123 Medical Street, Healthcare City, HC 12345</div>
          <div class="form-title">${template.title}</div>
        </div>
        <div class="patient-info">
          <h4>Patient Information</h4>
          <div class="patient-grid">
            <div><strong>Patient Name:</strong> ${patientInfo.name || ""}</div>
            <div><strong>Age:</strong> ${patientInfo.age || ""}</div>
            <div><strong>Gender:</strong> ${patientInfo.gender || ""}</div>
            <div><strong>Contact:</strong> ${patientInfo.contact || ""}</div>
            <div><strong>Address:</strong> ${patientInfo.address || ""}</div>
            <div><strong>Referred By:</strong> ${patientInfo.referredBy || ""}</div>
          </div>
        </div>
        ${templateFields
          .map(
            (field) => `
            <div class="section">
              <div class="section-header">${field.label || field.name}</div>
              <div class="section-content">
                <div class="field-value">${formData[field.id] || ""}</div>
              </div>
            </div>
          `
          )
          .join("")}
        ${
          handwrittenNotes
            ? `
            <div class="section">
              <div class="section-header">Additional Notes</div>
              <div class="section-content">
                <div class="field-value">${handwrittenNotes}</div>
              </div>
            </div>
          `
            : ""
        }
        <div class="footer">
          <p>Signature: ___________</p>
        </div>
      </body>
      </html>
    `;
    return printContent;
  };

  const handlePrint = () => {
    const printContent = generatePrintTemplate();
    const printWindow = window.open("", "_blank");
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  const handleDownload = () => {
    const printContent = generatePrintTemplate();
    const blob = new Blob([printContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${template.title.replace(/\s+/g, "_")}_${
      patientInfo.name || "Patient"
    }_${new Date().toISOString().split("T")[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-accent flex items-center justify-center font-sans">
        <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-gray-600">Loading assessment form...</p>
        </div>
      </div>
    );
  }

  if (error && practiceTypes.length === 0) {
    return (
      <div className="min-h-screen bg-accent flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center max-w-md">
          <AlertCircle className="w-8 h-8 text-red-500 mb-4" />
          <p className="text-red-600 text-center mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              loadPracticeTypes();
            }}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-accent"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans text-primary">
      <ToastContainer position="top-right" autoClose={2000} />
      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0" />
            <div>
              <p className="text-yellow-800">{error}</p>
              <p className="text-yellow-600 text-sm mt-1">
                The form is using fallback data to continue working.
              </p>
            </div>
          </div>
        )}
        {/* Header Section */}
        <div
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
          style={{
            backgroundColor: "#01D48C",
            color: "white",
            textAlign: "left",
            borderRadius: layoutStyles[prescriptionTemplates[selectedTemplate].layout]?.header.borderRadius || "12px",
            borderLeft: layoutStyles[prescriptionTemplates[selectedTemplate].layout]?.header.borderLeft || "none",
            border: layoutStyles[prescriptionTemplates[selectedTemplate].layout]?.header.border || "none",
            borderBottom: layoutStyles[prescriptionTemplates[selectedTemplate].layout]?.header.borderBottom || "none",
          }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center mb-4 lg:mb-0">
              <div className="p-3 rounded-lg mr-4">
                <IconComponent className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="h3-heading" style={{ fontSize: 28, fontWeight: 700 }}>
                  {template.title}
                </h1>
                <p className="paragraph">
                  {template.category} Department - Comprehensive medical evaluation form
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowTemplateModal(true)}
                className="btn btn-primary flex items-center gap-2 px-3 py-2"
                type="button"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden md:inline">Templates</span>
              </button>
              <button
                onClick={() => setShowTemplateUpload(!showTemplateUpload)}
                className="btn btn-primary flex items-center gap-2 px-3 py-2"
                type="button"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden md:inline">Upload Template</span>
              </button>
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Medical System & Specialty Selection */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
            <h4 className="h3-heading mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2" style={{ color: selectedColor }} />
              Select Medical System & Specialty
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medical System
                </label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent font-semibold"
                  value={selectedPracticeType}
                  onChange={(e) => handlePracticeTypeChange(e.target.value)}
                >
                  <option value="">Select Medical System</option>
                  {practiceTypes.map((pt) => (
                    <option key={pt.id} value={pt.id.toString()}>
                      {pt.name || pt.practiceName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialty
                </label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent font-semibold"
                  value={selectedSpecialty}
                  onChange={(e) => handleSpecialtyChange(e.target.value)}
                  disabled={!selectedPracticeType || specializations.length === 0}
                >
                  <option value="">Select Specialty</option>
                  {specializations.map((spec) => (
                    <option key={spec.id} value={spec.id.toString()}>
                      {spec.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {selectedPracticeType && selectedSpecialty && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: selectedColor }}></div>
                  <span className="font-medium">Selected:</span>
                  <span className="ml-2">
                    {template.category} → {template.title}
                  </span>
                  <span className="ml-4 text-xs bg-gray-200 px-2 py-1 rounded">
                    {templateFields.length} fields
                  </span>
                </div>
              </div>
            )}
          </div>
          {/* Template Upload Section */}
          {showTemplateUpload && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <FileText className="w-6 h-6 text-blue-500 mr-3" />
                  <h4 className="text-lg font-semibold text-gray-900">Upload Medical Templates</h4>
                </div>
                <button
                  onClick={() => setShowTemplateUpload(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {/* Template Type Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Template Type
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {templateTypes.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setSelectedTemplateType(type.id)}
                      className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                        selectedTemplateType === type.id
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div
                        className="w-4 h-4 rounded-full mx-auto mb-2"
                        style={{ backgroundColor: type.color }}
                      ></div>
                      {type.name}
                    </button>
                  ))}
                </div>
              </div>
              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-6">
                <input
                  ref={templateFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleTemplateUpload}
                  className="hidden"
                />
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <button
                  type="button"
                  onClick={() => templateFileInputRef.current?.click()}
                  disabled={templateUploadLoading}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center mx-auto"
                >
                  {templateUploadLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload {templateTypes.find(t => t.id === selectedTemplateType)?.name} Template
                    </>
                  )}
                </button>
                <p className="text-sm text-gray-500 mt-3">
                  Upload {templateTypes.find(t => t.id === selectedTemplateType)?.name.toLowerCase()} templates for future use
                </p>
              </div>
              {/* Uploaded Templates Display */}
              {uploadedTemplates.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="text-lg font-semibold text-gray-900">
                      {templateTypes.find(t => t.id === selectedTemplateType)?.name} Templates ({uploadedTemplates.length})
                    </h5>
                    <div
                      className="px-3 py-1 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: templateTypes.find(t => t.id === selectedTemplateType)?.color }}
                    >
                      {selectedTemplateType}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {uploadedTemplates.map((template) => (
                      <div key={template.id} className="border rounded-lg p-3 bg-gray-50 hover:shadow-md transition-shadow">
                        <div className="w-full h-32 bg-gray-200 rounded-lg mb-3 overflow-hidden">
                          <img
                            src={template.originalFile || `data:image/jpeg;base64,${template.image}`}
                            alt="Template"
                            className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => navigateToAnnotation(template)}
                          />
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p className="font-medium truncate">{template.fileName}</p>
                          <p className="text-xs">
                            Uploaded: {new Date(template.uploadedAt).toLocaleDateString()}
                          </p>
                          <p className="text-xs">
                            Doctor: {template.doctorName}
                          </p>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <button
                            type="button"
                            onClick={() => navigateToAnnotation(template)}
                            className="flex-1 px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-xs font-medium"
                          >
                            View/Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteTemplate(template.id)}
                            className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-xs"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {/* Patient Information Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-6">
              <User className="w-6 h-6 mr-3" style={{ color: selectedColor }} />
              <h4 className="text-lg font-semibold text-gray-900">Patient Information</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient ID
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                  value={patientInfo.patientId}
                  onChange={(e) => handlePatientInfoChange("patientId", e.target.value)}
                  placeholder="Enter patient ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                  value={patientInfo.name}
                  onChange={(e) => handlePatientInfoChange("name", e.target.value)}
                  placeholder="Enter patient name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age
                </label>
                <input
                  type="number"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                  value={patientInfo.age}
                  onChange={(e) => handlePatientInfoChange("age", e.target.value)}
                  placeholder="Age"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                  value={patientInfo.gender}
                  onChange={(e) => handlePatientInfoChange("gender", e.target.value)}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact
                </label>
                <input
                  type="tel"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                  value={patientInfo.contact}
                  onChange={(e) => handlePatientInfoChange("contact", e.target.value)}
                  placeholder="Phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Consulting Doctor
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                  value={patientInfo.consultingDoctor}
                  onChange={(e) => handlePatientInfoChange("consultingDoctor", e.target.value)}
                  placeholder="Doctor name"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                  value={patientInfo.address}
                  onChange={(e) => handlePatientInfoChange("address", e.target.value)}
                  placeholder="Complete address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Referred By
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                  value={patientInfo.referredBy}
                  onChange={(e) => handlePatientInfoChange("referredBy", e.target.value)}
                  placeholder="Referring doctor/clinic"
                />
              </div>
            </div>
          </div>
          {/* Template Fields Section */}
          {templateFields.length > 0 ? (
            templateFields.map((field, index) => (
              <div key={field.id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-accent-100 text-primary rounded-lg flex items-center justify-center font-semibold text-sm mr-3">
                    {index + 1}
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    {field.label || field.name}
                  </h4>
                  {field.required && (
                    <span className="ml-2 text-red-500 text-sm">*Required</span>
                  )}
                </div>
                {(() => {
                  switch (field.type) {
                    case "textarea":
                      return (
                        <textarea
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent min-h-32 resize-vertical"
                          value={formData[field.id] || ""}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                          placeholder={field.placeholder || field.label}
                        />
                      );
                    case "select":
                      return (
                        <select
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                          value={formData[field.id] || ""}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                        >
                          <option value="">Select {field.label}</option>
                          {field.options?.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      );
                    default:
                      return (
                        <input
                          type={field.type || "text"}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                          value={formData[field.id] || ""}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                          placeholder={field.placeholder || field.label}
                        />
                      );
                  }
                })()}
              </div>
            ))
          ) : selectedSpecialty ? (
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                No template fields configured for this specialty
              </p>
            </div>
          ) : null}
          {/* Additional Notes Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <PenTool className="w-6 h-6 text-purple-500 mr-3" />
              <h4 className="text-lg font-semibold text-gray-900">
                Additional Notes
              </h4>
            </div>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent font-mono min-h-32 resize-vertical"
              placeholder="Enter any additional observations, notes, or recommendations..."
              value={handwrittenNotes}
              onChange={(e) => setHandwrittenNotes(e.target.value)}
            />
          </div>
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              type="submit"
              className="flex items-center px-6 py-3 text-white rounded-lg font-semibold transition-all transform hover:scale-105"
              style={{ backgroundColor: selectedColor }}
            >
              <Save className="w-5 h-5 mr-2" />
              Save Assessment
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              <Print className="w-5 h-5 mr-2" />
              Print Report
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
            >
              <Download className="w-5 h-5 mr-2" />
              Download
            </button>
          </div>
        </form>
        {showTemplateModal && (
          <TemplateModal
            isOpen={showTemplateModal}
            onClose={() => setShowTemplateModal(false)}
            onSelectTemplate={handleTemplateSelect}
            selectedTemplate={selectedTemplate}
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
          />
        )}
      </div>
    </div>
  );
};

export default InitialAssessment;