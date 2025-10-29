

import { useState } from 'react';
import { TestTube2, Clock, Home, Building2, Microscope, Wallet, Phone, MapPin, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function Dashboard() {
const stats = [{ title: 'Total Tests', value: '1,245', icon: <TestTube2 size={24} />, iconClass: 'card-icon-accent', borderClass: 'card-border-accent', path: '/tests' }, { title: 'Pending Requests', value: '18', icon: <Clock size={24} />, iconClass: 'card-icon-primary', borderClass: 'card-border-primary', path: '/requests' }, { title: 'Home Visits', value: '24', icon: <Home size={24} />, iconClass: 'card-icon-accent', borderClass: 'card-border-accent', path: '/home-visits' }, { title: 'Lab Visits', value: '42', icon: <Building2 size={24} />, iconClass: 'card-icon-primary', borderClass: 'card-border-primary', path: '/lab-visits' }];
const todayVisits = [{ name: 'John Smith', time: '10:00 AM', type: 'Lab Visit', status: 'Completed', path: '/visit/1' }, { name: 'Maria Garcia', time: '11:30 AM', type: 'Home Sample', status: 'Pending', path: '/visit/2' }, { name: 'David Wilson', time: '2:00 PM', type: 'Lab Visit', status: 'In Progress', path: '/visit/3' }, { name: 'Sarah Johnson', time: '3:30 PM', type: 'Home Sample', status: 'Scheduled', path: '/visit/4' }];
const recentActivities = [{ title: 'New Test Results Available', description: 'Blood work results for Patient #12458', time: '2 minutes ago', icon: <TestTube2 className="text-[var(--color-surface)]" size={20} />, bg: 'bg-[var(--primary-color)]', border: 'border-[var(--primary-color)]', path: '/activity/test-results' }, { title: 'Payment Received', description: '₹2,500 from Patient #12445', time: '15 minutes ago', icon: <Wallet className="text-[var(--color-surface)]" size={20} />, bg: 'bg-[var(--accent-color)]', border: 'border-[var(--accent-color)]', path: '/activity/payment' }, { title: 'Home Sample Collection', description: 'Scheduled for Patient #12460', time: '30 minutes ago', icon: <Home className="text-[var(--color-surface)]" size={20} />, bg: 'bg-[var(--primary-color)]', border: 'border-[var(--primary-color)]', path: '/activity/home-collection' }];
const statusVariants = { Completed: { backgroundColor: "var(--primary-color)", color: "var(--color-surface)", scale: 1 }, Pending: { backgroundColor: "var(--accent-color)", color: "var(--primary-color)", scale: [1, 1.08, 1], transition: { repeat: Infinity, duration: 1 } }, "In Progress": { backgroundColor: "var(--primary-color)", color: "var(--color-surface)", scale: 1 }, Scheduled: { backgroundColor: "var(--primary-color)", color: "var(--color-surface)", scale: 1 } };
 return (
    <motion.div
      className="min-h-screen bg-[var(--primary-color)]-50 mt-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
    >
    <motion.header className="rounded-2xl text-[var(--primary-color)] sticky top-0 z-50 ms-5" initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.7, delay: 0.1 }}>
  <div className="max-w-5xl mx-auto rounded-2xl px-6 shadow-lg bg-[var(--color-surface)] me-4">
    <div className="py-4 border-b border-[var(--color-surface)]/10 flex items-center justify-between"><motion.div className="flex items-center space-x-4" whileHover={{ scale: 1.03 }} transition={{ type: 'spring', stiffness: 200 }}><motion.div className="bg-[var(--accent-color)] p-2 rounded-lg" whileHover={{ scale: 1.1, backgroundColor: 'var(--primary-color)' }} transition={{ type: 'spring', stiffness: 300 }}><Microscope className="text-[var(--color-surface)]" size={22} /></motion.div><div><h4 className="h4-heading pt-4">ABC Lab</h4><p className="paragraph text-sm">ISO 9001:2015 Certified</p></div></motion.div><motion.div className="text-right" initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.7, delay: 0.2 }}><p className="paragraph text-lg font-semibold">Dr. Rajesh Kumar</p><p className="paragraph text-sm">Laboratory Director, MD Pathology</p></motion.div></div>
    <div className="py-3 flex flex-wrap items-center justify-between gap-4"><div className="flex items-center space-x-6 text-[var(--primary-color)]/80"><motion.div className="flex items-center" whileHover={{ scale: 1.08 }}><MapPin size={16} className="text-[var(--accent-color)]" /><span className="ml-2 text-sm">123 Healthcare Avenue, Hyderabad</span></motion.div><motion.div className="flex items-center" whileHover={{ scale: 1.08 }}><Phone size={16} className="text-[var(--accent-color)]" /><span className="ml-2 text-sm">+91 98765-43210</span></motion.div><motion.div className="flex items-center" whileHover={{ scale: 1.08 }}><Mail size={16} className="text-[var(--accent-color)]" /><span className="ml-2 text-sm">info@avdiagnostics.com</span></motion.div></div>
    <div className="flex space-x-3"><motion.span className="px-3 py-1 bg-[var(--accent-color)] text-[var(--color-surface)] rounded-full text-sm font-medium" whileHover={{ scale: 1.1, backgroundColor: 'var(--primary-color)' }} transition={{ type: 'spring', stiffness: 300 }}>NABL Accredited</motion.span><motion.span className="px-3 py-1 bg-[var(--color-surface)]/10 rounded-full text-sm" whileHover={{ scale: 1.1, backgroundColor: 'var(--accent-color)' }} transition={{ type: 'spring', stiffness: 300 }}>24/7 Service</motion.span></div></div>
  </div>
</motion.header>
 <main className="max-w-7xl mx-auto px-6 py-8">
  <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}>
    {stats.map((s, i) => (
      <Link to={s.path} key={i}>
        <motion.div className={`card-stat ${s.borderClass} cursor-pointer`} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <motion.div className={`card-icon ${s.iconClass}`} whileHover={{ scale: 1.04 }} transition={{ type: "spring", stiffness: 300 }}>
            <div className="card-icon-white">{s.icon}</div>
          </motion.div>
          <h4 className="card-stat-count">{s.value}</h4>
          <p className="card-stat-label">{s.title}</p>
        </motion.div>
      </Link>
    ))}
  </motion.div>
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <motion.div className="bg-[var(--color-surface)] rounded-xl p-6 shadow-sm border-t-4 border-t-[var(--primary-color)]" initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.3 }}>
  <div className="flex items-center justify-between mb-6"><h4 className="h4-heading">Today's Schedule</h4><Link to="/visits" className="text-[var(--accent-color)] hover:text-[var(--primary-color)] transition-colors text-sm font-medium">View All</Link></div>
  <div className="space-y-4">{todayVisits.map((v, i) => (<Link to={v.path} key={i}><motion.div className="p-4 bg-[var(--primary-color)]-50 rounded-lg border-l-4 border-[var(--accent-color)] cursor-pointer transition-colors" whileHover={{ scale: 1.02, backgroundColor: "#f3f4f6" }} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}><div className="flex justify-between items-center"><div><p className="paragraph">{v.name}</p><div className="flex items-center mt-1"><Clock size={14} className="text-[var(--accent-color)] mr-1" /><p className="paragraph text-sm">{v.time} - {v.type}</p></div></div><span className="px-3 py-1 rounded-full text-sm font-semibold bg-[var(--primary-color)] text-[var(--color-surface)]">{v.status}</span></div></motion.div></Link>))}</div>
</motion.div>

    <motion.div className="bg-[var(--color-surface)] rounded-xl p-6 shadow-sm border-t-4 border-t-[var(--accent-color)]" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
      <div className="flex items-center justify-between mb-6"><h3 className="h4-heading">Recent Activity</h3><Link to="/activities" className="text-[var(--accent-color)] hover:text-[var(--primary-color)] transition-colors text-sm font-medium">View All</Link></div>
      <div className="space-y-4">
        {recentActivities.map((a, i) => (
          <Link to={a.path} key={i}>
            <motion.div className={`p-4 bg-[var(--color-surface)] rounded-lg transition-colors border-l-4 ${a.border} cursor-pointer`} whileHover={{ scale: 1.02, backgroundColor: "#f3f4f6" }} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}>
              <div className="flex items-center">
                <div className={`card-icon ${a.bg === 'bg-[var(--primary-color)]' ? 'card-icon-primary' : 'card-icon-accent'} card-icon-white`}>{a.icon}</div>
                <div className="ml-4"><p className="paragraph font-medium">{a.title}</p><p className="paragraph text-sm">{a.description}</p><p className="paragraph text-xs mt-1">{a.time}</p></div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </motion.div>
  </div>
</main>
 </motion.div>
  );
}

export default Dashboard;