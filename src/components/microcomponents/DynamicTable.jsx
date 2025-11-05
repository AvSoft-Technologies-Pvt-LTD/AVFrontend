import React, { useState, useMemo, useRef, useEffect } from "react";
import TableHeader from "./TableComponents/TableHeader";
import TableBody from "./TableComponents/TableBody";
import MobileCardList from "./TableComponents/MobileCardList";
import Pagination from "./TableComponents/PaginationControls";

export default function DynamicTable({
  title,
  columns,
  data,
  filters = [],
  tabs = [],
  activeTab,
  onTabChange,
  showSearchBar = true,
  showPagination = true,
  tabActions = [],
  noDataMessage = "No records found.",
  itemsPerPage = 9,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState({});
  const filterButtonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterButtonRef.current && !filterButtonRef.current.contains(event.target)) {
        setIsFilterPanelOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      const matchesSearch = Object.values(row)
        .join(" ")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesFilters = Object.entries(activeFilters).every(([key, val]) => {
        if (!val || val.length === 0) return true;
        return val.includes(row[key]);
      });
      return matchesSearch && matchesFilters;
    });
  }, [data, searchQuery, activeFilters]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Pagination logic for desktop
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  useEffect(() => {
    if (isFilterPanelOpen) {
      const initial = {};
      filters.forEach((group) => {
        initial[group.key] = activeFilters[group.key] || [];
      });
      setTempFilters(initial);
    }
  }, [isFilterPanelOpen, activeFilters, filters]);

  return (
    <div className="bg-white shadow-sm rounded-xl border border-gray-200 relative">
      {showSearchBar && (
      <TableHeader
        title={title}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={onTabChange}
        tabActions={tabActions}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filters={filters}
        filterButtonRef={filterButtonRef}
        setFilterPanelOpen={setIsFilterPanelOpen}
      />
)}
      {isFilterPanelOpen && filters.length > 0 && (
        <div
          ref={filterButtonRef}
          className="absolute right-0 mt-2 bg-white rounded-lg shadow-lg z-50 p-4"
        >
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: `repeat(${filters.length}, minmax(250px, 1fr))`,
            }}
          >
            {filters.map((group, i) => (
              <div key={i} className="flex flex-col gap-2">
                <h3 className="font-medium text-sm">{group.title}</h3>
                {group.options.map((option, j) => (
                  <label key={j} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded"
                      checked={tempFilters[group.key]?.includes(option.value)}
                      onChange={(e) => {
                        const current = tempFilters[group.key] || [];
                        if (e.target.checked) {
                          setTempFilters({
                            ...tempFilters,
                            [group.key]: [...current, option.value],
                          });
                        } else {
                          setTempFilters({
                            ...tempFilters,
                            [group.key]: current.filter((v) => v !== option.value),
                          });
                        }
                      }}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-4 border-t border-gray-200 pt-2 gap-2">
            <button
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
              onClick={() => setIsFilterPanelOpen(false)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
              onClick={() => {
                setActiveFilters(tempFilters);
                setIsFilterPanelOpen(false);
                setCurrentPage(1);
              }}
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {/* Desktop Table (with pagination) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200" role="table">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.accessor}
                  scope="col"
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-700 whitespace-nowrap"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <TableBody columns={columns} data={paginatedData} />
        </table>
      </div>

      {/* Mobile Cards (with scrolling) */}
      <div className="block md:hidden overflow-y-auto  ">
        <MobileCardList columns={columns} data={filteredData} />
      </div>

      {/* Pagination (hidden on mobile/tablet) */}
      {showPagination && (
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
      )}
      {/* Empty State */}
      {filteredData.length === 0 && (
        <div className="text-center text-gray-500 py-6">{noDataMessage}</div>
      )}
    </div>
  );
}
