import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Clock, MapPin, DollarSign, CreditCard, CheckCircle, FileText } from "lucide-react";
import { createLabPayment, verifyLabPayment } from "../../../../../utils/CrudService";
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

    const action = data?.action || "verify"; // 'create' or 'verify'
    const normalizedMethod =
      selectedMethod === "netbanking" ? "Netbanking" : selectedMethod;

    try {
      setLoading(true);

      if (action === "create") {
        // Step 1: create payment when Pay button is clicked
        const paymentPayload = {
          appointmentId: backendBookingId || String(appointmentId),
          method: normalizedMethod,
          patientid: patientIdFromAppointment || data?.patientid || 1,
          upiId: selectedMethod === "upi" ? data?.upiId || "" : "",
          upiMode: selectedMethod === "upi" ? data?.upiMode || "" : "",
          cardNumber: selectedMethod === "card" ? data?.number || "" : "",
          expiry: selectedMethod === "card" ? data?.expiry || "" : "",
          cvv: selectedMethod === "card" ? data?.cvv || "" : "",
          cardHolderName:
            selectedMethod === "card" ? data?.cardHolderName || data?.name || "" : "",
          selectedBank:
            selectedMethod === "netbanking" ? data?.bank || "" : "",
          selectedWallet:
            selectedMethod === "wallet" ? data?.selectedWallet || data?.wallet || "" : "",
        };

        await createLabPayment(paymentPayload);
        return; // do not mark success here; wait for verify step
      }

      // Step 2: verify payment when Verify & Pay is clicked
      const verifyPayload = {
        appointmentId: backendBookingId || String(appointmentId),
        method: normalizedMethod,
        patientid: patientIdFromAppointment || data?.patientid || 1,
        otp: data?.otp || "",
        upiMode: selectedMethod === "upi" ? data?.upiMode || "" : "",
        cardHolderName: data?.cardHolderName || data?.name || "",
      };

      const verifyRes = await verifyLabPayment(verifyPayload);
      const verifyStatus = verifyRes?.data?.status;
      const verifyMessage = verifyRes?.data?.message;

      if (verifyStatus && String(verifyStatus).toUpperCase() === "FAILED") {
        throw new Error(verifyMessage || "Invalid OTP");
      }

      setSuccess(true);
      setBookingId(
        backendBookingId || bookingDetails?.appointment?.bookingId || ""
      );
    } catch (err) {
      console.error("Payment error:", err?.response?.data || err.message);
      throw err;
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

