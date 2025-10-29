import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';

const PaymentPage = () => {
  const { state } = useLocation();
  const doctorName = state?.doctorName || 'Dr. John Doe', consultationFee = state?.consultationFee || '500', isVirtual = state?.isVirtual || false, doctorId = state?.doctorId || '101', patientId = state?.patientId || '501';
  const user = useSelector((s) => s.auth.user);
  const [join_url, setJoinUrl] = useState("");
  const patientName = user ? `${user.firstName || "Guest"} ${user.lastName || ""}`.trim() : "Guest", patientEmail = user?.email || 'demo@example.com';
  const [bookingDetails, setBookingDetails] = useState({ email: "" });
  const [method, setMethod] = useState(''), [cardData, setCardData] = useState({ number: '', expiry: '', cvv: '', upi: '' }), [selectedBank, setSelectedBank] = useState('');
  const [errors, setErrors] = useState({}), [loading, setLoading] = useState(false), [showSuccessModal, setShowSuccessModal] = useState(false), [paymentStatus, setPaymentStatus] = useState(''), [zoomLink, setZoomLink] = useState('');

  const validateFields = () => {
    const e = {};
    if (method === 'card') {
      if (!cardData.number) e.number = "Card number is required";
      if (!cardData.expiry) e.expiry = "Expiry date is required";
      if (!cardData.cvv) e.cvv = "CVV is required";
    } else if (method === 'upi' && !cardData.upi) e.upi = "UPI ID is required";
    else if (method === 'net' && !selectedBank) e.bank = "Please select a bank";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handlePayment = async () => {
    if (!validateFields()) return;
    setLoading(true);
    const invoiceNo = 'INV-' + Math.floor(Math.random() * 1e6), appointmentDate = new Date().toISOString().split('T')[0];
    const paymentData = { date: appointmentDate, invoiceNo, doctorName, serviceType: 'Consultation', amount: consultationFee, patientName, method, cardDetails: cardData, paypalEmail: '', upiID: cardData.upi };

    try {
      const res = await axios.post('https://681b32bd17018fe5057a8bcb.mockapi.io/paybook', paymentData);
      if (res.status === 201) {
        let zLink = '';
        if (isVirtual) {
          const zoomData = { topic: `Consultation with ${doctorName}`, start_time: new Date().toISOString(), duration: 30 };
          const zoomRes = await axios.post('https://hooks.zapier.com/hooks/catch/22819366/2n9oq0b/', zoomData);
          zLink = zoomRes.data?.join_url || '';
          setZoomLink(zLink);
        }
        const msg = `You have a new appointment with ${patientName} on ${appointmentDate} at 11:00.`;
        await axios.post('https://67e631656530dbd3110f0322.mockapi.io/drnotifiy', { message: isVirtual ? `${msg} Zoom Link: ${zLink}` : msg, doctorName, doctorId, id: `${Date.now()}` });
        await axios.post('https://67e631656530dbd3110f0322.mockapi.io/notify', { message: isVirtual ? `Your virtual consultation with ${doctorName} is scheduled. Zoom Link: ${zLink}` : `Your consultation with ${doctorName} is confirmed.`, patientName, patientId, id: `${Date.now()}` });
        setPaymentStatus(`Payment of ₹${consultationFee} to ${doctorName} was successful!`);
        setShowSuccessModal(true);
      } else alert('Payment failed.');
    } catch (e) {
      console.error(e); alert('Payment failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-xl overflow-hidden">
        <div className="bg-slate-800 p-4 text-center">
          <h2 className="text-xl font-bold text-white mb-2">Payment Details</h2>
          <div className="inline-block bg-slate-700 rounded-full px-3 py-1"><span className="text-yellow-400 font-medium text-base">₹{consultationFee}</span></div>
        </div>

        <div className="p-5">
          <h2 className="text-xl font-semibold mb-4">Select Payment Method</h2>
          {['upi', 'card', 'net'].map((val) => (
            <label className="block mb-2" key={val}>
              <input type="radio" className="mr-2" name="payment" checked={method === val} onChange={() => setMethod(val)} />
              {val === 'upi' ? 'UPI / Google Pay / PhonePe' : val === 'card' ? 'Credit / Debit Card' : 'Net Banking'}
            </label>
          ))}

          {method === 'upi' && (
            <div className="mt-4">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=example@upi&pn=HealthLab&am=${consultationFee}`} alt="QR" className="mx-auto mb-3" />
              <input type="text" placeholder="Enter UPI ID" value={cardData.upi} onChange={(e) => setCardData({ ...cardData, upi: e.target.value })} className="w-full border rounded px-3 py-2" />
              {errors.upi && <p className="text-red-500 text-sm">{errors.upi}</p>}
            </div>
          )}

          {method === 'card' && (
            <div className="space-y-3 mt-4">
              <input type="text" placeholder="Card Number" value={cardData.number} onChange={(e) => setCardData({ ...cardData, number: e.target.value })} className="w-full border rounded px-3 py-2" />
              {errors.number && <p className="text-red-500 text-sm">{errors.number}</p>}
              <div className="flex gap-3">
                <input type="text" placeholder="MM/YY" value={cardData.expiry} onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })} className="w-1/2 border rounded px-3 py-2" />
                <input type="text" placeholder="CVV" value={cardData.cvv} onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })} className="w-1/2 border rounded px-3 py-2" />
              </div>
              {errors.expiry && <p className="text-red-500 text-sm">{errors.expiry}</p>}
              {errors.cvv && <p className="text-red-500 text-sm">{errors.cvv}</p>}
            </div>
          )}

          {method === 'net' && (
            <div className="mt-4 space-y-2">
              <p className="text-sm mb-2">Choose Bank:</p>
              {['Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank'].map((b) => (
                <label className="block text-sm" key={b}>
                  <input type="radio" name="bank" className="mr-2" checked={selectedBank === b} onChange={() => setSelectedBank(b)} />
                  {b}
                </label>
              ))}
              {errors.bank && <p className="text-red-500 text-sm">{errors.bank}</p>}
            </div>
          )}

          <button className="mt-6 w-full bg-[#0e1630] text-white hover:bg-[#F4C430] hover:text-[#0e1630] px-4 py-2 rounded transition" onClick={handlePayment} disabled={loading}>
            {loading ? "Processing..." : `Pay ₹${consultationFee}`}
          </button>
        </div>
      </div>

      {showSuccessModal && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
    <div className="bg-white p-6 rounded-lg text-center shadow-xl">
      <h3 className="text-lg font-bold text-green-600 mb-2">Payment Successful</h3>
      <p className="mb-2">{paymentStatus}</p>
      {zoomLink && (
        <div className="text-sm text-blue-600 break-words">
          <p>Zoom Link: <a href={zoomLink} target="_blank" rel="noreferrer">{zoomLink}</a></p>
          {join_url && <p>Join URL: <a href={join_url} target="_blank" rel="noreferrer">{join_url}</a></p>}
        </div>
      )}
      <p className="text-sm text-gray-500 mt-4">An email confirmation has been sent to {bookingDetails?.email || "your email"}</p>
      <button onClick={() => setShowSuccessModal(false)} className="mt-4 bg-slate-800 text-white px-4 py-2 rounded hover:bg-slate-600">Close</button>
    </div>
  </div>
)}

    </div>
  );
};

export default PaymentPage;
