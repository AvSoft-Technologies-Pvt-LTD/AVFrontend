
import React, { useEffect, useState } from "react";
import axios from "axios";
import { RefreshCw } from "lucide-react";

const PAGE_SIZE = 5;

const LabAppointmentPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusUpdates, setStatusUpdates] = useState({});
  const [modalData, setModalData] = useState(null);
  const [updatingId, setUpdatingId] = useState(null); // For animation
  const [page, setPage] = useState(1);

  const statuses = ["Appointment Confirmed", "Technician On the Way", "Sample Collected", "Test Processing", "Report Ready"];

 const fetchAppointments = async () => {
  try {
    const res = await axios.get("https://680b3642d5075a76d98a3658.mockapi.io/Lab/payment");
    setAppointments(res.data);
  } catch (err) {
    console.error("Error fetching:", err);
  } finally {
    setLoading(false);
  }
};
 useEffect(() => {
    fetchAppointments();
  }, []);

  const handleStatusChange = (id, status) =>
    setStatusUpdates(prev => ({ ...prev, [id]: status }));

 const handleUpdateStatus = async id => {
  const status = statusUpdates[id]; if (!status) return alert("Select a status first."); setUpdatingId(id);
  try { await axios.put(`https://680b3642d5075a76d98a3658.mockapi.io/Lab/payment/${id}`, { status }); setTimeout(() => { const alertDiv = document.createElement("div"); alertDiv.innerText = "Status updated."; alertDiv.className = "fixed top-6 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow-lg z-[9999] animate-fadeInOut"; document.body.appendChild(alertDiv); setTimeout(() => { alertDiv.classList.add("animate-fadeOut"); setTimeout(() => document.body.removeChild(alertDiv), 400); }, 1200); setUpdatingId(null); fetchAppointments(); }, 700); } catch (err) { console.error("Update error:", err); alert("Failed to update."); setUpdatingId(null); }
};

  const totalPages = Math.ceil(appointments.length / PAGE_SIZE);
  const paginatedAppointments = appointments.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  if (loading) return <div>Loading appointments...</div>;

  return (
    <div className="container mx-auto p-6">
      <h4 className="h4-heading mb-3">Lab Appointment Management</h4>
      <div className="overflow-x-auto">
       <table className="table-container"><thead><tr className="table-head">{["Patient Name", "Test", "Date & Time", "Update Status"].map(h => (<th key={h} className="py-2">{h}</th>))}</tr></thead><tbody className="table-body">{paginatedAppointments.map(a => (<tr key={a.id} className="tr-style text-center transition-colors duration-200 hover:bg-gray-100"><td><button className="bg-transparent p-0 m-0 text-inherit font-medium focus:outline-none transition-transform duration-150 hover:scale-105 active:scale-95" style={{ boxShadow: "none" }} onClick={() => setModalData(a)}>{a.patientName}</button></td><td>{a.testTitle}</td><td>{a.date ? `${new Date(a.date).toLocaleDateString()}${a.time ? " " + a.time : ""}` : ""}</td><td className="py-3 text-sm"><div className="flex items-center justify-center"><select value={statusUpdates[a.id] || a.status || ""} onChange={e => handleStatusChange(a.id, e.target.value)} className="border-1 border-gray-300 px-2 py-1 me-6 rounded-full text-sm transition-all duration-200 hover:border-[var(--primary-color)]"><option value="">-- Select --</option>{statuses.map(s => (<option key={s} value={s}>{s}</option>))}</select>
<button onClick={() => handleUpdateStatus(a.id)} className={`group relative overflow-hidden flex items-center gap-2 px-5 py-2 rounded-full border border-[var(--accent-color)] text-[var(--accent-color)] bg-transparent text-sm font-semibold shadow-lg transition-all duration-300 ease-in-out active:scale-95 ${updatingId === a.id ? "animate-pulse-scale" : ""}`} disabled={updatingId === a.id}><span className="absolute top-0 left-0 w-full h-1/2 bg-[var(--accent-color)] transform -translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out z-0"/><span className="absolute bottom-0 left-0 w-full h-1/2 bg-[var(--accent-color)] transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out z-0"/><span className="relative z-10 flex items-center justify-center w-5 h-5"><RefreshCw className={`w-4 h-4 transition-transform duration-500 ${updatingId === a.id ? "animate-spin" : ""} group-hover:text-white`} /></span><span className="relative z-10 group-hover:text-white">Update</span></button></div></td></tr>))}</tbody></table>
  </div>
     <div className="flex justify-end mt-8"><div className="flex items-center gap-6"><button className="edit-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ opacity: page === 1 ? 0.5 : 1 }}>Previous</button><span className="font-medium text-[var(--primary-color)]">Page {page} of {totalPages}</span><button className="edit-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0} style={{ opacity: page === totalPages || totalPages === 0 ? 0.5 : 1 }}>Next</button></div></div>
      {modalData && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"><div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative"><button className="absolute top-2 right-3 text-xl font-bold text-gray-400 hover:text-gray-700" onClick={() => setModalData(null)}>&times;</button><h4 className="h4-heading mb-4">Patient Details</h4><div className="border rounded p-4 mb-4"><div className="paragraph font-bold text-[var(--primary-color)] mb-2 border-b pb-1">Patient Information</div><div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm mt-2"><div><span className="paragraph font-semibold">Patient Name:</span> <span className="paragraph">{modalData.patientName}</span></div><div><span className="paragraph font-semibold">Booking ID:</span><span className="paragraph"> {modalData.bookingId}</span></div><div><span className="paragraph font-semibold">Phone:</span><span className="paragraph"> {modalData.phone}</span></div><div><span className="paragraph font-semibold">Email:</span><span className="paragraph"> {modalData.email || "-"}</span></div><div><span className="paragraph font-semibold">Location:</span> <span className="paragraph">{modalData.location}</span></div></div></div>
<div className="border rounded p-4 mb-4"><div className="paragraph font-bold text-[var(--primary-color)] mb-2 border-b pb-1">Test Details</div><div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm mt-2"><div><span className="paragraph font-semibold">Test:</span> <span className="paragraph">{modalData.testTitle}</span></div><div><span className="paragraph font-semibold">Lab:</span> <span className="paragraph">{modalData.labName}</span></div><div><span className="paragraph font-semibold">Appointment:</span> <span className="paragraph">{modalData.date} {modalData.time && `at ${modalData.time}`}</span></div><div><span className="paragraph font-semibold">Status:</span> <span className="paragraph">{modalData.status}</span></div></div></div>
<div className="border rounded p-4"><div className="paragraph font-bold text-[var(--primary-color)] mb-2 border-b pb-1">Payment Details</div><div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm mt-2"><div><span className="paragraph font-semibold">Amount Paid:</span> <span className="paragraph">₹{modalData.amountPaid}</span></div><div><span className="paragraph font-semibold">Payment Status:</span><span className="paragraph"> {modalData.paymentStatus}</span></div></div></div></div></div>)}
 <style>{`@keyframes pulse-scale{0%,100%{transform:scale(1);}50%{transform:scale(1.12);}}.animate-pulse-scale{animation:pulse-scale 0.7s cubic-bezier(.4,0,.2,1);}`}</style>
 </div>
  );
};

export default LabAppointmentPage;