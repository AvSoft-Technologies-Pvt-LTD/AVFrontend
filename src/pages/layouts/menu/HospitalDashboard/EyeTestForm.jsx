import React, { useState, useEffect } from 'react';
import { Eye, Save, Printer, Plus, Trash2, Edit, Check, X } from 'lucide-react';
import { toast } from 'react-toastify';

 const EyeTestForm = ({ data, onSave, onPrint, patient }) => {
  const [rows, setRows] = useState(data?.rows || []);
  const [editingRow, setEditingRow] = useState(null);
  const [currentRow, setCurrentRow] = useState({
    testDate: new Date().toISOString().split('T')[0],
    visionType: '',
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

  useEffect(() => {
    if (data?.rows) setRows(data.rows);
  }, [data]);

  const handleChange = (field, value) => {
    setCurrentRow((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddRow = () => {
    if (Object.values(currentRow).every((v) => v === '')) {
      toast.warning('Please fill at least one field before adding.');
      return;
    }
    setRows((prev) => [...prev, currentRow]);
    setCurrentRow({
      testDate: new Date().toISOString().split('T')[0],
      visionType: '',
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
    setRows((prev) =>
      prev.map((row, idx) => (idx === editingRow ? currentRow : row))
    );
    setEditingRow(null);
    setCurrentRow({
      testDate: new Date().toISOString().split('T')[0],
      visionType: '',
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

  const handleSave = () => {
    onSave('eye', { rows });
    toast.success('✅ Eye test saved!', {
      position: 'top-right',
      autoClose: 2000,
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-slideIn">
      <div className="sub-heading px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Eye className="text-xl text-white" />
          <h3 className="text-white font-semibold">Eye Test Examination</h3>
        </div>
        <div className="flex items-center gap-3 text-white">
          <button onClick={handleSave} className="btn btn-primary text-sm">
            <Save className="w-4 h-4" />
            Save
          </button>
          <button
            onClick={() => onPrint('eye')}
            className="hover:bg-[var(--primary-color)] hover:bg-opacity-20 p-2 rounded-lg transition-colors"
          >
            <Printer className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-6 bg-gray-50">
        {/* Form Input Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h4 className="h4-heading mb-4">
            {editingRow !== null
              ? 'Edit Eye Test Record'
              : 'Add New Eye Test Record'}
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
                onChange={(e) => handleChange('visionType', e.target.value)}
                className="input-field text-sm"
              >
                <option value="">Select Type</option>
                <option value="Distance">Distance Vision</option>
                <option value="Near">Near Vision</option>
                <option value="Bifocal">Bifocal</option>
                <option value="Progressive">Progressive</option>
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
                      placeholder={field === 'od_sph' ? 'e.g. -2.50' : field === 'od_cyl' ? 'e.g. -1.25' : field === 'od_va' ? 'e.g. 20/20' : 'e.g. 90°'}
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
                      placeholder={field === 'os_sph' ? 'e.g. -2.00' : field === 'os_cyl' ? 'e.g. -1.00' : field === 'os_va' ? 'e.g. 20/25' : 'e.g. 180°'}
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

          {/* Action Buttons */}
          <div className="mt-6 flex justify-end gap-3">
            {editingRow === null ? (
              <button
                onClick={handleAddRow}
                className="btn btn-primary get-details-animate"
              >
                <Plus className="w-4 h-4" />
                Add Record
              </button>
            ) : (
              <>
                <button onClick={handleSaveEdit} className="btn btn-primary">
                  <Check className="w-4 h-4" />
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setEditingRow(null);
                    setCurrentRow({
                      testDate: new Date().toISOString().split('T')[0],
                      visionType: '',
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
                  className="btn-secondary animated-cancel-btn"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>

        {/* Records Table */}
        {rows.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="table-head text-center py-3">
              <h4>Eye Test Records</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="table-container">
                <thead className="table-head">
                  <tr>
                    <th className="text-xs">Date</th>
                    <th className="text-xs">Type</th>
                    <th className="text-xs">OD SPH</th>
                    <th className="text-xs">OD CYL</th>
                    <th className="text-xs">OD V/A</th>
                    <th className="text-xs">OD AXIS</th>
                    <th className="text-xs">OS SPH</th>
                    <th className="text-xs">OS CYL</th>
                    <th className="text-xs">OS V/A</th>
                    <th className="text-xs">OS AXIS</th>
                    <th className="text-xs">Remarks</th>
                    <th className="text-xs">Actions</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {rows.map((row, idx) => (
                    <tr key={idx} className="tr-style hover:bg-gray-50">
                      <td className="text-xs">{row.testDate || '-'}</td>
                      <td className="text-xs">{row.visionType || '-'}</td>
                      <td className="text-xs">{row.od_sph || '-'}</td>
                      <td className="text-xs">{row.od_cyl || '-'}</td>
                      <td className="text-xs">{row.od_va || '-'}</td>
                      <td className="text-xs">{row.od_axis || '-'}</td>
                      <td className="text-xs">{row.os_sph || '-'}</td>
                      <td className="text-xs">{row.os_cyl || '-'}</td>
                      <td className="text-xs">{row.os_va || '-'}</td>
                      <td className="text-xs">{row.os_axis || '-'}</td>
                      <td className="text-xs">{row.remarks || '-'}</td>
                      <td className="text-xs">
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEditRow(idx)}
                            className="edit-btn text-xs"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleRemoveRow(idx)}
                            className="delete-btn text-xs"
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
          </div>
        )}
      </div>
    </div>
  );
};
export default EyeTestForm;