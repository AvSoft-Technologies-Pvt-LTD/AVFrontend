import React from "react";

const ProfileCard = ({ initials, name, fields, children }) => {
  return (
    <>
      {/* Mobile View */}
      <div className="relative md:hidden bg-gradient-to-r from-[#01B07A] to-[#1A223F] rounded-xl p-4 text-white">
        {/* Icons inside card */}
        {children && (
          <div className="absolute top-3 right-3 flex items-center gap-2">
            {children}
          </div>
        )}

        <div className="flex flex-col items-center mb-3">
          <div className="h-10 w-10 flex items-center justify-center rounded-full bg-white text-[#01B07A] text-lg font-bold ring-2 ring-white">
            {initials}
          </div>
          <h3 className="text-lg font-bold mt-2 truncate">{name}</h3>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          {fields.map((field, index) => (
            <div key={index} className="flex flex-col">
              <span className="font-semibold truncate">{field.label}</span>
              <span className="truncate">{field.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tablet View */}
      <div className="relative hidden md:block lg:hidden bg-gradient-to-r from-[#01B07A] to-[#1A223F] rounded-xl p-5 text-white">
        {children && (
          <div className="absolute top-3 right-4 flex items-center gap-3">
            {children}
          </div>
        )}
        <div className="flex items-center gap-4 mb-4">
          <div className="h-12 w-12 flex items-center justify-center rounded-full bg-white text-[#01B07A] font-bold text-xl">
            {initials}
          </div>
          <h3 className="text-xl font-bold truncate">{name}</h3>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          {fields.map((field, index) => (
            <div key={index}>
              <p>
                <span className="font-semibold">{field.label}:</span> {field.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop View */}
      <div className="relative hidden lg:block bg-gradient-to-r from-[#01B07A] to-[#1A223F] rounded-xl p-6 text-white">
        {children && (
          <div className="absolute top-4 right-6 flex items-center gap-3">
            {children}
          </div>
        )}
        <div className="flex items-center gap-6">
          <div className="h-16 w-16 flex items-center justify-center rounded-full bg-white text-[#01B07A] font-bold text-2xl">
            {initials}
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-4 truncate">{name}</h3>
            <div className="grid grid-cols-3 gap-x-6 gap-y-2 text-base">
              {fields.map((field, index) => (
                <div key={index}>
                  <p>
                    <span className="font-semibold">{field.label}:</span> {field.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileCard;
