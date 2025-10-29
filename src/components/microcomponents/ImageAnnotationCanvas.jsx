import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Save, Download, Trash2, Type, Square, Circle, ArrowRight,
  Undo, Redo, Move, Loader2, Pencil, Eraser, Printer, Image as ImageIcon, ChevronDown
} from "lucide-react";

const templateTypes = [
  { id: "past-history", name: "Past History", color: "#3B82F6" },
  { id: "discharge-summary", name: "Discharge Summary", color: "#10B981" },
  { id: "registration-form", name: "Registration Form", color: "#F59E0B" },
  { id: "prescription", name: "Prescription", color: "#8B5CF6" },
  { id: "lab-report", name: "Lab Report", color: "#EF4444" },
];

const ImageAnnotation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState("pen");
  const [currentColor, setCurrentColor] = useState("#ff0000");
  const [currentSize, setCurrentSize] = useState(2);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedTemplateType, setSelectedTemplateType] = useState("past-history");
  const [availableTemplates, setAvailableTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  const [templateLoading, setTemplateLoading] = useState(false);
  const { initialImage, patient } = location.state || {};

  useEffect(() => {
    if (location.state?.templateType) {
      setSelectedTemplateType(location.state.templateType);
    }
    loadAvailableTemplates();
  }, [location.state]);

  useEffect(() => {
    loadAvailableTemplates();
  }, [selectedTemplateType]);

  useEffect(() => {
    if (initialImage) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        saveToHistory();
      };
      img.src = initialImage;
    }
  }, [initialImage]);

  const loadAvailableTemplates = () => {
    try {
      setTemplateLoading(true);
      const storedTemplates = JSON.parse(localStorage.getItem("uploadedTemplates") || "[]");
      const filteredTemplates = storedTemplates.filter(
        (template) => template.templateType === selectedTemplateType
      );
      setAvailableTemplates(filteredTemplates);
      if (selectedTemplate && !filteredTemplates.find((t) => t.id === selectedTemplate.id)) {
        setSelectedTemplate(null);
      }
    } catch (err) {
      console.log("Failed to load templates from localStorage");
      setAvailableTemplates([]);
    } finally {
      setTemplateLoading(false);
    }
  };

  const handleTemplateTypeChange = (templateType) => {
    setSelectedTemplateType(templateType);
    setSelectedTemplate(null);
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setShowTemplateDropdown(false);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      saveToHistory();
    };
    img.src = template.originalFile || `data:image/jpeg;base64,${template.image}`;
  };

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(canvas.toDataURL());
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      setCurrentTool("pen");
      setIsDrawing(true);
    }
  };

  const handleKeyUp = (e) => {
    if (e.key === "Tab") {
      setIsDrawing(false);
      saveToHistory();
    }
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || currentTool !== "pen") return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = currentSize;
    ctx.lineCap = "round";
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    const annotatedImageData = canvas.toDataURL();
    const annotatedImage = {
      id: Date.now(),
      originalImage: initialImage,
      annotatedImage: annotatedImageData,
      patient: patient,
      timestamp: new Date().toISOString(),
      templateType: selectedTemplateType,
      selectedTemplate: selectedTemplate,
    };
    const storedAnnotations = JSON.parse(localStorage.getItem("annotatedImages") || "[]");
    storedAnnotations.push(annotatedImage);
    localStorage.setItem("annotatedImages", JSON.stringify(storedAnnotations));
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.download = `annotated_image_${new Date().toISOString().split("T")[0]}.png`;
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
      img.src = selectedTemplate.originalFile || `data:image/jpeg;base64,${selectedTemplate.image}`;
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

  return (
    <div
      className="bg-gray-100 font-sans flex flex-col"
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      tabIndex={0}
    >
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
            className={`p-2 rounded-lg border-2 ${currentTool === "pen" ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
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
        </div>
        <div className="w-full md:w-auto flex flex-col md:flex-row items-center gap-2">
          <select
            className="p-2 border border-gray-300 rounded-lg w-full md:w-auto"
            value={selectedTemplateType}
            onChange={(e) => handleTemplateTypeChange(e.target.value)}
          >
            {templateTypes.map((type) => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
          <div className="relative w-full md:w-auto mr-">
            <button
              type="button"
              onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
              className="p-2 border border-gray-300 rounded-lg bg-white flex items-center gap-1 w-full md:w-auto"
              disabled={templateLoading || availableTemplates.length === 0}
            >
              {templateLoading ? "Loading..." : selectedTemplate ? selectedTemplate.fileName : "Select template"}
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
                      className={`w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg ${selectedTemplate?.id === template.id ? "bg-blue-50" : ""}`}
                    >
                      <div className="flex items-center">
                        <img
                          src={template.originalFile || `data:image/jpeg;base64,${template.image}`}
                          alt="Template thumbnail"
                          className="w-8 h-8 object-cover mr-2"
                        />
                        <div>
                          <p className="text-sm font-medium truncate">{template.fileName}</p>
                          <p className="text-xs text-gray-500">{new Date(template.uploadedAt).toLocaleDateString()}</p>
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
      <div className="flex-1 p-0 overflow-hidden">
        <div className="bg-white h-[calc(95vh-120px)] w-full flex items-center justify-center overflow-hidden">
          <canvas
            ref={canvasRef}
            onMouseMove={handleMouseMove}
            className="border border-gray-300 w-full h-full object-contain"
            style={{ cursor: "crosshair" }}
          />
        </div>
      </div>
    </div>
  );
};

export default ImageAnnotation;