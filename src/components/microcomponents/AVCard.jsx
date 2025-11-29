import React from 'react';
import logo from "../../assets/fav.png";

const HealthCard = () => {
  // Hardcoded user data with placeholder image
  const userData = {
    firstName: 'John',
    lastName: 'Doe',
    dob: '1990-05-15',
    gender: 'Male',
    photoPath: 'https://i.pravatar.cc/150?img=32' // Placeholder avatar
  };

  // Hardcoded health card data with QR code
  const healthCardData = {
    healthCardId: '1234-5678-9012',
    issueDate: '2023-01-01',
    expiryDate: '2024-12-31',
    qrImagePath: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=HC-1234-5678-9012' // Generated QR code
  };

  // Rest of your component remains the same...
  const currentPlan = {
    name: 'Gold',
    cardGradient: 'linear-gradient(135deg, #0e1630, #01D48C)',
    color: 'yellow'
  };

  // Format date functions remain the same...
  const formatDate = (d) => {
    if (!d) return "N/A";
    const date = new Date(d);
    return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
  };

  const formatDateMonthYear = (d) => {
    if (!d) return "N/A";
    const date = new Date(d);
    return `${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
  };

  return (
    <div 
      className="relative w-full max-w-[380px] h-[250px] rounded-xl overflow-hidden shadow-lg" 
      style={{ background: currentPlan.cardGradient }}
    >
      <div className="relative h-full p-4 flex flex-col">
        <div className="flex justify-between items-start">
          <div className="flex items-center"></div>
          <div className="text-right">
            <div className="flex items-center justify-end gap-1 sm:gap-2">
              <img src={logo} alt="PocketClinic Logo" className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
              <h1 className="  font-bold text-white">PocketClinic</h1>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center -mt-3">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full border-2 border-white shadow overflow-hidden">
              <img 
                src={userData.photoPath} 
                alt="User" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
                }}
              />
            </div>
            <div>
              <p className="font-bold text-lg text-white uppercase">
                {userData.firstName} {userData.lastName}
              </p>
              <p className="text-sm text-white">
                DOB: {formatDate(userData.dob)} | Gender: {userData.gender}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center px-3">
          <div>
            <span className="text-xs font-semibold text-white">Health ID</span>
            <div className="font-mono text-xl tracking-wider font-bold text-white">
              {healthCardData.healthCardId}
            </div>
            <div className="text-xs text-white/80">
              Valid: {formatDateMonthYear(healthCardData.issueDate)} - {formatDateMonthYear(healthCardData.expiryDate)}
            </div>
          </div>
          <div className="w-16 h-16 bg-white p-1.5 rounded-lg flex items-center justify-center shadow-lg">
            <img
              src={healthCardData.qrImagePath}
              alt="QR Code"
              className="w-full h-full"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2NjYyIgc3Ryb2tlLXdpZHRoPSIyIj48cmVjdCB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHg9IjMiIHk9IjMiIHJ4PSIyIiByeT0iMiIvPjxyZWN0IHdpZHRoPSI2IiBoZWlnaHQ9IjYiIHg9IjUiIHk9IjUiLz48cmVjdCB3aWR0aD0iNiIgaGVpZ2h0PSI2IiB4PSIxMyIgeT0iNSIvPjxyZWN0IHdpZHRoPSI2IiBoZWlnaHQ9IjYiIHg9IjUiIHk9IjEzIi8+PHJlY3Qgd2lkdGg9IjYiIGhlaWdodD0iNiIgeD0iMTMiIHk9IjEzIi8+PC9zdmc+';
              }}
            />
          </div>
        </div>

        <div className="absolute bottom-3 right-3">
          <div className="px-2 py-1 rounded-full text-xs font-semibold text-white bg-yellow-600">
            {currentPlan.name} Member
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthCard;