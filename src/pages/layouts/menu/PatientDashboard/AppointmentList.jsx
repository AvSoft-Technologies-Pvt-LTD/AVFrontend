import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiCalendar, FiMapPin } from "react-icons/fi";
import DynamicTable from "../../../../components/microcomponents/DynamicTable";
import PaymentGateway from "../../../../components/microcomponents/PaymentGatway";
import ReusableModal from "../../../../components/microcomponents/Modal";

const AppointmentList = ({ displayType, showOnlyTable = false, isOverview = false, data }) => {
  const navigate = useNavigate();
  
  const initialType = displayType || localStorage.getItem("appointmentTab") || "doctor";
  const [state, setState] = useState({
    t: initialType,
    l: [],
    d: [],
    selectedAppointment: null,
    showPaymentGateway: false,
    showModal: false,
    modalMode: "view",
  });

  useEffect(() => {
    localStorage.setItem("appointmentTab", state.t);
  }, [state.t]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [labResponse, doctorResponse] = await Promise.all([
          axios.get("https://680b3642d5075a76d98a3658.mockapi.io/Lab/payment"),
          axios.get("https://67e3e1e42ae442db76d2035d.mockapi.io/register/book"),
        ]);
        const email = localStorage.getItem("email")?.trim().toLowerCase();
        const userId = localStorage.getItem("userId")?.trim();
        const filteredDoctorAppointments = doctorResponse.data
          .filter(
            (appointment) =>
              appointment.email?.trim().toLowerCase() === email ||
              appointment.userId?.trim() === userId
          )
          .reverse();
        setState((prev) => ({
          ...prev,
          l: labResponse.data.reverse(),
          d: data || filteredDoctorAppointments,
        }));
      } catch (err) {
        console.error(err);
      }
    };
    if (!data) fetchData();
  }, [displayType, data]);

  const handleTabChange = (tab) => {
    setState((prev) => ({ ...prev, t: tab }));
  };

  const handlePayClick = (appointment) => {
    setState((prev) => ({
      ...prev,
      selectedAppointment: appointment,
      showPaymentGateway: true,
    }));
  };

  const handlePaymentSuccess = async (method, data) => {
    try {
      const updatedAppointments = state.d.map((appointment) =>
        appointment.id === state.selectedAppointment.id
          ? { ...appointment, status: "Paid" }
          : appointment
      );
      setState((prev) => ({
        ...prev,
        d: updatedAppointments,
        showPaymentGateway: false,
      }));
      await axios.put(
        `https://67e3e1e42ae442db76d2035d.mockapi.io/register/book/${state.selectedAppointment.id}`,
        { status: "Paid" }
      );
    } catch (error) {
      console.error("Error updating appointment status:", error);
    }
  };

  const handlePaymentFailure = (error) => {
    console.error("Payment Failure:", error);
    alert(`Payment failed: ${error.reason}. Please try again or use a different payment method.`);
    setState((prev) => ({ ...prev, showPaymentGateway: false }));
  };

  const getStatusBadge = (status, appointment) => {
    if (status === "Paid")
      return (
        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs sm:text-sm">
          Paid
        </span>
      );
    else if (status === "Confirmed")
      return (
        <div className="flex items-center space-x-1 sm:space-x-2">
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs sm:text-sm">
            Confirmed
          </span>
          {!showOnlyTable && !isOverview && (
            <button
              onClick={() => handlePayClick(appointment)}
              className="group relative inline-flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 border border-green-500 text-green-500 rounded-full font-semibold bg-transparent overflow-hidden transition-colors duration-300 ease-in-out hover:bg-green-500 hover:text-white text-xs sm:text-sm"
            >
              Pay
            </button>
          )}
        </div>
      );
    else if (status?.toLowerCase() === "rejected")
      return (
        <div className="flex items-center space-x-2 paragraph mt-1 text-xs sm:text-sm">
          <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full">Rejected</span>
          {!isOverview && <div><strong>Reason:</strong> {appointment.rejectReason}</div>}
        </div>
      );
    else
      return (
        <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs sm:text-sm">
          {isOverview ? "Pending" : "Waiting for Confirmation"}
        </span>
      );
  };

  const handleTrackClick = (appointment) => {
    setState((prev) => ({
      ...prev,
      selectedAppointment: appointment,
      showModal: true,
      modalMode: "view",
    }));
  };

  const doctorColumns = [
    {
      header: "Doctor",
      accessor: "doctorName",
      cell: (appointment) => (
        <button
          onClick={() => handleTrackClick(appointment)}
          className="text-[var(--primary-color)] underline hover:text-[var(--accent-color)] font-semibold text-xs sm:text-sm"
        >
          {appointment.doctorName}
        </button>
      ),
    },
    { header: "Speciality", accessor: "specialty" },
    { header: "Date", accessor: "date" },
    { header: "Time", accessor: "time" },
    { header: "Consultation Type", accessor: "consultationType" },
    { header: "Status", accessor: "status", cell: (row) => getStatusBadge(row.status, row) },
  ];

  const doctorFilters = [
    {
      key: "status",
      label: "Status",
      options: [
        { value: "Paid", label: "Paid" },
        { value: "Confirmed", label: "Confirmed" },
        { value: "Pending", label: "Pending" },
        { value: "Rejected", label: "Rejected" },
      ],
    },
  ];

  const labColumns = [
    {
      header: "ID",
      accessor: "bookingId",
      cell: (appointment) => (
        <button
          onClick={() => handleTrackClick(appointment)}
          className="text-[var(--primary-color)] underline hover:text-[var(--accent-color)] font-semibold text-xs sm:text-sm"
        >
          {appointment.bookingId}
        </button>
      ),
    },
    { header: "Test", accessor: "testTitle" },
    { header: "Lab", accessor: "labName" },
    {
      header: "Status",
      accessor: "status",
      cell: (appointment) => (
        <span className={`px-2 py-1 rounded-full paragraph text-xs sm:text-sm ${getStatusClass(appointment.status)}`}>
          {appointment.status || "Pending"}
        </span>
      ),
    },
    {
      header: "Action",
      cell: (appointment) => (
        <button
          onClick={() => navigate(`/patientdashboard/track-appointment/${appointment.bookingId}`)}
          className="group relative inline-flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 border border-[var(--accent-color)] text-[var(--accent-color)] rounded-full font-semibold bg-transparent overflow-hidden transition-colors duration-300 ease-in-out hover:bg-[var(--accent-color)] hover:text-white text-xs sm:text-sm"
        >
          <FiMapPin className="text-sm sm:text-lg transition-transform duration-300 ease-in-out group-hover:scale-110" />
          <span className="tracking-wide transition-all duration-300 ease-in-out">
            Track
          </span>
        </button>
      ),
    },
  ];

  const labFilters = [
    {
      key: "status",
      label: "Status",
      options: [
        { value: "Appointment Confirmed", label: "Appointment Confirmed" },
        { value: "Technician On the Way", label: "Technician On the Way" },
        { value: "Sample Collected", label: "Sample Collected" },
        { value: "Test Processing", label: "Test Processing" },
        { value: "Report Ready", label: "Report Ready" },
        { value: "Cancelled", label: "Cancelled" },
      ],
    },
  ];

  const getStatusClass = (status) => {
    const statusClasses = {
      "Appointment Confirmed": "bg-blue-100 text-blue-800",
      "Technician On the Way": "bg-yellow-100 text-yellow-800",
      "Sample Collected": "bg-purple-100 text-purple-800",
      "Test Processing": "bg-orange-100 text-orange-800",
      "Report Ready": "bg-green-100 text-green-800",
      Cancelled: "bg-red-100 text-red-600",
    };
    return statusClasses[status] || "bg-gray-100 text-gray-800";
  };

  const doctorViewFields = [
    { key: "doctorName", label: "Doctor Name", titleKey: true },
    { key: "specialty", label: "Speciality", subtitleKey: true },
    { key: "date", label: "Date" },
    { key: "time", label: "Time" },
    { key: "status", label: "Status" },
    { key: "consultationType", label: "Consultation Type" },
    { key: "location", label: "Location" },
    { key: "fees", label: "Fees" },
    { key: "symptoms", label: "Symptoms" },
    { key: "doctorName", label: "Initials", initialsKey: true },
  ];

  const labViewFields = [
    { key: "labName", label: "Lab Name", titleKey: true },
    { key: "testTitle", label: "Test Name", subtitleKey: true },
    { key: "bookingId", label: "Initials", initialsKey: true },
    { key: "location", label: "Location" },
    { key: "date", label: "Date" },
    { key: "time", label: "Time" },
    { key: "status", label: "Status" },
    { key: "reportTime", label: "Report Time" },
    { key: "amountPaid", label: "Amount Paid" },
    { key: "paymentStatus", label: "Payment Status" },
  ];

  const overviewData = isOverview
    ? (state.t === "doctor" ? state.d : state.l).slice(0, 3)
    : (state.t === "doctor" ? state.d : state.l);

  const tabs = displayType === "doctor" ? [] : [
    { label: "Doctor Appointments", value: "doctor" },
    { label: "Lab Appointments", value: "lab" },
  ];

  const tabActions = displayType === "doctor" ? [] : [
    {
      label: state.t === "lab" ? "Book Appointment" : "Book Appointment",
      onClick: () =>
        navigate(state.t === "lab" ? "/patientdashboard/lab-tests" : "/patientdashboard/book-appointment"),
      className: "group relative inline-flex items-center px-3 sm:px-6 py-1 sm:py-2 view-btn text-xs sm:text-sm",
      icon: <FiCalendar className="text-sm sm:text-lg mr-1 sm:mr-2" />,
    },
  ];

  return (
    <div className={isOverview ? "p-0" : "p-2 sm:p-4 md:p-6"}>
      {state.showPaymentGateway && state.selectedAppointment && (
        <PaymentGateway
          isOpen={state.showPaymentGateway}
          onClose={() => setState((prev) => ({ ...prev, showPaymentGateway: false }))}
          amount={state.selectedAppointment.fees}
          bookingId={state.selectedAppointment.id}
          merchantName="DigiHealth"
          methods={["upi", "card", "netbanking", "wallet", "paylater"]}
          onPay={handlePaymentSuccess}
          onPaymentFailure={handlePaymentFailure}
          currency="₹"
        />
      )}
      {state.showModal && state.selectedAppointment && (
        <ReusableModal
          isOpen={state.showModal}
          onClose={() => setState((prev) => ({ ...prev, showModal: false }))}
          mode="viewProfile"
          title={state.t === "doctor" ? "Doctor Appointment Details" : "Lab Appointment Details"}
          data={state.selectedAppointment}
          viewFields={state.t === "doctor" ? doctorViewFields : labViewFields}
          size="lg"
        />
      )}
      {!state.showPaymentGateway && !state.showModal && (
        <DynamicTable
          columns={state.t === "doctor" ? doctorColumns : labColumns}
          data={overviewData}
          tabs={isOverview ? [] : tabs}
          tabActions={isOverview ? [] : tabActions}
          activeTab={state.t}
          onTabChange={handleTabChange}
          showSearchBar={!isOverview}
          showPagination={!isOverview}
          filters={isOverview ? [] : (state.t === "doctor" ? doctorFilters : labFilters)}
        />
      )}
    </div>
  );
};

export default AppointmentList;
