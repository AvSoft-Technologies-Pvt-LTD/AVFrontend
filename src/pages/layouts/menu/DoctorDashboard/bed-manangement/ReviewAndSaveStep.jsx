import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { getSpecializationsWithWards } from "../../../../../utils/CrudService";

const RoomDetails = ({ room, wardName, bedsCount }) => {
  // Support both local (roomPrice) and API (price)
  const roomPrice = parseFloat(room.price ?? room.roomPrice ?? 0) || 0;

  return (
    <div className="border-b border-gray-100 py-3 last:border-0">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="font-medium text-sm">
            {room.name ||
              (`Room ${room.number || room.roomNumber || ""}`.trim() ||
                "Unnamed Room")}
          </h4>
          <p className="text-xs text-gray-500">{wardName}</p>
        </div>
        <div className="text-right">
          <p className="font-medium text-sm">₹{roomPrice.toFixed(2)}</p>
          <p className="text-xs text-gray-500">
            {bedsCount} bed{bedsCount !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
    </div>
  );
};

const SmallDynamicTable = ({
  columns,
  data,
  bedMasterData,
  onToggleRow,
  expandedRows,
}) => (
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8">
            {/* Empty header for expand/collapse icon */}
          </th>
          {columns.map((column, index) => (
            <th
              key={index}
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {data.map((row) => {
          const isExpanded = expandedRows.includes(row.id);

          // 🔧 FIX: match rooms by real ward id, not split('-').pop()
          const wardRooms =
            bedMasterData?.rooms?.filter((r) =>
              String(r.wardId ?? r.ward_id) ===
              String(row._wardId ?? row.id)
            ) || [];

          const hasRooms = wardRooms.length > 0;

          return (
            <React.Fragment key={row.id}>
              <tr
                className={`hover:bg-gray-50 ${
                  isExpanded ? "bg-gray-50" : ""
                }`}
                onClick={() => hasRooms && onToggleRow(row.id)}
                style={{ cursor: hasRooms ? "pointer" : "default" }}
              >
                <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">
                  {hasRooms &&
                    (isExpanded ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    ))}
                </td>
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {row[column.accessor]}
                  </td>
                ))}
              </tr>
              {isExpanded && hasRooms && (
                <tr>
                  <td
                    colSpan={columns.length + 1}
                    className="px-6 py-2 bg-gray-50"
                  >
                    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Room Details
                      </h4>
                      {wardRooms.map((room) => (
                        <RoomDetails
                          key={room.id}
                          room={room}
                          wardName={row.ward}
                          bedsCount={
                            bedMasterData?.beds?.filter(
                              (b) =>
                                String(b.roomId) === String(room.id)
                            ).length || 0
                          }
                        />
                      ))}
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          );
        })}
      </tbody>
    </table>
  </div>
);

const columns = [
  { header: "Department / Specialization", accessor: "department" },
  { header: "Ward", accessor: "ward" },
  { header: "Ward Type", accessor: "wardType" },
  { header: "Rooms", accessor: "rooms" },
  { header: "Price Range", accessor: "priceRange" },
  { header: "Total Beds", accessor: "totalBeds" },
  { header: "Occupied", accessor: "occupied" },
  { header: "Available", accessor: "available" },
];

const ReviewAndSaveStep = ({ bedMasterData, occupiedStatusId = 2 }) => {
  const [summaryData, setSummaryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedRows, setExpandedRows] = useState([]);

  const toggleRow = (rowId) => {
    setExpandedRows((prev) =>
      prev.includes(rowId)
        ? prev.filter((id) => id !== rowId)
        : [...prev, rowId]
    );
  };

  const transformSpecializationsToSummary = (specializations) => {
    const rows = [];

    specializations.forEach((spec) => {
      const departmentName =
        spec.specializationName || spec.specialization || "Unknown";
      const wards = Array.isArray(spec.wards) ? spec.wards : [];

      wards.forEach((ward) => {
        const wardId = ward.wardId || ward.id;
        const wardName =
          ward.wardName || ward.name || `Ward ${wardId || ""}`;
        const wardType =
          ward.wardTypeName || ward.wardType || "N/A";
        const rooms = Array.isArray(ward.rooms) ? ward.rooms : [];

        const allBeds = rooms.flatMap((room) =>
          Array.isArray(room.beds) ? room.beds : []
        );
        const totalBeds = allBeds.length;

        const occupied = allBeds.filter((b) => {
          if (b == null) return false;
          if (typeof b.bedStatusId !== "undefined") {
            return Number(b.bedStatusId) === Number(occupiedStatusId);
          }
          if (typeof b.status === "string") {
            return b.status.toLowerCase() === "occupied";
          }
          if (typeof b.occupied !== "undefined") {
            return Boolean(b.occupied);
          }
          return false;
        }).length;

        const available = totalBeds - occupied;
        const roomPrices = rooms
          .map((r) =>
            parseFloat(r.price ?? r.roomPrice ?? 0)
          )
          .filter((p) => p > 0);
        const minPrice =
          roomPrices.length > 0 ? Math.min(...roomPrices) : 0;
        const maxPrice =
          roomPrices.length > 0 ? Math.max(...roomPrices) : 0;

        rows.push({
          id:
            wardId ||
            `${spec.specializationId}-${ward.wardId || ward.wardName}`,
          _wardId: wardId, // 🔑 used to link rooms later
          department: departmentName,
          ward: wardName,
          wardType,
          rooms: rooms.length,
          priceRange:
            roomPrices.length > 0
              ? `₹${minPrice.toFixed(2)} - ₹${maxPrice.toFixed(2)}`
              : "N/A",
          totalBeds,
          occupied,
          available,
        });
      });
    });

    return rows;
  };

  const transformLocalBedMasterToSummary = (local) => {
    if (!local) return [];
    const rows = [];
    const departments = Array.isArray(local.departments)
      ? local.departments
      : [];
    const wards = Array.isArray(local.wards) ? local.wards : [];
    const rooms = Array.isArray(local.rooms) ? local.rooms : [];
    const beds = Array.isArray(local.beds) ? local.beds : [];

    departments.forEach((dept) => {
      const deptId = dept.id || dept.specializationId;
      const deptName =
        dept.name ||
        dept.specializationName ||
        dept.specialization ||
        "Unknown";
      const deptWards = wards.filter(
        (w) =>
          String(w.departmentId || w.specializationId) ===
          String(deptId)
      );

      deptWards.forEach((ward) => {
        const wardId = ward.id;
        const wardName =
          ward.wardName || ward.name || `Ward ${wardId || ""}`;
        const wardType =
          ward.wardTypeName ||
          ward.typeName ||
          ward.type ||
          ward.wardType ||
          "N/A";
        const wardRooms = rooms.filter(
          (r) => String(r.wardId) === String(wardId)
        );
        const roomCount = wardRooms.length;

        const allBeds = wardRooms.flatMap((room) =>
          beds.filter(
            (b) => String(b.roomId) === String(room.id)
          )
        );

        const totalBeds = allBeds.length;
        const occupied = allBeds.filter((b) => {
          if (typeof b.bedStatusId !== "undefined")
            return (
              Number(b.bedStatusId) === Number(occupiedStatusId)
            );
          if (typeof b.status === "string")
            return b.status.toLowerCase() === "occupied";
          if (typeof b.occupied !== "undefined")
            return Boolean(b.occupied);
          return false;
        }).length;

        const available = totalBeds - occupied;
        const roomPrices = wardRooms
          .map((r) =>
            parseFloat(r.price ?? r.roomPrice ?? 0)
          )
          .filter((p) => p > 0);
        const minPrice =
          roomPrices.length > 0 ? Math.min(...roomPrices) : 0;
        const maxPrice =
          roomPrices.length > 0 ? Math.max(...roomPrices) : 0;

        rows.push({
          id: wardId || `${deptId}-${wardName}`,
          _wardId: wardId, // 🔑 used to link rooms later
          department: deptName,
          ward: wardName,
          wardType,
          rooms: roomCount,
          priceRange:
            roomPrices.length > 0
              ? `₹${minPrice.toFixed(2)} - ₹${maxPrice.toFixed(2)}`
              : "N/A",
          totalBeds,
          occupied,
          available,
        });
      });
    });

    return rows;
  };

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setError(null);
      setLoading(true);

      try {
        // ✅ Prefer local stepper data if present
        if (
          bedMasterData &&
          (Array.isArray(bedMasterData.departments) ||
            Array.isArray(bedMasterData.wards))
        ) {
          const transformed =
            transformLocalBedMasterToSummary(bedMasterData);
          if (mounted) setSummaryData(transformed);
          setLoading(false);
          return;
        }

        // If the prop itself is already the API array
        if (Array.isArray(bedMasterData)) {
          const transformed =
            transformSpecializationsToSummary(bedMasterData);
          if (mounted) setSummaryData(transformed);
          setLoading(false);
          return;
        }

        // Or if wrapped as { specializations: [...] }
        if (
          bedMasterData &&
          Array.isArray(bedMasterData.specializations)
        ) {
          const transformed =
            transformSpecializationsToSummary(
              bedMasterData.specializations
            );
          if (mounted) setSummaryData(transformed);
          setLoading(false);
          return;
        }

        // Fallback: hit API
        const resp = await getSpecializationsWithWards();
        const data = resp?.data;
        if (!Array.isArray(data)) {
          throw new Error(
            "Unexpected data shape from /specializations/wards - expected an array."
          );
        }
        const transformed =
          transformSpecializationsToSummary(data);
        if (mounted) setSummaryData(transformed);
      } catch (err) {
        console.error(
          "Failed to load specializations with wards:",
          err
        );
        if (mounted)
          setError(err.message || "Failed to fetch data.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [bedMasterData, occupiedStatusId]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4 sm:space-y-6"
    >
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <Check className="text-green-600" size={20} />
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          Review & Save
        </h2>
      </div>

      {loading ? (
        <div className="text-center py-8 sm:py-12 bg-white rounded-lg border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600">
            Loading ward & bed data...
          </p>
        </div>
      ) : error ? (
        <div className="text-center py-8 sm:py-12 bg-red-50 rounded-lg border border-red-200 shadow-sm">
          <AlertTriangle
            className="mx-auto mb-4 text-red-400"
            size={40}
          />
          <h3 className="text-base sm:text-lg font-semibold text-red-600">
            Error loading data
          </h3>
          <p className="text-sm sm:text-base text-red-500">
            {error}
          </p>
        </div>
      ) : summaryData && summaryData.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-base font-semibold">Ward Summary</h3>
          </div>
          <div className="px-4 sm:px-6 pb-4">
            <SmallDynamicTable
              columns={columns}
              data={summaryData}
              bedMasterData={bedMasterData}
              onToggleRow={toggleRow}
              expandedRows={expandedRows}
            />
          </div>
        </div>
      ) : (
        <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-lg">
          <AlertTriangle
            className="mx-auto mb-4 text-gray-400"
            size={40}
          />
          <h3 className="text-base sm:text-lg font-semibold text-gray-600">
            No Data to Review
          </h3>
          <p className="text-sm sm:text-base text-gray-500">
            Please add departments, wards, rooms, and beds first.
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default ReviewAndSaveStep;
