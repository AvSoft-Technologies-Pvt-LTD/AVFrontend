import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  User,
  Clock,
  Calendar,
  Building,
  Printer,
  ArrowLeft,
  CheckCircle,
  Badge,
  FileText,
  Phone,
  Car as IdCard,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AVLogo from "../../../../assets/AV.png";
import { getVisitingTimeSlots, getIdProofTypes, getGatepassByPatientId } from "../../../../utils/masterService";
import { createGatepass } from "../../../../utils/CrudService";
import { usePatientContext } from "../../../../context-api/PatientContext";
import DynamicTable from "../../../../components/microcomponents/DynamicTable";

const GatePass = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { patient } = usePatientContext();
  const printWindowRef = useRef(null);
  const [type, setType] = useState("visitor");
  const [idProofTypes, setIdProofTypes] = useState([]);
  const [visitingTimeSlots, setVisitingTimeSlots] = useState([]);
  const [selectedIdProof, setSelectedIdProof] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [gatePasses, setGatePasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    patientName: "",
    patientId: "",
    doa: "",
    department: "",
    ward: "",
    validity: "",
    extendedDate: "",
    visitorName: "",
    relationToPatient: "",
    idProofType: "",
    idProofNumber: "",
    timeSlot: "",
    shift: "",
    purposeOfVisit: "",
    inTime: "",
    outTime: "",
  });

  const isIPD =
    patient?.type?.toLowerCase() === "ipd" ||
    !!patient?.admissionDate ||
    !!patient?.wardType;

  const getWardString = (p) => {
    if (isIPD && p?.wardType && p?.wardNo && p?.bedNo) {
      return `${p.wardType}-${p.wardNo}-${p.bedNo}`;
    }
    if (
      isIPD &&
      typeof p?.wardType === "string" &&
      p.wardType.match(/-/) &&
      !p.wardNo &&
      !p.bedNo
    ) {
      return p.wardType;
    }
    if (isIPD && p?.wardType) {
      return p.wardType;
    }
    return p?.ward || "";
  };

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      patientName: patient?.name || patient?.firstName || "",
      patientId: patient?.id || patient?.patientId || "",
      doa: isIPD ? patient?.admissionDate || patient?.doa || "" : "",
      department: patient?.department || "",
      ward: getWardString(patient),
      inTime: new Date().toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      }),
    }));
  }, [patient, isIPD]);

  // Fetch gate passes for the current patient
  useEffect(() => {
    const fetchGatePasses = async () => {
      if (!patient?.id) return;
      
      try {
        setLoading(true);
        const response = await getGatepassByPatientId(patient.patientId);
        if (response?.data) {
          const passes = Array.isArray(response.data) ? response.data : [response.data];
          // Format the data for the DynamicTable
          const formattedPasses = passes.map(pass => ({
            ...pass,
            visitTime: `${pass.inTime || ''} - ${pass.outTime || ''}`,
            wardDetails: pass.wardDetails || patient.ward || 'N/A',
            status: pass.status || 'PENDING'
          }));
          setGatePasses(formattedPasses);
        }
      } catch (error) {
        console.error('Error fetching gate passes:', error);
        toast.error('Failed to load gate pass data');
      } finally {
        setLoading(false);
      }
    };

    fetchGatePasses();
  }, [patient?.id]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const idProofResponse = await getIdProofTypes();
        if (idProofResponse?.data) {
          setIdProofTypes(Array.isArray(idProofResponse.data) ? idProofResponse.data : []);
        }
        const timeSlotsResponse = await getVisitingTimeSlots();
        if (timeSlotsResponse?.data) {
          setVisitingTimeSlots(Array.isArray(timeSlotsResponse.data) ? timeSlotsResponse.data : []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load form data. Please try again.");
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleIdProofChange = (e) => {
    const value = e.target.value;
    setSelectedIdProof(value);
    setFormData((prev) => ({
      ...prev,
      idProofType: value,
    }));
  };

  const handleTimeSlotChange = (e) => {
    const value = e.target.value;
    setSelectedTimeSlot(value);
    setFormData((prev) => ({
      ...prev,
      visitingTimeSlotId: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!selectedIdProof) {
        toast.error("Please select an ID proof type");
        return;
      }
      if (!selectedTimeSlot && type === "visitor") {
        toast.error("Please select a visiting time slot");
        return;
      }

      const payload = {
        ipdrowaid: patient?.id || 0,
        passType: type === "visitor" ? "VISITOR" : "ATTENDANT", // <-- Fixed: Maps "stay" to "ATTENDANT"
        relation: formData.relationToPatient,
        purpose: formData.purposeOfVisit,
        idProofType: selectedIdProof,
        idProofNumber: formData.idProofNumber,
        validUntil: formData.validity || "",
        outTime: formData.outTime,
        inTime: formData.inTime,
        shift: formData.shift ? formData.shift.toUpperCase() : "",
        visitingTimeSlotId: selectedTimeSlot,
        wardDetails: formData.ward || "",
        status: "PENDING",
        patientName: formData.patientName,
        visitorName: type === "visitor" ? formData.visitorName : "",
        attendantName: type === "stay" ? formData.visitorName : "",
      };

      const response = await createGatepass(payload);
      toast.success("Gatepass created successfully!");
    } catch (error) {
      console.error("Error creating gatepass:", error);
      toast.error(error.response?.data?.message || "Failed to create gatepass");
    }
  };

  const handlePrint = () => {
    if (printWindowRef.current && !printWindowRef.current.closed) {
      printWindowRef.current.close();
    }

    const gatePassHTML = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <title>Gate Pass - ${formData.visitorName}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Arial', sans-serif;
              background: white;
              padding: 0;
              margin: 0;
            }
            .print-container {
              width: 100vw;
              height: 100vh;
              display: flex;
              justify-content: center;
              align-items: center;
              background: #f5f5f5;
            }
            .gate-pass {
              width: 400px;
              border: 3px solid #0E1630;
              border-radius: 15px;
              overflow: hidden;
              background: white;
              box-shadow: 0 8px 25px rgba(0,0,0,0.15);
            }
            .header {
              background: linear-gradient(135deg, #0E1630 0%, #01D48C 100%);
              color: white;
              padding: 20px;
              text-align: center;
            }
            .header h1 {
              font-size: 20px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .header p {
              font-size: 12px;
              opacity: 0.9;
            }
            .logo {
              width: 50px;
              height: 50px;
              border-radius: 8px;
              background: white;
              padding: 5px;
              margin: 0 auto 10px;
              display: block;
            }
            .type-badge {
              background: rgba(255,255,255,0.2);
              color: white;
              padding: 6px 16px;
              border-radius: 20px;
              font-size: 11px;
              font-weight: bold;
              margin-top: 10px;
              display: inline-block;
            }
            .content {
              padding: 25px;
            }
            .field-group {
              margin-bottom: 15px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 10px 0;
              border-bottom: 1px dotted #ddd;
            }
            .field-label {
              font-weight: 600;
              color: #0E1630;
              font-size: 13px;
            }
            .field-value {
              color: #333;
              font-size: 13px;
              font-weight: 500;
              max-width: 150px;
              text-align: right;
              word-break: break-word;
            }
            .time-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              margin: 20px 0;
            }
            .time-box {
              text-align: center;
              padding: 12px;
              background: #f8f9fa;
              border-radius: 8px;
              border: 2px solid #e9ecef;
            }
            .time-label {
              font-size: 10px;
              color: #6c757d;
              font-weight: 600;
              margin-bottom: 5px;
            }
            .time-value {
              font-size: 16px;
              font-weight: bold;
              color: #0E1630;
            }
            .footer {
              background: #f8f9fa;
              padding: 20px;
              text-align: center;
              border-top: 2px solid #e9ecef;
            }
            .signature-section {
              display: flex;
              justify-content: space-between;
              margin-bottom: 15px;
            }
            .signature-box {
              text-align: center;
              width: 100px;
            }
            .signature-line {
              border-bottom: 1px solid #333;
              height: 40px;
              margin-bottom: 5px;
            }
            .signature-text {
              font-size: 10px;
              color: #666;
              font-weight: 600;
            }
            .qr-box {
              width: 60px;
              height: 60px;
              background: #f0f0f0;
              border: 2px dashed #ccc;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 10px;
              font-size: 12px;
              color: #666;
              font-weight: bold;
            }
            .footer-note {
              font-size: 10px;
              color: #666;
              margin-top: 10px;
            }
            @media print {
              body {
                padding: 0;
                margin: 0;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .print-container {
                width: 100%;
                height: 100vh;
                background: white;
              }
              .gate-pass {
                box-shadow: none;
                border: 3px solid #0E1630;
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            <div class="gate-pass">
              <div class="header">
                <img src="${AVLogo}" alt="Hospital Logo" class="logo" />
                <h1>AV Hospital</h1>
                <p>Gate Pass Authorization</p>
                <div class="type-badge">
                  ${type === "visitor" ? "VISITOR PASS" : "ATTENDANT PASS"}
                </div>
              </div>
              <div class="content">
                <div class="field-group">
                  <span class="field-label">
                    ${type === "visitor" ? "Visitor Name:" : "Attendant Name:"}
                  </span>
                  <span class="field-value">
                    ${formData.visitorName || "_______________"}
                  </span>
                </div>
                <div class="field-group">
                  <span class="field-label">Patient Name:</span>
                  <span class="field-value">
                    ${formData.patientName || "_______________"}
                  </span>
                </div>
                <div class="field-group">
                  <span class="field-label">Relation:</span>
                  <span class="field-value">
                    ${formData.relationToPatient || "_______________"}
                  </span>
                </div>
                <div class="field-group">
                  <span class="field-label">Ward Details:</span>
                  <span class="field-value">
                    ${formData.ward || "_______________"}
                  </span>
                </div>
                <div class="field-group">
                  <span class="field-label">Purpose:</span>
                  <span class="field-value">
                    ${formData.purposeOfVisit || "_______________"}
                  </span>
                </div>
                <div class="time-grid">
                  <div class="time-box">
                    <div class="time-label">IN TIME</div>
                    <div class="time-value">${formData.inTime || "___"}</div>
                  </div>
                  <div class="time-box">
                    <div class="time-label">OUT TIME</div>
                    <div class="time-value">${formData.outTime || "___"}</div>
                  </div>
                </div>
                <div class="field-group">
                  <span class="field-label">Valid Until:</span>
                  <span class="field-value">
                    ${formData.validity ? new Date(formData.validity).toLocaleDateString() : "_______________"}
                  </span>
                </div>
                ${formData.idProofType ? `
                  <div class="field-group">
                    <span class="field-label">ID Proof:</span>
                    <span class="field-value">${formData.idProofType} - ${formData.idProofNumber}</span>
                  </div>
                ` : ""}
              </div>
              <div class="footer">
                <div class="signature-section">
                  <div class="signature-box">
                    <div class="signature-line"></div>
                    <div class="signature-text">Security</div>
                  </div>
                  <div class="signature-box">
                    <div class="signature-line"></div>
                    <div class="signature-text">Authority</div>
                  </div>
                </div>
                <div class="qr-box">QR CODE</div>
                <div class="footer-note">
                  <p>This pass must be carried at all times</p>
                  <p>Generated: ${new Date().toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindowRef.current = window.open(
      "",
      "gatepass_print",
      "width=800,height=600,scrollbars=no,resizable=no,toolbar=no,menubar=no,location=no,status=no"
    );

    if (printWindowRef.current) {
      printWindowRef.current.document.write(gatePassHTML);
      printWindowRef.current.document.close();
      setTimeout(() => {
        printWindowRef.current.print();
      }, 500);
      toast.success("Gate Pass document ready for printing!");
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="flex items-center justify-between mb-6 bg-white rounded-xl shadow-sm p-4">
          <h1 className="text-xl font-bold text-[var(--primary-color)]">
            Hospital Gate Pass
          </h1>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg hover:bg-[var(--accent-color)] transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print Pass
          </button>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 animate-slideIn">
          <h2 className="text-lg font-semibold mb-6 text-[var(--primary-color)]">
            Gate Pass Details
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="visitor"
                  checked={type === "visitor"}
                  onChange={() => setType("visitor")}
                  className="text-[var(--primary-color)]"
                />
                <Badge className="w-4 h-4" />
                <span className="font-medium">Visitor Pass</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="stay"
                  checked={type === "stay"}
                  onChange={() => setType("stay")}
                  className="text-[var(--primary-color)]"
                />
                <User className="w-4 h-4" />
                <span className="font-medium">Attendant Pass</span>
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="relative floating-input" data-placeholder="Patient Name">
                <input
                  type="text"
                  value={formData.patientName}
                  onChange={(e) => handleInputChange("patientName", e.target.value)}
                  className="peer input-field"
                  placeholder=" "
                  disabled
                />
              </div>
              <div className="relative floating-input" data-placeholder="Patient ID">
                <input
                  type="text"
                  value={formData.patientId}
                  onChange={(e) => handleInputChange("patientId", e.target.value)}
                  className="peer input-field"
                  placeholder=" "
                  disabled
                />
              </div>
              <div
                className="relative floating-input"
                data-placeholder={type === "stay" ? "Attendant Name" : "Visitor Name"}
              >
                <input
                  type="text"
                  value={formData.visitorName}
                  onChange={(e) => handleInputChange("visitorName", e.target.value)}
                  className="peer input-field"
                  placeholder=" "
                  required
                />
              </div>
              <div className="relative floating-input" data-placeholder="Relation to Patient">
                <input
                  type="text"
                  value={formData.relationToPatient}
                  onChange={(e) => handleInputChange("relationToPatient", e.target.value)}
                  className="peer input-field"
                  placeholder=" "
                  required
                />
              </div>
              <div className="relative floating-input" data-placeholder="Purpose of Visit">
                <input
                  type="text"
                  value={formData.purposeOfVisit}
                  onChange={(e) => handleInputChange("purposeOfVisit", e.target.value)}
                  className="peer input-field"
                  placeholder=" "
                />
              </div>
              <div className="relative floating-input" data-placeholder="Ward Details">
                <input
                  type="text"
                  value={formData.ward}
                  className="peer input-field"
                  placeholder=" "
                  disabled
                />
              </div>
              <div className="relative floating-input" data-placeholder="ID Proof Type">
                <select
                  value={selectedIdProof}
                  onChange={handleIdProofChange}
                  className="peer input-field"
                  required
                >
                  <option value="">Select ID Type</option>
                {idProofTypes.map((type) => (
  <option key={type.id} value={type.id}>
    {type.typeName || type.name || 'Unnamed ID Type'}
  </option>
))}
                </select>
              </div>
              <div className="relative floating-input" data-placeholder="ID Proof Number">
                <input
                  type="text"
                  value={formData.idProofNumber}
                  onChange={(e) => handleInputChange("idProofNumber", e.target.value)}
                  className="peer input-field"
                  placeholder=" "
                />
              </div>
              <div className="relative floating-input" data-placeholder="In Time">
                <input
                  type="time"
                  value={formData.inTime}
                  onChange={(e) => handleInputChange("inTime", e.target.value)}
                  className="peer input-field"
                />
              </div>
              <div className="relative floating-input" data-placeholder="Out Time">
                <input
                  type="time"
                  value={formData.outTime}
                  onChange={(e) => handleInputChange("outTime", e.target.value)}
                  className="peer input-field"
                />
              </div>
              <div className="relative floating-input" data-placeholder="Valid Until">
                <input
                  type="date"
                  value={formData.validity}
                  onChange={(e) => handleInputChange("validity", e.target.value)}
                  className="peer input-field"
                  required
                />
              </div>
              {type === "visitor" && (
                <div className="relative floating-input" data-placeholder="Visiting Time Slot">
                  <select
                    value={selectedTimeSlot}
                    onChange={handleTimeSlotChange}
                    className="peer input-field"
                    required
                  >
                    <option value="">Select Time Slot</option>
                   {visitingTimeSlots.map((slot) => (
  <option key={slot.id} value={slot.id}>
    {slot.timeSlot || `${slot.startTime || ''} - ${slot.endTime || ''} ${slot.name ? `(${slot.name})` : ''}`.trim()}
  </option>
))}
                  </select>
                </div>
              )}
              {type === "stay" && (
                <div className="relative floating-input" data-placeholder="Shift">
                  <select
                    value={formData.shift}
                    onChange={(e) => handleInputChange("shift", e.target.value)}
                    className="peer input-field"
                  >
                    <option value="">Select Shift</option>
                    <option value="Morning">Morning</option>
                    <option value="Afternoon">Afternoon</option>
                    <option value="Evening">Evening</option>
                    <option value="Night">Night</option>
                  </select>
                </div>
              )}
            </div>
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="flex-1 bg-[var(--primary-color)] text-white py-3 rounded-lg font-semibold hover:bg-[var(--accent-color)] transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Generate Gate Pass
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="px-8 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <Printer className="w-5 h-5" />
                Print Document
              </button>
            </div>
          </form>
        </div>

      {/* Gate Pass History Table */}
      <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Gate Pass History</h2>
        <DynamicTable
          columns={[
            {
              header: 'Pass Number',
              accessor: 'passNumber',
              Cell: ({ value }) => <span className="font-medium">{value || 'N/A'}</span>,
            },
            {
              header: 'Type',
              accessor: 'passType',
              Cell: ({ value }) => (
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  value === 'VISITOR' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                }`}>
                  {value || 'N/A'}
                </span>
              ),
            },
            {
              header: 'Patient Name',
              accessor: 'patientName',
              Cell: ({ value }) => <span className="font-medium">{value || 'N/A'}</span>,
            },
            {
              header: 'Visitor/Attendant',
              accessor: 'visitorName',
              Cell: ({ value, row }) => (
                <div className="text-sm">
                  <div>{value || row.original.attendantName || 'N/A'}</div>
                  <div className="text-xs text-gray-500">
                    {row.original.passType === 'VISITOR' ? 'Visitor' : 'Attendant'}
                  </div>
                </div>
              ),
            },
            {
              header: 'Relation',
              accessor: 'relation',
              Cell: ({ value }) => value || 'N/A',
            },
            {
              header: 'Purpose',
              accessor: 'purpose',
              Cell: ({ value }) => <span className="text-sm">{value || 'N/A'}</span>,
            },
            {
              header: 'ID Proof',
              accessor: 'idProofNumber',
              Cell: ({ row }) => (
                <div className="text-sm">
                  <div>Type: {row.original.idProofType || 'N/A'}</div>
                  <div>Number: {row.original.idProofNumber || 'N/A'}</div>
                </div>
              ),
            },
            {
              header: 'Visit Time',
              accessor: 'visitTime',
              Cell: ({ row }) => (
                <div className="text-sm">
                  <div>In: {row.original.inTime || 'N/A'}</div>
                  <div>Out: {row.original.outTime || 'N/A'}</div>
                  {row.original.visitingTimeSlotId && (
                    <div className="text-xs text-gray-500">
                      Slot: {row.original.visitingTimeSlotId}
                    </div>
                  )}
                </div>
              ),
            },
            {
              header: 'Shift',
              accessor: 'shift',
              Cell: ({ value }) => (
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  value ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {value || 'Not specified'}
                </span>
              ),
            },
            {
              header: 'Ward Details',
              accessor: 'wardDetails',
              Cell: ({ value }) => <span className="text-sm">{value || 'N/A'}</span>,
            },
            {
              header: 'Validity',
              accessor: 'validUntil',
              Cell: ({ value }) => (
                <div className="text-sm">
                  {value ? new Date(value).toLocaleDateString() : 'N/A'}
                </div>
              ),
            },
          
          ]}
          data={gatePasses}
          noDataMessage={
            <div className="text-center py-8">
              <FileText className="mx-auto h-10 w-10 text-gray-400 mb-2" />
              <p className="text-gray-500">No gate pass records found</p>
            </div>
          }
          showSearchBar={true}
          itemsPerPage={5}
        />
      </div>
    </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default GatePass;
