import React, { useState, useEffect } from 'react';
import { Eye, Save, Printer, Plus, Trash2, Edit, Check, X, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { getVisionTypes, createBulkEyeTests } from "../../../../../utils/masterService";
import { usePatientContext } from '../../../../../context-api/PatientContext';
import { useSelector } from 'react-redux';

const EyeTestForm = ({ data,onSave, onPrint }) => {
  const { activeTab, patient } = usePatientContext();
  const doctorId = useSelector((state) => state.auth.doctorId);
  const [rows, setRows] = useState(data?.rows || []);
  const [editingRow, setEditingRow] = useState(null);
  const [currentRow, setCurrentRow] = useState({
    testDate: new Date().toISOString().split('T')[0],
    visionType: '',
    visionTypeId: 0,
    od_sph: '',
    od_cyl: '',
    od_va: '',
    od_axis: '',
    od_prev_va: '',
    os_sph: '',
    os_cyl: '',
    os_va: '',
    os_axis: '',
    os_prev_va: '',
    remarks: '',
    product: '',
  });
  const [visionTypes, setVisionTypes] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (data?.rows) setRows(data.rows);
  }, [data]);

  useEffect(() => {
    const fetchVisionTypes = async () => {
      try {
        const response = await getVisionTypes();
        setVisionTypes(response.data);
      } catch (error) {
        console.error("Failed to fetch vision types:", error);
        toast.error("Failed to load vision types. Please try again later.", {
          position: 'top-right',
          autoClose: 2000,
        });
      }
    };
    fetchVisionTypes();
  }, []);

  const handleChange = (field, value) => {
    setCurrentRow((prev) => ({ ...prev, [field]: value }));
  };

  const handleVisionTypeChange = (e) => {
    const selectedType = visionTypes.find(type => type.name === e.target.value);
    setCurrentRow((prev) => ({
      ...prev,
      visionType: e.target.value,
      visionTypeId: selectedType?.id || 0,
    }));
  };

  const handleAddRow = () => {
    if (Object.values(currentRow).every((v) => v === '' || v === 0)) {
      toast.warning('Please fill at least one field before adding.');
      return;
    }
    setRows((prev) => [...prev, { ...currentRow }]);
    setCurrentRow({
      testDate: new Date().toISOString().split('T')[0],
      visionType: '',
      visionTypeId: 0,
      od_sph: '',
      od_cyl: '',
      od_va: '',
      od_axis: '',
      od_prev_va: '',
      os_sph: '',
      os_cyl: '',
      os_va: '',
      os_axis: '',
      os_prev_va: '',
      remarks: '',
      product: '',
    });
    toast.success('✅ Eye test record added!', {
      position: 'top-right',
      autoClose: 2000,
    });
  };

  const handleEditRow = (idx) => {
    setEditingRow(idx);
    setCurrentRow(rows[idx]);
  };

  const handleSaveEdit = () => {
    setRows((prev) => prev.map((row, idx) => (idx === editingRow ? { ...currentRow } : row)));
    setEditingRow(null);
    setCurrentRow({
      testDate: new Date().toISOString().split('T')[0],
      visionType: '',
      visionTypeId: 0,
      od_sph: '',
      od_cyl: '',
      od_va: '',
      od_axis: '',
      od_prev_va: '',
      os_sph: '',
      os_cyl: '',
      os_va: '',
      os_axis: '',
      os_prev_va: '',
      remarks: '',
      product: '',
    });
    toast.success('✅ Eye test record updated!', {
      position: 'top-right',
      autoClose: 2000,
    });
  };

  const handleRemoveRow = (idx) => {
    setRows((prev) => prev.filter((_, i) => i !== idx));
    if (editingRow === idx) setEditingRow(null);
    toast.success('✅ Eye test record removed!', {
      position: 'top-right',
      autoClose: 2000,
    });
  };

  const handleSave = async () => {
    if (rows.length === 0) {
      toast.warning("No records to save.", {
        position: 'top-right',
        autoClose: 2000,
      });
      return;
    }

    setIsSaving(true);
    try {
      const payload = rows.map(row => ({
        patientId: patient?.patientId,
        doctorId: doctorId || 1,
        context: activeTab.toUpperCase(),
        testDate: row.testDate,
        visionTypeId: row.visionTypeId || 1,
        remark: row.remarks || "No remarks",
        product: row.product || "No product",
        rightSph: row.od_sph || "0",
        rightCyl: row.od_cyl || "0",
        rightVa: row.od_va || "20/20",
        rightAxis: row.od_axis || "0",
        rightPreviousVa: row.od_prev_va || "20/20",
        leftSph: row.os_sph || "0",
        leftCyl: row.os_cyl || "0",
        leftVa: row.os_va || "20/20",
        leftAxis: row.os_axis || "0",
        leftPreviousVa: row.os_prev_va || "20/20",
      }));
      console.log("Payload being sent:", payload);
      const response = await createBulkEyeTests(payload);
      console.log("API response:", response.data);
      if (!response.data) {
        toast.warning("API returned an empty response. Check backend logs.", {
          position: 'top-right',
          autoClose: 5000,
        });
        return;
      }
      onSave('eye', { rows });
      toast.success("Eye test records saved successfully!", {
        position: 'top-right',
        autoClose: 2000,
      });
    } catch (error) {
      console.error("Failed to save eye test records:", error);
      const errorMessage = error.response?.data?.message || "Failed to save eye test records. Please try again.";
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 2000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full mx-auto bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-slideIn">
      {/* Header */}
      <div className="sub-heading px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Eye className="text-xl text-white" />
          <h3 className="text-white font-semibold">Eye Test Examination</h3>
        </div>
        <div className="flex items-center gap-3 text-white">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="hover:bg-[var(--primary-color)] hover:bg-opacity-20 p-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          </button>
          <button
            onClick={() => onPrint('eye')}
            className="hover:bg-[var(--primary-color)] hover:bg-opacity-20 p-2 rounded-lg transition-colors"
          >
            <Printer className="w-5 h-5" />
          </button>
        </div>
      </div>
      {/* Form Content */}
      <div className="p-3 bg-gray-50">
        {/* Form Input Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h4 className="h4-heading mb-4">
            {editingRow !== null ? 'Edit Eye Test Record' : 'Add New Eye Test Record'}
          </h4>
          {/* Basic Info Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-[var(--primary-color)] mb-2">
                Test Date
              </label>
              <input
                type="date"
                value={currentRow.testDate || ''}
                onChange={(e) => handleChange('testDate', e.target.value)}
                className="input-field text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--primary-color)] mb-2">
                Vision Type
              </label>
              <select
                value={currentRow.visionType || ''}
                onChange={handleVisionTypeChange}
                className="input-field text-sm"
              >
                <option value="">Select Type</option>
                {visionTypes.map((type) => (
                  <option key={type.id} value={type.name}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--primary-color)] mb-2">
                Remarks
              </label>
              <input
                type="text"
                value={currentRow.remarks || ''}
                onChange={(e) => handleChange('remarks', e.target.value)}
                className="input-field text-sm"
                placeholder="Additional notes"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--primary-color)] mb-2">
                Product
              </label>
              <input
                type="text"
                value={currentRow.product || ''}
                onChange={(e) => handleChange('product', e.target.value)}
                className="input-field text-sm"
                placeholder="Lens type/brand"
              />
            </div>
          </div>
          {/* Eye Measurements */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Right Eye */}
            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
              <h5 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Right Eye (OD) Measurements
              </h5>
              <div className="grid grid-cols-2 gap-3">
                {['od_sph', 'od_cyl', 'od_va', 'od_axis'].map((field) => (
                  <div key={field}>
                    <label className="block text-xs font-medium text-blue-700 mb-1">
                      {field.split('_')[1].toUpperCase()}
                    </label>
                    <input
                      type="text"
                      value={currentRow[field] || ''}
                      onChange={(e) => handleChange(field, e.target.value)}
                      className="input-field text-sm"
                      placeholder={
                        field === 'od_sph'
                          ? 'e.g. -2.50'
                          : field === 'od_cyl'
                          ? 'e.g. -1.25'
                          : field === 'od_va'
                          ? 'e.g. 20/20'
                          : 'e.g. 90°'
                      }
                    />
                  </div>
                ))}
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-blue-700 mb-1">
                    Previous V/A
                  </label>
                  <input
                    type="text"
                    value={currentRow.od_prev_va || ''}
                    onChange={(e) => handleChange('od_prev_va', e.target.value)}
                    className="input-field text-sm"
                    placeholder="Previous visual acuity"
                  />
                </div>
              </div>
            </div>
            {/* Left Eye */}
            <div className="border border-green-200 rounded-lg p-4 bg-green-50">
              <h5 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Left Eye (OS) Measurements
              </h5>
              <div className="grid grid-cols-2 gap-3">
                {['os_sph', 'os_cyl', 'os_va', 'os_axis'].map((field) => (
                  <div key={field}>
                    <label className="block text-xs font-medium text-green-700 mb-1">
                      {field.split('_')[1].toUpperCase()}
                    </label>
                    <input
                      type="text"
                      value={currentRow[field] || ''}
                      onChange={(e) => handleChange(field, e.target.value)}
                      className="input-field text-sm"
                      placeholder={
                        field === 'os_sph'
                          ? 'e.g. -2.00'
                          : field === 'os_cyl'
                          ? 'e.g. -1.00'
                          : field === 'os_va'
                          ? 'e.g. 20/25'
                          : 'e.g. 180°'
                      }
                    />
                  </div>
                ))}
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-green-700 mb-1">
                    Previous V/A
                  </label>
                  <input
                    type="text"
                    value={currentRow.os_prev_va || ''}
                    onChange={(e) => handleChange('os_prev_va', e.target.value)}
                    className="input-field text-sm"
                    placeholder="Previous visual acuity"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            {editingRow === null ? (
              <button
                onClick={handleAddRow}
                className="btn btn-primary get-details-animate text-xs px-3 py-2 sm:px-4 sm:py-2"
              >
                <Plus className="w-4 h-4" />
                Add Record
              </button>
            ) : (
              <>
                <button
                  onClick={handleSaveEdit}
                  className="btn btn-primary text-xs px-3 py-2 sm:px-4 sm:py-2"
                >
                  <Check className="w-4 h-4" />
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setEditingRow(null);
                    setCurrentRow({
                      testDate: new Date().toISOString().split('T')[0],
                      visionType: '',
                      visionTypeId: 0,
                      od_sph: '',
                      od_cyl: '',
                      od_va: '',
                      od_axis: '',
                      od_prev_va: '',
                      os_sph: '',
                      os_cyl: '',
                      os_va: '',
                      os_axis: '',
                      os_prev_va: '',
                      remarks: '',
                      product: '',
                    });
                  }}
                  className="btn-secondary text-xs px-3 py-2 sm:px-4 sm:py-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
        {/* Records Table (Responsive) */}
        {rows.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="table-head text-center py-3">
              <h4>Eye Test Records</h4>
            </div>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="table-container w-full">
                <thead className="table-head">
                  <tr>
                    <th className="text-xs p-2">Date</th>
                    <th className="text-xs p-2">Type</th>
                    <th className="text-xs p-2">OD SPH</th>
                    <th className="text-xs p-2">OD CYL</th>
                    <th className="text-xs p-2">OD V/A</th>
                    <th className="text-xs p-2">OD AXIS</th>
                    <th className="text-xs p-2">OS SPH</th>
                    <th className="text-xs p-2">OS CYL</th>
                    <th className="text-xs p-2">OS V/A</th>
                    <th className="text-xs p-2">OS AXIS</th>
                    <th className="text-xs p-2">Remarks</th>
                    <th className="text-xs p-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {rows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="text-xs p-2">{row.testDate || '-'}</td>
                      <td className="text-xs p-2">{row.visionType || '-'}</td>
                      <td className="text-xs p-2">{row.od_sph || '-'}</td>
                      <td className="text-xs p-2">{row.od_cyl || '-'}</td>
                      <td className="text-xs p-2">{row.od_va || '-'}</td>
                      <td className="text-xs p-2">{row.od_axis || '-'}</td>
                      <td className="text-xs p-2">{row.os_sph || '-'}</td>
                      <td className="text-xs p-2">{row.os_cyl || '-'}</td>
                      <td className="text-xs p-2">{row.os_va || '-'}</td>
                      <td className="text-xs p-2">{row.os_axis || '-'}</td>
                      <td className="text-xs p-2">{row.remarks || '-'}</td>
                      <td className="text-xs p-2">
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEditRow(idx)}
                            className="edit-btn text-xs p-1"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleRemoveRow(idx)}
                            className="delete-btn text-xs p-1"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile Card View */}
            <div className="md:hidden p-2">
              {rows.map((row, idx) => (
                <div
                  key={idx}
                  className="border border-gray-200 rounded-lg p-2 mb-2 bg-gray-50"
                >
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 text-xs">
                    <div><strong>Date:</strong> {row.testDate || '-'}</div>
                    <div><strong>Type:</strong> {row.visionType || '-'}</div>
                    <div><strong>OD SPH:</strong> {row.od_sph || '-'}</div>
                    <div><strong>OD CYL:</strong> {row.od_cyl || '-'}</div>
                    <div><strong>OD V/A:</strong> {row.od_va || '-'}</div>
                    <div><strong>OD AXIS:</strong> {row.od_axis || '-'}</div>
                    <div><strong>OS SPH:</strong> {row.os_sph || '-'}</div>
                    <div><strong>OS CYL:</strong> {row.os_cyl || '-'}</div>
                    <div><strong>OS V/A:</strong> {row.os_va || '-'}</div>
                    <div><strong>OS AXIS:</strong> {row.os_axis || '-'}</div>
                    <div className="col-span-2"><strong>Remarks:</strong> {row.remarks || '-'}</div>
                    <div className="flex gap-1 justify-end col-span-2">
                      <button
                        onClick={() => handleEditRow(idx)}
                        className="edit-btn text-xs p-1"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleRemoveRow(idx)}
                        className="delete-btn text-xs p-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EyeTestForm;
