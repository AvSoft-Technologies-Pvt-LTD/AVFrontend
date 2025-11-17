import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import QRCode from "qrcode";
import { Download, Crown, Star, Shield, Zap, X, Check } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo from "../../assets/logo.png";
import { getSubscriptionPlans } from "../../utils/masterService";
import {
  getPatientSubscription,
  createPatientSubscription,
  updatePatientSubscription,
  getHealthCardByPatientId,
} from "../../utils/CrudService";

function Healthcard({ hideLogin, patientId }) {
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [subscription, setSubscription] = useState(localStorage.getItem("subscription") || null);
  const [patientSubscription, setPatientSubscription] = useState(null);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [loadingCard, setLoadingCard] = useState(false);
  const [healthId, setHealthId] = useState("");
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [healthCardData, setHealthCardData] = useState(null);
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const cardRef = useRef(null);

  // Use passed patientId or fallback to user.patientId
  const currentPatientId = patientId || user?.patientId;

  // Helper functions for plan icons, gradients, and QR colors
  const getIconForPlan = (name) => {
    switch (name) {
      case "Basic":
        return Shield;
      case "Silver":
        return Star;
      case "Gold":
        return Crown;
      case "Platinum":
        return Zap;
      default:
        return Shield;
    }
  };

  const getGradientForPlan = (name) => {
    switch (name) {
      case "Basic":
        return "from-blue-700 to-blue-900";
      case "Silver":
        return "from-gray-600 to-gray-800";
      case "Gold":
        return "from-yellow-500 to-yellow-700";
      case "Platinum":
        return "from-purple-800 to-purple-950";
      default:
        return "from-blue-700 to-blue-900";
    }
  };

  const getCardGradientForPlan = (name) => {
    switch (name) {
      case "Basic":
        return "linear-gradient(135deg, #1E40AF, #1E3A8A)";
      case "Silver":
        return "linear-gradient(135deg, #374151, #1F2937)";
      case "Gold":
        return "linear-gradient(135deg, #FFD700, #FFA500)";
      case "Platinum":
        return "linear-gradient(135deg, #4C1D95, #5B21B6)";
      default:
        return "linear-gradient(135deg, #1E40AF, #1E3A8A)";
    }
  };

  const getQRColorForPlan = (name) => {
    switch (name) {
      case "Basic":
        return "#1E40AF";
      case "Silver":
        return "#6B7280";
      case "Gold":
        return "#B8860B";
      case "Platinum":
        return "#7C3AED";
      default:
        return "#1E40AF";
    }
  };

  const getColorForPlan = (name) => {
    switch (name) {
      case "Basic":
        return "blue";
      case "Silver":
        return "gray";
      case "Gold":
        return "yellow";
      case "Platinum":
        return "purple";
      default:
        return "blue";
    }
  };

  // Fetch subscription plans
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await getSubscriptionPlans();
        const plans = res.data.map((plan) => ({
          id: plan.name.toLowerCase(),
          name: plan.name,
          price: `₹${plan.price}`,
          period: "/month",
          icon: getIconForPlan(plan.name),
          gradient: getGradientForPlan(plan.name),
          cardGradient: getCardGradientForPlan(plan.name),
          qrColor: getQRColorForPlan(plan.name),
          color: getColorForPlan(plan.name),
          benefits: plan.features,
        }));
        setSubscriptionPlans(plans);
        setLoadingPlans(false);
      } catch (err) {
        console.error("Failed to fetch plans", err);
        setLoadingPlans(false);
      }
    };
    fetchPlans();
  }, []);

  // Fetch existing subscription
  useEffect(() => {
    const fetchSub = async () => {
      try {
        if (!currentPatientId) return;
        const res = await getPatientSubscription(currentPatientId);
        setPatientSubscription(res.data);
        const planKey = res.data.planName?.toLowerCase();
        setSubscription(planKey);
        localStorage.setItem("subscription", planKey);
      } catch (err) {
        console.log("No subscription found or failed to fetch", err);
      }
    };
    if (currentPatientId) fetchSub();
  }, [currentPatientId]);

  // Fetch existing health card
  useEffect(() => {
    const fetchHealthCard = async () => {
      try {
        if (!currentPatientId) return;
        setLoadingCard(true);
        const res = await getHealthCardByPatientId(currentPatientId);
        const cardData = res.data;
        setHealthCardData(cardData);
        setHealthId(cardData.healthCardId);
      } catch (err) {
        console.log("No health card found or failed to fetch", err);
      } finally {
        setLoadingCard(false);
      }
    };
    if (currentPatientId) fetchHealthCard();
  }, [currentPatientId]);

  // Generate health card
useEffect(() => {
  // Health card generation is now handled in Dashboard.jsx
  // This component only displays existing cards
}, [currentPatientId, subscription, subscriptionPlans, healthCardData, user]);

  const handleScan = () => {
    toast.info(`OTP sent to ${user.phone}: 123456`, { autoClose: 2000 });
    navigate("/healthcard-otp", { state: { user, healthId } });
  };
  // Helper function to format date
  const formatDate = (d) => {
    if (!d) return "N/A";
    const date = new Date(d);
    return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
  };

  // Helper function to format date with month and year only
  const formatDateMonthYear = (d) => {
    if (!d) return "N/A";
    const date = new Date(d);
    return `${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
  };

  // Handle plan selection
  const handlePlanSelection = async (plan) => {
    try {
      const today = new Date();
      const expiry = new Date(today);
      expiry.setMonth(today.getMonth() + 1);
      const payload = {
        patientId: user.patientId,
        planId:
          plan.name === "Basic"
            ? 1
            : plan.name === "Silver"
            ? 2
            : plan.name === "Gold"
            ? 3
            : 4,
        planName: plan.name,
        status: "ACTIVE",
        startDate: [today.getFullYear(), today.getMonth() + 1, today.getDate()],
        expiryDate: [expiry.getFullYear(), expiry.getMonth() + 1, expiry.getDate()],
        features: plan.benefits,
      };
      let res;
      if (patientSubscription) {
        res = await updatePatientSubscription(user.patientId, payload);
        toast.success("Subscription updated!");
      } else {
        res = await createPatientSubscription(user.patientId, payload);
        toast.success("Subscription created!");
      }
      setPatientSubscription(res.data);
      localStorage.setItem("subscription", plan.id);
      setSubscription(plan.id);
      setShowSubscriptionModal(false);
    } catch (err) {
      console.error("Subscription error:", err);
      toast.error("Failed to update subscription");
    }
  };

  if (loadingPlans || !user) {
    return <div className="text-center p-6">Loading...</div>;
  }

  const currentPlan = subscriptionPlans.find((p) => p.id === subscription);

  return (
    <div className="flex flex-col items-center justify-center min-w-full p-4">
      <ToastContainer position="top-right" />
      {/* CURRENT PLAN BANNER */}
      {currentPlan && (
        <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r ${currentPlan.gradient} text-white font-bold shadow-lg mb-4`}>
          <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-full">
            <currentPlan.icon className="w-5 h-5" />
          </div>
          <span>{currentPlan.name} Member</span>
          <button onClick={() => setShowSubscriptionModal(true)} className="ml-2 px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 text-sm font-medium">
            Change Plan
          </button>
        </div>
      )}
      {/* HEALTH CARD */}
      <div ref={cardRef} className="relative w-full max-w-[380px] h-[250px] rounded-xl overflow-hidden shadow-lg" style={{ background: currentPlan?.cardGradient || "linear-gradient(135deg,#6B7280,#374151)" }}>
       <div className="relative h-full p-3 sm:p-4 flex flex-col">
  {/* Header: Logo and Title */}
  <div className="flex justify-between items-start">
    <div className="flex items-center"></div>
    <div className="text-right">
      <div className="flex items-center justify-end gap-1 sm:gap-2">
        <img src={logo} alt="PocketClinic Logo" className="w-12 h-12 sm:w-16 sm:h-16 object-contain" />
        <h1 className="text-lg sm:text-xl font-bold text-white">PocketClinic</h1>
      </div>
    </div>
  </div>

  {/* User Info: Photo, Name, DOB, Gender */}
  <div className="flex justify-between items-center -mt-2 sm:-mt-3">
    <div className="flex items-center gap-2 sm:gap-4">
     {(healthCardData?.photoPath || user?.photoPath) && (
       <img
  src={
    healthCardData?.photoPath ? `http://localhost:8080/${healthCardData.photoPath.replace(/\\/g, '/')}` :
    `http://localhost:8080/${user.photoPath.replace(/\\/g, '/')}`
  }
  alt="User"
  className="w-14 h-14 sm:w-20 sm:h-20 object-cover rounded-full border-2 border-white shadow"
/>
     )}
      <div>
        <p className="font-bold text-base sm:text-lg text-white uppercase">
  {healthCardData?.patientName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || "N/A"}
</p>
<p className="text-xs sm:text-sm text-white">
  DOB: {formatDate(healthCardData?.dob || user?.dob)} | Gender: {healthCardData?.gender || user?.gender || "N/A"}
</p>
      </div>
    </div>
  </div>

  {/* Health ID and QR Code */}
  <div className="mt-3 sm:mt-4 flex justify-between items-center px-2 sm:px-3">
    <div>
      <span className="text-xs font-semibold text-white">Health ID</span>
     <div className="font-mono text-lg sm:text-xl tracking-wider font-bold text-white">
  {healthCardData?.healthCardId || "N/A"}
</div>

{healthCardData?.issueDate && (
  <div className="text-xs text-white/80">
    Valid: {formatDateMonthYear(healthCardData.issueDate)} - {formatDateMonthYear(healthCardData.expiryDate)}
  </div>
)}
    </div>
    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white p-1 sm:p-1.5 rounded-lg flex items-center justify-center shadow-lg">
     {healthCardData?.qrImagePath || healthCardData?.qrBase64 ? (
  <img
    src={healthCardData?.qrBase64 || `http://localhost:8080/${healthCardData.qrImagePath?.replace(/\\/g, '/')}`}
    alt="QR Code"
    className="w-full h-full cursor-pointer border-2 border-white"
    onClick={handleScan}
  />
) : (
  <span className="text-xs text-gray-500">No QR</span>
)}
    </div>
  </div>
</div>

      </div>
      
      {/* DOWNLOAD BUTTON */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={() => {
            const title = document.title;
            document.title = "PocketClinic Card";
            window.print();
            document.title = title;
          }}
          className="flex items-center gap-2 font-semibold py-2 px-5 rounded-lg bg-blue-700 text-white"
        >
          <Download className="w-4 h-4" /> Download Card
        </button>
        {!hideLogin && (
          <button
            onClick={() => navigate("/login")}
            className="px-5 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-semibold"
          >
            Login
          </button>
        )}
      </div>
      {/* PLAN SELECTION MODAL */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl mx-auto max-h-[90vh] overflow-y-auto shadow-xl relative">
            <button
              onClick={() => setShowSubscriptionModal(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Choose Your Health Plan
              </h2>
              <p className="text-gray-600 max-w-xl mx-auto text-sm sm:text-base">
                Select the perfect plan for your healthcare needs and unlock premium features
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {subscriptionPlans.map((plan) => {
                const IconComponent = plan.icon;
                return (
                  <div
                    key={plan.id}
                    className={`relative cursor-pointer rounded-xl p-4 sm:p-6 border-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg border-gray-200 hover:border-gray-300 hover:shadow-md`}
                  >
                    {plan.id === 'gold' && (
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                        <span className="bg-gradient-to-r from-yellow-500 to-yellow-700 text-white text-xs px-2 py-0.5 rounded-full font-semibold shadow-md whitespace-nowrap">
                          Most Popular
                        </span>
                      </div>
                    )}
                    <div className="text-center mb-3">
                      <div className={`inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r ${plan.gradient} text-white mb-2 shadow-md`}>
                        <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">{plan.name}</h3>
                      <div className="mb-2">
                        <span className="text-xl sm:text-2xl font-bold text-gray-900">{plan.price}</span>
                        <span className="text-gray-500 text-xs sm:text-sm">{plan.period}</span>
                      </div>
                    </div>
                    <ul className="space-y-1.5 mb-4 min-h-[100px]">
                      {plan.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-1.5 text-xs sm:text-sm text-gray-600">
                          <Check className={`w-3 h-3 mt-0.5 text-${plan.color}-500 flex-shrink-0`} />
                          <span className="leading-snug">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlanSelection(plan);
                      }}
                      className={`w-full py-2 px-4 rounded-lg font-semibold text-white bg-gradient-to-r ${plan.gradient} hover:opacity-90 transition`}
                    >
                      {patientSubscription?.planName?.toLowerCase() === plan.id ? "Current Plan" : "Select Plan"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Healthcard;
