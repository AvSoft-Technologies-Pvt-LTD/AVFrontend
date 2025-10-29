import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as Lucide from "lucide-react";

const PaymentGateway = ({
  isOpen,
  onClose,
  amount,
  bookingId,
  merchantName = "DigiHealth",
  methods = ["upi", "card", "netbanking", "wallet"],
  onPay,
  currency = "₹",
  bookingDetails = null,
}) => {
  // Navigation hook
  const navigate = useNavigate();

  // State
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [upiId, setUpiId] = useState("");
  const [cardData, setCardData] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
  });
  const [selectedBank, setSelectedBank] = useState("");
  const [selectedWallet, setSelectedWallet] = useState("");
  const [timeLeft, setTimeLeft] = useState(600);
  const [currentStep, setCurrentStep] = useState("method-selection");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [upiPaymentOption, setUpiPaymentOption] = useState("qr");
  const [qrCodeGenerated, setQrCodeGenerated] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  // Effects
  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(
      () => setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0)),
      1000
    );
    return () => clearInterval(timer);
  }, [isOpen]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handlers
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const progress = ((600 - timeLeft) / 600) * 100;
  const finalAmount = amount - discountAmount;

  const handleProceed = () => setCurrentStep("payment-form");
  const handleBack = () => {
    setCurrentStep("method-selection");
    setOtp("");
    setQrCodeGenerated(false);
  };

  const handleOtpVerify = () => {
    if (otp === "1234") {
      setLoading(true);
      setTimeout(() => {
        const data =
          selectedMethod === "upi"
            ? { upiId }
            : selectedMethod === "card"
            ? cardData
            : selectedMethod === "netbanking"
            ? { bank: selectedBank }
            : { wallet: selectedWallet };
        onPay(selectedMethod, data);
        setCurrentStep("success");
        setLoading(false);
      }, 2000);
    } else alert("Invalid OTP. Please try again.");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setCurrentStep("otp-step");
  };

  const handleGenerateQR = () => setQrCodeGenerated(true);

  // Fixed help handler using React Router navigation
  const handleHelp = () => {
    navigate("/patientdashboard/help");
  };

  const handleApplyCoupon = () => {
    if (couponCode.trim()) {
      const validCoupons = { SAVE10: 10, HEALTH20: 20, FIRST15: 15 };
      const discount = validCoupons[couponCode.toUpperCase()];
      if (discount) {
        const discountAmt = (amount * discount) / 100;
        setDiscountAmount(discountAmt);
        setAppliedCoupon({
          code: couponCode.toUpperCase(),
          discount,
          amount: discountAmt,
        });
        alert(
          `Coupon "${couponCode}" applied! You saved ${currency}${discountAmt}`
        );
      } else alert("Invalid coupon code");
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponCode("");
  };

  // Data
  const paymentMethods = [
    {
      id: "upi",
      name: "UPI",
      icon: Lucide.Smartphone,
      providers: ["GPay", "PhonePe", "Paytm", "BHIM"],
      color: "text-green-600",
    },
    {
      id: "card",
      name: "Cards",
      icon: Lucide.CreditCard,
      providers: ["Visa", "Mastercard", "RuPay"],
      color: "text-[color:var(--primary-color)]",
    },
    {
      id: "netbanking",
      name: "Netbanking",
      icon: Lucide.Building2,
      providers: ["SBI", "HDFC", "ICICI", "Axis"],
      color: "text-orange-600",
    },
    {
      id: "wallet",
      name: "Wallet",
      icon: Lucide.Wallet,
      providers: ["Paytm", "Amazon Pay", "MobiKwik"],
      color: "text-purple-600",
    },
  ].filter((method) => methods.includes(method.id));

  const banks = [
    "State Bank of India",
    "HDFC Bank",
    "ICICI Bank",
    "Axis Bank",
    "Kotak Mahindra Bank",
    "Punjab National Bank",
  ];
  const wallets = ["Paytm", "Amazon Pay", "MobiKwik", "Freecharge", "JioMoney"];

  const defaultBookingDetails = {
    serviceType: "Healthcare Service",
    doctorName: "Dr. John Doe",
    hospitalName: "City Hospital",
    appointmentDate: new Date().toLocaleDateString(),
    appointmentTime: "10:30 AM",
    patient: [
      { name: "Kavya Patil", age: 28, gender: "Female", patientId: "PT12345" },
    ],
    contactEmail: "kavya.patil@email.com",
    contactPhone: "9876543210",
    fareBreakup: {
      consultationFee: amount * 0.8,
      taxes: amount * 0.15,
      serviceFee: amount * 0.05,
    },
  };
  const displayBookingDetails = bookingDetails || defaultBookingDetails;

  // Render
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[95vh] max-h-[95vh] overflow-hidden flex flex-col">
        {/* Mobile Layout: Single Column with Combined Scroll */}
        {isMobile ? (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Mobile Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-[color:var(--primary-color,#20B2AA)] to-[color:var(--accent-color,#2E8B57)] text-white">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <Lucide.Stethoscope size={16} />
                </div>
                <span className="font-semibold text-lg">{merchantName}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end">
                  <div className="bg-orange-100 rounded-lg px-2 py-1 flex items-center gap-1">
                    <Lucide.Clock className="text-orange-500" size={12} />
                    <span className="font-mono text-xs font-bold text-orange-600">
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-white/80 hover:text-white transition-colors p-1 bg-white/10 rounded-lg"
                >
                  <Lucide.X size={18} />
                </button>
              </div>
            </div>

            {/* Mobile Content: Scrollable */}
            <div className="flex-1 overflow-y-auto">
              {/* Minimized Left Panel Content */}
              <div className="bg-gradient-to-r from-[color:var(--primary-color,#20B2AA)] to-[color:var(--accent-color,#2E8B57)] text-white p-4">
                {/* Amount Section - Compact */}
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 mb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white/80 text-xs mb-1">
                        Amount to Pay
                      </div>
                      <div className="text-xl font-bold">
                        {currency} {finalAmount}
                      </div>
                      {discountAmount > 0 && (
                        <div className="text-xs text-green-200 mt-1">
                          Saved {currency}
                          {discountAmount}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setShowDetails(!showDetails)}
                      className="text-white/80 text-xs underline hover:text-white transition-colors"
                    >
                      Details
                    </button>
                  </div>
                  {bookingId && (
                    <div className="text-white/60 text-xs mt-2">
                      ID: #{bookingId}
                    </div>
                  )}
                </div>

                {/* Coupon Section - Compact */}
                <div className="mb-3">
                  {!appliedCoupon ? (
                    <>
                      <button
                        onClick={() => setShowCouponInput(!showCouponInput)}
                        className="flex items-center gap-1 text-white/80 text-xs underline hover:text-white transition-colors mb-2"
                      >
                        <Lucide.Tag size={10} /> Coupon
                      </button>
                      {showCouponInput && (
                        <div className="bg-white/10 rounded-lg p-2 space-y-2">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Coupon code"
                              value={couponCode}
                              onChange={(e) => setCouponCode(e.target.value)}
                              className="flex-1 p-2 text-xs rounded border border-white/30 bg-white/10 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                            />
                            <button
                              onClick={handleApplyCoupon}
                              className="px-2 py-1 bg-white/20 rounded hover:bg-white/30 transition-colors text-white text-xs"
                            >
                              Apply
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="bg-green-500/20 rounded-lg p-2 border border-green-400/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Lucide.CheckCircle
                            size={12}
                            className="text-green-300"
                          />
                          <div>
                            <div className="text-xs font-medium text-green-100">
                              {appliedCoupon.code}
                            </div>
                            <div className="text-xs text-green-200">
                              Saved {currency}
                              {appliedCoupon.amount}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={handleRemoveCoupon}
                          className="text-green-300 hover:text-white transition-colors"
                        >
                          <Lucide.X size={12} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Trust Badges - Horizontal Row, Compact */}
                <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                  {[
                    {
                      icon: (
                        <Lucide.Shield size={14} className="text-emerald-400" />
                      ),
                      title: "Secure",
                      subtitle: "256-bit",
                    },
                    {
                      icon: (
                        <Lucide.Zap size={14} className="text-yellow-400" />
                      ),
                      title: "Fast",
                      subtitle: "24 Hours",
                    },
                    {
                      icon: (
                        <Lucide.Users size={14} className="text-purple-400" />
                      ),
                      title: "Trusted",
                      subtitle: "3.6+ Cr",
                    },
                  ].map((badge, i) => (
                    <div
                      key={i}
                      className="bg-white/10 backdrop-blur-md rounded-lg p-2 border border-white/20 flex flex-col items-center gap-1 text-center"
                    >
                      <div className="w-6 h-6 rounded-full bg-white/40 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                        {badge.icon}
                      </div>
                      <div>
                        <div className="font-medium text-white text-xs leading-tight">
                          {badge.title}
                        </div>
                        <div className="text-gray-300 text-xs leading-tight">
                          {badge.subtitle}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Security Badge */}
                <div className="flex items-center gap-1 text-white/60 text-xs">
                  <Lucide.Shield size={12} />
                  <span>SSL Encrypted</span>
                </div>
              </div>

              {/* Payment Form Section */}
              <div className="p-4">
                {/* Back Button */}
                {currentStep !== "method-selection" && (
                  <div className="mb-4">
                    <button
                      onClick={handleBack}
                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-[color:var(--primary-color,#20B2AA)] transition-colors"
                    >
                      <Lucide.ArrowLeft size={16} />
                      Back
                    </button>
                  </div>
                )}

                {/* Payment Content */}
                {currentStep === "method-selection" && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-[color:var(--primary-color,#20B2AA)] mb-4">
                      Payment Options
                    </h2>
                    <div className="space-y-3">
                      {paymentMethods.map((method) => {
                        const IconComponent = method.icon;
                        return (
                          <div
                            key={method.id}
                            onClick={() => {
                              setSelectedMethod(method.id);
                              handleProceed();
                            }}
                            className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all shadow hover:shadow-lg border border-gray-100 hover:border-[color:var(--primary-color,#20B2AA)]/20 bg-white"
                          >
                            <div
                              className={`w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center ${method.color}`}
                            >
                              <IconComponent size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-[color:var(--primary-color,#20B2AA)] text-sm">
                                {method.name}
                              </div>
                              <div className="text-gray-500 text-xs truncate">
                                {method.providers.join(", ")}
                              </div>
                            </div>
                            <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0" />
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-center pt-4">
                      <button
                        onClick={handleHelp}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-gray-700 text-sm"
                      >
                        <Lucide.HelpCircle size={16} />
                        Help
                      </button>
                    </div>
                  </div>
                )}

                {/* Payment Forms */}
                {currentStep === "payment-form" && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-[color:var(--primary-color,#20B2AA)]">
                      {selectedMethod === "upi"
                        ? "UPI Payment"
                        : selectedMethod === "card"
                        ? "Card Payment"
                        : selectedMethod === "netbanking"
                        ? "Net Banking"
                        : "Wallet Payment"}
                    </h2>

                    {selectedMethod === "upi" && (
                      <div className="space-y-4">
                        <div className="space-y-3">
                          {["qr", "id"].map((option) => (
                            <div
                              key={option}
                              onClick={() => setUpiPaymentOption(option)}
                              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-colors ${
                                upiPaymentOption === option
                                  ? "border-[color:var(--primary-color,#20B2AA)] bg-blue-50"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <div className="w-4 h-4 rounded-full border-2 border-[color:var(--primary-color,#20B2AA)] flex items-center justify-center">
                                {upiPaymentOption === option && (
                                  <div className="w-2 h-2 rounded-full bg-[color:var(--primary-color,#20B2AA)]"></div>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {option === "qr" ? (
                                  <Lucide.QrCode
                                    size={18}
                                    className="text-gray-600"
                                  />
                                ) : (
                                  <Lucide.Smartphone
                                    size={18}
                                    className="text-gray-600"
                                  />
                                )}
                                <span className="font-medium text-gray-800 text-sm">
                                  {option === "qr" ? "QR Code" : "UPI ID"}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                          {upiPaymentOption === "qr" ? (
                            <div className="space-y-4">
                              <div className="text-center">
                                <div className="mx-auto bg-gray-50 rounded-lg flex items-center justify-center mb-4 relative overflow-hidden border-2 border-dashed border-gray-200 w-32 h-32">
                                  {!qrCodeGenerated ? (
                                    <>
                                      <Lucide.QrCode
                                        size={60}
                                        className="text-gray-400 blur-sm"
                                      />
                                      <button
                                        type="button"
                                        onClick={handleGenerateQR}
                                        className="absolute z-10 bg-red-600 text-white py-1 px-3 rounded-full hover:bg-red-700 transition-colors font-medium text-xs"
                                      >
                                        Generate QR
                                      </button>
                                    </>
                                  ) : (
                                    <img
                                      src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=upi://pay?pa=merchant@upi&pn=${merchantName}&am=${finalAmount}&cu=INR&tr=TXN123456`}
                                      alt="QR Code for Payment"
                                      className="w-28 h-28"
                                    />
                                  )}
                                </div>
                                {qrCodeGenerated ? (
                                  <div className="space-y-3">
                                    <p className="text-sm text-gray-600">
                                      Scan with any UPI App
                                    </p>
                                    <button
                                      type="submit"
                                      className="w-full py-3 bg-[color:var(--primary-color,#20B2AA)] text-white rounded-lg hover:bg-[color:var(--primary-color,#20B2AA)]/90 transition-colors font-medium"
                                    >
                                      Proceed
                                    </button>
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-600">
                                    Generate QR to proceed
                                  </p>
                                )}
                              </div>
                            </div>
                          ) : (
                            <>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  UPI ID
                                </label>
                                <input
                                  type="text"
                                  placeholder="example@okhdfc"
                                  value={upiId}
                                  onChange={(e) => setUpiId(e.target.value)}
                                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--primary-color,#20B2AA)] focus:border-[color:var(--primary-color,#20B2AA)]"
                                  required
                                />
                              </div>
                              <button
                                type="submit"
                                className="w-full py-3 bg-[color:var(--primary-color,#20B2AA)] text-white rounded-lg hover:bg-[color:var(--primary-color,#20B2AA)]/90 transition-colors font-medium"
                              >
                                Pay {currency} {finalAmount}
                              </button>
                            </>
                          )}
                        </form>
                      </div>
                    )}

                    {selectedMethod === "card" && (
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-4">
                          {["number", "name"].map((field) => (
                            <div key={field}>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                {field === "number"
                                  ? "Card Number"
                                  : "Cardholder Name"}
                              </label>
                              <input
                                type="text"
                                placeholder={
                                  field === "number"
                                    ? "1234 5678 9012 3456"
                                    : "John Doe"
                                }
                                value={cardData[field]}
                                onChange={(e) =>
                                  setCardData({
                                    ...cardData,
                                    [field]: e.target.value,
                                  })
                                }
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--primary-color,#20B2AA)] focus:border-[color:var(--primary-color,#20B2AA)]"
                                required
                              />
                            </div>
                          ))}
                          <div className="grid grid-cols-2 gap-4">
                            {["expiry", "cvv"].map((field) => (
                              <div key={field}>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  {field === "expiry" ? "Expiry Date" : "CVV"}
                                </label>
                                <input
                                  type={field === "cvv" ? "password" : "text"}
                                  placeholder={
                                    field === "expiry" ? "MM/YY" : "123"
                                  }
                                  value={cardData[field]}
                                  onChange={(e) =>
                                    setCardData({
                                      ...cardData,
                                      [field]: e.target.value,
                                    })
                                  }
                                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--primary-color,#20B2AA)] focus:border-[color:var(--primary-color,#20B2AA)]"
                                  required
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                        <button
                          type="submit"
                          className="w-full py-3 bg-[color:var(--primary-color,#20B2AA)] text-white rounded-lg hover:bg-[color:var(--primary-color,#20B2AA)]/90 transition-colors font-medium"
                        >
                          Pay {currency} {finalAmount}
                        </button>
                      </form>
                    )}

                    {selectedMethod === "netbanking" && (
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Bank
                          </label>
                          <select
                            value={selectedBank}
                            onChange={(e) => setSelectedBank(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--primary-color,#20B2AA)] focus:border-[color:var(--primary-color,#20B2AA)] bg-white"
                            required
                          >
                            <option value="">Select Bank</option>
                            {banks.map((bank) => (
                              <option key={bank} value={bank}>
                                {bank}
                              </option>
                            ))}
                          </select>
                        </div>
                        <button
                          type="submit"
                          disabled={!selectedBank}
                          className={`w-full py-3 rounded-lg font-medium transition-colors ${
                            selectedBank
                              ? "bg-[color:var(--primary-color,#20B2AA)] text-white hover:bg-[color:var(--primary-color,#20B2AA)]/90"
                              : "bg-gray-300 text-gray-500 cursor-not-allowed"
                          }`}
                        >
                          Pay {currency} {finalAmount}
                        </button>
                      </form>
                    )}

                    {selectedMethod === "wallet" && (
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Wallet
                          </label>
                          <select
                            value={selectedWallet}
                            onChange={(e) => setSelectedWallet(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--primary-color,#20B2AA)] focus:border-[color:var(--primary-color,#20B2AA)] bg-white"
                            required
                          >
                            <option value="">Select Wallet</option>
                            {wallets.map((wallet) => (
                              <option key={wallet} value={wallet}>
                                {wallet}
                              </option>
                            ))}
                          </select>
                        </div>
                        <button
                          type="submit"
                          disabled={!selectedWallet}
                          className={`w-full py-3 rounded-lg font-medium transition-colors ${
                            selectedWallet
                              ? "bg-[color:var(--primary-color,#20B2AA)] text-white hover:bg-[color:var(--primary-color,#20B2AA)]/90"
                              : "bg-gray-300 text-gray-500 cursor-not-allowed"
                          }`}
                        >
                          Pay {currency} {finalAmount}
                        </button>
                      </form>
                    )}
                  </div>
                )}

                {/* OTP Step */}
                {currentStep === "otp-step" && (
                  <div className="text-center space-y-4 max-w-sm mx-auto">
                    <div className="w-16 h-16 bg-[color:var(--primary-color,#20B2AA)]/10 rounded-full flex items-center justify-center mx-auto">
                      <Lucide.Shield
                        size={24}
                        className="text-[color:var(--primary-color,#20B2AA)]"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[color:var(--primary-color,#20B2AA)] text-lg mb-2">
                        Enter OTP
                      </h3>
                      <p className="text-sm text-gray-600">
                        4-digit code sent to registered mobile
                      </p>
                    </div>
                    <div className="flex gap-2 justify-center">
                      {[0, 1, 2, 3].map((index) => (
                        <input
                          key={index}
                          type="text"
                          maxLength={1}
                          value={otp[index] || ""}
                          onChange={(e) => {
                            const newOtp = otp.split("");
                            newOtp[index] = e.target.value;
                            setOtp(newOtp.join(""));
                            if (e.target.value && index < 3) {
                              const nextInput =
                                document.querySelectorAll("input")[index + 1];
                              if (nextInput) nextInput.focus();
                            }
                          }}
                          className="w-10 h-10 text-center font-bold border-2 border-[color:var(--primary-color,#20B2AA)]/30 rounded-lg outline-none focus:border-[color:var(--primary-color,#20B2AA)]"
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">Demo OTP: 1234</p>
                    <button
                      onClick={handleOtpVerify}
                      disabled={otp.length !== 4}
                      className={`w-full py-3 rounded-lg font-medium transition-colors ${
                        otp.length === 4
                          ? "bg-[color:var(--primary-color,#20B2AA)] text-white hover:bg-[color:var(--primary-color,#20B2AA)]/90"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {loading ? "Verifying..." : "Verify & Pay"}
                    </button>
                  </div>
                )}

                {/* Success Step */}
                {currentStep === "success" && (
                  <div className="text-center space-y-4 max-w-sm mx-auto">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <Lucide.CheckCircle
                        className="text-green-600"
                        size={24}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-600 text-lg mb-2">
                        Payment Successful!
                      </h3>
                      <p className="text-sm text-gray-600">
                        Payment of {currency} {finalAmount} processed
                        successfully.
                      </p>
                    </div>
                    <button
                      onClick={onClose}
                      className="w-full py-3 bg-[color:var(--primary-color,#20B2AA)] text-white rounded-lg hover:bg-[color:var(--primary-color,#20B2AA)]/90 transition-colors font-medium"
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Desktop Layout: Two Column */
          <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden">
            {/* Left Panel - Desktop */}
            <div className="w-full lg:w-2/5 bg-gradient-to-br from-[color:var(--primary-color,#20B2AA)] to-[color:var(--accent-color,#2E8B57)] text-white p-4 sm:p-6 lg:p-8 relative overflow-hidden flex-shrink-0">
              <div className="relative z-10 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-white/20 rounded-lg flex items-center justify-center">
                      <Lucide.Stethoscope size={20} />
                    </div>
                    <span className="font-semibold text-lg sm:text-xl">
                      {merchantName}
                    </span>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white/80 text-xs sm:text-sm mb-1">
                        Amount to Pay
                      </div>
                      <div className="text-2xl sm:text-3xl font-bold">
                        {currency} {finalAmount}
                      </div>
                      {discountAmount > 0 && (
                        <div className="text-xs text-green-200 mt-1">
                          You saved {currency}
                          {discountAmount}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setShowDetails(!showDetails)}
                      className="text-white/80 text-xs underline hover:text-white transition-colors"
                    >
                      {showDetails ? "Hide Details" : "View Details"}
                    </button>
                  </div>
                  {bookingId && (
                    <div className="text-white/60 text-xs mt-2">
                      Invoice ID: #{bookingId}
                    </div>
                  )}
                </div>

                {/* Coupon Section */}
                <div className="mb-4">
                  {!appliedCoupon ? (
                    <>
                      <button
                        onClick={() => setShowCouponInput(!showCouponInput)}
                        className="flex items-center gap-2 text-white/80 text-xs underline hover:text-white transition-colors mb-2"
                      >
                        <Lucide.Tag size={12} />{" "}
                        {showCouponInput
                          ? "Hide Coupon"
                          : "Have a coupon code?"}
                      </button>
                      {showCouponInput && (
                        <div className="bg-white/10 rounded-lg p-3 space-y-3">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Enter coupon code"
                              value={couponCode}
                              onChange={(e) => setCouponCode(e.target.value)}
                              className="flex-1 p-2 text-xs rounded border border-white/30 bg-white/10 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                            />
                            <button
                              onClick={handleApplyCoupon}
                              className="px-3 py-2 bg-white/20 rounded hover:bg-white/30 transition-colors text-white text-xs"
                            >
                              Apply
                            </button>
                          </div>
                          <div className="text-xs text-white/70">
                            Try: SAVE10, HEALTH20, FIRST15
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="bg-green-500/20 rounded-lg p-3 border border-green-400/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Lucide.CheckCircle
                            size={14}
                            className="text-green-300"
                          />
                          <div>
                            <div className="text-xs font-medium text-green-100">
                              {appliedCoupon.code} Applied
                            </div>
                            <div className="text-xs text-green-200">
                              {appliedCoupon.discount}% off • Saved {currency}
                              {appliedCoupon.amount}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={handleRemoveCoupon}
                          className="text-green-300 hover:text-white transition-colors"
                        >
                          <Lucide.X size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Trust Badges - Desktop */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  {[
                    {
                      icon: (
                        <Lucide.Shield size={20} className="text-emerald-600" />
                      ),
                      title: "Secure Payment",
                      subtitle: "256-bit Encryption",
                    },
                    {
                      icon: (
                        <Lucide.Zap size={20} className="text-yellow-500" />
                      ),
                      title: "Superfast Refunds",
                      subtitle: "In 24 Hours",
                    },
                    {
                      icon: (
                        <Lucide.Users size={20} className="text-purple-600" />
                      ),
                      title: "Trusted",
                      subtitle: "3.6+ Crore Users",
                    },
                  ].map((badge, i) => (
                    <div
                      key={i}
                      className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-sm flex flex-col items-center gap-2 text-center hover:shadow-md transition-all duration-300"
                    >
                      <div className="w-10 h-10 rounded-full bg-white/40 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                        {badge.icon}
                      </div>
                      <div>
                        <div className="font-medium text-white text-sm">
                          {badge.title}
                        </div>
                        <div className="text-gray-300 text-xs">
                          {badge.subtitle}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-auto">
                  <div className="flex items-center gap-2 text-white/60 text-xs">
                    <Lucide.Shield size={16} />
                    <span>Secured by SSL Encryption</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel - Desktop */}
            <div className="w-full lg:w-3/5 flex flex-col min-h-0 border-l border-gray-100">
              {/* Header */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 flex-shrink-0">
                <div>
                  {currentStep !== "method-selection" && (
                    <button
                      onClick={handleBack}
                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-[color:var(--primary-color,#20B2AA)] transition-colors"
                    >
                      <Lucide.ArrowLeft size={16} />
                      <span className="hidden sm:inline">Back</span>
                    </button>
                  )}
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold text-[color:var(--primary-color,#20B2AA)]">
                  {currentStep === "payment-form" && selectedMethod === "upi"
                    ? "UPI"
                    : "Payment Options"}
                </h2>
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end gap-1">
                    <div className="bg-orange-50 rounded-lg px-3 py-1 flex items-center gap-2">
                      <Lucide.Clock className="text-orange-500" size={16} />
                      <span className="font-mono text-sm font-bold text-orange-600">
                        {formatTime(timeLeft)}
                      </span>
                    </div>
                    <div className="w-24 h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500 transition-all duration-1000 ease-linear"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-[color:var(--primary-color,#20B2AA)] transition-colors p-1"
                  >
                    <Lucide.X size={24} />
                  </button>
                </div>
              </div>

              {/* Main Content: Scrollable Area */}
              <div className="flex-1 overflow-y-auto min-h-0">
                <div className="p-4 sm:p-6 h-full">
                  {/* Method Selection */}
                  {currentStep === "method-selection" && (
                    <div className="space-y-4 sm:space-y-6 h-full flex flex-col">
                      <div className="space-y-3 flex-1 overflow-y-auto min-h-0">
                        {paymentMethods.map((method) => {
                          const IconComponent = method.icon;
                          return (
                            <div
                              key={method.id}
                              onClick={() => {
                                setSelectedMethod(method.id);
                                handleProceed();
                              }}
                              className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg cursor-pointer transition-all shadow hover:shadow-lg border border-gray-100 hover:border-[color:var(--primary-color,#20B2AA)]/20 bg-white"
                            >
                              <div
                                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gray-50 flex items-center justify-center ${method.color}`}
                              >
                                <IconComponent size={20} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-[color:var(--primary-color,#20B2AA)] text-sm sm:text-base">
                                  {method.name}
                                </div>
                                <div className="text-gray-500 text-xs sm:text-sm truncate">
                                  {method.providers.join(", ")}
                                </div>
                              </div>
                              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex justify-end pt-4 border-t border-gray-100 flex-shrink-0">
                        <button
                          onClick={handleHelp}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-gray-700 text-sm"
                        >
                          <Lucide.HelpCircle size={16} />
                          <span>Help</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Payment Forms */}
                  {currentStep === "payment-form" && (
                    <div className="space-y-4 sm:space-y-6 h-full overflow-y-auto">
                      {selectedMethod === "upi" && (
                        <div className="space-y-6">
                          <div className="space-y-3">
                            {["qr", "id"].map((option) => (
                              <div
                                key={option}
                                onClick={() => setUpiPaymentOption(option)}
                                className={`flex items-center gap-3 p-4 rounded-lg cursor-pointer border transition-colors ${
                                  upiPaymentOption === option
                                    ? "border-[color:var(--primary-color,#20B2AA)] bg-blue-50"
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                              >
                                <div className="w-5 h-5 rounded-full border-2 border-[color:var(--primary-color,#20B2AA)] flex items-center justify-center">
                                  {upiPaymentOption === option && (
                                    <div className="w-2.5 h-2.5 rounded-full bg-[color:var(--primary-color,#20B2AA)]"></div>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  {option === "qr" ? (
                                    <Lucide.QrCode
                                      size={20}
                                      className="text-gray-600"
                                    />
                                  ) : (
                                    <Lucide.Smartphone
                                      size={20}
                                      className="text-gray-600"
                                    />
                                  )}
                                  <span className="font-medium text-gray-800">
                                    {option === "qr"
                                      ? "Pay through QR code"
                                      : "Pay through UPI ID"}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                          <form onSubmit={handleSubmit} className="space-y-6">
                            {upiPaymentOption === "qr" ? (
                              <div className="space-y-6">
                                <div className="text-center">
                                  <div className="mx-auto bg-gray-50 rounded-lg flex items-center justify-center mb-4 relative overflow-hidden border-2 border-dashed border-gray-200 w-56 h-56">
                                    {!qrCodeGenerated ? (
                                      <>
                                        <Lucide.QrCode
                                          size={120}
                                          className="text-gray-400 blur-sm"
                                        />
                                        <button
                                          type="button"
                                          onClick={handleGenerateQR}
                                          className="absolute z-10 bg-red-600 text-white text-sm py-2 px-6 rounded-full hover:bg-red-700 transition-colors font-medium"
                                        >
                                          Generate QR code & pay
                                        </button>
                                      </>
                                    ) : (
                                      <img
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=merchant@upi&pn=${merchantName}&am=${finalAmount}&cu=INR&tr=TXN123456`}
                                        alt="QR Code for Payment"
                                        className="w-48 h-48"
                                      />
                                    )}
                                  </div>
                                  {qrCodeGenerated ? (
                                    <div className="space-y-4">
                                      <p className="text-sm text-gray-600">
                                        Generate QR code, scan it with any UPI
                                        App
                                      </p>
                                      <button
                                        type="submit"
                                        className="w-full py-3 bg-[color:var(--primary-color,#20B2AA)] text-white rounded-lg hover:bg-[color:var(--primary-color,#20B2AA)]/90 transition-colors font-medium"
                                      >
                                        Proceed to Payment
                                      </button>
                                    </div>
                                  ) : (
                                    <p className="text-sm text-gray-600">
                                      Generate QR code, scan it with any UPI
                                      App.
                                    </p>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    UPI ID
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="example@okhdfc"
                                    value={upiId}
                                    onChange={(e) => setUpiId(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--primary-color,#20B2AA)] focus:border-[color:var(--primary-color,#20B2AA)]"
                                    required
                                  />
                                </div>
                                <button
                                  type="submit"
                                  className="w-full py-3 bg-[color:var(--primary-color,#20B2AA)] text-white rounded-lg hover:bg-[color:var(--primary-color,#20B2AA)]/90 transition-colors font-medium"
                                >
                                  Pay {currency} {finalAmount}
                                </button>
                              </>
                            )}
                          </form>
                        </div>
                      )}

                      {/* Card, Netbanking, Wallet forms */}
                      {selectedMethod === "card" && (
                        <form
                          onSubmit={handleSubmit}
                          className="space-y-4 sm:space-y-6"
                        >
                          <h3 className="font-semibold flex items-center gap-2 text-[color:var(--primary-color,#20B2AA)] text-lg sm:text-xl">
                            <Lucide.CreditCard size={20} /> Card Details
                          </h3>
                          <div className="space-y-4">
                            {["number", "name"].map((field) => (
                              <div key={field}>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  {field === "number"
                                    ? "Card Number"
                                    : "Cardholder Name"}
                                </label>
                                <input
                                  type="text"
                                  placeholder={
                                    field === "number"
                                      ? "1234 5678 9012 3456"
                                      : "John Doe"
                                  }
                                  value={cardData[field]}
                                  onChange={(e) =>
                                    setCardData({
                                      ...cardData,
                                      [field]: e.target.value,
                                    })
                                  }
                                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--primary-color,#20B2AA)] focus:border-[color:var(--primary-color,#20B2AA)]"
                                  required
                                />
                              </div>
                            ))}
                            <div className="grid grid-cols-2 gap-4">
                              {["expiry", "cvv"].map((field) => (
                                <div key={field}>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {field === "expiry" ? "Expiry Date" : "CVV"}
                                  </label>
                                  <input
                                    type={field === "cvv" ? "password" : "text"}
                                    placeholder={
                                      field === "expiry" ? "MM/YY" : "123"
                                    }
                                    value={cardData[field]}
                                    onChange={(e) =>
                                      setCardData({
                                        ...cardData,
                                        [field]: e.target.value,
                                      })
                                    }
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--primary-color,#20B2AA)] focus:border-[color:var(--primary-color,#20B2AA)]"
                                    required
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                          <button
                            type="submit"
                            className="w-full py-3 bg-[color:var(--primary-color,#20B2AA)] text-white rounded-lg hover:bg-[color:var(--primary-color,#20B2AA)]/90 transition-colors font-medium"
                          >
                            Pay {currency} {finalAmount}
                          </button>
                        </form>
                      )}

                      {selectedMethod === "netbanking" && (
                        <form
                          onSubmit={handleSubmit}
                          className="space-y-4 sm:space-y-6"
                        >
                          <h3 className="font-semibold flex items-center gap-2 text-[color:var(--primary-color,#20B2AA)] text-lg sm:text-xl">
                            <Lucide.Building2 size={20} /> Net Banking
                          </h3>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Select Bank
                            </label>
                            <select
                              value={selectedBank}
                              onChange={(e) => setSelectedBank(e.target.value)}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--primary-color,#20B2AA)] focus:border-[color:var(--primary-color,#20B2AA)] bg-white"
                              required
                            >
                              <option value="">Select Bank</option>
                              {banks.map((bank) => (
                                <option key={bank} value={bank}>
                                  {bank}
                                </option>
                              ))}
                            </select>
                          </div>
                          <button
                            type="submit"
                            disabled={!selectedBank}
                            className={`w-full py-3 rounded-lg font-medium transition-colors ${
                              selectedBank
                                ? "bg-[color:var(--primary-color,#20B2AA)] text-white hover:bg-[color:var(--primary-color,#20B2AA)]/90"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }`}
                          >
                            Pay {currency} {finalAmount}
                          </button>
                        </form>
                      )}

                      {selectedMethod === "wallet" && (
                        <form
                          onSubmit={handleSubmit}
                          className="space-y-4 sm:space-y-6"
                        >
                          <h3 className="font-semibold flex items-center gap-2 text-[color:var(--primary-color,#20B2AA)] text-lg sm:text-xl">
                            <Lucide.Wallet size={20} /> Digital Wallet
                          </h3>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Select Wallet
                            </label>
                            <select
                              value={selectedWallet}
                              onChange={(e) =>
                                setSelectedWallet(e.target.value)
                              }
                              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--primary-color,#20B2AA)] focus:border-[color:var(--primary-color,#20B2AA)] bg-white"
                              required
                            >
                              <option value="">Select Wallet</option>
                              {wallets.map((wallet) => (
                                <option key={wallet} value={wallet}>
                                  {wallet}
                                </option>
                              ))}
                            </select>
                          </div>
                          <button
                            type="submit"
                            disabled={!selectedWallet}
                            className={`w-full py-3 rounded-lg font-medium transition-colors ${
                              selectedWallet
                                ? "bg-[color:var(--primary-color,#20B2AA)] text-white hover:bg-[color:var(--primary-color,#20B2AA)]/90"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }`}
                          >
                            Pay {currency} {finalAmount}
                          </button>
                        </form>
                      )}
                    </div>
                  )}

                  {/* OTP and Success steps */}
                  {currentStep === "otp-step" && (
                    <div className="text-center space-y-4 sm:space-y-6 max-w-md mx-auto">
                      <div className="w-16 h-16 bg-[color:var(--primary-color,#20B2AA)]/10 rounded-full flex items-center justify-center mx-auto">
                        <Lucide.Shield
                          size={24}
                          className="text-[color:var(--primary-color,#20B2AA)]"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[color:var(--primary-color,#20B2AA)] text-lg sm:text-xl mb-2">
                          Enter OTP
                        </h3>
                        <p className="text-sm text-gray-600">
                          We've sent a 4-digit code to your registered mobile
                          number
                        </p>
                      </div>
                      <div className="flex gap-2 justify-center">
                        {[0, 1, 2, 3].map((index) => (
                          <input
                            key={index}
                            type="text"
                            maxLength={1}
                            value={otp[index] || ""}
                            onChange={(e) => {
                              const newOtp = otp.split("");
                              newOtp[index] = e.target.value;
                              setOtp(newOtp.join(""));
                              if (e.target.value && index < 3) {
                                const nextInput =
                                  document.querySelectorAll("input")[index + 1];
                                if (nextInput) nextInput.focus();
                              }
                            }}
                            className="w-10 h-10 sm:w-12 sm:h-12 text-center font-bold border-2 border-[color:var(--primary-color,#20B2AA)]/30 rounded-lg outline-none focus:border-[color:var(--primary-color,#20B2AA)]"
                          />
                        ))}
                      </div>
                      <p className="text-xs text-gray-500">
                        Hint: Use OTP "1234" for demo
                      </p>
                      <button
                        onClick={handleOtpVerify}
                        disabled={otp.length !== 4}
                        className={`w-full py-3 rounded-lg font-medium transition-colors ${
                          otp.length === 4
                            ? "bg-[color:var(--primary-color,#20B2AA)] text-white hover:bg-[color:var(--primary-color,#20B2AA)]/90"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        {loading ? "Verifying..." : "Verify & Pay"}
                      </button>
                    </div>
                  )}

                  {currentStep === "success" && (
                    <div className="text-center space-y-4 sm:space-y-6 max-w-md mx-auto">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <Lucide.CheckCircle
                          className="text-green-600"
                          size={24}
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-green-600 text-lg sm:text-xl mb-2">
                          Payment Successful!
                        </h3>
                        <p className="text-sm text-gray-600">
                          Your payment of {currency} {finalAmount} has been
                          processed successfully.
                        </p>
                      </div>
                      <button
                        onClick={onClose}
                        className="w-full py-3 bg-[color:var(--primary-color,#20B2AA)] text-white rounded-lg hover:bg-[color:var(--primary-color,#20B2AA)]/90 transition-colors font-medium"
                      >
                        Close
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Details Modal */}
        {showDetails && (
          <div
            className={`${
              isMobile
                ? "fixed inset-x-0 bottom-0 z-50"
                : "fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            }`}
          >
            <div
              className={`${
                isMobile
                  ? "bg-white rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto shadow-2xl"
                  : "bg-white rounded-2xl p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Appointment Details</h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Lucide.X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-gray-600 mb-2">
                    Appointment Information
                  </h4>
                  <div className="space-y-2">
                    {["serviceType", "doctorName", "hospitalName"].map(
                      (field, i) => (
                        <div
                          key={field}
                          className="flex items-center gap-2 text-sm"
                        >
                          {
                            [
                              <Lucide.Stethoscope
                                size={16}
                                className="text-green-600"
                              />,
                              <Lucide.User
                                size={16}
                                className="text-green-600"
                              />,
                              <Lucide.Hospital
                                size={16}
                                className="text-green-600"
                              />,
                            ][i]
                          }
                          <span className="font-medium">
                            {displayBookingDetails[field]}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentGateway;
