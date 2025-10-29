import React from "react";
export default function MobileCardList({ columns, data, onCellClick }) {
  return (
    <div className="space-y-4 p-2">
      {data.map((row) => {
        // Separate key columns for header (like Name/Title, Status, ID)
        const titleCol = columns.find(col => col.header.toLowerCase().includes("name")) || columns[0];
        const statusCol = columns.find(col => col.header.toLowerCase().includes("status"));
        const idCol = columns.find(col => col.header.toLowerCase() === "id");
        const bodyCols = columns.filter(
          col => col !== titleCol && col !== statusCol // Remove idCol from the filter
        );
        return (
          <div
            key={row.id}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3 hover:shadow-md transition relative overflow-hidden"
          >
            {/* Header Section */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <h3
                  className={`text-lg font-semibold text-gray-900 truncate ${
                    titleCol.clickable
                      ? "text-[var(--primary-color)] cursor-pointer hover:text-[var(--primary-color)] hover:underline"
                      : ""
                  }`}
                  onClick={titleCol.clickable ? () => onCellClick?.(row, titleCol) : undefined}
                >
                  {titleCol.cell ? titleCol.cell(row) : row[titleCol.accessor] ?? "Untitled"}
                </h3>
                {idCol && (
                  <span className="text-xs text-gray-500 mt-1">ID: {row[idCol.accessor]}</span>
                )}
              </div>
              {statusCol && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-[var(--accent-color)] border border-green-200">
                  {row[statusCol.accessor]}
                </span>
              )}
            </div>
            {/* Body Section */}
            <div className="grid grid-cols-2 gap-4">
              {bodyCols.map((col) => (
                <div key={col.accessor} className="space-y-1">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {col.header}
                  </div>
                  <div
                    className={`text-sm font-medium ${
                      col.clickable
                        ? "text-[var(--primary-color)] cursor-pointer hover:text-[var(--primary-color)] hover:underline"
                        : "text-gray-900"
                    }`}
                    onClick={col.clickable ? () => onCellClick?.(row, col) : undefined}
                  >
                    {col.cell ? col.cell(row) : row[col.accessor] ?? "-"}
                  </div>
                </div>
              ))}
            </div>
            {/* Optional "New" badge */}
            {row.isNew && (
              <div className="absolute top-3 right-3">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                  New
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
