import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Download,
  Trash2,
  Type,
  Square,
  Circle,
  ArrowRight,
  Undo,
  Redo,
  Move,
  Loader2,
  Pencil,
  Eraser,
  Printer,
  Image as ImageIcon,
  ChevronDown,
  Edit,
  X,
  Check,
  Building,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-toastify";
import axiosInstance from "../../utils/axiosInstance";
import { useSelector } from "react-redux";
import { usePatientContext } from "../../context-api/PatientContext";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import TemplateModal from "../templates/TemplateModal";

const ImageAnnotation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const printRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState("pen");
  const [currentColor, setCurrentColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(2);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [lastX, setLastX] = useState(0);
  const [lastY, setLastY] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedTemplateType, setSelectedTemplateType] = useState("1");
  const [availableTemplates, setAvailableTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [editableFields, setEditableFields] = useState({});
  const [hospitalFields, setHospitalFields] = useState({});
  const [editingField, setEditingField] = useState(null);
  const [editingHospitalField, setEditingHospitalField] = useState(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [printData, setPrintData] = useState(null);
  const [templatePrintId, setTemplatePrintId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState("medical"); // "medical" or "hospital"
  const [previewAnnotatedImage, setPreviewAnnotatedImage] = useState(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#2563eb");
  const livePreviewRef = useRef(null);
  const overlayContainerRef = useRef(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [overlayBoxes, setOverlayBoxes] = useState(() => ({
    hospitalName: { left: 20, top: 3, width: 60, height: 5 },
    hospitalSubtitle: { left: 20, top: 8, width: 60, height: 4 },
    doctorFullName: { left: 6, top: 14, width: 35, height: 4 },
    doctorDepartment: { left: 6, top: 20, width: 35, height: 4 },
    patientName: { left: 58, top: 14, width: 36, height: 4 },
    age: { left: 58, top: 20, width: 12, height: 4 },
    gender: { left: 72, top: 20, width: 12, height: 4 },
    contact: { left: 82, top: 14, width: 18, height: 4 },
    address: { left: 6, top: 26, width: 88, height: 5 },
    chiefComplaint: { left: 6, top: 34, width: 88, height: 8 },
    historyOfPresentIllness: { left: 6, top: 44, width: 88, height: 14 },
    physicalExamination: { left: 6, top: 60, width: 88, height: 8 },
    treatmentPlan: { left: 6, top: 70, width: 88, height: 10 },
  }));
  const draggingRef = useRef({
    field: null,
    mode: null,
    startX: 0,
    startY: 0,
    startBox: null,
  });

  // useEffect(() => {
  //   const handleResize = () => {
  //     console.log("CURRENT SIZE",window.innerWidth)
  //     setShowSidebar(window.innerWidth >= 768);
  //   };

  //   handleResize();
  //   window.addEventListener('resize', handleResize);

  //   return () => {
  //     window.removeEventListener('resize', handleResize);
  //   };
  // }, [showSidebar]);

  useEffect(() => {
    const onMouseMove = (e) => {
      const drag = draggingRef.current;
      if (!drag.field) return;
      const container = overlayContainerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const dx = ((e.clientX - drag.startX) / rect.width) * 100;
      const dy = ((e.clientY - drag.startY) / rect.height) * 100;
      setOverlayBoxes((prev) => {
        const box = prev[drag.field];
        if (!box) return prev;
        const updated = { ...prev };
        if (drag.mode === "move") {
          updated[drag.field] = {
            ...box,
            left: Math.max(
              0,
              Math.min(100 - box.width, drag.startBox.left + dx)
            ),
            top: Math.max(
              0,
              Math.min(100 - box.height, drag.startBox.top + dy)
            ),
          };
        } else if (drag.mode === "resize") {
          updated[drag.field] = {
            ...box,
            width: Math.max(
              5,
              Math.min(100 - box.left, drag.startBox.width + dx)
            ),
            height: Math.max(
              3,
              Math.min(100 - box.top, drag.startBox.height + dy)
            ),
          };
        }
        return updated;
      });
    };
    const onMouseUp = () => {
      draggingRef.current.field = null;
      draggingRef.current.mode = null;
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  const startMove = (field, e) => {
    e.stopPropagation();
    const container = overlayContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    draggingRef.current = {
      field,
      mode: "move",
      startX: e.clientX,
      startY: e.clientY,
      startBox: { ...overlayBoxes[field] },
    };
  };
  const startResize = (field, e) => {
    e.stopPropagation();
    const container = overlayContainerRef.current;
    if (!container) return;
    draggingRef.current = {
      field,
      mode: "resize",
      startX: e.clientX,
      startY: e.clientY,
      startBox: { ...overlayBoxes[field] },
    };
  };

  const { activeTab: contextActiveTab, setActiveTab: setContextActiveTab } =
    usePatientContext();
  const [activeTab, setActiveTab] = useState(contextActiveTab || "OPD");

  const { initialImage, patient } = location.state || {};
  const user = useSelector((state) => state.auth?.user);

  // Initialize hospital fields with default values
  useEffect(() => {
    console.log("User data for hospital fields:", user);
    if (user) {
      setHospitalFields({
        hospitalName: "AV MEDICAL CENTER",
        hospitalSubtitle: "Multi-Speciality Hospital",
        hospitalAddressLine1: "123 Health Street, Medical Complex",
        hospitalAddressLine2: "Mumbai - 400001, Maharashtra",
        hospitalPhone: "022-12345678",
        hospitalEmail: "info@citymedical.com",
        doctorFullName: user.name || "Dr. Haris Patel",
        doctorDepartment: "Cardiology",
        doctorLicense: "MMC-12345",
        doctorContact: user.contact || "9876543210",
        doctorQualifications: "MD, DM Cardiology",
      });
    }
  }, [user]);

  useEffect(() => {
    if (location.state?.templateType) {
      setSelectedTemplateType(location.state.templateType);
    }
    if (user?.doctorId) {
      loadAvailableTemplates();
    }
  }, [location.state, user?.doctorId]);

  useEffect(() => {
    if (user?.doctorId) {
      loadAvailableTemplates();
    }
  }, [selectedTemplateType, user?.doctorId]);

  useEffect(() => {
    if (initialImage) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = () => {
        const originalWidth = img.width;
        const originalHeight = img.height;
        const newWidth = originalWidth * 1.2; // Increase width by 20%
        const newHeight = originalHeight; // Keep same height or adjust proportionally

        canvas.width = newWidth;
        canvas.height = newHeight;
        // Clear and draw the image with increased width
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Option 1: Stretch the image horizontally
        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        // Option 2: Or if you want to maintain aspect ratio but show wider area
        // ctx.drawImage(img, 0, 0, originalWidth, originalHeight, 0, 0, newWidth, newHeight);

        saveToHistory();
        cleanup();
      };
      img.src = initialImage;
    }
  }, [initialImage]);
  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle Ctrl+P to show print preview instead of system print
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "p") {
        e.preventDefault();
        handlePrintPreview();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editableFields]);

  const [templateTypes, setTemplatesTypes] = useState();

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get("/template-types");
      setTemplatesTypes(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to fetch categories!");
    }
  };

  const loadAvailableTemplates = async () => {
    try {
      setTemplateLoading(true);
      if (!user?.doctorId) {
        toast.error("User not authenticated");
        setAvailableTemplates([]);
        return;
      }
      let url = `/uploaded-templates/doctor/${user.doctorId}/type/${selectedTemplateType}`;
      const response = await axiosInstance.get(url);
      const templates = response.data?.data || response.data || [];
      setAvailableTemplates(templates.filter((t) => t.isActive));
      // setAvailableTemplates(templates);

      if (
        selectedTemplate &&
        !templates.find((t) => t.id === selectedTemplate.id && t.isActive)
      ) {
        setSelectedTemplate(null);
      }
    } catch (err) {
      console.error("Failed to load templates from API:", err);
      toast.error("Failed to load templates");
      setAvailableTemplates([]);
    } finally {
      setTemplateLoading(false);
    }
  };

  const handleTemplateTypeChange = (templateType) => {
    setSelectedTemplateType(templateType);
    setSelectedTemplate(null);
    setEditableFields({});
    setTemplatePrintId(null);
  };
  const handleTemplateSelect = async (template) => {
    console.log("Selected template type:", template);
    try {
      console.log("Selected template:", template);

      // Check if it's a predefined template (templateTypeId === 6)
      if (template?.templateTypeId === 6) {
        // Handle predefined template
        await handlePredefinedTemplate(template);
      } else {
        // Handle uploaded template
        await handleUploadedTemplate(template);
      }

      setShowTemplateModal(false);
    } catch (err) {
      console.error("Error in handleTemplateSelect:", err);
      toast.error("Unable to load template");
    }
  };

  // Function to generate predefined template layout on canvas
  const generatePredefinedTemplateLayout = async (template, ctx, canvas) => {
    console.log("Selected template:", template.bgColor);
    try {
      setTemplateLoading(true);

      // Set canvas dimensions (A4 size at 96 DPI)
      canvas.width = 794; // A4 width in pixels
      canvas.height = 1123; // A4 height in pixels

      // Clear canvas
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Get template configuration
      const sections = template.sections;
      const userData = hospitalFields;

      // Set font styles
      ctx.fillStyle = "#000000";
      ctx.textAlign = "left";

      let currentY = 40;
      const margin = 60;
      const contentWidth = canvas.width - margin * 2;

      // Draw Header
      if (sections.header) {
        // Header background with template color
        ctx.fillStyle = template.bgColor || "#F8FAFC";
        ctx.fillRect(0, 0, canvas.width, 120);

        // Hospital name
        ctx.fillStyle = "#1F2937";
        ctx.font = "bold 24px Arial";
        ctx.textAlign = "center";
        ctx.fillText(
          userData.hospitalName || "AV MEDICAL CENTER",
          canvas.width / 2,
          40
        );

        // Hospital subtitle
        ctx.font = "14px Arial";
        ctx.fillStyle = "#6B7280";
        ctx.fillText(
          userData.hospitalSubtitle || "Multi-Speciality Hospital",
          canvas.width / 2,
          65
        );

        // Hospital address
        ctx.font = "12px Arial";
        ctx.fillText(
          `${userData.hospitalAddressLine1 || "123 Health Street"}, ${
            userData.hospitalCity || "Mumbai"
          }`,
          canvas.width / 2,
          85
        );
        ctx.fillText(
          `${userData.hospitalPhone || "+91-22-12345678"} | ${
            userData.hospitalEmail || "info@avmedical.com"
          }`,
          canvas.width / 2,
          105
        );

        currentY = 140;
      }

      // Draw Patient Information Section
      if (sections.patientInfo && sections.patientInfo.show) {
        ctx.textAlign = "left";
        ctx.fillStyle = "#1F2937";
        ctx.font = "bold 16px Arial";
        ctx.fillText("PATIENT INFORMATION", margin, currentY);

        currentY += 25;
        ctx.font = "14px Arial";
        ctx.fillStyle = "#374151";

        const patientInfo = [
          `Name: ${
            editableFields.patientName ||
            patient.fullName ||
            "________________________"
          }`,
          `Age: ${patient.age || "___"} | Gender: ${
            patient.gender || "___"
          } | Contact: ${
            editableFields.contact ||
            patient.contact ||
            "________________________"
          }`,
          `Address: ${
            editableFields.address ||
            patient.address ||
            "_______________________________________________________________"
          }`,
        ];

        patientInfo.forEach((info) => {
          ctx.fillText(info, margin, currentY);
          currentY += 20;
        });

        currentY += 15;
      }

      // Draw Medical Sections
      if (sections.medicalSections) {
        Object.entries(sections.medicalSections).forEach(
          ([sectionKey, sectionConfig]) => {
            if (sectionConfig.enabled) {
              // Section title
              ctx.fillStyle = "#1F2937";
              ctx.font = "bold 14px Arial";
              ctx.fillText(
                sectionConfig.title.toUpperCase(),
                margin,
                currentY + 10
              );
              currentY += 20;

              // Content area for this section
              ctx.strokeStyle = "#D1D5DB";
              ctx.strokeRect(margin, currentY, contentWidth, 80);

              // Add placeholder text or actual content
              ctx.fillStyle = "#6B7280";
              ctx.font = "12px Arial";
              let content = "";

              switch (sectionKey) {
                case "chiefComplaint":
                case "complaint":
                  content =
                    editableFields.chiefComplaint ||
                    "Patient complaints and symptoms...";
                  break;
                case "historyOfPresentIllness":
                case "assessment":
                  content =
                    editableFields.historyOfPresentIllness ||
                    "History of present illness...";
                  break;
                case "physicalExamination":
                case "examination":
                  content =
                    editableFields.physicalExamination ||
                    "Physical examination findings...";
                  break;
                case "diagnosis":
                  content =
                    editableFields.provisionalDiagnosis || "Diagnosis...";
                  break;
                case "treatmentPlan":
                case "plan":
                  content = editableFields.treatmentPlan || "Treatment plan...";
                  break;
                default:
                  content = "Enter details here...";
              }

              // Wrap text if needed
              const words = content.split(" ");
              let line = "";
              const lineHeight = 18;
              let startY = currentY + 15;

              for (let n = 0; n < words.length; n++) {
                const testLine = line + words[n] + " ";
                const metrics = ctx.measureText(testLine);
                const testWidth = metrics.width;

                if (testWidth > contentWidth - 20 && n > 0) {
                  ctx.fillText(line, margin + 10, startY);
                  line = words[n] + " ";
                  startY += lineHeight;
                } else {
                  line = testLine;
                }
              }
              ctx.fillText(line, margin + 10, startY);

              currentY += 90;
            }
          }
        );
      }

      // Draw Footer
      if (sections.footer && sections.footer.show) {
        currentY += 20;

        // Doctor signature line
        ctx.strokeStyle = "#374151";
        ctx.beginPath();
        ctx.moveTo(margin, currentY);
        ctx.lineTo(margin + 200, currentY);
        ctx.stroke();

        ctx.fillStyle = "#6B7280";
        ctx.font = "12px Arial";
        ctx.fillText("Doctor Signature", margin, currentY + 20);

        // Date
        const visitDate =
          editableFields.visitDate || new Date().toLocaleDateString();
        ctx.fillText(
          `Date: ${visitDate}`,
          canvas.width - margin - 150,
          currentY
        );

        // Doctor info
        ctx.fillText(
          userData.doctorFullName || user?.name || "Dr. ___________________",
          margin,
          currentY + 40
        );
        ctx.fillText(
          userData.doctorDepartment || "Department",
          margin,
          currentY + 55
        );
      }

      saveToHistory();
      setTemplateLoading(false);
    } catch (error) {
      console.error("Error generating template layout:", error);
      toast.error("Failed to generate template layout");
      setTemplateLoading(false);
      throw error;
    }
  };

  const handlePredefinedTemplate = async (template) => {
    try {
      let url = `/template-prints/patient/${patient.patientId}/template-type/${
        template.templateTypeId
      }?context=${activeTab == "VIRTUAL" ? "OPD" : "OPD"}`;
      console.log("Selected url :", JSON.stringify(url));
      const response = await axiosInstance.get(url);

      setSelectedTemplate(template);
      setSelectedTemplateType("6"); // Set to predefined template type

      // Extract and initialize editable fields from template data
      const templateData = response.data;
      // console.log("Selected Predefined templateData :", JSON.stringify(templateData));
      if (templateData) {
        // Set the template print ID for PUT request
        setTemplatePrintId(templateData.id || null);

        const fields = {
          patientName: templateData.fullName || patient.fullName || "",
          contact: templateData.contact || patient.contact || "",
          address: templateData.address || patient.address || "",
          doctorName: templateData.doctorName || user?.name || "",
          consultingDoctor: templateData.consultingDoctor || "",
          chiefComplaint: templateData.chiefComplaint || "",
          historyOfPresentIllness: templateData.historyOfPresentIllness || "",
          physicalExamination: templateData.physicalExamination || "",
          provisionalDiagnosis: templateData.provisionalDiagnosis || "",
          treatmentPlan: templateData.treatmentPlan || "",
          additionalNotes: templateData.additionalNotes || "",
          referredBy: templateData.referredBy || "",
          visitDate: templateData.visitDate
            ? new Date(templateData.visitDate).toLocaleDateString()
            : new Date().toLocaleDateString(),
          context: templateData.context || activeTab,
        };
        setEditableFields(fields);

        // Set hospital fields if available from backend
        setHospitalFields((prev) => ({
          ...prev,
          hospitalName: templateData.hospitalName || prev.hospitalName,
          hospitalSubtitle:
            templateData.hospitalSubtitle || prev.hospitalSubtitle,
          hospitalAddressLine1:
            templateData.hospitalAddressLine1 || prev.hospitalAddressLine1,
          hospitalAddressLine2:
            templateData.hospitalAddressLine2 || prev.hospitalAddressLine2,
          hospitalCity: templateData.hospitalCity || prev.hospitalCity,
          hospitalPincode: templateData.hospitalPincode || prev.hospitalPincode,
          hospitalPhone: templateData.hospitalPhone || prev.hospitalPhone,
          hospitalEmail: templateData.hospitalEmail || prev.hospitalEmail,
          doctorFullName: templateData.doctorFullName || prev.doctorFullName,
          doctorDepartment:
            templateData.doctorDepartment || prev.doctorDepartment,
          doctorLicense: templateData.doctorLicense || prev.doctorLicense,
          doctorContact: templateData.doctorContact || prev.doctorContact,
          doctorQualifications:
            templateData.doctorQualifications || prev.doctorQualifications,
        }));
      }

      // Generate predefined template layout instead of loading image
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      await generatePredefinedTemplateLayout(template, ctx, canvas);
    } catch (err) {
      console.error("Error loading predefined template:", err);
      toast.error("Unable to load predefined template");
      throw err;
    }
  };
  const handleUploadedTemplate = async (template) => {
    console.log("Uploaded template:", template);
    try {
      let url = `/template-prints/patient/${
        patient.patientId
      }/template-type/${selectedTemplateType}?context=${
        activeTab === "VIRTUAL" ? "OPD" : "OPD"
      }`;
      console.log("Selected url:", url);
      const response = await axiosInstance.get(url);

      setSelectedTemplate(template);
      setShowTemplateDropdown(false);

      // Extract and initialize editable fields from template data
      const templateData = response.data;
      if (templateData) {
        // Set the template print ID for PUT request
        setTemplatePrintId(templateData.id || null);

        const fields = {
          patientName: templateData.fullName || patient.fullName || "",
          contact: templateData.contact || patient.contact || "",
          address: templateData.address || patient.address || "",
          doctorName: templateData.doctorName || user?.name || "",
          consultingDoctor: templateData.consultingDoctor || "",
          chiefComplaint: templateData.chiefComplaint || "",
          historyOfPresentIllness: templateData.historyOfPresentIllness || "",
          physicalExamination: templateData.physicalExamination || "",
          provisionalDiagnosis: templateData.provisionalDiagnosis || "",
          treatmentPlan: templateData.treatmentPlan || "",
          additionalNotes: templateData.additionalNotes || "",
          referredBy: templateData.referredBy || "",
          visitDate: templateData.visitDate
            ? new Date(templateData.visitDate).toLocaleDateString()
            : new Date().toLocaleDateString(),
          context: templateData.context || activeTab,
        };
        setEditableFields(fields);

        // Set hospital fields if available from backend
        setHospitalFields((prev) => ({
          ...prev,
          hospitalName: templateData.hospitalName || prev.hospitalName,
          hospitalSubtitle:
            templateData.hospitalSubtitle || prev.hospitalSubtitle,
          hospitalAddressLine1:
            templateData.hospitalAddressLine1 || prev.hospitalAddressLine1,
          hospitalAddressLine2:
            templateData.hospitalAddressLine2 || prev.hospitalAddressLine2,
          hospitalCity: templateData.hospitalCity || prev.hospitalCity,
          hospitalPincode: templateData.hospitalPincode || prev.hospitalPincode,
          hospitalPhone: templateData.hospitalPhone || prev.hospitalPhone,
          hospitalEmail: templateData.hospitalEmail || prev.hospitalEmail,
          doctorFullName: templateData.doctorFullName || prev.doctorFullName,
          doctorDepartment:
            templateData.doctorDepartment || prev.doctorDepartment,
          doctorLicense: templateData.doctorLicense || prev.doctorLicense,
          doctorContact: templateData.doctorContact || prev.doctorContact,
          doctorQualifications:
            templateData.doctorQualifications || prev.doctorQualifications,
        }));
      }

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.crossOrigin = "Anonymous";

      let objectUrl;
      const cleanup = () => {
        if (objectUrl) {
          try {
            URL.revokeObjectURL(objectUrl);
          } catch (e) {}
          objectUrl = undefined;
        }
        setTemplateLoading(false);
      };

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        saveToHistory();
        cleanup();
      };

      img.onerror = (err) => {
        console.error("Failed to load template image", err);
        toast.error("Failed to load template image");
        cleanup();
      };

      const filePath =
        template.fileUrl ||
        template.file_path ||
        template.path ||
        template.fileUrlPath ||
        template.fileUrl;
      const fileType = template.fileType || template.mimetype || template.type;


      const normalizedPath =
        filePath && typeof filePath === "string"
          ? filePath.replace(/^\/+/, "")
          : filePath;

      if (
        normalizedPath &&
        fileType &&
        typeof fileType === "string" &&
        fileType.startsWith("image")
      ) {
        setTemplateLoading(true);
        const resp = await axiosInstance.get(
          `/uploaded-templates/photo?path=${encodeURIComponent(
            normalizedPath
          )}`,
          {
            responseType: "blob",
          }
        );
        const blob = resp.data;
        objectUrl = URL.createObjectURL(blob);
        img.src = objectUrl;
        return;
      }

      const imageSource =
        template.originalFile ||
        template.files ||
        template.image ||
        `data:image/jpeg;base64,${template.base64}`;
      if (typeof imageSource === "string") {
        if (imageSource.startsWith("data:")) {
          img.src = imageSource;
          console.log("Image source is data URL", imageSource);
        } else if (imageSource.startsWith("/")) {
          setTemplateLoading(true);
          const cleaned = imageSource.replace(/^\/+/, "");
          const resp2 = await axiosInstance.get(
            `/uploaded-templates/photo?path=${encodeURIComponent(cleaned)}`,
            { responseType: "blob" }
          );
          const blob2 = resp2.data;
          objectUrl = URL.createObjectURL(blob2);
          img.src = objectUrl;
        } else {
          img.src = `data:image/jpeg;base64,${imageSource}`;
        }
      } else {
        throw new Error("Unsupported template image source");
      }
    } catch (err) {
      console.error("Error loading template image:", err);
      toast.error("Unable to load template image");
      throw err;
    }
  };

  const handleFieldEdit = (fieldName, section = "medical") => {
    if (section === "medical") {
      setEditingField(fieldName);
    } else {
      setEditingHospitalField(fieldName);
    }
  };

  const handleFieldSave = (fieldName, value, section = "medical") => {
    if (section === "medical") {
      setEditableFieldsWithHistory((prev) => ({
        ...prev,
        [fieldName]: value,
      }));
      setEditingField(null);
    } else {
      setHospitalFieldsWithHistory((prev) => ({
        ...prev,
        [fieldName]: value,
      }));
      setEditingHospitalField(null);
    }

    // Save to history after a small delay to batch rapid changes
    setTimeout(() => {
      saveToHistory({
        editableFields: { ...editableFields, [fieldName]: value },
        hospitalFields: { ...hospitalFields },
      });
    }, 100);

    toast.success(
      `${fieldName
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase())} updated successfully`
    );
  };

  const handleFieldCancel = (section = "medical") => {
    if (section === "medical") {
      setEditingField(null);
    } else {
      setEditingHospitalField(null);
    }
  };

  const handleSaveAnnotations = async () => {
    try {
      setSaving(true);
      const canvas = canvasRef.current;

      // Create composite canvas with overlays rendered on top
      const compositeCanvas = document.createElement("canvas");
      compositeCanvas.width = canvas.width;
      compositeCanvas.height = canvas.height;
      const compositeCtx = compositeCanvas.getContext("2d");

      // Draw the annotated canvas
      const img = new Image();
      img.onload = async () => {
        compositeCtx.drawImage(img, 0, 0);

        // Render overlay text on top
        compositeCtx.font = "14px Arial";
        compositeCtx.fillStyle = "#000000";

        const overlayContainer = overlayContainerRef.current;
        const containerRect = overlayContainer?.getBoundingClientRect();

        // Skip overlay drawing for predefined templates
        if (selectedTemplateType !== "6") {
          Object.keys(overlayBoxes).forEach((key) => {
            const box = overlayBoxes[key];
            const value = editableFields[key] || hospitalFields[key] || "";

            if (value) {
              const x = (box.left / 100) * canvas.width;
              const y = (box.top / 100) * canvas.height;

              compositeCtx.fillText(value, x + 5, y + 15);
            }
          });
        }

        const annotatedImageData = compositeCanvas.toDataURL();

        // Prepare payload for PUT request with all fields
        const payload = {
          id: templatePrintId || 0,
          patientId: patient.patientId,
          templateTypeId: parseInt(selectedTemplateType),
          context: editableFields.context || activeTab,
          referredBy: editableFields.referredBy || "",
          chiefComplaint: editableFields.chiefComplaint || "",
          historyOfPresentIllness: editableFields.historyOfPresentIllness || "",
          physicalExamination: editableFields.physicalExamination || "",
          provisionalDiagnosis: editableFields.provisionalDiagnosis || "",
          treatmentPlan: editableFields.treatmentPlan || "",
          additionalNotes: editableFields.additionalNotes || "",
          templateContent: annotatedImageData,

          // Hospital and Doctor fields
          hospitalName: hospitalFields.hospitalName,
          hospitalSubtitle: hospitalFields.hospitalSubtitle,
          hospitalAddressLine1: hospitalFields.hospitalAddressLine1,
          hospitalAddressLine2: hospitalFields.hospitalAddressLine2,
          hospitalCity: hospitalFields.hospitalCity,
          hospitalPincode: hospitalFields.hospitalPincode,
          hospitalPhone: hospitalFields.hospitalPhone,
          hospitalEmail: hospitalFields.hospitalEmail,
          doctorFullName: hospitalFields.doctorFullName,
          doctorDepartment: hospitalFields.doctorDepartment,
          doctorLicense: hospitalFields.doctorLicense,
          doctorContact: hospitalFields.doctorContact,
          doctorQualifications: hospitalFields.doctorQualifications,
        };

        console.log("Saving payload:", payload);

        // Make PUT request to update template print
        let url = `/template-prints/${templatePrintId || ""}`;
        if (!templatePrintId) {
          // If no templatePrintId, create a new one using POST
          url = `/template-prints`;
          delete payload.id; // Remove id for POST request
        }
        console.log("Saving to URL:", url);
        const response = templatePrintId
          ? await axiosInstance.put(url, payload)
          : await axiosInstance.post(url, payload);

        if (response.data) {
          toast.success("Template saved successfully!");

          // Update the template print ID if it was created
          const savedData = response.data.id
            ? response.data
            : response.data.data;
          if (savedData?.id) {
            setTemplatePrintId(savedData.id);
          }

          // Prepare print data for preview with composite image
          const printData = {
            annotatedImage: annotatedImageData,
            formData: editableFields,
            hospitalData: hospitalFields,
            patient: patient,
            template: selectedTemplate,
            timestamp: new Date().toISOString(),
            savedData: savedData,
          };

          setPrintData(printData);
          setShowPrintPreview(true);

          // Also save to local storage for backup
          const annotatedImage = {
            id: Date.now(),
            originalImage: initialImage,
            annotatedImage: annotatedImageData,
            patient: patient,
            timestamp: new Date().toISOString(),
            templateType: selectedTemplateType,
            selectedTemplate: selectedTemplate,
            formData: editableFields,
            hospitalData: hospitalFields,
            templatePrintId: templatePrintId || savedData?.id,
          };

          const storedAnnotations = JSON.parse(
            localStorage.getItem("annotatedImages") || "[]"
          );
          storedAnnotations.push(annotatedImage);
          localStorage.setItem(
            "annotatedImages",
            JSON.stringify(storedAnnotations)
          );
        } else {
          throw new Error("Failed to save template");
        }
      };

      img.onerror = () => {
        toast.error("Failed to process image for saving");
        setSaving(false);
      };

      img.src = canvas.toDataURL();
    } catch (error) {
      console.error("Error saving annotations:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to save template"
      );
      setSaving(false);
    }
  };

  const handlePrintPreview = async () => {
    try {
      const canvas = canvasRef.current;
      if (
        !canvas ||
        !editableFields ||
        Object.keys(editableFields).length === 0
      ) {
        toast.error("Please fill in the form data before preview");
        return;
      }

      return new Promise((resolve, reject) => {
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext("2d");

        const img = new Image();
        img.crossOrigin = "Anonymous";

        img.onload = () => {
          tempCtx.drawImage(img, 0, 0);

          // tempCtx.font = "bold 20px Arial";
          tempCtx.font =
            selectedTemplateType === "6" ? "bold 0px Arial" : "bold 14px Arial";
          tempCtx.fillStyle = "#000000";

          Object.keys(overlayBoxes).forEach((key) => {
            const box = overlayBoxes[key];
            const value = editableFields[key] || hospitalFields[key] || "";

            if (value) {
              const x = (box.left / 100) * canvas.width;
              const y = (box.top / 100) * canvas.height;
              const w = (box.width / 100) * canvas.width;
              const h = (box.height / 100) * canvas.height;

              const words = value.split(" ");
              let line = "";
              let lineY = y + 20;
              const lineHeight = 24;
              const maxWidth = w - 10;

              words.forEach((word) => {
                const testLine = line + word + " ";
                const metrics = tempCtx.measureText(testLine);

                if (metrics.width > maxWidth && line) {
                  tempCtx.fillText(line, x + 5, lineY);
                  line = word + " ";
                  lineY += lineHeight;
                } else {
                  line = testLine;
                }
              });

              if (line) {
                tempCtx.fillText(line, x + 5, lineY);
              }
            }
          });

          const printData = {
            annotatedImage: tempCanvas.toDataURL(),
            formData: editableFields,
            hospitalData: hospitalFields,
            patient: patient,
            template: selectedTemplate,
            timestamp: new Date().toISOString(),
          };

          setPrintData(printData);
          setShowPrintPreview(true);
          resolve();
        };

        img.onerror = (error) => {
          console.error("Failed to load canvas image:", error);
          toast.error("Failed to prepare print preview");
          reject(error);
        };

        img.src = canvas.toDataURL();
      });
    } catch (error) {
      console.error("Error preparing print preview:", error);
      toast.error("Failed to prepare print preview");
    }
  };

  const handleDownloadPDF = async () => {
    if (!printRef.current) {
      toast.error("Print preview not available");
      return;
    }

    try {
      const element = printRef.current;

      const canvases = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        allowTaint: true,
        ignoreElements: (el) => {
          const cls = el.getAttribute("class") || "";
          return cls.includes("pointer-events");
        },
      });

      const imgData = canvases.toDataURL("image/png", 1.0);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // const pdf = new jsPDF({
      //   orientation: 'landscape', // Change to landscape for wider format
      //   unit: 'mm',
      //   format: 'a4' // Or use 'a3' for even wider format
      // });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 10;
      const imgHeight = (canvases.height * imgWidth) / canvases.width;

      let yPosition = 5;
      pdf.addImage(imgData, "PNG", 5, yPosition, imgWidth, imgHeight);

      let heightLeft = imgHeight - (pageHeight - 10);
      let position = pageHeight - 10;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 5, position + 5, imgWidth, imgHeight);
        heightLeft -= pageHeight - 10;
      }

      pdf.save(
        `medical-report-${patient?.patientId || "document"}-${
          new Date().toISOString().split("T")[0]
        }.pdf`
      );
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error(`Failed to download PDF: ${error.message}`);
    }
  };

  const handleDownloadImage = async () => {
    if (!printRef.current) {
      toast.error("Print preview not available");
      return;
    }

    try {
      const element = printRef.current;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        allowTaint: true,
        ignoreElements: (el) => {
          const cls = el.getAttribute("class") || "";
          return cls.includes("pointer-events");
        },
      });

      const link = document.createElement("a");
      link.download = `medical-report-${patient?.patientId || "document"}-${
        new Date().toISOString().split("T")[0]
      }.png`;
      link.href = canvas.toDataURL("image/png", 1.0);
      link.click();
      toast.success("Image downloaded successfully!");
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error(`Failed to download image: ${error.message}`);
    }
  };

  // Save current state to history
  const saveToHistory = (data = null) => {
    const currentState = data || {
      canvasState: canvasRef.current?.toDataURL() || "",
      editableFields: { ...editableFields },
      hospitalFields: { ...hospitalFields },
      selectedTemplate,
    };

    setHistory((prevHistory) => {
      const newHistory = prevHistory.slice(0, historyIndex + 1);
      newHistory.push(currentState);
      setHistoryIndex((prev) => prev + 1);
      return newHistory;
    });
  };

  // Update state with history support
  const updateStateWithHistory = (updater, stateName) => {
    if (typeof updater === "function") {
      if (stateName === "editableFields" || stateName === "hospitalFields") {
        setHistory((prevHistory) => {
          const newHistory = prevHistory.slice(0, historyIndex + 1);
          const currentState = {
            canvasState: canvasRef.current?.toDataURL() || "",
            editableFields: { ...editableFields },
            hospitalFields: { ...hospitalFields },
            selectedTemplate,
          };

          newHistory.push(currentState);
          setHistoryIndex((prev) => prev + 1);

          return newHistory;
        });
      }

      // Update the actual state
      if (stateName === "editableFields") setEditableFields(updater);
      else if (stateName === "hospitalFields") setHospitalFields(updater);
      else if (stateName === "selectedTemplate") setSelectedTemplate(updater);
    }
  };

  const undo = () => {
    if (historyIndex <= 0) return; // Nothing to undo

    const prevState = history[historyIndex - 1];
    if (!prevState) return;

    // Restore canvas state if it exists
    if (prevState.canvasState) {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        const img = new Image();

        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };

        img.onerror = () => {
          console.error("Failed to load canvas state");
        };

        img.src = prevState.canvasState;
      }
    }

    // Restore form states
    if (prevState.editableFields) {
      setEditableFields({ ...prevState.editableFields });
    }

    if (prevState.hospitalFields) {
      setHospitalFields({ ...prevState.hospitalFields });
    }

    if (prevState.selectedTemplate !== undefined) {
      setSelectedTemplate(prevState.selectedTemplate);
    }

    setHistoryIndex((prevIndex) => prevIndex - 1);
  };

  const redo = () => {
    if (historyIndex >= history.length - 1) return; // Nothing to redo

    const nextState = history[historyIndex + 1];
    if (!nextState) return;

    // Restore canvas state if it exists
    if (nextState.canvasState) {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        const img = new Image();

        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };

        img.onerror = () => {
          console.error("Failed to load canvas state");
        };

        img.src = nextState.canvasState;
      }
    }

    // Restore form states
    if (nextState.editableFields) {
      setEditableFields({ ...nextState.editableFields });
    }

    if (nextState.hospitalFields) {
      setHospitalFields({ ...nextState.hospitalFields });
    }

    if (nextState.selectedTemplate !== undefined) {
      setSelectedTemplate(nextState.selectedTemplate);
    }

    setHistoryIndex((prevIndex) => prevIndex + 1);
  };

  const handleMouseDown = (e) => {
    if (currentTool !== "pen") return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;

    setIsDrawing(true);
    setLastX(x);
    setLastY(y);

    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    saveToHistory();
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || currentTool !== "pen") return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;
    const ctx = canvas.getContext("2d");
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    saveToHistory();
  };

  const handleMouseLeave = () => {
    if (isDrawing) {
      saveToHistory();
      setIsDrawing(false);
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Save current state to history before download
    setHistory({
      canvasState: canvas.toDataURL(),
      editableFields: { ...editableFields },
      hospitalFields: { ...hospitalFields },
      selectedTemplate,
    });

    const link = document.createElement("a");
    link.download = `annotated_image_${
      new Date().toISOString().split("T")[0]
    }.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (selectedTemplate) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        saveToHistory();
      };
      img.src =
        selectedTemplate.originalFile ||
        `data:image/jpeg;base64,${selectedTemplate.image}`;
    } else if (initialImage) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        saveToHistory();
      };
      img.src = initialImage;
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      saveToHistory();
    }
  };

  // Render non-editable field (readonly)
  const renderNonEditableField = (label, fieldName, section = "medical") => {
    const value =
      section === "medical"
        ? editableFields[fieldName]
        : hospitalFields[fieldName];

    return (
      <div className="mb-4 p-3 border border-gray-200 rounded-lg bg-gray-50">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
        <p className={`text-gray-800 ${!value ? "text-gray-400 italic" : ""}`}>
          {value || `No ${label.toLowerCase()} provided`}
        </p>
      </div>
    );
  };

  // Render editable field component
  const renderEditableField = (
    label,
    fieldName,
    isTextArea = false,
    section = "medical"
  ) => {
    const value =
      section === "medical"
        ? editableFields[fieldName]
        : hospitalFields[fieldName];
    const isEditing =
      section === "medical"
        ? editingField === fieldName
        : editingHospitalField === fieldName;

    return (
      <div className="mb-4 p-3 border border-gray-200 rounded-lg bg-white">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
        {isEditing ? (
          <div className="flex flex-col space-y-2">
            {isTextArea ? (
              <textarea
                value={value || ""}
                onChange={(e) => {
                  if (section === "medical") {
                    setEditableFields((prev) => ({
                      ...prev,
                      [fieldName]: e.target.value,
                    }));
                  } else {
                    setHospitalFields((prev) => ({
                      ...prev,
                      [fieldName]: e.target.value,
                    }));
                  }
                }}
                className="w-full p-2 border border-gray-300 rounded-md resize-vertical"
                rows={4}
                autoFocus
              />
            ) : (
              <input
                type="text"
                value={value || ""}
                onChange={(e) => {
                  if (section === "medical") {
                    setEditableFields((prev) => ({
                      ...prev,
                      [fieldName]: e.target.value,
                    }));
                  } else {
                    setHospitalFields((prev) => ({
                      ...prev,
                      [fieldName]: e.target.value,
                    }));
                  }
                }}
                className="w-full p-2 border border-gray-300 rounded-md"
                autoFocus
              />
            )}
            <div className="flex space-x-2">
              <button
                onClick={() => handleFieldSave(fieldName, value, section)}
                className="flex items-center px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                <Check className="w-4 h-4 mr-1" />
                Save
              </button>
              <button
                onClick={() => handleFieldCancel(section)}
                className="flex items-center px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                <X className="w-4 h-4 mr-1" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-start">
            <p
              className={`flex-1 ${isTextArea ? "min-h-[60px]" : ""} ${
                !value ? "text-gray-400 italic" : "text-gray-800"
              }`}
            >
              {value || `No ${label.toLowerCase()} provided`}
            </p>
            <button
              onClick={() => handleFieldEdit(fieldName, section)}
              className="ml-2 p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
            >
              <Edit className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    );
  };

  // Update canvas context when color or line width changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, [currentColor, lineWidth]);

  // Initialize canvas with first history state
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || history.length === 0) return;

    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };

    img.src = history[historyIndex] || "";
  }, [history, historyIndex]);

  // Add keyboard event listeners
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Handle Tab key for drawing - switch to pen tool and start drawing
      if (e.key === "Tab") {
        e.preventDefault();
        if (!isDrawing) {
          setCurrentTool("pen");
          setIsDrawing(true);

          // Get the current mouse position to start drawing from there
          const canvas = canvasRef.current;
          if (canvas) {
            const rect = canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left - pan.x) / zoom;
            const y = (e.clientY - rect.top - pan.y) / zoom;
            setLastX(x);
            setLastY(y);
          }
        }
      }

      // Handle undo/redo with keyboard shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case "z":
            e.preventDefault();
            if (e.shiftKey) {
              // Ctrl+Shift+Z for redo
              redo();
            } else {
              // Ctrl+Z for undo
              undo();
            }
            break;
          case "y":
            e.preventDefault();
            redo();
            break;
          default:
            break;
        }
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === "Tab" && isDrawing) {
        // Only stop drawing if we're currently drawing with the pen
        if (currentTool === "pen") {
          setIsDrawing(false);
          saveToHistory();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [editableFields, hospitalFields, selectedTemplate]);

  return (
    <div
      className="bg-gray-100 font-sans flex flex-col min-h-screen"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      tabIndex="0" // Make the div focusable for keyboard events
    >
      {showPrintPreview && printData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 md:p-4">
          <div className="bg-white rounded-lg shadow-xl w-full h-full md:h-auto md:max-w-4xl md:max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 md:p-4 border-b gap-2">
              <h2 className="text-lg md:text-xl font-semibold">
                Print Preview - Saved Template
              </h2>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center px-3 md:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Download PDF</span>
                  <span className="sm:hidden">PDF</span>
                </button>
                <button
                  onClick={handleDownloadImage}
                  className="flex items-center px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Download Image</span>
                  <span className="sm:hidden">Image</span>
                </button>
                <button
                  onClick={() => setShowPrintPreview(false)}
                  className="flex items-center px-3 md:px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm"
                >
                  <X className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Close</span>
                  <span className="sm:hidden">×</span>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-2 md:p-4">
              <div
                ref={printRef}
                className="bg-white p-4 md:p-8 mx-auto"
                style={{
                  width: "100%",
                  maxWidth: "210mm",
                  minHeight: "297mm",
                  boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                  border: "1px solid #d1d5db",
                }}
              >
                {/* Medical Information */}
                <div style={{ marginBottom: "24px" }}>
                  {/* {printData?.formData?.chiefComplaint && (
                    <div style={{ marginBottom: '16px' }}>
                      <h4 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#1f2937', borderBottom: '1px solid #d1d5db', paddingBottom: '4px' }}>Chief Complaint</h4>
                      <p style={{ fontSize: '12px', color: '#374151', whiteSpace: 'pre-wrap' }}>{printData.formData.chiefComplaint}</p>
                    </div>
                  )} */}

                  {/* {printData?.formData?.historyOfPresentIllness && (
                    <div style={{ marginBottom: '16px' }}>
                      <h4 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#1f2937', borderBottom: '1px solid #d1d5db', paddingBottom: '4px' }}>History of Present Illness</h4>
                      <p style={{ fontSize: '12px', color: '#374151', whiteSpace: 'pre-wrap' }}>{printData.formData.historyOfPresentIllness}</p>
                    </div>
                  )} */}

                  {/* {printData?.formData?.physicalExamination && (
                    <div style={{ marginBottom: '16px' }}>
                      <h4 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#1f2937', borderBottom: '1px solid #d1d5db', paddingBottom: '4px' }}>Physical Examination</h4>
                      <p style={{ fontSize: '12px', color: '#374151', whiteSpace: 'pre-wrap' }}>{printData.formData.physicalExamination}</p>
                    </div>
                  )} */}

                  {/* {printData?.formData?.provisionalDiagnosis && (
                    <div style={{ marginBottom: '16px' }}>
                      <h4 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#1f2937', borderBottom: '1px solid #d1d5db', paddingBottom: '4px' }}>Provisional Diagnosis</h4>
                      <p style={{ fontSize: '12px', color: '#374151', whiteSpace: 'pre-wrap' }}>{printData.formData.provisionalDiagnosis}</p>
                    </div>
                  )} */}

                  {/* {printData?.formData?.treatmentPlan && (
                    <div style={{ marginBottom: '16px' }}>
                      <h4 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#1f2937', borderBottom: '1px solid #d1d5db', paddingBottom: '4px' }}>Treatment Plan</h4>
                      <p style={{ fontSize: '12px', color: '#374151', whiteSpace: 'pre-wrap' }}>{printData.formData.treatmentPlan}</p>
                    </div>
                  )} */}

                  {/* {printData?.formData?.additionalNotes && (
                    <div style={{ marginBottom: '16px' }}>
                      <h4 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#1f2937', borderBottom: '1px solid #d1d5db', paddingBottom: '4px' }}>Additional Notes</h4>
                      <p style={{ fontSize: '12px', color: '#374151', whiteSpace: 'pre-wrap' }}>{printData.formData.additionalNotes}</p>
                    </div>
                  )} */}
                </div>

                {/* Show preview image but hide overlay fields for predefined templates */}
                <div style={{ marginTop: "32px", paddingTop: "16px" }}>
                  {/* <h4 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '12px', color: '#1f2937' }}>Annotated Document</h4> */}
                  <img
                    src={printData?.annotatedImage}
                    alt="Annotated Medical Document"
                    style={{
                      width: "100%",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                    }}
                  />
                </div>

                <div
                  style={{
                    marginTop: "32px",
                    paddingTop: "16px",
                    borderTop: "1px solid #d1d5db",
                    fontSize: "10px",
                    color: "#6b7280",
                    textAlign: "center",
                  }}
                >
                  <p>
                    Generated on:{" "}
                    {new Date(printData?.timestamp).toLocaleString()}
                  </p>
                  <p>
                    Patient ID: {patient?.patientId} | Document ID:{" "}
                    {templatePrintId || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow-sm border-b p-2 flex flex-col md:flex-row items-center justify-between gap-2">
        <div className="w-full md:w-auto flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5 mr-2" /> Back
          </button>
        </div>
        <div className="w-full md:w-auto flex items-center gap-2">
          <input
            type="color"
            value={currentColor}
            onChange={(e) => setCurrentColor(e.target.value)}
            className="w-8 h-8 cursor-pointer"
          />
          <button
            onClick={() => setCurrentTool("pen")}
            className={`p-2 rounded-lg border-2 ${
              currentTool === "pen"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200"
            }`}
          >
            <Pencil className="w-5 h-5" />
          </button>
          <button
            onClick={handleDownload}
            className="p-2 rounded-lg border-2 border-gray-200 hover:border-gray-300"
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            onClick={undo}
            className="p-2 rounded-lg border-2 border-gray-200 hover:border-gray-300"
          >
            <Undo className="w-5 h-5" />
          </button>
          <button
            onClick={redo}
            className="p-2 rounded-lg border-2 border-gray-200 hover:border-gray-300"
          >
            <Redo className="w-5 h-5" />
          </button>
          <button
            onClick={handlePrintPreview}
            className="p-2 rounded-lg border-2 border-gray-200 hover:border-gray-300"
            title="Print Preview (Ctrl+P)"
          >
            <Printer className="w-5 h-5" />
          </button>
        </div>
        <button
          onClick={() => setShowTemplateModal(true)}
          className="btn btn-primary flex items-center gap-2 px-3 py-2"
          type="button"
        >
          <Settings className="w-4 h-4" />
          <span className="hidden md:inline">Templates</span>
        </button>
        <div className="w-full md:w-auto flex flex-col md:flex-row items-center gap-2">
          {/* <select
            className="p-2 border border-gray-300 rounded-lg w-full md:w-auto"
            value={selectedTemplateType}
            onChange={(e) => handleTemplateTypeChange(e.target.value)}
          >
            {/* {templateTypes?.map((type) => ( *
            {templateTypes
              ?.filter((type) => type.title !== "Predefined")
              ?.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.title}
                </option>
              ))}
          </select> */}
          <select
            className="p-2 border border-gray-300 rounded-lg w-full md:w-auto"
            value={selectedTemplateType}
            onChange={(e) => handleTemplateTypeChange(e.target.value)}
          >
            {templateTypes?.map((type) => (
              <option key={type.id} value={type.id}>
                {type.title}
              </option>
            ))}
          </select>

          <div className="relative w-full md:w-auto mr-">
            <button
              type="button"
              onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
              className="p-2 border border-gray-300 rounded-lg bg-white flex items-center gap-1 w-full md:w-auto"
              disabled={templateLoading || availableTemplates.length === 0}
            >
              {templateLoading
                ? "Loading..."
                : selectedTemplate
                ? selectedTemplate.templateName ||
                  selectedTemplate.fileName ||
                  "Selected Template"
                : "Select template"}
              <ChevronDown className="w-4 h-4" />
            </button>
            {showTemplateDropdown && availableTemplates.length > 0 && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto w-full md:w-64">
                <div className="p-2">
                  <button
                    onClick={() => {
                      setSelectedTemplate(null);
                      setShowTemplateDropdown(false);
                      if (initialImage) {
                        const canvas = canvasRef.current;
                        const ctx = canvas.getContext("2d");
                        const img = new Image();
                        img.onload = () => {
                          ctx.clearRect(0, 0, canvas.width, canvas.height);
                          ctx.drawImage(img, 0, 0);
                          saveToHistory();
                        };
                        img.src = initialImage;
                      }
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg text-sm text-gray-600"
                  >
                    Original Image
                  </button>
                  {availableTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateSelect(template)}
                      className={`w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg ${
                        selectedTemplate?.id === template.id ? "bg-blue-50" : ""
                      }`}
                    >
                      <div className="flex items-center">
                        <img
                          src={
                            template.originalFile ||
                            template.files ||
                            template.image ||
                            `data:image/jpeg;base64,${template.base64}`
                          }
                          alt="Template thumbnail"
                          className="w-8 h-8 object-cover mr-2"
                          onError={(e) => (e.target.style.display = "none")}
                        />
                        <div>
                          <p className="text-sm font-medium truncate">
                            {template.templateName ||
                              template.fileName ||
                              "Template"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {template.createdAt
                              ? new Date(
                                  template.createdAt
                                ).toLocaleDateString()
                              : new Date(
                                  template.uploadedAt || Date.now()
                                ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className="flex items-center gap-0 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors border border-gray-200 text-sm font-medium"
      >
        {showSidebar ? (
          <ChevronLeft className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
        <span className="hidden sm:inline">
          {showSidebar ? "Hide" : "Show"}
        </span>
      </button>
      <div className="flex-1 flex flex-col md:flex-row p-4 gap-4">
        {/* Hide Medical Data/Hospital section for predefined templates */}
        {selectedTemplateType !== "6" && showSidebar && (
          <div className="w-full md:w-96 bg-white rounded-lg shadow-sm border border-gray-200 p-4 overflow-y-auto max-h-[calc(100vh-200px)]">
            <div className="flex border-b border-gray-200 mb-4">
              <button
                onClick={() => setActiveSection("medical")}
                className={`flex-1 py-2 px-4 text-center font-medium ${
                  activeSection === "medical"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Medical Data
              </button>
              <button
                onClick={() => setActiveSection("hospital")}
                className={`flex-1 py-2 px-4 text-center font-medium ${
                  activeSection === "hospital"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Building className="w-4 h-4 inline mr-2" />
                Hospital
              </button>
            </div>

            {activeSection === "medical" ? (
              <>
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                  Patient & Medical Information
                </h3>

                {renderNonEditableField("Patient Name", "patientName")}
                {renderNonEditableField("Doctor Name", "doctorName")}
                {renderNonEditableField(
                  "Consulting Doctor",
                  "consultingDoctor"
                )}
                {renderNonEditableField("Referred By", "referredBy")}
                {renderNonEditableField("Context", "context")}
                {renderNonEditableField("Visit Date", "visitDate")}

                {renderEditableField("Chief Complaint", "chiefComplaint", true)}
                {renderEditableField(
                  "History of Present Illness",
                  "historyOfPresentIllness",
                  true
                )}
                {renderEditableField(
                  "Physical Examination",
                  "physicalExamination",
                  true
                )}
                {renderEditableField(
                  "Provisional Diagnosis",
                  "provisionalDiagnosis",
                  true
                )}
                {renderEditableField("Treatment Plan", "treatmentPlan", true)}
                {renderEditableField(
                  "Additional Notes",
                  "additionalNotes",
                  true
                )}
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                  <Building className="w-5 h-5 mr-2" />
                  Hospital & Doctor Information
                </h3>

                {renderEditableField(
                  "Hospital Name",
                  "hospitalName",
                  false,
                  "hospital"
                )}
                {renderEditableField(
                  "Hospital Subtitle",
                  "hospitalSubtitle",
                  false,
                  "hospital"
                )}
                {renderEditableField(
                  "Address Line 1",
                  "hospitalAddressLine1",
                  false,
                  "hospital"
                )}
                {renderEditableField(
                  "Address Line 2",
                  "hospitalAddressLine2",
                  false,
                  "hospital"
                )}
                {renderEditableField("City", "hospitalCity", false, "hospital")}
                {renderEditableField(
                  "Pincode",
                  "hospitalPincode",
                  false,
                  "hospital"
                )}
                {renderEditableField(
                  "Phone",
                  "hospitalPhone",
                  false,
                  "hospital"
                )}
                {renderEditableField(
                  "Email",
                  "hospitalEmail",
                  false,
                  "hospital"
                )}

                {renderEditableField(
                  "Doctor Full Name",
                  "doctorFullName",
                  false,
                  "hospital"
                )}
                {renderEditableField(
                  "Department",
                  "doctorDepartment",
                  false,
                  "hospital"
                )}
                {renderEditableField(
                  "License Number",
                  "doctorLicense",
                  false,
                  "hospital"
                )}
                {renderEditableField(
                  "Contact",
                  "doctorContact",
                  false,
                  "hospital"
                )}
                {renderEditableField(
                  "Qualifications",
                  "doctorQualifications",
                  true,
                  "hospital"
                )}
              </>
            )}

            <div className="mt-6 space-y-3">
              <button
                onClick={handleSaveAnnotations}
                disabled={saving}
                className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save All Changes
                  </>
                )}
              </button>

              <button
                onClick={handlePrintPreview}
                className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print Preview
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-white h-[calc(100vh-200px)] w-full flex items-center justify-center overflow-hidden">
            <div className="relative w-full h-full">
              <canvas
                ref={canvasRef}
                onMouseMove={handleMouseMove}
                className="border border-gray-300 w-full h-full object-contain"
                style={{ cursor: "crosshair" }}
              />

              {/* Hide overlay inputs for predefined templates */}
              {selectedTemplateType !== "6" && (
                <div ref={overlayContainerRef} className="absolute inset-0">
                  {Object.keys(overlayBoxes).map((key) => {
                    const box = overlayBoxes[key];
                    const isTextArea = [
                      "chiefComplaint",
                      "historyOfPresentIllness",
                      "physicalExamination",
                      "treatmentPlan",
                    ].includes(key);
                    return (
                      <div
                        key={key}
                        onPointerDown={(e) => startMove(key, e)}
                        className={`absolute pointer-events-auto ${
                          key === "hospitalName" ? "text-center" : ""
                        } hover:ring-2 hover:ring-blue-300`}
                        style={{
                          left: `${box.left}%`,
                          top: `${box.top}%`,
                          width: `${box.width}%`,
                          height: `${box.height}%`,
                          cursor: "move",
                        }}
                      >
                        {isTextArea ? (
                          <textarea
                            value={
                              editableFields[key] || hospitalFields[key] || ""
                            }
                            onChange={(e) => {
                              if (key in editableFields)
                                setEditableFields((prev) => ({
                                  ...prev,
                                  [key]: e.target.value,
                                }));
                              else
                                setHospitalFields((prev) => ({
                                  ...prev,
                                  [key]: e.target.value,
                                }));
                            }}
                            className="w-full h-full bg-transparent border border-dashed border-gray-300 p-1 text-sm outline-none"
                            style={{ resize: "none", overflow: "auto" }}
                          />
                        ) : (
                          <input
                            value={
                              editableFields[key] || hospitalFields[key] || ""
                            }
                            onChange={(e) => {
                              if (key in editableFields)
                                setEditableFields((prev) => ({
                                  ...prev,
                                  [key]: e.target.value,
                                }));
                              else
                                setHospitalFields((prev) => ({
                                  ...prev,
                                  [key]: e.target.value,
                                }));
                            }}
                            className={`w-full h-full bg-transparent border-none text-sm outline-none ${
                              key === "hospitalName"
                                ? "font-bold text-lg text-center"
                                : ""
                            }`}
                          />
                        )}

                        {/* resizer */}
                        <div
                          onPointerDown={(e) => startResize(key, e)}
                          className="absolute bg-blue-200 w-2 h-2 rounded-tl-xl pointer-events-auto shadow-md"
                          style={{ right: 0, bottom: 0 }}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
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
        </div>
      </div>
    </div>
  );
};

export default ImageAnnotation;
