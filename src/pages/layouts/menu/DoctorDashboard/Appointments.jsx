import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DynamicTable from '../../../../components/microcomponents/DynamicTable';
import { useSelector } from 'react-redux';
import ReusableModal from '../../../../components/microcomponents/Modal';
import { Check, X, Calendar, Trash2 } from 'lucide-react';
import {
  getPendingAppointmentsByDoctorId,
  getConfirmedAppointmentsByDoctorId,
  getRejectedAppointmentsByDoctorId,
  getRescheduledAppointmentsByDoctorId,
  confirmAppointment,
  rejectAppointment,
  rescheduleAppointment,
} from '../../../../utils/CrudService';
import { getDoctorAvailabilityByDate } from '../../../../utils/masterService';

const TABS = [
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Rescheduled', value: 'rescheduled' },
  { label: 'Rejected', value: 'rejected' }
];

const toDateObject = (value) => {
  if (!value) return null;
  if (Array.isArray(value) && value.length >= 3) {
    const [year, month, day] = value;
    const date = new Date(year, (month ?? 1) - 1, day);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  if (typeof value === 'string') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return null;
};

const formatDateValue = (value) => {
  const dateObj = toDateObject(value) || toDateObject(`${value}`);
  if (!dateObj) return value || '';
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatTimeValue = (value) => {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value) && value.length >= 2) {
    const [hours = 0, minutes = 0] = value;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    const timeMatch = trimmed.match(/^(\d{1,2}):?(\d{2})?(?::\d{2})?(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?$/);
    if (timeMatch) {
      let [_, hours, minutes = '00'] = timeMatch;
      hours = parseInt(hours, 10) % 24;
      return `${String(hours).padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    }
    const date = new Date(trimmed);
    if (!isNaN(date.getTime())) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    }
  }
  if (value instanceof Date && !isNaN(value.getTime())) {
    return value.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }
  return '';
};

const toTimeParts = (value) => {
  if (Array.isArray(value) && value.length >= 1) {
    return {
      hours: Number(value[0]) || 0,
      minutes: Number(value[1]) || 0,
    };
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    const timeMatch = trimmed.match(/^(\d{1,2}):?(\d{2})?$/);
    if (timeMatch) {
      const hours = parseInt(timeMatch[1], 10) % 24;
      const minutes = parseInt(timeMatch[2] || '0', 10);
      return { hours, minutes };
    }
  }
  return null;
};

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

const formatTimeForAPI = (timeStr) => {
  if (!timeStr) return '';
  if (/^\d{2}:\d{2}$/.test(timeStr)) {
    return timeStr;
  }
  const timeParts = toTimeParts(timeStr);
  if (timeParts) {
    return `${String(timeParts.hours).padStart(2, '0')}:${String(timeParts.minutes).padStart(2, '0')}`;
  }
  return timeStr;
};

const findClosestSlot = (timeStr, slots) => {
  if (!timeStr || !slots.length) return null;
  const targetTime = toTimeParts(timeStr);
  if (!targetTime) return null;
  const targetMinutes = targetTime.hours * 60 + targetTime.minutes;
  let closestSlot = null;
  let minDiff = Infinity;
  slots.forEach(slot => {
    const slotTime = toTimeParts(slot.time);
    if (!slotTime) return;
    const slotMinutes = slotTime.hours * 60 + slotTime.minutes;
    const diff = Math.abs(slotMinutes - targetMinutes);
    if (diff < minDiff) {
      minDiff = diff;
      closestSlot = slot;
    }
  });
  return closestSlot;
};

const DoctorAppointments = ({ showOnlyPending = false, isOverview = false }) => {
  const user = useSelector((state) => state.auth.user);
  const [appointments, setAppointments] = useState([]);
  const [tab, setTab] = useState(showOnlyPending ? 'pending' : 'pending');
  const [loading, setLoading] = useState(true);
  const [rejectId, setRejectId] = useState(null);
  const [rescheduleId, setRescheduleId] = useState(null);
  const [reasons, setReasons] = useState({});
  const [reschedule, setReschedule] = useState({
    date: formatDateValue(new Date()),
    time: '',
    slotId: null
  });
  const [doctorName, setDoctorName] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [currentSlotPage, setCurrentSlotPage] = useState(0);
  const SLOTS_PER_PAGE = 9;
  const navigate = useNavigate();

  const getPaginatedSlots = () => {
    const startIndex = currentSlotPage * SLOTS_PER_PAGE;
    return availableSlots.slice(startIndex, startIndex + SLOTS_PER_PAGE);
  };

  const totalSlotPages = Math.ceil(availableSlots.length / SLOTS_PER_PAGE);

  const handlePrevPage = () => {
    if (currentSlotPage > 0) {
      setCurrentSlotPage(currentSlotPage - 1);
    }
  };

  const handleNextPage = () => {
    if ((currentSlotPage + 1) * SLOTS_PER_PAGE < availableSlots.length) {
      setCurrentSlotPage(currentSlotPage + 1);
    }
  };

  const fetchAvailableSlots = async (date) => {
    if (!date || !user?.doctorId) {
      setAvailableSlots([]);
      setCurrentSlotPage(0);
      return;
    }
    try {
      setLoadingSlots(true);
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5);
      const isToday = date === formatDateValue(now);

      const response = await getDoctorAvailabilityByDate(user.doctorId, date);
      const availabilityData = response?.data || {};
      const selectedDateAvailability = availabilityData.availability?.find(
        avail => avail.date === date
      );
      if (selectedDateAvailability?.times?.length) {
        const filteredSlots = selectedDateAvailability.times
          .filter(slot => {
            if (!isToday) return true;
            return slot.time >= currentTime;
          })
          .sort((a, b) => a.time.localeCompare(b.time))
          .map((slot, index) => ({
            id: slot.slotId?.toString() || `slot-${index}`,
            time: slot.time,
            slotId: slot.slotId?.toString() || `slot-${index}`,
            startTime: slot.time,
            endTime: slot.time,
            isAvailable: true
          }));
        setAvailableSlots(filteredSlots);
        setCurrentSlotPage(0);

        if (filteredSlots.length === 0 && isToday) {
          toast.info('No more available slots for today. Please try another day.');
        }
      } else {
        const message = isToday
          ? 'No available slots for today. Please select another date.'
          : 'No availability for the selected date. Please choose another date.';
        toast.info(message);
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error('Error fetching available slots:', error);
      toast.error('Failed to load available time slots');
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    if (reschedule.date) {
      fetchAvailableSlots(reschedule.date);
    } else {
      setAvailableSlots([]);
    }
  }, [reschedule.date]);

  useEffect(() => {
    const fetchDoctorName = async () => {
      if (!user) return;
      const firstName = user.firstName || '';
      const lastName = user.lastName || '';
      const baseName = `${firstName} ${lastName}`.trim() || user.name || '';
      if (!baseName) return;
      const formattedDoctorName = baseName.startsWith('Dr.') ? baseName : `Dr. ${baseName}`;
      setDoctorName(formattedDoctorName);
    };
    fetchDoctorName();
  }, [user]);

  const fetchAppointments = useCallback(async () => {
    const doctorId = user?.doctorId;
    if (!doctorId) {
      console.warn('Doctor ID not found for logged-in user.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      let response;

      switch(tab) {
        case 'rescheduled':
          response = await getRescheduledAppointmentsByDoctorId(doctorId);
          break;
        case 'confirmed':
          response = await getConfirmedAppointmentsByDoctorId(doctorId);
          break;
        case 'rejected':
          response = await getRejectedAppointmentsByDoctorId(doctorId);
          break;
        case 'pending':
        default:
          response = await getPendingAppointmentsByDoctorId(doctorId);
      }
      const appointmentsData = Array.isArray(response.data)
        ? response.data
        : response.data?.data ?? [];
      const mappedAppointments = appointmentsData.map((appointment) => {
        const patient = appointment.patient || appointment.patientDetails || appointment.patientInfo || {};
        const schedule = appointment.schedule || appointment.slot || {};
        const createdAt = appointment.createdAt || appointment.updatedAt || appointment.appointmentDateTime || appointment.created_at || null;
        const derivedDoctorName = appointment.doctorName || doctorName || (user?.name ? `Dr. ${user.name}` : '');
        const nameFromParts = [patient.firstName, patient.middleName, patient.lastName]
          .filter(Boolean)
          .join(' ');
        const rawDate = appointment.date ?? appointment.appointmentDate ?? schedule.date ?? '';
        const rawTime = appointment.time ?? appointment.appointmentTime ?? schedule.time ?? '';
        const appointmentNotes = appointment.notes || appointment.note || appointment.reason || appointment.symptoms || appointment.complaint || '';
        const specializationName = appointment.specializationName || appointment.specialization || appointment.specialty || (appointment.specializationDetails?.name ?? appointment.specializationDetails?.specialization ??
          (appointment.specializationInfo?.name ?? appointment.specializationInfo?.specialization) ?? '');
        const consultationType = appointment.consultationType || appointment.type || schedule.consultationType || appointment.mode || 'Unknown';
        const status = appointment.status === 'Upcoming' ? 'Pending' : appointment.status ?? 'Pending';
        const formattedDate = formatDateValue(rawDate);
        const formattedTime = formatTimeValue(rawTime);
        let sortTimestamp = null;
        if (createdAt) {
          const createdMs = new Date(createdAt).getTime();
          if (!Number.isNaN(createdMs)) {
            sortTimestamp = createdMs;
          }
        }
        if (sortTimestamp === null) {
          const dateObj = toDateObject(rawDate);
          const timeParts = toTimeParts(rawTime);
          if (dateObj) {
            const dateTime = new Date(dateObj);
            if (timeParts) {
              dateTime.setHours(timeParts.hours ?? 0, timeParts.minutes ?? 0, 0, 0);
            }
            const candidate = dateTime.getTime();
            if (!Number.isNaN(candidate)) {
              sortTimestamp = candidate;
            }
          }
        }
        if (sortTimestamp === null) {
          sortTimestamp = Date.now();
        }
        return {
          id: appointment.id ?? appointment.appointmentId ?? appointment.bookingId ?? `${Date.now()}-${Math.random()}`,
          name: appointment.patientName || patient.name || nameFromParts || 'Unknown',
          email: appointment.patientEmail ?? patient.email ?? '',
          phone: appointment.patientPhoneNumber ?? patient.phone ?? 'N/A',
          date: formattedDate,
          time: formattedTime,
          reason: appointmentNotes,
          specialty: specializationName,
          consultationType,
          type: consultationType,
          doctorName: derivedDoctorName,
          status,
          prescription: appointment.prescription ?? '',
          link: appointment.link ?? appointment.meetingLink ?? '',
          rejectReason: appointment.rejectReason
            ?? appointment.rejectionReason
            ?? appointment.reason
            ?? '',
          linkSent: appointment.linkSent ?? false,
          rescheduleCount: appointment.rescheduleCount ?? 0,
          rawNotes: appointmentNotes,
          rawSpecialization: specializationName,
          createdAt,
          rawDate,
          rawTime,
          sortTimestamp,
        };
      });
      const sortedAppointments = [...mappedAppointments].sort((a, b) => (b.sortTimestamp ?? 0) - (a.sortTimestamp ?? 0));
      setAppointments(sortedAppointments);
    } catch (error) {
      console.error('Error fetching appointments by doctor:', error);
      toast.error('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  }, [user?.doctorId, doctorName, tab]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  useEffect(() => {
    localStorage.setItem('appointments', JSON.stringify(appointments));
  }, [appointments]);

  const tabFiltered = React.useMemo(() => {
    return appointments.filter(a => {
      const status = a.status?.toLowerCase() || '';
      switch(tab) {
        case 'pending':
          return ['pending', 'upcoming'].includes(status);
        case 'rescheduled':
          return (a.rescheduleCount > 0) || status === 'rescheduled';
        case 'rejected':
          return status === 'rejected';
        case 'confirmed':
          return status === 'confirmed';
        default:
          return true;
      }
    });
  }, [appointments, tab]);

  const getDisplayData = () => {
    if (isOverview && showOnlyPending) {
      const pendingAppointments = appointments.filter(a =>
        ['pending', 'upcoming'].includes(a.status.toLowerCase())
      );
      return pendingAppointments.slice(0, 4);
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
      const currentDate = new Date();
      const formattedDate = currentDate.toISOString().split('T')[0];
      const formattedTime = currentDate.toTimeString().slice(0, 5);
      const transferToast = toast.loading('Processing appointment...', { autoClose: false });
      const isVirtual = (appt.consultationType || '').toLowerCase() === 'virtual';
      const consultationType = isVirtual ? 'VIRTUAL' : 'PHYSICAL';
      const targetTab = isVirtual ? 'Virtual' : 'OPD';
      const confirmed = {
        ...appt,
        status: 'Confirmed',
        confirmedAt: currentDate.toISOString(),
        confirmedDate: formattedDate,
        confirmedTime: formattedTime,
        doctorName,
        isVisible: false,
        type: consultationType
      };
      updateStatus(id, confirmed);
      try {
        await confirmAppointment(id, {
          consultationType,
          status: 'CONFIRMED'
        });
      } catch (confirmError) {
        console.error('Error confirming appointment:', confirmError);
        throw new Error(`Failed to confirm appointment: ${confirmError.response?.data?.message || confirmError.message}`);
      }
      await notify(
        appt.name,
        appt.phone,
        `✅ Appointment confirmed with ${doctorName} on ${formattedDate} at ${formattedTime}.`,
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
        appointmentDate: formattedDate,
        appointmentTime: formattedTime,
        originalAppointmentDate: appt.date,
        originalAppointmentTime: appt.time,
        type: consultationType,
        consultationType: consultationType,
        isVisible: true,
        consultationStarted: false,
        consultationCompleted: false,
        prescription: '',
        advice: '',
        movedDate: currentDate.toISOString(),
        confirmedAt: currentDate.toISOString(),
        updatedAt: currentDate.toISOString()
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
      localStorage.setItem("highlightPatientId", response.data.id.toString());
      localStorage.setItem("targetPatientTab", targetTab);
      localStorage.setItem("appointmentAccepted", "true");
      localStorage.setItem("acceptedAppointmentType", consultationType);
      navigate('/doctordashboard/patients', {
        state: {
          highlightId: response.data.id,
          tab: targetTab,
          autoNavigated: true,
          appointmentType: consultationType,
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
    if (!reason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    const appointment = appointments.find(x => x.id === id);
    if (!appointment) {
      toast.error('Appointment not found');
      return;
    }
    try {
      const updates = {
        status: 'Rejected',
        rejectReason: reason,
        updatedAt: new Date().toISOString()
      };
      updateStatus(id, updates);
      await rejectAppointment(id, {
        rejectReason: reason,
        status: 'REJECTED',
        consultationType: (appointment.consultationType || '').toUpperCase() || 'PHYSICAL'
      });
      await notify(
        appointment.name,
        appointment.phone,
        `❌ Your appointment has been rejected.\nReason: ${reason}`,
        false,
        doctorName
      );
      toast.success('Appointment rejected successfully');
      setRejectId(null);
      setReasons(prev => {
        const newReasons = {...prev};
        delete newReasons[id];
        return newReasons;
      });
    } catch (error) {
      console.error('Error rejecting appointment:', error);
      updateStatus(id, { status: appointment.status });
      toast.error(error.response?.data?.message || 'Failed to reject appointment');
    }
  };

  const handleReschedule = async (id) => {
    const { date, time, slotId } = reschedule;
    if (!date || !time || !slotId) {
      toast.error('Please select both date and time');
      return;
    }
    const appointment = appointments.find(x => x.id === id);
    if (!appointment) {
      toast.error('Appointment not found');
      return;
    }
    const currentRescheduleCount = appointment.rescheduleCount || 0;
    const MAX_RESCHEDULES = 2;
    if (currentRescheduleCount >= MAX_RESCHEDULES) {
      try {
        const rejectReason = 'Maximum reschedule attempts reached';
        await rejectAppointment(id, {
          rejectReason,
          status: 'REJECTED',
          consultationType: (appointment.consultationType || '').toUpperCase() === 'VIRTUAL' ? 'VIRTUAL' : 'PHYSICAL'
        });
        updateStatus(id, {
          status: 'Rejected',
          rejectReason,
          rescheduleCount: currentRescheduleCount,
          updatedAt: new Date().toISOString()
        });
        await notify(
          appointment.name,
          appointment.phone,
          `❌ Your appointment has been automatically rejected as it has been rescheduled the maximum number of times.`,
          false,
          doctorName
        );
        setRescheduleId(null);
        setReschedule({ date: formatDateValue(new Date()), time: '', slotId: null });
        setAvailableSlots([]);
        toast.warning('Appointment automatically rejected - maximum reschedule attempts reached');
        fetchAppointments();
        return;
      } catch (error) {
        console.error('Error auto-rejecting appointment:', error);
        const errorMessage = error.response?.data?.message || 'Failed to process reschedule limit';
        toast.error(errorMessage);
        return;
      }
    }
    try {
      const loadingToast = toast.loading('Rescheduling appointment...');
      const consultationType = (appointment.consultationType || '').toUpperCase() === 'VIRTUAL' ? 'VIRTUAL' : 'PHYSICAL';
      const rescheduleData = {
        consultationType,
        newSlotId: slotId,
        newDate: formatDateValue(date),
        newTime: formatTimeForAPI(time),
        status: 'RESCHEDULED'
      };
      await rescheduleAppointment(id, rescheduleData);
      const newRescheduleCount = currentRescheduleCount + 1;
      const updates = {
        date: formatDateValue(date),
        time: formatTimeValue(time),
        rescheduleCount: newRescheduleCount,
        status: 'Rescheduled',
        slotId: slotId,
        updatedAt: new Date().toISOString(),
        consultationType
      };
      updateStatus(id, updates);
      await notify(
        appointment.name,
        appointment.phone,
        `✅ Your appointment has been rescheduled to ${formatDateValue(date)} at ${formatTimeValue(time)}. ` +
        `(Reschedule ${newRescheduleCount} of ${MAX_RESCHEDULES})`,
        false,
        doctorName
      );
      setRescheduleId(null);
      setReschedule({ date: formatDateValue(new Date()), time: '', slotId: null });
      setAvailableSlots([]);
      toast.update(loadingToast, {
        render: `Appointment rescheduled successfully (${newRescheduleCount}/${MAX_RESCHEDULES} reschedules used)`,
        type: 'success',
        isLoading: false,
        autoClose: 3000
      });
      fetchAppointments();
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      const errorMessage = error.response?.data?.message || 'Failed to reschedule appointment';
      toast.error(errorMessage);
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
  const displayFilters = !showOnlyPending && tab !== 'rescheduled';

  const getRowClassName = (row) => {
    if (row.status === 'Confirmed') {
      return 'bg-green-100 hover:bg-green-200';
    }
    if (row.status === 'Rejected') {
      return 'bg-red-100 hover:bg-red-200';
    }
    if (row.status === 'Rescheduled' || (row.rescheduleCount || 0) > 0) {
      return 'bg-blue-50 hover:bg-blue-100';
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
          className="font-bold text-black hover:text-blue-600 transition-colors text-left"
        >
          {row.name}
        </button>
      )
    },
    {
      header: 'Date',
      accessor: 'date',
      cell: row => row.date ? formatDateValue(row.date) : 'N/A'
    },
    {
      header: 'Time',
      accessor: 'time',
      cell: row => row.time ? formatTimeValue(row.time) : 'N/A'
    },
    ...(tab !== 'rejected' && tab !== 'rescheduled'
      ? [{
          header: 'Reason',
          accessor: 'reason',
          cell: row => (
            <div className="max-w-xs truncate" title={row.reason}>
              {row.reason || 'N/A'}
            </div>
          )
        }]
      : []),
    {
      header: tab === 'rejected' ? 'Rejection Reason' : tab === 'rescheduled' ? 'Reschedule Count' : 'Type',
      accessor: tab === 'rejected' ? 'rejectReason' : tab === 'rescheduled' ? 'rescheduleCount' : 'type',
      cell: row => {
        if (tab === 'rejected') {
          return <span className="text-red-600 font-medium flex items-center"><X size={14} className="mr-1" />{row.rejectReason || 'No reason given'}</span>;
        } else if (tab === 'rescheduled') {
          return <span className="text-blue-600 font-medium">Rescheduled {row.rescheduleCount} time(s)</span>;
        }
        return row.type;
      }
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: row => {
        const isRescheduled = (row.rescheduleCount || 0) > 0;
        const canReschedule = (row.rescheduleCount || 0) < 2;

        if (tab === 'pending') {
          return (
            <div className="flex space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAccept(row.id);
                }}
                className="p-1.5 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                title="Accept Appointment"
              >
                <Check size={16} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setRejectId(row.id);
                  setReasons(prev => ({
                    ...prev,
                    [row.id]: prev[row.id] || ''
                  }));
                }}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                title="Reject Appointment"
              >
                <X size={16} />
              </button>
            </div>
          );
        }

        if (tab === 'confirmed') {
          return (
            <div className="flex items-center space-x-2">
              {isRescheduled && (
                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                  {row.rescheduleCount}/2
                </span>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setRescheduleId(row.id);
                  setReschedule({
                    date: row.date,
                    time: row.time,
                    slotId: row.slotId
                  });
                }}
                disabled={!canReschedule}
                className={`p-1.5 rounded-full transition-colors ${
                  canReschedule
                    ? 'text-blue-600 hover:bg-blue-50 hover:animate-pulse'
                    : 'text-gray-400 cursor-not-allowed'
                }`}
                title={canReschedule ? 'Reschedule' : 'Maximum reschedule attempts reached'}
              >
                <Calendar size={16} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setRejectId(row.id);
                  setReasons(prev => ({
                    ...prev,
                    [row.id]: prev[row.id] || ''
                  }));
                }}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                title="Reject Appointment"
              >
                <X size={16} />
              </button>
            </div>
          );
        }

        if (tab === 'rescheduled') {
          return (
            <div className="flex space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setRescheduleId(row.id);
                  setReschedule({
                    date: row.date,
                    time: row.time,
                    slotId: row.slotId
                  });
                }}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                title="Reschedule Again"
              >
                <Calendar size={14} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setRejectId(row.id);
                  setReasons(prev => ({
                    ...prev,
                    [row.id]: prev[row.id] || ''
                  }));
                }}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                title="Reject Appointment"
              >
                <X size={14} />
              </button>
            </div>
          );
        }

        if (tab === 'rejected') {
          return (
            <button
              onClick={() => handleDeleteRejected(row.id)}
              className="delete-btn flex items-center justify-center ms-2 hover:bg-red-100 rounded p-1 transition hover:animate-bounce"
            >
              <Trash2 size={14} />
            </button>
          );
        }
      }
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
    { key: 'consultationType', label: 'Consultation Type' },
    { key: 'specialty', label: 'Specialty' },
    { key: 'reason', label: 'Notes / Reason' },
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
                <div className="mb-4">
                  <label className="block mb-2">Select Date</label>
                  <input
                    type="date"
                    className="input-field w-full p-2 border rounded"
                    value={reschedule.date}
                    min={formatDateValue(new Date())}
                    onChange={(e) => {
                      setReschedule({ ...reschedule, date: e.target.value, time: '', slotId: null });
                    }}
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-2">Select Time</label>
                  {loadingSlots ? (
                    <div className="p-2 text-center text-gray-500">Loading available slots...</div>
                  ) : availableSlots.length > 0 ? (
                    <div>
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        {getPaginatedSlots().map((slot) => (
                          <button
                            key={slot.id}
                            type="button"
                            className={`p-2 border rounded text-sm ${
                              reschedule.time === slot.time
                                ? 'bg-blue-500 text-white border-blue-600'
                                : 'bg-white hover:bg-gray-50 border-gray-300'
                            } transition-colors duration-150`}
                            onClick={() => {
                              setReschedule({
                                ...reschedule,
                                time: slot.time,
                                slotId: slot.id
                              });
                            }}
                          >
                            {slot.time}
                          </button>
                        ))}
                      </div>
                      {totalSlotPages > 1 && (
                        <div className="flex justify-between items-center mt-2">
                          <button
                            type="button"
                            onClick={handlePrevPage}
                            disabled={currentSlotPage === 0}
                            className={`px-3 py-1 text-sm rounded ${
                              currentSlotPage === 0
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                            }`}
                          >
                            Previous
                          </button>
                          <span className="text-sm text-gray-600">
                            Page {currentSlotPage + 1} of {totalSlotPages}
                          </span>
                          <button
                            type="button"
                            onClick={handleNextPage}
                            disabled={(currentSlotPage + 1) * SLOTS_PER_PAGE >= availableSlots.length}
                            className={`px-3 py-1 text-sm rounded ${
                              (currentSlotPage + 1) * SLOTS_PER_PAGE >= availableSlots.length
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                            }`}
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-2 text-center text-gray-500">
                      {reschedule.date ? 'No available slots for this date' : 'Please select a date first'}
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => setRescheduleId(null)}
                    className="view-btn px-4 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleReschedule(rescheduleId)}
                    className="edit-btn px-4 py-2"
                    disabled={!reschedule.date || !reschedule.time || !reschedule.slotId}
                  >
                    Reschedule
                  </button>
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
