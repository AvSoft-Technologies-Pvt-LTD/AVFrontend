import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import SignatureCanvas from "react-signature-canvas";
import { Eye, EyeOff, X, Save, ChevronDown, Calendar as CalendarIcon } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const getColSpanClass = (colSpan = 1) => {
  switch (colSpan) {
    case 2:
      return "md:col-span-2";
    case 3:
      return "md:col-span-3";
    default:
      return "md:col-span-1";
  }
};

const getFieldRows = (fields) => {
  const rows = [];
  let row = [];
  let span = 0;
  fields.forEach((f) => {
    const s = f.colSpan || 1;
    if (span + s > 3) {
      rows.push([...row]);
      row = [];
      span = 0;
    }
    row.push(f);
    span += s;
  });
  if (row.length) rows.push(row);
  return rows;
};

const ReusableModal = ({
  isOpen,
  onClose,
  mode,
  title,
  data = {},
  saveLabel,
  cancelLabel,
  deleteLabel,
  fields = [],
  viewFields = [],
  size = "md",
  extraContent,
  onSave,
  onDelete,
  showSignature = false,
  onChange,
  onFieldsUpdate,
  extraContentPosition = "bottom",
  preventCloseOnSave = false,
  showSuccessToast = true,
  onCancel,
}) => {
  const [formValues, setFormValues] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [previewFile, setPreviewFile] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [doctorSignature, setDoctorSignature] = useState("");
  const [currentFields, setCurrentFields] = useState(fields);
  const [suggestions, setSuggestions] = useState({});
  const [dropdownStates, setDropdownStates] = useState({});
  const signaturePadRef = useRef();
  const modalRef = useRef();
  const dropdownRefs = useRef({});

  const getSelectedLabel = (options, value) => {
    if (!value) return null;
    const option = options.find((opt) => String(opt.value) === String(value));
    return option ? option.label : value;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      setSuggestions({});
      Object.keys(dropdownRefs.current).forEach((fieldName) => {
        const dropdownElement = dropdownRefs.current[fieldName];
        if (dropdownElement && !dropdownElement.contains(event.target)) {
          setDropdownStates((prev) => ({ ...prev, [fieldName]: false }));
        }
      });
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isOpen && ["add", "edit"].includes(mode)) {
      const initial = {};
      fields.forEach((f) => {
        if (f.type === "checkboxWithInput" || f.durationField) {
          initial[f.name] = data?.[f.name] ?? [];
          initial[f.inputName] = data?.[f.inputName] ?? "";
        } else {
          initial[f.name] = data?.[f.name] ?? "";
        }
      });
      setFormValues(initial);
      setFormErrors({});
      setCurrentFields(fields);
    }
  }, [isOpen, mode, data, fields]);

  useEffect(() => {
    if (onFieldsUpdate && formValues) {
      const updatedFields = onFieldsUpdate(formValues);
      setCurrentFields(updatedFields);
    }
  }, [formValues, onFieldsUpdate]);

  const handleSignatureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setDoctorSignature(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleClearSignature = () => {
    signaturePadRef.current?.clear();
    setDoctorSignature("");
  };

  const handleChange = (name, value) => {
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFormErrors((p) => ({ ...p, [name]: undefined }));
    onChange?.({ ...formValues, [name]: value });
  };

  const handleInputChange = (e, field) => {
    let value = e.target.value;
    if (field.name === "registerPhone") {
      value = value.replace(/\D/g, "").slice(0, 10);
    }
    handleChange(field.name, value);
    if (field.suggestions) {
      const filteredSuggestions = field.suggestions.filter((suggestion) =>
        suggestion.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions({ ...suggestions, [field.name]: filteredSuggestions });
    }
  };

  const handleSuggestionClick = (fieldName, suggestion) => {
    handleChange(fieldName, suggestion);
    setSuggestions({ ...suggestions, [fieldName]: [] });
  };

  const toggleDropdown = (fieldName) => {
    setDropdownStates((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  };

  const validateFields = () => {
    const errors = {};
    currentFields.forEach((f) => {
      const value = formValues[f.name];
      if (f.required && !value && value !== 0 && value !== false) {
        errors[f.name] = `${f.label || f.name} is required`;
      }
      if (f.validate) {
        const error = f.validate(value, formValues);
        if (error) errors[f.name] = error;
      }
    });
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    const isValid = validateFields();
    if (!isValid) {
      toast.error("Please fix the errors before saving");
      return;
    }
    await onSave({ ...formValues, doctorSignature });
    if (showSuccessToast) {
      toast.success(
        mode === "add" ? "Record added Successfully!" : "Record updated Successfully!"
      );
    }
    if (!preventCloseOnSave) {
      onClose();
    }
  };

  const handleDelete = () => {
    onDelete();
    toast.error("Record deleted Successfully!");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-2 sm:p-4">
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, y: 100, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className={`flex flex-col relative w-full max-h-[90vh] rounded-xl bg-white shadow-xl overflow-visible ${
          size === "sm" ? "max-w-md" : size === "md" ? "max-w-3xl" : "max-w-4xl"
        }`}
      >
        {(mode === "add" || mode === "edit" || mode === "viewProfile") && (
          <div className="sticky top-0 z-20 bg-gradient-to-r from-[#01B07A] to-[#004f3d] rounded-t-xl px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border border-white text-white hover:bg-gradient-to-br from-[#E6FBF5] to-[#C1F1E8] hover:text-[#01B07A] transition"
            >
              <X size={16} className="sm:size-5" />
            </button>
          </div>
        )}
        <div className="flex flex-col max-h-[90vh] overflow-y-auto bg-gradient-to-br from-[#E6FBF5] to-[#C1F1E8]">
          <div className="flex-1 p-2 sm:p-4 relative z-0">
            <div className="rounded-xl bg-white p-4 sm:p-6 space-y-4 sm:space-y-6">
              {extraContentPosition === "top" && extraContent && (
                <div className="mb-2 sm:mb-4">{extraContent}</div>
              )}
              {["add", "edit"].includes(mode) && (
                <div className="space-y-4 sm:space-y-6 mb-2 sm:mb-4">
                  {getFieldRows(currentFields).map((row, i) => (
                    <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 mb-2 sm:mb-4">
                      {row.map((field) => (
                        <div key={field.name} className={`col-span-1 ${getColSpanClass(field.colSpan)}`}>
                          {field.type === "checkbox" ? (
                            <label className="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm mt-1">
                              <input
                                type="checkbox"
                                name={field.name}
                                checked={!!formValues[field.name]}
                                onChange={(e) => handleChange(field.name, e.target.checked)}
                                className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600"
                              />
                              <span>{field.label}</span>
                            </label>
                          ) : field.type === "checkboxWithInput" ? (
                            <div className="flex items-center gap-1 sm:gap-2">
                              <label className="flex items-center gap-1 text-xs sm:text-sm whitespace-nowrap">
                                <input
                                  type="checkbox"
                                  name={field.name}
                                  checked={!!formValues[field.name]}
                                  onChange={(e) => handleChange(field.name, e.target.checked)}
                                  className="h-4 w-4 text-blue-600"
                                />
                                <span>{field.label}</span>
                              </label>
                              {formValues[field.name] && (
                                <input
                                  type="text"
                                  name={field.inputName}
                                  value={formValues[field.inputName] || ""}
                                  onChange={(e) => handleChange(field.inputName, e.target.value)}
                                  className="text-xs sm:text-sm border p-2 sm:p-2.5 border-gray-300 rounded-md w-full min-w-[80px] placeholder:text-[10px] sm:placeholder:text-xs"
                                  placeholder={field.inputLabel}
                                />
                              )}
                              {formErrors[field.inputName] && (
                                <p className="mt-1 text-[10px] sm:text-xs text-red-600">
                                  {formErrors[field.inputName]}
                                </p>
                              )}
                            </div>
                          ) : field.type === "radio" ? (
                            <div className="space-y-1.5 sm:space-y-2">
                              <p className="font-medium text-xs sm:text-sm mb-1">{field.label}</p>
                              <div className="flex flex-wrap gap-2 sm:gap-4">
                                {field.options?.map((opt) => {
                                  const value = typeof opt === "string" ? opt : opt.value;
                                  const label = typeof opt === "string" ? opt : opt.label;
                                  return (
                                    <label key={value} className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                                      <input
                                        type="radio"
                                        name={field.name}
                                        value={value}
                                        checked={formValues[field.name] === value}
                                        onChange={(e) => handleChange(field.name, e.target.value)}
                                        className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600"
                                      />
                                      <span>{label}</span>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          ) : (
                            <div className="floating-input relative" data-placeholder={field.label}>
                              {field.type === "select" || field.type === "multiselect" ? (
                                <div className="relative">
                                  <div
                                    ref={(el) => (dropdownRefs.current[field.name] = el)}
                                    className="relative"
                                  >
                                    {dropdownStates[field.name] ? (
                                      <input
                                        type="text"
                                        placeholder={
                                          field.type === "multiselect" &&
                                          Array.isArray(formValues[field.name]) &&
                                          formValues[field.name].length > 0
                                            ? formValues[field.name]
                                                .map((value) => {
                                                  const selectedOption = field.options.find(
                                                    (opt) => opt.value === value
                                                  );
                                                  return selectedOption?.label || value;
                                                })
                                                .join(", ")
                                            : `Search ${field.label}...`
                                        }
                                        value={formValues[`${field.name}Search`] || ""}
                                        onChange={(e) => {
                                          setFormValues((p) => ({
                                            ...p,
                                            [`${field.name}Search`]: e.target.value,
                                            [field.name]: p[field.name],
                                          }));
                                        }}
                                        className="input-field peer w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-md text-left bg-white focus:outline-none focus:ring-2 pr-8 sm:pr-10"
                                        autoFocus
                                      />
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => toggleDropdown(field.name)}
                                        className="input-field peer w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-md text-left bg-white focus:outline-none focus:ring-2 flex justify-between items-center"
                                      >
                                        <span className="truncate text-xs sm:text-sm">
                                          {field.type === "multiselect"
                                            ? Array.isArray(formValues[field.name]) &&
                                              formValues[field.name].length > 0
                                              ? formValues[field.name]
                                                  .map((value) => {
                                                    const selectedOption = field.options.find(
                                                      (opt) => opt.value === value
                                                    );
                                                    return selectedOption?.label || value;
                                                  })
                                                  .join(", ")
                                              : `Select ${field.label}`
                                            : getSelectedLabel(field.options, formValues[field.name]) || `Select ${field.label}`}
                                        </span>
                                        <ChevronDown size={14} className="sm:size-4" />
                                      </button>
                                    )}
                                    {dropdownStates[field.name] && (
                                      <div
                                        id={`dropdown-${field.name}`}
                                        className="fixed z-[10000] mt-1 w-auto max-h-40 sm:max-h-60 overflow-auto rounded-md bg-white shadow-lg border border-gray-200"
                                      >
                                        {field.options
                                          ?.filter((opt) =>
                                            opt.label
                                              .toLowerCase()
                                              .includes(
                                                (formValues[`${field.name}Search`] || "").toLowerCase()
                                              )
                                          )
                                          .map((opt) =>
                                            field.type === "select" ? (
                                              <div
                                                key={opt.value}
                                                onClick={() => {
                                                  handleChange(field.name, opt.value);
                                                  toggleDropdown(field.name);
                                                }}
                                                className="px-3 sm:px-4 py-1.5 sm:py-2 hover:bg-gray-100 cursor-pointer text-xs sm:text-sm transition-colors duration-150"
                                              >
                                                {opt.label}
                                              </div>
                                            ) : (
                                              <label
                                                key={opt.value}
                                                className="flex items-center px-3 sm:px-4 py-1.5 sm:py-2 hover:bg-gray-100 cursor-pointer text-xs sm:text-sm transition-colors duration-150"
                                              >
                                                <input
                                                  type="checkbox"
                                                  className="mr-2 sm:mr-3 h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                                  checked={
                                                    Array.isArray(formValues[field.name]) &&
                                                    formValues[field.name].includes(opt.value)
                                                  }
                                                  onChange={(e) => {
                                                    const prev = Array.isArray(formValues[field.name])
                                                      ? formValues[field.name]
                                                      : [];
                                                    const next = e.target.checked
                                                      ? [...prev, opt.value]
                                                      : prev.filter((v) => v !== opt.value);
                                                    handleChange(field.name, next);
                                                  }}
                                                />
                                                <span className="flex-1">{opt.label}</span>
                                              </label>
                                            )
                                          )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ) : field.type === "date" ? (
                                <div className="relative">
                                  <DatePicker
                                    selected={
                                      formValues[field.name] ? new Date(formValues[field.name]) : null
                                    }
                                    onChange={(date) =>
                                      handleChange(field.name, date ? date.toISOString().split("T")[0] : "")
                                    }
                                    dateFormat="yyyy-MM-dd"
                                    placeholderText=""
                                    dropdownMode="select"
                                    className="input-field peer w-full min-w-[220px] px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 pr-8"
                                    showYearDropdown
                                    yearDropdownItemNumber={15}
                                    scrollableYearDropdown
                                    showMonthDropdown
                                  />
                                  <CalendarIcon className="absolute left-48 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#0e1630] pointer-events-none" />
                                  {formErrors[field.name] && (
                                    <p className="mt-1 text-[10px] sm:text-xs text-red-600">
                                      {formErrors[field.name]}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <input
                                  type={field.type || "text"}
                                  name={field.name}
                                  value={formValues[field.name] || ""}
                                  onChange={(e) => handleInputChange(e, field)}
                                  readOnly={field.readonly}
                                  className={`input-field peer px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 ${
                                    field.isDuration ? "w-16 sm:w-24 text-center" : "w-full"
                                  }`}
                                  placeholder=" "
                                  min={field.min}
                                  max={field.max}
                                  step={field.step}
                                />
                              )}
                              {suggestions[field.name]?.length > 0 && (
                                <ul className="absolute z-10 mt-1 max-h-40 sm:max-h-60 w-full overflow-auto rounded bg-white shadow">
                                  {suggestions[field.name].map((suggestion, index) => (
                                    <li
                                      key={index}
                                      className="px-3 sm:px-4 py-1.5 sm:py-2 hover:bg-gray-100 cursor-pointer text-xs sm:text-sm"
                                      onClick={() => handleSuggestionClick(field.name, suggestion)}
                                    >
                                      {suggestion}
                                    </li>
                                  ))}
                                </ul>
                              )}
                              {field.unit && (
                                <span className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] sm:text-xs pointer-events-none">
                                  {field.unit}
                                </span>
                              )}
                              {field.normalRange && (
                                <div className="flex items-center gap-1 mt-1 text-[10px] sm:text-xs text-yellow-600">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M12 9v2.25m0 2.25h.008v.008H12v-.008zm.75-8.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                  <span className="text-[10px] sm:text-xs">Normal Range: {field.normalRange}</span>
                                </div>
                              )}
                              {formErrors[field.name] && (
                                <p className="mt-1 text-[10px] sm:text-xs text-red-600">
                                  {formErrors[field.name]}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
              {["add", "edit"].includes(mode) && showSignature && (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-8 animate-fadeIn">
                  <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">Digital Signature</h3>
                  <div className="grid grid-cols-1 gap-4 sm:gap-8">
                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                          Upload Signature:
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleSignatureUpload}
                          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                        />
                      </div>
                      {doctorSignature && (
                        <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <span className="text-xs sm:text-sm font-medium text-blue-700">Preview:</span>
                          <img
                            src={doctorSignature}
                            alt="Doctor's Signature"
                            className="h-8 sm:h-12 border border-blue-300 rounded shadow-sm"
                          />
                        </div>
                      )}
                    </div>
                    <div className="space-y-3 sm:space-y-4">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                        Or Draw Signature:
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 sm:p-4">
                        <SignatureCanvas
                          ref={signaturePadRef}
                          canvasProps={{
                            width: 320,
                            height: 80,
                            className: "border border-gray-300 rounded-lg shadow-sm w-full bg-white",
                          }}
                        />
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <button
                          onClick={() => setDoctorSignature(signaturePadRef.current?.toDataURL())}
                          className="px-3 sm:px-4 py-1.5 sm:py-2 edit-btn text-xs sm:text-sm flex items-center gap-1"
                        >
                          <Save className="w-3.5 h-3.5 sm:size-4" />
                          Save
                        </button>
                        <button
                          onClick={handleClearSignature}
                          className="px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 text-xs sm:text-sm text-white rounded-md hover:bg-red-700 flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5 sm:size-4" />
                          Clear
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {mode === "viewProfile" && (
                <>
                  <div className="flex items-center rounded-xl bg-gradient-to-r from-[#01B07A] to-[#1A223F] p-3 sm:p-5">
                    <div className="relative mr-3 sm:mr-4 flex h-12 w-12 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-white text-[#01B07A] text-base sm:text-2xl font-bold uppercase shadow-inner ring-2 sm:ring-4 ring-white ring-offset-2">
                      {viewFields.find((f) => f.initialsKey)
                        ? (data[viewFields.find((f) => f.initialsKey).key] || "NA").substring(0, 2).toUpperCase()
                        : "NA"}
                    </div>
                    <div>
                      <p className="text-base sm:text-2xl font-semibold text-white">
                        {viewFields.find((f) => f.titleKey)
                          ? data[viewFields.find((f) => f.titleKey).key] || "-"
                          : "-"}
                      </p>
                      <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-sm font-medium text-blue-100 tracking-wide">
                        {viewFields.find((f) => f.subtitleKey)
                          ? data[viewFields.find((f) => f.subtitleKey).key] || "-"
                          : "-"}
                      </p>
                    </div>
                  </div>
                  <div className="rounded-xl p-4 sm:p-6 bg-white">
                    <h3 className="mb-3 sm:mb-4 border-b pb-2 sm:pb-3 text-base sm:text-lg font-semibold">
                      Details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                      {viewFields
                        .filter((f) => !f.initialsKey && !f.titleKey && !f.subtitleKey)
                        .map((f, i) => (
                          <div
                            key={i}
                            className="flex justify-between border-b border-dashed border-gray-200 pb-1.5 sm:pb-2"
                          >
                            <span className="text-[10px] sm:text-sm font-medium text-gray-500">
                              {f.label}
                            </span>
                            <span className="ml-2 sm:ml-4 text-[10px] sm:text-sm font-semibold text-gray-800">
                              {data[f.key] || "-"}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </>
              )}
              {mode === "confirmDelete" && (
                <p className="text-xs sm:text-sm text-gray-700">Are you sure you want to delete this record?</p>
              )}
              {extraContentPosition === "bottom" && extraContent && <div className="mt-3 sm:mt-4">{extraContent}</div>}
            </div>
          </div>
          <div className="flex justify-end gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4">
            {mode !== "viewProfile" && (
              <button
                onClick={onCancel || onClose}
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm delete-btn"
              >
                {cancelLabel || "Cancel"}
              </button>
            )}
            {["add", "edit"].includes(mode) && (
              <button
                onClick={handleSave}
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm view-btn"
              >
                {saveLabel || (mode === "edit" ? "Update" : "Save")}
              </button>
            )}
            {mode === "confirmDelete" && (
              <button
                onClick={handleDelete}
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                {deleteLabel || "Yes, Delete"}
              </button>
            )}
          </div>
        </div>
      </motion.div>
      {showPreviewModal && previewFile && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-2 sm:p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-xs sm:max-w-lg w-full shadow-lg">
            <div className="flex justify-between mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-bold">File Preview</h3>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-gray-700 hover:text-red-500 text-sm sm:text-base"
              >
                X
              </button>
            </div>
            {previewFile.type?.startsWith("image/") ? (
              <img
                src={URL.createObjectURL(previewFile)}
                alt={previewFile.name}
                className="w-full max-h-[60vh] sm:max-h-[70vh] object-contain"
                onLoad={() => URL.revokeObjectURL(previewFile)}
              />
            ) : (
              <p className="text-xs sm:text-sm text-gray-800">File: {previewFile.name}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReusableModal;
