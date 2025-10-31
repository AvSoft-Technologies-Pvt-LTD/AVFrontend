import React, { useState, useCallback, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Printer,
  CreditCard,
  Share2,
  Stethoscope,
  X,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  ArrowLeft,
  MessageCircle,
  AtSign,
} from "lucide-react";
import DynamicTable from "../../../../components/microcomponents/DynamicTable";
import PaymentGateway from "../../../../components/microcomponents/PaymentGatway";
import axiosInstance from "../../../../utils/axiosInstance";
import { toast } from "react-toastify";
import InvoiceTemplate from "../../../../components/microcomponents/TableComponents/InvoiceTemplate";

const Billing = () => {
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);
  const [paymentInvoice, setPaymentInvoice] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareInvoice, setShareInvoice] = useState(null);
  const [contactForm, setContactForm] = useState({
    email: "",
    phone: "",
  });
  const [isSending, setIsSending] = useState({ whatsapp: false, email: false });
  const user = useSelector((state) => state.auth.user);

  const [billingRecords, setBillingRecords] = useState();

  const patientId = useSelector((state) => state?.auth?.patientId);
  const handleFetchRecords = useCallback(async () => {
    try {
      const response = await axiosInstance.get("billing?patientId=" + patientId);
      console.log("Billing Response...", response?.data?.content);
      const formattedRecords = (response?.data?.content || []).map(record => {
        // format date: support both array [YYYY, M, D] and already-formatted strings
        let formattedDate = "";
        if (record.date) {
          if (Array.isArray(record.date)) {
            formattedDate = `${record.date[0]}-${String(record.date[1]).padStart(2, '0')}-${String(record.date[2]).padStart(2, '0')}`;
          } else {
            formattedDate = String(record.date);
          }
        }
        // combine scanServices.scanName and specialServices.serviceName into a single comma-separated serviceType
        const scanNames = Array.isArray(record.scanServices)
          ? record.scanServices.map(s => s?.scanName).filter(Boolean)
          : [];
        const specialNames = Array.isArray(record.specialServices)
          ? record.specialServices.map(s => s?.serviceName).filter(Boolean)
          : [];
        const combinedServiceType = [...scanNames, ...specialNames].join(', ') || record.serviceType || "";

        return {
          ...record,
          date: formattedDate,
          serviceType: combinedServiceType,
        };
      });
      setBillingRecords(formattedRecords);

    } catch (error) {
      console.error("Error fetching billings:", error);
      toast.error("Failed to fetch billings");
    } finally {
      // setLoading(false);
    }
  }, []);

  useEffect(() => {
    handleFetchRecords();

  }, [handleFetchRecords]);

  const handleBackNavigation = useCallback(() => {
    window.history.back();
  }, []);

  const getStatusBadgeClass = useCallback(
    (status) => (status === "Paid" ? "Paid" : "Pending"),
    []
  );

  const getStatusText = useCallback((status) => (status === "Paid" ? "Paid" : "Pending"), []);

  const handleView = useCallback(
    (row) => {
      const invoice = buildFullInvoice(row);
      setSelectedInvoice(invoice);
    },
    [user]
  );

  const handleDownload = useCallback(
    (row) => {
      const invoice = buildFullInvoice(row);
      setSelectedInvoice(invoice);
      setTimeout(() => {
        const invoiceElement = document.getElementById("invoice-print-template");
        if (invoiceElement) {
          const content = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Invoice ${row.invoiceId}</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet"><style>${getInvoiceCSS()}</style></head><body>${invoiceElement.outerHTML}</body></html>`;
          const blob = new Blob([content], { type: "text/html" });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `Invoice_${row.invoiceId}.html`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          setSelectedInvoice(null);
        }
      }, 100);
    },
    [user]
  );

  const handlePrint = useCallback(
    (row) => {
      const invoice = buildFullInvoice(row);
      setSelectedInvoice(invoice);
      setTimeout(() => {
        const printContent = document.getElementById("invoice-print-template").innerHTML;
        const WinPrint = window.open("", "", "width=900,height=650");
        WinPrint.document.write(
          `<html><head><title>Invoice ${row.invoiceId}</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet"><style>${getInvoiceCSS()}</style></head><body>${printContent}</body></html>`
        );
        WinPrint.document.close();
        WinPrint.focus();
        setTimeout(() => {
          WinPrint.print();
          WinPrint.close();
          setSelectedInvoice(null);
        }, 250);
      }, 300);
    },
    [user]
  );

  const handlePay = useCallback(
    (row) => {
      const invoice = buildFullInvoice(row);
      setPaymentInvoice(invoice);
      setShowPaymentGateway(true);
    },
    [user]
  );

  const handleShare = useCallback(
    (row) => {
      const invoice = buildFullInvoice(row);
      setShareInvoice(invoice);
      setShowShareModal(true);
    },
    [user]
  );

  // Helper: merge items + scanServices + specialServices and attach patient info
  function buildFullInvoice(row) {
    const baseItems = Array.isArray(row.items) ? row.items.slice() : [];

    const scanItems = Array.isArray(row.scanServices)
      ? row.scanServices.map(s => ({
        description: s?.scanName || s?.name || "Scan",
        quantity: s?.quantity || 1,
        cost: s?.price || s?.cost || s?.amount || 0,
        amount: s?.price || s?.cost || s?.amount || 0,
      }))
      : [];

    const specialItems = Array.isArray(row.specialServices)
      ? row.specialServices.map(s => ({
        description: s?.serviceName || s?.name || "Service",
        quantity: s?.quantity || 1,
        cost: s?.price || s?.cost || s?.amount || 0,
        amount: s?.price || s?.cost || s?.amount || 0,
      }))
      : [];

    const combinedItems = [...baseItems, ...scanItems, ...specialItems];

    const computedSubtotal = combinedItems.reduce((sum, it) => sum + (Number(it.amount) || 0), 0);

    return {
      ...row,
      items: combinedItems,
      subtotal: row.subtotal ?? computedSubtotal,
      total: row.total ?? (row.subtotal ?? computedSubtotal) - (row.discount ?? 0) + (row.tax ?? 0),
      patientName: `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "---",
      patientEmail: user?.email || "---",
      patientPhone: user?.phone || "---",
      patientAddress: user?.address || "---",
    };
  }

  const handlePaymentSuccess = useCallback(() => {
    setShowPaymentGateway(false);
    setPaymentInvoice(null);
  }, []);

  const handlePaymentFailure = useCallback(() => {
    setShowPaymentGateway(false);
    setPaymentInvoice(null);
  }, []);

  const generateMessageContent = () => {
    if (!shareInvoice) return { subject: "", body: "" };
    return {
      subject: `Invoice ${shareInvoice.invoiceId} - ${shareInvoice.doctorName}`,
      body: `MEDICAL INVOICE\n\nInvoice Details:\n• Invoice ID: ${shareInvoice.invoiceId}\n• Date: ${shareInvoice.date}\n• Doctor: ${shareInvoice.doctorName}\n• Service: ${shareInvoice.serviceType}\n• Total Amount: ₹${shareInvoice.billedAmount}\n• Paid Amount: ₹${shareInvoice.paidAmount}\n• Balance: ₹${shareInvoice.balance}\n• Status: ${shareInvoice.status === 'Paid' ? 'Paid' : 'Pending'}\n\nPatient: ${shareInvoice.patientName}\nGenerated on: ${new Date().toLocaleString()}\n\nFor any queries, please contact us at billing@digihealth.com`
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

    /* A4 print rules */
    @page { size: A4 portrait; margin: 10mm; }
    @media print {
      html, body { width: 210mm; height: 297mm; }
      body { background: white; }
      .invoice-container { width: calc(210mm - 20mm); margin: 0 auto; padding: 12mm; box-shadow: none !important; border: none !important; }
      .no-print { display: none !important; }
      /* ensure colors print as seen */
      * { -webkit-print-color-adjust: exact; color-adjust: exact; }
    }
  `, []);

  const tableColumns = [
    {
      header: "Invoice ID",
      accessor: "invoiceId",
      clickable: true,
      cell: (row) => (
        <button
          type="button"
          className="underline font-semibold text-xs sm:text-sm"
          onClick={() => handleView(row)}
        >
          {row.invoiceId}
        </button>
      ),
    },
    {
      header: "Date",
      accessor: "date",
    },
    {
      header: "Doctor/Provider",
      accessor: "doctorName",
      cell: (row) => (
        <button
          type="button"

        >
          {row.doctorName}
        </button>
      ),
    },
    {
      header: "Service",
      accessor: "serviceType",
    },
    {
      header: "Billed Amount",
      accessor: "billedAmount",
      cell: (row) => `₹${row.billedAmount}`,
    },
    {
      header: "Paid Amount",
      accessor: "paidAmount",
      cell: (row) => `₹${row.paidAmount}`,
    },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => (
        <span className={getStatusBadgeClass(row.status)}>
          {getStatusText(row.status)}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: "actions",
      cell: (row) => (
        <div className="flex items-center gap-2 justify-end">
          {row.balance > 0 && (
            <button
              onClick={() => handlePay(row)}
              className="flex items-center gap-1 px-2 py-1 text-xs text-white bg-[var(--accent-color)] hover:bg-[var(--accent-color)]/90 rounded-lg transition-colors"
              title="Pay Now"
            >
              <span>Pay</span>
            </button>
          )}
          <button
            onClick={() => handleShare(row)}
            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            title="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];


  const filters = [
    {
      key: "status",
      title: "Status",
      options: [
        { value: "paid", label: "Paid" },
        { value: "pending", label: "Pending" },
      ],
    },
  ];
  const records = [
    {
      id: 1,
      invoiceId: "INV-001",
      date: "2025-01-15",
      doctorName: "Dr. Rajesh Sharma",
      serviceType: "OPD Consultation",
      billedAmount: 800,
      paidAmount: 500,
      balance: 300,
      status: "pending",
      method: "card",
      items: [
        { description: "Consultation Fee", quantity: 1, cost: 500, amount: 500 },
        { description: "Medical Report", quantity: 1, cost: 200, amount: 200 },
        { description: "Prescription", quantity: 1, cost: 100, amount: 100 },
        { description: "Prescription", quantity: 1, cost: 100, amount: 100 },
        { description: "Prescription", quantity: 1, cost: 100, amount: 100 },
        { description: "Consultation Fee", quantity: 1, cost: 500, amount: 500 },
        { description: "Medical Report", quantity: 1, cost: 200, amount: 200 },
        { description: "Prescription", quantity: 1, cost: 100, amount: 100 },
        { description: "Consultation Fee", quantity: 1, cost: 500, amount: 500 },
        { description: "Medical Report", quantity: 1, cost: 200, amount: 200 },
        { description: "Prescription", quantity: 1, cost: 100, amount: 100 },
        { description: "Prescription", quantity: 1, cost: 100, amount: 100 },
        { description: "Consultation Fee", quantity: 1, cost: 500, amount: 500 },
        { description: "Medical Report", quantity: 1, cost: 200, amount: 200 },
        { description: "Prescription", quantity: 1, cost: 100, amount: 100 },
        { description: "Consultation Fee", quantity: 1, cost: 500, amount: 500 },
        { description: "Medical Report", quantity: 1, cost: 200, amount: 200 },
      ],
      subtotal: 800,
      discount: 0,
      tax: 0,
      total: 800,
    },
    {
      id: 2,
      invoiceId: "INV-002",
      date: "2025-01-12",
      doctorName: "Dr. Priya Patel",
      serviceType: "Lab Test - Blood Work",
      billedAmount: 1200,
      paidAmount: 1200,
      balance: 0,
      status: "paid",
      method: "upi",
      items: [
        { description: "Complete Blood Count", quantity: 1, cost: 600, amount: 600 },
        { description: "Lipid Profile", quantity: 1, cost: 400, amount: 400 },
        { description: "Blood Sugar Test", quantity: 1, cost: 200, amount: 200 },
      ],
      subtotal: 1200,
      discount: 0,
      tax: 0,
      total: 1200,
    },
    {
      id: 3,
      invoiceId: "INV-003",
      date: "2025-01-10",
      doctorName: "Dr. Amit Kumar",
      serviceType: "X-Ray Examination",
      billedAmount: 600,
      paidAmount: 300,
      balance: 300,
      status: "pending",
      method: "cash",
      items: [
        { description: "Chest X-Ray", quantity: 1, cost: 400, amount: 400 },
        { description: "Radiologist Report", quantity: 1, cost: 200, amount: 200 },
      ],
      subtotal: 600,
      discount: 0,
      tax: 0,
      total: 600,
    },
    {
      id: 4,
      invoiceId: "INV-004",
      date: "2024-12-28",
      doctorName: "Dr. Sarah Wilson",
      serviceType: "Emergency Consultation",
      billedAmount: 1500,
      paidAmount: 0,
      balance: 1500,
      status: "pending",
      method: "pending",
      items: [
        { description: "Emergency Consultation", quantity: 1, cost: 1000, amount: 1000 },
        { description: "Emergency Medicine", quantity: 1, cost: 300, amount: 300 },
        { description: "Medical Supplies", quantity: 1, cost: 200, amount: 200 },
      ],
      subtotal: 1500,
      discount: 0,
      tax: 0,
      total: 1500,
    },
    {
      id: 5,
      invoiceId: "INV-005",
      date: "2025-01-08",
      doctorName: "Dr. Vikram Singh",
      serviceType: "Physiotherapy Session",
      billedAmount: 900,
      paidAmount: 900,
      balance: 0,
      status: "paid",
      method: "card",
      items: [{ description: "Physiotherapy Session", quantity: 3, cost: 300, amount: 900 }],
      subtotal: 900,
      discount: 0,
      tax: 0,
      total: 900,
    },
  ];

  return (
    <div className="p-4 sm:p-6">
      <DynamicTable
        title="Billing Invoices"
        columns={tableColumns}
        data={billingRecords || []}
        filters={filters}
        onCellClick={(row, column) => {
          if (column.accessor === "invoiceId") {
            handleView(row);
          }
        }}
        noDataMessage="No invoices found."
        itemsPerPage={9}
      />
      {/* Payment Gateway Modal */}
      {showPaymentGateway && paymentInvoice && (
        <PaymentGateway
          isOpen={showPaymentGateway}
          onClose={() => {
            setShowPaymentGateway(false);
            setPaymentInvoice(null);
          }}
          amount={paymentInvoice.balance}
          bookingId={paymentInvoice.invoiceId}
          merchantName="DigiHealth"
          methods={["card", "upi", "wallet", "netbanking"]}
          onPay={handlePaymentSuccess}
          bookingDetails={{
            serviceType: paymentInvoice.serviceType,
            doctorName: paymentInvoice.doctorName,
            hospitalName: "DigiHealth Hospital",
            appointmentDate: paymentInvoice.date,
            appointmentTime: "10:30 AM",
            patient: [
              {
                name: paymentInvoice.patientName,
                age: 28,
                gender: "Female",
                patientId: "PT12345",
              },
            ],
            contactEmail: paymentInvoice.patientEmail,
            contactPhone: paymentInvoice.patientPhone,
            fareBreakup: {
              consultationFee: paymentInvoice.balance * 0.8,
              taxes: paymentInvoice.balance * 0.15,
              serviceFee: paymentInvoice.balance * 0.05,
            },
          }}
          currency="₹"
        />
      )}
      {/* Share Modal with Scrolling */}
      {showShareModal && shareInvoice && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
              <h2 className="text-xl font-semibold text-gray-800">Share Invoice</h2>
              <button
                onClick={() => {
                  setShowShareModal(false);
                  setShareInvoice(null);
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
                    <InvoiceTemplate invoice={selectedInvoice} showActions={false} />
                  </div>
                </div>
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-gray-800">Send Invoice Options</h4>
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
                      className={`flex flex-col items-center p-4 rounded-lg border transition-all ${contactForm.phone && !isSending.whatsapp
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
                      className={`flex flex-col items-center p-4 rounded-lg border transition-all ${contactForm.email && !isSending.email
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
                        <strong>Note:</strong> Please provide WhatsApp number or email address to send the invoice.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Invoice Detail Modal with Scrolling */}
      {selectedInvoice && !showPaymentGateway && !showShareModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 modal-fadeIn">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden">
            <div className="no-print sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="flex items-center gap-1.5 md:gap-2 hover:text-[var(--accent-color)] transition-colors text-gray-600 text-xs md:text-sm"
                >
                  <ArrowLeft size={16} className="md:size-[20px]" />
                  <span className="font-medium">Back to Invoices</span>
                </button>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(90vh-80px)] custom-scrollbar">
              <InvoiceTemplate invoice={selectedInvoice}
                showActions={true}
                Calendar={Calendar}
                CreditCard={CreditCard}
                Mail={Mail}
                MapPin={MapPin}
                Phone={Phone}
                Printer={Printer}
                Stethoscope={Stethoscope}
                User={User} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};



export default Billing;
