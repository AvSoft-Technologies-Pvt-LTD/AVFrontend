import React, { useState, useEffect } from "react";
import { Monitor, Clock, AlertCircle } from "lucide-react";
import DynamicTable from "./microcomponents/DynamicTable";
import { getQueueTokens } from "../utils/masterService";

const TOKENS_KEY = "hospital_tokens";

const DisplayBoard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [allTokens, setAllTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTokens = async () => {
    try {
      setLoading(true);
      const response = await getQueueTokens();
      console.log("Fetched tokens from API:", response.data);

      const tokens = response.data.map((t) => ({
        ...t,
        generatedAt: new Date(t.generatedAt),
      }));

      setAllTokens(tokens);
      localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
    } catch (err) {
      console.error("Failed to fetch tokens:", err);
      setError("Failed to fetch tokens. Using local data if available.");

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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
      accessor: "departmentName",
      cell: (row) => `${row.departmentName}`,
    },
    {
      header: "Doctor",
      accessor: "doctorName",
      cell: (row) => `${row.doctorName}`,
    },
    {
      header: "Priority",
      accessor: "priorityLevel",
      cell: (row) => (
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            row.priorityLevel === "EMERGENCY"
              ? "bg-red-500 text-white"
              : "bg-green-500 text-white"
          }`}
        >
          <AlertCircle className="w-3 h-3" />
          {row.priorityLevel}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => (
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            row.status === "CALLED"
              ? "bg-blue-500 text-white"
              : "bg-gray-500 text-white"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      header: "Estimated Wait (mins)",
      accessor: "estimatedWaitMinutes",
    },
  ];

  const filters = [
    {
      key: "status",
      label: "Status",
      options: [
        { value: "WAITING", label: "Waiting" },
        { value: "CALLED", label: "Called" },
      ],
    },
    {
      key: "priorityLevel",
      label: "Priority",
      options: [
        { value: "NORMAL", label: "Normal" },
        { value: "EMERGENCY", label: "Emergency" },
      ],
    },
  ];

  const waitingTokens = allTokens.filter((t) => t.status === "WAITING");
  const calledTokens = allTokens.filter((t) => t.status === "CALLED").slice(0, 3);
  const displayTokens = [...waitingTokens, ...calledTokens];

  if (loading) {
    return <div className="text-center py-8">Loading tokens...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-white text-black p-0 m-0">
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

      <div className="w-full mx-auto p-0 m-0 bg-white rounded-none border-none">
        <h2 className="text-base md:text-lg font-bold mb-2 text-[var(--color-surface)] text-start pl-2">
          Waiting and Recently Called Tokens
        </h2>
        <div className="overflow-x-auto">
          <DynamicTable
            data={displayTokens}
            columns={columns}
            filters={filters}
            className="w-full border-none"
          />
        </div>
      </div>
    </div>
  );
};

export default DisplayBoard;
