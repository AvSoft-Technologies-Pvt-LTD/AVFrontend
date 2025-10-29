import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  RiUser3Fill, RiHospitalFill, RiStethoscopeFill, RiFlaskFill,
  RiStoreFill, RiMoneyDollarCircleFill,
} from "react-icons/ri";
import { motion } from "framer-motion";
const SuperAdminDashboardOverview = () => {
  const [userSummary, setUserSummary] = useState({});
  const [revenue, setRevenue] = useState({});
  const [pendingRegistrations, setPendingRegistrations] = useState({});
  const [loading, setLoading] = useState(true);
  const modules = [
    { key: "patients", label: "Patients" },
    { key: "doctors", label: "Doctors" },
    { key: "hospitals", label: "Hospitals" },
    { key: "labs", label: "Labs" },
    { key: "pharmacies", label: "Pharmacies" },
  ];
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [s, r, p] = await Promise.all([
          axios.get("https://mocki.io/v1/74d15665-16d3-4c26-8736-343520e846a5"),
          axios.get("https://mocki.io/v1/6213ab4b-3ae1-484f-92c4-6dafa5872cf8"),
          axios.get("https://mocki.io/v1/10d5a076-bf81-4da1-9c6b-b1b907ff5609"),
        ]);
        setUserSummary(s.data);
        setRevenue(r.data);
        setPendingRegistrations(p.data);
      } catch (e) {
        console.error("Dashboard error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  const cards = [
    {
      label: "Patients",
      count: userSummary.patients,
      icon: <RiUser3Fill className="h-6 w-6 text-[var(--color-surface)]" />,
      cardClass: "card-stat-primary",
      iconClass: "card-icon-primary",
    },
    {
      label: "Doctors",
      count: userSummary.doctors,
      icon: <RiStethoscopeFill className="h-6 w-6 text-[var(--color-surface)]" />,
      cardClass: "card-stat-accent",
      iconClass: "card-icon-accent",
    },
    {
      label: "Hospitals",
      count: userSummary.hospitals,
      icon: <RiHospitalFill className="h-6 w-6 text-[var(--color-surface)]" />,
      cardClass: "card-stat-primary",
      iconClass: "card-icon-primary",
    },
    {
      label: "Labs",
      count: userSummary.labs,
      icon: <RiFlaskFill className="h-6 w-6 text-[var(--color-surface)]" />,
      cardClass: "card-stat-accent",
      iconClass: "card-icon-accent",
    },
    {
      label: "Pharmacies",
      count: userSummary.pharmacies,
      icon: <RiStoreFill className="h-6 w-6 text-[var(--color-surface)]" />,
      cardClass: "card-stat-primary",
      iconClass: "card-icon-primary",
    },
  ];
  if (loading)
    return <div className="p-6 text-center text-gray-600">Loading Dashboard...</div>;
  return (
    <div className="min-h-screen p-6 text-[var(--primary-color)] space-y-6">
      <h3 className="h3-heading mb-4 mt-4">Super Admin Dashboard</h3>
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map(({ label, count, icon, cardClass, iconClass }, idx) => (
          <motion.div
            key={label}
            className={`card-stat ${cardClass} flex flex-col justify-between`}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: idx * 0.12, duration: 0.5, type: "spring" }}
            whileHover={{ scale: 1.04, boxShadow: "0 8px 24px rgba(0,0,0,0.10)" }}
          >
            <div className="flex items-center gap-2 card-stat-label">
              <span className={`${iconClass} card-icon card-icon-white`}>{icon}</span>
              <span>{label}</span>
            </div>
            <div className="card-stat-count">
              {count?.toLocaleString() || 0}
            </div>
          </motion.div>
        ))}
      </div>
      <motion.div
        className="bg-[var(--color-surface)] rounded-xl shadow-lg p-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        <h5 className="subheading mb-6 flex items-center gap-2 text-lg font-semibold">
          <RiMoneyDollarCircleFill className="text-[var(--accent-color)] text-2xl" />
          Revenue Summary
        </h5>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {["total", "month", "today"].map((k, i) => (
            <motion.div
              key={k}
              className="flex flex-col items-center justify-center bg-gradient-to-br from-[var(--accent-color-light)] to-[var(--color-surface)] rounded-lg shadow-md border border-[var(--accent-color)] p-5 transition-all hover:scale-105 hover:shadow-xl"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.8 + i * 0.12, duration: 0.5, type: "spring" }}
              whileHover={{ scale: 1.07, boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}
            >
              <span className="uppercase tracking-wide text-xs text-[var(--accent-color)] font-bold mb-2">
                {k === "total" ? "Total Revenue" : k === "month" ? "This Month" : "Today"}
              </span>
              <h4 className="h4-heading text-2xl font-extrabold text-[var(--primary-color)] mb-1">
                ₹{revenue[k]?.toLocaleString("en-IN") || 0}
              </h4>
            </motion.div>
          ))}
        </div>
      </motion.div>
      {/* Module-wise Pending Registrations & Revenue Table */}
      <table className="min-w-full divide-y divide-gray-100 text-sm bg-white rounded-lg shadow-md overflow-hidden">
        <thead className="bg-[var(--primary-color)] text-white">
          <tr>
            <th className="px-5 py-3 text-left text-md font-bold   tracking-wider">
              Module
            </th>
            <th className="px-5 py-3 text-left text-md font-bold tracking-wider">
              Pending Registeration
            </th>
            <th className="px-5 py-3 text-left text-md font-bold  tracking-wider">
              Revenue (Amount)
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {modules.map((mod, i) => (
            <motion.tr
              key={mod.key}
              initial={{ opacity: 0, x: -25 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.1 + i * 0.1, duration: 0.4 }}
              className="hover:bg-gray-50 transition-all"
            >
              <td className="px-5 py-3 capitalize font-medium text-gray-700">
                {mod.label}
              </td>
              <td className="px-5 py-3 font-semibold text-[var(--primary-color)]">
                {pendingRegistrations[mod.key] ?? 0}
              </td>
              <td className="px-5 py-3 font-semibold text-[var(--accent-color)]">
                ₹{(revenue[mod.key] ?? 50).toLocaleString("en-IN")}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>);};export default SuperAdminDashboardOverview;