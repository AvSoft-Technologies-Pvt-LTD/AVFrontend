// File: BedRoomList.jsx
import React, { useEffect, useState } from "react";
import { FaPlus, FaEdit, FaTrash, FaExclamationTriangle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import DynamicTable from "../../../../../components/microcomponents/DynamicTable";
import { toast } from "react-toastify";
import { getSpecializationsWardsSummary, getWardById } from "../../../../../utils/CrudService";

const statusColors = {
  Active: "text-green-600 bg-green-100",
  Inactive: "text-red-600 bg-red-100",
};
const wardColors = {
  ICU: "bg-red-50 text-red-700 border-red-200",
  ICCU: "bg-purple-50 text-purple-700 border-purple-200",
  General: "bg-blue-50 text-blue-700 border-blue-200",
  Private: "bg-green-50 text-green-700 border-green-200",
  Emergency: "bg-orange-50 text-orange-700 border-orange-200",
  Maternity: "bg-pink-50 text-pink-700 border-pink-200",
};

const BedRoomList = () => {
  const navigate = useNavigate();
  const [bedData, setBedData] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("bedMasterData")) || [];
    } catch {
      return [];
    }
  });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem("bedMasterData", JSON.stringify(bedData));
    } catch (err) {
      console.error("Failed to save bedMasterData to localStorage", err);
    }
  }, [bedData]);

  const normalizeServerItem = (item, idx) => {
    const specialization = item.specializationName ?? item.specialization ?? item.department ?? "Unknown";
    const wardName = item.wardName ?? item.ward ?? item.name ?? "Unknown";
    const total = Number(item.totalBeds ?? item.total ?? 0);
    const totalRooms = Number(item.totalRooms ?? item.rooms ?? 0);

    const availableFromGroups =
      item?.bedStatusGroups && typeof item.bedStatusGroups === "object"
        ? Number(item.bedStatusGroups.Available ?? item.bedStatusGroups.available ?? 0)
        : undefined;
    const available = typeof availableFromGroups === "number" && !Number.isNaN(availableFromGroups)
      ? availableFromGroups
      : Number(item.available ?? Math.max(0, total - Number(item.occupied ?? 0)));
    const occupied = Number(item.occupied ?? (total - available));
    
    // ✅ FIXED: Use backend ID (not generated)
    const id = item.id ?? item.wardId ?? `${specialization.replace(/\s+/g, "_")}-${wardName.replace(/\s+/g, "_")}-${idx}`;
    
    return {
      id,
      wardId: item.id ?? item.wardId, // ✅ Preserve backend ward ID
      department: specialization,
      ward: wardName,
      totalBeds: total,
      totalRooms: totalRooms,
      occupied,
      available,
      status: item.status ?? (occupied < total ? "Active" : "Inactive"),
      raw: item,
      ...item,
    };
  };

  useEffect(() => {
    let mounted = true;
    const fetchSummary = async () => {
      setLoading(true);
      try {
        const res = await getSpecializationsWardsSummary();
        const serverData = Array.isArray(res?.data) ? res.data : [];
        const normalized = serverData.map((it, i) => normalizeServerItem(it, i));
        if (mounted) {
          setBedData(normalized);
          try {
            localStorage.setItem("bedMasterData", JSON.stringify(normalized));
            window.dispatchEvent(new CustomEvent("bedMasterUpdated", { detail: normalized }));
          } catch (err) {
            console.error("Failed to persist server bed data to localStorage", err);
          }
        }
      } catch (err) {
        console.error("Failed to fetch wards summary:", err);
        toast.error("Could not load ward summary — using cached data.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchSummary();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && closeDeleteModal();
    if (deleteModalOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [deleteModalOpen]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (!e) return;
      if (e.key === "bedMasterData") {
        try {
          const newData = JSON.parse(e.newValue || "[]");
          setBedData(newData);
        } catch (error) {
          console.error("Error parsing updated bedMasterData:", error);
        }
      }
    };
    const onCustomUpdate = (ev) => {
      try {
        const payload = ev?.detail ?? JSON.parse(localStorage.getItem("bedMasterData") || "[]");
        setBedData(Array.isArray(payload) ? payload : []);
      } catch (err) {
        console.error("Failed to apply bedMasterUpdated payload", err);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("bedMasterUpdated", onCustomUpdate);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("bedMasterUpdated", onCustomUpdate);
    };
  }, []);

  const checkIPDPatients = (wardName, departmentName) => {
    try {
      const ipdData = JSON.parse(localStorage.getItem("ipdPatients") || "[]");
      return ipdData.filter(
        (patient) =>
          patient.status === "Admitted" &&
          patient.ward?.includes(wardName) &&
          patient.department === departmentName
      );
    } catch {
      return [];
    }
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setDeleteTarget(null);
    setDeleteReason("");
    setIsConfirming(false);
  };

  const performDelete = (id) => {
    setBedData((prev) => {
      const newData = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem("bedMasterData", JSON.stringify(newData));
      } catch (err) {
        console.error(err);
      }
      try {
        const logs = JSON.parse(localStorage.getItem("wardAuditLog") || "[]");
        logs.unshift({
          wardId: id,
          reason: deleteReason || "No reason provided",
          timestamp: new Date().toISOString(),
        });
        localStorage.setItem("wardAuditLog", JSON.stringify(logs));
      } catch (err) {
        console.error(err);
      }
      try {
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: "bedMasterData",
            newValue: JSON.stringify(newData),
            url: window.location.href,
          })
        );
      } catch (err) {}
      window.dispatchEvent(new CustomEvent("bedMasterUpdated", { detail: newData }));
      return newData;
    });
  };

  const handleDelete = (row) => {
    setDeleteTarget(row);
    setDeleteReason("");
    setIsConfirming(false);
    setDeleteModalOpen(true);
  };

  const handleModalDelete = () => {
    if (!deleteTarget) return;
    const { id, ward, department } = deleteTarget;
    const admittedPatients = checkIPDPatients(ward, department);
    if (admittedPatients.length > 0 || (deleteTarget.occupied ?? 0) > 0) {
      toast.error("Cannot delete: occupied beds or admitted patients exist.");
      closeDeleteModal();
      return;
    }
    performDelete(id);
    toast.success("Ward deleted successfully");
    closeDeleteModal();
  };

  const handleModalContinue = () => {
    if (!deleteReason.trim()) {
      toast.error("Please enter a reason for deletion.");
      return;
    }
    setIsConfirming(true);
  };

  const handleEdit = async (row) => {
    // ✅ FIXED: Use backend ward ID (not random ID)
    const candidateId = row?.wardId ?? row?.raw?.wardId ?? row?.raw?.id ?? row?.id ?? null;
    if (!candidateId) {
      navigate("/doctordashboard/bedroommanagement/bedmaster", { state: { editData: row } });
      return;
    }
    try {
      setEditLoading(true);
      toast.info("Loading ward details...");
      const res = await getWardById(candidateId);
      const wardPayload = res?.data ?? null;
      if (!wardPayload) {
        toast.error("Ward details not found.");
        return;
      }
      navigate("/doctordashboard/bedroommanagement/bedmaster", { state: { editData: wardPayload } });
    } catch (err) {
      console.error("Failed to load ward details for edit:", err);
      toast.error("Could not load ward details. Try again.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleCreateMaster = () => navigate("/doctordashboard/bedroommanagement/bedmaster");
  const handleView = (row) => toast.info(`Viewing details for ${row.department} - ${row.ward}`);
  const handleViewPatients = (ward, department) => {
    const patients = checkIPDPatients(ward, department);
    if (!patients.length) return toast.info("No admitted patients found.");
    toast.info(`${patients.length} patient(s) found. Open IPD list to view.`);
  };

  const handleCellClick = (row, column) => {
    if (column.accessor !== "actions") {
      handleView(row);
    }
  };

  const rowClassName = (row) => (row.status === "Inactive" ? "opacity-60" : "");

  const tabActions = [
    {
      label: "Create Master",
      icon: <FaPlus className="text-sm" />,
      onClick: handleCreateMaster,
      className: "bg-gradient-to-r from-[var(--primary-color)] to-[var(--primary-color)] text-white",
    },
  ];

  const columns = [
    {
      header: "Department",
      accessor: "department",
      cell: (row) => <span className="font-medium text-gray-900">{row.department}</span>,
      clickable: true,
    },
    {
      header: "Ward",
      accessor: "ward",
      cell: (row) => {
        const wardKey = (row.ward || "").replace(/\s+/g, "").replace(/room/i, "");
        const colorClass = wardColors[wardKey] || wardColors[row.ward] || "bg-gray-50 text-gray-700 border-gray-200";
        return <span className={`px-2 py-1 rounded-full text-sm font-medium border ${colorClass}`}>{row.ward}</span>;
      },
    },
    {
      header: "Rooms",
      accessor: "totalRooms",
      cell: (row) => {
        const rooms = Number(row.totalRooms ?? row.raw?.totalRooms ?? 0);
        return <div className="font-medium text-gray-900">{rooms}</div>;
      },
    },
    {
      header: "Beds Ratio",
      accessor: "beds",
      cell: (row) => {
        const occupied = Number(row.occupied ?? 0);
        const total = Number(row.totalBeds ?? 0);
        return (
          <div className="flex gap-3">
            <div className="font-medium text-red-600">{occupied}</div>
            <div className="font-medium text-gray-900">/ {total}</div>
          </div>
        );
      },
    },
    {
      header: "Available",
      accessor: "available",
      cell: (row) => {
        const total = Number(row.totalBeds ?? 0);
        const occupied = Number(row.occupied ?? 0);
        const available = Math.max(0, total - occupied);
        return <span className="font-medium text-green-600">{available}</span>;
      },
    },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[row.status] || ""}`}>{row.status}</span>,
    },
    {
      header: "Actions",
      accessor: "actions",
      cell: (row) => (
        <div className="flex gap-2">
          <button onClick={() => handleEdit(row)} className="p-2 text-green-500 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors" title="Edit" disabled={editLoading}>
            <FaEdit size={14} />
          </button>
          <button onClick={() => handleDelete(row)} className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
            <FaTrash size={14} />
          </button>
        </div>
      ),
    },
  ];

  const filters = [
    {
      key: "department",
      title: "Department",
      options: ["Cardiology", "Orthopedics", "Pediatrics", "Neurology", "Emergency"].map((dept) => ({ value: dept, label: dept })),
    },
    {
      key: "ward",
      title: "Ward Type",
      options: ["ICU", "ICCU", "General Ward", "Private Room", "Emergency", "Maternity"].map((ward) => ({ value: ward, label: ward })),
    },
    {
      key: "status",
      title: "Status",
      options: ["Active", "Inactive"].map((status) => ({ value: status, label: status })),
    },
  ];

  return (
    <div className="p-4">
      {loading && (
        <div className="mb-4 p-3 rounded-md bg-gray-50 border border-gray-100 text-sm text-gray-700 flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
          Loading ward summary...
        </div>
      )}
      <DynamicTable
        columns={columns}
        data={bedData}
        filters={filters}
        showSearchBar
        showPagination
        onCellClick={handleCellClick}
        rowClassName={rowClassName}
        tabActions={tabActions}
      />
      {deleteModalOpen && deleteTarget && (
        <div role="dialog" aria-modal="true" aria-labelledby="delete-modal-title" aria-describedby="delete-modal-desc" className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={closeDeleteModal} />
          <div className="relative w-full max-w-xl mx-auto bg-white rounded-2xl shadow-xl transform transition-all duration-150">
            <div className="flex items-start gap-4 px-6 py-5">
              <div className="flex-shrink-0 h-11 w-11 rounded-lg bg-red-50 flex items-center justify-center">
                <FaExclamationTriangle className="text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 id="delete-modal-title" className="text-lg font-semibold text-gray-900">Delete Ward</h3>
                <p id="delete-modal-desc" className="mt-1 text-sm text-gray-600">Are you sure you want to delete <span className="font-medium">{deleteTarget.department} — {deleteTarget.ward}</span>?</p>
              </div>
            </div>
            <div className="px-6 pb-4">
              {(() => {
                const admittedPatients = checkIPDPatients(deleteTarget.ward, deleteTarget.department);
                const occupiedCount = Number(deleteTarget.occupied ?? 0);
                if (admittedPatients.length > 0) {
                  return (
                    <div className="rounded-lg bg-red-50 border border-red-100 p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-red-600"><FaExclamationTriangle /></div>
                        <div className="text-sm text-red-800">
                          <div className="font-semibold">Cannot delete — patients admitted</div>
                          <div className="mt-1">{admittedPatients.length} patient{admittedPatients.length > 1 ? "s are" : " is"} currently admitted in this ward. Please discharge or transfer them before attempting to delete the ward.</div>
                          <div className="mt-3 flex gap-2">
                            <button onClick={() => handleViewPatients(deleteTarget.ward, deleteTarget.department)} className="px-3 py-2 rounded-md border border-gray-200 text-sm text-gray-700 bg-white">View patients</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
                if (occupiedCount > 0) {
                  return (
                    <div className="rounded-lg bg-yellow-50 border border-yellow-100 p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-yellow-700"><FaExclamationTriangle /></div>
                        <div className="text-sm text-yellow-800">
                          <div className="font-semibold">Cannot delete — occupied beds present</div>
                          <div className="mt-1">This ward has <span className="font-semibold">{occupiedCount}/{deleteTarget.totalBeds}</span> occupied bed{occupiedCount > 1 ? "s" : ""}. Please clear the occupied beds (reassign/discharge) before deleting.</div>
                        </div>
                      </div>
                    </div>
                  );
                }
                return (
                  <>
                    <div className="rounded-lg bg-red-50 border border-red-100 p-4 mb-4">
                      <div className="font-semibold text-red-800">Warning</div>
                      <div className="text-sm text-red-700 mt-1">Deleting this ward is permanent. Provide a reason for auditing purposes before continuing.</div>
                    </div>
                    <label className="block text-sm font-medium text-gray-700">Reason for deletion</label>
                    <textarea value={deleteReason} onChange={(e) => setDeleteReason(e.target.value)} className="mt-2 w-full min-h-[88px] rounded-md border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-200" placeholder="Enter reason (required)" rows={4} />
                    {isConfirming && (
                      <div className="mt-4 p-3 border border-gray-100 rounded-md bg-gray-50 text-sm">
                        <div className="font-medium text-gray-800 mb-1">Please confirm</div>
                        <div className="text-gray-700 mb-2">You're about to delete <span className="font-semibold">{deleteTarget.department} — {deleteTarget.ward}</span>.</div>
                        <div className="text-gray-600"><span className="font-medium">Reason:</span> {deleteReason}</div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={closeDeleteModal} className="px-4 py-2 rounded-md bg-white border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-offset-1 focus:ring-gray-200">Cancel</button>
              {(() => {
                if (!deleteTarget) return null;
                const admittedPatients = checkIPDPatients(deleteTarget.ward, deleteTarget.department);
                const occupiedCount = Number(deleteTarget.occupied ?? 0);
                if (admittedPatients.length > 0 || occupiedCount > 0) return null;
                return !isConfirming ? (
                  <button onClick={handleModalContinue} disabled={!deleteReason.trim()} className="px-4 py-2 rounded-md bg-red-600 text-white text-sm shadow-sm disabled:opacity-60 disabled:cursor-not-allowed hover:brightness-95 focus:ring-2 focus:ring-offset-1 focus:ring-red-200">Confirm reason</button>
                ) : (
                  <button onClick={handleModalDelete} className="px-4 py-2 rounded-md bg-red-600 text-white text-sm shadow-sm hover:brightness-95 focus:ring-2 focus:ring-offset-1 focus:ring-red-200">Delete</button>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BedRoomList;
