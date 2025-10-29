import React from "react";
import { Search, Filter } from "lucide-react";

export default function TableHeader({
  title,
  tabs,
  activeTab,
  onTabChange,
  tabActions,
  searchQuery,
  setSearchQuery,
  filters,
  setFilterPanelOpen,
}) {
  return (
    <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <div className="flex items-center gap-3">
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
            className="p-2 border rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50"
            onClick={() => setFilterPanelOpen(true)}
          >
            <Filter size={16} className="text-gray-500" />
          </button>
        )}
        <div className="hidden md:flex md:items-center md:gap-2">
            {tabActions.length > 0 &&
              tabActions.map((action, i) => (
                <button
                  key={i}
                  onClick={action.onClick}
                  className="px-3 py-2.5 bg-[var(--primary-color)] text-white rounded-lg text-sm"
                >
                  {action.label}
                </button>
                
              ))}
          </div>
      </div>
       <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 flex justify-around z-10">
          {tabActions.length > 0 &&
            tabActions.map((action, i) => (
              <button
                key={i}
                onClick={action.onClick}
                className="px-3 py-3 bg-[var(--primary-color)] text-white rounded-lg text-sm flex-1 mx-1"
              >
                {action.label}
              </button>
            ))}
        </div>
    </div>
  );
}
