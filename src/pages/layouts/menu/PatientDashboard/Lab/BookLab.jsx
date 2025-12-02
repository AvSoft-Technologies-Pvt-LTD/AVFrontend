import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { Clock, MapPin, Home, TestTube, User, DollarSign, FileText, CheckCircle, Circle } from "lucide-react";
import { createAppointment } from "../../../../../utils/CrudService";
import { useDispatch } from 'react-redux';
import { clearCart } from '../../../../../context-api/cartSlice';
const BookLab = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { patientId } = useSelector((state) => state.auth);
  const { lab: labFromState, cart: cartFromState } = location.state || {};
  const [form, setForm] = useState({
    location: "Home Collection",
    address: "",
    date: "",
    time: "",
    fullName: "",
    phone: "",
    email: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const lab = labFromState || { labName: "-", location: "-" };
  const labId = lab?.labId ?? lab?.id ?? null;
  const labAvailableId = lab?.labAvailableId ?? null; // strictly require actual labAvailableId
  const cart = Array.isArray(cartFromState) ? cartFromState : [];
  const totalPrice = cart.reduce((sum, t) => sum + (Number(t.price) || 0) * (t.quantity || 1), 0);

  const getStepStatus = (stepIndex) => {
    switch (stepIndex) {
      case 0:
        return "completed";
      case 1:
        return form.location && (form.location === "Visit Lab" || form.address) ? "completed" : "in-progress";
      case 2:
        return form.date && form.time ? "completed" : "pending";
      case 3:
        return form.fullName && form.phone ? "completed" : "pending";
      case 4:
        return "pending";
      default:
        return "pending";
    }
  };

  const calculateProgress = () => {
    let completed = 1;
    if (form.location && (form.location === "Visit Lab" || form.address)) completed++;
    if (form.date && form.time) completed++;
    if (form.fullName && form.phone) completed++;
    return (completed / 5) * 100;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === "phone" ? value.replace(/\D/g, "") : value,
    });
    setErrors({ ...errors, [name]: "" });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.fullName.trim()) newErrors.fullName = "Full name is required";
    else if (form.fullName.length > 20)
      newErrors.fullName = "Full name must be 20 characters or less";
    if (!form.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!/^\d{10}$/.test(form.phone))
      newErrors.phone = "Phone number must be exactly 10 digits";
    if (!form.date) newErrors.date = "Date is required";
    if (!form.time) newErrors.time = "Time is required";
    if (form.location === "Home Collection" && !form.address.trim())
      newErrors.address = "Address is required for home collection";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProceed = async () => {
    if (!validateForm()) return;
    if (!patientId) {
      setErrors((prev) => ({ ...prev, patient: "Missing patient id. Please login again." }));
      return;
    }
    const visitLocation =
      form.location === "Home Collection" && form.address
        ? form.address
        : lab.location;
    try {
      setLoading(true);
      if (!labAvailableId) {
        console.error('Missing labAvailableId on selected lab');
        setErrors((prev) => ({ ...prev, lab: 'Unable to proceed: Missing lab identifier.' }));
        return;
      }
      const payload = {
        patientName: form.fullName,
        patientid: patientId,
        phone: form.phone,
        email: form.email,
        labcenterId: labId,
        labAvailableId: labAvailableId,
        appointmentDate: form.date,
        appointmentTime: form.time,
        homeCollection: form.location === "Home Collection",
        address: form.location === "Home Collection" ? form.address : "",
      };
      const { data } = await createAppointment(payload);
      console.log("labs data",data);
      if (data) {
        // Clear the cart after successful booking
        dispatch(clearCart());
        navigate("/patientdashboard/payment1", {
          state: {
            name: form.fullName,
            email: form.email,
            date: form.date,
            time: form.time,
            location: visitLocation,
            amount: totalPrice,
            testTitle: cart.map((test) => test.title).join(", "),
            labName: lab.labName,
            labLocation: lab.location,
            appointment: data,
          },
        });
      }
    } catch (e) {
      console.error(e?.response?.data || e.message);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      icon: TestTube,
      title: "Lab & Tests",
      status: getStepStatus(0),
      content: (
        <div className="space-y-1">
          <p className="font-semibold text-gray-900">{lab.labName}</p>
          <p className="text-sm text-gray-600 leading-relaxed">
            {cart.map((test) => test.title).join(", ")}
          </p>
        </div>
      ),
    },
    {
      icon: MapPin,
      title: "Visit Type",
      status: getStepStatus(1),
      content: (
        <div className="space-y-2">
          <p className="font-semibold text-gray-900">{form.location}</p>
          {form.location === "Home Collection" && (
            <div className="flex items-start gap-2">
              <Home className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-600">
                {form.address || "Not provided"}
              </p>
            </div>
          )}
        </div>
      ),
    },
    {
      icon: Clock,
      title: "Appointment",
      status: getStepStatus(2),
      content: (
        <div className="space-y-1">
          <p className="text-sm text-gray-700">
            <span className="font-medium">Date:</span>{" "}
            {form.date || "Not selected"}
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-medium">Time:</span>{" "}
            {form.time || "Not selected"}
          </p>
        </div>
      ),
    },
    {
      icon: User,
      title: "Patient",
      status: getStepStatus(3),
      content: (
        <div className="space-y-1">
          <p className="text-sm text-gray-700">
            {form.fullName || "Test Name"}
          </p>
          <p className="text-sm text-gray-600">
            {form.phone || "Phone number"}
          </p>
          {form.email && (
            <p className="text-sm text-gray-600">{form.email}</p>
          )}
        </div>
      ),
    },
    {
      icon: DollarSign,
      title: "Payment",
      status: getStepStatus(4),
      content: (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Test Price</span>
            <span className="font-semibold text-gray-900">₹{totalPrice}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Home Collection Fee</span>
            <span className="font-semibold text-gray-900">₹0</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-gray-200">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="text-lg font-bold text-teal-600">₹{totalPrice}</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-[var(--primary-color)] text-center mb-8">
          Book Your Lab Appointment
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex gap-3">
              {["Home Collection", "Visit Lab"].map((option) => (
                <button
                  key={option}
                  className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    form.location === option
                      ? "bg-[var(--primary-color)] text-white shadow-md"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                  onClick={() => setForm({ ...form, location: option })}
                >
                  {option}
                </button>
              ))}
            </div>
            {form.location === "Home Collection" && (
              <div>
                <label className="block text-sm font-medium text-[var(--primary-color)]/80 mb-2">
                  Address for Home Collection
                </label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Enter your complete address"
                  className={`w-full px-4 py-3 border ${
                    errors.address ? "border-red-500" : "border-gray-300"
                  } rounded-xl focus:ring-2 focus:ring-[var(--accent-color)] focus:border-transparent transition-all`}
                />
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                )}
              </div>
            )}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--primary-color)]/80 mb-2">
                  Appointment Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border ${
                    errors.date ? "border-red-500" : "border-gray-300"
                  } rounded-xl focus:ring-2 focus:ring-[var(--accent-color)] focus:border-transparent transition-all`}
                />
                {errors.date && (
                  <p className="text-red-500 text-sm mt-1">{errors.date}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--primary-color)]/80 mb-2">
                  Appointment Time
                </label>
                <input
                  type="time"
                  name="time"
                  value={form.time}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border ${
                    errors.time ? "border-red-500" : "border-gray-300"
                  } rounded-xl focus:ring-2 focus:ring-[var(--accent-color)] focus:border-transparent transition-all`}
                />
                {errors.time && (
                  <p className="text-red-500 text-sm mt-1">{errors.time}</p>
                )}
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--primary-color)]/80 mb-2">
                  Full Name
                </label>
                <input
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className={`w-full px-4 py-3 border ${
                    errors.fullName ? "border-red-500" : "border-gray-300"
                  } rounded-xl focus:ring-2 focus:ring-[var(--accent-color)] focus:border-transparent transition-all`}
                />
                {errors.fullName && (
                  <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--primary-color)]/80 mb-2">
                  Phone Number
                </label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Enter 10-digit number"
                  className={`w-full px-4 py-3 border ${
                    errors.phone ? "border-red-500" : "border-gray-300"
                  } rounded-xl focus:ring-2 focus:ring-[var(--accent-color)] focus:border-transparent transition-all`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--primary-color)]/80 mb-2">
                Email (optional)
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--accent-color)] focus:border-transparent transition-all"
              />
            </div>
            <button
              onClick={handleProceed}
              disabled={loading}
              className="w-full py-4 bg-[var(--primary-color)] text-white text-base font-semibold rounded-xl hover:opacity-95 transition-all duration-300 shadow-md disabled:opacity-50"
            >
              {loading ? "Processing..." : "Proceed to Payment"}
            </button>
          </div>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
            <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="text-gray-900 w-5 h-5" />
                <h3 className="text-lg font-semibold text-[var(--primary-color)]">
                  Appointment Summary
                </h3>
              </div>
              <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium">
                #6906
              </span>
            </div>
            <div className="px-6 py-6 relative">
              <div className="absolute left-[37px] top-0 bottom-0 w-0.5 bg-gray-200">
                <div
                  className="absolute top-0 left-0 w-full bg-[var(--accent-color)] transition-all duration-700 ease-out"
                  style={{ height: `${calculateProgress()}%` }}
                />
              </div>
              <div className="relative space-y-6">
                {steps.map((step, index) => {
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
                              ? "bg-teal-500 shadow-md"
                              : isInProgress
                              ? "bg-white border-2 border-teal-500 shadow-sm"
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
            <div className="bg-teal-50 px-6 py-4 border-t border-teal-100">
              <div className="flex gap-3 text-sm text-gray-700">
                <Clock className="text-teal-600 w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Reports will be ready within{" "}
                  <span className="font-semibold text-gray-900">24–48 hours</span>{" "}
                  after sample collection.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookLab;