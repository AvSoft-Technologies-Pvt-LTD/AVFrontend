import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Clock, MapPin, DollarSign, CreditCard, CheckCircle, FileText } from "lucide-react";

const PaymentPage = () => {
  const { state: bookingDetails } = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [method, setMethod] = useState("upi");
  const [cardData, setCardData] = useState({ number: "", expiry: "", cvv: "", upi: "" });
  const [errors, setErrors] = useState({});

  const generateBookingId = () => `APT${Date.now().toString().slice(-6)}`;

  const handleDownloadReceipt = () => {
    const receiptContent = `Appointment Receipt\n\nBooking ID: ${bookingId}\nPatient Name: ${bookingDetails.name}\nTest: ${bookingDetails.testTitle}\nLab: ${bookingDetails.labName}\nDate & Time: ${bookingDetails.date} at ${bookingDetails.time}\nLocation: ${bookingDetails.location}\nPayment Method: ${method}\nAmount Paid: ₹${bookingDetails.amount}\nStatus: Paid`;
    const blob = new Blob([receiptContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Appointment_Receipt_${bookingId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const validateCard = () => {
    const errs = {};
    if (method === "card") {
      if (!/^\d{16}$/.test(cardData.number)) errs.number = "Invalid card number";
      if (!/^\d{2}\/\d{2}$/.test(cardData.expiry)) errs.expiry = "Invalid expiry format";
      if (!/^\d{3}$/.test(cardData.cvv)) errs.cvv = "Invalid CVV";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePayment = async () => {
    if (method === "card" && !validateCard()) return;
    setLoading(true);
    const id = generateBookingId();
    const paymentDetails = {
      bookingId: id, status: "Paid", createdAt: new Date().toISOString(), paymentMethod: method, amountPaid: bookingDetails.amount, paymentStatus: "Success",
      upiTransactionId: method === "upi" ? `UPI-${Date.now()}` : null, upiPaymentStatus: method === "upi" ? "Pending" : null,
      cardType: method === "card" ? "Visa" : null, cardLast4Digits: method === "card" ? cardData.number.slice(-4) : null,
      bankName: method === "net" ? selectedBank : null, netBankingTransactionId: method === "net" ? `NET-${Date.now()}` : null,
      patientName: bookingDetails.name, testTitle: bookingDetails.testTitle, labName: bookingDetails.labName, location: bookingDetails.location,
      date: bookingDetails.date, time: bookingDetails.time, email: bookingDetails.email, phone: bookingDetails.phone, amount: bookingDetails.amount,
    };
    try {
      await axios.post("https://680b3642d5075a76d98a3658.mockapi.io/Lab/payment", paymentDetails);
      setSuccess(true);
      setBookingId(id);
    } catch (err) {
      alert("Payment failed!");
    } finally {
      setLoading(false);
    }
  };

  const getStepStatus = (stepIndex) => {
    switch (stepIndex) {
      case 0:
        return "completed";
      case 1:
        return method ? "completed" : "in-progress";
      case 2:
        return loading ? "in-progress" : "pending";
      case 3:
        return success ? "completed" : "pending";
      default:
        return "pending";
    }
  };

  const calculateProgress = () => {
    let completed = 1;
    if (method) completed++;
    if (loading) completed++;
    if (success) completed++;
    return (completed / 4) * 100;
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-white">
        <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-lg text-center">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-green-100">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[var(--primary-color)] mb-2">Appointment Confirmed!</h2>
          <p className="text-gray-600 mb-6">Your appointment has been successfully booked and payment received.</p>
          <hr className="my-4" />
          <div className="space-y-3 mb-6">
            <p className="text-lg font-semibold text-[var(--primary-color)] mb-2">Appointment Details</p>
            <p className="text-gray-600">{new Date(bookingDetails.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}, {bookingDetails.time}</p>
            <p className="text-gray-600">{bookingDetails.location}</p>
            <p className="text-sm text-gray-500 mt-2">An email confirmation has been sent to {bookingDetails.email}</p>
            <p className="text-sm font-medium text-gray-700">Booking ID: <strong>{bookingId}</strong></p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg hover:opacity-95 focus:outline-none transition-all" onClick={() => navigate(`/patientdashboard/track-appointment/${bookingId}`)}>Track Appointment</button>
            <button className="px-4 py-2 border border-[var(--primary-color)] text-[var(--primary-color)] rounded-lg hover:bg-gray-50 focus:outline-none transition-all" onClick={handleDownloadReceipt}>Download Receipt</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-[var(--primary-color)] text-center mb-8">
          Complete Your Payment
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6 sm:p-8 space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--primary-color)] mb-4">Select Payment Method</h2>
            <div className="space-y-3">
              {[{ value: "upi", label: "UPI / Google Pay / PhonePe" }, { value: "card", label: "Credit / Debit Card" }, { value: "net", label: "Net Banking" }].map((opt) => (
                <div key={opt.value} className={`p-4 border ${method === opt.value ? "border-[var(--accent-color)] bg-[var(--accent-color)]/10" : "border-gray-200 bg-white"} rounded-xl cursor-pointer hover:shadow-md transition-all`} onClick={() => setMethod(opt.value)}>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="payment" checked={method === opt.value} onChange={() => setMethod(opt.value)} className="w-4 h-4 text-[var(--accent-color)]" />
                    <span className="font-medium text-gray-800">{opt.label}</span>
                  </label>
                </div>
              ))}
            </div>

            <div className="mt-6 p-6 bg-gray-50 rounded-xl">
              {method === "upi" && (
                <div className="space-y-4">
                  <div className="text-center">
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=example@upi&pn=HealthLab&am=${bookingDetails.amount}`} alt="UPI QR Code" className="w-40 h-40 mx-auto" />
                    <p className="text-sm text-gray-600 mt-2">Scan & pay using any UPI app</p>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Or enter your UPI ID</label>
                    <input type="text" placeholder="e.g., user@upi" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--accent-color)] focus:border-transparent transition-all" value={cardData.upi} onChange={(e) => setCardData({ ...cardData, upi: e.target.value })} />
                  </div>
                </div>
              )}
              {method === "card" && (
                <div className="space-y-4">
                  <input type="text" placeholder="Card Number" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--accent-color)] focus:border-transparent transition-all" value={cardData.number} onChange={(e) => setCardData({ ...cardData, number: e.target.value.replace(/\D/g, "").slice(0, 16) })} />
                  {errors.number && <p className="text-red-500 text-sm">{errors.number}</p>}
                  <div className="flex gap-3">
                    <input type="text" placeholder="MM/YY" className="w-1/2 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--accent-color)] focus:border-transparent transition-all" value={cardData.expiry} onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })} />
                    <input type="text" placeholder="CVV" className="w-1/2 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--accent-color)] focus:border-transparent transition-all" value={cardData.cvv} onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, "").slice(0, 3) })} />
                  </div>
                  {errors.expiry && <p className="text-red-500 text-sm">{errors.expiry}</p>}
                  {errors.cvv && <p className="text-red-500 text-sm">{errors.cvv}</p>}
                </div>
              )}
              {method === "net" && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-700">Select your bank:</p>
                  <div className="space-y-2">
                    {["Bank of India", "HDFC Bank", "ICICI Bank", "Axis Bank"].map((bank) => (
                      <label key={bank} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-white rounded-lg transition-all">
                        <input type="radio" name="netbank" checked={selectedBank === bank} onChange={() => setSelectedBank(bank)} className="w-4 h-4 text-[var(--accent-color)]" />
                        <span className="text-gray-700">{bank}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              className="w-full py-4 bg-[var(--primary-color)] text-white text-base font-semibold rounded-xl hover:opacity-95 transition-all duration-300 shadow-md disabled:opacity-50"
              onClick={handlePayment}
              disabled={loading}
            >
              {loading ? "Processing..." : `Pay ₹${bookingDetails.amount}`}
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
            <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="text-[var(--primary-color)] w-5 h-5" />
                <h3 className="text-lg font-semibold text-[var(--primary-color)]">
                  Payment Progress
                </h3>
              </div>
            </div>

            <div className="px-6 py-6 relative">
              <div className="absolute left-[37px] top-0 bottom-0 w-0.5 bg-gray-200">
                <div
                  className="absolute top-0 left-0 w-full bg-[var(--accent-color)] transition-all duration-700 ease-out"
                  style={{ height: `${calculateProgress()}%` }}
                />
              </div>

              <div className="relative space-y-6">
                {[
                  {
                    icon: FileText,
                    title: "Booking Details",
                    status: getStepStatus(0),
                    content: (
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-700"><span className="font-medium">Patient:</span> {bookingDetails.name}</p>
                        <p className="text-gray-700"><span className="font-medium">Test:</span> {bookingDetails.testTitle.substring(0, 50)}...</p>
                        <p className="text-gray-700"><span className="font-medium">Lab:</span> {bookingDetails.labName}</p>
                      </div>
                    ),
                  },
                  {
                    icon: CreditCard,
                    title: "Payment Method",
                    status: getStepStatus(1),
                    content: (
                      <div className="text-sm">
                        <p className="text-gray-700">
                          <span className="font-medium capitalize">{method === "upi" ? "UPI" : method === "card" ? "Card" : "Net Banking"}</span>
                        </p>
                        {method === "card" && cardData.number && (
                          <p className="text-gray-600 text-xs mt-1">Ending with {cardData.number.slice(-4)}</p>
                        )}
                        {method === "net" && selectedBank && (
                          <p className="text-gray-600 text-xs mt-1">{selectedBank}</p>
                        )}
                      </div>
                    ),
                  },
                  {
                    icon: Clock,
                    title: "Processing",
                    status: getStepStatus(2),
                    content: (
                      <div className="text-sm text-gray-700">
                        {loading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                            <span>Processing your payment...</span>
                          </div>
                        ) : (
                          <span>Waiting to process</span>
                        )}
                      </div>
                    ),
                  },
                  {
                    icon: CheckCircle,
                    title: "Confirmation",
                    status: getStepStatus(3),
                    content: (
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-600">Your appointment will be confirmed</p>
                        <p className="text-gray-600"><span className="font-medium">Date:</span> {bookingDetails.date}</p>
                        <p className="text-gray-600"><span className="font-medium">Time:</span> {bookingDetails.time}</p>
                      </div>
                    ),
                  },
                ].map((step, index) => {
                  const Icon = step.icon;
                  const isCompleted = step.status === "completed";
                  const isInProgress = step.status === "in-progress";
                  const isPending = step.status === "pending";

                  return (
                    <div key={index} className="relative flex gap-4">
                      <div className="relative z-10 flex-shrink-0">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                            isCompleted
                              ? "bg-[var(--accent-color)] shadow-md"
                              : isInProgress
                              ? "bg-white border-2 border-[var(--accent-color)] shadow-sm"
                              : "bg-white border-2 border-gray-300"
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle className="w-5 h-5 text-white" />
                          ) : (
                            <Icon
                              className={`w-4 h-4 ${
                                isInProgress ? "text-[var(--accent-color)]" : "text-gray-400"
                              }`}
                            />
                          )}
                        </div>
                      </div>

                      <div className="flex-1 pb-2">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-semibold text-gray-900">
                            {step.title}
                          </h4>
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              isCompleted
                                ? "bg-[var(--accent-color)]/10 text-[var(--accent-color)]"
                                : isInProgress
                                ? "bg-blue-50 text-blue-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {isCompleted
                              ? "Done"
                              : isInProgress
                              ? "In progress"
                              : "Pending"}
                          </span>
                        </div>
                        <div className="text-sm">{step.content}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-[var(--accent-color)]/10 px-6 py-4 border-t border-[var(--accent-color)]/20">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Amount</span>
                  <span className="font-semibold text-gray-900">₹{bookingDetails.amount}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Collection Fee</span>
                  <span className="font-semibold text-gray-900">₹0</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-[var(--accent-color)]/20">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="text-lg font-bold text-[var(--accent-color)]">₹{bookingDetails.amount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
