import React, { useState, useEffect } from 'react';
import { Stethoscope, Save, Printer, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
const DENTAL_TEETH_NUMBERS = Array.from({ length: 32 }, (_, i) => i + 1);
const DENTAL_PROBLEMS = [
  'Dental Caries',
  'Gingivitis',
  'Periodontitis',
  'Tooth Sensitivity',
  'Enamel Erosion',
  'Tooth Fracture',
  'Root Canal Infection',
  'Impacted Wisdom Tooth',
  'Malocclusion',
  'TMJ Disorder',
  'Oral Ulcers',
  'Tartar Build-up',
];
const DENTAL_ACTIONS = [
  'Dental Filling',
  'Root Canal Treatment',
  'Crown Placement',
  'Tooth Extraction',
  'Deep Cleaning',
  'Fluoride Treatment',
  'Dental Scaling',
  'Orthodontic Treatment',
  'Gum Surgery',
  'Tooth Whitening',
  'Dental Bridge',
  'Implant Placement',
];
const DENTAL_POSITIONS = [
  'Upper Left',
  'Upper Right',
  'Lower Left',
  'Lower Right',
];
 const DentalForm = ({ data, onSave, onPrint, patient }) => {
  const [plans, setPlans] = useState(data?.plans || []);
  const [currentPlan, setCurrentPlan] = useState({
    teeth: [],
    problems: [],
    actions: [],
    positions: [],
  });
  useEffect(() => {
    if (data?.plans) setPlans(data.plans);
  }, [data]);
  const handleTeethChange = (num) => {
    setCurrentPlan((prev) => ({
      ...prev,
      teeth: prev.teeth.includes(num)
        ? prev.teeth.filter((t) => t !== num)
        : [...prev.teeth, num],
    }));
  };
  const handleProblemChange = (problem) => {
    setCurrentPlan((prev) => ({
      ...prev,
      problems: prev.problems.includes(problem)
        ? prev.problems.filter((p) => p !== problem)
        : [...prev.problems, problem],
    }));
  };
  const handleActionChange = (action) => {
    setCurrentPlan((prev) => ({
      ...prev,
      actions: prev.actions.includes(action)
        ? prev.actions.filter((a) => a !== action)
        : [...prev.actions, action],
    }));
  };
  const handlePositionChange = (pos) => {
    setCurrentPlan((prev) => ({
      ...prev,
      positions: prev.positions.includes(pos)
        ? prev.positions.filter((p) => p !== pos)
        : [...prev.positions, pos],
    }));
  };
  const handleAddPlan = () => {
    if (
      currentPlan.teeth.length === 0 &&
      currentPlan.problems.length === 0 &&
      currentPlan.actions.length === 0 &&
      currentPlan.positions.length === 0
    )
      return;
    setPlans((prev) => [...prev, currentPlan]);
    setCurrentPlan({ teeth: [], problems: [], actions: [], positions: [] });
    toast.success('Dental plan added successfully!', {
      position: 'top-right',
      autoClose: 2000,
    });
  };
  const handleRemovePlan = (idx) => {
    setPlans((prev) => prev.filter((_, i) => i !== idx));
    toast.success(' Dental plan removed successfully!', {
      position: 'top-right',
      autoClose: 2000,
    });
  };
  const handleSave = () => {
    onSave('dental', { plans });
    toast.success(' Dental problem action plan saved!', {
      position: 'top-right',
      autoClose: 2000,
    });
  };
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-slideIn">
      <div className="sub-heading px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Stethoscope className="text-xl text-white" />
          <h3 className="text-white font-semibold">
            Dental Problem Action Plan
          </h3>
        </div>
        <div className="flex items-center gap-3 text-white">
          <button onClick={handleSave} className="btn btn-primary text-sm">
            <Save className="w-4 h-4" />
            Save
          </button>
          <button
            onClick={() => onPrint('dental')}
            className="hover:bg-[var(--primary-color)] hover:bg-opacity-20 p-2 rounded-lg transition-colors"
          >
            <Printer className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="p-6 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Reference Teeth Numbers */}
          <div>
            <div className="font-medium mb-3 text-[var(--primary-color)]">
              Reference Teeth Numbers
            </div>
            <div className="grid grid-cols-8 gap-1 max-h-32 ">
              {DENTAL_TEETH_NUMBERS.map((num) => (
                <label
                  key={num}
                  className="flex items-center gap-1 text-xs cursor-pointer hover:bg-blue-50 p-1 rounded"
                >
                  <input
                    type="checkbox"
                    checked={currentPlan.teeth.includes(num)}
                    onChange={() => handleTeethChange(num)}
                    className="text-[var(--accent-color)] focus:ring-[var(--accent-color)]"
                  />
                  <span className="text-[var(--primary-color)]">{num}</span>
                </label>
              ))}
            </div>
          </div>
          {/* Dental Problems */}
          <div>
            <div className="font-medium mb-3 text-[var(--primary-color)]">
              Dental Problems
            </div>
            <div className="flex flex-col gap-2 max-h-32 overflow-y-auto">
              {DENTAL_PROBLEMS.map((problem) => (
                <label
                  key={problem}
                  className="flex items-center gap-2 text-sm cursor-pointer hover:bg-red-50 p-2 rounded"
                >
                  <input
                    type="checkbox"
                    checked={currentPlan.problems.includes(problem)}
                    onChange={() => handleProblemChange(problem)}
                    className="text-red-500 focus:ring-red-500"
                  />
                  <span className="text-[var(--primary-color)]">{problem}</span>
                </label>
              ))}
            </div>
          </div>
          {/* Action Plans */}
          <div>
            <div className="font-medium mb-3 text-[var(--primary-color)]">
              Treatment Action Plans
            </div>
            <div className="flex flex-col gap-2 max-h-32 overflow-y-auto">
              {DENTAL_ACTIONS.map((action) => (
                <label
                  key={action}
                  className="flex items-center gap-2 text-sm cursor-pointer hover:bg-green-50 p-2 rounded"
                >
                  <input
                    type="checkbox"
                    checked={currentPlan.actions.includes(action)}
                    onChange={() => handleActionChange(action)}
                    className="text-green-500 focus:ring-green-500"
                  />
                  <span className="text-[var(--primary-color)]">{action}</span>
                </label>
              ))}
            </div>
          </div>
          {/* Position */}
          <div>
            <div className="font-medium mb-3 text-[var(--primary-color)]">
              Jaw Position
            </div>
            <div className="flex flex-col gap-2">
              {DENTAL_POSITIONS.map((pos) => (
                <label
                  key={pos}
                  className="flex items-center gap-2 text-sm cursor-pointer hover:bg-purple-50 p-2 rounded"
                >
                  <input
                    type="checkbox"
                    checked={currentPlan.positions.includes(pos)}
                    onChange={() => handlePositionChange(pos)}
                    className="text-purple-500 focus:ring-purple-500"
                  />
                  <span className="text-[var(--primary-color)]">{pos}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6">
          <button
            onClick={handleAddPlan}
            className="btn btn-primary get-details-animate"
          >
            <Plus className="w-4 h-4" />
            Add Dental Plan
          </button>
        </div>
        {/* Added Plans List */}
        {plans.length > 0 && (
          <div className="mt-8">
            <div className="h4-heading mb-4">Added Dental Plans:</div>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-lg bg-white">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-2 py-2 text-xs font-semibold text-[var(--primary-color)]">
                      Teeth
                    </th>
                    <th className="px-2 py-2 text-xs font-semibold text-[var(--primary-color)]">
                      Problems
                    </th>
                    <th className="px-2 py-2 text-xs font-semibold text-[var(--primary-color)]">
                      Actions
                    </th>
                    <th className="px-2 py-2 text-xs font-semibold text-[var(--primary-color)]">
                      Position
                    </th>
                    <th className="px-2 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map((plan, idx) => (
                    <tr key={idx} className="border-b border-gray-200">
                      <td className="px-2 py-2 text-xs">
                        {plan.teeth.join(', ') || 'None selected'}
                      </td>
                      <td className="px-2 py-2 text-xs">
                        {plan.problems.join(', ') || 'None selected'}
                      </td>
                      <td className="px-2 py-2 text-xs">
                        {plan.actions.join(', ') || 'None selected'}
                      </td>
                      <td className="px-2 py-2 text-xs">
                        {plan.positions.join(', ') || 'None selected'}
                      </td>
                      <td className="px-2 py-2 text-center">
                        <button
                          onClick={() => handleRemovePlan(idx)}
                          className="text-red-500 hover:text-white hover:bg-red-500 p-2 rounded-full transition-colors shadow-md border border-red-200"
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
export default DentalForm;