import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FaUserPlus,
  FaIdCard,
  FaCalendarCheck,
  FaUsers
} from "react-icons/fa";
import { MdQrCode, MdTrendingUp, MdQueue } from "react-icons/md";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function FrontDeskDashboard() {
  const navigate = useNavigate();

  // You can later replace this with real data from API / auth user
  const frontDeskUser = {
    name: "Shrinivas Shelke",
    role: "Front Desk Executive",
    shift: "Morning Shift",
    shiftTime: "09:00 AM – 05:00 PM",
    deskId: "FD-102",
  };

  const miniChartData = [
    { day: "Mon", count: 22 },
    { day: "Tue", count: 18 },
    { day: "Wed", count: 32 },
    { day: "Thu", count: 28 },
    { day: "Fri", count: 40 },
  ];

  const receptionPieData = [
    { name: "Calls", value: 82 },
    { name: "Walk-ins", value: 54 },
    { name: "Tokens", value: 7 },
  ];

  const receptionColors = ["#01D48C", "#0E1630", "#01B07A"];

  return (
    <div className="p-6 w-full overflow-y-auto bg-gray-50">
      {/* FRONT DESK PERSON HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 bg-gradient-to-r from-[var(--gradient-start)] via-[var(--accent-color)] to-[var(--gradient-end)] rounded-2xl px-6 py-5 shadow-lg"
      >
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-white/30 to-white/10 flex items-center justify-center text-white text-2xl font-semibold shadow-lg backdrop-blur-sm border-2 border-white/20">
            {frontDeskUser.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>

          {/* Name + role */}
          <div className="flex-1">
            <h1 className="text-xl md:text-2xl font-semibold text-white flex items-center gap-2">
              Welcome back, {frontDeskUser.name}
            </h1>
            <p className="text-xs md:text-sm text-white/90 mt-1">
              {frontDeskUser.role} · Managing OPD reception & patient flow today
            </p>
          </div>

          {/* Shift details */}
          <div className="hidden md:flex flex-col items-end gap-2">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white border border-white/30 backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
              On Duty · {frontDeskUser.shift}
            </span>
            <p className="text-[11px] text-white/90">
              Shift: {frontDeskUser.shiftTime}
            </p>
            <p className="text-[11px] text-white/80">
              Desk ID: <span className="font-semibold text-white">{frontDeskUser.deskId}</span>
            </p>
          </div>
        </div>
      </motion.div>

      {/* TOP 4 STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
        <DashboardStat
          title="New Patients Today"
          value="47"
          icon={<FaUserPlus />}
          color="from-[#01B07A] to-[#01D48C]"
        />
        <DashboardStat
          title="Aadhar Verifications"
          value="31"
          icon={<FaIdCard />}
          color="from-[#0E1630] to-[#1A223F]"
        />
        <DashboardStat
          title="Tokens Issued"
          value="63"
          icon={<MdQrCode />}
          color="from-[#01D48C] to-[#4ce4b0]"
        />
        <DashboardStat
          title="Virtual Appointments"
          value="128"
          icon={<FaCalendarCheck />}
          color="from-[#1A223F] to-[#01B07A]"
        />
      </div>

      {/* MAIN GRID - Reorganized layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* QUICK ACTIONS */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
        >
          <h2 className="font-semibold text-[var(--primary-color)] text-lg mb-4 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-color)] animate-pulse"></span>
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <QuickAction 
              label="New Patient" 
              icon={<FaUserPlus />} 
              onClick={() => navigate('/frontdeskdashboard/new-patient')}
            />
            <QuickAction 
              label="Queue Management"  
              icon={<MdQueue />}
              onClick={() => navigate('/frontdeskdashboard/tokens')}
            />
            <QuickAction 
              label="Manage Patients" 
              icon={<FaUsers />}
              onClick={() => navigate('/frontdeskdashboard/patients')}
            />
            <QuickAction 
              label="Settings" 
              icon={<FaCalendarCheck />}
              onClick={() => navigate('/frontdeskdashboard/settings')}
            />
          </div>
        </motion.div>

        {/* TOKEN QUEUE & UPCOMING APPOINTMENTS - Side by side */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-50/50 to-green-50/30 shadow-sm border border-gray-100 p-6 rounded-2xl hover:shadow-md transition-shadow"
        >
          <h2 className="font-semibold text-[var(--primary-color)] text-lg mb-3 flex items-center gap-2">
            <MdQueue className="text-[var(--accent-color)] text-xl" />
            Live Token Queue
          </h2>
          <div className="space-y-3">
            {["T-101", "T-102", "T-103", "T-104"].map((t, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl px-4 py-3 bg-white shadow-sm border border-gray-50 hover:border-[var(--accent-color)]/30 transition-all"
              >
                <span className="text-[var(--primary-color)] font-medium">{t}</span>
                <span className="text-xs text-gray-500 bg-yellow-50 px-2 py-1 rounded-full">Waiting...</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* UPCOMING APPOINTMENTS - Moved beside queue */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
        >
          <h2 className="font-semibold text-[var(--primary-color)] text-lg mb-4 flex items-center gap-2">
            <FaCalendarCheck className="text-[var(--accent-color)] text-lg" />
            Upcoming Appointments
          </h2>
          <div className="space-y-3">
            {[
              { name: "Rohit Kumar", time: "10:00 AM", dept: "Cardiology" },
              { name: "Anjali Sharma", time: "10:30 AM", dept: "Dermatology" },
              { name: "Karan Singh", time: "11:00 AM", dept: "ENT" },
            ].map((a, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-gray-50/80 p-3 rounded-xl border border-gray-100 hover:bg-[var(--accent-color)]/5 hover:border-[var(--accent-color)]/30 transition-all"
              >
                <div>
                  <h3 className="text-[var(--primary-color)] font-semibold text-sm">{a.name}</h3>
                  <p className="text-xs text-gray-500">{a.dept}</p>
                </div>
                <span className="text-xs bg-[var(--accent-color)]/10 text-[var(--accent-color)] px-3 py-1.5 rounded-full font-medium border border-[var(--accent-color)]/20">
                  {a.time}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* TODAY'S APPOINTMENT TREND CHART - Moved to bottom left */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:col-span-2 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[var(--primary-color)] text-lg flex items-center gap-2">
              <MdTrendingUp className="text-[var(--accent-color)] text-2xl" />
              Today's Appointment Trend
            </h2>
          </div>
          <div className="w-full h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={miniChartData}>
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="10%" stopColor="#01D48C" stopOpacity={0.6} />
                    <stop offset="90%" stopColor="#01D48C" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "12px"
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#01D48C"
                  strokeWidth={3}
                  fill="url(#trendGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* RECEPTION SUMMARY PIE CHART */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
        >
          <h2 className="text-lg font-bold text-[var(--primary-color)] mb-4 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[var(--accent-color)] animate-pulse"></span>
            Activity Summary
          </h2>
          <div className="h-[200px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={receptionPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {receptionPieData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={receptionColors[index % receptionColors.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-[var(--primary-color)]">
                {receptionPieData.reduce((sum, item) => sum + item.value, 0)}
              </span>
              <span className="text-xs text-gray-500 uppercase tracking-wider">Total</span>
            </div>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            {receptionPieData.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: receptionColors[i % receptionColors.length] }} 
                />
                <span className="text-xs font-medium text-gray-600">{item.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ---------- REUSABLE COMPONENTS ---------- */

const DashboardStat = ({ title, value, icon, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`rounded-2xl p-5 shadow-md text-white bg-gradient-to-br ${color} flex items-center justify-between hover:shadow-lg transition-shadow`}
  >
    <div>
      <p className="text-sm opacity-90 font-medium">{title}</p>
      <h3 className="text-3xl font-bold mt-1">{value}</h3>
    </div>
    <div className="text-4xl opacity-90">{icon}</div>
  </motion.div>
);

const QuickAction = ({ label, icon, onClick }) => (
  <div 
    onClick={onClick}
    className="cursor-pointer bg-gradient-to-br from-gray-50 to-white hover:from-[var(--accent-color)]/5 hover:to-[var(--accent-color)]/10 border border-gray-200 hover:border-[var(--accent-color)]/30 p-4 rounded-xl transition-all flex flex-col items-center justify-center gap-2 text-[var(--primary-color)] hover:scale-105 active:scale-95"
  >
    <span className="text-2xl text-[var(--accent-color)]">{icon}</span>
    <span className="text-sm font-medium text-center">{label}</span>
  </div>
);
