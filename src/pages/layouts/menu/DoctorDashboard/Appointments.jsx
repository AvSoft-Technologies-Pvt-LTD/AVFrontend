import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DynamicTable from '../../../../components/microcomponents/DynamicTable';
import { useSelector } from 'react-redux';
import ReusableModal from '../../../../components/microcomponents/Modal';
import { Check, X, Calendar, Trash2 } from 'lucide-react';

const TABS = [
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Rejected', value: 'rejected' }
];

const notify = async (name, phone, message, btn = false, doctorName) => {
  try {
    await axios.post('https://67e631656530dbd3110f0322.mockapi.io/notify', {
      name,
      phone,
      message,
      showPayButton: btn,
      doctorName,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Notification error:', error);
    toast.error('Failed to send notification');
  }
};

const splitName = (fullName) => {
  const parts = (fullName || '').trim().split(' ');
  return {
    firstName: parts[0] || '',
    middleName: parts.length > 2 ? parts.slice(1, -1).join(' ') : '',
    lastName: parts.length > 1 ? parts[parts.length - 1] : ''
  };
};

const DoctorAppointments = ({ showOnlyPending = false, isOverview = false }) => {
  const user = useSelector((state) => state.auth.user);
  const [appointments, setAppointments] = useState([]);
  const [tab, setTab] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [rejectId, setRejectId] = useState(null);
  const [rescheduleId, setRescheduleId] = useState(null);
  const [reasons, setReasons] = useState({});
  const [reschedule, setReschedule] = useState({ date: '', time: '' });
  const [doctorName, setDoctorName] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctorName = async () => {
      if (!user?.email) {
        console.error("No user email found in Redux");
        return;
      }
      try {
        console.log("Fetching doctor name for email:", user.email);
        const res = await axios.get(`https://6801242781c7e9fbcc41aacf.mockapi.io/api/AV1/users?email=${encodeURIComponent(user.email)}`);
        const users = res.data;
        if (users.length === 0) {
          throw new Error('No user found with the provided email');
        }
        const doctor = users[0];
        const fullName = `${doctor.firstName} ${doctor.lastName}`.trim();
        const formattedDoctorName = `Dr. ${fullName}`;
        console.log("Fetched Doctor Name:", formattedDoctorName);
        setDoctorName(formattedDoctorName);
      } catch (error) {
        console.error('Error fetching doctor name:', error);
        toast.error('Failed to fetch doctor name, using default.');
      }
    };
    fetchDoctorName();
  }, [user]);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!doctorName) return;
      try {
        setLoading(true);
        const res = await axios.get('https://67e3e1e42ae442db76d2035d.mockapi.io/register/book');
        const allAppointments = res.data;
        const normalizedDoctorName = doctorName.trim().toLowerCase();
        const filteredAppointments = allAppointments.filter(
          (appointment) => appointment.doctorName.trim().toLowerCase() === normalizedDoctorName
        );
        console.log("Filtered Appointments:", filteredAppointments);
        const merged = filteredAppointments.map((appointment) => ({
          id: appointment.id,
          name: appointment.name || 'Unknown',
          email: appointment.email,
          phone: appointment.phone || 'N/A',
          date: appointment.date,
          time: appointment.time,
          reason: appointment.symptoms,
          specialty: appointment.specialty,
          type: appointment.consultationType,
          doctorName: appointment.doctorName,
          status: appointment.status === 'Upcoming' ? 'Pending' : appointment.status || 'Pending',
          prescription: '',
          link: '',
          rejectReason: appointment.rejectReason || '',
          linkSent: false,
          rescheduleCount: appointment.rescheduleCount || 0
        }));
        merged.sort((a, b) => b.id - a.id);
        setAppointments(merged);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        toast.error('Failed to fetch appointments');
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [doctorName]);

  useEffect(() => {
    localStorage.setItem('appointments', JSON.stringify(appointments));
  }, [appointments]);

  const tabFiltered = appointments.filter(a =>
    tab === 'pending'
      ? ['pending', 'upcoming'].includes(a.status.toLowerCase())
      : a.status.toLowerCase() === tab
  );

  // For overview mode, show only recent 4 pending appointments
  const getDisplayData = () => {
    if (isOverview && showOnlyPending) {
      const pendingAppointments = appointments.filter(a => 
        ['pending', 'upcoming'].includes(a.status.toLowerCase())
      );
      return pendingAppointments.slice(0, 4); // Show only recent 4
    }
    return tabFiltered;
  };

  const [filteredData, setFilteredData] = useState(getDisplayData());

  useEffect(() => {
    setFilteredData(getDisplayData());
  }, [appointments, tab, isOverview, showOnlyPending]);

  const updateStatus = (id, updates) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const handleAccept = async (id) => {
    const appt = appointments.find(a => a.id === id);
    if (!appt) return;
    try {
      const transferToast = toast.loading('Processing appointment...', { autoClose: false });
      const confirmed = {
        ...appt,
        status: 'Confirmed',
        confirmedAt: new Date().toISOString(),
        doctorName,
        isVisible: false
      };
      updateStatus(id, confirmed);
      await axios.put(`https://67e3e1e42ae442db76d2035d.mockapi.io/register/book/${id}`, confirmed);
      await notify(
        appt.name,
        appt.phone,
        `✅ Appointment confirmed with ${doctorName} on ${appt.date} at ${appt.time}.`,
        true,
        doctorName
      );
      const { firstName, middleName, lastName } = splitName(appt.name);
      const patientData = {
        name: appt.name,
        firstName,
        middleName,
        lastName,
        phone: appt.phone,
        email: appt.email,
        doctorName,
        appointmentDate: appt.date,
        appointmentTime: appt.time,
        type: appt.type === 'Physical' ? 'OPD' : 'Virtual',
        isVisible: true,
        consultationStarted: false,
        consultationCompleted: false,
        prescription: '',
        advice: '',
        movedDate: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      console.log('Sending data to API:', patientData);
      const response = await axios.post('https://681f2dfb72e59f922ef5774c.mockapi.io/addpatient', patientData);
      if (!response.data || !response.data.id) {
        throw new Error('Invalid response from patient creation API');
      }
      toast.update(transferToast, {
        render: 'Appointment successfully added to patient list!',
        type: 'success',
        autoClose: 3000
      });
      const targetTab = appt.type === 'Physical' ? 'OPD' : 'Virtual';
      localStorage.setItem("highlightPatientId", response.data.id.toString());
      localStorage.setItem("targetPatientTab", targetTab);
      localStorage.setItem("appointmentAccepted", "true");
      localStorage.setItem("acceptedAppointmentType", appt.type);
      navigate('/doctordashboard/patients', {
        state: {
          highlightId: response.data.id,
          tab: targetTab,
          autoNavigated: true,
          appointmentType: appt.type,
          fromAppointment: true
        }
      });
    } catch (error) {
      console.error('Error accepting appointment:', error);
      toast.error(`Failed to accept appointment: ${error.response?.data?.message || error.message}`);
      updateStatus(id, { status: 'Pending' });
    }
  };

  const handleReject = async (id) => {
    const reason = reasons[id] || 'No reason given';
    const a = appointments.find(x => x.id === id);
    setRejectId(null);
    try {
      const updates = { status: 'Rejected', rejectReason: reason };
      updateStatus(id, updates);
      await axios.put(`https://67e3e1e42ae442db76d2035d.mockapi.io/register/book/${id}`, updates);
      await notify(a.name, a.phone, `:x: Appointment rejected.\nReason: ${reason}`, false, doctorName);
      toast.success('Appointment rejected');
    } catch (error) {
      console.error('Error rejecting appointment:', error);
      toast.error('Failed to reject appointment');
    }
  };

  const handleReschedule = async (id) => {
    const { date, time } = reschedule;
    const a = appointments.find(x => x.id === id);
    if (!date || !time) {
      toast.error('Please select both date and time');
      return;
    }
    setRescheduleId(null);
    setReschedule({ date: '', time: '' });
    try {
      if (a.rescheduleCount >= 2) {
        const updates = {
          status: 'Rejected',
          rejectReason: 'Auto-cancelled after 2 reschedules'
        };
        updateStatus(id, updates);
        await axios.put(`https://67e3e1e42ae442db76d2035d.mockapi.io/register/book/${id}`, updates);
        await notify(a.name, a.phone, `:x: Appointment automatically cancelled after 2 reschedules.`, false, doctorName);
        toast.success('Appointment automatically cancelled after 2 reschedules');
      } else {
        const updates = {
          date,
          time,
          rescheduleCount: a.rescheduleCount + 1
        };
        updateStatus(id, updates);
        await axios.put(`https://67e3e1e42ae442db76d2035d.mockapi.io/register/book/${id}`, updates);
        await notify(a.name, a.phone, `:calendar: Rescheduled to ${date} at ${time}`, false, doctorName);
        toast.success('Appointment rescheduled');
      }
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      toast.error('Failed to reschedule appointment');
    }
  };

  const handleDeleteRejected = (id) => {
    setAppointments(prev => prev.filter(a => a.id !== id));
    toast.success('Rejected appointment deleted');
  };

  const handlePatientNameClick = (patient) => {
    setSelectedPatient(patient);
    setIsModalOpen(true);
  };

  const displayTabs = !showOnlyPending;
  const displaySearchBar = !showOnlyPending;
  const displayFilters = !showOnlyPending;

  const getRowClassName = (row) => {
    if (row.status === 'Confirmed') {
      return 'bg-green-100 hover:bg-green-200';
    }
    return '';
  };

  const columns = [
    {
      header: 'Name',
      accessor: 'name',
      cell: row => (
        <button
          onClick={() => handlePatientNameClick(row)}
          className="font-bold text-black"
        >
          {row.name}
        </button>
      )
    },
    { header: 'Date', accessor: 'date' },
    { header: 'Time', accessor: 'time' },
    ...(tab !== 'rejected' ? [{ header: 'Reason', accessor: 'reason' }] : []),
    {
      header: tab === 'rejected' ? 'Rejection Reason' : 'Type',
      accessor: tab === 'rejected' ? 'rejectReason' : 'type',
      cell: row => tab === 'rejected'
        ? <span className="text-red-600 font-medium flex items-center"><X size={14} className="mr-1" />{row.rejectReason || 'No reason given'}</span>
        : row.type
    },
    {
      header: 'Action',
      accessor: 'action',
      cell: row => tab === 'pending' ? (
        <div className="flex">
          <button onClick={() => handleAccept(row.id)} className="view-btn flex items-center justify-center hover:bg-blue-100 rounded p-1 transition hover:animate-bounce">
            <Check size={14} />
          </button>
          <button onClick={() => setRejectId(row.id)} className="delete-btn ms-2 flex items-center justify-center hover:bg-red-100 rounded p-1 transition hover:animate-bounce">
            <X size={14} />
          </button>
        </div>
      ) : tab === 'confirmed' ? (
        <div className="flex">
          <button onClick={() => setRescheduleId(row.id)} className="edit-btn flex items-center justify-center hover:bg-blue-100 rounded p-1 transition hover:animate-bounce">
            <Calendar size={14} />
          </button>
          <button onClick={() => setRejectId(row.id)} className="delete-btn flex items-center justify-center ms-2 hover:bg-red-100 rounded p-1 transition hover:animate-bounce">
            <X size={14} />
          </button>
        </div>
      ) : (
        <button onClick={() => handleDeleteRejected(row.id)} className="delete-btn flex items-center justify-center ms-2 hover:bg-red-100 rounded p-1 transition hover:animate-bounce">
          <Trash2 size={14} />
        </button>
      )
    }
  ];

  const typeOptions = Array.from(new Set(tabFiltered.map(a => a.type))).map(t => ({ label: t, value: t }));
  const filters = [
    { key: 'type', label: 'Type', options: typeOptions }
  ];

  const reschedulingAppointment = rescheduleId
    ? appointments.find(a => a.id === rescheduleId)
    : null;

  const viewFields = [
    { key: 'name', label: 'Name', initialsKey: true, titleKey: true },
    { key: 'email', label: 'Email', subtitleKey: true },
    { key: 'phone', label: 'Phone' },
    { key: 'date', label: 'Appointment Date' },
    { key: 'time', label: 'Appointment Time' },
    { key: 'reason', label: 'Reason' },
    { key: 'specialty', label: 'Specialty' },
    { key: 'type', label: 'Type' },
    { key: 'status', label: 'Status' },
    ...(tab === 'rejected' ? [{ key: 'rejectReason', label: 'Rejection Reason' }] : [])
  ];

  if (loading) {
    return <div className="p-6">Loading appointments...</div>;
  }

  return (
    <div>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <div className={isOverview ? "p-0" : "p-2 sm:p-4 md:p-6"}>
        {!showOnlyPending && !isOverview && <h4 className=""></h4>}
        <DynamicTable
          columns={columns}
          data={filteredData}
          filters={displayFilters ? filters : []}
          tabs={displayTabs ? TABS : []}
          activeTab={tab}
          onTabChange={setTab}
          showSearchBar={displaySearchBar}
          rowClassName={getRowClassName}
          showPagination={!isOverview}
        />
      </div>

      <ReusableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode="viewProfile"
        title="Patient Details"
        data={selectedPatient || {}}
        viewFields={viewFields}
        size="md"
      />

      {(rejectId || rescheduleId) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--color-surface)] rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">
              {rejectId ? 'Reject' : 'Reschedule'} Appointment
            </h2>
            {rejectId ? (
              <>
                <textarea
                  className="input-field w-full p-2 border rounded"
                  rows={3}
                  placeholder="Reason for rejection"
                  value={reasons[rejectId] || ''}
                  onChange={e => setReasons(p => ({ ...p, [rejectId]: e.target.value }))}
                />
                <div className="flex justify-end gap-2 mt-4">
                  <button onClick={() => setRejectId(null)} className="view-btn px-4 py-2">Close</button>
                  <button onClick={() => handleReject(rejectId)} className="delete-btn px-4 py-2">Reject</button>
                </div>
              </>
            ) : (
              <>
                {reschedulingAppointment && reschedulingAppointment.rescheduleCount < 2 && (
                  <p className="text-yellow-600 mb-4 text-sm">
                    Note: After the second reschedule, the appointment will be automatically rejected.
                  </p>
                )}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input
                    type="date"
                    value={reschedule.date}
                    onChange={e => setReschedule({ ...reschedule, date: e.target.value })}
                    className="input-field w-full p-2 border rounded"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Time</label>
                  <input
                    type="time"
                    value={reschedule.time}
                    onChange={e => setReschedule({ ...reschedule, time: e.target.value })}
                    className="input-field w-full p-2 border rounded"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setRescheduleId(null)} className="view-btn px-4 py-2">Cancel</button>
                  <button onClick={() => handleReschedule(rescheduleId)} className="edit-btn px-4 py-2">Reschedule</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;