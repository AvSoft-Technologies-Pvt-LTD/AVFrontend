import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  MapPin,
  Phone,
  Download,
  Printer,
  Share2,
  Clock,
  Calendar,
  CreditCard,
  Building2,
  TestTube,
  Check,
  User,
  Mail,
  FileText,
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import AVLogo from "../../../../assets/AV.png";

const TrackAppointment = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef();

  useEffect(() => {
    fetchAppointment();
    const interval = setInterval(fetchAppointment, 10000);
    return () => clearInterval(interval);
  }, [bookingId]);

  const fetchAppointment = async () => {
    try {
      const res = await axios.get("https://680b3642d5075a76d98a3658.mockapi.io/Lab/payment");
      const found = res.data.find((item) => item.bookingId === bookingId);
      if (!found) throw new Error("Appointment not found");
      setAppointment(found);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching appointment:", error);
      alert("Failed to fetch appointment details. Please try again later.");
    }
  };

  const handleDownloadReport = async () => {
    const input = printRef.current;
    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${appointment?.testTitle || "Lab_Report"}.pdf`);
  };

  const handlePrintReceipt = () => {
    const printContent = `
      <html>
        <head>
          <title>Lab Appointment Receipt</title>
          <style>
            body {
              font-family: 'Poppins', sans-serif;
              padding: 20px;
              color: var(--primary-color);
              max-width: 800px;
              margin: 0 auto;
              background: #fff;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 2px solid #eee;
              padding-bottom: 10px;
            }
            .header h1 {
              color: var(--primary-color);
              margin: 0;
              font-weight: 700;
            }
            .logo {
              text-align: center;
              margin-bottom: 20px;
            }
            .logo img {
              max-height: 60px;
            }
            .invoice-title {
              color: var(--primary-color);
              font-size: 24px;
              font-weight: 700;
              margin-bottom: 10px;
            }
            .invoice-subtitle {
              color: rgba(14, 22, 48, 0.7);
              font-size: 14px;
              margin-bottom: 20px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 20px;
            }
            .info-card {
              background: #f8fafc;
              border-radius: 8px;
              padding: 15px;
              border: 1px solid #e2e8f0;
            }
            .info-card h3 {
              margin-top: 0;
              color: var(--primary-color);
              font-size: 16px;
              font-weight: 600;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .info-row {
              display: flex;
              align-items: center;
              margin-bottom: 8px;
              font-size: 14px;
            }
            .info-row strong {
              color: rgba(14, 22, 48, 0.8);
              display: flex;
              align-items: center;
              gap: 6px;
            }
            .info-row span {
              margin-left: auto;
            }
            .status-badge {
              display: inline-block;
              padding: 4px 8px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: bold;
            }
            .status-completed {
              background: #dcfce7;
              color: #16a34a;
            }
            .status-current {
              background: #fef3c7;
              color: #d97706;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              font-size: 12px;
              color: rgba(14, 22, 48, 0.6);
              border-top: 1px solid #eee;
              padding-top: 10px;
            }
            .divider {
              border-top: 1px dashed #e2e8f0;
              margin: 15px 0;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              font-size: 16px;
              font-weight: 600;
              margin-top: 10px;
              padding-top: 10px;
              border-top: 1px solid #e2e8f0;
            }
            .total-amount {
              color: var(--accent-color);
              font-size: 18px;
            }
          </style>
        </head>
        <body>
          <div class="logo">
            <img src="${AVLogo}" alt="AV Logo" />
          </div>
          <div class="header">
            <h1 class="invoice-title">LAB APPOINTMENT RECEIPT</h1>
            <p class="invoice-subtitle">Booking ID: <strong>${appointment?.bookingId}</strong></p>
          </div>
          <div class="info-grid">
            <div class="info-card">
              <h3>
                <Building2 style="color: var(--primary-color); width: 16px; height: 16px;" />
                Lab Information
              </h3>
              <div class="info-row">
                <strong>
                  <MapPin style="color: var(--primary-color); width: 14px; height: 14px;" />
                  Lab Name:
                </strong>
                <span>${appointment?.labName}</span>
              </div>
              <div class="info-row">
                <strong>
                  <MapPin style="color: var(--primary-color); width: 14px; height: 14px;" />
                  Location:
                </strong>
                <span>${appointment?.location}</span>
              </div>
              <div class="info-row">
                <strong>
                  <Phone style="color: var(--primary-color); width: 14px; height: 14px;" />
                  Phone:
                </strong>
                <span>${appointment?.labPhone || "+91 98765 43210"}</span>
              </div>
            </div>
            <div class="info-card">
              <h3>
                <Calendar style="color: var(--primary-color); width: 16px; height: 16px;" />
                Appointment Details
              </h3>
              <div class="info-row">
                <strong>
                  <Calendar style="color: var(--primary-color); width: 14px; height: 14px;" />
                  Date:
                </strong>
                <span>${appointment?.date ? new Date(appointment.date).toDateString() : "-"}</span>
              </div>
              <div class="info-row">
                <strong>
                  <Clock style="color: var(--primary-color); width: 14px; height: 14px;" />
                  Time:
                </strong>
                <span>${appointment?.time || "-"}</span>
              </div>
              <div class="info-row">
                <strong>
                  <Check style="color: var(--primary-color); width: 14px; height: 14px;" />
                  Status:
                </strong>
                <span class="status-badge ${appointment?.status === "Report Ready" ? "status-completed" : "status-current"}">
                  ${appointment?.status}
                </span>
              </div>
            </div>
          </div>
          <div class="info-grid">
            <div class="info-card">
              <h3>
                <TestTube style="color: var(--primary-color); width: 16px; height: 16px;" />
                Test Information
              </h3>
              <div class="info-row">
                <strong>
                  <FileText style="color: var(--primary-color); width: 14px; height: 14px;" />
                  Test Name:
                </strong>
                <span>${appointment?.testTitle}</span>
              </div>
              <div class="info-row">
                <strong>
                  <Clock style="color: var(--primary-color); width: 14px; height: 14px;" />
                  Report Time:
                </strong>
                <span>${appointment?.reportTime || "24-48 hours"}</span>
              </div>
            </div>
            <div class="info-card">
              <h3>
                <CreditCard style="color: var(--primary-color); width: 16px; height: 16px;" />
                Payment Information
              </h3>
              <div class="info-row">
                <strong>
                  <CreditCard style="color: var(--primary-color); width: 14px; height: 14px;" />
                  Amount Paid:
                </strong>
                <span>₹${appointment?.amountPaid}</span>
              </div>
              <div class="info-row">
                <strong>
                  <Check style="color: var(--primary-color); width: 14px; height: 14px;" />
                  Payment Status:
                </strong>
                <span class="status-badge status-completed">${appointment?.paymentStatus}</span>
              </div>
            </div>
          </div>
          <div class="divider"></div>
          <div class="total-row">
            <span>Total Amount Paid</span>
            <span class="total-amount">₹${appointment?.amountPaid}</span>
          </div>
          <div class="footer">
            <p>Thank you for choosing AV Lab. For any queries, contact us at support@avlab.com</p>
          </div>
        </body>
      </html>
    `;
    const printWindow = window.open("", "", "width=900,height=650");
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  const handleShareDetails = () => {
    if (navigator.share) {
      navigator.share({
        title: "Track Your Appointment",
        text: `Appointment for ${appointment?.patientName} at ${appointment?.labName}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const steps = [
    { title: "Appointment", subtitle: "Confirmed" },
    { title: "Technician", subtitle: "On the Way" },
    { title: "Sample", subtitle: "Collected" },
    { title: "Test", subtitle: "Processing" },
    { title: "Report", subtitle: "Ready" },
  ];

  const getCurrentStep = (status) => {
    const statusMap = {
      "Appointment Confirmed": 0,
      "Technician On the Way": 1,
      "Sample Collected": 2,
      "Test Processing": 3,
      "Report Ready": 4,
    };
    return statusMap[status] || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-color)] mx-auto"></div>
          <p className="text-gray-600 mt-4 text-center">Loading appointment details...</p>
        </div>
      </div>
    );
  }

  const currentStep = appointment ? getCurrentStep(appointment.status) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <button
          className="mb-6 flex items-center gap-2 text-[var(--primary-color)] hover:text-[var(--accent-color)] font-medium transition-colors"
          onClick={() => navigate("/patientdashboard/app", { state: { activeTab: "lab" } })}
        >
          ← Back to Home
        </button>

        <div className="bg-[var(--color-surface)] rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-[var(--accent-color)]/10 rounded-xl p-3">
                <Building2 className="w-7 h-7 text-[var(--accent-color)]" />
              </div>
              <div>
                <h1 className="h4-heading">{appointment?.labName}</h1>
                <div className="flex flex-wrap items-center gap-4 mt-1">
                  <div className="flex items-center gap-1 paragraph">
                    <MapPin className="w-4 h-4 opacity-70" />
                    <span>{appointment?.location}</span>
                  </div>
                  <div className="flex items-center gap-1 paragraph">
                    <Phone className="w-4 h-4 opacity-70" />
                    <span>{appointment?.labPhone || "+91 98765 43210"}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="text-left sm:text-right">
                <div className="flex items-center gap-2 h4-heading">
                  <Calendar className="w-5 h-5 text-[var(--accent-color)]" />
                  <span>{appointment?.date ? new Date(appointment.date).toDateString() : "-"}</span>
                </div>
                <div className="flex items-center gap-2 paragraph mt-1">
                  <Clock className="w-4 h-4 opacity-70" />
                  <span>{appointment?.time || "-"}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 no-print">
                <button
                  onClick={handlePrintReceipt}
                  className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 text-[var(--primary-color)] px-3 py-2 rounded-lg transition-all duration-200"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print</span>
                </button>
                <button
                  onClick={handleDownloadReport}
                  className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 text-[var(--primary-color)] px-3 py-2 rounded-lg transition-all duration-200"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
                <button
                  onClick={handleShareDetails}
                  className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 text-[var(--primary-color)] px-3 py-2 rounded-lg transition-all duration-200"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div ref={printRef}>
          {/* Appointment Progress */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-[var(--primary-color)] mb-2">Lab Appointment Progress</h2>
              <p className="text-gray-600">Track your appointment status in real-time</p>
            </div>
            {/* Progress Tracker */}
            <div className="max-w-5xl mx-auto">
              {/* Progress Line Container */}
              <div className="relative mb-16">
                {/* Background Line */}
                <div className="absolute top-6 left-8 right-0 h-1 bg-gray-200 rounded-full"></div>
                {/* Active Progress Line */}
                <div
                  className="absolute top-6 left-0 h-1 bg-[var(--accent-color)] rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${(currentStep / (steps.length - 1)) * 100}%`,
                  }}
                ></div>
                {/* Steps Container */}
                <div className="relative flex justify-between">
                  {steps.map((step, index) => {
                    const isCompleted = index < currentStep;
                    const isCurrent = index === currentStep;
                    const isUpcoming = index > currentStep;
                    return (
                      <div key={index} className="flex flex-col items-center">
                        {/* Circle */}
                        <div
                          className={`
                            relative z-10 w-12 h-12 rounded-full flex items-center justify-center
                            transition-all duration-500 ease-out
                            ${
                              isCompleted
                                ? "bg-[var(--accent-color)] text-white shadow-lg"
                                : isCurrent
                                ? "bg-[var(--accent-color)] text-white shadow-lg animate-pulse"
                                : "bg-gray-200 text-gray-400"
                            }
                          `}
                        >
                          {isCompleted ? (
                            <Check className="w-6 h-6" />
                          ) : (
                            <div
                              className={`
                                w-3 h-3 rounded-full
                                ${isCurrent ? "bg-white" : "bg-current"}
                              `}
                            />
                          )}
                        </div>
                        {/* Step Text */}
                        <div className="mt-4 text-center">
                          <div
                            className={`
                              text-sm font-semibold transition-colors duration-300
                              ${
                                isCompleted || isCurrent ? "text-[var(--accent-color)]" : "text-gray-500"
                              }
                            `}
                          >
                            {step.title}
                          </div>
                          <div
                            className={`
                              text-xs mt-1 transition-colors duration-300
                              ${
                                isCompleted || isCurrent ? "text-[var(--accent-color)]" : "text-gray-400"
                              }
                            `}
                          >
                            {step.subtitle}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          {/* Info Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Test Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-100 rounded-xl p-3">
                  <TestTube className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="text-lg font-semibold text-[var(--primary-color)]">Test Information</h4>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[var(--primary-color)]" />
                    Test Name
                  </span>
                  <span className="font-semibold text-[var(--primary-color)]">{appointment?.testTitle}</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[var(--primary-color)]" />
                    Report Time
                  </span>
                  <span className="font-semibold text-[var(--primary-color)]">
                    {appointment?.reportTime || "24-48 hours"}
                  </span>
                </div>
              </div>
            </div>
            {/* Payment Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-[var(--primary-color)]">Payment & Booking</h4>
                  <p className="text-gray-600 mt-1">Receipt and booking details</p>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-gray-600 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-[var(--primary-color)]" />
                        Amount Paid
                      </div>
                      <div className="text-lg font-bold text-[var(--accent-color)]">₹{appointment?.amountPaid}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-gray-600 flex items-center gap-2">
                        <Check className="w-4 h-4 text-[var(--primary-color)]" />
                        Payment Status
                      </div>
                      <div className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">
                        {appointment?.paymentStatus}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-gray-600">Type</div>
                      <div className="text-gray-900 font-medium">
                        {appointment?.appointmentType || "Lab Visit"}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-gray-600 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[var(--primary-color)]" />
                        Booking ID
                      </div>
                      <div className="font-mono text-xs bg-gray-50 px-3 py-1 rounded border">
                        {appointment?.bookingId}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackAppointment;
