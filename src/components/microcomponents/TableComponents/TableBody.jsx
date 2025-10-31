import React from "react";

export default function TableBody({ columns, data, onCellClick }) {
  return (
    <tbody className="divide-y divide-gray-200">
      {data.map((row, rowIndex) => (
        <tr
          key={row.id || rowIndex}
          className="hover:bg-blue-50 transition-colors duration-150"
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
      ))}
    </tbody>
  );
}
