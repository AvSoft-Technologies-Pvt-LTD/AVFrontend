import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceArea,
} from "recharts";
import {
  X, Printer, Share, BarChart3, TrendingUp, Activity, PieChart as PieChartIcon,
  Radar as RadarIcon, Heart, Thermometer, Droplets, Gauge, Ruler, Scale, Zap,
  Wind, Sun, Moon, Target, AlertTriangle, ChevronLeft, ChevronRight,
} from "lucide-react";

const vitalRanges = {
  heartRate: { min: 60, max: 100, label: "bpm", name: "Heart Rate", optimal: 70, icon: Heart, color: "#ef4444" },
  temperature: { min: 36.1, max: 37.2, label: "°C", name: "Temperature", optimal: 36.5, icon: Thermometer, color: "#f97316" },
  bloodSugar: { min: 70, max: 140, label: "mg/dL", name: "Blood Sugar", optimal: 90, icon: Droplets, color: "#8b5cf6" },
  bloodPressure: { min: 90, max: 120, label: "mmHg", name: "Blood Pressure", optimal: 110, icon: Gauge, color: "#06b6d4" },
  height: { min: 100, max: 220, label: "cm", name: "Height", optimal: 170, icon: Ruler, color: "#10b981" },
  weight: { min: 30, max: 200, label: "kg", name: "Weight", optimal: 70, icon: Scale, color: "#f59e0b" },
  spo2: { min: 95, max: 100, label: "%", name: "SpO2", optimal: 98, icon: Zap, color: "#3b82f6" },
  respiratoryRate: { min: 12, max: 20, label: "bpm", name: "Respiratory Rate", optimal: 16, icon: Wind, color: "#64748b" },
};

const CHART_COLORS = {
  primary: "#1e293b", accent: "#3b82f6", success: "#22c55e", warning: "#f59e0b", danger: "#ef4444",
  morning: "#fbbf24", evening: "#8b5cf6", normal: "#22c55e", outOfRange: "#ef4444",
};

const chartTypes = [
  { id: "bar", name: "Bar", icon: BarChart3, gradient: "from-blue-500 to-blue-600" },
  { id: "line", name: "Line", icon: TrendingUp, gradient: "from-emerald-500 to-emerald-600" },
  { id: "area", name: "Area", icon: Activity, gradient: "from-purple-500 to-purple-600" },
  { id: "pie", name: "Pie", icon: PieChartIcon, gradient: "from-orange-500 to-orange-600" },
  { id: "radar", name: "Radar", icon: RadarIcon, gradient: "from-pink-500 to-pink-600" },
];

const ChartsButton = ({ onClick, vital, records = [] }) => (
  <motion.button
    onClick={onClick}
    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-md shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 relative overflow-hidden group"
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
    <BarChart3 className="w-3.5 h-3.5 relative z-10" />
    <span className="text-xs font-medium relative z-10">Charts</span>
    {records.length > 0 && (
      <motion.span
        className="bg-yellow-400 text-yellow-900 text-xs px-1.5 py-0.5 rounded-full font-semibold relative z-10"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        {records.length}
      </motion.span>
    )}
  </motion.button>
);

const AnimatedCounter = ({ value, duration = 2000, suffix = "" }) => {
  const [displayValue, setDisplayValue] = useState(0);
  React.useEffect(() => {
    let startTime, animationFrame;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setDisplayValue(Math.floor(progress * value));
      if (progress < 1) animationFrame = requestAnimationFrame(animate);
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);
  return <span>{displayValue}{suffix}</span>;
};

const StatsCard = ({ title, value, suffix = "", icon: Icon, color, delay = 0 }) => (
  <motion.div
    className="relative overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20 rounded-md p-2 hover:bg-white/20 transition-all duration-300 group"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    whileHover={{ scale: 1.02, y: -2 }}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-white/80 text-xs mb-0.5">{title}</p>
        <p className="text-base font-bold text-white">
          <AnimatedCounter value={value} suffix={suffix} />
        </p>
      </div>
      <div className={`p-1.5 rounded-md bg-gradient-to-r ${color} shadow-lg`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
    </div>
    <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
  </motion.div>
);

const CustomTooltip = ({ active, payload, label, vital }) => {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  const vitalInfo = vitalRanges[vital];
  return (
    <motion.div
      className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-2xl p-2 max-w-xs"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="space-y-1">
        <p className="font-semibold text-gray-800 border-b border-gray-200 pb-1 text-xs">
          {label || data.date}
        </p>
        <div className="space-y-0.5 text-xs">
          <p className="text-gray-600">{data.date} at {data.time} ({data.timeOfDay})</p>
          <p className="text-gray-800 font-medium">Value: {data.rawValue || data.value} {vitalInfo?.label}</p>
          {vitalInfo && <p className="text-xs text-gray-500">Normal: {vitalInfo.min}-{vitalInfo.max} {vitalInfo.label}</p>}
          <div className="flex items-center gap-1.5 pt-1">
            <div className={`w-2 h-2 rounded-full ${data.status === "normal" ? "bg-green-500" : data.status === "low" ? "bg-blue-500" : "bg-red-500"}`} />
            <span className={`text-xs font-medium ${data.status === "normal" ? "text-green-700" : data.status === "low" ? "text-blue-700" : "text-red-700"}`}>
              {data.status?.toUpperCase() || "UNKNOWN"}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const CompactLegendItem = ({ icon: Icon, label, value, color, delay = 0 }) => (
  <motion.div
    className="flex items-center justify-between p-2 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay }}
    whileHover={{ scale: 1.01 }}
  >
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${color} shadow-sm`} />
      <div className="flex items-center gap-1">
        <Icon className="w-3 h-3 text-gray-600" />
        <span className="text-xs font-medium text-gray-700">{label}</span>
      </div>
    </div>
    <span className="text-xs font-bold text-gray-800">{value}</span>
  </motion.div>
);

const ChartModal = ({ isOpen, onClose, vital, records, selectedIdx }) => {
  const [activeChartType, setActiveChartType] = useState("bar");
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  
  // Close modal on ESC key
  React.useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  const chartData = useMemo(() => {
    if (!records || !vital) return [];
    return records
      .filter((record) => record[vital])
      .map((record, index) => {
        let value = record[vital];
        if (vital === "bloodPressure") {
          const [systolic] = record[vital].split("/").map(Number);
          value = systolic;
        } else {
          value = parseFloat(value);
        }
        const range = vitalRanges[vital];
        const status = value < range?.min ? "low" : value > range?.max ? "high" : "normal";
        return {
          index,
          date: record.date,
          time: record.time,
          timeOfDay: record.timeOfDay,
          value,
          rawValue: record[vital],
          isSelected: selectedIdx === index,
          status,
          color: record.timeOfDay === "morning" ? CHART_COLORS.morning : CHART_COLORS.evening,
        };
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [records, vital, selectedIdx]);

  const radarData = useMemo(() => {
    if (!chartData.length) return [];
    const dates = [...new Set(chartData.map((d) => d.date))];
    return dates.map((date) => {
      const morning = chartData.find((d) => d.date === date && d.timeOfDay === "morning");
      const evening = chartData.find((d) => d.date === date && d.timeOfDay === "evening");
      return {
        date,
        morning: morning ? morning.value : 0,
        evening: evening ? evening.value : 0,
      };
    });
  }, [chartData]);

  const stats = useMemo(() => {
    if (!chartData.length) return null;
    const total = chartData.length;
    const normalCount = chartData.filter((d) => d.status === "normal").length;
    const morningCount = chartData.filter((d) => d.timeOfDay === "morning").length;
    const eveningCount = chartData.filter((d) => d.timeOfDay === "evening").length;
    const average = chartData.reduce((sum, d) => sum + d.value, 0) / total;
    return {
      total,
      normal: normalCount,
      normalPercentage: ((normalCount / total) * 100).toFixed(1),
      morning: morningCount,
      evening: eveningCount,
      average: average.toFixed(1),
      outOfRange: total - normalCount,
    };
  }, [chartData]);

  const pieData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: "Normal", value: stats.normal, color: CHART_COLORS.success },
      { name: "Out of Range", value: stats.outOfRange, color: CHART_COLORS.danger },
    ].filter((item) => item.value > 0);
  }, [stats]);

  const handlePrint = () => window.print();
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${vitalRanges[vital]?.name} Chart`,
          text: `Chart data for ${vitalRanges[vital]?.name} - ${stats?.total} records`,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      navigator.clipboard?.writeText(window.location.href);
      alert("Chart link copied to clipboard!");
    }
  };

  const renderChart = () => {
    if (!chartData.length) {
      return (
        <div className="flex items-center justify-center h-80 text-gray-500">
          <div className="text-center">
            <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No data available</p>
            <p className="text-sm">Start recording vitals to see charts</p>
          </div>
        </div>
      );
    }
    const range = vitalRanges[vital];
    const chartComponent = (() => {
      switch (activeChartType) {
        case "bar":
          return (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 15, right: 20, left: 15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#64748b" />
                <YAxis tick={{ fontSize: 10 }} stroke="#64748b" />
                <Tooltip content={<CustomTooltip vital={vital} />} />
                {range && <ReferenceArea y1={range.min} y2={range.max} fill={CHART_COLORS.success} fillOpacity={0.1} />}
                <Bar dataKey="value" radius={[3, 3, 0, 0]} strokeWidth={1} barSize={20}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.isSelected ? CHART_COLORS.accent : entry.color}
                      stroke={entry.status === "normal" ? CHART_COLORS.success : CHART_COLORS.danger}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          );
        case "line":
          return (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} margin={{ top: 15, right: 20, left: 15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#64748b" />
                <YAxis tick={{ fontSize: 10 }} stroke="#64748b" />
                <Tooltip content={<CustomTooltip vital={vital} />} />
                {range && <ReferenceArea y1={range.min} y2={range.max} fill={CHART_COLORS.success} fillOpacity={0.1} />}
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={CHART_COLORS.primary}
                  strokeWidth={2}
                  dot={{ fill: CHART_COLORS.accent, strokeWidth: 1, r: 4 }}
                  activeDot={{ r: 6, fill: CHART_COLORS.accent }}
                />
              </LineChart>
            </ResponsiveContainer>
          );
        case "area":
          return (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData} margin={{ top: 15, right: 20, left: 15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#64748b" />
                <YAxis tick={{ fontSize: 10 }} stroke="#64748b" />
                <Tooltip content={<CustomTooltip vital={vital} />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={CHART_COLORS.primary}
                  fill={CHART_COLORS.accent}
                  fillOpacity={0.3}
                  strokeWidth={1.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          );
        case "pie":
          return (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          );
        case "radar":
          return (
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#f1f5f9" />
                <PolarAngleAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#64748b" />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, Math.max(...radarData.flatMap((d) => [d.morning, d.evening])) * 1.1]}
                  tick={{ fontSize: 10 }}
                  stroke="#64748b"
                />
                <Radar name="Morning" dataKey="morning" stroke={CHART_COLORS.morning} fill={CHART_COLORS.morning} fillOpacity={0.4} />
                <Radar name="Evening" dataKey="evening" stroke={CHART_COLORS.evening} fill={CHART_COLORS.evening} fillOpacity={0.4} />
                <Tooltip />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          );
        default:
          return null;
      }
    })();
    
    return (
      <div className="flex gap-4">
        <div className={`transition-all duration-300 ${isPanelCollapsed ? 'flex-1' : 'w-2/3'}`}>
          {chartComponent}
        </div>
        <div className={`transition-all duration-300 ${isPanelCollapsed ? 'w-16' : 'w-1/3'} flex flex-col`}>
          {renderChartLegend()}
        </div>
      </div>
    );
  };

  const renderChartLegend = () => {
    if (!stats) return null;
    const range = vitalRanges[vital];
    
    if (isPanelCollapsed) {
      return (
        <div className="space-y-2">
          <button
            onClick={() => setIsPanelCollapsed(false)}
            className="w-full p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center justify-center"
            title="Expand insights panel"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="space-y-2 text-center">
            <div className="p-1 bg-blue-100 rounded text-xs">
              <div className="font-semibold">{stats.total}</div>
              <div className="text-gray-600">Total</div>
            </div>
            <div className="p-1 bg-green-100 rounded text-xs">
              <div className="font-semibold">{stats.normalPercentage}%</div>
              <div className="text-gray-600">Normal</div>
            </div>
            <div className="p-1 bg-yellow-100 rounded text-xs">
              <div className="font-semibold">{stats.morning}</div>
              <div className="text-gray-600">AM</div>
            </div>
            <div className="p-1 bg-purple-100 rounded text-xs">
              <div className="font-semibold">{stats.evening}</div>
              <div className="text-gray-600">PM</div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <motion.h4 className="text-sm font-semibold text-gray-800" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            Analysis & Insights
          </motion.h4>
          <button
            onClick={() => setIsPanelCollapsed(true)}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            title="Collapse insights panel"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
        
        <div className="space-y-2">
          <motion.h5 className="text-xs font-semibold text-gray-700 flex items-center gap-1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <Sun className="w-3 h-3 text-yellow-500" /> Time Split
          </motion.h5>
          <CompactLegendItem icon={Sun} label="Morning" value={`${stats.morning}`} color="bg-gradient-to-r from-yellow-400 to-yellow-500" delay={0.3} />
          <CompactLegendItem icon={Moon} label="Evening" value={`${stats.evening}`} color="bg-gradient-to-r from-purple-400 to-purple-500" delay={0.4} />
        </div>
        
        <div className="space-y-2">
          <motion.h5 className="text-xs font-semibold text-gray-700 flex items-center gap-1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
            <Target className="w-3 h-3 text-green-500" /> Health Status
          </motion.h5>
          <CompactLegendItem icon={Heart} label="Normal" value={`${stats.normalPercentage}%`} color="bg-gradient-to-r from-green-400 to-green-500" delay={0.6} />
          <CompactLegendItem icon={AlertTriangle} label="Out of Range" value={`${stats.outOfRange}`} color="bg-gradient-to-r from-red-400 to-red-500" delay={0.7} />
        </div>
        
        {/* <div className="space-y-2">
          <motion.h5 className="text-xs font-semibold text-gray-700 flex items-center gap-1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }}>
            <TrendingUp className="w-3 h-3 text-blue-500" /> Metrics
          </motion.h5>
          <CompactLegendItem icon={Activity} label="Avg" value={`${stats.average} ${range?.label || ""}`} color="bg-gradient-to-r from-blue-400 to-blue-500" delay={0.9} />
          <CompactLegendItem icon={Gauge} label="Range" value={`${range?.min}-${range?.max}`} color="bg-gradient-to-r from-gray-400 to-gray-500" delay={1.0} />
        </div> */}
      </div>
    );
  };

  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 z-[100000] flex items-center justify-center p-4" 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        style={{ zIndex: 100000 }}
      >
        <motion.div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          onClick={onClose} 
        />
        <motion.div
          className="relative w-full max-w-4xl max-h-[90vh] bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-2xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          transition={{ type: "spring", duration: 0.6 }}
          onClick={(e) => e.stopPropagation()}
          style={{ zIndex: 100001 }}
        >
          <div className="bg-gradient-to-r from-[#01B07A] to-[#1A223F] p-4 border-b border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {vitalRanges[vital]?.icon && (
                  <div className="p-1.5 bg-white/20 rounded-md">
                    {React.createElement(vitalRanges[vital].icon, { className: "w-5 h-5 text-white" })}
                  </div>
                )}
                <div>
                  <h2 className="text-lg font-bold text-white">{vitalRanges[vital]?.name || "Vitals"} Chart</h2>
                  <p className="text-white/80 text-xs">7 Days Analysis & Trends</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <motion.button onClick={handlePrint} className="p-2 bg-white/20 hover:bg-white/30 rounded-md transition-all duration-200" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Printer className="w-4 h-4 text-white" />
                </motion.button>
                <motion.button onClick={handleShare} className="p-2 bg-white/20 hover:bg-white/30 rounded-md transition-all duration-200" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Share className="w-4 h-4 text-white" />
                </motion.button>
                <motion.button onClick={onClose} className="p-2 bg-white/20 hover:bg-red-500/50 rounded-md transition-all duration-200" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <X className="w-4 h-4 text-white" />
                </motion.button>
              </div>
            </div>
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mt-4">
                <StatsCard title="Total" value={stats.total} icon={Activity} color="from-blue-500 to-blue-600" delay={0.1} />
                <StatsCard title="Normal" value={stats.normalPercentage} suffix="%" icon={Heart} color="from-green-500 to-green-600" delay={0.2} />
                <StatsCard title="Average" value={parseFloat(stats.average)} suffix={` ${vitalRanges[vital]?.label || ""}`} icon={TrendingUp} color="from-purple-500 to-purple-600" delay={0.3} />
                <StatsCard title="Morning" value={stats.morning} icon={Sun} color="from-yellow-500 to-yellow-600" delay={0.4} />
                <StatsCard title="Evening" value={stats.evening} icon={Moon} color="from-purple-500 to-purple-600" delay={0.5} />
                <StatsCard title="Range" value={`${vitalRanges[vital]?.min}-${vitalRanges[vital]?.max}`} icon={Gauge} color="from-gray-500 to-gray-600" delay={0.6} />
              </div>
            )}
          </div>
          <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-4">
            <div className="flex flex-wrap gap-1.5 mb-4 p-1.5 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
              {chartTypes.map((type, index) => (
                <motion.button
                  key={type.id}
                  onClick={() => setActiveChartType(type.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-medium transition-all duration-300 ${activeChartType === type.id ? `bg-gradient-to-r ${type.gradient} text-white shadow-lg` : "text-white/70 hover:text-white hover:bg-white/10"}`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <type.icon className="w-3.5 h-3.5" />
                  <span className="text-xs">{type.name}</span>
                </motion.button>
              ))}
            </div>
            <motion.div className="bg-white/95 backdrop-blur-sm rounded-lg p-4 border border-white/20 shadow-lg" key={activeChartType} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              {renderChart()}
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const VitalsChart = ({ vital, records, selectedIdx }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <div className="space-y-2">
      <ChartsButton onClick={() => setIsModalOpen(true)} vital={vital} records={records} />
      <ChartModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} vital={vital} records={records} selectedIdx={selectedIdx} />
    </div>
  );
};

export { ChartModal, ChartsButton };
export default VitalsChart;
