import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, AlertTriangle } from "lucide-react";
import { getSpecializationsWithWards } from "../../../../../utils/CrudService";

const SmallDynamicTable = ({ columns, data }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
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
        {data.map((row, rowIndex) => (
          <tr key={row.id || rowIndex}>
            {columns.map((column, colIndex) => (
              <td
                key={colIndex}
                className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
              >
                {row[column.accessor]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const columns = [
  { header: "Department / Specialization", accessor: "department" },
  { header: "Ward", accessor: "ward" },
  { header: "Ward Type", accessor: "wardType" },
  { header: "Rooms", accessor: "rooms" },
  { header: "Total Beds", accessor: "totalBeds" },
  { header: "Occupied", accessor: "occupied" },
  { header: "Available", accessor: "available" },
];

const ReviewAndSaveStep = ({ bedMasterData, occupiedStatusId = 2 }) => {
  const [summaryData, setSummaryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const transformSpecializationsToSummary = (specializations) => {
    const rows = [];

    specializations.forEach((spec) => {
      const departmentName = spec.specializationName || spec.specialization || "Unknown";
      const wards = Array.isArray(spec.wards) ? spec.wards : [];

      wards.forEach((ward) => {
        const wardName = ward.wardName || ward.name || `Ward ${ward.wardId || ""}`;
        const wardType = ward.wardTypeName || ward.wardType || "N/A";
        const rooms = Array.isArray(ward.rooms) ? ward.rooms : [];

        const allBeds = rooms.flatMap((room) => (Array.isArray(room.beds) ? room.beds : []));
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

        rows.push({
          id: ward.wardId || `${spec.specializationId}-${ward.wardId || ward.wardName}`,
          department: departmentName,
          ward: wardName,
          wardType,
          rooms: rooms.length,
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

    const departments = Array.isArray(local.departments) ? local.departments : [];
    const wards = Array.isArray(local.wards) ? local.wards : [];
    const rooms = Array.isArray(local.rooms) ? local.rooms : [];
    const beds = Array.isArray(local.beds) ? local.beds : [];

    departments.forEach((dept) => {
      const deptId = dept.id || dept.specializationId || dept.specializationId;
      const deptName = dept.name || dept.specializationName || dept.specialization || "Unknown";

      const deptWards = wards.filter((w) => String(w.departmentId || w.specializationId) === String(deptId));

      deptWards.forEach((ward) => {
        const wardId = ward.id;
        const wardName = ward.wardName || ward.name || `Ward ${wardId || ""}`;
        const wardType = ward.wardTypeName || ward.typeName || ward.type || ward.wardType || "N/A";

        const wardRooms = rooms.filter((r) => String(r.wardId) === String(wardId));
        const roomCount = wardRooms.length;

        const allBeds = wardRooms.flatMap((room) => beds.filter((b) => String(b.roomId) === String(room.id)));

        const totalBeds = allBeds.length;
        const occupied = allBeds.filter((b) => {
          if (typeof b.bedStatusId !== "undefined") return Number(b.bedStatusId) === Number(occupiedStatusId);
          if (typeof b.status === "string") return b.status.toLowerCase() === "occupied";
          if (typeof b.occupied !== "undefined") return Boolean(b.occupied);
          return false;
        }).length;
        const available = totalBeds - occupied;

        rows.push({
          id: wardId || `${deptId}-${wardName}`,
          department: deptName,
          ward: wardName,
          wardType,
          rooms: roomCount,
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
        if (bedMasterData && (Array.isArray(bedMasterData.departments) || Array.isArray(bedMasterData.wards))) {
          const transformed = transformLocalBedMasterToSummary(bedMasterData);
          if (mounted) setSummaryData(transformed);
          setLoading(false);
          return;
        }

        if (Array.isArray(bedMasterData)) {
          const transformed = transformSpecializationsToSummary(bedMasterData);
          if (mounted) setSummaryData(transformed);
          setLoading(false);
          return;
        }

        if (bedMasterData && Array.isArray(bedMasterData.specializations)) {
          const transformed = transformSpecializationsToSummary(bedMasterData.specializations);
          if (mounted) setSummaryData(transformed);
          setLoading(false);
          return;
        }

        const resp = await getSpecializationsWithWards();
        const data = resp?.data;
        if (!Array.isArray(data)) {
          throw new Error("Unexpected data shape from /specializations/wards - expected an array.");
        }
        const transformed = transformSpecializationsToSummary(data);
        if (mounted) setSummaryData(transformed);
      } catch (err) {
        console.error("Failed to load specializations with wards:", err);
        if (mounted) setError(err.message || "Failed to fetch data.");
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
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <Check className="text-green-600" size={20} />
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Review & Save</h2>
      </div>

      {loading ? (
        <div className="text-center py-8 sm:py-12 bg-white rounded-lg border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600">Loading ward & bed data...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8 sm:py-12 bg-red-50 rounded-lg border border-red-200 shadow-sm">
          <AlertTriangle className="mx-auto mb-4 text-red-400" size={40} />
          <h3 className="text-base sm:text-lg font-semibold text-red-600">Error loading data</h3>
          <p className="text-sm sm:text-base text-red-500">{error}</p>
        </div>
      ) : summaryData && summaryData.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-base sm:text-lg font-semibold pt-4 sm:pt-6 px-4 sm:px-6 pb-2">Data Summary</h3>
          <div className="px-4 sm:px-6 pb-4">
            <SmallDynamicTable columns={columns} data={summaryData} />
          </div>
        </div>
      ) : (
        <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-lg">
          <AlertTriangle className="mx-auto mb-4 text-gray-400" size={40} />
          <h3 className="text-base sm:text-lg font-semibold text-gray-600">No Data to Review</h3>
          <p className="text-sm sm:text-base text-gray-500">Please add departments, wards, rooms, and beds first.</p>
        </div>
      )}
    </motion.div>
  );
};

export default ReviewAndSaveStep;