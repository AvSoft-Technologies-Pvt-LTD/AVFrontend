import React from "react";

export default function MobileCardList({
  columns,
  data,
  onCellClick,
  newRowIds = [],
  rowClassName,
}) {
  // Helper: Get mobile header elements (title, id, status, actions)
  const getMobileHeaderElements = (row) => {
    const elements = [];
    const doctorNameColumn = columns.find(
      (col) => col.header === "Doctor Name" || col.accessor === "doctorName"
    );
    const nameColumn = columns.find(
      (col) => col.header === "Name" || col.accessor === "name"
    );
    const hospitalNameColumn = columns.find(
      (col) => col.header === "Hospital Name" || col.accessor === "hospitalName"
    );
    const idColumn = columns.find(
      (col) => col.header === "ID" || col.accessor === "sequentialId"
    );
    const statusColumn = columns.find(
      (col) => col.header === "Status" || col.accessor === "status"
    );
    const actionColumn = columns.find(
      (col) => col.header === "Action" || col.header === "Actions"
    );

    // Add title (Doctor, Name, or Hospital)
    if (doctorNameColumn) {
      elements.push({
        type: "title",
        column: doctorNameColumn,
        content: doctorNameColumn.cell
          ? doctorNameColumn.cell(row)
          : row[doctorNameColumn.accessor] || "Unknown Doctor",
      });
    } else if (nameColumn) {
      elements.push({
        type: "title",
        column: nameColumn,
        content: nameColumn.cell
          ? nameColumn.cell(row)
          : row[nameColumn.accessor] || "Untitled",
      });
    } else if (hospitalNameColumn) {
      elements.push({
        type: "title",
        column: hospitalNameColumn,
        content: hospitalNameColumn.cell
          ? hospitalNameColumn.cell(row)
          : row[hospitalNameColumn.accessor] || "Unknown Hospital",
      });
    }

    // Add ID if space allows
    if (idColumn && elements.length < 3) {
      elements.push({
        type: "id",
        column: idColumn,
        content: idColumn.cell ? idColumn.cell(row) : row[idColumn.accessor],
      });
    }

    // Add Action if space allows
    if (actionColumn && elements.length < 3) {
      elements.push({
        type: "actions",
        column: actionColumn,
        content: actionColumn.cell ? actionColumn.cell(row) : null,
      });
    }

    // Add Status if space allows
    if (statusColumn && elements.length < 2) {
      elements.push({
        type: "status",
        column: statusColumn,
        content: statusColumn.cell
          ? statusColumn.cell(row)
          : row[statusColumn.accessor],
      });
    }

    return elements.slice(0, 3);
  };

  // Helper: Should hide column (e.g., Date/Time, Phone)
  const shouldHideColumn = (colHeader) => {
    const hiddenHeaders = [
      "date and time",
      "phone",
      "datetime",
      "created at",
      "updated at",
    ];
    return hiddenHeaders.some((hidden) =>
      colHeader.toLowerCase().includes(hidden)
    );
  };

  // Helper: Get body columns (excluding header and hidden columns)
  const getBodyColumns = (row) => {
    const headerElements = getMobileHeaderElements(row);
    const headerColumnAccessors = headerElements
      .map((el) => el.column?.accessor)
      .filter(Boolean);
    const headerColumnHeaders = headerElements
      .map((el) => el.column?.header)
      .filter(Boolean);

    return columns.filter(
      (col) =>
        !headerColumnAccessors.includes(col.accessor) &&
        !headerColumnHeaders.includes(col.header) &&
        !shouldHideColumn(col.header)
    );
  };

  return (
    <div className="space-y-4 p-2">
      {data.map((row) => {
        const headerElements = getMobileHeaderElements(row);
        const bodyColumns = getBodyColumns(row);

        return (
          <div
            key={row.id}
            className={`bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden ${newRowIds.includes(row.id)
                ? "border-l-4 border-l-blue-500 bg-blue-50/30"
                : ""
              } ${rowClassName ? rowClassName(row) : ""}`}
          >
            {/* Card Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {headerElements
                  .filter((el) => el.type === "title")
                  .map((element, index) => (
                    <h3
                      key={index}
                      className={`text-lg font-semibold text-gray-900 truncate ${element.column.clickable
                          ? "text-[var(--primary-color)] cursor-pointer hover:text-[var(--primary-color)] hover:underline"
                          : ""
                        }`}
                      onClick={
                        element.column.clickable
                          ? () => onCellClick?.(row, element.column)
                          : undefined
                      }
                    >
                      {element.content}
                    </h3>
                  ))}
                {headerElements
                  .filter((el) => el.type === "id")
                  .map((element, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 flex-shrink-0"
                    >
                      #{element.content}
                    </span>
                  ))}
              </div>
              <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                {headerElements
                  .filter((el) => el.type === "actions")
                  .map((element, index) => (
                    <div key={index} className="flex items-center gap-2">
                      {element.content}
                    </div>
                  ))}
                {headerElements
                  .filter((el) => el.type === "status")
                  .map((element, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-[var(--accent-color)] border border-green-200"
                    >
                      {element.content}
                    </span>
                  ))}
              </div>
            </div>

            {/* Card Content: Only data columns, 2 per row */}
      
            <div className="p-4 space-y-3">
              {bodyColumns.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {bodyColumns.map((col, i) => {
                    const isLastOdd =
                      bodyColumns.length % 2 !== 0 && i === bodyColumns.length - 1;

                    return (
                      <div
                        key={i}
                        className={`space-y-1 ${isLastOdd ? "col-span-2" : ""}`}
                      >
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          {col.header}
                        </div>
                        <div
                          className={`font-medium text-sm ${col.clickable
                              ? "text-[var(--primary-color)] cursor-pointer hover:text-[var(--primary-color)] hover:underline"
                              : "text-gray-900"
                            }`}
                          onClick={
                            col.clickable ? () => onCellClick?.(row, col) : undefined
                          }
                        >
                          {col.cell ? col.cell(row) : row[col.accessor] ?? "-"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No additional data
                </div>
              )}
            </div>
            {/* New Badge */}
            {newRowIds.includes(row.id) && (
              <div className="absolute top-3 right-3 z-10">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-[var(--accent-color)] border border-green-200">
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
