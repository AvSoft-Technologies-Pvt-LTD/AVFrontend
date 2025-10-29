import React, { useState, useEffect } from "react";
import { FlaskRound as Flask, Printer, Trash2 } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify"; // ⬅️ Only toast used here
import "react-toastify/dist/ReactToastify.css";

const LAB_TESTS_API = "https://mocki.io/v1/d5e1e24a-f241-4c9a-9dce-8c9f5c1f3f7f";

const LabResultsForm = ({ data = {}, onSave, onPrint }) => {
  const [labTests, setLabTests] = useState([]);
  const [selectedTests, setSelectedTests] = useState(data.selectedTests || []);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [highlightedTest, setHighlightedTest] = useState(null);

  useEffect(() => {
    axios
      .get(LAB_TESTS_API)
      .then((res) => setLabTests(res.data))
      .catch(() => setLabTests([]));
  }, []);

  useEffect(() => {
    const filtered = labTests.filter(
      (t) =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.code.toLowerCase().includes(search.toLowerCase())
    );
    setResults(filtered);
    setHighlightedTest(
      filtered.find(
        (t) =>
          t.name.toLowerCase() === search.toLowerCase() ||
          t.code.toLowerCase() === search.toLowerCase()
      ) || null
    );
  }, [search, labTests]);

  const handleSelectTest = (t) => {
    setHighlightedTest(t);
    setSearch(t.name);
  };

  const handleAddTest = () => {
    if (
      highlightedTest &&
      !selectedTests.find((t) => t.code === highlightedTest.code)
    ) {
      const updated = [...selectedTests, highlightedTest];
      setSelectedTests(updated);
      onSave?.("lab", { ...data, selectedTests: updated });
      toast.success("✅ Lab test added successfully!");
    }
    setSearch("");
    setHighlightedTest(null);
  };

  const removeTest = (code) => {
    const removedTest = selectedTests.find((t) => t.code === code);
    const updated = selectedTests.filter((t) => t.code !== code);
    setSelectedTests(updated);
    toast.error(`❌ ${removedTest?.name || "Test"} removed`);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setHighlightedTest(null);
  };

  const handleRejectTest = () => {
    toast.error("❌ Test selection rejected");
    setSearch("");
    setHighlightedTest(null);
  };

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
      <div className="p-6">
        <div className="space-y-4">
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

            {search &&
              (results.length > 0 ? (
                <div className="border border-gray-200 rounded-lg bg-white mt-2 max-h-32 overflow-auto shadow-lg">
                  {results.slice(0, 5).map((test) => (
                    <div
                      key={test.code}
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
              ))}
          </div>
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
                disabled={selectedTests.some(
                  (t) => t.code === highlightedTest.code
                )}
              >
                Add Test
              </button>
            </div>
          )}
        </div>
        <div className="mt-6 space-y-2 max-h-40 overflow-y-auto">
          {selectedTests.map((test) => (
            <div
              key={test.code}
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
                onClick={() => removeTest(test.code)}
                className="ml-2 text-red-500 hover:text-red-700 hover:bg-red-100 p-1 rounded transition-colors"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LabResultsForm;