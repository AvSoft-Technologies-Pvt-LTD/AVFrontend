import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Pencil, Users, UserPlus, Video, UserCheck, ChevronRight, Mail, GraduationCap, Edit3 } from 'lucide-react';
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from 'react-redux';
import DoctorAppointments from "./Appointments";
import { motion } from "framer-motion";
import { getDoctorById, getDoctorPhoto } from '../../../../utils/masterService';

const Overview = () => {
  const user = useSelector((state) => state.auth.user);
  const [doctor, setDoctor] = useState(null);
  const [stats, setStats] = useState({ totalPatients: 0, opdPatients: 0, ipdPatients: 0, virtualPatients: 0 });
  const [appointments, setAppointments] = useState([]);
  const [revenue, setRevenue] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const navigate = useNavigate();
  const pendingAppointments = appointments.filter(appt => appt.status === 'Pending');
  const recentPendingAppointments = pendingAppointments.slice(0, 4);

  useEffect(() => {
    (async () => {
      if (!user?.doctorId) {
        setError('Doctor ID not found in Redux store.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Fetch doctor data using doctorId from Redux
        const doctorRes = await getDoctorById(user.doctorId);
        const doctorData = doctorRes.data;
        if (!doctorData) throw new Error('Doctor not found');

        // Fetch doctor photo
        let photoUrl = '';
        if (doctorData.photo) {
          const photoRes = await getDoctorPhoto(doctorData.photo);
          photoUrl = URL.createObjectURL(photoRes.data);
        }

        // Fetch patients and calculate stats
        const patientsRes = await axios.get('https://681f2dfb72e59f922ef5774c.mockapi.io/addpatient');
        const allPatients = patientsRes.data;
        const doctorPatients = allPatients.filter(patient => patient.doctorId === user.doctorId);
        const patientStats = {
          totalPatients: doctorPatients.length,
          opdPatients: doctorPatients.filter(p => p.patientType?.toLowerCase().includes('opd')).length,
          ipdPatients: doctorPatients.filter(p => p.patientType?.toLowerCase().includes('ipd')).length,
          virtualPatients: doctorPatients.filter(p => p.patientType?.toLowerCase().includes('virtual')).length,
        };

        // Fetch appointments and revenue (replace with your actual endpoints)
        // const appointmentsRes = await axios.get(`/api/appointments?doctorId=${user.doctorId}`);
        // const revenueRes = await axios.get(`/api/revenue?doctorId=${user.doctorId}`);

        const formattedDoctor = {
          name: `${doctorData.firstName} ${doctorData.lastName}`,
          specialty: doctorData.specialization,
          qualifications: doctorData.qualification,
          registrationId: doctorData.registrationNumber,
          email: doctorData.email,
          photo: photoUrl,
        };

        setDoctor(formattedDoctor);
        setStats(patientStats);
        // setAppointments(appointmentsRes.data);
        // setRevenue(revenueRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [user?.doctorId]);

  const handleEditClick = () => navigate('/doctordashboard/settings');
  const calculateRevenueBreakdown = (payments) => {
    const groups = {};
    const colors = {
      'Virtual Consultation': 'text-[var(--accent-color)]',
      'Physical Consultation': 'text-[var(--primary-color)]',
      'IPD Treatment': 'text-[var(--primary-color)]',
      'OPD Treatment': 'text-[var(--primary-color)]',
      'Lab Tests': 'text-[var(--accent-color)]',
      'Other': 'text-[var(--primary-color)]',
    };
    payments.forEach(p => {
      const type = p.serviceType || 'Other';
      if (!groups[type]) groups[type] = { count: 0, amount: 0 };
      groups[type].count++;
      groups[type].amount += Number(p.amount);
    });
    return Object.entries(groups).map(([type, data]) => ({
      type,
      count: data.count,
      amount: data.amount,
      color: colors[type] || 'text-[var(--primary-color)]',
    }));
  };
  const getIconBgClass = (type) => {
    if (!type) return "bg-[var(--primary-color)]";
    const t = type.toLowerCase();
    if (t.includes("virtual") || t.includes("lab")) return "bg-[var(--accent-color)]";
    return "bg-[var(--primary-color)]";
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent-color)]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--primary-color)]-50">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-[var(--primary-color)]-50 p-2 sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
    >
      {/* Main Container: Flex Layout for Profile and Stats */}
      <div className="flex flex-col lg:flex-row gap-6 mb-6">
        <div className="w-full lg:w-[70%] bg-[var(--color-surface)] rounded-xl shadow-md p-4">
          {/* Top Section */}
          <div className="flex justify-between items-start">
            {/* Left Section: Profile Image & Name */}
            <div className="flex items-center gap-4">
              <img
                src={doctor.photo}
                alt={doctor.name}
                className="w-24 h-24 rounded-full border-3 border-white shadow-md"
              />
              <div>
                <h2 className="text-xl font-bold text-gray-900">{doctor.name}</h2>
                <p className="text-gray-500 text-sm">{doctor.specialty}</p>
              </div>
            </div>
            {/* Edit Icon */}
            <button onClick={handleEditClick} className="bg-green-500 text-white rounded-full p-2 shadow-md hover:bg-green-600 transition">
              <Edit3 size={20} />
            </button>
          </div>
          {/* Details Section */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <GraduationCap className="text-gray-400" size={22} />
              <div>
                <p className="text-gray-500 text-sm">Qualification</p>
                <p className="text-gray-900 font-semibold">{doctor.qualifications}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="text-gray-400" size={22} />
              <div>
                <p className="text-gray-500 text-sm">Email</p>
                <p className="text-gray-900 font-semibold">{doctor.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Edit3 className="text-gray-400" size={22} />
              <div>
                <p className="text-gray-500 text-sm">Reg No.</p>
                <p className="text-gray-900 font-semibold">{doctor.registrationId}</p>
              </div>
            </div>
          </div>
        </div>
        {/* Stats Cards (Right Side) */}
        <div className="w-full lg:w-[30%] grid grid-cols-2 gap-3">
          {[{
            label: "Total Patients",
            value: stats.totalPatients,
            icon: <Users size={18} className="text-[var(--primary-color)]" />,
            borderColor: "border-r-[3px] border-[var(--primary-color)]",
            textColor: "text-[var(--primary-color)]"
          }, {
            label: "OPD Patients",
            value: stats.opdPatients,
            icon: <UserPlus size={18} className="text-[var(--accent-color)]" />,
            borderColor: "border-r-[3px] border-[var(--accent-color)]",
            textColor: "text-[var(--accent-color)]"
          }, {
            label: "IPD Patients",
            value: stats.ipdPatients,
            icon: <UserCheck size={18} className="text-[var(--accent-color)]" />,
            borderColor: "border-r-[3px] border-[var(--accent-color)]",
            textColor: "text-[var(--accent-color)]"
          }, {
            label: "Virtual Patients",
            value: stats.virtualPatients,
            icon: <Video size={18} className="text-[var(--primary-color)]" />,
            borderColor: "border-r-[3px] border-[var(--primary-color)]",
            textColor: "text-[var(--primary-color)]"
          }].map((card, i) => (
            <Link key={card.label} to={`/doctordashboard/patients?tab=${card.label.split(" ")[0]}`} className="block">
              <motion.div
                className={`bg-white ${card.borderColor} p-2.5 rounded-lg shadow-sm hover:shadow-md min-h-[90px] text-center transition-shadow`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 + i * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center space-x-2">
                  <div className="p-1 rounded-full">
                    {card.icon}
                  </div>
                  <div>
                    <p className={`text-xs font-semibold truncate ${card.textColor}`}>{card.label}</p>
                    <h3 className={`text-lg font-bold mt-3 ${card.textColor}`}>{card.value.toLocaleString()}</h3>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
      {/* Rest of your layout (Appointments & Revenue) */}
      <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-6">
        {/* Appointments */}
        <motion.div
          className="bg-[var(--color-surface)] rounded-xl shadow-sm p-4"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold text-[var(--primary-color)] flex items-center gap-2">
              <Calendar className="text-[var(--accent-color)]" /> Recent Appointments
            </h4>
            <Link
              to="/doctordashboard/appointments"
              className="text-[var(--primary-color)] hover:text-[var(--accent-color)] font-medium flex items-center gap-1 text-sm"
            >
              View All <ChevronRight size={16} />
            </Link>
          </div>
          <DoctorAppointments showOnlyPending={true} isOverview={true} appointments={recentPendingAppointments} />
        </motion.div>
        {/* Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <div className="bg-[var(--primary-color)] text-[var(--color-surface)] p-3 rounded-t-lg mb-4">
            <h3 className="text-lg font-semibold">Revenue Generated</h3>
          </div>
          <div className="p-2">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-sm text-[var(--primary-color)]">Total Revenue</p>
                <h4 className="text-2xl font-bold text-[var(--primary-color)]">₹{revenue?.total?.toLocaleString()}</h4>
              </div>
              <Link
                to="/doctordashboard/billing"
                className="text-[var(--primary-color)] hover:text-[var(--accent-color)] font-medium flex items-center gap-1 text-sm"
              >
                View Billing <ChevronRight size={16} />
              </Link>
            </div>
            <div className="space-y-3">
              {(revenue?.breakdown?.slice(0, 3) || []).map((item, i) => {
                const Icon = item.type.includes("Virtual") ? Video : item.type.includes("Physical") ? UserCheck : Users;
                const isHovered = hoveredIndex === i;
                return (
                  <motion.div
                    key={item.type}
                    className={`bg-white rounded-lg p-3 shadow-sm ${isHovered ? 'ring-2 ring-[var(--accent-color)]' : ''}`}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.8 + i * 0.1 }}
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${getIconBgClass(item.type)}`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-[var(--primary-color)]">{item.type}</p>
                          <p className="text-xs text-gray-500">{item.count} consultations</p>
                        </div>
                      </div>
                      <p className="font-semibold text-[var(--primary-color)]">₹{item.amount.toLocaleString()}</p>
                    </div>
                    <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          width: `${(item.amount / revenue.total) * 100}%`,
                          backgroundColor: getIconBgClass(item.type).includes('accent') ? 'var(--accent-color)' : 'var(--primary-color)',
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.amount / revenue.total) * 100}%` }}
                        transition={{ duration: 1, delay: 0.9 + i * 0.1 }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Overview;
