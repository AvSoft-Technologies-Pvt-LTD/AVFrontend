import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

const BookLab = () => {
  const location = useLocation();
  const { lab, cart } = location.state || {};
  const navigate = useNavigate();
  const [form, setForm] = useState({
    location: "Visit Lab",
    address: "",
    date: "",
    time: "",
    fullName: "",
    phone: "",
    email: ""
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  console.log("Location state:", location.state); // Debugging

  if (!lab || !cart || cart.length === 0) {
    return (
      <div className="p-4 text-center text-gray-600">
        Error: No lab or tests selected. Please go back and try again.
      </div>
    );
  }

  const totalPrice = cart.reduce((sum, test) => sum + test.price, 0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === "phone" ? value.replace(/\D/g, "") : value
    });
    setErrors({ ...errors, [name]: "" });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.fullName.trim()) newErrors.fullName = "Full name is required";
    else if (form.fullName.length > 20) newErrors.fullName = "Full name must be 20 characters or less";
    if (!form.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!/^\d{10}$/.test(form.phone)) newErrors.phone = "Phone number must be exactly 10 digits";
    if (!form.date) newErrors.date = "Date is required";
    if (!form.time) newErrors.time = "Time is required";
    if (form.location === "Home Collection" && !form.address.trim()) newErrors.address = "Address is required for home collection";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return false;
    try {
      setLoading(true);
      await axios.post("https://680b3642d5075a76d98a3658.mockapi.io/Lab/appointments", {
        testTitle: cart.map(test => test.title).join(", "),
        labName: lab.name,
        labLocation: lab.location,
        testPrice: totalPrice,
        originalPrice: lab.originalPrice,
        ...form
      });
      return true;
    } catch (error) {
      console.error(error);
      alert("Booking failed!");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleProceed = async () => {
    const success = await handleSubmit();
    if (success) {
      navigate("/patientdashboard/payment1", {
        state: {
          name: form.fullName,
          email: form.email,
          date: form.date,
          time: form.time,
          location: form.location === "Home Collection" ? form.address : lab.location,
          amount: totalPrice,
          testTitle: cart.map(test => test.title).join(", "),
          labName: lab.name,
          labLocation: lab.location
        }
      });
    }
  };

  return (
    <div className="mt-4 sm:mt-6 p-4 sm:p-6 bg-white shadow-lg rounded-2xl max-w-6xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="text-gray-600 hover:text-gray-800 text-sm sm:text-base mb-4 flex items-center gap-1"
      >
        ← Back to Lab Details
      </button>
      <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
        <div className="flex-1 space-y-4 sm:space-y-6">
          <h4 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Book Appointment</h4>
          <div className="flex gap-2 sm:gap-4 mb-4 sm:mb-6">
            <button
              className={`flex-1 py-2 px-3 sm:py-2.5 sm:px-4 rounded-md text-sm sm:text-base font-medium ${
                form.location === "Home Collection" ? "bg-[var(--primary-color)] text-white" : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => setForm({ ...form, location: "Home Collection" })}
            >
              Home Collection
            </button>
            <button
              className={`flex-1 py-2 px-3 sm:py-2.5 sm:px-4 rounded-md text-sm sm:text-base font-medium ${
                form.location === "Visit Lab" ? "bg-[var(--primary-color)] text-white" : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => setForm({ ...form, location: "Visit Lab" })}
            >
              Visit Lab
            </button>
          </div>
          {form.location === "Home Collection" && (
            <div className="mb-4 sm:mb-6">
              <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1">Enter your address</label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] text-sm sm:text-base"
              />
              {errors.address && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.address}</p>}
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex-1">
              <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] text-sm sm:text-base"
              />
              {errors.date && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.date}</p>}
            </div>
            <div className="flex-1">
              <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1">Time</label>
              <input
                type="time"
                name="time"
                value={form.time}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] text-sm sm:text-base"
              />
              {errors.time && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.time}</p>}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex-1">
              <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1">Full Name</label>
              <input
                name="fullName"
                maxLength={20}
                value={form.fullName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] text-sm sm:text-base"
              />
              {errors.fullName && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.fullName}</p>}
            </div>
            <div className="flex-1">
              <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                name="phone"
                maxLength={10}
                value={form.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] text-sm sm:text-base"
              />
              {errors.phone && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.phone}</p>}
            </div>
          </div>
          <button
            onClick={handleProceed}
            disabled={loading}
            className="edit-btn"
          >
            {loading ? "Booking..." : "Proceed to Pay"}
          </button>
        </div>
        <div className="lg:w-1/3 bg-gray-50 p-4 sm:p-6 rounded-xl shadow-sm">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Appointment Summary</h3>
          <div className="space-y-2 text-sm sm:text-base text-gray-700">
            <p><strong>Tests:</strong> {cart.map(test => test.title).join(", ")}</p>
            <p><strong>Lab:</strong> {lab.name}</p>
            <p><strong>Location:</strong> {form.location === "Home Collection" ? form.address || "Home address not entered" : lab.location}</p>
            <hr className="my-2 sm:my-3 border-gray-200" />
            <p><strong>Test Price:</strong> ₹{totalPrice}</p>
            <p><strong>Home Collection Fee:</strong> ₹0</p>
            <p className="text-lg sm:text-xl font-bold text-gray-800 mt-2 sm:mt-3">Total: <span>₹{totalPrice}</span></p>
          </div>
          <div className="text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4">
            Your report will be ready within 24-48 hours after sample collection. You'll receive an email notification once it's ready.
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookLab;
