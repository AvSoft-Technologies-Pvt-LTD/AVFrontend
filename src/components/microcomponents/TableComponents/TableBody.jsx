import React from "react";

export default function TableBody({ columns, data, onCellClick, getRowClassName }) {
  return (
    <tbody className="divide-y divide-gray-200">
      {data.map((row, rowIndex) => {
        // Determine the row's classes
        const highlightClass = getRowClassName ? getRowClassName(row) : "";
        return (
          <tr
            key={row.id || rowIndex}
            className={`transition-colors duration-150 hover:bg-blue-50 ${highlightClass}`}
          >
            {columns.map((col) => (
              <td
                key={col.accessor}
                className={`px-4 py-2 text-sm ${
                  col.clickable
                    ? "text-blue-600 cursor-pointer hover:text-blue-800 hover:underline font-medium"
                    : "text-gray-900"
                }`}
                onClick={col.clickable ? () => onCellClick?.(row, col) : undefined}
              >
                {col.cell ? col.cell(row) : row[col.accessor] ?? "-"}
              </td>
            ))}
          </tr>
        );
      })}
    </tbody>
  );
}
