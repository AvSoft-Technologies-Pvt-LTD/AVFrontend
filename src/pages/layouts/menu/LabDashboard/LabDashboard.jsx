import React from 'react';
import {
  IndianRupee,
  Clock,
  Home,
  CheckCircle,
  Microscope,
  Wallet,
  Phone,
  MapPin,
  Mail,
  TrendingUp,
  Users,
  Calendar,
  Activity
} from 'lucide-react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components (required for react-chartjs-2)
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  // Stats data (kept same content as original)
const stats = [
  {
    title: "Total Tests Today",
    value: "142",
    change: "+12%",
    gradient: "from-[#0E1630] to-[#01D48C]/70",
    lightBg: "bg-[#01D48C]/10",
    textColor: "text-[#01D48C]",
    icon: <Activity size={22} />
  },
  {
    title: "Completed Tests",
    value: "98",
    change: "+8%",
    gradient: "from-[#0E1630] to-[#01D48C]/70",
    lightBg: "bg-[#0E1630]/10",
    textColor: "text-[#0E1630]",
    icon: <CheckCircle size={22} />
  },
  {
    title: "Pending Tests",
    value: "44",
    change: "-5%",
    gradient: "from-[#0E1630] to-[#01D48C]/70",
    lightBg: "bg-[var(--primary-color)]/5/40",
    textColor: "text-slate-600",
    icon: <Clock size={22} />
  },
  {
    title: "Revenue Today",
    value: "₹32,500",
    change: "+15%",
    gradient: "from-[#0E1630] to-[#01D48C]/70",
    lightBg: "bg-[#01D48C]/10",
    textColor: "text-[#01D48C]",
    icon: <IndianRupee size={22} />
  },
  {
    title: "New Patients",
    value: "27",
    change: "+6%",
    gradient: "from-[#0E1630] to-[#01D48C]/70",
    lightBg: "bg-[var(--primary-color)]/5/40",
    textColor: "text-[var(--primary-color)]",
    icon: <Users size={22} />
  },
  {
    title: "Home Collections",
    value: "19",
    change: "+10%",
    gradient: "from-[#0E1630] to-[#01D48C]/70",
    lightBg: "bg-[#0E1630]/10",
    textColor: "text-[#0E1630]",
    icon: <Home size={22} />
  }
];


  const todayVisits = [
    { name: 'Maria Garcia', time: '11:30 AM', type: 'Home Sample', status: 'Pending', avatar: 'MG' },
    { name: 'David Wilson', time: '2:00 PM', type: 'Lab Visit', status: 'In Progress', avatar: 'DW' },
    { name: 'Sarah Johnson', time: '3:30 PM', type: 'Home Sample', status: 'Scheduled', avatar: 'SJ' },
  ];

  const statusStyles = {
    Completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    Pending: 'bg-amber-100 text-amber-700 border-amber-200',
    'In Progress': 'bg-blue-100 text-blue-700 border-blue-200',
    Scheduled: 'bg-slate-100 text-[var(--primary-color)] border-[var(--primary-color)]/5',
  };

  const weeklyTestData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Tests Completed',
        data: [120, 190, 150, 200, 180, 160, 140],
        backgroundColor: 'rgba(1, 212, 140, 1)',
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const monthlyRevenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue',
        data: [250000, 300000, 280000, 350000, 400000, 380000],
        borderColor: 'rgba(1, 212, 140, 1)',
        backgroundColor: 'rgba(1, 212, 140, 0.1)',
        fill: true,
        tension: 0.35,
        borderWidth: 3,
        pointRadius: 5,
        pointBackgroundColor: 'rgb(1, 212, 140, 0.2)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  };

  const topTestsData = {
    labels: ['CBC', 'Lipid Profile', 'Thyroid', 'Diabetes', 'Liver Function'],
    datasets: [
      {
        data: [120, 105, 90, 75, 60],
        backgroundColor: [
          'rgba(59, 130, 246, 0.85)',
          'rgba(16, 185, 129, 0.85)',
          'rgba(245, 158, 11, 0.85)',
          'rgba(139, 92, 246, 0.85)',
          'rgba(236, 72, 153, 0.85)',
        ],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: 'index', intersect: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
      x: { grid: { display: false } },
    },
  };

  const lineChartOptions = {
    ...chartOptions,
    plugins: { ...chartOptions.plugins },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: {
          callback: function (value) {
            // Format large numbers into currency-like strings
            if (typeof value === 'number') return '₹' + value.toLocaleString();
            return value;
          },
        },
      },
      x: { grid: { display: false } },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { usePointStyle: true, padding: 12 } },
    },
    cutout: '70%',
  };

  return (
    <div className="min-h-screen ">
      <div className="max-w-[1600px] mx-auto p-6 space-y-6">
        {/* Header */}
        <header className="rounded-2xl shadow-lg border border-[var(--primary-color)]/5 overflow-hidden bg-white">
          {/* Top Gradient Banner */}
          <div className="px-8 py-6 bg-gradient-to-r from-[var(--primary-color)] to-[var(--accent-color)]">
            <div className="flex items-center justify-between">

              {/* Left Section */}
              <div className="flex items-center space-x-5">
                <div className="p-3 rounded-xl backdrop-blur-md shadow-md">
                  <Microscope size={34} className="text-white" />
                </div>

                <div className="text-white">
                  <h1 className="text-xl font-bold tracking-tight leading-snug">
                    ABC Diagnostics Lab
                  </h1>
                  <p className="text-white/80 text-sm font-medium mt-1">
                    ISO 9001:2015 Certified • NABL Accredited
                  </p>
                </div>
              </div>

              {/* Doctor Info */}
              <div className="text-right text-white">
                <p className="text-xl font-semibold">Dr. Rajesh Kumar</p>
                <p className="text-white/80 text-sm">Laboratory Director, MD Pathology</p>
              </div>

            </div>
          </div>

          {/* Info Row */}
          <div className="px-8 py-5 bg-slate-50 border-t border-[var(--primary-color)]/5">
            <div className="flex flex-wrap items-center justify-between gap-4">

              {/* Address + Contacts */}
              <div className="flex items-center flex-wrap gap-6 text-[var(--primary-color)]">

                <div className="flex items-center space-x-2">
                  <MapPin size={18} className="text-[var(--primary-color)]" />
                  <span className="text-sm font-medium">
                    123 Healthcare Avenue, Hyderabad, 500001
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <Phone size={18} className="text-[var(--primary-color)]" />
                  <span className="text-sm font-medium">+91 98765-43210</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Mail size={18} className="text-[var(--primary-color)]" />
                  <span className="text-sm font-medium">info@abcdiagnostics.com</span>
                </div>

              </div>

              {/* Tags */}
              <div className="flex items-center space-x-3">
                <span className="px-4 py-2 rounded-full text-sm font-semibold border 
          bg-[var(--accent-color)]/15 text-[var(--accent-color)] border-[var(--accent-color)]/30">
                  24/7 Service
                </span>

                <span className="px-4 py-2 rounded-full text-sm font-semibold border 
          bg-emerald-100 text-emerald-700 border-emerald-200">
                  Home Collection
                </span>
              </div>

            </div>
          </div>
        </header>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-[var(--primary-color)]/5 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
              <div className={`h-2 bg-gradient-to-r ${stat.gradient}`} />
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-3 rounded-xl ${stat.lightBg}`}>
                    <div className={stat.textColor}>{stat.icon}</div>
                  </div>
                  <div className={`flex items-center space-x-1 text-xs font-semibold ${stat.change.startsWith('+') ? 'text-emerald-600' : 'text-red-600'}`}>
                    <TrendingUp size={14} />
                    <span>{stat.change}</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-[var(--primary-color)] mb-1">{stat.value}</h3>
                <p className="text-sm text-[var(--primary-color)]/50 font-medium">{stat.title}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column: Today's Schedule and Charts */}
          <div className="xl:col-span-2 space-y-6">
            {/* Today's Schedule */}
            <div className="bg-white rounded-xl shadow-sm border border-[var(--primary-color)]/5 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <Calendar size={20} className="text-[var(--primary-color)]" />
                  </div>
                  <h2 className="text-xl font-bold text-[var(--primary-color)]">Today's Schedule</h2>
                </div>
                <button className="text-sm font-semibold text-[var(--primary-color)] hover:text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors">View All →</button>
              </div>

              <div className="space-y-3">
                {todayVisits.map((visit, index) => (
                  <div key={index} className="group p-4 rounded-xl border border-[var(--primary-color)]/5 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[var(--primary-color)] to-[var(--accent-color)] flex items-center justify-center text-white font-bold shadow-md">{visit.avatar}</div>
                        <div>
                          <p className="font-semibold text-[var(--primary-color)] group-hover:text-[var(--primary-color)] transition-colors">{visit.name}</p>
                          <div className="flex items-center space-x-3 mt-1">
                            <span className="flex items-center text-sm text-[var(--primary-color)]/50">
                              <Clock size={14} className="mr-1 text-blue-500" />
                              {visit.time}
                            </span>
                            <span className="text-[var(--primary-color)]/50">•</span>
                            <span className="text-sm text-[var(--primary-color)]/50">{visit.type}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`px-4 py-2 rounded-lg text-xs font-bold border ${statusStyles[visit.status]}`}>{visit.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Placeholder for quick actions / summary */}
          <aside className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-[var(--primary-color)]/5 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[var(--primary-color)]">Top Tests</h3>
                <Activity size={18} className="text-[var(--accent-color)]" />
              </div>
              <div className="h-64 flex items-center justify-center">
                <Doughnut data={topTestsData} options={doughnutOptions} />
              </div>
            </div>
          </aside>

        </div>
        
            {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Test Volume */}
          <div className="bg-white rounded-xl shadow-sm border border-[var(--primary-color)]/5 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[var(--primary-color)]">Weekly Test Volume</h3>
              <TrendingUp size={18} className="text-[var(--primary-color)]" />
            </div>
            <div className="h-64">
              <Bar data={weeklyTestData} options={chartOptions} />
            </div>
          </div>

          {/* Monthly Revenue Trend */}
          <div className="bg-white rounded-xl shadow-sm border border-[var(--primary-color)]/5 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[var(--primary-color)]">Monthly Revenue Trend</h3>
              <Wallet size={18} className="text-[var(--accent-color)]" />
            </div>
            <div className="h-64">
              <Line data={monthlyRevenueData} options={lineChartOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
