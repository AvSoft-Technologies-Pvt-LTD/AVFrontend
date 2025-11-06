import React, { useState, useEffect } from "react";
import {
  Users,
  Clock,
  AlertCircle,
  CheckCircle,
  Bell,
  Volume2,
} from "lucide-react";

import DynamicTable from "../components/microcomponents/DynamicTable";
import { getQueueTokens, patchQueueTokenStatus } from "../utils/masterService";

const QueueManagement = () => {
  const [allTokens, setAllTokens] = useState([]);
  const [queueStats, setQueueStats] = useState({});
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [loading, setLoading] = useState(false);

  /* ✅ Convert [YYYY,MM,DD,HH,MM,SS,ns] → JS Date */
  const parseDateArray = (arr) => {
    if (!Array.isArray(arr)) return null;
    const [y, M, d, h, m, s, ns] = arr;
    return new Date(y, M - 1, d, h, m, s, Math.floor(ns / 1_000_000));
  };

  /** ✅ Fetch queue list */
  const loadTokens = async () => {
    try {
      setLoading(true);
      const res = await getQueueTokens();
      setAllTokens(res?.data || []);
    } catch (err) {
      console.error("Error fetching queue tokens", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTokens();
  }, []);

  /** ✅ Speak token */
  const announcePatient = (token) => {
    if (!voiceEnabled) return;

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(
        `Token ${token.tokenNumber}, ${token.patientName}, please come inside`
      );

      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 1;

      const voices = window.speechSynthesis.getVoices();
      utterance.voice =
        voices.find((v) => v.lang === "en-IN") ||
        voices.find((v) => v.lang.includes("en"));

      window.speechSynthesis.speak(utterance);
    }
  };

  /** ✅ Update status + announce */
  const handleStatusChange = async (id, newStatus) => {
    const formatted = newStatus.toUpperCase();

    try {
      await patchQueueTokenStatus(id, formatted);

      setAllTokens((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: formatted } : item
        )
      );

      if (formatted === "CALLED") {
        const token = allTokens.find((t) => t.id === id);
        if (token) announcePatient(token);
      }
    } catch (err) {
      console.error("Error updating status", err);
    }
  };

  /** ✅ Stats */
  useEffect(() => {
    const today = new Date().toDateString();

    const todayTokens = allTokens.filter((token) => {
      const dt = parseDateArray(token.generatedAt);
      return dt && dt.toDateString() === today;
    });

    const stats = {
      total: todayTokens.length,
      waiting: todayTokens.filter((t) => t.status === "WAITING").length,
      called: todayTokens.filter((t) => t.status === "CALLED").length,
      completed: todayTokens.filter((t) => t.status === "COMPLETED").length,
      cancelled: todayTokens.filter((t) => t.status === "CANCELLED").length,
      emergency: todayTokens.filter((t) => t.priority === "EMERGENCY").length,
    };

    setQueueStats(stats);
  }, [allTokens]);

  /** ✅ Status dropdown options */
  const statusOptions = [
    { value: "WAITING", label: "Waiting" },
    { value: "CALLED", label: "Called" },
    { value: "COMPLETED", label: "Completed" },
    { value: "CANCELLED", label: "Cancelled" },
  ];

  /** ✅ Table columns */
  const columns = [
    { header: "Token", accessor: "tokenNumber" },

    {
      header: "Patient",
      accessor: "patientName",
      cell: (row) => (
        <div>
          <div className="font-medium">{row.patientName}</div>
          <div className="text-xs text-gray-500">{row.phoneNumber}</div>
        </div>
      ),
    },

    /** ✅ Department */
    {
      header: "Department",
      accessor: "department",
      cell: (row) => row.departmentName,
    },

    /** ✅ Doctor */
    {
      header: "Doctor",
      accessor: "doctorName",
      cell: (row) => (
        <div>
          <div className="font-medium">{row.doctorName}</div>
        </div>
      ),
    },

    /** ✅ Priority */
    {
      header: "Priority",
      accessor: "priorityLevel",
      cell: (row) => (
        <div
          className={`px-2 py-1 rounded text-xs font-medium
          ${
            row.priorityLevel === "EMERGENCY"
              ? "bg-red-100 text-red-600"
              : "bg-blue-100 text-blue-600"
          }`}
        >
          {row.priorityLevel}
        </div>
      ),
    },

    /** ✅ Status with Dropdown */
    {
      header: "Status",
      accessor: "status",
      cell: (row) => (
        <select
          value={row.status}
          onChange={(e) => handleStatusChange(row.id, e.target.value)}
          className={`border rounded px-2 py-1 text-xs font-medium ${
            row.status === "WAITING"
              ? "border-yellow-300 bg-yellow-50 text-yellow-800"
              : row.status === "CALLED"
              ? "border-blue-300 bg-blue-50 text-blue-800"
              : row.status === "COMPLETED"
              ? "border-green-300 bg-green-50 text-green-800"
              : "border-red-300 bg-red-50 text-red-800"
          }`}
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ),
    },

    /** ✅ Generated Date & Time */
    {
      header: "Generated",
      accessor: "generatedAt",
      cell: (row) => {
        const dt = parseDateArray(row.generatedAt);

        return (
          <div className="text-xs">
            <div>
              {dt?.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
            <div className="text-gray-500">
              {dt?.toLocaleDateString([], {
                month: "short",
                day: "numeric",
              })}
            </div>
          </div>
        );
      },
    },

    /** ✅ Reason */
    {
      header: "Reason",
      accessor: "reasonForVisit",
      cell: (row) => <div className="font-medium">{row.reasonForVisit}</div>,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 md:p-6">
      <div className="max-w-full mx-auto space-y-4 sm:space-y-6">
        
        {/* ✅ Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
              Queue Management System
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Manage and monitor patient queue status
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs sm:text-sm font-medium">
              Voice Announcements:
            </label>
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-xs sm:text-sm ${
                voiceEnabled
                  ? "bg-green-500 text-white"
                  : "bg-gray-300 text-gray-600"
              }`}
            >
              <Volume2 className="w-4 h-4" />
              {voiceEnabled ? "ON" : "OFF"}
            </button>
          </div>
        </div>

        {/* ✅ Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard label="Total Today" count={queueStats.total} icon={Users} />
          <StatCard label="Waiting" count={queueStats.waiting} icon={Clock} />
          <StatCard label="Called" count={queueStats.called} icon={Bell} />
          <StatCard
            label="Completed"
            count={queueStats.completed}
            icon={CheckCircle}
          />
          <StatCard
            label="Emergency"
            count={queueStats.emergency}
            icon={AlertCircle}
          />
        </div>

        {/* ✅ Table */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-lg font-bold mb-4">Token Queue</h3>
          <DynamicTable columns={columns} data={allTokens} loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default QueueManagement;

/** ✅ Stat card */
const StatCard = ({ label, count = 0, icon: Icon }) => (
  <div className="card-stat card-border-accent p-3">
    <div className="flex items-center justify-between">
      <div>
        <div className="card-stat-label">{label}</div>
        <div className="card-stat-count">{count}</div>
      </div>
      <Icon className="w-5 h-5 text-blue-500" />
    </div>
  </div>
);
