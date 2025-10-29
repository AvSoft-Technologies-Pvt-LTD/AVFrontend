import React, { useState, useEffect } from "react";
import { Monitor, Clock, AlertCircle } from "lucide-react";
import DynamicTable from "./microcomponents/DynamicTable";

const TOKENS_KEY = "hospital_tokens";

const DisplayBoard = ({ tokens }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [allTokens, setAllTokens] = useState(tokens || []);

  useEffect(() => {
    if (tokens && tokens.length > 0) {
      setAllTokens(tokens);
    } else {
      const stored = localStorage.getItem(TOKENS_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored).map((t) => ({
            ...t,
            generatedAt: new Date(t.generatedAt),
          }));
          setAllTokens(parsed);
        } catch (e) {
          console.error("Failed to parse stored tokens:", e);
          setAllTokens([]);
        }
      } else {
        setAllTokens([]);
      }
    }
  }, [tokens]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Prepare columns for DynamicTable
  const columns = [
    {
      header: "Token",
      accessor: "tokenNumber",
    },
    {
      header: "Patient",
      accessor: "patientName",
    },
    {
      header: "Department",
      accessor: "departmentLabel",
      cell: (row) => row.departmentLabel || row.department,
    },
    {
      header: "Doctor",
      accessor: "doctorName",
    },
    {
      header: "Priority",
      accessor: "priority",
      cell: (row) => (
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            row.priority === "emergency"
              ? "bg-red-500 text-white"
              : "bg-green-500 text-white"
          }`}
        >
          <AlertCircle className="w-3 h-3" />
          {row.priority}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => (
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            row.status === "called"
              ? "bg-blue-500 text-white"
              : "bg-gray-500 text-white"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      header: "Estimated",
      accessor: "estimatedTime",
    },
  ];

  // Filters for DynamicTable
  const filters = [
    {
      key: "status",
      label: "Status",
      options: [
        { value: "waiting", label: "Waiting" },
        { value: "called", label: "Called" },
      ],
    },
    {
      key: "priority",
      label: "Priority",
      options: [
        { value: "normal", label: "Normal" },
        { value: "emergency", label: "Emergency" },
      ],
    },
  ];

  // Show waiting + top 3 called tokens
  const waitingTokens = allTokens.filter((t) => t.status === "waiting");
  const calledTokens = allTokens.filter((t) => t.status === "called").slice(0, 3);
  const displayTokens = [...waitingTokens, ...calledTokens];

  return (
    <div className="min-h-screen bg-white text-black p-0 m-0">
      {/* Header */}
      <div className="text-center mb-2 p-2">
        <h1 className="text-lg md:text-xl lg:text-2xl font-bold my-2 text-[var(--accent-color)]">
          Hospital Queue Management
        </h1>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-1 text-xs sm:text-sm">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{currentTime.toLocaleTimeString()}</span>
          </div>
          <span className="mx-1 hidden sm:inline">|</span>
          <span>{currentTime.toLocaleDateString()}</span>
        </div>
      </div>

      {/* DynamicTable for tokens */}
      <div className="w-full mx-auto p-0 m-0 bg-white rounded-none border-none">
        <h2 className="text-base md:text-lg font-bold mb-2 text-[var(--color-surface)] text-start pl-2">
          Waiting and Recently Called Tokens
        </h2>
        <div className="overflow-x-auto">
          <DynamicTable
            data={displayTokens}
            columns={columns}
            className="w-full border-none"
          />
        </div>
      </div>
    </div>
  );
};

export default DisplayBoard;