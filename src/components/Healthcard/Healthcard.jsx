// 📄 src/pages/Healthcard.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import QRCode from "qrcode";
import { Download, X, Check, Crown, Star, Shield, Zap } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo from "../../assets/logo.png";
import { getSubscriptionPlans, getPatientById, getPatientPhoto } from "../../utils/masterService";

const API_BASE_URL = "https://6801242781c7e9fbcc41aacf.mockapi.io/api/AV1";
const CARD_API_URL = "https://681075c727f2fdac24116e70.mockapi.io/user/healthcard";

function Healthcard({ hideLogin }) {
  const [userData, setUserData] = useState(null);
  const [healthId, setHealthId] = useState("");
  const [isCardGenerated, setIsCardGenerated] = useState(false);
  const [rtoData, setRtoData] = useState({ states: { Maharashtra: "MH" }, districts: { Mumbai: "01" } });
  const [qrImage, setQrImage] = useState("");
  const [subscription, setSubscription] = useState(localStorage.getItem("subscription") || null);
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const cardRef = useRef(null);

  // 🟢 Fetch subscription plans
  useEffect(() => {
    const fetchSubscriptionPlans = async () => {
      try {
        const res = await getSubscriptionPlans();
        const plans = res.data.map((plan) => ({
          id: plan.name.toLowerCase(),
          name: plan.name,
          price: `₹${plan.price}`,
          period: "/month",
          icon: getIconForPlan(plan.name),
          color: getColorForPlan(plan.name),
          gradient: getGradientForPlan(plan.name),
          cardGradient: getCardGradientForPlan(plan.name),
          qrColor: getQRColorForPlan(plan.name),
          benefits: plan.features,
        }));
        setSubscriptionPlans(plans);
        setSelectedPlan(plans.find((p) => p.id === subscription) || plans.find((p) => p.id === "gold"));
        setLoadingPlans(false);
      } catch (err) {
        console.error("Failed to fetch subscription plans", err);
        setLoadingPlans(false);
      }
    };
    fetchSubscriptionPlans();
  }, [subscription]);

  // Helper mappings
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
        return "from-[#1E40AF] to-[#1E3A8A]";
      case "Silver":
        return "from-[#374151] to-[#1F2937]";
      case "Gold":
        return "from-[#FFD700] to-[#FFA500]";
      case "Platinum":
        return "from-[#4C1D95] to-[#5B21B6]";
      default:
        return "from-[#1E40AF] to-[#1E3A8A]";
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

  // 🟢 Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!user?.patientId) return;
        const res = await getPatientById(user.patientId);
        const userData = res.data;
        const dob = userData.dob ? new Date(userData.dob[0], userData.dob[1] - 1, userData.dob[2]) : null;
        let photoUrl = null;
        if (userData.photo) {
          const photoRes = await getPatientPhoto(userData.photo);
          photoUrl = URL.createObjectURL(photoRes.data);
        }
        setUserData({
          ...userData,
          dob: dob ? dob.toISOString().split("T")[0] : null,
          photo: photoUrl,
        });
      } catch (err) {
        console.error("Failed to fetch user data", err);
        setUserData(null);
      }
    };
    if (user?.patientId) fetchUserData();
  }, [user?.patientId]);

  // 🟢 Generate QR
  useEffect(() => {
    if (healthId && subscription) {
      const plan = subscriptionPlans.find((p) => p.id === subscription);
      QRCode.toDataURL(
        healthId,
        {
          width: 128,
          margin: 2,
          color: { dark: plan?.qrColor || "#01D48C", light: "#FFFFFF" },
        },
        (err, url) => {
          if (err) return console.error("QR generation failed:", err);
          setQrImage(url);
        }
      );
    }
  }, [healthId, subscription, subscriptionPlans]);

  // 🟢 Auto-generate card
  const generateHealthId = (userData) => {
    const now = new Date();
    const datePart =
      String(now.getFullYear()).slice(-2) +
      String(now.getMonth() + 1).padStart(2, "0") +
      String(now.getDate()).padStart(2, "0");
    const stateCode = rtoData.states?.[userData.state] || "XX";
    const districtCode = rtoData.districts?.[userData.city] || "00";
    const gender = userData.gender?.charAt(0).toUpperCase() || "X";
    const aadhaar = userData.aadhaar?.slice(-4) || "0000";
    const serial = Math.floor(Math.random() * 9) + 1;
    return `${datePart}-${stateCode}${districtCode}${gender}-${aadhaar}${serial}`;
  };

  useEffect(() => {
    if (!userData?.aadhaar || isCardGenerated || !subscription || loadingPlans) return;
    const genId = generateHealthId(userData);
    setHealthId(genId);
    localStorage.setItem("healthId", genId);
    setIsCardGenerated(true);
  }, [userData, isCardGenerated, subscription, rtoData, loadingPlans]);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  };

  // 🟢 Navigate to external OTP page instead of modal
  const handleScan = () => {
    toast.info(`OTP sent to ${userData.phone}: 123456`, { autoClose: 2000 });
    navigate("/healthcard-otp", { state: { userData, healthId } });
  };

  const handleChangePlan = () => setShowSubscriptionModal(true);

  const currentPlan = subscriptionPlans.find((p) => p.id === subscription);
  if (loadingPlans) return <div className="text-center p-4">Loading subscription plans...</div>;
  if (!userData) return <div className="text-center p-4">Loading user data...</div>;

  return (
    <div className="flex flex-col items-center justify-center min-w-full p-2 sm:p-4">
      <ToastContainer position="top-right" />
      {currentPlan && (
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
          <div
            className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl
              bg-gradient-to-r ${currentPlan.gradient} text-white font-bold
              text-sm sm:text-lg shadow-lg ring-1 ring-white/20`}
          >
            <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 bg-white/20 rounded-full shadow-inner">
              <currentPlan.icon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span>{currentPlan.name} Member</span>
            <button
              onClick={handleChangePlan}
              className="ml-2 px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 text-xs sm:text-sm text-white font-medium transition-all shadow-inner"
            >
              Change Plan
            </button>
          </div>
        </div>
      )}

      {/* CARD UI */}
      <div
        ref={cardRef}
        className="relative w-full max-w-[350px] sm:max-w-[400px] h-[220px] sm:h-[250px] rounded-xl overflow-hidden shadow-xl mx-auto"
        style={{
          background: currentPlan?.cardGradient
            ? `linear-gradient(135deg, ${currentPlan.cardGradient.replace("from-[", "").replace("] to-[", ", ").replace("]", "")})`
            : "linear-gradient(135deg, #6B7280, #374151)",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        <div className="relative h-full p-3 sm:p-4 flex flex-col">
          <div className="flex justify-between items-start">
            <div className="flex items-center"></div>
            <div className="text-right">
              <div className="flex items-center justify-end gap-1 sm:gap-2">
                <img src={logo} alt="DigiHealth Logo" className="w-12 h-12 sm:w-16 sm:h-16 object-contain" />
                <h1 className="text-lg sm:text-xl font-bold text-white">DigiHealth</h1>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center -mt-2 sm:-mt-3">
            <div className="flex items-center gap-2 sm:gap-4">
              <img
                src={
                  userData.photo ||
                  "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150"
                }
                alt="User"
                className="w-14 h-14 sm:w-20 sm:h-20 object-cover rounded-full border-2 border-white shadow"
              />
              <div>
                <p className="font-bold text-base sm:text-lg text-white uppercase">
                  {userData.firstName} {userData.lastName}
                </p>
                <p className="text-xs sm:text-sm text-white">
                  DOB: {formatDate(userData.dob)} | Gender: {userData.gender}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-3 sm:mt-4 flex justify-between items-center px-2 sm:px-3">
            <div>
              <span className="text-xs font-semibold text-white">Health ID</span>
              <div className="font-mono text-lg sm:text-xl tracking-wider font-bold text-white">{healthId}</div>
            </div>
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white p-1 sm:p-1.5 rounded-lg flex items-center justify-center shadow-lg">
              {qrImage && (
                <img
                  src={qrImage}
                  alt="QR Code"
                  className="w-full h-full cursor-pointer border-2 border-white"
                  onClick={handleScan}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-4 sm:mt-6 justify-center w-full">
        <button
          onClick={() => {
            const title = document.title;
            document.title = "DigiHealth Card";
            window.print();
            document.title = title;
          }}
          className="flex items-center gap-2 font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg bg-gradient-to-r from-blue-700 to-blue-900 text-white"
        >
          <Download className="w-4 h-4" />
          Download Card
        </button>
        {!hideLogin && (
          <button
            onClick={() => navigate("/login")}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-semibold"
          >
            Login
          </button>
        )}
      </div>
    </div>
  );
}

export default Healthcard;
