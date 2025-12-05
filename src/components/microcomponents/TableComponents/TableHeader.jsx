import React, { useState, useEffect } from "react";
import { Search, Filter } from "lucide-react";

export default function TableHeader({
  title,
  tabs = [],
  activeTab,
  onTabChange,
  tabActions = [],
  searchQuery,
  setSearchQuery,
  filters = [],
  setFilterPanelOpen,
}) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024); // Changed to 1024 to include tablets

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024); // Match the same breakpoint
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <div className="flex items-center gap-3 overflow-x-auto custom-scrollbar">
        {title && <h2 className="text-lg font-semibold">{title}</h2>}
        {tabs.length > 0 && (
          <div className="flex space-x-2">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => onTabChange && onTabChange(tab.value)}
                className={`relative cursor-pointer flex items-center gap-1 px-3 py-1.5 text-sm font-medium ${
                  activeTab === tab.value
                    ? "text-[var(--primary-color)] after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-full after:bg-[var(--primary-color)]"
                    : "text-gray-500 hover:text-[var(--accent-color)]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 flex-1 md:flex-none">
        {/* Search */}
        <div className="relative w-full md:w-48">
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 bg-white rounded-full border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-2 top-2.5 text-gray-400" size={16} />
        </div>
        {/* Filters */}
        {filters.length > 0 && (
          <button
            className="p-2 border rounded-lg border-gray-200 shadow-sm hover:bg-gray-50"
            onClick={() => setFilterPanelOpen(true)}
          >
            <Filter size={16} className="text-gray-500" />
          </button>
        )}
        {/* Desktop Actions - Only show on large screens (lg and up) */}
        <div className="hidden lg:flex items-center gap-2">
          {tabActions.map((action, i) => (
            <button
              key={i}
              onClick={action.onClick}
              className="px-3 py-2.5 bg-[var(--primary-color)] text-white rounded-lg text-sm whitespace-nowrap"
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile & Tablet Actions - Show on both mobile and tablet */}
      {isMobile && tabActions.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 flex justify-around z-10">
          {tabActions.map((action, i) => (
            <button
              key={i}
              onClick={action.onClick}
              className="px-3 py-3 bg-[var(--primary-color)] text-white rounded-lg text-sm flex-1 mx-1"
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}