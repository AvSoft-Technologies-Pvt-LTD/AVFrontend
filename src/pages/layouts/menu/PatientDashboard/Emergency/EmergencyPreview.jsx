// File: EmergencyPreview.jsx
import React, { useState } from "react";
import { format } from "date-fns";
import * as Lucide from "lucide-react";
import { createAmbulanceBooking } from "../../../../../utils/CrudService";
import { toast } from "react-toastify";

/**
 * EmergencyPreview
 *
 * Props:
 *  - data: object with ambulanceTypes, categories, equipment, locations (may be null while loading)
 *  - type: selected ambulance type id
 *  - cat: selected category id
 *  - pickup: selected pickup id
 *  - pickupSearch: fallback pickup text
 *  - selectedHospital: hospital name string (optional)
 *  - equip: array of selected equipment ids
 *  - date: Date object
 *  - calculateEquipmentTotal: function (optional)
 *  - getIcon: function (optional) -> (name, size) => JSX
 */
const EmergencyPreview = ({
  data,
  type,
  cat,
  pickup,
  pickupSearch,
  selectedHospital,
  hospitalId,
  equip = [],
  date,
  calculateEquipmentTotal,
  getIcon,
  patientId,
  onBookingSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitBooking = async (event) => {
    event.preventDefault();
    console.log('Submit button clicked');
    
    if (!patientId) {
      console.error('Patient ID is missing');
      toast.error("Patient ID is required");
      return;
    }

    // Check if pickup is empty or just whitespace
    const pickupLocation = pickup || pickupSearch;
    
    if (!type || !cat || !pickupLocation || !selectedHospital || !date) {
      console.error('Missing required fields:', { 
        type, 
        cat, 
        pickup: pickupLocation, 
        selectedHospital, 
        date 
      });
      toast.error("Please fill in all required fields");
      return;
    }

    const bookingData = {
      patientId,
      pickupLocation: pickupLocation || pickupSearch,
      destination: hospitalName,
      hospitalId: hospitalId || 1,
      ambulanceTypeId: type,
      categoryId: cat,
      equipments: equip.map(eqId => ({
        equipmentId: eqId,
        quantity: 1
      })),
      date: format(date, "yyyy-MM-dd"),
      totalAmount: totalEquipmentCost || 0.1
    };

    console.log('Submitting booking data:', JSON.stringify(bookingData, null, 2));

    try {
      console.log('Calling createAmbulanceBooking API...');
      setIsSubmitting(true);
      
      // Test with a simple fetch first
      console.log('Testing direct fetch...');
      try {
        const testResponse = await fetch('http://localhost:8080/api/ambulance/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(bookingData)
        });
        
        const testResult = await testResponse.json();
        console.log('Direct fetch response:', testResult);
        
        if (!testResponse.ok) {
          throw new Error(testResult.message || 'Failed to book ambulance');
        }
        
        toast.success("Ambulance booked successfully!");
        if (onBookingSuccess) {
          onBookingSuccess(testResult);
        }
        return;
      } catch (testError) {
        console.error('Direct fetch error:', testError);
        throw testError; // Let it be caught by the outer catch
      }
      
      // Original axios call (kept for reference)
      // const response = await createAmbulanceBooking(bookingData);
      // console.log('API Response:', response);
      // toast.success("Ambulance booked successfully!");
      // if (onBookingSuccess) {
      //   onBookingSuccess(response.data);
      // }
    } catch (error) {
      console.error("Error booking ambulance:", error);
      const errorMessage = error.response?.data?.message || 
                         error.message || 
                         "Failed to book ambulance. Please try again.";
      console.error('Error details:', error.response?.data);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  // If no data yet, show placeholder so parent can render safely
  if (!data) {
    return (
      <div className="text-center py-8">
        <Lucide.Loader2 className="animate-spin mx-auto mb-2 text-blue-500 w-6 h-6" />
        <div className="text-sm text-gray-600">Preparing preview...</div>
      </div>
    );
  }

  // Helper to find by id safely, returns undefined if not found
  const findById = (arr, id) => (Array.isArray(arr) ? arr.find((i) => i?.id === id) : undefined);

  // Resolve display names with safe fallbacks
  const ambulanceTypeName = findById(data?.ambulanceTypes, type)?.name ?? (type ? String(type) : "Not selected");
  const categoryName = findById(data?.categories, cat)?.name ?? (cat ? String(cat) : "Not selected");
  const pickupName = findById(data?.locations, pickup)?.name ?? pickupSearch ?? "Not selected";
  const hospitalName = selectedHospital || "Not specified";

  // Selected equipment objects (safe)
  const selectedEquipment = (equip || []).map((eqId) => {
    const eq = findById(data?.equipment, eqId);
    return {
      id: eqId,
      name: eq?.name ?? `Item ${eqId}`,
      price: typeof eq?.price === "number" ? eq.price : 0,
      icon: eq?.icon ?? "Activity",
    };
  });

  // Total equipment cost: prefer provided calculateEquipmentTotal function, otherwise compute locally
  const totalEquipmentCost =
    typeof calculateEquipmentTotal === "function"
      ? // guard any exception
        (() => {
          try {
            const v = calculateEquipmentTotal();
            return typeof v === "number" ? v : selectedEquipment.reduce((s, it) => s + (it.price || 0), 0);
          } catch {
            return selectedEquipment.reduce((s, it) => s + (it.price || 0), 0);
          }
        })()
      : selectedEquipment.reduce((s, it) => s + (it.price || 0), 0);

  // safe formatted date
  const formattedDate = date ? format(date, "dd MMM yyyy") : "Not set";
  const dayName = date ? format(date, "EEEE") : "N/A";

  // Safe icon renderer
  const renderIcon = (name, size = 14) => {
    if (typeof getIcon === "function") {
      try {
        return getIcon(name, size);
      } catch (e) {
        // fallback to Lucide.Activity if custom getIcon throws
        return <Lucide.Activity size={size} />;
      }
    }
    return <Lucide.Activity size={size} />;
  };

  return (
    <form 
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmitBooking();
      }}
      className="space-y-3 sm:space-y-4 lg:space-y-6"
    >
      <div className="bg-gradient-to-r from-[#01B07A] to-[#1A223F] rounded-xl p-3 sm:p-4 lg:p-6 mb-3 sm:mb-4 lg:mb-6 text-white">
        <div className="flex items-center gap-2 sm:gap-2.5 lg:gap-3 mb-2 sm:mb-3 lg:mb-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Lucide.CheckCircle className="text-white w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
          </div>
          <div>
            <h3 className="text-white font-bold text-base sm:text-lg lg:text-xl">Booking Confirmation</h3>
            <p className="text-white/90 text-xs sm:text-sm">Please review your booking details below</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 lg:p-6">
          <div className="flex items-center gap-2 sm:gap-2.5 lg:gap-3 mb-2 sm:mb-3 lg:mb-4">
            <Lucide.Ambulance className="text-red-600 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
            <h4 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800">Service Details</h4>
          </div>

          <div className="space-y-2 sm:space-y-2.5 lg:space-y-3">
            <div className="flex justify-between items-center py-1 sm:py-1.5 lg:py-2 border-b border-gray-100">
              <span className="text-gray-600 font-medium text-xs sm:text-sm">Ambulance Type:</span>
              <span className="font-semibold text-gray-800 text-xs sm:text-sm">{ambulanceTypeName}</span>
            </div>

            <div className="flex justify-between items-center py-1 sm:py-1.5 lg:py-2 border-b border-gray-100">
              <span className="text-gray-600 font-medium text-xs sm:text-sm">Category:</span>
              <span className="font-semibold text-gray-800 text-xs sm:text-sm">{categoryName}</span>
            </div>

            <div className="flex justify-between items-center py-1 sm:py-1.5 lg:py-2 border-b border-gray-100">
              <span className="text-gray-600 font-medium text-xs sm:text-sm">Pickup Location:</span>
              <span className="font-semibold text-gray-800 text-xs sm:text-sm">{pickupName}</span>
            </div>

            <div className="flex justify-between items-center py-1 sm:py-1.5 lg:py-2">
              <span className="text-gray-600 font-medium text-xs sm:text-sm">Hospital Location:</span>
              <span className="font-semibold text-gray-800 text-xs sm:text-sm">{hospitalName}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 lg:p-6">
          <div className="flex items-center gap-2 sm:gap-2.5 lg:gap-3 mb-2 sm:mb-3 lg:mb-4">
            <Lucide.Calendar className="text-blue-600 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
            <h4 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800">Schedule & Location</h4>
          </div>

          <div className="space-y-2 sm:space-y-2.5 lg:space-y-3">
            <div className="flex justify-between items-center py-1 sm:py-1.5 lg:py-2 border-b border-gray-100">
              <span className="text-gray-600 font-medium text-xs sm:text-sm">Booking Date:</span>
              <span className="font-semibold text-gray-800 text-xs sm:text-sm">{formattedDate}</span>
            </div>

            <div className="flex justify-between items-center py-1 sm:py-1.5 lg:py-2 border-b border-gray-100">
              <span className="text-gray-600 font-medium text-xs sm:text-sm">Day:</span>
              <span className="font-semibold text-gray-800 text-xs sm:text-sm">{dayName}</span>
            </div>

            <div className="flex justify-between items-center py-1 sm:py-1.5 lg:py-2">
              <span className="text-gray-600 font-medium text-xs sm:text-sm">Status:</span>
              <span className="px-2 py-0.5 sm:px-2.5 sm:py-0.5 lg:px-3 lg:py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Confirmed</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 lg:p-6">
        <div className="flex items-center gap-2 sm:gap-2.5 lg:gap-3 mb-2 sm:mb-3 lg:mb-4">
          <Lucide.Package className="text-purple-600 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
          <h4 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800">Equipment & Billing</h4>
        </div>

        {selectedEquipment.length > 0 ? (
          <div className="space-y-2 sm:space-y-2.5 lg:space-y-3">
            {selectedEquipment.map((equipment) => (
              <div key={equipment.id} className="flex items-center justify-between py-1 sm:py-1.5 lg:py-2 border-b border-gray-100">
                <div className="flex items-center gap-2 sm:gap-2.5 lg:gap-3">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    {renderIcon(equipment.icon, 14)}
                  </div>
                  <span className="text-gray-700 font-medium text-xs sm:text-sm">{equipment.name}</span>
                </div>
                <span className="font-semibold text-gray-800 text-xs sm:text-sm">₹{equipment.price}</span>
              </div>
            ))}

            <div className="border-t-2 border-gray-200 pt-2 sm:pt-2.5 lg:pt-3 mt-2 sm:mt-2.5 lg:mt-3">
              <div className="flex justify-between items-center">
                <span className="text-sm sm:text-base lg:text-lg font-bold text-gray-800">Total Equipment Cost:</span>
                <div className="text-right">
                  <span className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">₹{totalEquipmentCost}</span>
                  <p className="text-xs text-gray-500">Including all equipment</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 sm:py-6 lg:py-8">
            <Lucide.Package className="mx-auto mb-2 sm:mb-2.5 lg:mb-3 text-gray-400 w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
            <p className="text-gray-500 text-xs sm:text-sm">No additional equipment selected</p>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSubmitBooking}
          disabled={isSubmitting}
          className={`px-6 py-3 rounded-lg font-medium text-white transition-colors ${
            isSubmitting 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-[#01B07A] to-[#1A223F] hover:from-[#01a06f] hover:to-[#141a32]'
          }`}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-2">
              <Lucide.Loader2 className="animate-spin w-4 h-4" />
              <span>Booking...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Lucide.CheckCircle className="w-5 h-5" />
              <span>Confirm Booking</span>
            </div>
          )}
        </button>
      </div>
    </form>
  );
};

export default EmergencyPreview;
