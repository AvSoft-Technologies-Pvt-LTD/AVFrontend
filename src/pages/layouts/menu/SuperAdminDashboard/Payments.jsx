import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { RiMoneyDollarCircleLine, RiArrowUpDownLine, RiBankLine, RiPercentLine } from "react-icons/ri";

// Styled Card Component with icon & theme variant
const Card = ({ title, value, icon: Icon, variant }) => {
  const borderColorClass = variant === "primary" ? "card-border-primary" : "card-border-accent";
  const iconBgClass = variant === "primary" ? "card-icon-primary" : "card-icon-accent";

  return (
    <div className={`card-stat ${borderColorClass}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="card-stat-label">{title}</p>
          <h2 className="card-stat-count">₹ {value.toLocaleString()}</h2>
        </div>
        <div className={`card-icon ${iconBgClass} card-icon-white`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.3, delayChildren: 0.2 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const SuperAdminRevenue = () => {
  const [entityType, setEntityType] = useState("All"),
    [selectedCity, setSelectedCity] = useState("All"),
    [startDate, setStartDate] = useState(""),
    [endDate, setEndDate] = useState(""),
    [searchQuery, setSearchQuery] = useState(""),
    [page, setPage] = useState(1),
    [data, setData] = useState([]),
    [commissionRates, setCommissionRates] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get("https://mocki.io/v1/78898338-a2bc-4837-8bb1-b9dc7e9b7684");
        const resData = Array.isArray(res.data) ? res.data : res.data.payments || [];
        setData(resData);
        const initial = {};
        resData.filter(d => d.type === "credited").forEach(d => {
          const key = `${d.id}-${d.date}`;
          if (!(key in initial)) initial[key] = 10;
        });
        setCommissionRates(initial);
      } catch (e) {
        console.error("Error loading revenue data", e);
      }
    })();
  }, []);

  const filtered = data.filter(d =>
    (entityType === "All" || d.entity === entityType) &&
    (selectedCity === "All" || d.city === selectedCity) &&
    (!startDate || d.date >= startDate) &&
    (!endDate || d.date <= endDate) &&
    (d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.id.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getKey = d => `${d.id}-${d.date}`;
  const calcCommission = d => ((commissionRates[getKey(d)] || 0) * d.amount) / 100;

  const credited = filtered.filter(d => d.type === "credited").reduce((a, d) => a + d.amount, 0);
  const debited = filtered.filter(d => d.type === "debited").reduce((a, d) => a + d.amount, 0);
  const totalCommission = filtered.filter(d => d.type === "credited").reduce((a, d) => a + calcCommission(d), 0);

  const itemsPerPage = 5;
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  useEffect(() => { if (page > totalPages) setPage(1); }, [totalPages, page]);

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="p-6 space-y-6 bg-gray-50">
      <motion.h1 variants={sectionVariants} className="text-3xl font-semibold text-gray-800">Revenue</motion.h1>

      {/* Stat Cards with alternate colors/icons */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={cardVariants}>
          <Card title="Total Credited" value={credited} icon={RiBankLine} variant="primary" />
        </motion.div>
        <motion.div variants={cardVariants}>
          <Card title="Total Debited" value={debited} icon={RiArrowUpDownLine} variant="accent" />
        </motion.div>
        <motion.div variants={cardVariants}>
          <Card title="Net Revenue" value={credited - debited} icon={RiMoneyDollarCircleLine} variant="primary" />
        </motion.div>
        <motion.div variants={cardVariants}>
          <Card title="Total Commission" value={totalCommission} icon={RiPercentLine} variant="accent" />
        </motion.div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={sectionVariants} className="flex flex-row gap-3 items-center w-full">
        <select value={entityType} onChange={e => setEntityType(e.target.value)} className="input-field w-auto">
          {["All", "Hospital", "Pharmacy", "Lab", "AV Swasthya Dr", "Freelancer Doctor"].map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <select value={selectedCity} onChange={e => setSelectedCity(e.target.value)} className="input-field w-auto">
          {["All", ...new Set(data.map(d => d.city))].map(city => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
        <div className="floating-input relative w-xl" data-placeholder="Search name or ID">
  <input
    type="text"
    value={searchQuery}
    onChange={e => setSearchQuery(e.target.value)}
    placeholder=" "
    className="input-field peer"
  />
</div>
      </motion.div>

      {/* Table */}
      <motion.div variants={sectionVariants} className="overflow-x-auto">
        <table className="table-container">
          <thead>
            <tr className="table-head">
              {["ID", "Name", "Entity", "Type", "Amount (₹)", "Commission %", "Date", "Alert"].map((h, i) => (
                <th key={i} className="p-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="table-body">
            {paginated.length ? paginated.map((d, i) => {
              const key = getKey(d),
                isCredited = d.type === "credited",
                editable = isCredited && d.amount > 25000;
              return (
                <tr key={i} className="tr-style hover:bg-gray-50">
                  <td>{d.id}</td><td>{d.name}</td><td>{d.entity}</td>
                  <td className={`capitalize ${isCredited ? "text-green-600" : "text-red-600"}`}>{d.type}</td>
                  <td>{d.amount.toLocaleString()}</td>
                  <td>
                    {isCredited ? (
                      <input type="number" value={commissionRates[key]} min="0" max="100"
                        onChange={e => setCommissionRates(r => ({ ...r, [key]: parseFloat(e.target.value) || 0 }))}
                        disabled={!editable} className={`input-field w-16 ${!editable ? "bg-gray-100 text-gray-400" : ""}`} />
                    ) : "-"}
                  </td>
                  <td>{d.date}</td>
                  <td>{editable ? <span className="text-red-600 font-semibold">High Profit</span> : "-"}</td>
                </tr>
              );
            }) : (
              <tr><td colSpan="8" className="text-center p-6 text-gray-500">No revenue data found.</td></tr>
            )}
          </tbody>
        </table>
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div variants={sectionVariants} className="flex justify-end items-center gap-3 mt-4">
          <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="edit-btn">Previous</button>
          <span>Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages} className="edit-btn">Next</button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default SuperAdminRevenue;