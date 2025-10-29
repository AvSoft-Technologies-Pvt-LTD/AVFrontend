import React, { useState, useEffect } from 'react';
import { Stethoscope, Save, Printer, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { getDentalProblems, getTreatmentActionPlans, getJawPositions } from "../../../../../utils/masterService";
import { usePatientContext } from '../../../../../context-api/PatientContext'; // Update this path

const DENTAL_TEETH_NUMBERS = Array.from({ length: 32 }, (_, i) => i + 1);

const DentalForm = ({ data, onSave, onPrint, patient }) => {
  const { activeTab, patients } = usePatientContext();
  const [plans, setPlans] = useState(data?.plans || []);
  const [currentPlan, setCurrentPlan] = useState({
    teeth: [],
    problems: [],
    actions: [],
    positions: [],
  });
  const [dentalProblems, setDentalProblems] = useState([]);
  const [treatmentActionPlans, setTreatmentActionPlans] = useState([]);
  const [jawPositions, setJawPositions] = useState([]);

  useEffect(() => {
    console.log("Active Tab:", activeTab);
    console.log("Patient ID:", patient?.id);
  }, [activeTab, patient]);

  useEffect(() => {
    if (data?.plans) setPlans(data.plans);
  }, [data]);

  useEffect(() => {
    const fetchDentalProblems = async () => {
      try {
        const response = await getDentalProblems();
        setDentalProblems(response.data);
      } catch (error) {
        console.error("Failed to fetch dental problems:", error);
        toast.error("Failed to load dental problems. Please try again later.", {
          position: 'top-right',
          autoClose: 2000,
        });
      }
    };
    fetchDentalProblems();
  }, []);

  useEffect(() => {
    const fetchTreatmentActionPlans = async () => {
      try {
        const response = await getTreatmentActionPlans();
        setTreatmentActionPlans(response.data);
      } catch (error) {
        console.error("Failed to fetch treatment action plans:", error);
        toast.error("Failed to load treatment action plans. Please try again later.", {
          position: 'top-right',
          autoClose: 2000,
        });
      }
    };
    fetchTreatmentActionPlans();
  }, []);

  useEffect(() => {
    const fetchJawPositions = async () => {
      try {
        const response = await getJawPositions();
        setJawPositions(response.data);
      } catch (error) {
        console.error("Failed to fetch jaw positions:", error);
        toast.error("Failed to load jaw positions. Please try again later.", {
          position: 'top-right',
          autoClose: 2000,
        });
      }
    };
    fetchJawPositions();
  }, []);

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
    ) {
      toast.warning('Please select at least one option before adding.');
      return;
    }
    setPlans((prev) => [...prev, currentPlan]);
    setCurrentPlan({ teeth: [], problems: [], actions: [], positions: [] });
    toast.success('Dental plan added successfully!', {
      position: 'top-right',
      autoClose: 2000,
    });
  };

  const handleRemovePlan = (idx) => {
    setPlans((prev) => prev.filter((_, i) => i !== idx));
    toast.success('Dental plan removed successfully!', {
      position: 'top-right',
      autoClose: 2000,
    });
  };

  const handleSave = () => {
    onSave('dental', { plans });
    toast.success('Dental problem action plan saved!', {
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
          <button
            onClick={handleSave}
            className="hover:bg-[var(--primary-color)] hover:bg-opacity-20 p-2 rounded-lg transition-colors"
          >
            <Save className="w-5 h-5" />
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
            <div className="flex flex-col gap-3">
              {/* Upper Jaw (Teeth 1-16) */}
              <div className="grid grid-cols-8 gap-2">
                {DENTAL_TEETH_NUMBERS.slice(0, 16).map((num) => (
                  <label
                    key={num}
                    className="flex justify-center items-center text-xs cursor-pointer hover:bg-blue-50 py-2 rounded"
                  >
                    <span className="text-[var(--primary-color)]">{num}</span>
                    <input
                      type="checkbox"
                      checked={currentPlan.teeth.includes(num)}
                      onChange={() => handleTeethChange(num)}
                      className="ml-1 text-[var(--accent-color)] focus:ring-[var(--accent-color)]"
                    />
                  </label>
                ))}
              </div>
              {/* Lower Jaw (Teeth 17-32) */}
              <div className="grid grid-cols-8 gap-2">
                {DENTAL_TEETH_NUMBERS.slice(16).map((num) => (
                  <label
                    key={num}
                    className="flex justify-center items-center text-xs cursor-pointer hover:bg-blue-50 py-2 rounded"
                  >
                    <span className="text-[var(--primary-color)]">{num}</span>
                    <input
                      type="checkbox"
                      checked={currentPlan.teeth.includes(num)}
                      onChange={() => handleTeethChange(num)}
                      className="ml-1 text-[var(--accent-color)] focus:ring-[var(--accent-color)]"
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
          {/* Dental Problems */}
          <div>
            <div className="font-medium mb-3 text-[var(--primary-color)]">
              Dental Problems
            </div>
            <div className="flex flex-col gap-2 max-h-32 overflow-y-auto">
              {dentalProblems.map((problem) => (
                <label
                  key={problem.id}
                  className="flex items-center gap-2 text-sm cursor-pointer hover:bg-red-50 p-2 rounded"
                >
                  <input
                    type="checkbox"
                    checked={currentPlan.problems.includes(problem.name)}
                    onChange={() => handleProblemChange(problem.name)}
                    className="text-red-500 focus:ring-red-500"
                  />
                  <span className="text-[var(--primary-color)]">{problem.name}</span>
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
              {treatmentActionPlans.map((action) => (
                <label
                  key={action.id}
                  className="flex items-center gap-2 text-sm cursor-pointer hover:bg-green-50 p-2 rounded"
                >
                  <input
                    type="checkbox"
                    checked={currentPlan.actions.includes(action.name)}
                    onChange={() => handleActionChange(action.name)}
                    className="text-green-500 focus:ring-green-500"
                  />
                  <span className="text-[var(--primary-color)]">{action.name}</span>
                </label>
              ))}
            </div>
          </div>
          {/* Position */}
          <div>
            <div className="font-medium mb-3 text-[var(--primary-color)]">
              Jaw Position
            </div>
            <div className="flex flex-col gap-2 max-h-32 overflow-y-auto">
              {jawPositions.map((pos) => (
                <label
                  key={pos.id}
                  className="flex items-center gap-2 text-sm cursor-pointer hover:bg-purple-50 p-2 rounded"
                >
                  <input
                    type="checkbox"
                    checked={currentPlan.positions.includes(pos.name)}
                    onChange={() => handlePositionChange(pos.name)}
                    className="text-purple-500 focus:ring-purple-500"
                  />
                  <span className="text-[var(--primary-color)]">{pos.name}</span>
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