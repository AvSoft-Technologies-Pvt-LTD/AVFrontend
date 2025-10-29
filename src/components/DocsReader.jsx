import React, { useState, useRef } from "react";
import Tesseract from "tesseract.js";
import * as pdfjsLib from "pdfjs-dist";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Printer, FileDown, FileText, Save } from "lucide-react";
import { FaFilePdf, FaFileUpload } from "react-icons/fa";
import { MdPictureAsPdf, MdOutlinePreview } from "react-icons/md";
import axios from "axios";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const OCRPrescriptionReader = () => {
  const printRef = useRef();
  const [parsed, setParsed] = useState({ medications: [] });
  const [file, setFile] = useState(null);
  const [lang] = useState("eng");
  const [rawText, setRawText] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleFileUpload = (e) => {
    const uploaded = e.target.files[0];
    if (!uploaded) return;
    setFile(URL.createObjectURL(uploaded));
    uploaded.type === "application/pdf"
      ? extractTextFromPDF(uploaded)
      : extractTextFromImage(uploaded);
  };

  const extractTextFromImage = async (file) => {
    setLoading(true);
    try {
      const { data: { text } } = await Tesseract.recognize(file, lang);
      setRawText(text);
      parseText(text);
    } catch (err) {
      console.error("OCR error:", err);
    }
    setLoading(false);
  };

  const extractTextFromPDF = async (file) => {
    setLoading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const typedarray = new Uint8Array(reader.result);
      const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        fullText += content.items.map(item => item.str).join(" ") + "\n";
      }
      setRawText(fullText);
      parseText(fullText);
      setLoading(false);
    };
    reader.readAsArrayBuffer(file);
  };

  const parseText = (text) => {
    const lines = text.split("\n").map(l => l.trim()).filter(l => l && !/^(page \d+|thank you|signature)/i.test(l));
    const data = {
      hospitalName: lines[0] || "",
      hospitalAddress: lines.slice(1, 3).join(", "),
      patientName: "",
      age: "",
      sex: "",
      bedNo: "",
      admissionDate: "",
      dischargeDate: "",
      consultant: "",
      diagnosis: "",
      complaints: "",
      medications: [],
    };

    const keywords = {
      patientName: ["patient name", "name", "mr", "mrs", "ms", "shri", "smt"],
      age: ["age", "years old", "yrs"],
      sex: ["sex", "gender", "male", "female"],
      bedNo: ["bed no", "bed"],
      admissionDate: ["admission date", "admission"],
      dischargeDate: ["discharge date", "discharge"],
      consultant: ["consultant", "doctor", "physician", "dr", "dr."],
      complaints: ["complaint", "symptoms"],
      diagnosis: ["diagnosis", "dx"],
      medications: ["tab", "tablet", "inj", "cap", "syrup", "rx", "ointment"],
    };

    const normalize = (str) => str.toLowerCase().replace(/[^a-z0-9\s]/gi, "").replace(/\s+/g, " ").trim();
    const matchAliases = (line, aliases) => aliases.some(alias => normalize(line).includes(normalize(alias)));

    lines.forEach(line => {
      if (!data.patientName && matchAliases(line, keywords.patientName))
        data.patientName = line.replace(/.*?(name|mr|mrs|ms|shri|smt)[\s:\-]*/i, "").trim();
      if (!data.age && matchAliases(line, keywords.age))
        data.age = line.match(/(\d{1,3})\s*(yrs|years|yo)?/i)?.[1] || "";
      if (!data.sex && matchAliases(line, keywords.sex))
        data.sex = line.match(/male|female|m|f/i)?.[0].toLowerCase().startsWith("m") ? "Male" : "Female";
      if (!data.bedNo && matchAliases(line, keywords.bedNo))
        data.bedNo = line.match(/bed\s*(no)?\s*[:\-]?\s*(\w+)/i)?.[2] || "";
      if (!data.admissionDate && matchAliases(line, keywords.admissionDate))
        data.admissionDate = line.match(/\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}/)?.[0] || "";
      if (!data.dischargeDate && matchAliases(line, keywords.dischargeDate))
        data.dischargeDate = line.match(/\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}/)?.[0] || "";
      if (!data.consultant && matchAliases(line, keywords.consultant))
        data.consultant = line.split(/[:\-]/)[1]?.trim() || line;
      if (!data.complaints && matchAliases(line, keywords.complaints))
        data.complaints = line.split(/[:\-]/)[1]?.trim() || line;
      if (!data.diagnosis && matchAliases(line, keywords.diagnosis))
        data.diagnosis = line.split(/[:\-]/)[1]?.trim() || line;
      if (matchAliases(line, keywords.medications))
        data.medications.push(line.trim());
    });

    setParsed(data);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(parsed.hospitalName || "Hospital Name", 10, 10);
    doc.setFontSize(10);
    doc.text(parsed.hospitalAddress || "Hospital Address", 10, 16);
    autoTable(doc, {
      head: [["Label", "Value"]],
      body: [
        ["Patient Name", parsed.patientName],
        ["Age", parsed.age],
        ["Sex", parsed.sex],
        ["Bed No", parsed.bedNo],
        ["Admission Date", parsed.admissionDate],
        ["Discharge Date", parsed.dischargeDate],
        ["Consultant", parsed.consultant],
        ["Complaint", parsed.complaints],
        ["Diagnosis", parsed.diagnosis],
      ],
      startY: 24,
    });
    const finalY = doc.lastAutoTable.finalY + 10;
    if (parsed.medications.length) {
      doc.setFontSize(12);
      doc.text("Medications:", 10, finalY);
      parsed.medications.forEach((med, i) =>
        doc.text(`- ${med}`, 12, finalY + 6 + i * 6)
      );
    }
    doc.setFontSize(10);
    doc.text("Signature: ___________________", 140, 280);
    doc.text("Hospital Address: " + (parsed.hospitalAddress || ""), 10, 285);
    doc.save("prescription.pdf");
  };

  const handlePrint = () => {
    const content = printRef.current?.innerHTML;
    const win = window.open("", "", "width=800,height=600");
    if (!win) return;
    win.document.write(`
      <html><head><title>Print</title>
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
      <style>body{font-family:sans-serif;padding:2rem}@page{margin:20mm}</style></head>
      <body>${content}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.close();
    }, 500);
  };

  // 🧠 New Save Function
  const handleSave = async () => {
    try {
      setSaving(true);
      // 🔹 Replace with your actual API endpoint:
      const API_URL = "https://679d0edec2c861de0c6d9b7c.mockapi.io/ocrPrescriptions";
      await axios.post(API_URL, parsed);
      alert("✅ Prescription data saved successfully!");
    } catch (err) {
      console.error("Save error:", err);
      alert("❌ Failed to save prescription data");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-tr from-blue-50 to-white">
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/60 z-50">
          <div className="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full animate-spin" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
        {/* Upload Section */}
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="text-lg font-semibold mb-4 border-b pb-2 flex items-center gap-2">
            <FaFileUpload /> Upload Document
          </h3>
          <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg h-40 text-gray-500 hover:border-blue-500 cursor-pointer transition mb-4">
            <input type="file" accept="image/*,application/pdf" onChange={handleFileUpload} hidden />
            <div className="flex flex-col items-center">
              <MdOutlinePreview size={36} />
              <p className="text-sm">Drag & drop a prescription file here</p>
              <small className="text-xs text-gray-400">
                Supports: images (JPG, PNG, TIFF) and PDF
              </small>
            </div>
          </label>

          {file && (
            <div className="space-y-2">
              <p className="text-sm">{file.split("/").pop()}</p>
              <div className="flex gap-3 text-sm">
                <a
                  href={file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1"
                >
                  <MdOutlinePreview /> View
                </a>
                <a
                  href={file}
                  download
                  className="text-green-600 hover:underline flex items-center gap-1"
                >
                  <FaFilePdf /> Download
                </a>
              </div>
              {file.endsWith(".pdf") ? (
                <div className="text-xs italic text-gray-600 flex items-center gap-1">
                  <MdPictureAsPdf /> PDF file uploaded
                </div>
              ) : (
                <img src={file} alt="Preview" className="max-h-72 rounded border" />
              )}
            </div>
          )}
        </div>

        {/* Extracted Data Display */}
        <div className="bg-white rounded-xl shadow p-6 min-h-[300px] flex flex-col justify-center">
          {!rawText ? (
            <div className="flex flex-col justify-center items-center text-center text-gray-500 h-full">
              <FileText className="text-gray-400" size={48} />
              <p className="mt-2 font-medium text-gray-600">
                Upload a document to extract prescription information
              </p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center p-4 mb-4">
                <h3 className="text-xl font-semibold text-blue-700">
                  Extracted Information
                </h3>
                <div className="flex gap-3">
                  <button
                    onClick={handlePrint}
                    className="px-4 py-2 text-sm font-medium bg-blue-50 text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-100 transition flex items-center gap-2"
                  >
                    <Printer className="w-4 h-4" /> Print
                  </button>
                  <button
                    onClick={handleExportPDF}
                    className="px-4 py-2 text-sm font-medium bg-red-50 text-red-700 border border-red-300 rounded-lg hover:bg-red-100 transition flex items-center gap-2"
                  >
                    <FileDown className="w-4 h-4" /> Export PDF
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 text-sm font-medium bg-green-50 text-green-700 border border-green-300 rounded-lg hover:bg-green-100 transition flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>

              <div ref={printRef} className="p-6 text-left text-gray-800 space-y-8 leading-relaxed">
                <div className="border-b pb-4">
                  <h1 className="text-xl font-bold text-gray-900">
                    {parsed.hospitalName || "Medical Center"}
                  </h1>
                  <p className="text-gray-600 text-sm">
                    {parsed.hospitalAddress || "Hospital Address"}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12">
                  <div>
                    <h2 className="text-base font-semibold text-gray-700 mb-2">
                      Patient Details
                    </h2>
                    <p><strong>Name:</strong> {parsed.patientName || "—"}</p>
                    <p><strong>Age:</strong> {parsed.age || "—"}</p>
                    <p><strong>Sex:</strong> {parsed.sex || "—"}</p>
                    <p><strong>Bed No:</strong> {parsed.bedNo || "—"}</p>
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-gray-700 mb-2">
                      Admission Info
                    </h2>
                    <p><strong>Admission Date:</strong> {parsed.admissionDate || "—"}</p>
                    <p><strong>Discharge Date:</strong> {parsed.dischargeDate || "—"}</p>
                  </div>
                </div>

                <div>
                  <h2 className="text-base font-semibold text-gray-700 mb-2">
                    Clinical Information
                  </h2>
                  <p><strong>Consultant:</strong> {parsed.consultant || "—"}</p>
                  <p><strong>Chief Complaint:</strong> {parsed.complaints || "—"}</p>
                  <p><strong>Diagnosis:</strong> {parsed.diagnosis || "—"}</p>
                </div>

                <div>
                  <h2 className="text-base font-semibold text-gray-700 mb-2">
                    Medications
                  </h2>
                  {parsed.medications.length ? (
                    <ul className="list-disc pl-5 space-y-1">
                      {parsed.medications.map((m, i) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>—</p>
                  )}
                </div>

                <div className="flex justify-between items-end border-t pt-4 text-xs text-gray-500">
                  <p>Generated on: {new Date().toLocaleDateString()}</p>
                  <p>Doctor Signature: ___________________</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OCRPrescriptionReader;
