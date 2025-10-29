import React, { useState, useEffect } from 'react';
import { Pill, Save, Printer, Plus, Trash2, Edit, Check, X } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
const defaultMedicine = {
  drugName: '',
  form: '',
  strength: '',
  dosage: 1,
  dosageUnit: 'Tablet',
  frequency: '',
  intake: 'Before Food',
  duration: 1,
};
const frequencyOptions = [
  'once a day',
  'twice a day',
  'three times a day',
  'every 6 hours',
  'every 8 hours',
];
const intakeOptions = ['Before Food', 'After Food'];
const localDrugList = [
  { id: 1, name: 'Dolo 650', strength: '650mg', form: 'Tablet' },
  { id: 2, name: 'Paracetamol', strength: '500mg', form: 'Tablet' },
  { id: 3, name: 'Ibuprofen', strength: '400mg', form: 'Tablet' },
  // ...add more medicines as needed
];
 const PrescriptionForm = ({ data, onSave, onPrint, patient }) => {
  const [prescriptions, setPrescriptions] = useState(
    data?.prescriptions || [{ ...defaultMedicine }]
  );
  const [drugSuggestions, setDrugSuggestions] = useState([]);
  const [activeInputIndex, setActiveInputIndex] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [prescriptionId, setPrescriptionId] = useState(data?.id || null);
  const [isEdit, setIsEdit] = useState(true);
  const handleChange = (i, field, val) => {
    setPrescriptions((prev) =>
      prev.map((p, idx) => (idx === i ? { ...p, [field]: val } : p))
    );
  };
  const addPrescription = () => {
    setPrescriptions((prev) => [...prev, { ...defaultMedicine }]);
  };
  const removePrescription = (i) => {
    setPrescriptions((prev) => prev.filter((_, idx) => idx !== i));
  };
  const handleSave = async () => {
    try {
      const res = await axios.post(
        'https://684ac997165d05c5d35a5118.mockapi.io/digitalprescription',
        {
          prescriptions,
          date: new Date().toLocaleDateString(),
        }
      );
      setIsSaved(true);
      setPrescriptionId(res.data.id);
      setIsEdit(false);
      onSave('prescription', { prescriptions });
      toast.success(' Prescription saved successfully!', {
        position: 'top-right',
        autoClose: 2000,
      });
    } catch (err) {
      toast.error(':x: Failed to save prescription!', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };
  const handleUpdate = async () => {
    try {
      await axios.put(
        `https://684ac997165d05c5d35a5118.mockapi.io/digitalprescription/${prescriptionId}`,
        {
          prescriptions,
          date: new Date().toLocaleDateString(),
        }
      );
      setIsEdit(false);
      onSave('prescription', { prescriptions });
      toast.success('Prescription updated successfully!', {
        position: 'top-right',
        autoClose: 2000,
      });
    } catch (err) {
      toast.error(':x: Failed to update prescription!', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };
  const fetchDrugSuggestions = async (q) => {
    if (q.length < 2) return setDrugSuggestions([]);
    try {
      const res = await axios.get(
        'https://mocki.io/v1/efc542df-dc4c-4b06-9e5b-32567facef11'
      );
      const drugs = res.data.length ? res.data : localDrugList;
      setDrugSuggestions(
        drugs.filter((drug) =>
          drug.name.toLowerCase().includes(q.toLowerCase())
        )
      );
    } catch (err) {
      // fallback to local data
      setDrugSuggestions(
        localDrugList.filter((drug) =>
          drug.name.toLowerCase().includes(q.toLowerCase())
        )
      );
    }
  };
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-slideIn">
      <div className="sub-heading px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Pill className="text-xl text-white" />
          <h3 className="text-white font-semibold">Prescription</h3>
        </div>
        <div className="flex items-center gap-3 text-white">
          <button
            onClick={() => onPrint('prescription')}
            className="hover:bg-[var(--primary-color)] hover:bg-opacity-20 p-2 rounded-lg transition-colors"
          >
            <Printer className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="p-6">
        <div className="rounded-lg p-6 mb-8 bg-white text-black">
          <table className="w-full border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-3 py-2">Medicine</th>
                <th className="px-3 py-2">Dosage</th>
                <th className="px-3 py-2">Frequency</th>
                <th className="px-3 py-2">Intake</th>
                <th className="px-3 py-2">Duration</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {prescriptions.map((med, i) => (
                <tr key={i} className="border-t">
                  <td className="px-3 py-2 relative">
                    <input
                      type="text"
                      className="border-gray-300 shadow-sm rounded p-2 w-full"
                      placeholder="Search Drug..."
                      value={med.drugName}
                      onChange={(e) => {
                        handleChange(i, 'drugName', e.target.value);
                        fetchDrugSuggestions(e.target.value);
                        setActiveInputIndex(i);
                      }}
                      onFocus={() => setActiveInputIndex(i)}
                      onBlur={() =>
                        setTimeout(() => setDrugSuggestions([]), 200)
                      }
                      disabled={!isEdit}
                    />
                    {activeInputIndex === i && drugSuggestions.length > 0 && (
                      <ul className="absolute bg-white border z-10 rounded w-full shadow max-h-48 overflow-y-auto mt-1 text-sm">
                        {drugSuggestions.map((drug) => (
                          <li
                            key={drug.id}
                            onClick={() => {
                              handleChange(i, 'drugName', drug.name);
                              handleChange(i, 'form', drug.form || '');
                              handleChange(i, 'strength', drug.strength || '');
                              setDrugSuggestions([]);
                            }}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          >
                            {drug.name} ({drug.strength}, {drug.form})
                          </li>
                        ))}
                      </ul>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      className="border-gray-300 shadow-sm rounded p-2 w-20"
                      placeholder="Dosage"
                      min="1"
                      value={med.dosage}
                      onChange={(e) =>
                        handleChange(i, 'dosage', e.target.value)
                      }
                      disabled={!isEdit}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <select
                      className="border-gray-300 shadow-sm border rounded p-2"
                      value={med.frequency}
                      onChange={(e) =>
                        handleChange(i, 'frequency', e.target.value)
                      }
                      disabled={!isEdit}
                    >
                      <option value="">Frequency</option>
                      {frequencyOptions.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <select
                      className="border-gray-300 shadow-sm rounded p-2 w-30"
                      value={med.intake}
                      onChange={(e) =>
                        handleChange(i, 'intake', e.target.value)
                      }
                      disabled={!isEdit}
                    >
                      {intakeOptions.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      className="border-gray-300 shadow-sm rounded p-2 w-20"
                      placeholder="Duration"
                      min="1"
                      value={med.duration}
                      onChange={(e) =>
                        handleChange(i, 'duration', e.target.value)
                      }
                      disabled={!isEdit}
                    />
                  </td>
                  <td className="px-3 py-2">
                    {isEdit && (
                      <button
                        onClick={() => removePrescription(i)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {isEdit && (
            <div className="mt-4">
              <button
                onClick={addPrescription}
                className="btn btn-primary text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Medicine
              </button>
            </div>
          )}
        </div>
        <div className="flex gap-3 mt-6 justify-end">
          {!isSaved ? (
            <button onClick={handleSave} className="btn btn-primary text-sm">
              <Save className="w-4 h-4" />
              Save
            </button>
          ) : isEdit ? (
            <>
              <button
                onClick={handleUpdate}
                className="btn btn-primary text-sm"
              >
                <Check className="w-4 h-4" />
                Update
              </button>
              <button
                onClick={() => setIsEdit(false)}
                className="btn-secondary text-sm"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEdit(true)}
              className="btn btn-primary text-sm"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
export default PrescriptionForm;