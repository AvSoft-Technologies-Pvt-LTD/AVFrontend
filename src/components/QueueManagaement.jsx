import React, { useState, useEffect } from "react";
import {
  Users,
  Clock,
  AlertCircle,
  CheckCircle,
  Bell,
  Volume2,
} from "lucide-react";
import DynamicTable from "../components/microcomponents/DynamicTable"; // 👈 import reusable table

const TOKENS_KEY = "hospital_tokens";

const QueueManagement = ({ tokens, onTokensUpdate }) => {
  const [allTokens, setAllTokens] = useState(tokens || []);
  const [queueStats, setQueueStats] = useState({});
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  useEffect(() => {
    if (tokens && tokens.length > 0) {
      setAllTokens(tokens);
    } else {
      const stored = localStorage.getItem(TOKENS_KEY);
      if (stored) {
        try {
          setAllTokens(
            JSON.parse(stored).map((t) => ({
              ...t,
              generatedAt: new Date(t.generatedAt),
            }))
          );
        } catch {
          setAllTokens([]);
        }
      } else {
        setAllTokens([]);
      }
    }
  }, [tokens]);

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

  useEffect(() => {
    const now = new Date();
    const todayTokens = allTokens.filter(
      (token) => new Date(token.generatedAt).toDateString() === now.toDateString()
    );
    const stats = {
      total: todayTokens.length,
      waiting: todayTokens.filter((t) => t.status === "waiting").length,
      called: todayTokens.filter((t) => t.status === "called").length,
      completed: todayTokens.filter((t) => t.status === "completed").length,
      cancelled: todayTokens.filter((t) => t.status === "cancelled").length,
      emergency: todayTokens.filter((t) => t.priority === "emergency").length,
    };
    setQueueStats(stats);
  }, [allTokens]);

  const handleStatusChange = (tokenId, newStatus) => {
    const updated = allTokens.map((t) =>
      t.id === tokenId ? { ...t, status: newStatus } : t
    );
    const token = updated.find((t) => t.id === tokenId);
    setAllTokens(updated);
    localStorage.setItem(TOKENS_KEY, JSON.stringify(updated));
    onTokensUpdate && onTokensUpdate(updated);
    if (newStatus === "called" && token)
      setTimeout(() => announcePatient(token), 200);
  };

  // Departments
  const departments = [
    { value: "general", label: "General Medicine" },
    { value: "cardiology", label: "Cardiology" },
    { value: "orthopedic", label: "Orthopedic" },
    { value: "pediatrics", label: "Pediatrics" },
    { value: "gynecology", label: "Gynecology" },
    { value: "emergency", label: "Emergency" },
    { value: "dermatology", label: "Dermatology" },
    { value: "neurology", label: "Neurology" },
  ];

  // Status options
  const statusOptions = [
    { value: "waiting", label: "Waiting" },
    { value: "called", label: "Called" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  // Priority
  const priorityOptions = [
    { value: "normal", label: "Normal" },
    { value: "emergency", label: "Emergency" },
  ];

  // Columns for DynamicTable
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
    {
      header: "Department",
      accessor: "department",
      cell: (row) =>
        departments.find((d) => d.value === row.department)?.label ||
        row.department,
    },
    { header: "Doctor", accessor: "doctorName" },
    {
      header: "Priority",
      accessor: "priority",
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.priority === "emergency"
              ? "bg-red-100 text-red-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {row.priority}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => (
        <select
          value={row.status}
          onChange={(e) => handleStatusChange(row.id, e.target.value)}
          className={`border rounded px-2 py-1 text-xs font-medium ${
            row.status === "waiting"
              ? "border-yellow-300 bg-yellow-50 text-yellow-800"
              : row.status === "called"
              ? "border-blue-300 bg-blue-50 text-blue-800"
              : row.status === "completed"
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
    {
      header: "Generated",
      accessor: "generatedAt",
      cell: (row) => (
        <div className="text-xs">
          <div>
            {new Date(row.generatedAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
          <div className="text-gray-500">
            {new Date(row.generatedAt).toLocaleDateString([], {
              month: "short",
              day: "numeric",
            })}
          </div>
        </div>
      ),
    },
    { header: "Reason", accessor: "reason" },
  ];

  // Filters for DynamicTable
  const filters = [
    {
      key: "department",
      label: "Department",
      options: departments,
    },
    {
      key: "status",
      label: "Status",
      options: statusOptions,
    },
    {
      key: "priority",
      label: "Priority",
      options: priorityOptions,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 md:p-6">
      <div className="max-w-full mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
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

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="card-stat card-border-primary p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="card-stat-label">Total Today</div>
                <div className="card-stat-count">{queueStats.total || 0}</div>
              </div>
              <Users className="text-[var(--primary-color)] w-5 h-5" />
            </div>
          </div>
          <div className="card-stat card-border-accent p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="card-stat-label">Waiting</div>
                <div className="card-stat-count">{queueStats.waiting || 0}</div>
              </div>
              <Clock className="text-[var(--accent-color)] w-5 h-5" />
            </div>
          </div>
          <div className="card-stat card-border-primary p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="card-stat-label">Called</div>
                <div className="card-stat-count">{queueStats.called || 0}</div>
              </div>
              <Bell className="text-blue-500 w-5 h-5" />
            </div>
          </div>
          <div className="card-stat card-border-accent p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="card-stat-label">Completed</div>
                <div className="card-stat-count">{queueStats.completed || 0}</div>
              </div>
              <CheckCircle className="text-green-500 w-5 h-5" />
            </div>
          </div>
          <div className="card-stat card-border-primary p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="card-stat-label">Emergency</div>
                <div className="card-stat-count">{queueStats.emergency || 0}</div>
              </div>
              <AlertCircle className="text-red-500 w-5 h-5" />
            </div>
          </div>
        </div>

        {/* ✅ DynamicTable instead of static table */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-lg font-bold mb-4">Token Queue</h3>
          <DynamicTable
            columns={columns}
            data={allTokens}
            filters={filters}
            showSearchBar={true}
          />
        </div>
      </div>
    </div>
  );
};

export default QueueManagement;
