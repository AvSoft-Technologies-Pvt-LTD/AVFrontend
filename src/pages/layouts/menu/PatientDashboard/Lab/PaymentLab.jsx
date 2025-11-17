import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Clock, MapPin, DollarSign, CreditCard, CheckCircle, FileText } from "lucide-react";
import { createLabPayment } from "../../../../../utils/CrudService";
import PaymentGateway from "../../../../../components/microcomponents/PaymentGatway";

const PaymentPage = () => {
  const { state: bookingDetails } = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [bookingId, setBookingId] = useState("");

  const appointment = bookingDetails?.appointment || {};
  const appointmentId = appointment?.id ?? null;
  const patientIdFromAppointment = appointment?.patientid ?? null;
  const backendBookingId = appointment?.bookingId || "";

  const handleDownloadReceipt = () => {
    if (!bookingDetails) return;

    const receiptContent = `Appointment Receipt\n\nBooking ID: ${bookingId}\nPatient Name: ${bookingDetails.name}\nTest: ${bookingDetails.testTitle}\nLab: ${bookingDetails.labName}\nDate & Time: ${bookingDetails.date} at ${bookingDetails.time}\nLocation: ${bookingDetails.location}\nPayment Method: UPI/Card/NetBanking\nAmount Paid: ₹${bookingDetails.amount}\nStatus: Paid`;
    const blob = new Blob([receiptContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Appointment_Receipt_${bookingId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGatewayPay = async (selectedMethod, data) => {
    if (!appointmentId) {
      alert("Missing appointment id. Please try booking again.");
      return;
    }

    const normalizedMethod =
      selectedMethod === "netbanking" ? "net" : selectedMethod;

    const paymentPayload = {
      appointmentId: backendBookingId || String(appointmentId),
      method: normalizedMethod,
      upiId: selectedMethod === "upi" ? data?.upiId || "" : "",
      cardNumber: selectedMethod === "card" ? data?.number || "" : "",
      expiry: selectedMethod === "card" ? data?.expiry || "" : "",
      cvv: selectedMethod === "card" ? data?.cvv || "" : "",
      selectedBank: selectedMethod === "netbanking" ? data?.bank || "" : "",
      patientid: 1,
    };

    try {
      setLoading(true);
      await createLabPayment(paymentPayload);
      setSuccess(true);
      setBookingId(
        backendBookingId || bookingDetails?.appointment?.bookingId || ""
      );
    } catch (err) {
      console.error("Lab payment failed", err?.response?.data || err.message);
      alert("Payment failed!");
    } finally {
      setLoading(false);
    }
  };

  const handleGatewayClose = () => {
    const trackingBookingId =
      backendBookingId ||
      bookingDetails?.appointment?.bookingId ||
      bookingDetails?.bookingId ||
      bookingId;

    if (success && trackingBookingId) {
      navigate(`/patientdashboard/track-appointment/${trackingBookingId}`);
    } else if (!success) {
      navigate(-1);
    }
  };

  return (
    <PaymentGateway
      isOpen={true}
      onClose={handleGatewayClose}
      amount={bookingDetails?.amount || 0}
      bookingId={backendBookingId || bookingDetails?.appointment?.bookingId || ""}
      merchantName="DigiHealth Lab"
      methods={["upi", "card", "netbanking", "wallet"]}
      onPay={handleGatewayPay}
      currency="₹"
      bookingDetails={null}
      asPage={true}
    />
  );
};

export default PaymentPage;
