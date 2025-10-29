import React, { useEffect, useState } from "react";
import { Bed, CheckCircle, XCircle } from "lucide-react";
import {
  Users,
  Heart,
  AlertTriangle,
  Baby,
  Shield,
  Stethoscope,
  Activity,
} from "lucide-react";
import { getSpecializationsWardsSummaryForIpdAdmission } from "../../../../../utils/CrudService";

const WARD_ICONS = {
  "General Ward": Users,
  General: Users,
  "ICU Ward": Heart,
  ICU: Heart,
  ICCU: Activity,
  Emergency: AlertTriangle,
  "Private Room": Shield,
  Private: Shield,
  Maternity: Baby,
  Surgical: Stethoscope,
};

const getWardIcon = (wardType) => {
  const IconComponent = WARD_ICONS[wardType] || Bed;
  return <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />;
};

const IPDWard = ({ selectedWard, onSelectWard }) => {
  const [wardData, setWardData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWards = async () => {
      try {
        const response = await getSpecializationsWardsSummaryForIpdAdmission();
        if (response?.data) {
     const formatted = response.data.map((item, index) => {
  const availableGroup = item.bedGroups?.find(
    (g) => g.statusName.toLowerCase() === "available"
  );
  const availableBeds = availableGroup ? availableGroup.count : 0;
  const occupiedBeds = item.totalBeds - availableBeds;
  return {
    id: item.wardId || index,
    type: item.wardName,
    number: item.wardNumber || item.wardId || index,
    department: item.specializationName,
    totalBeds: item.totalBeds,
    availableBeds,
    occupiedBeds,
    rooms: item.rooms || [], // <-- Include the actual rooms array
    roomNumbers: item.roomNumbers,
    beds: item.rooms?.flatMap((r) => r.beds || []),
  };
});


          setWardData(formatted);
        }
      } catch (error) {
        console.error("Error fetching ward data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWards();
  }, []);

  return (
    <div>
      <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
        Ward Selection
      </h3>
      {loading ? (
        <div className="text-center py-10 text-gray-500 text-sm">
          Loading wards...
        </div>
      ) : wardData.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Bed className="mx-auto mb-4 text-gray-400" size={48} />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            No Wards Available
          </h3>
          <p className="text-gray-500 mb-4">
            No ward configurations found. Please contact administrator.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {wardData.map((ward) => (
              <div
                key={ward.id}
                className={`p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                  selectedWard?.id === ward.id
                    ? "border-[#01B07A] bg-[#E6FBF5] shadow-lg"
                    : "border-gray-200 hover:border-gray-300"
                } ${
                  ward.availableBeds === 0
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                onClick={() =>
                  ward.availableBeds > 0 && onSelectWard(ward)
                }
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getWardIcon(ward.type)}
                    <h4 className="font-semibold text-xs sm:text-sm">
                      {ward.type}
                    </h4>
                  </div>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {ward.roomNumbers || "N/A"}
                  </span>
                </div>
                <p className="text-[10px] text-gray-600 mb-2">
                  <strong>Department:</strong> {ward.department}
                </p>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <div className="bg-blue-50 rounded-xl p-2 text-center shadow-sm">
                    <Bed className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                    <p className="text-[10px] text-gray-500 font-medium">
                      Total
                    </p>
                    <p className="text-blue-600 font-bold text-sm">
                      {ward.totalBeds}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-2 text-center shadow-sm">
                    <CheckCircle className="w-4 h-4 text-green-600 mx-auto mb-1" />
                    <p className="text-[10px] text-gray-500 font-medium">
                      Available
                    </p>
                    <p className="text-green-600 font-bold text-sm">
                      {ward.availableBeds}
                    </p>
                  </div>
                  <div className="bg-red-50 rounded-xl p-2 text-center shadow-sm">
                    <XCircle className="w-4 h-4 text-red-600 mx-auto mb-1" />
                    <p className="text-[10px] text-gray-500 font-medium">
                      Occupied
                    </p>
                    <p className="text-red-600 font-bold text-sm">
                      {ward.occupiedBeds}
                    </p>
                  </div>
                </div>
                <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        (ward.occupiedBeds / ward.totalBeds) * 100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          {selectedWard && (
            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-[#E6FBF5] rounded-lg border border-[#01B07A]">
              <p className="text-xs sm:text-sm text-[#01B07A] font-medium">
                Selected: {selectedWard.type} - {selectedWard.department}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default IPDWard;
