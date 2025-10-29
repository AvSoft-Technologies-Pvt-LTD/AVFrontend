import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

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

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
        <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-lg text-center">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-green-100">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Appointment Confirmed!</h2>
          <p className="text-gray-600 mb-6">Your appointment has been successfully booked and payment received.</p>
          <hr className="my-4" />
          <div className="space-y-3 mb-6">
            <p className="text-lg font-semibold text-gray-800 mb-2">Appointment Details</p>
            <p className="text-gray-600">{new Date(bookingDetails.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}, {bookingDetails.time}</p>
            <p className="text-gray-600">{bookingDetails.location}</p>
            <p className="text-sm text-gray-500 mt-2">An email confirmation has been sent to {bookingDetails.email}</p>
            <p className="text-sm font-medium text-gray-700">Booking ID: <strong>{bookingId}</strong></p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="px-4 py-2 view-btn" onClick={() => navigate(`/patientdashboard/track-appointment/${bookingId}`)}>Track Appointment</button>
            <button className="px-4 py-2 border border-[var(--primary-color)] text-[var(--primary-color)] rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]" onClick={handleDownloadReceipt}>Download Receipt</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 mt-4 sm:mt-6 bg-white shadow-lg rounded-2xl max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--primary-color)] mb-4">Select Payment Method</h2>
          <div className="space-y-3">
            {[{ value: "upi", label: "UPI / Google Pay / PhonePe" }, { value: "card", label: "Credit / Debit Card" }, { value: "net", label: "Net Banking" }].map((opt) => (
              <div key={opt.value} className="p-3 sm:p-4 border border-gray-200 rounded-lg cursor-pointer hover:shadow-md transition-shadow" onClick={() => setMethod(opt.value)}>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="payment" checked={method === opt.value} onChange={() => setMethod(opt.value)} className="w-4 h-4 text-[var(--primary-color)]" />
                  <span className="font-medium text-gray-800">{opt.label}</span>
                </label>
              </div>
            ))}
          </div>
          <div className="mt-4 sm:mt-6">
            {method === "upi" && (
              <div className="space-y-4">
                <div className="text-center">
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=example@upi&pn=HealthLab&am=${bookingDetails.amount}`} alt="UPI QR Code" className="w-40 h-40 mx-auto" />
                  <p className="text-sm text-gray-600 mt-2">Scan & pay using any UPI app</p>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Or enter your UPI ID</label>
                  <input type="text" placeholder="e.g., user@upi" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]" value={cardData.upi} onChange={(e) => setCardData({ ...cardData, upi: e.target.value })} />
                </div>
              </div>
            )}
            {method === "card" && (
              <div className="space-y-3">
                <input type="text" placeholder="Card Number" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]" value={cardData.number} onChange={(e) => setCardData({ ...cardData, number: e.target.value.replace(/\D/g, "").slice(0, 16) })} />
                {errors.number && <p className="text-red-500 text-xs">{errors.number}</p>}
                <div className="flex gap-2">
                  <input type="text" placeholder="MM/YY" className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]" value={cardData.expiry} onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })} />
                  <input type="text" placeholder="CVV" className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]" value={cardData.cvv} onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, "").slice(0, 3) })} />
                </div>
                {errors.expiry && <p className="text-red-500 text-xs">{errors.expiry}</p>}
                {errors.cvv && <p className="text-red-500 text-xs">{errors.cvv}</p>}
              </div>
            )}
            {method === "net" && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700">Select your bank:</p>
                <div className="space-y-2">
                  {["Bank of India", "HDFC Bank", "ICICI Bank", "Axis Bank"].map((bank) => (
                    <label key={bank} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="netbank" checked={selectedBank === bank} onChange={() => setSelectedBank(bank)} className="w-4 h-4 text-[var(--primary-color)]" />
                      <span className="text-gray-700">{bank}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button className="w-full py-2.5 px-4 bg-[var(--primary-color)] text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] mt-4 sm:mt-6" onClick={handlePayment} disabled={loading}>{loading ? "Processing..." : `Pay ₹${bookingDetails.amount}`}</button>
        </div>
        <div className="p-4 sm:p-6 border border-gray-200 rounded-xl shadow-sm space-y-3">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3">Appointment Summary</h3>
          <p className="text-gray-600"><strong>Patient:</strong> {bookingDetails.name}</p>
          <p className="text-gray-600"><strong>Test:</strong> {bookingDetails.testTitle}</p>
          <p className="text-gray-600"><strong>Lab:</strong> {bookingDetails.labName}</p>
          <p className="text-gray-600"><strong>Visit Type:</strong> {bookingDetails.location === bookingDetails.labLocation ? "Visit Lab" : "Home Sample Collection"}</p>
          <p className="text-gray-600"><strong>Address:</strong> {bookingDetails.location}</p>
          <p className="text-gray-600"><strong>Date & Time:</strong> {bookingDetails.date} at {bookingDetails.time}</p>
          <hr className="my-3 border-gray-200" />
          <p className="text-gray-600"><strong>Test Amount:</strong> ₹{bookingDetails.amount}</p>
          <p className="text-gray-600"><strong>Collection Fee:</strong> ₹0</p>
          <p className="text-xl font-bold text-gray-800 mt-2">Total: <span>₹{bookingDetails.amount}</span></p>
          <div className="p-3 bg-blue-50 text-blue-800 text-sm rounded-md mt-3">You'll receive a confirmation email and your report within 24-48 hours after sample collection.</div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
