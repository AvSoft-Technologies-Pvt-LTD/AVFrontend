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
  const [darkMode, setDarkMode] = React.useState(false);
  const [isWorking, setIsWorking] = React.useState(true);

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
    <div
      className={`min-h-screen p-6 w-full overflow-y-auto transition-colors duration-300 ${
        darkMode ? "bg-[#0d1117] text-white" : "bg-gray-50"
      }`}
    >
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 bg-gradient-to-r from-[var(--gradient-start)] via-[var(--accent-color)] to-[var(--gradient-end)]
        rounded-2xl px-6 py-5 shadow-lg"
      >
        <div className="flex items-center gap-4">
          {/* AVATAR */}
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-white/30 to-white/10 
            flex items-center justify-center text-white text-2xl font-semibold shadow-lg 
            backdrop-blur-sm border-2 border-white/20"
          >
            {frontDeskUser.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>

          {/* NAME */}
          <div className="flex-1">
            <h1 className="text-xl md:text-2xl font-semibold text-white flex items-center gap-2">
              Welcome back, {frontDeskUser.name}
            </h1>
            <p className="text-xs md:text-sm text-white/90 mt-1">
              {frontDeskUser.role} · Managing OPD reception & patient flow today
            </p>
          </div>

          {/* RIGHT SECTION */}
          <div className="hidden md:flex flex-col items-end gap-3 relative">

            {/* WORKING TOGGLE */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/90 font-medium">Status:</span>

              <button
                onClick={() => setIsWorking(!isWorking)}
                className={`relative inline-flex h-8 w-16 items-center rounded-full transition-all duration-300 shadow-lg ${
                  isWorking
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-red-500 hover:bg-red-600"
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                    isWorking ? "translate-x-9" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* THEME TOGGLE */}
            <button
              onClick={() => setDarkMode(!darkMode)}
             
            >
              {/* {darkMode ? "Light Mode" : "Dark Mode"} */}
            </button>

            <p className="text-[11px] text-white/90">
              Shift: {frontDeskUser.shiftTime}
            </p>
           
          </div>
        </div>
      </motion.div>

      {/* TOP 4 CARDS (UNCHANGED) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
        <DashboardStat
          title="New Patients Today"
          value="47"
          icon={<FaUserPlus />}
          color="from-[#01B07A] to-[#01D48C]"
          darkMode={darkMode}
        />
        <DashboardStat
          title="Aadhar Verifications"
          value="31"
          icon={<FaIdCard />}
          color="from-[#0E1630] to-[#1A223F]"
          darkMode={darkMode}
        />
        <DashboardStat
          title="Tokens Issued"
          value="63"
          icon={<MdQrCode />}
          color="from-[#01D48C] to-[#4ce4b0]"
          darkMode={darkMode}
        />
        <DashboardStat
          title="Virtual Appointments"
          value="128"
          icon={<FaCalendarCheck />}
          color="from-[#1A223F] to-[#01B07A]"
          darkMode={darkMode}
        />
      </div>

      {/* MAIN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* QUICK ACTIONS */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl shadow-sm p-6 border ${
            darkMode ? "bg-[#161b22] border-gray-700" : "bg-white border-gray-100"
          }`}
        >
          <h2
            className={`font-semibold text-lg mb-4 flex items-center gap-2 ${
              darkMode ? "text-[#01D48C]" : "text-[var(--primary-color)]"
            }`}
          >
            Quick Actions
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <QuickAction
              label="New Patient"
              icon={<FaUserPlus />}
              onClick={() => navigate("/frontdeskdashboard/new-patient")}
              darkMode={darkMode}
            />
            <QuickAction
              label="Queue Management"
              icon={<MdQueue />}
              onClick={() => navigate("/frontdeskdashboard/tokens")}
              darkMode={darkMode}
            />
            <QuickAction
              label="Manage Patients"
              icon={<FaUsers />}
              onClick={() => navigate("/frontdeskdashboard/patients")}
              darkMode={darkMode}
            />
            <QuickAction
              label="Settings"
              icon={<FaCalendarCheck />}
              onClick={() => navigate("/frontdeskdashboard/settings")}
              darkMode={darkMode}
            />
          </div>
        </motion.div>

        {/* TOKEN QUEUE */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className={`shadow-sm border p-6 rounded-2xl ${
            darkMode
              ? "bg-gradient-to-br from-blue-900/20 to-green-900/10 border-gray-700"
              : "bg-gradient-to-br from-blue-50/50 to-green-50/30 border-gray-100"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <h2
              className={`font-semibold text-lg flex items-center gap-2 ${
                darkMode ? "text-[#01D48C]" : "text-[var(--primary-color)]"
              }`}
            >
              <MdQueue className="text-[var(--accent-color)] text-xl" />
              Live Token Queue
            </h2>
            <button
              onClick={() => navigate("/frontdeskdashboard/tokens")}
              className="text-xs text-[var(--accent-color)] hover:underline"
            >
              View All →
            </button>
          </div>

          <div className="space-y-3">
            {["T-101", "T-102", "T-103", "T-104"].map((t, i) => (
              <div
                key={i}
                className={`flex items-center justify-between rounded-xl px-4 py-3 shadow-sm border hover:border-[var(--accent-color)]/30 transition-all ${
                  darkMode ? "bg-[#161b22] border-gray-700" : "bg-white border-gray-50"
                }`}
              >
                <span
                  className={`font-medium ${
                    darkMode ? "text-white" : "text-[var(--primary-color)]"
                  }`}
                >
                  {t}
                </span>
                <span className="text-xs text-gray-500 bg-yellow-50 px-2 py-1 rounded-full">
                  Waiting...
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* UPCOMING APPOINTMENTS */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl shadow-sm border p-6 ${
            darkMode ? "bg-[#161b22] border-gray-700" : "bg-white border-gray-100"
          }`}
        >
          <h2
            className={`font-semibold text-lg mb-4 flex items-center gap-2 ${
              darkMode ? "text-[#01D48C]" : "text-[var(--primary-color)]"
            }`}
          >
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
                className={`flex items-center justify-between p-3 rounded-xl border hover:bg-[var(--accent-color)]/5 hover:border-[var(--accent-color)]/30 transition-all ${
                  darkMode
                    ? "bg-[#0d1117] border-gray-700"
                    : "bg-gray-50/80 border-gray-100"
                }`}
              >
                <div>
                  <h3
                    className={`font-semibold text-sm ${
                      darkMode ? "text-white" : "text-[var(--primary-color)]"
                    }`}
                  >
                    {a.name}
                  </h3>
                  <p className="text-xs text-gray-500">{a.dept}</p>
                </div>

                <span className="text-xs bg-[var(--accent-color)]/10 text-[var(--accent-color)]
                    px-3 py-1.5 rounded-full font-medium border border-[var(--accent-color)]/20"
                >
                  {a.time}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* TREND CHART */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl shadow-sm border p-6 lg:col-span-2 ${
            darkMode ? "bg-[#161b22] border-gray-700" : "bg-white border-gray-100"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h2
              className={`font-semibold text-lg flex items-center gap-2 ${
                darkMode ? "text-[#01D48C]" : "text-[var(--primary-color)]"
              }`}
            >
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
                  tick={{
                    fill: darkMode ? "#9ca3af" : "#64748b",
                    fontSize: 12,
                  }}
                  tickLine={false}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? "#161b22" : "#fff",
                    border: `1px solid ${darkMode ? "#374151" : "#e2e8f0"}`,
                    borderRadius: "8px",
                    fontSize: "12px",
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

        {/* PIE CHART */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl shadow-sm p-6 border ${
            darkMode ? "bg-[#161b22] border-gray-700" : "bg-white border-gray-100"
          }`}
        >
          <h2
            className={`text-lg font-bold mb-4 ${
              darkMode ? "text-[#01D48C]" : "text-[var(--primary-color)]"
            }`}
          >
            Reception Summary
          </h2>

          <div className="w-full h-56">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={receptionPieData}
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  paddingAngle={4}
                >
                  {receptionPieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={receptionColors[index]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* SMALL COMPONENTS — DO NOT TOUCH */

function DashboardStat({ title, value, icon, color, darkMode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-5 rounded-2xl shadow-sm bg-gradient-to-br ${color} text-white`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90">{title}</p>
          <h2 className="text-2xl font-bold mt-1">{value}</h2>
        </div>
        <div className="text-3xl opacity-80">{icon}</div>
      </div>
    </motion.div>
  );
}

function QuickAction({ label, icon, onClick, darkMode }) {
  return (
    <button
      onClick={onClick}
      className={`w-full p-4 rounded-xl flex flex-col items-center justify-center gap-2 border
      hover:shadow-md transition-all ${
        darkMode ? "bg-[#0d1117] border-gray-700" : "bg-white border-gray-200"
      }`}
    >
      <span className="text-2xl text-[var(--accent-color)]">{icon}</span>
      <span
        className={`text-sm font-medium ${
          darkMode ? "text-white" : "text-gray-700"
        }`}
      >
        {label}
      </span>
    </button>
  );
}
