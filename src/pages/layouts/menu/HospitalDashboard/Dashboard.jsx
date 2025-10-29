import React from 'react';
import {
  Calendar, Users, MapPin, Phone, Mail, Building2, Home, Hospital, BedDouble, Stethoscope, Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const stats = [
  { title: "Total Patients", value: 40, icon: <Users /> },
  { title: "Today's Appointments", value: 10, icon: <Calendar /> },
  { title: "Active IPD", value: 10, icon: <Building2 /> },
  { title: "Available Beds", value: 30, icon: <Home /> }
];

const infra = [
  { icon: <BedDouble />, label: 'Total Beds', value: 200, color: '#6BCB77', calc: 100 },
  { icon: <Activity />, label: 'ICU Beds', value: 40, color: '#FF6B6B', calc: 80 },
  { icon: <Building2 />, label: 'Ventilators', value: 15, color: '#4D96FF', calc: 75 },
  { icon: <Users />, label: 'Staff Count', value: 120, color: '#FFD93D', calc: 60 }
];

const payments = [
  { id: 'INV-2023-001', patient: 'Amit Kumar', amount: '₹12,500', status: 'Paid', date: '12/05/2023' },
  { id: 'INV-2023-002', patient: 'Priya Sharma', amount: '₹8,900', status: 'Pending', date: '15/05/2023' },
  { id: 'INV-2023-003', patient: 'Rahul Singh', amount: '₹15,200', status: 'Paid', date: '18/05/2023' },
  { id: 'INV-2023-004', patient: 'Sunita Patel', amount: '₹7,300', status: 'Overdue', date: '10/05/2023' }
];

const statusStyle = s =>
  s === 'Paid' ? 'bg-green-100 text-green-600' :
  s === 'Overdue' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600';

const borderClasses = ['card-border-primary', 'card-border-accent'];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <motion.div className="pt-6 space-y-8"
      initial="hidden" animate="visible" variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: 0.3 }
        }
      }}
    >

      {/* Top Info */}
      <motion.div className="bg-white rounded-xl shadow-lg p-6 relative"
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--accent-color)] opacity-20 rounded-bl-full" />
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-[var(--accent-color)] opacity-10 rounded-tr-full" />
        <div className="relative z-10 space-y-1">
          <h4 className="h4-heading">AV Swasthya Health Center</h4>
          <p className="flex items-center"><MapPin className="w-5 h-5 mr-2 text-[var(--accent-color)]" />123 Medical Plaza</p>
          <p className="flex items-center"><Phone className="w-5 h-5 mr-2 text-[var(--accent-color)]" />+91-1234567890</p>
          <p className="flex items-center"><Mail className="w-5 h-5 mr-2 text-[var(--accent-color)]" />contact@avswasthya.com</p>
        </div>
      </motion.div>

      {/* Stat Cards */}
     <motion.div
  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
  initial="hidden"
  animate="visible"
  variants={{
    visible: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  }}
>
  {stats.map((c, i) => (
    <motion.div
      key={i}
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ type: "spring", stiffness: 60 }}
      className={`card-stat ${borderClasses[i % borderClasses.length]} flex flex-col items-center justify-center min-h-[120px] p-5 hover:scale-105 transition-transform duration-300`}
    >
      <div className="card-icon card-icon-accent card-icon-white mb-2">
        {React.cloneElement(c.icon, { className: "w-7 h-7" })}
      </div>
      <div className="card-stat-count">{c.value}</div>
      <div className="card-stat-label">{c.title}</div>
    </motion.div>
  ))}
</motion.div>
      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Infrastructure */}
        <motion.div className="bg-white rounded-2xl shadow-2xl p-6 space-y-6"
          initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <h4 className="h4-heading flex items-center gap-3 mb-2">
            <Hospital className="w-6 h-6 text-[var(--accent-color)]" />Hospital Infrastructure Overview
          </h4>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Stethoscope className="w-5 h-5 text-[var(--accent-color)]" />
              <span className="paragraph">Departments</span>
            </div>
            <p className="paragraph">Cardiology, Neurology, Orthopedics, Pediatrics, Oncology</p>
          </div>
          {infra.map(({ icon, label, value, color, calc }, i) => (
            <div key={i}>
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">{icon}<span className="paragraph">{label}</span></div>
                <span className="paragraph">{value}</span>
              </div>
              <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(calc, 100)}%` }} transition={{ duration: 0.7, delay: i * 0.1 }}
                  style={{ backgroundColor: color }} className="h-full rounded-full" />
              </div>
            </div>
          ))}
        </motion.div>

        {/* Payments */}
        <motion.div className="bg-white rounded-xl shadow-2xl p-6 space-y-6"
          initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <div className="flex justify-between items-center">
            <h4 className="h4-heading font-bold">Recent Payments</h4>
            <button onClick={() => navigate('/hospitaldashboard/billing-payments')}
              className="text-[var(--accent-color)] hover:underline font-semibold paragraph">View All</button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="group relative bg-[var(--accent-color)] text-white rounded-2xl p-5 overflow-hidden shadow-lg hover:scale-105 transition-transform duration-300">
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/20 rounded-full blur-xl opacity-30 group-hover:scale-125" />
              <div className="text-sm font-medium tracking-wide">Total Payment</div>
              <div className="text-xl font-bold mt-1">₹43,900</div>
            </div>
            <div className="group relative bg-yellow-100 text-yellow-900 rounded-2xl p-5 overflow-hidden shadow-lg hover:scale-105 transition-transform duration-300">
              <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-yellow-300/40 rounded-full blur-xl opacity-30 group-hover:scale-125" />
              <div className="text-sm font-medium tracking-wide">Pending Payment</div>
              <div className="text-xl font-bold mt-1">₹8,900</div>
            </div>
            <div className="group relative bg-red-100 text-red-800 rounded-2xl p-5 overflow-hidden shadow-lg hover:scale-105 transition-transform duration-300">
              <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-red-400/40 rounded-full blur-xl opacity-30 group-hover:scale-125" />
              <div className="text-sm font-medium tracking-wide">Overdue Payment</div>
              <div className="text-xl font-bold mt-1">₹7,300</div>
            </div>
          </div>

          {/* Payments Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="text-left text-sm text-gray-600 border-b">
                  <th className="py-2">Invoice</th>
                  <th className="py-2">Patient</th>
                  <th className="py-2">Amount</th>
                  <th className="py-2">Date</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p, i) => (
                  <motion.tr key={p.id} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 + i * 0.1 }} className="border-b text-sm text-gray-700">
                    <td className="py-2">{p.id}</td>
                    <td className="py-2">{p.patient}</td>
                    <td className="py-2">{p.amount}</td>
                    <td className="py-2">{p.date}</td>
                    <td className="py-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyle(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
