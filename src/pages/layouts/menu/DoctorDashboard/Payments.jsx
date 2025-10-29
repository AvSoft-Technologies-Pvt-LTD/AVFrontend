import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import Pagination from "../../../../components/Pagination";
import {
  Printer,
  X,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  Stethoscope,
  CreditCard,
  Share2,
  Download,
  Eye,
  ArrowLeft,
  Send,
  MessageCircle,
  AtSign,
} from "lucide-react";
import DynamicTable from "../../../../components/microcomponents/DynamicTable";

const Payments = () => {
  const user = useSelector((state) => state.auth?.user);
  const [currentDoctorName, setCurrentDoctorName] = useState("Dr. Kavya Patil");
  const [payments, setPayments] = useState([]);
  const [confirmedPatients, setConfirmedPatients] = useState([]);
  const [allAppointments, setAllAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharePayment, setSharePayment] = useState(null);
  const [contactForm, setContactForm] = useState({
    email: "",
    phone: "",
  });
  const [isSending, setIsSending] = useState({ whatsapp: false, email: false });
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    setIsLoading(true);
    try {
      const dummyConfirmedPatients = [
        {
          id: 1,
          name: "Rahul Sharma",
          firstName: "Rahul",
          lastName: "Sharma",
          email: "rahul.sharma@example.com",
          phone: "+91 98765 43210",
          doctorName: currentDoctorName,
          symptoms: "Fever, Headache",
          createdAt: "2025-09-10T10:00:00",
        },
        {
          id: 2,
          name: "Priya Singh",
          firstName: "Priya",
          lastName: "Singh",
          email: "priya.singh@example.com",
          phone: "+91 98765 43211",
          doctorName: currentDoctorName,
          symptoms: "Cough, Cold",
          createdAt: "2025-09-12T11:00:00",
        },
      ];
      const dummyAppointments = [
        {
          id: 1,
          patientName: "Amit Kumar",
          name: "Amit Kumar",
          email: "amit.kumar@example.com",
          phone: "+91 98765 43212",
          doctorName: currentDoctorName,
          date: "2025-09-14",
          time: "14:00",
          type: "OPD",
          symptoms: "Stomach Pain",
        },
        {
          id: 2,
          patientName: "Sneha Reddy",
          name: "Sneha Reddy",
          email: "sneha.reddy@example.com",
          phone: "+91 98765 43213",
          doctorName: currentDoctorName,
          date: "2025-09-15",
          time: "16:00",
          type: "Virtual",
          symptoms: "Back Pain",
        },
      ];
      const dummyPayments = [
        {
          id: 1,
          patientName: "Rahul Sharma",
          invoiceNo: "INV-2025-001",
          date: "2025-09-10",
          amount: 1500,
          method: "UPI",
          status: "paid",
          serviceType: "General Consultation",
        },
        {
          id: 2,
          patientName: "Priya Singh",
          invoiceNo: "INV-2025-002",
          date: "2025-09-12",
          amount: 2000,
          method: "Card",
          status: "paid",
          serviceType: "OPD Consultation",
        },
        {
          id: 3,
          patientName: "Amit Kumar",
          invoiceNo: "INV-2025-003",
          date: "2025-09-14",
          amount: 1800,
          method: "Cash",
          status: "paid",
          serviceType: "Virtual Consultation",
        },
        {
          id: 4,
          patientName: "Sneha Reddy",
          invoiceNo: "INV-2025-004",
          date: "2025-09-15",
          amount: 2200,
          method: "UPI",
          status: "paid",
          serviceType: "OPD Consultation",
        },
      ];
      setConfirmedPatients(dummyConfirmedPatients);
      setAllAppointments(dummyAppointments);
      const enhancedPayments = dummyPayments.map((payment) => {
        const relatedPatient = dummyConfirmedPatients.find(
          (p) => p.name.toLowerCase() === payment.patientName.toLowerCase()
        );
        const relatedAppointment = dummyAppointments.find(
          (a) => a.patientName.toLowerCase() === payment.patientName.toLowerCase()
        );
        return {
          ...payment,
          doctorName: currentDoctorName,
          appointmentDate: relatedAppointment?.date || payment.date,
          appointmentTime: relatedAppointment?.time || "N/A",
          symptoms: relatedPatient?.symptoms || relatedAppointment?.symptoms || "General checkup",
          patientEmail: relatedPatient?.email || relatedAppointment?.email || "patient@email.com",
          patientPhone: relatedPatient?.phone || relatedAppointment?.phone || "+91 98765 43210",
          consultationType: relatedAppointment?.type || "General",
          isConfirmedPatient: !!relatedPatient,
          hasAppointment: !!relatedAppointment,
          dataSource: relatedPatient ? "confirmed" : relatedAppointment ? "appointment" : "payment_only",
        };
      });
      setPayments(enhancedPayments);
    } catch (err) {
      setError("Failed to load dummy data");
    } finally {
      setIsLoading(false);
    }
  }, [currentDoctorName]);

  const handleBackNavigation = useCallback(() => {
    window.history.back();
  }, []);

  const getServiceType = (dataSource) => {
    if (dataSource.type === "OPD") return "OPD Consultation";
    if (dataSource.type === "Virtual") return "Virtual Consultation";
    if (dataSource.type === "Physical") return "OPD Consultation";
    if (dataSource.consultationType === "Physical") return "OPD Consultation";
    if (dataSource.consultationType === "Virtual") return "Virtual Consultation";
    return dataSource.specialty || dataSource.serviceType || "General Consultation";
  };

  const getPatientSymptoms = (dataSource) => {
    return (
      dataSource.symptoms ||
      dataSource.reason ||
      dataSource.consultationReason ||
      "General checkup"
    );
  };

  const formatDate = (d) => {
    try {
      return new Date(d).toLocaleDateString();
    } catch (error) {
      return d;
    }
  };

  const getStatusBadgeClass = useCallback(
    (status) => (status === "paid" || status === "completed" ? "status-completed" : "status-pending"),
    []
  );

  const getStatusText = useCallback((status) => {
    if (status === "paid" || status === "completed") return "Paid";
    return "Pending";
  }, []);

  const handleView = useCallback((record) => {
    const invoiceData = {
      id: record.id,
      invoiceNo: record.invoiceNo,
      date: record.date,
      doctorName: record.doctorName,
      serviceType: record.serviceType,
      billedAmount: record.amount,
      paidAmount: record.amount,
      balance: 0,
      status: "paid",
      method: record.method,
      patientName: record.patientName,
      patientEmail: record.patientEmail,
      patientPhone: record.patientPhone,
      patientAddress: "Address not available",
      appointmentDate: record.appointmentDate,
      appointmentTime: record.appointmentTime,
      symptoms: record.symptoms,
      consultationType: record.consultationType,
      items: [
        {
          description: record.serviceType,
          quantity: 1,
          cost: record.amount,
          amount: record.amount,
        },
      ],
      subtotal: record.amount,
      discount: 0,
      tax: 0,
      total: record.amount,
    };
    setSelectedPayment(invoiceData);
  }, []);

  const handlePrint = useCallback((record) => {
    const invoiceData = {
      id: record.id,
      invoiceNo: record.invoiceNo,
      date: record.date,
      doctorName: record.doctorName,
      serviceType: record.serviceType,
      billedAmount: record.amount,
      paidAmount: record.amount,
      balance: 0,
      status: "paid",
      method: record.method,
      patientName: record.patientName,
      patientEmail: record.patientEmail,
      patientPhone: record.patientPhone,
      patientAddress: "Address not available",
      appointmentDate: record.appointmentDate,
      appointmentTime: record.appointmentTime,
      symptoms: record.symptoms,
      consultationType: record.consultationType,
      items: [
        {
          description: record.serviceType,
          quantity: 1,
          cost: record.amount,
          amount: record.amount,
        },
      ],
      subtotal: record.amount,
      discount: 0,
      tax: 0,
      total: record.amount,
    };
    setSelectedPayment(invoiceData);
    setTimeout(() => {
      const printContent = document.getElementById("invoice-print-template").innerHTML;
      const WinPrint = window.open("", "", "width=900,height=650");
      WinPrint.document.write(
        `<html><head><title>Payment Receipt ${record.invoiceNo}</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet"><style>${getInvoiceCSS()}@media print { body { margin: 0; padding: 0; } .invoice-container { margin: 0; padding: 15px; box-shadow: none; border: none; } .no-print { display: none !important; } }</style></head><body>${printContent}</body></html>`
      );
      WinPrint.document.close();
      WinPrint.focus();
      setTimeout(() => {
        WinPrint.print();
        WinPrint.close();
        setSelectedPayment(null);
      }, 250);
    }, 300);
  }, []);

  const handleShare = useCallback((record) => {
    const invoiceData = {
      id: record.id,
      invoiceNo: record.invoiceNo,
      date: record.date,
      doctorName: record.doctorName,
      serviceType: record.serviceType,
      billedAmount: record.amount,
      paidAmount: record.amount,
      balance: 0,
      status: "paid",
      method: record.method,
      patientName: record.patientName,
      patientEmail: record.patientEmail,
      patientPhone: record.patientPhone,
      patientAddress: "Address not available",
      appointmentDate: record.appointmentDate,
      appointmentTime: record.appointmentTime,
      symptoms: record.symptoms,
      consultationType: record.consultationType,
      items: [
        {
          description: record.serviceType,
          quantity: 1,
          cost: record.amount,
          amount: record.amount,
        },
      ],
      subtotal: record.amount,
      discount: 0,
      tax: 0,
      total: record.amount,
    };
    setSharePayment(invoiceData);
    setShowShareModal(true);
  }, []);

  const generateMessageContent = () => {
    if (!sharePayment) return { subject: "", body: "" };
    return {
      subject: `Payment Receipt ${sharePayment.invoiceNo} - ${sharePayment.doctorName}`,
      body: `PAYMENT RECEIPT\n\nPayment Details:\n• Receipt ID: ${sharePayment.invoiceNo}\n• Date: ${sharePayment.date}\n• Doctor: ${sharePayment.doctorName}\n• Service: ${sharePayment.serviceType}\n• Amount Paid: ₹${sharePayment.amount}\n• Payment Method: ${sharePayment.method}\n• Status: Paid\n\nPatient: ${sharePayment.patientName}\nAppointment: ${sharePayment.appointmentDate} at ${sharePayment.appointmentTime}\n\nGenerated on: ${new Date().toLocaleString()}\n\nFor any queries, please contact us at billing@digihealth.com`
    };
  };

  const sendWhatsAppMessage = async () => {
    if (!contactForm.phone) {
      alert("Please enter a WhatsApp number");
      return;
    }
    setIsSending(prev => ({ ...prev, whatsapp: true }));
    try {
      const messageContent = generateMessageContent();
      const whatsappMessage = `${messageContent.subject}\n\n${messageContent.body}`;
      
      // Simulate WhatsApp API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert(`WhatsApp message sent successfully to +91${contactForm.phone}!`);
      setContactForm({ email: "", phone: "" });
      setShowShareModal(false);
    } catch (error) {
      alert("Failed to send WhatsApp message. Please try again.");
    } finally {
      setIsSending(prev => ({ ...prev, whatsapp: false }));
    }
  };

  const sendEmail = async () => {
    if (!contactForm.email.trim()) {
      alert("Please enter an email address");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactForm.email)) {
      alert("Please enter a valid email address");
      return;
    }
    setIsSending(prev => ({ ...prev, email: true }));
    try {
      const messageContent = generateMessageContent();
      
      // Simulate email API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert(`Email sent successfully to ${contactForm.email}!`);
      setContactForm({ email: "", phone: "" });
      setShowShareModal(false);
    } catch (error) {
      alert("Failed to send email. Please try again.");
    } finally {
      setIsSending(prev => ({ ...prev, email: false }));
    }
  };

  const getInvoiceCSS = useCallback(() => `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.4; color: #374151; background: white; font-size: 14px; }
    .invoice-container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border: 1px solid #e5e7eb; }
    .invoice-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 2px solid #3b82f6; }
    .invoice-title { font-size: 28px; font-weight: 700; color: #3b82f6; margin-bottom: 4px; }
    .invoice-number { font-size: 14px; color: #6b7280; font-weight: 500; }
    .company-info { text-align: right; display: flex; align-items: center; gap: 8px; }
    .company-logo { width: 50px; height: 50px; background: #3b82f6; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .company-name { font-size: 18px; font-weight: 600; color: #3b82f6; white-space: nowrap; }
    .invoice-details { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 25px; }
    .detail-section h3 { font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
    .detail-item { display: flex; align-items: center; margin-bottom: 4px; font-size: 13px; }
    .detail-item svg { width: 14px; height: 14px; margin-right: 6px; color: #6b7280; }
    .detail-item span { color: #374151; }
    .patient-name { font-weight: 600; color: #111827 !important; }
    .invoice-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
    .invoice-table th { background: #f8fafc; padding: 10px 12px; text-align: left; font-weight: 600; color: #374151; border: 1px solid #e2e8f0; font-size: 12px; }
    .invoice-table th:nth-child(2), .invoice-table th:nth-child(3), .invoice-table th:nth-child(4) { text-align: right; }
    .invoice-table td { padding: 10px 12px; border: 1px solid #e2e8f0; color: #374151; }
    .invoice-table td:nth-child(2), .invoice-table td:nth-child(3), .invoice-table td:nth-child(4) { text-align: right; font-weight: 500; }
    .invoice-table tr:nth-child(even) { background: #f9fafb; }
    .invoice-totals { display: flex; justify-content: flex-end; margin-bottom: 25px; }
    .totals-section { width: 280px; }
    .total-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; border-bottom: 1px solid #f3f4f6; }
    .total-row span:first-child { color: #6b7280; }
    .total-row span:last-child { font-weight: 500; color: #374151; }
    .total-row.final { background: #3b82f6; color: white; padding: 12px 16px; margin-top: 10px; border-radius: 6px; font-weight: 600; font-size: 16px; border: none; }
    .total-row.final span { color: white !important; }
    .invoice-footer { margin-top: 25px; padding-top: 15px; border-top: 1px solid #e5e7eb; text-align: center; }
    .terms { font-size: 11px; color: #6b7280; margin-bottom: 10px; text-align: left; }
    .terms h4 { font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 6px; }
    .thank-you { font-size: 14px; font-weight: 500; color: #3b82f6; margin-bottom: 4px; }
    .contact-info { font-size: 11px; color: #6b7280; }
    @media print { body { margin: 0; padding: 0; } .invoice-container { margin: 0; padding: 15px; box-shadow: none; border: none; } .no-print { display: none !important; } }
  `, []);

  const columns = [
    {
      header: "Patient Name",
      accessor: "patientName",
      clickable: true,
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900">{row.patientName}</span>
        </div>
      ),
    },
    {
      header: "Invoice No",
      accessor: "invoiceNo",
      cell: (row) => <span className="text-sm font-mono text-gray-700">#{row.invoiceNo}</span>,
    },
    {
      header: "Date",
      accessor: "date",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="text-sm">{formatDate(row.date)}</span>
        </div>
      ),
    },
    {
      header: "Service Type",
      accessor: "serviceType",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{row.serviceType}</span>
        </div>
      ),
    },
    {
      header: "Amount",
      accessor: "amount",
      cell: (row) => (
        <span className="text-sm font-semibold text-green-600">₹{Number(row.amount).toLocaleString()}</span>
      ),
    },
    {
      header: "Mode",
      accessor: "method",
      cell: (row) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
          {row.method}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          ✓ Paid
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: "actions",
      cell: (row) => (
        <div className="flex items-center gap-1 justify-end">
          <button
            onClick={() => handleShare(row)}
            className="p-2 text-gray-600 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors"
            title="Share Receipt"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const getUniqueValues = (key) => {
    const values = [...new Set(payments.map((p) => p[key]).filter(Boolean))];
    return values.map((value) => ({ label: value, value: value }));
  };

  const filters = [
    {
      key: "method",
      label: "Payment Mode",
      options: getUniqueValues("method"),
    },
    {
      key: "serviceType",
      label: "Service Type",
      options: getUniqueValues("serviceType"),
    },
    {
      key: "consultationType",
      label: "Consultation Type",
      options: getUniqueValues("consultationType"),
    },
    {
      key: "dataSource",
      label: "Data Source",
      options: [
        { label: "Confirmed Patients", value: "confirmed" },
        { label: "Appointments", value: "appointment" },
        { label: "Payment Only", value: "payment_only" },
      ],
    },
  ];

  const startIndex = (page - 1) * rowsPerPage;
  const paginatedData = payments.slice(startIndex, startIndex + rowsPerPage);
  const totalPages = Math.ceil(payments.length / rowsPerPage);
  const totalEarnings = payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-2">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="text-blue-500 hover:text-blue-700 underline"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Payment Records - {currentDoctorName}
            </h2>
            <div className="text-sm text-gray-500">
              Confirmed Patients: {confirmedPatients.length} | Appointments: {allAppointments.length}
            </div>
          </div>
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
              <CreditCard className="text-gray-400 w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No payment records found</h3>
            <p className="text-gray-600 text-sm max-w-md mx-auto">
              No payment records found for your patients. Payment records will appear here once patients make payments.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Back Button */}
      <div className="mb-2">
        <button
          onClick={handleBackNavigation}
          className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-[var(--accent-color)] rounded-lg transition-all duration-200 group"
          title="Go back to previous page"
        >
          <ArrowLeft
            size={18}
            className="transition-transform duration-200 group-hover:-translate-x-1"
          />
          <span className="font-medium text-sm">Back</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Payment Records - {currentDoctorName}
            </h2>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">₹{totalEarnings.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Total from {payments.length} payments</div>
          </div>
        </div>

        <div className="mt-2">
          <DynamicTable
            columns={columns}
            data={paginatedData}
            onCellClick={(row, col) => {
              if (col.accessor === "patientName") handleView(row);
            }}
            filters={filters}
            showSearchBar={true}
            searchPlaceholder="Search by patient name, invoice, or service..."
          />
        </div>

        {totalPages > 1 && (
          <div className="w-full flex justify-end mt-3">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}

        {/* Share Modal with Scrolling */}
        {showShareModal && sharePayment && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
                <h2 className="text-xl font-semibold text-gray-800">Share Payment Receipt</h2>
                <button
                  onClick={() => {
                    setShowShareModal(false);
                    setSharePayment(null);
                    setContactForm({ email: "", phone: "" });
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
                  title="Close"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="overflow-y-auto max-h-[calc(90vh-80px)] custom-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
                  <div>
                    <div className="bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden text-sm">
                      <InvoiceTemplate invoice={sharePayment} showActions={false} />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h4 className="text-lg font-semibold text-gray-800">Send Receipt Options</h4>
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h3>
                      <div className="grid grid-cols-1 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <Phone size={16} className="inline mr-2" />
                            WhatsApp Number
                          </label>
                          <input
                            type="tel"
                            value={contactForm.phone}
                            onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                            className="w-full p-3 border border-gray-300 rounded-lg"
                            placeholder="9876543210"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <AtSign size={16} className="inline mr-2" />
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={contactForm.email}
                            onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full p-3 border border-gray-300 rounded-lg"
                            placeholder="patient@example.com"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={sendWhatsAppMessage}
                        disabled={!contactForm.phone || isSending.whatsapp}
                        className={`flex flex-col items-center p-4 rounded-lg border transition-all ${
                          contactForm.phone && !isSending.whatsapp
                            ? "border-green-300 hover:bg-green-50 hover:scale-105"
                            : "border-gray-300 opacity-50 cursor-not-allowed"
                        }`}
                      >
                        {isSending.whatsapp ? (
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        ) : (
                          <MessageCircle className="w-8 h-8 mb-2 text-green-600" />
                        )}
                        <span className="text-xs font-medium text-center">
                          {isSending.whatsapp ? "Sending..." : "WhatsApp"}
                        </span>
                      </button>
                      <button
                        onClick={sendEmail}
                        disabled={!contactForm.email || isSending.email}
                        className={`flex flex-col items-center p-4 rounded-lg border transition-all ${
                          contactForm.email && !isSending.email
                            ? "border-red-300 hover:bg-red-50 hover:scale-105"
                            : "border-gray-300 opacity-50 cursor-not-allowed"
                        }`}
                      >
                        {isSending.email ? (
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                        ) : (
                          <Mail className="w-8 h-8 mb-2 text-red-600" />
                        )}
                        <span className="text-xs font-medium text-center">
                          {isSending.email ? "Sending..." : "Email"}
                        </span>
                      </button>
                    </div>
                    {!contactForm.phone && !contactForm.email && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-yellow-800 text-sm">
                          <strong>Note:</strong> Please provide WhatsApp number or email address to send the receipt.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Detail Modal with Scrolling */}
        {selectedPayment && !showShareModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
                <h2 className="text-xl font-semibold text-gray-800">Payment Receipt</h2>
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
                  title="Close"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="overflow-y-auto max-h-[calc(90vh-80px)] custom-scrollbar">
                <InvoiceTemplate invoice={selectedPayment} showActions={true} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const InvoiceTemplate = React.memo(({ invoice, showActions }) => {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div id="invoice-print-template" className="bg-white rounded-lg">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6 pb-4 border-b-2 border-blue-500">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">PAYMENT RECEIPT</h1>
              <p className="text-sm text-gray-600 font-medium mt-1">#{invoice.invoiceNo}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <Stethoscope className="text-white" size={20} />
              </div>
              <div>
                <div className="text-lg font-semibold text-blue-600">DigiHealth</div>
                <div className="text-xs text-gray-500">Healthcare Solutions</div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 mb-6">
            <div>
              <h3 className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide border-b border-gray-200 pb-1">
                Payment Details
              </h3>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                  <span>Payment Date: {invoice.date}</span>
                </div>
                <div className="flex items-center text-sm">
                  <CreditCard className="w-4 h-4 mr-2 text-gray-500" />
                  <span>Payment Method: {invoice.method}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Stethoscope className="w-4 h-4 mr-2 text-gray-500" />
                  <span>Doctor: {invoice.doctorName}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                  <span>Appointment: {invoice.appointmentDate} at {invoice.appointmentTime}</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="w-4 h-4 mr-2 bg-green-500 rounded-full flex-shrink-0"></span>
                  <span className="text-green-600 font-medium">Payment Completed</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide border-b border-gray-200 pb-1">
                Patient Information
              </h3>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <User className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="font-medium">{invoice.patientName}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Mail className="w-4 h-4 mr-2 text-gray-500" />
                  <span>{invoice.patientEmail}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Phone className="w-4 h-4 mr-2 text-gray-500" />
                  <span>{invoice.patientPhone}</span>
                </div>
                <div className="flex items-center text-sm">
                  <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                  <span>{invoice.patientAddress || "Address not available"}</span>
                </div>
                {invoice.symptoms && (
                  <div className="flex items-center text-sm">
                    <Stethoscope className="w-4 h-4 mr-2 text-gray-500" />
                    <span>Symptoms: {invoice.symptoms}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="mb-6">
            <table className="w-full border-collapse border border-gray-200 text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-4 py-3 text-left font-semibold">
                    Service Description
                  </th>
                  <th className="border border-gray-200 px-4 py-3 text-right font-semibold">Unit Cost</th>
                  <th className="border border-gray-200 px-4 py-3 text-right font-semibold">Qty</th>
                  <th className="border border-gray-200 px-4 py-3 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="border border-gray-200 px-4 py-3">{item.description}</td>
                    <td className="border border-gray-200 px-4 py-3 text-right font-medium">₹{item.cost}</td>
                    <td className="border border-gray-200 px-4 py-3 text-right font-medium">{item.quantity}</td>
                    <td className="border border-gray-200 px-4 py-3 text-right font-medium">₹{item.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end mb-6">
            <div className="w-72">
              <div className="space-y-2">
                <div className="flex justify-between py-1 text-sm border-b border-gray-100">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{invoice.subtotal}</span>
                </div>
                <div className="flex justify-between py-1 text-sm border-b border-gray-100">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-medium">₹{invoice.discount}</span>
                </div>
                <div className="flex justify-between py-1 text-sm border-b border-gray-100">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">₹{invoice.tax}</span>
                </div>
                <div className="bg-green-500 text-white py-3 px-4 mt-3 rounded-md font-semibold text-lg flex justify-between">
                  <span>Amount Paid</span>
                  <span>₹{invoice.total}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-4 border-t border-gray-200">
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-gray-700 mb-2">Payment Terms</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                This receipt confirms successful payment for medical services rendered by {invoice.doctorName}.
                For any queries regarding this payment receipt, please contact us at
                billing@digihealth.com or call our support team.
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-green-600 mb-1">
                Thank you for your payment and for choosing {invoice.doctorName}
              </p>
              <p className="text-xs text-gray-500">contact@digihealth.com | +91 98765 43210</p>
            </div>
          </div>
          {showActions && (
            <div className="no-print mt-6 pt-4 border-t border-gray-200 flex flex-wrap gap-3 justify-center">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-700 border text-sm"
              >
                <Printer className="w-4 h-4" /> Print Receipt
              </button>
              <button
                onClick={() => {
                  const shareData = {
                    title: `Payment Receipt ${invoice.invoiceNo}`,
                    text: `Medical Payment Receipt from ${invoice.doctorName} - Amount: ₹${invoice.total}`,
                    url: window.location.href,
                  };
                  if (navigator.canShare && navigator.canShare(shareData)) {
                    navigator.share(shareData).catch(console.error);
                  } else {
                    navigator.clipboard.writeText(
                      `Payment Receipt ${invoice.invoiceNo} - Amount: ₹${invoice.total}`
                    );
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm"
              >
                <Share2 className="w-4 h-4" /> Share Receipt
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
});

export default Payments;