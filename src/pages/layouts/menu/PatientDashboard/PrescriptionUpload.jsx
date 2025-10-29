import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../../../context-api/cartSlice';
import { Upload, Camera, FileText, CheckCircle, AlertCircle, X, Plus, Eye } from 'lucide-react';

const PrescriptionUpload = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendedTests, setRecommendedTests] = useState([]);
  const [selectedTests, setSelectedTests] = useState(new Set());
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Mock test database for recommendations
  const mockTestDatabase = [
    {
      id: 1,
      title: "Complete Blood Count (CBC)",
      code: "CBC001",
      price: 299,
      originalPrice: 399,
      category: "Blood Test",
      confidence: 95,
      reason: "Doctor prescribed blood work for anemia evaluation",
      fasting: false,
      reportTime: "6 hours",
      description: "Comprehensive blood analysis including RBC, WBC, platelets, and hemoglobin levels"
    },
    {
      id: 2,
      title: "Lipid Profile",
      code: "LP002",
      price: 599,
      originalPrice: 799,
      category: "Blood Test",
      confidence: 88,
      reason: "Cholesterol medication mentioned in prescription",
      fasting: true,
      reportTime: "12 hours",
      description: "Complete cholesterol panel including HDL, LDL, triglycerides, and total cholesterol"
    },
    {
      id: 3,
      title: "HbA1c (Diabetes)",
      code: "DM003",
      price: 449,
      category: "Blood Test",
      confidence: 85,
      reason: "Diabetes-related medications detected",
      fasting: false,
      reportTime: "24 hours",
      description: "Average blood sugar levels over the past 2-3 months"
    },
    {
      id: 4,
      title: "Thyroid Function Test (TSH, T3, T4)",
      code: "TFT004",
      price: 699,
      originalPrice: 899,
      category: "Hormone Test",
      confidence: 78,
      reason: "Thyroid medication or symptoms mentioned",
      fasting: false,
      reportTime: "24 hours",
      description: "Complete thyroid hormone analysis including TSH, T3, and T4 levels"
    },
    {
      id: 5,
      title: "Liver Function Test (LFT)",
      code: "LFT005",
      price: 549,
      category: "Blood Test",
      confidence: 72,
      reason: "Medications that may affect liver function detected",
      fasting: true,
      reportTime: "18 hours",
      description: "Assessment of liver health through enzyme and protein analysis"
    }
  ];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file) => {
    if (file.type.startsWith('image/')) {
      setUploadedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setAnalysisComplete(false);
      setRecommendedTests([]);
      setSelectedTests(new Set());
    } else {
      alert('Please upload an image file (JPG, PNG, etc.)');
    }
  };

  const analyzePrescription = async () => {
    if (!uploadedFile) return;
    setIsAnalyzing(true);

    // Simulate AI analysis with realistic delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    // Mock analysis results - in real app, this would call an AI service
    const shuffledTests = [...mockTestDatabase]
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 3) + 3); // Return 3-5 tests
    setRecommendedTests(shuffledTests);
    setIsAnalyzing(false);
    setAnalysisComplete(true);
  };

  const toggleTestSelection = (testId) => {
    const newSelection = new Set(selectedTests);
    if (newSelection.has(testId)) {
      newSelection.delete(testId);
    } else {
      newSelection.add(testId);
    }
    setSelectedTests(newSelection);
  };

  const addSelectedToCart = () => {
    const testsToAdd = recommendedTests.filter(test => selectedTests.has(test.id));
    testsToAdd.forEach(test => {
      dispatch(addToCart(test));
    });

    if (testsToAdd.length > 0) {
      navigate('/patientdashboard/cart');
    }
  };

  const clearUpload = () => {
    setUploadedFile(null);
    setPreviewUrl('');
    setRecommendedTests([]);
    setSelectedTests(new Set());
    setAnalysisComplete(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          {/* <button
            onClick={() => navigate('/patientdashboard/lab-tests')}
            className="text-gray-600 hover:text-gray-800 text-sm sm:text-base mb-4 flex items-center gap-1 transition-colors"
          >
            ← Back to Lab Tests
          </button> */}
          <h1 className="h4-heading">Upload Prescription</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Upload your doctor's prescription and get personalized test recommendations
          </p>
        </div>

        {!uploadedFile ? (
          /* Upload Section */
          <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
            <div
              className={`relative border-2 border-dashed rounded-xl p-8 sm:p-12 text-center transition-all duration-300 ${
                dragActive
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              <div className="space-y-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-[var(--primary-color)]" />
                </div>

                <div>
                  <h3 className="h4-heading">
                    Upload Your Prescription
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-4">
                    Drag and drop your prescription image here, or click to browse
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-[var(--primary-color)] text-white rounded-lg hover:bg-[var(--primary-color)] transition-colors font-medium text-sm sm:text-base"
                    >
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                      Browse Files
                    </button>

                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base"
                    >
                      <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
                      Take Photo
                    </button>
                  </div>
                </div>

                <div className="text-xs sm:text-sm text-gray-500">
                  Supported formats: JPG, PNG, WEBP (Max 10MB)
                </div>
              </div>
            </div>

            {/* Tips Section */}
            <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-[var(--accent-color)] mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-green-900 text-sm sm:text-base">Clear Image</h4>
                  <p className="text-xs sm:text-sm text-green-700">Ensure text is readable and image is well-lit</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                <FileText className="w-5 h-5 text-[var(--primary-color)] mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-[var(--primary-color)] text-sm sm:text-base">Complete Prescription</h4>
                  <p className="text-xs sm:text-sm text-[var(--primary-color)]">Include all pages and doctor's signature</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                <AlertCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-purple-900 text-sm sm:text-base">Privacy Safe</h4>
                  <p className="text-xs sm:text-sm text-purple-700">Your prescription data is encrypted and secure</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Preview and Analysis Section */
          <div className="space-y-6">
            {/* Image Preview */}
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                <h3 className="h4-heading">
                  Prescription Preview
                </h3>
                <button
                  onClick={clearUpload}
                  className="flex items-center gap-2 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
                >
                  <X className="w-4 h-4" />
                  Remove
                </button>
              </div>

              <div className="relative max-w-md mx-auto">
                <img
                  src={previewUrl}
                  alt="Prescription preview"
                  className="w-full h-auto rounded-lg border border-gray-200 shadow-sm"
                />
                <div className="absolute top-2 right-2">
                  <button className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow">
                    <Eye className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>

              {!analysisComplete && (
                <div className="mt-6 text-center">
                  <button
                    onClick={analyzePrescription}
                    disabled={isAnalyzing}
                    className={`px-6 sm:px-8 py-3 rounded-lg font-medium text-sm sm:text-base transition-all duration-200 ${
                      isAnalyzing
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-[var(--primary-color)] text-white hover:bg-[var(--primary-color)] hover:scale-105'
                    }`}
                  >
                    {isAnalyzing ? (
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Analyzing Prescription...
                      </div>
                    ) : (
                      'Analyze Prescription'
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Analysis Progress */}
            {isAnalyzing && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="w-8 h-8 border-3 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Analyzing Your Prescription</h3>
                  <p className="text-sm text-gray-600 mb-4">Our AI is reading your prescription and finding relevant tests...</p>

                  <div className="max-w-md mx-auto">
                    <div className="flex justify-between text-xs text-gray-500 mb-2">
                      <span>Processing...</span>
                      <span>85%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-[var(--primary-color)] h-2 rounded-full transition-all duration-500" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Recommended Tests */}
            {analysisComplete && recommendedTests.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
                      Recommended Tests
                    </h3>
                    <p className="text-sm text-gray-600">
                      Based on your prescription, we recommend these tests
                    </p>
                  </div>

                  {selectedTests.size > 0 && (
                    <button
                      onClick={addSelectedToCart}
                      className="mt-4 sm:mt-0 px-4 sm:px-6 py-2 sm:py-3 bg-[var(--accent-color)] text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm sm:text-base flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Selected to Cart ({selectedTests.size})
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {recommendedTests.map((test) => (
                    <div
                      key={test.id}
                      className={`border rounded-lg p-4 transition-all duration-200 cursor-pointer ${
                        selectedTests.has(test.id)
                          ? 'border-[var(--primary-color)] bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                      onClick={() => toggleTestSelection(test.id)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="mt-1">
                          <input
                            type="checkbox"
                            checked={selectedTests.has(test.id)}
                            onChange={() => toggleTestSelection(test.id)}
                            className="w-4 h-4 text-[var(--primary-color)] border-gray-300 rounded focus:ring-[var(--primary-color)]"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
                                  {test.title}
                                </h4>
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                  {test.confidence}% match
                                </span>
                              </div>

                              <p className="text-xs sm:text-sm text-gray-600 mb-2">
                                Code: {test.code} • {test.category}
                              </p>

                              <p className="text-xs sm:text-sm text-[var(--primary-color)] bg-blue-50 p-2 rounded mb-2">
                                <strong>Why recommended:</strong> {test.reason}
                              </p>

                              <p className="text-xs sm:text-sm text-gray-600">
                                {test.description}
                              </p>

                              <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                                <span>Report: {test.reportTime}</span>
                                <span>{test.fasting ? 'Fasting required' : 'No fasting'}</span>
                              </div>
                            </div>

                            <div className="text-right flex-shrink-0">
                              <p className="text-lg sm:text-xl font-bold text-[var(--primary-color)]">
                                ₹{test.price}
                              </p>
                              {test.originalPrice && (
                                <p className="text-sm text-gray-400 line-through">
                                  ₹{test.originalPrice}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedTests.size === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">Select tests to add them to your cart</p>
                    <button
                      onClick={() => setSelectedTests(new Set(recommendedTests.map(t => t.id)))}
                      className="px-4 py-2 text-[var(--primary-color)] border border-[var(--primary-color)] rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      Select All Tests
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PrescriptionUpload;