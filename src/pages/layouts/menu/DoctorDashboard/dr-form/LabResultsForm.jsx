import React, { useState, useEffect } from "react";
import { FlaskRound as Flask, Printer, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { usePatientContext } from "../../../../../context-api/PatientContext";
import { useSelector } from "react-redux";
import { getLabTests, createLabAction, deleteLabAction } from "../../../../../utils/masterService";

const LabResultsForm = ({ data = {}, onSave, onPrint, hospitalName, ptemail }) => {
  const { activeTab, patients } = usePatientContext();

  // State
  const [labTests, setLabTests] = useState([]);
  const [selectedTests, setSelectedTests] = useState([]);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [highlightedTest, setHighlightedTest] = useState(null);

  const doctorId = useSelector((state) => state.auth.doctorId);

  const currentPatient = patients.find(patient => patient.tab === activeTab);
  const patientId = currentPatient?.id || 1;

  useEffect(() => {
    console.log("PatientContext - Active Tab:", activeTab);
    console.log("PatientContext - Patients:", patients);
    console.log("Current Patient:", currentPatient);
    console.log("Patient ID:", patientId);
  }, [activeTab, patients, currentPatient, patientId]);

  // Fetch lab tests
  useEffect(() => {
    getLabTests()
      .then((res) => {
        const normalizedData = res.data.map((item) => ({
          id: item.id,
          name: item.name || item.testName || "Unknown Test",
          code:
            item.code ||
            item.testCode ||
            (item.name ? item.name.toLowerCase().replace(/\s+/g, "_") : "N/A"),
          instructions: item.instructions || item.description || "No instructions provided",
        }));
        setLabTests(normalizedData);
      })
      .catch((error) => {
        console.error("Error fetching lab tests:", error);
        setLabTests([]);
      });
  }, []);

  // Search filter
  useEffect(() => {
    const searchTerm = search.trim().toLowerCase();
    if (!searchTerm) return setResults([]);

    const filtered = labTests.filter((t) => {
      const nameMatch = t.name && t.name.toLowerCase().includes(searchTerm);
      const codeMatch = t.code && t.code.toLowerCase().includes(searchTerm);
      return nameMatch || codeMatch;
    });
    setResults(filtered);
  }, [search, labTests]);

  // POST lab tests to server and store response.data.id
  const postLabTests = async (tests) => {
    try {
      const labIds = tests.map(test => test.id);
      const payload = {
        patientId,
        doctorId: doctorId || 1,
        context: (activeTab || "").toUpperCase(),
        labIds,
      };
      console.log("Payload for createLabAction:", payload);

      const response = await createLabAction(payload);
      console.log("Response from createLabAction:", response);

      // response.data.id will be stored in labActionId for each test
      const updatedTests = tests.map((test, idx) => ({
        ...test,
        labActionId: Array.isArray(response.data) ? response.data[idx]?.id : response.data.id,
      }));

      setSelectedTests(updatedTests);
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      toast.error("Failed to save lab tests");
    }
  };

  const handleSelectTest = (t) => {
    setHighlightedTest(t);
    setSearch(t.name);
  };

  const handleAddTest = async () => {
    if (!highlightedTest) {
      toast.error("No test selected!");
      return;
    }

    if (selectedTests.some(t => t.id === highlightedTest.id)) {
      toast.error("Test already added!");
      return;
    }

    const newTest = { ...highlightedTest };
    const updated = [...selectedTests, newTest];
    setSelectedTests(updated);
    onSave?.("lab", { ...data, selectedTests: updated });
    await postLabTests(updated);

    toast.success("Lab test added successfully!");
    setSearch("");
    setHighlightedTest(null);
    setResults([]);
  };

  // Remove test using labActionId from server
  const removeTest = async (id) => {
    try {
      const testToRemove = selectedTests.find(t => t.id === id);
      if (!testToRemove?.labActionId) {
        toast.error("Cannot remove test. Server ID missing.");
        return;
      }

      await deleteLabAction(testToRemove.labActionId);
      const updated = selectedTests.filter((t) => t.id !== id);
      setSelectedTests(updated);
      toast.error(`${testToRemove.name} removed`);
    } catch (error) {
      console.error("Delete Error:", error.response?.data || error.message);
      toast.error("Failed to remove test");
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setHighlightedTest(null);
  };

  const handleRejectTest = () => {
    toast.error("Test selection rejected");
    setSearch("");
    setHighlightedTest(null);
  };

  // Clear tests when patient changes
  useEffect(() => {
    setSelectedTests([]);
  }, [patients, activeTab]);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-slideIn">
      <div className="sub-heading px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Flask className="text-xl text-white" />
          <h3 className="text-white font-semibold">Lab Tests</h3>
        </div>
        <div className="flex items-center gap-3 text-white">
          <button
            onClick={() => onPrint("lab")}
            className="hover:bg-[var(--primary-color)] hover:bg-opacity-20 p-2 rounded-lg transition-colors"
          >
            <Printer className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="p-6 space-y-4">
        {/* Search Box */}
        <div>
          <label className="block text-sm font-medium text-[var(--primary-color)] mb-2">
            Search Lab Test
          </label>
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Type test name or code..."
              className="input-field pr-10 transition-all duration-200"
            />
            {search && (
              <button
                type="button"
                onClick={handleRejectTest}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 bg-white shadow-sm hover:shadow-md rounded-full w-5 h-5 flex items-center justify-center transition-all duration-200 animate-fadeIn"
              >
                ✕
              </button>
            )}
          </div>

          {search && (
            results.length > 0 ? (
              <div className="border border-gray-200 rounded-lg bg-white mt-2 max-h-32 overflow-auto shadow-lg">
                {results.slice(0, 5).map((test) => (
                  <div
                    key={test.id}
                    className="px-4 py-3 hover:bg-purple-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                    onClick={() => handleSelectTest(test)}
                  >
                    <span className="font-semibold text-purple-700">
                      {test.code}
                    </span>{" "}
                    - {test.name}
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4 py-3 text-gray-400 border border-gray-200 rounded-lg bg-white mt-2 text-sm">
                No match found
              </div>
            )
          )}
        </div>

        {/* Highlighted Test Preview */}
        {highlightedTest && (
          <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
            <div className="font-semibold text-purple-800">
              {highlightedTest.name}
              <span className="text-sm text-purple-600 font-normal">
                ({highlightedTest.code})
              </span>
            </div>
            <div className="text-sm text-gray-700 mt-2">
              {highlightedTest.instructions}
            </div>
            <button
              className="mt-3 btn btn-primary text-sm"
              onClick={handleAddTest}
              disabled={selectedTests.some(t => t.id === highlightedTest.id)}
            >
              Add Test
            </button>
          </div>
        )}

        {/* Selected Tests */}
        {selectedTests.length > 0 && (
          <div className="mt-6 space-y-2 max-h-40 overflow-y-auto">
            {selectedTests.map((test) => (
              <div
                key={test.id}
                className="p-3 border border-purple-200 rounded-lg flex justify-between items-start bg-purple-50 hover:bg-purple-100 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-purple-800 text-sm">
                      {test.name}
                    </span>
                    <span className="text-xs text-purple-600 bg-purple-200 px-2 py-1 rounded">
                      ({test.code})
                    </span>
                  </div>
                  <div className="text-xs text-gray-700 mt-1">
                    {test.instructions}
                  </div>
                </div>
                <button
                  onClick={() => removeTest(test.id)}
                  className="ml-2 text-red-500 hover:text-red-700 hover:bg-red-100 p-1 rounded transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LabResultsForm;