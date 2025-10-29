import React, { useState, useEffect } from 'react';
import { FlaskRound as Flask, Save, Printer, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

const LAB_TESTS_API = 'https://mocki.io/v1/7bf93caf-60d0-4bdd-96a2-79fbe26e59fb';

export const LabTestsForm = ({ data, onSave, onPrint, patient }) => {
  const [labTests, setLabTests] = useState([]);
  const [selectedTests, setSelectedTests] = useState(data?.selectedTests || []);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [highlightedTest, setHighlightedTest] = useState(null);

  useEffect(() => {
    setSelectedTests(data?.selectedTests || []);
  }, [data]);

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
    // Always close the highlighted test section and clear search
    setSearch('');
    setHighlightedTest(null);

    if (
      highlightedTest &&
      !selectedTests.find((t) => t.code === highlightedTest.code)
    ) {
      const updated = [...selectedTests, highlightedTest];
      setSelectedTests(updated);
      onSave('lab', { selectedTests: updated });
      toast.success('✅ Lab test added successfully!', {
        position: 'top-right',
        autoClose: 2000,
      });
    }
  };

  const removeTest = (code) => {
    const updated = selectedTests.filter((t) => t.code !== code);
    setSelectedTests(updated);
    onSave('lab', { selectedTests: updated });
    toast.success('✅ Lab test removed successfully!', {
      position: 'top-right',
      autoClose: 2000,
    });
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
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
            onClick={() => onPrint('lab')}
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
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Type test name or code..."
              className="input-field"
            />
            {search &&
              (results.length > 0 ? (
                <div className="border border-gray-200 rounded-lg bg-white mt-2 max-h-32 overflow-auto shadow-lg">
                  {results.slice(0, 5).map((test) => (
                    <div
                      key={test.code}
                      className="px-4 py-3 hover:bg-purple-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors text-sm"
                      onClick={() => handleSelectTest(test)}
                    >
                      <span className="font-semibold text-purple-700">
                        {test.code}
                      </span>{' '}
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
                <Plus className="w-4 h-4" />
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