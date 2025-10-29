import React, { useState } from "react";
import { FaArrowLeft, FaDownload } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";

const statusColors = {
  "Available": "bg-green-100 text-green-700 border-green-300",
  "Booked": "bg-blue-100 text-blue-700 border-blue-300",
  "Pre-Booked": "bg-yellow-100 text-yellow-700 border-yellow-300",
  "Inactive": "bg-gray-100 text-gray-500 border-gray-300",
};

const allCategories = [
  "All",
  "General Ward",
  "ICU",
  "Private",
  "Semi-Private",
  "Deluxe Suite",
  "Private Room",
  "Emergency Room",
  "Recovery Room",
  "Isolation Ward",
  "Pediatric Ward",
  "Maternity Ward",
  "High Dependency Unit",
];

const allStatuses = [
  "All",
  "Active",
  "Inactive",
];

const BedroomReport = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [allBedroomData] = useState(location.state?.bedroomData || []);
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");

  const filteredData = allBedroomData.filter(bed =>
    (category === "All" || bed.categoryName === category) &&
    (status === "All" || bed.status === status)
  );

  const handleDownload = () => {
    const headers = ["Bed No", "Category", "Floor", "Booking Status", "Status"];
    const csvContent = [
      headers.join(","),
      ...filteredData.map(row => [
        row.bedNo,
        row.categoryName,
        row.floor,
        row.bookingStatus,
        row.status
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bedroom-report.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen m-5">
      {/* Heading with Back Button */}
      <div className="px-6 pt-8 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-2 py-2 rounded-full bg-white text-[#0E1630] border border-gray-200 shadow-sm hover:bg-green-50 transition"
          >
            <FaArrowLeft />
          </button>
          <h2 className="text-2xl font-bold text-[#0E1630]">Bedroom Report</h2>
        </div>
      </div>

      {/* Filters and Actions */}
     <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-9 gap-4 px-6 pb-4">
  {/* Left Side: Filters */}
  <div className="flex gap-2 flex-wrap">
    <select
      className="px-3 py-2 rounded-md border border-gray-200 bg-white text-sm text-gray-700 shadow-sm focus:outline-none"
      value={category}
      onChange={e => setCategory(e.target.value)}
    >
      {allCategories.map(cat => (
        <option key={cat} value={cat}>{cat}</option>
      ))}
    </select>

    <select
      className="px-3 py-2 rounded-md border border-gray-200 bg-white text-sm text-gray-700 shadow-sm focus:outline-none"
      value={status}
      onChange={e => setStatus(e.target.value)}
    >
      {allStatuses.map(st => (
        <option key={st} value={st}>{st}</option>
      ))}
    </select>
  </div>

  {/* Right Side: Download Button */}
  <div>
    <button
      onClick={handleDownload}
      className="flex items-center gap-2 btn btn-primary"
    >
      <FaDownload />
      Download
    </button>
  </div>
</div>


      {/* Bedroom Grid Cards */}
      <div className="px-6 pb-8">
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
            {filteredData.map((bed, idx) => (
              <div
                key={bed.id}
                className={`rounded-xl shadow bg-white flex flex-col min-h-[140px] relative overflow-hidden hover:shadow-lg transition border-l-4 ${
                  idx % 2 === 0 ? "card-border-primary" : "card-border-accent"
                }`}
              >
                <div className="flex flex-col flex-1 px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-lg text-[#0E1630]">
                      Bed {bed.bedNo}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold border ${
                        statusColors[bed.bookingStatus] || "bg-gray-100 text-gray-500 border-gray-300"
                      }`}
                    >
                      {bed.bookingStatus}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mb-1">{bed.categoryName}</div>
                  <div className="text-xs text-gray-400 mb-2">{bed.floor}</div>
                  <div className="flex items-center gap-2 mt-auto">
                    <span className="text-xs text-gray-500">Status:</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        bed.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {bed.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {filteredData.length === 0 && (
              <div className="col-span-full text-center text-gray-500 py-10">
                No beds found matching the selected filters.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BedroomReport;
