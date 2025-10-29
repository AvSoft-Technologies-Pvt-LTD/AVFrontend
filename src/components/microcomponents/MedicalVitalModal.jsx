import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import SignatureCanvas from 'react-signature-canvas';
import { Eye, EyeOff, X, Save, ChevronDown } from 'lucide-react';

// --- ReusableModal ---
export const ReusableModal = ({
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
  size = 'md',
  extraContent,
  onSave,
  onDelete,
  showSignature = false,
  onChange,
  onFieldsUpdate,
  shouldValidate = false,
  extraContentPosition = 'bottom',
  warnings = {},
}) => {
  const [formValues, setFormValues] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const signaturePadRef = React.useRef();
  const modalRef = React.useRef();

  useEffect(() => {
    if (isOpen && ['add', 'edit'].includes(mode)) {
      const initial = {};
      fields.forEach((f) => {
        if (f.type === 'checkboxWithInput') {
          initial[f.name] = data?.[f.name] ?? false;
          initial[f.inputName] = data?.[f.inputName] ?? '';
        } else {
          initial[f.name] = data?.[f.name] ?? '';
        }
      });
      setFormValues(initial);
      setFormErrors({});
    }
  }, [isOpen, mode, data, fields]);

  useEffect(() => {
    if (onFieldsUpdate && formValues) {
      const updatedFields = onFieldsUpdate(formValues);
    }
  }, [formValues, onFieldsUpdate]);

  const handleChange = (name, value) => {
    const updated = { ...formValues, [name]: value };
    setFormValues(updated);
    setFormErrors((p) => ({ ...p, [name]: undefined }));
    onChange?.(updated);
  };

  const handleSave = async () => {
    await onSave?.(formValues);
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-2 sm:p-4">
      <div
        ref={modalRef}
        className={`flex flex-col relative w-full max-h-[90vh] rounded-xl bg-white shadow-xl overflow-hidden ${
          size === 'sm' ? 'max-w-md' : size === 'md' ? 'max-w-3xl' : 'max-w-4xl'
        }`}
      >
        <div className="sticky top-0 z-20 bg-gradient-to-r from-[#01B07A] to-[#004f3d] rounded-t-xl px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">{title}</h2>
          <button onClick={onClose} className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border border-white text-white hover:bg-gradient-to-br from-[#E6FBF5] to-[#C1F1E8] hover:text-[#01B07A] transition">
            <X size={16} />
          </button>
        </div>
        <div className="flex flex-col max-h-[90vh] overflow-auto bg-gradient-to-br from-[#E6FBF5] to-[#E6FBF5]">
          <div className="flex-1 p-4 sm:p-6 relative z-0">
            <div className="rounded-xl bg-white p-4 sm:p-6 space-y-4 sm:space-y-6">
              {extraContentPosition === 'top' && extraContent && <div className="mb-2 sm:mb-4">{extraContent}</div>}
              {['add', 'edit'].includes(mode) && (
                <div className="space-y-4 sm:space-y-6 mb-2 sm:mb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 mb-2 sm:mb-4">
                    {fields.map((field) => (
                      <div key={field.name} className={`col-span-1 md:col-span-${field.colSpan || 1}`}>
                        <div className="relative floating-input" data-placeholder={field.label}>
                          {field.type === 'textarea' ? (
                            <textarea
                              value={formValues[field.name] || ''}
                              onChange={(e) => handleChange(field.name, e.target.value)}
                              rows={2}
                              placeholder=" "
                              className="input-field peer w-full"
                            />
                          ) : (
                            <input
                              type={field.type || 'text'}
                              value={formValues[field.name] ?? ''}
                              onChange={(e) => handleChange(field.name, e.target.value)}
                              placeholder=" "
                              min={field.min}
                              max={field.max}
                              step={field.step}
                              className="input-field peer w-full"
                            />
                          )}
                          {field.unit && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">{field.unit}</span>}
                        </div>
                        {warnings && warnings[field.name] && (
                          <div className="mt-2 rounded-md bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 py-2 text-sm flex items-start gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.72-1.36 3.485 0l5.58 9.928c.75 1.334-.213 2.973-1.742 2.973H4.419c-1.53 0-2.492-1.639-1.742-2.973L8.257 3.1zM11 13a1 1 0 10-2 0 1 1 0 002 0zm-1-8a1 1 0 00-.993.883L9 6v4a1 1 0 001.993.117L11 10V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <div>{warnings[field.name]}</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4">
                <button onClick={onClose} className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-md">{cancelLabel || 'Cancel'}</button>
                {['add', 'edit'].includes(mode) && (
                  <button onClick={handleSave} className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-green-600 text-white rounded-md">{saveLabel || (mode === 'edit' ? 'Update' : 'Save')}</button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MedicalVitalModal ---
const defaultFields = [
  { name: 'bloodPressure', label: 'Blood Pressure', type: 'text', placeholder: '120/80', unit: 'mmHg', colSpan: 1 },
  { name: 'heartRate', label: 'Heart Rate', type: 'number', placeholder: '72', unit: 'bpm', min: 30, max: 220, colSpan: 1 },
  { name: 'temperature', label: 'Temperature', type: 'number', placeholder: '36.6', unit: '°C', step: '0.1', min: 30, max: 45, colSpan: 1 },
  { name: 'respiratoryRate', label: 'Respiratory Rate', type: 'number', placeholder: '16', unit: 'b/m', min: 6, max: 60, colSpan: 1 },
  { name: 'spO2', label: 'SpO₂', type: 'number', placeholder: '98', unit: '%', min: 10, max: 100, colSpan: 1 },
  { name: 'height', label: 'Height', type: 'text', placeholder: '170 cm', unit: 'cm', colSpan: 1 },
  { name: 'weight', label: 'Weight', type: 'text', placeholder: '65 kg', unit: 'kg', colSpan: 1 },
];

const computeWarnings = (values) => {
  const warnings = {};
  if (!values) return warnings;

  if (values.heartRate !== undefined && values.heartRate !== '') {
    const hr = Number(values.heartRate);
    if (!Number.isNaN(hr) && (hr < 50 || hr > 110))
      warnings.heartRate = `Out of range (60–100 bpm)`;
  }
  if (values.temperature !== undefined && values.temperature !== '') {
    const t = Number(values.temperature);
    if (!Number.isNaN(t) && (t < 35.5 || t >= 38))
      warnings.temperature = `Abnormal temperature (35.5–37.9°C)`;
  }
  if (values.spO2 !== undefined && values.spO2 !== '') {
    const s = Number(values.spO2);
    if (!Number.isNaN(s) && s < 92)
      warnings.spO2 = `Low SpO₂ (<92%)`;
  }
  if (values.bloodPressure) {
    const m = String(values.bloodPressure).trim().match(/^(\d{2,3})\s*\/\s*(\d{2,3})$/);
    if (m) {
      const sys = Number(m[1]);
      const dia = Number(m[2]);
      if (!Number.isNaN(sys) && !Number.isNaN(dia) && (sys < 90 || sys > 140 || dia < 60 || dia > 90))
        warnings.bloodPressure = `BP out of expected range (90–140 / 60–90 mmHg)`;
    }
  }
  if (values.bloodSugar !== undefined && values.bloodSugar !== '') {
    const bs = Number(values.bloodSugar);
    if (!Number.isNaN(bs) && (bs < 70 || bs > 180))
      warnings.bloodSugar = `Blood sugar out of range (70–180 mg/dL)`;
  }
  if (values.respiratoryRate !== undefined && values.respiratoryRate !== '') {
    const rr = Number(values.respiratoryRate);
    if (!Number.isNaN(rr) && (rr < 12 || rr > 20))
      warnings.respiratoryRate = `Respiratory rate out of range (12–20 b/m)`;
  }
  if (values.height !== undefined && values.height !== '') {
    const h = String(values.height).trim();
    const num = Number(h.replace(/[^\d.]/g, ''));
    if (!Number.isNaN(num) && (num < 50 || num > 250))
      warnings.height = `Height out of range (50–250 cm)`;
  }
  if (values.weight !== undefined && values.weight !== '') {
    const w = String(values.weight).trim();
    const num = Number(w.replace(/[^\d.]/g, ''));
    if (!Number.isNaN(num) && (num < 2 || num > 250))
      warnings.weight = `Weight out of range (2–250 kg)`;
  }
  return warnings;
};

const MedicalVitalModal = ({ isOpen, onClose, initialData = {}, onSave }) => {
  const [formVals, setFormVals] = useState(initialData || {});
  const [warnings, setWarnings] = useState({});

  useEffect(() => {
    if (isOpen) {
      setFormVals(initialData || {});
      setWarnings(computeWarnings(initialData || {}));
    }
  }, [isOpen, initialData]);

  const handleChange = (updated) => {
    setFormVals(updated);
    setWarnings(computeWarnings(updated));
  };

  const handleSave = async (values) => {
    await onSave?.(values);
  };

  return (
    <ReusableModal
      isOpen={isOpen}
      onClose={onClose}
      mode={Object.keys(initialData || {}).length ? 'edit' : 'add'}
      title={Object.keys(initialData || {}).length ? 'Update Vitals' : 'Add Vitals'}
      fields={defaultFields}
      data={formVals}
      onChange={handleChange}
      onSave={handleSave}
      saveLabel="Save"
      warnings={warnings}
    />
  );
};

export default MedicalVitalModal;
